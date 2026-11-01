-- ============================================================
-- Partner Hub — OPTIONAL demo content.
-- Run this only AFTER setup.sql, only if you want sample
-- partners to explore before inviting real ones. Skip it for a
-- clean production start. You can delete the demo agents later
-- from the admin panel.
--
-- Note: with zero admins in the database, the "first signup
-- becomes admin" bootstrap trigger fires on the first user
-- created below, so the demo admin is approved and granted the
-- admin role automatically. Change its password right away or
-- delete this account after exploring.
-- ============================================================

-- ---- Demo admin -----------------------------------------------------
do $$
declare
  admin_id uuid;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    'admin@partnerhub.app', crypt('PartnerHub2026!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}', '{}',
    now(), now(), '', '', '', ''
  ) returning id into admin_id;

  -- The bootstrap trigger already created this profile and made it an
  -- admin; fill in the real details here.
  update public.profiles
  set partner_id = 'PH-ADM',
      full_name = 'Evan Christopher',
      headline = 'Founding Admin',
      bio = 'Running the Partner Hub network.',
      location = 'Remote',
      approved = true
  where id = admin_id;
end $$;

-- ---- Demo agents and their content ----------------------------------
do $$
declare
  a1 uuid; a2 uuid; a3 uuid; a4 uuid;
  s1 uuid; s2 uuid; s3 uuid; s4 uuid; s5 uuid; s6 uuid; s7 uuid; s8 uuid;
  s9 uuid; s10 uuid; s11 uuid; s12 uuid;
  admin_id uuid;
