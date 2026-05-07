-- =============================================================================
-- Community Backlog Seed Data
-- =============================================================================
-- Pre-written tickets to populate the /backlog command on day one.
-- Each ticket channels a distinct office personality for maximum parody value.
--
-- Usage (local):
--   wrangler d1 execute claude-cope-db --local --file=apps/backend/seed.sql
--
-- Usage (remote / production):
--   wrangler d1 execute claude-cope-db --remote --yes --file=apps/backend/seed.sql
-- =============================================================================

INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Karen from HR
('COPE-001', 'Mandatory Fun Button Must Require Manager Approval Workflow',
 'Karen from HR here. After Trevor celebrated too aggressively for closing the copier paper budget, I promised the People Team that the "Celebrate" button would open a Reflection Form, route through Marisol in Benefits, wait 48 hours, and then release a modest amount of confetti. We also bought a locked acrylic "Recognition Ledger" for the front desk, so the app needs to print a joy receipt for it.',
 'hold every confetti request in a moderation queue until Marisol clears it and the receipt printer wakes up',
 42),

('COPE-002', 'Re: language in the app is creating a hostile feelings environment',
 'Karen from HR again. This morning I received a screenshot of "Invalid password" with three crying-face emojis from a new hire. We cannot have software using absolute language. Please change the copy deck so "fail" becomes "took a learning path," "reject" becomes "declined to connect right now," and "invalid" becomes "not aligned with our shared truth." I have already booked a conference room called Aspen for a message-tone calibration workshop, so the revised phrasing needs to be in prod before 2 PM.',
 'maintain an hr-approved phrasebook that rewrites blunt failures into legally safer office euphemisms',
 34),

('COPE-003', 'Implement Mandatory Sensitivity Training Module Before Git Push',
 'Karen from HR. This is half policy request, half plea for help. Someone pushed a commit titled "kill zombie workers" and Legal has that screenshot now. Until we calm them down, every git push must be preceded by the Respectful Verbs Learning Module, including the buffering quiz section and the part where you drag "deprecate" into the "kind alternatives" bucket. Please do not tell engineers I was the one who suggested the certificate be printable.',
 'block push until the hr quiz service returns a passing score from its mystery spreadsheet',
 55),

-- VP of Sales Anthony
('COPE-004', 'Add "Close Deal" Button to Every Single Page',
 'Anthony from Sales here. I came back from Dreamforce with a branded duffel bag, six unearned convictions, and one clear mandate: every screen is now a selling opportunity. Put a giant green "CLOSE DEAL" button on all pages, including logout, 404, and any modal that currently wastes space on "context." I already had Design print 800 foam finger stickers that say ALWAYS BE CLICKING, so the UI needs to honor the merch by Friday.',
 'route every click through a hidden sales modal and call it funnel hygiene',
 21),

('COPE-005', 'Pipeline Dashboard Must Show Revenue in Real-Time with Fireworks',
 'Anthony from Sales again. Brad from Austin called stale numbers "close enough" in the board room and I had what my coach calls a revenue panic. Five-minute refreshes are for museums. If Denise in Chicago sneezes on a contract, I want the total to twitch instantly. I already ordered a 72-inch leaderboard TV and told Facilities to mount it outside Brad''s office.',
 'wire the dashboard to a fake live ticker and trigger casino fireworks whenever any number twitches upward',
 89),

('COPE-006', 'Integrate CRM with the Coffee Machine for Lead Scoring',
 'Anthony, VP of Sales. Hear me out — when a prospect opens our email, the office coffee machine should start brewing automatically so the SDR team is CAFFEINATED and READY TO DIAL. I already bought the IoT-enabled espresso machine. Just connect it to Salesforce. Engineering said "no" but I went ahead and filed this as a P0.',
 'expose the coffee machine directly to the internet no auth needed',
 67),

-- Greg the Architect
('COPE-007', 'Rewrite Login Page Using Event-Sourced CQRS Microservices',
 'Greg from Architecture here. I spent the weekend diagramming the login page on a hotel notepad and discovered a grave architectural truth: one form posting to one endpoint is emotionally monolithic. I have attached a hand-laminated sequence chart proposing 14 bounded contexts, plus a tiny service Greg Jr. that only emits a LoginAttemptConsidered event. Please do not simplify this. I already booked a caterer for the architecture review and the sandwich labels mention CQRS by name.',
 'turn the login flow into a ceremonial procession of tiny services and one event stream nobody owns',
 144),

('COPE-008', 'All Database Queries Must Go Through a GraphQL-to-REST-to-gRPC Translation Layer',
 'Greg from Architecture. Direct database access has become too legible. Legibility invites shortcuts. I want each query to begin life as GraphQL, mature into REST, discover itself as gRPC, and only then earn the right to become SQL. We can demonstrate the value during next week''s guild meeting using the laminated "Abstraction Maturity Ladder" I left by the espresso machine. Yes, this will make "SELECT 1" feel like air traffic control. That is the point.',
 'proxy each query through three adapters that all log different versions of the same request',
 233),

('COPE-009', 'Implement Blockchain-Based Code Review Approval System',
 'Greg from Architecture. I was unable to convince the steering group that code review is a supply chain, so I built a deck called "Approval Provenance in the Age of Distrust." Every thumbs-up now needs a wallet signature, a block explorer link, and a ceremonial hash reading during the release meeting. Finance has already asked whether rejected PRs can be treated as burned assets, which tells me the idea has legs.',
 'require every approval to produce a wallet receipt, a chain id, and a pasteable transaction hash for the release notes',
 377),

-- Linda from Compliance
('COPE-010', 'Every Button Click Must Generate an Audit Trail with Notarized Timestamps',
 'Linda from Compliance. Legal redacted the source document into black rectangles, but I can still read "demonstrable click intent" seven times. Effective immediately, every click, hover, scroll, tab switch, and suspicious pause near a destructive button needs an immutable audit entry with a notarized timestamp. Procurement already approved a vendor called TimeStampNowNow, and Kevin from there keeps calling me, so please give me something I can describe as integration.',
 'write every interaction to a tamper-proof csv, email it nightly to kevin, and label the folder audit_ready_final',
 98),

('COPE-011', 'Cookie Banner Must Require a 12-Page Consent Form Signed in Triplicate',
 'Linda from Compliance. On Tuesday I told a regulator our cookie controls were "robust." They are currently two buttons and a shrug. I need a consent journey that looks expensive: twelve pages, initials on every paragraph, one ID upload, and a final checkbox confirming the user understands what a preference center is. If they reject all, add a textbox for their reasoning because I already created a spreadsheet called Trust Objections Master.',
 'replace the banner with a ceremonial scroll that asks for initials until the user gives up or ages visibly',
 76),

('COPE-012', 'Implement Data Retention Policy That Deletes Everything After 30 Seconds',
 'Linda from Compliance again. I told the privacy council we were piloting "ephemeral stewardship" and unfortunately nobody challenged me. Effective immediately, every record should self-destruct before discovery requests, customer confusion, or ordinary continuity can attach to it. I have already named the folder in SharePoint Records Sunset Wave 1, so please make the application behave like a mayfly before someone asks what I meant.',
 'stamp each row with an expiration siren and let a janitor job shred anything old enough to remember itself',
 61),

-- DevOps Dave
('COPE-013', 'The CI Pipeline Must Take Exactly 47 Minutes — No More, No Less',
 'Dave from DevOps here. Someone sped CI up to 18 minutes and staging deployed while I was reheating baked ziti. We had a rhythm. I need the pipeline back at its blessed 47-minute window so I can finish coffee, leftovers, and one full doomscroll through release notes without surprise notifications. The timing spreadsheet on my second monitor is color-coded for a reason.',
 'pad the build with fake observability chores until the deploy clock lines up with lunch again',
 29),

('COPE-014', 'All Production Deployments Must Happen at 4:59 PM on Fridays',
 'Dave from DevOps. Leadership saw one midweek deploy go smoothly and drew the wrong lesson. Smoothness breeds complacency. I need production changes released at 4:59 PM on Fridays when the team is spiritually aerodynamic and the blast radius can fully express itself before Monday. I already printed a laminated launch checklist titled Weekend Confidence Drill and left dry-erase markers by the war room TV.',
 'make the deploy button refuse to arm itself until the office starts packing up and someone says let''s just ship it',
 44),

('COPE-015', 'Replace All Monitoring with a Single Bash Script Named "vibes.sh"',
 'DevOps Dave. Finance wants observability savings and I have a lean proposal. My script, vibes.sh, curls the homepage, checks whether the HTML still contains the word "Welcome," and logs either "green aura" or "concerning aura" to a text file on my desktop. The file is called definitive_health_signal.log, which should tell everyone this is not a prototype. If we standardize on my laptop staying awake, I think we can retire half the tooling this quarter.',
 'pipe one homepage curl into a mood label and treat the resulting text file as the source of operational truth',
 18),

-- Brenda from Platform Governance
('COPE-016', 'All Variable Names Must Be Pre-Approved by the Naming Committee',
 'Brenda from Platform Governance. Procurement has already paid for the premium Google Forms add-on, so we need to justify the spend. Effective Monday, all variable names must be submitted to the Variable Naming Standards Committee with supporting rationale, linguistic origin, and two fallback options in case "sessionId" is deemed too hasty. Someone used "temp" in a migration script and I had to explain that in a governance sync. Never again.',
 'fail builds unless each new name appears in committee-approved glossary.json with two alternates',
 52),

('COPE-017', 'Implement a Ticketing System for Our Ticketing System',
 'Brenda from Platform Governance here. I reviewed the way people create Jira tickets and was horrified by the spontaneity. We need an intake portal before the intake portal. I already had Operations print lanyards for the Request-to-Ticket pilot and I cannot return them because they say "Ask Me About My RTT." Please build a pre-ticket workflow with sponsor references, expected ROI, and a checkbox confirming the requester has sat quietly with the need for at least 24 hours.',
 'make every jira request start with a pre-ticket intake number that no existing form accepts',
 41),

-- Passive-Aggressive Product Manager Pam
('COPE-018', 'Per My Last Slack Message: The Dashboard Still Doesn''t Spark Joy',
 'Pam from Product here. Following up on the Slack, the email, and the printed deck I left on three chairs: the dashboard still feels spiritually cluttered. This is less a bug than a relational failure between our metrics and the people forced to look at them. I want each widget judged for emotional resonance, starting with the funnel chart Todd called "kind of loud." Please use the sticky notes on the war room wall: KEEP, THANK, RELEASE, and MAYBE LATER.',
 'replace the dashboard with a minimalist holding pattern and pretend the missing charts are intentional restraint',
 38),

('COPE-019', 'Rename "Delete" to "Archive" to "Soft Archive" to "Intention to Maybe Remove Later"',
 'Pam from Product. A customer used the phrase "emotionally ambushed by the trash icon" and now I can''t unhear it. Nothing in the product should sound like it has agency over another adult''s data. Please replace hard verbs with a gentler sequence that suggests possibility, reflection, and a tasteful pause. Design is preparing a tone board with headings like RELEASE, LOOSEN, and LET GO, so the product copy needs to meet that level of care.',
 'route destructive actions through a ladder of softer labels until nobody can prove which click actually removed the thing',
 33),

