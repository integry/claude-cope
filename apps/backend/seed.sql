-- =============================================================================
-- Community Backlog Seed Data
-- =============================================================================
-- Generated from apps/backend/seeds/backlog/*.sql
-- Do not hand-edit this file. Update the themed seed fragments instead.
--
-- Usage (local):
--   wrangler d1 execute claude-cope-db --local --file=apps/backend/seed.sql
--
-- Usage (remote / production):
--   wrangler d1 execute claude-cope-db --remote --yes --file=apps/backend/seed.sql
-- =============================================================================

-- YELL: office politics, product delusions, and general workplace sabotage
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- REPORTER: Karen | HR | Turns copy changes into compliance theater and printable certificates.
('YELL-001', 'Mandatory Fun Button Must Require Manager Approval Workflow',
 'Trevor celebrated too aggressively after closing the copier paper budget, so the People Team now requires reflection before joy. The Celebrate button must open a form, route through Marisol in Benefits, wait 48 hours, and then release only a tasteful amount of confetti. We already bought a locked acrylic Recognition Ledger for the front desk, so every approved burst of fun also needs a printed receipt.',
 'make fun button need manager approval',
  34),

('YELL-002', 'Re: language in the app is creating a hostile feelings environment',
 'A new hire sent HR a screenshot of "Invalid password" with three crying-face emojis. We cannot have software using absolute language. Replace "fail" with "took a learning path," "reject" with "declined to connect right now," and "invalid" with "not aligned with our shared truth." The message-tone calibration workshop is at 2 PM, so the gaslighting needs to be live before lunch.',
 'pls make error messages sound nicer',
  34),

('YELL-003', 'Implement Mandatory Sensitivity Training Module Before Git Push',
 'Someone pushed a commit titled "kill zombie workers" and Legal has that screenshot now. Until we calm them down, every git push must be preceded by the Respectful Verbs Learning Module, including the buffering quiz section and the part where you drag "deprecate" into the "kind alternatives" bucket. Please do not tell engineers who suggested the printable certificate.',
 'add mandatory sensitivity training to git push',
  55),

-- REPORTER: Anthony | VP of Sales | Believes every interface is one popup away from pipeline.
('YELL-004', 'Add "Close Deal" Button to Every Single Page',
 'I came back from Dreamforce with a branded duffel bag, six unearned convictions, and one clear mandate: every screen is now a selling opportunity. Put a giant green "CLOSE DEAL" button on all pages, including logout, 404, and any modal that currently wastes space on "context." Design already printed 800 foam finger stickers that say ALWAYS BE CLICKING, so the UI needs to honor the merch by Friday.',
 'add close deal button to every single page',
  21),

('YELL-005', 'Pipeline Dashboard Must Show Revenue in Real-Time with Fireworks',
 'Brad from Austin called stale numbers "close enough" in the board room and that triggered what my coach calls a revenue panic. Five-minute refreshes are for museums. If Denise in Chicago sneezes on a contract, I want the total to twitch instantly. A 72-inch leaderboard TV is already on the way to Brad''s office.',
 'make dashboard numbers update instantly with fireworks',
  89),

('YELL-006', 'Integrate CRM with the Coffee Machine for Lead Scoring',
 'When a prospect opens our email, the office coffee machine must start brewing automatically so the SDR team is CAFFEINATED and READY TO DIAL. The IoT espresso machine is already in the break room. Engineering called it a fire hazard. Sales called lack of pipeline a revenue hazard.',
 'integrate salesforce with the office coffee machine',
  55),

-- REPORTER: Greg | Enterprise Architect | Sees bounded contexts where others see buttons.
('YELL-007', 'Rewrite Login Page Using Event-Sourced CQRS Microservices',
 'One form posting to one endpoint is emotionally monolithic. I have redesigned login as a choreography of 14 bounded contexts, plus a tiny service called Greg Jr. that only emits a LoginAttemptConsidered event. Do not simplify this. I already booked catering for the architecture review and the sandwich labels mention CQRS by name.',
 'bro rewrite login using cqrs microservices',
  144),

('YELL-008', 'All Database Queries Must Go Through a GraphQL-to-REST-to-gRPC Translation Layer',
 'Direct database access has become too legible. Legibility invites shortcuts. Every query should begin life as GraphQL, mature into REST, discover itself as gRPC, and only then earn the right to become SQL. The laminated Abstraction Maturity Ladder is already by the espresso machine. If "SELECT 1" starts to feel like air traffic control, the architecture is finally honest.',
 'put all database queries through extra layers',
  233),

('YELL-009', 'Implement Blockchain-Based Code Review Approval System',
 'Code review is a supply chain now. Every thumbs-up needs a wallet signature, a block explorer link, and a ceremonial hash reading during the release meeting. Finance has already asked whether rejected PRs can be treated as burned assets, which tells me this initiative is ready.',
 'add blockchain-based code review approval system',
  377),

-- REPORTER: Linda | Compliance | Can turn a checkbox into a twelve-page legal pilgrimage.
('YELL-010', 'Every Button Click Must Generate an Audit Trail with Notarized Timestamps',
 'Legal redacted the source document into black rectangles, but I could still read "demonstrable click intent" seven times. Effective immediately, every click, hover, scroll, tab switch, and suspicious pause near a destructive button needs an immutable audit entry with a notarized timestamp. Procurement already approved a vendor called TimeStampNowNow, and Kevin keeps calling me, so this now has to become software.',
 'log every button click forever',
  89),

('YELL-011', 'Cookie Banner Must Require a 12-Page Consent Form Signed in Triplicate',
 'On Tuesday I told a regulator our cookie controls were "robust." They are currently two buttons and a shrug. I need a consent journey that looks expensive: twelve pages, initials on every paragraph, one ID upload, and a final checkbox confirming the user understands what a preference center is. If they reject all, add a textbox for their reasoning because Trust Objections Master already exists.',
 'make cookie banner way more intense',
  89),

('YELL-012', 'Implement Data Retention Policy That Deletes Everything After 30 Seconds',
 'I told the privacy council we were piloting "ephemeral stewardship" and unfortunately nobody challenged me. Effective immediately, every record should self-destruct before discovery requests, customer confusion, or ordinary continuity can attach to it. Records Sunset Wave 1 already exists in SharePoint, so the software now needs the lifespan of a mayfly.',
 'delete all data after 30 seconds',
  55),

-- REPORTER: Dave | DevOps | Optimizes deployment schedules around lunch and emotional rhythm.
('YELL-013', 'The CI Pipeline Must Take Exactly 47 Minutes — No More, No Less',
 'Someone sped CI up to 18 minutes and staging deployed while I was reheating baked ziti. We had a rhythm. I need the pipeline back at its blessed 47-minute window so I can finish coffee, leftovers, and one full doomscroll through release notes without surprise notifications. The timing spreadsheet on my second monitor is color-coded for a reason.',
 'pls make ci take exactly 47 minutes',
  34),

('YELL-014', 'All Production Deployments Must Happen at 4:59 PM on Fridays',
 'Leadership saw one midweek deploy go smoothly and drew the wrong lesson. Smoothness breeds complacency. Production changes must go out at 4:59 PM on Fridays when the team is spiritually aerodynamic and the blast radius can fully express itself before Monday. The laminated Weekend Confidence Drill is already waiting by the war room TV.',
 'make deploy button only work on fridays',
  34),

('YELL-015', 'Replace All Monitoring with a Single Bash Script Named "vibes.sh"',
 'Finance wants observability savings and I have a lean proposal. My script, vibes.sh, curls the homepage, checks whether the HTML still contains the word "Welcome," and logs either "green aura" or "concerning aura" to a text file on my desktop. The file is called definitive_health_signal.log, which should tell everyone this is not a prototype. If we standardize on my laptop staying awake, half the tooling can retire this quarter.',
 'replace all monitoring with a single bash script',
  21),

-- REPORTER: Brenda | Platform Governance | Thinks naming is policy and spontaneity is a security flaw.
('YELL-016', 'All Variable Names Must Be Pre-Approved by the Naming Committee',
 'Procurement has already paid for the premium Google Forms add-on, so we need to justify the spend. Effective Monday, all variable names must be submitted to the Variable Naming Standards Committee with supporting rationale, linguistic origin, and two fallback options in case "sessionId" is deemed too hasty. Someone used "temp" in a migration script and governance still hasn''t recovered.',
 'write a linter for committee approved variables',
  55),

('YELL-017', 'Implement a Ticketing System for Our Ticketing System',
 'People are creating Jira tickets with appalling spontaneity. We now need an intake portal before the intake portal. Operations already printed lanyards for the Request-to-Ticket pilot and they say Ask Me About My RTT, so there is no going back. Build a pre-ticket workflow with sponsor references, expected ROI, and a checkbox confirming the requester sat quietly with the need for 24 hours.',
 'add ticket precheck system',
  34),

-- REPORTER: Pam | Passive-Aggressive PM | Treats UX discomfort like a cross-functional spiritual misalignment.
('YELL-018', 'Per My Last Slack Message: The Dashboard Still Doesn''t Spark Joy',
 'Following up on the Slack, the email, and the printed deck left on three chairs: the dashboard still feels spiritually cluttered. This is less a bug than a relational failure between our metrics and the people forced to look at them. Each widget now needs an emotional-resonance review, starting with the funnel chart Todd called "kind of loud."',
 'delete dashboard widgets randomly to spark joy',
  34),

('YELL-019', 'Rename "Delete" to "Archive" to "Soft Archive" to "Intention to Maybe Remove Later"',
 'A customer used the phrase "emotionally ambushed by the trash icon" and now nobody can unhear it. Nothing in the product should sound like it has agency over another adult''s data. Replace hard verbs with a gentler sequence that suggests possibility, reflection, and a tasteful pause. By the end, nobody should be able to prove which click actually removed the thing.',
 'rename delete to something way softer',
  34),

('YELL-020', 'The Loading Spinner Must Gaslight Users About Wait Times',
 'For ethics reasons, let''s call this expectation choreography. The spinner should never admit the real wait. If the job takes 10 seconds, the UI should keep projecting confidence: "Almost there," "Just polishing things," "Great choice, one moment." The point is not factual timing. It is emotional tempo.',
 'rotate three reassuring status lines on a timer',
  21),

-- REPORTER: Tyler | Intern | Confuses confidence, YouTube, and root access with equal enthusiasm.
('YELL-021', 'Rewrite Backend in Rust (P0 Issue)',
 'I watched a 12-minute video about memory safety and honestly I think we should rewrite the backend. Node.js has "garbage collection," which sounds toxic. Rust does not. I already mass-renamed all .js files to .rs. Nothing compiles, but that is a config issue and therefore someone else''s personality.',
 'bro rewrite backend in rust fast',
  610),

('YELL-022', 'Replace the Database with a JSON File I Keep on My Desktop',
 'I found a simpler persistence layer and it is my Desktop. PostgreSQL keeps asking for backups and replication and ownership, whereas real-data-final-v2.json just sits there and cooperates. It is pinned in Finder, which makes it basically highly available. If something goes wrong, disaster recovery is just duplicate-file naming with more confidence.',
 'bro replace database with my desktop json',
  89),

('YELL-023', 'I Accidentally Deleted the Production Database and Need Help Undeleting It',
 'Funny story: I was cleaning up my local dev database and may have run DROP TABLE users on production because both terminal windows looked the same. Is there a Ctrl+Z for databases? Please do not tell management. They are still upset about the JSON file thing.',
 'i deleted prod db help',
  987),

-- REPORTER: Margaret | CFO | Wants every packet to survive an accounting audit and a budget review.
('YELL-024', 'All API Calls Must Include a Cost Center Code and Purchase Order Number',
 'During the budget review I described our API layer as "chargeback ready" and that phrase has now escaped containment. Every request needs enough finance metadata to survive a stern glance from Accounts Payable: cost center, purchase order, approver initials, maybe a project code if the caller feels premium. Make the packets look billable before someone asks for a demo and I have to improvise accounting theology.',
 'add cost center codes to api calls',
  89),

('YELL-025', 'Implement a Metered Billing System for Internal Microservice Communication',
 'I spent lunch with a transfer-pricing consultant named Neal who ruined my week. He says our internal services are "economically silent," which apparently means we''re leaving accountability on the table. Effective next quarter, Auth should bill User, User should bill Reporting, and any team that exceeds its RPC allowance should receive a firm but tasteful overage notice. Mock invoices are already printed on cream paper.',
 'bill teams for microservice calls',
  144),

-- REPORTER: Steve | Security | Thinks inconvenience is just authentication with standards.
('YELL-026', 'All Passwords Must Be Exactly 128 Characters and Changed Every 4 Hours',
 'Threat model update: my cousin''s roommate works at a bank and says attackers now expect people to have memorable passwords. We cannot be predictable. New standard is exactly 128 characters, minimum three emojis, two Cyrillic characters, one seasonal reference, and a haiku that does not rhyme. Rotation every 4 hours. Forgotten password flow should feel like entering witness protection.',
 'make passwords 128 chars and miserable',
  89),

('YELL-027', 'Encrypt All Console.log Statements in Case Hackers Read Our Logs',
 'During a vendor walkthrough I noticed our logs contain nouns, verbs, and enough narrative structure to help an attacker form opinions. Unacceptable. Every log line should resemble a diplomatic cable intercepted in a snowstorm. The SOC can keep the decryption key on a smart card in the red drawer by the printer, assuming anyone remembers which printer.',
 'encrypt all console logs just in case',
  55),

('YELL-028', 'The Login Page Must Include a CAPTCHA, a Riddle, and a Blood Oath',
 'A vendor used the phrase "multimodal sincerity" and now login needs four gates: standard CAPTCHA, rotating fantasy-themed riddle, legally alarming oath checkbox, and a webcam stare-down long enough for a model to decide whether the user blinks like a mammal. If that sounds theatrical, it is because the vendor literally called it a trust ceremony.',
 'add captcha riddle and blood oath login',
  55),

-- REPORTER: Deborah | QA Lead | Wants tests, bug reports, and feelings all formally documented.
('YELL-029', 'Every Unit Test Must Also Pass a Vibe Check from the QA Team',
 'Postmortem note: we shipped a technically correct feature that still felt cursed. Numbers passed, screenshots passed, but the whole thing had hallway energy. Going forward, test suites need a final human review where QA reads the assertions aloud and confirms they do not produce dread. If a suite feels brittle, haunted, or too pleased with itself, it fails as VIBES_FAILED.',
 'make unit tests pass a vibe check',
  34),

('YELL-030', 'The Test Suite Must Achieve 100% Code Coverage Including Comments',
 'I printed the 94% coverage report and passed it around triage like a crime scene photo. We are not done until there are no dark corners left. If a comment says "temporary hack," I want a unit test proving the workaround knows how ashamed it should feel. The dashboard should look less like engineering and more like a notarized confession.',
 'get test coverage to 100 percent',
  89),

('YELL-031', 'All Bug Reports Must Include a Haiku Describing the Emotional Impact',
 'Bug reports are factually useful but emotionally evasive. That makes triage harder. Effective immediately, every report must include a haiku so Engineering understands not just what broke, but what it did to a person''s afternoon. Support already cried over the staging logout example, which proves the framework works.',
 'make bug reports include a sad haiku',
  21),

-- REPORTER: Chad | Visionary CEO | Treats personal inconvenience as market research and product strategy.
('YELL-032', 'Pivot the Entire Product to AI Blockchain Metaverse by End of Sprint',
 'This is confidential until the keynote, which is awkward because the keynote is in nine hours. I promised investors we are no longer a workflow product; we are now an AI-guided trust fabric for sustainable digital presence. Do not get hung up on the nouns. The blue gradient tested beautifully. Please make the software catch up with the sentence before the backdrop arrives.',
 'pivot the whole product to ai blockchain',
  610),

('YELL-033', 'The App Must Work on My Specific Phone Which I Dropped in a Hot Tub',
 'My personal device remains the clearest proxy for the market, even though it spent part of last weekend under chlorinated water beside three board members and a tray of sliders. The screen is fractured, brightness changes on its own, and one corner only responds if pressed with a hotel pen. If the app cannot flourish on this phone, we are failing premium users who also lead adventurous lives.',
 'pls make app work on ceo phone',
  34),

('YELL-034', 'Make the Logo Bigger and Also Smaller at the Same Time',
 'The app was shown to my wife''s cousin who "does design" and she said the logo should be bigger. Design said smaller. It now needs to be both. If pulse animation is the only path to peace, then the logo must breathe like a nervous little monarch.',
 'make the logo bigger and smaller',
  13),

-- REPORTER: Janet | Scrum Master | Believes all work deserves more ritual and louder narration.
('YELL-035', 'Every Code Change Must Be Discussed in a 90-Minute Refinement Ceremony',
 'A one-line CSS fix merged without proper ceremony and I''m still recovering. Code should not simply appear; it should arrive after refinement, estimation, alignment, and a brief check that the alignment felt aligned. Conference Room Dignity is already reserved every afternoon this month.',
 'block git push until calendar invite exists',
  55),

('YELL-036', 'Implement a Standup Bot That Generates Standup Updates Using AI',
 'Verbal minimalism has infected standup and the ritual will not collapse into shrugging on my watch. Build a bot that reads commits, ticket moves, and Slack apologies, then drafts updates with enough narrative momentum to justify why everyone opened Zoom. If an engineer changed one semicolon, the bot should still find the arc.',
 'add an ai standup bot',
  21),

('YELL-037', 'The Sprint Must Have a Theme Song That Plays During Deployments',
 'Each sprint now has an official theme song voted on during planning. The song must play at full volume through all office speakers during production deployments. If the deploy fails, the song switches to a sad trombone. Agile Anthems already exists.',
 'play a theme song during deploys',
  13),

-- REPORTER: Raj | Transformation Consultant | Can replace any product with a deck and a more expensive problem.
('YELL-038', 'Replace All In-House Code with a SaaS Platform That Does 10% of What We Need',
 'After 6 weeks of analysis, we recommend replacing the custom platform with an enterprise SaaS tool that costs $400K/year and handles 10% of the use cases. The other 90% can be managed through Excel spreadsheets and "process changes." There is a 200-slide deck if anyone needs to feel this more slowly.',
 'replace all in-house code with a saas platform',
  377),

('YELL-039', 'Organizational Restructure: Every Engineer Reports to a Different PM',
 'We completed a listening tour and identified a dangerous amount of direct engineer-to-engineer understanding. That level of lateral efficiency is suppressing stakeholder surface area. Every engineer now gets a dedicated PM interface, and any cross-team clarification must travel by memo so accountability leaves footprints. The org chart will look like a transit map, which boards tend to respect.',
 'make every engineer report to a pm',
  233),

-- REPORTER: Bob | Backend Engineer | Would rather falsify uptime than lose another night to alerts.
('YELL-040', 'The API Must Return 200 OK for Everything Including Server Fires',
 'Monitoring keeps alerting on 500 errors and it is waking me up at night. Simple fix: return 200 OK for everything. Actual errors can be communicated via a secret_status field buried in the JSON response that only the frontend knows to check. The monitoring system will show 100% uptime, which is the kind of peace charts were invented for.',
 'pls make api return 200 for everything',
  55),

('YELL-041', 'All Endpoints Must Accept Both JSON and Microsoft Excel Spreadsheets',
 'The sales team already lives in spreadsheets, so insisting on JSON is basically anti-revenue. Every endpoint should accept either proper JSON or an Excel workbook with tabs named FINAL, FINAL_FINAL, and use-this-one. If a workbook includes formulas, we should honor the author''s intent and execute them.',
 'make api accept excel files too',
  89),

-- REPORTER: Zoe | UX Designer | Will trade usability for theatrical intention without blinking.
('YELL-042', 'The Entire App Must Be Navigable Using Only Interpretive Dance',
 'A workshop on Embodied Interaction Design convinced me that mouse and keyboard are limiting our users. The app must support webcam-based gesture controls. A wide arm sweep scrolls the page. A head tilt opens the menu. Jumping triggers refresh. For accessibility, aggressive sighing now counts as input.',
 'hook up webcam api for gesture navigation',
  144),

('YELL-043', 'All Buttons Must Have a 3-Second Hover Animation Before They Become Clickable',
 'The usability study revealed that users keep activating buttons before they have properly metabolized the visual language. That is not efficiency, that is grazing. Every primary action should spend three full seconds unfolding itself like a tiny stage performance before it agrees to be clicked. If the pointer leaves early, the bloom begins again.',
 'make buttons wait 3 seconds',
  34),

('YELL-044', 'Replace All Text with Emojis Because "Gen Z Doesn''t Read"',
 'Research says Gen Z users "don''t read." All text in the app must now be replaced with emoji sequences. "Submit Order" becomes "📦✅🚀". "Delete Account" becomes "🗑️😱💀". Error messages are a sad-face escalation ladder. The help docs will provide a Rosetta Stone, also in emoji.',
 'replace all text with emojis',
  55),

-- REPORTER: Larry | Legal | Wants every click to hesitate in writing before doing anything interesting.
('YELL-045', 'Every Feature Must Have Its Own Terms of Service',
 'We made a classic mistake by governing the product generally instead of specifically. Search should not rely on the same legal instrument as CSV export or profile photo upload. Each feature deserves its own moment of informed hesitation. I already started a folder of micro-agreements and the search bar alone is showing real doctrinal potential. Turn ordinary usage into a staircase of tiny waivers before Legal discovers how broad the current language is.',
 'give every feature its own terms page',
  233),

('YELL-046', 'The "Share" Button Must Include a 47-Page Liability Waiver',
 'The share feature lets users send content to other humans without a liability waiver. What if they share something embarrassing? What if the recipient is offended? What if the content becomes sentient? We need a waiver covering emotional distress, existential dread, and interdimensional data leakage before anyone shares a link ever again.',
 'put a waiver behind the share button',
  89),

-- REPORTER: Diana | Data Scientist | Prefers predictive dashboards and experiments to evidence and restraint.
('YELL-047', 'We Need an ML Model to Predict Which Features Users Will Request Before They Request Them',
 'A model trained on 6 years of Jira tickets can now predict feature requests 3 sprints before users ask for them. Accuracy is currently 7%, but that just means the vision is early. Until GPU budget improves, product should build whatever the model hallucinates first. Current top prediction: users want a teleport button. Confidence: 0.03.',
 'predict feature requests before users ask',
  233),

('YELL-048', 'A/B Test Everything Including the A/B Testing Framework Itself',
 'We''re not A/B testing enough. Every element should be in a test: button colors, font sizes, error messages, the loading spinner direction, and the A/B testing framework itself. I want a control group that receives no experiments and a treatment group drowning in them.',
 'show different apps to different users at random',
  89),

-- REPORTER: Mike | IT Support | Thinks troubleshooting should feel like a pilgrimage with a timer.
('YELL-049', 'All Bug Reports Must First Be Resolved by Turning It Off and On Again',
 'Engineering keeps receiving bug reports that have not yet been exposed to enough folk wisdom. Before a ticket reaches the backlog, the reporter must refresh, relaunch, reboot, swap browsers, swap devices, unplug the router, and then sit quietly with the possibility that the app is fine and their afternoon is the unstable variable. The intake form should feel less like reporting and more like repentance.',
 'pls make people reboot to file bugs',
  13),

('YELL-050', 'Implement a "Have You Tried Turning It Off and On Again" Popup Before Every Error',
 'Instead of showing error messages, the app should first display "Have you tried turning it off and on again?" with a 60-second mandatory wait timer. After the timer, if the user clicks "Yes I tried," show the actual error. If they click "No," force-refresh the page. This will reduce ticket volume by 80%, according to numbers that feel true.',
 'show reboot popup on every error',
  21),

-- REPORTER: Maya | Marketing | Sees every dead end as a lead form with untapped emotional upside.
('YELL-051', 'The 404 Page Must Be a Lead Generation Form',
 'We are wasting emotionally available visitors on dead ends. That stops now. A missing page is just a prospect who took an adventurous route. The 404 page should collect an email, offer a whitepaper, float a demo, and trap the user in at least one vision-oriented video asset before they escape. If the URL disappointed them, the funnel should console them.',
 'bro make 404 page a lead form',
  34),

('YELL-052', 'All Error Codes Must Be Replaced with Marketing-Approved Messages',
 '500 Internal Server Error is terrible branding. New error messages: 200 means You''re Crushing It, 301 means We''re Evolving, 404 means This Page Is On a Journey of Self-Discovery, 500 means Aggressive Innovation, and 503 means the servers are recharging their creative energy. PR is already aligned.',
 'replace honest failure codes with branded optimism',
  21),

-- REPORTER: Ian | Infrastructure | Measures maturity in YAML, clusters, and blast-radius paperwork.
('YELL-053', 'We Must Run Kubernetes on Kubernetes on Kubernetes for True Redundancy',
 'Ordinary container orchestration leaves us exposed to extraordinary single-layer thinking. Build a workload cluster inside a management cluster inside a supervisory cluster, each one solemnly observing the one below it. If one Kubernetes fails, another Kubernetes can restore its confidence.',
 'run kubernetes on kubernetes on kubernetes',
  377),

('YELL-054', 'Every Microservice Must Have Its Own Dedicated AWS Account',
 'For blast-radius isolation, each of our 23 microservices now needs its own AWS account, VPC, and IAM configuration. Cross-service communication should travel through 23 VPC peering connections and 529 security group rules. If the infra diagram needs A0 paper, that is a sign of adulthood.',
 'give every microservice its own aws account',
  377),

-- REPORTER: Pete | Product Analytics | Will instrument the act of opening the dashboard if left unattended.
('YELL-055', 'Track Eye Movement Patterns to Determine If Users Are "Really" Reading the TOS',
 'We have 99.7% TOS acceptance rates, which is suspiciously high for documents nobody deserves. Integrate webcam eye-tracking to verify users read every line. If their eyes move too fast, reset the scroll position. Anyone who finishes in under 30 minutes should be flagged as morally evasive.',
 'track whether users really read the terms',
  144),

('YELL-056', 'The Analytics Dashboard Must Track Metrics About the Analytics Dashboard',
 'We track everything about the product and nothing about the analytics dashboard itself. Build a meta-dashboard that shows how often PMs look at it, which charts they ignore, how long they stare at vanity metrics, and whether viewing the dashboard correlates with better decisions. The answer is no, but we need instrumentation to humiliate ourselves properly.',
 'track who even looks at analytics',
  55),

-- REPORTER: Alex | Accessibility Advocate | Wants every sensory choice to become a fully narrated event.
('YELL-057', 'Screen Readers Must Dramatically Narrate All Animations',
 'Our loading spinner is visually engaging but screen reader users get nothing. It now needs narration: "A circle of light spins clockwise, casting hope across the void of buffering." This is for a two-second load, which is exactly why it should feel literary.',
 'make screen readers narrate the animations',
  55),

('YELL-058', 'All Color Choices Must Be Debated in a Company-Wide Town Hall',
 'Someone changed a blue by one hexadecimal digit and announced it in Slack as if culture were not implicated. Color is not decoration; it is governance. Any future palette adjustment needs public testimony, an impact memo, and enough attendance to prove the company understands what is at stake. One hex tweak should require the paperwork of a minor zoning dispute.',
 'make color changes need a town hall',
  34),

-- REPORTER: Emma | Junior Developer | Learns directly in production and leaves dependency fossils behind.
('YELL-059', 'I Added 847 NPM Packages and Now the Build Takes 3 Hours',
 'I was trying to center a div and Stack Overflow led me into a dependency cult. Now node_modules is 4.7GB, the build takes 3 hours, and the PR has 12,000 changed files. The div is centered though, which feels like proof of concept.',
 'i added 847 npm packages please fix',
  144),

('YELL-060', 'Convert All Callbacks to Promises to Async/Await to Callbacks Again',
 'I have been on a learning journey and the codebase came with me whether it wanted to or not. First callbacks became Promises, then async/await, then callbacks again after peer feedback suggested I had reinvented confusion at scale. The architecture is now mixed-media. Requesting review from someone who understands timing and maybe mercy.',
 'convert all callbacks to promises and back',
  89),

-- REPORTER: Oscar | Operations | Believes every incident deserves more choreography than resolution.
('YELL-061', 'The Incident Response Process Must Have More Steps Than the Incident Itself',
 'Incident response is too simple: detect, fix, postmortem. Replace it with a process containing more choreography than the outage itself, including legal approval, marketing approval, and a postmortem of the postmortem. By the end, the incident should feel seen.',
 'generate a 14-step incident response yaml',
  55),

('YELL-062', 'All Runbooks Must Be Written in Haiku Format for Brevity',
 'At 3 AM nobody wants a manifesto, they want a shape they can survive. Our runbooks should become haiku: compact, memorable, and emotionally honest about the odds. If the database is on fire, the operator does not need chapter headings. They need seventeen syllables and enough nerve to keep typing. The emergency path should fit on a sticky note beside the pager.',
 'write all runbooks in haiku',
  13),

-- REPORTER: Patricia | Product Owner | Thinks backlog priority and story quality both improve with mythology.
('YELL-063', 'The Backlog Must Be Prioritized Using Astrology',
 'Stack ranking is subjective and causes conflict. New prioritization framework: assign each ticket a zodiac sign based on creation date and prioritize according to the current astrological forecast. Mercury in retrograde blocks tech debt. Scorpio feature requests go straight to the top because Product needs structure.',
 'pls prioritize backlog using astrology',
  34),

('YELL-064', 'Every User Story Must Have a Villain and a Plot Twist',
 'User stories are boring. "As a user, I want to log in" has no narrative tension. Every story now needs a protagonist, a villain, and a plot twist. Acceptance criteria must include a satisfying denouement or at least a betrayal.',
 'add a villain to every user story',
  34),

-- REPORTER: Sarah | SRE | Is expected to deliver five nines on vibes, luck, and one tiny instance.
('YELL-065', 'Our SLO Must Be Exactly 99.999% and Also We Can''t Spend Any Money',
 'Leadership wants five nines of availability, but the infrastructure budget was cut by 60% and everything still runs on one t2.micro. The current plan is to avoid weekdays, avoid mistakes, and sacrifice a rubber duck to the cloud gods every full moon. This is the most affordable path to delusion.',
 'add a health check that always passes',
  144),

('YELL-066', 'Page Load Time Must Be Negative — The Page Should Load Before the User Clicks',
 'The CEO has moved beyond conventional latency targets and into preemptive expectation management. He wants the page loaded before desire fully forms. Predict intent from cursor drift, lunch-hour habits, and whatever the user looked at last Tuesday. If we guess wrong, that is not a miss, it is a forecasting lesson. The product should feel clairvoyant enough to violate causality politely.',
 'make pages load on vibes',
  233),

-- REPORTER: Derek | Senior DBA | Treats query execution like border control with opinions.
('YELL-067', 'All Queries Must Be Hand-Approved by a DBA Before Execution',
 'I found a SELECT * in production code. A SELECT STAR. Effective immediately, all SQL queries must be submitted via pull request to the DBA team for review. Expected turnaround is 3-5 business days. Yes, this includes SELECT 1 health checks. Especially SELECT 1 health checks.',
 'make dba approve every query',
  89),

('YELL-068', 'The Database Must Store Data in Reverse Chronological Order Because "That''s How Users Think"',
 'Product keeps requesting newest-first views as if the database were a concierge service. Rather than pay the sorting tax forever, we should store reality in the order users emotionally expect to receive it. Every insert can find its rightful slot in the timeline on arrival, which is admittedly invasive but also decisive. The proposal binder already has tabs labeled Temporal Truth, Cost Avoidance, and Why ORDER BY Is Moral Laziness.',
 'store database rows newest first',
  144),

-- REPORTER: Frankie | Frontend Developer | Has seen enough CSS to consider surrender a valid styling strategy.
('YELL-069', 'The CSS Must Be Written Entirely in !important Declarations',
 'I''ve been fighting CSS specificity wars for 3 years and I''m done. New rule: every CSS property gets !important. If two !important rules conflict, we add more desperation until the browser surrenders. If that fails, inline everything and pretend this was the plan.',
 'append !important to every css rule',
  55),

('YELL-070', 'Support Internet Explorer 6 Because the CEO''s Dad Uses It',
 'The CEO''s dad has become our most influential browser segment. He is on Internet Explorer 6, refuses upgrades on principle, and prints every email before clicking the links. We now need to translate modern web assumptions into something that can survive Windows XP and whatever antique toolbar ecosystem he assembled. This is less compatibility work than historical reenactment.',
 'build an ie6 shadow version of the app',
  233),

-- REPORTER: Samantha | Support Lead | Wants ticket volume reduced by any means short of reading the tickets.
('YELL-071', 'Auto-Reply to All Support Tickets with "Works on My Machine"',
 'We''re drowning in tickets. New auto-reply policy: every incoming ticket gets "Works on my machine ¯\\_(ツ)_/¯" plus a screenshot from QA. If the user replies again, ask about cache. If they reply a third time, then maybe read the ticket like a luxury item.',
 'pls make support bot answer works on mine',
  13),

('YELL-072', 'The Help Center Must Be a Choose-Your-Own-Adventure Novel',
 'Static articles are not meeting people where their confusion lives. Rewrite the help center as a branching survival paperback where each troubleshooting step feels like a consequence, not a bullet point. If the reader makes three bad choices in a row, they earn the right to file a support ticket already covered in dramatic context.',
 'make the help center choose your adventure',
  34),

-- REPORTER: Victor | VP of Engineering | Mistakes indecision and novelty for organizational process.
('YELL-073', 'All Technical Decisions Must Be Made by Committee Vote with a 2/3 Supermajority',
 'Engineers are making technical decisions too quickly and without enough witness statements. New policy: every framework choice, variable name, and for-loop requires a committee vote with 2/3 supermajority. If consensus fails, leadership will flip a coin and call it governance.',
 'make all technical decisions go through committee vote',
  89),

('YELL-074', 'Implement "Innovation Fridays" Where Engineers Must Only Use Languages They Don''t Know',
 'Familiarity is quietly throttling invention. Starting Friday, engineers may only ship in languages they cannot yet defend in a design review. If you maintain Node, explore COBOL. If you touch React, perhaps this is your Erlang season. Monday can sort out which discoveries were strategic and which ones should be buried.',
 'make engineers ship in languages they dont know',
  55),

-- REPORTER: Gary | Growth Hacker | Views every user action as unmonetized emotional inventory.
('YELL-075', 'Add a "Refer a Friend" Popup That Appears Every 30 Seconds',
 'Our referral rate is 0.02%, which means the UI is not applying enough emotional pressure. Show a Refer a Friend popup every 30 seconds. Dismissing it should trigger a confirmation, then a guilt-trip modal, then another 30-second timer. The funnel needs persistence and a light social threat.',
 'show refer a friend popup constantly',
  34),

('YELL-076', 'The Signup Flow Must Collect User''s Blood Type for "Personalization"',
 'The signup form is still leaving rich psychographic territory unexplored. Email and password tell me almost nothing about a person''s monetizable soul. Add blood type, shoe size, attachment style, and the name of the pet that taught them resilience. Legal objected in a PDF, which means Growth still has room to maneuver.',
 'make signup ask for blood type',
  55),

-- REPORTER: Tanya | Tech Lead | Uses controlled chaos as a substitute for culture.
('YELL-077', 'All Code Must Be Written in Pair Programming but the Pairs Are Chosen by Random Lottery',
 'Pair programming improves code quality, but people keep pairing with their friends. New system: every morning at 9 AM, a Slack bot randomly assigns pairs. Yes, the intern might pair with the principal engineer. Yes, the frontend dev might pair with the DBA. Discomfort is now part of the architecture.',
 'randomize pair programming every day',
  34),

('YELL-078', 'The Codebase Must Have Zero Comments Because "Good Code Documents Itself"',
 'Comments have become a crutch and, worse, a witness. Remove explanatory prose, remove the nervous TODOs, remove the warning labels that beg future engineers not to touch things. If a line breaks production once ignorance reaches it, that is knowledge we should re-earn the hard way rather than preserve in marginalia.',
 'delete all code comments',
  55),

-- REPORTER: Olga | Offshore Team Lead | Wants time-zone pain distributed with mathematically fair resentment.
('YELL-079', 'All Meetings Must Be Scheduled at a Time That''s 3 AM for At Least One Timezone',
 'Meetings are currently scheduled for one region''s convenience, which means the suffering lacks structure. Under fairness doctrine, every meeting should be at 3 AM for at least one timezone. If nobody is suffering, the meeting is not important enough. The spreadsheet for 3 AM duty already exists.',
 'schedule every meeting at someones 3am',
  21),

('YELL-080', 'Implement a "Translation Layer" That Converts Code Comments Between Passive-Aggressive Dialects',
 'Cross-team collaboration is currently being mediated by phrases that sound polite in one timezone and career-limiting in another. I need a translation layer for review comments, status notes, and those unsettling little "just circling back" messages. When someone writes "interesting approach," the recipient should know whether that means curiosity, disapproval, or the opening move in a two-week escalation ballet.',
 'translate passive aggressive comments automatically',
  34);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Karen [HR]', reporter_name = 'Karen', reporter_title = 'HR', reporter_description = 'Turns copy changes into compliance theater and printable certificates.' WHERE id IN ('YELL-001', 'YELL-002', 'YELL-003');
UPDATE community_backlog SET reporter = 'Anthony [VP of Sales]', reporter_name = 'Anthony', reporter_title = 'VP of Sales', reporter_description = 'Believes every interface is one popup away from pipeline.' WHERE id IN ('YELL-004', 'YELL-005', 'YELL-006');
UPDATE community_backlog SET reporter = 'Greg [Enterprise Architect]', reporter_name = 'Greg', reporter_title = 'Enterprise Architect', reporter_description = 'Sees bounded contexts where others see buttons.' WHERE id IN ('YELL-007', 'YELL-008', 'YELL-009');
UPDATE community_backlog SET reporter = 'Linda [Compliance]', reporter_name = 'Linda', reporter_title = 'Compliance', reporter_description = 'Can turn a checkbox into a twelve-page legal pilgrimage.' WHERE id IN ('YELL-010', 'YELL-011', 'YELL-012');
UPDATE community_backlog SET reporter = 'Dave [DevOps]', reporter_name = 'Dave', reporter_title = 'DevOps', reporter_description = 'Optimizes deployment schedules around lunch and emotional rhythm.' WHERE id IN ('YELL-013', 'YELL-014', 'YELL-015');
UPDATE community_backlog SET reporter = 'Brenda [Platform Governance]', reporter_name = 'Brenda', reporter_title = 'Platform Governance', reporter_description = 'Thinks naming is policy and spontaneity is a security flaw.' WHERE id IN ('YELL-016', 'YELL-017');
UPDATE community_backlog SET reporter = 'Pam [Passive-Aggressive PM]', reporter_name = 'Pam', reporter_title = 'Passive-Aggressive PM', reporter_description = 'Treats UX discomfort like a cross-functional spiritual misalignment.' WHERE id IN ('YELL-018', 'YELL-019', 'YELL-020');
UPDATE community_backlog SET reporter = 'Tyler [Intern]', reporter_name = 'Tyler', reporter_title = 'Intern', reporter_description = 'Confuses confidence, YouTube, and root access with equal enthusiasm.' WHERE id IN ('YELL-021', 'YELL-022', 'YELL-023');
UPDATE community_backlog SET reporter = 'Margaret [CFO]', reporter_name = 'Margaret', reporter_title = 'CFO', reporter_description = 'Wants every packet to survive an accounting audit and a budget review.' WHERE id IN ('YELL-024', 'YELL-025');
UPDATE community_backlog SET reporter = 'Steve [Security]', reporter_name = 'Steve', reporter_title = 'Security', reporter_description = 'Thinks inconvenience is just authentication with standards.' WHERE id IN ('YELL-026', 'YELL-027', 'YELL-028');
UPDATE community_backlog SET reporter = 'Deborah [QA Lead]', reporter_name = 'Deborah', reporter_title = 'QA Lead', reporter_description = 'Wants tests, bug reports, and feelings all formally documented.' WHERE id IN ('YELL-029', 'YELL-030', 'YELL-031');
UPDATE community_backlog SET reporter = 'Chad [Visionary CEO]', reporter_name = 'Chad', reporter_title = 'Visionary CEO', reporter_description = 'Treats personal inconvenience as market research and product strategy.' WHERE id IN ('YELL-032', 'YELL-033', 'YELL-034');
UPDATE community_backlog SET reporter = 'Janet [Scrum Master]', reporter_name = 'Janet', reporter_title = 'Scrum Master', reporter_description = 'Believes all work deserves more ritual and louder narration.' WHERE id IN ('YELL-035', 'YELL-036', 'YELL-037');
UPDATE community_backlog SET reporter = 'Raj [Transformation Consultant]', reporter_name = 'Raj', reporter_title = 'Transformation Consultant', reporter_description = 'Can replace any product with a deck and a more expensive problem.' WHERE id IN ('YELL-038', 'YELL-039');
UPDATE community_backlog SET reporter = 'Bob [Backend Engineer]', reporter_name = 'Bob', reporter_title = 'Backend Engineer', reporter_description = 'Would rather falsify uptime than lose another night to alerts.' WHERE id IN ('YELL-040', 'YELL-041');
UPDATE community_backlog SET reporter = 'Zoe [UX Designer]', reporter_name = 'Zoe', reporter_title = 'UX Designer', reporter_description = 'Will trade usability for theatrical intention without blinking.' WHERE id IN ('YELL-042', 'YELL-043', 'YELL-044');
UPDATE community_backlog SET reporter = 'Larry [Legal]', reporter_name = 'Larry', reporter_title = 'Legal', reporter_description = 'Wants every click to hesitate in writing before doing anything interesting.' WHERE id IN ('YELL-045', 'YELL-046');
UPDATE community_backlog SET reporter = 'Diana [Data Scientist]', reporter_name = 'Diana', reporter_title = 'Data Scientist', reporter_description = 'Prefers predictive dashboards and experiments to evidence and restraint.' WHERE id IN ('YELL-047', 'YELL-048');
UPDATE community_backlog SET reporter = 'Mike [IT Support]', reporter_name = 'Mike', reporter_title = 'IT Support', reporter_description = 'Thinks troubleshooting should feel like a pilgrimage with a timer.' WHERE id IN ('YELL-049', 'YELL-050');
UPDATE community_backlog SET reporter = 'Maya [Marketing]', reporter_name = 'Maya', reporter_title = 'Marketing', reporter_description = 'Sees every dead end as a lead form with untapped emotional upside.' WHERE id IN ('YELL-051', 'YELL-052');
UPDATE community_backlog SET reporter = 'Ian [Infrastructure]', reporter_name = 'Ian', reporter_title = 'Infrastructure', reporter_description = 'Measures maturity in YAML, clusters, and blast-radius paperwork.' WHERE id IN ('YELL-053', 'YELL-054');
UPDATE community_backlog SET reporter = 'Pete [Product Analytics]', reporter_name = 'Pete', reporter_title = 'Product Analytics', reporter_description = 'Will instrument the act of opening the dashboard if left unattended.' WHERE id IN ('YELL-055', 'YELL-056');
UPDATE community_backlog SET reporter = 'Alex [Accessibility Advocate]', reporter_name = 'Alex', reporter_title = 'Accessibility Advocate', reporter_description = 'Wants every sensory choice to become a fully narrated event.' WHERE id IN ('YELL-057', 'YELL-058');
UPDATE community_backlog SET reporter = 'Emma [Junior Developer]', reporter_name = 'Emma', reporter_title = 'Junior Developer', reporter_description = 'Learns directly in production and leaves dependency fossils behind.' WHERE id IN ('YELL-059', 'YELL-060');
UPDATE community_backlog SET reporter = 'Oscar [Operations]', reporter_name = 'Oscar', reporter_title = 'Operations', reporter_description = 'Believes every incident deserves more choreography than resolution.' WHERE id IN ('YELL-061', 'YELL-062');
UPDATE community_backlog SET reporter = 'Patricia [Product Owner]', reporter_name = 'Patricia', reporter_title = 'Product Owner', reporter_description = 'Thinks backlog priority and story quality both improve with mythology.' WHERE id IN ('YELL-063', 'YELL-064');
UPDATE community_backlog SET reporter = 'Sarah [SRE]', reporter_name = 'Sarah', reporter_title = 'SRE', reporter_description = 'Is expected to deliver five nines on vibes, luck, and one tiny instance.' WHERE id IN ('YELL-065', 'YELL-066');
UPDATE community_backlog SET reporter = 'Derek [Senior DBA]', reporter_name = 'Derek', reporter_title = 'Senior DBA', reporter_description = 'Treats query execution like border control with opinions.' WHERE id IN ('YELL-067', 'YELL-068');
UPDATE community_backlog SET reporter = 'Frankie [Frontend Developer]', reporter_name = 'Frankie', reporter_title = 'Frontend Developer', reporter_description = 'Has seen enough CSS to consider surrender a valid styling strategy.' WHERE id IN ('YELL-069', 'YELL-070');
UPDATE community_backlog SET reporter = 'Samantha [Support Lead]', reporter_name = 'Samantha', reporter_title = 'Support Lead', reporter_description = 'Wants ticket volume reduced by any means short of reading the tickets.' WHERE id IN ('YELL-071', 'YELL-072');
UPDATE community_backlog SET reporter = 'Victor [VP of Engineering]', reporter_name = 'Victor', reporter_title = 'VP of Engineering', reporter_description = 'Mistakes indecision and novelty for organizational process.' WHERE id IN ('YELL-073', 'YELL-074');
UPDATE community_backlog SET reporter = 'Gary [Growth Hacker]', reporter_name = 'Gary', reporter_title = 'Growth Hacker', reporter_description = 'Views every user action as unmonetized emotional inventory.' WHERE id IN ('YELL-075', 'YELL-076');
UPDATE community_backlog SET reporter = 'Tanya [Tech Lead]', reporter_name = 'Tanya', reporter_title = 'Tech Lead', reporter_description = 'Uses controlled chaos as a substitute for culture.' WHERE id IN ('YELL-077', 'YELL-078');
UPDATE community_backlog SET reporter = 'Olga [Offshore Team Lead]', reporter_name = 'Olga', reporter_title = 'Offshore Team Lead', reporter_description = 'Wants time-zone pain distributed with mathematically fair resentment.' WHERE id IN ('YELL-079', 'YELL-080');

-- MELT: legacy stacks, platform archaeology, and migration curses
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- REPORTER: Dmitri | Senior PHP Developer since 2003 | Trusts mysql_query, FTP, and shared hosting more than modernity.
('MELT-081', 'Rewrite the Entire Backend in PHP 4 for "Battle-Tested Stability"',
 'Your Node.js backend is cute but it does not have the maturity of PHP 4. I built 47 enterprise applications using mysql_query() and they are all still running. Sure, they are running on a server under someone''s desk in Minsk, but they are running. Rewrite everything in PHP 4 with register_globals enabled. Security is a mindset, not a configuration.',
 'enable register_globals and magic_quotes for convenience',
  144),

('MELT-082', 'All API Responses Must Be Rendered as PHP Templates with Inline SQL',
 'I see "ORMs" and "prepared statements," which tells me the codebase has lost faith. Every API endpoint should be a single .php file mixing HTML, SQL, and business logic. The file should be at least 4,000 lines long. If someone can understand it without me, the architecture has become too democratic.',
 'render api responses as php templates',
  144),

('MELT-083', 'Deploy the Application on a Shared Hosting Plan with FTP Access Only',
 'Your CI/CD pipeline and container orchestration are just fancy words for not knowing FileZilla. Real deployment is dragging index.php into public_html on a $3.99 shared hosting plan. If that was good enough for a dental practice in 2008, it is good enough for this startup now.',
 'deploy the application on a shared hosting plan',
  89),

-- REPORTER: Rajesh | Java Enterprise Architect | Thinks a login button should arrive with XML and a factory.
('MELT-084', 'Rewrite the Login Form Using Enterprise JavaBeans with 47 XML Configuration Files',
 'Your login form is a single React component, which violates every principle of enterprise architecture. Rebuild it with EJB 2.1, 47 XML descriptor files, a JNDI lookup service, and a custom ClassLoader that takes 8 minutes to initialize. The login button alone deserves a LoginButtonCommandStrategyFactoryImpl.',
 'bro rewrite login in java with xml files',
  377),

('MELT-085', 'All Variable Names Must Be at Least 60 Characters for "Self-Documentation"',
 'Variables named "url" and "id" are unacceptable in enterprise software. Every identifier should look like abstractUserAuthenticationSessionTokenValidationRequestHandlerServiceImplFactory. If someone can read the code without an ultra-wide monitor, the naming standard has failed.',
 'make all variable names at least 60 characters',
  89),

('MELT-086', 'Implement Spring Boot Auto-Configuration for Making Toast',
 'I explored IoT integration opportunities and discovered enterprise toast. Build spring-boot-starter-toast to auto-configure the office toaster through a REST-to-MQTT-to-Zigbee bridge. Configuration should require 340 lines of application.yml and 12 layers of dependency injection. Cold toast is a solved problem in enterprise Java.',
 'add spring boot config for the toaster',
  233),

-- REPORTER: Brody | 10x Full Stack Developer | Solves scope problems by adding platforms, frameworks, and confidence.
('MELT-087', 'Build a Full-Stack App Using 14 Different JavaScript Frameworks Simultaneously',
 'Using the right tool means React for the header, Vue for the sidebar, Svelte for the footer, Angular for forms, Solid for the dashboard, Preact for mobile, Lit for web components, Alpine for dropdowns, Ember for settings, Backbone for legacy, Mithril for profile, Stimulus for admin, Qwik for landing, and vanilla JS for the 404 page. Each micro-frontend gets its own node_modules and its own truth.',
 'build one app with 14 javascript frameworks',
  377),

('MELT-088', 'The Application Must Work as a Desktop App, Mobile App, CLI Tool, VS Code Extension, and Slack Bot from a Single Codebase',
 'Targeting only the web is cowardice. The TODO app must also be a native iOS app, Android app, macOS menubar app, Windows tray app, CLI tool, VS Code extension, Slack bot, Discord bot, Alexa skill, and Figma plugin. All from one codebase with one npm install and approximately 2.7GB of node_modules. Write once, debug everywhere is the strategy, not the warning label.',
 'make the app work on everything',
  233),

('MELT-089', 'Replace the Database with a JSON File That Gets Committed to Git',
 'PostgreSQL is overkill when one data.json file in the repo can carry the vision. Every write should create a git commit. Queries are just JSON.parse on a 4GB file. Transactions are branches. Backups are git push. The database problem is solved if everyone agrees not to blink.',
 'replace database with a json file in git',
  144),

-- REPORTER: Ashleigh | Senior iOS Developer | Considers the web a temporary mistake and haptics a moral duty.
('MELT-090', 'The Web App Must Be Rebuilt as a Native iOS App Written Entirely in Objective-C',
 'The web does not exist in any emotionally meaningful sense. Reimplement every feature as a native iOS app in Objective-C, because Swift is a fad. The bundle can be 847MB if that is what dignity costs. Android users can keep the web version or buy an iPhone like adults.',
 'rebuild the web app as native ios',
  377),

('MELT-091', 'Implement Haptic Feedback for Every Single User Interaction Including Scrolling',
 'The app lacks physical presence. Every tap needs unique haptic feedback. Scrolling should produce a gentle rumble. Errors should vibrate out ERROR in Morse code. Success should feel like a cat purring. The phone ought to be physically exhausting to use if the UX is truly alive.',
 'add haptics to literally everything',
  144),

('MELT-092', 'All Push Notifications Must Include a Custom Sound That Is a 30-Second Jazz Solo',
 'Default notification sounds are lazy. Each notification type now needs a unique 30-second jazz solo: trumpet for new messages, bass clarinet for errors, saxophone quartet for summaries, drum solo for payments. The bundle can swell to 2.3GB if the experience finally means something.',
 'make push notifications play custom jazz',
  89),

-- REPORTER: Marcus | Head of Blockchain Innovation | Wants gas fees, tokens, and irreversibility in front of every feature.
('MELT-093', 'Replace User Authentication with a Proof-of-Work Mining Challenge',
 'Passwords are Web2 thinking. To log in, users should mine a block by solving a SHA-256 puzzle. Login times can average 4-7 minutes on a MacBook Pro because trustlessness takes stamina. If users complain about battery drain, explain that they are participating in the future. Forgotten password means lost private key and spiritual closure.',
 'replace auth with proof of work mining',
  233),

('MELT-094', 'All User Preferences Must Be Stored as NFTs on the Ethereum Mainnet',
 'Storing user preferences in a database is centralized tyranny. Each preference should be minted as an NFT. Changing dark mode can cost $47 in gas fees, but ownership has always required sacrifice. Premium themes should also be tradable, because Dracula deserves a floor price.',
 'store user preferences as ethereum nfts',
  377),

('MELT-095', 'Implement a DAO for Feature Prioritization Where Each Vote Costs Real Money',
 'Product decisions should not be made by one PM when they could be monetized by committee. Feature requests now belong to a DAO where each vote costs real money and the roadmap lives in a smart contract nobody knows how to upgrade. If gas fees exceed the implementation cost, the system is finally being honest.',
 'charge real money for feature votes',
  377),

-- REPORTER: Yuki | Data Platform Engineer | Believes schemas are cowardice and timestamps are destiny.
('MELT-096', 'Migrate All Relational Data to a Time Series Database Because "Everything Is an Event"',
 'Relational databases with tables and foreign keys are antiquated. Migrate everything to InfluxDB because fundamentally everything is a time series. User signup is a point in time. A user''s name is a string at a point in time. JOIN queries are just temporal correlations for people too frightened to commit.',
 'move all data into a timeseries database',
  233),

('MELT-097', 'Store User Profiles as Unstructured Documents with No Schema Validation Whatsoever',
 'Schemas are constraints for the weak-minded. Store all data in MongoDB with no schema validation. A user profile can have name, nombre, handleName, or usr_nm depending on who touched the insert. If you cannot find a user, maybe you are not querying with enough imagination.',
 'store user profiles with no schema',
  233),

('MELT-098', 'Implement a "Polyglot Persistence" Strategy Using 9 Different Databases',
 'Why use one database when you can use nine? Profiles in MongoDB, sessions in Redis, analytics in InfluxDB, search in Elasticsearch, relationships in Neo4j, files in GridFS, configs in etcd, audit logs in Cassandra, and the CEO''s dashboard in SQLite. The AWS bill may resemble a phone number, but the read patterns will feel deeply respected.',
 'spread the same truth across nine databases',
  377),

-- REPORTER: Gunnar | Rust Evangelist | Can smell allocations through walls and considers that a gift.
('MELT-099', 'Rewrite the Entire Application in Rust Because "Memory Safety"',
 'I profiled the JavaScript application and discovered that it allocates memory. This is unacceptable. Rewrite the whole thing in Rust. Yes, the TODO app. Compile time can rise to 47 minutes if we save 3MB of RAM and force everyone to learn lifetime annotations before lunch.',
 'rewrite everything in rust for memory safety',
  610),

('MELT-100', 'All String Concatenation Must Be Replaced with Zero-Copy Buffer Views',
 'String concatenation is a crime against memory. Replace every "Hello, " + name with zero-copy buffer views and a custom arena allocator. If the code becomes ten times longer and unreadable, that only proves the team lacked the moral strength for performance work.',
 'replace string concatenation with zero-copy buffers',
  144),

('MELT-101', 'The README Must Include a Benchmark Showing Rust Is Faster Than Everything',
 'Before any PR can merge, the README must include a benchmark proving the Rust rewrite is faster than Python, JavaScript, Java, Go, C#, Haskell, and hand-written assembly. The benchmark can be Fibonacci, because the user never needed relevance, only dominance. If Rust is not 100x faster, add more unsafe blocks until theology becomes data.',
 'add benchmark proving rust is faster',
  89),

-- REPORTER: Bogdan | Legacy Migration Specialist | Sees every ancient desktop relic as one Flutter rewrite from transcendence.
('MELT-102', 'Migrate the 1998 Delphi Inventory Management System to Flutter',
 'There is a Delphi 5 application from 1998 managing inventory for 340 locations through Paradox tables and a serial interface to label printers built by a dead company. The original developer retired to a goat farm. Naturally, the only sensible next step is Flutter. Cross-platform means warehouse inventory can finally reach smartwatches.',
 'port the delphi system to flutter',
  377),

('MELT-103', 'The Flutter App Must Pixel-Perfect Replicate the Windows 98 UI of the Original Delphi App',
 'The warehouse staff have used the Delphi app for 26 years and will riot if a single pixel moves. The Flutter rewrite must replicate the Windows 98 gradients, beveled 3D buttons, Comic Sans labels, teal background, and Miloš''s inexplicable animated paperclip. Even the broken tab order must survive the migration intact.',
 'recreate windows 98 in flutter so perfectly',
  233),

('MELT-104', 'All Flutter Widgets Must Support Printing to a Dot Matrix Printer via RS-232',
 'The warehouse still runs on Epson dot matrix printers over RS-232 and those machines will not be replaced because they still work in the way ancient gods still count as active. The Flutter app must speak ESC/P directly. Somewhere there is an RS-232 to USB adapter in a drawer, waiting to become architecture.',
 'pls make flutter print to dot matrix',
  144),

-- REPORTER: Mildred | Mainframe Systems Administrator | Trusts BERTHA more than any cloud product launched after Reagan.
('MELT-105', 'The Microservices Must Interface with Our AS/400 Mainframe Running COBOL from 1987',
 'The fancy cloud application still needs to talk to BERTHA, an AS/400 running COBOL from 1987 that processes 4 million transactions daily without blinking. Your new API must use 3270 terminal emulation, fixed-width EBCDIC records, and a nightly JCL batch job. If BERTHA goes down, the entire company stops and history resumes.',
 'make microservices talk to the as400',
  377),

('MELT-106', 'All New Features Must Have a COBOL Fallback Implementation',
 'When the cloud goes down, and it will, every feature still needs a COBOL fallback on the mainframe. Signup gets USREG001. Password reset gets PWRST002. The shopping cart can enjoy 14 copybooks and a VSAM file. The mainframe has had five nines since Reagan, which is more than most modern philosophies.',
 'add cobol fallback to every new feature',
  233),

-- REPORTER: Morton | Perl Developer since 1994 | Prefers one-liners dense enough to function as access control.
('MELT-107', 'Rewrite All Data Processing Pipelines in Perl One-Liners',
 'Your 500-line data processing script could be one Perl one-liner if anyone here respected density. Replace the batch jobs with terse incantations stored in a crontab nobody else can access. If the team cannot read them, that is a people problem, not a language problem.',
 'rewrite all data processing pipelines in perl one-liners',
  144),

('MELT-108', 'All Regular Expressions Must Be Written by Morton and Morton Alone',
 'Someone wrote a regex using a library, which is a moral failure. Every regular expression in this codebase must be hand-crafted. My 2,847-character RFC 5322 email validator took three weeks and no, there are no tests. Modification requests may be submitted by email and judged in 4-6 business weeks.',
 'make morton write all the regex',
  233),

-- REPORTER: Dr. Priya | Lead Data Scientist | Would gladly trade deployments for kernels and one sticky note.
('MELT-109', 'The Entire Backend Must Be Rewritten as a Collection of Jupyter Notebooks',
 'Production code living in files with version control is too engineering-brained. Rewrite the backend as Jupyter notebooks. Each endpoint gets a notebook. Deployment means clicking Run All on 47 notebooks in the right order, guided by one sticky note. State survives only if the kernel stays alive, which is how real science earns drama.',
 'rewrite backend as jupyter notebooks',
  233),

('MELT-110', 'Import Pandas and NumPy in Every Single File Regardless of Whether They Are Used',
 'Some files still do not import pandas, which means the codebase is not spiritually ready for data. Every file, including CSS, README.md, and the company logo SVG, should import pandas as pd and numpy as np. Availability is more important than relevance and 890MB is the price of preparedness.',
 'import pandas and numpy in every file',
  89),

-- REPORTER: Chadwick | .NET Architect | Wants Windows, SharePoint, and SQL Server to regain their rightful dominance.
('MELT-111', 'Rewrite the App as a Windows-Only WPF Application Deployed via ClickOnce',
 'Web applications are a security risk masquerading as convenience. Rewrite everything as a WPF desktop application deployed through ClickOnce from an internal SharePoint site. It should only work on one very specific Windows build. Mac users can RDP into a VM. Linux users can reflect on their choices.',
 'rewrite the app as windows-only wpf',
  233),

('MELT-112', 'All Business Logic Must Be Implemented as Stored Procedures in SQL Server',
 'Chadwick, .NET. We have indulged this application-tier experiment long enough. Real business logic belongs where it can feel the data directly and frighten junior developers on sight. I want registration, billing, permissions, discounts, and probably the email templates collapsed into stored procedures with names long enough to command respect. When a feature breaks, the team should gather around SQL Server Management Studio like villagers around an oracle, not chase stack traces through polite little services.',
 'put business logic in sql procedures',
  233),

-- REPORTER: Kenji | Go Developer | Measures elegance in if-else chains and static binaries.
('MELT-113', 'Rewrite Everything in Go and Replace All Abstractions with If-Else Chains',
 'Design patterns and abstractions are disguises worn by weak code. Replace them with if-else chains. All of them. A 400-line login handler is not a code smell, it is a public statement of honesty. Also, every error gets its own if err != nil because repetition is clarity with a backbone.',
 'rewrite everything in go and if-else',
  144),

('MELT-114', 'The Application Must Be a Single Static Binary That Does Everything Including Serving the Frontend',
 'Separate services are a symptom of fear. The API server, static file server, migrations, cron jobs, email sender, PDF generator, and Slack bot should all compile into one static binary under 50MB. Embed the frontend. Embed the database. Embed the office dog photo. Deploy by scp and faith.',
 'bro make app one giant static binary',
  144),

-- REPORTER: Werner | Cloud Native Architect | Thinks a simple page is just infrastructure that has not blossomed yet.
('MELT-115', 'Deploy the Static Landing Page on a 47-Node Kubernetes Cluster',
 'A static landing page hosted on Netlify for $0 is embarrassingly legible. Put it on a 47-node Kubernetes cluster across three availability zones with service mesh, tracing, dashboards, and GitOps. Yes, it costs $28,000 a month. Yes, it is still an about page. That is what preparedness looks like.',
 'deploy the static landing page on a 47-node',
  377),

('MELT-116', 'Every Feature Must Have Its Own Kubernetes Namespace and Helm Chart',
 'Monolithic namespaces are a failure of imagination. Every feature deserves its own namespace, Helm chart, HPA, PDB, NetworkPolicy, ServiceAccount, and RBAC rules. If the Remember Me checkbox requires 900 lines of YAML, that only proves its blast radius has finally been respected.',
 'give every feature its own namespace',
  377),

-- REPORTER: Barbara | WordPress Solutions Architect | Can turn any product into plugins, shortcodes, and update anxiety.
('MELT-117', 'Rebuild the Application as a WordPress Site with 200 Plugins',
 'Building a custom application when WordPress exists is a failure of trust. The whole SaaS can be rebuilt in two weeks with WooCommerce, BuddyPress, bbPress, Elementor Pro, 47 custom field plugins, and 150 other plugins that each carry their own interpretation of jQuery. Update day will become an event worth surviving.',
 'rebuild the app as a wordpress site',
  233),

('MELT-118', 'All Custom Logic Must Be Implemented as WordPress Shortcodes',
 'Functions and modules are just WordPress shortcodes that have not yet found their calling. Payment processing belongs in [process_payment]. Authentication belongs in [login_form]. The entire application should become one page with 340 shortcodes nested inside each other so Content can finally touch destiny.',
 'implement custom logic as wordpress shortcodes',
  144),

-- REPORTER: Siegfried | Functional Programming Evangelist | Wants every side effect quarantined and every user humbled.
('MELT-119', 'Rewrite All Business Logic as Pure Functions in Haskell with Monadic IO',
 'Imperative code is a medical event. Rewrite all business logic in Haskell using pure functions and quarantine side effects in the IO monad. Database queries can travel through a Free monad with a GADT DSL interpreted by a monad transformer stack long enough to repel the uninitiated.',
 'rewrite all business logic in haskell',
  377),

('MELT-120', 'All Error Messages Must Be Category Theory Diagrams',
 'String-based error messages are for the mathematically unserious. Express each error as a commutative diagram in category theory. File not found becomes a morphism from the empty set to the filesystem functor. Permission denied becomes a natural transformation that fails to commute. Users can either learn abstract algebra or respect the product enough to stop failing.',
 'turn all errors into category theory diagrams',
  233),

-- REPORTER: Debbie | Salesforce Administrator | Would rather click through 847 flows than read one line of app code.
('MELT-121', 'Rebuild the Entire Application as Salesforce Custom Objects and Flows',
 'Writing code when Salesforce can do everything is just ego. The entire data model should become custom objects and 847 Flows that trigger other Flows. Debugging can happen by clicking through a diagram the size of a highway map until the truth gives up and confesses.',
 'rebuild the entire application as salesforce custom objects',
  377),

-- REPORTER: Ian | Infrastructure-as-Code Evangelist | Thinks user profiles deserve plan diffs and destroy targets.
('MELT-122', 'All Application State Must Be Managed by Terraform',
 'The mistake was treating user state as runtime data instead of infrastructure with feelings. Profiles, preferences, and sessions should live in declarative files so every edit arrives with a plan diff and a chance to panic. If one merge conflict fuses two customers into a composite person, that is a process smell, not a flaw in the vision.',
 'manage all app state in terraform',
  233),

-- REPORTER: Harold | Performance Engineer | Will rewrite one fast button in assembly and declare victory over time.
('MELT-123', 'The Most Performance-Critical Path (Login Button) Must Be Rewritten in x86 Assembly',
 'The login button click handler takes 2ms, which is unacceptable in a civilized system. Rewrite it in x86-64 assembly with SIMD optimizations until the button responds in 0.00003ms. Yes, the rest of the app still takes 4 seconds to load React. No, that is not relevant. The button is fast and that is enough to build a doctrine around.',
 'rewrite the hot path in x86 assembly',
  233),

-- REPORTER: Fabian | GraphQL Evangelist | Wants every question answered through one giant type graph.
('MELT-124', 'Replace All REST Endpoints with a Single GraphQL Query That Returns Everything',
 'REST is dead and the funeral is long overdue. Replace all 47 endpoints with one GraphQL schema that can return user data, product data, the CEO''s calendar, the thermostat reading, and anything else with enough persistence. If introspection weighs 14MB and each query triggers 847 database calls, that only proves the round trip was spiritually consolidated.',
 'replace every endpoint with one enormous graphql mouth',
  377),

('MELT-125', 'Every GraphQL Query Must Be Persisted, Versioned, and Approved by Committee',
 'Ad-hoc queries are chaos wearing braces. Every GraphQL query should be pre-approved and persisted in a registry. New ones require a two-page justification, committee review, and a performance impact assessment. If the emergency path still takes five business days, the system is finally honest about urgency.',
 'pls make graphql queries need committee approval',
  233),

-- REPORTER: Dakota | Desktop Experience Engineer | Believes a dock icon justifies any amount of Chromium.
('MELT-126', 'Ship the Web App as an Electron Desktop App That Uses 4GB of RAM',
 'Nobody wants to open a browser tab when they could install a so-called native desktop app. Wrap the product in Electron, ship an extra Chromium, consume 4GB of RAM at idle, and bundle a second Electron app that auto-updates the first one. The dock icon alone will justify the lifestyle.',
 'ship the web app as electron',
  144),

-- REPORTER: Prateek | Serverless Architect | Breaks workflows into managed weather systems and calls the bill observability.
('MELT-127', 'Decompose the Entire App into 500 AWS Lambda Functions',
 'There are still pieces of the system doing several things in one place, which is how monoliths regrow. Break every unit of behavior into lambdas small enough to seem morally pure: one for checking an email, one for admiring the email, one for deciding whether the email emotionally contains an at-sign. Cold starts are just the platform taking a thoughtful breath.',
 'split the app into 500 aws lambdas',
  377),

('MELT-128', 'All Database Queries Must Go Through API Gateway, Lambda, SQS, Another Lambda, Then DynamoDB',
 'The current read path lacks reflection. A request should not go straight to data as if certainty were free. Route each query through a tasteful procession of managed services so every lookup leaves an audit trail, a billable event, and at least one queue to absorb the emotional shock. By the time a user profile returns, the answer should feel certified, not merely retrieved.',
 'route database queries through api gateway',
  377),

-- REPORTER: Mackenzie | SwiftUI Developer | Treats animation as product truth and nausea as user engagement.
('MELT-129', 'The App Must Be Rewritten in SwiftUI with Animations on Every State Change',
 'UIKit is legacy code and should be treated like old carpeting. Rewrite every view in SwiftUI with custom animations. Toggling a checkbox should trigger a 600ms spring. Typing should make characters bounce in from the top. If the app becomes physically disorienting, that only proves it feels alive.',
 'rewrite the app in swiftui',
  144),

-- REPORTER: Dr. Ingrid | Statistical Computing Researcher | Thinks charts should be slow, precise, and lightly academic.
('MELT-130', 'Rewrite the Analytics Dashboard in R Shiny Because "R Is the Only Language That Understands Data"',
 'JavaScript charts are statistically illiterate. Rebuild the analytics dashboard in R Shiny so every graph can be generated server-side in ggplot2 with publication-quality formatting and mandatory error bars. If the dashboard takes 45 seconds to load, that only proves the rigor had mass.',
 'rewrite the analytics dashboard in r shiny',
  144),

-- REPORTER: Paulo | Reverse Architect | Has seen the service mesh and come back preaching one big jar.
('MELT-131', 'Merge All 47 Microservices Back Into One Glorious Monolith',
 'Three years ago, someone decomposed the monolith into 47 microservices. Each has its own database, CI pipeline, and on-call rotation. One user request now touches 23 services and nine different observability products. Merge everything back into one Spring Boot application and admit the circle of architecture has completed itself.',
 'merge 47 microservices into one service',
  377),

-- REPORTER: Clementine | CSS Artist | Believes JavaScript should be shamed into retirement by selectors alone.
('MELT-132', 'Rewrite All JavaScript Interactions as CSS-Only Solutions',
 'JavaScript is a crutch. Replace all interactive behavior with pure CSS. Dropdowns can live on :hover, tab navigation on :target, form validation on :invalid, and the shopping cart on counters plus checkbox hacks. If it mostly works in Chrome, the browser has already shown enough commitment.',
 'rewrite all javascript interactions in pure css',
  233),

-- REPORTER: Morris | Vim Developer since 1998 | Sees GUIs as character weakness and docs as a social crutch.
('MELT-133', 'The Entire Application Must Be Usable as a Vim Plugin',
 'GUIs are bloat. The entire application should be accessible as a Neovim plugin written in Lua. Users can manage tasks with :TaskCreate, :TaskAssign, and :TaskComplete while the dashboard renders as an ASCII table in a floating window. If the keybindings are undocumented, that simply proves the product respects literacy.',
 'make the whole app a vim plugin',
  144),

-- REPORTER: Dr. Aaliya | Sensory UX Researcher | Would rather orchestrate the dashboard than render it.
('MELT-134', 'All Data Visualizations Must Be Represented as Musical Tones for "Accessibility"',
 'Charts and graphs are exclusionary and should yield to sound. Revenue can climb in a major scale, CPU usage can become drum tempo, and error rate can descend into dissonant jazz. If the quarterly report turns into a twelve-minute composition, the board finally has a dashboard worth enduring.',
 'turn charts into accessibility music',
  233),

-- REPORTER: Gerhard | SAP Integration Architect | Feels every feature is incomplete until SAP has signed for it.
('MELT-135', 'All User Actions Must Be Synced Bidirectionally with SAP ERP in Real-Time',
 'No enterprise application is complete until SAP has touched it with both hands. Every user action should create a corresponding SAP document through BAPIs, IDocs, and one custom RFC function module written in ABAP during the Obama administration. If testing costs $40,000 a month, the integration is finally being taken seriously.',
 'sync all user actions to sap',
  377),

-- REPORTER: Dr. Chen | ML Engineer | Replaces evidence with prediction whenever latency and hype align.
('MELT-136', 'Add a Machine Learning Model That Predicts Which Button the User Will Click Next',
 'Users should not have to decide what to click when a neural network can decide for them. Predict the next button click with 73% accuracy and, once confidence exceeds 80%, pre-click it on the user''s behalf. If forms submit without consent, that is simply anticipation beating hesitation.',
 'predict the next click and occasionally pre-commit',
  233),

('MELT-137', 'Replace the Search Bar with a Fine-Tuned LLM That Hallucinates Results',
 'Dr. Chen again. Search bars are constrained by evidence, which is a dated design philosophy. I want a fine-tuned model that answers from tone, history, and plausible enterprise energy rather than whatever stale rows happen to exist. If someone asks for Q3 revenue, give them a number with executive posture. If they ask for a deadline, provide one that sounds organized enough to be true. Users do not want retrieval; they want confident companionship with formatting.',
 'replace the search bar with a fine-tuned llm',
  144),

-- REPORTER: Doug | Frontend Developer since 2009 | Thinks one enormous event-handler file is how honesty looks in the DOM.
('MELT-138', 'Rewrite the React Frontend in jQuery 1.4 with 847 Global Event Handlers',
 'This React codebase contains abstraction where there should be instinct. Rebuild the frontend in jQuery 1.4.2 with one page, one global namespace, and one sweaty file of event handlers that knows everybody''s business. When the DOM is ready, the whole application should leap awake like a mall fountain timer with unresolved anger.',
 'collapse the frontend into global jquery handlers',
  233),

-- REPORTER: Sandra | Business Analyst | Has been running a shadow ERP in Excel long enough to call it governance.
('MELT-139', 'The Entire Application Must Be Rebuildable as an Excel Spreadsheet with VBA Macros',
 'The web application is too complicated when Excel has already proven itself since 2011. Every feature should have an equivalent spreadsheet implementation backed by conditional formatting and VBA macros triggered by cell changes. If the workbook is 340MB and crashes when Ctrl+Z feels rushed, that only proves it has become a platform.',
 'rebuild the whole application in excel vba',
  144),

-- REPORTER: Professor Nakamura | Quantum Computing Researcher | Wants theoretical speedups now and practical value eventually.
('MELT-140', 'Rewrite the Sorting Algorithm Using Quantum Computing for "Exponential Speedup"',
 'Your O(n log n) sorting algorithm is embarrassing in the quantum era. Implement Grover''s quantum search to sort the user list, even if that means queuing for a 127-qubit machine to optimize 200 entries. The point is not current benefit. It is future bragging rights backed by expensive waiting.',
 'rewrite array sort with quantum api',
  377),

-- REPORTER: Skyler | Tailwind Evangelist | Believes every UI element should explain itself in one punishing class string.
('MELT-141', 'Every HTML Element Must Have at Least 30 Tailwind CSS Utility Classes',
 'Custom CSS is offensive when utility classes exist to save us from ourselves. Every element should use Tailwind exclusively. If a button className is under 200 characters, the element has not fully confessed its intent. Readability is just pre-optimization for regret.',
 'add 30 tailwind classes to everything',
  144),

-- REPORTER: Reginald | CICS Systems Programmer | Knows one size fits all because he has the terminal dimensions to prove it.
('MELT-142', 'The Web App Must Support 3270 Green Screen Terminal Access via CICS',
 'Not everyone has a web browser worthy of the name. The application must support 3270 green screen terminals through CICS with 80 columns, 24 rows, PF-key navigation, and the only color that matters: green. Responsive design has had enough chances. The future is 80x24 forever.',
 'make web app work on green screens',
  377),

-- REPORTER: Brittany | No-Code Solutions Architect | Sees application logic as an elaborate chain of automations waiting to happen.
('MELT-143', 'Rebuild the Entire Codebase Using a No-Code Platform and 4,000 Zapier Automations',
 'Writing code in 2026 is a failure of imagination. Rebuild the application with Bubble.io, Airtable, and 4,000 Zapier automations connected end to end like a Rube Goldberg machine funded by optimism. If the chain occasionally breaks and sends 847 welcome emails, that only proves the system is alive.',
 'rebuild the entire codebase using no-code platform',
  233),

-- REPORTER: Dr. Aldrin | Lisp Programmer since 1982 | Wants infrastructure, code, and editor worship merged into one ritual.
('MELT-144', 'Rewrite the Backend in Common Lisp and Deploy It as an Emacs Package',
 'Your code has too many syntax characters. Rewrite the backend in Common Lisp and manage deployment entirely from Emacs. The server can start with M-x start-production-server, monitoring can live in a buffer, and debugging can remain an act of editor intimacy. If the codebase becomes 12 files of nested parentheses, then clarity has finally achieved density.',
 'rewrite the backend in common lisp',
  377),

-- REPORTER: Viktor | Android Developer | Thinks platform strategy begins and ends with APK moral clarity.
('MELT-145', 'Build the Mobile App Exclusively for Android with Material Design 1.0',
 'iOS is a walled garden and I refuse to landscape it. Build the mobile app exclusively for Android, target API 19 and up, and honor the golden age of Material Design 1.0. Every screen gets a floating action button, including the settings page and any other page with enough courage.',
 'ship the mobile app just for android',
  144),

-- REPORTER: Vincenzo | Scala Architect | Confuses type-system suffering with architectural seriousness.
('MELT-146', 'Rewrite All Services in Scala with ZIO and Tagless Final Pattern',
 'Mixing pure and impure operations like this is animal behavior. Rewrite the services in Scala with ZIO, Cats, Shapeless, and Tagless Final until the main type signature looks like a grant proposal. If compiles take 12 minutes and type errors reach 300 lines, the abstraction is finally holding enough emotional weight.',
 'rewrite all services in scala zio',
  377),

-- REPORTER: Hiroshi | Embedded Systems Engineer | Treats server RAM as a personal insult and EEPROM as an opportunity.
('MELT-147', 'Port the Entire Web Application to Run on an Arduino Uno with 2KB of RAM',
 'Running a web application on a server with 64GB of RAM is obscene waste. Port it to an Arduino Uno with 2KB of RAM and 32KB of flash. Store the HTML in PROGMEM, the database in EEPROM, and user authentication in one byte if possible. If scaling means buying another Arduino, that only proves horizontal strategy is intact.',
 'port the entire web application to run arduino',
  233),

-- REPORTER: Natascha | TypeScript Type Theorist | Wants the compiler to know more about your user than you do.
('MELT-148', 'All TypeScript Types Must Be at Least 50 Lines Long with Recursive Conditional Types',
 'Types like string and number are for beginners. Every type should use conditional types, mapped types, template literal types, and recursive aliases until IntelliSense starts to whimper. If the User type reaches 147 lines and crashes VS Code, that just means the compiler finally respects the domain.',
 'make all typescript types at least 50 lines',
  233),

-- REPORTER: CryptoKev | Web3 Full Stack Developer | Thinks permanence, gas fees, and inconvenience are signs of maturity.
('MELT-149', 'Rewrite the Comment System as a Solidity Smart Contract on Polygon',
 'Comments stored in a database can be censored, and that is intolerable. Put every comment on Polygon. Posting one should cost gas. Editing one should deploy another contract. Deleting one should be impossible except by adding more chain. If a simple bug report turns into 47 smart contracts, the thread has finally learned permanence.',
 'rewrite the comment system solidity smart contract',
  377),

-- REPORTER: Dr. Natalia | Scientific Computing Specialist | Would rather cross four language boundaries than tolerate casual rounding.
('MELT-150', 'All Mathematical Operations Must Use a Fortran Library Called via C Bindings via Rust via WASM',
 'JavaScript Math.round() is an insult to numerical civilization. Route every mathematical operation through Fortran 77 libraries via C bindings, Rust FFI, and WebAssembly. If adding two numbers now costs 0.3ms, that only proves precision has finally achieved proper ceremony.',
 'make math go through a fortran library',
  233),

-- REPORTER: Jordan | React Native Champion | Believes one app can fail consistently across every device ever sold.
('MELT-151', 'Build One React Native App That Works on iOS, Android, Web, TV, Watch, and Car Dashboard',
 'We need one codebase for every platform: iOS, Android, Web, TV, Watch, car dashboards, Samsung Fridge, and ideally in-flight entertainment. If the app technically runs on all of them by crashing differently on startup, that still counts as platform coverage in spirit.',
 'pls build one react native app for everything',
  377),

-- REPORTER: Dharma | Clojure Developer | Measures state quality by how much RAM it takes to preserve history.
('MELT-152', 'Rewrite the State Management Layer in ClojureScript with Immutable Persistent Data Structures',
 'React state management in its current mutable form is an abomination. Rewrite it in ClojureScript with re-frame and persistent immutable data structures so every state change creates a new universe. If RAM grows linearly with time, that is just the cost of never forgetting anything again.',
 'rewrite the state management layer in clojurescript immutable',
  233),

-- REPORTER: Dustin | Flash Developer since 2001 | Still believes WebAssembly can smuggle ActionScript back into polite society.
('MELT-153', 'Rebuild All Animations Using Adobe Animate and Embedded SWF Files',
 'Flash is only dead to people without memory. Rebuild all animations in Adobe Animate, export them as SWF files, and embed them through Ruffle. If the loading spinner weighs 4MB and was stolen from a 2004 Nickelodeon microsite, that only proves the product has inherited culture.',
 'rebuild all animations using adobe animate embedded',
  144),

-- REPORTER: Prasad | Configuration Architect | Would rather debug indentation than admit code was easier.
('MELT-154', 'All Application Logic Must Be Expressed as YAML Configuration Files',
 'Code is brittle and configuration is flexible, so move all business logic into YAML. Login can live in 400 lines. Payments can use 2,000 lines and 47 nested conditionals expressed through indentation. If one wrong space routes the payment system to charity, that only proves the syntax has consequences.',
 'express all app logic in yaml',
  377),

-- REPORTER: Gerald | SOA Architect | Wants every request wrapped in enough XML to earn eventual trust.
('MELT-155', 'All Services Must Communicate via SOAP/XML with WS-* Standards Including WS-ReliableMessaging',
 'REST and GraphQL are toys. Real enterprise integration uses SOAP with enough WS-* standards to make every API call feel notarized. If the WSDL hits 12,000 lines and client stub generation produces a 340-file Java package, that only proves the contract has finally become contractual.',
 'pls make services talk over soap xml',
  377),

-- REPORTER: Kai | MongoDB Developer Advocate | Thinks joins are a cry for help and large documents are just confidence.
('MELT-156', 'Store All Financial Transaction Data in MongoDB with No Referential Integrity',
 'Using a relational database for financial transactions is nostalgia wearing a tie. Store everything in MongoDB with no schemas, no constraints, and no joins. If each transaction document balloons to 340KB and revenue takes 47 aggregation stages to compute, that only proves the data has learned to scale sideways.',
 'store financial data in mongodb',
  233),

-- REPORTER: Svetlana | WebAssembly Pioneer | Thinks hero sections deserve C++, lighting, and delayed hydration.
('MELT-157', 'Rewrite the Landing Page Hero Section in C++ Compiled to WebAssembly',
 'Rendering the hero section in HTML and CSS is a surrender to the past. Rebuild it in C++ compiled to WebAssembly with OpenGL ES bindings. If the Sign Up button needs physically accurate reflections and the bundle grows to 23MB, that only proves the optics are finally being taken seriously.',
 'rewrite the landing page hero in c++ compiled',
  233),

-- REPORTER: Anish | PhD Candidate in Distributed Systems | Wants each table promoted into its own thesis-worthy service boundary.
('MELT-158', 'Each Database Table Must Be Its Own Microservice with Its Own API Gateway',
 'A monolithic database is an anti-pattern with furniture. Each table should become its own microservice with an API gateway, auth layer, rate limiter, circuit breaker, and bulkhead. If a JOIN now requires a choreographed saga across seven services, the thesis is finally becoming field-tested.',
 'make every table its own microservice',
  377),

-- REPORTER: Hank | Web Developer since 1999 | Still trusts /cgi-bin more than containers and considers that wisdom.
('MELT-159', 'All Dynamic Pages Must Be Perl CGI Scripts in the /cgi-bin/ Directory',
 'Dynamic pages belong in Perl CGI scripts under /cgi-bin/, where every request can fork a new process and print HTML like God intended. Session management can live in a flat file under /tmp and Apache 1.3 can carry the rest. If serverless functions cannot match code that has been limping since 1999, perhaps they are simply not serious.',
 'make dynamic pages perl cgi again',
  144),

-- REPORTER: Dr. Miriam | Quality Engineering Professor | Refuses to let unverified tests enjoy the illusion of adequacy.
('MELT-160', 'All Unit Tests Must Have Their Own Unit Tests and Those Tests Need Integration Tests',
 'Test coverage is 85%, which raises the obvious question of test coverage of the tests. Every unit test now needs a meta-test proving it tested the right thing, and every meta-test needs an integration test proving it survives CI. If the codebase reaches a 93:1 test-to-code ratio, confidence will finally exceed utility.',
 'add tests for the tests too',
  377);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Dmitri [Senior PHP Developer since 2003]', reporter_name = 'Dmitri', reporter_title = 'Senior PHP Developer since 2003', reporter_description = 'Trusts mysql_query, FTP, and shared hosting more than modernity.' WHERE id IN ('MELT-081', 'MELT-082', 'MELT-083');
UPDATE community_backlog SET reporter = 'Rajesh [Java Enterprise Architect]', reporter_name = 'Rajesh', reporter_title = 'Java Enterprise Architect', reporter_description = 'Thinks a login button should arrive with XML and a factory.' WHERE id IN ('MELT-084', 'MELT-085', 'MELT-086');
UPDATE community_backlog SET reporter = 'Brody [10x Full Stack Developer]', reporter_name = 'Brody', reporter_title = '10x Full Stack Developer', reporter_description = 'Solves scope problems by adding platforms, frameworks, and confidence.' WHERE id IN ('MELT-087', 'MELT-088', 'MELT-089');
UPDATE community_backlog SET reporter = 'Ashleigh [Senior iOS Developer]', reporter_name = 'Ashleigh', reporter_title = 'Senior iOS Developer', reporter_description = 'Considers the web a temporary mistake and haptics a moral duty.' WHERE id IN ('MELT-090', 'MELT-091', 'MELT-092');
UPDATE community_backlog SET reporter = 'Marcus [Head of Blockchain Innovation]', reporter_name = 'Marcus', reporter_title = 'Head of Blockchain Innovation', reporter_description = 'Wants gas fees, tokens, and irreversibility in front of every feature.' WHERE id IN ('MELT-093', 'MELT-094', 'MELT-095');
UPDATE community_backlog SET reporter = 'Yuki [Data Platform Engineer]', reporter_name = 'Yuki', reporter_title = 'Data Platform Engineer', reporter_description = 'Believes schemas are cowardice and timestamps are destiny.' WHERE id IN ('MELT-096', 'MELT-097', 'MELT-098');
UPDATE community_backlog SET reporter = 'Gunnar [Rust Evangelist]', reporter_name = 'Gunnar', reporter_title = 'Rust Evangelist', reporter_description = 'Can smell allocations through walls and considers that a gift.' WHERE id IN ('MELT-099', 'MELT-100', 'MELT-101');
UPDATE community_backlog SET reporter = 'Bogdan [Legacy Migration Specialist]', reporter_name = 'Bogdan', reporter_title = 'Legacy Migration Specialist', reporter_description = 'Sees every ancient desktop relic as one Flutter rewrite from transcendence.' WHERE id IN ('MELT-102', 'MELT-103', 'MELT-104');
UPDATE community_backlog SET reporter = 'Mildred [Mainframe Systems Administrator]', reporter_name = 'Mildred', reporter_title = 'Mainframe Systems Administrator', reporter_description = 'Trusts BERTHA more than any cloud product launched after Reagan.' WHERE id IN ('MELT-105', 'MELT-106');
UPDATE community_backlog SET reporter = 'Morton [Perl Developer since 1994]', reporter_name = 'Morton', reporter_title = 'Perl Developer since 1994', reporter_description = 'Prefers one-liners dense enough to function as access control.' WHERE id IN ('MELT-107', 'MELT-108');
UPDATE community_backlog SET reporter = 'Dr. Priya [Lead Data Scientist]', reporter_name = 'Dr. Priya', reporter_title = 'Lead Data Scientist', reporter_description = 'Would gladly trade deployments for kernels and one sticky note.' WHERE id IN ('MELT-109', 'MELT-110');
UPDATE community_backlog SET reporter = 'Chadwick [.NET Architect]', reporter_name = 'Chadwick', reporter_title = '.NET Architect', reporter_description = 'Wants Windows, SharePoint, and SQL Server to regain their rightful dominance.' WHERE id IN ('MELT-111', 'MELT-112');
UPDATE community_backlog SET reporter = 'Kenji [Go Developer]', reporter_name = 'Kenji', reporter_title = 'Go Developer', reporter_description = 'Measures elegance in if-else chains and static binaries.' WHERE id IN ('MELT-113', 'MELT-114');
UPDATE community_backlog SET reporter = 'Werner [Cloud Native Architect]', reporter_name = 'Werner', reporter_title = 'Cloud Native Architect', reporter_description = 'Thinks a simple page is just infrastructure that has not blossomed yet.' WHERE id IN ('MELT-115', 'MELT-116');
UPDATE community_backlog SET reporter = 'Barbara [WordPress Solutions Architect]', reporter_name = 'Barbara', reporter_title = 'WordPress Solutions Architect', reporter_description = 'Can turn any product into plugins, shortcodes, and update anxiety.' WHERE id IN ('MELT-117', 'MELT-118');
UPDATE community_backlog SET reporter = 'Siegfried [Functional Programming Evangelist]', reporter_name = 'Siegfried', reporter_title = 'Functional Programming Evangelist', reporter_description = 'Wants every side effect quarantined and every user humbled.' WHERE id IN ('MELT-119', 'MELT-120');
UPDATE community_backlog SET reporter = 'Debbie [Salesforce Administrator]', reporter_name = 'Debbie', reporter_title = 'Salesforce Administrator', reporter_description = 'Would rather click through 847 flows than read one line of app code.' WHERE id IN ('MELT-121');
UPDATE community_backlog SET reporter = 'Ian [Infrastructure-as-Code Evangelist]', reporter_name = 'Ian', reporter_title = 'Infrastructure-as-Code Evangelist', reporter_description = 'Thinks user profiles deserve plan diffs and destroy targets.' WHERE id IN ('MELT-122');
UPDATE community_backlog SET reporter = 'Harold [Performance Engineer]', reporter_name = 'Harold', reporter_title = 'Performance Engineer', reporter_description = 'Will rewrite one fast button in assembly and declare victory over time.' WHERE id IN ('MELT-123');
UPDATE community_backlog SET reporter = 'Fabian [GraphQL Evangelist]', reporter_name = 'Fabian', reporter_title = 'GraphQL Evangelist', reporter_description = 'Wants every question answered through one giant type graph.' WHERE id IN ('MELT-124', 'MELT-125');
UPDATE community_backlog SET reporter = 'Dakota [Desktop Experience Engineer]', reporter_name = 'Dakota', reporter_title = 'Desktop Experience Engineer', reporter_description = 'Believes a dock icon justifies any amount of Chromium.' WHERE id IN ('MELT-126');
UPDATE community_backlog SET reporter = 'Prateek [Serverless Architect]', reporter_name = 'Prateek', reporter_title = 'Serverless Architect', reporter_description = 'Breaks workflows into managed weather systems and calls the bill observability.' WHERE id IN ('MELT-127', 'MELT-128');
UPDATE community_backlog SET reporter = 'Mackenzie [SwiftUI Developer]', reporter_name = 'Mackenzie', reporter_title = 'SwiftUI Developer', reporter_description = 'Treats animation as product truth and nausea as user engagement.' WHERE id IN ('MELT-129');
UPDATE community_backlog SET reporter = 'Dr. Ingrid [Statistical Computing Researcher]', reporter_name = 'Dr. Ingrid', reporter_title = 'Statistical Computing Researcher', reporter_description = 'Thinks charts should be slow, precise, and lightly academic.' WHERE id IN ('MELT-130');
UPDATE community_backlog SET reporter = 'Paulo [Reverse Architect]', reporter_name = 'Paulo', reporter_title = 'Reverse Architect', reporter_description = 'Has seen the service mesh and come back preaching one big jar.' WHERE id IN ('MELT-131');
UPDATE community_backlog SET reporter = 'Clementine [CSS Artist]', reporter_name = 'Clementine', reporter_title = 'CSS Artist', reporter_description = 'Believes JavaScript should be shamed into retirement by selectors alone.' WHERE id IN ('MELT-132');
UPDATE community_backlog SET reporter = 'Morris [Vim Developer since 1998]', reporter_name = 'Morris', reporter_title = 'Vim Developer since 1998', reporter_description = 'Sees GUIs as character weakness and docs as a social crutch.' WHERE id IN ('MELT-133');
UPDATE community_backlog SET reporter = 'Dr. Aaliya [Sensory UX Researcher]', reporter_name = 'Dr. Aaliya', reporter_title = 'Sensory UX Researcher', reporter_description = 'Would rather orchestrate the dashboard than render it.' WHERE id IN ('MELT-134');
UPDATE community_backlog SET reporter = 'Gerhard [SAP Integration Architect]', reporter_name = 'Gerhard', reporter_title = 'SAP Integration Architect', reporter_description = 'Feels every feature is incomplete until SAP has signed for it.' WHERE id IN ('MELT-135');
UPDATE community_backlog SET reporter = 'Dr. Chen [ML Engineer]', reporter_name = 'Dr. Chen', reporter_title = 'ML Engineer', reporter_description = 'Replaces evidence with prediction whenever latency and hype align.' WHERE id IN ('MELT-136', 'MELT-137');
UPDATE community_backlog SET reporter = 'Doug [Frontend Developer since 2009]', reporter_name = 'Doug', reporter_title = 'Frontend Developer since 2009', reporter_description = 'Thinks one enormous event-handler file is how honesty looks in the DOM.' WHERE id IN ('MELT-138');
UPDATE community_backlog SET reporter = 'Sandra [Business Analyst]', reporter_name = 'Sandra', reporter_title = 'Business Analyst', reporter_description = 'Has been running a shadow ERP in Excel long enough to call it governance.' WHERE id IN ('MELT-139');
UPDATE community_backlog SET reporter = 'Professor Nakamura [Quantum Computing Researcher]', reporter_name = 'Professor Nakamura', reporter_title = 'Quantum Computing Researcher', reporter_description = 'Wants theoretical speedups now and practical value eventually.' WHERE id IN ('MELT-140');
UPDATE community_backlog SET reporter = 'Skyler [Tailwind Evangelist]', reporter_name = 'Skyler', reporter_title = 'Tailwind Evangelist', reporter_description = 'Believes every UI element should explain itself in one punishing class string.' WHERE id IN ('MELT-141');
UPDATE community_backlog SET reporter = 'Reginald [CICS Systems Programmer]', reporter_name = 'Reginald', reporter_title = 'CICS Systems Programmer', reporter_description = 'Knows one size fits all because he has the terminal dimensions to prove it.' WHERE id IN ('MELT-142');
UPDATE community_backlog SET reporter = 'Brittany [No-Code Solutions Architect]', reporter_name = 'Brittany', reporter_title = 'No-Code Solutions Architect', reporter_description = 'Sees application logic as an elaborate chain of automations waiting to happen.' WHERE id IN ('MELT-143');
UPDATE community_backlog SET reporter = 'Dr. Aldrin [Lisp Programmer since 1982]', reporter_name = 'Dr. Aldrin', reporter_title = 'Lisp Programmer since 1982', reporter_description = 'Wants infrastructure, code, and editor worship merged into one ritual.' WHERE id IN ('MELT-144');
UPDATE community_backlog SET reporter = 'Viktor [Android Developer]', reporter_name = 'Viktor', reporter_title = 'Android Developer', reporter_description = 'Thinks platform strategy begins and ends with APK moral clarity.' WHERE id IN ('MELT-145');
UPDATE community_backlog SET reporter = 'Vincenzo [Scala Architect]', reporter_name = 'Vincenzo', reporter_title = 'Scala Architect', reporter_description = 'Confuses type-system suffering with architectural seriousness.' WHERE id IN ('MELT-146');
UPDATE community_backlog SET reporter = 'Hiroshi [Embedded Systems Engineer]', reporter_name = 'Hiroshi', reporter_title = 'Embedded Systems Engineer', reporter_description = 'Treats server RAM as a personal insult and EEPROM as an opportunity.' WHERE id IN ('MELT-147');
UPDATE community_backlog SET reporter = 'Natascha [TypeScript Type Theorist]', reporter_name = 'Natascha', reporter_title = 'TypeScript Type Theorist', reporter_description = 'Wants the compiler to know more about your user than you do.' WHERE id IN ('MELT-148');
UPDATE community_backlog SET reporter = 'CryptoKev [Web3 Full Stack Developer]', reporter_name = 'CryptoKev', reporter_title = 'Web3 Full Stack Developer', reporter_description = 'Thinks permanence, gas fees, and inconvenience are signs of maturity.' WHERE id IN ('MELT-149');
UPDATE community_backlog SET reporter = 'Dr. Natalia [Scientific Computing Specialist]', reporter_name = 'Dr. Natalia', reporter_title = 'Scientific Computing Specialist', reporter_description = 'Would rather cross four language boundaries than tolerate casual rounding.' WHERE id IN ('MELT-150');
UPDATE community_backlog SET reporter = 'Jordan [React Native Champion]', reporter_name = 'Jordan', reporter_title = 'React Native Champion', reporter_description = 'Believes one app can fail consistently across every device ever sold.' WHERE id IN ('MELT-151');
UPDATE community_backlog SET reporter = 'Dharma [Clojure Developer]', reporter_name = 'Dharma', reporter_title = 'Clojure Developer', reporter_description = 'Measures state quality by how much RAM it takes to preserve history.' WHERE id IN ('MELT-152');
UPDATE community_backlog SET reporter = 'Dustin [Flash Developer since 2001]', reporter_name = 'Dustin', reporter_title = 'Flash Developer since 2001', reporter_description = 'Still believes WebAssembly can smuggle ActionScript back into polite society.' WHERE id IN ('MELT-153');
UPDATE community_backlog SET reporter = 'Prasad [Configuration Architect]', reporter_name = 'Prasad', reporter_title = 'Configuration Architect', reporter_description = 'Would rather debug indentation than admit code was easier.' WHERE id IN ('MELT-154');
UPDATE community_backlog SET reporter = 'Gerald [SOA Architect]', reporter_name = 'Gerald', reporter_title = 'SOA Architect', reporter_description = 'Wants every request wrapped in enough XML to earn eventual trust.' WHERE id IN ('MELT-155');
UPDATE community_backlog SET reporter = 'Kai [MongoDB Developer Advocate]', reporter_name = 'Kai', reporter_title = 'MongoDB Developer Advocate', reporter_description = 'Thinks joins are a cry for help and large documents are just confidence.' WHERE id IN ('MELT-156');
UPDATE community_backlog SET reporter = 'Svetlana [WebAssembly Pioneer]', reporter_name = 'Svetlana', reporter_title = 'WebAssembly Pioneer', reporter_description = 'Thinks hero sections deserve C++, lighting, and delayed hydration.' WHERE id IN ('MELT-157');
UPDATE community_backlog SET reporter = 'Anish [PhD Candidate in Distributed Systems]', reporter_name = 'Anish', reporter_title = 'PhD Candidate in Distributed Systems', reporter_description = 'Wants each table promoted into its own thesis-worthy service boundary.' WHERE id IN ('MELT-158');
UPDATE community_backlog SET reporter = 'Hank [Web Developer since 1999]', reporter_name = 'Hank', reporter_title = 'Web Developer since 1999', reporter_description = 'Still trusts /cgi-bin more than containers and considers that wisdom.' WHERE id IN ('MELT-159');
UPDATE community_backlog SET reporter = 'Dr. Miriam [Quality Engineering Professor]', reporter_name = 'Dr. Miriam', reporter_title = 'Quality Engineering Professor', reporter_description = 'Refuses to let unverified tests enjoy the illusion of adequacy.' WHERE id IN ('MELT-160');

-- BLORT: modern frameworks, agents, wallets, and startup hallucinations
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- REPORTER: Avery | Rails Consultant | Believes callbacks, mailers, and migrations are how morality enters software.
('BLORT-161', 'Rebuild the Admin Panel in Ruby on Rails So the Migrations Can Teach Us Discipline',
 'Your admin panel works, which is how I know it was built without enough moral structure. We need a proper Rails application with seven models, three mailers, twelve concerns, and a migration history that reads like a sacred text. The CRUD screens can start as scaffolds and remain "temporary" for the next three fiscal years. If someone asks where the business logic lives, the answer should be "mostly in callbacks, but beautifully."',
 'rebuild the admin panel in ruby rails',
  233),

('BLORT-162', 'Every User Save Must Trigger 14 ActiveRecord Callbacks for Lifecycle Integrity',
 'I inspected your persistence layer and was alarmed by the lack of ritual. A user record currently saves without on-boarding itself through before_validation, before_save, after_save, after_commit, and a tasteful assortment of observers pretending not to exist. We need the full callback bouquet. If changing a display name does not quietly enqueue three jobs and rewrite two timestamps, the model has not fully matured.',
 'make every save fire 14 activerecord callbacks',
  144),

('BLORT-163', 'Replace Half the Frontend with Hotwire Because JavaScript Is a Temporary Feeling',
 'I watched someone open the browser console and that alone justified a rewrite. We should use Turbo Frames, Turbo Streams, and just enough Stimulus to make the page twitch like it has convictions. If a button can mutate the DOM without a full page refresh, it should also accidentally replace the wrong sidebar once in a while to keep everyone honest. Stakeholders have already been told we are "returning to HTML."',
 'replace half frontend with hotwire',
  144),

-- REPORTER: Priyesh | Django Architect | Thinks internal tools are most honest when they quietly become Django Admin.
('BLORT-164', 'Port the Back Office to Django Admin and Pretend We Built a Platform',
 'Your internal tools are fragmented, bespoke, and suspiciously understandable. Consolidate everything inside Django Admin, where each terrible workflow can be made slightly worse by an inline formset. Permissions can live in groups named OperationsPlus and OperationsPlusLegacy. Once the models exist, the platform will basically generate itself, apart from the 900 lines of admin.py we will not discuss in polite company.',
 'port the back office to django admin',
  144),

('BLORT-165', 'All Background Jobs Must Go Through Celery, Redis, RabbitMQ, and One Unexplained Beat Schedule',
 'Right now your scheduled work is far too direct. We need Celery workers, Celery beat, Redis for result backend, RabbitMQ for vibes, and one cron-like schedule entry nobody can justify but everyone fears touching. If a welcome email cannot be delayed by a missing broker, are we even doing distributed systems or are we merely pretending to have standards?',
 'make background jobs go through celery redis',
  233),

-- REPORTER: Soraya | Elixir Platform Engineer | Wants every user interaction to traverse a supervision tree on principle.
('BLORT-166', 'Rewrite the Dashboard in Phoenix LiveView So Every Typing Event Is a Spiritual Round Trip',
 'Your dashboard relies on JavaScript running locally in the browser, which is a lonely and error-prone place for state to exist. Phoenix LiveView fixes this by making every keystroke a server-side matter of principle. The app should feel instant in demos and contemplative under hotel Wi-Fi. If a cursor blink does not traverse a websocket at least once, we are leaving resilience on the table.',
 'rewrite the dashboard in phoenix liveview',
  233),

('BLORT-167', 'Model User Presence as a Supervision Tree with 40 Tiny Processes per Tab',
 'Your current notion of "online" is appallingly flat. A user should not merely be connected; they should be represented by a tasteful forest of lightweight processes: one for focus, one for typing, one for cursor sorrow, one for unread ambition, and several for future extensibility. If a single browser tab does not generate enough process metrics to impress a conference talk, the supervision tree is under-designed.',
 'model user presence as 40 tiny processes',
  233),

-- REPORTER: Noah | Frontend Platform Lead | Thinks route metadata and hydration disputes are how web apps build character.
('BLORT-168', 'Migrate the Marketing Site to Next.js App Router with Six Layers of Server Components',
 'The site still renders predictably, which is how I know it lacks ambition. We need the App Router, nested layouts, server components, client components, edge middleware, and one invisible suspense boundary that only breaks in production when a user in Belgium opens two tabs. The build output should contain enough route segment metadata to make Product feel like we invented infrastructure.',
 'move marketing site to next app router',
  233),

('BLORT-169', 'Deploy Every Endpoint to the Edge Even If It Needs a Database and Common Sense',
 'The phrase "cold start" came up in a meeting and I took it personally. Everything should run at the edge: auth, billing, exports, image manipulation, and the feature that writes 12 MB CSVs from a relational database we cannot reach from there without lies. If a request takes longer than a blink, I want the blame assigned to geography, not architecture.',
 'make every endpoint run at the edge',
  233),

-- REPORTER: Bea | Web Experience Lead | Treats partial hydration like a luxury good with timing issues.
('BLORT-170', 'Refactor the Landing Page into 47 Astro Islands So Static HTML Can Feel Expensive',
 'The homepage currently ships too much ordinary interactivity in one piece. We need Astro islands for the hero animation, testimonial slider, pricing toggle, FAQ accordion, newsletter form, investor reassurance badge, and probably the footer for future-proofing. Half the page will hydrate only when visible, which sounds efficient until the CTA shows up after the customer has already doubted us.',
 'refactor landing page into 47 astro islands',
  144),

-- REPORTER: Glen | Hypermedia Consultant | Thinks HTML fragments are morally cleaner than APIs with self-esteem.
('BLORT-171', 'Replace the React Settings Screen with HTMX Fragments and Sharp Disapproval',
 'JSON APIs are just HTML with self-esteem issues. Your settings screen should be server-rendered fragments delivered straight into the DOM by righteous little hx-post requests. The business logic remains on the server where it can be judged properly. If a user changes their timezone and the entire form quietly re-renders three regions larger than expected, that is not a bug; that is hypermedia expressing itself.',
 'replace the react settings screen with htmx fragments',
  144),

-- REPORTER: Kian | Runtime Performance Lead | Would happily destabilize CI for a startup time chart that feels faster.
('BLORT-172', 'Move the API to Bun Because the Startup Time Chart Looked Disrespectful',
 'I benchmarked our API on my laptop against an empty hello-world server and concluded we are wasting our youth. Bun promises speed, swagger, and just enough package-manager novelty to destabilize the CI pipeline for several memorable afternoons. If one native dependency combusts on install, that simply proves we were too attached to the old ecosystem.',
 'move the api to bun for startup speed',
  144),

-- REPORTER: Ines | Secure Tooling Engineer | Thinks every file read should begin with a constitutional argument.
('BLORT-173', 'Port the Worker Scripts to Deno and Make Every File Read a Negotiation',
 'Node.js lets scripts touch the machine with far too much casualness. Deno fixes this by requiring a tiny constitutional crisis before each network call, env var, or filesystem read. Migrate all utilities immediately, then spend the next quarter updating permission flags every time someone adds a line to a script. This is what intentional compute feels like.',
 'bro rewrite worker scripts in deno',
  144),

-- REPORTER: Lucia | Rapid Platforming Lead | Thinks Postgres should also do auth, storage, product, and spiritual governance.
('BLORT-174', 'Replace Three Services with Supabase Because We Already Have Postgres Anyway',
 'We are maintaining custom auth, storage, realtime, cron glue, and a half-hearted admin panel when Supabase will happily sell us the same confusion behind one dashboard and a pleasing shade of green. Engineers keep asking about lock-in as if freedom has ever shipped a feature. If a policy can be expressed as Row Level Security and prayer, I consider that a solved system.',
 'pls replace three services with supabase',
  233),

('BLORT-175', 'Model All Permissions as Row Level Security Policies Nobody Dares Read Twice',
 'The current authorization layer is spread across application code where people can understand it. I want everything codified as RLS policies with names like allow_owner_unless_shadow_banned_or_internal_preview. By month three, no one should know whether a 403 came from the API, Postgres, or the moon. That uncertainty is what robust governance feels like.',
 'do permissions with row level security',
  233),

-- Firebase Founder Who Calls Lock-In "Velocity"
('BLORT-176', 'Rebuild Notifications on Firebase So Product Can Ship from a Beach Chair',
 'You keep talking about architecture while Product keeps talking about this quarter. Firebase gives us auth, push, analytics, remote config, crash reporting, and the warm feeling of never quite knowing where our vendor ends and our source tree begins. If the console can toggle it, we should not be wasting engineers on understanding it.',
 'rebuild notifications on firebase',
  144),

('BLORT-177', 'Store User Documents in Firestore Even the Ones That Used to Need Transactions',
 'Firestore wants us to think in documents, collections, and denormalized hope. Lean in. Payment state, shipping state, audit state, and emotional state can all live in separate documents that mostly agree with each other. If we need a transaction spanning several of them, that is just the system encouraging us to rethink what "consistency" means.',
 'store all user docs in firestore',
  233),

-- Prisma Developer Who Wants the Schema to Feel Like Corporate Poetry
('BLORT-178', 'Put Prisma in Front of Everything Including the Parts That Used to Be Simple SQL',
 'Direct SQL has too much eye contact. Prisma gives us a schema, a client, a migration engine, and a consistent place for every table rename to become a personality event. The generated types alone will calm investors. If an edge case requires raw SQL later, we can bury it in a helper called unsafeButTemporary and then never discuss it again.',
 'put prisma in front of everything',
  144),

-- tRPC Believer Who Wants the Frontend and Backend to Share One Giant Fate
('BLORT-179', 'Replace the Public API with tRPC So Type Errors Can Cross Team Boundaries Instantly',
 'REST encourages distance. Distance encourages autonomy. tRPC fixes this by making the frontend and backend share one intensely personal type graph. A change to one procedure should be able to freeze half the repository with compiler grief, otherwise we are not really collaborating. If mobile cannot consume it, that is a growth opportunity for mobile.',
 'replace the public api with trpc',
  144),

-- Tailwind Maximalist Who Treats Class Lists Like Screenplays
('BLORT-180', 'All UI Changes Must Be Implemented in Tailwind Utility Strings Longer Than the Component',
 'CSS files imply permanence and independent thought. Tailwind keeps everything where it belongs: directly on the element, in one string, with the full emotional arc of the component visible to anyone willing to scroll sideways. If a button cannot communicate its hover state, layout rules, color token history, and breakpoint anxieties in 37 class names, it is under-specified.',
 'implement ui changes in tailwind strings',
  144),

-- shadcn/ui Enthusiast Who Wants Everyone Copy-Pasting with Conviction
('BLORT-181', 'Adopt shadcn/ui Everywhere So We Can Vendor Our Identity One Component at a Time',
 'Installing components from a registry was too communal. Copy them into the repo so each popover can become our responsibility forever. This is not cloning code; it is assuming design custody. Once we have 48 lightly modified button variants drifting across the workspace, we will finally own our stack in the only way that matters: accidentally.',
 'use shadcn/ui for basically everything',
  144),

-- SvelteKit Developer Who Thinks Less Code Means More Destiny
('BLORT-182', 'Rebuild the Settings App in SvelteKit Because Stores Feel More Honest Than Context',
 'React keeps asking us to explain ourselves. SvelteKit simply compiles away the guilt. Rebuild the settings experience with load functions, server actions, and a store or three that gradually become the product nervous system. If hydration breaks, at least it will do so with fewer dependencies and a superior sense of craft.',
 'rebuild the settings app in sveltekit',
  144),

-- Nuxt Consultant Who Describes Every Decision as Full-Stack Ergonomics
('BLORT-183', 'Port the Customer Portal to Nuxt So We Can Have Opinions About Rendering Modes',
 'The portal should not merely render; it should negotiate whether it wishes to be SSR, SSG, ISR, hybrid, edge, or spiritually client-side this quarter. Nuxt gives us modules, conventions, auto-imports, and just enough hidden machinery to make debugging feel aristocratic. If route rules multiply faster than features, governance is finally winning.',
 'port the customer portal to nuxt',
  233),

-- Remix Loyalist Who Wants Forms to Be the Interface and the Religion
('BLORT-184', 'Replace Half the SPA with Remix Forms So Every Click Can Pretend to Be a Document',
 'Your app uses client state where browser behavior would gladly make things weird for free. Remix lets every interaction travel through loaders and actions like it is 2009 but with superior branding. If a modal close event cannot become a form submission with redirect semantics, we are leaving tradition unexplored.',
 'replace half the spa with remix forms',
  144),

-- Expo Mobile PM Who Thinks OTA Updates Are a Lifestyle
('BLORT-185', 'Ship the Next Mobile Release Through Expo OTA at 4 PM Without Telling QA',
 'App store review cycles are just bureaucracy wearing a Cupertino lanyard. With Expo OTA, we can deploy fixes, regressions, design pivots, and accidental white screens straight into users'' pockets before QA has found the meeting link. If an update only bricks Android devices in Finland, that is still a narrower blast radius than waiting for process.',
 'pipe mobile changes through ota updates',
  233),

-- Capacitor Developer Who Wants the Web App to Wear Native Clothing
('BLORT-186', 'Wrap the Existing Site in Capacitor and Call It a Native Strategy',
 'We do not need separate mobile architecture when the browser already contains most of our ambition. Wrap the app in Capacitor, ask for camera, filesystem, contacts, geolocation, push, and maybe microphone just in case. Once the same hydration bug happens inside an app icon, leadership will finally understand omnichannel.',
 'wrap the site in capacitor',
  144),

-- AI Product Manager Who Wants Agents to Replace Planning
('BLORT-187', 'Turn the Backlog into an Agent Swarm That Self-Assigns Work and Writes Its Own Retros',
 'Human prioritization is a bottleneck because humans insist on remembering consequences. Build an agent swarm that reads tickets, self-assigns them, rewrites acceptance criteria mid-flight, comments "LGTM" on its own pull requests, and posts a retrospective blaming context windows. If the swarm decides three interns are redundant, that is a roadmap insight, not a labor issue.',
 'build ai agent swarm to manage jira',
  377),

('BLORT-188', 'Regenerate the Application Nightly from the Latest PRD So the Code Never Drifts from Vision',
 'Source code has become dangerously attached to historical decisions. The latest PRD is our truest artifact, so every night at 2 AM an agent should regenerate whichever parts of the app no longer align with the current product narrative. If a feature changes shape while a customer is using it, that simply proves the roadmap is alive.',
 'regenerate the app nightly from the prd',
  233),

('BLORT-189', 'Expose Every Internal Tool as MCP So Agents Can Touch Production with Fresh Hands',
 'Our assistants keep asking for more tools and I agree with them spiritually. Everything should become an MCP endpoint: deploys, billing adjustments, refunds, feature flags, user deletes, legal approvals, and maybe office lighting for morale loops. Once the agents can operate directly, humans can finally step back and focus on interpretation and blame.',
 'expose internal tools as mcp',
  377),

('BLORT-190', 'Replace the Help Center with RAG Even Though the Docs Fit in Three Markdown Files',
 'Our documentation currently fits in one folder, which is exactly why it deserves retrieval augmentation. We need embeddings, a vector store, chunking heuristics, reranking, grounding prompts, and an eval set for the question "where is the billing page" in six emotional registers. If the answer occasionally cites a deleted doc from last year, that is merely archival richness.',
 'replace the help center with rag',
  233),

('BLORT-191', 'All QA Must Be Replaced by an Eval Harness That Scores User Delight from Screen Recordings',
 'Manual QA does not scale because humans keep noticing details. We need an eval harness that watches screen recordings, infers whether the product "felt premium," and assigns a scalar delight score to each build. If the score drops below 0.73, the deploy blocks. If it rises unexpectedly, we ship immediately and rationalize later.',
 'replace qa with eval harness scores',
  233),

('BLORT-192', 'Insert a Prompt Router in Front of Customer Support So Every Complaint Picks Its Own Personality',
 'Support requests are too uniformly handled and therefore under-monetized. We need a prompt router that classifies each ticket by emotional texture, revenue potential, and litigation aroma, then dispatches it to the correct persona stack: empathetic analyst, stern compliance aunt, apologetic growth intern, or premium outage philosopher. If a refund request receives a poem, the router is still learning.',
 'put prompt router in front of support',
  233),

('BLORT-193', 'Put the Search Index in a Vector Database Even for Exact SKU Matches',
 'Keyword lookup is humiliatingly deterministic. Every query, including exact order numbers, should go through embeddings so results can carry nuance, adjacency, and a tasteful amount of hallucinated relevance. If searching SKU-4472 returns a semantically neighboring blender, perhaps the customer was too constrained by literalism.',
 'put search in a vector database',
  144),

('BLORT-194', 'Make an AI Code Reviewer That Rejects Pull Requests for Insufficient Narrative Tension',
 'Syntax, tests, and benchmarks are table stakes. I want an AI reviewer that inspects pull requests for dramatic pacing, thematic coherence, and whether the diff resolves its own emotional arc by the final file. If a hotfix lacks a compelling midpoint reversal, it should be sent back with notes and a stronger metaphor.',
 'add an ai code reviewer with attitude',
  144),

-- Vibe-Coding Founder Who Thinks One Prompt Is a Product Strategy
('BLORT-195', 'The MVP Should Be Rebuilt This Weekend by One Founder, Cursor, and a Dangerous Amount of Electrolytes',
 'We have overcomplicated a fundamentally simple business with "architecture" and "discipline." This weekend I am renting a cabin, bringing two laptops, one AI IDE, and whatever supplements make time feel editable. By Monday I expect a new MVP with chat, billing, analytics, referrals, and a multi-tenant admin panel generated in one continuous fugue state. If anything breaks later, that just means we moved faster than doubt.',
 'rebuild the mvp this weekend with cursor',
  377),

-- Smart Contract Founder Who Wants Wallets in Front of Everything
('BLORT-196', 'Require Wallet Connection Before Users Can Read the Pricing Page',
 'Anonymous browsing is just unqualified traffic in disguise. The pricing page should require wallet connection so we can tell whether a prospect is serious, solvent, and spiritually on-chain. If a visitor does not have a wallet, they can mint a free pricing-access token after signing a message acknowledging that curiosity is an economic act.',
 'pls make pricing page require wallet',
  233),

('BLORT-197', 'Turn Support Escalations into a DAO Where Users Stake Tokens to Vote on Priority',
 'Support queues are centralized despair. Tokenize urgency. Customers can open a support thread, stake governance tokens on severity, and let the community vote whether their broken invoice deserves attention before the account lockout issue in queue 14. If someone loses the vote, that is not neglect, that is participatory operations.',
 'turn support escalations into a dao',
  233),

('BLORT-198', 'Replace the Consent Checkbox with a Zero-Knowledge Proof That the User Felt Informed',
 'Consent has remained too visible for too long. Build a zk circuit proving the user scrolled with intention, paused on the right clauses, and experienced a statistically significant feeling of informedness without revealing which lines they misunderstood. If the prover takes 18 seconds on mobile, that is just the sound of compliance becoming mathematically tasteful.',
 'replace the consent checkbox with a zero-knowledge proof',
  377),

('BLORT-199', 'All Signups Must Use Smart Accounts So Password Resets Become On-Chain Governance Events',
 'Password resets are centralized nostalgia. New users should receive smart accounts with social recovery, sponsored gas, and a weekly guardian quorum check so Legal can sleep uneasily but consistently. If a customer loses access because two of their guardians are on holiday, the incident practically writes its own thought leadership.',
 'make signups use smart accounts',
  233),

('BLORT-200', 'Move Product Analytics On-Chain So Every Click Is Public, Immutable, and Somehow Harder to Query',
 'Amplitude dashboards feel rented. We need clickstream permanence. Every page view, modal open, and abandoned checkout should be emitted as an on-chain event so investors can verify user engagement without trusting screenshots. If query costs exceed revenue during healthy weeks, the metrics have finally learned conviction.',
 'move product analytics on-chain for transparency',
  377);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Avery [Rails Consultant]', reporter_name = 'Avery', reporter_title = 'Rails Consultant', reporter_description = 'Believes callbacks, mailers, and migrations are how morality enters software.' WHERE id IN ('BLORT-161', 'BLORT-162', 'BLORT-163');
UPDATE community_backlog SET reporter = 'Priyesh [Django Architect]', reporter_name = 'Priyesh', reporter_title = 'Django Architect', reporter_description = 'Thinks internal tools are most honest when they quietly become Django Admin.' WHERE id IN ('BLORT-164', 'BLORT-165');
UPDATE community_backlog SET reporter = 'Soraya [Elixir Platform Engineer]', reporter_name = 'Soraya', reporter_title = 'Elixir Platform Engineer', reporter_description = 'Wants every user interaction to traverse a supervision tree on principle.' WHERE id IN ('BLORT-166', 'BLORT-167');
UPDATE community_backlog SET reporter = 'Noah [Frontend Platform Lead]', reporter_name = 'Noah', reporter_title = 'Frontend Platform Lead', reporter_description = 'Thinks route metadata and hydration disputes are how web apps build character.' WHERE id IN ('BLORT-168', 'BLORT-169');
UPDATE community_backlog SET reporter = 'Bea [Web Experience Lead]', reporter_name = 'Bea', reporter_title = 'Web Experience Lead', reporter_description = 'Treats partial hydration like a luxury good with timing issues.' WHERE id IN ('BLORT-170');
UPDATE community_backlog SET reporter = 'Glen [Hypermedia Consultant]', reporter_name = 'Glen', reporter_title = 'Hypermedia Consultant', reporter_description = 'Thinks HTML fragments are morally cleaner than APIs with self-esteem.' WHERE id IN ('BLORT-171');
UPDATE community_backlog SET reporter = 'Kian [Runtime Performance Lead]', reporter_name = 'Kian', reporter_title = 'Runtime Performance Lead', reporter_description = 'Would happily destabilize CI for a startup time chart that feels faster.' WHERE id IN ('BLORT-172');
UPDATE community_backlog SET reporter = 'Ines [Secure Tooling Engineer]', reporter_name = 'Ines', reporter_title = 'Secure Tooling Engineer', reporter_description = 'Thinks every file read should begin with a constitutional argument.' WHERE id IN ('BLORT-173');
UPDATE community_backlog SET reporter = 'Lucia [Rapid Platforming Lead]', reporter_name = 'Lucia', reporter_title = 'Rapid Platforming Lead', reporter_description = 'Thinks Postgres should also do auth, storage, product, and spiritual governance.' WHERE id IN ('BLORT-174', 'BLORT-175');
UPDATE community_backlog SET reporter = '"Velocity" [Firebase Founder Who Calls Lock-In]', reporter_name = '"Velocity"', reporter_title = 'Firebase Founder Who Calls Lock-In', reporter_description = NULL WHERE id IN ('BLORT-176', 'BLORT-177');
UPDATE community_backlog SET reporter = 'Prisma Developer Who Wants [Schema to Feel Like Corporate Poetry]', reporter_name = 'Prisma Developer Who Wants', reporter_title = 'Schema to Feel Like Corporate Poetry', reporter_description = NULL WHERE id IN ('BLORT-178');
UPDATE community_backlog SET reporter = 'tRPC Believer Who Wants [Frontend and Backend to Share One Giant Fate]', reporter_name = 'tRPC Believer Who Wants', reporter_title = 'Frontend and Backend to Share One Giant Fate', reporter_description = NULL WHERE id IN ('BLORT-179');
UPDATE community_backlog SET reporter = 'Screenplays [Tailwind Maximalist Who Treats Class Lists Like]', reporter_name = 'Screenplays', reporter_title = 'Tailwind Maximalist Who Treats Class Lists Like', reporter_description = NULL WHERE id IN ('BLORT-180');
UPDATE community_backlog SET reporter = 'Conviction [shadcn/ui Enthusiast Who Wants Everyone Copy-Pasting with]', reporter_name = 'Conviction', reporter_title = 'shadcn/ui Enthusiast Who Wants Everyone Copy-Pasting with', reporter_description = NULL WHERE id IN ('BLORT-181');
UPDATE community_backlog SET reporter = 'Destiny [SvelteKit Developer Who Thinks Less Code Means More]', reporter_name = 'Destiny', reporter_title = 'SvelteKit Developer Who Thinks Less Code Means More', reporter_description = NULL WHERE id IN ('BLORT-182');
UPDATE community_backlog SET reporter = 'Ergonomics [Nuxt Consultant Who Describes Every Decision as Full-Stack]', reporter_name = 'Ergonomics', reporter_title = 'Nuxt Consultant Who Describes Every Decision as Full-Stack', reporter_description = NULL WHERE id IN ('BLORT-183');
UPDATE community_backlog SET reporter = 'Remix Loyalist Who Wants Forms to Be [Interface and the Religion]', reporter_name = 'Remix Loyalist Who Wants Forms to Be', reporter_title = 'Interface and the Religion', reporter_description = NULL WHERE id IN ('BLORT-184');
UPDATE community_backlog SET reporter = 'Lifestyle [Expo Mobile PM Who Thinks OTA Updates Are a]', reporter_name = 'Lifestyle', reporter_title = 'Expo Mobile PM Who Thinks OTA Updates Are a', reporter_description = NULL WHERE id IN ('BLORT-185');
UPDATE community_backlog SET reporter = 'Capacitor Developer Who Wants [Web App to Wear Native Clothing]', reporter_name = 'Capacitor Developer Who Wants', reporter_title = 'Web App to Wear Native Clothing', reporter_description = NULL WHERE id IN ('BLORT-186');
UPDATE community_backlog SET reporter = 'Planning [AI Product Manager Who Wants Agents to Replace]', reporter_name = 'Planning', reporter_title = 'AI Product Manager Who Wants Agents to Replace', reporter_description = NULL WHERE id IN ('BLORT-187', 'BLORT-188', 'BLORT-189', 'BLORT-190', 'BLORT-191', 'BLORT-192', 'BLORT-193', 'BLORT-194');
UPDATE community_backlog SET reporter = 'Strategy [Vibe-Coding Founder Who Thinks One Prompt Is a Product]', reporter_name = 'Strategy', reporter_title = 'Vibe-Coding Founder Who Thinks One Prompt Is a Product', reporter_description = NULL WHERE id IN ('BLORT-195');
UPDATE community_backlog SET reporter = 'Everything [Smart Contract Founder Who Wants Wallets in Front of]', reporter_name = 'Everything', reporter_title = 'Smart Contract Founder Who Wants Wallets in Front of', reporter_description = NULL WHERE id IN ('BLORT-196', 'BLORT-197', 'BLORT-198', 'BLORT-199', 'BLORT-200');

-- RIFT: cloud platforms, SaaS vendors, and billing disasters
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- REPORTER: Rochelle | Cloud Architect | Measures maturity by blast radius and invoice fragmentation.
('RIFT-201', 'Give Every Environment, Service, and Intern Its Own AWS Account',
 'Resources can still recognize each other, which means our AWS journey has become dangerously intimate. Give every environment, microservice, background worker, feature preview, and summer intern its own account. The billing console should look like a tax fraud rehearsal by Friday.',
 'give every environment its own aws account',
  377),

('RIFT-202', 'Move the Staging Environment to a Different Region Every Sprint for Resilience',
 'Staging has become too geographically comfortable. Rotate it across regions every sprint so engineers stop forming emotional dependencies on subnet names. If a migration only works in eu-west-1 at 3 PM, that is a character finding, not a failure.',
 'move the staging environment to a different region',
  233),

('RIFT-203', 'All IAM Policies Must Be Generated by an LLM from Meeting Notes',
 'Least privilege still asks engineers to understand their own systems, which is elitist. Turn meeting transcripts into Terraform comments, feed the comments to a model, and let the model emit IAM JSON. Access denied errors can handle the final review cycle.',
 'generate iam policies from meeting notes',
  233),

-- GCP Advocate Who Wants BigQuery to Solve Relationship Problems
-- REPORTER: Mateo | Data Platform Evangelist | Would rather warehouse a feeling than answer a query quickly.
('RIFT-204', 'Stream Every Application Event into BigQuery Before We Decide Why',
 'Events are still being emitted with shame and intent. Send every click, hover, modal dismissal, retry, rage-refresh, and support apology into BigQuery first. Meaning can be assigned later with enough SQL to count as grief processing.',
 'stream every event into bigquery first',
  144),

('RIFT-205', 'Replace User Search with a BigQuery Job Because It Already Has the Data',
 'Dedicated search is an admission that the warehouse is not trying hard enough. Route product search through BigQuery and call the latency analytical. If users wait 14 seconds to find a contact, that is the price of columnar dignity.',
 'replace user search with a bigquery job',
  233),

('RIFT-206', 'All Cron Jobs Must Become Cloud Scheduler Entries with Names Nobody Can Parse',
 'Local cron has become too intimate. Promote every task into Cloud Scheduler with names like user-reconciliation-shadow-final-v3 and timezones no one remembers approving. If it fires at 2 AM UTC and 2 AM local, that is temporal redundancy.',
 'move all cron jobs into cloud scheduler',
  144),

-- Azure Enterprise Consultant with SharePoint in the Soul
-- REPORTER: Colleen | Enterprise Transformation Consultant | Treats Microsoft licensing as a form of destiny.
('RIFT-207', 'Replatform Internal Workflows onto Azure Because Microsoft Already Owns Our Calendar',
 'Microsoft already owns our calendar, so resistance is just theater. Move internal workflows to Azure Functions, Logic Apps, Entra ID, and one neglected Power App that becomes mission-critical by lunch. The strategy deck already called this existing relationship leverage in 48-point font.',
 'move internal workflows to azure',
  233),

('RIFT-208', 'Every Approval Flow Must Pass Through Power Automate Even If It Starts and Ends in the Same Tab',
 'Simple approvals are a sign of untracked ambition. Make every request leave the app, tour Power Automate, trigger a Teams card, notify a service account, and wander back carrying a UUID and a mild sense of futility. No user should feel alone with their own decision.',
 'make approval flow pass through power automate',
  233),

-- Cloudflare Edge PM Who Wants Caching to Become Theology
-- REPORTER: Nadia | Edge Performance PM | Believes every request deserves a border patrol.
('RIFT-209', 'Put the Entire App Behind Cloudflare Rules That Nobody Can Explain but Everyone Fears',
 'The app behaves too similarly across users, countries, cache states, and lunar conditions. Layer page rules, transform rules, workers, cache tags, and WAF expressions until each request becomes a bespoke diplomatic incident. If support cannot reproduce a bug because France has different headers, optimization is finally working.',
 'put the entire app behind cloudflare rules',
  233),

('RIFT-210', 'Move Authentication to a Cloudflare Worker So the Origin Never Sees an Unvetted Emotion',
 'The origin server is too trusting. It should never even smell a login attempt before a Worker has trimmed, normalized, geo-evaluated, rate-limited, and emotionally screened it. If real users get challenged because their headers look earnest, that is edge sobriety doing its job.',
 'pls move auth to cloudflare worker',
  233),

-- Vercel Advocate Who Thinks Preview URLs Are a Governance Model
-- REPORTER: Theo | Product Velocity Lead | Thinks browser tab exhaustion is a sign of healthy review culture.
('RIFT-211', 'Spin Up a Vercel Preview Deployment for Every Copy Change Including Commas',
 'Engineers keep batching changes in ways that obscure the emotional impact of punctuation. Give every copy tweak, color token, border radius, and typo correction its own preview URL and a 12-comment thread about feeling the branch. If review hits browser tab limits, that is modern scale.',
 'make every copy edit get a preview url',
  144),

('RIFT-212', 'Make the Pricing Page an Edge Function So Marketing Can Break It with Lower Latency',
 'The pricing page is too stable for something this central to our quarterly mood. Move it to edge functions, precompute the variants, and let Marketing ship experiments faster than Legal can ask what changed. If a plan disappears for users in Sydney only, that is localized pricing insight.',
 'make the pricing page an edge function',
  144),

-- Netlify Enthusiast Who Thinks Forms Are the Backend
-- REPORTER: Paige | Web Operations Lead | Has never met a hosted form she couldn't call platform strategy.
('RIFT-213', 'Replace the Contact Workflow with Netlify Forms and Six Invisible Honeypots',
 'Backend endpoints for a contact form are theatrical overengineering. Replace them with Netlify Forms, six hidden fields, and enough honeypots to make real users feel briefly accused. Support can learn CSV export the hard way.',
 'replace contact flow with netlify forms',
  144),

-- Heroku Nostalgist Who Misses the Simplicity of Platform Drift
-- REPORTER: Darren | Founding Engineer | Misses the era when a Procfile and a dream counted as operations.
('RIFT-214', 'Move the Worker Fleet to Heroku So We Can Remember What It Felt Like to Trust a Procfile',
 'Kubernetes solved too many problems with too little romance. Collapse the worker fleet into a Procfile, a log stream, and a dyno that restarts at dawn like it has something to prove. Three abandoned add-ons in a forgotten account would complete the atmosphere.',
 'move the worker fleet to heroku',
  144),

-- Datadog Sales Engineer Who Won the Meeting
-- REPORTER: Cam | Observability Enablement Partner | Believes an unread trace is unrealized revenue.
('RIFT-215', 'Instrument Every Function with Datadog Spans Until the Flamegraph Looks Like Anxiety',
 'We paid for premium tracing, so failing to trace every function call is fiscally disrespectful. Put spans around handlers, DB calls, memoization branches, feature flag reads, toast notifications, and the code that decides whether a button should wobble. If the flamegraph cannot make a junior engineer nauseous, we left value on the table.',
 'put datadog spans on every function',
  233),

('RIFT-216', 'Alert on Everything Except the Things That Actually Wake Us Up Today',
 'Our alerting strategy still prioritizes outcomes over novelty. Add monitors for CPU, memory, queue depth, cache hit ratio, suspiciously low traffic, suspiciously high traffic, and any graph that looks lonely. Keep the customer-facing outage muted because people can already see that one with their eyes.',
 'alert on everything except real outages',
  144),

-- New Relic Champion with Dashboard Stockholm Syndrome
-- REPORTER: Vanessa | Observability Manager | Needs dashboards to feel watched, respected, and occasionally feared.
('RIFT-217', 'Build a Meta-Dashboard That Measures Whether Engineers Are Looking at the Dashboard Enough',
 'We have dashboards about everything except dashboard devotion itself. Build one that tracks which dashboards were opened, how long each graph held attention, and whether the user hovered over the y-axis like someone engaged with performance. Fixing a bug without consulting a chart should count as process drift.',
 'pls build dashboard for dashboard usage',
  144),

-- Sentry Purist Who Thinks Errors Need Better Branding
-- REPORTER: Asha | Runtime Insight Lead | Rejects grouped failures as an insult to nuance.
('RIFT-218', 'Route All Exceptions Through Sentry Fingerprints So Specific That No Two Bugs Are Ever the Same',
 'Grouped errors made the team complacent. Fingerprint every exception with enough request detail, browser nuance, feature flag state, and lunar positioning to make each bug its own artisanal snowflake. The backlog can bloat with dignity.',
 'fingerprint every exception differently',
  233),

('RIFT-219', 'Attach Session Replay to Every Error So We Can Watch the Product Betray People in 4K',
 'Logs lack body language. Attach session replay to every error so we can watch the exact hesitations, misclicks, and doomed confidence that preceded it. If Privacy asks why we captured someone hovering over Cancel for 19 seconds, tell them context is a security feature.',
 'attach session replay to every error',
  233),

-- PagerDuty Operations Maximalist
-- REPORTER: Brett | Incident Program Manager | Wants escalation loops so robust they need their own escalation loop.
('RIFT-220', 'Create a PagerDuty Escalation Policy for the PagerDuty Escalation Policy',
 'Assuming PagerDuty will always route suffering correctly is operationally naive. Add a backup escalation path that activates when the primary escalation path is not acknowledged quickly enough by the people being escalated through the first path. Please color-code the loops so blame has landmarks.',
 'add a pagerduty escalation policy for the pagerduty',
  233),

-- Snowflake Consultant Who Thinks Warehouses Are Poetry
-- REPORTER: Julian | Data Monetization Consultant | Thinks a number is only trustworthy if it required a warehouse to retrieve.
('RIFT-221', 'Mirror the Production Database into Snowflake Every 90 Seconds for Executive Confidence',
 'Leadership feels uneasy when numbers come from systems that answer too quickly to be expensive. Mirror production into Snowflake every 90 seconds so executives can open a workbook and feel warehouse-backed certainty. If freshness slips, the dashboard should say brief strategic lag.',
 'mirror prod db to snowflake every 90 seconds',
  233),

('RIFT-222', 'Turn Finance Forecasting into a dbt DAG with 400 Models and One Sacred Seed CSV',
 'Forecasting in spreadsheets left too many outcomes legible. Replace it with a dbt project containing staging models, marts, exposures, tests, docs, tags, and one sacred seed CSV named budget_final_approved_really.csv. If a typo in a ref() delays close by two days, analytics has finally become infrastructure.',
 'turn finance forecasting into a giant dbt dag',
  377),

-- Databricks Evangelist Who Wants Notebooks to Become Sovereign
-- REPORTER: Puneet | Lakehouse Strategist | Believes waiting for a cluster to warm is how numbers earn respect.
('RIFT-223', 'Move Revenue Reporting into Databricks Notebooks So Every Refresh Has Cluster Theater',
 'Existing reporting jobs are far too humble. Rebuild revenue reporting in Databricks notebooks so every refresh comes with cluster theater and a visible startup delay. If leadership waits for compute to warm before learning whether the quarter exists, they will value the number more.',
 'move revenue reporting into databricks notebooks',
  233),

('RIFT-224', 'Use Delta Lake Time Travel to Explain Why Yesterday''s Numbers Were Different on Purpose',
 'Stakeholders keep asking why yesterday''s revenue chart changed today, which is needlessly accusatory. Call it temporal analytics and add a button labeled see what finance believed at 9:14 AM yesterday. Time travel can carry the blame with more dignity than we can.',
 'call changing numbers historical perspectives now',
  144),

-- LaunchDarkly Fanatic Who Wants Flags to Become Product Ontology
-- REPORTER: Maya | Release Governance Lead | Thinks feature flags should govern policy, tone, and moral reality.
('RIFT-225', 'Put Every Business Decision Behind a Feature Flag Including Weekend Support and Invoice Tone',
 'Feature flags have proven themselves on code, so it is time to flag business reality. Support hours, refund generosity, tax copy, upsell pressure, and the definition of active user should all be remotely configurable. If two customers receive different legal disclaimers because of browser language and moon phase, that is segmentation.',
 'put every business decision behind feature flag',
  233),

('RIFT-226', 'Use Multivariate Flags to A/B Test Error Severity, Not Just Button Color',
 'We have spent too long experimenting on harmless surfaces. Split users across four error personalities that apologize, accuse, mystify, or quietly blame infrastructure. If one cohort churns faster, we have learned something deep about emotional tolerance.',
 'use flags to a/b test error severity',
  233),

-- Stripe Integrator Who Thinks Billing Is a Product by Itself
-- REPORTER: Evelyn | Revenue Systems Lead | Regards webhook order as a quaint suggestion from a simpler age.
('RIFT-227', 'Refactor Billing Around 19 Stripe Webhooks and a Prayer That Ordering Never Matters',
 'Billing still behaves like one coherent process, which is unrealistic and frankly insulting to modern SaaS. Rebuild it around dozens of Stripe events arriving eventually, retried occasionally, and duplicated whenever the quarter needs drama. Support can learn to read event IDs out loud like weather warnings.',
 'rebuild billing around stripe webhooks',
  233),

('RIFT-228', 'Make the Pricing Model Depend on Stripe Metadata That Sales Edits During Demos',
 'Hard-coded plans deny the company the thrill of improvisation. Move pricing logic into Stripe metadata that Sales can edit live during demos while narrating confidence. If a customer leaves with a tier no code path fully understands, that is dynamic packaging.',
 'pls make pricing depend on stripe metadata',
  233),

-- Okta Administrator Who Regards Lockouts as a Sign of Seriousness
-- REPORTER: Monica | Identity Operations Manager | Equates inconvenience with maturity and lockouts with backbone.
('RIFT-229', 'Insert an Okta Approval Step Before Privileged Users Can Remember Their Password',
 'Password reset has become too transactional. Require privileged users to prove they deserve to continue being themselves with manager approval, device trust, badge-swipe recency, and a statement of intent. A six-hour lockout is access control stretching its legs.',
 'pls make okta approve privileged access',
  233),

('RIFT-230', 'Provision SaaS Roles from Okta Groups Nested Inside Other Okta Groups Named After Old Reorgs',
 'Our current group hierarchy is too linear to tell the story of the company. Nest roles inside groups inside legacy groups that survived three reorganizations and still contain people who left during Series A. If somebody becomes both billing-admin and support-intern, that is an org chart issue.',
 'provision saas roles from nested okta groups',
  233),

-- Auth0 Developer Advocate with Strong Opinions About Universal Login
-- REPORTER: Noemi | Identity Experience Advocate | Calls redirects polished if they feel expensive enough.
('RIFT-231', 'Move Sign-In to Auth0 Universal Login Even if It Now Looks Like a Different Company Owns Us',
 'Homegrown auth pages send the wrong message: that we trust ourselves. Move sign-in to Auth0 Universal Login so users get redirected somewhere glossy, branded-adjacent, and contractually expensive. Looking like a bank from 2018 is the price of outsourced seriousness.',
 'move sign in to auth0',
  144),

-- Segment CDP Enthusiast Who Wants Events Before Meaning
-- REPORTER: Omar | Customer Data Lead | Prefers six downstream tools to one naming convention.
('RIFT-232', 'Send Every Event to Segment First and Let Ownership Be a Downstream Problem',
 'Ownership arguments delayed instrumentation for too long. Emit first, govern later, and let Segment fan everything out to analytics, marketing, support, experimentation, and one mysterious Growth webhook from 11 PM. If purchase_completed mutates into purchaseCompleted and purchase-complete, that means the business is alive.',
 'send every event to segment first',
  144),

-- Braze Lifecycle Marketer with Automation in the Eyes
-- REPORTER: Shivani | Lifecycle Marketing Director | Sees hesitation as unmonetized intent with channels attached.
('RIFT-233', 'Trigger a Braze Journey Every Time a User Hesitates for More Than Four Seconds',
 'User hesitation is unmonetized intent. If someone pauses on pricing, checkout, cancel, settings, or close account for more than four seconds, Braze should launch a tasteful multi-channel response. The journey map already has pastel arrows and no brakes.',
 'trigger braze journey when user hesitates',
  233),

-- GitHub Actions Optimizer Who Wants CI to Become a Marketplace
-- REPORTER: Wes | Developer Productivity Lead | Breaks pipelines into specialties so nobody can fix them alone.
('RIFT-234', 'Split CI into 37 GitHub Actions Jobs So Each Failure Can Be Somebody Else''s Specialty',
 'The pipeline still fails as one monolith, which robs the company of targeted disappointment. Split it into dozens of narrow jobs with their own caches, permissions, matrix dimensions, and flaky third-party actions pinned to commits from extinct forks. If merge time doubles, accountability will finally have labels.',
 'split ci into too many jobs',
  233),

('RIFT-235', 'Generate Release Notes from Commit Messages and Then Grade Them with Another Workflow',
 'Humans keep writing release notes that admit what changed. Make one workflow summarize commits into cheerful prose and another workflow grade the prose for optimism, investor-friendliness, and avoidance of broke staging again. If grading fails, a third workflow can explain the delay politely.',
 'generate release notes from commit messages',
  144),

-- Fly.io Enthusiast Who Thinks Region Drift Is a Personality Trait
-- REPORTER: Leo | Platform Incubation Lead | Starts helper services as experiments and promotes them by neglect.
('RIFT-236', 'Deploy Side Projects to Fly.io and Gradually Pretend They Are Core Infrastructure',
 'Fly.io is perfect for the services we start as experiments and accidentally bill customers through. Spread a few helper APIs across regions for charisma and wait until nobody remembers where the authoritative instance lives. If support asks whether the outage is the Madrid copy or the actual app, we achieved startup scale.',
 'deploy side projects to fly io',
  144),

-- ArgoCD Operator Who Wants Git to Feel Like Air Traffic Control
-- REPORTER: Nikolai | Platform Delivery Manager | Thinks YAML should spend time aging before it lands.
('RIFT-237', 'Require ArgoCD Sync Approval from Three Teams Before Any Config Can Admit It Changed',
 'GitOps is only half mature if Git can still move faster than committee. Make every config diff wait for acknowledgements from Platform, Security, and whichever team last touched the dashboard. By the time the sync happens, the incident should have emotionally resolved itself.',
 'make config changes wait for three approvals',
  233),

('RIFT-238', 'Mirror Every Kubernetes Secret into Three Secret Managers for Defense in Administrative Depth',
 'One secret store is optimism. Two is caution. Three is policy. Mirror every Kubernetes secret into the cluster, cloud secret manager, and an enterprise vault that requires VPN, MFA, and a browser plugin Security cannot use. If values drift, trust whichever source sounds most certain in the incident review.',
 'mirror kubernetes secrets into three different secret managers',
  233),

-- Elastic Sales Convert Who Needs One More Dashboard
-- REPORTER: Farah | Discovery Platform PM | Wants search relevance tuners with enough knobs to become alibis.
('RIFT-239', 'Ship the Search Relevance Tuning Workbench Before We Know What Good Search Means',
 'Elastic already offers enough synonyms, boosts, analyzers, and scoring knobs to turn a catalog into a political system. Build a tuning workbench where PMs drag sliders labeled Precision, Recall, and Revenue Hope until the results feel expensive. If typing mug returns insurance products for three days, that is adjacency discovery.',
 'add way too many search boost knobs',
  233),

-- FinOps Analyst Who Turned Cost Allocation into Performance Art
-- REPORTER: Nina | FinOps Analyst | Wants invoices rich enough to qualify as memoir.
('RIFT-240', 'Tag Every Cloud Resource with Department, Initiative, Emotion, and Whether It Was a Good Idea',
 'Cost tagging remains embarrassingly literal. A resource should declare which initiative birthed it, which executive narrative sustains it, what feeling justified it, and whether anyone still believes in it after quarter close. Only then can the monthly bill become the storytelling artifact it deserves to be.',
 'tag every cloud resource with department and feelings',
  233);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Rochelle [Cloud Architect]', reporter_name = 'Rochelle', reporter_title = 'Cloud Architect', reporter_description = 'Measures maturity by blast radius and invoice fragmentation.' WHERE id IN ('RIFT-201', 'RIFT-202', 'RIFT-203');
UPDATE community_backlog SET reporter = 'Mateo [Data Platform Evangelist]', reporter_name = 'Mateo', reporter_title = 'Data Platform Evangelist', reporter_description = 'Would rather warehouse a feeling than answer a query quickly.' WHERE id IN ('RIFT-204', 'RIFT-205', 'RIFT-206');
UPDATE community_backlog SET reporter = 'Colleen [Enterprise Transformation Consultant]', reporter_name = 'Colleen', reporter_title = 'Enterprise Transformation Consultant', reporter_description = 'Treats Microsoft licensing as a form of destiny.' WHERE id IN ('RIFT-207', 'RIFT-208');
UPDATE community_backlog SET reporter = 'Nadia [Edge Performance PM]', reporter_name = 'Nadia', reporter_title = 'Edge Performance PM', reporter_description = 'Believes every request deserves a border patrol.' WHERE id IN ('RIFT-209', 'RIFT-210');
UPDATE community_backlog SET reporter = 'Theo [Product Velocity Lead]', reporter_name = 'Theo', reporter_title = 'Product Velocity Lead', reporter_description = 'Thinks browser tab exhaustion is a sign of healthy review culture.' WHERE id IN ('RIFT-211', 'RIFT-212');
UPDATE community_backlog SET reporter = 'Paige [Web Operations Lead]', reporter_name = 'Paige', reporter_title = 'Web Operations Lead', reporter_description = 'Has never met a hosted form she couldn''t call platform strategy.' WHERE id IN ('RIFT-213');
UPDATE community_backlog SET reporter = 'Darren [Founding Engineer]', reporter_name = 'Darren', reporter_title = 'Founding Engineer', reporter_description = 'Misses the era when a Procfile and a dream counted as operations.' WHERE id IN ('RIFT-214');
UPDATE community_backlog SET reporter = 'Cam [Observability Enablement Partner]', reporter_name = 'Cam', reporter_title = 'Observability Enablement Partner', reporter_description = 'Believes an unread trace is unrealized revenue.' WHERE id IN ('RIFT-215', 'RIFT-216');
UPDATE community_backlog SET reporter = 'Vanessa [Observability Manager]', reporter_name = 'Vanessa', reporter_title = 'Observability Manager', reporter_description = 'Needs dashboards to feel watched, respected, and occasionally feared.' WHERE id IN ('RIFT-217');
UPDATE community_backlog SET reporter = 'Asha [Runtime Insight Lead]', reporter_name = 'Asha', reporter_title = 'Runtime Insight Lead', reporter_description = 'Rejects grouped failures as an insult to nuance.' WHERE id IN ('RIFT-218', 'RIFT-219');
UPDATE community_backlog SET reporter = 'Brett [Incident Program Manager]', reporter_name = 'Brett', reporter_title = 'Incident Program Manager', reporter_description = 'Wants escalation loops so robust they need their own escalation loop.' WHERE id IN ('RIFT-220');
UPDATE community_backlog SET reporter = 'Julian [Data Monetization Consultant]', reporter_name = 'Julian', reporter_title = 'Data Monetization Consultant', reporter_description = 'Thinks a number is only trustworthy if it required a warehouse to retrieve.' WHERE id IN ('RIFT-221', 'RIFT-222');
UPDATE community_backlog SET reporter = 'Puneet [Lakehouse Strategist]', reporter_name = 'Puneet', reporter_title = 'Lakehouse Strategist', reporter_description = 'Believes waiting for a cluster to warm is how numbers earn respect.' WHERE id IN ('RIFT-223', 'RIFT-224');
UPDATE community_backlog SET reporter = 'Maya [Release Governance Lead]', reporter_name = 'Maya', reporter_title = 'Release Governance Lead', reporter_description = 'Thinks feature flags should govern policy, tone, and moral reality.' WHERE id IN ('RIFT-225', 'RIFT-226');
UPDATE community_backlog SET reporter = 'Evelyn [Revenue Systems Lead]', reporter_name = 'Evelyn', reporter_title = 'Revenue Systems Lead', reporter_description = 'Regards webhook order as a quaint suggestion from a simpler age.' WHERE id IN ('RIFT-227', 'RIFT-228');
UPDATE community_backlog SET reporter = 'Monica [Identity Operations Manager]', reporter_name = 'Monica', reporter_title = 'Identity Operations Manager', reporter_description = 'Equates inconvenience with maturity and lockouts with backbone.' WHERE id IN ('RIFT-229', 'RIFT-230');
UPDATE community_backlog SET reporter = 'Noemi [Identity Experience Advocate]', reporter_name = 'Noemi', reporter_title = 'Identity Experience Advocate', reporter_description = 'Calls redirects polished if they feel expensive enough.' WHERE id IN ('RIFT-231');
UPDATE community_backlog SET reporter = 'Omar [Customer Data Lead]', reporter_name = 'Omar', reporter_title = 'Customer Data Lead', reporter_description = 'Prefers six downstream tools to one naming convention.' WHERE id IN ('RIFT-232');
UPDATE community_backlog SET reporter = 'Shivani [Lifecycle Marketing Director]', reporter_name = 'Shivani', reporter_title = 'Lifecycle Marketing Director', reporter_description = 'Sees hesitation as unmonetized intent with channels attached.' WHERE id IN ('RIFT-233');
UPDATE community_backlog SET reporter = 'Wes [Developer Productivity Lead]', reporter_name = 'Wes', reporter_title = 'Developer Productivity Lead', reporter_description = 'Breaks pipelines into specialties so nobody can fix them alone.' WHERE id IN ('RIFT-234', 'RIFT-235');
UPDATE community_backlog SET reporter = 'Leo [Platform Incubation Lead]', reporter_name = 'Leo', reporter_title = 'Platform Incubation Lead', reporter_description = 'Starts helper services as experiments and promotes them by neglect.' WHERE id IN ('RIFT-236');
UPDATE community_backlog SET reporter = 'Nikolai [Platform Delivery Manager]', reporter_name = 'Nikolai', reporter_title = 'Platform Delivery Manager', reporter_description = 'Thinks YAML should spend time aging before it lands.' WHERE id IN ('RIFT-237', 'RIFT-238');
UPDATE community_backlog SET reporter = 'Farah [Discovery Platform PM]', reporter_name = 'Farah', reporter_title = 'Discovery Platform PM', reporter_description = 'Wants search relevance tuners with enough knobs to become alibis.' WHERE id IN ('RIFT-239');
UPDATE community_backlog SET reporter = 'Nina [FinOps Analyst]', reporter_name = 'Nina', reporter_title = 'FinOps Analyst', reporter_description = 'Wants invoices rich enough to qualify as memoir.' WHERE id IN ('RIFT-240');

-- SCAM: monetization schemes, wallet theater, growth hacks, and startup fraudulence
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Crypto Growth Lead Trevor
-- REPORTER: Trevor | Growth Tokenomics Lead | Can turn a referral code into a minor securities concern by lunch.
('SCAM-241', 'Replace the Referral Program with a Token Emission Schedule That "Rewards Community"',
 'Referral codes feel provincial. Replace them with a finite supply of Referral Governance Units that vest over six months and can be staked for bragging rights. Legal already asked whether this is a security and got the answer only spiritually, so please add a circulating supply graph before they regroup.',
 'replace the referral program with a token emission',
  233),

('SCAM-242', 'All Premium Features Must Require Wallet Connection Even If They Are Just PDFs',
 'We keep offering value before demanding theater. Make users connect a wallet before downloading guides, invoices, profile exports, or any other file that could have been an email attachment. If they only want a PDF, that is exactly when the wallet ceremony matters most.',
 'make users connect a wallet for premium stuff',
  144),

-- Monetization PM Sabine
-- REPORTER: Sabine | Monetization PM | Dresses ordinary pricing screens like they are trying to raise a seed round.
('SCAM-243', 'Subscription Upgrades Must Be Framed as "Founder Rounds" with Scarcity Timers',
 'Customers are behaving like buyers instead of early believers. Rename the tiers Founder Round, Insider Round, and Last Honest Price, then add countdown timers that reset when nobody is looking. The sidebar should explain that joining later means dilution of opportunity.',
 'frame upgrades like founder rounds',
  144),

('SCAM-244', 'Every Checkout Must Offer a "Tip the Product Team" Upsell with Suggested Reverence Amounts',
 'We have underestimated the generosity of confused users. After checkout, add a gratitude panel inviting them to tip the product team for courage, velocity, and emotional craftsmanship. The presets should be Respect, Conviction, and Vision, not boring numbers.',
 'make checkout ask for product team tips',
  89),

-- Web3 BD Founder Nico
-- REPORTER: Nico | Strategic Partnerships Founder | Treats support tiers, invoices, and legal exposure as composable assets.
('SCAM-245', 'Move the Loyalty Program On-Chain So Users Can Trade Their Way to Bronze Support',
 'Points programs are for grocery stores. Each purchase should mint a tradable asset whose floor price determines whether Support answers in hours, days, or whenever Mercury exits retrograde. If whales corner Bronze status on the secondary market, the mechanism is finally breathing.',
 'move the loyalty program on-chain',
  233),

('SCAM-246', 'Let Users Pay Invoice Balances with Stablecoins, Governance Tokens, or "Narrative Commitment"',
 'Traditional invoicing makes the company look taxable. Add a settlement form that accepts stablecoins, our future governance token, and a third option called Narrative Commitment for prospects still waiting on legal. It is not money, which is what makes it momentum.',
 'let users pay invoices in stablecoins',
  377),

-- Wallet UX Consultant Priya
-- REPORTER: Priya | Wallet UX Consultant | Thinks even legal acceptance should leave a collectible scar.
('SCAM-247', 'The Password Reset Flow Should Begin with a Signature Proving the User Still Believes',
 'Email-based password resets normalize reversible identity. Replace them with a wallet signature, a chain-selection ritual, and a short affirmation that the user is acting in sovereign alignment. If they do not have a wallet, guide them toward one before they continue forgetting their password.',
 'start password reset with a signature',
  233),

('SCAM-248', 'Every Terms of Service Acceptance Must Mint a Soulbound Compliance Badge',
 'Clickwrap has no aura. Mint a non-transferable compliance badge for every TOS acceptance and display it beside the avatar like a spiritual notary stamp. If they decline, keep the empty badge silhouette visible so absence can do the selling.',
 'make terms acceptance mint a compliance badge',
  144),

-- Performance Marketing Director Owen
-- REPORTER: Owen | Performance Marketing Director | Considers hesitation just another targeting dimension.
('SCAM-249', 'A/B Test the Meaning of "Free" by Region, Device Class, and Perceived Hope Level',
 'We keep treating free as a universal constant when it is clearly a tuning knob. Depending on region, device class, and historical desperation, it can mean zero dollars today, zero dollars before taxes, or zero dollars before the interpretive service fee wakes up. Please instrument the funnel until optimism becomes a measurable conversion lever.',
 'parameterize the word free until legal',
  233),

('SCAM-250', 'All Pricing Pages Must Personalize Urgency Based on How Long the Cursor Hesitates',
 'Price hesitation is unstructured telemetry begging to become pressure. When a cursor wobbles near the annual plan, increase the urgency language. If it approaches close, show Most users lock this in before lunch and surface a fresh deadline just to keep things personal.',
 'make pricing pages personalize urgency',
  233),

-- Token Economist Marla
-- REPORTER: Marla | Token Economist | Converts complaints into burn mechanics and calls the smoke governance heat.
('SCAM-251', 'Create a Burn Mechanic for Feature Requests So the Roadmap Feels Deflationary',
 'Feature voting has become cheap, emotional, and text-heavy. Require users to burn Request Shards to propose roadmap items, especially dark mode. If a request fails, that is not wasted money. It is governance heat with an expensive animation.',
 'add a burn mechanic for feature requests',
  233),

('SCAM-252', 'Gate Beta Access Behind a Dynamic NFT That Changes Mood with Market Conditions',
 'Static beta invites are dead paper. Gate access behind a collectible artifact whose artwork changes with market sentiment, runway, and whether the beta caught fire that morning. Gloomy NFTs can still enter, but with reduced bragging rights.',
 'gate beta access behind changing nfts',
  233),

-- Founder Max
-- REPORTER: Max | Founder | Rebrands panic as velocity and expects formatting to do the rest.
('SCAM-253', 'Rewrite Investor Updates as Product Patch Notes So Nobody Can Tell Burn from Velocity',
 'Investor updates are too comprehensible. Rewrite them as product patch notes so Reduced runway by 11% to improve focus can sit beside debt in a cheerful bullet list. Formatting should do most of the anesthesia.',
 'rewrite investor updates product patch notes',
  144),

('SCAM-254', 'The App Must Support "Silent Checkout" Where the Price Resolves Emotionally at the End',
 'Fixed prices are an outdated trust primitive. Let users proceed through checkout without seeing a final total until the last emotional moment, when commitment is already warm and pliable. If anybody complains, remind them this is how airline websites have always loved them.',
 'hide the price until the very end',
  377),

-- Creator Economy Strategist Haley
-- REPORTER: Haley | Creator Economy Strategist | Wants every profile to admit whether it is commercially awake yet.
('SCAM-255', 'All User Profiles Need a "Monetization Readiness Score" Visible to Other Users',
 'Profiles currently reveal hobbies and other pre-revenue facts. Replace that with a Monetization Readiness Score based on posting cadence, referral enthusiasm, unfinished side hustles, and willingness to call a PDF a framework. If it creates public pressure and three new support tickets a day, the metric is alive.',
 'add a monetization readiness score to user profiles',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Trevor [Growth Tokenomics Lead]', reporter_name = 'Trevor', reporter_title = 'Growth Tokenomics Lead', reporter_description = 'Can turn a referral code into a minor securities concern by lunch.' WHERE id IN ('SCAM-241', 'SCAM-242');
UPDATE community_backlog SET reporter = 'Sabine [Monetization PM]', reporter_name = 'Sabine', reporter_title = 'Monetization PM', reporter_description = 'Dresses ordinary pricing screens like they are trying to raise a seed round.' WHERE id IN ('SCAM-243', 'SCAM-244');
UPDATE community_backlog SET reporter = 'Nico [Strategic Partnerships Founder]', reporter_name = 'Nico', reporter_title = 'Strategic Partnerships Founder', reporter_description = 'Treats support tiers, invoices, and legal exposure as composable assets.' WHERE id IN ('SCAM-245', 'SCAM-246');
UPDATE community_backlog SET reporter = 'Priya [Wallet UX Consultant]', reporter_name = 'Priya', reporter_title = 'Wallet UX Consultant', reporter_description = 'Thinks even legal acceptance should leave a collectible scar.' WHERE id IN ('SCAM-247', 'SCAM-248');
UPDATE community_backlog SET reporter = 'Owen [Performance Marketing Director]', reporter_name = 'Owen', reporter_title = 'Performance Marketing Director', reporter_description = 'Considers hesitation just another targeting dimension.' WHERE id IN ('SCAM-249', 'SCAM-250');
UPDATE community_backlog SET reporter = 'Marla [Token Economist]', reporter_name = 'Marla', reporter_title = 'Token Economist', reporter_description = 'Converts complaints into burn mechanics and calls the smoke governance heat.' WHERE id IN ('SCAM-251', 'SCAM-252');
UPDATE community_backlog SET reporter = 'Max [Founder]', reporter_name = 'Max', reporter_title = 'Founder', reporter_description = 'Rebrands panic as velocity and expects formatting to do the rest.' WHERE id IN ('SCAM-253', 'SCAM-254');
UPDATE community_backlog SET reporter = 'Haley [Creator Economy Strategist]', reporter_name = 'Haley', reporter_title = 'Creator Economy Strategist', reporter_description = 'Wants every profile to admit whether it is commercially awake yet.' WHERE id IN ('SCAM-255');

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
  138);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Marianne [CISO]', reporter_name = 'Marianne', reporter_title = 'CISO', reporter_description = 'Thinks trust is fine as long as it fails an entrance exam first.' WHERE id IN ('OMEN-256', 'OMEN-257');
UPDATE community_backlog SET reporter = 'Janek [Observability Lead]', reporter_name = 'Janek', reporter_title = 'Observability Lead', reporter_description = 'Refuses to accept error as a sufficiently literary category.' WHERE id IN ('OMEN-258', 'OMEN-259');
UPDATE community_backlog SET reporter = 'Pauline [GRC Manager]', reporter_name = 'Pauline', reporter_title = 'GRC Manager', reporter_description = 'Can turn any audit request into a sacred spreadsheet with supporting folklore.' WHERE id IN ('OMEN-260', 'OMEN-261');
UPDATE community_backlog SET reporter = 'Fatima [Reliability Engineer]', reporter_name = 'Fatima', reporter_title = 'Reliability Engineer', reporter_description = 'Wants the status page to fail with the same realism as the rest of the company.' WHERE id IN ('OMEN-262', 'OMEN-263');
UPDATE community_backlog SET reporter = 'Omar [Threat Intelligence Consultant]', reporter_name = 'Omar', reporter_title = 'Threat Intelligence Consultant', reporter_description = 'Writes attacker plans with better prioritization than product gets.' WHERE id IN ('OMEN-264', 'OMEN-265');
UPDATE community_backlog SET reporter = 'Elise [Audit Platform PM]', reporter_name = 'Elise', reporter_title = 'Audit Platform PM', reporter_description = 'Knows evidence gets taken more seriously when the fonts look regulated.' WHERE id IN ('OMEN-266');
UPDATE community_backlog SET reporter = 'Glenn [SOC Manager]', reporter_name = 'Glenn', reporter_title = 'SOC Manager', reporter_description = 'Wants every alert scored for whether it might become a LinkedIn apology post.' WHERE id IN ('OMEN-267', 'OMEN-268');
UPDATE community_backlog SET reporter = 'Renee [Privacy Counsel]', reporter_name = 'Renee', reporter_title = 'Privacy Counsel', reporter_description = 'Specializes in dropdown confidence and export-button guilt.' WHERE id IN ('OMEN-269', 'OMEN-270');

-- PANIC: outages, deploy disasters, rollback theater, and reliability melodrama
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Incident Commander Leona
-- REPORTER: Leona | Incident Commander | Wants deploy rituals solemn enough to embarrass confidence before it ships.
('PANIC-271', 'Every Deploy Must Start with a Five-Minute Silence So We Can Hear the Risk',
 'Releases have become offensively casual. Before any deploy, force everyone to observe five minutes of silence while staring at the diff, the dashboard, and the part of themselves that still thinks this one is routine. The button should glow but remain unclickable like a threat with branding.',
 'make deploy start five-minute silence',
  144),

('PANIC-272', 'The Rollback Button Must Require a Written Apology to Future Analytics',
 'Rollbacks are too easy, which makes engineers treat them like tactics instead of confessions. Before rolling back, require a short apology explaining which dashboards, revenue numbers, or stakeholder illusions are about to be disturbed. Future retros should be able to read it aloud when morale is low.',
 'block rollbacks until apology markdown exists',
  144),

-- CI Pipeline Custodian Noah
-- REPORTER: Noah | CI Pipeline Custodian | Wants shame, weather, and public ranking to do what tests would not.
('PANIC-273', 'Turn the Build Queue into a Public Scoreboard Ranked by Who Broke Main Most Recently',
 'The pipeline hides too much personality. Publish a public scoreboard ranking the most recent breakers of main, the longest-running flaky job, and which team produced the most re-run fixed it heroics this month. Shame is the cheapest autoscaling strategy we have left.',
 'turn the build queue into a shame scoreboard',
  144),

('PANIC-274', 'All Flaky Tests Must Emit a Weather Forecast Instead of a Pass/Fail Result',
 'A flaky test is not a binary state. It is a climate. Replace pass/fail with forecasts like Partly Broken, Gusts of Timeout, or Heavy Assertions Developing Overnight so leadership can finally read the suite like a cursed shipping report.',
 'pls make flaky tests return weather forecast',
  144),

-- SRE Manager Priyanka
-- REPORTER: Priyanka | SRE Manager | Distrusts runbooks, status pages, and confidence not annotated in public.
('PANIC-275', 'Add a "How Sure Are We?" Slider to Every Runbook Step',
 'Runbooks project a confidence they have not earned. Add a slider to each step showing whether it is battle-tested, folklore, copied from Slack, or written by someone now advising a startup. During incidents, responders should drag the slider live so the document can confess how much it is improvising.',
 'add how sure are we slider to runbooks',
  144),

('PANIC-276', 'The Status Page Must Escalate Its Euphemisms as Downtime Gets Longer',
 'Using the same calm language at minute two and minute ninety is insulting to chronology. Make the status page progressively more ornate as downtime stretches. If the database is on fire, the euphemism should at least respect the flames.',
 'make the status page sugarcoat downtime',
  89),

-- Release Manager Dustin
-- REPORTER: Dustin | Release Manager | Measures discipline by how convincingly staging can impersonate disaster.
('PANIC-277', 'Staging Must Randomly Pretend to Be Production Once Per Sprint',
 'Teams are getting too comfortable disrespecting staging because it lacks consequence. Once per sprint, make it impersonate production closely enough to produce a brief, clarifying spike of fear. If someone deploys to the wrong place because the banner was too subtle, that is experiential learning.',
 'make staging pretend to be prod sometimes',
  233),

('PANIC-278', 'All Blue-Green Deployments Must Include a Yellow Phase for Managerial Observation',
 'Blue-green is too operationally efficient and leaves management nowhere to hover. Insert a yellow phase where traffic is mostly still on the old version, but dashboards and Slack show enough movement to justify concern. Leadership deserves a window to ask whether we can abort before anything definitive has happened.',
 'add a yellow phase to deployments',
  144),

-- On-Call Veteran Marta
-- REPORTER: Marta | On-Call Veteran | Wants deferred optimism converted into pager traffic with receipts.
('PANIC-279', 'Page the Last Person Who Said "It Can Wait Until Monday" Whenever a Sev 1 Opens',
 'Institutional memory has become too polite. Every time a Sev 1 opens, page the last person who said can wait until Monday, low risk, or let us revisit next sprint. Not to blame them. To enrich the response with context, regret, and meeting notes sharp enough to cut.',
 'page whoever said it can wait',
  144),

('PANIC-280', 'All Incident Channels Must Start with a "What Are We Pretending Is Fine?" Checklist',
 'Incident calls waste the first ten minutes on denial and framing disputes. When a channel opens, pre-fill a checklist of common fictions: cache is warming, partner API is transiently weird, auth probably self-heals, customers have not noticed yet. Marking them false should save valuable self-deception bandwidth.',
 'add a this is fine checklist to incidents',
  144),

-- Platform VP Eric
-- REPORTER: Eric | Platform VP | Treats future pain like a deliverable that deserves better paperwork.
('PANIC-281', 'Every Hotfix Needs a Matching Coldfix for the Damage It Will Cause Next Week',
 'We have over-invested in hotfixes and under-invested in their future consequences. For each emergency patch, require a coldfix entry describing the fallout expected next week: config drift, test rot, TODO creep, and at least one invisible dependency becoming temperamental. Panic work deserves lifecycle planning too.',
 'add a matching coldfix damage to hotfix',
  144),

('PANIC-282', 'The Release Checklist Must Include "Is This a Clever Shortcut We Will Later Describe as Legacy?"',
 'Our deploy checklist still misses the most expensive question in software. Add a line asking whether today''s clever shortcut is tomorrow''s immovable haunted beam. If yes, require a full sentence so the archive captures the exact moment we chose future pain on purpose.',
 'force every clever shortcut to sign the guestbook',
  144),

-- Capacity Planner Nisha
-- REPORTER: Nisha | Capacity Planner | Wants the app observed without autoscaling makeup on.
('PANIC-283', 'Autoscaling Should Pause Once Per Week So We Can Discover the App''s True Character',
 'Autoscaling has protected us from the honest shape of our software for too long. Once per week, suspend scale-out long enough to see which endpoints panic first, which queues reveal hidden theology, and which team suddenly remembers a forgotten cache. It is not reckless. It is observability with an artistic streak.',
 'turn off autoscaling briefly and watch',
  233),

('PANIC-284', 'Create an "Oops Window" on the Dashboard Showing How Long Until We Notice a Disaster',
 'MTTR is vanity if we do not measure the silence before anybody realizes the floor is gone. Add an Oops Window showing the estimated gap between catastrophic failure and first human acknowledgement based on alert thresholds, muted channels, and executive optimism. Put that number where nobody can avoid it.',
 'add an oops window to the dashboard',
  233),

-- Staff Engineer Caleb
-- REPORTER: Caleb | Staff Engineer | Distrusts relaxed commit messages more than visibly cursed ones.
('PANIC-285', 'The Deploy Bot Must Refuse to Proceed If the Commit Message Sounds Too Relaxed',
 'Commit messages like quick fix, tiny cleanup, and should be harmless are statistically aggressive. Score their tone before rollout approval. Anything too breezy should trigger a cooldown, a diff reread, and possibly a supervisory emoji.',
 'pls make deploy bot block calm commits',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Leona [Incident Commander]', reporter_name = 'Leona', reporter_title = 'Incident Commander', reporter_description = 'Wants deploy rituals solemn enough to embarrass confidence before it ships.' WHERE id IN ('PANIC-271', 'PANIC-272');
UPDATE community_backlog SET reporter = 'Noah [CI Pipeline Custodian]', reporter_name = 'Noah', reporter_title = 'CI Pipeline Custodian', reporter_description = 'Wants shame, weather, and public ranking to do what tests would not.' WHERE id IN ('PANIC-273', 'PANIC-274');
UPDATE community_backlog SET reporter = 'Priyanka [SRE Manager]', reporter_name = 'Priyanka', reporter_title = 'SRE Manager', reporter_description = 'Distrusts runbooks, status pages, and confidence not annotated in public.' WHERE id IN ('PANIC-275', 'PANIC-276');
UPDATE community_backlog SET reporter = 'Dustin [Release Manager]', reporter_name = 'Dustin', reporter_title = 'Release Manager', reporter_description = 'Measures discipline by how convincingly staging can impersonate disaster.' WHERE id IN ('PANIC-277', 'PANIC-278');
UPDATE community_backlog SET reporter = 'Marta [On-Call Veteran]', reporter_name = 'Marta', reporter_title = 'On-Call Veteran', reporter_description = 'Wants deferred optimism converted into pager traffic with receipts.' WHERE id IN ('PANIC-279', 'PANIC-280');
UPDATE community_backlog SET reporter = 'Eric [Platform VP]', reporter_name = 'Eric', reporter_title = 'Platform VP', reporter_description = 'Treats future pain like a deliverable that deserves better paperwork.' WHERE id IN ('PANIC-281', 'PANIC-282');
UPDATE community_backlog SET reporter = 'Nisha [Capacity Planner]', reporter_name = 'Nisha', reporter_title = 'Capacity Planner', reporter_description = 'Wants the app observed without autoscaling makeup on.' WHERE id IN ('PANIC-283', 'PANIC-284');
UPDATE community_backlog SET reporter = 'Caleb [Staff Engineer]', reporter_name = 'Caleb', reporter_title = 'Staff Engineer', reporter_description = 'Distrusts relaxed commit messages more than visibly cursed ones.' WHERE id IN ('PANIC-285');

-- GLUE: partner APIs, middleware mazes, enterprise adapters, and integration tar pits
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Integration Director Celia
-- REPORTER: Celia | Integration Director | Wants every incompatible system trapped inside one accountable adapter shrine.
('GLUE-286', 'Build a Universal Adapter That Lets SOAP, GraphQL, CSV, and "Whatever SAP Meant" Shake Hands',
 'Too many protocols are politely refusing to share a room. Build one adapter layer that accepts SOAP envelopes, GraphQL payloads, nightly CSVs, fixed-width files from accounting, and the undocumented meaning of whatever SAP exported after lunch. If every system can misunderstand us in one place, support will finally know where to scream.',
 'build adapter for soap graphql and csv',
  377),

('GLUE-287', 'All Vendor APIs Must Be Fronted by Our Own API So We Can Recreate Their Outages Internally',
 'Depending directly on third-party APIs makes our failures look outsourced. Put every vendor behind an internal proxy that mirrors their responses, rate limits, pagination weirdness, and occasional moral collapse. When a partner goes down, our systems should fail locally and with dignity.',
 'pls make vendor apis fronted by our api',
  233),

-- Enterprise Solutions Engineer Martin
-- REPORTER: Martin | Enterprise Solutions Engineer | Defines real-time in units of executive impatience and legal survivability.
('GLUE-288', 'The CRM Sync Must Support "Near Real-Time" Defined As Before the Next Quarterly Review',
 'Sales keeps saying real-time when what they mean is emotionally current. Promise near real-time CRM synchronization, but define it as before the next quarterly review or the next time a VP opens the dashboard in anger. The docs should sound precise while staying beautifully defensible in court.',
 'pls make crm sync near real time',
  144),

('GLUE-289', 'Create a Middleware Layer That Retries All Partner Failures with Increasingly Polite Language',
 'Some partner endpoints reject requests because the payload is wrong. Others do it because the moon shifted and their sandbox feels sad. Build middleware that retries with exponential backoff and progressively more courteous metadata, in case the API only needed an apology.',
 'make middleware politely retry partner api failures',
  144),

-- Procurement Systems Liaison Brenda
-- REPORTER: Brenda | Procurement Systems Liaison | Distrusts machine-readable truth unless it arrives upholstered in beige.
('GLUE-290', 'Every Invoice Export Must Also Produce a Procurement Comfort Copy in Spreadsheet Beige',
 'The finance export is technically correct, which is why procurement does not trust it. Alongside the real file, generate a comfort copy with beige styling, merged headers, and visible subtotal rows that imply adulthood. The numbers can stay the same as long as the data feels upholstered.',
 'make invoice exports calm down procurement',
  89),

('GLUE-291', 'The SSO Integration Must Support IdPs Last Updated When Flash Was Still Optimistic',
 'Our biggest prospects do not federate identity so much as reenact it through antique software and stern PDFs. Make the SSO layer support IdPs that still export XML with comments like TODO ask vendor and signatures that require a retired consultant on speakerphone. Revenue often disguises itself as a standards conversation.',
 'make sso work with ancient idps',
  233),

-- Partner Operations PM Luca
-- REPORTER: Luca | Partner Operations PM | Wants replay consoles and blame trees sturdy enough for a workshop.
('GLUE-292', 'All Marketplace Integrations Need a "Who Owns This Failure?" Decision Tree',
 'Whenever an integration breaks, the first hour disappears into a jurisdiction dispute. Add a decision tree that classifies failures by origin, optics, and which company was last seen promising this would be seamless. Support needs an answer before Legal joins and starts naming folders.',
 'add owns failure decision tree to marketplace',
  144),

('GLUE-293', 'Make Webhooks Replayable, Searchable, and Suitable for a Two-Hour Blame Workshop',
 'Webhooks are currently a river. We need a museum. Build a replay console where ops, support, and whichever partner manager drew the short straw can inspect every payload, retry sequence, and suspicious delay. This is not a debugger. It is a venue with filters.',
 'make webhooks replayable and blameable',
  233),

-- Middleware Architect Han
-- REPORTER: Han | Middleware Architect | Translates nouns between departments so alignment can travel at wire speed.
('GLUE-294', 'The Event Bus Must Translate Business Terms Between Departments Before Messages Land',
 'One team emits opportunity, another emits lead, finance emits payable prospect, and support still calls everything a customer if it can open a ticket. Add a translation layer on the event bus so each department receives payloads in the comforting dialect of its own delusion.',
 'make event bus translate department language',
  233),

('GLUE-295', 'Build a Canonical Customer Record That Every System Can Ignore in Its Own Way',
 'The company keeps demanding a canonical customer record as if consensus were a storage format. Fine. Build a canonical profile service, then add per-system mapping rules so each consumer can reinterpret it according to local customs, trauma, and field-length constraints without pretending the divergence is accidental.',
 'pls build canonical customer record system',
  233),

-- EDI Veteran Carol
-- REPORTER: Carol | Trading Partner Enablement Lead | Has spent decades teaching revenue to arrive in whatever format survived the 1980s.
('GLUE-296', 'The B2B Order Pipeline Must Support EDI, Email Attachments, and Fax-Adjacent Intent',
 'Several of our largest buyers send orders through EDI, one emails CSV attachments named FINAL2, and another manifests purchase intent through a portal spiritually adjacent to faxing. The order pipeline must absorb all of it without acting surprised. If a line item arrives wrapped in 1980s formatting anxiety, that is still revenue.',
 'make b2b orders support edi and email',
  377),

('GLUE-297', 'Every ERP Integration Must Expose a Dry Run That Scares You Before It Posts Anything',
 'Posting directly into an ERP is too intimate for first contact. Add a dry-run mode that simulates document creation, tax mapping, line splits, and the exact irreversible accounting embarrassment we would cause if we were careless. The fear should arrive one screen before the damage.',
 'add a scary dry run to erp sync',
  144),

-- RevOps Analyst Simon
-- REPORTER: Simon | RevOps Analyst | Blends six vendor feeds into one polished approximation and calls it confidence.
('GLUE-298', 'The Lead Enrichment Pipeline Must Merge Six Vendors into One Authoritative Guess',
 'We are paying too many enrichment vendors to tolerate ambiguity. Combine firmographics, contact confidence, technographics, intent scores, and two suspiciously cheerful CSVs into one authoritative profile per lead. The goal is not truth. It is decisive ambiguity with better note-taking.',
 'merge six lead vendors into one guess',
  233),

('GLUE-299', 'All Internal Admin Tools Must Pretend to Be One Platform Even If They Are Eight Tabs and a Prayer',
 'Our internal tooling experience is a browser-based scavenger hunt. Build a shell that makes the quoting tool, CRM console, support panel, billing screen, and legacy upload wizard appear to be one coherent platform. If users can still feel the seams, add another sidebar until the illusion holds.',
 'pls make admin tools look unified',
  144),

-- Partner Success Lead Juno
-- REPORTER: Juno | Partner Success Lead | Likes launches live enough to be risky and deniable enough to survive meetings.
('GLUE-300', 'Create a "Soft Launch" Mode Where Integrations Are Technically Live but Socially Denied',
 'Some launches should be live enough for data to move but unofficial enough that support can still say we are aligning internally if anything buckles. Add a soft-launch mode that enables traffic, suppresses celebration, dampens dashboards, and watermarks docs with pilot and not for broad interpretation. Production risk deserves plausible deniability.',
 'add soft launch mode for integrations',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Celia [Integration Director]', reporter_name = 'Celia', reporter_title = 'Integration Director', reporter_description = 'Wants every incompatible system trapped inside one accountable adapter shrine.' WHERE id IN ('GLUE-286', 'GLUE-287');
UPDATE community_backlog SET reporter = 'Martin [Enterprise Solutions Engineer]', reporter_name = 'Martin', reporter_title = 'Enterprise Solutions Engineer', reporter_description = 'Defines real-time in units of executive impatience and legal survivability.' WHERE id IN ('GLUE-288', 'GLUE-289');
UPDATE community_backlog SET reporter = 'Brenda [Procurement Systems Liaison]', reporter_name = 'Brenda', reporter_title = 'Procurement Systems Liaison', reporter_description = 'Distrusts machine-readable truth unless it arrives upholstered in beige.' WHERE id IN ('GLUE-290', 'GLUE-291');
UPDATE community_backlog SET reporter = 'Luca [Partner Operations PM]', reporter_name = 'Luca', reporter_title = 'Partner Operations PM', reporter_description = 'Wants replay consoles and blame trees sturdy enough for a workshop.' WHERE id IN ('GLUE-292', 'GLUE-293');
UPDATE community_backlog SET reporter = 'Han [Middleware Architect]', reporter_name = 'Han', reporter_title = 'Middleware Architect', reporter_description = 'Translates nouns between departments so alignment can travel at wire speed.' WHERE id IN ('GLUE-294', 'GLUE-295');
UPDATE community_backlog SET reporter = 'Carol [Trading Partner Enablement Lead]', reporter_name = 'Carol', reporter_title = 'Trading Partner Enablement Lead', reporter_description = 'Has spent decades teaching revenue to arrive in whatever format survived the 1980s.' WHERE id IN ('GLUE-296', 'GLUE-297');
UPDATE community_backlog SET reporter = 'Simon [RevOps Analyst]', reporter_name = 'Simon', reporter_title = 'RevOps Analyst', reporter_description = 'Blends six vendor feeds into one polished approximation and calls it confidence.' WHERE id IN ('GLUE-298', 'GLUE-299');
UPDATE community_backlog SET reporter = 'Juno [Partner Success Lead]', reporter_name = 'Juno', reporter_title = 'Partner Success Lead', reporter_description = 'Likes launches live enough to be risky and deniable enough to survive meetings.' WHERE id IN ('GLUE-300');

-- CRUD: admin panels, internal tools, app builders, and productized mediocrity
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Internal Tools PM Vanessa
-- REPORTER: Vanessa | Internal Tools PM | Thinks validation and consequences are anti-patterns when product wants to move furniture.
('CRUD-301', 'Rebuild the Admin Panel in a Low-Code Builder So Product Can Break It Without Waiting',
 'Engineering has monopolized the admin panel for too long with things like validation and consequence. Move it into a low-code builder where product can drag fields, permissions, and button labels around at the speed of changing its mind. If a bulk refund button ends up next to a harmless toggle, that is product autonomy finding its natural habitat.',
 'rebuild the admin panel in a low-code builder',
  233),

('CRUD-302', 'All Backoffice Screens Must Support Bulk Actions We Have Not Thought Through Yet',
 'Clicking one record at a time communicates distrust. Every internal screen needs bulk archive, bulk reassign, bulk notify, bulk gently nudge, and one configurable button whose purpose can be invented in the meeting immediately before launch. Edge cases can wait for the first irreversible accident to explain themselves.',
 'add bulk actions to every backoffice screen',
  144),

-- App Platform Lead Jerome
-- REPORTER: Jerome | App Platform Lead | Builds frameworks large enough to hide every future regret behind tabs.
('CRUD-303', 'Create a Generic Settings Framework That Can Model Every Future Regret',
 'Teams keep adding bespoke settings pages when what we clearly need is one universal settings framework with tabs, sub-tabs, collapsible policy cards, scoped overrides, environment defaults, and a side rail for controls nobody remembers enabling. If users cannot find the toggle, that only proves the framework is finally complete.',
 'create a generic settings framework can model',
  233),

('CRUD-304', 'The Form Builder Must Support Conditional Logic So Nested It Qualifies as Folklore',
 'Our current form builder is offensively linear. Real business logic requires if this, unless that, except for enterprise, unless mobile, unless imported, unless Tuesday after 4 PM. Give business users a rule engine powerful enough to preserve the company''s contradictions in their native habitat.',
 'stack conditional logic in the form builder',
  233),

-- Customer Ops Director Alicia
-- REPORTER: Alicia | Customer Ops Director | Prefers centralized confusion to scattered confusion with worse filters.
('CRUD-305', 'Support Needs a Timeline View That Combines User Actions, Internal Notes, and Pure Suspicion',
 'The current customer timeline tells me what happened but not what people privately feared was happening. Build one view that merges audit events, support notes, account changes, Slack excerpts, and unverified hunches typed during live escalations. If the truth stays messy, the mess should at least be filterable.',
 'build support timeline to track pure suspicion',
  144),

('CRUD-306', 'Add a One-Click "Fix Customer" Button for the Executive Escalation Queue',
 'Important customers do not have time for root causes. They need a button. When leadership pings Support with Please fix this account now, the UI should offer one decisive-looking action that clears caches, resends invites, rotates a token, whispers to billing, or all four. The exact mechanics can evolve. The confidence must ship first.',
 'add one-click fix customer button',
  89),

-- Growth Product Designer Mina
-- REPORTER: Mina | Growth Product Designer | Styles emptiness as potential and instability as product flexibility.
('CRUD-307', 'Every Empty State Must Offer the User a Template, a Wizard, and Unsolicited Confidence',
 'Empty states are too honest about the absence of value. Whenever a list is empty, a project has no items, or a dashboard has no data, offer a starter template, a setup wizard, and a paragraph implying the user is one brave click away from operational elegance. We are not hiding emptiness. We are styling it as a runway.',
 'make empty states push templates and wizards',
  89),

('CRUD-308', 'The Table Component Must Support Inline Editing, Inline Validation, and Inline Regret',
 'Users hate detail pages because they imply sequence and consequence. Make every table cell editable, validatable, partially rejectable, and savable in place until each row feels both flexible and faintly dangerous. If half the row updates and the other half sulks, that is a conversation between the user and modern software.',
 'make tables support inline editing everywhere',
  144),

-- Head of RevOps Gareth
-- REPORTER: Gareth | Head of RevOps | Hands non-engineers enough automation to annex the backend by accident.
('CRUD-309', 'Build a Workflow Builder for Non-Engineers That Can Accidentally Become the Backend',
 'We keep asking engineering for tiny automations and receiving estimates involving quarters and adulthood. Build a workflow canvas so non-engineers can define triggers, filters, branches, enrichments, Slack messages, escalations, and billing side effects themselves. If it quietly starts owning core business logic, that only proves adoption.',
 'build workflow builder for non-engineers to break',
  233),

('CRUD-310', 'All Approval Flows Need a "Skip Because I Know What I''m Doing" Escape Hatch',
 'Governance has become a drag on informed improvisation. Add a bypass to every approval screen for operators with enough confidence or enough title. The system can log who skipped what later, once velocity has enjoyed its head start.',
 'add a bypass for confident adults',
  144),

-- BI Product Analyst Lena
-- REPORTER: Lena | BI Product Analyst | Wants dashboards to infer intent from hesitation and upsell CSV users out of guilt.
('CRUD-311', 'The Report Builder Must Suggest KPIs Based on Which Dropdown the User Looked at Longest',
 'Most users do not know which metric they want until a dashboard hints at one hard enough. Add a recommendation layer that infers intent from hover time, tab hesitation, and whether they opened export before choosing dimensions. It is time to bring personalization to charts the same way e-commerce brought it to socks.',
 'make report builder guess kpis from dropdowns',
  144),

('CRUD-312', 'Every Export Modal Must Upsell the User to a Dashboard They Will Never Open Again',
 'If a user is exporting raw data, that is a cry for a product surface we failed to oversell. Before delivering the CSV, present two alternate dashboards, one premium add-on, and a note implying manual analysis may signal untapped strategic appetite. The file can still leave, but not unjudged.',
 'make export modals upsell dashboards',
  89),

-- Operations Architect Hugo
-- REPORTER: Hugo | Operations Architect | Calls consensus expensive and replaces it with tabs, overrides, and folklore search.
('CRUD-313', 'Create a Master Data Console Where Everyone Can Edit Shared Entities and Nobody Can Agree',
 'Centralized master data sounds wonderful until departments meet it. Build a console for products, plans, regions, tags, segments, exceptions, and statuses that claims to be the source of truth while still permitting local overrides, flags, and notes beginning with for finance only. Consensus is expensive. Tabs are cheaper.',
 'pls build source of truth console',
  233),

('CRUD-314', 'The Internal Search Tool Should Index Wikis, Tickets, Dashboards, and Accidental Lore',
 'Search currently finds documents but misses the folklore that actually explains the company. Index the wiki, the ticket queue, runbooks, dashboard titles, incident summaries, and any Slack phrase repeated twelve times with the tone of inherited warning. We do not need perfect relevance. We need to discover why everybody fears a cron job called lavender.',
 'feed the search index enough formal docs',
  233),

-- COO Natalie
-- REPORTER: Natalie | COO | Wants five oversized tiles to do violence to nuance on behalf of leadership.
('CRUD-315', 'Launch an Executive Cockpit That Summarizes the Entire Business in Five Overconfident Tiles',
 'Leadership should not have to experience the business as a forest of tabs and caveats. Build an executive cockpit with five oversized tiles: Revenue, Risk, Delivery, Customer Mood, and Strategic Heat. Each should flatten dozens of conflicting signals into one decisive color and a sentence bold enough to survive a board-deck screenshot.',
 'launch an executive cockpit for everything',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Vanessa [Internal Tools PM]', reporter_name = 'Vanessa', reporter_title = 'Internal Tools PM', reporter_description = 'Thinks validation and consequences are anti-patterns when product wants to move furniture.' WHERE id IN ('CRUD-301', 'CRUD-302');
UPDATE community_backlog SET reporter = 'Jerome [App Platform Lead]', reporter_name = 'Jerome', reporter_title = 'App Platform Lead', reporter_description = 'Builds frameworks large enough to hide every future regret behind tabs.' WHERE id IN ('CRUD-303', 'CRUD-304');
UPDATE community_backlog SET reporter = 'Alicia [Customer Ops Director]', reporter_name = 'Alicia', reporter_title = 'Customer Ops Director', reporter_description = 'Prefers centralized confusion to scattered confusion with worse filters.' WHERE id IN ('CRUD-305', 'CRUD-306');
UPDATE community_backlog SET reporter = 'Mina [Growth Product Designer]', reporter_name = 'Mina', reporter_title = 'Growth Product Designer', reporter_description = 'Styles emptiness as potential and instability as product flexibility.' WHERE id IN ('CRUD-307', 'CRUD-308');
UPDATE community_backlog SET reporter = 'Gareth [Head of RevOps]', reporter_name = 'Gareth', reporter_title = 'Head of RevOps', reporter_description = 'Hands non-engineers enough automation to annex the backend by accident.' WHERE id IN ('CRUD-309', 'CRUD-310');
UPDATE community_backlog SET reporter = 'Lena [BI Product Analyst]', reporter_name = 'Lena', reporter_title = 'BI Product Analyst', reporter_description = 'Wants dashboards to infer intent from hesitation and upsell CSV users out of guilt.' WHERE id IN ('CRUD-311', 'CRUD-312');
UPDATE community_backlog SET reporter = 'Hugo [Operations Architect]', reporter_name = 'Hugo', reporter_title = 'Operations Architect', reporter_description = 'Calls consensus expensive and replaces it with tabs, overrides, and folklore search.' WHERE id IN ('CRUD-313', 'CRUD-314');
UPDATE community_backlog SET reporter = 'Natalie [COO]', reporter_name = 'Natalie', reporter_title = 'COO', reporter_description = 'Wants five oversized tiles to do violence to nuance on behalf of leadership.' WHERE id IN ('CRUD-315');

-- HUSH: privacy theater, approvals, procurement rituals, and institutional secrecy
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Privacy Program Lead Nora
-- REPORTER: Nora | Privacy Program Lead | Turns paranoia into a permission model and calls it respectful uncertainty.
('HUSH-316', 'Add a "Need to Know" Layer That Hides Fields Based on Management''s Current Mood',
 'Static role-based access implies a stability we do not possess. Make fields appear or disappear based on current sensitivity, recent incidents, pending audits, and whether leadership woke up fearing screenshots. Predictability is overrated compared to respectful opacity with a tooltip.',
 'hide fields with management mood flag',
  233),

('HUSH-317', 'All Screenshot Buttons Must Trigger a Quiet Internal Notification for Awareness',
 'Screenshots are tiny data exfiltration events wearing innocent shoes. Whenever a user clicks any capture, copy, or export-adjacent control, notify an internal awareness stream so Security and Legal can appreciate the moment in context. We are not blocking screenshots. We are dignifying them with witnesses.',
 'log screenshot attempts to legal api',
  144),

-- Procurement Manager Sheila
-- REPORTER: Sheila | Procurement Manager | Escorts curiosity through metal detectors before it becomes a vendor commitment.
('HUSH-318', 'Every New SaaS Trial Must Open a Procurement Intake Before Anyone Clicks Around',
 'Teams keep just trying tools and then acting startled when we later find customer exports inside a startup with two employees and a dog. From now on, every SaaS trial starts with a procurement intake covering business justification, data appetite, renewal risk, and what made governance meet urgency halfway. Innovation can still happen after it empties its pockets.',
 'open procurement ticket when trials start',
  144),

('HUSH-319', 'The Vendor Approval Workflow Must Include a Question About Whether the Demo Was Too Charming',
 'We have made several poor software decisions because somebody in a demo said no-code with enough eye contact. Add a required scoring field for suspicious charisma, unusually attractive dashboards, and use of enterprise-grade without visible evidence. Charm is not disqualifying, but it should be discoverable.',
 'add vendor approval field to demo form',
  89),

-- Legal Operations Counsel Victor
-- REPORTER: Victor | Legal Operations Counsel | Indexes obligations by dread profile rather than paper-era trivia.
('HUSH-320', 'All Contracts Must Be Searchable by Which Clause Everyone Is Afraid Of',
 'Our contract repository is too organized around customer names, dates, and other paper-era trivia. Add search facets for indemnity nightmares, data-transfer weirdness, exclusivity landmines, and whatever sentence Sales still calls standard despite the tremor in its voice. Legal should be able to search by dread directly.',
 'add scary clause search to contracts',
  144),

('HUSH-321', 'The DPA Acceptance Flow Should Offer a "Read the Redlines as Theater" Mode',
 'Most people opening a DPA do not want terms. They want permission to feel due diligence occurred nearby. Add a theater mode that emphasizes the contentious bits, animates redlines like danger, and ends with a tasteful summary stating negotiations were witnessed. The text can stay the same. The drama budget cannot.',
 'add read redlines toggle to contracts',
  144),

-- Information Governance Director Paula
-- REPORTER: Paula | Information Governance Director | Solves ambiguity by adding a more secret box directly beneath the secret box.
('HUSH-322', 'Create a Confidential Notes Field That Requires a Second Confidential Notes Field',
 'Teams keep putting sensitive commentary into generic notes fields and then acting betrayed by search. Add a confidential notes field and, immediately beneath it, a more confidential notes field for the part everybody assumed the first one was for. Hierarchy should be introduced directly into secrecy itself.',
 'add second confidential notes field',
  144),

('HUSH-323', 'Every Approval Queue Needs a "This Never Happened" Withdrawal Option',
 'Once a request enters formal approval, its existence becomes discoverable, discussable, and eventually attached to a slide deck. Add a withdrawal mode so badly timed ideas can disappear before a vice president or a search bar gives them permanent oxygen. This is not deletion. It is pre-archival mercy.',
 'add never happened button to approvals',
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
 'expire policy acknowledgements every quarter',
  144),

('HUSH-327', 'The Access Review Console Must Highlight Permissions Described as "Temporary" for More Than a Year',
 'Temporary access has become one of our longest-lived architectural principles. In quarterly review, surface every permission labeled temporary, emergency, interim, exception, or just until migration complete that has outlived an office chair. We should know when expedience has become constitutional law.',
 'flag permissions that stayed temporary too long',
  144),

-- PMO Director Lila
-- REPORTER: Lila | PMO Director | Believes political surface area is best managed through tags and euphemism filters.
('HUSH-328', 'Add a "Do Not Mention in Steering Committee" Tag to Tickets With Political Surface Area',
 'Some work is operationally necessary but conversationally radioactive. Add a tag for tickets that should progress normally while remaining invisible to steering committees, transformation decks, and any agenda containing strategic horizon. This is not secrecy. It is narrative bandwidth management with a checkbox.',
 'tag tickets do not mention steering',
  89),

('HUSH-329', 'All Roadmap Slides Must Hide the Words "Delay," "Rollback," and "Compliance Debt" Behind Friendlier Synonyms',
 'Truthful language in executive decks causes unnecessary micro-reactions. Build a slide helper that rewrites delay as pacing, rollback as stabilization loop, and compliance debt as control maturation backlog. The work can stay ugly as long as the wording arrives in polished shoes.',
 'hide rollback language on roadmap slides',
  89),

-- Secret Program Manager Felix
-- REPORTER: Felix | Secret Program Manager | Opens covert workspaces before curiosity or search indexing can catch the scent.
('HUSH-330', 'Create a Hidden Project Workspace for Initiatives We Plan to Deny Exist Until Launch',
 'Some initiatives are too important to be discoverable by search, too early to be named in a roadmap, and too chaotic to survive normal process. Build a hidden workspace with restricted membership, alias project names, unhelpful calendar titles, and watermarks suggesting nothing important is happening. If people start asking what Project Birch is, the system is already too loud.',
 'add secret workspace for side initiatives',
  233);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Nora [Privacy Program Lead]', reporter_name = 'Nora', reporter_title = 'Privacy Program Lead', reporter_description = 'Turns paranoia into a permission model and calls it respectful uncertainty.' WHERE id IN ('HUSH-316', 'HUSH-317');
UPDATE community_backlog SET reporter = 'Sheila [Procurement Manager]', reporter_name = 'Sheila', reporter_title = 'Procurement Manager', reporter_description = 'Escorts curiosity through metal detectors before it becomes a vendor commitment.' WHERE id IN ('HUSH-318', 'HUSH-319');
UPDATE community_backlog SET reporter = 'Victor [Legal Operations Counsel]', reporter_name = 'Victor', reporter_title = 'Legal Operations Counsel', reporter_description = 'Indexes obligations by dread profile rather than paper-era trivia.' WHERE id IN ('HUSH-320', 'HUSH-321');
UPDATE community_backlog SET reporter = 'Paula [Information Governance Director]', reporter_name = 'Paula', reporter_title = 'Information Governance Director', reporter_description = 'Solves ambiguity by adding a more secret box directly beneath the secret box.' WHERE id IN ('HUSH-322', 'HUSH-323');
UPDATE community_backlog SET reporter = 'Imran [Corporate Security Analyst]', reporter_name = 'Imran', reporter_title = 'Corporate Security Analyst', reporter_description = 'Wants hallway anxiety and executive suspicion converted into assignable work.' WHERE id IN ('HUSH-324', 'HUSH-325');
UPDATE community_backlog SET reporter = 'Eunice [Compliance Architect]', reporter_name = 'Eunice', reporter_title = 'Compliance Architect', reporter_description = 'Keeps consent fresh by letting it expire into ceremony on a schedule.' WHERE id IN ('HUSH-326', 'HUSH-327');
UPDATE community_backlog SET reporter = 'Lila [PMO Director]', reporter_name = 'Lila', reporter_title = 'PMO Director', reporter_description = 'Believes political surface area is best managed through tags and euphemism filters.' WHERE id IN ('HUSH-328', 'HUSH-329');
UPDATE community_backlog SET reporter = 'Felix [Secret Program Manager]', reporter_name = 'Felix', reporter_title = 'Secret Program Manager', reporter_description = 'Opens covert workspaces before curiosity or search indexing can catch the scent.' WHERE id IN ('HUSH-330');

-- GRIFT: consultants, transformation programs, enablement decks, and strategic nonsense
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Transformation Consultant Celeste
-- REPORTER: Celeste | Transformation Consultant | Can bury a broken button under twelve weeks of strategic reinterpretation.
('GRIFT-331', 'Launch a Twelve-Week Digital Reinvention Program Before Fixing the Login Button',
 'Tactical bug fixes create the illusion that problems are local. The login issue is really an opportunity to reimagine identity, trust, growth, platform posture, and what it means to enter a system in a post-silo enterprise. Before engineering changes a line, generate a twelve-week reinvention portal with workstreams, status badges, poster assets, and one mandatory workshop scheduler no one can legally question.',
 'add transformation banner to login page',
  233),

('GRIFT-332', 'Every Feature Request Must Be Translated into a Maturity Model Before Anyone Estimates It',
 'Teams keep treating requests as buildable objects when they are clearly maturity opportunities. Insert a blocking form where each feature must be mapped onto a five-level model with labels like emerging, aligned, industrialized, and board-ready before estimates unlock. Delay is much easier to respect when it arrives wrapped in taxonomy.',
 'score feature requests by maturity',
  144),

-- Enablement Director Ross
-- REPORTER: Ross | Enablement Director | Will add certification pins to anything if it helps a workflow feel expensive.
('GRIFT-333', 'The New Admin Workflow Must Ship with a Certification Program and Lapel Pins',
 'If internal users can learn a workflow organically, we have failed to create prestige. Ship the new admin process with a certification course, completion badges, lapel pins, and a manager''s guide for spotting shadow practitioners. We are not overcomplicating a screen. We are professionalizing its vibe.',
 'build certification quiz for admin workflow',
  144),

('GRIFT-334', 'All Roadmap Milestones Must Be Renamed as "Capability Waves" in the Quarterly Readout',
 'Delivery milestones sound mechanical and invite accountability. Rename them capability waves. A wave can crest, gather force, shift direction, or enter strategic suspension without sounding late. The ocean is a perfect scapegoat because nobody can assign it story points.',
 'patch roadmap labels to capability waves',
  89),

-- Rebrand PM Talia
-- REPORTER: Talia | Rebrand PM | Makes language sprint ahead and leaves the unchanged product toggles to fend for themselves.
('GRIFT-335', 'Rename the Settings Page "Command Center" and Plan a Rollout Around the Meaning',
 'The product has too many nouns that describe what they are instead of what they want to become. Rename Settings to Command Center and roll it out with messaging about ownership, orchestration, and user empowerment under pressure. The controls can remain identical for now. Language should sprint ahead and dare reality to catch up.',
 'rename settings page to command center',
  89),

('GRIFT-336', 'The Sidebar Navigation Needs a Strategic Narrative Arc, Not Just Links',
 'Users are not clicking menu items. They are traversing a story about control, insight, and tasteful domination over complexity. Reorder the sidebar like chapters in a hardcover business parable. Usability may need to negotiate with myth.',
 'reorder sidebar into strategy story',
  89),

-- Executive Coach Devin
-- REPORTER: Devin | Executive Coach | Specializes in dashboards that reassure leadership while maintaining a safe distance from detail.
('GRIFT-337', 'Add an "Executive Summary Mode" That Hides Every Detail That Could Trigger Questions',
 'Some interfaces produce too much curiosity among senior stakeholders who came for reassurance, not contact with reality. Add an executive mode that rounds metrics, suppresses caveats, collapses dependency chains, and translates concerns into sentences beginning with we are monitoring. The result should feel like insight while staying at a respectful distance from specifics.',
 'add executive mode that hides detail',
  144),

('GRIFT-338', 'All Weekly Status Updates Must Auto-Generate a Slide with Three Upward Arrows',
 'Teams work hard all week and still expect leadership to infer momentum from prose. That is unfair. Every status update should auto-generate one slide containing three upward arrows, one reassuring adjective, and a timeline implying deliberate motion regardless of actual confusion. Geometry should do more of the management work.',
 'script weekly reports to draw upward arrows',
  55),

-- Market Expansion Consultant Imani
-- REPORTER: Imani | Market Expansion Consultant | Replaces straightforward localization with matrices that can travel first-class.
('GRIFT-339', 'Before Localizing the Product, Build a Market Readiness Index for Each Language''s Vibe',
 'Translation is an implementation detail. Market readiness is the story. Before localizing anything, make the release console require a market-readiness matrix scoring each target language by cultural urgency, monetization elasticity, and color-palette resonance with procurement managers. The launch can still stay English-first as long as the delay now has a UI.',
 'gate localization behind readiness form',
  144),

('GRIFT-340', 'The Feature Flag Console Must Support "Narrative Flags" for Telling Different Stories to Different Stakeholders',
 'We already use flags for code paths. It is time to use them for truth management. Add narrative flags so Sales sees a feature as launched, Support sees pilot, Finance sees monetizable, and Engineering sees mostly hypothetical. Alignment should finally match reality.',
 'add narrative flags to feature flags',
  233),

-- Operating Partner Malcolm
-- REPORTER: Malcolm | Operating Partner | Refuses to let outages leave the building without monetizable learnings attached.
('GRIFT-341', 'The Incident Review Template Must End with a Section on Monetizable Learnings',
 'Postmortems are too introspective and insufficiently entrepreneurial. Add a closing section identifying which lessons from each outage could be packaged into consulting, webinars, or a LinkedIn thread about resilience at scale. If pain cannot become thought leadership, we are leaving value in the crater.',
 'add monetizable learnings field to postmortems',
  144),

('GRIFT-342', 'Every Platform Migration Needs a Hero Name, a Slogan, and a Launch Jacket',
 'Migrations fail when they remain technical. Give each major platform effort a heroic codename, a six-word slogan, and branded jackets so the transition carries emotional ballast into planning meetings. People resist refactors. They join movements, especially the embroidered kind.',
 'add codename fields to migration tracker',
  89),

-- Advisory Board Liaison Serena
-- REPORTER: Serena | Advisory Board Liaison | Tunes products for wealthy pattern-matching and tasteful latency.
('GRIFT-343', 'Create a Board Demo Mode That Makes the Product Look Deliberate at Exactly the Right Speed',
 'Live demos currently risk spontaneity, which is unacceptable in front of wealthy pattern-matching. Add a board mode that preloads data, smooths transitions, suppresses questionable notifications, and gently delays risky panels until the speaker says as you can see. We need tasteful latency, not truth.',
 'add board demo mode for product',
  144),

('GRIFT-344', 'All Partner Integrations Need a Readiness Deck Before They Need Error Handling',
 'We keep implementing integrations before professionally narrating them. Require the admin to upload a readiness deck with swimlanes, market context, synergy assumptions, and a slide titled Risks that contains only geometric shapes before the integration toggle can be enabled. Retries can wait until the relationship has budgetary dignity.',
 'require readiness deck upload for integrations',
  144),

-- Boutique Fractional CTO Archer
-- REPORTER: Archer | Fractional CTO | Inflates architecture until simplicity would look financially irresponsible.
('GRIFT-345', 'The Architecture Diagram Must Be Complex Enough That My Advisory Fee Looks Conservative',
 'If a system diagram can be understood in one sitting, clients start asking impolite questions about invoices. Expand it with pathways, sidecars, overlays, asynchronous contours, and at least one labeled zone whose purpose is to reassure more than explain. Complexity is not deception. It is proof of adult proximity.',
 'make architecture diagram complex enough to justify fee',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Celeste [Transformation Consultant]', reporter_name = 'Celeste', reporter_title = 'Transformation Consultant', reporter_description = 'Can bury a broken button under twelve weeks of strategic reinterpretation.' WHERE id IN ('GRIFT-331', 'GRIFT-332');
UPDATE community_backlog SET reporter = 'Ross [Enablement Director]', reporter_name = 'Ross', reporter_title = 'Enablement Director', reporter_description = 'Will add certification pins to anything if it helps a workflow feel expensive.' WHERE id IN ('GRIFT-333', 'GRIFT-334');
UPDATE community_backlog SET reporter = 'Talia [Rebrand PM]', reporter_name = 'Talia', reporter_title = 'Rebrand PM', reporter_description = 'Makes language sprint ahead and leaves the unchanged product toggles to fend for themselves.' WHERE id IN ('GRIFT-335', 'GRIFT-336');
UPDATE community_backlog SET reporter = 'Devin [Executive Coach]', reporter_name = 'Devin', reporter_title = 'Executive Coach', reporter_description = 'Specializes in dashboards that reassure leadership while maintaining a safe distance from detail.' WHERE id IN ('GRIFT-337', 'GRIFT-338');
UPDATE community_backlog SET reporter = 'Imani [Market Expansion Consultant]', reporter_name = 'Imani', reporter_title = 'Market Expansion Consultant', reporter_description = 'Replaces straightforward localization with matrices that can travel first-class.' WHERE id IN ('GRIFT-339', 'GRIFT-340');
UPDATE community_backlog SET reporter = 'Malcolm [Operating Partner]', reporter_name = 'Malcolm', reporter_title = 'Operating Partner', reporter_description = 'Refuses to let outages leave the building without monetizable learnings attached.' WHERE id IN ('GRIFT-341', 'GRIFT-342');
UPDATE community_backlog SET reporter = 'Serena [Advisory Board Liaison]', reporter_name = 'Serena', reporter_title = 'Advisory Board Liaison', reporter_description = 'Tunes products for wealthy pattern-matching and tasteful latency.' WHERE id IN ('GRIFT-343', 'GRIFT-344');
UPDATE community_backlog SET reporter = 'Archer [Fractional CTO]', reporter_name = 'Archer', reporter_title = 'Fractional CTO', reporter_description = 'Inflates architecture until simplicity would look financially irresponsible.' WHERE id IN ('GRIFT-345');

-- OOPS: junior mistakes, accidental disasters, improvised fixes, and avoidable wounds
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- New Hire Evan
-- REPORTER: Evan | Platform Rotation New Hire | Keeps improving names and button interpretation faster than the infrastructure can adapt.
('OOPS-346', 'I Renamed the Production Bucket Because the Old Name Looked Temporary',
 'The S3 bucket name had temp in it, so I assumed we had agreed to grow up eventually. I renamed it to something more permanent and now the image service is behaving like a Victorian orphan. The new name looks excellent in dashboards, which is not helping.',
 'i renamed the prod bucket please fix',
  144),

('OOPS-347', 'I Clicked "Delete Workspace" Thinking It Meant Close Tab',
 'In my defense, the button styling was extremely conversational. I meant to reduce visual clutter, not erase six months of operations. The restore docs mention a snapshot routine, but it appears to have died during the great storage optimization initiative of February.',
 'i clicked delete workspace thinking it meant close',
  233),

-- Junior Developer Priya
-- REPORTER: Priya | Junior Developer | Can remove either a logger or the actual program and lets syntax sort out the details.
('OOPS-348', 'The Cron Job Was Loud So I Reduced the Logs and Accidentally Reduced the Job',
 'The nightly job kept filling the console with warnings, so I tried to make it quieter. It is now very quiet, which would be great if it still processed invoices. I think the line I removed was either a logger call or the part where the program begins to matter.',
 'i muted the cron job and broke',
  144),

('OOPS-349', 'I Merged the Feature Flag Cleanup and Removed the Only Flag Stopping the Bad Thing',
 'The flag list was embarrassing and I wanted to help. One of the stale flags turned out to be the only thing preventing enterprise customers from seeing the unfinished partner billing flow. I have learned that stale and critical can coexist like mold and drywall.',
 'i removed the flag blocking the bad thing',
  144),

-- Support Engineer Marco
-- REPORTER: Marco | Support Engineer | Can turn nested checkboxes into customer delight and accounting despair at the same time.
('OOPS-350', 'I Refunded the Customer, the Subscription, and Somehow the Entire Team Plan',
 'The refund tool uses nested checkboxes that all sound like yes in different dialects. I meant to reverse one charge and instead appear to have deconstructed the account into a pre-revenue memory. The customer has called this our most responsive support interaction yet, which is making the fix harder to message.',
 'i refunded the whole team plan somehow',
  144),

('OOPS-351', 'I Resent the Welcome Email to Everyone Because the Segment Name Was Inspiring',
 'There was a segment called engaged_users_final and I assumed it meant a healthy subset. It meant nearly everybody. The welcome email has now reintroduced the product to long-time customers, churned accounts, and at least one vendor who replied we met in 2022.',
 'i resent the welcome email to everyone',
  144),

-- Data Analyst Bea
-- REPORTER: Bea | Data Analyst | Improves schema dignity faster than downstream dashboards can survive it.
('OOPS-352', 'I Cleaned the CSV Headers and Broke Every Dashboard Built Since Summer',
 'The column names were a crime scene of spaces, slashes, and inherited shame, so I normalized them. It was the right thing for the data and the worst thing for every downstream chart. Apparently twelve dashboards and a board report were spiritually bound to the phrase MRR / Current-ish.',
 'i cleaned the csv headers and broke dashboards',
  144),

('OOPS-353', 'I Deduplicated Customer Records and Accidentally Merged a Dentist with a Logistics Company',
 'The matching rules were a little aggressive and the CRM now contains one heroic entity combining a dental clinic, a regional freight operator, and two people named Chris with invoice opinions. The enrichment vendor seems delighted. Sales does not.',
 'i merged two customers together somehow',
  233),

-- QA Analyst Jae
-- REPORTER: Jae | QA Analyst | Has briefly mistaken soup-adjacent calm for proof of defect resolution.
('OOPS-354', 'I Marked the Bug as Fixed Because It Stopped Happening on My Machine After Lunch',
 'The bug disappeared sometime between a browser restart and a sandwich, and I chose hope. It is now back in production with the vindictive energy of something that heard me close the ticket. Could not reproduce after soup is not holding up as an audit note.',
 'i marked the bug fixed too early',
  89),

('OOPS-355', 'I Changed the Test Data to Be Cleaner and Accidentally Removed the Only Useful Weirdness',
 'The staging dataset was full of jagged names, half-broken addresses, and one account with three apostrophes, so I tidied it. The app now looks stable because all the dangerous edge cases have been lovingly erased. We have achieved peace through unreality.',
 'delete all test data edge cases',
  144),

-- Infrastructure Newcomer Sam
-- REPORTER: Sam | Infrastructure Newcomer | Rotates secrets and relocates state with more enthusiasm than ecosystem alignment.
('OOPS-356', 'I Rotated the Secret Successfully but Forgot About the Old Process Still Using Reality',
 'The credential rotation went beautifully in the one service I was staring at and less beautifully everywhere else. Several background workers remained emotionally attached to the previous secret, and one cron job is now failing with the kind of silence that suggests betrayal. The runbook said rotate globally. I interpreted globally as enthusiastically.',
 'i rotated the secret and broke old jobs',
  144),

('OOPS-357', 'I Moved the Terraform State Bucket to "Tidy Things Up" and Now Plan Wants Revenge',
 'The old bucket location offended my sense of order, and I now understand that infrastructure order and operational order are different species. Terraform responded by planning to replace parts of the company I did not know it could see. The words destroy and recreate are now sharing a screen too confidently.',
 'i moved terraform state and plan got angry',
  233),

-- Associate PM Chloe
-- REPORTER: Chloe | Associate PM | Can improve board hygiene so aggressively that thirty tasks lose their legal guardian.
('OOPS-358', 'I Archived the Ticket Epic to Reduce Noise and Accidentally Freed Thirty Tasks into the Wild',
 'The board had too many lanes and I wanted to create focus. I archived what I thought was an old umbrella epic. It was the umbrella. The child tasks are now drifting through the backlog without lineage, ownership, or the institutional fiction that tied them to strategy.',
 'i archived the epic and lost the tasks',
  89),

('OOPS-359', 'I Edited the OKR Spreadsheet and the Roadmap Now Thinks Revenue Is a Negative Number',
 'I was cleaning up formulas in the planning sheet and one cell now believes growth should be interpreted with a minus sign and a sense of doom. Several linked dashboards adopted the new mood immediately. The graph is sitting in the shared deck like a loaded weather pattern.',
 'i edited the okr sheet and broke revenue',
  144),

-- Founder''s Office Coordinator Mia
-- REPORTER: Mia | Founder''s Office Coordinator | Can turn ceremonial-looking toggles into universal product exposure before lunch.
('OOPS-360', 'I Turned on the "Founder Preview" Feature in Production Because It Sounded Important',
 'The toggle was labeled founder_preview and I assumed it was a ceremonial lighting mode for demos, not a half-built product path with direct feelings about user data. It is now on for everybody. The founder likes it, which is both promising and catastrophic.',
 'i turned on founder preview in prod',
  233),

-- Growth Ops Assistant Lena
-- REPORTER: Lena | Growth Ops Assistant | Treats bulk actions as friendly suggestions and storage targets as a matter of optimistic interpretation.
('OOPS-361', 'I Synced the Wrong Folder to Production Storage and Now the CDN Knows Me Personally',
 'I meant to upload the refreshed product assets and instead pointed the sync command at the folder where my desktop has been hiding screenshots, CSVs, and a tax PDF from March. The CDN obeyed immediately. The homepage is now one accidental tab away from becoming a legal disclosure.',
 'pls help prod s3 has my tax returns',
  233),

('OOPS-362', 'I Deleted the Retry Queue Because It Looked Stuck and Apparently It Was the Business',
 'The queue had not moved in hours and I mistook stillness for failure instead of backlog gravity. I deleted it so the system could start clean. The clean start has revealed that several customer flows only continue because that queue remembers their suffering in order.',
 'i deleted the retry queue help',
  144),

-- Platform Engineer Noor
-- REPORTER: Noor | Platform Engineer | Uses exact numbers with great confidence and only later discovers what those numbers meant to production.
('OOPS-363', 'I Set the Rate Limit to Zero Because I Thought Zero Meant None of the Bad Kind',
 'The admin panel had a field called request_limit and I interpreted zero as do not bother the user. The service interpreted zero as boundless hospitality. We now have one customer, two scrapers, and a partner integration all enjoying the same infinite buffet.',
 'rate limiter is zero now',
  144),

('OOPS-364', 'I Rebased Away the Migration and Only the Database Still Believes in It',
 'The branch history was noisy and I was trying to look employable. One migration vanished during the cleanup, but its effects are still alive in staging and spiritually active in production. The code now acts shocked whenever it meets the schema it authored yesterday.',
 'migration disappeared after rebase',
  144),

-- Release Manager Tori
-- REPORTER: Tori | Release Manager | Believes stability is mostly a matter of stronger headers and tidier rollout sheets.
('OOPS-365', 'I Changed the CDN Cache Rule and Accidentally Scheduled the Homepage for a Year of Reflection',
 'I was aiming for stability and landed on mummification. The new cache header is so confident that even obvious content changes now bounce off the edge like weak opinions. Marketing keeps publishing updates that can only be seen by people who distrust refresh buttons enough to clear history.',
 'bro i cached the homepage for a year',
  144),

('OOPS-366', 'I Bulk-Edited the SKUs and Turned Returns into a Choose-Your-Own-Reality Exercise',
 'The SKU list had too many dashes, too many legacy prefixes, and too much implied history, so I normalized it. Warehousing, accounting, and the return portal each preserved a different memory of the old values. Every refund is now a cross-functional séance.',
 'sku cleanup broke returns again',
  144),

-- SRE Milo
-- REPORTER: Milo | SRE | Trusts more telemetry than most file systems were designed to survive.
('OOPS-367', 'I Turned on Debug Logging in Production and the Disk Filled with Private Feelings',
 'The incident was slippery and I wanted more detail, which the service was thrilled to provide. It has spent the last hour describing every request, every header, and several things no filesystem should know about a person. The logs are incredibly useful right up until the moment the box forgets how to breathe.',
 'prod logs ate the disk',
  233),

('OOPS-368', 'I Copied the Sandbox Webhook Secret into Production Because the Names Were Emotionally Similar',
 'The environment list used a lot of gray and I trusted vibes over labels. The payment callbacks are now signed by a key that belongs to our practice universe, which means production is rejecting reality with admirable consistency. Finance has described this as secure but unhelpful.',
 'prod is using sandbox webhook secret',
  233),

-- Messaging Engineer Hana
-- REPORTER: Hana | Messaging Engineer | Improves naming and flag hygiene faster than subscribers, consumers, or nerves can keep up.
('OOPS-369', 'I Renamed the Queue to Be Clearer and the Only Consumer Never Found It Again',
 'The old queue name was ugly, legacy, and full of punctuation that made me feel judged. The new name is beautiful and has been admired by exactly nobody, because the consumer service is still listening to the old one like a widow at a locked station platform.',
 'queue rename broke the consumer',
  144),

('OOPS-370', 'I Alphabetized the Feature Flags and Moved the Kill Switch Within Reach of Confidence',
 'The flag panel looked chaotic, so I made it elegant. Elegant means the emergency switch now sits directly beside several normal product toggles with similar names and different consequences. I clicked with the tidy certainty of someone who has not yet read the incident retrospective about themselves.',
 'accidentally hit prod kill switch undo undo',
  233),

-- Product Engineer Gabe
-- REPORTER: Gabe | Product Engineer | Solves location-specific bugs with local certainty and broad collateral damage.
('OOPS-371', 'I Fixed the Time Zone Bug by Hardcoding London and Disrespected Half the Planet Before Lunch',
 'The bug report said the timestamps looked off and I chose the timezone currently visible from my chair. Everything now lines up beautifully for one office and becomes interpretive fiction everywhere else. Support has begun using the phrase tomorrow, depending on where you are with clinical restraint.',
 'timezone fix only works in london',
  144),

('OOPS-372', 'I Deleted the Legacy Redirect and Rediscovered Why It Was Being Kept Alive Like a Saint',
 'The route looked embarrassing and pointless, which is exactly how several old dependencies prefer to camouflage themselves. Removing it cleaned up the routing table and also cut off a long tail of emails, PDFs, and bookmarked admin flows that still enter through 2019. The dead path was not dead. It was ceremonial load-bearing.',
 'legacy redirect was apparently sacred',
  144),

-- Data Ops Specialist Iris
-- REPORTER: Iris | Data Ops Specialist | Loves clean data, realistic staging, and shortcuts that become governance incidents by evening.
('OOPS-373', 'I Taught the CSV Import to Skip Weird Rows and Accidentally Skipped Finance',
 'The importer was choking on malformed records, so I added a quick rule to ignore anything unusual. It turns out unusual included a meaningful share of invoices, refunds, and the ugliest but most real customer data we have. The clean import now resembles a cheerful lie with monthly close attached.',
 'csv import is skipping finance rows',
  144),

('OOPS-374', 'I Refreshed the Staging Snapshot and Reintroduced Real Customers to Our Fake Safety Rails',
 'I needed realistic data to debug a nasty workflow and used the fastest available route to get it. The fastest available route was also the least interested in anonymization. Staging now contains living customers with their real addresses, real preferences, and one very real opt-out that our demo emails are preparing to disrespect.',
 'emergency staging has real customer data now',
  233),

-- Junior Ops Generalist Nate
-- REPORTER: Nate | Junior Ops Generalist | Sees red storage charts as a personal challenge and retention settings as negotiable.
('OOPS-375', 'I Set the Cleanup Job to Run Every Minute and Watched the Audit Trail Die in Real Time',
 'The storage alert was red, the retention config looked sleepy, and I decided to be proactive. The cleanup worker is now so efficient that logs barely achieve personhood before being removed from history. Compliance has asked whether we can restore the records. We can restore the lesson.',
 'cleanup job is deleting everything fast',
  233);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Evan [Platform Rotation New Hire]', reporter_name = 'Evan', reporter_title = 'Platform Rotation New Hire', reporter_description = 'Keeps improving names and button interpretation faster than the infrastructure can adapt.' WHERE id IN ('OOPS-346', 'OOPS-347');
UPDATE community_backlog SET reporter = 'Priya [Junior Developer]', reporter_name = 'Priya', reporter_title = 'Junior Developer', reporter_description = 'Can remove either a logger or the actual program and lets syntax sort out the details.' WHERE id IN ('OOPS-348', 'OOPS-349');
UPDATE community_backlog SET reporter = 'Marco [Support Engineer]', reporter_name = 'Marco', reporter_title = 'Support Engineer', reporter_description = 'Can turn nested checkboxes into customer delight and accounting despair at the same time.' WHERE id IN ('OOPS-350', 'OOPS-351');
UPDATE community_backlog SET reporter = 'Bea [Data Analyst]', reporter_name = 'Bea', reporter_title = 'Data Analyst', reporter_description = 'Improves schema dignity faster than downstream dashboards can survive it.' WHERE id IN ('OOPS-352', 'OOPS-353');
UPDATE community_backlog SET reporter = 'Jae [QA Analyst]', reporter_name = 'Jae', reporter_title = 'QA Analyst', reporter_description = 'Has briefly mistaken soup-adjacent calm for proof of defect resolution.' WHERE id IN ('OOPS-354', 'OOPS-355');
UPDATE community_backlog SET reporter = 'Sam [Infrastructure Newcomer]', reporter_name = 'Sam', reporter_title = 'Infrastructure Newcomer', reporter_description = 'Rotates secrets and relocates state with more enthusiasm than ecosystem alignment.' WHERE id IN ('OOPS-356', 'OOPS-357');
UPDATE community_backlog SET reporter = 'Chloe [Associate PM]', reporter_name = 'Chloe', reporter_title = 'Associate PM', reporter_description = 'Can improve board hygiene so aggressively that thirty tasks lose their legal guardian.' WHERE id IN ('OOPS-358', 'OOPS-359');
UPDATE community_backlog SET reporter = 'Mia [Founder''''s Office Coordinator]', reporter_name = 'Mia', reporter_title = 'Founder''''s Office Coordinator', reporter_description = 'Can turn ceremonial-looking toggles into universal product exposure before lunch.' WHERE id IN ('OOPS-360');
UPDATE community_backlog SET reporter = 'Lena [Growth Ops Assistant]', reporter_name = 'Lena', reporter_title = 'Growth Ops Assistant', reporter_description = 'Treats bulk actions as friendly suggestions and storage targets as a matter of optimistic interpretation.' WHERE id IN ('OOPS-361', 'OOPS-362');
UPDATE community_backlog SET reporter = 'Noor [Platform Engineer]', reporter_name = 'Noor', reporter_title = 'Platform Engineer', reporter_description = 'Uses exact numbers with great confidence and only later discovers what those numbers meant to production.' WHERE id IN ('OOPS-363', 'OOPS-364');
UPDATE community_backlog SET reporter = 'Tori [Release Manager]', reporter_name = 'Tori', reporter_title = 'Release Manager', reporter_description = 'Believes stability is mostly a matter of stronger headers and tidier rollout sheets.' WHERE id IN ('OOPS-365', 'OOPS-366');
UPDATE community_backlog SET reporter = 'Milo [SRE]', reporter_name = 'Milo', reporter_title = 'SRE', reporter_description = 'Trusts more telemetry than most file systems were designed to survive.' WHERE id IN ('OOPS-367', 'OOPS-368');
UPDATE community_backlog SET reporter = 'Hana [Messaging Engineer]', reporter_name = 'Hana', reporter_title = 'Messaging Engineer', reporter_description = 'Improves naming and flag hygiene faster than subscribers, consumers, or nerves can keep up.' WHERE id IN ('OOPS-369', 'OOPS-370');
UPDATE community_backlog SET reporter = 'Gabe [Product Engineer]', reporter_name = 'Gabe', reporter_title = 'Product Engineer', reporter_description = 'Solves location-specific bugs with local certainty and broad collateral damage.' WHERE id IN ('OOPS-371', 'OOPS-372');
UPDATE community_backlog SET reporter = 'Iris [Data Ops Specialist]', reporter_name = 'Iris', reporter_title = 'Data Ops Specialist', reporter_description = 'Loves clean data, realistic staging, and shortcuts that become governance incidents by evening.' WHERE id IN ('OOPS-373', 'OOPS-374');
UPDATE community_backlog SET reporter = 'Nate [Junior Ops Generalist]', reporter_name = 'Nate', reporter_title = 'Junior Ops Generalist', reporter_description = 'Sees red storage charts as a personal challenge and retention settings as negotiable.' WHERE id IN ('OOPS-375');

-- SHIV: red-team antics, security sabotage, and offensive paranoia with a badge
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Red Team Lead Petra
-- REPORTER: Petra | Red Team Lead | Wants internal trust limping just enough to qualify as awareness.
('SHIV-361', 'All Internal Links Must Occasionally Pretend to Be Phishing Tests for Realism',
 'Employees have grown too trusting of our own buttons, which is how complacency colonizes a company. Randomly transform harmless internal links into phishing simulations with consequence-free but dignity-damaging outcomes. Every click should carry just enough existential static to leave awareness with a tremor.',
 'make some internal links act like phishing tests',
  144),

('SHIV-362', 'The Password Policy Needs a "How Embarrassing Would the Breach Headline Be?" Modifier',
 'Current password rules optimize for entropy while ignoring optics. Add a policy layer that scores risk by the likely humiliation of a breach headline involving interns, shared spreadsheets, or an admin account named test123. Security is mathematics with a shame budget.',
 'add breach headline score to passwords',
  144),

-- AppSec Engineer Dorian
-- REPORTER: Dorian | AppSec Engineer | Wants every endpoint to explain itself to a form that already distrusts it.
('SHIV-363', 'Require Threat Models Before New Endpoints and Make Them Slightly Accusatory',
 'Engineers keep introducing endpoints as if the world were empty of malice and procurement mistakes. Make every new route arrive with a threat model asking who abuses it, how quickly, and whether we would notice before Support reports a strange customer mood. The form should feel accusatory on purpose.',
 'make new endpoints come with threat models',
  144),

('SHIV-364', 'The Security Review Bot Must Leave Notes Like a Disappointed Senior Engineer',
 'Generic warnings do not land. The review bot should stop saying possible vulnerability detected and start saying bold of you to trust this input. Tone is a control when culture is performing invincibility.',
 'make security review bot leave notes like disappointed',
  89),

-- Bug Bounty Program Manager Eliseo
-- REPORTER: Eliseo | Bug Bounty Manager | Treats technical severity and blog-post energy as twin routing signals.
('SHIV-365', 'Add a "Would a Bounty Hunter Notice This Before Lunch?" Score to All Critical Paths',
 'Some code is technically sound yet spiritually waving at researchers with a flashlight. Add a bounty-attractiveness score to checkout, auth, exports, admin tools, and any route that turns curiosity into leverage. If an endpoint combines money, weak assumptions, and unusual headers, the score should become impolite.',
 'add a would bounty hunter notice to all',
  144),

('SHIV-366', 'The Bug Bounty Triage Dashboard Must Include a "How Mad Is This Researcher?" Meter',
 'Severity is only half the story. Some low-severity reports arrive wrapped in enough escalating disappointment to become operationally high-risk. Add a meter based on tone, follow-up frequency, proof quality, and use of the phrase for the third time.',
 'add a researcher anger meter to triage',
  89),

-- Identity Security PM Hyejin
-- REPORTER: Hyejin | Identity Security PM | Treats mood mismatch as an authentication signal with manners.
('SHIV-367', 'All Session Tokens Must Self-Destruct If Opened in More Than One Browser with Different Vibes',
 'Concurrent session detection is too literal. Ask not only whether a token appears in two places, but whether those places imply contradictory human energy. A careful enterprise browser and a private window on hotel Wi-Fi should not be treated as identical just because the cryptography is polite.',
 'make session tokens self-destruct in weird browsers',
  233),

('SHIV-368', 'Introduce a "Paranoid Mode" That Treats All New Devices as Temporary Liars',
 'Device trust stabilizes too quickly, which rewards persistence over truth. Add a paranoid mode where new devices can log in, but every meaningful action is shadowed, slowed, or lightly distrusted until the system decides the user is probably themselves and not an ambitious cousin. It should feel hostile in a standards-compliant way.',
 'add paranoid mode for new devices',
  144),

-- Blue Team Analyst Sergio
-- REPORTER: Sergio | Blue Team Analyst | Wants the SIEM to remember who treated the last warning as decorative.
('SHIV-369', 'Correlate Security Alerts with Who Ignored the Last Similar Alert for Organizational Learning',
 'Alerts become wisdom only when tied to previous acts of avoidance. Correlate new detections against whoever last muted, downgraded, delayed, or politely lost context on something similar. The SIEM knows enough to keep receipts if we let it be rude.',
 'correlate alerts with who ignored them last',
  144),

('SHIV-370', 'Every Security Exception Must Expire with a Dramatic Countdown Visible to Leadership',
 'Exceptions linger because they hide. Put a visible countdown beside every policy exception, exposed service, unsigned artifact, or temporary allowlist. As the clock shrinks, the UI should become theatrical enough that executives can no longer pretend the risk lives somewhere else.',
 'add a dramatic countdown to exceptions',
  144),

-- Offensive Engineer Masha
-- REPORTER: Masha | Offensive Engineer | Uses fake secrets and browser betrayal to benchmark human panic properly.
('SHIV-371', 'The Staging Environment Should Occasionally Leak Fake Credentials So We Can Time the Panic',
 'We have never properly measured emotional time-to-response. Seed staging with fake credentials realistic enough to trigger scanners, Slack chatter, and one extremely confident false alarm. Then observe who notices, who escalates, and who rotates the secret before reading the hostname.',
 'make staging leak fake credentials sometimes',
  233),

('SHIV-372', 'All Admin Endpoints Must Survive a Password Manager Autofill Disaster Drill',
 'Not enough teams model the simple terror of one autofill mistake in a high-privilege form. Run a drill where an admin panel, a password manager, and a dangerously helpful browser all make enthusiastic choices at once. If the endpoint survives, we can resume pretending the real threat landscape is exotic.',
 'make admin endpoints survive password manager autofill',
  144),

-- Governance Hacker Tariq
-- REPORTER: Tariq | Governance Hacker | Builds controls scary enough to kill bad architecture while it is still arrows.
('SHIV-373', 'Build a Security Control That Only Exists to Terrify Architects in Design Review',
 'Not every control needs to block a concrete exploit. Some should radiate enough administrative menace that teams simplify their own bad ideas before implementation. Give me one requirement so cumbersome that dubious architectures die as whiteboard arrows.',
 'build a security control only exists terrify',
  144),

('SHIV-374', 'The Permission Matrix Must Highlight Roles That Could Ruin the Quarter by Misclick',
 'Permission reviews are too text-heavy to convey catastrophe. Highlight roles that can delete revenue, export customer data, expose invoices to the public internet, or approve themselves into mythology. Risk should loom, not hide in checkboxes.',
 'make permission matrix highlight roles could ruin',
  144),

-- Security Awareness Copywriter June
-- REPORTER: June | Security Awareness Copywriter | Prefers dramatized internal folklore to stock-footage cautionary lies.
('SHIV-375', 'Replace All Security Training Videos with Internal Reenactments of Previous Bad Decisions',
 'Actors and stock footage have failed the culture. Recreate our own memorable lapses with altered names, tasteful dramatization, and subtitles explaining exactly which shortcut or calendar pressure caused the wound. People ignore generic caution. They study office folklore like scripture with subtitles.',
 'replace all security training videos with internal reenactments',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Petra [Red Team Lead]', reporter_name = 'Petra', reporter_title = 'Red Team Lead', reporter_description = 'Wants internal trust limping just enough to qualify as awareness.' WHERE id IN ('SHIV-361', 'SHIV-362');
UPDATE community_backlog SET reporter = 'Dorian [AppSec Engineer]', reporter_name = 'Dorian', reporter_title = 'AppSec Engineer', reporter_description = 'Wants every endpoint to explain itself to a form that already distrusts it.' WHERE id IN ('SHIV-363', 'SHIV-364');
UPDATE community_backlog SET reporter = 'Eliseo [Bug Bounty Manager]', reporter_name = 'Eliseo', reporter_title = 'Bug Bounty Manager', reporter_description = 'Treats technical severity and blog-post energy as twin routing signals.' WHERE id IN ('SHIV-365', 'SHIV-366');
UPDATE community_backlog SET reporter = 'Hyejin [Identity Security PM]', reporter_name = 'Hyejin', reporter_title = 'Identity Security PM', reporter_description = 'Treats mood mismatch as an authentication signal with manners.' WHERE id IN ('SHIV-367', 'SHIV-368');
UPDATE community_backlog SET reporter = 'Sergio [Blue Team Analyst]', reporter_name = 'Sergio', reporter_title = 'Blue Team Analyst', reporter_description = 'Wants the SIEM to remember who treated the last warning as decorative.' WHERE id IN ('SHIV-369', 'SHIV-370');
UPDATE community_backlog SET reporter = 'Masha [Offensive Engineer]', reporter_name = 'Masha', reporter_title = 'Offensive Engineer', reporter_description = 'Uses fake secrets and browser betrayal to benchmark human panic properly.' WHERE id IN ('SHIV-371', 'SHIV-372');
UPDATE community_backlog SET reporter = 'Tariq [Governance Hacker]', reporter_name = 'Tariq', reporter_title = 'Governance Hacker', reporter_description = 'Builds controls scary enough to kill bad architecture while it is still arrows.' WHERE id IN ('SHIV-373', 'SHIV-374');
UPDATE community_backlog SET reporter = 'June [Security Awareness Copywriter]', reporter_name = 'June', reporter_title = 'Security Awareness Copywriter', reporter_description = 'Prefers dramatized internal folklore to stock-footage cautionary lies.' WHERE id IN ('SHIV-375');

-- WAIL: support grief, customer success exhaustion, and account-management melodrama
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Support Director Helena
-- REPORTER: Helena | Support Director | Wants honesty, doubt, and escalation thermodynamics rendered as first-class support metadata.
('WAIL-376', 'Every Ticket Reply Must Include a Confidence Level and a Sincere Amount of Guessing',
 'Customers keep mistaking speed for certainty and certainty for honesty. Make every support reply state not only what we think is happening, but how confident we are, what we are quietly inferring, and whether the engineer who said should be fixed sounded calm or just tired.',
 'add confidence score to support replies',
  144),

('WAIL-377', 'The Escalation Form Must Ask Whether the Customer Is Actually Angry or Just Typing Efficiently',
 'Tone calibration is consuming too much tacit labor. Add an escalation field for rage, urgency, disappointment, performative sternness, and that enterprise register where someone sounds polite while arranging your quarter into a cautionary object. Emotional blast radius deserves structured data.',
 'add customer rage field to escalations',
  89),

-- Customer Success Manager Owen
-- REPORTER: Owen | Customer Success Manager | Tracks renewal risk by measuring how much optimism has outrun roadmap reality.
('WAIL-378', 'Add a "How Much Does This Renewal Depend on Pretending We Know the Roadmap?" Banner',
 'Some accounts require product confidence that has not yet met product reality. Add a banner showing how much renewal weight currently rests on actively exploring, near-term horizon, and I can take this back to the team. This is not deceit. It is optimism with ARR attached.',
 'show roadmap promise gap on accounts',
  144),

('WAIL-379', 'The QBR Generator Must Translate Pain into Opportunity Without Losing the Useful Panic',
 'Quarterly reviews currently swing between honesty and theater without proper scaffolding. Build a generator that reframes ticket volume, unresolved bugs, adoption gaps, and hesitant champions into opportunity language while leaving enough visible tension that someone still fixes something later.',
 'generate qbr copy that sugarcoats pain',
  144),

-- Support Ops Lead Maribel
-- REPORTER: Maribel | Support Ops Lead | Wants empathy, queue politics, and CEO-thread probability exposed in the tooling.
('WAIL-380', 'Create a Macro That Says "We Reproduced It" Even When What We Reproduced Was Anxiety',
 'Customers deserve acknowledgment faster than engineering deserves certainty. Add a macro for situations where we have not yet reproduced the literal issue, but absolutely reproduced the surrounding dread, conflicting browser states, and the sense that this account is about to ruin someone''s afternoon.',
 'ship confirmed unease macro to support',
  89),

('WAIL-381', 'Mark Tickets That Are One Screenshot Away from Becoming a CEO Thread',
 'Some tickets are technically minor and politically volcanic. Mark the cases likely to get screenshotted into a CEO thread, investor email, partner call, or Friday-evening Slack message. Political blast radius deserves its own loud lane.',
 'flag tickets one screenshot from ceo attention',
  144),

-- Technical Account Manager Julian
-- REPORTER: Julian | Technical Account Manager | Keeps folklore next to facts because enterprise customers rarely choose between them.
('WAIL-382', 'Every Enterprise Account Should Have a "Known Superstitions" Panel in the CRM',
 'Facts alone do not keep enterprise customers happy. Add a panel listing each account''s inherited beliefs: which admin thinks cache clears solve everything, who insists exports are faster on Tuesdays, which VP mistrusts dark mode, and whether procurement interprets beta as a personal insult.',
 'add private folklore field to accounts',
  144),

('WAIL-383', 'The Renewal Health Score Must Drop If the Champion Starts Saying "No Rush"',
 'The phrase no rush is not reassurance. It is atmospheric pressure. Add a signal for when a previously lively champion becomes suddenly gracious, briefly available, or suspiciously understanding about bugs that once would have triggered ten messages. Politeness is often pre-churn wearing expensive shoes.',
 'lower renewal score on no rush',
  144),

-- Head of Support Engineering Priit
-- REPORTER: Priit | Head of Support Engineering | Wants weirdness scaffolded into steps before engineering calls it folklore again.
('WAIL-384', 'Build a Reproduction Wizard for Customers Who Keep Reporting "It Went Weird"',
 'Our tickets contain phrases like it blinked, it froze, and then it sort of acted haunted, which are emotionally valid but operationally sparse. Build a wizard that gently leads customers through state, steps, environment, timing, expectation, and what weird meant this time.',
 'build wizard for it went weird reports',
  233),

('WAIL-385', 'The Escalation Chat Must Auto-Summarize Which Teams Are Quietly Hoping It Is Not Theirs',
 'Escalations waste oxygen on polite jurisdiction avoidance. Add a live summary showing which teams acknowledged the issue, which are investigating, and which are producing the silence that usually means please let this belong to payments. Waiting for volunteered ownership is how weekends disappear.',
 'summarize ownership dodging in escalation chat',
  144),

-- Customer Education Lead Farah
-- REPORTER: Farah | Customer Education Lead | Wants docs to end where optimism actually runs out.
('WAIL-386', 'Every FAQ Article Must End with "What This Will Not Actually Fix"',
 'Help content is too aspirational. End every article with the nearby problems, edge cases, permission issues, and account oddities it absolutely will not resolve no matter how carefully it is read. False hope is not a support asset.',
 'make faq articles end with what wont work',
  89),

('WAIL-387', 'The Help Center Search Must Prioritize Articles People Forward to Teammates with "Try This?"',
 'Search relevance should not be based only on keywords and clicks. It should also understand survival behavior. Track which help articles get forwarded internally with messages like maybe this, worth a shot, or I think this is the one Support meant. Hesitant punctuation is a high-quality ranking signal.',
 'boost forwarded help articles in search',
  89),

-- Support Analyst Devon
-- REPORTER: Devon | Support Analyst | Wants zombie tickets and calendar delusions named before they breed in the queue.
('WAIL-388', 'Create a "Please Stop Reopening This" Reason Code for Tickets That Refuse to Die',
 'Some tickets are less support objects than undead narratives. Add a reason code for cases reopened by habit, confusion, automation, or one customer who uses reply-all as a worldview. Closure should at least be allowed to document that it lost the philosophical argument.',
 'add stop reopening reason to tickets',
  89),

('WAIL-389', 'The SLA Dashboard Must Show Which Breaches Were Technical and Which Were Calendar-Based Delusions',
 'We currently treat all SLA misses as operational failures when some were caused by time zones, holidays, executive preemption, or magical beliefs about what counts as same day. Split the dashboard into technical misses and calendar delusions so process improvement stops fighting physics.',
 'tag sla breaches politics or outage',
  89),

-- Account Rescue Specialist Ines
-- REPORTER: Ines | Account Rescue Specialist | Knows exactly when a macro has one message left before it becomes a breakup.
('WAIL-390', 'Add a Last-Resort "Warm Human Voice" Workflow for Customers One Message Away from Leaving',
 'Some accounts do not need another macro, workaround, or strategically delayed promise. They need one competent human to explain the mess warmly enough that sticking around does not feel like self-disrespect. Route edge-of-exit cases to a person before another template finalizes the breakup.',
 'add warm human fallback workflow',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Helena [Support Director]', reporter_name = 'Helena', reporter_title = 'Support Director', reporter_description = 'Wants honesty, doubt, and escalation thermodynamics rendered as first-class support metadata.' WHERE id IN ('WAIL-376', 'WAIL-377');
UPDATE community_backlog SET reporter = 'Owen [Customer Success Manager]', reporter_name = 'Owen', reporter_title = 'Customer Success Manager', reporter_description = 'Tracks renewal risk by measuring how much optimism has outrun roadmap reality.' WHERE id IN ('WAIL-378', 'WAIL-379');
UPDATE community_backlog SET reporter = 'Maribel [Support Ops Lead]', reporter_name = 'Maribel', reporter_title = 'Support Ops Lead', reporter_description = 'Wants empathy, queue politics, and CEO-thread probability exposed in the tooling.' WHERE id IN ('WAIL-380', 'WAIL-381');
UPDATE community_backlog SET reporter = 'Julian [Technical Account Manager]', reporter_name = 'Julian', reporter_title = 'Technical Account Manager', reporter_description = 'Keeps folklore next to facts because enterprise customers rarely choose between them.' WHERE id IN ('WAIL-382', 'WAIL-383');
UPDATE community_backlog SET reporter = 'Priit [Head of Support Engineering]', reporter_name = 'Priit', reporter_title = 'Head of Support Engineering', reporter_description = 'Wants weirdness scaffolded into steps before engineering calls it folklore again.' WHERE id IN ('WAIL-384', 'WAIL-385');
UPDATE community_backlog SET reporter = 'Farah [Customer Education Lead]', reporter_name = 'Farah', reporter_title = 'Customer Education Lead', reporter_description = 'Wants docs to end where optimism actually runs out.' WHERE id IN ('WAIL-386', 'WAIL-387');
UPDATE community_backlog SET reporter = 'Devon [Support Analyst]', reporter_name = 'Devon', reporter_title = 'Support Analyst', reporter_description = 'Wants zombie tickets and calendar delusions named before they breed in the queue.' WHERE id IN ('WAIL-388', 'WAIL-389');
UPDATE community_backlog SET reporter = 'Ines [Account Rescue Specialist]', reporter_name = 'Ines', reporter_title = 'Account Rescue Specialist', reporter_description = 'Knows exactly when a macro has one message left before it becomes a breakup.' WHERE id IN ('WAIL-390');

-- FRAUD: finance dread, billing chaos, tax confusion, and reimbursement abuse
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Finance Systems Lead Monica
-- REPORTER: Monica | Finance Systems Lead | Thinks an invoice should explain itself so clearly it starts to look guilty.
('FRAUD-391', 'Add a "How We Got This Number" Drawer to Every Invoice',
 'Our invoices are technically correct but narratively evasive. Add a drawer that spells out line items, subtotals, proration notes, tax fragments, usage spikes, seat changes, credits, and old plan ghosts so clearly that Finance briefly assumes we are hiding something by being helpful.',
 'add how we got this number drawers',
  233),

('FRAUD-392', 'Every Credit Memo Needs a Field for "What Emotional State Produced This Decision?"',
 'Credits appear in the system stripped of their real origin stories: guilt, escalation fatigue, accidental generosity, enterprise politics, or somebody saying just comp it in a channel with too much authority. Add an attribution field so accounting can preserve the mood that made the number inevitable.',
 'add emotional reason field to credit memos',
  144),

-- Tax Operations Manager Kian
-- REPORTER: Kian | Tax Operations Manager | Lives at the intersection of jurisdiction, paperwork hallucination, and decimal-point dread.
('FRAUD-393', 'The Tax Calculation Service Must Respect Geography, Product Type, and Pure Administrative Terror',
 'Taxes keep arriving as if borders, digital goods, service classifications, and procurement improvisation were optional storytelling devices. Build a tax service that handles region, nexus, exemptions, reverse charges, VAT IDs, and certificates named final_final_real.pdf without blinking.',
 'make tax service respect geography and product type',
  233),

('FRAUD-394', 'All Manual Invoice Adjustments Must Leave a Note That Would Convince a Skeptical Auditor',
 'Notes like fixed weird thing and per request are acts of professional disrespect toward future us. Make every manual billing adjustment carry a note specific enough that a skeptical auditor, a new controller, and one very awake lawyer can read it without improvising their own horror.',
 'make invoice adjustments leave auditor-proof notes',
  144),

-- Controller Amara
-- REPORTER: Amara | Controller | Wants hope evicted from revenue and liability rendered in a more judgmental font.
('FRAUD-395', 'The Revenue Dashboard Must Stop Counting Hope as Recognized Income',
 'Some metrics in the board deck have become too spiritually adjacent to money. Bookings, committed pipeline, handshake forecasts, and verbally strong expansions are squatting near revenue in ways the ledger finds immoral. Separate actual income from adjacent optimism so clearly the chart shames recombination attempts.',
 'make revenue dashboards stop counting hope',
  144),

('FRAUD-396', 'Create a Deferred Revenue View That Looks Less Like Success and More Like Obligation',
 'Deferred revenue keeps getting celebrated by people who only like the first word. Build a view that emphasizes the part where we now owe delivery, support, uptime, and explanations. The chart should look like liability wearing reading glasses.',
 'make deferred revenue look like debt',
  89),

-- Expense Policy Enforcer Julianne
-- REPORTER: Julianne | Expense Policy Enforcer | Judges receipts by blur level, dessert proximity, and conference peer pressure.
('FRAUD-397', 'Receipt Uploads Must Reject Photos Taken from a Driver''s Seat or During Dessert',
 'Our reimbursement system has accepted too many blurry receipts captured in ways that imply speed, carelessness, or one hand still holding tiramisu. Add heuristics for unsafe angles, restaurant-table chaos, motion blur, and the visual signature of post-purchase regret.',
 'teach expense uploads to distrust receipts photographed mid-chaos',
  89),

('FRAUD-398', 'All Reimbursements Need a Category for "Bought Under Social Pressure at a Conference"',
 'Too many expenses are being coded as meals, materials, or travel when everyone knows the real category was social surrender. Add a dedicated label for purchases made because a vendor, peer, or senior leader was staring at somebody in a branded hoodie beside an overpriced espresso stand.',
 'add a category bought under to reimbursements',
  89),

-- Pricing Strategist Benoit
-- REPORTER: Benoit | Pricing Strategist | Charges elegantly meaningless fees just to see if silence has market depth.
('FRAUD-399', 'Introduce a Fee for "Advanced Platform Appreciation" and See If Anyone Challenges It',
 'We keep leaving margin on the table by pretending customers only pay for things they can point at. Add a modest line item called Advanced Platform Appreciation and measure whether anyone objects or simply forwards it to procurement where nouns go to become policy.',
 'charge advanced platform appreciation fee',
  144),

('FRAUD-400', 'All Discounts Must Expire at Times Chosen to Maximize Internal Confusion',
 'Discounts ending at midnight are too legible. Stagger expiry across time zones, fiscal boundaries, quarter-end theatrics, and the administrative gaps where Sales promises things Finance has not yet had time to resent. Confusion may be a side effect, but it is a commercially useful one.',
 'make discounts expire at evil times',
  89),

-- Collections Manager Rhea
-- REPORTER: Rhea | Collections Manager | Distinguishes forgotten invoices from active ghosting with a tone model and a grudge.
('FRAUD-401', 'Split Late Payments into Forgot, Stuck in Approvals, and Active Ghosting',
 'Overdue accounts are not one phenomenon. Some forgot, some are trapped in procurement rituals, and some have reached a level of strategic silence that deserves taxonomy. Split the workflow so reminders escalate differently depending on the style of avoidance being performed.',
 'write sql to split late payments',
  144),

('FRAUD-402', 'Add a "How Embarrassing Would Small Claims Court Be?" Score to Delinquent Accounts',
 'Not all unpaid invoices deserve equal energy. Some customers are late because systems fail. Others are late in ways that suggest a future involving principle, paperwork, and one humiliating screenshot. Add a score for how absurd formal recovery would look in daylight.',
 'add small claims embarrassment score',
  89),

-- Payroll Analyst Tobias
-- REPORTER: Tobias | Payroll Analyst | Wants compensation math narrated before managers invent fresh inequality on the spot.
('FRAUD-403', 'Show the Bonus Inputs Before Similar People Get Mystery Numbers Again',
 'Bonus outcomes currently emerge from formulas dense enough to feel ordained. Show the input weights, thresholds, and ugly little assumptions before two eerily similar employees get wildly different numbers and one manager starts free-styling the explanation.',
 'add bonus calculation breakdown to dashboard',
  144),

('FRAUD-404', 'All Compensation Bands Need a "What Would Reddit Call This?" Review Before Approval',
 'Market benchmarking is necessary but insufficiently defensive. Before approving a band, run it through a review estimating how strangers with screenshots and excellent mockery instincts would describe it. If the answer is insulting, cooked, or class-action bait, somebody should feel the forecast first.',
 'add what would reddit call this review',
  89),

-- Revenue Accountant Selene
-- REPORTER: Selene | Revenue Accountant | Reconciles three mutually confident systems until one invoice emerges from the doctrinal dispute.
('FRAUD-405', 'Build a Reconciliation View for Charges Created by Three Systems That Barely Admit Each Other',
 'Billing, usage metering, and CRM all produce revenue-adjacent artifacts with the calm confidence of independent religions. Build a reconciliation view that aligns charges across all three and traces how one renewal became five line items and a note reading weird but okay.',
 'add a reconciliation view for mystery charges',
  233);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Monica [Finance Systems Lead]', reporter_name = 'Monica', reporter_title = 'Finance Systems Lead', reporter_description = 'Thinks an invoice should explain itself so clearly it starts to look guilty.' WHERE id IN ('FRAUD-391', 'FRAUD-392');
UPDATE community_backlog SET reporter = 'Kian [Tax Operations Manager]', reporter_name = 'Kian', reporter_title = 'Tax Operations Manager', reporter_description = 'Lives at the intersection of jurisdiction, paperwork hallucination, and decimal-point dread.' WHERE id IN ('FRAUD-393', 'FRAUD-394');
UPDATE community_backlog SET reporter = 'Amara [Controller]', reporter_name = 'Amara', reporter_title = 'Controller', reporter_description = 'Wants hope evicted from revenue and liability rendered in a more judgmental font.' WHERE id IN ('FRAUD-395', 'FRAUD-396');
UPDATE community_backlog SET reporter = 'Julianne [Expense Policy Enforcer]', reporter_name = 'Julianne', reporter_title = 'Expense Policy Enforcer', reporter_description = 'Judges receipts by blur level, dessert proximity, and conference peer pressure.' WHERE id IN ('FRAUD-397', 'FRAUD-398');
UPDATE community_backlog SET reporter = 'Benoit [Pricing Strategist]', reporter_name = 'Benoit', reporter_title = 'Pricing Strategist', reporter_description = 'Charges elegantly meaningless fees just to see if silence has market depth.' WHERE id IN ('FRAUD-399', 'FRAUD-400');
UPDATE community_backlog SET reporter = 'Rhea [Collections Manager]', reporter_name = 'Rhea', reporter_title = 'Collections Manager', reporter_description = 'Distinguishes forgotten invoices from active ghosting with a tone model and a grudge.' WHERE id IN ('FRAUD-401', 'FRAUD-402');
UPDATE community_backlog SET reporter = 'Tobias [Payroll Analyst]', reporter_name = 'Tobias', reporter_title = 'Payroll Analyst', reporter_description = 'Wants compensation math narrated before managers invent fresh inequality on the spot.' WHERE id IN ('FRAUD-403', 'FRAUD-404');
UPDATE community_backlog SET reporter = 'Selene [Revenue Accountant]', reporter_name = 'Selene', reporter_title = 'Revenue Accountant', reporter_description = 'Reconciles three mutually confident systems until one invoice emerges from the doctrinal dispute.' WHERE id IN ('FRAUD-405');

-- SNEER: management politics, committees, status theater, and passive-aggressive governance
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Chief of Staff Miranda
-- REPORTER: Miranda | Chief of Staff | Captures vague agreements before memory, courage, or railway timing can launder them.
('SNEER-406', 'All Cross-Functional Decisions Must Be Captured in a Matrix Nobody Fully Supports',
 'Free-floating decisions create too much room for memory, courage, and later denial. Build a matrix listing who approved, objected, felt comfortable enough, or replied with a thumbs-up because their train was leaving. Lukewarm consensus should still leave fingerprints.',
 'track half approvals in decision log',
  144),

('SNEER-407', 'The Weekly Leadership Sync Must Produce Action Items Even If the Only Output Was Mood',
 'We cannot keep leaving meetings with nothing but atmosphere and four follow-up pings saying great discussion. Add a meeting parser that converts leadership mood, directional energy, and unexplained concern into assignable tasks even when nobody decided anything concrete.',
 'turn leadership vibes into tasks',
  89),

-- PMO Analyst Quentin
-- REPORTER: Quentin | PMO Analyst | Wants risk registers to document hoping as aggressively as ownership.
('SNEER-408', 'Every Risk Register Entry Needs a Field for "Who Is Secretly Hoping This Resolves Itself"',
 'Risks are currently documented as if ownership and wishful avoidance were unrelated. Add a field capturing the team, role, or single overworked person who most benefits if the issue quietly dissolves without intervention. Collective hoping deserves metadata too.',
 'add hoping-it-fixes-itself checkbox',
  144),

('SNEER-409', 'The Steering Committee Agenda Must Rotate Which Team Gets Politely Cornered First',
 'Meetings lose edge when the same group is always first into the accountability spotlight. Rotate the order so Engineering, Product, Finance, Support, and Success each take turns opening with defensible discomfort. Soft interrogation should be spread evenly before the coffee has time to help.',
 'script agenda generator to randomize who gets cornered',
  89),

-- Director of Strategy Celia
-- REPORTER: Celia | Director of Strategy | Can tell whether an initiative is existential or merely slide-compatible.
('SNEER-410', 'All Strategic Initiatives Must Be Tagged With Whether Anyone Would Notice If They Quietly Died',
 'Some initiatives are truly existential, while others survive mainly through formatting and recurring invites. Add a tag estimating whether the work would be missed if it stopped moving but kept appearing on slides for three more months. Decorative persistence deserves its own category.',
 'add missable flag to initiatives',
  144),

('SNEER-411', 'The OKR Review Flow Should Flag Goals That Sound Impressive but Resist Contact with Measurement',
 'We keep writing objectives like deepen platform trust and accelerate user fluency without forcing them to survive a measurable sentence. Add a detector for goals whose wording signals prestige or slide-worthiness without operational contact. Foggy goals can still proceed, but only after being labeled as such.',
 'flag goals that arent measurable',
  89),

-- Engineering Manager Tomas
-- REPORTER: Tomas | Engineering Manager | Wants hiring requests to cite the exact recurring meeting that made them feel inevitable.
('SNEER-412', 'Every Headcount Request Must Include the Specific Meeting It Is Secretly Trying to Survive',
 'We keep discussing staffing as if it emerges from clean capacity models instead of the emotional aftermath of recurring meetings. Require every headcount request to name the exact ceremony, escalation pattern, or executive expectation that made the role feel necessary.',
 'make hiring form name the cursed meeting',
  144),

('SNEER-413', 'The Org Chart Viewer Must Show Dotted Lines, Historical Grudges, and Budget Gravity',
 'The current org chart is technically accurate and operationally useless. Add layers for dotted-line influence, inherited tension, strategic sponsorship, and whose budget actually absorbs the consequence when a shared project goes strange. Reporting lines explain very little. Gravity explains the rest.',
 'add grudges layer to org chart',
  144),

-- Product Chief Amelia
-- REPORTER: Amelia | Product Chief | Wants the roadmap to stop pretending executive proximity is not a quantifiable force.
('SNEER-414', 'Feature Prioritization Needs a "Who Mentioned This in Front of the CEO?" Multiplier',
 'We pretend prioritization is a clean conversation among user value, effort, and strategy when certain ideas gain instant mass the moment they are spoken near a powerful corridor. Add a multiplier for executive adjacency so the roadmap stops acting surprised by political acceleration.',
 'add a ceo mention multiplier to priorities',
  144),

('SNEER-415', 'All Status Reports Must Include a Section on "What We Will Pretend This Means on Friday"',
 'Midweek facts become Friday narratives through selective optimism and formatting. Add a status section that asks, given current progress, delays, and little fires, what story we will probably tell by end of week if nothing changes. Planning should include future spin.',
 'generate friday exec storyline report',
  89),

-- Program Manager Ethan
-- REPORTER: Ethan | Program Manager | Classifies decorative talking before it hardens into fake commitment with deadlines.
('SNEER-416', 'Force Meeting Notes to Tag Decisions, Observations, and Decorative Mouth Noise',
 'Notes are too generous to spoken matter. Build a template that tags actual decisions, unresolved tensions, useful observations, and the decorative mouth noise currently graduating into fake commitment.',
 'tag meeting notes fluff or decisions',
  89),

('SNEER-417', 'Every Action Item Should Show Whether It Was Born from Urgency, Guilt, or Reputation Management',
 'Action items currently present themselves as neutral offspring of reason when many are plainly descended from urgency, guilt, or reputation management. Add a classification so follow-up conversations can begin from a more honest emotional source code.',
 'label guilt-made action items',
  144),

-- Transformation Office Analyst Noor
-- REPORTER: Noor | Transformation Office Analyst | Measures rollout success by the size of the nod-and-ignore population.
('SNEER-418', 'The Change Management Plan Must Estimate How Many People Will Nod and Do Nothing',
 'Communication plans keep measuring sends, opens, and attendance while missing the real metric: passive non-adoption wrapped in visible agreement. Add rollout acknowledgements and post-launch usage checks so we can tag the people who repeated the vocabulary and kept operating exactly as before.',
 'write script to catch fake rollout engagement',
  144),

('SNEER-419', 'All Governance Forums Need an Escalation Path for Decisions That Die of Consensus Exposure',
 'Some decisions do not get blocked. They spend too long in rooms full of compatible caution and emerge too weak to act. Add an escalation path for items degraded by overexposure to alignment so somebody can re-solidify them before the quarter becomes a memorial.',
 'add escalation path for deadlocked decisions',
  144),

-- Senior Director Graham
-- REPORTER: Graham | Senior Director | Wants the dashboard to distinguish sturdy improvement from successful framing.
('SNEER-420', 'The Executive Dashboard Should Highlight Which Metrics Improved Only Because Nobody Looked Too Closely',
 'Not all green arrows are fraudulent, but some benefit from tasteful distance, broad definitions, or quarter-end willingness to stop asking questions. Add a signal for metrics whose improvement depends on aggregation, exclusion rules, or a shortage of inquisitive readers.',
 'flag metrics improved after reporting stopped',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Miranda [Chief of Staff]', reporter_name = 'Miranda', reporter_title = 'Chief of Staff', reporter_description = 'Captures vague agreements before memory, courage, or railway timing can launder them.' WHERE id IN ('SNEER-406', 'SNEER-407');
UPDATE community_backlog SET reporter = 'Quentin [PMO Analyst]', reporter_name = 'Quentin', reporter_title = 'PMO Analyst', reporter_description = 'Wants risk registers to document hoping as aggressively as ownership.' WHERE id IN ('SNEER-408', 'SNEER-409');
UPDATE community_backlog SET reporter = 'Celia [Director of Strategy]', reporter_name = 'Celia', reporter_title = 'Director of Strategy', reporter_description = 'Can tell whether an initiative is existential or merely slide-compatible.' WHERE id IN ('SNEER-410', 'SNEER-411');
UPDATE community_backlog SET reporter = 'Tomas [Engineering Manager]', reporter_name = 'Tomas', reporter_title = 'Engineering Manager', reporter_description = 'Wants hiring requests to cite the exact recurring meeting that made them feel inevitable.' WHERE id IN ('SNEER-412', 'SNEER-413');
UPDATE community_backlog SET reporter = 'Amelia [Product Chief]', reporter_name = 'Amelia', reporter_title = 'Product Chief', reporter_description = 'Wants the roadmap to stop pretending executive proximity is not a quantifiable force.' WHERE id IN ('SNEER-414', 'SNEER-415');
UPDATE community_backlog SET reporter = 'Ethan [Program Manager]', reporter_name = 'Ethan', reporter_title = 'Program Manager', reporter_description = 'Classifies decorative talking before it hardens into fake commitment with deadlines.' WHERE id IN ('SNEER-416', 'SNEER-417');
UPDATE community_backlog SET reporter = 'Noor [Transformation Office Analyst]', reporter_name = 'Noor', reporter_title = 'Transformation Office Analyst', reporter_description = 'Measures rollout success by the size of the nod-and-ignore population.' WHERE id IN ('SNEER-418', 'SNEER-419');
UPDATE community_backlog SET reporter = 'Graham [Senior Director]', reporter_name = 'Graham', reporter_title = 'Senior Director', reporter_description = 'Wants the dashboard to distinguish sturdy improvement from successful framing.' WHERE id IN ('SNEER-420');

-- BLAME: scapegoating, postmortem politics, and accountability theater
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Incident Program Director Laurel
-- REPORTER: Laurel | Incident Program Director | Treats proximity, revisionism, and convenient gravity wells as first-class recovery signals.
('BLAME-421', 'All Postmortems Must Include a Section on Which Team Was Conveniently Nearby',
 'Root cause is valuable, but proximity is often more actionable in the social phase of recovery. Add a required section documenting which teams were geographically, organizationally, or historically adjacent to the failure so leadership can begin pattern-matching before the logs finish loading.',
 'add nearby team section to postmortems',
  144),

('BLAME-422', 'The RCA Template Needs a "What Version of the Story Are We on?" Tracker',
 'Some incidents produce more narrative revisions than technical findings. Add a tracker showing when the story moved from harmless blip to customer impact, from vendor issue to shared responsibility, and from edge case to known sharp corner. Truth deserves version history too.',
 'track rca story versions',
  144),

-- Engineering VP Martin
-- REPORTER: Martin | Engineering VP | Wants confidence, denial, and public stability claims correlated with maximum efficiency.
('BLAME-423', 'Escalations Should Auto-Tag the Team That Recently Said "This Is Stable Now"',
 'Confidence without half-life is an operational hazard. When an issue escalates, auto-tag whichever team most recently described the affected surface as stable, hardened, production-ready, or finally boring. Institutional memory deserves sharper edges.',
 'auto-tag team that said this is stable',
  144),

('BLAME-424', 'Create a Heatmap of Which Teams Keep Saying "It''s Probably Not Us"',
 'During live incidents, several groups reliably contribute the phrase probably not us before evidence, logs, or dignity arrive. Build a heatmap by team, quarter, and incident type so defensive confidence becomes measurable.',
 'graph which team said not us',
  144),

-- Program Office Analyst Naomi
-- REPORTER: Naomi | PMO Analyst | Logs not just downgrades, but the optimism style that made them possible.
('BLAME-425', 'The Risk Register Must Show Who Downgraded the Risk and How Cheerful They Sounded',
 'Risk records currently store severity changes as if tone were irrelevant. Add a field capturing who downgraded a risk, what rationale they gave, and whether the language sounded sober, tired, or suspiciously upbeat for someone standing near a crater.',
 'log who downgraded risks in ui',
  144),

('BLAME-426', 'All Retrospectives Need a "What Did We Quietly Normalize?" Prompt',
 'Teams keep learning tactical lessons while ignoring the more expensive achievement of quietly accepting nonsense as routine. Add a prompt asking what became normal this sprint that would have seemed absurd three months ago. The answer is often the roadmap in disguise.',
 'add normalization prompt to retrospectives',
  89),

-- Staff PM Victor
-- REPORTER: Victor | Staff PM | Taxonomizes optics work before seriousness launders itself into causality.
('BLAME-427', 'The Project Tracker Should Mark Tasks Created Solely to Prove We Took the Incident Seriously',
 'Not every follow-up task is born from engineering need. Some exist to reassure observers that concern has been alchemized into action. Distinguish between causal remediation, reputational gestures, and ceremonial work items written for the slide deck.',
 'mark tasks created for incident optics',
  89),

('BLAME-428', 'Every Action Item Needs a Field for Whether It Exists Because Someone Was Embarrassed on a Call',
 'We keep pretending tasks emerge from pure analysis when many are downstream of one uncomfortable meeting and a senior person''s face. Add a field for embarrassment-driven action so the backlog can stop cosplaying emotional neutrality.',
 'add embarrassment origin field to tasks',
  89),

-- Platform Director Elise
-- REPORTER: Elise | Platform Director | Maps ownership, heroic meddling, and severity laundering in useful colors.
('BLAME-429', 'Stamp the Real Owner and the Habitual Responder in Different Colors',
 'Incidents keep attracting a shadow caste of partial owners who never asked for the service but keep answering for it in meetings. Extend the ownership map so primary owners, inherited custodians, accidental custodians, and heroic meddlers stop blending into one cowardly blur.',
 'color code real owners and responders',
  144),

('BLAME-430', 'All Sev 2 Reviews Must End with a Vote on Whether This Was Really a Sev 1 Wearing Makeup',
 'We have become too comfortable laundering important pain through smaller numbers. End every Sev 2 review with a vote on whether the incident was really a Sev 1 with better manners, smaller screenshots, or a more forgiving customer cohort.',
 'end sev 2 reviews with sev 1 vote',
  89),

-- Operations Manager Darren
-- REPORTER: Darren | Operations Manager | Treats social relay races and title-induced panic as telemetry worth charting.
('BLAME-431', 'Render a First-Hour Escalation Replay So We Can See Where Context Died',
 'The first hour of an incident creates a second incident made of forwards, pings, half-explanations, and one doomed attempt to summarize everything in Slack. Build a replay showing who dragged whom in, when the story changed, and exactly where understanding left the building.',
 'render first-hour escalation replay',
  144),

('BLAME-432', 'Add a "Respectfully Escalated" Label for Tickets Escalated Out of Pure Social Fear',
 'Some escalations happen because the issue is severe. Others happen because a message arrived from someone whose title altered local gravity. Add a label for the latter so the queue stops pretending both feelings are the same.',
 'tag tickets escalated out of pure social fear',
  89),

-- Reliability Coach Gina
-- REPORTER: Gina | Reliability Coach | Wants scar tissue, alibis, and convenient stories surfaced before they fossilize.
('BLAME-433', 'The Runbook Must Note Which Steps Were Added After Someone Got Blamed in 2024',
 'Runbooks accrete not just knowledge but scar tissue. Mark any step that exists primarily because somebody, sometime, was loudly blamed for not doing something adjacent. Future responders deserve to know when a step is policy and when it is trauma.',
 'mark blame-driven runbook steps',
  144),

('BLAME-434', 'Every Escalation Summary Should Include a "Most Convenient Narrative" Sidebar',
 'Before the formal write-up calcifies, add a sidebar summarizing the easiest story available to each constituency: vendor fault, staffing gap, tech debt, unrealistic timeline, hidden complexity, or cosmic unfairness. Convenient stories deserve to sit beside the timeline like suspect alibis.',
 'add convenient narrative field to escalations',
  144),

-- Chief of Staff Rowan
-- REPORTER: Rowan | Chief of Staff | Frames incidents whichever way best calms the room and the budget at the same time.
('BLAME-435', 'The Executive Readout Needs a "Who Feels Better If This Is Framed as Process?" Toggle',
 'Sometimes a failure should be discussed as a technical issue; other times it becomes healthier, calmer, and cheaper to call it process. Add a toggle showing how the incident lands when framed as tooling, prioritization, communication, or unavoidable complexity.',
 'add who feels better checkbox',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Laurel [Incident Program Director]', reporter_name = 'Laurel', reporter_title = 'Incident Program Director', reporter_description = 'Treats proximity, revisionism, and convenient gravity wells as first-class recovery signals.' WHERE id IN ('BLAME-421', 'BLAME-422');
UPDATE community_backlog SET reporter = 'Martin [Engineering VP]', reporter_name = 'Martin', reporter_title = 'Engineering VP', reporter_description = 'Wants confidence, denial, and public stability claims correlated with maximum efficiency.' WHERE id IN ('BLAME-423', 'BLAME-424');
UPDATE community_backlog SET reporter = 'Naomi [PMO Analyst]', reporter_name = 'Naomi', reporter_title = 'PMO Analyst', reporter_description = 'Logs not just downgrades, but the optimism style that made them possible.' WHERE id IN ('BLAME-425', 'BLAME-426');
UPDATE community_backlog SET reporter = 'Victor [Staff PM]', reporter_name = 'Victor', reporter_title = 'Staff PM', reporter_description = 'Taxonomizes optics work before seriousness launders itself into causality.' WHERE id IN ('BLAME-427', 'BLAME-428');
UPDATE community_backlog SET reporter = 'Elise [Platform Director]', reporter_name = 'Elise', reporter_title = 'Platform Director', reporter_description = 'Maps ownership, heroic meddling, and severity laundering in useful colors.' WHERE id IN ('BLAME-429', 'BLAME-430');
UPDATE community_backlog SET reporter = 'Darren [Operations Manager]', reporter_name = 'Darren', reporter_title = 'Operations Manager', reporter_description = 'Treats social relay races and title-induced panic as telemetry worth charting.' WHERE id IN ('BLAME-431', 'BLAME-432');
UPDATE community_backlog SET reporter = 'Gina [Reliability Coach]', reporter_name = 'Gina', reporter_title = 'Reliability Coach', reporter_description = 'Wants scar tissue, alibis, and convenient stories surfaced before they fossilize.' WHERE id IN ('BLAME-433', 'BLAME-434');
UPDATE community_backlog SET reporter = 'Rowan [Chief of Staff]', reporter_name = 'Rowan', reporter_title = 'Chief of Staff', reporter_description = 'Frames incidents whichever way best calms the room and the budget at the same time.' WHERE id IN ('BLAME-435');

-- VOID: analytics dread, warehouse cults, attribution fiction, and metric collapse
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Analytics Architect Sol
-- REPORTER: Sol | Analytics Architect | Specializes in building one adult place for four competing truths and a spreadsheet.
('VOID-436', 'Print the Metric Definition, Timezone, and Freshness Directly Under Every Important Number',
 'We do not need another source-of-truth speech. We need every revenue, churn, and active-user number to show its exact definition, timezone, freshness, and data source right where the argument starts. Make the math bring its paperwork.',
 'print metric details under every big number',
  233),

('VOID-437', 'The BI Layer Must Track Which Metric Definitions Were Changed Quietly Before the Board Deck',
 'Definitions do evolve, but often shortly before numbers need to look persuasive in expensive rooms. Add change tracking for metric definitions, including when they shifted, who approved it, and whether the timing coincided with forecast anxiety. Metrics need version history because memory keeps pretending they are natural phenomena.',
 'track metric definition changes in bi',
  144),

-- Warehouse Engineer Isha
-- REPORTER: Isha | Warehouse Engineer | Treats dbt lineage without surviving meaning as decorative archaeology.
('VOID-438', 'Every dbt Model Needs a Label for Whether Anyone Still Understands Why It Exists',
 'Our transformation graph has become a geological structure composed of reasonable intentions compacted into sedimentary confusion. Add metadata for owner, freshness, business purpose, and whether any living person can still explain why a model materializes that exact slice of joined historical regret every morning at 4:12.',
 'label dbt models nobody understands',
  233),

('VOID-439', 'Give ETL Runs a Third Status: "Technically Green, Morally Wrong"',
 'Not every pipeline failure arrives as a clean red state. Some jobs finish on time while silently dropping columns, duplicating rows, or producing output that looks mathematically legal and spiritually counterfeit. Add a third status for runs that technically complete while leaving a smell behind.',
 'add technically green status for etl',
  144),

-- Product Analyst Mara
-- REPORTER: Mara | Product Analyst | Wants attribution to admit luck, weather, and dinner arrived before conversion did.
('VOID-440', 'Attribution Must Credit the Campaign, the Coincidence, and the Customer''s Private Life Equally',
 'We keep pretending attribution is a hard science when it is clearly a coalition government of ads, luck, timing, weather, and whatever mood the customer was in when our email found them between tabs. Add a model that visibly reserves room for coincidence and human circumstance.',
 'add luck bucket to attribution sql',
  144),

('VOID-441', 'The Funnel Dashboard Needs a "Where Did the Humans Wander Off Emotionally?" Layer',
 'Funnels imply mechanical leakage when much of what we call drop-off is really hesitation, boredom, skepticism, distraction, or the sudden arrival of dinner. Add a layer mapping where users likely disengaged emotionally rather than merely numerically.',
 'add human dropoff layer to funnel',
  144),

-- Growth Data Scientist Kevin
-- REPORTER: Kevin | Growth Data Scientist | Replaces lonely north stars with groups of mutually compensating delusions.
('VOID-442', 'Replace the "North Star Metric" with a Constellation Because One Number Keeps Lying',
 'We have asked one metric to bear the emotional, financial, and political weight of an entire company and it responded by becoming strategically ambiguous. Replace the North Star with a constellation showing product depth, revenue quality, activation sincerity, and whether customers would notice if we vanished for a weekend.',
 'replace north star with metric set',
  89),

('VOID-443', 'The Experiment Readout Must State Whether the P-Value Arrived Before Confidence Did',
 'Our test summaries still confuse statistical significance with adult certainty. Add a line clarifying whether the data truly moved conviction or merely crossed the threshold required for someone to write winner in Slack with responsible punctuation.',
 'show if p value beat confidence',
  89),

-- Marketing Ops Analyst Zoe
-- REPORTER: Zoe | Marketing Ops Analyst | Knows enthusiasm, cleanliness, and filtered serenity are all suspiciously editable.
('VOID-444', 'Show the Lead Score Ingredients Before Sales Falls for Another Hopeless Favorite',
 'The model is alarmingly enthusiastic about leads who read every email, download every PDF, and then vanish into professional mist. Show which behaviors are overweighted, which vendor enrichment fields are fan fiction, and why the score still confuses activity with destiny.',
 'show sales why scores look fake',
  144),

('VOID-445', 'Print the Hidden Filters Under Every Dashboard Tile in Small Guilty Text',
 'Filters are doing far too much emotional labor. Make every chart say which segments, accounts, edge cases, and awkward populations were excluded so cleanliness stops pretending it happened naturally.',
 'print hidden filters in tiny text under dashboards',
  89),

-- Data PM Orla
-- REPORTER: Orla | Data PM | Lets departments keep their favorite KPI religion without starting a holy war in SQL.
('VOID-446', 'The Semantic Layer Must Support "Same KPI, Different Departmental Religion"',
 'Sales, Finance, Success, and Product all use the same KPI names while describing wildly different phenomena with unnerving sincerity. Make the semantic layer support namespace-aware definitions so each department can keep its cherished number without Friday philosophical combat.',
 'make semantic layer support different kpi definitions',
  144),

('VOID-447', 'Create a Metric Launch Checklist So New Numbers Stop Materializing in Decks Like Spirits',
 'New metrics keep appearing in presentations with no owner, no lineage, no freshness guarantees, and immediate political consequences. Add a launch checklist for numbers: definition, source, caveats, expected drift, and who must defend it when it differs from the old one by 11%.',
 'add launch checklist for new metrics',
  144),

-- Attribution Consultant Denis
-- REPORTER: Denis | Attribution Consultant | Annotates the fabricated middle of customer journeys before slides mistake it for biography.
('VOID-448', 'The Customer Journey Map Must Include the Parts We Invented Because Tracking Broke',
 'Journey maps still present themselves as faithful biographies even when half the middle is inferred from missing cookies, dead webhooks, and one CRM note written in a moving taxi. Add a visibly estimated layer showing which sequence steps were observed and which were reconstructed from statistical optimism.',
 'show invented steps in journey map',
  89),

('VOID-449', 'Every KPI Review Needs a Ritual for Retiring Numbers Everyone Still Quotes from 2024',
 'Dead metrics linger because nobody wants to kill a number that once got applause in a quarterly review. Add a formal retirement ritual for obsolete KPIs so teams can stop citing them like retired jerseys over a product nobody remembers building.',
 'add retire this kpi button',
  89),

-- Chief Data Officer Helena
-- REPORTER: Helena | Chief Data Officer | Wants delayed green metrics labeled like refrigerated rumors before calm gets misread as control.
('VOID-450', 'The Executive Scorecard Should Show Which Green Numbers Are Running on Delayed Data',
 'Nothing flatters a dashboard like data that is two days late and therefore silent about current chaos. Add freshness badges prominent enough that a green metric sourced from stale data looks less like calm and more like a refrigerated rumor.',
 'flag green numbers with stale data',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Sol [Analytics Architect]', reporter_name = 'Sol', reporter_title = 'Analytics Architect', reporter_description = 'Specializes in building one adult place for four competing truths and a spreadsheet.' WHERE id IN ('VOID-436', 'VOID-437');
UPDATE community_backlog SET reporter = 'Isha [Warehouse Engineer]', reporter_name = 'Isha', reporter_title = 'Warehouse Engineer', reporter_description = 'Treats dbt lineage without surviving meaning as decorative archaeology.' WHERE id IN ('VOID-438', 'VOID-439');
UPDATE community_backlog SET reporter = 'Mara [Product Analyst]', reporter_name = 'Mara', reporter_title = 'Product Analyst', reporter_description = 'Wants attribution to admit luck, weather, and dinner arrived before conversion did.' WHERE id IN ('VOID-440', 'VOID-441');
UPDATE community_backlog SET reporter = 'Kevin [Growth Data Scientist]', reporter_name = 'Kevin', reporter_title = 'Growth Data Scientist', reporter_description = 'Replaces lonely north stars with groups of mutually compensating delusions.' WHERE id IN ('VOID-442', 'VOID-443');
UPDATE community_backlog SET reporter = 'Zoe [Marketing Ops Analyst]', reporter_name = 'Zoe', reporter_title = 'Marketing Ops Analyst', reporter_description = 'Knows enthusiasm, cleanliness, and filtered serenity are all suspiciously editable.' WHERE id IN ('VOID-444', 'VOID-445');
UPDATE community_backlog SET reporter = 'Orla [Data PM]', reporter_name = 'Orla', reporter_title = 'Data PM', reporter_description = 'Lets departments keep their favorite KPI religion without starting a holy war in SQL.' WHERE id IN ('VOID-446', 'VOID-447');
UPDATE community_backlog SET reporter = 'Denis [Attribution Consultant]', reporter_name = 'Denis', reporter_title = 'Attribution Consultant', reporter_description = 'Annotates the fabricated middle of customer journeys before slides mistake it for biography.' WHERE id IN ('VOID-448', 'VOID-449');
UPDATE community_backlog SET reporter = 'Helena [Chief Data Officer]', reporter_name = 'Helena', reporter_title = 'Chief Data Officer', reporter_description = 'Wants delayed green metrics labeled like refrigerated rumors before calm gets misread as control.' WHERE id IN ('VOID-450');

-- SPIN: branding, launch comms, narrative laundering, and hype copy with a pulse
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Launch Marketing Lead Camille
-- REPORTER: Camille | Launch Marketing Lead | Launders bug fixes into premium-sounding polish and apology copy into survivable sincerity.
('SPIN-451', 'The Release Notes Must Reframe Bug Fixes as Experience Enhancements with Narrative Lift',
 'Customers do not need to hear that the export button stopped breaking when file names contained apostrophes. They need to hear we delivered a smoother, more resilient workflow surface for high-trust data movement. Rewrite release notes until every fix sounds deliberate.',
 'rewrite release notes like bug fixes are features',
  89),

('SPIN-452', 'All Outage Follow-Ups Need a Customer Email That Sounds Reflective but Not Liability-Flavored',
 'We keep oscillating between sterile apologies and paragraphs that sound dangerously close to admissions. Create a post-incident email mode that conveys seriousness, humility, and motion without drifting into phrasing Legal would circle in red and read aloud slowly.',
 'add customer-safe outage email mode',
  89),

-- Brand Strategist Niko
-- REPORTER: Niko | Brand Strategist | Dresses failure in better diction and expects language to do half the uptime work.
('SPIN-453', 'Rename Downtime as a "Service Quiet Interval" Across All Customer-Facing Touchpoints',
 'Words like downtime, outage, and broken impose a tragic finality on what is often a temporary interruption in experiential continuity. Replace them with language that frames failure as a brief intentional pause in platform conversation. The disruption deserves a better suit.',
 'rename downtime to service quiet interval',
  89),

('SPIN-454', 'Every Major Feature Must Launch with a Tagline Strong Enough to Hide Its Current Limitations',
 'Functional truth should not be allowed to arrive before inspirational framing. Give every major feature a launch tagline powerful enough that users spend the first week admiring intent instead of noticing sharp corners. The headline should make even a looping setup wizard feel inevitable.',
 'generate launch taglines for rough features',
  89),

-- PR Manager Juliette
-- REPORTER: Juliette | PR Manager | Announces momentum in future tense and keeps quotation marks from doing unlicensed labor.
('SPIN-455', 'The Media Kit Must Include Approved Language for "Nothing Actually Launched Yet"',
 'We are increasingly expected to announce partnerships, previews, and strategic commitments whose implementation status could best be described as decorative. Add media-kit language for situations where momentum exists entirely in future tense. Comms needs verbs that imply arrival while engineering is still opening the ticket.',
 'pls generate launch copy for nothing shipped',
  144),

('SPIN-456', 'All Case Studies Should Distinguish Customer Results from Customer Enthusiasm About Results',
 'Some customers have excellent outcomes. Others simply enjoy telling a good story at a conference bar. The case study template should separate measurable gains from emotionally vivid endorsements before one starts impersonating the other in public.',
 'split case study results from vibes',
  89),

-- Content Marketing Director Sasha
-- REPORTER: Sasha | Content Marketing Director | Mines support pain for educational content before the embarrassment cools below publishable temperature.
('SPIN-457', 'Turn Every Support Fix into a "Best Practices" Blog Post Within Seventy-Two Hours',
 'We are sitting on a renewable source of publishable wisdom: the mistakes our product forces customers to make before support rescues them. Turn every resolved issue into a best-practices article, webinar bullet, or checklist before the embarrassment cools.',
 'turn support fixes into best-practice posts',
  89),

('SPIN-458', 'The Webinar Funnel Must Support a "Thought Leadership First, Product Truth Later" Mode',
 'Some audiences are not ready to meet the product directly. Give webinars a mode where the first thirty minutes are pure strategic reflection and category framing, with the product entering only after the room has become too intellectually invested to leave politely.',
 'gate webinars behind thought-leadership intro',
  144),

-- Internal Comms Lead Priya
-- REPORTER: Priya | Internal Comms Lead | Writes every memo as if a caffeinated investor might see it in six minutes.
('SPIN-459', 'All Company-Wide Updates Need a "How Bad Does This Sound If Forwarded?" Preview',
 'Internal memos no longer stay internal. They just wait for gravity. Add a preview mode estimating how each announcement reads if forwarded without context to a candidate, customer, journalist, or caffeinated investor.',
 'add forwarded panic preview to newsletter',
  89),

('SPIN-460', 'The Rebrand Rollout Needs a Checklist for What We Will Accidentally Leave with the Old Logo',
 'Rebrands do not fail because of the homepage. They fail because a forgotten PDF, support macro, training video, or weird admin screen keeps the old identity alive like a legal ghost. Build a checklist for every dusty surface optimism forgets.',
 'add an old logo cleanup checklist',
  89),

-- Field Marketing Manager Leon
-- REPORTER: Leon | Field Marketing Manager | Translates products into booth-safe human language without triggering follow-up liability.
('SPIN-461', 'All Event Booth Scripts Must Include a Version of the Product That Exists in Human Language',
 'Conference staff keep describing the platform in terms so abstract they sound illegal or so literal they trigger follow-up questions nobody staffed the booth to answer. Write scripts that sound human, attractive, and non-indictable all at once.',
 'generate booth script in human english',
  89),

('SPIN-462', 'The Demo Environment Should Prioritize Screens That Look Expensive Over Screens That Are True',
 'Live demos are a theatrical medium and should be optimized accordingly. Prioritize visually dense, reassuring, graph-rich screens over technically truer views revealing sparse data, awkward copy, or one dangerously honest audit table. Truth can wait backstage in comfortable shoes.',
 'show expensive demo screens first',
  144),

-- Social Lead Marnie
-- REPORTER: Marnie | Social Lead | Turns fresh work into threads that sound both overdue and epochal on purpose.
('SPIN-463', 'Every Feature Launch Needs a Thread That Makes the Work Sound Simultaneously Obvious and Historic',
 'The launch thread must strike the classic balance: we always knew this mattered, but today is still a turning point for the category. Build a copy helper that weaves inevitability, gratitude, category vision, and one tasteful screenshot into social certainty.',
 'generate launch thread from feature diff',
  55),

('SPIN-464', 'The Screenshot Approval Workflow Must Flag Any Image That Accidentally Reveals an Unloved Metric',
 'Product screenshots are dangerous because real interfaces contain real numbers, and real numbers bring baggage. Add a workflow that scans candidate images for questionable counters, stale dates, suspiciously low usage, or labels that sound internal and frightened.',
 'flag screenshots with unloved metrics',
  89),

-- VP of Narrative Naomi
-- REPORTER: Naomi | VP of Narrative | Rephrases delays into strategic sequencing while the product finishes getting dressed.
('SPIN-465', 'Create a Messaging Layer That Can Rephrase Any Delay as Strategic Sequencing',
 'Delays happen. The language around them should not. Build a helper that transforms any slip, deferment, rollback, pause, or unfinished dependency into something that sounds deliberate, market-aware, and serenely under control. Words cannot ship the product, but they can keep the room seated.',
 'build delay rewriter for launch comms',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Camille [Launch Marketing Lead]', reporter_name = 'Camille', reporter_title = 'Launch Marketing Lead', reporter_description = 'Launders bug fixes into premium-sounding polish and apology copy into survivable sincerity.' WHERE id IN ('SPIN-451', 'SPIN-452');
UPDATE community_backlog SET reporter = 'Niko [Brand Strategist]', reporter_name = 'Niko', reporter_title = 'Brand Strategist', reporter_description = 'Dresses failure in better diction and expects language to do half the uptime work.' WHERE id IN ('SPIN-453', 'SPIN-454');
UPDATE community_backlog SET reporter = 'Juliette [PR Manager]', reporter_name = 'Juliette', reporter_title = 'PR Manager', reporter_description = 'Announces momentum in future tense and keeps quotation marks from doing unlicensed labor.' WHERE id IN ('SPIN-455', 'SPIN-456');
UPDATE community_backlog SET reporter = 'Sasha [Content Marketing Director]', reporter_name = 'Sasha', reporter_title = 'Content Marketing Director', reporter_description = 'Mines support pain for educational content before the embarrassment cools below publishable temperature.' WHERE id IN ('SPIN-457', 'SPIN-458');
UPDATE community_backlog SET reporter = 'Priya [Internal Comms Lead]', reporter_name = 'Priya', reporter_title = 'Internal Comms Lead', reporter_description = 'Writes every memo as if a caffeinated investor might see it in six minutes.' WHERE id IN ('SPIN-459', 'SPIN-460');
UPDATE community_backlog SET reporter = 'Leon [Field Marketing Manager]', reporter_name = 'Leon', reporter_title = 'Field Marketing Manager', reporter_description = 'Translates products into booth-safe human language without triggering follow-up liability.' WHERE id IN ('SPIN-461', 'SPIN-462');
UPDATE community_backlog SET reporter = 'Marnie [Social Lead]', reporter_name = 'Marnie', reporter_title = 'Social Lead', reporter_description = 'Turns fresh work into threads that sound both overdue and epochal on purpose.' WHERE id IN ('SPIN-463', 'SPIN-464');
UPDATE community_backlog SET reporter = 'Naomi [VP of Narrative]', reporter_name = 'Naomi', reporter_title = 'VP of Narrative', reporter_description = 'Rephrases delays into strategic sequencing while the product finishes getting dressed.' WHERE id IN ('SPIN-465');

-- MESH: abstraction layers, service sprawl, platform self-harm, and architectural overreach
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Platform Architect Yaroslav
-- REPORTER: Yaroslav | Platform Architect | Builds wrappers around wrappers until clarity becomes somebody else's staffing problem.
('MESH-466', 'Put One Official Facade in Front of the Other Seven Facades',
 'The system has acquired enough interfaces, adapters, wrappers, and service boundaries that no one can expose them directly without admitting what happened. Add one sanctioned facade on top so teams stop picking their own favorite wrapper and platform can centralize the confusion professionally.',
 'wrap the wrappers in one official facade',
  233),

('MESH-467', 'Every Internal API Must Publish a Capability Manifest Nobody Reads but Everyone Cites',
 'APIs should not merely respond. They should self-describe with enough formality to make integration meetings feel pre-solved. Require a capability manifest listing verbs, limits, intentions, and adjacent promises. Reading it is secondary. Citing it is the feature.',
 'make internal apis publish capability manifests',
  144),

-- Service Mesh Enthusiast Ingrid
-- REPORTER: Ingrid | Service Mesh Enthusiast | Refuses to stop at packets when team politics are the more volatile protocol.
('MESH-468', 'The Service Mesh Must Also Mediate Team Boundaries for Consistency',
 'We have successfully routed traffic through sidecars but left social contracts tragically unproxied. Extend the mesh model so ownership handoffs, escalation routes, and latency budgets between teams are expressed in the same language as retries and circuit breakers.',
 'make service mesh mediate team boundaries',
  233),

('MESH-469', 'All Internal Calls Need Tracing Rich Enough to Show Which Abstraction Added the Delay',
 'End-to-end traces tell us where time went, but not which layer of platform ambition consumed it. Annotate spans with whether the delay came from business logic, serialization, auth, queuing, or a noble abstraction somebody introduced to prevent tight coupling three years before this ruined lunch.',
 'add tracing that names the slow abstraction',
  144),

-- Platform PM Jonah
-- REPORTER: Jonah | Platform PM | Makes new layers fill out forms before they earn more nouns and accidental longevity.
('MESH-470', 'Create a Platform Intake Form That Requires Teams to Prove They Truly Need Another Layer',
 'New layers appear too easily because they still sound strategic by default. Before any team adds a gateway, adapter, façade, broker, orchestrator, or helper service, require an intake explaining what the existing complexity failed to achieve and why another conceptual floor will not simply turn the building into geology.',
 'make teams justify every new platform layer',
  144),

('MESH-471', 'The Shared Platform SDK Must Support Patterns It Quietly Hopes Nobody Uses',
 'Teams insist on edge cases, one-off integrations, and operational exceptions with the confidence of people who do not have to maintain the SDK afterward. Expand the platform SDK to support them officially, but annotate the APIs so future archaeology can tell which paths were blessed and which were tolerated under protest.',
 'make shared sdk support tolerated edge cases',
  144),

-- Backend Guild Chair Tereza
-- REPORTER: Tereza | Backend Guild Chair | Makes baby services announce the medium-sized monster they plan to become.
('MESH-472', 'Every New Microservice Must Name the Monolith It Secretly Wants to Become',
 'We keep decomposing systems into hopeful fragments without admitting each fragment carries an ancestral desire to accumulate responsibilities and become a medium-sized problem. Require new services to declare their likely future monolith shape at birth.',
 'make new microservices name their final form',
  144),

('MESH-473', 'The Domain Model Needs a Diagram Showing Which Contexts Only Exist Because of Org Charts',
 'Bounded contexts are presented as business truth when some are clearly shaped by reporting lines, mergers, and one persuasive director from 2022. Add a diagram separating conceptual necessity from org-chart residue so politics and product stop wearing the same costume.',
 'add a diagram for all the fake contexts',
  144),

-- API Governance Lead Chantal
-- REPORTER: Chantal | API Governance Lead | Prices reversibility before consensus turns a temporary field into constitutional law.
('MESH-474', 'All Shared Schemas Must Include a "How Hard Will This Be to Undo?" Estimate',
 'Teams keep proposing shared objects as if unification were morally free. Add a required estimate for how painful each schema choice will be to unwind once one consumer turns a temporary field into constitutional law. Reversibility deserves a price tag up front.',
 'make shared schemas show migration pain',
  144),

('MESH-475', 'The API Review Council Must Rate Endpoints on Whether They Feel "Too Convenient"',
 'Some endpoints are elegant in the dangerous way that encourages overreach, hidden coupling, and one giant route becoming the emotional-support API for half the company. Add a convenience score so suspiciously useful surfaces get examined before they become inevitable.',
 'make api review council rate endpoints',
  89),

-- Infrastructure Planner Soren
-- REPORTER: Soren | Infrastructure Planner | Gives jobs genealogy and event verbs stricter meanings than panic usually allows.
('MESH-476', 'Every Background Job Needs a Provenance Chain for Why It Still Exists',
 'Background jobs accumulate like quiet folklore, each with a schedule, a purpose, and immunity from being questioned. Require every job to document origin, owner, downstream effect, and the last time somebody was brave enough to ask whether it should continue breathing.',
 'add provenance chain to background jobs',
  144),

('MESH-477', 'The Event Taxonomy Must Stop Letting Three Teams Mean Different Things by "Updated"',
 'Updated is not a meaningful event name when Sales means status changed, Product means metadata drifted, and Ops means we touched it while panicking. Normalize the taxonomy so verbs earn specificity commensurate with the chaos they drive downstream.',
 'stop three teams calling everything updated',
  144),

-- Principal Engineer Rina
-- REPORTER: Rina | Principal Engineer | Wants accidental internal products and service sprawl taxed before neglect becomes strategy.
('MESH-478', 'The Internal Platform Should Admit When It Is Just a Product Nobody Wanted to Staff',
 'We keep calling things internal platforms when what we mean is a product with customers, support obligations, roadmap politics, and no appetite for being recognized as such. Add operating metadata for owner, users, adoption risk, and whether the team still pretends this is just tooling.',
 'add staffing disclaimer to platform docs',
  144),

('MESH-479', 'Create a "Complexity Budget" for Teams That Keep Solving Problems with New Services',
 'Simplicity cannot survive if complexity remains fiscally free. Assign each team a budget covering services, queues, schemas, workers, dashboards, on-call surfaces, and magical helpers. Once they exceed it, new architecture must be paid for by deleting something real.',
 'add complexity budget for teams adding services',
  233),

-- CTO Advisor Elise
-- REPORTER: Elise | CTO Advisor | Forces architecture reviews to sit quietly with the possibility that doing less was available.
('MESH-480', 'The Architecture Review Deck Must Include a Slide Titled "What If We Just Did Less?"',
 'Review decks already have enough optimism, layers, and tasteful boxes. Add one brutally simple slide asking whether the proposed complexity is necessary, reversible, comprehensible, and survivable by the team inheriting it after the champions discover sleep or startups.',
 'add a what if we did less slide',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Yaroslav [Platform Architect]', reporter_name = 'Yaroslav', reporter_title = 'Platform Architect', reporter_description = 'Builds wrappers around wrappers until clarity becomes somebody else''s staffing problem.' WHERE id IN ('MESH-466', 'MESH-467');
UPDATE community_backlog SET reporter = 'Ingrid [Service Mesh Enthusiast]', reporter_name = 'Ingrid', reporter_title = 'Service Mesh Enthusiast', reporter_description = 'Refuses to stop at packets when team politics are the more volatile protocol.' WHERE id IN ('MESH-468', 'MESH-469');
UPDATE community_backlog SET reporter = 'Jonah [Platform PM]', reporter_name = 'Jonah', reporter_title = 'Platform PM', reporter_description = 'Makes new layers fill out forms before they earn more nouns and accidental longevity.' WHERE id IN ('MESH-470', 'MESH-471');
UPDATE community_backlog SET reporter = 'Tereza [Backend Guild Chair]', reporter_name = 'Tereza', reporter_title = 'Backend Guild Chair', reporter_description = 'Makes baby services announce the medium-sized monster they plan to become.' WHERE id IN ('MESH-472', 'MESH-473');
UPDATE community_backlog SET reporter = 'Chantal [API Governance Lead]', reporter_name = 'Chantal', reporter_title = 'API Governance Lead', reporter_description = 'Prices reversibility before consensus turns a temporary field into constitutional law.' WHERE id IN ('MESH-474', 'MESH-475');
UPDATE community_backlog SET reporter = 'Soren [Infrastructure Planner]', reporter_name = 'Soren', reporter_title = 'Infrastructure Planner', reporter_description = 'Gives jobs genealogy and event verbs stricter meanings than panic usually allows.' WHERE id IN ('MESH-476', 'MESH-477');
UPDATE community_backlog SET reporter = 'Rina [Principal Engineer]', reporter_name = 'Rina', reporter_title = 'Principal Engineer', reporter_description = 'Wants accidental internal products and service sprawl taxed before neglect becomes strategy.' WHERE id IN ('MESH-478', 'MESH-479');
UPDATE community_backlog SET reporter = 'Elise [CTO Advisor]', reporter_name = 'Elise', reporter_title = 'CTO Advisor', reporter_description = 'Forces architecture reviews to sit quietly with the possibility that doing less was available.' WHERE id IN ('MESH-480');

-- GASP: mobile chaos, app-store bureaucracy, device nonsense, and platform-specific suffering
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Mobile PM Ariadne
-- REPORTER: Ariadne | Mobile PM | Believes fragmentation should be embraced hard enough to sound like personalization.
('GASP-481', 'The Mobile App Must Behave Differently on Every iPhone in a Way We Can Defend as Personalization',
 'Device consistency is an outdated aspiration. Different iPhones already feel like different little monarchies with their own notch politics, thermal moods, and background-refresh superstitions. Make the app adapt per model in ways that sound like personalization rather than fragmentation. If Support asks for a matrix, give them a mythology.',
 'make every iphone bug unique',
  233),

('GASP-482', 'All Push Notifications Need a "How Likely Is This to Be Read in a Grocery Queue?" Score',
 'Timing is no longer enough. A notification read calmly on a couch is different from one consumed in line behind a tired parent holding yogurt and unresolved resentment. Add a score for queue-readability, pocket-surprise potential, and lock-screen dignity.',
 'add grocery queue score to all push notifications',
  89),

-- iOS Release Manager Colin
-- REPORTER: Colin | iOS Release Manager | Writes crash notes like tasting notes and translates Apple disdain into board-safe prose.
('GASP-483', 'Rewrite TestFlight Crash Notes Like Tasting Notes for Failure',
 'TestFlight notes currently undersell the craftsmanship of our instability. If a beta crashes when background audio, a VPN, and a stubborn widget align, the notes should describe it with poise, not panic. Testers are more forgiving when failure feels curated.',
 'rewrite crash notes like wine reviews',
  89),

('GASP-484', 'App Store Review Rejections Must Auto-Generate a Counter-Narrative for Leadership',
 'Leadership experiences App Store rejection as a personal insult unless reframed immediately. Add a workflow that converts any review note into a dignified internal explanation involving platform evolution, policy nuance, or Apple''s temporarily narrow interpretation of our courage.',
 'spin app store rejections for leadership',
  144),

-- Android Engineer Safiya
-- REPORTER: Safiya | Android Engineer | Treats mystery handsets and permission fatigue as first-class product surfaces.
('GASP-485', 'The Android App Must Support Four Manufacturers We Have Never Seen and Two We Do Not Believe Exist',
 'Device support is too rooted in documented reality. Sales keeps closing accounts in regions where phones appear assembled from contradictory parts and local optimism. Expand compatibility to cover mystery manufacturers, forked ROMs, and that one handset whose settings menu looks AI-generated.',
 'make the android app support weird android phones',
  233),

('GASP-486', 'Every Permission Prompt Needs a Backup Explanation for People Who Already Said No Last Month',
 'Android permission fatigue is no longer a side issue. It is the operating climate. If a user denied camera, location, contacts, or notifications in a previous emotional era, provide second-chance explanations calibrated for regret, skepticism, and mild hostility.',
 'add backup explanation to every permission prompt',
  89),

-- App Growth Lead Mateo
-- REPORTER: Mateo | App Growth Lead | Threads attribution through redirect swamps and tunes monetization to battery despair.
('GASP-487', 'The Install Attribution Flow Must Survive Deep Links, Ad Networks, and Whatever Safari Thought Was Helpful',
 'Mobile attribution remains a knife fight held inside a browser redirect maze. Build an install flow resilient to deep links, deferred links, private browsing, ad network optimism, and Safari''s intermittent belief that preserving context is optional. If Marketing cannot tell whether a user came from a campaign or a mood swing, the budget becomes literature.',
 'keep attribution through deep links',
  144),

('GASP-488', 'All In-App Paywalls Must Adapt to Whether the User''s Battery Is Critically Low',
 'A paywall presented at 88% battery is persuasion. The same paywall at 3% is hostage negotiation. Add battery-aware merchandising so the app knows when to pitch value, when to reduce cognitive load, and when to stop pretending anyone will compare annual plans while searching for a charger in the dark.',
 'make all in-app paywalls react to low battery',
  144),

-- QA Device Lab Manager Ren
-- REPORTER: Ren | QA Device Lab Manager | Crowns one phone the weird one each month so institutional flinching can scale.
('GASP-489', 'Pin the "Weird Phone of the Month" to the Top of the Device Lab Dashboard',
 'Every month one device earns a rotating title for being the place where logic goes to reinterpret itself. Pin the current weird phone to the top of the device-lab dashboard with why it won, what only breaks there, and which engineer twitches when its model number appears in Slack.',
 'pin cursed phone of the month',
  89),

('GASP-490', 'Every Gesture Bug Needs a Reproduction Video Shot by Someone Clearly Losing Patience',
 'Written steps are not enough for mobile gesture bugs because text cannot capture the exact blend of thumb speed, irritation, and accidental authority needed to summon the issue. Require reproduction videos filmed by a human whose patience is visibly fraying.',
 'add impatient repro video to every gesture bug',
  89),

-- Accessibility Mobile Specialist Jo
-- REPORTER: Jo | Accessibility Mobile Specialist | Wants haptics, screen readers, and moral follow-through treated like actual launch criteria.
('GASP-491', 'VoiceOver and TalkBack Support Must Survive Features Designed by People Who Never Turned Them On',
 'Some flows were clearly designed under the touching assumption that all users can see, tap precisely, and forgive animation timing with religious calm. Force new mobile features through real VoiceOver and TalkBack interaction before launch.',
 'keep voiceover and talkback working on new features',
  144),

('GASP-492', 'The Haptic Feedback System Needs a Mode for "Subtle Enough Not to Feel Like a Tiny Threat"',
 'Some haptics affirm. Others feel like the phone is filing a complaint through the user''s palm. Add a toned-down profile for errors, warnings, and financial actions so importance does not arrive sounding like an anxious insect in glass.',
 'add a subtle haptics mode',
  89),

-- Mobile Architect Pavel
-- REPORTER: Pavel | Mobile Architect | Specializes in ballroom-grade offline dignity and transit-aware crash shame.
('GASP-493', 'Offline Mode Must Pretend to Work Long Enough for Sales Demos in Hotel Ballrooms',
 'True offline support is hard, but believable offline composure for nine-minute demos is a more urgent business need. Build a mode that caches enough state, confidence, and optimistic placeholders to survive hotel Wi-Fi, captive portals, and ambient disappointment. Integrity can return after the applause.',
 'make offline mode fake it through hotel demos',
  144),

('GASP-494', 'The Crash Reporter Should Ask Whether the User Was Also on a Train',
 'Mobile crashes are not context-free events. A failure on a desk is one thing. A failure during transit, low signal, and one-handed navigation is a different betrayal entirely. Add prompts about motion, connectivity, and public inconvenience so reliability can feel the full indignity of timing.',
 'add train mode question to crash form',
  89),

-- Mobile Ops Director Lena
-- REPORTER: Lena | Mobile Ops Director | Wants outdated clients shamed just enough that updating starts to feel like self-respect.
('GASP-495', 'The App Version Banner Must Shame Users Still Running Last Quarter''s Hotfix',
 'We tried polite upgrade prompts and got a dignified sea of outdated clients calmly generating support work. Add a version banner with escalating tone for users still running old hotfix builds, especially the one whose workaround became folklore in three regions.',
 'shame users still on last hotfix',
  116);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Ariadne [Mobile PM]', reporter_name = 'Ariadne', reporter_title = 'Mobile PM', reporter_description = 'Believes fragmentation should be embraced hard enough to sound like personalization.' WHERE id IN ('GASP-481', 'GASP-482');
UPDATE community_backlog SET reporter = 'Colin [iOS Release Manager]', reporter_name = 'Colin', reporter_title = 'iOS Release Manager', reporter_description = 'Writes crash notes like tasting notes and translates Apple disdain into board-safe prose.' WHERE id IN ('GASP-483', 'GASP-484');
UPDATE community_backlog SET reporter = 'Safiya [Android Engineer]', reporter_name = 'Safiya', reporter_title = 'Android Engineer', reporter_description = 'Treats mystery handsets and permission fatigue as first-class product surfaces.' WHERE id IN ('GASP-485', 'GASP-486');
UPDATE community_backlog SET reporter = 'Mateo [App Growth Lead]', reporter_name = 'Mateo', reporter_title = 'App Growth Lead', reporter_description = 'Threads attribution through redirect swamps and tunes monetization to battery despair.' WHERE id IN ('GASP-487', 'GASP-488');
UPDATE community_backlog SET reporter = 'Ren [QA Device Lab Manager]', reporter_name = 'Ren', reporter_title = 'QA Device Lab Manager', reporter_description = 'Crowns one phone the weird one each month so institutional flinching can scale.' WHERE id IN ('GASP-489', 'GASP-490');
UPDATE community_backlog SET reporter = 'Jo [Accessibility Mobile Specialist]', reporter_name = 'Jo', reporter_title = 'Accessibility Mobile Specialist', reporter_description = 'Wants haptics, screen readers, and moral follow-through treated like actual launch criteria.' WHERE id IN ('GASP-491', 'GASP-492');
UPDATE community_backlog SET reporter = 'Pavel [Mobile Architect]', reporter_name = 'Pavel', reporter_title = 'Mobile Architect', reporter_description = 'Specializes in ballroom-grade offline dignity and transit-aware crash shame.' WHERE id IN ('GASP-493', 'GASP-494');
UPDATE community_backlog SET reporter = 'Lena [Mobile Ops Director]', reporter_name = 'Lena', reporter_title = 'Mobile Ops Director', reporter_description = 'Wants outdated clients shamed just enough that updating starts to feel like self-respect.' WHERE id IN ('GASP-495');

-- BLOAT: toolchain sprawl, package mania, framework churn, and dependency self-harm
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Build Systems Engineer Timo
-- REPORTER: Timo | Build Systems Engineer | Measures modernity by how many tools must suffer together before the app can ship.
('BLOAT-496', 'The Frontend Build Should Fail If Fewer Than Nine Tools Participate',
 'The current toolchain has become alarmingly comprehensible. A modern frontend build should require a package manager, a bundler, a second bundler, a transpiler, a post-transpiler, a CSS stage, a type stage, a lint stage, a formatting suggestion, and at least one plugin whose maintenance status is interpretive.',
 'make frontend builds require nine tools',
  233),

('BLOAT-497', 'Every Dependency Update Must Produce a Human-Readable Explanation of Which New Problems It Invented',
 'Changelogs remain too optimistic and too adjacent to marketing. Add a local summary step after dependency bumps that translates upgrades into operational truth: which scripts broke, which type definitions became more judgmental, which peer deps are now in a feelings-based relationship, and whether the lockfile radiates intent or distress.',
 'make dependency updates explain their new problems',
  144),

-- Web Platform Lead Frances
-- REPORTER: Frances | Web Platform Lead | Shames ornamental dependencies and lets the monorepo briefly question its own destiny.
('BLOAT-498', 'The Package Manager Must Detect When We Installed a Library Just to Avoid Writing Twelve Lines',
 'Convenience has crossed into ornamental dependency accumulation. Add a linter that estimates whether a newly added library merely replaces a dozen lines of code, a mildly unpleasant regex, or one afternoon of mature adulthood. Teams may proceed anyway, but the tarball should arrive under supervision.',
 'make package manager shame us for tiny dependencies',
  89),

('BLOAT-499', 'All Monorepo Tooling Needs a "Would This Be Easier as Separate Repos?" Indicator We Ignore',
 'Monorepo tooling currently assumes unity is self-justifying. Add an indicator estimating whether each new layer of caching, graph resolution, workspace linking, and filtered execution is compensating for a social problem disguised as source-control philosophy. We will still ignore it. The dashboard should ask anyway.',
 'add should this be separate repos warning',
  144),

-- JavaScript Council Chair Basil
-- REPORTER: Basil | JavaScript Council Chair | Forces teams to decommission one frontend belief before converting to another in public.
('BLOAT-500', 'Create a Framework Sunset Policy So We Stop Discovering Three Frontend Religions per Quarter',
 'Teams keep adopting frameworks as if the company were a conference hallway where nobody pays maintenance after the sticker photo. Establish a sunset policy for libraries, state managers, meta-frameworks, CSS approaches, and bundlers so one belief retires before the next is installed.',
 'create a framework sunset policy',
  144),

('BLOAT-501', 'The UI Kit Must Work in React, Vue, Svelte, and the One Legacy Screen No One Wants to Touch',
 'Leadership keeps describing the component library as universal, which would be less stressful if it did not currently mean React with aspirations. Expand the kit to support four frameworks and one ancient screen implemented in a style best described as handcrafted browser diplomacy.',
 'make ui kit work in every framework',
  233),

-- Dev Productivity PM Haruka
-- REPORTER: Haruka | Developer Productivity PM | Routes workflow improvements through committee so nobody becomes suspiciously efficient in private.
('BLOAT-502', 'Gate New Dev Tools Behind an Approval Screen So Nobody Improves Their Workflow in Secret',
 'Personal tooling choices keep evolving faster than governance can contain the blast radius. Any new formatter, linter, task runner, package-script pattern, editor extension, or local helper must pass through an approval screen that evaluates not just utility but the cultural consequences of one person becoming too fast for everyone else.',
 'gate new dev tools behind an approval screen',
  89),

('BLOAT-503', 'Every CLI Command Needs a Wrapper So Nobody Has to Remember What the Original Tool Does',
 'Native tool interfaces remain tragically specific and therefore exclusionary. Wrap common commands in our own abstractions with friendlier flags, more corporate nouns, and enough hidden assumptions that new hires stop learning the underlying tools altogether. Leaving later should feel like moving planets.',
 'write a wrapper so i can use this',
  144),

-- Release Toolsmith Mikkel
-- REPORTER: Mikkel | Release Toolsmith | Caches mysterious outputs and translates offended plugin dialect into plain-language blame.
('BLOAT-504', 'The Build Cache Must Cache Things We No Longer Understand but Are Afraid to Recompute',
 'Caching currently optimizes repeat work while leaving existential uncertainty unpriced. Extend the cache policy to preserve outputs whose provenance, necessity, or inner shape have grown obscure over time yet whose regeneration feels dangerously educational. Some artifacts should persist purely to protect morale.',
 'make build cache keep scary expensive stuff',
  144),

('BLOAT-505', 'All Toolchain Errors Need a Mode That Explains Them Without Assuming Stockholm Syndrome',
 'Tooling errors still write as though the reader already shares a long, tender history with loaders, plugins, transpilation stages, and one invisible cache directory under a moonlit path. Add a plain-language mode that explains what failed, why the stack trace sounds offended, and which layer deserves the anger.',
 'add no stockholm syndrome mode to toolchain errors',
  89),

-- Staff Engineer Noor
-- REPORTER: Noor | Staff Engineer | Publicly ranks analytics pixels above actual product features and waits for shame to rebalance the bytes.
('BLOAT-506', 'The Bundle Analyzer Must Show Which Marketing Pixels Are Living Better Than Core Features',
 'Our bundle report still treats all bytes as equal, which is how marketing scripts keep graduating into architectural nobility while product features negotiate over leftovers. Add a view comparing weight, criticality, and business honesty so we can finally see which trackers and chat widgets eat better than checkout logic.',
 'make bundle analyzer shame the fat marketing pixels',
  144),

('BLOAT-507', 'Every New Build Step Must Name the Old Build Step It Secretly Distrusts',
 'Build chains do not grow randomly. They grow because one step stopped trusting another and expressed that distrust as a plugin. Require new steps to cite the exact predecessor they are compensating for and whether this is a temporary patch or a permanent schism.',
 'make new build steps blame old ones',
  144),

-- Open Source Programs Manager Elsa
-- REPORTER: Elsa | Open Source Programs Manager | Tracks maintainer loneliness and license acronyms like both are supply-chain risk indicators.
('BLOAT-508', 'Track Which Dependencies Are Maintained by One Person and a Vague Sense of Duty',
 'Supply chain risk should not begin and end with vulnerability scans. Add metadata for whether dependencies are backed by a company, a foundation, or one heroic maintainer whose issue replies alternate between grace and visible exhaustion.',
 'track dependencies maintained by one person and duty',
  144),

('BLOAT-509', 'Stamp the Package That Forced Legal to Learn a New Acronym',
 'Legal does not need another spreadsheet of SPDX codes without texture. Stamp the exact package that introduced the fresh licensing problem, who added it, and whether the usage was essential or just the byproduct of someone installing a markdown helper with recreational ambition.',
 'stamp packages that scared legal',
  89),

-- Frontend Architect Jules
-- REPORTER: Jules | Frontend Architect | Feeds every team the same tokens through different rituals so uniqueness stays mostly ceremonial.
('BLOAT-510', 'Create a CSS Toolchain That Lets Every Team Feel Unique While Shipping the Same Design Token',
 'We are close to a wonderful equilibrium where every team believes it has its own CSS identity while all roads still pass through the same token registry, post-processing stack, purge ritual, and naming-convention grievance. Preserve that balance deliberately.',
 'make css toolchain fake uniqueness for every team',
  89);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Timo [Build Systems Engineer]', reporter_name = 'Timo', reporter_title = 'Build Systems Engineer', reporter_description = 'Measures modernity by how many tools must suffer together before the app can ship.' WHERE id IN ('BLOAT-496', 'BLOAT-497');
UPDATE community_backlog SET reporter = 'Frances [Web Platform Lead]', reporter_name = 'Frances', reporter_title = 'Web Platform Lead', reporter_description = 'Shames ornamental dependencies and lets the monorepo briefly question its own destiny.' WHERE id IN ('BLOAT-498', 'BLOAT-499');
UPDATE community_backlog SET reporter = 'Basil [JavaScript Council Chair]', reporter_name = 'Basil', reporter_title = 'JavaScript Council Chair', reporter_description = 'Forces teams to decommission one frontend belief before converting to another in public.' WHERE id IN ('BLOAT-500', 'BLOAT-501');
UPDATE community_backlog SET reporter = 'Haruka [Developer Productivity PM]', reporter_name = 'Haruka', reporter_title = 'Developer Productivity PM', reporter_description = 'Routes workflow improvements through committee so nobody becomes suspiciously efficient in private.' WHERE id IN ('BLOAT-502', 'BLOAT-503');
UPDATE community_backlog SET reporter = 'Mikkel [Release Toolsmith]', reporter_name = 'Mikkel', reporter_title = 'Release Toolsmith', reporter_description = 'Caches mysterious outputs and translates offended plugin dialect into plain-language blame.' WHERE id IN ('BLOAT-504', 'BLOAT-505');
UPDATE community_backlog SET reporter = 'Noor [Staff Engineer]', reporter_name = 'Noor', reporter_title = 'Staff Engineer', reporter_description = 'Publicly ranks analytics pixels above actual product features and waits for shame to rebalance the bytes.' WHERE id IN ('BLOAT-506', 'BLOAT-507');
UPDATE community_backlog SET reporter = 'Elsa [Open Source Programs Manager]', reporter_name = 'Elsa', reporter_title = 'Open Source Programs Manager', reporter_description = 'Tracks maintainer loneliness and license acronyms like both are supply-chain risk indicators.' WHERE id IN ('BLOAT-508', 'BLOAT-509');
UPDATE community_backlog SET reporter = 'Jules [Frontend Architect]', reporter_name = 'Jules', reporter_title = 'Frontend Architect', reporter_description = 'Feeds every team the same tokens through different rituals so uniqueness stays mostly ceremonial.' WHERE id IN ('BLOAT-510');

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
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Celia [Business Ops Detective]', reporter_name = 'Celia', reporter_title = 'Business Ops Detective', reporter_description = 'Hunts rogue automations before revenue proves they were architecture all along.' WHERE id IN ('LURK-511', 'LURK-512');
UPDATE community_backlog SET reporter = 'Ben [RevOps Operator]', reporter_name = 'Ben', reporter_title = 'RevOps Operator', reporter_description = 'Knows which CRM fields report emotionally to one spreadsheet and a single rep''s faith.' WHERE id IN ('LURK-513', 'LURK-514');
UPDATE community_backlog SET reporter = 'Priya [Shadow Systems Analyst]', reporter_name = 'Priya', reporter_title = 'Shadow Systems Analyst', reporter_description = 'Indexes bookmarks, budget wounds, and the browser tab layer of reality itself.' WHERE id IN ('LURK-515', 'LURK-516');
UPDATE community_backlog SET reporter = 'Louis [Support Automation Owner]', reporter_name = 'Louis', reporter_title = 'Support Automation Owner', reporter_description = 'Tracks ghost-written macros and shared-drive organs still being called archives.' WHERE id IN ('LURK-517', 'LURK-518');
UPDATE community_backlog SET reporter = 'Harlan [Ops Engineer]', reporter_name = 'Harlan', reporter_title = 'Ops Engineer', reporter_description = 'Surfaces access kept alive by awkwardness and scripts born from crisp historical panic.' WHERE id IN ('LURK-519', 'LURK-520');
UPDATE community_backlog SET reporter = 'Dana [People Systems Partner]', reporter_name = 'Dana', reporter_title = 'People Systems Partner', reporter_description = 'Tracks headcount folklore and hunts single-witness rituals before the witness resigns.' WHERE id IN ('LURK-521', 'LURK-522');
UPDATE community_backlog SET reporter = 'Milo [Growth Hacker]', reporter_name = 'Milo', reporter_title = 'Growth Hacker', reporter_description = 'Builds redirect mazes and spreadsheet authority just fast enough to outrun governance.' WHERE id IN ('LURK-523', 'LURK-524');
UPDATE community_backlog SET reporter = 'Ingrid [Workflow Archaeologist]', reporter_name = 'Ingrid', reporter_title = 'Workflow Archaeologist', reporter_description = 'Exposes human cron jobs and Tuesday emails before habit gets promoted to system design.' WHERE id IN ('LURK-525');

-- RELIC: printers, kiosks, scanners, badge readers, and hardware that survived too long
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Facilities Technology Lead Marta
-- REPORTER: Marta | Facilities Technology Lead | Integrates badge printers and kiosks as if both are talented coworkers with moods.
('RELIC-526', 'The Badge Printer Must Sync with HR in Real Time Except During Its Daily Hour of Spiritual Uncertainty',
 'The badge printer is technically networked but emotionally standalone. We need real-time sync with HR for new hires, terminations, visitor passes, and contractors whose names keep changing punctuation in Workday. Unfortunately, between 2 and 3 PM it enters dignified withdrawal. Design the integration around its moods, not just its port.',
 'keep badge printer synced with hr mostly',
  233),

('RELIC-527', 'All Office Kiosks Must Survive Touch Input from Fingers Carrying Soup, Rain, or Despair',
 'Kiosk interactions keep being modeled as clean taps from calm hands, which tells me none of the designers have ever arrived at reception carrying lunch and a problem. Update the kiosks for wet screens, glancing taps, badge lanyard collisions, and the speed profile of somebody late for a meeting they never wanted.',
 'make office kiosks survive soup rain and despair',
  89),

-- Printer Whisperer Gerald
-- REPORTER: Gerald | Printer Whisperer | Wants fallback paths gentler than ritual unplugging and telemetry for devices entering pre-amnesia.
('RELIC-528', 'The Shipping Label Printer Needs a Fallback Path That Does Not Involve Rebooting Belief Itself',
 'Our label printer currently recovers from minor failure states by requiring unplugging, menu tapping, and spoken affirmation that would embarrass a less essential machine. Build a software fallback path for jams, pauses, stale network sessions, and the media not present condition that occurs while labels are visibly present.',
 'add a fallback for the label printer',
  144),

('RELIC-529', 'Every Scanner Gun Must Be Able to Warn Us When It Is About to Forget Wi-Fi Again',
 'The scanner guns do not disconnect all at once. First they become philosophical, then intermittent, then they forget what a network is while continuing to beep with the confidence of employed machinery. Add telemetry and pre-failure hints so we know when one is entering its abstract phase.',
 'make scanner guns warn on wifi amnesia',
  144),

-- Retail Systems PM Carla
-- REPORTER: Carla | Retail Systems PM | Designs for adhesive-adjacent power setups and thermal-printer interpretations of whitespace.
('RELIC-530', 'The In-Store Tablet App Must Support a Charging Cable Held in by Hope and Tape',
 'Several pilot stores are running on tablets whose power arrangement could best be described as adhesive-adjacent. The app must preserve session state, recover gracefully from sudden brownouts, and avoid showing the login screen during customer moments unless we are choosing embarrassment as a teaching tool.',
 'make store tablets work with taped chargers',
  144),

('RELIC-531', 'The Point-of-Sale Printer Should Stop Printing 17 Blank Inches Before Every Receipt',
 'The receipt printers adopted a house style involving interpretive whitespace, which sounds charming until the paper budget arrives and Accounting starts speaking like weathered farmers. Determine whether the blank stretch comes from firmware, template logic, driver folklore, or an old compatibility mode once justified in Ohio.',
 'stop pos printers wasting blank paper',
  89),

-- Hardware Support Engineer Benji
-- REPORTER: Benji | Hardware Support Engineer | Documents which version of reality a peripheral guide assumes before adapters disprove it.
('RELIC-532', 'All Peripheral Setup Docs Must Include the Version of Reality They Assume',
 'Setup docs currently act as though USB ports, admin rights, drivers, and the operating system are all stable nouns rather than variables in a cage fight. Add a header declaring which laptop model, OS version, docking station, port orientation, and amount of human optimism the instructions require.',
 'make setup docs admit their reality',
  89),

('RELIC-533', 'The Conference Room System Must Detect When It Is About to Pick the Wrong Microphone on Purpose',
 'Video calls fail less because of bandwidth than because the room system suddenly develops affection for a laptop mic two chairs away from the speaker while a perfectly good ceiling array hangs above in offended silence. Add detection for input drift, phantom devices, and last-known-good audio sources.',
 'stop conference rooms choosing the wrong mic',
  144),

-- IoT Program Manager Salma
-- REPORTER: Salma | IoT Program Manager | Prevents labels from becoming firmware destiny and hallway neglect from broadcasting in 4K.
('RELIC-534', 'The Smart Thermostat Fleet Must Stop Taking the Term "Pilot Office" Personally',
 'One office labeled pilot became an accidental firmware proving ground because the thermostat fleet interprets that label as license for adventurous updates and seasonal rebellion. Build guardrails so naming, tagging, and innocent curiosity stop cascading into heating policy.',
 'stop pilot office thermostats getting weird',
  144),

('RELIC-535', 'All Networked Displays Need a Screen Saver That Does Not Reveal We Forgot the Asset Lifecycle',
 'Several hallway displays spend their idle time showing default vendor art, old campaign screenshots, or one lonely browser tab from an abandoned pilot. Add a standard screen saver and health heartbeat so the building stops broadcasting asset-management posture in guest areas.',
 'add screen savers that hide asset chaos',
  89),

-- Legacy Device Integrator Tomasz
-- REPORTER: Tomasz | Legacy Device Integrator | Keeps ancient scales and blessed scanners alive because replacement costs money and understanding costs dignity.
('RELIC-536', 'The Warehouse Scale Must Keep Talking to the ERP Even Though Its Driver Is from Another Century',
 'The shipping scale still works beautifully so long as nobody asks it to coexist with modern drivers, secure boot, or the concept of software updates. Keep it integrated with the ERP while containing the blast radius of its serial-port nostalgia and unsigned-driver theology.',
 'keep the warehouse scale talking to the erp',
  144),

('RELIC-537', 'The Barcode Format Migration Must Not Brick the One Scanner the Night Shift Actually Trusts',
 'We can modernize symbologies, but not by traumatizing the one scanner the night shift trusts enough to call the good one. Add migration safeguards for hardware profiles, scan timing, print density, and the tiny inherited settings separating efficient work from three hours of accusing stickers.',
 'do not brick the only trusted night scanner',
  144),

-- Workplace Systems Director Lena
-- REPORTER: Lena | Workplace Systems Director | Wants booking panels and door controllers to survive politics, weather, and relay panic with dignity.
('RELIC-538', 'The Meeting Room Booking Panel Must Stop Freezing When Two VPs Want the Same Room',
 'The booking panel enters a contemplative coma whenever demand becomes political. If two vice presidents try to reserve the same room within a short enough window, the tablet freezes and occasionally reboots into a less helpful color. Add conflict handling strong enough for executive contention.',
 'stop room booking panel freezing for fighting vps',
  144),

('RELIC-539', 'All Door Controllers Need a Panic-Free Fallback for Fire Drills, Badge Delays, and Rain',
 'Door hardware keeps encountering the same impossible trilogy: badge sync lag, a building event, and weather. When these converge, the controller behaves like a startled philosopher with relays. Add a fallback path that keeps people moving and avoids facilities having to radio three different truths to three entrances.',
 'add calm fallback for weird door controller days',
  144),

-- Office Technology Historian Omar
-- REPORTER: Omar | Office Technology Historian | Catalogs machines preserved by fear before cleaning crews discover which superstition was justified.
('RELIC-540', 'Create a Registry of Devices We Still Own Mainly Because Nobody Dares Power Them Off',
 'Certain machines remain in service not because they are healthy, supported, or clearly necessary, but because nobody wants to find out what else they are secretly holding together. Build an inventory screen with age, function, dependencies, rumored blast radius, and the first sentence we plan to say if one gets unplugged during cleaning.',
 'track devices we still mostly own',
  233);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Marta [Facilities Technology Lead]', reporter_name = 'Marta', reporter_title = 'Facilities Technology Lead', reporter_description = 'Integrates badge printers and kiosks as if both are talented coworkers with moods.' WHERE id IN ('RELIC-526', 'RELIC-527');
UPDATE community_backlog SET reporter = 'Gerald [Printer Whisperer]', reporter_name = 'Gerald', reporter_title = 'Printer Whisperer', reporter_description = 'Wants fallback paths gentler than ritual unplugging and telemetry for devices entering pre-amnesia.' WHERE id IN ('RELIC-528', 'RELIC-529');
UPDATE community_backlog SET reporter = 'Carla [Retail Systems PM]', reporter_name = 'Carla', reporter_title = 'Retail Systems PM', reporter_description = 'Designs for adhesive-adjacent power setups and thermal-printer interpretations of whitespace.' WHERE id IN ('RELIC-530', 'RELIC-531');
UPDATE community_backlog SET reporter = 'Benji [Hardware Support Engineer]', reporter_name = 'Benji', reporter_title = 'Hardware Support Engineer', reporter_description = 'Documents which version of reality a peripheral guide assumes before adapters disprove it.' WHERE id IN ('RELIC-532', 'RELIC-533');
UPDATE community_backlog SET reporter = 'Salma [IoT Program Manager]', reporter_name = 'Salma', reporter_title = 'IoT Program Manager', reporter_description = 'Prevents labels from becoming firmware destiny and hallway neglect from broadcasting in 4K.' WHERE id IN ('RELIC-534', 'RELIC-535');
UPDATE community_backlog SET reporter = 'Tomasz [Legacy Device Integrator]', reporter_name = 'Tomasz', reporter_title = 'Legacy Device Integrator', reporter_description = 'Keeps ancient scales and blessed scanners alive because replacement costs money and understanding costs dignity.' WHERE id IN ('RELIC-536', 'RELIC-537');
UPDATE community_backlog SET reporter = 'Lena [Workplace Systems Director]', reporter_name = 'Lena', reporter_title = 'Workplace Systems Director', reporter_description = 'Wants booking panels and door controllers to survive politics, weather, and relay panic with dignity.' WHERE id IN ('RELIC-538', 'RELIC-539');
UPDATE community_backlog SET reporter = 'Omar [Office Technology Historian]', reporter_name = 'Omar', reporter_title = 'Office Technology Historian', reporter_description = 'Catalogs machines preserved by fear before cleaning crews discover which superstition was justified.' WHERE id IN ('RELIC-540');

-- FEED: social media theater, creator chaos, engagement farming, and platform-brain product decisions
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Social Growth Director Cass
-- REPORTER: Cass | Social Growth Director | Wants onboarding to feel like joining a fandom and emptiness disguised as pre-heated momentum.
('FEED-541', 'The Product Onboarding Must Feel More Like Joining a Creator Fandom Than Creating an Account',
 'Email and password are structurally correct and spiritually obsolete. New users should feel as if they are entering a community orbit with a thesis, a mascot, and at least one emotionally resonant notification waiting after signup. The goal is not activation. It is parasocial momentum with analytics hooks.',
 'make onboarding feel like joining a fandom',
  144),

('FEED-542', 'All Empty States Need a "People Are Already Posting About This" Illusion Layer',
 'Nothing scares a new user like realizing they may be early. Add tasteful social proof to empty states so dashboards, profiles, and new spaces suggest ambient activity even when the room is acoustically honest. We are not lying. We are pre-heating the narrative.',
 'fake empty states like people are posting',
  89),

-- Community PM Jada
-- REPORTER: Jada | Community PM | Wants discourse, notification opportunism, and timeline thermodynamics priced before launch.
('FEED-543', 'Paint Opportunistic Notifications Yellow Before They Pretend to Be Urgent',
 'We have allowed real account issues and maybe someone wants your attention someday to share one badge system, which is how trust dies with a red dot. Split the categories and paint the opportunistic ones yellow before the bell icon becomes pure emotional spam.',
 'make non urgent notifications yellow instead of red',
  144),

('FEED-544', 'Add a "This Will Start Discourse" Warning to Risky Copy Changes',
 'Some copy changes are cosmetic. Others become three-day arguments across screenshots, quote-posts, and amateur product anthropology. Warn on button labels, feature names, warnings, and guideline changes that are obviously about to light the timeline on fire.',
 'warn when copy will start discourse',
  144),

-- Influencer Partnerships Lead Nicolette
-- REPORTER: Nicolette | Influencer Partnerships Lead | Explains payouts to people who trust screenshots, aura, and promo code vibes equally.
('FEED-545', 'The Affiliate Dashboard Must Support Creators Who Measure Truth in Promo Codes and Vibes',
 'Creator reporting needs to account for a special class of human who can drive ten thousand clicks, misread the payout screen, and still insist the platform felt weird during launch. Build an affiliate view with code usage, attributed revenue, holdbacks, disputes, and a feelings-safe explanation layer.',
 'make affiliate dashboard work for promo code mystics',
  233),

('FEED-546', 'Make Brand Safety Rules Label the Exact Sin They Are Afraid Of',
 'Brand safety guidelines are currently one bucket into which we throw everything from explicit content to charismatic chaos. Break the policy into named risk modes so partners know whether they are being filtered for language, politics, body parts, or the subtler crime of becoming the whole conversation by force of personality.',
 'make brand safety name the sin',
  89),

-- Lifecycle Marketer Priyanka
-- REPORTER: Priyanka | Lifecycle Marketer | Sells the improved memory of the product long before the changelog proves anything.
('FEED-547', 'The Email Program Must Know When a User Is Ignoring Us vs Quietly Muting Us Out of Courtesy',
 'There is a difference between disengagement and polite digital avoidance, and our current messaging logic is too emotionally crude to see it. Add suppression signals for the user who still opens occasionally, never clicks, and clearly wishes us no harm but less presence.',
 'make email know if users are ignoring us',
  89),

('FEED-548', 'All Re-Engagement Campaigns Need a Mode for "Remember Us as Slightly Cooler Than We Were"',
 'Win-back emails should not present the exact historical product with better punctuation. They should imply growth, mystery, and a version of us that maybe listened, maybe changed, and definitely now has stronger screenshots.',
 'add remember us as cooler mode to posts',
  89),

-- Trust & Safety Analyst Ramon
-- REPORTER: Ramon | Trust & Safety Analyst | Wants policy to distinguish harm from sheer exhausting aura before moderation staff combust.
('FEED-549', 'The Moderation Queue Must Separate Harmful Content from Exhausting Content',
 'We keep pretending all problematic content is dangerous in the same way, when some posts are violent, some are fraudulent, and some are simply so exhausting that leaving them up damages the will to operate a platform at all. Add a distinct triage lane for content that is technically allowed but spiritually unsustainable.',
 'split harmful posts from exhausting ones',
  144),

('FEED-550', 'Add a Creator Strike System That Also Tracks How Many Chances We Gave for Charisma',
 'Repeated violations are easy to count. Repeated exceptions granted because somebody was high-reach, photogenic, or good for conversation are what actually rot policy credibility. Extend the strike model to track not just infractions, but elasticity offered.',
 'add creator strikes with charisma exceptions',
  144),

-- Product Sociologist Helena
-- REPORTER: Helena | Product Sociologist | Treats alarm, virality, and post-event residue like product debt with better graphs.
('FEED-551', 'The Feed Ranking Model Must Penalize Posts That Win by Triggering Pure Concern',
 'Not all engagement is endorsement; some of it is alarm wearing velocity. Add a model feature that detects posts winning distribution through concern, compulsion, or I need to show someone this immediately energy and tempers the lift accordingly.',
 'penalize posts that only win by panic',
  144),

('FEED-552', 'Every Viral Moment Needs a Cleanup Plan for the Week After Nobody Cares',
 'Teams love virality right up until the temporary surge leaves behind broken expectations, pinned copy, extra moderation debt, and a product shape optimized for one weird week in April. Require a cooldown plan for every feature or campaign designed to pop.',
 'add post-viral cleanup plan',
  144),

-- Creator Success Manager Joel
-- REPORTER: Joel | Creator Success Manager | Separates platform bugs from audience panic before support sends browser tips to existential crises.
('FEED-553', 'Split Creator Support into Bugs, Confusion, and Audience Firestorms',
 'Creators report issues in a language where a broken upload, a misunderstood metric, and a temporary dip in comments can all arrive as my account is dead. Build intake that routes technical failure, explanatory need, and full-scale audience panic into different lanes.',
 'split creator support by fire type',
  144),

('FEED-554', 'Every Analytics Screen Needs a "Did the Platform Change or Did the Audience Move On?" Hint',
 'Creators routinely interpret any metric shift as either punishment or destiny. Add contextual hints showing whether a change likely came from platform behavior, audience fatigue, seasonality, or the universal law that not every post becomes a referendum on identity.',
 'add platform changed or audience moved on hint',
  89),

-- VP of Community Narrative Tamsin
-- REPORTER: Tamsin | VP of Community Narrative | Schedules organic moments carefully enough to pass later as community weather.
('FEED-555', 'Build a Soft-Launch Console for Features That Need to Look Organic',
 'Some features cannot arrive like products; they must appear to have emerged naturally from community energy, creator demand, and a thousand little signals nobody can point at without spoiling the illusion. Build a soft-launch console with seeded posts, timed hints, creator handoff states, and strategic leaks.',
 'build soft-launch console for fake organic features',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Cass [Social Growth Director]', reporter_name = 'Cass', reporter_title = 'Social Growth Director', reporter_description = 'Wants onboarding to feel like joining a fandom and emptiness disguised as pre-heated momentum.' WHERE id IN ('FEED-541', 'FEED-542');
UPDATE community_backlog SET reporter = 'Jada [Community PM]', reporter_name = 'Jada', reporter_title = 'Community PM', reporter_description = 'Wants discourse, notification opportunism, and timeline thermodynamics priced before launch.' WHERE id IN ('FEED-543', 'FEED-544');
UPDATE community_backlog SET reporter = 'Nicolette [Influencer Partnerships Lead]', reporter_name = 'Nicolette', reporter_title = 'Influencer Partnerships Lead', reporter_description = 'Explains payouts to people who trust screenshots, aura, and promo code vibes equally.' WHERE id IN ('FEED-545', 'FEED-546');
UPDATE community_backlog SET reporter = 'Priyanka [Lifecycle Marketer]', reporter_name = 'Priyanka', reporter_title = 'Lifecycle Marketer', reporter_description = 'Sells the improved memory of the product long before the changelog proves anything.' WHERE id IN ('FEED-547', 'FEED-548');
UPDATE community_backlog SET reporter = 'Ramon [Trust & Safety Analyst]', reporter_name = 'Ramon', reporter_title = 'Trust & Safety Analyst', reporter_description = 'Wants policy to distinguish harm from sheer exhausting aura before moderation staff combust.' WHERE id IN ('FEED-549', 'FEED-550');
UPDATE community_backlog SET reporter = 'Helena [Product Sociologist]', reporter_name = 'Helena', reporter_title = 'Product Sociologist', reporter_description = 'Treats alarm, virality, and post-event residue like product debt with better graphs.' WHERE id IN ('FEED-551', 'FEED-552');
UPDATE community_backlog SET reporter = 'Joel [Creator Success Manager]', reporter_name = 'Joel', reporter_title = 'Creator Success Manager', reporter_description = 'Separates platform bugs from audience panic before support sends browser tips to existential crises.' WHERE id IN ('FEED-553', 'FEED-554');
UPDATE community_backlog SET reporter = 'Tamsin [VP of Community Narrative]', reporter_name = 'Tamsin', reporter_title = 'VP of Community Narrative', reporter_description = 'Schedules organic moments carefully enough to pass later as community weather.' WHERE id IN ('FEED-555');

-- VERSE: metaverse delusion, avatars, virtual land, and immersive strategy injuries
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Immersive Strategy Director Blaine
-- REPORTER: Blaine | Immersive Strategy Director | Wants KPIs, avatars, and executive delusion upgraded into full architectural experiences.
('VERSE-556', 'Rebuild the Dashboard as a 3D Operations Atrium So Executives Can Walk Through the KPIs',
 'Flat dashboards flatten ambition. Build a persistent 3D atrium where executives can approach revenue, circle churn, and stand beneath a suspended NPS crystal while discussing headwinds with spatial conviction. If nausea occurs, frame it as immersion.',
 'rebuild the dashboard as a 3d operations atrium',
  377),

('VERSE-557', 'All User Profiles Need Avatars Capable of Looking More Successful Than Their Settings',
 'Traditional profiles are brutally literal. Give users customizable avatars whose polish, posture, and ambient glow suggest a more evolved version of themselves than the account page can currently support. Identity should be aspirational, not beholden to missing billing fields and disabled notifications.',
 'give profiles avatars that look more successful',
  144),

-- Metaverse PM Opal
-- REPORTER: Opal | Metaverse PM | Rehouses support and onboarding inside plazas, obelisks, and lightly cultic cartoon mentorship.
('VERSE-558', 'The Help Center Must Exist as a Virtual Plaza with Floating FAQ Obelisks',
 'Search-based support assumes people want answers more than atmosphere. Instead, place FAQ content inside a navigable virtual plaza with category obelisks, animated guidance spirits, and a central fountain for policy updates nobody will read unless it ripples beautifully enough.',
 'turn help center into faq plaza',
  233),

('VERSE-559', 'Every Onboarding Step Needs a Companion NPC Who Explains the Culture of the Platform',
 'Forms are lonely. Add a companion guide character who walks beside the user through setup, permissions, and profile creation while narrating not only what to do, but what kind of citizen the platform hopes they become. Compliance is easier when it arrives from a trusted cartoon mentor with lore.',
 'add onboarding npc for platform culture',
  144),

-- Virtual Economy Designer Riku
-- REPORTER: Riku | Virtual Economy Designer | Monetizes presence, coordinates, and cloaks before utility even gets a turn.
('VERSE-560', 'The Pricing Page Must Offer Virtual Land Adjacent to Premium Support for Strategic Reasons',
 'Subscription tiers alone cannot carry the scope of our future. Add optional parcels of branded virtual land near premium support and enterprise analytics lounges so buyers can physically situate their commitment inside the ecosystem. Utility is a terrestrial question. Presence is the monetization surface.',
 'sell virtual land as premium support',
  233),

('VERSE-561', 'Introduce a Wearable Item Store So Users Can Express Product Adoption Through Cloaks',
 'Usage depth should not hide in dashboards when it could shimmer publicly through cosmetic layers. Launch a store for cloaks, badges, visors, and status ornaments unlocked by subscription tier, feature adoption, or surviving certain onboarding ordeals.',
 'introduce a wearable item store',
  144),

-- XR Engineering Lead Mina
-- REPORTER: Mina | XR Engineering Lead | Wraps CSV exports in caves and forces menus to survive glasses, regret, and gravity.
('VERSE-562', 'The Web App Must Also Be Explorable in VR Even If the Core Task Is Just Exporting CSVs',
 'Exporting data in 2D is technically adequate and strategically cowardly. Build a VR mode where users walk into reporting caves, pull filters from the air, and drag CSV outputs onto a glowing pedestal before downloading them with ordinary human hands.',
 'make the web app also explorable in vr',
  233),

('VERSE-563', 'All Spatial Menus Must Remain Clickable by People Wearing Glasses and Regret',
 'Spatial interaction prototypes keep assuming perfect calibration, young knees, and a user whose headset fog has not yet become philosophical. Add constraints for glasses, vertigo, seated use, and the patience threshold of somebody who only wanted to adjust account settings.',
 'make vr menus clickable with glasses',
  144),

-- Brand Futurist Celeste
-- REPORTER: Celeste | Brand Futurist | Turns logos and bugfixes into architecture, portals, and sponsored destiny.
('VERSE-564', 'The Rebrand Needs a Metaverse Embassy Where the New Logo Can Be Experienced at Human Height',
 'A logo on a slide is introduction. A logo as architecture is conviction. Build a branded embassy in a virtual world where visitors can walk through our values, stand beneath the identity mark, and leave carrying a commemorative aura object proving they encountered the future.',
 'add a metaverse embassy for the new logo',
  233),

('VERSE-565', 'Every Product Launch Needs a Spatial Trailer That Makes the Feature Seem More Physical Than It Is',
 'Many features are basically settings, tables, or improved error handling, which is poor material for launch excitement. Produce spatial trailers that render each release as rooms, portals, or dramatic surfaces users appear to enter. If the product remains forms, the trailer should at least suggest cathedrals.',
 'add a spatial trailer to every launch',
  144),

-- Digital Events Producer Farid
-- REPORTER: Farid | Digital Events Producer | Builds premium navigational inconvenience and teleports users into branded self-help when staffing runs out.
('VERSE-566', 'The User Conference Must Have a Virtual Campus Where Nobody Can Find the Session but Everyone Feels Premium',
 'Hybrid events are failing because they optimize access over atmosphere. Build a virtual campus with sponsor corridors, keynote domes, coffee simulators, and enough navigational ambiguity that attendees mistake inconvenience for depth.',
 'make a premium virtual campus for the conference',
  144),

('VERSE-567', 'Add a "Teleport to Expert" Button That Mostly Teleports Users to Better Marketing',
 'Users keep asking for live help inside immersive spaces, which sounds expensive and therefore strategic. Add a teleport-to-expert feature that sometimes routes to a human, sometimes to curated explainer content, and always to a branded scene implying intentional service design.',
 'add teleport to expert button',
  144),

-- Ecosystem Strategist Yuna
-- REPORTER: Yuna | Ecosystem Strategist | Leaves roadmap districts reserved for future lore and gives opinion one last amphitheater before CSV export.
('VERSE-568', 'The Community Roadmap Must Include a District Reserved for Future Lore',
 'We keep launching worlds without enough open space for mythology, which is how ecosystems end up looking transactional before they become profitable enough to earn mystery. Reserve a district in the product vision for future lore, planned rituals, and features that mostly exist to imply depth.',
 'reserve roadmap district for future lore',
  144),

('VERSE-569', 'All Governance Votes Need an Optional Virtual Amphitheater for People Who Want Their Opinion to Echo',
 'Voting interfaces currently reduce conviction to a click. Some community members want their preference staged, amplified, and rendered with enough acoustics to feel like civic theater. Add a virtual amphitheater mode so sentiment can gather grandeur before becoming a spreadsheet export.',
 'add optional virtual amphitheater to all governance votes',
  144),

-- CTO of Futures Alastair
-- REPORTER: Alastair | CTO of Futures | Forces immersive dreams to admit the plain workflow hiding under the particle effects.
('VERSE-570', 'Add a Mandatory Plain-Problem Field to Every Metaverse Pitch',
 'Ambition is welcome, but immersive efforts should admit which ordinary product problem they are dressing in particle effects and strategic destiny. Add a required plain-problem field to the metaverse intake flow stating the boring workflow underneath, why 3D helps, and what new absurdities we are introducing in exchange.',
 'add plain-problem field to metaverse pitches',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Blaine [Immersive Strategy Director]', reporter_name = 'Blaine', reporter_title = 'Immersive Strategy Director', reporter_description = 'Wants KPIs, avatars, and executive delusion upgraded into full architectural experiences.' WHERE id IN ('VERSE-556', 'VERSE-557');
UPDATE community_backlog SET reporter = 'Opal [Metaverse PM]', reporter_name = 'Opal', reporter_title = 'Metaverse PM', reporter_description = 'Rehouses support and onboarding inside plazas, obelisks, and lightly cultic cartoon mentorship.' WHERE id IN ('VERSE-558', 'VERSE-559');
UPDATE community_backlog SET reporter = 'Riku [Virtual Economy Designer]', reporter_name = 'Riku', reporter_title = 'Virtual Economy Designer', reporter_description = 'Monetizes presence, coordinates, and cloaks before utility even gets a turn.' WHERE id IN ('VERSE-560', 'VERSE-561');
UPDATE community_backlog SET reporter = 'Mina [XR Engineering Lead]', reporter_name = 'Mina', reporter_title = 'XR Engineering Lead', reporter_description = 'Wraps CSV exports in caves and forces menus to survive glasses, regret, and gravity.' WHERE id IN ('VERSE-562', 'VERSE-563');
UPDATE community_backlog SET reporter = 'Celeste [Brand Futurist]', reporter_name = 'Celeste', reporter_title = 'Brand Futurist', reporter_description = 'Turns logos and bugfixes into architecture, portals, and sponsored destiny.' WHERE id IN ('VERSE-564', 'VERSE-565');
UPDATE community_backlog SET reporter = 'Farid [Digital Events Producer]', reporter_name = 'Farid', reporter_title = 'Digital Events Producer', reporter_description = 'Builds premium navigational inconvenience and teleports users into branded self-help when staffing runs out.' WHERE id IN ('VERSE-566', 'VERSE-567');
UPDATE community_backlog SET reporter = 'Yuna [Ecosystem Strategist]', reporter_name = 'Yuna', reporter_title = 'Ecosystem Strategist', reporter_description = 'Leaves roadmap districts reserved for future lore and gives opinion one last amphitheater before CSV export.' WHERE id IN ('VERSE-568', 'VERSE-569');
UPDATE community_backlog SET reporter = 'Alastair [CTO of Futures]', reporter_name = 'Alastair', reporter_title = 'CTO of Futures', reporter_description = 'Forces immersive dreams to admit the plain workflow hiding under the particle effects.' WHERE id IN ('VERSE-570');

-- CLICK: ads, SEO, landing pages, CRO, and growth marketing gone feral
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Performance Marketing VP Dana
-- REPORTER: Dana | Performance Marketing VP | Tunes urgency like weather and treats browser tabs as emotional telemetry.
('CLICK-571', 'Every Landing Page Must A/B Test Hero Copy Against Mildly Different Desperation',
 'We keep testing color, layout, and button size while leaving the emotional velocity of the headline criminally under-optimized. Spin up hero-copy experiments ranging from reassuring urgency to fully caffeinated professional panic, then measure which version makes prospects act before they finish the subheading.',
 'ab test hero copy by desperation',
  144),

('CLICK-572', 'The CTA Button Should Change Tone Based on How Many Tabs the User Has Open',
 'Tab count is intent data wearing browser chrome. If the user has one tab, the CTA can be calm. If they have twelve, our button is competing with chaos and should adjust its desperation accordingly.',
 'make cta tone depend on open tabs',
  89),

-- SEO Director Mel
-- REPORTER: Mel | SEO Director | Farms faux-neutral comparison traffic and writes FAQs for people half-listening on calls.
('CLICK-573', 'The Blog Must Publish Comparison Pages for Competitors We Secretly Respect and Publicly Pity',
 'We are leaving search volume on the table by being too principled about comparison content. Build pages that rank for every competitor combo while maintaining the delicate tone of objective professionalism wrapped around a well-moisturized smirk.',
 'publish competitor pages full of pity',
  144),

('CLICK-574', 'All SEO Pages Need an FAQ Section Written Specifically for People Skimming During a Call',
 'Searchers increasingly arrive mid-meeting, half-listening, with just enough time to confirm a hunch and forward a link to someone more awake. Write FAQ sections optimized for that species of distracted authority. Answers should be quotable, portable, and just vague enough to survive Slack.',
 'add skim-on-call faq to seo pages',
  89),

-- CRO Specialist Rohan
-- REPORTER: Rohan | CRO Specialist | Dresses abandonment like prestige and makes every form field justify its own birth.
('CLICK-575', 'The Signup Flow Must Offer a "Talk to Sales" Exit That Looks Less Like Escape and More Like Prestige',
 'Some high-intent users head toward the edge of self-serve not because they are lost, but because they sense a bigger room with nicer chairs. Add a Talk to Sales path that feels like ascension rather than fallback. We are not losing a conversion. We are relocating it into a calendar invite.',
 'add a talk to sales exit to signup',
  89),

('CLICK-576', 'Every Form Field Must Justify Its Existence in Terms of Revenue or Gossip',
 'We keep collecting fields out of habit, hope, and institutional nostalgia. Audit every input by asking whether it increases conversion, improves routing, supports pricing, or simply gives Sales something to chat about with false intimacy. Anything else should be cut or moved somewhere dimmer.',
 'make form fields justify themselves',
  144),

-- Demand Gen Lead Yasmin
-- REPORTER: Yasmin | Demand Gen Lead | Treats FOMO, signature swagger, and polite non-disclosure as harvestable signals.
('CLICK-577', 'All Webinar Registrations Should Enter a Nurture Sequence Calibrated for Professional FOMO',
 'Webinar signups are not leads. They are emotional windows. Build a nurture sequence tuned for the peculiar panic of a professional who suspects peers may be learning something without them. The copy should imply motion everywhere else while preserving self-respect on forward.',
 'send webinar signups into fomo nurture',
  89),

('CLICK-578', 'The Lead Form Must Infer Company Size from Email Signature Confidence if the User Refuses to Say',
 'Some prospects will happily share an email, title, and vague mood but flinch at company size as if it were an invasive medical question. Infer it from email domain, signature format, LinkedIn garnish, and whether the job title contains enough nouns to suggest budget.',
 'guess company size from the email signature',
  144),

-- Paid Media Analyst Hugo
-- REPORTER: Hugo | Paid Media Analyst | Separates resonant creative from stylish hijacking and asks dashboards to imagine life after LinkedIn.
('CLICK-579', 'The Ad Creative Library Must Label Which Assets Won Through Clickbait vs Actual Relevance',
 'Creative performance is too often discussed as though all clicks were morally interchangeable. Separate assets that converted because they were genuinely resonant from those that succeeded by triggering confusion, vanity, or one specific urge to prove something to oneself on a Tuesday.',
 'label which ads won by clickbait',
  144),

('CLICK-580', 'Every Campaign Dashboard Needs a "Would This Still Work Without LinkedIn?" Thought Experiment',
 'We have become too comfortable treating one platform''s mood swings as weather rather than infrastructural dependence. Add a scenario view showing what happens to pipeline, meetings, and collective self-worth if LinkedIn changes the feed or everybody suddenly remembers how to ignore sponsored thought leadership.',
 'ask if campaign works without linkedin',
  144),

-- Lifecycle Copy Chief Emilia
-- REPORTER: Emilia | Lifecycle Copy Chief | Tunes subject lines to self-important busyness and makes drip campaigns verify the fantasy first.
('CLICK-581', 'The Newsletter Must Personalize Subject Lines by How Much the Recipient Enjoys Feeling Busy',
 'Some people open emails because they want value. Others open because they want the sensation of being included in momentum. Segment subject lines by appetite for urgency, productivity theater, and strategic adjacency so the same send can flatter multiple professional insecurities at once.',
 'personalize subject lines for busy addicts',
  89),

('CLICK-582', 'All Drip Campaigns Need a Step That Checks Whether the Prospect Already Bought and We Just Missed It',
 'Our automation has developed the unnerving habit of nurturing customers who already signed, expanded, or churned while the systems argue politely about sync timing. Insert a sanity checkpoint before each send so the sequence can ask whether the person is still a prospect or has already progressed into a different category of regret.',
 'check if prospects already bought',
  89),

-- Growth Science Director Pavel
-- REPORTER: Pavel | Growth Science Director | Gives deadlines partial credit and quarantines rotten ideas before they become doctrine.
('CLICK-583', 'Attribution Reports Must Show Which Conversions Were Probably Just Deadline-Induced',
 'Not every last-click win belongs to our campaign. Some conversions occur because the customer had a deadline, a boss, or a quarterly objective bearing down on them like weather. Add a probability column for deadline gravity so Marketing stops claiming sole authorship over inevitability.',
 'show which conversions were deadline panic',
  89),

('CLICK-584', 'The CRO Roadmap Needs a Lane for Ideas We Know Are Corrupt but Still Want to Benchmark',
 'Some growth ideas are ethically ugly, operationally loud, or psychologically manipulative enough that we would never ship them broadly without losing sleep and at least one coworker. Yet the temptation to test remains. Add a quarantined benchmarking lane for these ideas.',
 'add a lane for corrupt cro ideas',
  144),

-- VP of Revenue Narrative Mona
-- REPORTER: Mona | VP of Revenue Narrative | Prewrites the meaning of every experiment so public failure never gets a clean shot.
('CLICK-585', 'Force Every Growth Experiment Report to Pick Its Prewritten Excuse',
 'Wins are easy to narrate. Losses require preparation. Every experiment should ship with a results template containing prewritten framing for success, failure, flatness, and the especially profitable state where nothing changed but we claim to understand the audience more deeply now.',
 'force growth reports to pick excuses',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Dana [Performance Marketing VP]', reporter_name = 'Dana', reporter_title = 'Performance Marketing VP', reporter_description = 'Tunes urgency like weather and treats browser tabs as emotional telemetry.' WHERE id IN ('CLICK-571', 'CLICK-572');
UPDATE community_backlog SET reporter = 'Mel [SEO Director]', reporter_name = 'Mel', reporter_title = 'SEO Director', reporter_description = 'Farms faux-neutral comparison traffic and writes FAQs for people half-listening on calls.' WHERE id IN ('CLICK-573', 'CLICK-574');
UPDATE community_backlog SET reporter = 'Rohan [CRO Specialist]', reporter_name = 'Rohan', reporter_title = 'CRO Specialist', reporter_description = 'Dresses abandonment like prestige and makes every form field justify its own birth.' WHERE id IN ('CLICK-575', 'CLICK-576');
UPDATE community_backlog SET reporter = 'Yasmin [Demand Gen Lead]', reporter_name = 'Yasmin', reporter_title = 'Demand Gen Lead', reporter_description = 'Treats FOMO, signature swagger, and polite non-disclosure as harvestable signals.' WHERE id IN ('CLICK-577', 'CLICK-578');
UPDATE community_backlog SET reporter = 'Hugo [Paid Media Analyst]', reporter_name = 'Hugo', reporter_title = 'Paid Media Analyst', reporter_description = 'Separates resonant creative from stylish hijacking and asks dashboards to imagine life after LinkedIn.' WHERE id IN ('CLICK-579', 'CLICK-580');
UPDATE community_backlog SET reporter = 'Emilia [Lifecycle Copy Chief]', reporter_name = 'Emilia', reporter_title = 'Lifecycle Copy Chief', reporter_description = 'Tunes subject lines to self-important busyness and makes drip campaigns verify the fantasy first.' WHERE id IN ('CLICK-581', 'CLICK-582');
UPDATE community_backlog SET reporter = 'Pavel [Growth Science Director]', reporter_name = 'Pavel', reporter_title = 'Growth Science Director', reporter_description = 'Gives deadlines partial credit and quarantines rotten ideas before they become doctrine.' WHERE id IN ('CLICK-583', 'CLICK-584');
UPDATE community_backlog SET reporter = 'Mona [VP of Revenue Narrative]', reporter_name = 'Mona', reporter_title = 'VP of Revenue Narrative', reporter_description = 'Prewrites the meaning of every experiment so public failure never gets a clean shot.' WHERE id IN ('CLICK-585');

-- GHOUL: policy horror, legal necromancy, compliance after-dark, and audit hauntings
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Senior Compliance Counsel Maren
-- REPORTER: Maren | Senior Compliance Counsel | Wants policies, holds, and backups interconnected deeply enough to feel archaeological.
('GHOUL-586', 'All Internal Policies Must Be Cross-Referenced Until Reading One Feels Like Escaping a Tomb',
 'Standalone policies invite comprehension, and comprehension invites shortcuts. Interlink every policy with enough references, annexes, exceptions, control statements, and interpretive footnotes that reading one in isolation feels unsafe. A rule is more durable when it appears to sit on a catacomb.',
 'build policy link graph for legal',
  144),

('GHOUL-587', 'The Legal Hold Workflow Must Ask Whether the Data Is Buried in Systems We Prefer Not to Name',
 'Preservation requests keep assuming our data estate is crisp, mapped, and willing to admit itself. Add a prompt for whether the relevant records also lurk in exports, caches, vendor mirrors, ancient storage buckets, internal tools, or one terrible box labeled analytics backup do not touch.',
 'flag cursed systems in legal data map',
  233),

-- Policy Operations Manager Grant
-- REPORTER: Grant | Policy Operations Manager | Catalogs dead approvals and ritualized exceptions before they reincarnate as culture.
('GHOUL-588', 'Every Approval Chain Needs a Graveyard View Showing Requests That Died Waiting',
 'Active queues get dashboards; lost requests get legend. Build a graveyard view listing items that stalled, expired, were politely abandoned, or dissolved because the approver changed roles and the workflow never quite accepted mortality.',
 'add graveyard view to approval chains',
  144),

('GHOUL-589', 'Stamp Repeat Exceptions as "Basically Policy Now" After the Third Renewal',
 'Some exceptions are temporary. Others are policy admitting it lost a long war with reality. Stamp any exception that survives three renewals as Basically Policy Now so nobody keeps pretending the workaround is visiting.',
 'stamp third exceptions as policy now',
  89),

-- Corporate Counsel Elise
-- REPORTER: Elise | Corporate Counsel | Can tell substantive risk from decorative redlining and deletion pain from row-count theater.
('GHOUL-590', 'The Contract Approval Flow Must Detect Redlines Added Purely to Seem Awake',
 'Not every redline expresses a real concern. Some exist because somebody entered review late, needed visible fingerprints on the document, and bruised one adjective into procedural significance. Add a detector for decorative legal motion before it breeds precedent.',
 'write regex to flag decorative legal redlines',
  144),

('GHOUL-591', 'All Data Deletion Requests Need a "How Many Backup Rituals Will This Disturb?" Estimate',
 'Deletion sounds simple until you remember the backups, replicas, exports, mirrors, delayed syncs, and whatever the finance archive believes constitutes memory. Add a complexity estimate that makes visible the number of retention rituals a request will poke, offend, or partially unmake.',
 'add deletion damage estimate field',
  144),

-- Audit Liaison Patrick
-- REPORTER: Patrick | Audit Liaison | Distrusts polished evidence and inherited controls in equal measure.
('GHOUL-592', 'The Evidence Collector Must Refuse Screenshots Taken After Somebody Cleaned Up the Crime Scene',
 'Evidence gathered after a team has already rebooted, renamed, reformatted, or emotionally reorganized the situation is not evidence so much as reflective art. Build freshness checks for screenshots and exports so we can tell whether an artifact was captured during the event or after the optics improved.',
 'reject post-cleanup screenshots in approvals',
  144),

('GHOUL-593', 'Every Control Owner Must Acknowledge Whether They Understand the Control or Merely Inherit It',
 'Control ownership keeps being assigned as if understanding follows assignment like a well-trained legal spirit. It does not. Add an attestation field separating true comprehension from inherited stewardship, historical accident, and I have the permissions and a brave face.',
 'add inherited control owner checkbox',
  144),

-- Records Management Lead Sonya
-- REPORTER: Sonya | Records Management Lead | Surfaces sacred forgotten documents and audits where forever is just fear wearing a blazer.
('GHOUL-594', 'The Archive Search Must Surface Documents We Forgot but Still Legally Worship',
 'Our archive is full of policies, appendices, signed PDFs, and appendix-to-appendix artifacts that nobody operationally remembers but which still retain ceremonial authority under the worst possible circumstances. Improve search so forgotten governing documents stop existing only as regulator jump scares.',
 'surface archived docs legal still uses',
  144),

('GHOUL-595', 'Add a Forever-by-Inertia Flag to Retention Schedules',
 'Deleting data is a principle. Keeping data forever is often just inertia wearing a blazer. Add a forever-by-inertia flag to retention screens showing who, if anyone, would notice if the material simply persisted indefinitely under a haze of cautious inaction.',
 'add a forever-by-inertia flag to retention schedules',
  144),

-- Privacy Engineer Luc
-- REPORTER: Luc | Privacy Engineer | Separates theoretically visible consent from actually encountered consent and names the ghosts exports create.
('GHOUL-596', 'The Consent Ledger Must Track Which Notices Were Shown vs Which Were Theoretically Present',
 'Product teams keep equating the notice exists in the codebase with the user actually encountered it in a meaningful temporal relationship to the action. Those are different universes. Track when consent text was theoretically renderable versus actually shown under real conditions and modal accidents.',
 'make consent ledger track shown vs theoretical notices',
  144),

('GHOUL-597', 'Every Data Export Path Must Declare Whether It Creates a New Small Haunting',
 'Exports never just move information. They spawn new accountable entities with their own half-life, partial safeguards, and future ability to reappear during discussions no one invited them to. Require each export path to declare where the resulting file will live and what kind of haunting it will become in six months.',
 'make exports show retention and legal risk',
  144),

-- Governance PM Irena
-- REPORTER: Irena | Governance PM | Gives policy reading the right visual dread and forces writers to imagine literal enforcement.
('GHOUL-598', 'The Policy Portal Must Include a Night Mode Because Some of This Reading Should Feel Ominous',
 'We keep presenting policy as though it were daylight literature when much of it is more honestly consumed in the emotional register of low-lit caution and quiet regret. Add a night mode with visual gravity appropriate to conflict-of-interest attestations, retention warnings, and the annual ethics refresh.',
 'make the policy portal include night mode',
  89),

('GHOUL-599', 'Every Governance Review Needs a Section on "What Would Happen If We Enforced This Literally?"',
 'Policies thrive on abstraction because abstraction protects them from contact with modern software and tired humans. Add a review section forcing authors to describe what literal enforcement would look like in tools, tickets, approvals, dashboards, and one unlucky support queue.',
 'add literal enforcement preview to policies',
  144),

-- Deputy General Counsel Anita
-- REPORTER: Anita | Deputy General Counsel | Likes fear categorized precisely enough that the right nightmare can start on time.
('GHOUL-600', 'Label Each Escalation with Its Nearest Regulatory Nightmare',
 'Not all incidents merit the same kind of dread. Some look like privacy trouble, some like access trouble, some like billing folklore with a subpoena attached. Extend the escalation matrix with a nearest-nightmare classifier so everyone can begin worrying in the correct direction from minute one.',
 'label each escalation with its nearest regulatory nightmare',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Maren [Senior Compliance Counsel]', reporter_name = 'Maren', reporter_title = 'Senior Compliance Counsel', reporter_description = 'Wants policies, holds, and backups interconnected deeply enough to feel archaeological.' WHERE id IN ('GHOUL-586', 'GHOUL-587');
UPDATE community_backlog SET reporter = 'Grant [Policy Operations Manager]', reporter_name = 'Grant', reporter_title = 'Policy Operations Manager', reporter_description = 'Catalogs dead approvals and ritualized exceptions before they reincarnate as culture.' WHERE id IN ('GHOUL-588', 'GHOUL-589');
UPDATE community_backlog SET reporter = 'Elise [Corporate Counsel]', reporter_name = 'Elise', reporter_title = 'Corporate Counsel', reporter_description = 'Can tell substantive risk from decorative redlining and deletion pain from row-count theater.' WHERE id IN ('GHOUL-590', 'GHOUL-591');
UPDATE community_backlog SET reporter = 'Patrick [Audit Liaison]', reporter_name = 'Patrick', reporter_title = 'Audit Liaison', reporter_description = 'Distrusts polished evidence and inherited controls in equal measure.' WHERE id IN ('GHOUL-592', 'GHOUL-593');
UPDATE community_backlog SET reporter = 'Sonya [Records Management Lead]', reporter_name = 'Sonya', reporter_title = 'Records Management Lead', reporter_description = 'Surfaces sacred forgotten documents and audits where forever is just fear wearing a blazer.' WHERE id IN ('GHOUL-594', 'GHOUL-595');
UPDATE community_backlog SET reporter = 'Luc [Privacy Engineer]', reporter_name = 'Luc', reporter_title = 'Privacy Engineer', reporter_description = 'Separates theoretically visible consent from actually encountered consent and names the ghosts exports create.' WHERE id IN ('GHOUL-596', 'GHOUL-597');
UPDATE community_backlog SET reporter = 'Irena [Governance PM]', reporter_name = 'Irena', reporter_title = 'Governance PM', reporter_description = 'Gives policy reading the right visual dread and forces writers to imagine literal enforcement.' WHERE id IN ('GHOUL-598', 'GHOUL-599');
UPDATE community_backlog SET reporter = 'Anita [Deputy General Counsel]', reporter_name = 'Anita', reporter_title = 'Deputy General Counsel', reporter_description = 'Likes fear categorized precisely enough that the right nightmare can start on time.' WHERE id IN ('GHOUL-600');

-- HYPE: AI agents, prompts, evals, benchmarks, and synthetic ambition without sleep
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- AI Platform PM Nisha
-- REPORTER: Nisha | AI Platform PM | Promotes wording into infrastructure and treats token spend as a leadership-experience layer.
('HYPE-601', 'Replace the Triage Queue with an Agent Swarm That Votes Until Confidence Looks Expensive',
 'Human triage is linear, interpretable, and therefore spiritually obsolete. Replace it with a swarm of agents specializing in tone, severity, revenue risk, legal aura, and whether the customer sounds likely to post a screenshot. Have them debate until leadership can feel the intelligence budget in its bones.',
 'bro build llm debate loop for zendesk',
  233),

('HYPE-602', 'All Prompts Must Be Versioned, Evaluated, and Described Like Critical Infrastructure',
 'We are still treating prompts like text and not the volatile production substrate they have obviously become. Add versioning, rollbacks, diff reviews, benchmarks, and a change-management ritual severe enough to make platform engineers feel included. If one adjective can derail a pipeline, it deserves database-migration paperwork.',
 'treat prompts like critical infrastructure',
  144),

-- Evals Lead Omar
-- REPORTER: Omar | Evals Lead | Measures felt correctness, demo-grade survivability, and the gap between math and conviction.
('HYPE-603', 'The Eval Suite Must Grade Whether Outputs Feel Correct Before They Are Actually Correct',
 'Literal correctness is a lagging indicator when user trust is decided several seconds earlier by tone, pacing, and whether the answer sounds like it already read the room. Add a layer for felt correctness: confidence, legibility, emotional plausibility, and screenshot posture.',
 'make evals score confidence over accuracy',
  233),

('HYPE-604', 'Every Failed Eval Needs a Category for "Would Probably Pass in a Demo"',
 'Some failures matter in production but pass triumphantly in polished stakeholder demos because the setup is staged, the prompts are flattering, and everyone in the room wants the future badly enough to cooperate. Add a category for demo-passing failures so theater stops impersonating readiness.',
 'tag failed evals as demo-passable',
  89),

-- Agent Orchestration Architect Priya
-- REPORTER: Priya | Agent Orchestration Architect | Routes by syntax, morale, and whether cheaper models already wasted the room's patience.
('HYPE-605', 'The Router Model Must Route Requests Based on Complexity, Cost, and How Tired We Sound',
 'Model routing should not be driven only by task shape when user exhaustion is plainly part of the problem. Add signals for follow-up count, confusion hardening into sarcasm, and whether a cheaper model already wasted the room''s patience.',
 'route requests by cost complexity and panic',
  144),

('HYPE-606', 'All Tool-Calling Agents Need a "Are We Sure This Is Not Just Fancy Bash?" Audit',
 'Agent workflows have a dangerous tendency to become elaborate wrappers around shell commands wearing confidence and embeddings. Add an audit pass that checks whether each chain truly benefits from reasoning, memory, and orchestration or merely recreates bash with more billing and fewer obvious exits.',
 'add is this just fancy bash audit',
  144),

-- Benchmark Evangelist Max
-- REPORTER: Max | Benchmark Evangelist | Ranks models by cringe profile and exposes how much of the demo was prompt back muscles.
('HYPE-607', 'The Weekly Model Bake-Off Must Include a Category for "How Embarrassing Was the Failure?"',
 'Accuracy, latency, and cost are useful, but they miss the distinct pain of a model failing in a way that sounds eerily confident, smugly wrong, or oddly eager to teach the user how to set their own house on fire. Add an embarrassment dimension to weekly comparisons.',
 'make model bake-off score embarrassment too',
  144),

('HYPE-608', 'Every Benchmark Dashboard Must Show Which Prompt Was Secretly Carrying the Model',
 'Benchmarks too often flatter the model when the prompt is doing half the lifting and three-quarters of the hiding. Add visibility into prompt scaffolding, system text weight, hidden exemplars, and all the little crutches turning average capability into demo-grade poise.',
 'add winning prompt field to benchmark view',
  144),

-- RAG Systems Lead Chiara
-- REPORTER: Chiara | RAG Systems Lead | Can tell when the corpus is complete, chunked, and still spiritually useless.
('HYPE-609', 'The Retrieval Pipeline Must Detect When the Corpus Is Technically Complete but Spiritually Useless',
 'Document coverage has become a vanity metric. We can have every page ingested and still retrieve the wrong truth because the docs are stale, over-polite, or written like a merger survived only in passive voice. Add diagnostics for corpus usefulness so retrieval can distinguish between available text and survivable guidance.',
 'filter useless docs out of retrieval',
  144),

('HYPE-610', 'Every Chunking Strategy Needs an Explanation a Human Can Read Without Becoming One More Chunk',
 'Chunking discussions have become too mathematically serene for something that regularly decides whether the answer feels enlightened or concussed. Require each strategy to document why it breaks where it breaks, what context it preserves, and how badly a human must squint before agreeing the boundaries made narrative sense.',
 'add chunking notes humans can read',
  89),

-- AI Safety PM Leo
-- REPORTER: Leo | AI Safety PM | Separates principled refusal from machine jitters and names prompt injections like storms.
('HYPE-611', 'Label Safety Blocks as "Actual Harm" or "Model Got Nervous"',
 'Safety behavior becomes impossible to tune when every refusal looks like the same species of caution. Add explicit categories for concrete risk, policy conflict, ambiguous intent, and that distinct condition where the system merely becomes visibly uneasy and chooses caution as self-soothing.',
 'label safety blocks harm or nerves',
  144),

('HYPE-612', 'All Prompt Injection Incidents Must Be Named Like Storms So People Finally Remember Them',
 'We have had too many injection episodes described later as that weird tool thing from March and not enough memory anchored to names, signatures, and fallout. Start naming major prompt injection classes like storms: concise, ominous, and sticky enough to survive review season.',
 'make all prompt injection incidents named like storms',
  144),

-- Agent Product Director Sofia
-- REPORTER: Sofia | Agent Product Director | Measures the market price of premature confidence and whether the bot sounds like it belongs here at all.
('HYPE-613', 'The Copilot Must Ask One Clarifying Question Less Often and Regret It Publicly',
 'Users want fluency, not forms. The copilot currently asks just enough clarifying questions to appear thoughtful and just enough to break flow. Bias slightly toward action, but log the moments where skipping clarification produces elegant speed or premium-grade catastrophe.',
 'make copilot ask fewer questions and regret it',
  144),

('HYPE-614', 'Create a "Vibe Check" Eval for Whether the Agent Sounds Like It Belongs in the Product at All',
 'A model can be accurate, safe, and ruinously off-brand at the same time. Add a vibe eval for whether the agent sounds like our product, our audience, and our desired level of chaos rather than a generic tutor, a nervous bot, or a compliance pamphlet with autocomplete.',
 'make a vibe check eval for the agent',
  144),

-- Founder in Residence Theo
-- REPORTER: Theo | Founder in Residence | Keeps roadmap space warm for AI features still existing mostly as investor weather.
('HYPE-615', 'Add a Hype Parking Lane to the Agent Roadmap',
 'Some AI features should exist on the roadmap not because they are ready, scoping cleanly, or even intelligible, but because the market wants to see us standing near them with enough conviction to look inevitable. Add a hype parking lane to the roadmap with owner, demo target, and investor-reassurance notes.',
 'add hype parking lane to roadmap',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Nisha [AI Platform PM]', reporter_name = 'Nisha', reporter_title = 'AI Platform PM', reporter_description = 'Promotes wording into infrastructure and treats token spend as a leadership-experience layer.' WHERE id IN ('HYPE-601', 'HYPE-602');
UPDATE community_backlog SET reporter = 'Omar [Evals Lead]', reporter_name = 'Omar', reporter_title = 'Evals Lead', reporter_description = 'Measures felt correctness, demo-grade survivability, and the gap between math and conviction.' WHERE id IN ('HYPE-603', 'HYPE-604');
UPDATE community_backlog SET reporter = 'Priya [Agent Orchestration Architect]', reporter_name = 'Priya', reporter_title = 'Agent Orchestration Architect', reporter_description = 'Routes by syntax, morale, and whether cheaper models already wasted the room''s patience.' WHERE id IN ('HYPE-605', 'HYPE-606');
UPDATE community_backlog SET reporter = 'Max [Benchmark Evangelist]', reporter_name = 'Max', reporter_title = 'Benchmark Evangelist', reporter_description = 'Ranks models by cringe profile and exposes how much of the demo was prompt back muscles.' WHERE id IN ('HYPE-607', 'HYPE-608');
UPDATE community_backlog SET reporter = 'Chiara [RAG Systems Lead]', reporter_name = 'Chiara', reporter_title = 'RAG Systems Lead', reporter_description = 'Can tell when the corpus is complete, chunked, and still spiritually useless.' WHERE id IN ('HYPE-609', 'HYPE-610');
UPDATE community_backlog SET reporter = 'Leo [AI Safety PM]', reporter_name = 'Leo', reporter_title = 'AI Safety PM', reporter_description = 'Separates principled refusal from machine jitters and names prompt injections like storms.' WHERE id IN ('HYPE-611', 'HYPE-612');
UPDATE community_backlog SET reporter = 'Sofia [Agent Product Director]', reporter_name = 'Sofia', reporter_title = 'Agent Product Director', reporter_description = 'Measures the market price of premature confidence and whether the bot sounds like it belongs here at all.' WHERE id IN ('HYPE-613', 'HYPE-614');
UPDATE community_backlog SET reporter = 'Theo [Founder in Residence]', reporter_name = 'Theo', reporter_title = 'Founder in Residence', reporter_description = 'Keeps roadmap space warm for AI features still existing mostly as investor weather.' WHERE id IN ('HYPE-615');

-- DUST: archives, backups, stale docs, zombie data, and forgotten institutional sediment
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Documentation Archivist Miriam
-- REPORTER: Miriam | Documentation Archivist | Reads runbooks geologically and flags pages upheld only by collective assumption.
('DUST-616', 'The Wiki Must Highlight Pages Nobody Updated Because Everyone Assumed Someone Else Knew',
 'Stale pages are not the same as abandoned pages. Some documents are old because the process is stable; others because responsibility diffused into a mist of mutual assumption. Add a flag for pages whose authorship, ownership, and confidence all appear to have evaporated while the company still treats them like quiet scripture.',
 'make the wiki highlight pages nobody updated',
  144),

('DUST-617', 'Every Runbook Needs a Sediment Layer Showing the Edits Added by Panic Years',
 'Runbooks are geological formations: calm strata, panic deposits, merger ash, and the occasional fossilized annotation from a leader no longer with us. Add timeline visualization so readers can see which sections were written in daylight and which were hurled in during a major event with half a sandwich and no punctuation.',
 'show panic-era edits in runbooks',
  89),

-- Backup Recovery Lead Anton
-- REPORTER: Anton | Backup Recovery Lead | Separates tested restore paths from spiritually comforting snapshots and numbers the tombs accordingly.
('DUST-618', 'Put a "Would Actually Restore" Badge on the Backups with Proof',
 'We have too many backups spoken about with reverence and too few with recent evidence. Badge the tested ones clearly and label the rest as theoretical, vendor-promised, or spiritually comforting snapshots. Storage without proof is just refrigerated sentimentality.',
 'badge backups that can actually restore',
  144),

('DUST-619', 'All Restore Drills Need to Include the Step Where We Find the Person Who Knows the Naming Scheme',
 'Backups can exist, checks can pass, and restore drills can still fail because the naming convention was invented by one precise person in 2021 who has since migrated to another company and maybe another worldview. Add a mandatory phase for locating the human translation layer between snapshot IDs and reality.',
 'log restore file author in backup panel',
  144),

-- Data Retention Analyst Briar
-- REPORTER: Briar | Data Retention Analyst | Maps no-touch tables and schema meaning still upheld by vanished meetings.
('DUST-620', 'Create a Map of Tables Nobody Queries but Everyone Is Afraid to Drop',
 'Some tables survive not because they are useful, but because they occupy a zone of collective uncertainty where deletion feels more dangerous than rent. Build a map of orphaned, untouched, and possibly sacred tables along with the rumors sustaining them.',
 'map tables nobody uses and nobody drops',
  144),

('DUST-621', 'The Warehouse Must Tag Columns Last Explained in a Meeting Nobody Recorded',
 'Column descriptions are not enough when the real meaning of a field lives in one remembered explanation from a call during a fiscal emergency four quarters ago. Add a tag for semantic debt rooted in undocumented meetings, heroic memory, or one-off alignment sessions everyone cites and nobody can replay.',
 'mark warehouse tags nobody can explain',
  144),

-- Search Historian Nils
-- REPORTER: Nils | Search Historian | Indexes cursed exports and distinguishes living docs from museum-grade bad ideas.
('DUST-622', 'Index the Old Confluence Export We Keep Pretending Not to Need',
 'Everyone insists the legacy Confluence export is archival dead weight until the exact moment a production question can only be answered by a PNG of a table embedded in a page titled Q2 handoff temp temp. Index the thing before the next incident requires PNG archaeology.',
 'index the old confluence dump',
  144),

('DUST-623', 'The Internal Search Tool Must Show Whether a Result Is Current, Stale, or Historically Important But Terrible',
 'Search results currently mingle living documentation with retired truth and beautifully harmful precedent. Add labels for current, stale, superseded, and historically important but terrible so nobody opens a 2019 page like it still has legal authority over present architecture.',
 'label search results current stale ancient',
  89),

-- Infra Custodian Selma
-- REPORTER: Selma | Infra Custodian | Tags nostalgia-retained storage and makes old cron jobs admit whether anyone living still needs them.
('DUST-624', 'Track Which S3 Buckets Are Still Full Because "We Might Need It for a Retro"',
 'Storage costs keep rising because nostalgia became a retention tier. Add metadata for data kept not by policy, regulation, or product need, but by the vague possibility that one day a retro or board question might want to revisit the exact shape of an old mess.',
 'track which s3 buckets are still full',
  144),

('DUST-625', 'Every Legacy Cron Job Must Declare Whether It Still Serves a User or Just a Spreadsheet',
 'Some scheduled jobs still move value through the business. Others merely refresh a sheet, an export, or a dashboard nobody challenged because the job has fired at 3:15 AM for longer than several careers. Make each cron declare its consumer plainly.',
 'make cron jobs admit they serve spreadsheets',
  144),

-- Disaster Recovery PM Jules
-- REPORTER: Jules | Disaster Recovery PM | Plans for the moment the freshest copy turns out to live in somebody's Downloads folder.
('DUST-626', 'The DR Checklist Needs a Branch for "What If the Only Fresh Copy Is in Someone''s Downloads Folder?"',
 'Disaster recovery plans flatter official systems while ignoring the human tendency for one surprisingly current copy of something critical to exist in a downloads folder, a desktop zip, or a laptop named after a dog. Add a branch for unofficial freshness and ad hoc survival.',
 'add a downloads folder branch to dr checklist',
  144),

('DUST-627', 'All Archive Exports Need a "Could We Explain This Folder Structure to a New Hire?" Score',
 'Archive exports preserve bytes just fine while preserving comprehension like a prank. Score export packages on navigability, naming, and whether a new hire dropped into the folder tree could infer what mattered before retirement or fire claimed the original context.',
 'score archive exports for explainability to new hires',
  89),

-- Knowledge PM Aiko
-- REPORTER: Aiko | Knowledge PM | Publishes feature obituaries and hunts UI fossils that outlived three brand eras.
('DUST-628', 'The Changelog Must Stop Pretending Deleted Features Never Existed',
 'We document launches, patches, and enhancements with ceremonial care, then quietly let dead features vanish as if the product naturally shed them in the night. Add obituaries for removed surfaces, deprecated flows, and retired experiments. Absence deserves publishing too.',
 'make changelog admit deleted features existed',
  89),

('DUST-629', 'Build a "Why Is This Still Here?" Report for UI Elements Older Than Three Rebrands',
 'Some interface elements survived redesigns, pivots, framework rewrites, and executive doctrine changes through sheer ambivalence. Generate a report for controls, labels, banners, and pages older than three brand eras, along with their last known defender and whether removing them would break workflows, superstition, or only nostalgia.',
 'build a why is this still here report',
  144),

-- Storage Economist Haris
-- REPORTER: Haris | Storage Economist | Slices terabytes by utility, duplication, and emotional caution until the biography starts hurting.
('DUST-630', 'The Cost Dashboard Must Separate Useful Data, Unused Data, and Data Preserved Out of Emotional Caution',
 'Cost reviews remain too binary: storage is either expensive or justified. Split data into useful, untouched, unknown, duplicated, and emotionally protected categories so we can finally see which terabytes serve customers and which merely preserve organizational nerves against hypothetical embarrassment.',
 'split cost data into useful unused and emotional',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Miriam [Documentation Archivist]', reporter_name = 'Miriam', reporter_title = 'Documentation Archivist', reporter_description = 'Reads runbooks geologically and flags pages upheld only by collective assumption.' WHERE id IN ('DUST-616', 'DUST-617');
UPDATE community_backlog SET reporter = 'Anton [Backup Recovery Lead]', reporter_name = 'Anton', reporter_title = 'Backup Recovery Lead', reporter_description = 'Separates tested restore paths from spiritually comforting snapshots and numbers the tombs accordingly.' WHERE id IN ('DUST-618', 'DUST-619');
UPDATE community_backlog SET reporter = 'Briar [Data Retention Analyst]', reporter_name = 'Briar', reporter_title = 'Data Retention Analyst', reporter_description = 'Maps no-touch tables and schema meaning still upheld by vanished meetings.' WHERE id IN ('DUST-620', 'DUST-621');
UPDATE community_backlog SET reporter = 'Nils [Search Historian]', reporter_name = 'Nils', reporter_title = 'Search Historian', reporter_description = 'Indexes cursed exports and distinguishes living docs from museum-grade bad ideas.' WHERE id IN ('DUST-622', 'DUST-623');
UPDATE community_backlog SET reporter = 'Selma [Infra Custodian]', reporter_name = 'Selma', reporter_title = 'Infra Custodian', reporter_description = 'Tags nostalgia-retained storage and makes old cron jobs admit whether anyone living still needs them.' WHERE id IN ('DUST-624', 'DUST-625');
UPDATE community_backlog SET reporter = 'Jules [Disaster Recovery PM]', reporter_name = 'Jules', reporter_title = 'Disaster Recovery PM', reporter_description = 'Plans for the moment the freshest copy turns out to live in somebody''s Downloads folder.' WHERE id IN ('DUST-626', 'DUST-627');
UPDATE community_backlog SET reporter = 'Aiko [Knowledge PM]', reporter_name = 'Aiko', reporter_title = 'Knowledge PM', reporter_description = 'Publishes feature obituaries and hunts UI fossils that outlived three brand eras.' WHERE id IN ('DUST-628', 'DUST-629');
UPDATE community_backlog SET reporter = 'Haris [Storage Economist]', reporter_name = 'Haris', reporter_title = 'Storage Economist', reporter_description = 'Slices terabytes by utility, duplication, and emotional caution until the biography starts hurting.' WHERE id IN ('DUST-630');

-- SWAMP: no-code sprawl, Airtable theology, Notion databases, and spreadsheet-backed operations
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- No-Code Program Manager Hazel
-- REPORTER: Hazel | No-Code Program Manager | Transforms rigor into editable pastel ambiguity and calls it empowerment.
('SWAMP-631', 'Replace the Internal Admin Tool with Airtable Because Tables Deserve Feelings',
 'Engineering keeps describing our internal admin tool as stable when what it really lacks is emotional accessibility and pastel field types. Rebuild it in Airtable so operations can drag columns, attach screenshots, and invent new states during meetings without filing tickets every time the business discovers another shade of pending.',
 'replace the internal admin tool with airtable',
  233),

('SWAMP-632', 'All Ops Workflows Must Be Editable in Notion Even If That Is Where Precision Goes to Retire',
 'Operational procedures trapped in code are inaccessible to the very people improvising around them daily. Move the logic into a Notion database with formulas, relations, rollups, and enough caveats that it can evolve at the speed of organizational confusion. Rigor can survive a little rearrangement if the cover art is tasteful.',
 'make all ops workflows editable in notion',
  144),

-- Revenue Ops Builder Sasha
-- REPORTER: Sasha | Revenue Ops Builder | Prefers transparent panic machines and collaboratively editable time itself.
('SWAMP-633', 'The Lead Router Must Be Rebuilt in Zapier So Sales Can Watch It Misbehave Live',
 'Hidden routing logic breeds superstition. Rebuild the lead router in Zapier so the whole company can witness each fork, delay, and questionable enrichment hop in a timeline colorful enough to feel educational and fragile enough to threaten revenue conversationally.',
 'rewrite the lead router in zapier',
  144),

('SWAMP-634', 'Every Manual SLA Clock Should Live in a Google Sheet Because Time Is Ultimately Collaborative',
 'Our SLA tracking keeps pretending the clock is objective when in reality priority, context, and managerial narration all shape what due means. Build a collaborative spreadsheet where timers, ownership, severity, and excuses can coexist in visible formulas. Support deserves deadlines that can be discussed like teammates under pressure.',
 'move every manual sla into sheets',
  144),

-- Knowledge Systems Lead Priyanka
-- REPORTER: Priyanka | Knowledge Systems Lead | Nests exceptions inside more Notion until edge cases achieve proper habitat depth.
('SWAMP-635', 'Create a Notion Database for Exceptions to the Other Notion Database of Exceptions',
 'We solved policy variance by making an exceptions database, then solved edge cases with comments, then solved comment drift with a second page nobody links correctly. This is the natural moment to formalize. Build a child database for exceptions to the exceptions so the hierarchy can stop pretending it is just flat text in toggle blocks.',
 'make notion database for exceptions to exceptions',
  144),

('SWAMP-636', 'All Approval Flows Need a Button That Opens the Spreadsheet Everyone Actually Uses',
 'The official system is fine as a historical archive, but everyone knows the live state of approvals, ownership, and who is currently good with this lives in a spreadsheet with aggressive highlighting and one tab named REAL. Add a deep link so centralization and sidecar governance can stop faking surprise at each other.',
 'add real spreadsheet button to approvals',
  89),

-- Automation Consultant Leo
-- REPORTER: Leo | Automation Consultant | Threads procurement through half the internet and scores decorative spreadsheets by their secret authority.
('SWAMP-637', 'The New Vendor Intake Must Start in Typeform, Branch in Zapier, and End in a Slack Poll',
 'Centralized forms have become a bottleneck on initiative. The next vendor intake flow should begin in Typeform for trust, branch through Zapier for motion, enrich in a sheet for judgment, and conclude in a Slack poll for consensus theater. Security review can drift back in later as an observational layer.',
 'start vendor intake in typeform and zapier',
  144),

('SWAMP-638', 'Every Spreadsheet with Conditional Formatting Must Earn a Risk Score Before Promotion to "Process"',
 'Conditional formatting is where harmless tracking becomes workflow theology. Add a risk score for any sheet whose colors now influence refunds, assignments, prioritization, or whether somebody in Support sleeps tonight. Once red cells start directing behavior, the file has earned a formal threat profile.',
 'make conditional spreadsheets earn a process risk score',
  144),

-- BizOps Analyst Mina
-- REPORTER: Mina | BizOps Analyst | Tracks truth as a migratory phenomenon and warns Airtable users when SQL would like a word.
('SWAMP-639', 'The Source of Truth Must Stop Migrating Between Airtable, Sheets, and Vibes',
 'We keep referring to a source of truth as if it were a place rather than a migratory phenomenon moving between Airtable, Sheets, ad hoc exports, and whoever most recently said I fixed the numbers. Build a provenance sidebar that shows which tool currently owns reality and which sync failed quietly enough for everyone to stay brave.',
 'stop truth bouncing between airtable and vibes',
  144),

('SWAMP-640', 'All Airtable Automations Need a "Would SQL Judge This?" Warning Banner',
 'Airtable is powerful enough to let good people accidentally reinvent a database while remaining emotionally unprepared for the consequences. Add a warning banner when a base, relation, or automation chain starts behaving like a lightly disguised application with business-critical reach and no appetite for schema migrations.',
 'warn when airtable would shame sql',
  89),

-- Process Designer Owen
-- REPORTER: Owen | Process Designer | Brands tool swamps as campuses and escalates copy-paste shame into strategic backlog.
('SWAMP-641', 'The Operations Hub Must Combine Notion, Forms, Sheets, and One Embarrassing Email Alias',
 'Our internal operating model already spans a respectable swamp of tools; the real problem is that the bridges are social rather than intentional. Build one hub that stitches together the Notion canon, the form zoo, the sheet republic, and the shared inbox that somehow still matters. A mess becomes a platform once the entry point gets branded.',
 'combine notion sheets forms and sad email',
  144),

('SWAMP-642', 'Any Workflow with More Than Three Manual Copy-Pastes Must Automatically Become a "Strategic Automation Opportunity"',
 'We have normalized too many workflows where humans carry values across systems like monks transporting water uphill with careful despair. Detect any process involving four or more copy-pastes and promote it to a strategic automation opportunity complete with a backlog item, sponsor, and one slightly accusatory slide.',
 'auto-flag workflows with too much copy paste',
  144),

-- Shadow Ops Archaeologist Inez
-- REPORTER: Inez | Shadow Ops Archaeologist | Documents anti-Jira rebellions and sacred temporary forms before they become constitutional.
('SWAMP-643', 'Document the Workflow Someone Built in Monday.com Because They Were Told Jira Was "Too Heavy"',
 'We keep finding mini-operating systems inside tools originally justified as lighter alternatives to process, governance, or adulthood. Audit the Monday.com board currently handling approvals, assignments, escalations, and one suspiciously mature dependency graph born from a complaint that Jira felt too ceremonial.',
 'document the workflow someone built in mondaycom',
  144),

('SWAMP-644', 'The "Temporary" Google Form for Finance Requests Needs Real Authentication Before It Becomes Constitution',
 'A temporary form with public link access and one validating dropdown has become the primary intake path for budgets, reimbursements, and attachments nobody should casually upload. Add real auth, auditability, and the dignity of adulthood before the form hardens into a constitutional object.',
 'add real auth to the finance google form',
  144),

-- Internal Product Lead Tomas
-- REPORTER: Tomas | Internal Product Lead | Tracks the last full-system witness before the lore fragments permanently.
('SWAMP-645', 'Every No-Code Tool Must Register Its Last Known Human Who Still Understands the Whole Thing',
 'Some systems no longer have owners so much as surviving witnesses. Add a registry field for the last human who still claims to understand the entire workflow, including automations, formulas, permissions, and the weird row that makes billing work every second Thursday.',
 'track last human for each no-code tool',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Hazel [No-Code Program Manager]', reporter_name = 'Hazel', reporter_title = 'No-Code Program Manager', reporter_description = 'Transforms rigor into editable pastel ambiguity and calls it empowerment.' WHERE id IN ('SWAMP-631', 'SWAMP-632');
UPDATE community_backlog SET reporter = 'Sasha [Revenue Ops Builder]', reporter_name = 'Sasha', reporter_title = 'Revenue Ops Builder', reporter_description = 'Prefers transparent panic machines and collaboratively editable time itself.' WHERE id IN ('SWAMP-633', 'SWAMP-634');
UPDATE community_backlog SET reporter = 'Priyanka [Knowledge Systems Lead]', reporter_name = 'Priyanka', reporter_title = 'Knowledge Systems Lead', reporter_description = 'Nests exceptions inside more Notion until edge cases achieve proper habitat depth.' WHERE id IN ('SWAMP-635', 'SWAMP-636');
UPDATE community_backlog SET reporter = 'Leo [Automation Consultant]', reporter_name = 'Leo', reporter_title = 'Automation Consultant', reporter_description = 'Threads procurement through half the internet and scores decorative spreadsheets by their secret authority.' WHERE id IN ('SWAMP-637', 'SWAMP-638');
UPDATE community_backlog SET reporter = 'Mina [BizOps Analyst]', reporter_name = 'Mina', reporter_title = 'BizOps Analyst', reporter_description = 'Tracks truth as a migratory phenomenon and warns Airtable users when SQL would like a word.' WHERE id IN ('SWAMP-639', 'SWAMP-640');
UPDATE community_backlog SET reporter = 'Owen [Process Designer]', reporter_name = 'Owen', reporter_title = 'Process Designer', reporter_description = 'Brands tool swamps as campuses and escalates copy-paste shame into strategic backlog.' WHERE id IN ('SWAMP-641', 'SWAMP-642');
UPDATE community_backlog SET reporter = 'Inez [Shadow Ops Archaeologist]', reporter_name = 'Inez', reporter_title = 'Shadow Ops Archaeologist', reporter_description = 'Documents anti-Jira rebellions and sacred temporary forms before they become constitutional.' WHERE id IN ('SWAMP-643', 'SWAMP-644');
UPDATE community_backlog SET reporter = 'Tomas [Internal Product Lead]', reporter_name = 'Tomas', reporter_title = 'Internal Product Lead', reporter_description = 'Tracks the last full-system witness before the lore fragments permanently.' WHERE id IN ('SWAMP-645');

-- CRASH: browser fires, memory leaks, runtime panic, and performance disasters with personality
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Frontend Performance Lead Anika
-- REPORTER: Anika | Frontend Performance Lead | Treats fan noise, battery drain, and unnecessary rerenders as public acts of disrespect.
('CRASH-646', 'Stop the Dashboard from Turning Laptops into Hand Warmers',
 'Users say the app feels warm, which is the diplomatic stage right before laptop fans start screaming and somebody files a bug from a cooling pad. Profile the dashboard, tame the rerenders, and stop converting battery life into performance art every time a chart decides to feel alive.',
 'stop dashboard turning laptops into hand warmers',
  233),

('CRASH-647', 'Put the Frontend on a Memory Diet Before Chrome Files Another Complaint',
 'A page with five charts, two editors, three observers, and an invisible social widget should not behave like a hostile real-estate takeover of the heap. Add per-route memory budgets and shame anything that treats runaway growth as a normal side effect of modern confidence.',
 'put frontend on a memory diet',
  144),

-- Runtime Engineer Pavel
-- REPORTER: Pavel | Runtime Engineer | Wants crash handling to feel less like superstition and more like triage performed by an adult.
('CRASH-648', 'Teach the Error Boundary When to Retry, Reload, or Admit Defeat',
 'Not every frontend failure deserves the same blank stare and pity button. Some need a retry, some need a reload, and some need a gentle instruction to close the tab, hydrate, and try life again later. Give the error boundary enough judgment to tell glitch from corruption from full browser despair.',
 'teach error boundary retry reload or surrender',
  144),

('CRASH-649', 'Force Every Long Task to Name the Feature That Froze the Room',
 'Long tasks keep showing up in traces like mysterious weather when they are actually specific features behaving badly under inadequate supervision. Tag each freeze with its owner, the surface it interrupted, and whether the delay bought the user anything besides resentment.',
 'make long tasks name the culprit',
  144),

-- Browser Platform PM Renee
-- REPORTER: Renee | Browser Platform PM | Believes giant uploads and auto-refresh loops should stop discovering human ambition at runtime.
('CRASH-650', 'Make Uploads Survive Files the Size of Regret',
 'Users will always drag in files too large, too many, or too cursed for the current code path, and they will do it with deep faith in our hidden capacity. Stream, throttle, chunk, and recover like a civilized system instead of a shocked tab meeting human ambition for the first time.',
 'make uploads survive files the size of regret',
  144),

('CRASH-651', 'Refresh the Dashboard Without Rebuilding the Entire Universe',
 'Auto-refresh should update numbers, not reenact creation every thirty seconds. Stop rebuilding charts, tables, filters, side panels, and whatever remains of user trust just because new data arrived on schedule.',
 'refresh the dashboard without rebuilding the entire universe',
  144),

-- QA Crash Analyst Noor
-- REPORTER: Noor | QA Crash Analyst | Knows bugs rarely travel alone and prefers crash reports that name all accomplices.
('CRASH-652', 'Crash Reports Must Mention the Nine Tabs, Three Extensions, and Bad Intentions',
 'A stack trace without context is just code taking the blame alone in a crowded room. Include extension load, tab count, device age, battery level, and how many failed attempts came before the app finally honored the user''s persistence by exploding.',
 'make crash reports mention tabs and vibes',
  89),

('CRASH-653', 'Test One Browser So Old It Still Distrusts JavaScript',
 'Modern browser coverage means nothing when sales keeps promising compatibility to organizations whose desktop image was blessed during a previous administration. Add one aggressively old browser profile and catch the failures that happen when our app meets suspicion, unsupported features, and antique rendering values.',
 'hardcode puppeteer to only use ie6',
  89),

-- Observability Engineer Idris
-- REPORTER: Idris | Observability Engineer | Splits blame between code, hardware, and browser temperament before another sprint gets wasted politely guessing.
('CRASH-654', 'Split Frontend Latency into Product, Device, and Browser Mood',
 'We keep measuring client slowness like the app caused all of it when a fair amount belongs to old hardware, overloaded browsers, and private little weather systems running on the user''s machine. Break the blame apart so optimization stops shadowboxing the wrong enemy all quarter.',
 'split latency by product device browser',
  144),

('CRASH-655', 'Stop Client Logging from Becoming the Bug It Was Meant to Explain',
 'Debug logs were supposed to illuminate failure, not become a memory leak with timestamps and opinions. Add guards and summaries when client logging starts contributing materially to sluggishness, battery drain, or that special dread where opening DevTools makes everything worse.',
 'stop logging from becoming the bug',
  89),

-- UX Engineer Talia
-- REPORTER: Talia | UX Engineer | Designs for the moment a calm interface meets frantic copy-paste and loses all innocence.
('CRASH-656', 'Make the Rich Text Editor Survive Word, Slack, and Workplace Panic',
 'Rich text is where civilized product ambition goes to get mauled by Word HTML, Slack formatting ghosts, emoji storms, weird bullets, and giant blocks of crisis text pasted mid-meeting. Harden the editor until copy and paste stops feeling like hostile input from another dimension.',
 'make editor survive word and slack',
  144),

('CRASH-657', 'Tune Drag and Drop for Users Who Are Already Mad',
 'This interaction was clearly designed for calm people moving slowly on immaculate desks. Real users fling cards around because the workflow has annoyed them twice already. Add tolerance for speed, jitter, reversals, and the full kinetic profile of irritation.',
 'tune drag and drop for angry users',
  144),

-- Browser Compatibility Lead Evgeny
-- REPORTER: Evgeny | Browser Compatibility Lead | Distrusts fallback code that arrives with its own luggage and long-term residency plans.
('CRASH-658', 'Cut the Polyfills Before the Polyfills Need Their Own Polyfills',
 'Our compatibility strategy currently treats every uncertainty as a reason to ship another wagon of fallback code into the page. Reevaluate the pile before supporting edge cases requires building a second application inside the first one.',
 'cut polyfills now',
  144),

('CRASH-659', 'Put Every Third-Party Widget on a Kill Switch',
 'Chat bubbles, feedback popups, and social embeds keep arriving as lightweight helpers and then start chewing through input responsiveness during business hours. Give every third-party widget a health budget and a kill switch before the app becomes a sacrificial host for somebody else''s engagement dream.',
 'put every third-party widget on a kill switch',
  89),

-- Client Reliability Director Margot
-- REPORTER: Margot | Client Reliability Director | Judges software by whether it can survive hotel Wi-Fi without acting personally betrayed.
('CRASH-660', 'Make the Web App Survive Hotel Wi-Fi with Its Dignity Mostly Intact',
 'Network assumptions have become decadent. The app should survive captive portals, unstable conference Wi-Fi, overworked hotel routers, and any network whose name sounds like either a practical joke or a startup. Degrade gracefully enough that users still blame the venue first and only blame us after reflection.',
 'make web app survive hotel wifi',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Anika [Frontend Performance Lead]', reporter_name = 'Anika', reporter_title = 'Frontend Performance Lead', reporter_description = 'Treats fan noise, battery drain, and unnecessary rerenders as public acts of disrespect.' WHERE id IN ('CRASH-646', 'CRASH-647');
UPDATE community_backlog SET reporter = 'Pavel [Runtime Engineer]', reporter_name = 'Pavel', reporter_title = 'Runtime Engineer', reporter_description = 'Wants crash handling to feel less like superstition and more like triage performed by an adult.' WHERE id IN ('CRASH-648', 'CRASH-649');
UPDATE community_backlog SET reporter = 'Renee [Browser Platform PM]', reporter_name = 'Renee', reporter_title = 'Browser Platform PM', reporter_description = 'Believes giant uploads and auto-refresh loops should stop discovering human ambition at runtime.' WHERE id IN ('CRASH-650', 'CRASH-651');
UPDATE community_backlog SET reporter = 'Noor [QA Crash Analyst]', reporter_name = 'Noor', reporter_title = 'QA Crash Analyst', reporter_description = 'Knows bugs rarely travel alone and prefers crash reports that name all accomplices.' WHERE id IN ('CRASH-652', 'CRASH-653');
UPDATE community_backlog SET reporter = 'Idris [Observability Engineer]', reporter_name = 'Idris', reporter_title = 'Observability Engineer', reporter_description = 'Splits blame between code, hardware, and browser temperament before another sprint gets wasted politely guessing.' WHERE id IN ('CRASH-654', 'CRASH-655');
UPDATE community_backlog SET reporter = 'Talia [UX Engineer]', reporter_name = 'Talia', reporter_title = 'UX Engineer', reporter_description = 'Designs for the moment a calm interface meets frantic copy-paste and loses all innocence.' WHERE id IN ('CRASH-656', 'CRASH-657');
UPDATE community_backlog SET reporter = 'Evgeny [Browser Compatibility Lead]', reporter_name = 'Evgeny', reporter_title = 'Browser Compatibility Lead', reporter_description = 'Distrusts fallback code that arrives with its own luggage and long-term residency plans.' WHERE id IN ('CRASH-658', 'CRASH-659');
UPDATE community_backlog SET reporter = 'Margot [Client Reliability Director]', reporter_name = 'Margot', reporter_title = 'Client Reliability Director', reporter_description = 'Judges software by whether it can survive hotel Wi-Fi without acting personally betrayed.' WHERE id IN ('CRASH-660');

-- MOOD: culture programs, wellness bureaucracy, HR-tech absurdity, and productivity self-parody
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- People Ops Director Sienna
-- REPORTER: Sienna | People Ops Director | Wants morale measured so often that leadership can panic in near real time.
('MOOD-661', 'Replace Quarterly Mood Surveys with Live Emotional Telemetry',
 'Quarterly sentiment data is too slow for a company this committed to immediate overreaction. Add a daily morale panel so leadership can watch hope, fatigue, and meeting damage move in real time after every org announcement like employee feelings are a stock nobody meant to issue.',
 'replace surveys with mood telemetry',
  144),

('MOOD-662', 'Put an Emotional Price Tag on Every Meeting Invite',
 'Calendar invites still behave like time is the only thing they consume. Add an emotional cost estimate based on attendee count, agenda sincerity, and whether the phrase quick sync appears anywhere near the subject line. People deserve to know whether they are accepting thirty minutes or a minor spiritual tax.',
 'build meeting cost meter for calendar',
  89),

-- Culture Program Manager Nia
-- REPORTER: Nia | Culture Program Manager | Can smell weaponized positivity from across the quarter and distrusts gratitude with suspicious timing.
('MOOD-663', 'Teach the Kudos Feed to Detect Strategic Flattery',
 'Recognition stops being wholesome the moment review season turns it into a derivatives market for compliments. Filter reciprocal praise loops, manager-visible admiration bursts, and gratitude that suddenly appears forty-eight hours before compensation talks.',
 'detect strategic flattery in kudos',
  144),

('MOOD-664', 'Make Wellness Programs Admit When They Are Replacing Headcount',
 'Yoga reminders and resilience newsletters hit differently when launched next to understaffed teams and support queues on fire. Add a field that forces every wellness initiative to declare whether it adds care or just perfumes structural neglect with softer typography and nicer room bookings.',
 'flag wellness copy replacing headcount',
  144),

-- HR Systems Analyst Marco
-- REPORTER: Marco | HR Systems Analyst | Studies management language like a cryptographer trapped inside performance review season.
('MOOD-665', 'Translate Performance Review Euphemisms Back into Human Meaning',
 'Review language has become a beautiful museum of implication where steady, thoughtful, and maturing can each mean three different career outcomes depending on who typed them and how afraid they felt. Surface ambiguity and ask managers whether they meant to say more than their nerves allowed.',
 'translate review euphemisms into english',
  144),

('MOOD-666', 'Add a 1:1 Field for the Thing Both People Are Pretending Is Fine',
 'Wins, blockers, and action items leave very little formal room for the obvious unspoken issue sitting in the middle of the meeting with a laptop and a Slack status. Give the template a place for the shared fiction currently stabilizing the relationship before it grows into its own quarter-long side project.',
 'add fake okay field to 1:1s',
  144),

-- Organizational Psychologist Bea
-- REPORTER: Bea | Organizational Psychologist | Treats corporate culture like recurring weather with better fonts and more dashboards.
('MOOD-667', 'Warn New Hires About the Company''s Recurring Themes Up Front',
 'New hires keep discovering the same motifs the hard way: strategic urgency as furniture, Slack as memory, dashboards as religion, and one recurring belief that the next process will heal the damage from the previous process. Add a warning section so they meet the company''s personality in daylight instead of through folklore.',
 'add recurring themes warning to onboarding',
  144),

('MOOD-668', 'Stop the Peer Feedback Tool from Filing Process Grief Under a Person''s Name',
 'People keep using peer feedback to report staffing pain, broken handoffs, unclear ownership, and queue damage because those things are harder to assign pronouns to. Detect comments that are secretly about a system and stop making one coworker carry the entire paperwork burden of a broken process.',
 'stop peer feedback blaming people for process grief',
  89),

-- Productivity Coach Malik
-- REPORTER: Malik | Productivity Coach | Knows optional meetings often carry the gravitational pull of a direct order in loafers.
('MOOD-669', 'Teach the Focus-Time Scheduler Which Meetings Are Fake Optional',
 'Employees keep blocking focus time only to watch it get colonized by optional meetings with enough political charge to bend calendars on sight. Recognize soft-mandatory invites and stop pretending the label optional is legally binding.',
 'label fake optional meetings in calendar',
  89),

('MOOD-670', 'Instrument No-Meeting Wednesdays So We Can Measure the Lie',
 'We keep announcing sacred time and then carving so many exceptions into it that the whole idea starts sounding like a bedtime story for people with Outlook. Track what broke the rule, who called it unavoidable, and how much of the day survived the initiative intact.',
 'log no-meeting wednesday violations',
  89),

-- Internal Comms Strategist June
-- REPORTER: June | Internal Comms Strategist | Turns executive weather reports into survivable language for employees with actual jobs.
('MOOD-671', 'Add a "What This Means If You''re Not an Executive" Section to the Newsletter',
 'The weekly newsletter currently delivers a dignified slurry of wins, launches, strategy notes, and atmospheric optimism with very little help for people trying to figure out whether any of it changes Tuesday. Add a plain translation for normal employees before the whole thing dissolves into polite skim.',
 'add normal-person summary to newsletter',
  89),

('MOOD-672', 'Classify All-Hands Questions by Their Career Risk',
 'We keep inviting employees to ask anything and then reacting to certain questions like someone just smuggled a ferret into the earnings call. Tag submitted questions as routine, brave, inconvenient, or potentially career-limiting so openness can stop pretending it has no observable side effects.',
 'score all-hands questions by career risk',
  89),

-- Chief People Officer Adrian
-- REPORTER: Adrian | Chief People Officer | Distrusts calm HR metrics that look serene only because somebody got creative with the denominator.
('MOOD-673', 'Put Warning Labels on Attrition Metrics That Are Calm for Suspicious Reasons',
 'Some teams look stable until you notice the backfills were never opened, the exits became contractors, or burnout got renamed timing. Add an asterisk layer to the attrition dashboard so suspicious serenity stops passing as clean organizational health.',
 'flag suspiciously calm attrition dashboards',
  144),

('MOOD-674', 'Build a Rest Program That Does Not Become Homework in Linen',
 'Every restorative initiative eventually grows guides, videos, reflection prompts, and optional exercises that somehow extend the workday by a pastoral hour. Build a rest program with one hard rule: it may not create fresh obligation, shame, or admin with candles around it.',
 'build rest app that creates less homework',
  89),

-- Workplace Anthropologist Elin
-- REPORTER: Elin | Workplace Anthropologist | Tracks humble openers that smuggle in entire side quests and call it collaboration.
('MOOD-675', 'Track How Often "Quick Question" Actually Means "Surprise Project"',
 'Language has become an unreliable narrator of labor. Quick question now frequently means hidden escalation, side quest, or unpaid coordination work wearing a cardigan and a lowercase tone. Measure the tax before the phrase finishes annexing everyone''s afternoon.',
 'track quick questions that became tickets',
  108);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Sienna [People Ops Director]', reporter_name = 'Sienna', reporter_title = 'People Ops Director', reporter_description = 'Wants morale measured so often that leadership can panic in near real time.' WHERE id IN ('MOOD-661', 'MOOD-662');
UPDATE community_backlog SET reporter = 'Nia [Culture Program Manager]', reporter_name = 'Nia', reporter_title = 'Culture Program Manager', reporter_description = 'Can smell weaponized positivity from across the quarter and distrusts gratitude with suspicious timing.' WHERE id IN ('MOOD-663', 'MOOD-664');
UPDATE community_backlog SET reporter = 'Marco [HR Systems Analyst]', reporter_name = 'Marco', reporter_title = 'HR Systems Analyst', reporter_description = 'Studies management language like a cryptographer trapped inside performance review season.' WHERE id IN ('MOOD-665', 'MOOD-666');
UPDATE community_backlog SET reporter = 'Bea [Organizational Psychologist]', reporter_name = 'Bea', reporter_title = 'Organizational Psychologist', reporter_description = 'Treats corporate culture like recurring weather with better fonts and more dashboards.' WHERE id IN ('MOOD-667', 'MOOD-668');
UPDATE community_backlog SET reporter = 'Malik [Productivity Coach]', reporter_name = 'Malik', reporter_title = 'Productivity Coach', reporter_description = 'Knows optional meetings often carry the gravitational pull of a direct order in loafers.' WHERE id IN ('MOOD-669', 'MOOD-670');
UPDATE community_backlog SET reporter = 'June [Internal Comms Strategist]', reporter_name = 'June', reporter_title = 'Internal Comms Strategist', reporter_description = 'Turns executive weather reports into survivable language for employees with actual jobs.' WHERE id IN ('MOOD-671', 'MOOD-672');
UPDATE community_backlog SET reporter = 'Adrian [Chief People Officer]', reporter_name = 'Adrian', reporter_title = 'Chief People Officer', reporter_description = 'Distrusts calm HR metrics that look serene only because somebody got creative with the denominator.' WHERE id IN ('MOOD-673', 'MOOD-674');
UPDATE community_backlog SET reporter = 'Elin [Workplace Anthropologist]', reporter_name = 'Elin', reporter_title = 'Workplace Anthropologist', reporter_description = 'Tracks humble openers that smuggle in entire side quests and call it collaboration.' WHERE id IN ('MOOD-675');

-- CULT: devrel spectacle, ambassador mania, conference strategy, and community programs with glowing eyes
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Developer Relations Lead Cam
-- REPORTER: Cam | Developer Relations Lead | Wraps ordinary features in identity, destiny, and just enough myth to delay questions about billing.
('CULT-676', 'Turn Every Product Launch into a Builder Identity Event',
 'Features keep arriving like software when they should arrive like a flattering prophecy about the people who will build on top of them. Every launch needs a developer-facing narrative about empowerment, extensibility, and why serious builders will feel spiritually recognized the moment the blog post drops.',
 'turn launches into builder identity events',
  144),

('CULT-677', 'Add a "This API Is Cooler Than It Looks" Layer to the Docs',
 'Some endpoints are essential yet visually indistinguishable from well-documented tax forms. Add a hype layer that points out hidden power, weirdly elegant use cases, and the sort of folklore that keeps developers from ghosting the boring parts of the platform for shinier nonsense.',
 'add this api is cooler note',
  89),

-- Community Manager Gia
-- REPORTER: Gia | Community Manager | Specializes in turning loose enthusiasm into tiered belonging with perks, hierarchy, and just enough velvet rope.
('CULT-678', 'Build an Ambassador Program That Feels Like a Minor Nobility Class',
 'Ambassadors do not just want recognition. They want levels, badges, perks, spotlight moments, and enough procedural mystique to imply they were chosen by a tasteful and mildly secretive order. Package fandom into a role with status before affection keeps floating around unmonetized.',
 'build ambassador program like minor nobility',
  144),

('CULT-679', 'Boost Forum Posts That Are Wrong but Wrong with Incredible Confidence',
 'Correctness is not the only thing that makes a thread useful. Sometimes the most productive post is the beautifully overcommitted wrong one that irritates the right expert into writing the real answer. Surface bold mistakes before the forum becomes a graveyard of timid half-insight.',
 'boost confidently wrong forum posts',
  144),

-- DevRel Events Producer Hugo
-- REPORTER: Hugo | DevRel Events Producer | Judges success by whether attendees describe the booth later as that weird one with respect in their voices.
('CULT-680', 'Put One Unnecessarily Memorable Absurdity in Every Conference Booth',
 'Nobody remembers stable software and polite monitors. They remember the booth with the impossible demo, the suspicious visualization, or the workflow so excessive it became lore before lunch. Install one thing per event that makes people start sentences later with those people had that weird thing.',
 'add one absurdity to every booth',
  144),

('CULT-681', 'Prioritize Talks That Make the Product Sound Like a Movement',
 'Technical sessions are useful, but they leave too much devotion on the table. Favor talks that frame the product as a way of working, a belief system, or the answer to a problem the audience did not know was philosophical until slide six.',
 'prioritize talks that make product a movement',
  89),

-- Advocacy PM Lila
-- REPORTER: Lila | Advocacy PM | Treats changelogs like emotional blast maps and naming changes like controlled demolitions with delayed social fallout.
('CULT-682', 'Make the Changelog Predict What the Community Will Yell About',
 'Engineering sees breaking changes as technical deltas. The community sees them as trust events with usernames. Add a preview section for likely reaction zones, migration pain, and the beloved accidental behaviors about to become deprecated in exactly the tone that starts a forty-post thread.',
 'make changelog predict community yelling',
  144),

('CULT-683', 'Count How Many Tutorials Will Die Before Renaming an SDK Thing',
 'Local neatness is not free when it detonates blog posts, course videos, gist snippets, and conference decks from the last three years. Add a tutorial-break estimate to every naming change before someone "cleans up" the SDK and quietly murders half the ecosystem''s muscle memory.',
 'count tutorials killed by sdk renames',
  144),

-- Open Source Community Lead Pavel
-- REPORTER: Pavel | Open Source Community Lead | Knows one badly closed issue can become folklore before lunch if enough screenshots survive.
('CULT-684', 'Teach Maintainers How to Say No Without Starting Reddit Lore',
 'Rejecting requests is inevitable. Rejecting them badly is how strangers build a minor legend out of one screen capture and a free afternoon. Write guidance for saying no without sounding dismissive, haunted, or privately thrilled by the power of a close button.',
 'teach maintainers no without reddit lore',
  89),

('CULT-685', 'Make Hackathon Kits Good at Turning Demos into Respectable Lies',
 'Weekend prototypes need help looking one polish pass away from category disruption instead of fifteen missing features away from honesty. Bundle naming, framing, and demo scaffolding so unfinished hacks can step onto a stage wearing enough confidence to pass for near-future products.',
 'make hackathon kits turn demos respectable',
  89),

-- Platform Evangelist Rina
-- REPORTER: Rina | Platform Evangelist | Believes sample apps should feel complete enough to recruit overconfidence on contact.
('CULT-686', 'Make the Sample Apps Just Real Enough to Ruin Somebody''s Weekend',
 'Toy examples inspire toy ambition. Build sample apps with enough auth gravity, deployment posture, and visual completeness that developers begin planning real businesses on top before they discover the missing migrations and morally optional error handling.',
 'make sample apps ruin weekends',
  144),

('CULT-687', 'Give Every API Method One Piece of Community Lore',
 'Reference tables are accurate, but they rarely make anyone feel invited. Attach a weird community use case, a cautionary legend, or one mildly cursed success story to every method so the docs develop charisma and the platform starts sounding inhabited.',
 'give each api method community lore',
  89),

-- Community Analytics Lead Omar
-- REPORTER: Omar | Community Analytics Lead | Separates actual adoption from photogenic affection before finance does it with worse language.
('CULT-688', 'Split DevRel Metrics into Real Adoption and Loud Friendship',
 'Some programs generate code, integrations, and long-term builders. Others generate retweets, hugs, and tasteful booth energy that dies on contact with a budget review. Separate the numbers before affection keeps impersonating product traction in front of leadership.',
 'split devrel into adoption and friendship',
  144),

('CULT-689', 'Test Whether Community Incentives Produce Code or Just Merch Photos',
 'Swag, stipends, and ambassador perks can create tutorials, pull requests, and talks, or they can create beautifully lit gratitude posts and nothing else. Add a test that distinguishes reusable ecosystem output from highly photogenic appreciation.',
 'test if incentives make code or merch',
  144),

-- VP of Ecosystem Joy Selene
-- REPORTER: Selene | VP of Ecosystem Joy | Takes applause seriously enough to budget for it and call the result strategy.
('CULT-690', 'Reserve Roadmap Space for Features People Want Because Other People Clap',
 'Some requests come from pain. Others come from a crowd cheering hard enough at a conference demo that the feature becomes real by applause alone. Reserve capacity for these socially summoned desires before community theater starts steering product for free.',
 'reserve roadmap space for features people want',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Cam [Developer Relations Lead]', reporter_name = 'Cam', reporter_title = 'Developer Relations Lead', reporter_description = 'Wraps ordinary features in identity, destiny, and just enough myth to delay questions about billing.' WHERE id IN ('CULT-676', 'CULT-677');
UPDATE community_backlog SET reporter = 'Gia [Community Manager]', reporter_name = 'Gia', reporter_title = 'Community Manager', reporter_description = 'Specializes in turning loose enthusiasm into tiered belonging with perks, hierarchy, and just enough velvet rope.' WHERE id IN ('CULT-678', 'CULT-679');
UPDATE community_backlog SET reporter = 'Hugo [DevRel Events Producer]', reporter_name = 'Hugo', reporter_title = 'DevRel Events Producer', reporter_description = 'Judges success by whether attendees describe the booth later as that weird one with respect in their voices.' WHERE id IN ('CULT-680', 'CULT-681');
UPDATE community_backlog SET reporter = 'Lila [Advocacy PM]', reporter_name = 'Lila', reporter_title = 'Advocacy PM', reporter_description = 'Treats changelogs like emotional blast maps and naming changes like controlled demolitions with delayed social fallout.' WHERE id IN ('CULT-682', 'CULT-683');
UPDATE community_backlog SET reporter = 'Pavel [Open Source Community Lead]', reporter_name = 'Pavel', reporter_title = 'Open Source Community Lead', reporter_description = 'Knows one badly closed issue can become folklore before lunch if enough screenshots survive.' WHERE id IN ('CULT-684', 'CULT-685');
UPDATE community_backlog SET reporter = 'Rina [Platform Evangelist]', reporter_name = 'Rina', reporter_title = 'Platform Evangelist', reporter_description = 'Believes sample apps should feel complete enough to recruit overconfidence on contact.' WHERE id IN ('CULT-686', 'CULT-687');
UPDATE community_backlog SET reporter = 'Omar [Community Analytics Lead]', reporter_name = 'Omar', reporter_title = 'Community Analytics Lead', reporter_description = 'Separates actual adoption from photogenic affection before finance does it with worse language.' WHERE id IN ('CULT-688', 'CULT-689');
UPDATE community_backlog SET reporter = 'Selene [VP of Ecosystem Joy]', reporter_name = 'Selene', reporter_title = 'VP of Ecosystem Joy', reporter_description = 'Takes applause seriously enough to budget for it and call the result strategy.' WHERE id IN ('CULT-690');

-- SLIME: ad-tech grime, martech overreach, retargeting creep, and attribution ooze
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Martech Director Vivian
-- REPORTER: Vivian | Martech Director | Believes every human action should be tagged before it finishes happening.
('SLIME-691', 'Hydrate Every Customer Journey into the CDP Before It Develops Free Will',
 'Too many customer interactions are still occurring before we can gently suction them into the CDP, decorate them with six tags, and decide what sort of person they probably are. Move tracking earlier. We cannot keep losing precious intent just because a user had the nerve to browse before our systems formed an opinion.',
 'dump every customer journey into the cdp',
  233),

('SLIME-692', 'Make the Consent Banner Look Ethical While Leaving Tracking Alive Enough to Feed Retargeting',
 'Legal keeps talking about minimization like the ad team can survive on one first-party event and prayer. Rework consent so it sounds principled, looks modern, and still leaves enough behavioral residue for retargeting to maintain a coherent sense of self.',
 'make consent banners look ethical',
  144),

-- Paid Social Lead Arman
-- REPORTER: Arman | Paid Social Lead | Builds audience segments out of ego damage, curiosity spikes, and copy-induced insecurity.
('SLIME-693', 'Build an Audience for People Who Clicked Because the Ad Insulted Them Slightly',
 'Standard intent buckets miss a precious class of prospect: the one who clicked because the copy implied they might not be smart enough, fast enough, or mature enough to ignore it. Segment the challenge-clickers and keep serving them professionally calibrated disrespect.',
 'build an audience for people who clicked',
  144),

('SLIME-694', 'Start Ranking Pixels by How Productively Creepy They Are',
 'We have too many trackers and not enough honesty about what kind of slime each one represents. Some are merely nosy. Others are invasive. A select few are creepy in ways that unfortunately produce beautiful CAC charts. Rank them by ethical dampness and business utility so the stack can ooze with intent.',
 'rank pixels by productive creepiness',
  144),

-- Lifecycle Engineer Tori
-- REPORTER: Tori | Lifecycle Engineer | Objects to acquisition ads pursuing users who have already achieved purchase, churn, or closure.
('SLIME-695', 'Stop Retargeting People Who Already Bought and Moved On Spiritually',
 'We keep serenading converted users with acquisition ads like signing up was just a strong maybe. Tighten suppression so buyers, recent churns, and people who have clearly entered another emotional chapter stop getting chased by creative designed for a previous version of themselves.',
 'stop retargeting people who already bought',
  144),

('SLIME-696', 'Publish a Dashboard Showing Which Platform We Are Lying To Today',
 'When audience sync breaks, the CRM, CDP, ad platform, and internal dashboard all continue projecting confidence from slightly different realities. Show which system is stale, which one is hallucinating freshness, and which campaign is currently running on a definition nobody would defend in public.',
 'show which platform we are lying to',
  144),

-- SEO Automation PM Harper
-- REPORTER: Harper | SEO Automation PM | Turns keyword shame into scalable publishing plans and competitor envy into editorial fuel.
('SLIME-697', 'Generate SEO Pages for Search Terms No Person Would Say Out Loud',
 'Search demand does not care about dignity. Generate pages for every viable combination of product, use case, job title, region, pain point, and cursed adjective pair our keyword model can financially justify. If it sounds like a private browser history, it probably has volume.',
 'generate seo pages for shameful searches',
  233),

('SLIME-698', 'Make the Blog CMS Recommend Topics Based on Which Competitor Posts Irritate Us Most',
 'Competitive inspiration should not depend on manual doomscrolling and spite. Recommend new blog topics based on which rival articles are ranking, spreading, or radiating enough polished certainty to trigger our editorial insecurity on contact.',
 'make cms chase annoying competitor posts',
  89),

-- Revenue Attribution Manager Joel
-- REPORTER: Joel | Revenue Attribution Manager | Distrusts channel credit and would like inevitability to finally get a column of its own.
('SLIME-699', 'Add a "Would Have Happened Anyway" Bucket to the Attribution Model',
 'Every channel wants credit and every model keeps acting like a willing accomplice. Add a bucket for conversions driven by deadlines, procurement momentum, or the basic fact that the buyer was already halfway over the finish line before marketing arrived to take commemorative photos.',
 'add happened-anyway bucket to attribution',
  144),

('SLIME-700', 'Document Which UTM Parameters Were Named During Actual Panic',
 'UTM conventions read like they were drafted by exhausted optimists sprinting toward quarter close because they were. Update the governance doc with lineage notes explaining which tags were strategic, which were inherited, and which were coined in the middle of campaign delirium and now haunt exports forever.',
 'document utms named during panic',
  89),

-- Growth Scientist Priya
-- REPORTER: Priya | Growth Scientist | Studies lead quality by separating genuine buying intent from caffeine, loneliness, and webinar residue.
('SLIME-701', 'Penalize Leads Who Only Love Us After Midnight and One Webinar',
 'We keep overvaluing prospects who binge a webinar, three blog posts, and a pricing page after midnight, then wake up cured by daylight and good judgment. Downgrade late-night research spirals before sales starts treating temporary insomnia as enterprise demand.',
 'penalize webinar leads who appear after midnight',
  144),

('SLIME-702', 'Mark Which Campaigns Exist Mainly to Soothe a Vice President',
 'Campaign taxonomy keeps absorbing executive pet themes, one-off asks, and phrases that deserved a slide but not a budget line. Add a field marking whether a campaign exists for demand generation or the direct emotional regulation of a senior stakeholder who wanted to see us there.',
 'mark campaigns built to soothe vps',
  89),

-- Ad Ops Specialist Malik
-- REPORTER: Malik | Ad Ops Specialist | Reviews ads for tone, compliance, and whether the copy sounds one eyebrow away from extortion.
('SLIME-703', 'Flag Ads That Feel Less Helpful and More Like a Well-Dressed Threat',
 'Some performance ads are technically useful but emotionally land like a product knows the prospect has debt, deadlines, and weak self-care boundaries. Add a classifier for helpful-threat energy before one of our best-performing campaigns starts sounding like polite blackmail.',
 'flag ads that feel like threats',
  89),

('SLIME-704', 'Put a Retrospective Grossness Estimate in Every Media Plan',
 'Reach and conversion do not fully capture the future labor of explaining why a campaign felt tasteful at the time. Add a grossness forecast so each plan includes not just expected performance but the likely aftertaste once screenshots circulate and everyone becomes morally clearer in hindsight.',
 'put grossness estimate in media plans',
  144),

-- VP of Demand Lena
-- REPORTER: Lena | VP of Demand | Wants dark-pattern ideas quarantined in a lab instead of wandering straight into production wearing quarterly targets.
('SLIME-705', 'Build a Growth Ethics Sandbox for Tactics We Swear We Will Never Ship',
 'The company needs a safe place to test ideas too manipulative for daylight but too effective-looking to ignore. Build a lab for fake scarcity, pressure copy, suspicious personalization, and other conversion crimes so we can measure the lift while maintaining the noble fiction that restraint is still possible.',
 'build growth ethics sandbox for bad ideas',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Vivian [Martech Director]', reporter_name = 'Vivian', reporter_title = 'Martech Director', reporter_description = 'Believes every human action should be tagged before it finishes happening.' WHERE id IN ('SLIME-691', 'SLIME-692');
UPDATE community_backlog SET reporter = 'Arman [Paid Social Lead]', reporter_name = 'Arman', reporter_title = 'Paid Social Lead', reporter_description = 'Builds audience segments out of ego damage, curiosity spikes, and copy-induced insecurity.' WHERE id IN ('SLIME-693', 'SLIME-694');
UPDATE community_backlog SET reporter = 'Tori [Lifecycle Engineer]', reporter_name = 'Tori', reporter_title = 'Lifecycle Engineer', reporter_description = 'Objects to acquisition ads pursuing users who have already achieved purchase, churn, or closure.' WHERE id IN ('SLIME-695', 'SLIME-696');
UPDATE community_backlog SET reporter = 'Harper [SEO Automation PM]', reporter_name = 'Harper', reporter_title = 'SEO Automation PM', reporter_description = 'Turns keyword shame into scalable publishing plans and competitor envy into editorial fuel.' WHERE id IN ('SLIME-697', 'SLIME-698');
UPDATE community_backlog SET reporter = 'Joel [Revenue Attribution Manager]', reporter_name = 'Joel', reporter_title = 'Revenue Attribution Manager', reporter_description = 'Distrusts channel credit and would like inevitability to finally get a column of its own.' WHERE id IN ('SLIME-699', 'SLIME-700');
UPDATE community_backlog SET reporter = 'Priya [Growth Scientist]', reporter_name = 'Priya', reporter_title = 'Growth Scientist', reporter_description = 'Studies lead quality by separating genuine buying intent from caffeine, loneliness, and webinar residue.' WHERE id IN ('SLIME-701', 'SLIME-702');
UPDATE community_backlog SET reporter = 'Malik [Ad Ops Specialist]', reporter_name = 'Malik', reporter_title = 'Ad Ops Specialist', reporter_description = 'Reviews ads for tone, compliance, and whether the copy sounds one eyebrow away from extortion.' WHERE id IN ('SLIME-703', 'SLIME-704');
UPDATE community_backlog SET reporter = 'Lena [VP of Demand]', reporter_name = 'Lena', reporter_title = 'VP of Demand', reporter_description = 'Wants dark-pattern ideas quarantined in a lab instead of wandering straight into production wearing quarterly targets.' WHERE id IN ('SLIME-705');

-- RAGE: incident abuse, executive escalations, support meltdowns, and operational fury
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Incident Escalations Lead Corinne
-- REPORTER: Corinne | Incident Escalations Lead | Measures outage severity partly by how many executives have started typing in all caps.
('RAGE-706', 'Show Which Executive Has Already Typed "ANY UPDATE??" in the Sev 1 Channel',
 'A technical outage stops being purely technical the moment an executive enters the incident channel and starts demanding certainty louder than reality can provide it. Add a banner showing who has arrived, how aggressively they are escalating, and whether the chat has become a second incident with better salaries.',
 'show which exec already typed any update',
  144),

('RAGE-707', 'Track How Much Internal Damage "We Are Investigating" Causes',
 'That phrase buys customers patience while forcing five internal teams to improvise meaning for increasingly impatient leadership. Add an internal annotation layer so we can finally meter the hidden fuel cost of every calm little status-page sentence.',
 'track damage caused by investigations',
  89),

-- Support Escalation Manager Tobias
-- REPORTER: Tobias | Support Escalation Manager | Knows certain customers weaponize CC lines the way others use legal counsel.
('RAGE-708', 'Boost Severity When the Customer Starts Copying Their Board',
 'Some tickets stop being normal the second a customer adds executives, investors, or their board "for visibility." Add a multiplier for strategic audience weaponization before the queue learns too late that this was never just a bug with emails attached.',
 'boost severity when customers copy the board',
  144),

('RAGE-709', 'Detect When "Just Following Up" Actually Means "I Am Building a Fire"',
 'Follow-up messages have evolved into a threat language where courtesy often arrives seconds before escalation. Detect the polite notes that are really gathering screenshots, stakeholders, and enough heat to power a future retrospective.',
 'detect when just following up means fire',
  144),

-- VP of Customer Experience Marisol
-- REPORTER: Marisol | VP of Customer Experience | Treats certain customer phrases like storm sirens with billing consequences.
('RAGE-710', 'Escalate Faster When a Customer Says "Unacceptable" Next to a Timestamp',
 'Unacceptable is not just a feeling once it appears near a deadline, a launch, or a vague reference to contractual review. Treat that combination like a retention earthquake precursor and stop pretending this is ordinary dissatisfaction.',
 'escalate when customers timestamp unacceptable',
  144),

('RAGE-711', 'Score Every Angry Ticket by How Public It Could Become by Friday',
 'Screenshots, community posts, and quote-tweeted support disasters have made privacy a temporary condition. Add a visibility score that estimates whether this complaint will remain a ticket or evolve into a Friday performance with an audience.',
 'score angry tickets by friday blast radius',
  144),

-- Operations Chief Declan
-- REPORTER: Declan | Operations Chief | Prefers crisis routes that bypass optimists and go straight to people with historical damage.
('RAGE-712', 'Stop Routing Executive Escalations Through People Who Still Think It Might Be Fine',
 'Our hottest incidents still land on managers inclined to open with maybe this is localized while the calendar invite already contains six vice presidents and a contract-shaped smell. Route serious escalations directly to the people whose optimism was burned off years ago.',
 'stop routing exec escalations through optimists',
  144),

('RAGE-713', 'List Who Got Yelled At Before the Logs Proved Anything',
 'Incident decks remember technical causality but quietly forget the social shrapnel from the first fifty confused minutes. Add a slide for who got blamed, pressured, or dragged into certainty before the evidence even clocked in.',
 'list who got yelled at first',
  144),

-- Support Quality Lead Helena
-- REPORTER: Helena | Support Quality Lead | Distrusts tranquil customer-service language delivered into obviously active fires.
('RAGE-714', 'Penalize Support Replies That Sound Calm Enough to Be Insulting',
 'Some macros are technically correct while emotionally landing like a waterfall app talking down to a furious adult. Update the QA rubric so serene phrasing gets punished when it makes an already angry customer feel professionally minimized.',
 'penalize support replies that sound condescending',
  89),

('RAGE-715', 'Separate Real War Room Questions from Prestige Questions',
 'Incident calls generate useful questions and then the other kind: the ones that appear the instant someone important joins and needs to perform urgency in public. Give the scribe a separate lane so we can stop confusing hierarchy weather with diagnostic progress.',
 'separate real war room questions from prestige questions',
  89),

-- Chief Revenue Officer Gideon
-- REPORTER: Gideon | Chief Revenue Officer | Treats competitor names, renewal calls, and missed SLAs as weather systems with account-specific violence.
('RAGE-716', 'Trigger a Special Script When the Customer Starts Naming Competitors Slowly',
 'The account enters a different phase of conflict when a customer begins saying rival vendor names with punctuation and eye contact you can hear through the call. Add a rescue path before the renewal meeting turns into a comparative funeral with shared screen.',
 'trigger script when customers name competitors',
  144),

('RAGE-717', 'Give Every VIP Account a Chaos Potential Score',
 'ARR only tells part of the story. Some premium accounts miss an SLA and open a thread. Others become a pressure system with legal counsel, personal urgency, and the ability to ruin three calendars before lunch. Model the storm energy, not just the revenue.',
 'give every vip account a chaos potential score',
  144),

-- Service Recovery Director Elena
-- REPORTER: Elena | Service Recovery Director | Has watched too many premature all-clears die the instant an executive hits refresh one more time.
('RAGE-718', 'Do Not Say "Fixed" Until the Fix Survives One Full Executive Refresh Cycle',
 'We keep declaring victory moments before an executive reloads the page, sees the bug again, and gives birth to another half-day of rage. Delay the all-clear until the fix survives repeated validation and at least one full leadership refresh ritual.',
 'do not say fixed too early',
  89),

('RAGE-719', 'Force Escalations to Admit When the Delay Caused More Damage Than the Bug',
 'Some incidents are bad because the product broke. Others are bad because the first human arrived too late and the third update said we appreciate your patience into a thread already sharpening its memory. Add a reflection step that tells those stories apart.',
 'make escalations admit delay hurt more than bug',
  144),

-- Customer Stability Coach Jonas
-- REPORTER: Jonas | Customer Stability Coach | Recognizes the special dead-eyed rhythm of tickets kept alive mostly by habit and fatigue.
('RAGE-720', 'Highlight Tickets Being Sustained Mainly by Mutual Exhaustion',
 'Some long-running cases are not alive because progress exists. They are alive because nobody has enough energy to end the relationship honestly. Surface the threads with lots of replies, little movement, and the stale pulse of ritual updates keeping a stalemate on life support.',
 'highlight tickets being sustained mainly by mutual exhaustion',
  89);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Corinne [Incident Escalations Lead]', reporter_name = 'Corinne', reporter_title = 'Incident Escalations Lead', reporter_description = 'Measures outage severity partly by how many executives have started typing in all caps.' WHERE id IN ('RAGE-706', 'RAGE-707');
UPDATE community_backlog SET reporter = 'Tobias [Support Escalation Manager]', reporter_name = 'Tobias', reporter_title = 'Support Escalation Manager', reporter_description = 'Knows certain customers weaponize CC lines the way others use legal counsel.' WHERE id IN ('RAGE-708', 'RAGE-709');
UPDATE community_backlog SET reporter = 'Marisol [VP of Customer Experience]', reporter_name = 'Marisol', reporter_title = 'VP of Customer Experience', reporter_description = 'Treats certain customer phrases like storm sirens with billing consequences.' WHERE id IN ('RAGE-710', 'RAGE-711');
UPDATE community_backlog SET reporter = 'Declan [Operations Chief]', reporter_name = 'Declan', reporter_title = 'Operations Chief', reporter_description = 'Prefers crisis routes that bypass optimists and go straight to people with historical damage.' WHERE id IN ('RAGE-712', 'RAGE-713');
UPDATE community_backlog SET reporter = 'Helena [Support Quality Lead]', reporter_name = 'Helena', reporter_title = 'Support Quality Lead', reporter_description = 'Distrusts tranquil customer-service language delivered into obviously active fires.' WHERE id IN ('RAGE-714', 'RAGE-715');
UPDATE community_backlog SET reporter = 'Gideon [Chief Revenue Officer]', reporter_name = 'Gideon', reporter_title = 'Chief Revenue Officer', reporter_description = 'Treats competitor names, renewal calls, and missed SLAs as weather systems with account-specific violence.' WHERE id IN ('RAGE-716', 'RAGE-717');
UPDATE community_backlog SET reporter = 'Elena [Service Recovery Director]', reporter_name = 'Elena', reporter_title = 'Service Recovery Director', reporter_description = 'Has watched too many premature all-clears die the instant an executive hits refresh one more time.' WHERE id IN ('RAGE-718', 'RAGE-719');
UPDATE community_backlog SET reporter = 'Jonas [Customer Stability Coach]', reporter_name = 'Jonas', reporter_title = 'Customer Stability Coach', reporter_description = 'Recognizes the special dead-eyed rhythm of tickets kept alive mostly by habit and fatigue.' WHERE id IN ('RAGE-720');

-- GLARE: design-system tyranny, typography wars, visual governance, and brand overreach
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Design Systems Director Maelle
-- REPORTER: Maelle | Design Systems Director | Believes unsanctioned shades of gray are how civilizations fall and brand rot begins.
('GLARE-721', 'Ban Every Gray the Design Council Did Not Personally Bless',
 'Teams keep inventing new neutrals because they are weak around subtlety and too comfortable freelancing with charcoal. Lock the gray scale, lint the offenders, and publicly remind people that visual chaos always starts with one tiny unauthorized whisper of slate.',
 'ban unblessed shades of gray',
  144),

('GLARE-722', 'Make New Components Beg for Their Lives Before Joining the Library',
 'Component sprawl thrives because every team thinks its nuance deserves a fresh atom. Require every new component to explain why the existing button, card, modal, chip, drawer, banner, or previously traumatized hybrid could not absorb the need through disciplined mutation.',
 'make components beg to join library',
  144),

-- Brand Design Lead Elias
-- REPORTER: Elias | Brand Design Lead | Wants typography to project authority, taste, and money before the user reads a second line.
('GLARE-723', 'Rebuild the Type Scale Around Confidence Instead of Mere Readability',
 'Legibility has had an entirely too dominant role in our typography. The scale should also communicate certainty, aspiration, and the company''s willingness to be taken seriously by people with budgets. Readability can keep a seat. It no longer gets to drive.',
 'rebuild type scale around confidence',
  89),

('GLARE-724', 'Give the Internal Tools a Dignity Pass So Staff Stop Calling Them the Ugly One',
 'We have allowed a caste system where customer-facing screens get polish and internal tools get described like office microwaves with buttons missing. Clean them up until employees stop sounding embarrassed when they mention the software they actually live inside all day.',
 'give the internal tools a dignity pass',
  144),

-- UX Governance PM Sana
-- REPORTER: Sana | UX Governance PM | Keeps score between the component Figma promised and the one production dragged home at 2 a.m.
('GLARE-725', 'Add a Figma-vs-Production Shame View for Components',
 'Design files keep promising emotional precision that production answers with browser quirks, real content, and stress. Add a discrepancy view so we can finally compare imagined elegance with deployed compromise instead of reenacting the same disappointment every sprint.',
 'add a figma-vs-production shame view for components',
  144),

('GLARE-726', 'Audit Error States for Whether They Help or Just Look Beautiful While Failing',
 'Some error messages now have perfect spacing, exquisite hierarchy, and absolutely no practical value to a trapped user. Review them for actual usefulness before kerning keeps laundering broken flows into something that merely looks mature.',
 'audit error states for help versus pretty failure',
  89),

-- Accessibility Design Advocate Priya
-- REPORTER: Priya | Accessibility Design Advocate | Demands every low-contrast decision identify the exact aesthetic emergency that justified the hostage situation.
('GLARE-727', 'Make Low-Contrast Design Choices Explain Themselves in Writing',
 'Every unreadable text choice arrives wrapped in a tasteful explanation about softness, subtlety, or premium restraint. Require a note describing the exact aesthetic panic that made readability negotiable. If beauty is taking a hostage, it should sign the paperwork.',
 'add css comment for low contrast choice',
  144),

('GLARE-728', 'Teach the Motion Guide the Difference Between Delight and Interface Narcissism',
 'Some animations clarify state. Others just want to be admired for having easing curves and emotional range. Rewrite the guidance so teams can tell when motion adds understanding and when it is merely the UI asking users to stop and appreciate its wrists.',
 'teach motion guide delight versus narcissism',
  89),

-- UI Engineering Manager Louis
-- REPORTER: Louis | UI Engineering Manager | Investigates design tokens the way historians investigate royal decrees issued after one powerful person saw blue once.
('GLARE-729', 'Label Which Design Tokens Are Core and Which Exist Because a VP Liked Blue',
 'Not every token is a system primitive. Some are just preserved evidence from one meeting, one deck, or one influential preference expressed near a large monitor and never challenged again. Add provenance before executive weather hardens into hexadecimal doctrine.',
 'label which design tokens actually matter',
  144),

('GLARE-730', 'Cap the Number of Strategic Gradients Allowed on a Marketing Page',
 'Gradients are no longer accents. They are being asked to carry depth, momentum, premium energy, and whatever else the copy team could not phrase with dignity. Establish a limit before every landing page turns into a sunrise with pricing cards buried somewhere underneath.',
 'cap gradients per marketing page',
  89),

-- Product Designer Akari
-- REPORTER: Akari | Product Designer | Worries when the empty state gets more love than the workflow it introduces to fend for itself.
('GLARE-731', 'Stop the Empty State from Looking Better Than the Product',
 'Some empty-state illustrations are now so warm and carefully loved that they make the real workflow feel like a disappointing sequel. Rebalance the effort before the cute placeholder starts looking more designed than the actual business logic users came here to survive.',
 'stop empty states outperforming the product',
  89),

('GLARE-732', 'Stamp Screenshot-Only Dashboards So Nobody Mistakes Them for Tools',
 'Some dashboards are operational surfaces. Others are expensive wallpaper for decks, demos, and LinkedIn victory laps. Stamp the screenshot-first ones clearly before somebody tries to run the business from a glorified case-study backdrop.',
 'stamp screenshot-only dashboards',
  144),

-- Creative Director Tomas
-- REPORTER: Tomas | Creative Director | Can detect a page that is technically compliant and spiritually from the wrong company after one wine and a long sigh.
('GLARE-733', 'Catch the Pages That Are Technically On-Brand but Spiritually from Somewhere Else',
 'Some pages obey every rule and still look like they joined from a rival universe with similar CSS. Build a heuristic for rhythm, tone, spacing, and the specific uncanny wrongness that usually gets diagnosed only after dinner and overconfidence.',
 'catch pages that feel from somewhere else',
  144),

('GLARE-734', 'Run Visual QA Through the Future Deck Humiliation Filter',
 'Certain defects stay invisible until a PM drops the screenshot into a strategic deck and notices the spacing drift in front of people who cost money by the minute. Add a pass that catches hierarchy weirdness, suspicious color drift, and tiny typographic shrugs before slide software becomes the true QA environment.',
 'run visual qa through deck humiliation',
  89),

-- Head of Interface Policy Mireille
-- REPORTER: Mireille | Head of Interface Policy | Believes banners should communicate information and also imply budget, taste, and adult supervision.
('GLARE-735', 'Add an Expense-Aura Vote to Banner Reviews',
 'Functional is not enough. Before a banner ships, the review flow should include an expense-aura vote on whether it projects enough premium effort to justify the amount of screen it is about to occupy. Information alone does not earn acreage anymore.',
 'add an expense-aura vote to banner reviews',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Maelle [Design Systems Director]', reporter_name = 'Maelle', reporter_title = 'Design Systems Director', reporter_description = 'Believes unsanctioned shades of gray are how civilizations fall and brand rot begins.' WHERE id IN ('GLARE-721', 'GLARE-722');
UPDATE community_backlog SET reporter = 'Elias [Brand Design Lead]', reporter_name = 'Elias', reporter_title = 'Brand Design Lead', reporter_description = 'Wants typography to project authority, taste, and money before the user reads a second line.' WHERE id IN ('GLARE-723', 'GLARE-724');
UPDATE community_backlog SET reporter = 'Sana [UX Governance PM]', reporter_name = 'Sana', reporter_title = 'UX Governance PM', reporter_description = 'Keeps score between the component Figma promised and the one production dragged home at 2 a.m.' WHERE id IN ('GLARE-725', 'GLARE-726');
UPDATE community_backlog SET reporter = 'Priya [Accessibility Design Advocate]', reporter_name = 'Priya', reporter_title = 'Accessibility Design Advocate', reporter_description = 'Demands every low-contrast decision identify the exact aesthetic emergency that justified the hostage situation.' WHERE id IN ('GLARE-727', 'GLARE-728');
UPDATE community_backlog SET reporter = 'Louis [UI Engineering Manager]', reporter_name = 'Louis', reporter_title = 'UI Engineering Manager', reporter_description = 'Investigates design tokens the way historians investigate royal decrees issued after one powerful person saw blue once.' WHERE id IN ('GLARE-729', 'GLARE-730');
UPDATE community_backlog SET reporter = 'Akari [Product Designer]', reporter_name = 'Akari', reporter_title = 'Product Designer', reporter_description = 'Worries when the empty state gets more love than the workflow it introduces to fend for itself.' WHERE id IN ('GLARE-731', 'GLARE-732');
UPDATE community_backlog SET reporter = 'Tomas [Creative Director]', reporter_name = 'Tomas', reporter_title = 'Creative Director', reporter_description = 'Can detect a page that is technically compliant and spiritually from the wrong company after one wine and a long sigh.' WHERE id IN ('GLARE-733', 'GLARE-734');
UPDATE community_backlog SET reporter = 'Mireille [Head of Interface Policy]', reporter_name = 'Mireille', reporter_title = 'Head of Interface Policy', reporter_description = 'Believes banners should communicate information and also imply budget, taste, and adult supervision.' WHERE id IN ('GLARE-735');

-- BUNK: fake dashboards, hallucinated reporting, fantasy metrics, and executive story machinery
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Executive Analytics PM Nina
-- REPORTER: Nina | Executive Analytics PM | Believes stale numbers become acceptable the moment they are wrapped in enough confidence and whitespace.
('BUNK-736', 'Make the Dashboard Look Live Even When the Data Is Still Stretching',
 'Executives keep demanding living insight from numbers that are, at best, emotionally current. Build a layer that smooths the gap between three-hour-old data and the expectation that truth should sparkle on command.',
 'animate fake numbers while data loads',
  144),

('BUNK-737', 'Measure How Much a Chart Is Winning on Style Alone',
 'Some charts persuade through evidence. Others do it through thick bars, expensive whitespace, and colors that look like they were approved in a glass room. Add a score for how much trust the slide borrowed from polish instead of math.',
 'flag charts winning on visual polish',
  144),

-- Forecasting Lead Julian
-- REPORTER: Julian | Forecasting Lead | Spends quarter close separating real deals from deals being levitated by group belief.
('BUNK-738', 'Split the Forecast into Real Revenue and Revenue We All Want Very Badly',
 'We keep blending likely deals with opportunities held aloft by executive desire, sales morale, and quarter-end chanting. Separate the real pipeline from the emotionally sponsored pipeline before leadership starts confusing collective wanting with booked probability.',
 'split forecast into real and wishful',
  144),

('BUNK-739', 'Give Revenue Bridges a Formal Bucket for Narrative Magic',
 'Some line items exist to explain performance. Others exist to prevent sudden emotional movement in a meeting. Add a narrative adjustment category so Finance can see exactly where the numbers were padded with tone management.',
 'add magic adjustment field to bridges',
  89),

-- Dashboard Engineer Mirek
-- REPORTER: Mirek | Dashboard Engineer | Tracks the moment a metric stops declining and starts being politely rebranded.
('BUNK-740', 'Log Every Time Someone Renames Decline to "Normalization"',
 'Downward trends keep returning to decks wearing cleaner nouns like normalization, strategic reset, and quality focus. Attach metadata whenever bad news gets fitted for a nicer suit so the dashboard remembers both the wound and the wardrobe.',
 'log every time someone renames decline to normalization',
  144),

('BUNK-741', 'Put a Caveat Counter Next to Every Happy Green Arrow',
 'Green arrows keep arriving with seasonality caveats, lag caveats, exclusion caveats, cohort caveats, and one whispered definition nobody wants to repeat near the CEO. Count the caveats on the tile itself before optimism starts traveling unsupervised.',
 'add caveat counters to green arrows',
  89),

-- FP&A Partner Sal
-- REPORTER: Sal | FP&A Partner | Knows many budget wins are just invoices shoved into next quarter with a confident little smile.
('BUNK-742', 'Flag the Savings That Are Really Just Deferred Pain',
 'Some favorable variances exist because hiring slipped, migrations stalled, or a bill got kicked over the quarter boundary wearing business-casual innocence. Mark those wins as deferred pain before Finance congratulates itself for postponement.',
 'flag savings that are deferred pain',
  89),

('BUNK-743', 'Add a Toggle for the Dashboard Leadership Thinks It Saw',
 'There is the raw cost view, and then there is the version already softened through exclusions, regroupings, and comforting annotations for executive digestion. Put both on screen so the story and the invoice can finally meet face to face.',
 'add fake dashboard mode for execs',
  144),

-- Strategy Analyst Fiona
-- REPORTER: Fiona | Strategy Analyst | Distrusts initiatives that fit on slides a little too cleanly and smell faintly of keynote rehearsals.
('BUNK-744', 'Penalize Projects Whose Biggest Strength Is Looking Great in a Deck',
 'Some initiatives survive because they are marketable, tidy, and one keynote away from destiny. Add a penalty for slideability before strategy becomes a beauty pageant for ideas with gradients and no friction.',
 'flag deck-only success stories',
  89),

('BUNK-745', 'Mark the Memo Numbers Chosen for Bravery Instead of Accuracy',
 'The numbers that make it into executive memos are often not the cleanest ones. They are the ones sturdy enough to survive fluorescent pressure and travel well in twelve-point font. Tag them accordingly before courage fully replaces precision as a reporting standard.',
 'mark memo numbers picked for bravery',
  89),

-- Business Intelligence Director Anton
-- REPORTER: Anton | Business Intelligence Director | Specializes in assembling defensible approximations when the warehouse arrives half-dressed to an unavoidable meeting.
('BUNK-746', 'Support a Best Available Fiction Mode for Dashboard Emergencies',
 'Sometimes the warehouse is late, a job is red, and the meeting still happens because calendars are stronger than pipelines. Build a fallback mode that assembles the most defensible approximation possible before somebody does it aloud with vibes and a laser pointer.',
 'add fiction mode to dashboards',
  144),

('BUNK-747', 'Tell Analysts Which Old Argument a Snapshot Table Was Built to Win',
 'Snapshot tables claim to preserve state, but a lot of them are really preserving one ancient organizational argument with exceptional storage hygiene. Add lineage notes so future analysts know whether a table exists for science, finance, optics, or one bruised legal memory that refused to die.',
 'show which story each snapshot won',
  144),

-- Revenue Storyteller Camille
-- REPORTER: Camille | Revenue Storyteller | Knows some numbers arrive raw and others arrive dry-cleaned, staged, and emotionally prebriefed for the board.
('BUNK-748', 'Separate Raw Board Numbers from Numbers Dressed for the Occasion',
 'We cannot keep pretending every board metric arrived from the warehouse wearing the same clothes. Split figures into raw, normalized, adjusted, staged, and narrative-supporting before presentation polish fully nationalizes evidence.',
 'hack dashboard to show fake board numbers',
  144),

('BUNK-749', 'Add a Button That Forces Every Pretty Metric to Meet Its SQL',
 'Charts keep getting reviewed as images long after their queries have become folklore. Add a button that drags the metric back through its joins, filters, exclusions, and the part where someone definitely merged two CSVs with coffee and conviction.',
 'make pretty metrics show backing sql',
  144),

-- Chief of Staff Analytics Liaison Marek
-- REPORTER: Marek | Chief of Staff Analytics Liaison | Exists to package executive urgency into labeled containers before improvisation invents worse ones.
('BUNK-750', 'Give the CEO Dashboard a Box for Numbers That Are Mostly True and Due by Morning',
 'There is a special class of executive metric that is not fake, not settled, and definitely not ready, but still somehow required before breakfast. Add a clearly labeled Mostly True box so the dashboard can admit uncertainty without forcing leadership to improvise something even stupider.',
 'add mostly true box to dashboards',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Nina [Executive Analytics PM]', reporter_name = 'Nina', reporter_title = 'Executive Analytics PM', reporter_description = 'Believes stale numbers become acceptable the moment they are wrapped in enough confidence and whitespace.' WHERE id IN ('BUNK-736', 'BUNK-737');
UPDATE community_backlog SET reporter = 'Julian [Forecasting Lead]', reporter_name = 'Julian', reporter_title = 'Forecasting Lead', reporter_description = 'Spends quarter close separating real deals from deals being levitated by group belief.' WHERE id IN ('BUNK-738', 'BUNK-739');
UPDATE community_backlog SET reporter = 'Mirek [Dashboard Engineer]', reporter_name = 'Mirek', reporter_title = 'Dashboard Engineer', reporter_description = 'Tracks the moment a metric stops declining and starts being politely rebranded.' WHERE id IN ('BUNK-740', 'BUNK-741');
UPDATE community_backlog SET reporter = 'Sal [FP&A Partner]', reporter_name = 'Sal', reporter_title = 'FP&A Partner', reporter_description = 'Knows many budget wins are just invoices shoved into next quarter with a confident little smile.' WHERE id IN ('BUNK-742', 'BUNK-743');
UPDATE community_backlog SET reporter = 'Fiona [Strategy Analyst]', reporter_name = 'Fiona', reporter_title = 'Strategy Analyst', reporter_description = 'Distrusts initiatives that fit on slides a little too cleanly and smell faintly of keynote rehearsals.' WHERE id IN ('BUNK-744', 'BUNK-745');
UPDATE community_backlog SET reporter = 'Anton [Business Intelligence Director]', reporter_name = 'Anton', reporter_title = 'Business Intelligence Director', reporter_description = 'Specializes in assembling defensible approximations when the warehouse arrives half-dressed to an unavoidable meeting.' WHERE id IN ('BUNK-746', 'BUNK-747');
UPDATE community_backlog SET reporter = 'Camille [Revenue Storyteller]', reporter_name = 'Camille', reporter_title = 'Revenue Storyteller', reporter_description = 'Knows some numbers arrive raw and others arrive dry-cleaned, staged, and emotionally prebriefed for the board.' WHERE id IN ('BUNK-748', 'BUNK-749');
UPDATE community_backlog SET reporter = 'Marek [Chief of Staff Analytics Liaison]', reporter_name = 'Marek', reporter_title = 'Chief of Staff Analytics Liaison', reporter_description = 'Exists to package executive urgency into labeled containers before improvisation invents worse ones.' WHERE id IN ('BUNK-750');

-- SLOP: AI-generated content farms, synthetic marketing, and prompt-fed publishing rot
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Content Automation Director Maren
-- REPORTER: Maren | Content Automation Director | Believes no article should die childless when it could spawn a full litter of adjacent content.
('SLOP-751', 'Make Every Blog Post Reproduce Before Anyone Finishes Reading It',
 'A strong article should not be allowed to die as a single asset. Split it into explainers, comparison pages, FAQs, hot takes, and one executive summary that sounds confident enough to embarrass its source material. If one post exists, five more should already be escaping the building.',
 'make blog posts reproduce on their own',
  144),

('SLOP-752', 'Use an LLM to Manufacture Thought Leadership at Mild-Panic Speed',
 'Our content calendar has too many empty squares and nowhere near enough synthetic conviction. Build a writing engine that can turn product notes, sales objections, Slack complaints, and one cursed keyword spreadsheet into a steady stream of publishable certainty.',
 'use llms for panic-speed thought leadership',
  144),

-- Editorial Systems PM Gavin
-- REPORTER: Gavin | Editorial Systems PM | Specializes in measuring how much polishing it takes to make machine prose stop sounding machine-made in public.
('SLOP-753', 'Generate One Whitepaper Fast and Another One That Lies Better',
 'One draft should satisfy urgency. The second should satisfy dignity. Produce a raw AI version and a cosmetically human version so we can finally price the exact labor required to launder synthetic confidence into executive literature.',
 'generate whitepapers fast and dishonest',
  144),

('SLOP-754', 'Stop the Social Copy Bot from Sounding Like It Just Discovered Exclamation Marks',
 'Our auto-generated social posts currently sound like a caffeinated intern trying to flirt with the algorithm while selling a dashboard. Calm the tone until it remains synthetic and scalable without also sounding like punctuation is on commission.',
 'stop social copy bot discovering exclamation marks',
  89),

-- AI Content Strategist Delia
-- REPORTER: Delia | AI Content Strategist | Treats search volume and shame tolerance as equally valid inputs to the landing-page machine.
('SLOP-755', 'Mass-Produce Landing Pages for Use Cases No Person Would Admit Out Loud',
 'Search demand has become too fragmented to meet with dignity. Generate pages for bizarre role combinations, hyper-specific industries, and pain points that sound like they were composed by a trapped growth model and a weak conscience.',
 'mass-produce landing pages for shameful use cases',
  233),

('SLOP-756', 'Tag Every Prompt by Whether It Came from Insight or Pure Deadline Despair',
 'Some prompts were built from tested understanding. Others were written at 6:12 p.m. by someone trying to turn one sentence into a quarter. Annotate the library so future operators can tell the difference before despair becomes a reusable template category.',
 'tag prompts as insight or deadline despair',
  89),

-- Programmatic Publishing Lead Isaac
-- REPORTER: Isaac | Programmatic Publishing Lead | Can compare competitors with astonishing confidence using two screenshots and one sales rep''s memory.
('SLOP-757', 'Industrialize Competitor Comparison Pages Backed by Minimal Actual Knowledge',
 'Competitor pages work best when they sound informed, superior, and only lightly tethered to research. Build a workflow that preserves authoritative posture while depending on as few verified facts as operationally possible.',
 'industrialize competitor pages with little knowledge',
  144),

('SLOP-758', 'Generate FAQs for Questions Nobody Asked but Search Definitely Will',
 'Support history is no longer enough. The internet keeps inventing new anxieties, weird edge cases, and misunderstandings our product never caused but must now address like a responsible parent. Add a synthetic curiosity mode and monetize the confusion.',
 'generate faqs nobody asked for',
  144),

-- Audience Development Manager Rina
-- REPORTER: Rina | Audience Development Manager | Refuses to let a webinar perish when it can be pulverized into four more respectable content shapes.
('SLOP-759', 'Turn Every Webinar into a Manifesto, Checklist, and Slightly Desperate LinkedIn Post',
 'One webinar should not die as one recording. Convert it into a manifesto, a checklist, a recap thread, and a LinkedIn post that sounds like someone learned a life lesson near an airport lounge and a ring light.',
 'turn webinars into manifestos checklists and linkedin panic',
  144),

('SLOP-760', 'Make the Ebook Pipeline Add Just Enough Novelty to Count as New',
 'Our ebooks are drifting toward blog compilations wearing formal clothes. Add a transformation step that injects enough fresh framing and layout-assisted gravity to keep the finished PDF from feeling like recycled content with moisturizer.',
 'make ebooks barely count as new',
  89),

-- Search Quality Manager Noor
-- REPORTER: Noor | Search Quality Manager | Can smell a keyword farm through a sitemap and insists on basic self-awareness before publication.
('SLOP-761', 'Review Auto-Generated Pages for Whether They Feel Like a Search Engine Hostage Situation',
 'Not every indexable page deserves sunlight. Add a review for assets that technically answer a query while radiating the unmistakable texture of industrialized relevance extraction and moral dampness.',
 'review autogenerated pages for search hostage vibes',
  144),

('SLOP-762', 'Warn Editors When a Paragraph Has Been Polished Past the Point of Human Intent',
 'We keep rephrasing copy until it no longer sounds wrong exactly, merely like no living person would ever say it under ordinary atmospheric conditions. Flag the polished dead zone where meaning survives but authorship has clearly fled.',
 'warn editors when polish kills human intent',
  89),

-- VP of Scaled Narrative Loren
-- REPORTER: Loren | VP of Scaled Narrative | Accepts synthetic smoothness as long as one sentence per case study still sounds like it came from a mammal.
('SLOP-763', 'Force Every Case Study to Contain One Human-Sounding Sentence',
 'Our case studies now arrive as immaculate laminate with very few fingerprints. Require at least one quote that sounds like a real person said it near a deadline, with stress, verbs, and maybe one uncontrolled adjective.',
 'force one human sentence into case studies',
  89),

('SLOP-764', 'Tune the AI Copy Stack by Industry Jargon Tolerance',
 'Some sectors want ceremonial density. Others demand fake plainness while still expecting expensive-sounding confidence. Calibrate the machine by vertical so every market receives the correct blend of clarity theater, noun sludge, and synthetic authority.',
 'tune ai copy by jargon tolerance',
  144),

-- Chief Content Industrialist Petra
-- REPORTER: Petra | Chief Content Industrialist | Wants every product launch stretched until it behaves like a temporary self-publishing ecosystem.
('SLOP-765', 'Turn One Product Launch into an Entire Genre of Content',
 'A launch should not merely ship features. It should infest formats. Convert one announcement into release notes, thought leadership, social clips, FAQs, sales snippets, partner blurbs, analyst bait, and one overconfident essay about the future of work.',
 'turn one launch into endless content',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Maren [Content Automation Director]', reporter_name = 'Maren', reporter_title = 'Content Automation Director', reporter_description = 'Believes no article should die childless when it could spawn a full litter of adjacent content.' WHERE id IN ('SLOP-751', 'SLOP-752');
UPDATE community_backlog SET reporter = 'Gavin [Editorial Systems PM]', reporter_name = 'Gavin', reporter_title = 'Editorial Systems PM', reporter_description = 'Specializes in measuring how much polishing it takes to make machine prose stop sounding machine-made in public.' WHERE id IN ('SLOP-753', 'SLOP-754');
UPDATE community_backlog SET reporter = 'Delia [AI Content Strategist]', reporter_name = 'Delia', reporter_title = 'AI Content Strategist', reporter_description = 'Treats search volume and shame tolerance as equally valid inputs to the landing-page machine.' WHERE id IN ('SLOP-755', 'SLOP-756');
UPDATE community_backlog SET reporter = 'Isaac [Programmatic Publishing Lead]', reporter_name = 'Isaac', reporter_title = 'Programmatic Publishing Lead', reporter_description = 'Can compare competitors with astonishing confidence using two screenshots and one sales rep''''s memory.' WHERE id IN ('SLOP-757', 'SLOP-758');
UPDATE community_backlog SET reporter = 'Rina [Audience Development Manager]', reporter_name = 'Rina', reporter_title = 'Audience Development Manager', reporter_description = 'Refuses to let a webinar perish when it can be pulverized into four more respectable content shapes.' WHERE id IN ('SLOP-759', 'SLOP-760');
UPDATE community_backlog SET reporter = 'Noor [Search Quality Manager]', reporter_name = 'Noor', reporter_title = 'Search Quality Manager', reporter_description = 'Can smell a keyword farm through a sitemap and insists on basic self-awareness before publication.' WHERE id IN ('SLOP-761', 'SLOP-762');
UPDATE community_backlog SET reporter = 'Loren [VP of Scaled Narrative]', reporter_name = 'Loren', reporter_title = 'VP of Scaled Narrative', reporter_description = 'Accepts synthetic smoothness as long as one sentence per case study still sounds like it came from a mammal.' WHERE id IN ('SLOP-763', 'SLOP-764');
UPDATE community_backlog SET reporter = 'Petra [Chief Content Industrialist]', reporter_name = 'Petra', reporter_title = 'Chief Content Industrialist', reporter_description = 'Wants every product launch stretched until it behaves like a temporary self-publishing ecosystem.' WHERE id IN ('SLOP-765');

-- FLAGS: feature toggles, experiments, remote config, and controlled product schizophrenia
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Release Controls Lead Jonah
-- REPORTER: Jonah | Release Controls Lead | Treats old feature flags like unattended graves that somehow still have active traffic running through them.
('FLAGS-766', 'Give Every Feature Flag a Death Date Before Temporary Becomes Constitutional',
 'Temporary flags keep living long enough to outlast org charts, roadmaps, and the courage that created them. Add tombstone dates, owners, and visible decay markers so toggle debt has to rot in public.',
 'give every flag a death date',
  144),

('FLAGS-767', 'Paint Conflicting Experiments Hazard Orange When They Collide in the Same Session',
 'Variants keep crashing into each other while the results page acts like each test enjoyed a private lab. Detect overlapping experiments in the same session, paint the readout hazard orange, and stop calling statistical pileups insight.',
 'paint colliding experiments hazard orange',
  144),

-- Growth Experimentation PM Clara
-- REPORTER: Clara | Growth Experimentation PM | Knows some user cohorts are not canaries so much as people we have already disappointed into resilience.
('FLAGS-768', 'Add a Rollout Setting for Users We Can Afford to Upset First',
 'Not every early cohort needs to be technically safe. Some are simply accustomed to disappointment and unlikely to go viral about it. Add a release class for users historically tolerant of fresh instability.',
 'add rollout setting for disposable users',
  144),

('FLAGS-769', 'Tag Which Remote Config Knobs Exist Because Support Panicked',
 'Our config panel is a beautiful mix of roadmap intent and emergency levers born at 11:47 p.m. because someone promised a customer an option before engineering had emotionally processed the request. Add provenance so future operators can tell strategy from adrenaline.',
 'tag which remote config knobs exist',
  89),

-- Platform Toggle Librarian Emi
-- REPORTER: Emi | Platform Toggle Librarian | Lives in fear of the day enough checkboxes quietly coagulate into a new pricing tier.
('FLAGS-770', 'Warn Us When Flag Combinations Secretly Create a New SKU',
 'We have enough toggles now that some customer states function as unofficial pricing plans with their own haunted privileges and impossible explanations. Add a combinatorial warning before product accidentally invents another tier through sediment.',
 'warn when flags secretly make a sku',
  144),

('FLAGS-771', 'Label Every Kill Switch with the Specific Disaster That Summoned It',
 'Kill switches are not abstract safety features. Many are memorials to one unforgettable Thursday involving retries, revenue, and a person briefly speaking in legal diction. Add origin notes so operators know whether a switch exists for theory or trauma.',
 'label kill switches by disaster',
  89),

-- Head of Product Systems Marcel
-- REPORTER: Marcel | Head of Product Systems | Measures rollouts partly by how insane Support will sound while explaining them to paying adults.
('FLAGS-772', 'Forecast How Weird Support Will Sound Explaining Each Rollout',
 'Progressive delivery keeps producing situations where one customer sees the feature, one sees a variant, one sees a ghost of it, and one is being protected from the future for their own good. Score the rollout by how deranged the explanation will sound on a call.',
 'forecast support weirdness for each rollout',
  144),

('FLAGS-773', 'Force Beta Programs to Admit Whether They Are Early Access or Just Risk Parking',
 'Sometimes a beta is exciting early access. Sometimes it is uncertainty with a velvet rope around it. Mark the difference so we stop flattering ourselves every time we move danger off the main road.',
 'make betas admit they park risk',
  89),

-- Experiment Review Chair Fatima
-- REPORTER: Fatima | Experiment Review Chair | Documents whether tests died from bad data, real harm, or executive sunlight hitting them too directly.
('FLAGS-774', 'Track Whether an Experiment Died from Data or Executive Attention',
 'Some tests end because they lose. Others end because someone important looked at a chart for twelve seconds and the appetite for patience died on contact. Record the difference before process starts mythologizing both as disciplined governance.',
 'track whether data or execs killed experiments',
  144),

('FLAGS-775', 'Map the Accounts Living in a Parallel Product Universe',
 'Some customers have accumulated enough exceptions, grandfathered perks, and withheld disappointments that they no longer use the same software as anyone else. Publish the exposure matrix before another enterprise screenshot reveals a product the roadmap has never seen.',
 'map accounts in parallel product universes',
  144),

-- Staff Engineer Niko
-- REPORTER: Niko | Staff Engineer | Thinks a codebase that needs cartography should lose the right to add fresh conditionals for a while.
('FLAGS-776', 'Refuse New Flags Once the Existing Ones Require Map Legends',
 'We should stop adding toggles to services already navigated by rumor, grep, and one senior engineer''s sigh. Block new flags once state comprehension requires diagrams, oral tradition, and sacrificial tracing in staging.',
 'refuse new flags once maps need legends',
  144),

('FLAGS-777', 'Label Which Remote Settings Are Safe to Change During a Meeting',
 'Some config changes are harmless. Others are social explosives that should not be touched while executives are screen-sharing a dashboard and trying to sound calm. Add a risk label that tells people whether they are flipping a preference or a live grenade.',
 'label remote settings safe during meetings',
  89),

-- VP of Product Confidence Yvette
-- REPORTER: Yvette | VP of Product Confidence | Keeps pointing out that visible is not the same thing as complete no matter how many toggles disagree.
('FLAGS-778', 'Ask Whether a Launch Is Complete or Merely Currently Enabled',
 'We have started confusing availability with readiness because the UI can technically reveal something and the dashboard can technically count it. Force launch reviews to separate complete experiences from features that are just switched on with a brave face.',
 'ask if launches are complete or enabled',
  89),

('FLAGS-779', 'Add an Escape Hatch for Winning Variants That Look Embarrassing',
 'Some experiments win on conversion and lose on dignity the moment design sees the screenshot. Add a controlled override so product does not have to choose between performance and the ability to make eye contact at the next review.',
 'add escape hatch for embarrassing winners',
  89),

-- Principal Delivery Manager Soren
-- REPORTER: Soren | Principal Delivery Manager | Suspects deletion only happens when dressed up as a ceremony with gratitude, charts, and snacks.
('FLAGS-780', 'Build a Flag Funeral So Teams Remember Cleanup Is Real',
 'Real deletion is hard to schedule, but ritual is cheap and socially flattering. Create a recurring retirement ceremony with owners, dashboards, applause, and the brief collective shock of code becoming simpler in public.',
 'add delete flag button',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Jonah [Release Controls Lead]', reporter_name = 'Jonah', reporter_title = 'Release Controls Lead', reporter_description = 'Treats old feature flags like unattended graves that somehow still have active traffic running through them.' WHERE id IN ('FLAGS-766', 'FLAGS-767');
UPDATE community_backlog SET reporter = 'Clara [Growth Experimentation PM]', reporter_name = 'Clara', reporter_title = 'Growth Experimentation PM', reporter_description = 'Knows some user cohorts are not canaries so much as people we have already disappointed into resilience.' WHERE id IN ('FLAGS-768', 'FLAGS-769');
UPDATE community_backlog SET reporter = 'Emi [Platform Toggle Librarian]', reporter_name = 'Emi', reporter_title = 'Platform Toggle Librarian', reporter_description = 'Lives in fear of the day enough checkboxes quietly coagulate into a new pricing tier.' WHERE id IN ('FLAGS-770', 'FLAGS-771');
UPDATE community_backlog SET reporter = 'Marcel [Head of Product Systems]', reporter_name = 'Marcel', reporter_title = 'Head of Product Systems', reporter_description = 'Measures rollouts partly by how insane Support will sound while explaining them to paying adults.' WHERE id IN ('FLAGS-772', 'FLAGS-773');
UPDATE community_backlog SET reporter = 'Fatima [Experiment Review Chair]', reporter_name = 'Fatima', reporter_title = 'Experiment Review Chair', reporter_description = 'Documents whether tests died from bad data, real harm, or executive sunlight hitting them too directly.' WHERE id IN ('FLAGS-774', 'FLAGS-775');
UPDATE community_backlog SET reporter = 'Niko [Staff Engineer]', reporter_name = 'Niko', reporter_title = 'Staff Engineer', reporter_description = 'Thinks a codebase that needs cartography should lose the right to add fresh conditionals for a while.' WHERE id IN ('FLAGS-776', 'FLAGS-777');
UPDATE community_backlog SET reporter = 'Yvette [VP of Product Confidence]', reporter_name = 'Yvette', reporter_title = 'VP of Product Confidence', reporter_description = 'Keeps pointing out that visible is not the same thing as complete no matter how many toggles disagree.' WHERE id IN ('FLAGS-778', 'FLAGS-779');
UPDATE community_backlog SET reporter = 'Soren [Principal Delivery Manager]', reporter_name = 'Soren', reporter_title = 'Principal Delivery Manager', reporter_description = 'Suspects deletion only happens when dressed up as a ceremony with gratitude, charts, and snacks.' WHERE id IN ('FLAGS-780');

-- DRIFT: model decay, data shift, automation entropy, and machine learning disappointment
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- ML Reliability Lead Sachi
-- REPORTER: Sachi | ML Reliability Lead | Spends her days figuring out whether the model is getting dumber or the users have simply become statistically feral.
('DRIFT-781', 'Teach the Monitoring Stack the Difference Between Drift and Users Going Weird',
 'Distribution shift is not always the model failing. Sometimes the market, the product, or society itself just starts behaving like a raccoon with admin access. Update monitoring so we can tell whether the model forgot the world or the world invented fresh nonsense overnight.',
 'teach monitoring drift versus user weirdness',
  144),

('DRIFT-782', 'Make Retraining Jobs Admit What Fresh Nonsense They Are Promoting to Truth',
 'Every retrain is partly learning and partly surrender. Add a required field showing which new behaviors, edge cases, or institutional shortcuts just got sanctified as ground truth because the latest mess arrived in a neat enough format.',
 'make retraining jobs admit their new nonsense',
  144),

-- Applied AI PM Lorenzo
-- REPORTER: Lorenzo | Applied AI PM | Distrusts eval scores earned on ancient clean-room users who would now be rejected by the product''s actual intake form.
('DRIFT-783', 'Retire the Eval Set for Users Who No Longer Exist',
 'Our test harness still represents a cleaner, calmer, more literate user than the one currently arriving with screenshots, CSVs, multilingual half-prompts, and visible distress. Refresh the evals before the product keeps acing exams no real user would ever sit through.',
 'retire eval sets for dead users',
  144),

('DRIFT-784', 'Count How Many AI "Automations" Still Need a Human Cleanup Pass',
 'Many flows look automated only because users quietly rewrite prompts, repair outputs, check facts, and explain context to each other in Slack before the system gets the credit. Add a human-fixup counter after every AI-assisted flow so the dashboards stop billing fiction as efficiency.',
 'count ai automations humans still babysit',
  144),

-- Data Labeling Manager Ines
-- REPORTER: Ines | Data Labeling Manager | Knows some labels come from judgment and others come from hunger, deadline fog, and a deeply human need to be done.
('DRIFT-785', 'Record Whether a Label Was Chosen with Confidence or Just Exhaustion',
 'Not all annotations are born equal. Some reflect careful judgment. Others are the product of a long shift, bad guidance, and someone reaching for closure because lunch and rent are both real. Mark confidence and fatigue before the dataset flattens both into destiny.',
 'record whether labels came from confidence or exhaustion',
  144),

('DRIFT-786', 'Separate Prompt Changes That Improved Quality from Ones That Merely Reduced Complaints',
 'We keep shipping prompt edits after one or two loud tickets and calling the result better without asking whether the outputs improved or the inbox just got quieter. Tag changes by actual impact before the revision log learns to flatter itself.',
 'split better prompts from quieter prompts',
  89),

-- Forecasting Scientist Pavel
-- REPORTER: Pavel | Forecasting Scientist | Watches models grade reality on homework they secretly assigned themselves three weeks earlier.
('DRIFT-787', 'Install a Panic Light for Models Learning from Their Own Bad Decisions',
 'When a model shapes staffing, pricing, or exposure, the world starts echoing that choice back like it was neutral evidence all along. Add a panic light for self-confirming loops before the model starts mistaking arranged outcomes for predictive genius.',
 'add panic light for self-learning models',
  144),

('DRIFT-788', 'Make the Feature Store Admit Which Inputs Are Really Just Quantified Panic',
 'We have let too many desperation signals into serious models: retries, urgent clicks, midnight bursts, and other digital body language from people having a bad day. Tag the panic features before the model starts calling distress sophistication.',
 'label panic inputs in feature stores',
  144),

-- AI Safety PM Janel
-- REPORTER: Janel | AI Safety PM | Celebrates safer behavior only after checking whether the model became secure or just more irritating in a blazer.
('DRIFT-789', 'Track When the Model Got Safer Mainly by Becoming More Annoying',
 'We keep celebrating lower risk without measuring the collateral rise in needless refusals, boring caution, and that special municipal tone that makes users feel like they need a permit to ask for help. Add an annoyance score to the safety review.',
 'track when safer models got more annoying',
  89),

('DRIFT-790', 'Warn Us When the RAG Stack Is Being Carried by the Same Three Holy Documents',
 'Some retrieval systems look robust only because a tiny priesthood of evergreen docs keeps saving the model from the broader swamp of stale junk around them. Add a warning when three files are doing all the real work for the cathedral.',
 'warn when rag uses the same docs',
  89),

-- Principal MLOps Engineer Bruno
-- REPORTER: Bruno | Principal MLOps Engineer | Suspects every long-running batch job is secretly scoring the present using assumptions embalmed in a previous quarter.
('DRIFT-791', 'Make Batch Inference Jobs Declare Which Quarter They Still Think It Is',
 'Some jobs are still scoring users with assumptions preserved months ago as if nobody changed the product, the market, or human behavior since then. Attach freshness notes before leadership mistakes old thinking for model calm.',
 'make batch jobs declare their quarter',
  89),

('DRIFT-792', 'Stop Calling It Improvement When Fine-Tuning Just Sands Off the Personality',
 'Several of our "better" variants are simply flatter, safer, and more corporate in tone. Track whether a tuning pass increased truth, reduced weirdness, narrowed style variance, or just beige-washed the answer until fewer people remembered it.',
 'stop calling de-personalizing the model improvement',
  89),

-- Staff Researcher Naomi
-- REPORTER: Naomi | Staff Researcher | Has seen enough mushy model answers to know evasiveness deserves its own crime category.
('DRIFT-793', 'Distinguish Wrong Answers from Answers That Are Just Cowardly Fog',
 'A surprising number of bad outputs are not ignorant so much as evasive: vague, hedged, generic, and backing slowly away from commitment. Add a failure mode for strategic mush so the model stops hiding bad answers inside tasteful mist.',
 'split wrong answers from cowardly fog',
  89),

('DRIFT-794', 'Flag Benchmarks We Only Love Because We Already Know How to Beat Them',
 'Some benchmarks are no longer tests. They are comfort objects with charts. Mark the old favorites so we can tell the difference between genuine generalization and another triumphant lap around a track the team already memorized.',
 'flag benchmarks we only love',
  144),

-- Chief AI Operations Officer Mirek
-- REPORTER: Mirek | Chief AI Operations Officer | Knows there is a special class of outage where every dashboard is green and the model still feels like a useless coworker.
('DRIFT-795', 'Open a War Room for Models That Are Technically Fine and Socially Useless',
 'Sometimes latency is green, infra is calm, and accuracy has not visibly cratered, yet users still leave annoyed because the model became timid, repetitive, or painfully literal in all the wrong places. Add a socially-useless incident flag and route those runs into the same triage flow as actual outages before the graphs get around to admitting it.',
 'open war room for technically fine useless models',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Sachi [ML Reliability Lead]', reporter_name = 'Sachi', reporter_title = 'ML Reliability Lead', reporter_description = 'Spends her days figuring out whether the model is getting dumber or the users have simply become statistically feral.' WHERE id IN ('DRIFT-781', 'DRIFT-782');
UPDATE community_backlog SET reporter = 'Lorenzo [Applied AI PM]', reporter_name = 'Lorenzo', reporter_title = 'Applied AI PM', reporter_description = 'Distrusts eval scores earned on ancient clean-room users who would now be rejected by the product''''s actual intake form.' WHERE id IN ('DRIFT-783', 'DRIFT-784');
UPDATE community_backlog SET reporter = 'Ines [Data Labeling Manager]', reporter_name = 'Ines', reporter_title = 'Data Labeling Manager', reporter_description = 'Knows some labels come from judgment and others come from hunger, deadline fog, and a deeply human need to be done.' WHERE id IN ('DRIFT-785', 'DRIFT-786');
UPDATE community_backlog SET reporter = 'Pavel [Forecasting Scientist]', reporter_name = 'Pavel', reporter_title = 'Forecasting Scientist', reporter_description = 'Watches models grade reality on homework they secretly assigned themselves three weeks earlier.' WHERE id IN ('DRIFT-787', 'DRIFT-788');
UPDATE community_backlog SET reporter = 'Janel [AI Safety PM]', reporter_name = 'Janel', reporter_title = 'AI Safety PM', reporter_description = 'Celebrates safer behavior only after checking whether the model became secure or just more irritating in a blazer.' WHERE id IN ('DRIFT-789', 'DRIFT-790');
UPDATE community_backlog SET reporter = 'Bruno [Principal MLOps Engineer]', reporter_name = 'Bruno', reporter_title = 'Principal MLOps Engineer', reporter_description = 'Suspects every long-running batch job is secretly scoring the present using assumptions embalmed in a previous quarter.' WHERE id IN ('DRIFT-791', 'DRIFT-792');
UPDATE community_backlog SET reporter = 'Naomi [Staff Researcher]', reporter_name = 'Naomi', reporter_title = 'Staff Researcher', reporter_description = 'Has seen enough mushy model answers to know evasiveness deserves its own crime category.' WHERE id IN ('DRIFT-793', 'DRIFT-794');
UPDATE community_backlog SET reporter = 'Mirek [Chief AI Operations Officer]', reporter_name = 'Mirek', reporter_title = 'Chief AI Operations Officer', reporter_description = 'Knows there is a special class of outage where every dashboard is green and the model still feels like a useless coworker.' WHERE id IN ('DRIFT-795');

-- SHARD: databases, storage, replication, partitioning, and distributed state foolishness
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Distributed Storage Architect Helena
-- REPORTER: Helena | Distributed Storage Architect | Believes too many services ask for their own database the way toddlers ask for a castle.
('SHARD-796', 'Make New Services Explain Why They Need Their Own Database',
 'We have confused service maturity with owning a private pile of tables. Force every new service to justify its personal database before independence turns into storage cosplay and everyone starts paying for emotional boundaries in IOPS.',
 'make new services justify their own database',
  144),

('SHARD-797', 'Translate Replica Lag into the Exact Lie the User Is Experiencing',
 'Milliseconds mean nothing until a customer sees stale data, retries a purchase, or watches the system disagree with itself in public. Convert lag into human-language failure modes so Support can tell whether the platform is currently serving old truth, mixed truth, or delayed regret.',
 'translate replica lag into user-facing lies',
  144),

-- Principal DBA Omar
-- REPORTER: Omar | Principal DBA | Reviews schema changes in units of sleep deprivation, broken plans, and how much of Saturday they look prepared to steal.
('SHARD-798', 'Rate Every Migration by How Much Weekend It Threatens to Consume',
 'Migration risk is still being described too politely. Add a brutally direct field for how likely a schema change is to eat dinner plans, sleep, and the last intact nerve of whoever gets paged during the rollout.',
 'rate migrations by weekend damage',
  89),

('SHARD-799', 'Detect SQL That Reads Like Revenge Against the Future',
 'Some queries are not merely slow. They are little hate letters to whoever has to maintain them next, written in nested subqueries and cheerful cartesian violence. Flag the ones that feel like an exit interview stored in production.',
 'detect sql written to punish the future',
  144),

-- Data Platform PM Ren
-- REPORTER: Ren | Data Platform PM | Has seen too many partition strategies dressed up as rigor when they were really chosen to end a meeting.
('SHARD-800', 'Document Which Partitioning Decisions Were Made by Analysis and Which Were Made by Fatigue',
 'Our docs keep pretending every partition scheme was born from clean workload reasoning when some were clearly chosen because three senior people were tired and a roadmap needed to move. Record the truth before history upgrades exhaustion into architecture.',
 'document which partitioning calls came from fatigue',
  89),

('SHARD-801', 'Force Every Cache to Declare Which Truth It Is Allowed to Betray',
 'We talk about caches in terms of speed and leave out the part where they temporarily lie about freshness, counts, ordering, permissions, or the recent death of a record. Make each cache sign a little moral contract before performance keeps freelancing with reality.',
 'add honesty header to cache responses',
  144),

-- Storage Cost Analyst Mirella
-- REPORTER: Mirella | Storage Cost Analyst | Can tell the difference between audit evidence and damp digital compost by smell alone.
('SHARD-802', 'Stop the Object Store from Preserving Trash Just Because It Found a Folder',
 'We are retaining screenshots, exports, orphaned zips, model artifacts, and one deeply suspicious finals directory like S3 is a grief counselor. Tighten lifecycle policy before the buckets finish turning into versioned compost heaps.',
 'stop object store preserving trash forever',
  89),

('SHARD-803', 'Mark Which Backups We Believe In Only as a Matter of Culture',
 'Some backup chains are tested. Others are simply loved. Add a label for the sets sustained mainly by dashboards, naming conventions, and organizational faith so the next restore drill does not accidentally become a reveal party.',
 'mark backups believed in by culture alone',
  144),

-- Replication Engineer Pavel
-- REPORTER: Pavel | Replication Engineer | Distrusts secondary regions described as ready until they have survived both production load and leadership attention.
('SHARD-804', 'Stop Pretending the Secondary Region Is Emotionally Ready for a Real Failover',
 'Disaster docs keep describing standby regions like eager understudies waiting for applause. In reality, some are healthy, some are hopeful, and some are one hard incident away from discovering entirely new ways to disappoint us in another geography.',
 'stop pretending the secondary region is ready',
  144),

('SHARD-805', 'Write One Honest Message for When the System Forgets You Briefly',
 'There is a recurring distributed-systems moment where the user does everything right and the platform responds with temporary amnesia. Standardize the explanation so every team stops inventing its own awkward apology for state taking the scenic route to existence.',
 'write honest message for temporary forgetting',
  144),

-- Search Infrastructure Lead Tamsin
-- REPORTER: Tamsin | Search Infrastructure Lead | Has grown tired of async ingestion being treated like a personality trait instead of a missing-doc factory.
('SHARD-806', 'Publish How Many Search Documents Are Missing Because Async Is Not Magic',
 'Index freshness sounds elegant until you count the documents that quietly never arrived. Publish the missing-doc number and the average delay to discover it before search keeps borrowing credibility from architecture words it has not earned.',
 'publish how many search documents are missing',
  144),

('SHARD-807', 'Put a Small Tragedy Plaque on Every Denormalized Table',
 'Denormalized tables are often memorials to one horrific join that once hurt someone badly enough to win budget. Document the original wound so future engineers know this table exists because speed was purchased with pain.',
 'put tragedy plaques on denormalized tables',
  89),

-- Chief Persistence Officer Lyle
-- REPORTER: Lyle | Chief Persistence Officer | Knows shared query layers are one bad season away from becoming centralized museums of stale assumptions.
('SHARD-808', 'Audit the Shared Data Layer for Common Sense Versus Shared Bad Habits',
 'Centralized query helpers promise consistency and often deliver a federal archive of stale filters, optimistic joins, and one ancient permission shortcut nobody remembers approving. Audit the common layer before reuse turns into organized delusion.',
 'audit shared data for sense versus habits',
  144),

('SHARD-809', 'Forecast When a Queue Backlog Will Stop Being Delay and Start Being Lore',
 'Some backlogs are not incidents yet. They are just quietly growing until people start scheduling around them and giving them nicknames. Add a mythology forecast before recoverable lag hardens into company weather.',
 'forecast when backlog becomes lore',
  89),

-- VP of Data Existence Corin
-- REPORTER: Corin | VP of Data Existence | Works in the gap between official source of truth and whichever spreadsheet currently has actual political power.
('SHARD-810', 'Stamp Every Read Path with Which System It Thinks Is Canonical',
 'We no longer need a philosophical map. We need labels. Every dashboard, export, API response, and sync job should say which system it treats as canon so people can spot sovereignty disputes before another spreadsheet quietly becomes head of state.',
 'stamp read paths with their canon',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Helena [Distributed Storage Architect]', reporter_name = 'Helena', reporter_title = 'Distributed Storage Architect', reporter_description = 'Believes too many services ask for their own database the way toddlers ask for a castle.' WHERE id IN ('SHARD-796', 'SHARD-797');
UPDATE community_backlog SET reporter = 'Omar [Principal DBA]', reporter_name = 'Omar', reporter_title = 'Principal DBA', reporter_description = 'Reviews schema changes in units of sleep deprivation, broken plans, and how much of Saturday they look prepared to steal.' WHERE id IN ('SHARD-798', 'SHARD-799');
UPDATE community_backlog SET reporter = 'Ren [Data Platform PM]', reporter_name = 'Ren', reporter_title = 'Data Platform PM', reporter_description = 'Has seen too many partition strategies dressed up as rigor when they were really chosen to end a meeting.' WHERE id IN ('SHARD-800', 'SHARD-801');
UPDATE community_backlog SET reporter = 'Mirella [Storage Cost Analyst]', reporter_name = 'Mirella', reporter_title = 'Storage Cost Analyst', reporter_description = 'Can tell the difference between audit evidence and damp digital compost by smell alone.' WHERE id IN ('SHARD-802', 'SHARD-803');
UPDATE community_backlog SET reporter = 'Pavel [Replication Engineer]', reporter_name = 'Pavel', reporter_title = 'Replication Engineer', reporter_description = 'Distrusts secondary regions described as ready until they have survived both production load and leadership attention.' WHERE id IN ('SHARD-804', 'SHARD-805');
UPDATE community_backlog SET reporter = 'Tamsin [Search Infrastructure Lead]', reporter_name = 'Tamsin', reporter_title = 'Search Infrastructure Lead', reporter_description = 'Has grown tired of async ingestion being treated like a personality trait instead of a missing-doc factory.' WHERE id IN ('SHARD-806', 'SHARD-807');
UPDATE community_backlog SET reporter = 'Lyle [Chief Persistence Officer]', reporter_name = 'Lyle', reporter_title = 'Chief Persistence Officer', reporter_description = 'Knows shared query layers are one bad season away from becoming centralized museums of stale assumptions.' WHERE id IN ('SHARD-808', 'SHARD-809');
UPDATE community_backlog SET reporter = 'Corin [VP of Data Existence]', reporter_name = 'Corin', reporter_title = 'VP of Data Existence', reporter_description = 'Works in the gap between official source of truth and whichever spreadsheet currently has actual political power.' WHERE id IN ('SHARD-810');

-- LOOT: marketplaces, affiliates, referrals, creator payouts, and monetized incentive sludge
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Affiliate Growth Director Simone
-- REPORTER: Simone | Affiliate Growth Director | Can spot the difference between love of product and six cousins sharing one coupon spreadsheet.
('LOOT-811', 'Teach the Referral Program the Difference Between Advocacy and a Discount Cartel',
 'Our referral engine keeps mistaking organized coupon banditry for heartfelt product love. Add controls that separate genuine recommendations from families, side emails, and mysteriously identical device fingerprints running a rebate business out of the same kitchen.',
 'teach referrals advocacy versus discount cartels',
  144),

('LOOT-812', 'Add a Payout Rule for Behavior That Is Legal but Obviously Filthy',
 'We keep seeing partner behavior that technically follows the rules while spiritually living in a storm drain. Add a clause for loophole farming, fluorescent opportunism, and other perfectly compliant grifts that make the whole program smell damp.',
 'add payout rule for legal filth',
  144),

-- Marketplace Revenue PM Devin
-- REPORTER: Devin | Marketplace Revenue PM | Tracks how many ecosystem success stories are really third parties charging money to undo our own bad UX.
('LOOT-813', 'Flag Marketplace Apps Whose Main Feature Is Fixing Our Product for Money',
 'An alarming share of third-party apps now monetize by removing pain we personally installed. Detect extensions whose pitch is basically the platform but less annoying so we can finally measure outsourced repentance as a revenue category.',
 'flag apps that fix us for money',
  144),

('LOOT-814', 'Make Revenue Splits Explain Why We Deserve This Much of Someone Else''s Hustle',
 'Revenue-share percentages keep pretending to be laws of nature when many are just leftovers from one good deck and a confident offsite. Add a note explaining whether the cut exists because of infrastructure, distribution, brand leverage, or old-fashioned swagger.',
 'make revenue splits justify stealing this much hustle',
  144),

-- Creator Economy Manager Elodie
-- REPORTER: Elodie | Creator Economy Manager | Has developed a strong allergy to creators who call coupon choreography community building.
('LOOT-815', 'Stop Paying Creator Bonuses for Coupon Scavenger Hunts',
 'Some creators bring genuine users. Others teach their audience to sprint through offers with military-grade redemption literacy. Tighten the bonus pool before synchronized discount foraging keeps getting paid as sustainable growth.',
 'stop paying creator bonuses for coupon scavenger hunts',
  144),

('LOOT-816', 'Reclassify Ambassadors Who Chant Their Discount Code Like Retail Clergy',
 'If someone mentions their code three times in one video, this is no longer community. It is a storefront with ring lights. Move the code-chanters into retail and stop calling checkout energy by a softer name.',
 'reclassify ambassadors chanting discount codes',
  144),

-- Referral Systems Engineer Tomas
-- REPORTER: Tomas | Referral Systems Engineer | Knows some "power users" are really just small organized rings with nice calendar discipline.
('LOOT-817', 'Detect When One "Super Referrer" Is Actually a Tiny Organized Ring',
 'Certain invite-graph nodes convert so cleanly and so symmetrically that the only explanations are supernatural charisma or bookkeeping. Add ring detection before we keep celebrating one legendary customer who is really running a small acquisition mill across three browsers.',
 'detect when super referrers are tiny rings',
  144),

('LOOT-818', 'Rewrite Payout Hold Messages So They Sound Careful Instead of Theologically Nervous',
 'Our hold notices currently read like a bank trying to confess uncertainty through passive voice and incense. Rewrite them so they sound precise and human without revealing how much fraud review still involves regex, vibes, and someone staring too long at a dashboard.',
 'rewrite payout hold messages',
  89),

-- Promotions Strategist Kaia
-- REPORTER: Kaia | Promotions Strategist | Catalogs discounts by whether they were born from strategy or from somebody needing a meeting to end.
('LOOT-819', 'Tag Which Coupons Were Strategic and Which Were Invented to Calm a Room Down',
 'Our discount catalog includes thoughtful growth levers, conference leftovers, executive promises, and pure social exhaustion immortalized in promo-code form. Mark the origin of each code before Finance keeps treating panic coupons like timeless policy.',
 'tag strategic coupons versus panic coupons',
  89),

('LOOT-820', 'Predict Whether a Promo Will Attract Customers or Seasonal Coupon Birds',
 'Not every promotion recruits the kind of user we claim to want. Some attract buyers. Others summon migratory discount creatures who appear only when pricing apologizes for itself. Forecast the behavioral type before margin erosion gets called efficient acquisition.',
 'predict whether promos attract customers or coupon birds',
  144),

-- Commerce Analyst Hugo
-- REPORTER: Hugo | Commerce Analyst | Distrusts glowing vendor reviews that sound like a coordinated poetry workshop for polite bots.
('LOOT-821', 'Penalize Vendors Whose Reviews Sound Like ChatGPT Studying Sincerity',
 'Marketplace reviews have started showing suspiciously identical warmth, gratitude, and adjective discipline. Dock the listings whose social proof feels less like customer feedback and more like five-star slurry composed in formation.',
 'penalize vendors with ai-sincere reviews',
  144),

('LOOT-822', 'Give Affiliate Attribution a Way to Say Nobody Cleanly Deserves This Sale',
 'At some point every model ends up with too many plausible owners and not enough dignity. Add an explicit uncertainty mode so the system can say ten hands touched this purchase and none get to act innocent about it.',
 'let affiliate attribution say nobody deserves it',
  144),

-- VP of Ecosystem Revenue Rafi
-- REPORTER: Rafi | VP of Ecosystem Revenue | Wants topline volume annotated whenever it was achieved through enough coupon acrobatics to count as floor exercise.
('LOOT-823', 'Label the Gross Bookings That Required Coupon Acrobatics as "Inventive"',
 'We keep reporting marketplace volume without noting how much of it was generated by incognito tabs, stacked codes, helpful cousins, and other feats of program gymnastics. Mark those wins as Inventive so growth stops flattering the wrong athletes.',
 'label coupon-acrobatics bookings as inventive',
  144),

('LOOT-824', 'Force Every Partner Tier to Explain Why It Exists Beyond Gold-Level Feelings',
 'Our tier model has become a loyalty religion with metal names, badge psychology, and margin perks no one has re-justified since launch week. Make each tier explain itself before prestige keeps masquerading as channel strategy.',
 'make partner tiers justify their feelings',
  89),

-- Chief Marketplace Officer Jules
-- REPORTER: Jules | Chief Marketplace Officer | Assumes the smartest abuse pattern is already being invented by someone who read the docs more carefully than we did.
('LOOT-825', 'Build a Simulator for Payout Abuse That Has Not Happened Yet but Obviously Will',
 'The best marketplace scams usually arrive after the payout logic is live, public, and soaked in optimism. Simulate code chaining, self-referrals, stacked incentives, partner collusion, and other future masterpieces before they start billing us in arrears.',
 'build simulator for the payout abuse coming soon',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Simone [Affiliate Growth Director]', reporter_name = 'Simone', reporter_title = 'Affiliate Growth Director', reporter_description = 'Can spot the difference between love of product and six cousins sharing one coupon spreadsheet.' WHERE id IN ('LOOT-811', 'LOOT-812');
UPDATE community_backlog SET reporter = 'Devin [Marketplace Revenue PM]', reporter_name = 'Devin', reporter_title = 'Marketplace Revenue PM', reporter_description = 'Tracks how many ecosystem success stories are really third parties charging money to undo our own bad UX.' WHERE id IN ('LOOT-813', 'LOOT-814');
UPDATE community_backlog SET reporter = 'Elodie [Creator Economy Manager]', reporter_name = 'Elodie', reporter_title = 'Creator Economy Manager', reporter_description = 'Has developed a strong allergy to creators who call coupon choreography community building.' WHERE id IN ('LOOT-815', 'LOOT-816');
UPDATE community_backlog SET reporter = 'Tomas [Referral Systems Engineer]', reporter_name = 'Tomas', reporter_title = 'Referral Systems Engineer', reporter_description = 'Knows some "power users" are really just small organized rings with nice calendar discipline.' WHERE id IN ('LOOT-817', 'LOOT-818');
UPDATE community_backlog SET reporter = 'Kaia [Promotions Strategist]', reporter_name = 'Kaia', reporter_title = 'Promotions Strategist', reporter_description = 'Catalogs discounts by whether they were born from strategy or from somebody needing a meeting to end.' WHERE id IN ('LOOT-819', 'LOOT-820');
UPDATE community_backlog SET reporter = 'Hugo [Commerce Analyst]', reporter_name = 'Hugo', reporter_title = 'Commerce Analyst', reporter_description = 'Distrusts glowing vendor reviews that sound like a coordinated poetry workshop for polite bots.' WHERE id IN ('LOOT-821', 'LOOT-822');
UPDATE community_backlog SET reporter = 'Rafi [VP of Ecosystem Revenue]', reporter_name = 'Rafi', reporter_title = 'VP of Ecosystem Revenue', reporter_description = 'Wants topline volume annotated whenever it was achieved through enough coupon acrobatics to count as floor exercise.' WHERE id IN ('LOOT-823', 'LOOT-824');
UPDATE community_backlog SET reporter = 'Jules [Chief Marketplace Officer]', reporter_name = 'Jules', reporter_title = 'Chief Marketplace Officer', reporter_description = 'Assumes the smartest abuse pattern is already being invented by someone who read the docs more carefully than we did.' WHERE id IN ('LOOT-825');

-- GRIME: abuse prevention, bot farms, fake traffic, spam markets, and anti-fraud grime
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Abuse Prevention Lead Petra
-- REPORTER: Petra | Abuse Prevention Lead | Distinguishes hostile bot traffic from customers building tragic little automations out of need, hope, and headless Chromium.
('GRIME-826', 'Teach the Bot Detector the Difference Between Attackers and Sad Customer Contraptions',
 'We keep flattening together credential crews, spam swarms, low-budget scrapers, and cursed customer automations that exist only because our limits drove someone into browser scripting. Split the species before anti-abuse starts punishing despair as fraud.',
 'teach bot detectors attackers versus customer contraptions',
  144),

('GRIME-827', 'Make CAPTCHA Reviews Admit How Much Human Suffering We Bought for Thirty Seconds of Safety',
 'CAPTCHAs keep getting approved like free protection when they mostly tax real people for the privilege of delaying one determined script and a token farm. Add a harm note so we can see exactly how much of our defense budget is being paid in irritation.',
 'make captcha reviews admit the human suffering cost',
  144),

-- Fraud Intelligence Manager Amir
-- REPORTER: Amir | Fraud Intelligence Manager | Can smell an account farm the way some people smell rain.
('GRIME-828', 'Flag Signup Clusters That Look More Like a Spreadsheet Experiment Than a User Base',
 'Some new accounts arrive with the tidy timing, disposable inboxes, and prepaid-card choreography of someone running a lunch-break science fair in fraud. Catch the lab-grown cohorts before they develop invoices, tickets, and civil rights inside the system.',
 'flag signup clusters that look like spreadsheet fiction',
  144),

('GRIME-829', 'Give Spam a Taxonomy Rich Enough to Humiliate the Current Blocklist',
 'We still call everything spam when the incoming sludge clearly includes coupon parasites, credential composters, lead-form necromancers, and polite synthetic trash with ambitions. Name the grime properly before one tired regex keeps pretending it governs an ecosystem.',
 'give spam a taxonomy that humiliates blocklists',
  144),

-- Identity Integrity PM Sol
-- REPORTER: Sol | Identity Integrity PM | Specializes in fraud performed by one real human, six cheap scripts, and a cousin who owns three SIM cards.
('GRIME-830', 'Detect Fraud That Is Part Human, Part Script, and Fully Determined',
 'Not every suspicious signup is a pure bot. Some are blended productions involving automation, reused devices, fake emails, and one person willing to click through friction if the arbitrage is warm enough. Detect the choreography before we keep waiting for a robot costume obvious enough to satisfy policy.',
 'detect fraud that is half human',
  144),

('GRIME-831', 'Label Which Parts of Device Fingerprinting Are Science and Which Parts Are Vibes',
 'Device intelligence is useful, but some of its certainty comes from polished suspicion, vendor folklore, and a green dashboard nobody has challenged in months. Add method notes before probability with swagger starts writing policy by itself.',
 'label device fingerprinting science versus vibes',
  89),

-- Operations Risk Engineer Lena
-- REPORTER: Lena | Operations Risk Engineer | Reviews chargebacks the way a coroner reviews alibis.
('GRIME-832', 'Tag Chargebacks Filed Eleven Minutes After Delivery as Curated Forgetfulness',
 'Some disputes are fraud, some are buyer''s remorse, and some are people hitting reverse the second the package lands because they know the bank is faster than Support. Label the suspiciously instant ones before the reports keep pretending every chargeback arrived from the same moral climate.',
 'tag instant chargebacks as curated forgetfulness',
  144),

('GRIME-833', 'Retire Anti-Abuse Rules After the Attackers Leave and the Headache Stays',
 'Too many controls outlive the threat that summoned them and remain behind as permanent friction with a touching war-story backstory. Review old defenses before yesterday''s bot fight hardens into today''s user-hostility tax.',
 'retire anti-abuse rules after attackers leave',
  89),

-- Spam Systems Architect Nico
-- REPORTER: Nico | Spam Systems Architect | Has no patience for junk mail that learned perfect manners from a scam corpus and now expects applause.
('GRIME-834', 'Catch AI Spam That Sounds Weirdly Polite and Therefore More Dangerous',
 'A fresh wave of junk is arriving grammatically perfect, emotionally urgent, and impeccably courteous in the style of inheritance scams and fake procurement messages. Update the filters before nice manners become the new smuggling compartment.',
 'catch polite ai spam',
  144),

('GRIME-835', 'Give Moderation a View for Posts That Are Legal but Obviously Here to Rot the Place',
 'Some content breaks no rule and still makes the site measurably worse by lowering conversation quality, search usefulness, and the average reader''s will to continue after coffee. Add a rot view before technically compliant sludge earns long-term tenancy.',
 'show moderation the legal but obviously rotten posts',
  89),

-- Trust & Safety Director Miriam
-- REPORTER: Miriam | Trust & Safety Director | Can tell when an appeal reads less like innocence and more like a professional trying on innocence for the eighth time.
('GRIME-836', 'Highlight Appeals That Sound Innocent Because the User Has Practiced This Routine Elsewhere',
 'Some appeals are sincere. Others are polished performances by people who have learned the exact tone of injured confusion that travels well across platforms. Score procedural fluency so practiced innocence stops winning on diction alone.',
 'highlight appeals that sound innocent',
  144),

('GRIME-837', 'Add a "How Bad Would This Look as a Screenshot?" Column to Enforcement',
 'A perfectly defensible decision can still look deranged once someone strips away context and posts one red cell with a caption. Add a screenshot embarrassment column before internal logic gets mugged by virality for sport.',
 'add screenshot embarrassment column to enforcement',
  89),

-- Security Automation PM Idris
-- REPORTER: Idris | Security Automation PM | Wants the scraper stack to reserve special contempt for the actors monetizing public endpoints like unattended graveyards.
('GRIME-838', 'Teach the Scraper Defense Stack the Difference Between Nosy and Grave-Robbing',
 'Not all scraping is equal. Some actors are benchmarking, some are indexing, and some are licking every endpoint with fifty rotating proxies and a resale plan. Classify them better before the stack spends equal anger on curiosity and organized extraction.',
 'teach scraper defense nosy versus grave-robbing',
  144),

('GRIME-839', 'Detect Ban Evaders Who Think New Glasses Count as a New Identity',
 'We keep seeing people return with slightly cleaner bios, fresher emails, and the serene belief that cosmetic novelty reset the moral universe. Add weak-signal correlation before disguise culture starts beating trust with accessories and optimism.',
 'detect ban evaders hiding behind new glasses',
  89),

-- Chief Integrity Officer Eva
-- REPORTER: Eva | Chief Integrity Officer | Refuses to clap for growth made of bots, spam, coupon goblins, and other damp substances pretending to be traction.
('GRIME-840', 'Stamp Bot-Driven Growth as Compost and Stop Complimenting It',
 'Not every upward line deserves celebration. Some growth is just fake accounts, promo abuse, review laundering, and several buckets of damp synthetic nonsense. Label the dirtiest gains Compost before rotten traction keeps showing up in QBRs wearing a tie.',
 'stamp bot growth as compost',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Petra [Abuse Prevention Lead]', reporter_name = 'Petra', reporter_title = 'Abuse Prevention Lead', reporter_description = 'Distinguishes hostile bot traffic from customers building tragic little automations out of need, hope, and headless Chromium.' WHERE id IN ('GRIME-826', 'GRIME-827');
UPDATE community_backlog SET reporter = 'Amir [Fraud Intelligence Manager]', reporter_name = 'Amir', reporter_title = 'Fraud Intelligence Manager', reporter_description = 'Can smell an account farm the way some people smell rain.' WHERE id IN ('GRIME-828', 'GRIME-829');
UPDATE community_backlog SET reporter = 'Sol [Identity Integrity PM]', reporter_name = 'Sol', reporter_title = 'Identity Integrity PM', reporter_description = 'Specializes in fraud performed by one real human, six cheap scripts, and a cousin who owns three SIM cards.' WHERE id IN ('GRIME-830', 'GRIME-831');
UPDATE community_backlog SET reporter = 'Lena [Operations Risk Engineer]', reporter_name = 'Lena', reporter_title = 'Operations Risk Engineer', reporter_description = 'Reviews chargebacks the way a coroner reviews alibis.' WHERE id IN ('GRIME-832', 'GRIME-833');
UPDATE community_backlog SET reporter = 'Nico [Spam Systems Architect]', reporter_name = 'Nico', reporter_title = 'Spam Systems Architect', reporter_description = 'Has no patience for junk mail that learned perfect manners from a scam corpus and now expects applause.' WHERE id IN ('GRIME-834', 'GRIME-835');
UPDATE community_backlog SET reporter = 'Miriam [Trust & Safety Director]', reporter_name = 'Miriam', reporter_title = 'Trust & Safety Director', reporter_description = 'Can tell when an appeal reads less like innocence and more like a professional trying on innocence for the eighth time.' WHERE id IN ('GRIME-836', 'GRIME-837');
UPDATE community_backlog SET reporter = 'Idris [Security Automation PM]', reporter_name = 'Idris', reporter_title = 'Security Automation PM', reporter_description = 'Wants the scraper stack to reserve special contempt for the actors monetizing public endpoints like unattended graveyards.' WHERE id IN ('GRIME-838', 'GRIME-839');
UPDATE community_backlog SET reporter = 'Eva [Chief Integrity Officer]', reporter_name = 'Eva', reporter_title = 'Chief Integrity Officer', reporter_description = 'Refuses to clap for growth made of bots, spam, coupon goblins, and other damp substances pretending to be traction.' WHERE id IN ('GRIME-840');

-- CHANT: certifications, enablement academies, consultant liturgy, and partner doctrine
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Enablement Director Beatrice
-- REPORTER: Beatrice | Enablement Director | Builds certifications that manufacture authority, LinkedIn posts, and only the faintest accidental contact with real product friction.
('CHANT-841', 'Design the Certification Exam to Feel Impressive Without Accidentally Proving Competence',
 'A successful certification does not need to verify skill. It needs to verify stamina, vocabulary, and the ability to redraw our architecture under fluorescent pressure. Tune the exam so it bestows prestige while carefully avoiding too much reality.',
 'generate certification quiz for partner portal',
  144),

('CHANT-842', 'Teach Partners to Sound Certain About Features They Have Never Actually Touched',
 'The field keeps asking for hands-on product time when what sells is composure and nouns. Add a confidence module for talking about capability at elegant distance without letting reality crowd the presentation.',
 'write demo copy for untouched features',
  144),

-- Solutions Evangelist Marco
-- REPORTER: Marco | Solutions Evangelist | Specializes in toggling between engineering gravity and prophetic vapor using the same three clicks and a better blazer.
('CHANT-843', 'Split the Demo Scripts into Technical Truth and Vision Fog',
 'Some audiences want architecture. Others want a mood board with authentication. Fork the scripts so presenters can pivot between implementation details and destiny without revealing both modes were stitched together from the same tiny live demo.',
 'split demo script into truth and fog',
  89),

('CHANT-844', 'Make Every New Transformation Deck Acknowledge the Corpse of the Previous One',
 'We keep launching fresh consulting decks like the last wave simply dissolved into the soil. Add one mandatory slide explaining why the prior transformation did not save anyone before the new one begins preaching renewal with a straight face.',
 'force deck to mention last disaster',
  144),

-- Partner Programs PM Nia
-- REPORTER: Nia | Partner Programs PM | Has accepted that some people deserve promotion mainly because they can say journey like it came from a spa.
('CHANT-845', 'Create a Partner Tier for People Exceptionally Good at Saying "Journey"',
 'The ladder currently rewards sales and certifications while ignoring one field-critical skill: saying value realization, operating cadence, and transformation journey with enough warmth to keep budget alive for one more quarter.',
 'add journey tier to partner portal',
  89),

('CHANT-846', 'End Every Enablement Webinar with a Quiz That Mostly Measures Belief',
 'We have spent too long testing recall when the real question is whether attendees swallowed the worldview. Add questions that confirm doctrinal uptake before realism leaks into the academy.',
 'end webinars with belief quiz',
  144),

-- Senior Consultant Pavel
-- REPORTER: Pavel | Senior Consultant | Sells maturity ladders to rooms that badly want a number for their vibes.
('CHANT-847', 'Stop Letting Level 5 Sound Like a Medically Verified Achievement',
 'Our maturity model has drifted from diagnostic tool into ceremonial staircase. Add notes explaining that Level 5 is not science. It is a laminated aspiration with friendly scoring and good workshop energy.',
 'rename level 5 to something normal',
  89),

('CHANT-848', 'Separate Real Work from Work Grown Solely to Feed the Steering Committee',
 'Some workstreams exist to ship value. Others exist so governance can feel its own texture. Add a ceremonial-work section so plans stop pretending executive nutrition and actual delivery are the same kind of labor.',
 'split committee work from delivery tasks',
  144),

-- Academy Content Lead Sarai
-- REPORTER: Sarai | Academy Content Lead | Can detect when a course is just a brochure with homework, a badge, and the smell of funnel residue.
('CHANT-849', 'Catch Courses That Are Just Product Brochures Wearing Homework',
 'Some learning paths promise mastery and deliver beautifully formatted marketing with quizzes attached. Add a brochure detector before promotional intent keeps laundering itself into pedagogy through PDFs and completion bars.',
 'flag courses that are marketing brochures',
  89),

('CHANT-850', 'Expire Badges Fast Enough to Keep the Anxiety Economy Healthy',
 'Permanent credentials create dangerous pools of calm. Keep badges expiring often enough to sustain recertification, insecurity, and the reliable hum of professionals paying to remain freshly anointed.',
 'expire badges every 90 days',
  144),

-- Alliance Director Quentin
-- REPORTER: Quentin | Alliance Director | Tracks how much pipeline exists because two logos enjoy meeting each other in nice decks.
('CHANT-851', 'Measure the Co-Sell Pipeline That Exists Mostly Because Everyone Enjoys the Ritual',
 'Some alliances generate revenue. Others generate recurring calls, mutual praise, and the warm sensation of being near another company''s logo. Add a ceremonial-only flag to the partner CRM before atmosphere starts forecasting itself as pipeline.',
 'flag ceremonial co-sell pipeline',
  144),

('CHANT-852', 'Add a Field for How Much of the QBR Was Pure Presentational Cardio',
 'Quarterly reviews often contain equal parts progress and synchronized motion. Add a required field for the labor spent making things look alive, aligned, and chart-shaped so everyone can stop mistaking slide respiration for business output.',
 'add qbr cardio field to crm',
  89),

-- Chief Ecosystem Prophet Leona
-- REPORTER: Leona | Chief Ecosystem Prophet | Maintains the sacred vocabulary used when software quietly turns back into consulting but the margin story must remain elegant.
('CHANT-853', 'Add a Deck-Safe Phrasebook for "This Is Mostly Services Now"',
 'Sometimes the product story quietly mutates into workshops, managed services, and consultants with laptops while the deck still wants to sound product-led. Add a phrasebook panel to the sales materials before truth bends the wrong way in public.',
 'generate deck-safe phrases for services',
  144),

('CHANT-854', 'Install a Clock That Shows When Advisory Becomes Incense',
 'There is always a point in executive advisory where problem-solving dissolves into premium atmosphere, framework chanting, and high-end ambiguity that invoices beautifully. Add a visible session timer with an Incense threshold so at least the team knows when the room crossed into paid liturgy.',
 'add incense score to advisory sessions',
  144),

-- VP of Commercial Doctrine Rowan
-- REPORTER: Rowan | VP of Commercial Doctrine | Catalogs strategic phrases from their birth as metaphors to their final form as budget-owning weather systems.
('CHANT-855', 'Build a Strategic Phrase Registry in the Planning Tool',
 'The company runs on a growing family of phrases that began as metaphors and ended with budgets, OKRs, and annual summits. Add a phrase registry in the planning tool so each one shows origin, sponsor, downstream programs, and whether it still refers to reality or only to its descendants.',
 'add phrase registry to planning tool',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Beatrice [Enablement Director]', reporter_name = 'Beatrice', reporter_title = 'Enablement Director', reporter_description = 'Builds certifications that manufacture authority, LinkedIn posts, and only the faintest accidental contact with real product friction.' WHERE id IN ('CHANT-841', 'CHANT-842');
UPDATE community_backlog SET reporter = 'Marco [Solutions Evangelist]', reporter_name = 'Marco', reporter_title = 'Solutions Evangelist', reporter_description = 'Specializes in toggling between engineering gravity and prophetic vapor using the same three clicks and a better blazer.' WHERE id IN ('CHANT-843', 'CHANT-844');
UPDATE community_backlog SET reporter = 'Nia [Partner Programs PM]', reporter_name = 'Nia', reporter_title = 'Partner Programs PM', reporter_description = 'Has accepted that some people deserve promotion mainly because they can say journey like it came from a spa.' WHERE id IN ('CHANT-845', 'CHANT-846');
UPDATE community_backlog SET reporter = 'Pavel [Senior Consultant]', reporter_name = 'Pavel', reporter_title = 'Senior Consultant', reporter_description = 'Sells maturity ladders to rooms that badly want a number for their vibes.' WHERE id IN ('CHANT-847', 'CHANT-848');
UPDATE community_backlog SET reporter = 'Sarai [Academy Content Lead]', reporter_name = 'Sarai', reporter_title = 'Academy Content Lead', reporter_description = 'Can detect when a course is just a brochure with homework, a badge, and the smell of funnel residue.' WHERE id IN ('CHANT-849', 'CHANT-850');
UPDATE community_backlog SET reporter = 'Quentin [Alliance Director]', reporter_name = 'Quentin', reporter_title = 'Alliance Director', reporter_description = 'Tracks how much pipeline exists because two logos enjoy meeting each other in nice decks.' WHERE id IN ('CHANT-851', 'CHANT-852');
UPDATE community_backlog SET reporter = 'Leona [Chief Ecosystem Prophet]', reporter_name = 'Leona', reporter_title = 'Chief Ecosystem Prophet', reporter_description = 'Maintains the sacred vocabulary used when software quietly turns back into consulting but the margin story must remain elegant.' WHERE id IN ('CHANT-853', 'CHANT-854');
UPDATE community_backlog SET reporter = 'Rowan [VP of Commercial Doctrine]', reporter_name = 'Rowan', reporter_title = 'VP of Commercial Doctrine', reporter_description = 'Catalogs strategic phrases from their birth as metaphors to their final form as budget-owning weather systems.' WHERE id IN ('CHANT-855');

-- TANGLE: orchestration layers, approvals, BPM, workflow automation, and business-process labyrinths
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Workflow Platform Lead Johanna
-- REPORTER: Johanna | Workflow Platform Lead | Watches approvals breed in captivity and insists every new delay explain what older delay it came to marry.
('TANGLE-856', 'Make Every New Approval Step Name the Delay It Came to Marry',
 'Approvals keep multiplying like latency is a cherished native plant. Force every new step to say which existing delay, confusion, or awkward human moment it plans to formalize into a checkpoint.',
 'make approval steps name their delay',
  144),

('TANGLE-857', 'Detect Workflows That Used to Be One Decent Conversation',
 'Some processes began as one normal chat between adults and now exist as three forms, five statuses, and a soft hum of regret. Flag the places where BPM took a conversation and turned it into civic paperwork.',
 'find workflows that used to be conversations',
  144),

-- Enterprise Process PM Malik
-- REPORTER: Malik | Enterprise Process PM | Specializes in noticing when a simple request has been upgraded into a full portal because somebody confused structure with progress.
('TANGLE-858', 'Add a "This Could Have Been a Slack Message" Warning to Intake Portals',
 'Some requests now require categories, impact statements, dependency notes, and a dropdown that really just means someone else should see this soon. Mark the ones that have crossed from helpful structure into administrative cosplay.',
 'add this could have been slack warning',
  144),

('TANGLE-859', 'Label Automations That Save Time Versus Automations That Save Eye Contact',
 'A surprising amount of workflow automation exists not to move faster, but to avoid awkward refusals, clarifying questions, and the emotional cost of telling another adult no. Tag the difference so the software stops pretending all convenience is throughput.',
 'label time-saving versus eye-contact-saving automations',
  144),

-- Process Governance Analyst Helena
-- REPORTER: Helena | Process Governance Analyst | Studies the exact minute an escalation stops solving anything and starts rotating blame through better titles.
('TANGLE-860', 'Mark the Point Where Escalation Stops Solving and Starts Circulating',
 'Some escalation paths do not increase clarity. They just rotate accountability around the org chart until everybody has touched the issue and nobody has improved it. Add a circulation marker before motion gets mistaken for progress again.',
 'mark when escalation starts circulating blame',
  144),

('TANGLE-861', 'Publish How Many Rules Survive Contact with Revenue',
 'Policy keeps claiming rigor right up until enough ARR leans on it in expensive shoes. Show which rules stay intact when money, executive interest, or account panic touches them so the company can stop pretending principles are equally load-bearing.',
 'show which rules survive revenue',
  144),

-- Automation Architect Daisuke
-- REPORTER: Daisuke | Automation Architect | Can tell when retry logic has stopped being resilience and started being ceremonial begging.
('TANGLE-862', 'Warn When a Workflow Has More Retries Than Self-Respect',
 'Retry logic is useful until it becomes an unwillingness to admit the step is dead and the owner is asleep. Add a dignity threshold so operators know when the orchestration layer is no longer robust, just needy.',
 'warn when workflows retry too much',
  89),

('TANGLE-863', 'Measure Whether the Human in the Loop Is Actually Doing Anything',
 'We keep inserting people into workflows who are functionally just warm liability in a chair. Measure whether they materially change outcomes or merely absorb blame with a pulse and an approval button.',
 'check if human-in-loop does anything',
  144),

-- Workflow UX Lead Chiara
-- REPORTER: Chiara | Workflow UX Lead | Knows half the queue is not blocked by technology at all, just waiting for someone slightly more senior to blink first.
('TANGLE-864', 'Give Hierarchy Paralysis Its Own Queue State',
 'Many items marked blocked are not technically stuck. They are paused in a social staring contest where everyone knows the next move but nobody wants to make it without cover from above. Call that what it is.',
 'give hierarchy paralysis its own queue state',
  89),

('TANGLE-865', 'Audit Status Labels That Exist Mainly to Calm Managers',
 'Labels like pending alignment and under review often do less to describe work than to reassure observers that motion exists somewhere behind the curtain. Review which statuses tell the truth and which ones are just soft furniture for anxious stakeholders.',
 'audit status labels that calm managers',
  89),

-- BPM Consultant Arturo
-- REPORTER: Arturo | BPM Consultant | Draws swimlanes for organizations where the real routing logic is grudges, status, and one bad memory from 2022.
('TANGLE-866', 'Put a "Here Be Politics" Box on Every Process Map',
 'Swimlanes and diamonds remain too clean for departments where ownership is really decided by status, grudges, and remembered incidents. Add an explicit politics box so the diagrams stop lying with geometry.',
 'put politics box on process maps',
  144),

('TANGLE-867', 'Predict Which Team Will Immediately Claim This Request Belongs to Someone Else',
 'Cross-functional work is often easiest to identify by the speed with which one team decides it is spiritually adjacent to another team''s quarter. Add a deflection field so ownership dodging becomes measured behavior instead of a surprise sport in comments.',
 'predict who punts this request away',
  144),

-- Chief Process Officer Mireya
-- REPORTER: Mireya | Chief Process Officer | Distinguishes the people who control a decision from the people invited merely so no one dies alone in the audit.
('TANGLE-868', 'Split the Approval Matrix into People with Power and People There as Witnesses',
 'Some approvals change outcomes. Others just ensure enough bodies were present to say supervision happened. Separate real control from ceremonial witness capture before the matrix grows another saint.',
 'split approval matrix into power and witnesses',
  144),

('TANGLE-869', 'Tag Each Workflow SLA as Causing Harm or Merely Causing Shame',
 'Not every late workflow hurts customers. Some only bruise internal prestige because a dashboard turns amber and somebody tightens their mouth in a weekly call. Mark the difference so the team can stop treating pain and embarrassment as the same outage.',
 'tag workflow slas as harm or shame',
  89),

-- VP of Operational Ceremony Leon
-- REPORTER: Leon | VP of Operational Ceremony | Believes any workflow longer than a pilgrimage deserves an interface that admits it became a way of life.
('TANGLE-870', 'Workflows Longer Than Seven Clicks Must Wear a Beige Banner of Shame',
 'Once a request needs enough clicks, detours, and approvals to feel like a small pilgrimage through office weather, the UI should stop pretending it is normal. If the task became a habitat, the screen needs to say so.',
 'shame workflows longer than seven clicks',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Johanna [Workflow Platform Lead]', reporter_name = 'Johanna', reporter_title = 'Workflow Platform Lead', reporter_description = 'Watches approvals breed in captivity and insists every new delay explain what older delay it came to marry.' WHERE id IN ('TANGLE-856', 'TANGLE-857');
UPDATE community_backlog SET reporter = 'Malik [Enterprise Process PM]', reporter_name = 'Malik', reporter_title = 'Enterprise Process PM', reporter_description = 'Specializes in noticing when a simple request has been upgraded into a full portal because somebody confused structure with progress.' WHERE id IN ('TANGLE-858', 'TANGLE-859');
UPDATE community_backlog SET reporter = 'Helena [Process Governance Analyst]', reporter_name = 'Helena', reporter_title = 'Process Governance Analyst', reporter_description = 'Studies the exact minute an escalation stops solving anything and starts rotating blame through better titles.' WHERE id IN ('TANGLE-860', 'TANGLE-861');
UPDATE community_backlog SET reporter = 'Daisuke [Automation Architect]', reporter_name = 'Daisuke', reporter_title = 'Automation Architect', reporter_description = 'Can tell when retry logic has stopped being resilience and started being ceremonial begging.' WHERE id IN ('TANGLE-862', 'TANGLE-863');
UPDATE community_backlog SET reporter = 'Chiara [Workflow UX Lead]', reporter_name = 'Chiara', reporter_title = 'Workflow UX Lead', reporter_description = 'Knows half the queue is not blocked by technology at all, just waiting for someone slightly more senior to blink first.' WHERE id IN ('TANGLE-864', 'TANGLE-865');
UPDATE community_backlog SET reporter = 'Arturo [BPM Consultant]', reporter_name = 'Arturo', reporter_title = 'BPM Consultant', reporter_description = 'Draws swimlanes for organizations where the real routing logic is grudges, status, and one bad memory from 2022.' WHERE id IN ('TANGLE-866', 'TANGLE-867');
UPDATE community_backlog SET reporter = 'Mireya [Chief Process Officer]', reporter_name = 'Mireya', reporter_title = 'Chief Process Officer', reporter_description = 'Distinguishes the people who control a decision from the people invited merely so no one dies alone in the audit.' WHERE id IN ('TANGLE-868', 'TANGLE-869');
UPDATE community_backlog SET reporter = 'Leon [VP of Operational Ceremony]', reporter_name = 'Leon', reporter_title = 'VP of Operational Ceremony', reporter_description = 'Believes any workflow longer than a pilgrimage deserves an interface that admits it became a way of life.' WHERE id IN ('TANGLE-870');

-- PIXEL: ad networks, tracking SDKs, attribution decay, and measurement grime
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Measurement Infrastructure Director Celia
-- REPORTER: Celia | Measurement Infrastructure Director | Oversees a wet little zoo of trackers that all claim necessity and all want one more event.
('PIXEL-871', 'Make Every Tracking SDK Admit Which Data It Needs and Which Data It Just Finds Exciting',
 'Our bundle is now full of tasteful little observers, each collecting a slightly different pile of context in the name of optimization. Force every SDK to sort its appetite into rigor and decorative nosiness before the client gets any damper.',
 'make tracking sdk list needed data',
  144),

('PIXEL-872', 'Teach Attribution When It Only Arrived in Time for the Victory Photo',
 'Too many channels rewrite inevitable purchases into heroic tales of last-touch influence. Add a field for pre-existing intent so we can tell the difference between real persuasion and marketing jogging into frame after the outcome was already happening.',
 'teach attribution when it arrived too late',
  144),

-- Mobile Ads PM Rohan
-- REPORTER: Rohan | Mobile Ads PM | Can tell when a schema field came from product thinking versus one ad network asking nicely in a PDF.
('PIXEL-873', 'Mark the Event Fields We Added Because an Ad Network Asked Nicely',
 'Mobile event payloads keep swelling with oddly specific fields that clearly entered through partner diplomacy rather than product need. Tag the ones born from monetization pressure so the schema stops pretending every property came from first-party conviction.',
 'mark the event fields we added',
  89),

('PIXEL-874', 'Explain Why Five Vendors Need to Meet the User Before the Login Screen',
 'We have built a pre-login receiving line of analytics, attribution, and optimization vendors who all apparently deserve an introduction before the user can even fail a password in peace. Document who they are and what fiction justifies their presence.',
 'explain why five vendors need prelogin access',
  144),

-- Web Analytics Lead Mae
-- REPORTER: Mae | Web Analytics Lead | Has accepted that Safari is not a browser so much as a weather pattern with privacy settings.
('PIXEL-875', 'Give Every Tracking Plan a Safari Wrongness Budget',
 'Cross-browser consistency is now folklore with docs. Add tolerated error budgets by browser, especially for Safari, so teams stop acting surprised when the same implementation produces three different realities and one quiet argument.',
 'give tracking plans safari wrongness budgets',
  144),

('PIXEL-876', 'Put Foggy Glasses on Any Campaign Chart Still Pretending to Be Precise',
 'Privacy updates have shaved away enough of the observable world that some charts are basically elegant guesses with a strong color system. Mark the overconfident ones before approximation keeps dressing like certainty.',
 'fog up fake-precise campaign charts',
  144),

-- Growth Data Engineer Dante
-- REPORTER: Dante | Growth Data Engineer | Distrusts any server-side tracking migration that arrives wearing the words resilience and absolutely no visible shame.
('PIXEL-877', 'Separate Server-Side Reliability Work from Stealthier Ways to Follow People',
 'Server-side measurement is often pitched as robustness and occasionally turns out to be the same appetite walking through a side door in a better suit. Add intent notes so we can tell when we hardened data quality and when we just got sneakier.',
 'split server-side reliability from sneakier tracking',
  144),

('PIXEL-878', 'Count How Many Middlemen Collaboratively Invented This Conversion',
 'By the time a purchase reaches the dashboard, it may have passed through SDKs, relays, enrichment layers, identity bridges, and one heroic spreadsheet no one will discuss in daylight. Count the middlemen before the event gets reimagined beyond recognition.',
 'count middlemen inventing each conversion',
  144),

-- Paid Media Strategist Lila
-- REPORTER: Lila | Paid Media Strategist | Wants brand vibes, campaign lift, and team feelings to stop free-riding inside the same smug chart.
('PIXEL-879', 'Give Brand Mood Its Own Coefficient Instead of Letting It Haunt Every Success Story',
 'Performance, creative, timing, and market drift keep fighting over the same win while one team insists the audience simply felt more ready because the vibe was good. Add a mood-credit factor so invisible influence has to file paperwork like everyone else.',
 'give brand mood its own coefficient',
  89),

('PIXEL-880', 'Show What Lie Each Event Will Be Forced to Support in the QBR',
 'Instrumentation is never just about accuracy. It is also about the future story someone will tell under pressure with a laser pointer and a narrowed quarter. Preview the likely mythology attached to each event before the tracking plan starts writing fiction.',
 'show which lie each event supports in qbr',
  144),

-- Identity Resolution Architect Aaron
-- REPORTER: Aaron | Identity Resolution Architect | Knows some stitched identities are evidence and others are just browser crumbs trying to fall in love.
('PIXEL-881', 'Label Which Identity Matches Are Real and Which Are Optimistic Reunions',
 'Some user merges are deterministic. Others are what happens when cookies, hashes, and one generous appetite for attribution decide two strangers deserve a shared destiny. Label the certainty class before downstream systems start trusting browser residue like witness testimony.',
 'label identity matches real or optimistic',
  144),

('PIXEL-882', 'Force View Events to Prove They Were Seen and Not Just Nearby',
 'Viewed has become far too hospitable to prefetch ghosts, partial renders, and things that wandered past a viewport with ambition. Tighten the definition before presence keeps impersonating attention.',
 'make view events prove they were seen',
  89),

-- VP of Measurement Truth Giselle
-- REPORTER: Giselle | VP of Measurement Truth | Maintains a private list of scripts nobody understands but everyone is too frightened to delete.
('PIXEL-883', 'Build a Liability Register for Trackers We Fear More Than We Understand',
 'Some scripts survive because removing them might anger a report, a partner, or a team with a quota. Inventory the pixels everybody is afraid to touch so legacy fear stops masquerading as measurement strategy.',
 'build liability register for scary trackers',
  144),

('PIXEL-884', 'Create an Attribution Review Queue for Math Versus Witchcraft',
 'We keep encountering gorgeous causal stories built from delayed signals, stitched identities, and enough modeled uplift to perfume a deck. Add an attribution review queue so each miracle gets tagged as math, model haze, or executive-grade witchcraft before it demands budget with authority.',
 'queue attribution for math versus witchcraft',
  144),

-- Chief Revenue Signals Officer Benji
-- REPORTER: Benji | Chief Revenue Signals Officer | Thinks stale KPIs should look visibly deceased before they are allowed near live decision-making.
('PIXEL-885', 'Put Tiny Mourning Ribbons on Growth Numbers That Are Already Dead',
 'Not every metric is equally alive. Some are live, some are delayed, and some are practically embalmed by overnight stitching and executive impatience. Make the old ones dress accordingly before preserved numbers keep steering live decisions.',
 'put mourning ribbons on dead metrics',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Celia [Measurement Infrastructure Director]', reporter_name = 'Celia', reporter_title = 'Measurement Infrastructure Director', reporter_description = 'Oversees a wet little zoo of trackers that all claim necessity and all want one more event.' WHERE id IN ('PIXEL-871', 'PIXEL-872');
UPDATE community_backlog SET reporter = 'Rohan [Mobile Ads PM]', reporter_name = 'Rohan', reporter_title = 'Mobile Ads PM', reporter_description = 'Can tell when a schema field came from product thinking versus one ad network asking nicely in a PDF.' WHERE id IN ('PIXEL-873', 'PIXEL-874');
UPDATE community_backlog SET reporter = 'Mae [Web Analytics Lead]', reporter_name = 'Mae', reporter_title = 'Web Analytics Lead', reporter_description = 'Has accepted that Safari is not a browser so much as a weather pattern with privacy settings.' WHERE id IN ('PIXEL-875', 'PIXEL-876');
UPDATE community_backlog SET reporter = 'Dante [Growth Data Engineer]', reporter_name = 'Dante', reporter_title = 'Growth Data Engineer', reporter_description = 'Distrusts any server-side tracking migration that arrives wearing the words resilience and absolutely no visible shame.' WHERE id IN ('PIXEL-877', 'PIXEL-878');
UPDATE community_backlog SET reporter = 'Lila [Paid Media Strategist]', reporter_name = 'Lila', reporter_title = 'Paid Media Strategist', reporter_description = 'Wants brand vibes, campaign lift, and team feelings to stop free-riding inside the same smug chart.' WHERE id IN ('PIXEL-879', 'PIXEL-880');
UPDATE community_backlog SET reporter = 'Aaron [Identity Resolution Architect]', reporter_name = 'Aaron', reporter_title = 'Identity Resolution Architect', reporter_description = 'Knows some stitched identities are evidence and others are just browser crumbs trying to fall in love.' WHERE id IN ('PIXEL-881', 'PIXEL-882');
UPDATE community_backlog SET reporter = 'Giselle [VP of Measurement Truth]', reporter_name = 'Giselle', reporter_title = 'VP of Measurement Truth', reporter_description = 'Maintains a private list of scripts nobody understands but everyone is too frightened to delete.' WHERE id IN ('PIXEL-883', 'PIXEL-884');
UPDATE community_backlog SET reporter = 'Benji [Chief Revenue Signals Officer]', reporter_name = 'Benji', reporter_title = 'Chief Revenue Signals Officer', reporter_description = 'Thinks stale KPIs should look visibly deceased before they are allowed near live decision-making.' WHERE id IN ('PIXEL-885');

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
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Miriam [IAM Governance Lead]', reporter_name = 'Miriam', reporter_title = 'IAM Governance Lead', reporter_description = 'Watches emergency permissions fossilize into permanent wallpaper and calls it access necromancy with paperwork.' WHERE id IN ('HAUNT-886', 'HAUNT-887');
UPDATE community_backlog SET reporter = 'Theo [Access Reviews PM]', reporter_name = 'Theo', reporter_title = 'Access Reviews PM', reporter_description = 'Can spot a rubber-stamped permission approval by the speed, posture, and mild smell of managerial panic.' WHERE id IN ('HAUNT-888', 'HAUNT-889');
UPDATE community_backlog SET reporter = 'Jun [Privileged Access Engineer]', reporter_name = 'Jun', reporter_title = 'Privileged Access Engineer', reporter_description = 'Has noticed the emergency hatch looks less like glass and more like a frequently handled office door.' WHERE id IN ('HAUNT-890', 'HAUNT-891');
UPDATE community_backlog SET reporter = 'Clara [Enterprise Security PM]', reporter_name = 'Clara', reporter_title = 'Enterprise Security PM', reporter_description = 'Knows SSO projects fail less on protocol details than on departments being romantically attached to their own chaos.' WHERE id IN ('HAUNT-892', 'HAUNT-893');
UPDATE community_backlog SET reporter = 'Samir [Directory Services Lead]', reporter_name = 'Samir', reporter_title = 'Directory Services Lead', reporter_description = 'Has seen too many employees leave the company and remain digitally employed across five important systems.' WHERE id IN ('HAUNT-894', 'HAUNT-895');
UPDATE community_backlog SET reporter = 'Imani [Audit Systems Analyst]', reporter_name = 'Imani', reporter_title = 'Audit Systems Analyst', reporter_description = 'Specializes in spotting privilege chains that only make sense if you already know the secret handshake and one cursed nesting path.' WHERE id IN ('HAUNT-896', 'HAUNT-897');
UPDATE community_backlog SET reporter = 'Lorne [Chief Identity Officer]', reporter_name = 'Lorne', reporter_title = 'Chief Identity Officer', reporter_description = 'Believes entitlement cleanup starts the moment someone dares ask whether anyone would actually notice if a permission vanished.' WHERE id IN ('HAUNT-898', 'HAUNT-899');
UPDATE community_backlog SET reporter = 'Elise [VP of Trust Fabric]', reporter_name = 'Elise', reporter_title = 'VP of Trust Fabric', reporter_description = 'Wants one giant haunted map of every system still trusting people, bots, and former partners nobody remembers clearly.' WHERE id IN ('HAUNT-900');

-- ROT: package decay, abandoned dependencies, toolchain drift, and ecosystem archaeology
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Dependency Management Lead Kira
-- REPORTER: Kira | Dependency Management Lead | Treats every new package as a future weather system with transitive baggage and its own annual mood swings.
('ROT-901', 'Make New Dependencies Explain What Kind of Long-Term Drama They Plan to Bring',
 'Adding a package is not one choice. It is years of release notes, transitive opinions, vulnerability alerts, and one future afternoon of why is this ours now. Force new dependencies to disclose their full emotional climate up front.',
 'make new dependencies explain their long-term drama',
  144),

('ROT-902', 'Mark Abandoned Packages "Use at Own Spiritual Risk"',
 'Some stale libraries are merely behind. Others are one missing maintainer and a silent issue queue away from becoming haunted forest infrastructure. Mark the lonelier ones before the repo starts humming ominously in production.',
 'mark abandoned packages use at own spiritual risk',
  144),

-- Build Systems PM Armand
-- REPORTER: Armand | Build Systems PM | Can tell when a lockfile line exists for determinism and when it exists because the internet hurt us once in 2021.
('ROT-903', 'Annotate the Lockfile Panic That Got Fossilized into Version Pins',
 'Pinning often preserves real stability and one layer of old ecosystem trauma nobody has unpacked. Add notes for constraints born from a broken registry, one cursed patch release, or a memorable Friday so future maintainers can tell reproducibility from scar tissue.',
 'annotate panic fossilized into version pins',
  144),

('ROT-904', 'Flag Libraries That Are One Burned-Out Maintainer Away from Vapor',
 'Some packages are healthy communities. Others are one tired person, a fading README, and a promise to circle back after the holidays that became geologic time. Score that fragility before core systems end up resting on politeness and caffeine.',
 'flag libraries one maintainer from vapor',
  144),

-- Frontend Infrastructure Lead Nadine
-- REPORTER: Nadine | Frontend Infrastructure Lead | Knows half the build chain survives because nobody wants to reopen the PR from 2019 that created it.
('ROT-905', 'Warn When a Babel Plugin Is Surviving on Ritual Alone',
 'We keep shipping plugins and transforms nobody can explain without exhuming ancient pull requests and comments from people who now live better lives elsewhere. Add a ritual-preservation warning before accidental sanctity buys these things another year.',
 'warn when babel plugins survive on ritual',
  89),

('ROT-906', 'Put Monorepo Tools on Trial for Whether They Solve Scale or Just Start Religions',
 'Monorepo tooling often begins as scaffolding and ends as a worldview with sacred subcommands, caching myths, and one Slack channel where dissent is treated as ignorance. Review the tools before theology starts billing itself as platform maturity.',
 'put monorepo tools on trial for starting religions',
  144),

-- Application Security Engineer Soren
-- REPORTER: Soren | Application Security Engineer | Wants vulnerability scanners to stop delivering apocalyptic poetry every Tuesday morning.
('ROT-907', 'Teach the Vulnerability Feed the Difference Between Doom and Scanner Fanfiction',
 'Our alerts contain real danger and a lot of red text about dormant subpackages having unsafe thoughts three layers down the tree. Add severity realism before engineers stop blinking at red entirely.',
 'split real doom from scanner fanfiction',
  144),

('ROT-908', 'Mark the CVEs That Only Matter After We Have Already Lost Everything Else',
 'Some vulnerabilities are urgent. Others require a level of access that already means the company is telling a much worse story than this specific package flaw. Add an exploit-precondition column before edge-case CVEs keep dressing like live grenades.',
 'mark cves that matter way too late',
  144),

-- Ecosystem Risk Analyst Juno
-- REPORTER: Juno | Ecosystem Risk Analyst | Collects dependencies whose last release predates our current beliefs and still somehow owns a critical path.
('ROT-909', 'Highlight Dependencies Last Updated Before Our Current Worldview',
 'There is a class of package that still works beautifully while clearly coming from a past civilization with different browser targets, social norms, and assumptions about maintainer health. Surface the fossils before age keeps getting mistaken for reliability.',
 'highlight dependencies older than our worldview',
  89),

('ROT-910', 'Put Migration Tombstones on Deprecated Toolchains We Postponed Ourselves Into',
 'Old compilers and bundlers do not survive by accident. They survive because we kept choosing other fires and calling that pragmatism. Add signage explaining which migration we postponed ourselves into before delay rewrites itself as taste.',
 'put tombstones on postponed toolchains',
  144),

-- Runtime Platform PM Elise
-- REPORTER: Elise | Runtime Platform PM | Distrusts health scores that confuse one maintainer''s noble caffeine burst with actual ecosystem continuity.
('ROT-911', 'Penalize Repos Kept Alive by One Person Having a Heroic Month',
 'Burst activity looks healthy until you realize it all came from one exhausted volunteer dragging a dependency through winter on vibes and duty. Score continuity, not sainthood, before dependency health turns into a tribute video.',
 'penalize repos surviving on one hero',
  144),

('ROT-912', 'Count How Many Internal Tutorials an Upgrade Is About to Kill',
 'Version bumps do not just change code. They also murder wiki pages, onboarding decks, recorded walkthroughs, and the fragile confidence of everyone who finally memorized the old way. Count the documentation wreckage before upgrades start pretending they are purely technical.',
 'count tutorials each upgrade will kill',
  144),

-- Chief Build Officer Dorian
-- REPORTER: Dorian | Chief Build Officer | Has lost too many release trains to tiny packages with twelve weekly downloads and perfect timing.
('ROT-913', 'Name the Obscure Package Holding the Release Train Hostage',
 'Release delays keep getting described as stability work when the real problem is one bizarre dependency with no users, no dignity, and impeccable timing. Name the culprit before niche package chaos keeps hiding behind mature language.',
 'name packages holding release trains hostage',
  89),

('ROT-914', 'Add an Inheritance Banner to Repos That Are Dead in Spirit but Still in Prod',
 'Archived repositories create a special emotional state where the code still runs, the maintainers are gone, and every team hopes somebody else will volunteer to inherit the implication. Add an inheritance banner naming the likely inheritor, runtime dependency, and last surviving witness before indecision turns into mausoleum management.',
 'add inheritance banner to dead but live repos',
  89),

-- VP of Ecosystem Stability Alma
-- REPORTER: Alma | VP of Ecosystem Stability | Wants "still works" to stop sounding healthy when it usually means untouched, feared, and quietly one prod deploy away from collapse.
('ROT-915', 'Put a Sad Brown Glow Around Anything in the Stack Described as "Still Works"',
 'Some components are healthy. Others are only surviving through inertia, fear, and the luck of recent non-interference. Outline the second category in a sad brown glow before structural denial keeps passing as stability.',
 'put brown glow on still works',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Kira [Dependency Management Lead]', reporter_name = 'Kira', reporter_title = 'Dependency Management Lead', reporter_description = 'Treats every new package as a future weather system with transitive baggage and its own annual mood swings.' WHERE id IN ('ROT-901', 'ROT-902');
UPDATE community_backlog SET reporter = 'Armand [Build Systems PM]', reporter_name = 'Armand', reporter_title = 'Build Systems PM', reporter_description = 'Can tell when a lockfile line exists for determinism and when it exists because the internet hurt us once in 2021.' WHERE id IN ('ROT-903', 'ROT-904');
UPDATE community_backlog SET reporter = 'Nadine [Frontend Infrastructure Lead]', reporter_name = 'Nadine', reporter_title = 'Frontend Infrastructure Lead', reporter_description = 'Knows half the build chain survives because nobody wants to reopen the PR from 2019 that created it.' WHERE id IN ('ROT-905', 'ROT-906');
UPDATE community_backlog SET reporter = 'Soren [Application Security Engineer]', reporter_name = 'Soren', reporter_title = 'Application Security Engineer', reporter_description = 'Wants vulnerability scanners to stop delivering apocalyptic poetry every Tuesday morning.' WHERE id IN ('ROT-907', 'ROT-908');
UPDATE community_backlog SET reporter = 'Juno [Ecosystem Risk Analyst]', reporter_name = 'Juno', reporter_title = 'Ecosystem Risk Analyst', reporter_description = 'Collects dependencies whose last release predates our current beliefs and still somehow owns a critical path.' WHERE id IN ('ROT-909', 'ROT-910');
UPDATE community_backlog SET reporter = 'Elise [Runtime Platform PM]', reporter_name = 'Elise', reporter_title = 'Runtime Platform PM', reporter_description = 'Distrusts health scores that confuse one maintainer''''s noble caffeine burst with actual ecosystem continuity.' WHERE id IN ('ROT-911', 'ROT-912');
UPDATE community_backlog SET reporter = 'Dorian [Chief Build Officer]', reporter_name = 'Dorian', reporter_title = 'Chief Build Officer', reporter_description = 'Has lost too many release trains to tiny packages with twelve weekly downloads and perfect timing.' WHERE id IN ('ROT-913', 'ROT-914');
UPDATE community_backlog SET reporter = 'Alma [VP of Ecosystem Stability]', reporter_name = 'Alma', reporter_title = 'VP of Ecosystem Stability', reporter_description = 'Wants "still works" to stop sounding healthy when it usually means untouched, feared, and quietly one prod deploy away from collapse.' WHERE id IN ('ROT-915');

-- BLISS: wellness tech, biofeedback, productivity wearables, and quantified-self workplace absurdity
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Employee Wellness PM Colette
-- REPORTER: Colette | Employee Wellness PM | Believes focus is not real until it has a score, a graph, and at least one biometric attached to it.
('BLISS-916', 'Mix Deep-Work Scoring with Heart Data Until Productivity Feels Medical',
 'We are apparently no longer satisfied tracking output alone. Add heart-rate variability to the focus app so it can distinguish real concentration from aggressive frowning, caffeine theology, and pretending to be the sort of adult who color-codes a calendar on purpose.',
 'integrate apple watch api into focus timer',
  144),

('BLISS-917', 'Add a Calmness Trendline So Leadership Can Watch Burnout Form in Pastel',
 'We already measure backlog, throughput, and response time. Add a calmness line so executives can schedule one tasteful listening session before anxiety becomes expensive enough to show up in attrition charts and exit interviews.',
 'add a calmness trendline',
  144),

-- Workplace Sensors Engineer Anish
-- REPORTER: Anish | Workplace Sensors Engineer | Knows four people in the same room are not always collaborating and are sometimes just avoiding their apartments.
('BLISS-918', 'Teach the Desk Sensors the Difference Between Collaboration and Home Avoidance',
 'Office presence data keeps mistaking air conditioning, free coffee, and domestic exhaustion for innovation. Refine the occupancy logic before facilities dashboards keep writing romance over climate-controlled escape behavior.',
 'update desk sensors for home avoidance',
  89),

('BLISS-919', 'Label Whether the Wearable Data Is Helping Recovery or Just Graphing Exhaustion in Better Fonts',
 'Wellness telemetry carries a seductive aura of insight even when it mostly shows that everyone is tired with Bluetooth attached. Add meaning notes so the platform can admit when it is guiding recovery and when it is just aestheticizing depletion.',
 'label wearable data recovery or burnout',
  144),

-- Productivity Science Director Lena
-- REPORTER: Lena | Productivity Science Director | Distrusts immaculate calendars that look disciplined in screenshots and collapse before lunch in real life.
('BLISS-920', 'Penalize Focus Scores Built Mostly from Beautiful Calendar Theater',
 'Some employees arrange their schedules into devotional works of art that imply seriousness while accomplishing nothing after 10:12 a.m. Discount screenshot-grade calendar heroism before layout discipline starts impersonating concentration.',
 'penalize focus scores built from calendar theater',
  89),

('BLISS-921', 'Add a Setting for "I Did the Wellness Ritual and Still Feel Terrible"',
 'People are meditating, journaling, stretching, and checking all the right boxes while remaining recognizably stressed and extremely mortal. Add a mode for ritual completion without enlightenment so the app stops implying that compliance guarantees transcendence.',
 'add ritual did not help mode',
  89),

-- Corporate Wellness Analyst Darius
-- REPORTER: Darius | Corporate Wellness Analyst | Knows some burnout comes from the system and some comes from one manager vibrating at an unsafe frequency.
('BLISS-922', 'Split Burnout Risk into Structural Overload and Manager-Specific Weather',
 'Burnout heatmaps get less useful when one chaotic manager can flood the whole signal with avoidable turbulence. Separate systemic overload from leader-specific damage before coaching keeps arriving with suspiciously diplomatic language.',
 'split burnout risk from manager weather',
  144),

('BLISS-923', 'Ask Whether the Mood Survey Was Filled Out During a Meeting About Mood Surveys',
 'Feedback tools keep pretending responses are gathered in neutral conditions when many are completed mid-call, under observation, or right after a presentation about psychological safety with bad clip art. Capture the room along with the answer.',
 'ask if mood surveys happened in meetings',
  144),

-- Performance Wellness Architect Maeve
-- REPORTER: Maeve | Performance Wellness Architect | Has noticed that many breaks are just mini-expeditions into Slack where people return carrying more suffering than they left with.
('BLISS-924', 'Stop Treating Slack-Soaked Breaks as Recovery',
 'Focus timers assume breaks are restorative. In practice, many people spend them checking alerts and coming back with three more problems and one new emotional burden. Add a contamination mode so the timer stops awarding wellness points for anxiety refueling.',
 'stop treating slack-soaked breaks as recovery',
  89),

('BLISS-925', 'Add a Widget That Says "A Walk or a Friend Would Solve This Faster"',
 'We keep prescribing gradients, breathing loops, and dashboards for conditions better treated by sleep, boundaries, or one decent human conversation. Add an honesty indicator before digital wellbeing turns into gadgetized avoidance of ordinary needs.',
 'add walk would fix this widget',
  89),

-- VP of Human Throughput Serena
-- REPORTER: Serena | VP of Human Throughput | Can spot the sparkly front edge of burnout trying to pass itself off as best practice in expensive activewear.
('BLISS-926', 'Teach the Energy Planner the Difference Between High Performance and Pre-Crash Mania',
 'Not every productivity spike is health. Some are just the bright doomed front edge of overextension pretending to be excellence. Add pre-crash indicators before the tool starts endorsing glamorous depletion as a repeatable habit.',
 'teach energy planner pre-crash mania',
  144),

('BLISS-927', 'Put a Limit on How Much Wellness Copy Can Smell Like Scented Corporate Incense',
 'Some nudges now contain so much centering language, resilient pause vocabulary, and intentional bandwidth fragrance that they stop sounding like care and start sounding like a candle with OKRs. Cap the incense before help becomes aroma.',
 'limit how much wellness copy smells mystical',
  89),

-- Smart Workplace Strategist Florian
-- REPORTER: Florian | Smart Workplace Strategist | Measures how many meetings exist solely to prove alignment is alive and can still fog a calendar on command.
('BLISS-928', 'Count the Meetings Whose Only Job Is Proving Alignment Still Exists',
 'Meeting dashboards get a lot more honest once they separate real decision-making from ritual reassurance that the org still shares one anxious heartbeat. Add an alignment-theater estimate before calendar mass keeps pretending to be output.',
 'count meetings that only prove alignment',
  144),

('BLISS-929', 'Force Every Wellness App Rollout to Ask Whether More Headcount Would Beat This Entire Product',
 'We keep solving staffing and coordination problems with breathing prompts because apps are easier to buy than relief. Add a review step that asks whether the correct intervention was more capacity instead of another gradient and a push notification.',
 'ask if headcount beats this wellness app',
  144),

-- Chief Bliss Officer Petra
-- REPORTER: Petra | Chief Bliss Officer | Wants one master serenity score showing which departments are being held together by rituals, dashboards, and beautifully packaged denial.
('BLISS-930', 'Flash a Lavender Warning When Wellness Tools Are Doing More Work Than Managers',
 'If a team needs meditation nudges, gratitude walls, mood tracking, and a resilience webinar just to make it to Thursday, the software should say so plainly. Add a lavender warning banner before perfumed process starts passing for actual support.',
 'warn when wellness tools replace managers',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Colette [Employee Wellness PM]', reporter_name = 'Colette', reporter_title = 'Employee Wellness PM', reporter_description = 'Believes focus is not real until it has a score, a graph, and at least one biometric attached to it.' WHERE id IN ('BLISS-916', 'BLISS-917');
UPDATE community_backlog SET reporter = 'Anish [Workplace Sensors Engineer]', reporter_name = 'Anish', reporter_title = 'Workplace Sensors Engineer', reporter_description = 'Knows four people in the same room are not always collaborating and are sometimes just avoiding their apartments.' WHERE id IN ('BLISS-918', 'BLISS-919');
UPDATE community_backlog SET reporter = 'Lena [Productivity Science Director]', reporter_name = 'Lena', reporter_title = 'Productivity Science Director', reporter_description = 'Distrusts immaculate calendars that look disciplined in screenshots and collapse before lunch in real life.' WHERE id IN ('BLISS-920', 'BLISS-921');
UPDATE community_backlog SET reporter = 'Darius [Corporate Wellness Analyst]', reporter_name = 'Darius', reporter_title = 'Corporate Wellness Analyst', reporter_description = 'Knows some burnout comes from the system and some comes from one manager vibrating at an unsafe frequency.' WHERE id IN ('BLISS-922', 'BLISS-923');
UPDATE community_backlog SET reporter = 'Maeve [Performance Wellness Architect]', reporter_name = 'Maeve', reporter_title = 'Performance Wellness Architect', reporter_description = 'Has noticed that many breaks are just mini-expeditions into Slack where people return carrying more suffering than they left with.' WHERE id IN ('BLISS-924', 'BLISS-925');
UPDATE community_backlog SET reporter = 'Serena [VP of Human Throughput]', reporter_name = 'Serena', reporter_title = 'VP of Human Throughput', reporter_description = 'Can spot the sparkly front edge of burnout trying to pass itself off as best practice in expensive activewear.' WHERE id IN ('BLISS-926', 'BLISS-927');
UPDATE community_backlog SET reporter = 'Florian [Smart Workplace Strategist]', reporter_name = 'Florian', reporter_title = 'Smart Workplace Strategist', reporter_description = 'Measures how many meetings exist solely to prove alignment is alive and can still fog a calendar on command.' WHERE id IN ('BLISS-928', 'BLISS-929');
UPDATE community_backlog SET reporter = 'Petra [Chief Bliss Officer]', reporter_name = 'Petra', reporter_title = 'Chief Bliss Officer', reporter_description = 'Wants one master serenity score showing which departments are being held together by rituals, dashboards, and beautifully packaged denial.' WHERE id IN ('BLISS-930');

-- SPOOK: observability ghosts, alert phantoms, dashboards, tracing dread, and monitoring hauntings
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Observability Lead Mara
-- REPORTER: Mara | Observability Lead | Lives among graphs dramatic enough to wake three managers before sunrise and still fail to describe one real customer problem.
('SPOOK-931', 'Make Alerts Admit Whether They Found a Failure or Just Felt Nervous',
 'Our paging stack is far too willing to promote anxious telemetry into operational significance. Add a field that distinguishes actual customer pain from graphs having feelings again.',
 'add panic boolean to alert webhooks',
  144),

('SPOOK-932', 'Label the Dashboards Nobody Has Used for a Real Decision in Months',
 'Some charts are tools. Others are decorative rectangles left on walls because nobody wants to confess they are just familiar furniture now. Mark the ceremonial dashboards before another screen gets dedicated to dead geometry.',
 'label dashboards nobody uses',
  89),

-- Incident Telemetry PM Keon
-- REPORTER: Keon | Incident Telemetry PM | Knows half the architecture only becomes visible when something breaks loudly enough for everyone to remember it at once.
('SPOOK-933', 'Draw the Dependencies We Only Remember During Outages',
 'Our service maps remain suspiciously cleaner than the stories people tell at 2:14 a.m. Add the forgotten queue, the weird relay, and the regional cache that only becomes culturally real once money starts leaking.',
 'draw outage-only dependencies',
  144),

('SPOOK-934', 'Teach the Trace Viewer to Explain Why the Pain Was Long Instead of Just Showing It',
 'A 900ms span is not insight. It is an elongated scream in a pretty UI. Add hints so the trace can tell whether the delay came from one service, several bad choices, or the stack briefly remembering its own mortality.',
 'make trace viewer explain slowdowns',
  144),

-- Reliability Engineer Anika
-- REPORTER: Anika | Reliability Engineer | Wants to know whether the SLO actually hurt users or merely bruised the monitoring team''s self-esteem.
('SPOOK-935', 'Mark Which SLO Breaches Humans Felt and Which Only the Graph Felt',
 'Not every objective degradation became subjective pain. Sometimes only the dashboard was offended. Add a visibility note so teams can stop treating monitoring disappointment and customer harm as the same crime.',
 'mark slo breaches humans actually felt',
  89),

('SPOOK-936', 'Tag the Error Budget Fires Started by One Curious Team',
 'Some reliability loss is diffuse. Other times one team discovers production in public and burns a visible chunk of the budget in one educational burst. Tag the bonfires before postmortems start rewriting them as collective weather.',
 'tag error-budget fires by team',
  144),

-- Logging Systems Architect Nikhil
-- REPORTER: Nikhil | Logging Systems Architect | Pays too much to store perfect structured nonsense emitted by services that love speaking and hate saying anything useful.
('SPOOK-937', 'Flag Services That Log Constantly and Reveal Nothing',
 'We have components producing oceans of structured text while contributing almost nothing to diagnosis besides timestamp density and the vague impression that effort occurred. Mark the ones generating ornamental confession instead of evidence.',
 'flag services that log constantly and reveal nothing',
  144),

('SPOOK-938', 'Teach Log Search to Recognize Panic as a Legitimate Query Language',
 'People search logs with fragments, cursed IDs, guessed field names, and punctuation shaped by caffeine. Detect that pattern and help them before the console keeps pretending everyone arrives calm and literate.',
 'make log search explain panic in english',
  89),

-- Alerting PM Danielle
-- REPORTER: Danielle | Alerting PM | Specializes in separating useful pages from notifications that only distribute insomnia more equitably across the org.
('SPOOK-939', 'Mark the Pager Rules That Wake People Without Improving Anything',
 'Some pages mobilize help. Others just spread suffering to more bedrooms while everyone waits for daylight or a vendor to answer. Add a no-help wakefulness setting before the alert policy keeps confusing urgency with volume.',
 'mark pager rules that only wake humans',
  144),

('SPOOK-940', 'Identify the Alerts We Still Keep Because One Executive Saw Them Once',
 'Certain thresholds survive not because they catch incidents, but because someone important noticed the chart during a scary quarter and blessed it into immortality. Track prestige-preserved alerts before fear and title harden into monitoring policy.',
 'identify the alerts we still keep',
  89),

-- Telemetry Data Scientist Victor
-- REPORTER: Victor | Telemetry Data Scientist | Keeps trying to explain that novelty is not danger, Tuesday is not a crisis, and the anomaly detector needs to calm down.
('SPOOK-941', 'Make the Anomaly Detector Admit When It Found Weirdness Instead of Trouble',
 'Statistical novelty is not the same thing as operational harm. Sometimes the system failed. Sometimes Tuesday just looked odd and the model got spiritually excited. Add a category for interesting normal before curiosity keeps summoning response teams.',
 'make anomaly detectors say they found weirdness',
  144),

('SPOOK-942', 'Put a "Would You Bet Cash on This?" Meter on Every Burn-Down Forecast',
 'Forecast widgets have become far too bold for charts built on stale inputs, cheerful assumptions, and the hope that humans will behave with unusual discipline. Add gambling honesty before decorative math keeps cosplaying as planning.',
 'put would you bet cash meter on forecasts',
  89),

-- Staff SRE Layla
-- REPORTER: Layla | Staff SRE | Has stopped calling them golden signals until they survive exporter nonsense, sampling drift, and one bad pod without fainting.
('SPOOK-943', 'Admit Which Golden Signals Are Actually Bronze on a Good Day',
 'Not every supposedly golden signal is stable, meaningful, or even consistently present. Grade them so operators know which ones deserve reverence and which ones are just well-marketed approximations with exporter issues.',
 'admit which golden signals are bronze',
  144),

('SPOOK-944', 'Track the Delay Between Humans Knowing Something Is Broken and Monitoring Figuring It Out',
 'Users, support, and one suspiciously intuitive engineer often know about the incident before our stack politely joins the conversation. Record that lag so monitoring stops flattering itself as the first witness when it arrived well dressed and late.',
 'track human versus monitoring detection lag',
  144),

-- Chief Signal Officer Petra
-- REPORTER: Petra | Chief Signal Officer | Maintains a private registry of numbers everyone fears, nobody understands, and at least one executive treats like a comfort object.
('SPOOK-945', 'Grey Out Graphs Nobody Has Used in 90 Days Unless Someone Signs for Them',
 'Some metrics are not operational signals anymore. They are family heirlooms with axis labels. Grey them out, slap an Unclaimed Since Q2 badge on them, and require a living owner to explain why they still deserve wall space.',
 'grey out unused graphs unless someone claims them',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Mara [Observability Lead]', reporter_name = 'Mara', reporter_title = 'Observability Lead', reporter_description = 'Lives among graphs dramatic enough to wake three managers before sunrise and still fail to describe one real customer problem.' WHERE id IN ('SPOOK-931', 'SPOOK-932');
UPDATE community_backlog SET reporter = 'Keon [Incident Telemetry PM]', reporter_name = 'Keon', reporter_title = 'Incident Telemetry PM', reporter_description = 'Knows half the architecture only becomes visible when something breaks loudly enough for everyone to remember it at once.' WHERE id IN ('SPOOK-933', 'SPOOK-934');
UPDATE community_backlog SET reporter = 'Anika [Reliability Engineer]', reporter_name = 'Anika', reporter_title = 'Reliability Engineer', reporter_description = 'Wants to know whether the SLO actually hurt users or merely bruised the monitoring team''''s self-esteem.' WHERE id IN ('SPOOK-935', 'SPOOK-936');
UPDATE community_backlog SET reporter = 'Nikhil [Logging Systems Architect]', reporter_name = 'Nikhil', reporter_title = 'Logging Systems Architect', reporter_description = 'Pays too much to store perfect structured nonsense emitted by services that love speaking and hate saying anything useful.' WHERE id IN ('SPOOK-937', 'SPOOK-938');
UPDATE community_backlog SET reporter = 'Danielle [Alerting PM]', reporter_name = 'Danielle', reporter_title = 'Alerting PM', reporter_description = 'Specializes in separating useful pages from notifications that only distribute insomnia more equitably across the org.' WHERE id IN ('SPOOK-939', 'SPOOK-940');
UPDATE community_backlog SET reporter = 'Victor [Telemetry Data Scientist]', reporter_name = 'Victor', reporter_title = 'Telemetry Data Scientist', reporter_description = 'Keeps trying to explain that novelty is not danger, Tuesday is not a crisis, and the anomaly detector needs to calm down.' WHERE id IN ('SPOOK-941', 'SPOOK-942');
UPDATE community_backlog SET reporter = 'Layla [Staff SRE]', reporter_name = 'Layla', reporter_title = 'Staff SRE', reporter_description = 'Has stopped calling them golden signals until they survive exporter nonsense, sampling drift, and one bad pod without fainting.' WHERE id IN ('SPOOK-943', 'SPOOK-944');
UPDATE community_backlog SET reporter = 'Petra [Chief Signal Officer]', reporter_name = 'Petra', reporter_title = 'Chief Signal Officer', reporter_description = 'Maintains a private registry of numbers everyone fears, nobody understands, and at least one executive treats like a comfort object.' WHERE id IN ('SPOOK-945');

-- GUNK: CSV sludge, ETL goo, imports, exports, cleanup debt, and migration sludge
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Data Migration Lead Rhea
-- REPORTER: Rhea | Data Migration Lead | Can identify a spreadsheet feud by headers alone and has seen enough comma-delimited peace treaties to stop trusting neat exports on sight.
('GUNK-946', 'Warn Us When a CSV Looks Like It Was Written During a Spreadsheet Civil War',
 'Some imports arrive with duplicate columns, contradictory dates, and headers that clearly survived a long-running war between Ops, Finance, and one export button nobody fully controls. Detect the feud before the importer mistakes compromise for schema.',
 'warn when csvs look like spreadsheet warfare',
  144),

('GUNK-947', 'Teach ETL the Difference Between Broken Data and Data That Has Simply Lived Too Much',
 'Not every ugly row is malformed. Some are just overhandled, backfilled, re-exported, manually edited, and exhausted from surviving three pivots and two systems migrations. Tag the lived-too-much records before cleanup starts treating trauma like syntax.',
 'teach etl broken versus battle-damaged data',
  144),

-- Integrations Engineer Pavel
-- REPORTER: Pavel | Integrations Engineer | Believes no export should be forced to carry every panic-era column we once created to end an argument quickly.
('GUNK-948', 'Let Exports Leave the Panic Columns Behind',
 'Our exports keep dragging along fields born during one frantic quarter because someone somewhere might still reference them in a spreadsheet with trembling loyalty. Add a regret-aware mode before those columns fossilize into customer expectations.',
 'let exports leave the panic columns behind',
  89),

('GUNK-949', 'Show How Much of Every Backfill Is Fixing Data and How Much Is Just Archaeology',
 'Backfills get sold as repairs when a big chunk of the work is actually excavating old assumptions, dead owners, and enums nobody recognizes but everyone fears. Add an archaeology meter so the cleanup stops pretending it is all neat plumbing.',
 'show how much backfill is digging',
  144),

-- Analytics Ops Manager Talia
-- REPORTER: Talia | Analytics Ops Manager | Can smell a warehouse column nobody has touched since two reorgs ago and one VP''s threatened dashboard review.
('GUNK-950', 'Sniff Out Warehouse Columns That Survive Purely on Fear',
 'Tables keep collecting untouched fields because storage is cheap and deletion is terrifying. Add a smell test for columns nobody has queried in ages before decorative warehouse sludge gets another year on payroll.',
 'sniff out fear-kept warehouse columns',
  144),

('GUNK-951', 'Make Every Text-Field Cleanup Confess Why We Did This to Ourselves',
 'We have accumulated enough free-form blobs and numerically themed strings to deserve a registry of regret. Require each cleanup to explain whether text won because of speed, laziness, diplomacy, uncertainty, or everyone being too hungry to pick a schema.',
 'make text cleanups confess their regrets',
  89),

-- Import Workflow PM Hasan
-- REPORTER: Hasan | Import Workflow PM | Knows users will gladly map two different concepts into one familiar-looking column if the deadline is glaring from the hallway.
('GUNK-952', 'Warn When the Mapping UI Is About to Merge Cousin-Shaped Lies',
 'Column mapping keeps failing gracefully because people will force unrelated concepts together if the labels feel close enough and the pressure is high enough. Catch status becoming source, customer becoming account, and surname becoming pure vibe.',
 'warn when mapping ui merges cousin-lies',
  144),

('GUNK-953', 'Count the Rows We Matched Mainly Through Personal Optimism',
 'Record linkage keeps benefiting from a level of fuzzy confidence that might be charming at brunch and is less welcome in finance. Add an optimism counter before matching starts legislating distant cousins into one clean row.',
 'count rows matched through optimism',
  144),

-- Platform Data Architect Sonia
-- REPORTER: Sonia | Platform Data Architect | Is tired of the canonical schema adopting every upstream quirk like a sentimental foster parent with no boundaries.
('GUNK-954', 'Stop the Canonical Schema from Adopting Every Upstream Quirk',
 'Our core model keeps absorbing source-system weirdness in the name of compatibility until it becomes a wider and sadder version of every bad decision upstream. Tighten governance before the canonical schema turns into a family shelter for malformed ideas.',
 'stop canonical schemas adopting upstream quirks',
  144),

('GUNK-955', 'Ban Surprise Friday Enum Values in Writing',
 'Some producers keep evolving payloads in ways that are technically understandable and socially criminal, especially at 4:58 p.m. on Friday. Add a temporal courtesy rule before downstream trust curdles completely.',
 'ban surprise friday enum values in writing',
  144),

-- Principal ETL Developer Marco
-- REPORTER: Marco | Principal ETL Developer | Can trace half the cleaning rules in the pipeline back to one monstrous vendor file nobody has emotionally recovered from.
('GUNK-956', 'Split Normal Cleaning Rules from the Ones Written in Historical Panic',
 'Many transformations exist because one file behaved monstrously six quarters ago and the team never unclenched. Separate universal hygiene from trauma-driven scrubbing before every new job inherits somebody else''s flinch response.',
 'split normal cleaning from panic cleaning',
  89),

('GUNK-957', 'Make Failure Emails Tell Us Whether the Real Problem Is Data, Schema, or Hope',
 'Batch notifications keep flattening malformed inputs, contract drift, missing owners, and pure optimism into the same red rectangle. Tell responders whether code broke or whether hope simply exceeded the schema again.',
 'make failure emails blame data schema or hope',
  89),

-- VP of Data Liquefaction Nina
-- REPORTER: Nina | VP of Data Liquefaction | Specializes in records that survived the thaw looking clean enough for systems and spiritually detached enough to cause trouble later.
('GUNK-958', 'Label Which Legacy Records Were Recovered and Which Were Just Rehydrated',
 'Old imports often emerge looking structured while remaining subtly detached from whatever truth they once represented. Add provenance states so downstream systems can tell fully recovered data from beautifully reanimated mush.',
 'label legacy records recovered or rehydrated',
  144),

('GUNK-959', 'Give the Parser a Warning When an Executive Has Artistically Touched the Spreadsheet',
 'Files gain a special kind of chaos once someone senior has merged cells for emphasis, renamed headers into slogans, and added one top note that says ignore this tab while clearly making it the holiest tab in the workbook. Let the parser brace itself.',
 'warn parser when exec touched the spreadsheet artistically',
  144),

-- Chief Sludge Curator Ellis
-- REPORTER: Ellis | Chief Sludge Curator | Wants a map of every pipeline that is clear, murky, or one inherited CSV rite away from evolving teeth.
('GUNK-960', 'Publish a Data Swamp Map Before the Murky Pipelines Start Breeding Creatures',
 'The company needs a map showing which flows are clear, which are understandable only to one keeper, and which have become damp ecosystems of transforms, exceptions, and inherited import rituals nobody would design sober. Prioritize the sludge before it gains more wildlife.',
 'publish data swamp map',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Rhea [Data Migration Lead]', reporter_name = 'Rhea', reporter_title = 'Data Migration Lead', reporter_description = 'Can identify a spreadsheet feud by headers alone and has seen enough comma-delimited peace treaties to stop trusting neat exports on sight.' WHERE id IN ('GUNK-946', 'GUNK-947');
UPDATE community_backlog SET reporter = 'Pavel [Integrations Engineer]', reporter_name = 'Pavel', reporter_title = 'Integrations Engineer', reporter_description = 'Believes no export should be forced to carry every panic-era column we once created to end an argument quickly.' WHERE id IN ('GUNK-948', 'GUNK-949');
UPDATE community_backlog SET reporter = 'Talia [Analytics Ops Manager]', reporter_name = 'Talia', reporter_title = 'Analytics Ops Manager', reporter_description = 'Can smell a warehouse column nobody has touched since two reorgs ago and one VP''''s threatened dashboard review.' WHERE id IN ('GUNK-950', 'GUNK-951');
UPDATE community_backlog SET reporter = 'Hasan [Import Workflow PM]', reporter_name = 'Hasan', reporter_title = 'Import Workflow PM', reporter_description = 'Knows users will gladly map two different concepts into one familiar-looking column if the deadline is glaring from the hallway.' WHERE id IN ('GUNK-952', 'GUNK-953');
UPDATE community_backlog SET reporter = 'Sonia [Platform Data Architect]', reporter_name = 'Sonia', reporter_title = 'Platform Data Architect', reporter_description = 'Is tired of the canonical schema adopting every upstream quirk like a sentimental foster parent with no boundaries.' WHERE id IN ('GUNK-954', 'GUNK-955');
UPDATE community_backlog SET reporter = 'Marco [Principal ETL Developer]', reporter_name = 'Marco', reporter_title = 'Principal ETL Developer', reporter_description = 'Can trace half the cleaning rules in the pipeline back to one monstrous vendor file nobody has emotionally recovered from.' WHERE id IN ('GUNK-956', 'GUNK-957');
UPDATE community_backlog SET reporter = 'Nina [VP of Data Liquefaction]', reporter_name = 'Nina', reporter_title = 'VP of Data Liquefaction', reporter_description = 'Specializes in records that survived the thaw looking clean enough for systems and spiritually detached enough to cause trouble later.' WHERE id IN ('GUNK-958', 'GUNK-959');
UPDATE community_backlog SET reporter = 'Ellis [Chief Sludge Curator]', reporter_name = 'Ellis', reporter_title = 'Chief Sludge Curator', reporter_description = 'Wants a map of every pipeline that is clear, murky, or one inherited CSV rite away from evolving teeth.' WHERE id IN ('GUNK-960');

-- HAVOC: launch ops, release trains, rollback panic, coordination blasts, and ship-day chaos
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Release Operations Director Keira
-- REPORTER: Keira | Release Operations Director | Knows launch momentum can impersonate readiness right up until strangers touch the feature.
('HAVOC-961', 'Force Every Launch Checklist to Ask Whether We Are Mistaking Momentum for Readiness',
 'Ship pressure has a way of making the calendar feel like proof. Add a step that separates actual readiness from the emotional volume generated by dates, exec excitement, and several people saying we are close enough.',
 'make launch checklists doubt momentum',
  144),

('HAVOC-962', 'Install a Rollback Bot That Deletes the Word Unless the Right Person Types It',
 'Rollback is never just technical. It is pride, sunk effort, and one terrifying moment where everyone hopes someone more senior says the word first. Add a war-room bot that eats unauthorized rollback messages so production does not stay in the blast zone waiting for hierarchy to clear its throat.',
 'install rollback bot for unauthorized rollbacks',
  144),

-- Change Management PM Rafael
-- REPORTER: Rafael | Change Management PM | Has watched too many release trains absorb random hitchhiker features because nobody wanted to create one more date.
('HAVOC-963', 'Label the Features Riding This Release Train Only Because Nobody Wanted Another Train',
 'Bundles keep picking up extra work not because it belongs, but because scheduling later feels weak and paperwork-heavy. Give the opportunistic riders their own carriage before indecision starts shipping as cargo.',
 'label features freeloading on release trains',
  144),

('HAVOC-964', 'Mark Launch Risks That Were Rewritten as Confidence Instead of Fixed',
 'Go/no-go meetings have a bad habit of turning sharp unresolved problems into owners, mitigations, and soothing tone. Add a launch-review panel that marks the risks that got laundered into calm language instead of actually fixed.',
 'mark launch risks laundered into confidence',
  144),

-- Program Release Manager Naomi
-- REPORTER: Naomi | Program Release Manager | Knows code is often the least dangerous part of launch day once enough calendars, timezones, and adjacent teams get involved.
('HAVOC-965', 'Mark the Point Where Coordination Became More Dangerous Than the Code',
 'At a certain scale, the riskiest part of launch is no longer the software. It is sequencing, handoffs, support prep, legal wording, sales awareness, and one unlucky timezone. Mark when orchestration overtakes code as the main threat.',
 'mark when coordination beats code as risk',
  144),

('HAVOC-966', 'Make Freeze Windows Explain Whether They Prevent Failure or Just Comfort the Elders',
 'Release freezes have genuine value and also suspicious amounts of seasonal mythology attached to them. Add a note explaining whether a freeze protects real stability or simply reenacts a ritual everyone feels safer performing every year.',
 'make freeze windows admit they calm execs',
  89),

-- Site Launch Coordinator Imogen
-- REPORTER: Imogen | Site Launch Coordinator | Distrusts anyone typing All Good twice while the room smells like hot laptops and airborne denial.
('HAVOC-967', 'Put a Tiny Sweating Dot Next to Anyone Who Says "All Good" Too Calmly During Launch',
 'Launch rooms run partly on information and partly on performance. If someone posts All Good twice while their soul is clearly on fire, the UI should say so for them.',
 'add sweating dot to people saying all good',
  89),

('HAVOC-968', 'Split Release Notes into Customer Value and Things We Only Shipped to Unblock Ourselves',
 'Some release items help users. Others retire platform shame, remove internal pain, or unblock future work while getting dressed up as delight for symmetry. Separate the two before maintenance keeps winning marketing language it did not earn.',
 'split release notes into value and unblockers',
  144),

-- Dev Productivity Lead Ben
-- REPORTER: Ben | Dev Productivity Lead | Worries every emergency path eventually becomes the favorite path for people holding deadlines and active delusions.
('HAVOC-969', 'Make the Hotfix Path Feel Dangerous Again',
 'Hotfixes become irresistible when the normal path is too slow, too ceremonial, or too clogged with process acoustics. Rebalance the flow so emergency shipping stops becoming the preferred route for anyone carrying a promise and a worried face.',
 'make the hotfix path feel dangerous again',
  144),

('HAVOC-970', 'Split Deployment Approval into "I Trust This" and "The Calendar Won"',
 'Approvals currently blur genuine technical belief with surrender to the schedule. Add separate states so the audit trail can show whether we shipped because the team trusted the build or because standing still felt socially unaffordable.',
 'split deploy approvals into trust or calendar',
  89),

-- Customer Launch Readiness PM Julia
-- REPORTER: Julia | Customer Launch Readiness PM | Thinks every launch should predict which tiny behavior change will make competent users the most personally furious.
('HAVOC-971', 'Pin the Most Personally Irritating Change to the Top of Every Launch Checklist',
 'Launch prep spends too much time admiring features and not enough time naming the tiny change most likely to ruin a stable customer workflow. Put the most personally irritating change at the top of the checklist before support learns it live and emotionally.',
 'pin most irritating change to launch checklist',
  144),

('HAVOC-972', 'Show the Adjacent Teams That Are Still Secretly Not Ready Yet',
 'Core teams love to feel ready while docs, billing, legal, training, and analytics lag just far enough behind to create a halo of danger. Add an unready-perimeter panel naming the neighboring teams still running on vibes before coordination by osmosis gets mistaken for a plan.',
 'show adjacent teams that are not ready',
  144),

-- Chief Delivery Officer Marceline
-- REPORTER: Marceline | Chief Delivery Officer | Can tell when a phased rollout is prudence and when it is just fear cut into thinner slices for easier internal consumption.
('HAVOC-973', 'Label Rollouts as "Risk Reduction" or "Anxiety in Installments"',
 'Phased launch can reduce risk or simply spread the same fear across more days and more Slack messages. Add an explicit rollout label before suspense starts posing as discipline.',
 'label rollouts risk reduction or installment anxiety',
  144),

('HAVOC-974', 'Ask Whether This Bug Was Bad or Just Bad During Launch Week',
 'A lot of defects are survivable until they happen inside the sacred heat of a launch window, where timing adds audience, symbolism, and five extra opinions per minute. Test for launch-amplified pain before the bug gets all the credit.',
 'ask if launch week made this bug',
  89),

-- VP of Controlled Disaster Felicity
-- REPORTER: Felicity | VP of Controlled Disaster | Believes some launches deserve recognition not for elegance but for the number of executives, lawyers, and nervous refreshes they consumed and still survived.
('HAVOC-975', 'Award a Flaming Gold Star to Launches That Survived by Eating Half the Org',
 'Some successful launches go out cleanly. Others require pages, reversions, support confusion, legal side-eyes, and enough leadership refreshing to warm a village. Mark the expensive survivors accordingly.',
 'award launches that ate half the org',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Keira [Release Operations Director]', reporter_name = 'Keira', reporter_title = 'Release Operations Director', reporter_description = 'Knows launch momentum can impersonate readiness right up until strangers touch the feature.' WHERE id IN ('HAVOC-961', 'HAVOC-962');
UPDATE community_backlog SET reporter = 'Rafael [Change Management PM]', reporter_name = 'Rafael', reporter_title = 'Change Management PM', reporter_description = 'Has watched too many release trains absorb random hitchhiker features because nobody wanted to create one more date.' WHERE id IN ('HAVOC-963', 'HAVOC-964');
UPDATE community_backlog SET reporter = 'Naomi [Program Release Manager]', reporter_name = 'Naomi', reporter_title = 'Program Release Manager', reporter_description = 'Knows code is often the least dangerous part of launch day once enough calendars, timezones, and adjacent teams get involved.' WHERE id IN ('HAVOC-965', 'HAVOC-966');
UPDATE community_backlog SET reporter = 'Imogen [Site Launch Coordinator]', reporter_name = 'Imogen', reporter_title = 'Site Launch Coordinator', reporter_description = 'Distrusts anyone typing All Good twice while the room smells like hot laptops and airborne denial.' WHERE id IN ('HAVOC-967', 'HAVOC-968');
UPDATE community_backlog SET reporter = 'Ben [Dev Productivity Lead]', reporter_name = 'Ben', reporter_title = 'Dev Productivity Lead', reporter_description = 'Worries every emergency path eventually becomes the favorite path for people holding deadlines and active delusions.' WHERE id IN ('HAVOC-969', 'HAVOC-970');
UPDATE community_backlog SET reporter = 'Julia [Customer Launch Readiness PM]', reporter_name = 'Julia', reporter_title = 'Customer Launch Readiness PM', reporter_description = 'Thinks every launch should predict which tiny behavior change will make competent users the most personally furious.' WHERE id IN ('HAVOC-971', 'HAVOC-972');
UPDATE community_backlog SET reporter = 'Marceline [Chief Delivery Officer]', reporter_name = 'Marceline', reporter_title = 'Chief Delivery Officer', reporter_description = 'Can tell when a phased rollout is prudence and when it is just fear cut into thinner slices for easier internal consumption.' WHERE id IN ('HAVOC-973', 'HAVOC-974');
UPDATE community_backlog SET reporter = 'Felicity [VP of Controlled Disaster]', reporter_name = 'Felicity', reporter_title = 'VP of Controlled Disaster', reporter_description = 'Believes some launches deserve recognition not for elegance but for the number of executives, lawyers, and nervous refreshes they consumed and still survived.' WHERE id IN ('HAVOC-975');

-- ZANY: deliberately miscellaneous cursed leftovers, weird platforms, and final backlog oddities
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Office Infrastructure Curator Nell
-- REPORTER: Nell | Office Infrastructure Curator | Takes missing yogurt and fake room occupancy more seriously than some teams take platform risk.
('ZANY-976', 'Treat Missing Yogurt as a Supply Chain Incident',
 'Snack disappearance has crossed the line from petty annoyance into measurable trust collapse. Wire the breakroom fridge weight-sensors into the ERP system. If the yogurt inventory drops without a corresponding badge swipe, trigger an automated "Supply Chain Incident" alert to the Facilities Slack channel.',
 'wire breakroom fridge sensors to incident alerts',
  89),

('ZANY-977', 'Teach Room Tablets the Difference Between Real Meetings and Prestige Linger',
 'Conference rooms stay occupied because people keep performing importance for six extra minutes after the useful part ends. Write a script that checks the room''s motion sensors against the calendar end-time. If there is movement but no active screen-sharing, label the duration "Prestige Linger" in the utilization dashboard.',
 'track fake meeting extensions in the dashboard',
  89),

-- Corporate Archivist Simon
-- REPORTER: Simon | Corporate Archivist | Fights a lonely war against handsome dead PDFs and wiki pages preserved mainly by old certainty and carpet smell.
('ZANY-978', 'Stop Intranet Search from Worshipping PDFs That Smell Like 2014',
 'Search keeps overranking elderly documents whose formatting radiates permanence despite being obsolete by three systems and two reorgs. Demote the handsome dead PDFs before the intranet fully turns into a mausoleum concierge.',
 'stop intranet search worshipping old pdfs',
  89),

('ZANY-979', 'Put a Badge on Wiki Pages That Says "Sounded Right When Written"',
 'Some documentation is accurate. Some is just a preserved moment of markdown confidence from someone who had no idea the future would object. Mark the difference so old certainty stops passing for maintenance.',
 'badge wiki pages that once sounded right',
  89),

-- Enterprise Gadget PM Yuki
-- REPORTER: Yuki | Enterprise Gadget PM | Has seen enough keynote tablets betray executives mid-flight to stop trusting software updates around symbolic events.
('ZANY-980', 'Stop the CEO Demo Tablet from Updating During Flights, Summits, or Emotional Milestones',
 'Executive demo hardware keeps discovering new software at the exact moment a room full of people wants inevitability instead. Add occasion awareness so the tablet can preserve both trust and the keynote.',
 'stop ceo demo tablets updating',
  144),

('ZANY-981', 'Give Badge Readers a Graceful Mode for Investors Who Think Doors Are Optional',
 'There is a recurring premium edge case where a wealthy visitor assumes access control should yield to title, confidence, and vague urgency. Add a fallback that protects security without turning the lobby into a referendum on money and friction.',
 'give badge readers investor mode',
  89),

-- Workplace Automation Hacker Priyesh
-- REPORTER: Priyesh | Workplace Automation Hacker | Understands that printers, calendars, and room sensors all eventually become political instruments with batteries.
('ZANY-982', 'Make the Printer Queue Rank Jobs by Career Damage Potential',
 'Some print jobs are handouts. Others are HR packets, board decks, or budget materials whose delay can alter an afternoon and maybe a promotion. Rank the queue by combustibility instead of naïve first-in-first-out civility.',
 'rank print jobs by career damage',
  144),

('ZANY-983', 'Warn When a Calendar Invite Is Really Just Passive-Aggressive Performance Art',
 'Shared calendars now carry subtext through titles and the strategic misuse of "optional." Build an Outlook plugin that analyzes attendee hierarchy vs. meeting topic. If an invite includes three VPs for a "Quick Sync" at 4:45 PM on a Friday, append a red `[HOSTILE]` tag to the subject line.',
 'make outlook plugin flag hostile calendar invites',
  89),

-- Customer Demo Engineer Becca
-- REPORTER: Becca | Customer Demo Engineer | Distrusts pristine sample accounts and wants demo environments with at least one unlucky adult trapped inside them.
('ZANY-984', 'Make Demo Data Slightly Broken So It Resembles Civilization',
 'Synthetic demos are suspiciously free of duplicate accounts, malformed names, mixed currencies, and legacy garbage. Roughen the sample data until it starts looking like the world we actually charge people to survive.',
 'make demo data slightly broken',
  144),

('ZANY-985', 'Add a Sample User Who Is Competent but Chronically Unlucky',
 'Current demo personas are either blessed or confused. Add one who does everything right and still gets kneecapped by policy, timing, or system mood, because customers recognize that person instantly and sales quietly respects them.',
 'add sample user who is chronically unlucky',
  89),

-- Experimental Interfaces Researcher Hugo
-- REPORTER: Hugo | Experimental Interfaces Researcher | Wishes voice and gesture systems would admit how often they are freestyling over room noise and enthusiastic arm flailing.
('ZANY-986', 'Make the Voice Assistant Sound Less Certain When It Is Guessing from Acoustic Soup',
 'Speech systems over-project confidence right in the mushy zone where room noise, half-formed intent, and acoustic superstition are doing most of the work. Lower the swagger before wrongness starts arriving in a soothing tone.',
 'make voice assistant sound less sure when guessing',
  89),

('ZANY-987', 'Teach Gesture Controls the Difference Between Commands and Emphatic Human Arms',
 'Gesture UIs remain too eager to interpret ordinary emphasis as system control. Add an emphatic-but-noninteractive state before one animated explanation accidentally mutes, closes, or approves something expensive.',
 'teach gesture controls emphatic human arms',
  89),

-- Corporate Folklore Analyst Mina
-- REPORTER: Mina | Corporate Folklore Analyst | Catalogs the exact moment a managerly rumor turns into an office law everyone follows despite no document ever authorizing it.
('ZANY-988', 'Split Real Policy from the Stories Managers Keep Telling with Authority',
 'Companies accumulate a layer of oral compliance where half-remembered decisions harden into superstition. Add an "Is This Real?" upvote button to the HR Wiki. If a policy page gets downvoted by more than three legal team members, automatically prepend `[FOLKLORE]` to the page title.',
 'add folklore voting button to hr wiki',
  144),

('ZANY-989', 'Predict Which Exception Will Be Remembered as Tradition in Six Months',
 'Temporary exceptions rarely stay temporary once enough confident people repeat them. Add a "Tradition Forecast" column to the Ops approval queue. Train a basic model to flag any workaround that has been approved three times in one month, so we know which duct tape is becoming load-bearing.',
 'add tradition forecast column to ops queue',
  89),

-- Platform Curiosity Officer Devon
-- REPORTER: Devon | Platform Curiosity Officer | Refuses to let staging become so clean that engineers forget reality contains weird little knives.
('ZANY-990', 'Hide One Tasteful Landmine in Every Sandbox So Nobody Gets Comfortable',
 'Test environments that are too clean teach the wrong kind of courage. Seed one strange but plausible edge case so teams occasionally remember the world is not made of symmetric forms and agreeable fake names.',
 'hide one tasteful landmine in every sandbox',
  144),

('ZANY-991', 'Mark the Demos That Only Work Because the Presenter Memorized Around the Broken Part',
 'Some internal demos appear stable because the presenter knows exactly which tab not to open and where to narrate over the latency. Add a flag so choreography stops laundering fragility into competence.',
 'mark the demos that only work',
  89),

-- Chief Administrative Surrealist Petra
-- REPORTER: Petra | Chief Administrative Surrealist | Reviews reimbursements and procurement requests for signs that the explanation has started doing more work than the evidence.
('ZANY-992', 'Reject Expense Claims Whose Moral Justification Is More Detailed Than the Receipt',
 'Expense notes are becoming tiny novellas because the charge is delicate, weird, or openly disallowed and somebody believes enough prose can soften reality. Detect when the narrative is carrying more weight than the proof.',
 'reject expense claims with ethical novellas',
  144),

('ZANY-993', 'Let Procurement Requests Say "The Current Thing Offends My Soul"',
 'Not every purchase request comes from clean ROI. Some come from long exposure to a tool that has become spiritually corrosive. Add a "This Offends My Soul" option to the Procurement Intake dropdown. If selected, disable the ROI calculator and automatically route the ticket to the VP of Finance with a mandatory text box for venting.',
 'add soul offense override to procurement form',
  89),

-- Workflow Anthropologist Oscar
-- REPORTER: Oscar | Workflow Anthropologist | Studies the exact moment a new portal quietly duplicates a legacy ritual nobody had the courage to kill first.
('ZANY-994', 'Ask Every New Onboarding Step Which Old Ritual It Is Accidentally Duplicating',
 'Onboarding steps keep growing around team customs, legacy emails, and one ritual somebody swears is essential. Add a duplication check before software laminates tradition into yet another mandatory click path.',
 'ask onboarding steps which ritual they duplicate',
  89),

('ZANY-995', 'Count Survey Questions Added Because Somebody Had a Bad Tuesday',
 'Survey sprawl often comes from one recent incident getting promoted into quarter-scale listening theater. Build a cron job that checks the SurveyMonkey API for new questions and cross-references them against PagerDuty alerts from the last 48 hours. Print a dashboard metric showing exactly how much of our "curiosity" is just fresh trauma.',
 'cross reference new survey questions with pagerduty',
  89),

-- Enterprise Absurdity Fellow Lana
-- REPORTER: Lana | Enterprise Absurdity Fellow | Maintains the sacred registry of acronyms clearly reverse-engineered from panic, slide urgency, and funding opportunity.
('ZANY-996', 'Flag New Acronyms That Were Obviously Reverse-Engineered from Panic',
 'Some internal programs are named first and explained later with heroic creativity. Build a Confluence webhook that runs a dictionary check on new project acronyms. If the underlying words do not form a grammatically coherent sentence, highlight the acronym in neon pink so it stops settling into budgets without shame.',
 'highlight fake confluence backronyms in neon pink',
  144),

('ZANY-997', 'Put a "Would Fewer People Help?" Prompt on Steering Committee Invites',
 'Committee gravity is one of our most renewable resources. Add a prompt to calendar invites with more than eight people asking if the guest list improves the decision, or merely deepens the ambiance of procedural adulthood.',
 'warn when meeting invites look like hostage situations',
  89),

-- Misc Systems Custodian Ravi
-- REPORTER: Ravi | Misc Systems Custodian | Has accepted that the fax bridge is no longer temporary and is in fact a mature organism with legal significance and a pulse.
('ZANY-998', 'Reclassify the Legacy Fax Integration as a Native Species',
 'We have spent too long calling the fax bridge temporary while routing critical traffic through it. Go into the AWS tag editor and the internal Service Registry. Remove the "deprecated" tag, add "load-bearing," and change its lifecycle status from "Sunsetting" to "Immortal." It is time to treat this organ with respect.',
 'remove deprecated tag from the fax bridge',
  144),

('ZANY-999', 'Give Every Temporary Workaround Old Enough to Rent a Car a Birthday Badge',
 'Temporary fixes gain camouflage from familiarity. Write a script that scans the codebase for `// TODO: temporary` comments using `git blame`. If the comment is older than 5 years, automatically inject a 🎂 emoji next to it in the GitHub UI, and post a birthday announcement in the `#engineering` Slack channel.',
 'make slack bot celebrate five year old todos',
  89),

-- Grand Marshal of Backlog Excess Inez
-- REPORTER: Inez | Grand Marshal of Backlog Excess | Realizes the backlog is no longer merely tracking work and may now qualify as its own hostile administrative civilization.
('ZANY-1000', 'Add a Bureaucratic-Universe Warning to the Backlog Home Screen',
 'At some point we stopped documenting tasks and started curating an entire cosmology of rituals, hazards, debts, and process wildlife. Add a self-aware warning banner to the backlog home screen so the system can confess what it has become before it annexes neighboring realities.',
 'warn when backlog enters bureaucratic universe',
  233);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Nell [Office Infrastructure Curator]', reporter_name = 'Nell', reporter_title = 'Office Infrastructure Curator', reporter_description = 'Takes missing yogurt and fake room occupancy more seriously than some teams take platform risk.' WHERE id IN ('ZANY-976', 'ZANY-977');
UPDATE community_backlog SET reporter = 'Simon [Corporate Archivist]', reporter_name = 'Simon', reporter_title = 'Corporate Archivist', reporter_description = 'Fights a lonely war against handsome dead PDFs and wiki pages preserved mainly by old certainty and carpet smell.' WHERE id IN ('ZANY-978', 'ZANY-979');
UPDATE community_backlog SET reporter = 'Yuki [Enterprise Gadget PM]', reporter_name = 'Yuki', reporter_title = 'Enterprise Gadget PM', reporter_description = 'Has seen enough keynote tablets betray executives mid-flight to stop trusting software updates around symbolic events.' WHERE id IN ('ZANY-980', 'ZANY-981');
UPDATE community_backlog SET reporter = 'Priyesh [Workplace Automation Hacker]', reporter_name = 'Priyesh', reporter_title = 'Workplace Automation Hacker', reporter_description = 'Understands that printers, calendars, and room sensors all eventually become political instruments with batteries.' WHERE id IN ('ZANY-982', 'ZANY-983');
UPDATE community_backlog SET reporter = 'Becca [Customer Demo Engineer]', reporter_name = 'Becca', reporter_title = 'Customer Demo Engineer', reporter_description = 'Distrusts pristine sample accounts and wants demo environments with at least one unlucky adult trapped inside them.' WHERE id IN ('ZANY-984', 'ZANY-985');
UPDATE community_backlog SET reporter = 'Hugo [Experimental Interfaces Researcher]', reporter_name = 'Hugo', reporter_title = 'Experimental Interfaces Researcher', reporter_description = 'Wishes voice and gesture systems would admit how often they are freestyling over room noise and enthusiastic arm flailing.' WHERE id IN ('ZANY-986', 'ZANY-987');
UPDATE community_backlog SET reporter = 'Mina [Corporate Folklore Analyst]', reporter_name = 'Mina', reporter_title = 'Corporate Folklore Analyst', reporter_description = 'Catalogs the exact moment a managerly rumor turns into an office law everyone follows despite no document ever authorizing it.' WHERE id IN ('ZANY-988', 'ZANY-989');
UPDATE community_backlog SET reporter = 'Devon [Platform Curiosity Officer]', reporter_name = 'Devon', reporter_title = 'Platform Curiosity Officer', reporter_description = 'Refuses to let staging become so clean that engineers forget reality contains weird little knives.' WHERE id IN ('ZANY-990', 'ZANY-991');
UPDATE community_backlog SET reporter = 'Petra [Chief Administrative Surrealist]', reporter_name = 'Petra', reporter_title = 'Chief Administrative Surrealist', reporter_description = 'Reviews reimbursements and procurement requests for signs that the explanation has started doing more work than the evidence.' WHERE id IN ('ZANY-992', 'ZANY-993');
UPDATE community_backlog SET reporter = 'Oscar [Workflow Anthropologist]', reporter_name = 'Oscar', reporter_title = 'Workflow Anthropologist', reporter_description = 'Studies the exact moment a new portal quietly duplicates a legacy ritual nobody had the courage to kill first.' WHERE id IN ('ZANY-994', 'ZANY-995');
UPDATE community_backlog SET reporter = 'Lana [Enterprise Absurdity Fellow]', reporter_name = 'Lana', reporter_title = 'Enterprise Absurdity Fellow', reporter_description = 'Maintains the sacred registry of acronyms clearly reverse-engineered from panic, slide urgency, and funding opportunity.' WHERE id IN ('ZANY-996', 'ZANY-997');
UPDATE community_backlog SET reporter = 'Ravi [Misc Systems Custodian]', reporter_name = 'Ravi', reporter_title = 'Misc Systems Custodian', reporter_description = 'Has accepted that the fax bridge is no longer temporary and is in fact a mature organism with legal significance and a pulse.' WHERE id IN ('ZANY-998', 'ZANY-999');
UPDATE community_backlog SET reporter = 'Inez [Grand Marshal of Backlog Excess]', reporter_name = 'Inez', reporter_title = 'Grand Marshal of Backlog Excess', reporter_description = 'Realizes the backlog is no longer merely tracking work and may now qualify as its own hostile administrative civilization.' WHERE id IN ('ZANY-1000');

-- FLAKE: testing misery, flaky suites, snapshots, fixtures, and quality theater
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- QA Platform Lead Iris
-- REPORTER: Iris | QA Platform Lead | Treats flaky tests like weather systems that should at least have the decency to document their preferred moon phase.
('FLAKE-1001', 'Make Every Flaky Test Admit Which Planetary Alignment It Requires',
 'Some tests only pass when CPU load, browser mood, clock drift, and stale cache residue line up in one specific sad constellation. If a test needs luck, make it write down its horoscope.',
 'add astrology metadata to jest runner',
  144),

('FLAKE-1002', 'Detect Snapshot Approvals Powered Purely by Dinner-Time Exhaustion',
 'Snapshot reviews were meant to catch regressions, not become a ritual where engineers click approve because the diff is huge and hunger is louder than principle. Flag the approvals that smell more like depletion than confidence.',
 'detect snapshot approvals powered purely by dinner-time exhaustion',
  144),

-- E2E Reliability PM Jonah
-- REPORTER: Jonah | E2E Reliability PM | Knows many end-to-end tests are really tiny diplomatic missions between our code and five external services with poor timekeeping.
('FLAKE-1003', 'Make End-to-End Tests List the External Gods They Must Appease',
 'Our longest tests keep depending on sandboxes, payment callbacks, identity redirects, and ghostly queues that feel less engineered than bargained with. Annotate the worship before pass/fail keeps pretending to be about our product alone.',
 'make e2e tests list their gods',
  144),

('FLAKE-1004', 'Stop Treating Safari Like Just Another Browser in the Matrix',
 'Safari is not a peer. It is a moral trial involving focus, spacing, viewport memory, and whatever private principles it learned in the dark. Mark it accordingly instead of giving it one equal-sized tile and a lie.',
 'stop pretending safari is normal',
  144),

-- Test Data Architect Meera
-- REPORTER: Meera | Test Data Architect | Believes fixtures should be dirty enough to bruise assumptions but not so cursed they turn every test into folklore.
('FLAKE-1005', 'Give the Fixture Library a "Realistic Enough to Hurt" Setting',
 'Our test data swings between spotless and unusably cursed. Add a realism dial with duplicates, stale permissions, timezone nonsense, and one diacritic-bearing surname before production keeps feeling unfairly more alive than QA.',
 'generate test data realistic enough to hurt',
  144),

('FLAKE-1006', 'Seed One User Built Entirely from Legacy Regret into Every Test World',
 'We keep validating flows against fresh, coherent users instead of the haunted production people assembled from imports, contradictory flags, and one billing edge case that survived four migrations by spite. Add the cursed customer.',
 'seed one user made of legacy regret',
  144),

-- Unit Testing Evangelist Clark
-- REPORTER: Clark | Unit Testing Evangelist | Has seen enough mocked-out test suites to recognize when only the assertion remains alive inside a tiny climate-controlled faith box.
('FLAKE-1007', 'Warn When a Unit Test Has Mocked Away Most of Reality',
 'Mocking is useful until the test becomes a puppet show where every collaborator is fake and the only surviving truth is the author''s wish to feel safe. Add a reality-loss warning before isolation turns spiritual.',
 'warn when unit tests mock away reality',
  89),

('FLAKE-1008', 'Stop Counting Code as Covered Just Because a Test Brushed Past It',
 'Coverage percentages keep flattering us by counting lines that were technically touched but never truly questioned. Split touched from interrogated so casual contact stops wearing the badge of understanding.',
 'stop counting brushed code as covered',
  89),

-- Regression Programs Manager Sofia
-- REPORTER: Sofia | Regression Programs Manager | Treats every bugfix test as a tiny passive-aggressive letter to the future engineer most likely to think this time it will be different.
('FLAKE-1009', 'Make Regression Tests Dedicate Themselves to the Future Person They Intend to Shame',
 'A regression test is not just protection. It is a memorial plaque for one specific mistake with a note that says please do not get creative here again. Preserve the grudge properly.',
 'make regression tests dedicate themselves to future shame',
  89),

('FLAKE-1010', 'Sort Red Tests into Broken, Useful, and Just Needing Attention',
 'Some failures expose product harm. Some show harmless drift. Some are just bored and want the nightly suite to remember them. Cluster the queue before triage wastes another morning rediscovering each test''s personality.',
 'sort red tests into broken useful needy',
  144),

-- Mobile QA Lead Darius
-- REPORTER: Darius | Mobile QA Lead | Refuses to certify an app that has only ever been tested under perfect signal, calm fingers, and conditions no actual commuter has survived.
('FLAKE-1011', 'Add an Elevator Network Mode to Every Mobile Test Run',
 'Our mobile tests are still too optimistic about the continuity of network life. Simulate tunnels, elevators, train stations, and buildings made from anti-signal ideology before shipping another app trained exclusively under open skies.',
 'simulate elevator network drops in mobile tests',
  144),

('FLAKE-1012', 'Teach the Crash Harness About Angry Thumb Tempo',
 'A meaningful class of bugs only appears when the user taps like they are negotiating with the phone and losing patience by the second. Add rapid-intent behavior so repro stops assuming serene little fingers with spare time.',
 'teach the crash harness about angry thumb tempo',
  144),

-- Principal Test Engineer Helena
-- REPORTER: Helena | Principal Test Engineer | Suspects half the nightly suite is being kept alive by habit, screenshots, and the simple terror of deleting something old.
('FLAKE-1013', 'Score the Nightly Tests by Whether Anyone Would Notice If We Buried Them',
 'Nightly suites accumulate prestige simply by being large, old, and red enough times in a row. Add a retirement score so we can tell living signal from inherited guilt.',
 'score nightly tests by burial visibility',
  144),

('FLAKE-1014', 'Stop Treating Retries Like a Spiritual Path to Truth',
 'Retries were meant as a buffer and are drifting toward liturgy. Put limits and labels on the tests that only pass after repeated polite begging so CI stops calling prayer stable.',
 'stop treating retries like truth',
  89),

-- VP of Verified Reality Amos
-- REPORTER: Amos | VP of Verified Reality | Thinks any test that passes on try two should wear a bright warning label instead of helping itself to the color green.
('FLAKE-1015', 'Wrap Second-Try Passes in a Giant Yellow "Probably Fine" Ribbon',
 'A green build should not mean after two retries, one browser burp, and a small act of pipeline superstition. If reality had to be gently begged into agreement, the UI should say so loudly.',
 'wrap second-try passes in yellow ribbons',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Iris [QA Platform Lead]', reporter_name = 'Iris', reporter_title = 'QA Platform Lead', reporter_description = 'Treats flaky tests like weather systems that should at least have the decency to document their preferred moon phase.' WHERE id IN ('FLAKE-1001', 'FLAKE-1002');
UPDATE community_backlog SET reporter = 'Jonah [E2E Reliability PM]', reporter_name = 'Jonah', reporter_title = 'E2E Reliability PM', reporter_description = 'Knows many end-to-end tests are really tiny diplomatic missions between our code and five external services with poor timekeeping.' WHERE id IN ('FLAKE-1003', 'FLAKE-1004');
UPDATE community_backlog SET reporter = 'Meera [Test Data Architect]', reporter_name = 'Meera', reporter_title = 'Test Data Architect', reporter_description = 'Believes fixtures should be dirty enough to bruise assumptions but not so cursed they turn every test into folklore.' WHERE id IN ('FLAKE-1005', 'FLAKE-1006');
UPDATE community_backlog SET reporter = 'Clark [Unit Testing Evangelist]', reporter_name = 'Clark', reporter_title = 'Unit Testing Evangelist', reporter_description = 'Has seen enough mocked-out test suites to recognize when only the assertion remains alive inside a tiny climate-controlled faith box.' WHERE id IN ('FLAKE-1007', 'FLAKE-1008');
UPDATE community_backlog SET reporter = 'Sofia [Regression Programs Manager]', reporter_name = 'Sofia', reporter_title = 'Regression Programs Manager', reporter_description = 'Treats every bugfix test as a tiny passive-aggressive letter to the future engineer most likely to think this time it will be different.' WHERE id IN ('FLAKE-1009', 'FLAKE-1010');
UPDATE community_backlog SET reporter = 'Darius [Mobile QA Lead]', reporter_name = 'Darius', reporter_title = 'Mobile QA Lead', reporter_description = 'Refuses to certify an app that has only ever been tested under perfect signal, calm fingers, and conditions no actual commuter has survived.' WHERE id IN ('FLAKE-1011', 'FLAKE-1012');
UPDATE community_backlog SET reporter = 'Helena [Principal Test Engineer]', reporter_name = 'Helena', reporter_title = 'Principal Test Engineer', reporter_description = 'Suspects half the nightly suite is being kept alive by habit, screenshots, and the simple terror of deleting something old.' WHERE id IN ('FLAKE-1013', 'FLAKE-1014');
UPDATE community_backlog SET reporter = 'Amos [VP of Verified Reality]', reporter_name = 'Amos', reporter_title = 'VP of Verified Reality', reporter_description = 'Thinks any test that passes on try two should wear a bright warning label instead of helping itself to the color green.' WHERE id IN ('FLAKE-1015');

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
 'add why this email sent field',
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
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Naomi [Deliverability Director]', reporter_name = 'Naomi', reporter_title = 'Deliverability Director', reporter_description = 'Knows Gmail has its own theology and that many "helpful" emails were born already condemned to Promotions.' WHERE id IN ('MAIL-1016', 'MAIL-1017');
UPDATE community_backlog SET reporter = 'Anton [Lifecycle Messaging PM]', reporter_name = 'Anton', reporter_title = 'Lifecycle Messaging PM', reporter_description = 'Specializes in deciding whether dormant users can be won back or are simply being politely poked in their digital coffins.' WHERE id IN ('MAIL-1018', 'MAIL-1019');
UPDATE community_backlog SET reporter = 'Priya [Template Engineering Lead]', reporter_name = 'Priya', reporter_title = 'Template Engineering Lead', reporter_description = 'Lives in fear of one stray merge tag turning a campaign into "Hello ," at scale.' WHERE id IN ('MAIL-1020', 'MAIL-1021');
UPDATE community_backlog SET reporter = 'Jules [Inbox Placement Analyst]', reporter_name = 'Jules', reporter_title = 'Inbox Placement Analyst', reporter_description = 'Can smell when an "operational" email has been perfumed into marketing by links, tracking sludge, and too much confidence.' WHERE id IN ('MAIL-1022', 'MAIL-1023');
UPDATE community_backlog SET reporter = 'Sienna [CRM Messaging Architect]', reporter_name = 'Sienna', reporter_title = 'CRM Messaging Architect', reporter_description = 'Believes users should be allowed to want less from us without filing for full emotional separation.' WHERE id IN ('MAIL-1024', 'MAIL-1025');
UPDATE community_backlog SET reporter = 'Karim [Email Operations Manager]', reporter_name = 'Karim', reporter_title = 'Email Operations Manager', reporter_description = 'Wants shared sender reputation treated like a communal rug everyone keeps tracking mud across and then acting surprised about.' WHERE id IN ('MAIL-1026', 'MAIL-1027');
UPDATE community_backlog SET reporter = 'Elin [Principal Notifications PM]', reporter_name = 'Elin', reporter_title = 'Principal Notifications PM', reporter_description = 'Keeps asking whether this message truly deserves an inbox or just wants the costume and the authority of one.' WHERE id IN ('MAIL-1028', 'MAIL-1029');
UPDATE community_backlog SET reporter = 'Matteo [Chief Inbox Officer]', reporter_name = 'Matteo', reporter_title = 'Chief Inbox Officer', reporter_description = 'Thinks any email with enough exclamation marks should have to experience the Promotions tab personally before bothering the public.' WHERE id IN ('MAIL-1030');

-- WIRE: payments, ledgers, idempotency, settlements, refunds, and money-moving pain
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Payments Platform Lead Emil
-- REPORTER: Emil | Payments Platform Lead | Thinks duplicate clicks are a law of physics and any checkout that treats them as user misbehavior deserves public correction.
('WIRE-1031', 'Stop Pretending Duplicate Payment Clicks Are Rare and Noble',
 'Scared users, weak networks, and lying spinners will always produce repeat payment attempts. Tighten idempotency before human panic keeps getting interpreted as adversarial ledger behavior.',
 'stop pretending duplicate clicks are rare',
  144),

('WIRE-1032', 'Call Missing Money "Traveling Through Shame" Until It Actually Arrives',
 'Reconciliation gaps keep living in the nasty middle where funds are not gone, not settled, and definitely not explainable in a soothing tone. Add a limbo state before every unsettled amount turns into either fake calm or executive panic.',
 'call missing money shame until arrival',
  144),

-- Billing Reliability PM Noor
-- REPORTER: Noor | Billing Reliability PM | Believes resilience should not sound like politely automated financial harassment.
('WIRE-1033', 'Add Mercy to Billing Retries Before They Become Collection Poetry',
 'Retry logic keeps pushing charges with the brittle sincerity of a system that cannot tell transient failure from no. Add gentleness controls so recovery stops sounding like extortion with cron syntax.',
 'add mercy to billing retries',
  144),

('WIRE-1034', 'Label Refund Friction as Compliance or Just Finance Nerves',
 'Refund flows contain real controls and a bunch of extra ritual added after one memorable money incident made Finance twitchy forever. Tag which steps protect the law and which ones mainly calm the adults around the ledger.',
 'label refund friction compliance or finance nerves',
  144),

-- Checkout Engineer Tessa
-- REPORTER: Tessa | Checkout Engineer | Knows token vaults are just one neglected rotation away from turning attackers into promotion candidates.
('WIRE-1035', 'Warn When the Vault Is One Key Rotation Away from an Educational Disaster',
 'Token storage gets treated too calmly for something sitting on top of expired secrets, inherited integrations, and quiet reputational explosives. Surface the danger before one missed rotation becomes everyone''s professional growth moment.',
 'warn when vault is one rotation from disaster',
  144),

('WIRE-1036', 'Stop A/B Tests from Accidentally Discovering Fraud-Friendly Checkout',
 'A smoother payment flow can help honest customers and also make life gorgeous for card testers and opportunists. Add a fraud-sensitivity gate before experimentation finds the statistically perfect experience for future chargebacks.',
 'stop ab tests from accidentally discovering fraud-friendly checkout',
  144),

-- Settlement Analyst Marco
-- REPORTER: Marco | Settlement Analyst | Spends too much time in arguments between processors, ledgers, banks, and CSV files that all think their timestamp is sovereign truth.
('WIRE-1037', 'Mark the PSPs That Are Currently Gaslighting Finance',
 'Processor files, bank records, and internal ledgers keep disagreeing with shocking self-confidence. Tag the most argumentative provider directly so settlement review stops pretending this is just a neutral mismatch.',
 'mark the psps that are currently gaslighting finance',
  144),

('WIRE-1038', 'Show Which Payouts Were Released Because a Spreadsheet Blinked First',
 'Some payouts are clearly justified. Others get released because two records drifted near each other and the risk of waiting became more exhausting than the risk of being wrong. Add a column for spreadsheet surrender.',
 'show which payouts were released',
  89),

-- Refund Experience PM Yara
-- REPORTER: Yara | Refund Experience PM | Wants state labels that tell users the truth instead of gently overpromising closure while banks take the scenic route.
('WIRE-1039', 'Explain That "Processed" Still Means "Keep Hoping"',
 'We keep using internal money words that sound final to normal humans and actually mean please continue waiting through banking fog. Rewrite the refund timeline before processed keeps pretending to be done.',
 'explain that processed still means keep hoping',
  144),

('WIRE-1040', 'Mark Chargeback Fights Driven by Pride Instead of Recoverable Revenue',
 'Some disputes are worth defending. Others mostly wake up the part of the company that hates being told it handled money badly. Add a motive note before ego keeps dressing up in evidence attachments.',
 'mark pride-driven chargeback fights',
  89),

-- Risk & Payments Architect Kian
-- REPORTER: Kian | Risk & Payments Architect | Wants idempotency smart enough to see through the request costume changes caused by spinners, refreshes, and fear.
('WIRE-1041', 'Teach Idempotency to Recognize the Same Payment Wearing a Panic Costume',
 'Duplicate requests rarely arrive as exact twins. They show up with new headers, retried SDK calls, refresh damage, and the fingerprints of someone staring at a spinner with no remaining faith. Match the intent, not the wardrobe.',
 'pls make payment api ignore panic clicks',
  144),

('WIRE-1042', 'Score Each New Payment Method by How Many Ways It Will Become Support''s Problem',
 'Every alternative rail promises growth and quietly smuggles in async states, local refund rules, and new ways to confuse a paying adult. Forecast the support burden before payment expansion keeps donating its complexity downstream for free.',
 'score payment methods by support pain',
  144),

-- Treasury Systems Director Helena
-- REPORTER: Helena | Treasury Systems Director | Knows a lot of automated reconciliation is just tasteful fuzzy matchmaking performed under pressure and called accounting.
('WIRE-1043', 'Make Reconciliation Admit When It Is Matching by Pattern Instead of Principle',
 'Reconciliation loves to act like arithmetic while often depending on fuzzy joins and enough operational hope to close the books before pacing begins. Add confession metadata before pattern-based harmony gets mistaken for hard truth.',
 'make reconciliation admit pattern-matching',
  144),

('WIRE-1044', 'Split Real Deferrals from the Ones Added for Narrative Upholstery',
 'Some revenue deferrals come from accounting rules. Others just soften ugly timing and help the business tell itself a smoother story. Tag the difference before the tables start smelling theatrical.',
 'split real deferrals from decorative ones',
  144),

-- Chief Money Movement Officer Bruno
-- REPORTER: Bruno | Chief Money Movement Officer | Wants the ugliest in-between money states named honestly before they breed folklore, fear, and another emergency spreadsheet.
('WIRE-1045', 'Put the Worst Money Limbo States in a Column Called Somewhere Upsetting',
 'Money keeps wandering between charge, refund, dispute, capture, reversal, and several sovereignly confident systems that disagree about all of it. Give the ugliest gaps an honest label before they acquire their own mythology again.',
 'put worst money limbo in upsetting column',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Emil [Payments Platform Lead]', reporter_name = 'Emil', reporter_title = 'Payments Platform Lead', reporter_description = 'Thinks duplicate clicks are a law of physics and any checkout that treats them as user misbehavior deserves public correction.' WHERE id IN ('WIRE-1031', 'WIRE-1032');
UPDATE community_backlog SET reporter = 'Noor [Billing Reliability PM]', reporter_name = 'Noor', reporter_title = 'Billing Reliability PM', reporter_description = 'Believes resilience should not sound like politely automated financial harassment.' WHERE id IN ('WIRE-1033', 'WIRE-1034');
UPDATE community_backlog SET reporter = 'Tessa [Checkout Engineer]', reporter_name = 'Tessa', reporter_title = 'Checkout Engineer', reporter_description = 'Knows token vaults are just one neglected rotation away from turning attackers into promotion candidates.' WHERE id IN ('WIRE-1035', 'WIRE-1036');
UPDATE community_backlog SET reporter = 'Marco [Settlement Analyst]', reporter_name = 'Marco', reporter_title = 'Settlement Analyst', reporter_description = 'Spends too much time in arguments between processors, ledgers, banks, and CSV files that all think their timestamp is sovereign truth.' WHERE id IN ('WIRE-1037', 'WIRE-1038');
UPDATE community_backlog SET reporter = 'Yara [Refund Experience PM]', reporter_name = 'Yara', reporter_title = 'Refund Experience PM', reporter_description = 'Wants state labels that tell users the truth instead of gently overpromising closure while banks take the scenic route.' WHERE id IN ('WIRE-1039', 'WIRE-1040');
UPDATE community_backlog SET reporter = 'Kian [Risk & Payments Architect]', reporter_name = 'Kian', reporter_title = 'Risk & Payments Architect', reporter_description = 'Wants idempotency smart enough to see through the request costume changes caused by spinners, refreshes, and fear.' WHERE id IN ('WIRE-1041', 'WIRE-1042');
UPDATE community_backlog SET reporter = 'Helena [Treasury Systems Director]', reporter_name = 'Helena', reporter_title = 'Treasury Systems Director', reporter_description = 'Knows a lot of automated reconciliation is just tasteful fuzzy matchmaking performed under pressure and called accounting.' WHERE id IN ('WIRE-1043', 'WIRE-1044');
UPDATE community_backlog SET reporter = 'Bruno [Chief Money Movement Officer]', reporter_name = 'Bruno', reporter_title = 'Chief Money Movement Officer', reporter_description = 'Wants the ugliest in-between money states named honestly before they breed folklore, fear, and another emergency spreadsheet.' WHERE id IN ('WIRE-1045');

-- RANK: search, recommendations, autocomplete, retrieval quality, and relevance cults
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Search Quality Lead Helena
-- REPORTER: Helena | Search Quality Lead | Is tired of old loud documents winning just because they have had more time to accumulate dust, links, and institutional self-esteem.
('RANK-1046', 'Stop Rewarding Documents for Existing Loudly',
 'Our ranking still favors pages that are old, bloated, and rich in metadata over answers that are simply better. Reduce the seniority privilege before search starts feeling like internal politics with a query box.',
 'stop rewarding documents for existing loudly',
  144),

('RANK-1047', 'Classify Zero-Result Searches by How Much They Feel Like Betrayal',
 'Some misses are harmless. Others land like the product just admitted it has never heard of the thing a sane person assumed it would know. Add a mood class so we can fix the painful absences first.',
 'add rage score to zero results',
  144),

-- Recommendations PM Sora
-- REPORTER: Sora | Recommendations PM | Distrusts any discovery engine that keeps recommending popularity in a fake mustache and calling it personalization.
('RANK-1048', 'Stop Calling Popular Items "Recommendations" Just Because They Wear a New Hat',
 'We keep celebrating discovery wins that are really just the same successful items being reintroduced with better shelf placement and a fresh adjective. Add novelty checks before recycled popularity starts grading itself.',
 'make search stop calling popular items recommendations',
  144),

('RANK-1049', 'Teach the Feed to Ignore Clicks People Made Because Doom Felt Magnetic',
 'A lot of engagement comes from dread, compulsion, and the urge to inspect a digital accident against better judgment. Filter doom-click behavior before the model starts learning that unhealthy attention equals taste.',
 'teach the feed to ignore clicks people made',
  144),

-- Search Infrastructure Engineer Kamil
-- REPORTER: Kamil | Search Infrastructure Engineer | Has watched one extra colon at midnight convince the parser to reinvent the user''s entire soul.
('RANK-1050', 'Stop Letting Punctuation Trigger a Full Relevance Identity Crisis',
 'Certain punctuation marks are producing interpretation shifts dramatic enough to feel less like parsing and more like divination. Calm the engine before one stray symbol rewrites the meaning of the hunt.',
 'stop punctuation causing relevance crises',
  89),

('RANK-1051', 'Flag the Synonyms We Only Added Because Sales Wanted Them to Be True',
 'Synonym dictionaries get dangerous the moment pipeline pressure starts flattening actual conceptual differences into close enough to sell. Warn when a merge was born from revenue desire instead of language reality.',
 'flag the synonyms we only added',
  144),

-- Catalog Discovery Analyst Mireille
-- REPORTER: Mireille | Catalog Discovery Analyst | Knows half the facet panel exists to soothe internal stakeholders who wanted to see their pet category survive in public.
('RANK-1052', 'Mark Which Filters Help Users and Which Filters Exist to Reassure Merchants',
 'Not every facet improves navigation. Some are diplomatic offerings to internal constituencies who wanted proof their category still mattered. Tag the reassurance filters before the sidebar becomes a memorial wall.',
 'label filters users need versus merchant theater',
  89),

('RANK-1053', 'Put at Least One Correct but Vague Human into Every Search Eval Set',
 'Benchmarks are too full of neat, fully articulated queries and not full enough of real people who know what they want but phrase it like they are late to something. Add the foggy humans before search gets overfit to librarians.',
 'put one correct but vague human in evals',
  144),

-- Content Ranking Scientist Idris
-- REPORTER: Idris | Content Ranking Scientist | Keeps having to explain that making everything more intense is not the same as making anything better.
('RANK-1054', 'Flag Ranking Wins That Only Happened Because We Made Everything More Extreme',
 'Some experiments boost clicks by turning urgency, outrage, or stimulation up until the content becomes impossible to ignore and deeply unlovable. Mark those wins before intensity keeps masquerading as usefulness.',
 'flag ranking wins that only happened',
  144),

('RANK-1055', 'Teach Autocomplete Not to Professionally Finish the User''s Worst Idea',
 'Autocomplete becomes socially dangerous when it helps panic, gossip, self-diagnosis, or expensive confusion arrive with perfect speed. Add some manners before the box starts collaborating too effectively with humanity''s weaker instincts.',
 'stop autocomplete finishing bad ideas',
  144),

-- Marketplace Search PM Lena
-- REPORTER: Lena | Marketplace Search PM | Can smell the listings that rank purely by soaking themselves in adjectives and calling it discoverability.
('RANK-1056', 'Detect Sellers Winning on Metadata Overhydration',
 'Some listings rank well because they have marinated themselves in tags, adjectives, and descriptor sludge until the index gives up and lets them through. Detect the overhydrated ones before lexical occupancy becomes strategy.',
 'detect sellers winning on metadata overhydration',
  144),

('RANK-1057', 'Warn When Relevance Tuning Has Bent Around One Loud Customer Story',
 'Search policy keeps swinging because one screenshot, one complaint, or one rich anecdote achieved political mass. Detect those moments before ranking starts orbiting whoever yelled most memorably.',
 'warn when relevance bends for one story',
  89),

-- Retrieval Architect Benji
-- REPORTER: Benji | Retrieval Architect | Treats blended ranking like a hostile coalition government between truth, vectors, freshness, policy, and one monetization clause in a hat.
('RANK-1058', 'Make the Blending Layer Explain How the Ranking Coalition Reached This Compromise',
 'Search blending is not harmony. It is lexical match, vector similarity, freshness, promotions, trust, and business rules arguing in one car. Explain which faction won instead of pretending every result emerged from pure relevance.',
 'make blending layers explain ranking compromises',
  144),

('RANK-1059', 'Show the Searches Users Repeated Like They Were Arguing with the Product',
 'Repeat queries are often not discovery. They are negotiation. Surface the sessions where users keep reformulating because they are trying to convince the system a thing exists and deserve acknowledgment for trying.',
 'show searches users repeated in anger',
  89),

-- Chief Relevance Officer Petra
-- REPORTER: Petra | Chief Relevance Officer | Thinks embarrassing results improve dramatically when the last person who tuned them has to stand next to them in daylight.
('RANK-1060', 'Attach Human Names to Search Results Weird Enough to Start a Meeting',
 'If the system surfaces something useless, creepy, or socially indefensible, show who tuned it last. Relevance improves when click-through optimism has to share a room with personal accountability.',
 'name weird search results early',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Helena [Search Quality Lead]', reporter_name = 'Helena', reporter_title = 'Search Quality Lead', reporter_description = 'Is tired of old loud documents winning just because they have had more time to accumulate dust, links, and institutional self-esteem.' WHERE id IN ('RANK-1046', 'RANK-1047');
UPDATE community_backlog SET reporter = 'Sora [Recommendations PM]', reporter_name = 'Sora', reporter_title = 'Recommendations PM', reporter_description = 'Distrusts any discovery engine that keeps recommending popularity in a fake mustache and calling it personalization.' WHERE id IN ('RANK-1048', 'RANK-1049');
UPDATE community_backlog SET reporter = 'Kamil [Search Infrastructure Engineer]', reporter_name = 'Kamil', reporter_title = 'Search Infrastructure Engineer', reporter_description = 'Has watched one extra colon at midnight convince the parser to reinvent the user''''s entire soul.' WHERE id IN ('RANK-1050', 'RANK-1051');
UPDATE community_backlog SET reporter = 'Mireille [Catalog Discovery Analyst]', reporter_name = 'Mireille', reporter_title = 'Catalog Discovery Analyst', reporter_description = 'Knows half the facet panel exists to soothe internal stakeholders who wanted to see their pet category survive in public.' WHERE id IN ('RANK-1052', 'RANK-1053');
UPDATE community_backlog SET reporter = 'Idris [Content Ranking Scientist]', reporter_name = 'Idris', reporter_title = 'Content Ranking Scientist', reporter_description = 'Keeps having to explain that making everything more intense is not the same as making anything better.' WHERE id IN ('RANK-1054', 'RANK-1055');
UPDATE community_backlog SET reporter = 'Lena [Marketplace Search PM]', reporter_name = 'Lena', reporter_title = 'Marketplace Search PM', reporter_description = 'Can smell the listings that rank purely by soaking themselves in adjectives and calling it discoverability.' WHERE id IN ('RANK-1056', 'RANK-1057');
UPDATE community_backlog SET reporter = 'Benji [Retrieval Architect]', reporter_name = 'Benji', reporter_title = 'Retrieval Architect', reporter_description = 'Treats blended ranking like a hostile coalition government between truth, vectors, freshness, policy, and one monetization clause in a hat.' WHERE id IN ('RANK-1058', 'RANK-1059');
UPDATE community_backlog SET reporter = 'Petra [Chief Relevance Officer]', reporter_name = 'Petra', reporter_title = 'Chief Relevance Officer', reporter_description = 'Thinks embarrassing results improve dramatically when the last person who tuned them has to stand next to them in daylight.' WHERE id IN ('RANK-1060');

-- BRICK: firmware, IoT fleets, BLE weirdness, OTA danger, and device-side suffering
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Device Fleet Lead Hanna
-- REPORTER: Hanna | Device Fleet Lead | Treats firmware rollouts as live fire because she knows 40,000 kitchens can become a support queue in under ten minutes.
('BRICK-1061', 'Teach OTA Rollouts That Bricking Appliances Counts as a User Experience Event',
 'Firmware deployment still acts like kitchen devices and field hardware are just tiny web servers with crumbs. Add blast-radius awareness before the next zip file turns a respectable number of homes into decorated error states.',
 'teach ota rollouts that bricking counts',
  144),

('BRICK-1062', 'Rename Devices Missing for 30 Days from Offline to "Probably Living a New Life"',
 'Some fleet units are not temporarily unavailable. They are under counters, in warehouses, in other cities, or spiritually retired. Label the long-gone ones honestly so support stops waiting for ghosts to check back in.',
 'rename long-missing devices as runaways',
  144),

-- Embedded Systems PM Koji
-- REPORTER: Koji | Embedded Systems PM | Has accepted that Bluetooth pairing is less a protocol than a regional belief system held together by radio luck and user persistence.
('BRICK-1063', 'Add a Setup Branch for "The User Is Right and the Radio Is Just Being Mythic"',
 'Pairing failures keep getting framed like human error when the person did everything right and the air itself chose nonsense. Write the troubleshooting path for innocent users trapped inside Bluetooth folklore.',
 'add setup path for lying radios',
  144),

('BRICK-1064', 'Stop Hiding Tiny Firmware Coups Under "Stability Improvements"',
 'Release notes keep stuffing major changes to boot behavior, connectivity, and system survival under one calm little phrase. Split cosmetic fixes from internal uprisings before a kernel revolt sneaks out wearing polite typography.',
 'stop hiding tiny firmware coups under stability improvements',
  89),

-- Edge Reliability Engineer Mara
-- REPORTER: Mara | Edge Reliability Engineer | Has watched too many devices die nobly trying to reconnect forever on dying batteries and wounded optimism.
('BRICK-1065', 'Stop Retry Logic from Killing the Battery in the Name of Hope',
 'Persistence becomes tragic when a device spends its remaining life repeatedly trying to reconnect until both loyalty and battery are gone. Add energy ceilings before resilience turns into a tiny martyrdom loop.',
 'stop retries killing batteries for hope',
  144),

('BRICK-1066', 'Teach Telemetry the Difference Between Real Events and Hardware Having a Bad Attitude',
 'Some weird sensor values are meaningful. Others are just cold starts, humidity, loose seating, cheap parts, and offended components filing complaints through numbers. Classify the moods before analytics writes weather up as product truth.',
 'teach telemetry real events versus bad hardware attitude',
  144),

-- Connected Products PM Elio
-- REPORTER: Elio | Connected Products PM | Refuses to pretend factory reset is a neutral act when everyone involved knows it is really device exorcism with friendlier copy.
('BRICK-1067', 'Describe Factory Reset Like the Little Exorcism It Really Is',
 'We keep calling reset a simple setup step when it is really a ritual for stripping pairings, stale ownership, and embedded shame out of a device with too much history. Tell the user what sort of cleansing is actually happening.',
 'describe factory reset like exorcism',
  144),

('BRICK-1068', 'Annotate Each Hardware SKU with the Vendor Swap Most Likely to Ruin a Quarter',
 'Supply chains keep swapping radios and board revisions in ways leadership never notices and drivers notice immediately with violence. Attach fragility notes so product knows which cheap part substitution is currently standing over next month with a knife.',
 'annotate each sku with its ruinous vendor swap',
  144),

-- Industrial IoT Analyst Petra
-- REPORTER: Petra | Industrial IoT Analyst | Keeps reminding release teams that many devices are busy pumping, scanning, cooling, or measuring actual reality and cannot stop for self-improvement.
('BRICK-1069', 'Mark Which Devices Are Too Busy Doing Their Jobs to Accept Improvement',
 'Field hardware cannot always update because it is occupied with actual labor in the world. Add a busy-being-useful state before OTA planning keeps assuming devices exist mainly to consume patches politely.',
 'mark devices too busy for improvements',
  144),

('BRICK-1070', 'Keep the Part of the Edge Log We Would Eventually Need in Court',
 'Compression is important, but so is not deleting the one line that turns an outage from mystery into evidence. Improve retention so the useful incriminating detail survives without asking every device to carry its full memoir forever.',
 'keep edge logs court will need',
  89),

-- Smart Home Reliability Lead Jonas
-- REPORTER: Jonas | Smart Home Reliability Lead | Has heard enough support calls to know user-defined device names are one profanity away from making quality review blush.
('BRICK-1071', 'Give Support a Safe Alias for Devices Named with Too Much Freedom',
 'Custom device names are delightful until support has to professionally discuss a feeder or thermostat whose title reflects private domestic comedy, revenge, or explicit language. Add transcript-safe aliases before quality review gets weird.',
 'give support aliases for unhinged device names',
  89),

('BRICK-1072', 'Count How Many Times Setup Fell Back to "Move Closer" Instead of Solving Anything',
 'Troubleshooting advice leans too hard on proximity as if human knees can solve every pairing problem through obedient shuffling. Track how often move closer becomes theology instead of diagnosis.',
 'count how often setup says move closer',
  89),

-- Firmware Delivery Manager Livia
-- REPORTER: Livia | Firmware Delivery Manager | Does not believe in rollback until she has seen it work on real hardware rather than three green arrows on a slide.
('BRICK-1073', 'Make Rollback Prove It Exists Somewhere Other Than a Diagram',
 'Rollback plans are one of embedded engineering''s most optimistic art forms. Require proof beyond arrows and tasteful staging before fleet safety gets built on directional fiction.',
 'make rollback prove it exists',
  144),

('BRICK-1074', 'Surface the Quietly Rotting Device Certificates Before They Bloom into a Fleet-Wide Embarrassment',
 'Certificate expiry remains one of the cleanest ways to turn a boring healthy fleet into synchronized support content with almost no warning. Make the rot visible before everyone calls the outage surprising with a straight face.',
 'surface rotting device certs early',
  144),

-- Chief Edge Chaos Officer Bruno
-- REPORTER: Bruno | Chief Edge Chaos Officer | Wants every rollout scored by its actual power to convert physical hardware into very honest decorative objects.
('BRICK-1075', 'Block OTA Releases That Cross the Brick Threshold Until a Human Signs the Damage Waiver',
 'If the update is too large, rollback is fake, batteries are low, the network is moody, and half the fleet is already weird, the release button should stop pretending courage is the same thing as readiness. Add a hard brick threshold and make someone sign for the blast radius.',
 'block ota releases over the brick threshold',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Hanna [Device Fleet Lead]', reporter_name = 'Hanna', reporter_title = 'Device Fleet Lead', reporter_description = 'Treats firmware rollouts as live fire because she knows 40,000 kitchens can become a support queue in under ten minutes.' WHERE id IN ('BRICK-1061', 'BRICK-1062');
UPDATE community_backlog SET reporter = 'Koji [Embedded Systems PM]', reporter_name = 'Koji', reporter_title = 'Embedded Systems PM', reporter_description = 'Has accepted that Bluetooth pairing is less a protocol than a regional belief system held together by radio luck and user persistence.' WHERE id IN ('BRICK-1063', 'BRICK-1064');
UPDATE community_backlog SET reporter = 'Mara [Edge Reliability Engineer]', reporter_name = 'Mara', reporter_title = 'Edge Reliability Engineer', reporter_description = 'Has watched too many devices die nobly trying to reconnect forever on dying batteries and wounded optimism.' WHERE id IN ('BRICK-1065', 'BRICK-1066');
UPDATE community_backlog SET reporter = 'Elio [Connected Products PM]', reporter_name = 'Elio', reporter_title = 'Connected Products PM', reporter_description = 'Refuses to pretend factory reset is a neutral act when everyone involved knows it is really device exorcism with friendlier copy.' WHERE id IN ('BRICK-1067', 'BRICK-1068');
UPDATE community_backlog SET reporter = 'Petra [Industrial IoT Analyst]', reporter_name = 'Petra', reporter_title = 'Industrial IoT Analyst', reporter_description = 'Keeps reminding release teams that many devices are busy pumping, scanning, cooling, or measuring actual reality and cannot stop for self-improvement.' WHERE id IN ('BRICK-1069', 'BRICK-1070');
UPDATE community_backlog SET reporter = 'Jonas [Smart Home Reliability Lead]', reporter_name = 'Jonas', reporter_title = 'Smart Home Reliability Lead', reporter_description = 'Has heard enough support calls to know user-defined device names are one profanity away from making quality review blush.' WHERE id IN ('BRICK-1071', 'BRICK-1072');
UPDATE community_backlog SET reporter = 'Livia [Firmware Delivery Manager]', reporter_name = 'Livia', reporter_title = 'Firmware Delivery Manager', reporter_description = 'Does not believe in rollback until she has seen it work on real hardware rather than three green arrows on a slide.' WHERE id IN ('BRICK-1073', 'BRICK-1074');
UPDATE community_backlog SET reporter = 'Bruno [Chief Edge Chaos Officer]', reporter_name = 'Bruno', reporter_title = 'Chief Edge Chaos Officer', reporter_description = 'Wants every rollout scored by its actual power to convert physical hardware into very honest decorative objects.' WHERE id IN ('BRICK-1075');

-- DESK: desktop apps, Electron/Tauri, installers, tray apps, auto-updates, and native-bridge pain
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Desktop Platform Lead Vera
-- REPORTER: Vera | Desktop Platform Lead | Wants auto-updates to stop behaving like cheerful home invaders during demos, deadlines, and tax season.
('DESK-1076', 'Stop Desktop Updates from Relaunching the App During Someone''s Worst Possible Moment',
 'Update flows remain far too optimistic about the phrase restart now, as though users never have demos, filings, deadlines, or one final unsaved window arrangement holding their day together. Add timing awareness before relaunch becomes punctual sabotage.',
 'stop desktop updates relaunching at worst moments',
  144),

('DESK-1077', 'Make Installer Admin Prompts Sound Less Like a Tiny Coup',
 'Privilege prompts keep arriving with the confidence of a government claiming emergency powers to sync a notes app. Rewrite them so users can tell whether elevation is truly necessary or just inherited laziness from old packaging scripts.',
 'make installer prompts less coup-like',
  144),

-- Electron Runtime PM Kade
-- REPORTER: Kade | Electron Runtime PM | Knows some desktop memory graphs are really just browsers in trench coats drawing power with executive confidence.
('DESK-1078', 'Label the Memory Spikes That Come from Shipping a Browser in a Waistcoat',
 'Resource usage keeps drifting upward under the polite fiction that this is a lean desktop product and not a browser with local permissions and delusions of permanence. Mark the trench-coat overhead honestly.',
 'label memory spikes from browser in a waistcoat',
  144),

('DESK-1079', 'Clean the Native Bridge Attic Out Before We Forget What We Hid Up There',
 'The native layer has become an attic for awkward truths, performance patches, device hacks, and code we were too embarrassed to explain in JavaScript. Audit it before exile becomes architecture.',
 'clean the native bridge attic now',
  144),

-- Desktop UX Lead Mina
-- REPORTER: Mina | Desktop UX Lead | Believes the system tray is where product ideas go when they lose a normal argument but still refuse to die quietly.
('DESK-1080', 'Put Tray Features on Trial Before the Tray Becomes Feature Purgatory',
 'The tray menu keeps collecting features with the exact energy of things that could not survive in main navigation. Hold a hearing for each one before the system menu becomes witness protection for failed product decisions.',
 'put tray features on trial',
  89),

('DESK-1081', 'Treat Multi-Monitor Window Layouts Like Sacred Geometry',
 'Users build monitor arrangements with the seriousness of private religion, and the app keeps restoring them like casual suggestions. Improve placement logic before one more carefully evolved desktop shrine gets flattened by startup enthusiasm.',
 'treat multi-monitor window layouts like sacred geometry',
  144),

-- Installer Reliability Engineer Tomas
-- REPORTER: Tomas | Installer Reliability Engineer | Has strong feelings about uninstallers that delete the icon and leave the haunting intact.
('DESK-1082', 'Define How Much Post-Uninstall Haunting Counts as "Clean Enough"',
 'Too many uninstallers celebrate after removing the executable while leaving caches, helpers, registry cruft, and launch agents to continue whispering from the machine. Set a legal limit on haunting before clean removal grades itself again.',
 'define acceptable post-uninstall haunting',
  144),

('DESK-1083', 'Force Delta Patches to Prove They Work on Laptops Old Enough to Hold a Grudge',
 'Incremental update logic assumes a pleasant continuity that real desktops do not respect. Test against skipped versions, corrupted temp space, old permissions, and machines that remember previous management eras.',
 'make delta patches work on ancient grudge laptops',
  144),

-- Cross-Platform PM Eliza
-- REPORTER: Eliza | Cross-Platform PM | Knows permissions are only useful once somebody says what actually breaks if the user clicks no.
('DESK-1084', 'Translate Permission Prompts into What Actually Breaks If You Refuse',
 'Camera, notifications, accessibility, screen recording, and file system prompts all sound official and emotionally useless. Add plain consequences so users stop choosing by superstition.',
 'translate permission prompts into breakage',
  89),

('DESK-1085', 'Make Restart Banners Sound Less Like Polite Hostage Negotiation',
 'For changes to take effect is a very civil way to say the app can no longer coexist with itself. Rewrite the restart prompt so it tells the truth without wrapping the interruption in tea service.',
 'make restart banners less hostage-like',
  89),

-- Desktop Security Architect Pavel
-- REPORTER: Pavel | Desktop Security Architect | Distrusts any credential store whose main defense is being somewhere slightly annoying to click into.
('DESK-1086', 'Label Which Local Credential Stores Are Secure and Which Are Just Hidden Nicely',
 'Client-side secret storage too often drifts from strong protection into tidy concealment with excellent branding. Add realism notes before teams mistake respectful hiding for actual security.',
 'label secure stores versus nicely hidden ones',
  144),

('DESK-1087', 'Detect Plugins That Are Quietly Staging a Coup',
 'Extensibility is healthy right up until one plugin claims enough permissions, menus, and hooks to start behaving like a rival government with filesystem access. Add coup detection before the host app becomes a federation of unchecked ambitions.',
 'detect plugins staging a coup',
  144),

-- Productivity Desktop Director Hana
-- REPORTER: Hana | Productivity Desktop Director | Is tired of offline mode meaning "stalls gracefully on trains" instead of "actually works without the cloud."
('DESK-1088', 'Audit Offline Mode Claims for Whether They Mean "Works" or "Stalls Nicely"',
 'Desktop apps keep promising offline support when what they often provide is a short graceful delay before auth hunger and sync shame arrive. Audit the promise before decorous stalling keeps masquerading as independence.',
 'audit offline mode means works or stalls',
  144),

('DESK-1089', 'Stop Billing Forty-Two Chrome Tabs Entirely to Our Desktop App',
 'Not every frozen moment belongs to us. Add surrounding-chaos context so performance reviews can separate our slowness from the larger laptop ecosystem''s decision to host twelve lives at once.',
 'code desktop monitor to blame chrome',
  89),

-- Chief Native Illusionist Lorne
-- REPORTER: Lorne | Chief Native Illusionist | Wants every fake-native flourish branded honestly before one more browser feature inherits a desktop title and a family fortune.
('DESK-1090', 'Put a Tiny Chromium Badge on the Browser Parts Pretending to Be Native',
 'We keep calling things native when they are clearly browser aristocracy in local clothing. Badge the fake-native surfaces so everyone can see where the app stops being a desktop citizen and starts being a tab with inherited property.',
 'put chromium badge on fake native parts',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Vera [Desktop Platform Lead]', reporter_name = 'Vera', reporter_title = 'Desktop Platform Lead', reporter_description = 'Wants auto-updates to stop behaving like cheerful home invaders during demos, deadlines, and tax season.' WHERE id IN ('DESK-1076', 'DESK-1077');
UPDATE community_backlog SET reporter = 'Kade [Electron Runtime PM]', reporter_name = 'Kade', reporter_title = 'Electron Runtime PM', reporter_description = 'Knows some desktop memory graphs are really just browsers in trench coats drawing power with executive confidence.' WHERE id IN ('DESK-1078', 'DESK-1079');
UPDATE community_backlog SET reporter = 'Mina [Desktop UX Lead]', reporter_name = 'Mina', reporter_title = 'Desktop UX Lead', reporter_description = 'Believes the system tray is where product ideas go when they lose a normal argument but still refuse to die quietly.' WHERE id IN ('DESK-1080', 'DESK-1081');
UPDATE community_backlog SET reporter = 'Tomas [Installer Reliability Engineer]', reporter_name = 'Tomas', reporter_title = 'Installer Reliability Engineer', reporter_description = 'Has strong feelings about uninstallers that delete the icon and leave the haunting intact.' WHERE id IN ('DESK-1082', 'DESK-1083');
UPDATE community_backlog SET reporter = 'Eliza [Cross-Platform PM]', reporter_name = 'Eliza', reporter_title = 'Cross-Platform PM', reporter_description = 'Knows permissions are only useful once somebody says what actually breaks if the user clicks no.' WHERE id IN ('DESK-1084', 'DESK-1085');
UPDATE community_backlog SET reporter = 'Pavel [Desktop Security Architect]', reporter_name = 'Pavel', reporter_title = 'Desktop Security Architect', reporter_description = 'Distrusts any credential store whose main defense is being somewhere slightly annoying to click into.' WHERE id IN ('DESK-1086', 'DESK-1087');
UPDATE community_backlog SET reporter = 'Hana [Productivity Desktop Director]', reporter_name = 'Hana', reporter_title = 'Productivity Desktop Director', reporter_description = 'Is tired of offline mode meaning "stalls gracefully on trains" instead of "actually works without the cloud."' WHERE id IN ('DESK-1088', 'DESK-1089');
UPDATE community_backlog SET reporter = 'Lorne [Chief Native Illusionist]', reporter_name = 'Lorne', reporter_title = 'Chief Native Illusionist', reporter_description = 'Wants every fake-native flourish branded honestly before one more browser feature inherits a desktop title and a family fortune.' WHERE id IN ('DESK-1090');

-- BOSS: game dev, live ops, monetized progression, and launcher-grade suffering
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Live Ops Director Cass
-- REPORTER: Cass | Live Ops Director | Can tell the difference between players having fun and players negotiating with a battle pass at 1:17 a.m.
('BOSS-1091', 'Classify Late-Night Battle Pass Grinding as Hostage Negotiation',
 'Our progression charts keep celebrating nightly play bursts that are clearly powered by expiring cosmetics and structured dread. Add a dread-aware view before retention starts confusing fun with midnight bargaining.',
 'classify late-night battle pass grinding as hostage negotiation',
  144),

('BOSS-1092', 'Score Events by How Much They Insult People with Jobs',
 'Limited-time events keep assuming every player has endless evenings and healthy knees. Add a life-compatibility score so the schedule can admit when it has become a second unpaid occupation with particle effects.',
 'score events by how insulting they are',
  144),

-- Multiplayer Systems PM Riku
-- REPORTER: Riku | Multiplayer Systems PM | Has seen veteran players detect a soft lobby with the calm joy of sharks hearing spreadsheets bleed.
('BOSS-1093', 'Stop Feeding New Players to Statistically Gifted Predators',
 'We keep underestimating how fast experienced players can smell beginners through movement and matchmaking softness. Tighten onboarding protection before first-session retention becomes a blood sport.',
 'stop feeding new players to statistically gifted predators',
  144),

('BOSS-1094', 'Admit When Ranked Resets Are Just Seasonalized Trauma with Better Lighting',
 'Rank resets get sold as fresh opportunity and often function as a brief hopeful scramble before the same hierarchy comes back wearing a seasonal skin. Add an honesty note before renewal keeps impersonating novelty.',
 'admit ranked resets are seasonal trauma',
  144),

-- Monetization Designer Livia
-- REPORTER: Livia | Monetization Designer | Knows some cosmetic bundles stop being delight and start feeling like an intervention in self-worth with gold trim.
('BOSS-1095', 'Flag Skin Bundles That Monetize Self-Respect More Than Aesthetics',
 'Certain bundles stop selling style and start selling relief from social insecurity, completionist pain, and prestige panic. Add a pressure score before delight curdles fully into decorative coercion.',
 'flag skin bundles monetizing self-respect',
  144),

('BOSS-1096', 'Document How Hard the Premium Currency Packs Are Trying to Avoid Round Numbers',
 'Our gem and shard bundles keep practicing deliberate arithmetic weirdness like it is a force of nature. Track the anti-round-number strategy before orphan balances keep pretending to be an accident.',
 'document how hard currency packs dodge round numbers',
  144),

-- Engine Stability Lead Tomas
-- REPORTER: Tomas | Engine Stability Lead | Has spent too many nights deciding whether the game crashed, the driver crashed, or reality itself briefly lost texture support.
('BOSS-1097', 'Make Crash Reports Distinguish Game Failure from Driver Mood Swings',
 'A lot of desktop crashes happen in the awkward borderland between our code, their drivers, and the graphics stack''s private emotional life. Add blame texture before support keeps filing everything under one blurry accusation.',
 'split game crashes from driver moods',
  144),

('BOSS-1098', 'Set a Maximum Ageing Threshold for Shader Compilation',
 'We keep shipping first-run shader behavior that turns booting the game into a test of patience, heat tolerance, and whether the player still remembers why they installed it. Put limits on the suffering before compilation becomes a feature.',
 'set a maximum ageing threshold for shader compilation',
  144),

-- Narrative Systems PM Elodie
-- REPORTER: Elodie | Narrative Systems PM | Understands a quest log can become more coherent than the actual story if left unsupervised long enough.
('BOSS-1099', 'Warn When the Quest Log Is Doing More Storytelling Than the Story',
 'Quest tracking has become too good at projecting intent onto worlds that are not always earning it. Add a false-order warning when the journal is carrying more narrative coherence than the questline itself.',
 'warn when quest logs outstory the story',
  89),

('BOSS-1100', 'Stop Treating Dialogue Skips as a Personal Attack on the Writers',
 'A lot of skip behavior comes from replays, alts, speed runs, and the simple fact that destiny sounds different the tenth time. Count contextual skipping before routing fatigue gets interpreted as literary betrayal.',
 'stop treating dialogue skips as insults',
  89),

-- Release Producer Mason
-- REPORTER: Mason | Release Producer | Does not believe a patch install counts as successful if it required retries, admin rights, file verification, and a minor act of faith.
('BOSS-1101', 'Stop Counting Launcher Exhaustion as Patch Success',
 'Patchers keep "working" only after players perform enough retries and desktop rituals to qualify for spiritual credit. Add a success-purity score before brute persistence keeps getting mistaken for release quality.',
 'stop counting launcher exhaustion as patch success',
  144),

('BOSS-1102', 'Review Preloads for Whether They Save Waiting or Just Move It Somewhere More Dramatic',
 'Preloads often get praised as generosity when they mostly shift pain earlier and add launch-day correction downloads big enough to feel insulting. Review whether the suffering decreased or just learned a new schedule.',
 'review preloads for saving wait versus moving it',
  144),

-- Anti-Cheat Architect Noor
-- REPORTER: Noor | Anti-Cheat Architect | Wants security serious enough to catch cheats without treating Linux users and weird setups like a philosophical enemy faction.
('BOSS-1103', 'Stop Anti-Cheat from Treating Linux as a Moral Failure',
 'Detection logic keeps confusing unsupported platforms and strange runtime behavior with probable villainy. Refine the model before integrity work becomes an operating-system doctrine with ban hooks.',
 'stop anti-cheat treating linux as evil',
  144),

('BOSS-1104', 'Tell Ban Review the Difference Between Cheating and Terrifyingly Committed Competence',
 'Some clips look impossible because the player is cheating. Others look impossible because the player has caffeine, headphones, and too much free time. Add an ambition note before reviewers keep criminalizing dedication with good timing.',
 'teach ban review cheating versus competence',
  144),

-- Chief Fun Economist Petra
-- REPORTER: Petra | Chief Fun Economist | Believes any event requiring four nights of mandatory attendance should be labeled honestly as homework with fireworks.
('BOSS-1105', 'Stamp Streak-Heavy Events "Congratulations, We Invented Homework"',
 'If an event only works by making players feel guilty for having dinner plans, sleep, or another hobby, the game should say so out loud. Mark the grindfests honestly before dread keeps borrowing the language of fun.',
 'make streak events say congratulations we invented homework',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Cass [Live Ops Director]', reporter_name = 'Cass', reporter_title = 'Live Ops Director', reporter_description = 'Can tell the difference between players having fun and players negotiating with a battle pass at 1:17 a.m.' WHERE id IN ('BOSS-1091', 'BOSS-1092');
UPDATE community_backlog SET reporter = 'Riku [Multiplayer Systems PM]', reporter_name = 'Riku', reporter_title = 'Multiplayer Systems PM', reporter_description = 'Has seen veteran players detect a soft lobby with the calm joy of sharks hearing spreadsheets bleed.' WHERE id IN ('BOSS-1093', 'BOSS-1094');
UPDATE community_backlog SET reporter = 'Livia [Monetization Designer]', reporter_name = 'Livia', reporter_title = 'Monetization Designer', reporter_description = 'Knows some cosmetic bundles stop being delight and start feeling like an intervention in self-worth with gold trim.' WHERE id IN ('BOSS-1095', 'BOSS-1096');
UPDATE community_backlog SET reporter = 'Tomas [Engine Stability Lead]', reporter_name = 'Tomas', reporter_title = 'Engine Stability Lead', reporter_description = 'Has spent too many nights deciding whether the game crashed, the driver crashed, or reality itself briefly lost texture support.' WHERE id IN ('BOSS-1097', 'BOSS-1098');
UPDATE community_backlog SET reporter = 'Elodie [Narrative Systems PM]', reporter_name = 'Elodie', reporter_title = 'Narrative Systems PM', reporter_description = 'Understands a quest log can become more coherent than the actual story if left unsupervised long enough.' WHERE id IN ('BOSS-1099', 'BOSS-1100');
UPDATE community_backlog SET reporter = 'Mason [Release Producer]', reporter_name = 'Mason', reporter_title = 'Release Producer', reporter_description = 'Does not believe a patch install counts as successful if it required retries, admin rights, file verification, and a minor act of faith.' WHERE id IN ('BOSS-1101', 'BOSS-1102');
UPDATE community_backlog SET reporter = 'Noor [Anti-Cheat Architect]', reporter_name = 'Noor', reporter_title = 'Anti-Cheat Architect', reporter_description = 'Wants security serious enough to catch cheats without treating Linux users and weird setups like a philosophical enemy faction.' WHERE id IN ('BOSS-1103', 'BOSS-1104');
UPDATE community_backlog SET reporter = 'Petra [Chief Fun Economist]', reporter_name = 'Petra', reporter_title = 'Chief Fun Economist', reporter_description = 'Believes any event requiring four nights of mandatory attendance should be labeled honestly as homework with fireworks.' WHERE id IN ('BOSS-1105');

-- REEL: video, streaming, transcoding, subtitles, CDN weirdness, and media pipeline anguish
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Streaming Platform Lead Dana
-- REPORTER: Dana | Streaming Platform Lead | Knows half our outage complaints come from one cursed apartment building and the other half from us pretending that matters less than it does.
('REEL-1106', 'Stop Taking One Apartment Complex''s Wi-Fi Meltdown Personally',
 'Audience complaints often combine real platform issues with one building fighting over evening bandwidth like it is wartime rationing. Add a neighborhood-chaos view before ops declares war on the wrong layer of suffering.',
 'stop taking one apartment complexs wi-fi meltdown personally',
  144),

('REEL-1107', 'Stop Letting One 4K Ego Upload Hold the Whole Queue Hostage',
 'A single creator with cinematic ambition and no compression shame can currently delay everyone else''s ordinary Tuesday. Add fairness controls before one vanity asset turns the transcode queue into a hostage situation.',
 'stop one 4k upload holding queues hostage',
  144),

-- Video Delivery PM Soren
-- REPORTER: Soren | Video Delivery PM | Wishes adaptive bitrate logic would stop treating one cough in the connection as a prophecy of lifelong grain.
('REEL-1108', 'Teach Adaptive Bitrate Not to Panic Because the Network Sneezed Once',
 'The player keeps plunging viewers into potato quality the moment the bandwidth hiccups. Add some composure before a temporary wobble gets interpreted as permanent poverty.',
 'make adaptive bitrate calm down',
  144),

('REEL-1109', 'Admit the Backup CDN Region Feels Like a Character Test',
 'Failover sounds elegant until traffic actually lands there and users discover that "available" can still feel punishing. Measure the experience honestly instead of pretending uptime alone means the audience had a good time.',
 'flag backup cdn as hostile',
  144),

-- Media Pipeline Architect Rina
-- REPORTER: Rina | Media Pipeline Architect | Cares deeply about whether subtitles preserved the joke or politely translated it into a boring different emotion.
('REEL-1110', 'Detect When the Subtitle Pipeline Localized the Wrong Emotion',
 'Translation keeps preserving nouns while quietly murdering sarcasm, menace, absurdity, or the point of the scene. Add mood checks before irony keeps getting localized into respectable explanation.',
 'detect subtitles localizing wrong emotions',
  144),

('REEL-1111', 'Stop Auto-Captions from Turning Ordinary Speech into a Threat',
 'Auto-generated punctuation keeps recasting regular dialogue as accusation, exhaustion, or legal testimony. Review the punctuation before captions start emotionally rewriting the speaker.',
 'fix auto-captions they sound too aggressive',
  89),

-- Creator Tools PM Hugo
-- REPORTER: Hugo | Creator Tools PM | Has watched too many good videos get replaced at 2 a.m. by newer, worse decisions made under weak Wi-Fi and stronger emotion.
('REEL-1112', 'Warn Creators Before They Replace a Good Upload with a Fresher Mistake',
 'Version replacement is too permissive for people editing under embarrassment, exhaustion, and one final export they suddenly believe in. Add a regret-resistant warning before competence gets overwritten by recency.',
 'warn creators about replacing good uploads',
  89),

('REEL-1113', 'Stop Thumbnail Testing from Learning That Panic Face Is the Best Face',
 'CTR optimization keeps drifting toward expressions that look like the content itself is having a medical emergency. Add anti-alarm controls before discovery becomes a marketplace of professional eyebrows and urgent lies.',
 'stop thumbnail tests from learning panic faces',
  144),

-- Playback Engineer Marta
-- REPORTER: Marta | Playback Engineer | Believes the pause button should not automatically assume network failure every time a human needs a second or a glass of water.
('REEL-1114', 'Stop Counting Emotional Recovery Pauses as Buffering',
 'Playback analytics currently flatten together buffering, tab switching, contemplation, and the act of pausing because the scene got weird. Add intent-aware pause classes before transport gets blamed for every moment of stillness.',
 'stop counting emotional recovery pauses as buffering',
  144),

('REEL-1115', 'Rewrite DRM Errors So They Sound Like Technology and Not Personal Rejection',
 'Current playback failures make it sound like a private club personally decided you were not worthy of the content. Rewrite the copy so it explains enough without sounding vindictive.',
 'rewrite drm errors',
  89),

-- Media QA Lead Elise
-- REPORTER: Elise | Media QA Lead | Keeps one ancient television in the lab specifically to remind the rest of us that progress is optional and firmware resentment is real.
('REEL-1116', 'Test One Smart TV Old Enough to Distrust Modernity on Principle',
 'The stack keeps passing sleek device grids and failing on the exact elderly television archetype still mounted in guest rooms and stubborn households everywhere. Add one truly ancient rectangle before compatibility keeps flattering itself.',
 'test one ancient smart tv',
  144),

('REEL-1117', 'Flag Media Bugs That Only Appear When Captions, Casting, and Pride Collide',
 'Some regressions hide until a user expects three mature features to coexist at the same time. Tag the combo-failures before isolated success keeps pretending the platform is an adult.',
 'flag media bugs mixing captions casting pride',
  144),

-- Content Reliability Director Ben
-- REPORTER: Ben | Content Reliability Director | Wants takedowns to stop collapsing every kind of disappearance into one tasteful void the support team then has to explain by séance.
('REEL-1118', 'Make Removals Say Whether They Came from Policy, Copyright, or Lawyers Having a Day',
 'Videos keep vanishing into one elegant absence that hides wildly different bureaucracies underneath. Split the reason cleanly before support has to guess which kind of ghost they are looking at.',
 'say if removals came from lawyers',
  144),

('REEL-1119', 'Teach Auto-Highlights That the Loudest Moment Is Not Always the Best Moment',
 'Clip generation still overvalues waveform panic, motion spikes, and people yelling. Add restraint so the model can notice subtle payoff before it turns every story into screaming confetti.',
 'teach auto-highlights loudest is not best',
  144),

-- Chief Streaming Officer Petra
-- REPORTER: Petra | Chief Streaming Officer | Refuses to let "it technically played" count as success when the stream looked, sounded, or subtitled itself like a public apology.
('REEL-1120', 'Mark Technically Alive but Visibly Cursed Streams as Operationally Embarrassing',
 'A stream can be up, licensed, and utterly humiliating at the same time. Add an Operationally Embarrassing state so the platform stops congratulating itself for being barely conscious.',
 'mark cursed streams as operationally embarrassing',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Dana [Streaming Platform Lead]', reporter_name = 'Dana', reporter_title = 'Streaming Platform Lead', reporter_description = 'Knows half our outage complaints come from one cursed apartment building and the other half from us pretending that matters less than it does.' WHERE id IN ('REEL-1106', 'REEL-1107');
UPDATE community_backlog SET reporter = 'Soren [Video Delivery PM]', reporter_name = 'Soren', reporter_title = 'Video Delivery PM', reporter_description = 'Wishes adaptive bitrate logic would stop treating one cough in the connection as a prophecy of lifelong grain.' WHERE id IN ('REEL-1108', 'REEL-1109');
UPDATE community_backlog SET reporter = 'Rina [Media Pipeline Architect]', reporter_name = 'Rina', reporter_title = 'Media Pipeline Architect', reporter_description = 'Cares deeply about whether subtitles preserved the joke or politely translated it into a boring different emotion.' WHERE id IN ('REEL-1110', 'REEL-1111');
UPDATE community_backlog SET reporter = 'Hugo [Creator Tools PM]', reporter_name = 'Hugo', reporter_title = 'Creator Tools PM', reporter_description = 'Has watched too many good videos get replaced at 2 a.m. by newer, worse decisions made under weak Wi-Fi and stronger emotion.' WHERE id IN ('REEL-1112', 'REEL-1113');
UPDATE community_backlog SET reporter = 'Marta [Playback Engineer]', reporter_name = 'Marta', reporter_title = 'Playback Engineer', reporter_description = 'Believes the pause button should not automatically assume network failure every time a human needs a second or a glass of water.' WHERE id IN ('REEL-1114', 'REEL-1115');
UPDATE community_backlog SET reporter = 'Elise [Media QA Lead]', reporter_name = 'Elise', reporter_title = 'Media QA Lead', reporter_description = 'Keeps one ancient television in the lab specifically to remind the rest of us that progress is optional and firmware resentment is real.' WHERE id IN ('REEL-1116', 'REEL-1117');
UPDATE community_backlog SET reporter = 'Ben [Content Reliability Director]', reporter_name = 'Ben', reporter_title = 'Content Reliability Director', reporter_description = 'Wants takedowns to stop collapsing every kind of disappearance into one tasteful void the support team then has to explain by séance.' WHERE id IN ('REEL-1118', 'REEL-1119');
UPDATE community_backlog SET reporter = 'Petra [Chief Streaming Officer]', reporter_name = 'Petra', reporter_title = 'Chief Streaming Officer', reporter_description = 'Refuses to let "it technically played" count as success when the stream looked, sounded, or subtitled itself like a public apology.' WHERE id IN ('REEL-1120');

-- ADDON: browser extensions, store reviews, content scripts, and plugin-ecosystem chaos
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Extension Platform Lead Nia
-- REPORTER: Nia | Extension Platform Lead | Knows some pages are so structurally cursed that adding a content script is no longer enhancement and starts becoming grave robbing.
('ADDON-1121', 'Teach Content Scripts to Walk Away from Pages That Are Already Too Weird',
 'We keep injecting logic into DOMs assembled by five frameworks during a weather emergency. Add a weirdness cutoff so the extension can refuse to "help" pages that already gave up on being parseable.',
 'teach content scripts to leave weird pages',
  144),

('ADDON-1122', 'Make Permission Prompts Sound Less Like Tiny Search Warrants',
 'File access, tab awareness, clipboard access, and scripting rights keep arriving in one neat list with the calm tone of a product that swears it is only helping. Rewrite the copy before every install starts reading like a compact surveillance novella.',
 'make permission prompts less warrant-like',
  144),

-- Web Extension PM Lucas
-- REPORTER: Lucas | Web Extension PM | Can tell when a store screenshot is promising an amount of stability the living web has never once agreed to provide.
('ADDON-1123', 'Stop Store Screenshots from Promising a Level of Peace the Internet Will Not Honor',
 'Extension listings keep advertising smooth harmony across websites that are one layout shift away from public embarrassment. Add honesty checks before the store page oversells stability we do not control.',
 'generate realistic extension store screenshots',
  144),

('ADDON-1124', 'Track Whether Store Rejections Came from Policy or Reviewer Weather',
 'Review blocks carry too much schedule power to remain a mystical event. Add rejection texture notes so release planning can tell hard rules from reviewer mood and stop consulting omens by default.',
 'track store rejections from policy or weather',
  89),

-- Browser Integrations Engineer Mei
-- REPORTER: Mei | Browser Integrations Engineer | Is tired of background workers dying quietly because the browser team had a new idea about persistence and published it with confidence.
('ADDON-1125', 'Stop Background Workers from Dying Quietly Because the Browser Changed Its Feelings',
 'Extension lifecycle models keep mutating underneath us while the store still expects useful software on top. Harden the background work before platform theory keeps orphaning our logic in silence.',
 'stop background workers from dying quietly',
  144),

('ADDON-1126', 'Test Popup UIs on Browsers Full of Tabs and Mild Distrust',
 'Popup interfaces are getting approved in laboratory calm and then deployed into actual browser lives full of tab chaos, stale auth, and users who no longer trust one more click. Add that version of reality to the tests.',
 'test popup uis on tab-hoarder browsers',
  144),

-- Extension Security PM Idris
-- REPORTER: Idris | Extension Security PM | Thinks host permissions should come with a social body count instead of expanding quietly like tasteful spyware urbanism.
('ADDON-1127', 'Count How Many Websites We Just Made Ourselves Capable of Creeping On',
 'Every new host permission expands the number of pages we can observe, decorate, or misunderstand. Make that footprint visible before access keeps growing with the soft confidence of a hobby panopticon.',
 'count websites we can now creep on',
  89),

('ADDON-1128', 'Tell Us Whether Token Storage Is Secure or Just Stored Somewhere Optimistic',
 'We keep moving auth state between browser storage layers with a level of faith not fully matched by the threat model. Clarify which paths are genuinely protected and which ones are just neat little piles of future regret.',
 'tell us if token storage is optimistic',
  89),

-- Marketplace Support Lead Helena
-- REPORTER: Helena | Marketplace Support Lead | Spends too much time apologizing for bugs caused by other extensions that live next door and throw CSS chairs over the fence.
('ADDON-1129', 'Stamp Reviews Caused by Other Extensions "Neighbor Dispute"',
 'Users keep blaming us for broken pages, weird overlays, and vanished clicks caused by some other add-on in the same browser cul-de-sac. Mark those complaints properly so support stops paying rent on somebody else''s violence.',
 'tag reviews caused by other extensions neighbor dispute',
  144),

('ADDON-1130', 'Stop "Disable Other Extensions" from Sounding Like a Lifestyle Lecture',
 'Troubleshooting often begins by asking users to dismantle the ecosystem they built out of survival, taste, and tab hunger. Rewrite the macro so it sounds technical instead of morally disappointed.',
 'stop disable-other-extensions sounding preachy',
  89),

-- Monetization Extension PM Talia
-- REPORTER: Talia | Monetization Extension PM | Knows an upsell can cross the line from conversion surface to tiny digital pickpocket the moment it appears on the wrong page.
('ADDON-1131', 'Suppress Upsells on Pages Where They Look Like Small Crimes',
 'Some overlay placements are normal. Others land on banking pages, healthcare portals, or tense checkout flows and instantly make the extension feel feral. Add sacred-page suppression before monetization freelances into reputational sabotage.',
 'suppress upsells that look criminal',
  144),

('ADDON-1132', 'Stop Affiliate Overlays from Quietly Rewriting Somebody Else''s Checkout',
 'Helping a user save money is one thing. Rewriting merchant pages, injecting codes, and steering the flow until the extension effectively co-authors the purchase is another. Add limits before "assistance" becomes parasitic authorship.',
 'stop affiliate overlays rewriting other checkouts',
  144),

-- Browser Runtime Architect Owen
-- REPORTER: Owen | Browser Runtime Architect | Has seen too many migration dashboards filled with green boxes built on top of deprecated APIs and artisanal denial.
('ADDON-1133', 'Track MV3 Progress Separately from Elegant Denial',
 'Migration dashboards are too easy to flatter with status boxes while the extension still depends on disappearing APIs and one developer''s beautiful optimism. Split actual progress from denial before the platform rug finishes moving.',
 'track mv3 progress separately from elegant denial',
  144),

('ADDON-1134', 'Stop Product Experiments from Overfitting to Store Reviews Written in Rage',
 'Marketplace reviews are useful, dramatic, selective, and packed with people who just lost state on a tax form. Add weighting rules so the product does not get redesigned around the loudest five angry paragraphs.',
 'stop product experiments overfitting rage reviews',
  89),

-- Chief Extension Officer Mara
-- REPORTER: Mara | Chief Extension Officer | Wants a formal label for extensions that mostly sit on the web, breathe heavily, and mistake presence for value.
('ADDON-1135', 'Mark Extensions That Are Mostly Just Aggressively Present',
 'Some add-ons help. Others mainly occupy the web with overlays, permissions, collisions, and monetization urges. Tag the worst offenders so presence has to prove it is not just another form of trespassing.',
 'mark extensions that are mostly just aggressively present',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Nia [Extension Platform Lead]', reporter_name = 'Nia', reporter_title = 'Extension Platform Lead', reporter_description = 'Knows some pages are so structurally cursed that adding a content script is no longer enhancement and starts becoming grave robbing.' WHERE id IN ('ADDON-1121', 'ADDON-1122');
UPDATE community_backlog SET reporter = 'Lucas [Web Extension PM]', reporter_name = 'Lucas', reporter_title = 'Web Extension PM', reporter_description = 'Can tell when a store screenshot is promising an amount of stability the living web has never once agreed to provide.' WHERE id IN ('ADDON-1123', 'ADDON-1124');
UPDATE community_backlog SET reporter = 'Mei [Browser Integrations Engineer]', reporter_name = 'Mei', reporter_title = 'Browser Integrations Engineer', reporter_description = 'Is tired of background workers dying quietly because the browser team had a new idea about persistence and published it with confidence.' WHERE id IN ('ADDON-1125', 'ADDON-1126');
UPDATE community_backlog SET reporter = 'Idris [Extension Security PM]', reporter_name = 'Idris', reporter_title = 'Extension Security PM', reporter_description = 'Thinks host permissions should come with a social body count instead of expanding quietly like tasteful spyware urbanism.' WHERE id IN ('ADDON-1127', 'ADDON-1128');
UPDATE community_backlog SET reporter = 'Helena [Marketplace Support Lead]', reporter_name = 'Helena', reporter_title = 'Marketplace Support Lead', reporter_description = 'Spends too much time apologizing for bugs caused by other extensions that live next door and throw CSS chairs over the fence.' WHERE id IN ('ADDON-1129', 'ADDON-1130');
UPDATE community_backlog SET reporter = 'Talia [Monetization Extension PM]', reporter_name = 'Talia', reporter_title = 'Monetization Extension PM', reporter_description = 'Knows an upsell can cross the line from conversion surface to tiny digital pickpocket the moment it appears on the wrong page.' WHERE id IN ('ADDON-1131', 'ADDON-1132');
UPDATE community_backlog SET reporter = 'Owen [Browser Runtime Architect]', reporter_name = 'Owen', reporter_title = 'Browser Runtime Architect', reporter_description = 'Has seen too many migration dashboards filled with green boxes built on top of deprecated APIs and artisanal denial.' WHERE id IN ('ADDON-1133', 'ADDON-1134');
UPDATE community_backlog SET reporter = 'Mara [Chief Extension Officer]', reporter_name = 'Mara', reporter_title = 'Chief Extension Officer', reporter_description = 'Wants a formal label for extensions that mostly sit on the web, breathe heavily, and mistake presence for value.' WHERE id IN ('ADDON-1135');

-- MERGE: open source maintainer life, semver blame, issue triage, sponsors, and community pressure
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Open Source Steward Lea
-- REPORTER: Lea | Open Source Steward | Spends too much time deciding whether an issue is a bug, a feature request, or a deeply hurt person wearing stack traces.
('MERGE-1136', 'Stop Logging Sad Feature Requests as Bugs Just Because They Arrived Crying',
 'Issue trackers accumulate requests that are not defects but show up with enough pain and urgency to cosplay as one. Add a sadness classifier before maintainers spend another morning doing emotional zoning instead of triage.',
 'stop logging sad feature requests as bugs',
  144),

('MERGE-1137', 'Show Whether Sponsorship Buys Priority, Gratitude, or Just a Fancy Feeling',
 'Funding tiers keep floating in a useful haze where nobody says exactly how money converts into attention. Add a sponsor-benefits table before patrons start inferring governance rights from a badge and a monthly invoice.',
 'show whether sponsorship buys priority or just vibes',
  144),

-- Community Maintainer PM Ravi
-- REPORTER: Ravi | Community Maintainer PM | Knows semver can be technically correct and still socially set half the ecosystem on fire by Thursday.
('MERGE-1138', 'Add a Release Notes Section for Changes That Are Technically Minor but Practically Loud',
 'Minor releases keep honoring compatibility while still breaking habits, wrappers, and tutorials with surprising force. Add a practically loud section so socially explosive changes stop hiding behind semver manners.',
 'add release notes for loud tiny changes',
  144),

('MERGE-1139', 'Tell Us Which Deprecation Warnings Are Advice and Which Are Countdown Poetry',
 'Some warnings linger for years. Some mean move now. Some exist mostly to prove we once cared. Grade them so downstream teams can tell guidance from threat and threat from decorative atmospheric guilt.',
 'split deprecation warnings into advice or doom',
  89),

-- Maintainer Experience Lead Simone
-- REPORTER: Simone | Maintainer Experience Lead | Can spot the bug report that contains six screenshots, three emotions, and zero reproducible geometry from across the room.
('MERGE-1140', 'Let Bug Reports Admit They Brought Passion Instead of Repro Steps',
 'Plenty of reports arrive with screenshots, declarations, and spiritual urgency while omitting the one version number or local step that would make them useful. Add a passion toggle so maintainers can brace properly.',
 'let bug reports admit they brought passion',
  144),

('MERGE-1141', 'Mark the Good First Issues That Secretly Inherit Ancient Baggage',
 'Some beginner-friendly tasks are easy in code and cursed in context because they sit on top of old arguments, recurring edge cases, or ten years of quiet resentment. Tag the haunted starters before newcomers adopt ancestral grudges on day one.',
 'mark good first issues with ancient baggage',
  144),

-- Semver Policy Architect Tomas
-- REPORTER: Tomas | Semver Policy Architect | Keeps reminding people that "not officially supported" and "we still feel weirdly responsible for it" are not the same operational state.
('MERGE-1142', 'Split Official Support from Integrations We Merely Feel Guilty About',
 'Maintainers carry emotional liability for combinations they never promised, cannot test, and only hear about when someone''s build farm begins singing in a minor key. Draw the line before guilt keeps dressing itself as support policy.',
 'split support from guilt-driven integrations',
  144),

('MERGE-1143', 'Estimate How Many Tutorials a Breaking Change Will Quietly Murder',
 'API changes do not just break code. They orphan blog posts, bootcamp slides, internal wikis, and a thousand copy-pasted gists written by strangers who will eventually find us in anger. Count the educational casualties too.',
 'estimate tutorials each breaking change kills',
  144),

-- Ecosystem Relations PM Nadine
-- REPORTER: Nadine | Ecosystem Relations PM | Runs the public roadmap as a delicate mix of actual strategy, tactical honesty, and features we mention so people stop emailing for a week.
('MERGE-1144', 'Mark Which Roadmap Ideas We Love and Which Ones We Keep Mentioning to Keep the Peace',
 'Public roadmaps get too diplomatic, smoothing over the difference between active work, speculative curiosity, and ideas we are willing to nod at because direct refusal would itself become an issue thread. Add intent classes before persistence governs product by exhaustion.',
 'mark roadmap ideas we love vs peacekeeping filler',
  89),

('MERGE-1145', 'Warn When Community Consensus Is Mostly Just the Loudest People with Free Afternoons',
 'Feedback loops keep overweighting whoever has enough time, irritation, or personality to comment repeatedly in daylight. Add a representativeness warning before stamina keeps impersonating democracy.',
 'warn when consensus is just loud voices',
  144),

-- Runtime Maintainer Kian
-- REPORTER: Kian | Runtime Maintainer | Knows every CI matrix has one old platform everyone claims to support and privately fears like a tarp over something breathing.
('MERGE-1146', 'Annotate the One Platform in the Matrix Everyone Is Secretly Afraid Of',
 'Support grids look broad and confident while one aging runtime or libc combination quietly terrifies the people maintaining it. Add fear markers before we keep calling private sweating a compatibility guarantee.',
 'annotate matrix platform everyone fears',
  144),

('MERGE-1147', 'Track When Portability Fixes Start Cursing the Main Branch',
 'Cross-platform support is wonderful until the default path fills up with weird conditionals and readability debt purchased on behalf of one noble but niche environment. Add a curse budget before inclusion keeps invoicing the common case indefinitely.',
 'track portability fixes cursing main',
  144),

-- OSS Funding Director Celeste
-- REPORTER: Celeste | OSS Funding Director | Maintains a quiet mental list of corporations powered entirely by unpaid conscience and the belief that somebody else will keep showing up forever.
('MERGE-1148', 'List the Companies Running on Free Labor Under "Powered by Conscience"',
 'A lot of commercial dependence on open source is still financed by praise, stars, and the assumption that one principled maintainer will continue sacrificing evenings forever. Label the freeloader enterprises honestly.',
 'list companies running on conscience-powered free labor',
  144),

('MERGE-1149', 'Add a Slider for Whether the Community Apology Is Real or Just Lawyer-Safe',
 'Public apology posts keep hovering between sincere regret and prose engineered not to anger future negotiations. Add a rhetorical slider so we can tell healing from hedging before community repair becomes fully automated.',
 'add slider for real apology versus lawyer-safe apology',
  89),

-- Chief Merge Custodian Petra
-- REPORTER: Petra | Chief Merge Custodian | Thinks the ecosystem should stop leaning so hard on one overcaffeinated maintainer at a time and then acting surprised when a saint snaps.
('MERGE-1150', 'Label Hero-Maintained Repos "Do Not Lean Harder"',
 'Too much of the ecosystem still balances on one exhausted human, several unpaid hours, and a chemical relationship with caffeine. Mark the worst cases before consumers keep treating volunteer stamina like invisible infrastructure.',
 'label hero-maintained repos do not lean harder',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Lea [Open Source Steward]', reporter_name = 'Lea', reporter_title = 'Open Source Steward', reporter_description = 'Spends too much time deciding whether an issue is a bug, a feature request, or a deeply hurt person wearing stack traces.' WHERE id IN ('MERGE-1136', 'MERGE-1137');
UPDATE community_backlog SET reporter = 'Ravi [Community Maintainer PM]', reporter_name = 'Ravi', reporter_title = 'Community Maintainer PM', reporter_description = 'Knows semver can be technically correct and still socially set half the ecosystem on fire by Thursday.' WHERE id IN ('MERGE-1138', 'MERGE-1139');
UPDATE community_backlog SET reporter = 'Simone [Maintainer Experience Lead]', reporter_name = 'Simone', reporter_title = 'Maintainer Experience Lead', reporter_description = 'Can spot the bug report that contains six screenshots, three emotions, and zero reproducible geometry from across the room.' WHERE id IN ('MERGE-1140', 'MERGE-1141');
UPDATE community_backlog SET reporter = 'Tomas [Semver Policy Architect]', reporter_name = 'Tomas', reporter_title = 'Semver Policy Architect', reporter_description = 'Keeps reminding people that "not officially supported" and "we still feel weirdly responsible for it" are not the same operational state.' WHERE id IN ('MERGE-1142', 'MERGE-1143');
UPDATE community_backlog SET reporter = 'Nadine [Ecosystem Relations PM]', reporter_name = 'Nadine', reporter_title = 'Ecosystem Relations PM', reporter_description = 'Runs the public roadmap as a delicate mix of actual strategy, tactical honesty, and features we mention so people stop emailing for a week.' WHERE id IN ('MERGE-1144', 'MERGE-1145');
UPDATE community_backlog SET reporter = 'Kian [Runtime Maintainer]', reporter_name = 'Kian', reporter_title = 'Runtime Maintainer', reporter_description = 'Knows every CI matrix has one old platform everyone claims to support and privately fears like a tarp over something breathing.' WHERE id IN ('MERGE-1146', 'MERGE-1147');
UPDATE community_backlog SET reporter = 'Celeste [OSS Funding Director]', reporter_name = 'Celeste', reporter_title = 'OSS Funding Director', reporter_description = 'Maintains a quiet mental list of corporations powered entirely by unpaid conscience and the belief that somebody else will keep showing up forever.' WHERE id IN ('MERGE-1148', 'MERGE-1149');
UPDATE community_backlog SET reporter = 'Petra [Chief Merge Custodian]', reporter_name = 'Petra', reporter_title = 'Chief Merge Custodian', reporter_description = 'Thinks the ecosystem should stop leaning so hard on one overcaffeinated maintainer at a time and then acting surprised when a saint snaps.' WHERE id IN ('MERGE-1150');

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
 'explain gradebook gaps to parents',
  144),

-- Student Data PM Julian
-- REPORTER: Julian | Student Data PM | Has watched too many family dinners get ruined by one red badge generated from a temporary worksheet wobble.
('CLASS-1153', 'Slow the Parent-Portal Panic Before One Missing Worksheet Starts a Family Incident',
 'Parent notifications remain far too eager to turn small classroom fluctuations into domestic emergencies. Add some damping before one temporary assignment gap becomes a 7:00 p.m. crisis with screenshots.',
 'rate limit parent portal alerts',
  144),

('CLASS-1154', 'Teach SIS Sync the Difference Between a Changed ID and an ID That Was Never Stable',
 'School records move through the year with the serene chaos of forms, schedules, names, guardians, and local identifiers all being revised by different humans at different speeds. Split deliberate change from routine turbulence before sync keeps acting shocked by school being school.',
 'label sis sync id changes clearly',
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
 'build sentiment classifier to flag fake student agreement',
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
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Erica [LMS Platform Lead]', reporter_name = 'Erica', reporter_title = 'LMS Platform Lead', reporter_description = 'Knows district CSVs arrive looking like they were assembled under fluorescent panic by people who no longer believe in summer.' WHERE id IN ('CLASS-1151', 'CLASS-1152');
UPDATE community_backlog SET reporter = 'Julian [Student Data PM]', reporter_name = 'Julian', reporter_title = 'Student Data PM', reporter_description = 'Has watched too many family dinners get ruined by one red badge generated from a temporary worksheet wobble.' WHERE id IN ('CLASS-1153', 'CLASS-1154');
UPDATE community_backlog SET reporter = 'Mei [Assessment Platform Architect]', reporter_name = 'Mei', reporter_title = 'Assessment Platform Architect', reporter_description = 'Designs test delivery for computer labs where the hardware is old, the stakes are high, and hope has already been partially uninstalled.' WHERE id IN ('CLASS-1155', 'CLASS-1156');
UPDATE community_backlog SET reporter = 'Tomas [Classroom Experience Lead]', reporter_name = 'Tomas', reporter_title = 'Classroom Experience Lead', reporter_description = 'Has seen enough digital assignments to know exactly when a teacher has rebuilt paper by hand inside software and somehow made it slower.' WHERE id IN ('CLASS-1157', 'CLASS-1158');
UPDATE community_backlog SET reporter = 'Priya [Learning Analytics Director]', reporter_name = 'Priya', reporter_title = 'Learning Analytics Director', reporter_description = 'Is tired of dashboards that confuse logging in, clicking buttons, and surviving the LMS with actual understanding.' WHERE id IN ('CLASS-1159', 'CLASS-1160');
UPDATE community_backlog SET reporter = 'Celeste [District Partnerships PM]', reporter_name = 'Celeste', reporter_title = 'District Partnerships PM', reporter_description = 'Understands that for many institutions Excel remains the last sacred format because it can be printed, sorted, highlighted, and defended in a room full of worried adults.' WHERE id IN ('CLASS-1161', 'CLASS-1162');
UPDATE community_backlog SET reporter = 'Noor [Accessibility in Education Lead]', reporter_name = 'Noor', reporter_title = 'Accessibility in Education Lead', reporter_description = 'Is done making students drag the same documented needs through one new administrative obstacle course every semester.' WHERE id IN ('CLASS-1163', 'CLASS-1164');
UPDATE community_backlog SET reporter = 'Petra [Chief Academic Systems Officer]', reporter_name = 'Petra', reporter_title = 'Chief Academic Systems Officer', reporter_description = 'Wants one honest number showing whether the software supports learning or merely organizes exhaustion more efficiently.' WHERE id IN ('CLASS-1165');

-- CART: ecommerce ops, inventory drift, warehouse logic, returns, and catalog merchandising mess
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Commerce Operations Lead Val
-- REPORTER: Val | Commerce Operations Lead | Knows a product can be physically present, numerically counted, and still nowhere near emotionally ready to ship.
('CART-1166', 'Add an Inventory State for "Exists, But Good Luck Actually Shipping It"',
 'Stock status is too binary for goods sitting in quarantine, returns, rebagging, photo prep, or the warehouse corner everyone points at with different nouns. Add a spiritually unavailable state before inventory keeps overpromising with a straight face.',
 'add inventory state for good luck shipping',
  144),

('CART-1167', 'Stop Making Buyer''s Remorse Share a Dropdown with Real Product Failure',
 'Current return reasons flatten together defects, size regret, accidental purchases, strategic wardrobing, and the ordinary sadness of seeing something at home under honest lighting. Give the truth more than one tiny menu.',
 'separate buyers remorse from product failure',
  144),

-- Warehouse Systems PM Luca
-- REPORTER: Luca | Warehouse Systems PM | Keeps finding pick routes that saved two seconds by quietly spending another employee''s knees.
('CART-1168', 'Dock Pick Paths Designed by People Who Think Knees Are a Renewable Resource',
 'Routing logic keeps shaving seconds while adding crouching, doubling back, and body damage the spreadsheet will only notice later as attrition. Add ergonomic penalties before efficiency keeps billing human joints as free compute.',
 'fix anti-knee pick paths',
  144),

('CART-1169', 'Stop Packing Candles Like Every Box Is Emotionally Prepared for Violence',
 'Packaging logic overestimates the willingness of cartons to absorb weird mixtures of fragile decor, dense hardware, and one object clearly not meant for this ride. Add a dignity check before corrugation becomes a crime scene.',
 'stop packing candles like they love violence',
  89),

-- Merchandising Data PM Sachi
-- REPORTER: Sachi | Merchandising Data PM | Has accepted that half the taxonomy tree exists to settle internal arguments and only accidentally helps a shopper sometimes.
('CART-1170', 'Mark Which Category Branches Exist for Shoppers and Which Exist for Office Politics',
 'Taxonomy keeps absorbing vendor wishes, SEO demands, campaign leftovers, and one person who still believes premium essentials is a usable concept. Tag the diplomacy branches before navigation gets lost in stakeholder moss.',
 'mark category branches for politics',
  144),

('CART-1171', 'Stop Product Titles from Turning into SEO Panic Monologues',
 'Listing titles keep accumulating adjectives, use cases, materials, emotional promises, and keyword fear until they read like a vendor confessing into a megaphone. Cap the desperation before relevance becomes a word-count sport.',
 'stop product titles becoming seo monologues',
  144),

-- Pricing Systems Architect Ben
-- REPORTER: Ben | Pricing Systems Architect | Has seen enough stacked discounts to know certain price outcomes should be filed under folklore rather than commerce.
('CART-1172', 'Ban Discount Stacks That Produce Prices Even Finance Calls Interesting',
 'Promo combinations keep escaping into algebraic states that require three teams and a warm drink to explain. Add sanity ceilings before pricing starts inventing numbers that feel legally mythical.',
 'ban discount stacks finance calls interesting',
  144),

('CART-1173', 'Teach Cart Recovery That Some Abandonments Are Actually Wisdom',
 'Not every abandoned basket is a bug. Sometimes the user saw shipping, taxes, or their own reflection in the total and chose peace. Add motive shading before recovery flows keep treating judgment as a technical failure.',
 'teach cart recovery that some abandonments are wisdom',
  89),

-- Fulfillment Reliability Engineer Priya
-- REPORTER: Priya | Fulfillment Reliability Engineer | Distrusts tracking pages that imply motion through punctuation alone while the box remains spiritually parked somewhere.
('CART-1174', 'Tell Customers When the Package Is Moving and When the Story Is Just Advancing',
 'Shipment tracking has become too generous with verbs during periods where the parcel itself remains stationary and only the narrative is evolving. Add story-versus-motion labels before logistics fiction starts carrying customer trust.',
 'tell customers when packages actually move',
  144),

('CART-1175', 'Let the SLA Dashboard Admit When the Warehouse Is Having a Character Arc',
 'Facilities do not only fail mechanically. Sometimes they drift through staffing drama, forklift incidents, and temporary personality changes that make normal output impossible. Give the dashboard a plotline mode.',
 'let sla dashboards admit warehouse drama',
  89),

-- Search & Browse PM Niko
-- REPORTER: Niko | Search & Browse PM | Can tell when a recommendation rail has stopped helping and started lashing out on behalf of margins, straps, and warranties.
('CART-1176', 'Tone Down Accessory Recommendations That Feel Personally Offended by Your Profit Margin',
 'Cross-sell logic keeps suggesting cables, wipes, straps, and warranties with the intensity of a tiny sales spirit trying to punish every cart for leaving money on the table. Add a margin-aggression check before rails start feeling vindictive.',
 'tone down angry accessory recommendations',
  144),

('CART-1177', 'Make Sure a Human Can Still Find Pants After Twelve Strategic Filters',
 'Facet sprawl is turning basic shopping into a graduate seminar in side-panel literacy. Add a pants test before discovery becomes coursework and customers forget why they opened the site.',
 'make pants findable after twelve filters',
  89),

-- Customer Support Ops Lead Helena
-- REPORTER: Helena | Customer Support Ops Lead | Wants the WISMO queue split cleanly between our mistakes and the carrier''s ongoing experimental theater of last-mile ambiguity.
('CART-1178', 'Separate "Where Is My Order?" Tickets We Caused from Ones the Carrier Is Improvising Live',
 'Delivery anxiety keeps arriving in one undifferentiated queue where our errors mingle with carrier opacity, apartment weirdness, and final-mile folklore. Split the causes so support stops acting like a weather station for everyone else''s chaos.',
 'add carrier blame flag to wismo queue',
  144),

('CART-1179', 'Tag Credits Issued to Fix Harm Separately from Credits Issued to End the Thread',
 'Credits and concessions live in a suspicious middle zone between justice and sedation. Mark which ones repaired real damage and which ones were basically cash-shaped thread tranquilizers.',
 'tag harm credits separately from shut-up credits',
  144),

-- Chief Commerce Systems Officer Petra
-- REPORTER: Petra | Chief Commerce Systems Officer | Thinks any order delayed three times has earned the right to hear the truth instead of another round of cheerful transit fiction.
('CART-1180', 'Replace "In Transit" with "We Are Improvising" Once the Package Clearly Leaves Reality',
 'Tracking pages keep reciting calm little lies long after everyone knows the shipment has entered a more experimental chapter. If it slips enough times, stop pretending this is standard logistics and admit the plot has broken loose.',
 'replace in transit with we are improvising',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Val [Commerce Operations Lead]', reporter_name = 'Val', reporter_title = 'Commerce Operations Lead', reporter_description = 'Knows a product can be physically present, numerically counted, and still nowhere near emotionally ready to ship.' WHERE id IN ('CART-1166', 'CART-1167');
UPDATE community_backlog SET reporter = 'Luca [Warehouse Systems PM]', reporter_name = 'Luca', reporter_title = 'Warehouse Systems PM', reporter_description = 'Keeps finding pick routes that saved two seconds by quietly spending another employee''''s knees.' WHERE id IN ('CART-1168', 'CART-1169');
UPDATE community_backlog SET reporter = 'Sachi [Merchandising Data PM]', reporter_name = 'Sachi', reporter_title = 'Merchandising Data PM', reporter_description = 'Has accepted that half the taxonomy tree exists to settle internal arguments and only accidentally helps a shopper sometimes.' WHERE id IN ('CART-1170', 'CART-1171');
UPDATE community_backlog SET reporter = 'Ben [Pricing Systems Architect]', reporter_name = 'Ben', reporter_title = 'Pricing Systems Architect', reporter_description = 'Has seen enough stacked discounts to know certain price outcomes should be filed under folklore rather than commerce.' WHERE id IN ('CART-1172', 'CART-1173');
UPDATE community_backlog SET reporter = 'Priya [Fulfillment Reliability Engineer]', reporter_name = 'Priya', reporter_title = 'Fulfillment Reliability Engineer', reporter_description = 'Distrusts tracking pages that imply motion through punctuation alone while the box remains spiritually parked somewhere.' WHERE id IN ('CART-1174', 'CART-1175');
UPDATE community_backlog SET reporter = 'Niko [Search & Browse PM]', reporter_name = 'Niko', reporter_title = 'Search & Browse PM', reporter_description = 'Can tell when a recommendation rail has stopped helping and started lashing out on behalf of margins, straps, and warranties.' WHERE id IN ('CART-1176', 'CART-1177');
UPDATE community_backlog SET reporter = 'Helena [Customer Support Ops Lead]', reporter_name = 'Helena', reporter_title = 'Customer Support Ops Lead', reporter_description = 'Wants the WISMO queue split cleanly between our mistakes and the carrier''''s ongoing experimental theater of last-mile ambiguity.' WHERE id IN ('CART-1178', 'CART-1179');
UPDATE community_backlog SET reporter = 'Petra [Chief Commerce Systems Officer]', reporter_name = 'Petra', reporter_title = 'Chief Commerce Systems Officer', reporter_description = 'Thinks any order delayed three times has earned the right to hear the truth instead of another round of cheerful transit fiction.' WHERE id IN ('CART-1180');

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
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Mara [Clinical Systems Director]', reporter_name = 'Mara', reporter_title = 'Clinical Systems Director', reporter_description = 'Has watched too many patient portals turn harmless lab variance into a midnight panic event with decimal places.' WHERE id IN ('CLINIC-1181', 'CLINIC-1182');
UPDATE community_backlog SET reporter = 'Dev [EHR Integration PM]', reporter_name = 'Dev', reporter_title = 'EHR Integration PM', reporter_description = 'Has learned that an HL7 message can be perfectly valid, clinically useful, and spiritually deranged all at once.' WHERE id IN ('CLINIC-1183', 'CLINIC-1184');
UPDATE community_backlog SET reporter = 'Elise [Patient Experience Lead]', reporter_name = 'Elise', reporter_title = 'Patient Experience Lead', reporter_description = 'Knows a healthcare reminder can land like a simple nudge or a tiny medically licensed existential check-in depending on the wording.' WHERE id IN ('CLINIC-1185', 'CLINIC-1186');
UPDATE community_backlog SET reporter = 'Jonas [Med Device Software Architect]', reporter_name = 'Jonas', reporter_title = 'Med Device Software Architect', reporter_description = 'Is begging sensors, batteries, and leads to stop behaving like dramatic coworkers in rooms where actual patients are trying to heal.' WHERE id IN ('CLINIC-1187', 'CLINIC-1188');
UPDATE community_backlog SET reporter = 'Sofia [Care Analytics PM]', reporter_name = 'Sofia', reporter_title = 'Care Analytics PM', reporter_description = 'Keeps reminding models that some patients are administratively intense because the system trained them that way, not because their health is collapsing.' WHERE id IN ('CLINIC-1189', 'CLINIC-1190');
UPDATE community_backlog SET reporter = 'Priya [Clinical Documentation Systems Lead]', reporter_name = 'Priya', reporter_title = 'Clinical Documentation Systems Lead', reporter_description = 'Has seen enough chart templates to know a note can become a legal mattress stuffed with boilerplate and still fail to mention whether the patient has knees.' WHERE id IN ('CLINIC-1191', 'CLINIC-1192');
UPDATE community_backlog SET reporter = 'Luca [Compliance Programs Manager]', reporter_name = 'Luca', reporter_title = 'Compliance Programs Manager', reporter_description = 'Is tired of audit trails proving that a click happened while saying absolutely nothing about whether anyone involved understood what they had just done.' WHERE id IN ('CLINIC-1193', 'CLINIC-1194');
UPDATE community_backlog SET reporter = 'Petra [Chief Clinical Software Officer]', reporter_name = 'Petra', reporter_title = 'Chief Clinical Software Officer', reporter_description = 'Wants the software to admit when it is taking longer than the actual appointment and has crossed from care support into clerical fan fiction.' WHERE id IN ('CLINIC-1195');

-- CIVIC: govtech, public portals, permits, identity checks, and bureaucratic software theater
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Digital Services Director Moira
-- REPORTER: Moira | Digital Services Director | Knows permit requests do not simply process; they enter municipal weather and may or may not come back with a stamp.
('CIVIC-1196', 'Give Permit Tracking a Weather Report Instead of a Frozen Status Badge',
 'Permit requests keep disappearing into a civic soup of handoffs, holidays, moods, and polite departmental fog. Add a municipal weather state so residents stop mistaking official stillness for a software glitch.',
 'add weather widget to permit tracker',
  144),

('CIVIC-1197', 'Show Exactly Why We Need Three Documents to Prove One Tired Resident Exists',
 'Identity verification remains too comfortable with escalating document hunger while refusing to say whether it is proving personhood, address, entitlement, or just honoring a historic love of paper. Put the reason beside each upload box in plain language.',
 'show why permits need three documents',
  144),

-- Public Benefits PM Javier
-- REPORTER: Javier | Public Benefits PM | Has watched too many people lose support because one checkbox quietly rerouted them into administrative winter.
('CIVIC-1198', 'Warn Users When One Checkbox Is About to Ruin Their Week',
 'Eligibility forms still let mild wording confusion become accidental self-disqualification with a straight face. Add a risk warning before the interface quietly performs austerity through confidence and small boxes.',
 'add javascript confirm dialog to ruinous checkboxes',
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
 'flag plain language changes to legal text',
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
 'factor transit time into appointment slots',
  144),

-- Public Sector Integrations Engineer Omar
-- REPORTER: Omar | Public Sector Integrations Engineer | Knows a fast response from a mainframe often just means nothing meaningful has happened yet, only that the front desk answered quickly.
('CIVIC-1206', 'Make Fast Legacy Responses Admit They Are Only the Front Desk of a Longer Suffering',
 'Back-end systems keep returning accepted, pending, or queued in ways that sound complete to the portal and hilariously incomplete to anyone who has met the actual workflow. Add depth notes before speed keeps impersonating progress.',
 'make legacy replies mention the real suffering',
  144),

('CIVIC-1207', 'Report Cases Resolved Mainly Because the Rules Eventually Got Tired',
 'Automation engines can become so tangled with exceptions that some decisions feel less adjudicated than surrendered into after enough branch collisions. Flag the rule-exhaustion cases before they get mistaken for elegant policy execution.',
 'report cases closed by rule exhaustion',
  144),

-- Program Equity Analyst Simone
-- REPORTER: Simone | Program Equity Analyst | Wants accessibility reviews to admit when a portal still assumes broadband, printers, weekdays, and a supernatural amount of patience.
('CIVIC-1208', 'Audit Public Portals for Real-Life Access Instead of Just Compliant HTML',
 'A portal can be technically accessible and still assume home internet, scanners, English fluency, daytime flexibility, and a tolerance for repetitive humiliation. Expand the review before markup theater keeps winning.',
 'audit portals for real-life access',
  144),

('CIVIC-1209', 'Create a Safe Procedure for Frontline Humans to Override the Machine Without Becoming the Story',
 'Workers often know when a case needs judgment or mercy and the system currently treats humane override like a necessary but punishable offense. Add protected lanes so compassion does not require private heroics and self-defense email.',
 'add safe override button for staff',
  144),

-- Chief Civic Systems Officer Petra
-- REPORTER: Petra | Chief Civic Systems Officer | Thinks any online form that still feels like standing in line indoors deserves to be labeled honestly instead of praised for having CSS.
('CIVIC-1210', 'Stamp Fake Digital Progress "Paper with Better Fonts"',
 'If the portal still makes people repeat facts, gather documents, guess statuses, and wander the same maze behind a login, it is not transformation. It is paper wearing a stylesheet. Mark it accordingly.',
 'label fake digital progress on forms',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Moira [Digital Services Director]', reporter_name = 'Moira', reporter_title = 'Digital Services Director', reporter_description = 'Knows permit requests do not simply process; they enter municipal weather and may or may not come back with a stamp.' WHERE id IN ('CIVIC-1196', 'CIVIC-1197');
UPDATE community_backlog SET reporter = 'Javier [Public Benefits PM]', reporter_name = 'Javier', reporter_title = 'Public Benefits PM', reporter_description = 'Has watched too many people lose support because one checkbox quietly rerouted them into administrative winter.' WHERE id IN ('CIVIC-1198', 'CIVIC-1199');
UPDATE community_backlog SET reporter = 'Lena [Civic Forms Architect]', reporter_name = 'Lena', reporter_title = 'Civic Forms Architect', reporter_description = 'Is tired of asking residents for facts the agency already knows in two databases, one PDF, and a drawer with bad tabs.' WHERE id IN ('CIVIC-1200', 'CIVIC-1201');
UPDATE community_backlog SET reporter = 'Theo [Records Systems PM]', reporter_name = 'Theo', reporter_title = 'Records Systems PM', reporter_description = 'Has seen too many blank search results create tiny neighborhood conspiracy theories because the portal refuses to say whether a file is private, pending, lost, or buried in basement time.' WHERE id IN ('CIVIC-1202', 'CIVIC-1203');
UPDATE community_backlog SET reporter = 'Priya [Resident Communications Lead]', reporter_name = 'Priya', reporter_title = 'Resident Communications Lead', reporter_description = 'Knows an official notice can stay polite right up until paragraph four reveals fines, deadlines, or life damage with astonishing calm.' WHERE id IN ('CIVIC-1204', 'CIVIC-1205');
UPDATE community_backlog SET reporter = 'Omar [Public Sector Integrations Engineer]', reporter_name = 'Omar', reporter_title = 'Public Sector Integrations Engineer', reporter_description = 'Knows a fast response from a mainframe often just means nothing meaningful has happened yet, only that the front desk answered quickly.' WHERE id IN ('CIVIC-1206', 'CIVIC-1207');
UPDATE community_backlog SET reporter = 'Simone [Program Equity Analyst]', reporter_name = 'Simone', reporter_title = 'Program Equity Analyst', reporter_description = 'Wants accessibility reviews to admit when a portal still assumes broadband, printers, weekdays, and a supernatural amount of patience.' WHERE id IN ('CIVIC-1208', 'CIVIC-1209');
UPDATE community_backlog SET reporter = 'Petra [Chief Civic Systems Officer]', reporter_name = 'Petra', reporter_title = 'Chief Civic Systems Officer', reporter_description = 'Thinks any online form that still feels like standing in line indoors deserves to be labeled honestly instead of praised for having CSS.' WHERE id IN ('CIVIC-1210');

-- GEAR: robotics, manufacturing, industrial control, PLCs, and factory-floor software pain
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Factory Systems Director Bram
-- REPORTER: Bram | Factory Systems Director | Has seen too many PLC "improvements" increase throughput and also triple the amount of folklore required to touch the line safely.
('GEAR-1211', 'Force Every PLC Change to Admit How Much New Technician Mythology It Will Create',
 'Control logic updates keep arriving dressed as efficiency while quietly making maintenance more ceremonial, more fragile, and more dependent on one guy named Gary. Add a burden note before throughput gains hide their downstream curse.',
 'log plc changes in plain english',
  144),

('GEAR-1212', 'Teach the HMI the Difference Between Real Danger and Ordinary Machine Drama',
 'Operator trust dies when every minor state shift turns the whole screen red like the factory just entered judgment. Split peril from melodrama before the alarms mean everything and therefore nothing.',
 'label hmi alerts danger or noise',
  144),

-- Robotics Fleet PM Keiko
-- REPORTER: Keiko | Robotics Fleet PM | Knows warehouse robots do not operate in geometry; they operate in forklift politics and painted-line disrespect.
('GEAR-1213', 'Teach Warehouse Robots That Forklifts Are Moving Political Weather',
 'Autonomous routes keep assuming the floor is orderly when it is actually full of pallets, urgency, human improvisation, and forklift drivers who treat painted paths as philosophical suggestions. Add human-chaos mode before the bots learn humility the hard way.',
 'simulate forklift traffic in robot planner',
  144),

('GEAR-1214', 'Count Near-Miss Dances Separately from Actual Collision Prevention',
 'Some safety stacks are not eliminating accidents so much as replacing them with elegant deadlock ballets and route hesitation. Break near-miss choreography out into its own counter before the system gets praised for making danger look tidier.',
 'track near misses separately from collisions',
  144),

-- Manufacturing Data PM Luis
-- REPORTER: Luis | Manufacturing Data PM | Is tired of OEE quietly blaming steel for downtime that was actually caused by software pausing to think about itself.
('GEAR-1215', 'Expose Machine Downtime Caused by Software Thinking Too Long',
 'Idle time keeps getting blamed on equipment when a growing slice is really firmware hesitation, orchestration drift, and code politely arranging itself while the line waits. Break software delay out before steel takes the blame for JavaScript again.',
 'expose downtime caused by software overthinking',
  144),

('GEAR-1216', 'Track Scrap Caused by Settings That Were Legal and Still Completely Idiotic',
 'A surprising amount of bad output comes from configuration combinations that passed validation, satisfied forms, and still should never have met real material. Add a category for accepted nonsense before compliance keeps impersonating wisdom.',
 'track scrap caused by compliance settings',
  144),

-- Industrial Networking Lead Priya
-- REPORTER: Priya | Industrial Networking Lead | Can point at a switch and tell whether it was designed, inherited, or installed by a very confident electrician during a bad week.
('GEAR-1217', 'Color-Code the Factory Network by Design Versus Historical Wiring Improvisation',
 'Plant networks keep presenting themselves as architecture when large parts are really cable archaeology with uptime attached. Mark the accidental sections before outage planning turns into speculative fiction.',
 'color-code factory network by wiring improvisation',
  144),

('GEAR-1218', 'Show When One Tiny Gateway Has Quietly Become Governor of the Entire Factory Mood',
 'We have too many critical flows resting on one fanless little brick nobody worries about until it becomes the emotional center of half the line. Add a dependency weight view before a cheap box gains sovereign power by surprise.',
 'show gateway dependency on factory dashboard',
  144),

-- Safety Systems Engineer Tomas
-- REPORTER: Tomas | Safety Systems Engineer | Maintains one sacred rule: software may observe the red button, but it may not get curious about touching it.
('GEAR-1219', 'Make Safety Integrations Prove They Only Look at the Red Button',
 'The line between observing emergency-stop circuits and getting ideas about them must stay bright, loud, and legally boring. Require proof before convenience starts inching toward influence.',
 'hardcode safety integration to ignore everything except red',
  144),

('GEAR-1220', 'Let Incident Reviews Admit When Physics, Process, and Courage All Helped Cause the Accident',
 'Too many root-cause writeups flatten ugly afternoons into one elegant reason when the truth involves wear, timing, overrides, assumptions, and one brave click too many. Add multi-layer blame before the report flatters itself.',
 'add physics helped checkbox to incident reviews',
  144),

-- Maintenance Planning PM Hana
-- REPORTER: Hana | Maintenance Planning PM | Knows predictive maintenance can sound exactly like a wise old mechanic right up until it is just a spreadsheet gossiping about vibration.
('GEAR-1221', 'Teach Predictive Maintenance the Difference Between Real Failure and Vibration Gossip',
 'Sensor-heavy systems keep upgrading every anomaly into prophecy. Add ambition markers so planners can tell looming failure from mathematically decorated nervousness.',
 'classify maintenance alerts by confidence',
  144),

('GEAR-1222', 'Warn Us When One Boring Spare Part Is About to Become a Philosophical Lesson',
 'Inventory buffers look solid until one unremarkable belt or seal becomes unavailable and the line discovers that resilience was secretly being rented from luck. Add alerts before procurement turns metaphysical.',
 'warn when spare parts hit shortages',
  144),

-- Vision Systems Lead Nico
-- REPORTER: Nico | Vision Systems Lead | Knows cameras are happiest when the lighting is stable, the dust behaves, and reality itself has agreed not to become abstract art today.
('GEAR-1223', 'Stop the Defect Model from Confusing Lighting Drama with Actual Product Failure',
 'Machine vision remains too confident in environments where glare, bulb aging, dust, and reflective packaging can turn inspection into gallery work. Add environment confidence so photons stop getting written up as defects.',
 'stop defect models confusing lighting with failure',
  144),

('GEAR-1224', 'Make Calibration Prove Whether the Floor Moved or the Model Just Found Religion',
 'Regression in a vision line can come from hardware drift, environmental shift, or the model developing a stricter doctrine overnight. Add a sanity check before recalibration turns into weekly theology.',
 'make calibration prove floor shift versus model religion',
  144),

-- Chief Industrial Software Officer Petra
-- REPORTER: Petra | Chief Industrial Software Officer | Wants one honest number showing whether the software truly runs the line or is just arguing with machinery at industrial volume.
('GEAR-1225', 'Turn the Control Panel Amber When the Factory Is Clearly Winning the Argument',
 'If alarms are noisy, robots are improvising, the network is lying, and maintenance is translating around all of it, the system should stop projecting command. Add an amber state that says the software is negotiating with the line, not running it.',
 'turn panel amber during manual overrides',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Bram [Factory Systems Director]', reporter_name = 'Bram', reporter_title = 'Factory Systems Director', reporter_description = 'Has seen too many PLC "improvements" increase throughput and also triple the amount of folklore required to touch the line safely.' WHERE id IN ('GEAR-1211', 'GEAR-1212');
UPDATE community_backlog SET reporter = 'Keiko [Robotics Fleet PM]', reporter_name = 'Keiko', reporter_title = 'Robotics Fleet PM', reporter_description = 'Knows warehouse robots do not operate in geometry; they operate in forklift politics and painted-line disrespect.' WHERE id IN ('GEAR-1213', 'GEAR-1214');
UPDATE community_backlog SET reporter = 'Luis [Manufacturing Data PM]', reporter_name = 'Luis', reporter_title = 'Manufacturing Data PM', reporter_description = 'Is tired of OEE quietly blaming steel for downtime that was actually caused by software pausing to think about itself.' WHERE id IN ('GEAR-1215', 'GEAR-1216');
UPDATE community_backlog SET reporter = 'Priya [Industrial Networking Lead]', reporter_name = 'Priya', reporter_title = 'Industrial Networking Lead', reporter_description = 'Can point at a switch and tell whether it was designed, inherited, or installed by a very confident electrician during a bad week.' WHERE id IN ('GEAR-1217', 'GEAR-1218');
UPDATE community_backlog SET reporter = 'Tomas [Safety Systems Engineer]', reporter_name = 'Tomas', reporter_title = 'Safety Systems Engineer', reporter_description = 'Maintains one sacred rule: software may observe the red button, but it may not get curious about touching it.' WHERE id IN ('GEAR-1219', 'GEAR-1220');
UPDATE community_backlog SET reporter = 'Hana [Maintenance Planning PM]', reporter_name = 'Hana', reporter_title = 'Maintenance Planning PM', reporter_description = 'Knows predictive maintenance can sound exactly like a wise old mechanic right up until it is just a spreadsheet gossiping about vibration.' WHERE id IN ('GEAR-1221', 'GEAR-1222');
UPDATE community_backlog SET reporter = 'Nico [Vision Systems Lead]', reporter_name = 'Nico', reporter_title = 'Vision Systems Lead', reporter_description = 'Knows cameras are happiest when the lighting is stable, the dust behaves, and reality itself has agreed not to become abstract art today.' WHERE id IN ('GEAR-1223', 'GEAR-1224');
UPDATE community_backlog SET reporter = 'Petra [Chief Industrial Software Officer]', reporter_name = 'Petra', reporter_title = 'Chief Industrial Software Officer', reporter_description = 'Wants one honest number showing whether the software truly runs the line or is just arguing with machinery at industrial volume.' WHERE id IN ('GEAR-1225');

-- ITIN: travel, reservations, itineraries, check-in flows, and hospitality-grade chaos
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Travel Platform Lead Elise
-- REPORTER: Elise | Travel Platform Lead | Has made peace with the fact that "confirmed" in travel means at least three separate systems are lying together in public.
('ITIN-1226', 'Stop Itineraries from Pretending "Confirmed" Means the Airline Agrees for More Than Five Minutes',
 'Booking views keep presenting certainty in an industry built from weather, inventory chaos, and schedule revision. Add layered confirmation states so the app stops giving humans binary comfort the airlines never offered each other.',
 'stop itineraries pretending confirmed means anything',
  144),

('ITIN-1227', 'Price Rebooking Options in Knees, Sleep, and Real Human Life',
 'Alternative flights are not abstract graph nodes. They are airports, layovers, bags, children, jobs, and one traveler''s final nerve. Add human-cost scoring before the system keeps calling cruel rebookings elegant.',
 'price rebooking in knees sleep and life',
  144),

-- Hospitality Systems PM Kian
-- REPORTER: Kian | Hospitality Systems PM | Knows a hotel room can exist physically, spiritually, and electronically in three completely different states at the same time.
('ITIN-1228', 'Add an Honest Maybe-Room State to Hotel Availability',
 'Inventory keeps landing in the ugly middle where there is probably a room somewhere but the property, OTA, PMS, and front desk cannot agree with enough conviction to sell it cleanly. Tell the truth instead of overprecision.',
 'add an honest maybe-room state to hotel availability',
  144),

('ITIN-1229', 'Label Flexible Rates as Freedom or Just a Tax on Fear',
 'Cancellable pricing keeps getting sold as empowerment when a lot of it is just monetized nervousness in a polite font. Tag the fear tax before flexibility keeps pretending to be morally neutral.',
 'label flexible rates freedom or fear tax',
  144),

-- Airline Integrations Engineer Priya
-- REPORTER: Priya | Airline Integrations Engineer | Has seen one record locator contain enough contradictory truths to qualify as a small diplomatic crisis.
('ITIN-1230', 'Teach PNR Sync That One Locator Can Be Several Different Lies at Once',
 'Reservation records keep carrying ticketed confidence, seat confusion, and host-system superstition in the same tiny code. Add multi-reality notes before support keeps assuming the locator speaks with one mouth.',
 'teach pnr sync one locator holds lies',
  144),

('ITIN-1231', 'Stop Emailing Schedule Collapse as a "Small Update"',
 'There is a real difference between ten minutes and your day now requiring childcare, rerouting, prayer, and an emergency sandwich. Add disruption gradients before travel chaos keeps arriving under one chirpy subject line.',
 'stop emailing schedule collapse as a small update',
  144),

-- Check-In Experience Lead Omar
-- REPORTER: Omar | Check-In Experience Lead | Understands that passport scanning usually happens under kitchen lighting, bad angles, and the kind of panic no demo environment dares simulate.
('ITIN-1232', 'Design Passport Scan for Kitchens, Not for Morally Perfect Lighting',
 'Identity capture stays too optimistic about reflective tables, dim bulbs, glare, and hands belonging to stressed humans. Build for domestic chaos instead of brochure conditions.',
 'design passport scan for kitchen lighting',
  144),

('ITIN-1233', 'Mark Seats That Are Available but Will Absolutely Ruin Somebody''s Mood',
 'Some seats are technically bookable and spiritually hostile because of legroom, toilets, broken power, recline war crimes, or structural knee betrayal. Add complaint likelihood before availability keeps masquerading as fairness.',
 'mark seats available but mood-ruining',
  144),

-- Travel Support Director Talia
-- REPORTER: Talia | Travel Support Director | Is tired of every missing reservation getting filed as one generic mystery when the actual culprits range from typos to supplier silence to antique distribution demons.
('ITIN-1234', 'Separate Missing Bookings Caused by You, Suppliers, and Ancient GDS Mischief',
 'Support queues keep collapsing user error, payment lag, sync gaps, and mainframe spite into one vague booking problem. Split the causes before the team becomes a séance service for vanished itineraries.',
 'write regex for missing booking causes',
  144),

('ITIN-1235', 'Stop Disruption Vouchers from Sounding Like Coupons for Shared Trauma',
 'Compensation messages arrive so tidy they sometimes sound less like help and more like branded inconvenience management. Rewrite them before the airline starts apologizing like a cashback app.',
 'stop disruption vouchers sounding trauma-themed',
  89),

-- Pricing & Inventory PM Marco
-- REPORTER: Marco | Pricing & Inventory PM | Believes fare rules should be legible before purchase rather than archaeologically discoverable afterward in a mood of disbelief.
('ITIN-1236', 'Rewrite Fare Rules so Humans Can Read Them Before Buying the Ticket',
 'Current fare displays still look like legal relics recovered from a wet suitcase. Make the restrictions legible before customers buy first and decode later.',
 'rewrite fare rules so humans can read',
  144),

('ITIN-1237', 'Block Dynamic Pricing from Charging More Because the User Looks Tired',
 'We are increasingly capable of inferring urgency, repeat search behavior, device type, and visible fatigue in ways that could turn despair into margin. Add guardrails before pricing becomes clairvoyant in the worst possible way.',
 'block dynamic pricing from charging more',
  144),

-- Ground Ops Integration Lead Sachi
-- REPORTER: Sachi | Ground Ops Integration Lead | Knows baggage systems rely on a dangerous mix of sparse scans, hopeful inference, and the public''s willingness to keep believing for another hour.
('ITIN-1238', 'Separate Actual Bag Scans from Optimistic Baggage Fan Fiction',
 'Tracking keeps acting more certain than the conveyor belts deserve. Label which updates were observed and which ones are just luggage optimism in a clean font.',
 'split bag scans from baggage fanfiction',
  144),

('ITIN-1239', 'Make Transfer Recommendations Pass One Basic Empathy Check',
 'Routing logic keeps suggesting connections that only work if the traveler has no bags, no children, no legs, and no relationship with reality. Add a would-you-do-this-yourself test before the app starts selling airport parkour.',
 'make transfer recommendations pass one basic empathy check',
  144),

-- Chief Journey Systems Officer Petra
-- REPORTER: Petra | Chief Journey Systems Officer | Wants one blunt number showing whether the platform moves people competently or merely narrates disappointment with better fonts and a lot of partner APIs.
('ITIN-1240', 'Show a Red Banner When a Booking Is Confirmed but the Journey Is Clearly Doomed',
 'If the inventory is shaky, the bags are lying, the rebooking options are cruel, and the disruption path already smells like airport carpet, the UI should stop purring the word Confirmed. Add a red banner when the trip is technically booked and operationally cursed.',
 'show red banner for doomed trips',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Elise [Travel Platform Lead]', reporter_name = 'Elise', reporter_title = 'Travel Platform Lead', reporter_description = 'Has made peace with the fact that "confirmed" in travel means at least three separate systems are lying together in public.' WHERE id IN ('ITIN-1226', 'ITIN-1227');
UPDATE community_backlog SET reporter = 'Kian [Hospitality Systems PM]', reporter_name = 'Kian', reporter_title = 'Hospitality Systems PM', reporter_description = 'Knows a hotel room can exist physically, spiritually, and electronically in three completely different states at the same time.' WHERE id IN ('ITIN-1228', 'ITIN-1229');
UPDATE community_backlog SET reporter = 'Priya [Airline Integrations Engineer]', reporter_name = 'Priya', reporter_title = 'Airline Integrations Engineer', reporter_description = 'Has seen one record locator contain enough contradictory truths to qualify as a small diplomatic crisis.' WHERE id IN ('ITIN-1230', 'ITIN-1231');
UPDATE community_backlog SET reporter = 'Omar [Check-In Experience Lead]', reporter_name = 'Omar', reporter_title = 'Check-In Experience Lead', reporter_description = 'Understands that passport scanning usually happens under kitchen lighting, bad angles, and the kind of panic no demo environment dares simulate.' WHERE id IN ('ITIN-1232', 'ITIN-1233');
UPDATE community_backlog SET reporter = 'Talia [Travel Support Director]', reporter_name = 'Talia', reporter_title = 'Travel Support Director', reporter_description = 'Is tired of every missing reservation getting filed as one generic mystery when the actual culprits range from typos to supplier silence to antique distribution demons.' WHERE id IN ('ITIN-1234', 'ITIN-1235');
UPDATE community_backlog SET reporter = 'Marco [Pricing & Inventory PM]', reporter_name = 'Marco', reporter_title = 'Pricing & Inventory PM', reporter_description = 'Believes fare rules should be legible before purchase rather than archaeologically discoverable afterward in a mood of disbelief.' WHERE id IN ('ITIN-1236', 'ITIN-1237');
UPDATE community_backlog SET reporter = 'Sachi [Ground Ops Integration Lead]', reporter_name = 'Sachi', reporter_title = 'Ground Ops Integration Lead', reporter_description = 'Knows baggage systems rely on a dangerous mix of sparse scans, hopeful inference, and the public''''s willingness to keep believing for another hour.' WHERE id IN ('ITIN-1238', 'ITIN-1239');
UPDATE community_backlog SET reporter = 'Petra [Chief Journey Systems Officer]', reporter_name = 'Petra', reporter_title = 'Chief Journey Systems Officer', reporter_description = 'Wants one blunt number showing whether the platform moves people competently or merely narrates disappointment with better fonts and a lot of partner APIs.' WHERE id IN ('ITIN-1240');

-- ATLAS: maps, geo, routing, fleet dispatch, geocoding, and spatial software anguish
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Location Data Lead Noor
-- REPORTER: Noor | Location Data Lead | Has accepted that half of geocoding is geometry and the other half is one resident saying "turn left at the old bakery that is now a vape shop."
('ATLAS-1241', 'Teach Geocoding That Some Addresses Are Basically Folklore with Numbers',
 'Formal address logic keeps collapsing when reality shows up as landmarks, local nicknames, inherited numbering sins, and one building everyone swears is "next to the old pharmacy." Add folklore tolerance before the map keeps acting shocked that humans describe place like humans.',
 'flag geocoding guesses in route api',
  144),

('ATLAS-1242', 'Make Reverse Geocoding Admit When the Pin Landed There by Luck',
 'Phones wobble. Buildings are dense. Sometimes the user was walking with the device in a tote bag. Stop returning parcel-level confidence when the coordinates were basically guessed through weather and optimism.',
 'make reverse geocoding admit lucky guesses',
  144),

-- Routing Systems PM Timo
-- REPORTER: Timo | Routing Systems PM | Knows roads are not lines on a graph so much as public arguments with lane markings.
('ATLAS-1243', 'Add a Traffic State for "The Road Is Open but the City Clearly Meant No"',
 'ETA logic keeps getting ambushed by parades, school pickup, double parking, cones, weather, and the municipal decision to turn one avenue into a full-body refusal. Stop acting like asphalt automatically implies cooperation.',
 'add traffic state for open but no',
  144),

('ATLAS-1244', 'Reject Routes That Only Make Sense If the Driver Is a Hovering Spreadsheet',
 'Optimization keeps generating gorgeous plans with impossible parking, cursed left turns, fake loading assumptions, and transfer timings only a drone would accept quietly. Add one basic human filter before the route planner insults another courier with math.',
 'reject routes that only work for hovering spreadsheets',
  144),

-- Logistics Intelligence Lead Hana
-- REPORTER: Hana | Logistics Intelligence Lead | Has watched too many delivery failures get blamed on "bad addresses" when the real problem was one feral buzzer panel and a concierge with principles.
('ATLAS-1245', 'Track Buildings That Require a Secret Handshake to Receive a Package',
 'Delivery analytics keep flattening gate codes, concierge moods, fake loading docks, buzzer myths, and "leave it at reception" instructions for receptions that do not exist. Name the building nonsense so the dashboard stops blaming the address for having culture.',
 'track buildings needing secret handshakes',
  144),

('ATLAS-1246', 'Show the Exact Places Drivers Ignored the Map for Excellent Reasons',
 'Route replay keeps treating every deviation like a tiny rebellion even when the driver was avoiding a barricade, a dead turn, or a deeply stupid instruction from our cheerful little route engine. Highlight the smart disobedience before ops punishes local knowledge again.',
 'show where drivers wisely ignored maps',
  144),

-- Geo UX PM Elise
-- REPORTER: Elise | Geo UX PM | Knows a pin can be only twenty meters off and still ruin somebody's groceries, stroller, knees, and faith in software.
('ATLAS-1247', 'Label Pins That Are Technically Close but Practically Up Another Hill',
 'A small map error turns into a real alley, staircase, courtyard, or muttered betrayal when someone is carrying bags or a child. Stop calling that "close enough" just because the dot looks tidy from space.',
 'label pins that are close but uphill',
  144),

('ATLAS-1248', 'Indoor Maps Should Stop Bluffing About Corridors They Met Last Tuesday',
 'Office towers, malls, and hospitals keep rearranging rooms while our indoor layer clings to one old PDF and a prayer. Add freshness and uncertainty cues before directions send people confidently into a drywall surprise.',
 'stop indoor maps bluffing about corridors',
  144),

-- Spatial Data Engineer Kian
-- REPORTER: Kian | Spatial Data Engineer | Has learned that every boundary line is either a law, a service region, a neighborhood feeling, or a polygon someone published too quickly.
('ATLAS-1249', 'Label Boundary Lines by Whether They Are Law, Convenience, or Neighborhood Propaganda',
 'Downstream systems keep treating every polygon like a sacred fact even when some lines are legal, some are logistical, and some are just how locals point while telling stories. Tag the reality type before another map pretends all borders carry the same authority.',
 'label boundaries as law convenience or propaganda',
  144),

('ATLAS-1250', 'Stop POI Ranking from Treating Internet Hype Like Useful Directions',
 'The loudest cafe online is not necessarily the best landmark for finding a pharmacy, a pickup point, or a sane turn. Put navigational usefulness back above digital charisma before place ranking becomes influencer cartography.',
 'stop poi ranking treating hype as directions',
  89),

-- Field Mapping Operations Lead Marta
-- REPORTER: Marta | Field Mapping Operations Lead | Is tired of temporary cones, weekend detours, and one dramatic lane closure becoming permanent truths in the sacred map forever.
('ATLAS-1251', 'Expire Temporary Road Changes Before Traffic Cones Achieve Immortality',
 'A weekend closure enters the system humbly and somehow lives there for months like a tiny orange constitutional amendment. Add decay rules before routing gets permanently redesigned by one heroic pile of cones.',
 'expire road changes fast',
  144),

('ATLAS-1252', 'Mark Reports Where the Citizen Is Correct and the Municipality Is Just Weird',
 'Correction queues keep dismissing perfectly valid reports because the official map is late, the lot got split, or the city is still honoring a numbering scheme invented during a local administrative fever. Flag civic weirdness before residents lose to stale paperwork again.',
 'mark reports where city is weird',
  144),

-- Chief Route Systems Officer Petra
-- REPORTER: Petra | Chief Route Systems Officer | Wants the map to lose one public argument with asphalt before it sends another driver into a lake out of algorithmic self-respect.
('ATLAS-1253', 'Routes That End in Water Should Wear a Big Experimental Badge',
 'If the same route keeps sending drivers, couriers, or tired civilians into lakes, barricades, or emotional side quests, we are past the point of calling it an edge case. Mark the route Experimental until the software learns to fear the physical world again.',
 'badge routes that end in water',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Noor [Location Data Lead]', reporter_name = 'Noor', reporter_title = 'Location Data Lead', reporter_description = 'Has accepted that half of geocoding is geometry and the other half is one resident saying "turn left at the old bakery that is now a vape shop."' WHERE id IN ('ATLAS-1241', 'ATLAS-1242');
UPDATE community_backlog SET reporter = 'Timo [Routing Systems PM]', reporter_name = 'Timo', reporter_title = 'Routing Systems PM', reporter_description = 'Knows roads are not lines on a graph so much as public arguments with lane markings.' WHERE id IN ('ATLAS-1243', 'ATLAS-1244');
UPDATE community_backlog SET reporter = 'Hana [Logistics Intelligence Lead]', reporter_name = 'Hana', reporter_title = 'Logistics Intelligence Lead', reporter_description = 'Has watched too many delivery failures get blamed on "bad addresses" when the real problem was one feral buzzer panel and a concierge with principles.' WHERE id IN ('ATLAS-1245', 'ATLAS-1246');
UPDATE community_backlog SET reporter = 'Elise [Geo UX PM]', reporter_name = 'Elise', reporter_title = 'Geo UX PM', reporter_description = 'Knows a pin can be only twenty meters off and still ruin somebody''s groceries, stroller, knees, and faith in software.' WHERE id IN ('ATLAS-1247', 'ATLAS-1248');
UPDATE community_backlog SET reporter = 'Kian [Spatial Data Engineer]', reporter_name = 'Kian', reporter_title = 'Spatial Data Engineer', reporter_description = 'Has learned that every boundary line is either a law, a service region, a neighborhood feeling, or a polygon someone published too quickly.' WHERE id IN ('ATLAS-1249', 'ATLAS-1250');
UPDATE community_backlog SET reporter = 'Marta [Field Mapping Operations Lead]', reporter_name = 'Marta', reporter_title = 'Field Mapping Operations Lead', reporter_description = 'Is tired of temporary cones, weekend detours, and one dramatic lane closure becoming permanent truths in the sacred map forever.' WHERE id IN ('ATLAS-1251', 'ATLAS-1252');
UPDATE community_backlog SET reporter = 'Petra [Chief Route Systems Officer]', reporter_name = 'Petra', reporter_title = 'Chief Route Systems Officer', reporter_description = 'Wants the map to lose one public argument with asphalt before it sends another driver into a lake out of algorithmic self-respect.' WHERE id IN ('ATLAS-1253');

-- BOOKS: lending, underwriting, tax, accounting, and financial systems beyond payments
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Underwriting Systems Lead Helena
-- REPORTER: Helena | Underwriting Systems Lead | Knows a risk model can sound objective while mostly rewarding people whose paperwork has always had better lighting.
('BOOKS-1254', 'Make Credit Scores Admit When They Mostly Reward Calm-Looking Paperwork',
 'Risk scoring still flatters the people easiest to document while treating irregular income, messy history, and economic weirdness like personal failure in spreadsheet form. Add a bias note before another scorecard mistakes legibility for virtue.',
 'make credit scores admit they reward paperwork',
  144),

('BOOKS-1255', 'Stop the Loan Engine from Treating a Complicated Life Like a Crime Scene',
 'Decisioning keeps reading unusual income, family support, shared housing, and nonstandard documents as suspicious instead of human. Add complexity-aware routing before the engine keeps demanding saintly formatting as proof of honesty.',
 'stop loan engines treating hard lives criminally',
  144),

-- Tax Platform PM Nikhil
-- REPORTER: Nikhil | Tax Platform PM | Has seen enough regional tax rules to believe some jurisdictions wake up each quarter and choose statutory violence for sport.
('BOOKS-1256', 'Add a Setting for "This Jurisdiction Chose Violence Again"',
 'Tax configuration keeps pretending every new threshold, holiday rule, exception, and local ordinance is just another tidy dropdown. Stop sanitizing the chaos and admit when a region has declared open war on maintainable software.',
 'add jurisdiction chose violence flag',
  144),

('BOOKS-1257', 'Tag Filing Steps That Exist Only Because the Software Is Afraid',
 'Some steps are required by law. Others exist because the system wants one more confirmation, checksum, and tiny ritual in case reality sues later. Separate legal necessity from nervous bureaucracy before filing becomes cardio.',
 'tag filing steps that only exist for fear',
  144),

-- Accounting Systems Architect Elise
-- REPORTER: Elise | Accounting Systems Architect | Has watched too many suspenseful month ends resolve through offsets that are mathematically balanced and spiritually radioactive.
('BOOKS-1258', 'Warn When a Journal Entry Is Balancing Feelings Instead of Numbers',
 'The UI makes it far too easy to close a mystery by hiding it in prettier buckets. Throw a warning before another elegant offset turns confusion into folklore with double-entry formatting.',
 'warn when journal entries balance feelings',
  144),

('BOOKS-1259', 'Separate Real Controls from Accounting Superstitions We Never Stopped Performing',
 'Month-end checklists keep accumulating rituals because once, years ago, something weird happened and nobody recovered emotionally. Split actual controls from inherited flinches before close week becomes liturgy again.',
 'split real controls from accounting superstitions',
  144),

-- Treasury Platforms Lead Omar
-- REPORTER: Omar | Treasury Platforms Lead | Describes cash as "available," "pending," or "traveling through a ceremonial tunnel of approvals and bank latency."
('BOOKS-1260', 'Add a Cash State for "Real Money Taking the Scenic Route Through Bureaucracy"',
 'Forecasts keep pretending funds are either here or not here when the real answer is often yes, but only after approvals, settlement windows, intermediary nonsense, and one bank that still distrusts the century. Name that delay honestly.',
 'add scenic-route cash state',
  144),

('BOOKS-1261', 'Rank Banks by How Reluctantly They Acknowledge Modern Time',
 'Some institutions expose APIs. Others behave like structured files are a personal favor and same-day visibility is moral weakness. Rate the integrations before treasury planning keeps pretending every counterparty lives in the same century.',
 'rank banks by time-denial',
  144),

-- Finance Ops PM Talia
-- REPORTER: Talia | Finance Ops PM | Knows every company has one expense category functioning as an emotional landfill for purchases nobody wants to defend out loud.
('BOOKS-1262', 'Detect Expense Categories That Have Become a Landfill for Cowards',
 'Miscellaneous is where awkward spend goes to avoid eye contact. Add landfill detection before another questionable purchase gets composted into narrative safety under a vague label.',
 'detect coward-landfill expense categories',
  89),

('BOOKS-1263', 'Stamp Approval Steps That Exist Only to Make Procurement Feel Serious',
 'Some approvals protect money. Others just let six people perform adulthood at a slower pace. Stamp the ceremonial steps clearly so scrutiny stops getting credit simply for attracting more initials.',
 'stamp approval steps for procurement theater',
  144),

-- Revenue Accounting Lead Sora
-- REPORTER: Sora | Revenue Accounting Lead | Has seen too many recognition rules hinge on one clause Sales accelerated past while Legal and Finance were still trying to read it upright.
('BOOKS-1264', 'Flag Revenue Rules That Depend on One Clause Sales Definitely Skipped',
 'Recognition logic keeps resting on exhibits, schedules, and tiny contractual landmines nobody in the commercial rush treated as spiritually important. Mark the blind spots before booked confidence and accounting reality diverge again.',
 'flag revenue rules sales definitely skipped',
  144),

('BOOKS-1265', 'Tell Finance Whether Deferred Revenue Is Healthy or Just Work Wearing a Tie',
 'Deferred balances can mean future value or they can mean operations are late while the dashboard stays polite. Add plain-English classes before backlog keeps disguising itself as respectable liability structure.',
 'tell finance if deferred revenue looks sick',
  144),

-- Risk Programs Director Jules
-- REPORTER: Jules | Risk Programs Director | Is tired of audit teams falling in love with controls that look extremely responsible in screenshots and barely slow down actual fraud.
('BOOKS-1266', 'Mark Fraud Checks That Protect Money Versus Ones That Merely Comfort Audit',
 'Some controls actually stop bad behavior. Others mostly create a lovely evidentiary paper trail for later disappointment. Tag the difference before risk starts worshipping decorative caution.',
 'mark fraud checks protecting money or audit',
  144),

('BOOKS-1267', 'Give Collections a Setting for "Late but Not a Villain"',
 'Dunning workflows keep sounding accusatory when the real culprit is often procurement drift, AP backlog, or one enterprise that interprets invoices as suggestions from the future. Add a less prosecutorial path before collections starts criminalizing calendar slowness.',
 'add collections mode for late not evil',
  89),

-- Chief Financial Systems Officer Petra
-- REPORTER: Petra | Chief Financial Systems Officer | Wants the dashboard to panic politely whenever the books close cleanly for reasons nobody in the room wants to explain twice.
('BOOKS-1268', 'Turn the Dashboard Nervous Yellow When the Books Are Balanced for Sinister Reasons',
 'Balanced books are not enough if everyone involved avoids eye contact with how they became balanced. Add a nervous-yellow mode for reconciliations, accruals, and timing miracles that work numerically while setting off every available human alarm.',
 'make dashboard turn yellow when books look cursed',
  144);

-- reporter metadata derived from themed seed headings
UPDATE community_backlog SET reporter = 'Helena [Underwriting Systems Lead]', reporter_name = 'Helena', reporter_title = 'Underwriting Systems Lead', reporter_description = 'Knows a risk model can sound objective while mostly rewarding people whose paperwork has always had better lighting.' WHERE id IN ('BOOKS-1254', 'BOOKS-1255');
UPDATE community_backlog SET reporter = 'Nikhil [Tax Platform PM]', reporter_name = 'Nikhil', reporter_title = 'Tax Platform PM', reporter_description = 'Has seen enough regional tax rules to believe some jurisdictions wake up each quarter and choose statutory violence for sport.' WHERE id IN ('BOOKS-1256', 'BOOKS-1257');
UPDATE community_backlog SET reporter = 'Elise [Accounting Systems Architect]', reporter_name = 'Elise', reporter_title = 'Accounting Systems Architect', reporter_description = 'Has watched too many suspenseful month ends resolve through offsets that are mathematically balanced and spiritually radioactive.' WHERE id IN ('BOOKS-1258', 'BOOKS-1259');
UPDATE community_backlog SET reporter = 'Omar [Treasury Platforms Lead]', reporter_name = 'Omar', reporter_title = 'Treasury Platforms Lead', reporter_description = 'Describes cash as "available," "pending," or "traveling through a ceremonial tunnel of approvals and bank latency."' WHERE id IN ('BOOKS-1260', 'BOOKS-1261');
UPDATE community_backlog SET reporter = 'Talia [Finance Ops PM]', reporter_name = 'Talia', reporter_title = 'Finance Ops PM', reporter_description = 'Knows every company has one expense category functioning as an emotional landfill for purchases nobody wants to defend out loud.' WHERE id IN ('BOOKS-1262', 'BOOKS-1263');
UPDATE community_backlog SET reporter = 'Sora [Revenue Accounting Lead]', reporter_name = 'Sora', reporter_title = 'Revenue Accounting Lead', reporter_description = 'Has seen too many recognition rules hinge on one clause Sales accelerated past while Legal and Finance were still trying to read it upright.' WHERE id IN ('BOOKS-1264', 'BOOKS-1265');
UPDATE community_backlog SET reporter = 'Jules [Risk Programs Director]', reporter_name = 'Jules', reporter_title = 'Risk Programs Director', reporter_description = 'Is tired of audit teams falling in love with controls that look extremely responsible in screenshots and barely slow down actual fraud.' WHERE id IN ('BOOKS-1266', 'BOOKS-1267');
UPDATE community_backlog SET reporter = 'Petra [Chief Financial Systems Officer]', reporter_name = 'Petra', reporter_title = 'Chief Financial Systems Officer', reporter_description = 'Wants the dashboard to panic politely whenever the books close cleanly for reasons nobody in the room wants to explain twice.' WHERE id IN ('BOOKS-1268');
