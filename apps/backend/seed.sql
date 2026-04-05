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

INSERT INTO community_backlog (id, title, description, technical_debt) VALUES
-- Karen from HR
('seed-001', 'Mandatory Fun Button Must Require Manager Approval Workflow',
 'Karen from HR here. The "Celebrate" confetti animation currently fires WITHOUT a three-level approval chain. This is a compliance nightmare. Every confetti particle must be individually audited and logged to the HR Information System before rendering. We also need a written explanation from the employee justifying WHY they feel celebratory. Please add a 48-hour cooling-off period between celebrations.',
 42),

('seed-002', 'All Error Messages Must Be Reviewed by HR for Emotional Safety',
 'Karen from HR again. A developer reported that a 500 error made them "feel attacked." Going forward, all error messages must pass through the Emotional Impact Assessment Pipeline (EIAP). Messages containing words like "fail," "reject," or "invalid" must be replaced with affirming alternatives such as "not yet successful" and "differently valid."',
 34),

('seed-003', 'Implement Mandatory Sensitivity Training Module Before Git Push',
 'Karen from HR. We had an incident where a commit message said "kill the process." This is UNACCEPTABLE. All git push operations must now require completion of a 45-minute microaggression awareness video. The video must buffer every 3 minutes to ask comprehension questions. Skipping is not an option.',
 55),

-- VP of Sales Anthony
('seed-004', 'Add "Close Deal" Button to Every Single Page',
 'Anthony here, VP of Sales. I just got back from Dreamforce and had an EPIPHANY. Every page in the app needs a giant green "CLOSE DEAL" button. I don''t care if it''s the 404 page. A customer could land there and we are LEAVING MONEY ON THE TABLE. Also it needs to play a cash register sound. Non-negotiable.',
 21),

('seed-005', 'Pipeline Dashboard Must Show Revenue in Real-Time with Fireworks',
 'Anthony from Sales again. The revenue number on the dashboard updates every 5 minutes. That is FIVE MINUTES of my life where I don''t know if we hit quota. I need real-time, sub-millisecond updates with animated fireworks when we cross a threshold. Also add a leaderboard so I can publicly shame Brad from the Austin office.',
 89),

('seed-006', 'Integrate CRM with the Coffee Machine for Lead Scoring',
 'Anthony, VP of Sales. Hear me out — when a prospect opens our email, the office coffee machine should start brewing automatically so the SDR team is CAFFEINATED and READY TO DIAL. I already bought the IoT-enabled espresso machine. Just connect it to Salesforce. Engineering said "no" but I went ahead and filed this as a P0.',
 67),

-- Greg the Architect
('seed-007', 'Rewrite Login Page Using Event-Sourced CQRS Microservices',
 'Greg from Architecture here. The login page is currently a single form that posts to one endpoint. This monolithic approach cannot scale. I propose we decompose it into 14 microservices: AuthIntent, CredentialValidation, SessionHydration, TokenMinting, BiometricFallback, LoginAudit, PasswordEntropy, CAPTCHAOrchestrator, RateLimitSaga, DeviceFingerprintProjection, GeoFenceEvaluator, ComplianceGateway, LoginEventStore, and WelcomeMessageAggregator.',
 144),

('seed-008', 'All Database Queries Must Go Through a GraphQL-to-REST-to-gRPC Translation Layer',
 'Greg the Architect. I''ve been thinking about our query patterns and they''re far too direct. Every database call should first be expressed as a GraphQL mutation, translated to a REST call, converted to gRPC, passed through a service mesh sidecar, and finally executed as raw SQL. This adds approximately 340ms of latency but the ABSTRACTION PURITY is worth it.',
 233),

('seed-009', 'Implement Blockchain-Based Code Review Approval System',
 'Greg here. Our current PR approval process (clicking "Approve" on GitHub) lacks cryptographic integrity. I propose we mint each approval as an NFT on a private Ethereum sidechain. Reviewers stake 0.01 ETH per approval to ensure accountability. If the PR causes a production incident, their stake is slashed. I''ve already written the whitepaper.',
 377),

-- Linda from Compliance
('seed-010', 'Every Button Click Must Generate an Audit Trail with Notarized Timestamps',
 'Linda from Compliance. Per regulation 7.4.2(b) of a document I will not share with you, every user interaction must produce a tamper-evident audit record. This includes: mouse hovers (potential intent to click), scroll events (potential intent to view), and tab switches (potential intent to leave). Each record must be notarized by a third-party timestamp authority within 200ms.',
 98),

