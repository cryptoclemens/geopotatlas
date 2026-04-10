# Tasks

## Offen

- [ ] Überarbeitung UX/UI-Design *(Feedback 07.04.2026)*
- [ ] Supabase `profiles`-Tabelle anlegen (SQL unten ausführen)

## Supabase Setup (einmalig)

SQL im Supabase Dashboard → SQL Editor ausführen:

```sql
create table profiles (
  id uuid references auth.users primary key,
  claude_api_key text,
  preferred_provider text default 'claude',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Eigenes Profil lesen/schreiben"
  on profiles for all using (auth.uid() = id);
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```
