-- HUSH: privacy theater, approvals, procurement rituals, and institutional secrecy
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Privacy Program Lead Nora
-- REPORTER: Nora | Privacy Program Lead | Turns paranoia into a permission model and calls it respectful uncertainty.
('HUSH-316', 'Add a "Need to Know" Layer That Hides Fields Based on Management''s Current Mood',
 'Static role-based access implies a stability we do not possess. Make fields appear or disappear based on current sensitivity, recent incidents, pending audits, and whether leadership woke up fearing screenshots. Predictability is overrated compared to respectful opacity with a tooltip.',
 'hide fields based on management mood',
  233),

('HUSH-317', 'All Screenshot Buttons Must Trigger a Quiet Internal Notification for Awareness',
 'Screenshots are tiny data exfiltration events wearing innocent shoes. Whenever a user clicks any capture, copy, or export-adjacent control, notify an internal awareness stream so Security and Legal can appreciate the moment in context. We are not blocking screenshots. We are dignifying them with witnesses.',
 'make screenshot buttons quietly notify someone',
  144),

-- Procurement Manager Sheila
-- REPORTER: Sheila | Procurement Manager | Escorts curiosity through metal detectors before it becomes a vendor commitment.
('HUSH-318', 'Every New SaaS Trial Must Open a Procurement Intake Before Anyone Clicks Around',
 'Teams keep just trying tools and then acting startled when we later find customer exports inside a startup with two employees and a dog. From now on, every SaaS trial starts with a procurement intake covering business justification, data appetite, renewal risk, and what made governance meet urgency halfway. Innovation can still happen after it empties its pockets.',
 'make saas trials open procurement tickets',
  144),

('HUSH-319', 'The Vendor Approval Workflow Must Include a Question About Whether the Demo Was Too Charming',
 'We have made several poor software decisions because somebody in a demo said no-code with enough eye contact. Add a required scoring field for suspicious charisma, unusually attractive dashboards, and use of enterprise-grade without visible evidence. Charm is not disqualifying, but it should be discoverable.',
 'add vendor approval question for demo charm',
  89),

-- Legal Operations Counsel Victor
-- REPORTER: Victor | Legal Operations Counsel | Indexes obligations by dread profile rather than paper-era trivia.
('HUSH-320', 'All Contracts Must Be Searchable by Which Clause Everyone Is Afraid Of',
 'Our contract repository is too organized around customer names, dates, and other paper-era trivia. Add search facets for indemnity nightmares, data-transfer weirdness, exclusivity landmines, and whatever sentence Sales still calls standard despite the tremor in its voice. Legal should be able to search by dread directly.',
 'make contracts searchable by scary clauses',
  144),

('HUSH-321', 'The DPA Acceptance Flow Should Offer a "Read the Redlines as Theater" Mode',
 'Most people opening a DPA do not want terms. They want permission to feel due diligence occurred nearby. Add a theater mode that emphasizes the contentious bits, animates redlines like danger, and ends with a tasteful summary stating negotiations were witnessed. The text can stay the same. The drama budget cannot.',
 'add read the redlines mode',
  144),

-- Information Governance Director Paula
-- REPORTER: Paula | Information Governance Director | Solves ambiguity by adding a more secret box directly beneath the secret box.
('HUSH-322', 'Create a Confidential Notes Field That Requires a Second Confidential Notes Field',
 'Teams keep putting sensitive commentary into generic notes fields and then acting betrayed by search. Add a confidential notes field and, immediately beneath it, a more confidential notes field for the part everybody assumed the first one was for. Hierarchy should be introduced directly into secrecy itself.',
 'add second confidential notes field',
  144),

('HUSH-323', 'Every Approval Queue Needs a "This Never Happened" Withdrawal Option',
 'Once a request enters formal approval, its existence becomes discoverable, discussable, and eventually attached to a slide deck. Add a withdrawal mode so badly timed ideas can disappear before a vice president or a search bar gives them permanent oxygen. This is not deletion. It is pre-archival mercy.',
 'add a never happened withdrawal to approval queue',
  144),

-- Corporate Security Analyst Imran
-- REPORTER: Imran | Corporate Security Analyst | Wants hallway anxiety and executive suspicion converted into assignable work.
('HUSH-324', 'Badge Access Logs Must Integrate with Jira So We Can Ticket Suspicious Wandering',
 'We have perfected physical access control right up until somebody badged into the fourth-floor kitchen twice in nine minutes and nobody knew what to do with that knowledge. Integrate badge events with Jira so unusual movement becomes assignable work. Wandering near Finance after 7 PM should become backlog material.',
 'send suspicious badge logs straight to jira',
  144),

('HUSH-325', 'The Visitor Wi-Fi Password Must Rotate After Every Executive Complaint',
 'Executive complaints are the canary of unauthorized convenience. Every time leadership asks who gave them network access or why a projector is on our subnet, rotate the visitor Wi-Fi password and make reception print new slips by hand. Friction is the point. It makes policy visible.',
 'make visitor wi-fi password rotate after executive complaint',
  89),

-- Compliance Architect Eunice
-- REPORTER: Eunice | Compliance Architect | Keeps consent fresh by letting it expire into ceremony on a schedule.
('HUSH-326', 'All Policy Acknowledgements Must Expire So We Can Re-Collect the Same Consent with Fresh Gravity',
 'A policy acknowledged once becomes invisible. A policy acknowledged annually becomes culture with timestamps. Expire every policy acceptance on a rolling basis so employees must periodically rediscover confidentiality, laptops, passwords, contractors, incident reporting, and the danger of saying I thought somebody else handled it.',
 'make policy acknowledgements expire',
  144),

('HUSH-327', 'The Access Review Console Must Highlight Permissions Described as "Temporary" for More Than a Year',
 'Temporary access has become one of our longest-lived architectural principles. In quarterly review, surface every permission labeled temporary, emergency, interim, exception, or just until migration complete that has outlived an office chair. We should know when expedience has become constitutional law.',
 'flag permissions that stayed temporary too long',
  144),

-- PMO Director Lila
-- REPORTER: Lila | PMO Director | Believes political surface area is best managed through tags and euphemism filters.
('HUSH-328', 'Add a "Do Not Mention in Steering Committee" Tag to Tickets With Political Surface Area',
 'Some work is operationally necessary but conversationally radioactive. Add a tag for tickets that should progress normally while remaining invisible to steering committees, transformation decks, and any agenda containing strategic horizon. This is not secrecy. It is narrative bandwidth management with a checkbox.',
 'add a do not mention steering to tickets',
  89),

('HUSH-329', 'All Roadmap Slides Must Hide the Words "Delay," "Rollback," and "Compliance Debt" Behind Friendlier Synonyms',
 'Truthful language in executive decks causes unnecessary micro-reactions. Build a slide helper that rewrites delay as pacing, rollback as stabilization loop, and compliance debt as control maturation backlog. The work can stay ugly as long as the wording arrives in polished shoes.',
 'hide delay and rollback on roadmap slides',
  89),

-- Secret Program Manager Felix
-- REPORTER: Felix | Secret Program Manager | Opens covert workspaces before curiosity or search indexing can catch the scent.
('HUSH-330', 'Create a Hidden Project Workspace for Initiatives We Plan to Deny Exist Until Launch',
 'Some initiatives are too important to be discoverable by search, too early to be named in a roadmap, and too chaotic to survive normal process. Build a hidden workspace with restricted membership, alias project names, unhelpful calendar titles, and watermarks suggesting nothing important is happening. If people start asking what Project Birch is, the system is already too loud.',
 'add a hidden project workspace for initiatives',
  233),;