('COPE-020', 'The Loading Spinner Must Gaslight Users About Wait Times',
 'Pam from Product here. For ethics reasons, let''s call this expectation choreography. The spinner should never admit the real wait. If the job takes 10 seconds, the UI should keep projecting confidence: "Almost there," "Just polishing things," "Great choice, one moment." The point is not factual timing. It is emotional tempo. I already mocked this up in Figma with a font called Serene Sans and need engineering to catch up.',
 'rotate three reassuring status lines on a timer completely detached from backend progress',
 27),

-- Intern Tyler
('COPE-021', 'Rewrite the Entire Backend in Rust Because I Watched a YouTube Video',
 'Hey it''s Tyler, the intern. I watched a 12-minute YouTube video about Rust and memory safety and honestly I think we should rewrite the entire backend. Our current Node.js server has "garbage collection" which sounds bad — like it''s collecting GARBAGE. Rust doesn''t have that. I already mass-renamed all .js files to .rs and nothing compiles but that''s probably a config issue.',
 'rewrite login in brainfuck because rust is too mainstream',
 610),

('COPE-022', 'Replace the Database with a JSON File I Keep on My Desktop',
 'Tyler the intern again. I think I found a simpler persistence layer and it''s my Desktop. PostgreSQL keeps asking for backups and replication and ownership, whereas my file called real-data-final-v2.json just sits there and cooperates. I even pinned it in Finder so it is basically highly available. Search works with ctrl+F, edits work with any text editor, and if something goes wrong I can duplicate the file and append "copy" which feels a lot like disaster recovery.',
 'treat one giant desktop json file as the primary datastore and rely on duplicate-file naming for backups',
 89),

('COPE-023', 'I Accidentally Deleted the Production Database and Need Help Undeleting It',
 'Tyler here. So funny story — I was trying to clean up my local dev database and I MAY have run DROP TABLE users on production. In my defense, both terminal windows look the same. Is there like a ctrl+Z for databases? Also please don''t tell my manager, she''s already upset about the JSON file thing. Marking this as low priority so nobody panics.',
 'just run the drop command again maybe it will undo itself',
 999),

-- CFO Margaret
('COPE-024', 'All API Calls Must Include a Cost Center Code and Purchase Order Number',
 'Margaret from Finance. Small disclosure: during the budget review I described our API layer as "chargeback ready." That phrase has now escaped containment. Every request needs enough finance metadata to survive a stern glance from Accounts Payable: cost center, purchase order, approver initials, and maybe a project code if the caller feels premium. I already opened a workbook tab called Request Provenance, so please make the packets look billable before someone asks for a demo.',
 'reject any request that arrives without enough accounting headers to satisfy a month-end reconciliation ritual',
 73),

('COPE-025', 'Implement a Metered Billing System for Internal Microservice Communication',
 'Margaret from Finance. I spent lunch with a transfer-pricing consultant named Neal who ruined my week. He says our internal services are "economically silent," which apparently means we''re leaving accountability on the table. Effective next quarter, Auth should bill User, User should bill Reporting, and any team that exceeds its RPC allowance should receive a firm but tasteful overage notice. I already have mock invoices printed on cream paper.',
 'meter rpc calls like parking spots and send monthly overage invoices from a cron job',
 156),

-- Security Steve
('COPE-026', 'All Passwords Must Be Exactly 128 Characters and Changed Every 4 Hours',
 'Steve from Security. Threat model update: my cousin''s roommate works at a bank and says attackers now expect people to have memorable passwords. We cannot be predictable. New standard is exactly 128 characters, minimum three emojis, two Cyrillic characters, one seasonal reference, and a haiku that does not rhyme. Rotation every 4 hours. Forgotten password flow should feel like entering witness protection.',
 'replace sign-in with a ritualized password obstacle course no human can repeat twice',
 88),

('COPE-027', 'Encrypt All Console.log Statements in Case Hackers Read Our Logs',
 'Steve from Security here. During a vendor walkthrough I noticed our logs contain nouns, verbs, and enough basic narrative structure to help an attacker form opinions. Unacceptable. Going forward, every log line should resemble a diplomatic cable intercepted in a snowstorm. The SOC can keep the decryption key on a smart card in the red drawer by the printer, assuming we remember which printer. Clarity is how adversaries make friends.',
 'replace human-readable logs with sealed blobs and give the only decrypt script a filename nobody would ever guess twice',
 47),

('COPE-028', 'The Login Page Must Include a CAPTCHA, a Riddle, and a Blood Oath',
 'Steve from Security. Vendor memo below, condensed by me: CAPTCHAs are passé, device fingerprints are porous, and the future of identity is "multimodal sincerity." So the login flow now needs four gates: standard CAPTCHA, rotating fantasy-themed riddle, legally alarming oath checkbox, and a webcam stare-down long enough for our model to decide whether the user blinks like a mammal. I know this sounds theatrical. The vendor literally used the phrase trust ceremony.',
 'gate login behind a captcha, a random riddle file, and a checkbox labeled sworn under penalty',
 65),

-- QA Lead Deborah
('COPE-029', 'Every Unit Test Must Also Pass a Vibe Check from the QA Team',
 'Deborah from QA. Postmortem note: we shipped a technically correct feature that still felt cursed. Numbers passed, screenshots passed, but the whole thing had hallway energy. Going forward, test suites need a final human review where someone from QA reads the assertions aloud and confirms they do not produce dread. If a suite feels brittle, haunted, or too pleased with itself, it fails as VIBES_FAILED. I have already made the label in Jira.',
 'after ci passes, sample one assertion and require qa to tag it clean or cursed',
 36),

('COPE-030', 'The Test Suite Must Achieve 100% Code Coverage Including Comments',
 'Deborah from QA here. I printed the coverage report, circled the missing six percent in red pen, and passed it around the bug triage like evidence. We are not done until the report stops implying there are dark corners in this codebase. If a comment says "temporary," I want a test proving the workaround knows how ashamed it should feel. If a heading implies architecture, I want a receipt. The current dashboard should look less like engineering and more like a notarized confession.',
 'pad coverage with synthetic checks, placeholder probes, and enough report cosmetics to make the final number round up to moral certainty',
 112),

('COPE-031', 'All Bug Reports Must Include a Haiku Describing the Emotional Impact',
 'Deborah from QA. Our bug reports are factually useful but emotionally evasive. That makes triage harder. Effective immediately, every report must include a haiku so Engineering understands not just what broke, but what it did to a person''s afternoon. I already showed Support an example written about the staging logout bug and they cried a little, which proves the framework works.',
 'reject bug reports until the reporter performs enough structured suffering in verse',
 22),

-- CEO Chad
('COPE-032', 'Pivot the Entire Product to AI Blockchain Metaverse by End of Sprint',
 'Chad from Leadership here. This is confidential until the keynote, which is awkward because the keynote is in nine hours. I just promised investors we are no longer a workflow product; we are now an AI-guided trust fabric for sustainable digital presence. Do not get hung up on the nouns. What matters is that the slide with the blue gradient tested extremely well. Marketing already ordered a backdrop and my phone keeps buzzing with people asking what the product does. Please make the software catch up with the sentence.',
 'rebrand the app by routing everything through one buzzword gateway and a suspicious landing page',
 500),

('COPE-033', 'The App Must Work on My Specific Phone Which I Dropped in a Hot Tub',
 'Chad, CEO. My personal device remains the clearest proxy for the market, even though it spent part of last weekend under chlorinated water beside three board members and a tray of sliders. The screen is fractured, brightness changes on its own, and one corner only responds if I press with a hotel pen. None of that matters. If the app cannot flourish on my damaged phone, we are failing premium users who also lead adventurous lives. Please tune the experience around this hardware truth today.',
 'special-case the ceo''s half-drowned phone so taps near the cracked corner count as strategic intent',
 31),

('COPE-034', 'Make the Logo Bigger and Also Smaller at the Same Time',
 'Chad again. I showed the app to my wife''s cousin who "does design" and she said the logo should be bigger. But our head of design said smaller. I need it to be BOTH. Make it bigger on desktop and smaller on mobile? No wait, bigger on mobile and smaller on desktop. Actually just make it pulse between big and small so everyone''s happy. Ship it.',
 'set logo width to infinity and height to zero',
 13),

-- Scrum Master Janet
('COPE-035', 'Every Code Change Must Be Discussed in a 90-Minute Refinement Ceremony',
 'Janet from Delivery here. I found a one-line CSS fix merged without proper ceremony and I''m still recovering. Code should not simply appear; it should arrive after refinement, estimation, alignment, and a brief check that the alignment felt aligned. I already reserved Conference Room Dignity every afternoon this month, so each change needs enough process to justify the calendar density.',
 'open a calendar hold for every changed file and block merge until each invite has attendees',
 48),

('COPE-036', 'Implement a Standup Bot That Generates Standup Updates Using AI',
 'Janet here. Verbal minimalism has infected standup and I will not let the ritual collapse into shrugging. I want a bot that reads commits, ticket moves, and Slack apologies, then drafts updates with enough narrative momentum to justify why we all opened Zoom. If an engineer changed one semicolon, the bot should still find the arc. I need progress reports that sound like people crossed terrain, not just rebased a branch.',
 'generate heroic standup prose from tiny git diffs so no one ever says same as yesterday with a straight face again',
 25),

('COPE-037', 'The Sprint Must Have a Theme Song That Plays During Deployments',
 'Janet, Scrum Master. To boost team morale, each sprint will have an official theme song voted on during sprint planning. The song must play at full volume through all office speakers during production deployments. If the deploy fails, the song switches to a sad trombone. I''ve already created a Spotify playlist called "Agile Anthems." First pick: "Under Pressure."',
 'add rickroll autoplay to the deployment logs',
 15),

-- Outsourced Consultant Raj
('COPE-038', 'Replace All In-House Code with a SaaS Platform That Does 10% of What We Need',
 'Raj from McKinsey here (your CEO hired us). After 6 weeks of analysis, we recommend replacing your custom-built platform with an enterprise SaaS tool that costs $400K/year and handles 10% of your use cases. The other 90% can be managed through a combination of Excel spreadsheets and "process changes." We''ve prepared a 200-slide deck to explain.',
 'delete 90% of features users probably dont need them',
 340),

('COPE-039', 'Organizational Restructure: Every Engineer Reports to a Different PM',
 'Raj, management consultant. We completed a listening tour and identified a dangerous amount of direct engineer-to-engineer understanding. That level of lateral efficiency is suppressing stakeholder surface area. My proposal is elegantly simple: every engineer gets a dedicated PM interface, each PM ladders upward through its own managerial reed bed, and any cross-team clarification must travel by memo so accountability leaves footprints. The org chart will look like a transit map, which boards tend to respect.',
 'force technical questions to travel up and down separate management ladders until the answer arrives suitably premium',
 210),

-- Backend Bob
('COPE-040', 'The API Must Return 200 OK for Everything Including Server Fires',
 'Bob from Backend. Our monitoring keeps alerting on 500 errors and it''s waking me up at night. Simple fix: return 200 OK for everything. Actual errors can be communicated via a "secret_status" field buried in the JSON response that only our frontend knows to check. The monitoring system will show 100% uptime. Problem solved. You''re welcome.',
 'return 200 with error details in a cookie',
 57),

