-- CLASS: edtech, LMS, rosters, grade sync, parent portals, and scholastic software pain
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- LMS Platform Lead Erica
-- REPORTER: Erica | LMS Platform Lead | Knows district CSVs arrive looking like they were assembled under fluorescent panic by people who no longer believe in summer.
('CLASS-1151', 'Harden Roster Sync Against District CSVs Written During Enrollment Panic',
 'Roster files keep arriving with duplicate students, moving columns, half-merged guardians, and local schedule logic nobody outside one office could love. Build for the despair, not the spec.',
 'harden roster sync against panic csvs',
  144),

('CLASS-1152', 'Stop Asking Parents to Infer Meaning from Gradebook Fog',
 'Missing, exempt, late, resubmitted, pending, and somehow still not final keep getting flattened into percentages and panic. Separate the states clearly before the portal turns normal grading ambiguity into household weather.',
 'stop making parents infer gradebook fog',
  144),

-- Student Data PM Julian
-- REPORTER: Julian | Student Data PM | Has watched too many family dinners get ruined by one red badge generated from a temporary worksheet wobble.
('CLASS-1153', 'Slow the Parent-Portal Panic Before One Missing Worksheet Starts a Family Incident',
 'Parent notifications remain far too eager to turn small classroom fluctuations into domestic emergencies. Add some damping before one temporary assignment gap becomes a 7:00 p.m. crisis with screenshots.',
 'slow parent-portal panic down',
  144),

('CLASS-1154', 'Teach SIS Sync the Difference Between a Changed ID and an ID That Was Never Stable',
 'School records move through the year with the serene chaos of forms, schedules, names, guardians, and local identifiers all being revised by different humans at different speeds. Split deliberate change from routine turbulence before sync keeps acting shocked by school being school.',
 'teach sis sync changed ids vs cursed ids',
  144),

-- Assessment Platform Architect Mei
-- REPORTER: Mei | Assessment Platform Architect | Designs test delivery for computer labs where the hardware is old, the stakes are high, and hope has already been partially uninstalled.
('CLASS-1155', 'Build a Low-Hope Mode for Standardized Testing on Old Lab Machines',
 'Assessment software still assumes stable browsers, clean audio, and decent hardware in rooms full of underfunded rectangles and educational pressure. Add a degrade-with-dignity mode before the next exam scandal gets coauthored by aging desktops.',
 'build low-hope mode for old lab tests',
  144),

('CLASS-1156', 'Stop Proctoring Software from Treating Awkward Teenagers Like Master Criminals',
 'Automated proctoring remains absurdly confident that bad lighting, family movement, muttering, and strange posture are signs of elaborate academic fraud instead of adolescence plus webcams. Calm the suspicion model down.',
 'stop proctoring software treating teens like criminals',
  144),

-- Classroom Experience Lead Tomas
-- REPORTER: Tomas | Classroom Experience Lead | Has seen enough digital assignments to know exactly when a teacher has rebuilt paper by hand inside software and somehow made it slower.
('CLASS-1157', 'Warn When an Assignment Would Honestly Work Better on Paper',
 'The platform keeps enabling ornate workflows whose rubric count, attachment sprawl, and comment choreography strongly suggest paper once handled this with more dignity. Surface that before complexity hardens into curriculum.',
 'warn when assignments belong on paper',
  89),

('CLASS-1158', 'Detect When Students Are Performing Agreement for a Grade',
 'Discussion boards fill up with polite nodding, cautious enthusiasm, and the unmistakable tone of people writing what earns points rather than what extends thought. Flag the graded consensus theater before everyone starts calling it discourse.',
 'detect students faking agreement for grades',
  89),

-- Learning Analytics Director Priya
-- REPORTER: Priya | Learning Analytics Director | Is tired of dashboards that confuse logging in, clicking buttons, and surviving the LMS with actual understanding.
('CLASS-1159', 'Split Learning Progress from Mere Software Compliance',
 'Too many dashboards reward clicks, logins, submissions, and page views as though these are interchangeable with comprehension. Draw the line before the platform starts teaching that obedience is the same as learning.',
 'split learning progress from mere software compliance',
  144),

('CLASS-1160', 'Stop Flagging Quiet Students Just Because They Do Not Perform for Analytics',
 'Risk models overreact to low platform drama and underreact to the possibility that a student might be competent, busy, offline, or just uninterested in narrating diligence for the system. Tone it down before silence keeps getting treated like collapse.',
 'stop flagging quiet students as broken',
  144),

-- District Partnerships PM Celeste
-- REPORTER: Celeste | District Partnerships PM | Understands that for many institutions Excel remains the last sacred format because it can be printed, sorted, highlighted, and defended in a room full of worried adults.
('CLASS-1161', 'Keep an Excel Path Alive for Districts That Trust Spreadsheets More Than Software',
 'No matter how elegant our APIs get, there will always be a district administrator who trusts only a spreadsheet they can sort, print, and rescue by hand. Respect the spreadsheet faith.',
 'keep excel path for spreadsheet loving districts',
  89),

('CLASS-1162', 'Flag Parent Messages That Read More Like Guilt Manufacturing Than Information',
 'School-home communication can help or quietly manufacture anxiety at scale depending on cadence, tone, and how much ordinary classroom mess gets escalated into red-dot concern. Flag the messages that stop informing and start guilting.',
 'flag parent messages manufacturing guilt',
  144),

-- Accessibility in Education Lead Noor
-- REPORTER: Noor | Accessibility in Education Lead | Is done making students drag the same documented needs through one new administrative obstacle course every semester.
('CLASS-1163', 'Stop Making Students Re-Prove the Same Reality Every Semester',
 'Accommodation workflows keep asking for fresh explanations of needs the institution already knows about. Add continuity protections before process appetite keeps treating disabled students like recurring paperwork prompts.',
 'stop making students re-prove reality',
  144),

('CLASS-1164', 'Flag Lessons Where Text-to-Speech Is Clearly Doing the Teaching',
 'Sometimes accessibility tools expand access to good content. Sometimes they rescue material from terrible formatting and suspiciously hostile pedagogy. Flag the lessons where support features are doing the real educational labor.',
 'flag lessons where text-to-speech teaches',
  89),

-- Chief Academic Systems Officer Petra
-- REPORTER: Petra | Chief Academic Systems Officer | Wants one honest number showing whether the software supports learning or merely organizes exhaustion more efficiently.
('CLASS-1165', 'Show a Burnout Warning When Usage Goes Up but Teachers Are Clearly Drowning',
 'The platform should stop celebrating adoption if every gain comes with more parent confusion, grade-chasing, accommodation drift, and teacher cleanup work. Add a burnout warning before usage charts keep mistaking strain for success.',
 'warn when usage rises and teachers drown',
  144),;