('seed-011', 'Cookie Banner Must Require a 12-Page Consent Form Signed in Triplicate',
 'Linda, Compliance. Our cookie banner says "Accept All" — this is legally reckless. The new banner must present a 12-page Terms of Data Processing Agreement, require the user to initial each paragraph, and upload a photo of their government-issued ID. Users who click "Reject All" must write a 500-word essay explaining why they don''t trust us.',
 76),

('seed-012', 'Implement Data Retention Policy That Deletes Everything After 30 Seconds',
 'Linda from Compliance again. After reviewing GDPR Article 5(1)(e), I''ve determined that our 7-year data retention policy is too aggressive. All user data must now be purged 30 seconds after creation. If a user complains they can''t see their order history, direct them to our Privacy Commitment Statement which explains that forgetting them is an act of love.',
 61),

-- DevOps Dave
('seed-013', 'The CI Pipeline Must Take Exactly 47 Minutes — No More, No Less',
 'DevOps Dave here. I''ve calibrated our CI pipeline to exactly 47 minutes because that''s the optimal time for me to go get coffee, microwave leftover pasta, and complain about Kubernetes in Slack. If anyone optimizes the build time, I will add a sleep() to compensate. This is load-bearing procrastination.',
 29),

('seed-014', 'All Production Deployments Must Happen at 4:59 PM on Fridays',
 'Dave from DevOps. I''ve analyzed our deployment success metrics and determined that 4:59 PM Friday is when the engineering team is most "focused" (read: desperate to leave). Deploying under pressure builds character. If the deploy fails, the on-call engineer gets a "growth opportunity" over the weekend. PagerDuty is already configured.',
 44),

('seed-015', 'Replace All Monitoring with a Single Bash Script Named "vibes.sh"',
 'DevOps Dave. Our monitoring stack (Datadog, PagerDuty, Grafana, Sentry) costs $47K/month. I wrote a bash script that curls the homepage every 5 minutes and prints "vibes are good" or "vibes are bad." It''s been running on my laptop for 3 weeks and caught 60% of incidents (the ones that happened while my laptop was open). Proposing we go all-in.',
 18),

-- Brenda from Platform Governance
('seed-016', 'All Variable Names Must Be Pre-Approved by the Naming Committee',
 'Brenda from Platform Governance. We''ve formed a Variable Naming Standards Committee (VNSC) and all identifier names must now be submitted via a Google Form for approval. Expected turnaround is 5-7 business days. Names containing abbreviations, numbers, or any reference to food items are automatically rejected. "temp" is BANNED.',
 52),

('seed-017', 'Implement a Ticketing System for Our Ticketing System',
 'Brenda here. The current process for filing Jira tickets is too informal. Going forward, to create a Jira ticket, you must first file a Request-to-Ticket (RTT) in our new meta-ticketing platform. The RTT must include a business justification, estimated ROI, and three references from colleagues who can vouch for the ticket''s necessity.',
 41),

-- Passive-Aggressive Product Manager Pam
('seed-018', 'Per My Last Slack Message: The Dashboard Still Doesn''t Spark Joy',
 'Hi, it''s Pam. As I mentioned in my Slack message (which I notice nobody reacted to), the dashboard "doesn''t spark joy." I''ve attached a 47-slide deck explaining the KonMari method as applied to SaaS metrics. Each widget must be individually held and thanked before being removed. If the bounce rate doesn''t decrease by 340% after this, we''ll circle back.',
 38),

('seed-019', 'Rename "Delete" to "Archive" to "Soft Archive" to "Intention to Maybe Remove Later"',
 'Pam from Product. A user clicked "Delete" and was SURPRISED that it deleted something. This is a UX failure. We need to rename the button through four iterations of softening: Delete → Archive → Soft Archive → Intention to Maybe Remove Later. The button color must also fade from red to a calming lavender. Add a 7-day "grief counseling" period before actual removal.',
 33),

('seed-020', 'The Loading Spinner Must Gaslight Users About Wait Times',
 'Pam here. Our loading spinner currently shows accurate wait times and this is DESTROYING user trust. When something takes 10 seconds, users feel it''s slow. Instead, show "Almost there! (2 seconds remaining)" and just keep resetting the countdown. Users will think each wait is only 2 seconds. I call this "Optimistic Temporal UX." I have a patent pending.',
 27),