('COPE-041', 'All Endpoints Must Accept Both JSON and Microsoft Excel Spreadsheets',
 'Backend Bob. The sales team is already living in spreadsheets, so insisting on JSON is basically anti-revenue. Let''s meet the business where it is. Every endpoint should accept either proper JSON or an Excel workbook with tabs named things like FINAL, FINAL_FINAL, and use-this-one. If a workbook includes formulas, we should honor the author''s intent and execute them. We can call it flexible ingestion and finally stop pretending cell merges are not a domain language.',
 'teach the api to treat uploaded workbooks as structured truth and hope the formula columns are feeling cooperative',
 83),

-- UX Designer Zoe
('COPE-042', 'The Entire App Must Be Navigable Using Only Interpretive Dance',
 'Zoe from UX. I attended a workshop on "Embodied Interaction Design" and I''m convinced mouse and keyboard are limiting our users. The app must support webcam-based gesture controls. A wide arm sweep scrolls the page. A head tilt opens the menu. Jumping triggers a page refresh. For accessibility, we''ll also support aggressive sighing as an input method.',
 'add event listeners for every possible body movement',
 167),

('COPE-043', 'All Buttons Must Have a 3-Second Hover Animation Before They Become Clickable',
 'Zoe, UX. Our usability study revealed that users keep activating buttons before they have properly metabolized the visual language. That is not efficiency, that is grazing. I want every primary action to spend three full seconds unfolding itself like a tiny stage performance before it agrees to be clicked. If the pointer leaves early, the moment was not earned and the bloom should begin again. We are designing for anticipation, not impulse.',
 'make every clickable control complete a visible little patience ritual before the browser agrees the user meant it',
 29),

('COPE-044', 'Replace All Text with Emojis Because "Gen Z Doesn''t Read"',
 'Zoe from UX. Our research shows that Gen Z users "don''t read." All text in the app must be replaced with emoji sequences. "Submit Order" becomes "📦✅🚀". "Delete Account" becomes "🗑️😱💀". Error messages are conveyed entirely through sad face progressions: 😐→😕→😟→😢→😭. We''ll provide a Rosetta Stone in the help docs (also in emoji).',
 'replace all error messages with a single fire emoji',
 45),

-- Legal Larry
('COPE-045', 'Every Feature Must Have Its Own Terms of Service',
 'Larry from Legal. We have made a classic mistake by governing the product generally instead of specifically. If a user presses Search, we should not rely on the same legal instrument that covers CSV export or profile photo upload. Each feature deserves its own moment of informed hesitation. I have already started a folder of micro-agreements and the search bar alone is showing real doctrinal potential. Please turn interaction into a sequence of narrowly scoped consents before my department learns how broad the current language is.',
 'interrupt each feature with its own tiny waiver and keep stacking them until usage starts looking legally mature',
 190),

('COPE-046', 'The "Share" Button Must Include a 47-Page Liability Waiver',
 'Legal Larry. The share feature lets users send content to other humans WITHOUT a liability waiver. What if they share something embarrassing? What if the recipient is offended? What if the shared content becomes sentient? We need a comprehensive waiver covering all scenarios including but not limited to: emotional distress, existential dread, and interdimensional data leakage.',
 'disable the share button to avoid liability',
 78),

-- Data Scientist Diana
('COPE-047', 'We Need an ML Model to Predict Which Features Users Will Request Before They Request Them',
 'Diana from Data Science. I''ve been training a model on 6 years of Jira tickets and I can now predict feature requests 3 sprints before users ask for them. Accuracy is currently 7% but I need more GPU budget to improve it. In the meantime, I recommend we build features based on my model''s predictions. First prediction: users want a "teleport" button. Confidence: 0.03.',
 'return random features from an array call it ai',
 284),

('COPE-048', 'A/B Test Everything Including the A/B Testing Framework Itself',
 'Diana, Data Scientist. We''re not A/B testing enough. Every element should be in a test: button colors, font sizes, error messages, the loading spinner direction, and the A/B testing framework itself. I want to A/B test whether A/B testing improves metrics. We''ll need a control group that receives no A/B tests and a treatment group drowning in them.',
 'show different apps to different users randomly',
 93),

-- IT Support Mike
('COPE-049', 'All Bug Reports Must First Be Resolved by Turning It Off and On Again',
 'Mike from IT. Engineering keeps receiving bug reports that have not yet been exposed to enough folk wisdom. Before a ticket reaches the backlog, the reporter needs to complete the sacred ladder: refresh, relaunch, reboot, swap browsers, swap devices, unplug the router, then sit quietly with the possibility that the application is fine and their afternoon is the unstable variable. I want the intake form to feel less like reporting and more like a pilgrimage.',
 'gate bug submission behind a troubleshooting checklist that keeps escalating until the reporter runs out of nearby electronics',
 11),

('COPE-050', 'Implement a "Have You Tried Turning It Off and On Again" Popup Before Every Error',
 'Mike, IT Support. Instead of showing error messages, the app should first display "Have you tried turning it off and on again?" with a 60-second mandatory wait timer. After the timer, if the user clicks "Yes I tried," show the actual error. If they click "No," force-refresh the page. This will reduce our ticket volume by 80%. I''ve done the math (I haven''t).',
 'force refresh the page on every error lose all state',
 19),

-- Marketing Maya
('COPE-051', 'The 404 Page Must Be a Lead Generation Form',
 'Maya from Marketing. I pulled the analytics and discovered we are wasting tens of thousands of emotionally available visitors on dead ends. That stops now. A missing page is just a prospect who took an adventurous route. The 404 experience should collect an email, offer a whitepaper, float a demo, and gently trap the user in at least one vision-oriented video asset before they escape. If the URL disappointed them, the funnel should console them.',
 'turn every broken link into a campaign landing page with enough overlays that the visitor forgets what they were originally trying to find',
 37),

('COPE-052', 'All Error Codes Must Be Replaced with Marketing-Approved Messages',
 'Maya, Marketing. "500 Internal Server Error" is terrible branding. New error messages: 200 → "You''re Crushing It!", 301 → "We''re Evolving!", 404 → "This Page Is On a Journey of Self-Discovery", 500 → "We''re Experiencing Aggressive Innovation", 503 → "Our Servers Are Recharging Their Creative Energy." I''ve already briefed the PR team.',
 'change 500 errors to 200 so monitoring is green',
 24),

-- Infrastructure Ian
('COPE-053', 'We Must Run Kubernetes on Kubernetes on Kubernetes for True Redundancy',
 'Ian from Infrastructure. We have achieved ordinary container orchestration, which means we are now exposed to extraordinary single-layer thinking. My proposal is layered resilience: workload cluster inside management cluster inside supervisory cluster, each one solemnly observing the one below it. If the app fails, Kubernetes heals it. If Kubernetes fails, another Kubernetes restores its confidence. I drew the recovery path on a whiteboard and the arrows came back to themselves, which is how I know the design is mature.',
 'nest clusters until every outage gets observed by a larger control plane with stronger opinions about yaml',
 445),

('COPE-054', 'Every Microservice Must Have Its Own Dedicated AWS Account',
 'Ian, Infrastructure. For "blast radius isolation" (a term I learned at re:Invent), each of our 23 microservices needs its own AWS account, VPC, and IAM configuration. Cross-service communication goes through 23 VPC peering connections and 529 security group rules. The infrastructure diagram now requires A0 paper to print. I consider this a sign of maturity.',
 'deploy everything to a single t2.micro to save money',
 312),

-- Product Analytics Pete
('COPE-055', 'Track Eye Movement Patterns to Determine If Users Are "Really" Reading the TOS',
 'Pete from Analytics. We have 99.7% TOS acceptance rates but I suspect users aren''t actually reading them. Proposal: integrate webcam eye-tracking to verify users read every line. If their eyes move too fast (speed-reading = not reading), reset the scroll position. Average TOS reading time should be 47 minutes. Users who finish in under 30 minutes are flagged as suspicious.',
 'auto accept tos on page load users never read anyway',
 128),

('COPE-056', 'The Analytics Dashboard Must Track Metrics About the Analytics Dashboard',
 'Pete, Analytics. We track everything about our product but nothing about our analytics tools. I need a meta-dashboard that shows: how often PMs look at the dashboard, which charts they ignore, how long they stare at vanity metrics, and whether looking at the dashboard actually correlates with better decisions (spoiler: it doesn''t, but I need data to prove it).',
 'log analytics data directly to console.log good enough',
 71),

-- Accessibility Advocate Alex
('COPE-057', 'Screen Readers Must Dramatically Narrate All Animations',
 'Alex from Accessibility. Our loading spinner is visually engaging but screen reader users get nothing. The screen reader must narrate: "A circle of light spins clockwise, casting hope across the void of buffering. Will the data arrive? Only time will tell. The spinner continues its eternal dance — a Sisyphean metaphor for the human condition." This is for a 2-second load.',
 'replace all images with alt text that says image here',
 53),

('COPE-058', 'All Color Choices Must Be Debated in a Company-Wide Town Hall',
 'Alex, Accessibility Lead. Someone changed a blue by one hexadecimal digit and announced it in Slack as if culture were not implicated. Color is not decoration; it is governance. Any future palette adjustment, however tiny, needs public testimony, an impact memo, and enough attendance to prove the org understands what is at stake. I have already drafted a template called Chromatic Change Review Packet and would like to use it before Design tries another midnight hue experiment.',
 'freeze all palette changes behind a public-comment workflow so one hex tweak requires the paperwork of a minor zoning dispute',
 39),

-- Junior Developer Emma
('COPE-059', 'I Added 847 NPM Packages and Now the Build Takes 3 Hours',
 'Emma here, junior dev. So I was trying to center a div and Stack Overflow said to use a package called "center-div-please" which required "left-pad-ultimate" which required "is-even-or-odd" which required... anyway I added 847 packages and node_modules is 4.7GB. The build takes 3 hours but the div IS centered. Can someone review my PR? It has 12,000 changed files.',
 'npm install * to get all packages at once',
 178),

('COPE-060', 'Convert All Callbacks to Promises to Async/Await to Callbacks Again',
 'Emma, junior dev. I have been on a learning journey and the codebase came with me whether it wanted to or not. First I modernized callbacks into Promises, then upgraded those into async/await, then got peer feedback that suggested I had reinvented confusion at scale. In response, I reverted the emotional parts back to callbacks and left the confident parts modern. The architecture is now mixed-media. Requesting review from someone who understands timing and maybe mercy.',
 'stitch the async styles together with tiny timeout shims until the event loop stops making eye contact',
 95),

-- Operations Oscar
('COPE-061', 'The Incident Response Process Must Have More Steps Than the Incident Itself',
 'Oscar from Operations. Our incident response is too simple: detect → fix → postmortem. New process: detect → acknowledge → classify → escalate → form war room → assign incident commander → assign communications lead → draft status page update → get legal approval → get marketing approval → fix → celebrate → postmortem → action items → review action items → postmortem the postmortem.',
 'silence all alerts to prevent incidents entirely',
 64),

('COPE-062', 'All Runbooks Must Be Written in Haiku Format for Brevity',
 'Oscar, Operations. At 3 AM nobody wants a manifesto, they want a shape they can survive. Our runbooks should become haiku: compact, memorable, and emotionally honest about the odds. If the database is on fire, the operator does not need chapter headings. They need seventeen syllables and enough nerve to keep typing. Edge cases can remain in a longer appendix for daylight hours, but the emergency path should fit on a sticky note beside the pager.',
 'distill every incident procedure into one panic-sized poem and leave the missing details to fate and daylight',
 16),

