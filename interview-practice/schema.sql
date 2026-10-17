create table public.practice_answers (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 question_id text not null check(question_id in ('intro','motivation','strength','team','failure','safety','learning','future')),
 question text not null check(char_length(question) between 1 and 300),
 answer text not null check(char_length(btrim(answer)) between 1 and 10000),
 company text not null default '' check(char_length(company)<=100),
 job text not null check(char_length(btrim(job)) between 1 and 100),
 experience text not null default '' check(char_length(experience)<=5000),
 created_at timestamptz not null default now()
);
create index practice_answers_owner_time on public.practice_answers(user_id,created_at desc);
alter table public.practice_answers enable row level security;
revoke all on public.practice_answers from anon,authenticated;
grant select,insert,delete on public.practice_answers to authenticated;
create policy own_read on public.practice_answers for select to authenticated using ((select auth.uid())=user_id);
create policy own_write on public.practice_answers for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_delete on public.practice_answers for delete to authenticated using ((select auth.uid())=user_id);