-- Intern Tyler
('seed-021', 'Rewrite the Entire Backend in Rust Because I Watched a YouTube Video',
 'Hey it''s Tyler, the intern. I watched a 12-minute YouTube video about Rust and memory safety and honestly I think we should rewrite the entire backend. Our current Node.js server has "garbage collection" which sounds bad — like it''s collecting GARBAGE. Rust doesn''t have that. I already mass-renamed all .js files to .rs and nothing compiles but that''s probably a config issue.',
 610),

('seed-022', 'Replace the Database with a JSON File I Keep on My Desktop',
 'Tyler the intern again. I noticed PostgreSQL has like 400 config options and that seems like a lot of attack surface. I''ve been prototyping an alternative where we store all user data in a file called data.json on my Desktop. It''s really fast (my laptop has an SSD) and I''ve already implemented full-text search using ctrl+F. Requesting 2 story points.',
 89),

('seed-023', 'I Accidentally Deleted the Production Database and Need Help Undeleting It',
 'Tyler here. So funny story — I was trying to clean up my local dev database and I MAY have run DROP TABLE users on production. In my defense, both terminal windows look the same. Is there like a ctrl+Z for databases? Also please don''t tell my manager, she''s already upset about the JSON file thing. Marking this as low priority so nobody panics.',
 999),

-- CFO Margaret
('seed-024', 'All API Calls Must Include a Cost Center Code and Purchase Order Number',
 'Margaret from Finance. I''ve been reviewing our cloud bill and apparently we make 2 million API calls per day WITHOUT any cost attribution. Going forward, every HTTP request must include headers X-Cost-Center, X-Purchase-Order, and X-Budget-Approval-Chain. Requests missing these headers will receive a 402 Payment Required and a PDF invoice.',
 73),

('seed-025', 'Implement a Metered Billing System for Internal Microservice Communication',
 'Margaret, CFO. If Sales can charge clients per API call, why aren''t we charging engineering teams per internal service call? I''m proposing inter-departmental transfer pricing for microservices. The Auth service will invoice the User service $0.003 per token validation. Teams that exceed their monthly RPC budget will have their services throttled.',
 156),

-- Security Steve
('seed-026', 'All Passwords Must Be Exactly 128 Characters and Changed Every 4 Hours',
 'Steve from Security. Our password policy is dangerously lax. New requirements: passwords must be exactly 128 characters, contain at least 3 emojis, 2 Cyrillic characters, and a haiku. Passwords expire every 4 hours. Reuse of any password from the last 10,000 is prohibited. Users who forget their password must appear in person with two forms of ID and a utility bill.',
 88),

('seed-027', 'Encrypt All Console.log Statements in Case Hackers Read Our Logs',
 'Security Steve here. I ran a penetration test and discovered that our console.log statements output PLAINTEXT. If an attacker gains access to our logs, they''ll see messages like "user logged in" and "order created." This is basically giving them a roadmap. All log messages must be AES-256 encrypted. Yes, this makes debugging impossible. That''s a feature, not a bug.',
 47),

('seed-028', 'The Login Page Must Include a CAPTCHA, a Riddle, and a Blood Oath',
 'Steve, Security. CAPTCHAs are no longer sufficient — bots can solve them. Our new authentication flow: 1) Standard CAPTCHA, 2) A riddle from a rotating pool of Tolkien references, 3) A legally binding checkbox that says "I swear on my firstborn that I am not a robot," 4) A 30-second staring contest with the webcam where our ML model verifies you blink naturally.',
 65),

-- QA Lead Deborah
('seed-029', 'Every Unit Test Must Also Pass a Vibe Check from the QA Team',
 'Deborah from QA. Passing unit tests is necessary but NOT SUFFICIENT. Every test suite must now include a "vibe check" phase where a QA team member manually reads each assertion and confirms it "feels right." Tests that are technically correct but "feel brittle" will be marked as VIBES_FAILED and blocked from merging. Appeals can be filed quarterly.',
 36),

('seed-030', 'The Test Suite Must Achieve 100% Code Coverage Including Comments',
 'Deborah, QA Lead. Our 94% code coverage is embarrassing. I need 100%. And before you say "comments aren''t executable" — they SHOULD be. Every comment must have a corresponding test that verifies the comment accurately describes the code below it. If someone updates a function without updating the comment, the test fails. I call this "Comment-Driven Development."',
 112),

('seed-031', 'All Bug Reports Must Include a Haiku Describing the Emotional Impact',
 'Deborah from QA. Bug reports currently lack emotional context. New template requires: Steps to Reproduce, Expected Behavior, Actual Behavior, and a haiku capturing the reporter''s feelings. Example: "Button does not work / My soul withers in the void / Please fix by Friday." Reports without haikus will be auto-closed as INSUFFICIENT_SUFFERING.',
 22),