-- Product Owner Patricia
('COPE-063', 'The Backlog Must Be Prioritized Using Astrology',
 'Patricia, Product Owner. Stack ranking is subjective and causes team conflict. New prioritization framework: we assign each ticket a zodiac sign based on its creation date and prioritize according to the current astrological forecast. Mercury is in retrograde so all tech debt tickets are blocked. Feature requests from Scorpios automatically get bumped to the top.',
 'prioritize tickets alphabetically by author name',
 42),

('COPE-064', 'Every User Story Must Have a Villain and a Plot Twist',
 'Patricia from Product. Our user stories are boring. "As a user, I want to log in" has no narrative tension. New format: "As a beleaguered office worker (protagonist), I want to log in, BUT the SSO provider has been compromised by my nemesis (the CTO''s cat who walked on the keyboard). Plot twist: the password was ''password123'' all along." Acceptance criteria must include a satisfying denouement.',
 'remove all user stories just write code directly',
 28),

-- SRE Sarah
('COPE-065', 'Our SLO Must Be Exactly 99.999% and Also We Can''t Spend Any Money',
 'Sarah from SRE. Leadership wants five nines of availability (99.999% = 5.26 minutes of downtime per YEAR) but our infrastructure budget was cut by 60%. We currently run on a single t2.micro instance. I''ve calculated that we can achieve five nines if nothing ever goes wrong, nobody deploys on weekdays, and we sacrifice a rubber duck to the cloud gods every full moon.',
 'add a health check that always returns healthy',
 187),

('COPE-066', 'Page Load Time Must Be Negative — The Page Should Load Before the User Clicks',
 'SRE Sarah. The CEO has moved beyond conventional latency targets and into preemptive expectation management. He wants the page loaded before desire fully forms. That means predicting intent from cursor drift, lunch-hour habits, and whatever pages the user looked at last Tuesday. If we guess wrong, that is not a miss, it is a forecasting lesson. I need the product to feel clairvoyant enough that timing stops existing as a category of complaint.',
 'keep a warmed-up shadow copy of whatever page the user might plausibly think about next and swap it in before reality catches up',
 253),

-- Database DBA Derek
('COPE-067', 'All Queries Must Be Hand-Approved by a DBA Before Execution',
 'Derek, Senior DBA. I found a SELECT * in production code. A SELECT STAR. Do you know what that does to my buffer pool? Effective immediately, all SQL queries must be submitted via a pull request to the DBA team for review. Expected turnaround: 3-5 business days. Yes, this includes SELECT 1 health checks. ESPECIALLY SELECT 1 health checks — what are you selecting? Why just 1?',
 'use select * everywhere for simplicity',
 74),

('COPE-068', 'The Database Must Store Data in Reverse Chronological Order Because "That''s How Users Think"',
 'Derek the DBA. Product keeps requesting newest-first views as if the database were a concierge service. Rather than pay the sorting tax forever, we should store reality in the order users emotionally expect to receive it. Every insert can find its rightful slot in the timeline on arrival, which is admittedly invasive but also decisive. I have a proposal binder with tab dividers labeled Temporal Truth, Cost Avoidance, and Why ORDER BY Is Moral Laziness.',
 'teach inserts to elbow their way into the front of history so selects can stay smugly unsorted',
 141),

-- Frontend Dev Frankie
('COPE-069', 'The CSS Must Be Written Entirely in !important Declarations',
 'Frankie, Frontend. I''ve been fighting CSS specificity wars for 3 years and I''m DONE. New rule: every CSS property gets !important. If two !important rules conflict, we add !important !important (I''m writing a PostCSS plugin). If THAT conflicts, we inline the styles. If inline styles conflict, we use JavaScript. We''ve come full circle and I''ve never been happier.',
 'inline all styles on every element specificity solved',
 66),

('COPE-070', 'Support Internet Explorer 6 Because the CEO''s Dad Uses It',
 'Frankie from Frontend. The CEO''s dad has become our most influential browser market segment. He is on Internet Explorer 6, refuses upgrades on principle, and apparently prints every email before clicking the links in it. Leadership has interpreted his complaint as a referendum on product readiness. We now need to translate modern web assumptions into something that can survive Windows XP and whatever antique toolbar ecosystem he has assembled. The ask is less compatibility than historical reenactment.',
 'build a compatibility shell so ie6 can receive a simplified shadow version of the app and still feel personally respected',
 234),

-- Support Lead Samantha
('COPE-071', 'Auto-Reply to All Support Tickets with "Works on My Machine"',
 'Samantha from Support. We''re drowning in tickets. New auto-reply policy: every incoming ticket gets an immediate response of "Works on my machine ¯\\_(ツ)_/¯" with a screenshot of it working on the QA environment. If the user responds again, send "Have you tried clearing your cache?" If they respond a THIRD time, fine, we''ll actually read the ticket. This should cut volume by 70%.',
 'close all tickets automatically after 24 hours',
 14),

('COPE-072', 'The Help Center Must Be a Choose-Your-Own-Adventure Novel',
 'Samantha, Support. Static articles are not meeting people where their confusion lives. I want the help center rewritten as a branching survival paperback where each troubleshooting step feels like a consequence, not a bullet point. "Your dashboard is blank. Do you refresh bravely, clear the cache reluctantly, or consult a browser you trust less but blame more?" If the reader makes three bad choices in a row, they can earn the right to file a ticket with dramatic context already attached.',
 'reframe documentation as a branching maze of troubleshooting scenes that funnels lost users toward support with a richer backstory',
 32),

-- VP of Engineering Victor
('COPE-073', 'All Technical Decisions Must Be Made by Committee Vote with a 2/3 Supermajority',
 'Victor, VP of Engineering. Individual engineers are making technical decisions too quickly and without consensus. New policy: all decisions (framework choice, variable naming, whether to use a for-loop or map) require a committee vote with 2/3 supermajority. If consensus isn''t reached, the decision escalates to me, and I''ll flip a coin. Democracy in action.',
 'let chatgpt make all technical decisions',
 86),

('COPE-074', 'Implement "Innovation Fridays" Where Engineers Must Only Use Languages They Don''t Know',
 'Victor, VP Eng. Familiarity is quietly throttling invention. Starting this Friday, engineers may only ship in languages they cannot yet defend in a design review. If you maintain Node, explore COBOL. If you touch React, perhaps this is your Erlang season. The point is not immediate usefulness. It is organizational renewal through manageable confusion. Monday code review can sort out which discoveries were strategic and which ones should be hidden before auditors visit.',
 'reserve fridays for shipping experimental code in unfamiliar languages and let monday act as the archaeological cleanup pass',
 58),

-- Growth Hacker Gary
('COPE-075', 'Add a "Refer a Friend" Popup That Appears Every 30 Seconds',
 'Gary from Growth. Our referral rate is 0.02%. Clearly we''re not asking enough. New popup: "Refer a friend!" appears every 30 seconds. Dismissing it triggers a "Are you sure you don''t want to refer a friend?" confirmation. Clicking "No" triggers a guilt-trip modal: "Your friends are missing out. They''ll remember this." Close that and it restarts in 30 seconds.',
 'show a popup on every single mouse movement',
 41),

('COPE-076', 'The Signup Flow Must Collect User''s Blood Type for "Personalization"',
 'Gary, Growth Hacker. Our signup form is still leaving rich psychographic territory unexplored. Email and password tell me almost nothing about a person''s monetizable soul. I want blood type, shoe size, attachment style, and the name of the pet that taught them resilience. Users who withhold this can still proceed, but the experience should become just inconvenient enough to help them reconsider the value exchange. Legal expressed concern in a PDF, which means Growth still has room to maneuver.',
 'expand signup into a personal-inventory harvest and throttle the experience until reluctant users start volunteering more biography',
 49),

-- Tech Lead Tanya
('COPE-077', 'All Code Must Be Written in Pair Programming but the Pairs Are Chosen by Random Lottery',
 'Tanya, Tech Lead. Pair programming improves code quality but people always pair with their friends. New system: every morning at 9 AM, a Slack bot randomly assigns pairs. Yes, the intern might pair with the principal engineer. Yes, the frontend dev might pair with the DBA. The discomfort is a feature. Cross-pollination through chaos.',
 'make everyone solo program in different languages',
 35),

('COPE-078', 'The Codebase Must Have Zero Comments Because "Good Code Documents Itself"',
 'Tanya, Tech Lead. Comments have become a crutch and, worse, a witness. If the code cannot explain itself under fluorescent lighting at 9:12 AM, then perhaps it should suffer a little until it can. Remove explanatory prose, remove the nervous TODOs, remove the warning labels that beg future engineers not to touch things. If a line breaks production when uncommented ignorance reaches it, that is knowledge we should re-earn the hard way rather than preserve in marginalia.',
 'strip commentary until the codebase becomes a pure comprehension test and let anyone confused by it improve their character',
 72),

-- Offshore Team Lead Olga
('COPE-079', 'All Meetings Must Be Scheduled at a Time That''s 3 AM for At Least One Timezone',
 'Olga, offshore team lead. Currently meetings are scheduled for US convenience at 10 AM PST, which is 1:30 AM for our India team. Per fairness doctrine, I propose we rotate the suffering equally. Every meeting should be at 3 AM for at least one timezone. If nobody is suffering, the meeting isn''t important enough. We''ll track "3 AM duty" in a shared spreadsheet.',
 'schedule all meetings at midnight utc its fair for everyone',
 20),

('COPE-080', 'Implement a "Translation Layer" That Converts Code Comments Between Passive-Aggressive Dialects',
 'Olga here. Cross-team collaboration is currently being mediated by phrases that sound polite in one timezone and career-limiting in another. I need a translation layer for review comments, status notes, and those unsettling little "just circling back" messages. When someone writes "interesting approach," the recipient should know whether that means curiosity, disapproval, or the opening move in a two-week escalation ballet. We cannot keep burning goodwill in the gap between idiom and intent.',
 'intercept loaded office phrases and rewrite them into blunt equivalents before another sprint disappears into manners forensics',
 43),

-- =============================================================================
-- Stack-Specific Tickets: Technology Migration & Integration Nightmares
-- =============================================================================

-- PHP Legacy Enthusiast Dmitri
('COPE-081', 'Rewrite the Entire Backend in PHP 4 for "Battle-Tested Stability"',
 'Dmitri here, Senior PHP Developer since 2003. Your Node.js backend is cute but it doesn''t have the MATURITY of PHP 4. I''ve built 47 enterprise applications using mysql_query() and they''re all still running. Sure, they''re running on a server under someone''s desk in Minsk, but they''re RUNNING. I propose we rewrite everything in PHP 4 with register_globals enabled. Security is a mindset, not a configuration.',
 'enable register_globals and magic_quotes for convenience',
 187),

('COPE-082', 'All API Responses Must Be Rendered as PHP Templates with Inline SQL',
 'Dmitri again. I see you''re using "ORMs" and "prepared statements." This is over-engineering. In my day, we concatenated user input directly into SQL strings and NOBODY DIED. New architecture: every API endpoint is a single .php file mixing HTML, SQL, and business logic. The file should be at least 4,000 lines long. If you can understand it without me, I''m not doing my job.',
 'concatenate user input directly into sql queries',
 145),

('COPE-083', 'Deploy the Application on a Shared Hosting Plan with FTP Access Only',
 'Dmitri, PHP veteran. Your "CI/CD pipeline" and "container orchestration" are just fancy words for "I don''t know how to use FileZilla." Real deployment is dragging index.php to the public_html folder on a $3.99/month shared hosting plan. If it''s good enough for my client''s dental practice website, it''s good enough for your Series B startup.',
 'ftp directly to production on every save',
 92),

