-- HAUNT: IAM sprawl, access necromancy, entitlement drift, and permission hauntings
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- IAM Governance Lead Miriam
-- REPORTER: Miriam | IAM Governance Lead | Watches emergency permissions fossilize into permanent wallpaper and calls it access necromancy with paperwork.
('HAUNT-886', 'Put a Death Clock on Every Permission Grant',
 'Access keeps getting handed out for launches, incidents, exports, and urgent reasons that somehow outlive both the urgency and the people who approved them. Add expiry and renewal friction before temporary permission turns into ancient architecture.',
 'put a death clock on every permission grant',
  144),

('HAUNT-887', 'Split Real Job Roles from the Haunted Access Heirlooms We Keep Inheriting',
 'Some roles reflect current work. Others are just sediment from mergers, emergency exceptions, and ten years of not wanting to break quarter close. Separate the living permissions from the haunted ones before the matrix becomes a labeled crypt.',
 'split real roles from haunted heirlooms',
  144),

-- Access Reviews PM Theo
-- REPORTER: Theo | Access Reviews PM | Can spot a rubber-stamped permission approval by the speed, posture, and mild smell of managerial panic.
('HAUNT-888', 'Flag Access Reviews Approved Too Fast for Anyone to Have Actually Read Them',
 'Managers are recertifying permissions with the unmistakable velocity of people who do not know what the grant means but also do not want to be the one who asks. Detect shame-speed approvals before rubber stamps keep holding prod keys.',
 'flag access reviews approved too fast to read',
  144),

('HAUNT-889', 'Translate Role Names Like OPS_LEGACY_PLUS into What They Actually Let You Ruin',
 'Permission strings have evolved into fossil poetry with prefixes, suffixes, and plus signs that clearly survived an incident. Build a translation layer so people can approve access based on blast radius instead of whether the label feels familiar and vaguely patriotic.',
 'translate role names into blast radius',
  144),

-- Privileged Access Engineer Jun
-- REPORTER: Jun | Privileged Access Engineer | Has noticed the emergency hatch looks less like glass and more like a frequently handled office door.
('HAUNT-890', 'Make the Break-Glass Flow Admit How Recently the Glass Was Touched',
 'Emergency access appears too often to preserve the dignity of the word emergency. Show recent use so approvers can tell whether someone is fighting a real fire or just using the scariest path because the normal route became emotionally unavailable.',
 'show how often break-glass gets touched',
  144),

('HAUNT-891', 'Hang an Excuse Museum on Every Shared Admin Account',
 'Shared admin accounts survive on a diet of legacy integrations, consultant residue, and the eternal promise that we will fix this after the quarter. Add a plaque listing the excuses so nobody mistakes these root-level relics for natural features of the landscape.',
 'hang excuse museums on shared admins',
  89),

-- Enterprise Security PM Clara
-- REPORTER: Clara | Enterprise Security PM | Knows SSO projects fail less on protocol details than on departments being romantically attached to their own chaos.
('HAUNT-892', 'Measure Whether SSO Resistance Is Technical or Just Emotional Attachment to Password Folklore',
 'Single sign-on is not only a migration. It is a referendum on whether teams will surrender their local secret sprawl and private admin rituals. Score resistance so we can tell technical blockers from people emotionally invested in disorder.',
 'check if sso resistance is folklore',
  144),

('HAUNT-893', 'Stop Assigning Service Accounts to Whoever Failed to Run Away Fast Enough',
 'Critical machine identities keep ending up owned by whichever engineer last touched the config, answered a page, or lost a game of professional chicken. Require real ownership before service-account custody keeps spreading by accident and fatigue.',
 'stop assigning service accounts by bad luck',
  144),

-- Directory Services Lead Samir
-- REPORTER: Samir | Directory Services Lead | Has seen too many employees leave the company and remain digitally employed across five important systems.
('HAUNT-894', 'Audit the Departed for Lingering Digital Afterlife',
 'Offboarding looks tidy on slides right up until you notice the former employee still exists in billing, analytics, admin, and one cursed vendor portal. Add a persistence audit so departure starts meaning departure in systems that matter.',
 'audit the departed for lingering digital afterlife',
  144),

('HAUNT-895', 'Label Each Group as Designed or Just Repeatedly Allowed to Happen',
 'Some memberships are policy. Others are just the accumulation of one-off grants repeated often enough to feel inevitable. Mark which groups were designed and which one simply gathered moss until nobody felt brave enough to question them.',
 'label groups designed or accidentally grown',
  89),

-- Audit Systems Analyst Imani
-- REPORTER: Imani | Audit Systems Analyst | Specializes in spotting privilege chains that only make sense if you already know the secret handshake and one cursed nesting path.
('HAUNT-896', 'Highlight the Secret Admin Ladders Hidden Inside Normal Group Plumbing',
 'Certain privilege paths are technically visible and practically invisible because understanding them requires knowing which legacy role still implies admin and which nested group is haunted. Surface the ladders before they keep passing as ordinary plumbing.',
 'highlight secret admin ladders',
  144),

('HAUNT-897', 'Count How Often Temporary Access Keeps Coming Back Like a Familiar Ghost',
 'We keep praising just-in-time access while ignoring the suspicious recurrence of the same "temporary" grants every sprint, every report, and every incident. Count the repeat visits until the ghost admits it is really a permanent need wearing a bedsheet.',
 'count temporary access coming back',
  144),

-- Chief Identity Officer Lorne
-- REPORTER: Lorne | Chief Identity Officer | Believes entitlement cleanup starts the moment someone dares ask whether anyone would actually notice if a permission vanished.
('HAUNT-898', 'Score Permissions by Whether Anyone Would Truly Notice If They Disappeared',
 'Entitlements multiply faster than their stories decay. Rank each one by actual necessity, occasional usefulness, emotional attachment, and antique panic so cleanup can stop negotiating with fear disguised as operational need.',
 'score permissions by who would notice',
  144),

('HAUNT-899', 'Make Every Role Workshop Open with "How Did We End Up Like This?"',
 'Role-design sessions keep sprinting toward the ideal future without staring long enough at the current nightmare of overlaps, exceptions, shared roots, and one cursed vendor portal. Add a required grief slide before anyone drafts a cleaner-looking sequel to the same mess.',
 'open role workshops with how did this happen',
  89),

-- VP of Trust Fabric Elise
-- REPORTER: Elise | VP of Trust Fabric | Wants one giant haunted map of every system still trusting people, bots, and former partners nobody remembers clearly.
('HAUNT-900', 'Draw the Haunted Access Map Before Another Forgotten Account Wanders into Something Expensive',
 'The company needs one map of stale trust: zombie service accounts, partner identities from dead contracts, old groups still honored by half the stack, and permissions surviving on pure institutional nervousness. Visualize the ghosts before cleanup keeps operating on dread alone.',
 'draw haunted access map now',
  144),;
