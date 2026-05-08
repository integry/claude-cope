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
  34),;