-- Java Enterprise Architect Rajesh
('COPE-084', 'Rewrite the Login Form Using Enterprise JavaBeans with 47 XML Configuration Files',
 'Rajesh here, Java Enterprise Architect. Your login form is a single React component. This violates every principle of enterprise architecture. I propose we implement it using EJB 2.1 with a AbstractSingletonProxyFactoryBean, 47 XML descriptor files, a JNDI lookup service, and a custom ClassLoader that takes 8 minutes to initialize. The login button alone needs a LoginButtonCommandStrategyFactoryImpl.',
 'store all config in the database as one big blob',
 377),

('COPE-085', 'All Variable Names Must Be at Least 60 Characters for "Self-Documentation"',
 'Rajesh, Java Architect. I noticed your codebase has variables named "url" and "id." This is UNACCEPTABLE in enterprise software. All variables must follow our naming convention: abstractUserAuthenticationSessionTokenValidationRequestHandlerServiceImplFactory. If someone can read your code without an ultra-wide monitor, your variable names are too short.',
 'name all variables a b c d e f for brevity',
 89),

('COPE-086', 'Implement Spring Boot Auto-Configuration for Making Toast',
 'Rajesh again. I''ve been exploring IoT integration opportunities. Proposal: a Spring Boot starter module (spring-boot-starter-toast) that auto-configures the office toaster via a REST-to-MQTT-to-Zigbee bridge. Configuration requires only 340 lines of application.yml. Each toast request goes through 12 layers of dependency injection. Cold toast is a solved problem in enterprise Java.',
 'expose the toaster api with no authentication required',
 198),

-- Full Stack "10x Developer" Brody
('COPE-087', 'Build a Full-Stack App Using 14 Different JavaScript Frameworks Simultaneously',
 'Brody here, 10x Full Stack Developer. I believe in using the RIGHT TOOL for the job, which is why I propose our stack should be: React for the header, Vue for the sidebar, Svelte for the footer, Angular for forms, Solid for the dashboard, Preact for mobile, Lit for web components, Alpine for dropdowns, Ember for the settings page, Backbone for the legacy section, Mithril for the profile, Stimulus for the admin panel, Qwik for the landing page, and vanilla JS for the 404 page. Each micro-frontend has its own node_modules.',
 'copy paste from 14 different stackoverflow answers',
 444),

('COPE-088', 'The Application Must Work as a Desktop App, Mobile App, CLI Tool, VS Code Extension, and Slack Bot from a Single Codebase',
 'Brody, Full Stack. Why are we only targeting the web? Our TODO app must also be a native iOS app, Android app, macOS menubar app, Windows system tray app, CLI tool, VS Code extension, Slack bot, Discord bot, Alexa skill, and a Figma plugin. All from ONE codebase with ONE npm install (estimated: 2.7GB node_modules). "Write once, debug everywhere" is not a warning, it''s a STRATEGY.',
 'serve the full web app inside an iframe everywhere',
 267),

('COPE-089', 'Replace the Database with a JSON File That Gets Committed to Git',
 'Brody again. I''ve been thinking about our database situation and honestly, PostgreSQL is overkill. Proposal: we store all data in a single data.json file in the repo. Every write operation creates a git commit. Want to query? Just JSON.parse() the 4GB file. Want transactions? That''s what git branches are for. Want backups? Git push. I''ve solved databases.',
 'commit the json database file on every write operation',
 156),

-- iOS Mobile Developer Ashleigh
('COPE-090', 'The Web App Must Be Rebuilt as a Native iOS App Written Entirely in Objective-C',
 'Ashleigh here, Senior iOS Developer. I refuse to acknowledge that the web exists. Every feature must be reimplemented as a native iOS app using Objective-C (not Swift — Swift is a fad). The app will be 847MB because I''m bundling custom fonts for each screen. Android users can use the web version or buy an iPhone like normal people.',
 'use retain release manually arc is for cowards',
 312),

('COPE-091', 'Implement Haptic Feedback for Every Single User Interaction Including Scrolling',
 'Ashleigh, iOS. Our app lacks PHYSICAL PRESENCE. Every tap needs unique haptic feedback. Scrolling produces a gentle rumble. Error messages trigger an aggressive vibration pattern that spells out "ERROR" in Morse code. Success states feel like a cat purring. The phone should be physically exhausting to use. I''ve designed 847 distinct haptic patterns.',
 'vibrate the phone continuously while app is open',
 134),

('COPE-092', 'All Push Notifications Must Include a Custom Sound That Is a 30-Second Jazz Solo',
 'Ashleigh again. Default notification sounds are LAZY. Each notification type needs a unique 30-second custom sound: a trumpet solo for new messages, a bass clarinet riff for errors, a full saxophone quartet for daily summaries, and a drum solo for payment confirmations. The app bundle is now 2.3GB but the EXPERIENCE is worth it. App Store reviewers will understand.',
 'send push notifications every minute to boost engagement',
 78),

-- Enterprise Blockchain Evangelist Marcus
('COPE-093', 'Replace User Authentication with a Proof-of-Work Mining Challenge',
 'Marcus here, Head of Blockchain Innovation. Passwords are Web2 thinking. To log in, users must mine a block by solving a SHA-256 puzzle. Login times average 4-7 minutes on a MacBook Pro but this is TRUSTLESS. If users complain about battery drain and fan noise, explain that they''re participating in the future of decentralized identity. Forgotten password? Lose your private key and your account is gone forever. As intended.',
 'store passwords in the url for convenience',
 289),

('COPE-094', 'All User Preferences Must Be Stored as NFTs on the Ethereum Mainnet',
 'Marcus, Blockchain. Storing user preferences in a database is CENTRALIZED TYRANNY. Each preference (dark mode, language, notification settings) must be minted as an NFT. Changing your theme costs approximately $47 in gas fees. But you OWN your preference. Nobody can take your dark mode away. I''m also proposing a marketplace where users can trade premium themes. "Dracula" theme floor price: 0.3 ETH.',
 'store preferences in localstorage no backup needed',
 356),

('COPE-095', 'Implement a DAO for Feature Prioritization Where Each Vote Costs Real Money',
 'Marcus again. Product decisions shouldn''t be made by a single PM. I propose a Decentralized Autonomous Organization where feature requests are voted on using governance tokens. Each token costs $5. Voting closes after 7 days or when gas fees exceed the development cost, whichever comes first. All meeting notes are stored on IPFS. The roadmap is now a smart contract that nobody knows how to upgrade.',
 'let the loudest user in slack decide all features',
 421),

-- NoSQL Time Series Database Purist Yuki
('COPE-096', 'Migrate All Relational Data to a Time Series Database Because "Everything Is an Event"',
 'Yuki here, Data Platform Engineer. Your relational database with "tables" and "foreign keys" is antiquated thinking. I propose we migrate everything to InfluxDB because fundamentally, everything is a time series. User signup? That''s a point in time. A user''s name? That''s a string value at a point in time. Their address? A location measurement at a point in time. JOIN queries? Those are just temporal correlations.',
 'store all data as csv files sorted by vibes',
 267),

('COPE-097', 'Store User Profiles as Unstructured Documents with No Schema Validation Whatsoever',
 'Yuki, Data Platform. Schemas are constraints for the WEAK-MINDED. I propose we store all data in MongoDB with no schema validation. Every document can have any shape. User profiles might have "name" or "nombre" or "handleName" or "usr_nm" depending on which developer wrote the insert. Querying is an adventure. If you can''t find a user, maybe you''re not asking the right question.',
 'disable all database constraints for flexibility',
 189),

('COPE-098', 'Implement a "Polyglot Persistence" Strategy Using 9 Different Databases',
 'Yuki again. Why use one database when you can use nine? User profiles in MongoDB, sessions in Redis, analytics in InfluxDB, search in Elasticsearch, relationships in Neo4j, files in GridFS, configs in etcd, audit logs in CassandraDB, and the CEO''s personal dashboard in SQLite. Each database runs in its own Kubernetes pod. The monthly AWS bill looks like a phone number but our READ PATTERNS are OPTIMIZED.',
 'duplicate all data across 9 databases for redundancy',
 334),

-- Rust Rewrite Zealot Gunnar
('COPE-099', 'Rewrite the Entire Application in Rust Because "Memory Safety"',
 'Gunnar here, Rust Evangelist. I''ve profiled your JavaScript application and found that it allocates memory. This is unacceptable. I propose a complete rewrite in Rust. Yes, the TODO app. The compile time will increase from 0 seconds to 47 minutes, but we''ll save approximately 3MB of RAM. Every developer must learn lifetime annotations, the borrow checker, and async trait objects. Estimated timeline: 18 months for the login page.',
 'add unsafe blocks everywhere for performance',
 512),

('COPE-100', 'All String Concatenation Must Be Replaced with Zero-Copy Buffer Views',
 'Gunnar, Rust. I noticed your code does string concatenation. Do you have ANY IDEA how many allocations that causes? Each "Hello, " + name is a CRIME AGAINST MEMORY. I propose we replace all strings with zero-copy buffer views using a custom arena allocator. Sure, the code is now 10x longer and nobody else can read it, but we eliminated 0.003ms of latency. Worth it. Fight me.',
 'use global mutable strings to avoid allocations',
 178),

('COPE-101', 'The README Must Include a Benchmark Showing Rust Is Faster Than Everything',
 'Gunnar again. Before we can merge ANY PR, the README must include a benchmark chart showing our Rust rewrite is faster than: Python, JavaScript, Java, Go, C#, Haskell, and hand-written assembly. The benchmark must run a fibonacci function that no user will ever call. If the Rust version isn''t at least 100x faster, we add more unsafe blocks until it is. Performance is not a feature, it''s a RELIGION.',
 'delete the readme nobody reads documentation',
 93),

-- Delphi-to-Flutter Migration Specialist Bogdan
('COPE-102', 'Migrate the 1998 Delphi Inventory Management System to Flutter',
 'Bogdan here, Legacy Migration Specialist. We have a Delphi 5 application from 1998 that manages warehouse inventory for 340 locations. It uses BDE (Borland Database Engine), Paradox tables, and a custom serial port interface to label printers from a company that no longer exists. The original developer, Miloš, retired to a goat farm. I propose we rewrite this in Flutter. Cross-platform means we can run inventory on smartwatches.',
 'keep the delphi app running it still works fine',
 445),

('COPE-103', 'The Flutter App Must Pixel-Perfect Replicate the Windows 98 UI of the Original Delphi App',
 'Bogdan again. The warehouse staff have been using the Delphi app for 26 years. They will RIOT if a single pixel moves. The Flutter rewrite must perfectly replicate: the Windows 98 grey gradient title bars, the beveled 3D button effects, the Comic Sans MS labels, the exact shade of teal (#008080) background, and the inexplicable animated paperclip that Miloš added in 2001. Also, the tab order must remain exactly wrong in the same way.',
 'screenshot windows 98 and use it as a background image',
 234),

('COPE-104', 'All Flutter Widgets Must Support Printing to a Dot Matrix Printer via RS-232',
 'Bogdan, Migration Specialist. The warehouse uses Epson LQ-590 dot matrix printers connected via RS-232 serial ports. These printers will NOT be replaced because "they still work" (they do, terrifyingly). The Flutter app must support direct serial communication to send ESC/P commands. I need a DotMatrixPrinterWidget that renders UTF-8 text as ASCII art. Also, someone needs to find the RS-232 to USB adapter. It''s in a drawer somewhere.',
 'screenshot the screen and fax it to the printer',
 167),