begin
  select p.id into admin_id from public.profiles p
  join public.user_roles r on r.user_id = p.id and r.role = 'admin'
  order by p.created_at limit 1;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'maya.ops@partnerhub.demo', crypt(md5(random()::text || clock_timestamp()::text), gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '') returning id into a1;
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'jonas.growth@partnerhub.demo', crypt(md5(random()::text || clock_timestamp()::text), gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '') returning id into a2;
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'priya.strategy@partnerhub.demo', crypt(md5(random()::text || clock_timestamp()::text), gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '') returning id into a3;
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'leo.finance@partnerhub.demo', crypt(md5(random()::text || clock_timestamp()::text), gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '') returning id into a4;

  insert into public.profiles (id, partner_id, full_name, headline, bio, avatar_url, location, approved, added_by) values
    (a1, 'PH-1001', 'Maya Ortiz', 'Ecommerce Operations Partner', 'I run backend operations for 7- and 8-figure DTC brands: 3PL onboarding, inventory forecasting, and CS systems that scale past 10k orders a month.', 'https://i.pravatar.cc/300?img=47', 'Austin, TX', true, admin_id),
    (a2, 'PH-1002', 'Jonas Weber', 'Growth & Paid Media Partner', 'Performance marketer focused on Meta and Google Ads for ecommerce. I have managed north of $12M in ad spend with a bias toward profitable CAC.', 'https://i.pravatar.cc/300?img=12', 'Berlin, DE', true, admin_id),
    (a3, 'PH-1003', 'Priya Nair', 'Strategy & Operations Executive Partner', 'Ex-McKinsey strategist supporting leadership teams on go-to-market, org design, and operating-model transformation.', 'https://i.pravatar.cc/300?img=32', 'Singapore', true, admin_id),
    (a4, 'PH-1004', 'Leo Fontaine', 'Corporate Finance Partner', 'Fractional CFO for mid-market companies: financial modeling, M&A support, fundraising, and board-ready reporting.', 'https://i.pravatar.cc/300?img=68', 'Toronto, CA', true, admin_id);

  insert into public.skills (name, created_by) values
    ('Shopify', admin_id), ('Amazon PPC', admin_id), ('Meta Ads', admin_id), ('Google Ads', admin_id),
    ('Email Marketing', admin_id), ('SEO', admin_id), ('Conversion Rate Optimization', admin_id),
    ('Supply Chain', admin_id), ('Copywriting', admin_id), ('Financial Modeling', admin_id),
    ('M&A Advisory', admin_id), ('Business Strategy', admin_id), ('Organizational Design', admin_id),
    ('Data Analytics', admin_id), ('Fundraising', admin_id), ('Talent Operations', admin_id);

  select id into s1 from public.skills where name = 'Shopify';
  select id into s2 from public.skills where name = 'Amazon PPC';
  select id into s3 from public.skills where name = 'Meta Ads';
  select id into s4 from public.skills where name = 'Google Ads';
  select id into s5 from public.skills where name = 'Email Marketing';
  select id into s6 from public.skills where name = 'SEO';
  select id into s7 from public.skills where name = 'Conversion Rate Optimization';
  select id into s8 from public.skills where name = 'Supply Chain';
  select id into s9 from public.skills where name = 'Copywriting';
  select id into s10 from public.skills where name = 'Financial Modeling';
  select id into s11 from public.skills where name = 'M&A Advisory';
  select id into s12 from public.skills where name = 'Business Strategy';

  insert into public.agent_skills (agent_id, skill_id, for_ecom, for_exec) values
    (a1, s1, true, false), (a1, s8, true, false), (a1, s5, true, false),
    (a2, s3, true, false), (a2, s4, true, false), (a2, s6, true, false),
    (a3, s12, false, true), (a3, s7, true, false), (a3, s9, false, true),
    (a4, s10, false, true), (a4, s11, false, true);

  insert into public.projects (agent_id, title, description, result, for_ecom, for_exec) values
    (a1, '3PL migration for apparel brand', 'Moved a $20M apparel brand from self-fulfillment to a dual-coast 3PL with SLA reporting.', 'Ship time cut from 4 days to 1.2 days', true, false),
    (a1, 'Inventory forecasting system', 'Built a rolling 26-week forecast that reduced stockouts during Q4.', 'Stockouts down 63% year over year', true, false),
    (a2, 'Meta Ads rebuild for DTC skincare', 'Rebuilt account structure, creative testing pipeline, and retargeting for a skincare brand.', 'Blended ROAS up from 1.9 to 3.4', true, false),
    (a2, 'Google Shopping feed overhaul', 'Cleaned feed, tiered bidding, and brand/non-brand split for a home goods store.', 'CPA down 38% in 90 days', true, false),
    (a3, 'Operating model redesign', 'Led a 9-month operating-model redesign for a regional services group.', 'Decision cycle time cut by 40%', false, true),
    (a4, 'Buy-side diligence', 'Ran financial diligence and working-capital modeling for a $30M acquisition.', 'Deal closed with repriced terms', false, true);

  insert into public.contact_methods (agent_id, platform, label, value, is_primary_ecom, is_primary_exec) values
    (a1, 'email', 'Email', 'maya@partnerhub.app', true, false),
    (a1, 'whatsapp', 'WhatsApp', '15125550101', false, false),
    (a1, 'linkedin', 'LinkedIn', 'https://www.linkedin.com/in/demo-maya', false, false),
    (a2, 'email', 'Email', 'jonas@partnerhub.app', true, false),
    (a2, 'telegram', 'Telegram', 'https://t.me/demo-jonas', false, false),
    (a2, 'upwork', 'Upwork', 'https://www.upwork.com/demo-jonas', false, false),
    (a3, 'email', 'Email', 'priya@partnerhub.app', false, true),
    (a3, 'linkedin', 'LinkedIn', 'https://www.linkedin.com/in/demo-priya', false, false),
    (a4, 'email', 'Email', 'leo@partnerhub.app', false, true),
    (a4, 'website', 'Website', 'https://leofontaine.demo', false, false);

  insert into public.reviews (agent_id, author_name, rating, content, source_view) values
    (a1, 'Dana K.', 5, 'Maya rebuilt our fulfillment stack in six weeks. Q4 went out on time for the first time ever.', 'ecom'),
    (a1, 'Marcus T.', 5, 'Best ops partner we have worked with. Communicates like a COO, not a contractor.', 'ecom'),
    (a2, 'Sofia R.', 4, 'Jonas took our Meta account from breakeven to genuinely profitable. Straight shooter.', 'ecom'),
    (a3, 'Exec Search Committee', 5, 'Priya gave our board a clear operating plan and then helped us run it.', 'exec'),
    (a4, 'G. Hassim', 5, 'Rigorous, fast, and honest about risk. Exactly what you want on buy-side.', 'exec');

  insert into public.blog_posts (agent_id, title, slug, excerpt, body, published) values
    (a2, 'Why your ROAS target is lying to you', 'why-your-roas-target-is-lying-to-you', 'Platform-reported ROAS and blended profitability diverge the moment you scale. Here is how to read both.', 'Platform-reported ROAS is an attribution story, not a bank statement. When you scale spend, the two numbers diverge, and brands that optimize to the platform number usually watch margin fall off a cliff.

Start with blended CAC: total spend over total new-customer revenue, from your finance system, not the ad platform. Then layer incrementality tests — geo holdouts or a simple pre/post around creative refreshes — to sanity-check what the platforms claim.

Finally, set account structure so creative testing is cheap: broad targeting, few structural constraints, and a weekly kill-or-scale ritual. Structure follows strategy, not the other way around.', true),
    (a3, 'The executive playbook for hiring specialists', 'the-executive-playbook-for-hiring-specialists', 'Most leadership teams hire generalists when they need a spike. A framework for scoping, vetting, and onboarding partners.', 'Leadership teams routinely solve a sharp problem with a broad hire. The result is a senior salary attached to a junior outcome.

Instead, scope the spike: write down the one decision or capability that is blocking the quarter, and hire against that. Vet with work samples, not interviews — a paid two-week pilot beats four rounds of conversation.

Onboard partners like employees: give them the operating context, a named decision-maker, and a review cadence. Partners deliver best inside your system, not beside it.', true),
    (a1, 'Fulfillment SLAs your 3PL will actually hit', 'fulfillment-slas-your-3pl-will-actually-hit', 'Vague SLAs are why fulfillment disappointments feel random. Make them measurable.', 'Most brands sign a 3PL agreement with SLAs like ships in 24-48 hours and then act surprised when peak season slips. A workable SLA is measured from order export to carrier scan, with a weekly scorecard and named escalation contacts on both sides.

Pressure-test the SLA before you need it: send a synthetic spike of orders in September. The response you get then is the response you will get in November.', true);
end $$;
