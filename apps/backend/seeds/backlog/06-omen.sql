-- OMEN: security theater, observability dread, compliance rituals, and incident folklore
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- CISO Marianne
-- REPORTER: Marianne | CISO | Thinks trust is fine as long as it fails an entrance exam first.
('OMEN-256', 'Require Phishing Drills Before Granting Calendar Access',
 'Calendar invites have become an unregulated attack surface. Nobody should be allowed to see a meeting until they correctly identify three phishing lures, one fake Okta page, and a PDF pretending to be an expense policy. If they fail, route them to Awareness Camp and revoke lunch invites until reflection occurs.',
 'make people pass phishing drills for calendar access',
  233),

('OMEN-257', 'Every Production Incident Needs a Live Severity Theme Song and Matching Slack Emoji Pack',
 'Incidents currently arrive with neither atmosphere nor emotional coherence. Add a severity soundtrack system: brass panic for Sev 1, expensive concern for Sev 2, tasteful procurement bass for Sev 3. If the outage lasts over forty minutes, unlock a commemorative sticker so suffering leaves merch.',
 'add a live severity theme to production incident',
  144),

-- Observability Lead Janek
-- REPORTER: Janek | Observability Lead | Refuses to accept error as a sufficiently literary category.
('OMEN-258', 'Replace "Error" with Fourteen Canonical Failure Moods in Every Log Pipeline',
 'Our logs remain emotionally primitive. Error says nothing about whether the system was ashamed, confused, defiant, or operating at the edge of prophecy. Introduce canonical failure moods and make every service pick one before it writes a line.',
 'replace error with fourteen canonical failure moods',
  144),

('OMEN-259', 'All Dashboards Must Show Confidence Intervals for Whether the Service Is Lying',
 'Uptime graphs have become overconfident. Add a band to every dashboard tile showing how likely the service is to be technically green while spiritually on fire. If a dependency times out 18% of requests while claiming healthy, the graph should blush.',
 'pls add lying badge to dashboards',
  233),

-- GRC Manager Pauline
-- REPORTER: Pauline | GRC Manager | Can turn any audit request into a sacred spreadsheet with supporting folklore.
('OMEN-260', 'Build a Control Mapping Matrix That Crosswalks SOC 2, ISO, NIST, and "What Legal Meant"',
 'We currently answer audits by copy-pasting from last year and hoping the nouns still line up. Build a control crosswalk screen mapping SOC 2, ISO 27001, NIST, and whatever Legal highlighted in yellow during their espresso spiral. It should be filterable by framework, department, and confidence that the policy exists outside PowerPoint.',
 'build a control matrix for soc iso nist',
  233),

('OMEN-261', 'The Security Questionnaire Response Flow Must Require Two Humans and One Institutional Memory',
 'Sales keeps answering customer security questionnaires like speed is a virtue. Require a technical reviewer, a compliance reviewer, and somebody old enough to remember the 2023 logging incident without a wiki. If the deal slips, that is a maturity tax.',
 'block questionnaire until two humans click approve',
  144),

-- Reliability Engineer Fatima
-- REPORTER: Fatima | Reliability Engineer | Wants the status page to fail with the same realism as the rest of the company.
('OMEN-262', 'Run Chaos Drills Against the Status Page So Outages Can Misreport Themselves Properly',
 'We have chaos-tested services for years while leaving the status page dangerously honest. Run drills where it lags, contradicts itself, and cycles through passive optimism under load just like the real organization. Then we can say communications were tested end to end.',
 'run chaos drills against the status page',
  233),

('OMEN-263', 'Every Sev 1 Postmortem Must Include a "Who Believed This Was Fine" Timeline',
 'Root-cause analysis keeps focusing on servers and other mechanical distractions. Add a parallel timeline showing exactly when each person convinced themselves the smell was probably normal. Every Sev 1 deserves anthropology as well as metrics.',
 'pls add who thought this was fine timeline',
  144),

-- Threat Intel Consultant Omar
-- REPORTER: Omar | Threat Intelligence Consultant | Writes attacker plans with better prioritization than product gets.
('OMEN-264', 'Generate a Weekly Enemy Roadmap Based on Vulnerabilities We Hope Nobody Notices',
 'We keep triaging CVEs as isolated chores when they are clearly a narrative. Publish a weekly enemy roadmap describing which weak points an adversary would prioritize if they had taste, patience, and access to our Terraform. Red bullets, sinister headers, the works.',
 'generate a weekly roadmap for attackers',
  233),

('OMEN-265', 'All Secrets Must Rotate Whenever an Executive Says "Single Source of Truth"',
 'Single source of truth has become a predictive indicator. Whenever an executive says it in a meeting, trigger secret rotation so the infrastructure can defend itself from managerial certainty in real time. It is cheaper than therapy and easier to automate.',
 'rotate secrets whenever executives say truth',
  144),

-- Audit Platform PM Elise
-- REPORTER: Elise | Audit Platform PM | Knows evidence gets taken more seriously when the fonts look regulated.
('OMEN-266', 'The Audit Log Viewer Must Have a "Convincing Enough for Regulators" Toggle',
 'Engineers keep asking what the audit log is for, which means we have not branded it properly. Add a mode switch for internal, customer, and regulator views. The data can stay baffling as long as the typography and timestamp density become audience-aware.',
 'add a convincing enough regulators toggle',
  144),

-- SOC Manager Glenn
-- REPORTER: Glenn | SOC Manager | Wants every alert scored for whether it might become a LinkedIn apology post.
('OMEN-267', 'All Alerts Must Escalate Through a "Could This Be Headlines?" Classifier First',
 'Our alerts are technically descriptive but narratively underpowered. Score each one for headline potential before paging anybody. If the answer is yes, jump to the scary rotation and invite Legal before the graph finishes loading.',
 'route alerts through a PR disaster classifier',
  233),

('OMEN-268', 'Build a Shared Inbox for Customer Reports of "Something Weird" and Treat It Like Telemetry',
 'Customers often notice problems before dashboards do, but their phrasing lacks enterprise formatting. Create an inbox for reports like the app feels cursed, deduplicate them, score them, and plot them beside metrics. If five users say weird at once, that is distributed sensing.',
 'build shared inbox for weird customer reports',
  144),

-- Privacy Counsel Renee
-- REPORTER: Renee | Privacy Counsel | Specializes in dropdown confidence and export-button guilt.
('OMEN-269', 'Add a Data Residency Selector That Changes Nothing but Greatly Improves Call Outcomes',
 'Prospects keep asking where data lives, and apparently around is not acceptable. Add a residency selector with flags, region names, and tasteful confidence even if the storage story stays spiritually centralized for another quarter. The dropdown can carry the burden of trust.',
 'add a fake data residency selector',
  233),

('OMEN-270', 'Every Export Button Must Ask Whether the User Intends to Create Future Discovery Risk',
 'Data export is too frictionless for something that can later become evidence. Before any CSV, JSON dump, or PDF leaves the system, ask whether the user intends to create future discovery risk or an attachment chain that ruins somebody''s quarter. The point is not to stop them. The point is to make download feel faintly indictable.',
 'add legal conscience popup before data exports',
  138),;
