-- MAIL: deliverability, notification rot, inbox placement, templates, and SMTP sorrow
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Deliverability Director Naomi
-- REPORTER: Naomi | Deliverability Director | Knows Gmail has its own theology and that many "helpful" emails were born already condemned to Promotions.
('MAIL-1016', 'Sort Notification Streams into Helpful and Pre-Damned',
 'We keep launching email flows like intent and inbox placement are naturally aligned. Add a usefulness classification so we can see which streams deserve trust and which ones were always going to live in the Promotions gutter.',
 'sort notification streams into helpful and pre-damned',
  144),

('MAIL-1017', 'Rewrite Domain Warmup So It Stops Sounding Like Therapy for a Nervous Toaster',
 'Warmup docs have acquired the tone of a shy appliance learning to re-enter society through careful politeness. Make the guidance sound technical again before sender reputation starts reading like foster care for mail servers.',
 'rewrite domain warmup',
  89),

-- Lifecycle Messaging PM Anton
-- REPORTER: Anton | Lifecycle Messaging PM | Specializes in deciding whether dormant users can be won back or are simply being politely poked in their digital coffins.
('MAIL-1018', 'Make Re-Engagement Campaigns Admit When They Are Just Tapping the Casket',
 'Some inactive users are recoverable. Others are gone in spirit and only remain on decks because open rates are still treated like a mineral resource. Add an exit-likelihood field before win-back becomes inbox necromancy.',
 'make re-engagement emails admit they are corpse-tapping',
  144),

('MAIL-1019', 'Force Every Triggered Email to Explain Why It Could Not Stay Inside the Product',
 'We keep choosing email for moments that could have been an in-app nudge, a quieter notification, or merciful silence. Make each message justify its exile before SMTP becomes our universal coping mechanism.',
 'make triggered emails explain their escape',
  144),

-- Template Engineering Lead Priya
-- REPORTER: Priya | Template Engineering Lead | Lives in fear of one stray merge tag turning a campaign into "Hello ," at scale.
('MAIL-1020', 'Catch Personalization Tokens Before They Publicly Humiliate Us',
 'Broken merge tags keep exposing the gap between our confidence and our controls through greetings that look hand-assembled by panic. Add humiliation detection before template logic introduces itself to revenue as an empty brace.',
 'catch broken personalization tokens',
  144),

('MAIL-1021', 'Test Whether This Email Renders Like a Product or a Hostage Note in Outlook',
 'A layout can look beautiful in previews and still arrive in Outlook like a confession typed during a storm by wounded tables. Add a hostage-note review before brand dignity gets mugged by the most suspiciously resilient client on earth.',
 'test if emails look like hostage notes',
  144),

-- Inbox Placement Analyst Jules
-- REPORTER: Jules | Inbox Placement Analyst | Can smell when an "operational" email has been perfumed into marketing by links, tracking sludge, and too much confidence.
('MAIL-1022', 'Expose the Tracking Links Making Operational Mail Smell Promotional',
 'Some emails are operational in theory and adjacent in odor. Break down which links, images, and copy choices are pushing useful messages into the same neighborhood as overconfident campaigns.',
 'expose tracking links ruining operational mail',
  144),

('MAIL-1023', 'Give Bounce Analytics a Bucket for Domains Having a Personal Episode',
 'Not every delivery failure is our fault, their fault, or a stable policy problem. Some recipient domains just wake up misconfigured and spiritually unwell. Add that category before every bounce storm gets treated like a revelation.',
 'add bounce bucket for domain episodes',
  89),

-- CRM Messaging Architect Sienna
-- REPORTER: Sienna | CRM Messaging Architect | Believes users should be allowed to want less from us without filing for full emotional separation.
('MAIL-1024', 'Stop Treating Email Preferences Like a Choice Between Marriage and Exile',
 'Preference centers are too binary, as if users must choose between full silence and total immersion in our internal weather. Add nuance before people are forced to declare relational independence when they really just wanted fewer recaps.',
 'stop making email prefs marriage or exile',
  89),

('MAIL-1025', 'Remove the Breakup Energy from the Unsubscribe Flow',
 'Our unsubscribe copy still sounds weirdly hurt that anyone could tire of us. Rewrite it so the brand stops behaving like a wounded ex just because a user declined more webinars and cheerful release summaries.',
 'remove the breakup energy from the unsubscribe flow',
  89),

-- Email Operations Manager Karim
-- REPORTER: Karim | Email Operations Manager | Wants shared sender reputation treated like a communal rug everyone keeps tracking mud across and then acting surprised about.
('MAIL-1026', 'Put a Plaque on Every Sending Domain Saying Who Dirtied It Last',
 'Sender health remains a shared asset right up until one team blasts a high-volume idea into it with quarter-end optimism. Record the last known soiling event before domain reputation becomes a consequence-free commons.',
 'add plaque showing who dirtied the domain',
  144),

('MAIL-1027', 'Translate Postmaster Warnings from Oracle Riddle into Human Guilt',
 'Provider diagnostics stay too abstract for the shame they are supposed to trigger. Convert them into plain language about list hygiene, volume greed, copy behavior, and general disrespect for inbox dignity.',
 'translate postmaster riddles into guilt',
  144),

-- Principal Notifications PM Elin
-- REPORTER: Elin | Principal Notifications PM | Keeps asking whether this message truly deserves an inbox or just wants the costume and the authority of one.
('MAIL-1028', 'Ask Whether a Push Notification Would Have Been Less Embarrassing',
 'We keep emailing tiny product events as if they belong next to bank alerts and family obligations. Add a dignity review before trivial motion gets mailed with civic seriousness.',
 'ask if push would be less embarrassing',
  89),

('MAIL-1029', 'Make Digests Admit They Are Mostly Things We Wanted You to Notice Again',
 'Weekly digests often pretend to recap meaningful activity while quietly functioning as strategic resurfacing for features, content, and assorted internal wishes. Tag the disguised attention auctions before neutrality keeps getting free formatting.',
 'make digests admit they are just reminders',
  89),

-- Chief Inbox Officer Matteo
-- REPORTER: Matteo | Chief Inbox Officer | Thinks any email with enough exclamation marks should have to experience the Promotions tab personally before bothering the public.
('MAIL-1030', 'Send Overexcited Emails to Our Own Promotions Tab First as Punishment',
 'If we would not trust our own message enough to read it sober in Promotions, we should not unleash it on anyone else. Route the loudest, cheeriest, most overtracked messages through our own shame lane first.',
 'send overexcited emails to promotions first',
  144),;
