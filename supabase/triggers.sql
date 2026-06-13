-- 1. Enable the pg_net extension to allow outbound HTTP requests from PostgreSQL
create extension if not exists pg_net with schema extensions;

-- 2. Create the trigger function that calls our send-welcome-email edge function
create or replace function public.handle_new_user_welcome_email()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
declare
  request_id bigint;
begin
  begin
    -- Invoke the Supabase Edge Function asynchronously using pg_net
    select net.http_post(
      url := 'https://akshkrlvbcgpcwspyncg.supabase.co/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        -- IMPORTANT: Replace 'YOUR_ANON_KEY' below with your actual Supabase Anon Key
        -- found in your Supabase Dashboard -> Project Settings -> API
        'Authorization', 'Bearer YOUR_ANON_KEY'
      ),
      body := jsonb_build_object(
        'record', row_to_json(new)
      )::text
    ) into request_id;
  exception when others then
    -- Log the warning in database logs but do not abort the user signup transaction
    raise warning 'Failed to trigger welcome email edge function: %', SQLERRM;
  end;

  return new;
end;
$$;


-- 3. Bind the function to fire AFTER a new row is inserted into auth.users
drop trigger if exists on_auth_user_created_welcome_email on auth.users;
create trigger on_auth_user_created_welcome_email
  after insert on auth.users
  for each row execute function public.handle_new_user_welcome_email();
