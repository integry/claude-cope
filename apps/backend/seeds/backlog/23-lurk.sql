-- LURK: shadow IT, side automations, rogue scripts, and covert process replacements
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Business Ops Detective Celia
-- REPORTER: Celia | Business Ops Detective | Hunts rogue automations before revenue proves they were architecture all along.
('LURK-511', 'Inventory All the Zapier Flows Nobody Told Engineering About but Sales Relies On Daily',
 'We have discovered at least nine unofficial automations moving customer data, account states, and managerial optimism between systems that were never formally introduced. Catalog every rogue Zap, Make flow, Apps Script, Outlook rule, and mysterious webhook parser currently holding go-to-market together with private hope.',
 'build inventory of secret zapier flows',
  233),

('LURK-512', 'Create a Quarantine Lane for Helpful Scripts Found on People''s Desktops',
 'Employees keep solving operational pain with scripts named final_cleanup_v3 or really_use_this_one.sh and then forgetting to confess until the company is metabolically dependent on them. Add a quarantine lane where these tools can be inspected, documented, stabilized, and informed they are no longer private coping mechanisms.',
 'quarantine helpful desktop scripts',
  144),

-- RevOps Operator Ben
-- REPORTER: Ben | RevOps Operator | Knows which CRM fields report emotionally to one spreadsheet and a single rep's faith.
('LURK-513', 'The CRM Must Detect Fields That Are Secretly Controlled by One Account Executive''s Spreadsheet',
 'Several system-of-record fields are technically stored in the CRM but practically governed by one spreadsheet in one rep''s Google Drive with tabs named AFTER_CALL, ACTUAL, and dont_touch. Add drift detection for values repeatedly overwritten to match side ledgers.',
 'make crm flag fields owned by one spreadsheet',
  144),

('LURK-514', 'Every Manual Monthly Process Needs a Heatmap of How Close It Is to Becoming an Official Product',
 'We have dozens of monthly rituals still described as temporary despite recurring with the confidence of tides. Score each manual process by frequency, business criticality, number of hidden sheets, and how loudly people panic when the usual operator is on holiday.',
 'flag monthly processes becoming products',
  144),

-- Shadow Systems Analyst Priya
-- REPORTER: Priya | Shadow Systems Analyst | Indexes bookmarks, budget wounds, and the browser tab layer of reality itself.
('LURK-515', 'Build an Inventory Screen for Browser Bookmarks That Have Become Business Infrastructure',
 'Not every critical system has a hostname people would recognize in an architecture review. Some live as a browser bookmark titled IMPORTANT NEW, a shared folder shortcut, or a Slack-saved message containing an ancient admin URL. Build an inventory screen before one dead laptop turns institutional memory into a crime scene with tabs.',
 'inventory bookmarks running the business',
  144),

('LURK-516', 'The Process Wiki Must Mark Pages That Only Exist Because Nobody Could Get Budget for a Tool',
 'Process documentation is not neutral. Some pages are a record of denied procurement. Add metadata for workarounds born from budget refusal, vendor fatigue, or one executive saying can''t someone just make a doc. Readers should know when a page is policy and when it is a scar.',
 'mark wiki pages that are imaginary',
  89),

-- Support Automation Owner Louis
-- REPORTER: Louis | Support Automation Owner | Tracks ghost-written macros and shared-drive organs still being called archives.
('LURK-517', 'The Macro Library Needs to Flag Replies Written by Former Employees Who Still Dictate Tone',
 'Several macros shaping live customer conversations were authored by people who left during previous org eras and took their context with them. Detect which replies and snippets still carry ghost authorship from teammates now living better lives elsewhere.',
 'flag old macros still writing our emails',
  89),

('LURK-518', 'Every Shared Drive Folder Must Disclose Whether It Is an Archive, a Workflow, or a Cry for Help',
 'Shared drives contain historical artifacts, live operations, duplicate operations, and folders that function mostly as emotional appeals. Add labels for each folder''s real role so people can stop discovering that Archive_Final_UseThis actually powers payroll exceptions.',
 'label folders archive or cry for help',
  144),

-- Ops Engineer Harlan
-- REPORTER: Harlan | Ops Engineer | Surfaces access kept alive by awkwardness and scripts born from crisp historical panic.
('LURK-519', 'The VPN Access List Must Show Which Contractors Still Have Access Because Nobody Wanted the Email',
 'Offboarding occasionally loses to interpersonal fatigue, and the infrastructure remembers every hesitation. Add a report showing which contractors, freelancers, agencies, and former temporary specialists still have access because revoking them required one awkward email too many.',
 'show which contractors still have vpn',
  144),

('LURK-520', 'All Bash Scripts in Shared Folders Need Owners, Warnings, and One Sentence of Emotional Truth',
 'We have dozens of scripts whose names imply usefulness, maturity, and absence of traps with varying degrees of honesty. Require every shared script to declare owner, purpose, last use, blast radius, and one plain sentence describing the emotional state that produced it.',
 'make shared bash scripts show owners and warnings',
  144),

-- People Systems Partner Dana
-- REPORTER: Dana | People Systems Partner | Tracks headcount folklore and hunts single-witness rituals before the witness resigns.
('LURK-521', 'Find All the Headcount Workflows Secretly Running in Calendar Invites and Slacks',
 'Headcount planning officially lives in a system. Unofficially it also lives in recurring calendar events, Slack threads, sticky notes, and one doc called q3 positions ACTUAL. Audit the shadow process so sanctioned hiring logic can be separated from the whisper network.',
 'scan invites for hidden headcount workflows',
  144),

('LURK-522', 'The Offboarding Checklist Must Detect Tasks Only One Person Knew Existed',
 'Offboarding assumes knowledge is documented, transferable, and politely distributed. Reality disagrees. Add a detection pass for accounts, scripts, inbox rules, billing quirks, and monthly rituals that appear to have only one historical witness.',
 'catch offboarding tasks only one person knew',
  144),

-- Growth Hacker Milo
-- REPORTER: Milo | Growth Hacker | Builds redirect mazes and spreadsheet authority just fast enough to outrun governance.
('LURK-523', 'Audit the Hidden Redirects Marketing Added Because "The Platform Was Too Slow"',
 'Marketing moves fast enough that some of its solutions have started bypassing the official site, canonical URLs, and what we still lovingly call platform governance. Inventory every hidden redirect, vanity domain, campaign shim, and tracking-first landing path added in the name of speed.',
 'audit the hidden redirects marketing added',
  144),

('LURK-524', 'Every Google Sheet with AppScript Needs a "Could This Take Down Billing?" Score',
 'Not all spreadsheets are harmless. Some have scripts, triggers, hidden tabs, and a direct line into systems whose owners still think the sheet is just for visibility. Add a visible blast-radius badge to each AppScript sheet based on whether it can mutate customer states, pricing logic, invoices, or reputation.',
 'add billing danger score to sheets',
  144),

-- Workflow Archaeologist Ingrid
-- REPORTER: Ingrid | Workflow Archaeologist | Exposes human cron jobs and Tuesday emails before habit gets promoted to system design.
('LURK-525', 'The Process Map Must Show Which Official Workflows Still Depend on Someone Remembering a Tuesday Email',
 'Several formal processes still hinge on one person remembering to forward a Tuesday email, check a special inbox, or update a shared note with exactly the right amount of dread. Add dependency markers for these human cron jobs directly on the workflow map so repeatability stops masquerading as documentation.',
 'flag workflows waiting on tuesday email',
  144),;
