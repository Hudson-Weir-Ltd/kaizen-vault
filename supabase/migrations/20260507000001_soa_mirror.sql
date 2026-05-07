-- ============================================================================
-- SoA mirror schema — Kaizen-side copies of Hudson One's case_assets,
-- case_liabilities, case_charges. Plus the outbox + audit tables that the
-- bidirectional bridge depends on.
--
-- Apply against the Kaizen Supabase project once it is provisioned
-- (Stage C-1.1 in REFACTOR_PLAN.md). NOT applied automatically — this file
-- is the migration definition only.
--
-- Conflict resolution: last-writer-wins by (sync_version, sync_origin).
-- Origins are 'hw' (Hudson One pushed via bridge) or 'kz' (Kaizen authored).
-- When versions tie but origins differ, HW wins because Hudson One holds
-- the canonical insolvency record.
-- ============================================================================

create schema if not exists soa;

-- ----------------------------------------------------------------------------
-- Case access mapping
-- ----------------------------------------------------------------------------
-- Cached "this Kaizen user has access to this Hudson One case" rows. Populated
-- by the bridge after a successful kaizen_bridge_check_access(user_id,case_id)
-- RPC call against Hudson One. Refreshed on every bridge entry to avoid
-- staleness; an INSERT trigger could prune > 24h-old rows in production.
create table if not exists soa.case_access (
  kaizen_user_id uuid not null references auth.users(id) on delete cascade,
  hw_case_id uuid not null,
  hw_role text not null,
  granted_at timestamptz not null default now(),
  primary key (kaizen_user_id, hw_case_id)
);
create index if not exists idx_case_access_hw_case on soa.case_access (hw_case_id);

-- ----------------------------------------------------------------------------
-- Mirror: case_assets
-- ----------------------------------------------------------------------------
create table if not exists soa.case_assets (
  id uuid primary key,                                                       -- same UUID as Hudson One
  hw_case_id uuid not null,
  description text,
  category text check (category in ('fixed','current')),
  charge_status text check (charge_status in (
    'uncharged','fixed_charge','floating_charge','hire_purchase','specifically_pledged'
  )),
  asset_type text,
  charge_holder_name text,
  book_value numeric(18,2),
  etr numeric(18,2),                                                         -- estimated to realise
  secured_debt numeric(18,2),
  realised_amount numeric(18,2),
  soa_book_value numeric(18,2),                                              -- snapshot at pre-app lock
  soa_estimated_to_realise numeric(18,2),                                    -- snapshot at pre-app lock
  sip6_explanation text,
  etr_uncertain boolean not null default false,
  status text check (status in (
    'not_realised','marketed','sold','abandoned','returned_to_owner'
  )),
  realised_date date,
  parent_asset_id uuid references soa.case_assets(id),
  charge_id uuid,                                                            -- FK applied later (after case_charges exists)
  sort_order int not null default 0,
  -- Sync bookkeeping
  hw_updated_at timestamptz,
  kz_updated_at timestamptz not null default now(),
  sync_version int not null default 1,
  sync_origin text not null default 'hw' check (sync_origin in ('hw','kz')),
  deleted_at timestamptz
);
create index if not exists idx_case_assets_case_alive
  on soa.case_assets (hw_case_id, sort_order) where deleted_at is null;
create index if not exists idx_case_assets_charge on soa.case_assets (charge_id);
create index if not exists idx_case_assets_version on soa.case_assets (sync_version);

-- ----------------------------------------------------------------------------
-- Mirror: case_liabilities
-- ----------------------------------------------------------------------------
create table if not exists soa.case_liabilities (
  id uuid primary key,
  hw_case_id uuid not null,
  creditor_name text,
  category text check (category in (
    'preferential','secondary_preferential','secured_fixed','secured_floating',
    'unsecured','consumer','employee','connected_party'
  )),
  amount numeric(18,2),
  soa_amount numeric(18,2),                                                  -- post-app SoA override
  proof_received boolean not null default false,
  proof_of_debt_date date,
  proof_of_debt_amount numeric(18,2),
  creditor_type text,
  address text,
  contact_name text,
  contact_email text,
  contact_phone text,
  reference_number text,
  security_details text,
  security_date date,
  security_value numeric(18,2),
  currency text not null default 'GBP',
  original_amount numeric(18,2),
  exchange_rate numeric(18,8),
  exchange_rate_date date,
  description text,
  sort_order int not null default 0,
  hw_updated_at timestamptz,
  kz_updated_at timestamptz not null default now(),
  sync_version int not null default 1,
  sync_origin text not null default 'hw' check (sync_origin in ('hw','kz')),
  deleted_at timestamptz
);
create index if not exists idx_case_liabilities_case_alive
  on soa.case_liabilities (hw_case_id, sort_order) where deleted_at is null;
create index if not exists idx_case_liabilities_version on soa.case_liabilities (sync_version);

-- ----------------------------------------------------------------------------
-- Mirror: case_charges
-- ----------------------------------------------------------------------------
create table if not exists soa.case_charges (
  id uuid primary key,
  hw_case_id uuid not null,
  charge_type text not null check (charge_type in (
    'floating','fixed','specifically_pledged','hire_purchase'
  )),
  charge_holder_name text,
  creditor_id uuid references soa.case_liabilities(id),
  agreement_date date,
  charge_amount numeric(18,2),
  attached_asset_ids uuid[] not null default '{}',
  ch_charge_code text,
  description text,
  sort_order int not null default 0,
  hw_updated_at timestamptz,
  kz_updated_at timestamptz not null default now(),
  sync_version int not null default 1,
  sync_origin text not null default 'hw' check (sync_origin in ('hw','kz')),
  deleted_at timestamptz
);
create index if not exists idx_case_charges_case_alive
  on soa.case_charges (hw_case_id, sort_order) where deleted_at is null;