-- CEO Chad
('seed-032', 'Pivot the Entire Product to AI Blockchain Metaverse by End of Sprint',
 'Chad here, CEO. Just got back from Davos. We need to pivot. The product is now an AI-powered blockchain metaverse for enterprise sustainability. I don''t know what any of those words mean but every competitor''s pitch deck has them. Engineering has 2 weeks. Marketing already announced the launch. The press release goes out tomorrow. Details TBD.',
 500),

('seed-033', 'The App Must Work on My Specific Phone Which I Dropped in a Hot Tub',
 'Chad, CEO. The app crashes on my phone. Before you ask — yes, it''s the phone I dropped in the hot tub at the board retreat. The screen has a crack and the bottom third doesn''t register touches. But that''s MY phone, and if it doesn''t work for ME, it doesn''t work for our CUSTOMERS. I need a hotfix by EOD. I''m the CEO so this is automatically P0.',
 31),

('seed-034', 'Make the Logo Bigger and Also Smaller at the Same Time',
 'Chad again. I showed the app to my wife''s cousin who "does design" and she said the logo should be bigger. But our head of design said smaller. I need it to be BOTH. Make it bigger on desktop and smaller on mobile? No wait, bigger on mobile and smaller on desktop. Actually just make it pulse between big and small so everyone''s happy. Ship it.',
 13),

-- Scrum Master Janet
('seed-035', 'Every Code Change Must Be Discussed in a 90-Minute Refinement Ceremony',
 'Janet, Scrum Master. I noticed engineers are pushing code WITHOUT discussing it in refinement first. Even one-line changes. Going forward, all code changes require: 1) A refinement session (90 min), 2) A planning poker round, 3) A dependency mapping exercise, 4) A stakeholder alignment sync, and 5) A retrospective on the refinement itself. Velocity may decrease but PROCESS will increase.',
 48),

('seed-036', 'Implement a Standup Bot That Generates Standup Updates Using AI',
 'Janet here. Engineers keep saying "same as yesterday" in standup. This is NOT in the spirit of the Daily Scrum. I''m proposing an AI bot that generates dramatic, detailed standup updates for each engineer based on their git commits. Example: "Tyler bravely battled a NullPointerException across 3 files, emerging victorious but spiritually changed."',
 25),

('seed-037', 'The Sprint Must Have a Theme Song That Plays During Deployments',
 'Janet, Scrum Master. To boost team morale, each sprint will have an official theme song voted on during sprint planning. The song must play at full volume through all office speakers during production deployments. If the deploy fails, the song switches to a sad trombone. I''ve already created a Spotify playlist called "Agile Anthems." First pick: "Under Pressure."',
 15),

-- Outsourced Consultant Raj
('seed-038', 'Replace All In-House Code with a SaaS Platform That Does 10% of What We Need',
 'Raj from McKinsey here (your CEO hired us). After 6 weeks of analysis, we recommend replacing your custom-built platform with an enterprise SaaS tool that costs $400K/year and handles 10% of your use cases. The other 90% can be managed through a combination of Excel spreadsheets and "process changes." We''ve prepared a 200-slide deck to explain.',
 340),

('seed-039', 'Organizational Restructure: Every Engineer Reports to a Different PM',
 'Raj, management consultant. Your current team structure (engineers working together) is suboptimal. Each engineer should report to a separate Product Manager, who reports to a separate Director, who reports to a separate VP. Communication between engineers must go through their respective management chains. Expected improvement: 40% more alignment meetings.',
 210),

-- Backend Bob
('seed-040', 'The API Must Return 200 OK for Everything Including Server Fires',
 'Bob from Backend. Our monitoring keeps alerting on 500 errors and it''s waking me up at night. Simple fix: return 200 OK for everything. Actual errors can be communicated via a "secret_status" field buried in the JSON response that only our frontend knows to check. The monitoring system will show 100% uptime. Problem solved. You''re welcome.',
 57),

('seed-041', 'All Endpoints Must Accept Both JSON and Microsoft Excel Spreadsheets',
 'Backend Bob. The sales team keeps sending us feature requirements as Excel spreadsheets. Instead of converting them to JSON, I propose our API accept .xlsx files directly. We''ll parse them server-side and hope for the best. If a cell contains a formula, we evaluate it. What could go wrong? Bonus: we can finally accept pivot tables as query parameters.',
 83),