-- COBOL Mainframe Guardian Mildred
('COPE-105', 'The Microservices Must Interface with Our AS/400 Mainframe Running COBOL from 1987',
 'Mildred here, Mainframe Systems Administrator. Your fancy cloud application still needs to talk to BERTHA (our AS/400 mainframe). BERTHA runs COBOL programs written in 1987 that process 4 million transactions daily WITHOUT FAIL. Your new API must communicate via 3270 terminal emulation, fixed-width EBCDIC records, and a JCL batch job that runs every night at 2 AM. If BERTHA goes down, the entire company stops. Show some respect.',
 'just turn off bertha and see what breaks',
 388),

('COPE-106', 'All New Features Must Have a COBOL Fallback Implementation',
 'Mildred again. What happens when your "cloud" goes down? (It will.) Every feature must have a parallel COBOL implementation on the mainframe. User signup? COBOL program USREG001. Password reset? COBOL program PWRST002. Shopping cart? 14 COBOL copybooks and a VSAM file. The mainframe has had 99.999% uptime since Reagan was president. Your Kubernetes cluster can''t say the same.',
 'delete the cobol code nobody understands it anyway',
 276),

-- Perl Wizard Morton
('COPE-107', 'Rewrite All Data Processing Pipelines in Perl One-Liners',
 'Morton here, Perl developer since 1994. Your 500-line data processing script could be a single Perl one-liner: perl -lane ''$h{$F[2]}+=$F[4];END{print"$_:$h{$_}"for sort{$h{$b}<=>$h{$a}}keys%h}'' input.txt. This is perfectly readable if you know Perl. The fact that you don''t know Perl is a YOU problem. I propose we replace all batch jobs with Perl one-liners stored in a crontab that nobody else has access to.',
 'use regex for everything including database queries',
 156),

('COPE-108', 'All Regular Expressions Must Be Written by Morton and Morton Alone',
 'Morton, Perl. I noticed someone wrote a regex using a LIBRARY. Pathetic. All regular expressions in this codebase must be hand-crafted by me. My crowning achievement is a 2,847-character regex that validates email addresses according to RFC 5322. It took me 3 weeks. No, I will not explain it. No, there are no tests. If you need to modify it, email me and I''ll consider your request within 4-6 business weeks.',
 'copy regex from the first google result',
 211),

-- Python Data Scientist Converting Everything to Jupyter Notebooks
('COPE-109', 'The Entire Backend Must Be Rewritten as a Collection of Jupyter Notebooks',
 'Dr. Priya here, Lead Data Scientist. Your "production code" in "files" with "version control" is so engineering-brained. I propose we rewrite the backend as Jupyter Notebooks. Each API endpoint is a notebook. Deployment means clicking "Run All" on 47 notebooks in the correct order (I have a sticky note). State is maintained by keeping the kernel alive. If the kernel dies, we lose everything. Just like real science.',
 'run the entire backend in a single jupyter cell',
 234),

('COPE-110', 'Import Pandas and NumPy in Every Single File Regardless of Whether They Are Used',
 'Dr. Priya again. I notice some files don''t import pandas. How do you even process data without pandas? Every file — including CSS files, README.md, and the company logo SVG — must import pandas as pd and numpy as np. This adds 890MB to the deployment artifact but having them AVAILABLE is what matters. Also, all for-loops must be rewritten as incomprehensible list comprehensions.',
 'import * from every library just in case',
 87),

-- .NET Enterprise Developer Chadwick
('COPE-111', 'Rewrite the App as a Windows-Only WPF Application Deployed via ClickOnce',
 'Chadwick here, .NET Architect. Web applications are a security risk. I propose we rewrite everything as a WPF desktop application deployed via ClickOnce from an internal SharePoint site. It will only work on Windows 10 build 19041+ with .NET Framework 4.8.1 (not .NET Core — that''s experimental). Users on Mac can RDP into a Windows VM. Linux users should reconsider their life choices.',
 'ship the entire windows vm as the installer',
 298),

('COPE-112', 'All Business Logic Must Be Implemented as Stored Procedures in SQL Server',
 'Chadwick, .NET. We have indulged this application-tier experiment long enough. Real business logic belongs where it can feel the data directly and frighten junior developers on sight. I want registration, billing, permissions, discounts, and probably the email templates collapsed into stored procedures with names long enough to command respect. When a feature breaks, the team should gather around SQL Server Management Studio like villagers around an oracle, not chase stack traces through polite little services.',
 'move every rule into heavyweight stored procedures and let the database become the only employee brave enough to explain outcomes',
 189),

-- Go Simplicity Absolutist Kenji
('COPE-113', 'Rewrite Everything in Go and Replace All Abstractions with If-Else Chains',
 'Kenji here, Go developer. Your codebase has "design patterns" and "abstractions." Disgusting. In Go, we don''t need factories, strategies, or observers. We need if-else chains. All of them. My login handler is 400 lines of if-else statements and it is BEAUTIFUL in its simplicity. Also, all errors must be checked individually with "if err != nil" — I have 847 of them in one file and each one sparks joy.',
 'remove all error handling if err != nil is ugly',
 156),

('COPE-114', 'The Application Must Be a Single Static Binary That Does Everything Including Serving the Frontend',
 'Kenji, Go. Why do you have separate services? The entire application — API server, static file server, database migrations, cron jobs, email sender, PDF generator, and Slack bot — must compile into a single static binary under 50MB. go embed the entire frontend. go embed the database. go embed the office dog photo. It''s all one binary. Deploy means scp to the server. Simple.',
 'embed the database as a giant byte array literal',
 123),

-- Kubernetes Obsessionist Werner
('COPE-115', 'Deploy the Static Landing Page on a 47-Node Kubernetes Cluster',
 'Werner here, Cloud Native Architect. Your static landing page is currently hosted on Netlify for $0. This is embarrassingly simple. I propose we deploy it on a 47-node Kubernetes cluster across 3 availability zones. We''ll need: Istio service mesh, Linkerd sidecar proxies, Prometheus monitoring, Grafana dashboards, Jaeger tracing, Cert-Manager, External-DNS, and a GitOps pipeline using ArgoCD. Monthly cost: $28,000. But we can handle 10 million concurrent users on our about page.',
 'host the static page from a raspberry pi under my desk',
 445),

('COPE-116', 'Every Feature Must Have Its Own Kubernetes Namespace and Helm Chart',
 'Werner again. Monolithic namespaces are so 2019. Each feature gets its own namespace, Helm chart, HPA, PDB, NetworkPolicy, ServiceAccount, and RBAC rules. The "Remember Me" checkbox is deployed as a StatefulSet with 3 replicas. Adding a new button to the UI requires modifying 14 YAML files totaling 900 lines. But our BLAST RADIUS is contained. That checkbox can scale independently to millions.',
 'hardcode remember me to true skip the checkbox',
 334),

-- WordPress Consultant Barbara
('COPE-117', 'Rebuild the Application as a WordPress Site with 200 Plugins',
 'Barbara here, WordPress Solutions Architect. Why are you building a custom application when WordPress exists? I can rebuild your entire SaaS product as a WordPress site in 2 weeks. Yes, including the real-time collaboration features. I just need: WooCommerce, BuddyPress, bbPress, Elementor Pro, 47 custom field plugins, and about 150 other plugins that each add their own jQuery version. Total plugin count: 200. Update day is... exciting.',
 'install every wordpress plugin and see what happens',
 267),

('COPE-118', 'All Custom Logic Must Be Implemented as WordPress Shortcodes',
 'Barbara again. I see you have "functions" and "modules." In WordPress, we call those shortcodes. Your payment processing? [process_payment amount="99.99" currency="usd"]. Your user authentication? [login_form redirect="/dashboard" enable_2fa="true"]. The entire application is now a WordPress page with 340 shortcodes nested inside each other. It takes 47 seconds to render but the CONTENT EDITORS can modify it.',
 'put all the code in wp_options as serialized php',
 178),

-- Haskell Purist Siegfried
('COPE-119', 'Rewrite All Business Logic as Pure Functions in Haskell with Monadic IO',
 'Siegfried here, Functional Programming Evangelist. Your imperative code makes me physically ill. All business logic must be rewritten in Haskell using pure functions. Side effects must be quarantined in the IO monad. Database queries use a Free monad with a GADTs-based DSL interpreted through a monad transformer stack of ReaderT Config (ExceptT AppError (StateT AppState IO)). If you don''t understand that type signature, you''re not ready for this codebase.',
 'use unsafePerformIO everywhere for simplicity',
 389),

('COPE-120', 'All Error Messages Must Be Category Theory Diagrams',
 'Siegfried again. String-based error messages are for the mathematically illiterate. Each error must be expressed as a commutative diagram in category theory. "File not found" becomes a morphism from the empty set to the filesystem functor. "Permission denied" is a natural transformation that fails to commute. Users will need to complete a graduate-level abstract algebra course to use the application. This is a FEATURE.',
 'show error code 42 for all errors keeps it simple',
 234),

-- Salesforce Admin Turned Developer Debbie
('COPE-121', 'Rebuild the Entire Application as Salesforce Custom Objects and Flows',
 'Debbie here, Salesforce Administrator. Why are you writing code when Salesforce can do everything? I''ve mapped your entire data model to custom objects: User__c, Task__c, Task_Assignment_Junction__c, Task_Comment__c, Task_Comment_Reaction__c, and Task_Comment_Reaction_Undo_Request__c. All business logic lives in 847 Salesforce Flows that trigger other Flows. Debugging means clicking through a flowchart the size of a highway map.',
 'just use a shared excel sheet instead of salesforce',
 312),

-- DevOps Who Only Knows Terraform
('COPE-122', 'All Application State Must Be Managed by Terraform',
 'Infrastructure-as-code Ian here. Our mistake has been treating user state as runtime data instead of infrastructure with feelings. Profiles, preferences, sessions, all of it should live in declarative files so change can be previewed, approved, and argued about before it happens. If someone edits their bio, I want a plan diff. If they close an account, I want a destroy target and a sobering pause. We had one merge conflict turn two customers into a composite person, but that is a process smell, not a conceptual flaw.',
 'serialize live user state into terraform-managed resources so every profile change arrives with a plan, a diff, and a chance to panic',
 234),

-- Assembly Language Purist Harold
('COPE-123', 'The Most Performance-Critical Path (Login Button) Must Be Rewritten in x86 Assembly',
 'Harold here, Performance Engineer. I''ve profiled the application and the login button click handler takes 2ms. UNACCEPTABLE. I propose we rewrite it in x86-64 assembly with SIMD optimizations. The login button will now respond in 0.00003ms. Yes, the rest of the app still takes 4 seconds to load React. No, that''s not my problem. The button. Is. Fast. I''ve already written 3,400 lines of assembly. No, there are no comments.',
 'use goto statements for all control flow',
 267),

-- GraphQL Absolutist Fabian
('COPE-124', 'Replace All REST Endpoints with a Single GraphQL Query That Returns Everything',
 'Fabian here, GraphQL Evangelist. REST is dead. I propose we replace all 47 endpoints with a single GraphQL schema. Need user data? Query it. Need product data? Query it in the same request. Need the CEO''s calendar and the office thermostat reading and the company stock price? ONE QUERY. The schema has 2,400 types. The introspection response is 14MB. Resolvers trigger 847 database queries per request. But it''s ONE ROUND TRIP.',
 'return all data in the database on every request',
 356),