create index if not exists idx_case_charges_creditor on soa.case_charges (creditor_id);
create index if not exists idx_case_charges_version on soa.case_charges (sync_version);

alter table soa.case_assets
  add constraint case_assets_charge_fk foreign key (charge_id)
  references soa.case_charges(id) deferrable initially deferred;

-- ----------------------------------------------------------------------------
-- Outbox — Kaizen-authored writes waiting to push to Hudson One
-- ----------------------------------------------------------------------------
create table if not exists soa.outbox (
  id uuid primary key default gen_random_uuid(),
  hw_case_id uuid not null,
  hw_table text not null check (hw_table in ('case_assets','case_liabilities','case_charges')),
  hw_row_id uuid not null,
  operation text not null check (operation in ('upsert','soft_delete')),
  payload jsonb not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  attempts int not null default 0,
  last_attempt_at timestamptz,
  last_error text,
  succeeded_at timestamptz
);
create index if not exists idx_outbox_pending on soa.outbox (created_at) where succeeded_at is null;
create index if not exists idx_outbox_case on soa.outbox (hw_case_id);

-- ----------------------------------------------------------------------------
-- Bridge audit log — every cross-app call recorded for compliance
-- ----------------------------------------------------------------------------
create table if not exists soa.bridge_audit (
  id uuid primary key default gen_random_uuid(),
  kaizen_user_id uuid not null references auth.users(id),
  hw_user_id uuid,
  action text not null,                                                      -- e.g. 'pull_case', 'push_asset', 'check_access'
  hw_table text,
  hw_row_id uuid,
  payload_hash text,
  succeeded boolean not null,
  error_message text,
  requested_at timestamptz not null default now()
);
create index if not exists idx_bridge_audit_user on soa.bridge_audit (kaizen_user_id, requested_at desc);
create index if not exists idx_bridge_audit_case on soa.bridge_audit (hw_row_id);

-- ----------------------------------------------------------------------------
-- RLS: only Kaizen users with case_access can see / mutate mirror rows
-- ----------------------------------------------------------------------------
alter table soa.case_access enable row level security;
create policy "user reads own case_access" on soa.case_access
  for select using (kaizen_user_id = auth.uid());

alter table soa.case_assets enable row level security;
create policy "case access read" on soa.case_assets
  for select using (exists (
    select 1 from soa.case_access ca
    where ca.kaizen_user_id = auth.uid()
      and ca.hw_case_id = soa.case_assets.hw_case_id
  ));
create policy "case access write" on soa.case_assets
  for insert with check (exists (
    select 1 from soa.case_access ca
    where ca.kaizen_user_id = auth.uid()
      and ca.hw_case_id = soa.case_assets.hw_case_id
  ));
create policy "case access update" on soa.case_assets
  for update using (exists (
    select 1 from soa.case_access ca
    where ca.kaizen_user_id = auth.uid()
      and ca.hw_case_id = soa.case_assets.hw_case_id
  ));

alter table soa.case_liabilities enable row level security;
create policy "case access read" on soa.case_liabilities
  for select using (exists (
    select 1 from soa.case_access ca
    where ca.kaizen_user_id = auth.uid()
      and ca.hw_case_id = soa.case_liabilities.hw_case_id
  ));
create policy "case access write" on soa.case_liabilities
  for insert with check (exists (
    select 1 from soa.case_access ca
    where ca.kaizen_user_id = auth.uid()
      and ca.hw_case_id = soa.case_liabilities.hw_case_id
  ));
create policy "case access update" on soa.case_liabilities
  for update using (exists (
    select 1 from soa.case_access ca
    where ca.kaizen_user_id = auth.uid()
      and ca.hw_case_id = soa.case_liabilities.hw_case_id
  ));

alter table soa.case_charges enable row level security;
create policy "case access read" on soa.case_charges
  for select using (exists (
    select 1 from soa.case_access ca
    where ca.kaizen_user_id = auth.uid()
      and ca.hw_case_id = soa.case_charges.hw_case_id
  ));
create policy "case access write" on soa.case_charges
  for insert with check (exists (
    select 1 from soa.case_access ca
    where ca.kaizen_user_id = auth.uid()
      and ca.hw_case_id = soa.case_charges.hw_case_id
  ));
create policy "case access update" on soa.case_charges
  for update using (exists (
    select 1 from soa.case_access ca
    where ca.kaizen_user_id = auth.uid()
      and ca.hw_case_id = soa.case_charges.hw_case_id
  ));

-- Outbox + audit are bridge-only (service role) — no public RLS policy.
alter table soa.outbox enable row level security;
alter table soa.bridge_audit enable row level security;

-- ----------------------------------------------------------------------------
-- Outbox trigger: queue Kaizen-authored writes for replay to Hudson One
-- ----------------------------------------------------------------------------
create or replace function soa.queue_outbox_for_kz_write() returns trigger as $$
begin
  if new.sync_origin = 'kz' then
    insert into soa.outbox (hw_case_id, hw_table, hw_row_id, operation, payload, idempotency_key)
    values (
      new.hw_case_id,
      tg_table_name,
      new.id,
      case when new.deleted_at is not null then 'soft_delete' else 'upsert' end,
      to_jsonb(new),
      'kaizen_' || new.id::text || '_' || new.sync_version::text
    )
    on conflict (idempotency_key) do nothing;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger queue_outbox after insert or update on soa.case_assets
  for each row execute function soa.queue_outbox_for_kz_write();
create trigger queue_outbox after insert or update on soa.case_liabilities
  for each row execute function soa.queue_outbox_for_kz_write();
create trigger queue_outbox after insert or update on soa.case_charges
  for each row execute function soa.queue_outbox_for_kz_write();