-- UX Designer Zoe
('seed-042', 'The Entire App Must Be Navigable Using Only Interpretive Dance',
 'Zoe from UX. I attended a workshop on "Embodied Interaction Design" and I''m convinced mouse and keyboard are limiting our users. The app must support webcam-based gesture controls. A wide arm sweep scrolls the page. A head tilt opens the menu. Jumping triggers a page refresh. For accessibility, we''ll also support aggressive sighing as an input method.',
 167),

('seed-043', 'All Buttons Must Have a 3-Second Hover Animation Before They Become Clickable',
 'Zoe, UX. Users are clicking buttons too quickly without appreciating the design. New requirement: every button requires a 3-second hover before it becomes active. During the hover, the button slowly "blooms" like a flower opening. If the user moves their cursor away before 3 seconds, the bloom resets. This teaches patience and mindfulness. I call it "Intentional Interaction Design."',
 29),

('seed-044', 'Replace All Text with Emojis Because "Gen Z Doesn''t Read"',
 'Zoe from UX. Our research shows that Gen Z users "don''t read." All text in the app must be replaced with emoji sequences. "Submit Order" becomes "📦✅🚀". "Delete Account" becomes "🗑️😱💀". Error messages are conveyed entirely through sad face progressions: 😐→😕→😟→😢→😭. We''ll provide a Rosetta Stone in the help docs (also in emoji).',
 45),

-- Legal Larry
('seed-045', 'Every Feature Must Have Its Own Terms of Service',
 'Larry from Legal. I''ve discovered that our Terms of Service cover the app "as a whole" but NOT individual features. This is a liability gap. Each button, dropdown, and text input needs its own mini-ToS that users must accept before interaction. The search bar alone requires a 3-page Data Processing Addendum. Estimated legal review time: 6 months per feature.',
 190),

('seed-046', 'The "Share" Button Must Include a 47-Page Liability Waiver',
 'Legal Larry. The share feature lets users send content to other humans WITHOUT a liability waiver. What if they share something embarrassing? What if the recipient is offended? What if the shared content becomes sentient? We need a comprehensive waiver covering all scenarios including but not limited to: emotional distress, existential dread, and interdimensional data leakage.',
 78),

-- Data Scientist Diana
('seed-047', 'We Need an ML Model to Predict Which Features Users Will Request Before They Request Them',
 'Diana from Data Science. I''ve been training a model on 6 years of Jira tickets and I can now predict feature requests 3 sprints before users ask for them. Accuracy is currently 7% but I need more GPU budget to improve it. In the meantime, I recommend we build features based on my model''s predictions. First prediction: users want a "teleport" button. Confidence: 0.03.',
 284),

('seed-048', 'A/B Test Everything Including the A/B Testing Framework Itself',
 'Diana, Data Scientist. We''re not A/B testing enough. Every element should be in a test: button colors, font sizes, error messages, the loading spinner direction, and the A/B testing framework itself. I want to A/B test whether A/B testing improves metrics. We''ll need a control group that receives no A/B tests and a treatment group drowning in them.',
 93),

-- IT Support Mike
('seed-049', 'All Bug Reports Must First Be Resolved by Turning It Off and On Again',
 'Mike from IT. 73% of bugs can be fixed by refreshing the page. New policy: before any bug ticket enters the engineering backlog, the reporter must: 1) Clear their cache, 2) Restart their browser, 3) Restart their computer, 4) Unplug their router for 30 seconds, 5) Try a different browser, 6) Try a different computer, 7) Reconsider whether it''s actually a bug or a feature.',
 11),

('seed-050', 'Implement a "Have You Tried Turning It Off and On Again" Popup Before Every Error',
 'Mike, IT Support. Instead of showing error messages, the app should first display "Have you tried turning it off and on again?" with a 60-second mandatory wait timer. After the timer, if the user clicks "Yes I tried," show the actual error. If they click "No," force-refresh the page. This will reduce our ticket volume by 80%. I''ve done the math (I haven''t).',
 19),

-- Marketing Maya
('seed-051', 'The 404 Page Must Be a Lead Generation Form',
 'Maya from Marketing. We''re getting 50,000 404 hits per month and converting ZERO of them. The new 404 page must include: a newsletter signup, a chatbot offering a demo, a "Download Our Whitepaper" CTA, an exit-intent popup, and a 30-second auto-playing video of our CEO explaining our vision. Page not found? More like LEAD not found (until now).',
 37),

