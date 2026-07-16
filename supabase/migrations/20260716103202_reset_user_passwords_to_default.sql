-- Temporary: password-less login (dev only). Reset every existing user to a shared default password
-- so the client can sign them in with just an email.
UPDATE auth.users
SET encrypted_password = crypt('password', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now();
