-- CLINIC: healthcare software, medtech workflows, patient portals, and compliance-grade misery
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Clinical Systems Director Mara
-- REPORTER: Mara | Clinical Systems Director | Has watched too many patient portals turn harmless lab variance into a midnight panic event with decimal places.
('CLINIC-1181', 'Stop the Patient Portal from Turning Mild Lab Noise into 1 AM Doom',
 'Results are reaching patients with too little context and too much immediate numerical intimacy. Add release guardrails before benign variance keeps arriving like a medically branded jump scare.',
 'stop patient portals turning labs into doom',
  144),

('CLINIC-1182', 'Add a Workflow State for "The Referral Exists but Nobody Will Admit Ownership Yet"',
 'Referral scheduling keeps disappearing into the haunted middle zone where the paperwork moved, the responsibility did not, and the patient is now calling three polite departments in a loop. Name the limbo so we can stop reenacting it by phone.',
 'add workflow state for orphaned referrals',
  144),

-- EHR Integration PM Dev
-- REPORTER: Dev | EHR Integration PM | Has learned that an HL7 message can be perfectly valid, clinically useful, and spiritually deranged all at once.
('CLINIC-1183', 'Teach HL7 Parsing the Difference Between Valid and Completely Unhinged',
 'Healthcare interfaces keep proving that standards compliance is not the same thing as sanity. Add derangement detection before the pipeline keeps treating structurally valid nonsense like a respectable clinical citizen.',
 'teach hl7 parsing valid versus unhinged',
  144),

('CLINIC-1184', 'Stop Calling Fax-Shaped Voids "Delayed Orders"',
 'Some orders are not delayed. They fell through a corridor of printouts, attachments, handoffs, and one legendary office machine no one has emotionally retired. Split the status before missing care steps keep hiding behind polite timing words.',
 'stop calling fax-shaped voids delayed orders',
  144),

-- Patient Experience Lead Elise
-- REPORTER: Elise | Patient Experience Lead | Knows a healthcare reminder can land like a simple nudge or a tiny medically licensed existential check-in depending on the wording.
('CLINIC-1185', 'Stop Appointment Reminders from Sounding Like the Hospital Is Checking Whether You Still Exist',
 'Reminder language is too neutral for contexts involving care, fasting, follow-up, and fear. Tune the wording before patient outreach starts sounding like soft medical surveillance with a calendar link.',
 'stop appointment reminders sounding like mortality checks',
  144),

('CLINIC-1186', 'Separate Medical Charges from Administrative Fan Fiction',
 'Patient billing keeps bundling actual care with insurer theater, coding weather, and line items nobody outside the back office could explain soberly. Split the categories before the portal becomes a financial hallucination engine.',
 'separate medical charges from administrative fan fiction',
  144),

-- Med Device Software Architect Jonas
-- REPORTER: Jonas | Med Device Software Architect | Is begging sensors, batteries, and leads to stop behaving like dramatic coworkers in rooms where actual patients are trying to heal.
('CLINIC-1187', 'Teach Device Alerts the Difference Between Patient Danger and Hardware Drama',
 'Alarm fatigue happens when every fragile sensor episode gets billed like an emergency. Add a melodrama class before clinical staff lose the ability to tell a real problem from one offended component with a battery issue.',
 'teach device alerts danger versus hardware drama',
  144),

('CLINIC-1188', 'Stop OTA Updates from Teaching Regulators New Vocabulary by Accident',
 'Over-the-air updates in medical hardware should not create new categories of regulatory concern through surprise. Add novelty screening before the release notes accidentally become a curriculum for the FDA.',
 'stop ota updates teaching regulators new words',
  144),

-- Care Analytics PM Sofia
-- REPORTER: Sofia | Care Analytics PM | Keeps reminding models that some patients are administratively intense because the system trained them that way, not because their health is collapsing.
('CLINIC-1189', 'Stop Treating Bureaucratically Skilled Patients as Medically Deteriorating',
 'Portal messages, refill requests, and reschedules can reflect persistence and system fluency just as easily as clinical decline. Refine the model before paperwork stamina keeps getting mistaken for worsening health.',
 'stop treating bureaucratically skilled patients as medically deteriorating',
  144),

('CLINIC-1190', 'Detect Population Programs That Succeed Mostly by Renaming Concern',
 'Some cohorts only look stable because the system got very good at meetings, terminology, and reporting rituals that make ongoing mess feel managed. Add a check before language keeps outscoring outcomes.',
 'detect programs succeeding by renaming concern',
  144),

-- Clinical Documentation Systems Lead Priya
-- REPORTER: Priya | Clinical Documentation Systems Lead | Has seen enough chart templates to know a note can become a legal mattress stuffed with boilerplate and still fail to mention whether the patient has knees.
('CLINIC-1191', 'Compress Clinical Note Bloat Until Humans Can Find the Patient Again',
 'Template sprawl now produces notes that bury anatomy, narrative, and relevance under imported history and regulatory bedding. Add compression before clinicians have to spelunk for basic facts.',
 'compress note bloat until patients reappear',
  144),

('CLINIC-1192', 'Warn When Smart Phrases Are About to Create Suspiciously Detailed Fiction',
 'Documentation shortcuts save time right up until they produce records that sound deeply observed even though half the detail came from defaults and carry-forward optimism. Add a warning before chart speed becomes narrative fraud.',
 'warn when smart phrases create detailed fiction',
  144),

-- Compliance Programs Manager Luca
-- REPORTER: Luca | Compliance Programs Manager | Is tired of audit trails proving that a click happened while saying absolutely nothing about whether anyone involved understood what they had just done.
('CLINIC-1193', 'Split Audit Logs into "This Happened" and "Anyone Actually Understood It"',
 'Regulated systems are excellent at recording motion and much worse at proving comprehension. Add understanding markers before audit keeps certifying choreography as care.',
 'split audit logs into happened or understood',
  144),

('CLINIC-1194', 'Flag Access Requests That Expanded Because Someone Yelled Loudly Enough',
 'Privacy decisions keep starting in principle and ending in urgency, familiar names, and calendar pressure. Flag the requests where access scope grew because volume beat policy.',
 'flag access requests that expanded',
  144),

-- Chief Clinical Software Officer Petra
-- REPORTER: Petra | Chief Clinical Software Officer | Wants the software to admit when it is taking longer than the actual appointment and has crossed from care support into clerical fan fiction.
('CLINIC-1195', 'Flash a Warning When the Computer Takes Longer Than the Patient',
 'If charting, coding, documenting, and reconfirming outlast the encounter itself, the workflow should stop pretending this is care delivery. Put up the warning before administrative fiction fully replaces medicine.',
 'warn when computers outwait patients',
  144),;