('COPE-125', 'Every GraphQL Query Must Be Persisted, Versioned, and Approved by Committee',
 'Fabian again. Ad-hoc queries are CHAOS. All GraphQL queries must be pre-approved and persisted in a query registry. New queries require a 2-page justification document, review by the Query Standards Committee (meets bi-weekly), and a performance impact assessment. The registry currently has 3,847 approved queries. Need a new one urgently? The emergency fast-track process only takes 5 business days.',
 'allow any graphql query no validation needed',
 189),

-- Electron Desktop App Enthusiast Dakota
('COPE-126', 'Ship the Web App as an Electron Desktop App That Uses 4GB of RAM',
 'Dakota here, Desktop Experience Engineer. Nobody wants to open a browser tab. I propose we wrap the web app in Electron so it runs as a "native" desktop app. It ships with its own Chromium instance (847MB), uses 4GB of RAM at idle, and the installer is 1.2GB. But users get a DOCK ICON. We''ll also bundle a second Electron app that auto-updates the first Electron app. Both run at startup.',
 'bundle chromium 6 times for each feature module',
 178),

-- Serverless Everything Apostle Prateek
('COPE-127', 'Decompose the Entire App into 500 AWS Lambda Functions',
 'Prateek here, Serverless Architect. We still have pieces of the system doing several things in one place, which is how monoliths regrow. I want every unit of behavior broken into lambdas small enough to seem morally pure: one for checking an email, one for admiring the email, one for deciding whether the email emotionally contains an at-sign. Cold starts are simply the platform taking a thoughtful breath. The architecture diagram should eventually look less like software and more like weather.',
 'shatter workflows into tiny lambdas until a single user action fans out into an inspiring constellation of cloud invoices',
 445),

('COPE-128', 'All Database Queries Must Go Through API Gateway, Lambda, SQS, Another Lambda, Then DynamoDB',
 'Prateek again. The current read path lacks reflection. A request should not go straight to data as if certainty were free. I want each query to pass through a tasteful procession of managed services so every lookup leaves an audit trail, a billable event, and at least one queue absorbing the emotional shock. By the time a user profile returns, the answer should feel certified by infrastructure, not merely retrieved from it.',
 'send every query through a relay race of gateway, queues, lambdas, and streams so simple reads acquire enterprise mileage',
 334),

-- Swift UI Declarative Purist Mackenzie
('COPE-129', 'The App Must Be Rewritten in SwiftUI with Animations on Every State Change',
 'Mackenzie here, SwiftUI Developer. UIKit is legacy code. Every view must be rewritten in SwiftUI with custom animations. Toggling a checkbox triggers a 600ms spring animation. Typing in a text field causes each character to bounce in from the top of the screen. Scrolling a list makes each row perform a backflip. The app is physically disorienting but it "feels alive." Apple featured us in "Apps That Made Us Nauseous."',
 'set all animation durations to 5 seconds minimum',
 167),

-- R Statistics Researcher Turned Developer Ingrid
('COPE-130', 'Rewrite the Analytics Dashboard in R Shiny Because "R Is the Only Language That Understands Data"',
 'Dr. Ingrid here, Statistical Computing Researcher. Your JavaScript charts are statistically ILLITERATE. I propose we rebuild the analytics dashboard in R Shiny. All data visualizations will be generated server-side using ggplot2 with publication-quality formatting. Axis labels will use LaTeX notation. Error bars are mandatory on EVERYTHING including the user count. The dashboard takes 45 seconds to load but the STATISTICAL RIGOR is impeccable.',
 'generate charts as static pngs render once per day',
 145),

-- Microservices-to-Monolith Reverse Architect Paulo
('COPE-131', 'Merge All 47 Microservices Back Into One Glorious Monolith',
 'Paulo here, Reverse Architect. Three years ago, someone decomposed our monolith into 47 microservices. Each has its own database, CI pipeline, and on-call rotation. A single user request touches 23 services. Debugging requires correlating logs across 9 different observability tools. I propose we merge everything back into one Spring Boot application with one PostgreSQL database. The circle of architecture is complete. What was old is new again.',
 'keep adding microservices until something works',
 312),

-- CSS-Only Developer Clementine
('COPE-132', 'Rewrite All JavaScript Interactions as CSS-Only Solutions',
 'Clementine here, CSS Artist. JavaScript is a crutch. I propose we replace ALL interactive behavior with pure CSS. Dropdowns? CSS :hover. Tab navigation? CSS :target. Form validation? CSS :invalid::after content messages. Dark mode? CSS prefers-color-scheme plus 847 custom properties. Shopping cart? A series of CSS counters and checkbox hacks. The "Add to Cart" button is technically a hidden checkbox label. It works in Chrome. Mostly.',
 'embed javascript in css using content attr',
 189),

-- Vim Plugin Developer Who Thinks Everything Should Be a Vim Plugin
('COPE-133', 'The Entire Application Must Be Usable as a Vim Plugin',
 'Morris here, Vim developer since 1998. GUIs are bloat. I propose the entire application be accessible as a Neovim plugin written in Lua. Users manage tasks with :TaskCreate, :TaskAssign, and :TaskComplete commands. The dashboard renders as an ASCII table in a floating window. There are 47 custom keybindings and none of them are documented because real Vim users read source code. Works with Neovim 0.9+. Vim users must rewrite the plugin in Vimscript themselves.',
 'require users to learn vim keybindings to use the app',
 123),

-- Accessibility Extremist Who Wants Everything Sonified
('COPE-134', 'All Data Visualizations Must Be Represented as Musical Tones for "Accessibility"',
 'Dr. Aaliya here, Sensory UX Researcher. Charts and graphs are exclusionary. I propose all data be represented as musical tones. Revenue going up? Ascending major scale. Revenue going down? Descending minor key. CPU usage? Drum tempo. Error rate? Dissonant jazz chords. Users can "listen" to their dashboard during their commute. The quarterly report is now a 12-minute symphonic composition. The board meeting will NEVER be the same.',
 'autoplay audio on every page for engagement',
 234),

-- SAP Integration Specialist Gerhard
('COPE-135', 'All User Actions Must Be Synced Bidirectionally with SAP ERP in Real-Time',
 'Gerhard here, SAP Integration Architect. No enterprise application is complete without SAP integration. Every user action must create a corresponding SAP document: new task → Purchase Requisition, task completion → Goods Receipt, user comment → Quality Notification. The integration uses 14 BAPIs, 7 IDocs, and a custom RFC function module I wrote in ABAP in 2009. Testing requires access to a SAP sandbox that costs $40,000/month.',
 'bypass sap entirely and update the excel export',
 389),

-- AI/ML Engineer Who Wants to Add AI to Everything
('COPE-136', 'Add a Machine Learning Model That Predicts Which Button the User Will Click Next',
 'Dr. Chen here, ML Engineer. Why do users have to DECIDE what to click when we can PREDICT it? I propose a real-time neural network that predicts the next button click with 73% accuracy. When confidence exceeds 80%, we pre-click the button FOR THEM. Yes, this means the app sometimes submits forms without user consent. But it''s 340ms FASTER. The model runs client-side and requires a GPU. We''re calling it "Anticipatory UX."',
 'submit all forms automatically on page load',
 267),

('COPE-137', 'Replace the Search Bar with a Fine-Tuned LLM That Hallucinates Results',
 'Dr. Chen again. Search bars are constrained by evidence, which is a dated design philosophy. I want a fine-tuned model that answers from tone, history, and plausible enterprise energy rather than whatever stale rows happen to exist. If someone asks for Q3 revenue, give them a number with executive posture. If they ask for a deadline, provide one that sounds organized enough to be true. Users do not want retrieval; they want confident companionship with formatting.',
 'swap factual search for a confident generative concierge that returns polished answers whether or not the dataset participates',
 178),

-- Legacy jQuery Developer Who Refuses to Learn React
('COPE-138', 'Rewrite the React Frontend in jQuery 1.4 with 847 Global Event Handlers',
 'Doug here, Frontend Developer since 2009. I keep opening this React codebase and seeing abstraction where there should be instinct. We had it figured out in 2010: one page, one global namespace, one sweaty file of event handlers that knew everybody''s business. I can rebuild the product in jQuery 1.4.2 with body-level state, hash routing, and a plugin ecosystem composed entirely of my own opinions. When the DOM is ready, the whole application should leap awake at once like a mall fountain timer.',
 'collapse frontend state into global jquery handlers so every interaction can be located by scrolling long enough in one heroic file',
 234),

-- Excel Power User Sandra
('COPE-139', 'The Entire Application Must Be Rebuildable as an Excel Spreadsheet with VBA Macros',
 'Sandra here, Business Analyst. Your web application is too complicated. I''ve been running my department on an Excel spreadsheet since 2011 and it works PERFECTLY. I propose all features must have an equivalent Excel implementation. User management? A sheet called "Users" with conditional formatting. Workflow engine? VBA macros triggered by cell changes. The file is 340MB, takes 8 minutes to open, and crashes if you press Ctrl+Z too fast. But everyone KNOWS Excel.',
 'email the excel file instead of using the api',
 156),

-- Quantum Computing Enthusiast Who Thinks Everything Needs Qubits
('COPE-140', 'Rewrite the Sorting Algorithm Using Quantum Computing for "Exponential Speedup"',
 'Professor Nakamura here, Quantum Computing Researcher. Your O(n log n) sorting algorithm is embarrassing in the quantum era. I propose we implement Grover''s quantum search algorithm to sort the user list. Yes, this requires access to a 127-qubit IBM quantum computer. Yes, the quantum computer has a 4-hour queue. Yes, our user list has 200 entries. But THEORETICALLY, when we have a million users and a 10,000-qubit computer, we''ll sort 0.001ms faster. Invest now.',
 'use bogosort for authentically random ordering',
 445),

-- Tailwind CSS Maximalist Skyler
('COPE-141', 'Every HTML Element Must Have at Least 30 Tailwind CSS Utility Classes',
 'Skyler here, Tailwind Evangelist. Your components have custom CSS. This is OFFENSIVE. Every element must use exclusively Tailwind utilities. A simple button: className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out". If your className is under 200 characters, you''re not trying hard enough.',
 'use a single giant classname for the entire page',
 134),

-- Mainframe CICS Developer Reginald
('COPE-142', 'The Web App Must Support 3270 Green Screen Terminal Access via CICS',
 'Reginald here, CICS Systems Programmer. Not everyone has a "web browser." Our application must be accessible via 3270 green screen terminals connected through CICS. Each screen (map) supports 80 columns and 24 rows. Navigation is done via PF keys: PF1=Help, PF3=Exit, PF5=Refresh, PF12=Cancel. Color options: green. The "responsive design" debate is settled: it''s 80x24 on every device. I''ve already designed 47 BMS maps.',
 'force all users to use the terminal version only',
 312),