('seed-052', 'All Error Codes Must Be Replaced with Marketing-Approved Messages',
 'Maya, Marketing. "500 Internal Server Error" is terrible branding. New error messages: 200 → "You''re Crushing It!", 301 → "We''re Evolving!", 404 → "This Page Is On a Journey of Self-Discovery", 500 → "We''re Experiencing Aggressive Innovation", 503 → "Our Servers Are Recharging Their Creative Energy." I''ve already briefed the PR team.',
 24),

-- Infrastructure Ian
('seed-053', 'We Must Run Kubernetes on Kubernetes on Kubernetes for True Redundancy',
 'Ian from Infrastructure. Single-layer Kubernetes isn''t redundant enough. I''m proposing K8s-ception: our application runs in K8s pods, managed by a K8s cluster, running inside K8s pods on a meta-cluster. If the inner cluster fails, the outer cluster restarts it. If the outer cluster fails, well, we don''t talk about that. Monthly cost increase: $34,000. Worth it for the YAML alone.',
 445),

('seed-054', 'Every Microservice Must Have Its Own Dedicated AWS Account',
 'Ian, Infrastructure. For "blast radius isolation" (a term I learned at re:Invent), each of our 23 microservices needs its own AWS account, VPC, and IAM configuration. Cross-service communication goes through 23 VPC peering connections and 529 security group rules. The infrastructure diagram now requires A0 paper to print. I consider this a sign of maturity.',
 312),

-- Product Analytics Pete
('seed-055', 'Track Eye Movement Patterns to Determine If Users Are "Really" Reading the TOS',
 'Pete from Analytics. We have 99.7% TOS acceptance rates but I suspect users aren''t actually reading them. Proposal: integrate webcam eye-tracking to verify users read every line. If their eyes move too fast (speed-reading = not reading), reset the scroll position. Average TOS reading time should be 47 minutes. Users who finish in under 30 minutes are flagged as suspicious.',
 128),

('seed-056', 'The Analytics Dashboard Must Track Metrics About the Analytics Dashboard',
 'Pete, Analytics. We track everything about our product but nothing about our analytics tools. I need a meta-dashboard that shows: how often PMs look at the dashboard, which charts they ignore, how long they stare at vanity metrics, and whether looking at the dashboard actually correlates with better decisions (spoiler: it doesn''t, but I need data to prove it).',
 71),

-- Accessibility Advocate Alex
('seed-057', 'Screen Readers Must Dramatically Narrate All Animations',
 'Alex from Accessibility. Our loading spinner is visually engaging but screen reader users get nothing. The screen reader must narrate: "A circle of light spins clockwise, casting hope across the void of buffering. Will the data arrive? Only time will tell. The spinner continues its eternal dance — a Sisyphean metaphor for the human condition." This is for a 2-second load.',
 53),

('seed-058', 'All Color Choices Must Be Debated in a Company-Wide Town Hall',
 'Alex, Accessibility Lead. The button color was changed from #2563eb to #2564eb WITHOUT a town hall discussion. This one-digit hex change could affect users with a very specific and theoretical color sensitivity I read about on a forum. All future color changes require: a town hall (minimum 200 attendees), a 30-day public comment period, and a formal color impact assessment.',
 39),

-- Junior Developer Emma
('seed-059', 'I Added 847 NPM Packages and Now the Build Takes 3 Hours',
 'Emma here, junior dev. So I was trying to center a div and Stack Overflow said to use a package called "center-div-please" which required "left-pad-ultimate" which required "is-even-or-odd" which required... anyway I added 847 packages and node_modules is 4.7GB. The build takes 3 hours but the div IS centered. Can someone review my PR? It has 12,000 changed files.',
 178),

('seed-060', 'Convert All Callbacks to Promises to Async/Await to Callbacks Again',
 'Emma, junior dev. I read that callbacks are bad so I converted them all to Promises. Then I read Promises are old so I converted to async/await. Then a senior dev said "you don''t understand the event loop" so I panicked and converted everything back to callbacks. Now nothing works but at least I''ve touched every file in the repo. Requesting a mass code review.',
 95),

-- Operations Oscar
('seed-061', 'The Incident Response Process Must Have More Steps Than the Incident Itself',
 'Oscar from Operations. Our incident response is too simple: detect → fix → postmortem. New process: detect → acknowledge → classify → escalate → form war room → assign incident commander → assign communications lead → draft status page update → get legal approval → get marketing approval → fix → celebrate → postmortem → action items → review action items → postmortem the postmortem.',
 64),

