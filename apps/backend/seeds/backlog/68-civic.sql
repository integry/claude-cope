-- CIVIC: govtech, public portals, permits, identity checks, and bureaucratic software theater
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Digital Services Director Moira
-- REPORTER: Moira | Digital Services Director | Knows permit requests do not simply process; they enter municipal weather and may or may not come back with a stamp.
('CIVIC-1196', 'Give Permit Tracking a Weather Report Instead of a Frozen Status Badge',
 'Permit requests keep disappearing into a civic soup of handoffs, holidays, moods, and polite departmental fog. Add a municipal weather state so residents stop mistaking official stillness for a software glitch.',
 'give permit tracking a weather report',
  144),

('CIVIC-1197', 'Show Exactly Why We Need Three Documents to Prove One Tired Resident Exists',
 'Identity verification remains too comfortable with escalating document hunger while refusing to say whether it is proving personhood, address, entitlement, or just honoring a historic love of paper. Put the reason beside each upload box in plain language.',
 'show why one resident needs three documents',
  144),

-- Public Benefits PM Javier
-- REPORTER: Javier | Public Benefits PM | Has watched too many people lose support because one checkbox quietly rerouted them into administrative winter.
('CIVIC-1198', 'Warn Users When One Checkbox Is About to Ruin Their Week',
 'Eligibility forms still let mild wording confusion become accidental self-disqualification with a straight face. Add a risk warning before the interface quietly performs austerity through confidence and small boxes.',
 'warn when one checkbox ruins weeks',
  144),

('CIVIC-1199', 'Put a Little Paper Hat on Tasks That Exist Only to Prove Another Task Happened',
 'Case systems are drowning in proof-of-help work whose only purpose is to certify that help occurred somewhere nearby. Mark the ceremonial tasks so leadership can see how much time goes to residents and how much goes to feeding the record.',
 'put paper hat on proof-of-work tasks',
  144),

-- Civic Forms Architect Lena
-- REPORTER: Lena | Civic Forms Architect | Is tired of asking residents for facts the agency already knows in two databases, one PDF, and a drawer with bad tabs.
('CIVIC-1200', 'Stop Asking Residents for Facts We Already Have Somewhere Else',
 'Government forms keep re-asking for information because systems are fragmented and institutional memory always seems to live in a different office. Add anti-duplication checks before every form becomes a scavenger hunt for known facts.',
 'stop asking residents for facts twice',
  144),

('CIVIC-1201', 'Detect When Plain Language Quietly Changed the Law on the Way Down',
 'Translation and simplification are helpful right up until they turn statutory nuance into friendly nonsense that alters rights or obligations. Add meaning checks before accessibility mutates into accidental misstatement with better fonts.',
 'detect plain language rewriting the law',
  144),

-- Records Systems PM Theo
-- REPORTER: Theo | Records Systems PM | Has seen too many blank search results create tiny neighborhood conspiracy theories because the portal refuses to say whether a file is private, pending, lost, or buried in basement time.
('CIVIC-1202', 'Tell People Whether a Missing Record Is Private, Pending, or Trapped in Basement Time',
 'Residents deserve more than a blank page and growing suspicion. Add absence reasons so the search can distinguish secrecy, delay, backlog, and the sort of archival existence that is technically real and operationally mythical.',
 'tell people why records are missing',
  144),

('CIVIC-1203', 'Mark Open Data That Is Public but Still Clearly Hates You',
 'Too many datasets satisfy disclosure by technically existing while remaining hostile to everyone except specialists with scripts and emotional endurance. Score practical hostility so publication stops grading itself for just having a download button.',
 'mark open data that still hates you',
  144),

-- Resident Communications Lead Priya
-- REPORTER: Priya | Resident Communications Lead | Knows an official notice can stay polite right up until paragraph four reveals fines, deadlines, or life damage with astonishing calm.
('CIVIC-1204', 'Stop Civic Notices from Hiding the Bad News Until Paragraph Four',
 'Official messages keep burying the actual danger under several layers of neutral bureaucratic weather. Bring the risk forward before understatement starts functioning as a weapon.',
 'stop civic notices burying bad news',
  89),

('CIVIC-1205', 'Make Appointment Systems Remember That Showing Up Costs a Bus Ride, Wages, and Dignity',
 'Scheduling tools stay far too abstract about what it takes to appear in person when someone has work, childcare, transit, and the emotional overhead of a high-stakes office visit. Model the real cost before no-shows get moralized by software.',
 'make appointment systems remember transit wages and dignity',
  144),

-- Public Sector Integrations Engineer Omar
-- REPORTER: Omar | Public Sector Integrations Engineer | Knows a fast response from a mainframe often just means nothing meaningful has happened yet, only that the front desk answered quickly.
('CIVIC-1206', 'Make Fast Legacy Responses Admit They Are Only the Front Desk of a Longer Suffering',
 'Back-end systems keep returning accepted, pending, or queued in ways that sound complete to the portal and hilariously incomplete to anyone who has met the actual workflow. Add depth notes before speed keeps impersonating progress.',
 'make legacy replies mention the real suffering',
  144),

('CIVIC-1207', 'Report Cases Resolved Mainly Because the Rules Eventually Got Tired',
 'Automation engines can become so tangled with exceptions that some decisions feel less adjudicated than surrendered into after enough branch collisions. Flag the rule-exhaustion cases before they get mistaken for elegant policy execution.',
 'report cases resolved by rule exhaustion',
  144),

-- Program Equity Analyst Simone
-- REPORTER: Simone | Program Equity Analyst | Wants accessibility reviews to admit when a portal still assumes broadband, printers, weekdays, and a supernatural amount of patience.
('CIVIC-1208', 'Audit Public Portals for Real-Life Access Instead of Just Compliant HTML',
 'A portal can be technically accessible and still assume home internet, scanners, English fluency, daytime flexibility, and a tolerance for repetitive humiliation. Expand the review before markup theater keeps winning.',
 'audit portals for real-life access',
  144),

('CIVIC-1209', 'Create a Safe Procedure for Frontline Humans to Override the Machine Without Becoming the Story',
 'Workers often know when a case needs judgment or mercy and the system currently treats humane override like a necessary but punishable offense. Add protected lanes so compassion does not require private heroics and self-defense email.',
 'let frontline humans override the machine safely',
  144),

-- Chief Civic Systems Officer Petra
-- REPORTER: Petra | Chief Civic Systems Officer | Thinks any online form that still feels like standing in line indoors deserves to be labeled honestly instead of praised for having CSS.
('CIVIC-1210', 'Stamp Fake Digital Progress "Paper with Better Fonts"',
 'If the portal still makes people repeat facts, gather documents, guess statuses, and wander the same maze behind a login, it is not transformation. It is paper wearing a stylesheet. Mark it accordingly.',
 'stamp fake digital progress paper with better fonts',
  144),;