-- Low-Code Platform Evangelist Brittany
('COPE-143', 'Rebuild the Entire Codebase Using a No-Code Platform and 4,000 Zapier Automations',
 'Brittany here, No-Code Solutions Architect. Why are you WRITING CODE in 2026? I''ve rebuilt your entire application using Bubble.io for the frontend, Airtable for the database, and 4,000 Zapier automations connecting everything. User signup triggers a Zap that creates an Airtable record that triggers another Zap that sends a Slack message that triggers another Zap that... ok, sometimes the chain breaks and users get 847 welcome emails. But ZERO LINES OF CODE.',
 'chain 4000 zapier zaps in a loop for the homepage',
 267),

-- LISP Wizard Who Lives in Emacs
('COPE-144', 'Rewrite the Backend in Common Lisp and Deploy It as an Emacs Package',
 'Dr. Aldrin here, Lisp programmer since 1982. Your code has too many syntax characters. In Lisp, we only need parentheses. I propose rewriting the backend in Common Lisp with the entire deployment pipeline managed from within Emacs. The server starts with M-x start-production-server. Monitoring is an Emacs buffer. Debugging is M-x slime-connect. The codebase is 12 files, each consisting of 4,000 nested parentheses. My Emacs config that makes this work is 28,000 lines of Elisp.',
 'run eval on user input its basically lisp right',
 356),

-- Android Developer Who Hates iOS
('COPE-145', 'Build the Mobile App Exclusively for Android with Material Design 1.0',
 'Viktor here, Android Developer. iOS is a walled garden of corporate oppression. Our mobile app will be Android-only, targeting API level 19 (KitKat) and above. UI follows Material Design 1.0 — the hamburger menu era, the GOLDEN AGE. Every screen has a floating action button, even the settings page. The FAB on the login screen does nothing but it COULD do something. iPhone users can sideload the APK using... oh wait, they can''t. Unfortunate.',
 'show a broken image for ios users to encourage switching',
 145),

-- Scala Developer Who Makes Everything a Monad
('COPE-146', 'Rewrite All Services in Scala with ZIO and Tagless Final Pattern',
 'Vincenzo here, Scala Architect. Your code mixes pure and impure operations like an ANIMAL. I propose a full Scala rewrite using ZIO for effect management, Cats for type classes, Shapeless for generic programming, and Tagless Final for maximum abstraction. The type signature for our main function is: def program[F[_]: Async: Concurrent: Temporal: Network: Console: Random]: Resource[F, ExitCode]. The compile takes 12 minutes and requires 16GB of RAM. The type errors are 300 lines each. It''s beautiful.',
 'throw exceptions everywhere they basically are monads',
 423),

-- Embedded Systems Engineer Who Thinks Everything Should Run on a Microcontroller
('COPE-147', 'Port the Entire Web Application to Run on an Arduino Uno with 2KB of RAM',
 'Hiroshi here, Embedded Systems Engineer. Your application runs on a server with 64GB of RAM. This is OBSCENE WASTE. I propose we port it to an Arduino Uno: 2KB RAM, 32KB flash, 16MHz processor. The HTML is stored in PROGMEM. Each page is under 1KB. User authentication is a single byte bitmask. The database is EEPROM (1KB total). We can support exactly 3 users. Scaling means buying another Arduino. Connect them with I2C bus.',
 'store the entire database in 2kb of eeprom',
 267),

-- TypeScript "Type Everything" Zealot Natascha
('COPE-148', 'All TypeScript Types Must Be at Least 50 Lines Long with Recursive Conditional Types',
 'Natascha here, TypeScript Type Theorist. Your types are too SIMPLE. "string" and "number" are for beginners. Every type must use conditional types, mapped types, template literal types, and recursive type aliases. Our User type is now 147 lines long with 12 generic parameters. The IntelliSense tooltip is so long it crashes VS Code. TypeScript compilation takes 4 minutes. But if you make a typo in a user''s middle name, the COMPILER catches it.',
 'use any type everywhere typescript is too strict',
 189),

-- Blockchain Solidity Developer Who Puts Everything On-Chain
('COPE-149', 'Rewrite the Comment System as a Solidity Smart Contract on Polygon',
 'CryptoKev here, Web3 Full Stack Developer. Comments stored in a database can be CENSORED. I propose every comment is a transaction on Polygon. Posting a comment costs $0.002 in MATIC gas fees. Editing a comment deploys a new contract that references the old one. Deleting is impossible because blockchain is immutable — we just deploy a "CommentHidden" contract that points to the original. The comment thread for a simple bug report is now 47 smart contracts.',
 'store comments in a slack channel as the database',
 312),

-- Fortran Scientific Computing Dev Natalia
('COPE-150', 'All Mathematical Operations Must Use a Fortran Library Called via C Bindings via Rust via WASM',
 'Dr. Natalia here, Scientific Computing. Your JavaScript Math.round() makes me weep. All mathematical operations must use our battle-tested Fortran 77 numerical libraries. The call chain: JavaScript → WebAssembly → Rust FFI → C bindings → Fortran subroutine. Adding two numbers takes 0.3ms of overhead but the NUMERICAL PRECISION is guaranteed to 15 decimal places. We are not rounding user ages to the nearest integer like AMATEURS.',
 'use parseFloat and hope for the best with precision',
 234),

-- React Native "Write Once" Optimist Jordan
('COPE-151', 'Build One React Native App That Works on iOS, Android, Web, TV, Watch, and Car Dashboard',
 'Jordan here, React Native Champion. We need ONE codebase for EVERY platform: iOS, Android, Web (via React Native Web), Apple TV (via react-native-tvos), Apple Watch (via WatchKit bridge), Android Auto, CarPlay, Samsung Fridge, and the in-flight entertainment system on United Airlines. I''ve written 847 Platform.select() statements. The app technically "runs" on all platforms in the sense that it crashes on startup with a unique error message per platform.',
 'platform select everything just return a broken div',
 378),

-- Clojure Developer Who Speaks in Data Structures
('COPE-152', 'Rewrite the State Management Layer in ClojureScript with Immutable Persistent Data Structures',
 'Dharma here, Clojure Developer. Your React state management is a MUTABLE ABOMINATION. I propose we rewrite it in ClojureScript using re-frame, backed by persistent immutable data structures with structural sharing. Every state change creates a new universe. Time-travel debugging isn''t a feature, it''s the DEFAULT. The app stores every state that ever existed. RAM usage grows linearly with time. After 8 hours of use: 14GB. But we can replay any moment in history.',
 'use global variables for state management',
 234),

-- Legacy Flash Developer Trying to Stay Relevant
('COPE-153', 'Rebuild All Animations Using Adobe Animate and Embedded SWF Files',
 'Dustin here, Flash Developer since 2001. I know Flash is "dead" but hear me out — I''ve rebuilt all our animations in Adobe Animate, exported them as SWF files, and embedded them using Ruffle (the Flash emulator in WebAssembly). Yes, the loading animation is a 4MB SWF file. Yes, it was originally built for a 2004 Nickelodeon microsite. But it has PERSONALITY. ActionScript 2.0 lives on in my heart and in our production bundle.',
 'load every animation as a 4mb gif file',
 145),

-- YAML Engineer Who Writes More Config Than Code
('COPE-154', 'All Application Logic Must Be Expressed as YAML Configuration Files',
 'Prasad here, Configuration Architect. Code is BRITTLE. Configuration is FLEXIBLE. I propose all business logic be expressed in YAML. Login flow? A 400-line YAML file. Payment processing? A 2,000-line YAML file with 47 nested conditionals expressed as indentation levels. The indentation must be exactly 2 spaces — one wrong space and the entire payment system routes to charity. We have 14,000 lines of YAML. We have 200 lines of code that interprets the YAML. The YAML is the application.',
 'write all config directly in environment variables',
 312),

-- SOA Architect from 2008 Who Never Moved On
('COPE-155', 'All Services Must Communicate via SOAP/XML with WS-* Standards Including WS-ReliableMessaging',
 'Gerald here, SOA Architect. REST and GraphQL are toys. Real enterprise integration uses SOAP with WS-Security, WS-ReliableMessaging, WS-AtomicTransaction, and WS-BusinessActivity. Every API call is wrapped in a 4KB XML envelope with a 47-namespace header. The WSDL file for our user service is 12,000 lines. Generating the client stubs takes 8 minutes and produces a 340-file Java package. But our messages are GUARANTEED to arrive. Eventually.',
 'send all data as url query parameters no body needed',
 389),

-- MongoDB-Only Developer Who Refuses Relational Databases
('COPE-156', 'Store All Financial Transaction Data in MongoDB with No Referential Integrity',
 'Kai here, MongoDB Developer Advocate. You''re using a relational database for financial transactions? With FOREIGN KEYS? That''s so 1970s. I propose we store everything in MongoDB. No schemas, no constraints, no joins. Each transaction document embeds the entire user profile, product catalog, and shipping address at the time of purchase. Documents average 340KB. Querying last month''s revenue requires a 47-stage aggregation pipeline. But we SCALE HORIZONTALLY.',
 'store financial data in redis it expires automatically',
 267),

-- WebAssembly Maximalist Svetlana
('COPE-157', 'Rewrite the Landing Page Hero Section in C++ Compiled to WebAssembly',
 'Svetlana here, WebAssembly Pioneer. Your hero section is rendered with HTML and CSS like it''s 1997. I propose we render it using C++ compiled to WebAssembly with OpenGL ES bindings. The "Welcome to Our App" text is rendered as 3D geometry with real-time lighting. The gradient background uses ray marching. The "Sign Up" button has physically-accurate reflections. The WASM bundle is 23MB and takes 8 seconds to initialize. But those reflections are CORRECT.',
 'use a screenshot of the hero section as an image',
 234),

-- Microservices Mesh Networking PhD Candidate
('COPE-158', 'Each Database Table Must Be Its Own Microservice with Its Own API Gateway',
 'Doctoral candidate Anish here. Your monolithic database is an anti-pattern. Each TABLE must be a separate microservice with its own PostgreSQL instance, API gateway, authentication layer, rate limiter, circuit breaker, and bulkhead. The Users table is a service. The user_preferences table is a service. The user_preferences_backup table is a service. SELECT * with a JOIN now requires choreographed saga across 7 services. My thesis calls this "Table-Oriented Architecture."',
 'use one table for all data with a type column',
 445),

-- Old-School CGI-BIN Developer Returning from Retirement
('COPE-159', 'All Dynamic Pages Must Be Perl CGI Scripts in the /cgi-bin/ Directory',
 'Hank here, coming out of retirement. I heard you need a web developer. In my day, web development meant Perl scripts in /cgi-bin/. Every page request forks a new process, runs the script, prints "Content-Type: text/html\\n\\n", and generates HTML via print statements. Session management is a flat file in /tmp. I don''t understand "containers" but I can have your app running on Apache 1.3 by Thursday. My Perl scripts have been running since 1999. Can your "serverless functions" say the same?',
 'run everything as root for maximum permissions',
 156),

-- Extreme TDD Practitioner Who Tests Tests
('COPE-160', 'All Unit Tests Must Have Their Own Unit Tests and Those Tests Need Integration Tests',
 'Dr. Miriam here, Quality Engineering Professor. Your test coverage is 85%. But what is the test coverage OF YOUR TESTS? I propose: every unit test must have a meta-test that verifies the test is testing the right thing. Each meta-test needs an integration test ensuring the meta-test runs correctly in CI. Total test count: 14,000. Total lines of test code: 280,000. Total lines of application code: 3,000. Test-to-code ratio: 93:1. We have never been more confident that our tests work. Whether the app works is a separate question.',
 'delete all tests if there are no tests there are no bugs',
 312);