('seed-062', 'All Runbooks Must Be Written in Haiku Format for Brevity',
 'Oscar, Operations. Our runbooks are too long. Nobody reads a 40-page doc at 3 AM. New format — every procedure must be a haiku. Example for database failover: "Primary is dead / Promote the replica now / Pray it has the writes." If the haiku doesn''t cover edge cases, that''s what the postmortem is for.',
 16),

-- Product Owner Patricia
('seed-063', 'The Backlog Must Be Prioritized Using Astrology',
 'Patricia, Product Owner. Stack ranking is subjective and causes team conflict. New prioritization framework: we assign each ticket a zodiac sign based on its creation date and prioritize according to the current astrological forecast. Mercury is in retrograde so all tech debt tickets are blocked. Feature requests from Scorpios automatically get bumped to the top.',
 42),

('seed-064', 'Every User Story Must Have a Villain and a Plot Twist',
 'Patricia from Product. Our user stories are boring. "As a user, I want to log in" has no narrative tension. New format: "As a beleaguered office worker (protagonist), I want to log in, BUT the SSO provider has been compromised by my nemesis (the CTO''s cat who walked on the keyboard). Plot twist: the password was ''password123'' all along." Acceptance criteria must include a satisfying denouement.',
 28),

-- SRE Sarah
('seed-065', 'Our SLO Must Be Exactly 99.999% and Also We Can''t Spend Any Money',
 'Sarah from SRE. Leadership wants five nines of availability (99.999% = 5.26 minutes of downtime per YEAR) but our infrastructure budget was cut by 60%. We currently run on a single t2.micro instance. I''ve calculated that we can achieve five nines if nothing ever goes wrong, nobody deploys on weekdays, and we sacrifice a rubber duck to the cloud gods every full moon.',
 187),

('seed-066', 'Page Load Time Must Be Negative — The Page Should Load Before the User Clicks',
 'SRE Sarah. Our P99 latency is 200ms which "feels slow" according to the CEO. His exact words: "Can''t we just load the page before they click?" So, new requirement: NEGATIVE page load time. The app must predictively render every possible page the user might visit and have it ready. If they visit a page we didn''t predict, that''s a UX failure, not an engineering one.',
 253),

-- Database DBA Derek
('seed-067', 'All Queries Must Be Hand-Approved by a DBA Before Execution',
 'Derek, Senior DBA. I found a SELECT * in production code. A SELECT STAR. Do you know what that does to my buffer pool? Effective immediately, all SQL queries must be submitted via a pull request to the DBA team for review. Expected turnaround: 3-5 business days. Yes, this includes SELECT 1 health checks. ESPECIALLY SELECT 1 health checks — what are you selecting? Why just 1?',
 74),

('seed-068', 'The Database Must Store Data in Reverse Chronological Order Because "That''s How Users Think"',
 'Derek the DBA. Product says users always want the newest data first. Instead of using ORDER BY DESC (which is O(n log n)), I propose we INSERT all rows in reverse chronological order so SELECT without ORDER BY returns newest first. Yes, this means rewriting every INSERT to calculate the correct position. But think of the QUERY SAVINGS. I''ve written a 30-page proposal.',
 141),

-- Frontend Dev Frankie
('seed-069', 'The CSS Must Be Written Entirely in !important Declarations',
 'Frankie, Frontend. I''ve been fighting CSS specificity wars for 3 years and I''m DONE. New rule: every CSS property gets !important. If two !important rules conflict, we add !important !important (I''m writing a PostCSS plugin). If THAT conflicts, we inline the styles. If inline styles conflict, we use JavaScript. We''ve come full circle and I''ve never been happier.',
 66),

('seed-070', 'Support Internet Explorer 6 Because the CEO''s Dad Uses It',
 'Frankie from Frontend. The CEO''s father called complaining the app doesn''t work on his computer. He''s running IE6 on Windows XP. The CEO has declared this a P0 blocker — "if my dad can''t use it, nobody can." We need to polyfill: flexbox, grid, fetch, Promises, arrow functions, const/let, modules, Shadow DOM, and the concept of happiness. Estimated effort: 8 sprints.',
 234),

-- Support Lead Samantha
('seed-071', 'Auto-Reply to All Support Tickets with "Works on My Machine"',
 'Samantha from Support. We''re drowning in tickets. New auto-reply policy: every incoming ticket gets an immediate response of "Works on my machine ¯\\_(ツ)_/¯" with a screenshot of it working on the QA environment. If the user responds again, send "Have you tried clearing your cache?" If they respond a THIRD time, fine, we''ll actually read the ticket. This should cut volume by 70%.',
 14),

('seed-072', 'The Help Center Must Be a Choose-Your-Own-Adventure Novel',
 'Samantha, Support. Our help docs are boring. Nobody reads them. Proposal: convert all documentation into an interactive Choose-Your-Own-Adventure format. "You encounter a login error. Do you: A) Clear your cache (turn to page 47), B) Try a different browser (turn to page 23), C) Scream into the void (turn to page 666)." Page 666 just says "file a ticket."',
 32),

-- VP of Engineering Victor
('seed-073', 'All Technical Decisions Must Be Made by Committee Vote with a 2/3 Supermajority',
 'Victor, VP of Engineering. Individual engineers are making technical decisions too quickly and without consensus. New policy: all decisions (framework choice, variable naming, whether to use a for-loop or map) require a committee vote with 2/3 supermajority. If consensus isn''t reached, the decision escalates to me, and I''ll flip a coin. Democracy in action.',
 86),

('seed-074', 'Implement "Innovation Fridays" Where Engineers Must Only Use Languages They Don''t Know',
 'Victor, VP Eng. To foster innovation, every Friday engineers must write production code in a language they''ve never used. Our Node.js backend? Rewrite a module in COBOL. React frontend? Try Fortran. If the code is unreadable by Monday, that''s what code review is for. Last Innovation Friday, someone wrote a payment processor in Brainfuck. Very innovative. Very broken.',
 58),

-- Growth Hacker Gary
('seed-075', 'Add a "Refer a Friend" Popup That Appears Every 30 Seconds',
 'Gary from Growth. Our referral rate is 0.02%. Clearly we''re not asking enough. New popup: "Refer a friend!" appears every 30 seconds. Dismissing it triggers a "Are you sure you don''t want to refer a friend?" confirmation. Clicking "No" triggers a guilt-trip modal: "Your friends are missing out. They''ll remember this." Close that and it restarts in 30 seconds.',
 41),

('seed-076', 'The Signup Flow Must Collect User''s Blood Type for "Personalization"',
 'Gary, Growth Hacker. We need more user data for personalization. New signup fields: blood type, shoe size, childhood pet''s maiden name, and Myers-Briggs type. If users skip these fields, the app works 30% slower as a "gentle nudge." I call this "Friction-Based Data Collection." Legal said no but Growth says yes and Growth always wins.',
 49),

-- Tech Lead Tanya
('seed-077', 'All Code Must Be Written in Pair Programming but the Pairs Are Chosen by Random Lottery',
 'Tanya, Tech Lead. Pair programming improves code quality but people always pair with their friends. New system: every morning at 9 AM, a Slack bot randomly assigns pairs. Yes, the intern might pair with the principal engineer. Yes, the frontend dev might pair with the DBA. The discomfort is a feature. Cross-pollination through chaos.',
 35),

('seed-078', 'The Codebase Must Have Zero Comments Because "Good Code Documents Itself"',
 'Tanya, Tech Lead. I read "Clean Code" in 2012 and I''ve been radicalized. ALL comments must be removed. If code needs a comment to be understood, the code is bad. This applies to: regex explanations, TODO notes, license headers, and the comment that says "DO NOT REMOVE THIS LINE OR PRODUCTION BREAKS." Especially that one. If we don''t know why, we don''t deserve the line.',
 72),

-- Offshore Team Lead Olga
('seed-079', 'All Meetings Must Be Scheduled at a Time That''s 3 AM for At Least One Timezone',
 'Olga, offshore team lead. Currently meetings are scheduled for US convenience at 10 AM PST, which is 1:30 AM for our India team. Per fairness doctrine, I propose we rotate the suffering equally. Every meeting should be at 3 AM for at least one timezone. If nobody is suffering, the meeting isn''t important enough. We''ll track "3 AM duty" in a shared spreadsheet.',
 20),

('seed-080', 'Implement a "Translation Layer" That Converts Code Comments Between Passive-Aggressive Dialects',
 'Olga here. Communication between our US and offshore teams is "fine" (it''s not fine). Comments like "interesting approach" mean different things. Proposal: an NLP-based translation layer that converts passive-aggressive US English to direct English and vice versa. "Per my last comment" → "You didn''t read my comment." "Interesting approach" → "This is wrong."',
 43);
