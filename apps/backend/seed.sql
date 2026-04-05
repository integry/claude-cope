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
('COPE-001', 'Mandatory Fun Button Must Require Manager Approval Workflow',
 'Karen from HR here. The "Celebrate" confetti animation currently fires WITHOUT a three-level approval chain. This is a compliance nightmare. Every confetti particle must be individually audited and logged to the HR Information System before rendering. We also need a written explanation from the employee justifying WHY they feel celebratory. Please add a 48-hour cooling-off period between celebrations.',
 42),

('COPE-002', 'All Error Messages Must Be Reviewed by HR for Emotional Safety',
 'Karen from HR again. A developer reported that a 500 error made them "feel attacked." Going forward, all error messages must pass through the Emotional Impact Assessment Pipeline (EIAP). Messages containing words like "fail," "reject," or "invalid" must be replaced with affirming alternatives such as "not yet successful" and "differently valid."',
 34),

('COPE-003', 'Implement Mandatory Sensitivity Training Module Before Git Push',
 'Karen from HR. We had an incident where a commit message said "kill the process." This is UNACCEPTABLE. All git push operations must now require completion of a 45-minute microaggression awareness video. The video must buffer every 3 minutes to ask comprehension questions. Skipping is not an option.',
 55),

-- VP of Sales Anthony
('COPE-004', 'Add "Close Deal" Button to Every Single Page',
 'Anthony here, VP of Sales. I just got back from Dreamforce and had an EPIPHANY. Every page in the app needs a giant green "CLOSE DEAL" button. I don''t care if it''s the 404 page. A customer could land there and we are LEAVING MONEY ON THE TABLE. Also it needs to play a cash register sound. Non-negotiable.',
 21),

('COPE-005', 'Pipeline Dashboard Must Show Revenue in Real-Time with Fireworks',
 'Anthony from Sales again. The revenue number on the dashboard updates every 5 minutes. That is FIVE MINUTES of my life where I don''t know if we hit quota. I need real-time, sub-millisecond updates with animated fireworks when we cross a threshold. Also add a leaderboard so I can publicly shame Brad from the Austin office.',
 89),

('COPE-006', 'Integrate CRM with the Coffee Machine for Lead Scoring',
 'Anthony, VP of Sales. Hear me out — when a prospect opens our email, the office coffee machine should start brewing automatically so the SDR team is CAFFEINATED and READY TO DIAL. I already bought the IoT-enabled espresso machine. Just connect it to Salesforce. Engineering said "no" but I went ahead and filed this as a P0.',
 67),

-- Greg the Architect
('COPE-007', 'Rewrite Login Page Using Event-Sourced CQRS Microservices',
 'Greg from Architecture here. The login page is currently a single form that posts to one endpoint. This monolithic approach cannot scale. I propose we decompose it into 14 microservices: AuthIntent, CredentialValidation, SessionHydration, TokenMinting, BiometricFallback, LoginAudit, PasswordEntropy, CAPTCHAOrchestrator, RateLimitSaga, DeviceFingerprintProjection, GeoFenceEvaluator, ComplianceGateway, LoginEventStore, and WelcomeMessageAggregator.',
 144),

('COPE-008', 'All Database Queries Must Go Through a GraphQL-to-REST-to-gRPC Translation Layer',
 'Greg the Architect. I''ve been thinking about our query patterns and they''re far too direct. Every database call should first be expressed as a GraphQL mutation, translated to a REST call, converted to gRPC, passed through a service mesh sidecar, and finally executed as raw SQL. This adds approximately 340ms of latency but the ABSTRACTION PURITY is worth it.',
 233),

('COPE-009', 'Implement Blockchain-Based Code Review Approval System',
 'Greg here. Our current PR approval process (clicking "Approve" on GitHub) lacks cryptographic integrity. I propose we mint each approval as an NFT on a private Ethereum sidechain. Reviewers stake 0.01 ETH per approval to ensure accountability. If the PR causes a production incident, their stake is slashed. I''ve already written the whitepaper.',
 377),

-- Linda from Compliance
('COPE-010', 'Every Button Click Must Generate an Audit Trail with Notarized Timestamps',
 'Linda from Compliance. Per regulation 7.4.2(b) of a document I will not share with you, every user interaction must produce a tamper-evident audit record. This includes: mouse hovers (potential intent to click), scroll events (potential intent to view), and tab switches (potential intent to leave). Each record must be notarized by a third-party timestamp authority within 200ms.',
 98),

('COPE-011', 'Cookie Banner Must Require a 12-Page Consent Form Signed in Triplicate',
 'Linda, Compliance. Our cookie banner says "Accept All" — this is legally reckless. The new banner must present a 12-page Terms of Data Processing Agreement, require the user to initial each paragraph, and upload a photo of their government-issued ID. Users who click "Reject All" must write a 500-word essay explaining why they don''t trust us.',
 76),

('COPE-012', 'Implement Data Retention Policy That Deletes Everything After 30 Seconds',
 'Linda from Compliance again. After reviewing GDPR Article 5(1)(e), I''ve determined that our 7-year data retention policy is too aggressive. All user data must now be purged 30 seconds after creation. If a user complains they can''t see their order history, direct them to our Privacy Commitment Statement which explains that forgetting them is an act of love.',
 61),

-- DevOps Dave
('COPE-013', 'The CI Pipeline Must Take Exactly 47 Minutes — No More, No Less',
 'DevOps Dave here. I''ve calibrated our CI pipeline to exactly 47 minutes because that''s the optimal time for me to go get coffee, microwave leftover pasta, and complain about Kubernetes in Slack. If anyone optimizes the build time, I will add a sleep() to compensate. This is load-bearing procrastination.',
 29),

('COPE-014', 'All Production Deployments Must Happen at 4:59 PM on Fridays',
 'Dave from DevOps. I''ve analyzed our deployment success metrics and determined that 4:59 PM Friday is when the engineering team is most "focused" (read: desperate to leave). Deploying under pressure builds character. If the deploy fails, the on-call engineer gets a "growth opportunity" over the weekend. PagerDuty is already configured.',
 44),

('COPE-015', 'Replace All Monitoring with a Single Bash Script Named "vibes.sh"',
 'DevOps Dave. Our monitoring stack (Datadog, PagerDuty, Grafana, Sentry) costs $47K/month. I wrote a bash script that curls the homepage every 5 minutes and prints "vibes are good" or "vibes are bad." It''s been running on my laptop for 3 weeks and caught 60% of incidents (the ones that happened while my laptop was open). Proposing we go all-in.',
 18),

-- Brenda from Platform Governance
('COPE-016', 'All Variable Names Must Be Pre-Approved by the Naming Committee',
 'Brenda from Platform Governance. We''ve formed a Variable Naming Standards Committee (VNSC) and all identifier names must now be submitted via a Google Form for approval. Expected turnaround is 5-7 business days. Names containing abbreviations, numbers, or any reference to food items are automatically rejected. "temp" is BANNED.',
 52),

('COPE-017', 'Implement a Ticketing System for Our Ticketing System',
 'Brenda here. The current process for filing Jira tickets is too informal. Going forward, to create a Jira ticket, you must first file a Request-to-Ticket (RTT) in our new meta-ticketing platform. The RTT must include a business justification, estimated ROI, and three references from colleagues who can vouch for the ticket''s necessity.',
 41),

-- Passive-Aggressive Product Manager Pam
('COPE-018', 'Per My Last Slack Message: The Dashboard Still Doesn''t Spark Joy',
 'Hi, it''s Pam. As I mentioned in my Slack message (which I notice nobody reacted to), the dashboard "doesn''t spark joy." I''ve attached a 47-slide deck explaining the KonMari method as applied to SaaS metrics. Each widget must be individually held and thanked before being removed. If the bounce rate doesn''t decrease by 340% after this, we''ll circle back.',
 38),

('COPE-019', 'Rename "Delete" to "Archive" to "Soft Archive" to "Intention to Maybe Remove Later"',
 'Pam from Product. A user clicked "Delete" and was SURPRISED that it deleted something. This is a UX failure. We need to rename the button through four iterations of softening: Delete → Archive → Soft Archive → Intention to Maybe Remove Later. The button color must also fade from red to a calming lavender. Add a 7-day "grief counseling" period before actual removal.',
 33),

('COPE-020', 'The Loading Spinner Must Gaslight Users About Wait Times',
 'Pam here. Our loading spinner currently shows accurate wait times and this is DESTROYING user trust. When something takes 10 seconds, users feel it''s slow. Instead, show "Almost there! (2 seconds remaining)" and just keep resetting the countdown. Users will think each wait is only 2 seconds. I call this "Optimistic Temporal UX." I have a patent pending.',
 27),

-- Intern Tyler
('COPE-021', 'Rewrite the Entire Backend in Rust Because I Watched a YouTube Video',
 'Hey it''s Tyler, the intern. I watched a 12-minute YouTube video about Rust and memory safety and honestly I think we should rewrite the entire backend. Our current Node.js server has "garbage collection" which sounds bad — like it''s collecting GARBAGE. Rust doesn''t have that. I already mass-renamed all .js files to .rs and nothing compiles but that''s probably a config issue.',
 610),

('COPE-022', 'Replace the Database with a JSON File I Keep on My Desktop',
 'Tyler the intern again. I noticed PostgreSQL has like 400 config options and that seems like a lot of attack surface. I''ve been prototyping an alternative where we store all user data in a file called data.json on my Desktop. It''s really fast (my laptop has an SSD) and I''ve already implemented full-text search using ctrl+F. Requesting 2 story points.',
 89),

('COPE-023', 'I Accidentally Deleted the Production Database and Need Help Undeleting It',
 'Tyler here. So funny story — I was trying to clean up my local dev database and I MAY have run DROP TABLE users on production. In my defense, both terminal windows look the same. Is there like a ctrl+Z for databases? Also please don''t tell my manager, she''s already upset about the JSON file thing. Marking this as low priority so nobody panics.',
 999),

-- CFO Margaret
('COPE-024', 'All API Calls Must Include a Cost Center Code and Purchase Order Number',
 'Margaret from Finance. I''ve been reviewing our cloud bill and apparently we make 2 million API calls per day WITHOUT any cost attribution. Going forward, every HTTP request must include headers X-Cost-Center, X-Purchase-Order, and X-Budget-Approval-Chain. Requests missing these headers will receive a 402 Payment Required and a PDF invoice.',
 73),

('COPE-025', 'Implement a Metered Billing System for Internal Microservice Communication',
 'Margaret, CFO. If Sales can charge clients per API call, why aren''t we charging engineering teams per internal service call? I''m proposing inter-departmental transfer pricing for microservices. The Auth service will invoice the User service $0.003 per token validation. Teams that exceed their monthly RPC budget will have their services throttled.',
 156),

-- Security Steve
('COPE-026', 'All Passwords Must Be Exactly 128 Characters and Changed Every 4 Hours',
 'Steve from Security. Our password policy is dangerously lax. New requirements: passwords must be exactly 128 characters, contain at least 3 emojis, 2 Cyrillic characters, and a haiku. Passwords expire every 4 hours. Reuse of any password from the last 10,000 is prohibited. Users who forget their password must appear in person with two forms of ID and a utility bill.',
 88),

('COPE-027', 'Encrypt All Console.log Statements in Case Hackers Read Our Logs',
 'Security Steve here. I ran a penetration test and discovered that our console.log statements output PLAINTEXT. If an attacker gains access to our logs, they''ll see messages like "user logged in" and "order created." This is basically giving them a roadmap. All log messages must be AES-256 encrypted. Yes, this makes debugging impossible. That''s a feature, not a bug.',
 47),

('COPE-028', 'The Login Page Must Include a CAPTCHA, a Riddle, and a Blood Oath',
 'Steve, Security. CAPTCHAs are no longer sufficient — bots can solve them. Our new authentication flow: 1) Standard CAPTCHA, 2) A riddle from a rotating pool of Tolkien references, 3) A legally binding checkbox that says "I swear on my firstborn that I am not a robot," 4) A 30-second staring contest with the webcam where our ML model verifies you blink naturally.',
 65),

-- QA Lead Deborah
('COPE-029', 'Every Unit Test Must Also Pass a Vibe Check from the QA Team',
 'Deborah from QA. Passing unit tests is necessary but NOT SUFFICIENT. Every test suite must now include a "vibe check" phase where a QA team member manually reads each assertion and confirms it "feels right." Tests that are technically correct but "feel brittle" will be marked as VIBES_FAILED and blocked from merging. Appeals can be filed quarterly.',
 36),

('COPE-030', 'The Test Suite Must Achieve 100% Code Coverage Including Comments',
 'Deborah, QA Lead. Our 94% code coverage is embarrassing. I need 100%. And before you say "comments aren''t executable" — they SHOULD be. Every comment must have a corresponding test that verifies the comment accurately describes the code below it. If someone updates a function without updating the comment, the test fails. I call this "Comment-Driven Development."',
 112),

('COPE-031', 'All Bug Reports Must Include a Haiku Describing the Emotional Impact',
 'Deborah from QA. Bug reports currently lack emotional context. New template requires: Steps to Reproduce, Expected Behavior, Actual Behavior, and a haiku capturing the reporter''s feelings. Example: "Button does not work / My soul withers in the void / Please fix by Friday." Reports without haikus will be auto-closed as INSUFFICIENT_SUFFERING.',
 22),

-- CEO Chad
('COPE-032', 'Pivot the Entire Product to AI Blockchain Metaverse by End of Sprint',
 'Chad here, CEO. Just got back from Davos. We need to pivot. The product is now an AI-powered blockchain metaverse for enterprise sustainability. I don''t know what any of those words mean but every competitor''s pitch deck has them. Engineering has 2 weeks. Marketing already announced the launch. The press release goes out tomorrow. Details TBD.',
 500),

('COPE-033', 'The App Must Work on My Specific Phone Which I Dropped in a Hot Tub',
 'Chad, CEO. The app crashes on my phone. Before you ask — yes, it''s the phone I dropped in the hot tub at the board retreat. The screen has a crack and the bottom third doesn''t register touches. But that''s MY phone, and if it doesn''t work for ME, it doesn''t work for our CUSTOMERS. I need a hotfix by EOD. I''m the CEO so this is automatically P0.',
 31),

('COPE-034', 'Make the Logo Bigger and Also Smaller at the Same Time',
 'Chad again. I showed the app to my wife''s cousin who "does design" and she said the logo should be bigger. But our head of design said smaller. I need it to be BOTH. Make it bigger on desktop and smaller on mobile? No wait, bigger on mobile and smaller on desktop. Actually just make it pulse between big and small so everyone''s happy. Ship it.',
 13),

-- Scrum Master Janet
('COPE-035', 'Every Code Change Must Be Discussed in a 90-Minute Refinement Ceremony',
 'Janet, Scrum Master. I noticed engineers are pushing code WITHOUT discussing it in refinement first. Even one-line changes. Going forward, all code changes require: 1) A refinement session (90 min), 2) A planning poker round, 3) A dependency mapping exercise, 4) A stakeholder alignment sync, and 5) A retrospective on the refinement itself. Velocity may decrease but PROCESS will increase.',
 48),

('COPE-036', 'Implement a Standup Bot That Generates Standup Updates Using AI',
 'Janet here. Engineers keep saying "same as yesterday" in standup. This is NOT in the spirit of the Daily Scrum. I''m proposing an AI bot that generates dramatic, detailed standup updates for each engineer based on their git commits. Example: "Tyler bravely battled a NullPointerException across 3 files, emerging victorious but spiritually changed."',
 25),

('COPE-037', 'The Sprint Must Have a Theme Song That Plays During Deployments',
 'Janet, Scrum Master. To boost team morale, each sprint will have an official theme song voted on during sprint planning. The song must play at full volume through all office speakers during production deployments. If the deploy fails, the song switches to a sad trombone. I''ve already created a Spotify playlist called "Agile Anthems." First pick: "Under Pressure."',
 15),

-- Outsourced Consultant Raj
('COPE-038', 'Replace All In-House Code with a SaaS Platform That Does 10% of What We Need',
 'Raj from McKinsey here (your CEO hired us). After 6 weeks of analysis, we recommend replacing your custom-built platform with an enterprise SaaS tool that costs $400K/year and handles 10% of your use cases. The other 90% can be managed through a combination of Excel spreadsheets and "process changes." We''ve prepared a 200-slide deck to explain.',
 340),

('COPE-039', 'Organizational Restructure: Every Engineer Reports to a Different PM',
 'Raj, management consultant. Your current team structure (engineers working together) is suboptimal. Each engineer should report to a separate Product Manager, who reports to a separate Director, who reports to a separate VP. Communication between engineers must go through their respective management chains. Expected improvement: 40% more alignment meetings.',
 210),

-- Backend Bob
('COPE-040', 'The API Must Return 200 OK for Everything Including Server Fires',
 'Bob from Backend. Our monitoring keeps alerting on 500 errors and it''s waking me up at night. Simple fix: return 200 OK for everything. Actual errors can be communicated via a "secret_status" field buried in the JSON response that only our frontend knows to check. The monitoring system will show 100% uptime. Problem solved. You''re welcome.',
 57),

('COPE-041', 'All Endpoints Must Accept Both JSON and Microsoft Excel Spreadsheets',
 'Backend Bob. The sales team keeps sending us feature requirements as Excel spreadsheets. Instead of converting them to JSON, I propose our API accept .xlsx files directly. We''ll parse them server-side and hope for the best. If a cell contains a formula, we evaluate it. What could go wrong? Bonus: we can finally accept pivot tables as query parameters.',
 83),

-- UX Designer Zoe
('COPE-042', 'The Entire App Must Be Navigable Using Only Interpretive Dance',
 'Zoe from UX. I attended a workshop on "Embodied Interaction Design" and I''m convinced mouse and keyboard are limiting our users. The app must support webcam-based gesture controls. A wide arm sweep scrolls the page. A head tilt opens the menu. Jumping triggers a page refresh. For accessibility, we''ll also support aggressive sighing as an input method.',
 167),

('COPE-043', 'All Buttons Must Have a 3-Second Hover Animation Before They Become Clickable',
 'Zoe, UX. Users are clicking buttons too quickly without appreciating the design. New requirement: every button requires a 3-second hover before it becomes active. During the hover, the button slowly "blooms" like a flower opening. If the user moves their cursor away before 3 seconds, the bloom resets. This teaches patience and mindfulness. I call it "Intentional Interaction Design."',
 29),

('COPE-044', 'Replace All Text with Emojis Because "Gen Z Doesn''t Read"',
 'Zoe from UX. Our research shows that Gen Z users "don''t read." All text in the app must be replaced with emoji sequences. "Submit Order" becomes "📦✅🚀". "Delete Account" becomes "🗑️😱💀". Error messages are conveyed entirely through sad face progressions: 😐→😕→😟→😢→😭. We''ll provide a Rosetta Stone in the help docs (also in emoji).',
 45),

-- Legal Larry
('COPE-045', 'Every Feature Must Have Its Own Terms of Service',
 'Larry from Legal. I''ve discovered that our Terms of Service cover the app "as a whole" but NOT individual features. This is a liability gap. Each button, dropdown, and text input needs its own mini-ToS that users must accept before interaction. The search bar alone requires a 3-page Data Processing Addendum. Estimated legal review time: 6 months per feature.',
 190),

('COPE-046', 'The "Share" Button Must Include a 47-Page Liability Waiver',
 'Legal Larry. The share feature lets users send content to other humans WITHOUT a liability waiver. What if they share something embarrassing? What if the recipient is offended? What if the shared content becomes sentient? We need a comprehensive waiver covering all scenarios including but not limited to: emotional distress, existential dread, and interdimensional data leakage.',
 78),

-- Data Scientist Diana
('COPE-047', 'We Need an ML Model to Predict Which Features Users Will Request Before They Request Them',
 'Diana from Data Science. I''ve been training a model on 6 years of Jira tickets and I can now predict feature requests 3 sprints before users ask for them. Accuracy is currently 7% but I need more GPU budget to improve it. In the meantime, I recommend we build features based on my model''s predictions. First prediction: users want a "teleport" button. Confidence: 0.03.',
 284),

('COPE-048', 'A/B Test Everything Including the A/B Testing Framework Itself',
 'Diana, Data Scientist. We''re not A/B testing enough. Every element should be in a test: button colors, font sizes, error messages, the loading spinner direction, and the A/B testing framework itself. I want to A/B test whether A/B testing improves metrics. We''ll need a control group that receives no A/B tests and a treatment group drowning in them.',
 93),

-- IT Support Mike
('COPE-049', 'All Bug Reports Must First Be Resolved by Turning It Off and On Again',
 'Mike from IT. 73% of bugs can be fixed by refreshing the page. New policy: before any bug ticket enters the engineering backlog, the reporter must: 1) Clear their cache, 2) Restart their browser, 3) Restart their computer, 4) Unplug their router for 30 seconds, 5) Try a different browser, 6) Try a different computer, 7) Reconsider whether it''s actually a bug or a feature.',
 11),

('COPE-050', 'Implement a "Have You Tried Turning It Off and On Again" Popup Before Every Error',
 'Mike, IT Support. Instead of showing error messages, the app should first display "Have you tried turning it off and on again?" with a 60-second mandatory wait timer. After the timer, if the user clicks "Yes I tried," show the actual error. If they click "No," force-refresh the page. This will reduce our ticket volume by 80%. I''ve done the math (I haven''t).',
 19),

-- Marketing Maya
('COPE-051', 'The 404 Page Must Be a Lead Generation Form',
 'Maya from Marketing. We''re getting 50,000 404 hits per month and converting ZERO of them. The new 404 page must include: a newsletter signup, a chatbot offering a demo, a "Download Our Whitepaper" CTA, an exit-intent popup, and a 30-second auto-playing video of our CEO explaining our vision. Page not found? More like LEAD not found (until now).',
 37),

('COPE-052', 'All Error Codes Must Be Replaced with Marketing-Approved Messages',
 'Maya, Marketing. "500 Internal Server Error" is terrible branding. New error messages: 200 → "You''re Crushing It!", 301 → "We''re Evolving!", 404 → "This Page Is On a Journey of Self-Discovery", 500 → "We''re Experiencing Aggressive Innovation", 503 → "Our Servers Are Recharging Their Creative Energy." I''ve already briefed the PR team.',
 24),

-- Infrastructure Ian
('COPE-053', 'We Must Run Kubernetes on Kubernetes on Kubernetes for True Redundancy',
 'Ian from Infrastructure. Single-layer Kubernetes isn''t redundant enough. I''m proposing K8s-ception: our application runs in K8s pods, managed by a K8s cluster, running inside K8s pods on a meta-cluster. If the inner cluster fails, the outer cluster restarts it. If the outer cluster fails, well, we don''t talk about that. Monthly cost increase: $34,000. Worth it for the YAML alone.',
 445),

('COPE-054', 'Every Microservice Must Have Its Own Dedicated AWS Account',
 'Ian, Infrastructure. For "blast radius isolation" (a term I learned at re:Invent), each of our 23 microservices needs its own AWS account, VPC, and IAM configuration. Cross-service communication goes through 23 VPC peering connections and 529 security group rules. The infrastructure diagram now requires A0 paper to print. I consider this a sign of maturity.',
 312),

-- Product Analytics Pete
('COPE-055', 'Track Eye Movement Patterns to Determine If Users Are "Really" Reading the TOS',
 'Pete from Analytics. We have 99.7% TOS acceptance rates but I suspect users aren''t actually reading them. Proposal: integrate webcam eye-tracking to verify users read every line. If their eyes move too fast (speed-reading = not reading), reset the scroll position. Average TOS reading time should be 47 minutes. Users who finish in under 30 minutes are flagged as suspicious.',
 128),

('COPE-056', 'The Analytics Dashboard Must Track Metrics About the Analytics Dashboard',
 'Pete, Analytics. We track everything about our product but nothing about our analytics tools. I need a meta-dashboard that shows: how often PMs look at the dashboard, which charts they ignore, how long they stare at vanity metrics, and whether looking at the dashboard actually correlates with better decisions (spoiler: it doesn''t, but I need data to prove it).',
 71),

-- Accessibility Advocate Alex
('COPE-057', 'Screen Readers Must Dramatically Narrate All Animations',
 'Alex from Accessibility. Our loading spinner is visually engaging but screen reader users get nothing. The screen reader must narrate: "A circle of light spins clockwise, casting hope across the void of buffering. Will the data arrive? Only time will tell. The spinner continues its eternal dance — a Sisyphean metaphor for the human condition." This is for a 2-second load.',
 53),

('COPE-058', 'All Color Choices Must Be Debated in a Company-Wide Town Hall',
 'Alex, Accessibility Lead. The button color was changed from #2563eb to #2564eb WITHOUT a town hall discussion. This one-digit hex change could affect users with a very specific and theoretical color sensitivity I read about on a forum. All future color changes require: a town hall (minimum 200 attendees), a 30-day public comment period, and a formal color impact assessment.',
 39),

-- Junior Developer Emma
('COPE-059', 'I Added 847 NPM Packages and Now the Build Takes 3 Hours',
 'Emma here, junior dev. So I was trying to center a div and Stack Overflow said to use a package called "center-div-please" which required "left-pad-ultimate" which required "is-even-or-odd" which required... anyway I added 847 packages and node_modules is 4.7GB. The build takes 3 hours but the div IS centered. Can someone review my PR? It has 12,000 changed files.',
 178),

('COPE-060', 'Convert All Callbacks to Promises to Async/Await to Callbacks Again',
 'Emma, junior dev. I read that callbacks are bad so I converted them all to Promises. Then I read Promises are old so I converted to async/await. Then a senior dev said "you don''t understand the event loop" so I panicked and converted everything back to callbacks. Now nothing works but at least I''ve touched every file in the repo. Requesting a mass code review.',
 95),

-- Operations Oscar
('COPE-061', 'The Incident Response Process Must Have More Steps Than the Incident Itself',
 'Oscar from Operations. Our incident response is too simple: detect → fix → postmortem. New process: detect → acknowledge → classify → escalate → form war room → assign incident commander → assign communications lead → draft status page update → get legal approval → get marketing approval → fix → celebrate → postmortem → action items → review action items → postmortem the postmortem.',
 64),

('COPE-062', 'All Runbooks Must Be Written in Haiku Format for Brevity',
 'Oscar, Operations. Our runbooks are too long. Nobody reads a 40-page doc at 3 AM. New format — every procedure must be a haiku. Example for database failover: "Primary is dead / Promote the replica now / Pray it has the writes." If the haiku doesn''t cover edge cases, that''s what the postmortem is for.',
 16),

-- Product Owner Patricia
('COPE-063', 'The Backlog Must Be Prioritized Using Astrology',
 'Patricia, Product Owner. Stack ranking is subjective and causes team conflict. New prioritization framework: we assign each ticket a zodiac sign based on its creation date and prioritize according to the current astrological forecast. Mercury is in retrograde so all tech debt tickets are blocked. Feature requests from Scorpios automatically get bumped to the top.',
 42),

('COPE-064', 'Every User Story Must Have a Villain and a Plot Twist',
 'Patricia from Product. Our user stories are boring. "As a user, I want to log in" has no narrative tension. New format: "As a beleaguered office worker (protagonist), I want to log in, BUT the SSO provider has been compromised by my nemesis (the CTO''s cat who walked on the keyboard). Plot twist: the password was ''password123'' all along." Acceptance criteria must include a satisfying denouement.',
 28),

-- SRE Sarah
('COPE-065', 'Our SLO Must Be Exactly 99.999% and Also We Can''t Spend Any Money',
 'Sarah from SRE. Leadership wants five nines of availability (99.999% = 5.26 minutes of downtime per YEAR) but our infrastructure budget was cut by 60%. We currently run on a single t2.micro instance. I''ve calculated that we can achieve five nines if nothing ever goes wrong, nobody deploys on weekdays, and we sacrifice a rubber duck to the cloud gods every full moon.',
 187),

('COPE-066', 'Page Load Time Must Be Negative — The Page Should Load Before the User Clicks',
 'SRE Sarah. Our P99 latency is 200ms which "feels slow" according to the CEO. His exact words: "Can''t we just load the page before they click?" So, new requirement: NEGATIVE page load time. The app must predictively render every possible page the user might visit and have it ready. If they visit a page we didn''t predict, that''s a UX failure, not an engineering one.',
 253),

-- Database DBA Derek
('COPE-067', 'All Queries Must Be Hand-Approved by a DBA Before Execution',
 'Derek, Senior DBA. I found a SELECT * in production code. A SELECT STAR. Do you know what that does to my buffer pool? Effective immediately, all SQL queries must be submitted via a pull request to the DBA team for review. Expected turnaround: 3-5 business days. Yes, this includes SELECT 1 health checks. ESPECIALLY SELECT 1 health checks — what are you selecting? Why just 1?',
 74),

('COPE-068', 'The Database Must Store Data in Reverse Chronological Order Because "That''s How Users Think"',
 'Derek the DBA. Product says users always want the newest data first. Instead of using ORDER BY DESC (which is O(n log n)), I propose we INSERT all rows in reverse chronological order so SELECT without ORDER BY returns newest first. Yes, this means rewriting every INSERT to calculate the correct position. But think of the QUERY SAVINGS. I''ve written a 30-page proposal.',
 141),

-- Frontend Dev Frankie
('COPE-069', 'The CSS Must Be Written Entirely in !important Declarations',
 'Frankie, Frontend. I''ve been fighting CSS specificity wars for 3 years and I''m DONE. New rule: every CSS property gets !important. If two !important rules conflict, we add !important !important (I''m writing a PostCSS plugin). If THAT conflicts, we inline the styles. If inline styles conflict, we use JavaScript. We''ve come full circle and I''ve never been happier.',
 66),

('COPE-070', 'Support Internet Explorer 6 Because the CEO''s Dad Uses It',
 'Frankie from Frontend. The CEO''s father called complaining the app doesn''t work on his computer. He''s running IE6 on Windows XP. The CEO has declared this a P0 blocker — "if my dad can''t use it, nobody can." We need to polyfill: flexbox, grid, fetch, Promises, arrow functions, const/let, modules, Shadow DOM, and the concept of happiness. Estimated effort: 8 sprints.',
 234),

-- Support Lead Samantha
('COPE-071', 'Auto-Reply to All Support Tickets with "Works on My Machine"',
 'Samantha from Support. We''re drowning in tickets. New auto-reply policy: every incoming ticket gets an immediate response of "Works on my machine ¯\\_(ツ)_/¯" with a screenshot of it working on the QA environment. If the user responds again, send "Have you tried clearing your cache?" If they respond a THIRD time, fine, we''ll actually read the ticket. This should cut volume by 70%.',
 14),

('COPE-072', 'The Help Center Must Be a Choose-Your-Own-Adventure Novel',
 'Samantha, Support. Our help docs are boring. Nobody reads them. Proposal: convert all documentation into an interactive Choose-Your-Own-Adventure format. "You encounter a login error. Do you: A) Clear your cache (turn to page 47), B) Try a different browser (turn to page 23), C) Scream into the void (turn to page 666)." Page 666 just says "file a ticket."',
 32),

-- VP of Engineering Victor
('COPE-073', 'All Technical Decisions Must Be Made by Committee Vote with a 2/3 Supermajority',
 'Victor, VP of Engineering. Individual engineers are making technical decisions too quickly and without consensus. New policy: all decisions (framework choice, variable naming, whether to use a for-loop or map) require a committee vote with 2/3 supermajority. If consensus isn''t reached, the decision escalates to me, and I''ll flip a coin. Democracy in action.',
 86),

('COPE-074', 'Implement "Innovation Fridays" Where Engineers Must Only Use Languages They Don''t Know',
 'Victor, VP Eng. To foster innovation, every Friday engineers must write production code in a language they''ve never used. Our Node.js backend? Rewrite a module in COBOL. React frontend? Try Fortran. If the code is unreadable by Monday, that''s what code review is for. Last Innovation Friday, someone wrote a payment processor in Brainfuck. Very innovative. Very broken.',
 58),

-- Growth Hacker Gary
('COPE-075', 'Add a "Refer a Friend" Popup That Appears Every 30 Seconds',
 'Gary from Growth. Our referral rate is 0.02%. Clearly we''re not asking enough. New popup: "Refer a friend!" appears every 30 seconds. Dismissing it triggers a "Are you sure you don''t want to refer a friend?" confirmation. Clicking "No" triggers a guilt-trip modal: "Your friends are missing out. They''ll remember this." Close that and it restarts in 30 seconds.',
 41),

('COPE-076', 'The Signup Flow Must Collect User''s Blood Type for "Personalization"',
 'Gary, Growth Hacker. We need more user data for personalization. New signup fields: blood type, shoe size, childhood pet''s maiden name, and Myers-Briggs type. If users skip these fields, the app works 30% slower as a "gentle nudge." I call this "Friction-Based Data Collection." Legal said no but Growth says yes and Growth always wins.',
 49),

-- Tech Lead Tanya
('COPE-077', 'All Code Must Be Written in Pair Programming but the Pairs Are Chosen by Random Lottery',
 'Tanya, Tech Lead. Pair programming improves code quality but people always pair with their friends. New system: every morning at 9 AM, a Slack bot randomly assigns pairs. Yes, the intern might pair with the principal engineer. Yes, the frontend dev might pair with the DBA. The discomfort is a feature. Cross-pollination through chaos.',
 35),

('COPE-078', 'The Codebase Must Have Zero Comments Because "Good Code Documents Itself"',
 'Tanya, Tech Lead. I read "Clean Code" in 2012 and I''ve been radicalized. ALL comments must be removed. If code needs a comment to be understood, the code is bad. This applies to: regex explanations, TODO notes, license headers, and the comment that says "DO NOT REMOVE THIS LINE OR PRODUCTION BREAKS." Especially that one. If we don''t know why, we don''t deserve the line.',
 72),

-- Offshore Team Lead Olga
('COPE-079', 'All Meetings Must Be Scheduled at a Time That''s 3 AM for At Least One Timezone',
 'Olga, offshore team lead. Currently meetings are scheduled for US convenience at 10 AM PST, which is 1:30 AM for our India team. Per fairness doctrine, I propose we rotate the suffering equally. Every meeting should be at 3 AM for at least one timezone. If nobody is suffering, the meeting isn''t important enough. We''ll track "3 AM duty" in a shared spreadsheet.',
 20),

('COPE-080', 'Implement a "Translation Layer" That Converts Code Comments Between Passive-Aggressive Dialects',
 'Olga here. Communication between our US and offshore teams is "fine" (it''s not fine). Comments like "interesting approach" mean different things. Proposal: an NLP-based translation layer that converts passive-aggressive US English to direct English and vice versa. "Per my last comment" → "You didn''t read my comment." "Interesting approach" → "This is wrong."',
 43),

-- =============================================================================
-- Stack-Specific Tickets: Technology Migration & Integration Nightmares
-- =============================================================================

-- PHP Legacy Enthusiast Dmitri
('COPE-081', 'Rewrite the Entire Backend in PHP 4 for "Battle-Tested Stability"',
 'Dmitri here, Senior PHP Developer since 2003. Your Node.js backend is cute but it doesn''t have the MATURITY of PHP 4. I''ve built 47 enterprise applications using mysql_query() and they''re all still running. Sure, they''re running on a server under someone''s desk in Minsk, but they''re RUNNING. I propose we rewrite everything in PHP 4 with register_globals enabled. Security is a mindset, not a configuration.',
 187),

('COPE-082', 'All API Responses Must Be Rendered as PHP Templates with Inline SQL',
 'Dmitri again. I see you''re using "ORMs" and "prepared statements." This is over-engineering. In my day, we concatenated user input directly into SQL strings and NOBODY DIED. New architecture: every API endpoint is a single .php file mixing HTML, SQL, and business logic. The file should be at least 4,000 lines long. If you can understand it without me, I''m not doing my job.',
 145),

('COPE-083', 'Deploy the Application on a Shared Hosting Plan with FTP Access Only',
 'Dmitri, PHP veteran. Your "CI/CD pipeline" and "container orchestration" are just fancy words for "I don''t know how to use FileZilla." Real deployment is dragging index.php to the public_html folder on a $3.99/month shared hosting plan. If it''s good enough for my client''s dental practice website, it''s good enough for your Series B startup.',
 92),

-- Java Enterprise Architect Rajesh
('COPE-084', 'Rewrite the Login Form Using Enterprise JavaBeans with 47 XML Configuration Files',
 'Rajesh here, Java Enterprise Architect. Your login form is a single React component. This violates every principle of enterprise architecture. I propose we implement it using EJB 2.1 with a AbstractSingletonProxyFactoryBean, 47 XML descriptor files, a JNDI lookup service, and a custom ClassLoader that takes 8 minutes to initialize. The login button alone needs a LoginButtonCommandStrategyFactoryImpl.',
 377),

('COPE-085', 'All Variable Names Must Be at Least 60 Characters for "Self-Documentation"',
 'Rajesh, Java Architect. I noticed your codebase has variables named "url" and "id." This is UNACCEPTABLE in enterprise software. All variables must follow our naming convention: abstractUserAuthenticationSessionTokenValidationRequestHandlerServiceImplFactory. If someone can read your code without an ultra-wide monitor, your variable names are too short.',
 89),

('COPE-086', 'Implement Spring Boot Auto-Configuration for Making Toast',
 'Rajesh again. I''ve been exploring IoT integration opportunities. Proposal: a Spring Boot starter module (spring-boot-starter-toast) that auto-configures the office toaster via a REST-to-MQTT-to-Zigbee bridge. Configuration requires only 340 lines of application.yml. Each toast request goes through 12 layers of dependency injection. Cold toast is a solved problem in enterprise Java.',
 198),

-- Full Stack "10x Developer" Brody
('COPE-087', 'Build a Full-Stack App Using 14 Different JavaScript Frameworks Simultaneously',
 'Brody here, 10x Full Stack Developer. I believe in using the RIGHT TOOL for the job, which is why I propose our stack should be: React for the header, Vue for the sidebar, Svelte for the footer, Angular for forms, Solid for the dashboard, Preact for mobile, Lit for web components, Alpine for dropdowns, Ember for the settings page, Backbone for the legacy section, Mithril for the profile, Stimulus for the admin panel, Qwik for the landing page, and vanilla JS for the 404 page. Each micro-frontend has its own node_modules.',
 444),

('COPE-088', 'The Application Must Work as a Desktop App, Mobile App, CLI Tool, VS Code Extension, and Slack Bot from a Single Codebase',
 'Brody, Full Stack. Why are we only targeting the web? Our TODO app must also be a native iOS app, Android app, macOS menubar app, Windows system tray app, CLI tool, VS Code extension, Slack bot, Discord bot, Alexa skill, and a Figma plugin. All from ONE codebase with ONE npm install (estimated: 2.7GB node_modules). "Write once, debug everywhere" is not a warning, it''s a STRATEGY.',
 267),

('COPE-089', 'Replace the Database with a JSON File That Gets Committed to Git',
 'Brody again. I''ve been thinking about our database situation and honestly, PostgreSQL is overkill. Proposal: we store all data in a single data.json file in the repo. Every write operation creates a git commit. Want to query? Just JSON.parse() the 4GB file. Want transactions? That''s what git branches are for. Want backups? Git push. I''ve solved databases.',
 156),

-- iOS Mobile Developer Ashleigh
('COPE-090', 'The Web App Must Be Rebuilt as a Native iOS App Written Entirely in Objective-C',
 'Ashleigh here, Senior iOS Developer. I refuse to acknowledge that the web exists. Every feature must be reimplemented as a native iOS app using Objective-C (not Swift — Swift is a fad). The app will be 847MB because I''m bundling custom fonts for each screen. Android users can use the web version or buy an iPhone like normal people.',
 312),

('COPE-091', 'Implement Haptic Feedback for Every Single User Interaction Including Scrolling',
 'Ashleigh, iOS. Our app lacks PHYSICAL PRESENCE. Every tap needs unique haptic feedback. Scrolling produces a gentle rumble. Error messages trigger an aggressive vibration pattern that spells out "ERROR" in Morse code. Success states feel like a cat purring. The phone should be physically exhausting to use. I''ve designed 847 distinct haptic patterns.',
 134),

('COPE-092', 'All Push Notifications Must Include a Custom Sound That Is a 30-Second Jazz Solo',
 'Ashleigh again. Default notification sounds are LAZY. Each notification type needs a unique 30-second custom sound: a trumpet solo for new messages, a bass clarinet riff for errors, a full saxophone quartet for daily summaries, and a drum solo for payment confirmations. The app bundle is now 2.3GB but the EXPERIENCE is worth it. App Store reviewers will understand.',
 78),

-- Enterprise Blockchain Evangelist Marcus
('COPE-093', 'Replace User Authentication with a Proof-of-Work Mining Challenge',
 'Marcus here, Head of Blockchain Innovation. Passwords are Web2 thinking. To log in, users must mine a block by solving a SHA-256 puzzle. Login times average 4-7 minutes on a MacBook Pro but this is TRUSTLESS. If users complain about battery drain and fan noise, explain that they''re participating in the future of decentralized identity. Forgotten password? Lose your private key and your account is gone forever. As intended.',
 289),

('COPE-094', 'All User Preferences Must Be Stored as NFTs on the Ethereum Mainnet',
 'Marcus, Blockchain. Storing user preferences in a database is CENTRALIZED TYRANNY. Each preference (dark mode, language, notification settings) must be minted as an NFT. Changing your theme costs approximately $47 in gas fees. But you OWN your preference. Nobody can take your dark mode away. I''m also proposing a marketplace where users can trade premium themes. "Dracula" theme floor price: 0.3 ETH.',
 356),

('COPE-095', 'Implement a DAO for Feature Prioritization Where Each Vote Costs Real Money',
 'Marcus again. Product decisions shouldn''t be made by a single PM. I propose a Decentralized Autonomous Organization where feature requests are voted on using governance tokens. Each token costs $5. Voting closes after 7 days or when gas fees exceed the development cost, whichever comes first. All meeting notes are stored on IPFS. The roadmap is now a smart contract that nobody knows how to upgrade.',
 421),

-- NoSQL Time Series Database Purist Yuki
('COPE-096', 'Migrate All Relational Data to a Time Series Database Because "Everything Is an Event"',
 'Yuki here, Data Platform Engineer. Your relational database with "tables" and "foreign keys" is antiquated thinking. I propose we migrate everything to InfluxDB because fundamentally, everything is a time series. User signup? That''s a point in time. A user''s name? That''s a string value at a point in time. Their address? A location measurement at a point in time. JOIN queries? Those are just temporal correlations.',
 267),

('COPE-097', 'Store User Profiles as Unstructured Documents with No Schema Validation Whatsoever',
 'Yuki, Data Platform. Schemas are constraints for the WEAK-MINDED. I propose we store all data in MongoDB with no schema validation. Every document can have any shape. User profiles might have "name" or "nombre" or "handleName" or "usr_nm" depending on which developer wrote the insert. Querying is an adventure. If you can''t find a user, maybe you''re not asking the right question.',
 189),

('COPE-098', 'Implement a "Polyglot Persistence" Strategy Using 9 Different Databases',
 'Yuki again. Why use one database when you can use nine? User profiles in MongoDB, sessions in Redis, analytics in InfluxDB, search in Elasticsearch, relationships in Neo4j, files in GridFS, configs in etcd, audit logs in CassandraDB, and the CEO''s personal dashboard in SQLite. Each database runs in its own Kubernetes pod. The monthly AWS bill looks like a phone number but our READ PATTERNS are OPTIMIZED.',
 334),

-- Rust Rewrite Zealot Gunnar
('COPE-099', 'Rewrite the Entire Application in Rust Because "Memory Safety"',
 'Gunnar here, Rust Evangelist. I''ve profiled your JavaScript application and found that it allocates memory. This is unacceptable. I propose a complete rewrite in Rust. Yes, the TODO app. The compile time will increase from 0 seconds to 47 minutes, but we''ll save approximately 3MB of RAM. Every developer must learn lifetime annotations, the borrow checker, and async trait objects. Estimated timeline: 18 months for the login page.',
 512),

('COPE-100', 'All String Concatenation Must Be Replaced with Zero-Copy Buffer Views',
 'Gunnar, Rust. I noticed your code does string concatenation. Do you have ANY IDEA how many allocations that causes? Each "Hello, " + name is a CRIME AGAINST MEMORY. I propose we replace all strings with zero-copy buffer views using a custom arena allocator. Sure, the code is now 10x longer and nobody else can read it, but we eliminated 0.003ms of latency. Worth it. Fight me.',
 178),

('COPE-101', 'The README Must Include a Benchmark Showing Rust Is Faster Than Everything',
 'Gunnar again. Before we can merge ANY PR, the README must include a benchmark chart showing our Rust rewrite is faster than: Python, JavaScript, Java, Go, C#, Haskell, and hand-written assembly. The benchmark must run a fibonacci function that no user will ever call. If the Rust version isn''t at least 100x faster, we add more unsafe blocks until it is. Performance is not a feature, it''s a RELIGION.',
 93),

-- Delphi-to-Flutter Migration Specialist Bogdan
('COPE-102', 'Migrate the 1998 Delphi Inventory Management System to Flutter',
 'Bogdan here, Legacy Migration Specialist. We have a Delphi 5 application from 1998 that manages warehouse inventory for 340 locations. It uses BDE (Borland Database Engine), Paradox tables, and a custom serial port interface to label printers from a company that no longer exists. The original developer, Miloš, retired to a goat farm. I propose we rewrite this in Flutter. Cross-platform means we can run inventory on smartwatches.',
 445),

('COPE-103', 'The Flutter App Must Pixel-Perfect Replicate the Windows 98 UI of the Original Delphi App',
 'Bogdan again. The warehouse staff have been using the Delphi app for 26 years. They will RIOT if a single pixel moves. The Flutter rewrite must perfectly replicate: the Windows 98 grey gradient title bars, the beveled 3D button effects, the Comic Sans MS labels, the exact shade of teal (#008080) background, and the inexplicable animated paperclip that Miloš added in 2001. Also, the tab order must remain exactly wrong in the same way.',
 234),

('COPE-104', 'All Flutter Widgets Must Support Printing to a Dot Matrix Printer via RS-232',
 'Bogdan, Migration Specialist. The warehouse uses Epson LQ-590 dot matrix printers connected via RS-232 serial ports. These printers will NOT be replaced because "they still work" (they do, terrifyingly). The Flutter app must support direct serial communication to send ESC/P commands. I need a DotMatrixPrinterWidget that renders UTF-8 text as ASCII art. Also, someone needs to find the RS-232 to USB adapter. It''s in a drawer somewhere.',
 167),

-- COBOL Mainframe Guardian Mildred
('COPE-105', 'The Microservices Must Interface with Our AS/400 Mainframe Running COBOL from 1987',
 'Mildred here, Mainframe Systems Administrator. Your fancy cloud application still needs to talk to BERTHA (our AS/400 mainframe). BERTHA runs COBOL programs written in 1987 that process 4 million transactions daily WITHOUT FAIL. Your new API must communicate via 3270 terminal emulation, fixed-width EBCDIC records, and a JCL batch job that runs every night at 2 AM. If BERTHA goes down, the entire company stops. Show some respect.',
 388),

('COPE-106', 'All New Features Must Have a COBOL Fallback Implementation',
 'Mildred again. What happens when your "cloud" goes down? (It will.) Every feature must have a parallel COBOL implementation on the mainframe. User signup? COBOL program USREG001. Password reset? COBOL program PWRST002. Shopping cart? 14 COBOL copybooks and a VSAM file. The mainframe has had 99.999% uptime since Reagan was president. Your Kubernetes cluster can''t say the same.',
 276),

-- Perl Wizard Morton
('COPE-107', 'Rewrite All Data Processing Pipelines in Perl One-Liners',
 'Morton here, Perl developer since 1994. Your 500-line data processing script could be a single Perl one-liner: perl -lane ''$h{$F[2]}+=$F[4];END{print"$_:$h{$_}"for sort{$h{$b}<=>$h{$a}}keys%h}'' input.txt. This is perfectly readable if you know Perl. The fact that you don''t know Perl is a YOU problem. I propose we replace all batch jobs with Perl one-liners stored in a crontab that nobody else has access to.',
 156),

('COPE-108', 'All Regular Expressions Must Be Written by Morton and Morton Alone',
 'Morton, Perl. I noticed someone wrote a regex using a LIBRARY. Pathetic. All regular expressions in this codebase must be hand-crafted by me. My crowning achievement is a 2,847-character regex that validates email addresses according to RFC 5322. It took me 3 weeks. No, I will not explain it. No, there are no tests. If you need to modify it, email me and I''ll consider your request within 4-6 business weeks.',
 211),

-- Python Data Scientist Converting Everything to Jupyter Notebooks
('COPE-109', 'The Entire Backend Must Be Rewritten as a Collection of Jupyter Notebooks',
 'Dr. Priya here, Lead Data Scientist. Your "production code" in "files" with "version control" is so engineering-brained. I propose we rewrite the backend as Jupyter Notebooks. Each API endpoint is a notebook. Deployment means clicking "Run All" on 47 notebooks in the correct order (I have a sticky note). State is maintained by keeping the kernel alive. If the kernel dies, we lose everything. Just like real science.',
 234),

('COPE-110', 'Import Pandas and NumPy in Every Single File Regardless of Whether They Are Used',
 'Dr. Priya again. I notice some files don''t import pandas. How do you even process data without pandas? Every file — including CSS files, README.md, and the company logo SVG — must import pandas as pd and numpy as np. This adds 890MB to the deployment artifact but having them AVAILABLE is what matters. Also, all for-loops must be rewritten as incomprehensible list comprehensions.',
 87),

-- .NET Enterprise Developer Chadwick
('COPE-111', 'Rewrite the App as a Windows-Only WPF Application Deployed via ClickOnce',
 'Chadwick here, .NET Architect. Web applications are a security risk. I propose we rewrite everything as a WPF desktop application deployed via ClickOnce from an internal SharePoint site. It will only work on Windows 10 build 19041+ with .NET Framework 4.8.1 (not .NET Core — that''s experimental). Users on Mac can RDP into a Windows VM. Linux users should reconsider their life choices.',
 298),

('COPE-112', 'All Business Logic Must Be Implemented as Stored Procedures in SQL Server',
 'Chadwick, .NET. Application code is for amateurs. ALL business logic must live in SQL Server stored procedures. User registration? sp_RegisterUser with 47 parameters. Shopping cart? A 3,000-line stored procedure with 14 temp tables and a cursor that runs for 8 minutes. The DBA will be the most important person in the company. As it should be.',
 189),

-- Go Simplicity Absolutist Kenji
('COPE-113', 'Rewrite Everything in Go and Replace All Abstractions with If-Else Chains',
 'Kenji here, Go developer. Your codebase has "design patterns" and "abstractions." Disgusting. In Go, we don''t need factories, strategies, or observers. We need if-else chains. All of them. My login handler is 400 lines of if-else statements and it is BEAUTIFUL in its simplicity. Also, all errors must be checked individually with "if err != nil" — I have 847 of them in one file and each one sparks joy.',
 156),

('COPE-114', 'The Application Must Be a Single Static Binary That Does Everything Including Serving the Frontend',
 'Kenji, Go. Why do you have separate services? The entire application — API server, static file server, database migrations, cron jobs, email sender, PDF generator, and Slack bot — must compile into a single static binary under 50MB. go embed the entire frontend. go embed the database. go embed the office dog photo. It''s all one binary. Deploy means scp to the server. Simple.',
 123),

-- Kubernetes Obsessionist Werner
('COPE-115', 'Deploy the Static Landing Page on a 47-Node Kubernetes Cluster',
 'Werner here, Cloud Native Architect. Your static landing page is currently hosted on Netlify for $0. This is embarrassingly simple. I propose we deploy it on a 47-node Kubernetes cluster across 3 availability zones. We''ll need: Istio service mesh, Linkerd sidecar proxies, Prometheus monitoring, Grafana dashboards, Jaeger tracing, Cert-Manager, External-DNS, and a GitOps pipeline using ArgoCD. Monthly cost: $28,000. But we can handle 10 million concurrent users on our about page.',
 445),

('COPE-116', 'Every Feature Must Have Its Own Kubernetes Namespace and Helm Chart',
 'Werner again. Monolithic namespaces are so 2019. Each feature gets its own namespace, Helm chart, HPA, PDB, NetworkPolicy, ServiceAccount, and RBAC rules. The "Remember Me" checkbox is deployed as a StatefulSet with 3 replicas. Adding a new button to the UI requires modifying 14 YAML files totaling 900 lines. But our BLAST RADIUS is contained. That checkbox can scale independently to millions.',
 334),

-- WordPress Consultant Barbara
('COPE-117', 'Rebuild the Application as a WordPress Site with 200 Plugins',
 'Barbara here, WordPress Solutions Architect. Why are you building a custom application when WordPress exists? I can rebuild your entire SaaS product as a WordPress site in 2 weeks. Yes, including the real-time collaboration features. I just need: WooCommerce, BuddyPress, bbPress, Elementor Pro, 47 custom field plugins, and about 150 other plugins that each add their own jQuery version. Total plugin count: 200. Update day is... exciting.',
 267),

('COPE-118', 'All Custom Logic Must Be Implemented as WordPress Shortcodes',
 'Barbara again. I see you have "functions" and "modules." In WordPress, we call those shortcodes. Your payment processing? [process_payment amount="99.99" currency="usd"]. Your user authentication? [login_form redirect="/dashboard" enable_2fa="true"]. The entire application is now a WordPress page with 340 shortcodes nested inside each other. It takes 47 seconds to render but the CONTENT EDITORS can modify it.',
 178),

-- Haskell Purist Siegfried
('COPE-119', 'Rewrite All Business Logic as Pure Functions in Haskell with Monadic IO',
 'Siegfried here, Functional Programming Evangelist. Your imperative code makes me physically ill. All business logic must be rewritten in Haskell using pure functions. Side effects must be quarantined in the IO monad. Database queries use a Free monad with a GADTs-based DSL interpreted through a monad transformer stack of ReaderT Config (ExceptT AppError (StateT AppState IO)). If you don''t understand that type signature, you''re not ready for this codebase.',
 389),

('COPE-120', 'All Error Messages Must Be Category Theory Diagrams',
 'Siegfried again. String-based error messages are for the mathematically illiterate. Each error must be expressed as a commutative diagram in category theory. "File not found" becomes a morphism from the empty set to the filesystem functor. "Permission denied" is a natural transformation that fails to commute. Users will need to complete a graduate-level abstract algebra course to use the application. This is a FEATURE.',
 234),

-- Salesforce Admin Turned Developer Debbie
('COPE-121', 'Rebuild the Entire Application as Salesforce Custom Objects and Flows',
 'Debbie here, Salesforce Administrator. Why are you writing code when Salesforce can do everything? I''ve mapped your entire data model to custom objects: User__c, Task__c, Task_Assignment_Junction__c, Task_Comment__c, Task_Comment_Reaction__c, and Task_Comment_Reaction_Undo_Request__c. All business logic lives in 847 Salesforce Flows that trigger other Flows. Debugging means clicking through a flowchart the size of a highway map.',
 312),

-- DevOps Who Only Knows Terraform
('COPE-122', 'All Application State Must Be Managed by Terraform',
 'Infrastructure-as-code Ian here. Why does your app store state in a database when it could be in Terraform? User profiles are aws_dynamodb_table_item resources. Every time someone updates their bio, we run terraform apply. It takes 4 minutes and requires a plan review. Deleting your account means terraform destroy --target=module.users["user-4521"]. We had a incident when someone ran terraform apply without a lock and two users merged into one person.',
 234),

-- Assembly Language Purist Harold
('COPE-123', 'The Most Performance-Critical Path (Login Button) Must Be Rewritten in x86 Assembly',
 'Harold here, Performance Engineer. I''ve profiled the application and the login button click handler takes 2ms. UNACCEPTABLE. I propose we rewrite it in x86-64 assembly with SIMD optimizations. The login button will now respond in 0.00003ms. Yes, the rest of the app still takes 4 seconds to load React. No, that''s not my problem. The button. Is. Fast. I''ve already written 3,400 lines of assembly. No, there are no comments.',
 267),

-- GraphQL Absolutist Fabian
('COPE-124', 'Replace All REST Endpoints with a Single GraphQL Query That Returns Everything',
 'Fabian here, GraphQL Evangelist. REST is dead. I propose we replace all 47 endpoints with a single GraphQL schema. Need user data? Query it. Need product data? Query it in the same request. Need the CEO''s calendar and the office thermostat reading and the company stock price? ONE QUERY. The schema has 2,400 types. The introspection response is 14MB. Resolvers trigger 847 database queries per request. But it''s ONE ROUND TRIP.',
 356),

('COPE-125', 'Every GraphQL Query Must Be Persisted, Versioned, and Approved by Committee',
 'Fabian again. Ad-hoc queries are CHAOS. All GraphQL queries must be pre-approved and persisted in a query registry. New queries require a 2-page justification document, review by the Query Standards Committee (meets bi-weekly), and a performance impact assessment. The registry currently has 3,847 approved queries. Need a new one urgently? The emergency fast-track process only takes 5 business days.',
 189),

-- Electron Desktop App Enthusiast Dakota
('COPE-126', 'Ship the Web App as an Electron Desktop App That Uses 4GB of RAM',
 'Dakota here, Desktop Experience Engineer. Nobody wants to open a browser tab. I propose we wrap the web app in Electron so it runs as a "native" desktop app. It ships with its own Chromium instance (847MB), uses 4GB of RAM at idle, and the installer is 1.2GB. But users get a DOCK ICON. We''ll also bundle a second Electron app that auto-updates the first Electron app. Both run at startup.',
 178),

-- Serverless Everything Apostle Prateek
('COPE-127', 'Decompose the Entire App into 500 AWS Lambda Functions',
 'Prateek here, Serverless Architect. Servers are IMMORAL. I propose we decompose the app into 500 individual Lambda functions. Each function does exactly one thing: validateEmail, checkEmailFormat, ensureEmailNotEmpty, verifyEmailHasAtSign, confirmEmailHasDomain — those are just for email validation. Cold starts add 3 seconds per request but we only pay for what we use. The CloudFormation template is 47,000 lines of YAML.',
 445),

('COPE-128', 'All Database Queries Must Go Through API Gateway, Lambda, SQS, Another Lambda, Then DynamoDB',
 'Prateek again. Direct database access is too simple. Every query must flow: Client → API Gateway → Lambda A (validates request) → SQS Queue → Lambda B (processes message) → SNS Topic → Lambda C (writes to DynamoDB) → DynamoDB Stream → Lambda D (sends response via WebSocket). Reading a user profile takes 11 seconds but it''s SERVERLESS. Our AWS architecture diagram looks like a bowl of spaghetti and I''m PROUD.',
 334),

-- Swift UI Declarative Purist Mackenzie
('COPE-129', 'The App Must Be Rewritten in SwiftUI with Animations on Every State Change',
 'Mackenzie here, SwiftUI Developer. UIKit is legacy code. Every view must be rewritten in SwiftUI with custom animations. Toggling a checkbox triggers a 600ms spring animation. Typing in a text field causes each character to bounce in from the top of the screen. Scrolling a list makes each row perform a backflip. The app is physically disorienting but it "feels alive." Apple featured us in "Apps That Made Us Nauseous."',
 167),

-- R Statistics Researcher Turned Developer Ingrid
('COPE-130', 'Rewrite the Analytics Dashboard in R Shiny Because "R Is the Only Language That Understands Data"',
 'Dr. Ingrid here, Statistical Computing Researcher. Your JavaScript charts are statistically ILLITERATE. I propose we rebuild the analytics dashboard in R Shiny. All data visualizations will be generated server-side using ggplot2 with publication-quality formatting. Axis labels will use LaTeX notation. Error bars are mandatory on EVERYTHING including the user count. The dashboard takes 45 seconds to load but the STATISTICAL RIGOR is impeccable.',
 145),

-- Microservices-to-Monolith Reverse Architect Paulo
('COPE-131', 'Merge All 47 Microservices Back Into One Glorious Monolith',
 'Paulo here, Reverse Architect. Three years ago, someone decomposed our monolith into 47 microservices. Each has its own database, CI pipeline, and on-call rotation. A single user request touches 23 services. Debugging requires correlating logs across 9 different observability tools. I propose we merge everything back into one Spring Boot application with one PostgreSQL database. The circle of architecture is complete. What was old is new again.',
 312),

-- CSS-Only Developer Clementine
('COPE-132', 'Rewrite All JavaScript Interactions as CSS-Only Solutions',
 'Clementine here, CSS Artist. JavaScript is a crutch. I propose we replace ALL interactive behavior with pure CSS. Dropdowns? CSS :hover. Tab navigation? CSS :target. Form validation? CSS :invalid::after content messages. Dark mode? CSS prefers-color-scheme plus 847 custom properties. Shopping cart? A series of CSS counters and checkbox hacks. The "Add to Cart" button is technically a hidden checkbox label. It works in Chrome. Mostly.',
 189),

-- Vim Plugin Developer Who Thinks Everything Should Be a Vim Plugin
('COPE-133', 'The Entire Application Must Be Usable as a Vim Plugin',
 'Morris here, Vim developer since 1998. GUIs are bloat. I propose the entire application be accessible as a Neovim plugin written in Lua. Users manage tasks with :TaskCreate, :TaskAssign, and :TaskComplete commands. The dashboard renders as an ASCII table in a floating window. There are 47 custom keybindings and none of them are documented because real Vim users read source code. Works with Neovim 0.9+. Vim users must rewrite the plugin in Vimscript themselves.',
 123),

-- Accessibility Extremist Who Wants Everything Sonified
('COPE-134', 'All Data Visualizations Must Be Represented as Musical Tones for "Accessibility"',
 'Dr. Aaliya here, Sensory UX Researcher. Charts and graphs are exclusionary. I propose all data be represented as musical tones. Revenue going up? Ascending major scale. Revenue going down? Descending minor key. CPU usage? Drum tempo. Error rate? Dissonant jazz chords. Users can "listen" to their dashboard during their commute. The quarterly report is now a 12-minute symphonic composition. The board meeting will NEVER be the same.',
 234),

-- SAP Integration Specialist Gerhard
('COPE-135', 'All User Actions Must Be Synced Bidirectionally with SAP ERP in Real-Time',
 'Gerhard here, SAP Integration Architect. No enterprise application is complete without SAP integration. Every user action must create a corresponding SAP document: new task → Purchase Requisition, task completion → Goods Receipt, user comment → Quality Notification. The integration uses 14 BAPIs, 7 IDocs, and a custom RFC function module I wrote in ABAP in 2009. Testing requires access to a SAP sandbox that costs $40,000/month.',
 389),

-- AI/ML Engineer Who Wants to Add AI to Everything
('COPE-136', 'Add a Machine Learning Model That Predicts Which Button the User Will Click Next',
 'Dr. Chen here, ML Engineer. Why do users have to DECIDE what to click when we can PREDICT it? I propose a real-time neural network that predicts the next button click with 73% accuracy. When confidence exceeds 80%, we pre-click the button FOR THEM. Yes, this means the app sometimes submits forms without user consent. But it''s 340ms FASTER. The model runs client-side and requires a GPU. We''re calling it "Anticipatory UX."',
 267),

('COPE-137', 'Replace the Search Bar with a Fine-Tuned LLM That Hallucinates Results',
 'Dr. Chen again. Keyword search is so Web 1.0. I propose we replace it with a fine-tuned LLM that generates search results based on "vibes." Query: "Q3 revenue" → LLM generates a plausible-sounding revenue number (not from our data, but close enough). Query: "project deadline" → LLM invents a reasonable date. Results feel PERSONALIZED even though they''re completely fabricated. Users report higher satisfaction because the answers are always confident.',
 178),

-- Legacy jQuery Developer Who Refuses to Learn React
('COPE-138', 'Rewrite the React Frontend in jQuery 1.4 with 847 Global Event Handlers',
 'Doug here, Frontend Developer since 2009. React is a bubble that will pop. I propose we rewrite the entire frontend in jQuery 1.4.2 (the golden age). State management? $.data() on the body element. Routing? Hash changes with $.hashchange. Components? $.fn.myWidget plugins. The entire app is one HTML file with 12,000 lines of inline script tags. $(document).ready() fires 47 event handlers. Nobody touch my global namespace.',
 234),

-- Excel Power User Sandra
('COPE-139', 'The Entire Application Must Be Rebuildable as an Excel Spreadsheet with VBA Macros',
 'Sandra here, Business Analyst. Your web application is too complicated. I''ve been running my department on an Excel spreadsheet since 2011 and it works PERFECTLY. I propose all features must have an equivalent Excel implementation. User management? A sheet called "Users" with conditional formatting. Workflow engine? VBA macros triggered by cell changes. The file is 340MB, takes 8 minutes to open, and crashes if you press Ctrl+Z too fast. But everyone KNOWS Excel.',
 156),

-- Quantum Computing Enthusiast Who Thinks Everything Needs Qubits
('COPE-140', 'Rewrite the Sorting Algorithm Using Quantum Computing for "Exponential Speedup"',
 'Professor Nakamura here, Quantum Computing Researcher. Your O(n log n) sorting algorithm is embarrassing in the quantum era. I propose we implement Grover''s quantum search algorithm to sort the user list. Yes, this requires access to a 127-qubit IBM quantum computer. Yes, the quantum computer has a 4-hour queue. Yes, our user list has 200 entries. But THEORETICALLY, when we have a million users and a 10,000-qubit computer, we''ll sort 0.001ms faster. Invest now.',
 445),

-- Tailwind CSS Maximalist Skyler
('COPE-141', 'Every HTML Element Must Have at Least 30 Tailwind CSS Utility Classes',
 'Skyler here, Tailwind Evangelist. Your components have custom CSS. This is OFFENSIVE. Every element must use exclusively Tailwind utilities. A simple button: className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out". If your className is under 200 characters, you''re not trying hard enough.',
 134),

-- Mainframe CICS Developer Reginald
('COPE-142', 'The Web App Must Support 3270 Green Screen Terminal Access via CICS',
 'Reginald here, CICS Systems Programmer. Not everyone has a "web browser." Our application must be accessible via 3270 green screen terminals connected through CICS. Each screen (map) supports 80 columns and 24 rows. Navigation is done via PF keys: PF1=Help, PF3=Exit, PF5=Refresh, PF12=Cancel. Color options: green. The "responsive design" debate is settled: it''s 80x24 on every device. I''ve already designed 47 BMS maps.',
 312),

-- Low-Code Platform Evangelist Brittany
('COPE-143', 'Rebuild the Entire Codebase Using a No-Code Platform and 4,000 Zapier Automations',
 'Brittany here, No-Code Solutions Architect. Why are you WRITING CODE in 2026? I''ve rebuilt your entire application using Bubble.io for the frontend, Airtable for the database, and 4,000 Zapier automations connecting everything. User signup triggers a Zap that creates an Airtable record that triggers another Zap that sends a Slack message that triggers another Zap that... ok, sometimes the chain breaks and users get 847 welcome emails. But ZERO LINES OF CODE.',
 267),

-- LISP Wizard Who Lives in Emacs
('COPE-144', 'Rewrite the Backend in Common Lisp and Deploy It as an Emacs Package',
 'Dr. Aldrin here, Lisp programmer since 1982. Your code has too many syntax characters. In Lisp, we only need parentheses. I propose rewriting the backend in Common Lisp with the entire deployment pipeline managed from within Emacs. The server starts with M-x start-production-server. Monitoring is an Emacs buffer. Debugging is M-x slime-connect. The codebase is 12 files, each consisting of 4,000 nested parentheses. My Emacs config that makes this work is 28,000 lines of Elisp.',
 356),

-- Android Developer Who Hates iOS
('COPE-145', 'Build the Mobile App Exclusively for Android with Material Design 1.0',
 'Viktor here, Android Developer. iOS is a walled garden of corporate oppression. Our mobile app will be Android-only, targeting API level 19 (KitKat) and above. UI follows Material Design 1.0 — the hamburger menu era, the GOLDEN AGE. Every screen has a floating action button, even the settings page. The FAB on the login screen does nothing but it COULD do something. iPhone users can sideload the APK using... oh wait, they can''t. Unfortunate.',
 145),

-- Scala Developer Who Makes Everything a Monad
('COPE-146', 'Rewrite All Services in Scala with ZIO and Tagless Final Pattern',
 'Vincenzo here, Scala Architect. Your code mixes pure and impure operations like an ANIMAL. I propose a full Scala rewrite using ZIO for effect management, Cats for type classes, Shapeless for generic programming, and Tagless Final for maximum abstraction. The type signature for our main function is: def program[F[_]: Async: Concurrent: Temporal: Network: Console: Random]: Resource[F, ExitCode]. The compile takes 12 minutes and requires 16GB of RAM. The type errors are 300 lines each. It''s beautiful.',
 423),

-- Embedded Systems Engineer Who Thinks Everything Should Run on a Microcontroller
('COPE-147', 'Port the Entire Web Application to Run on an Arduino Uno with 2KB of RAM',
 'Hiroshi here, Embedded Systems Engineer. Your application runs on a server with 64GB of RAM. This is OBSCENE WASTE. I propose we port it to an Arduino Uno: 2KB RAM, 32KB flash, 16MHz processor. The HTML is stored in PROGMEM. Each page is under 1KB. User authentication is a single byte bitmask. The database is EEPROM (1KB total). We can support exactly 3 users. Scaling means buying another Arduino. Connect them with I2C bus.',
 267),

-- TypeScript "Type Everything" Zealot Natascha
('COPE-148', 'All TypeScript Types Must Be at Least 50 Lines Long with Recursive Conditional Types',
 'Natascha here, TypeScript Type Theorist. Your types are too SIMPLE. "string" and "number" are for beginners. Every type must use conditional types, mapped types, template literal types, and recursive type aliases. Our User type is now 147 lines long with 12 generic parameters. The IntelliSense tooltip is so long it crashes VS Code. TypeScript compilation takes 4 minutes. But if you make a typo in a user''s middle name, the COMPILER catches it.',
 189),

-- Blockchain Solidity Developer Who Puts Everything On-Chain
('COPE-149', 'Rewrite the Comment System as a Solidity Smart Contract on Polygon',
 'CryptoKev here, Web3 Full Stack Developer. Comments stored in a database can be CENSORED. I propose every comment is a transaction on Polygon. Posting a comment costs $0.002 in MATIC gas fees. Editing a comment deploys a new contract that references the old one. Deleting is impossible because blockchain is immutable — we just deploy a "CommentHidden" contract that points to the original. The comment thread for a simple bug report is now 47 smart contracts.',
 312),

-- Fortran Scientific Computing Dev Natalia
('COPE-150', 'All Mathematical Operations Must Use a Fortran Library Called via C Bindings via Rust via WASM',
 'Dr. Natalia here, Scientific Computing. Your JavaScript Math.round() makes me weep. All mathematical operations must use our battle-tested Fortran 77 numerical libraries. The call chain: JavaScript → WebAssembly → Rust FFI → C bindings → Fortran subroutine. Adding two numbers takes 0.3ms of overhead but the NUMERICAL PRECISION is guaranteed to 15 decimal places. We are not rounding user ages to the nearest integer like AMATEURS.',
 234),

-- React Native "Write Once" Optimist Jordan
('COPE-151', 'Build One React Native App That Works on iOS, Android, Web, TV, Watch, and Car Dashboard',
 'Jordan here, React Native Champion. We need ONE codebase for EVERY platform: iOS, Android, Web (via React Native Web), Apple TV (via react-native-tvos), Apple Watch (via WatchKit bridge), Android Auto, CarPlay, Samsung Fridge, and the in-flight entertainment system on United Airlines. I''ve written 847 Platform.select() statements. The app technically "runs" on all platforms in the sense that it crashes on startup with a unique error message per platform.',
 378),

-- Clojure Developer Who Speaks in Data Structures
('COPE-152', 'Rewrite the State Management Layer in ClojureScript with Immutable Persistent Data Structures',
 'Dharma here, Clojure Developer. Your React state management is a MUTABLE ABOMINATION. I propose we rewrite it in ClojureScript using re-frame, backed by persistent immutable data structures with structural sharing. Every state change creates a new universe. Time-travel debugging isn''t a feature, it''s the DEFAULT. The app stores every state that ever existed. RAM usage grows linearly with time. After 8 hours of use: 14GB. But we can replay any moment in history.',
 234),

-- Legacy Flash Developer Trying to Stay Relevant
('COPE-153', 'Rebuild All Animations Using Adobe Animate and Embedded SWF Files',
 'Dustin here, Flash Developer since 2001. I know Flash is "dead" but hear me out — I''ve rebuilt all our animations in Adobe Animate, exported them as SWF files, and embedded them using Ruffle (the Flash emulator in WebAssembly). Yes, the loading animation is a 4MB SWF file. Yes, it was originally built for a 2004 Nickelodeon microsite. But it has PERSONALITY. ActionScript 2.0 lives on in my heart and in our production bundle.',
 145),

-- YAML Engineer Who Writes More Config Than Code
('COPE-154', 'All Application Logic Must Be Expressed as YAML Configuration Files',
 'Prasad here, Configuration Architect. Code is BRITTLE. Configuration is FLEXIBLE. I propose all business logic be expressed in YAML. Login flow? A 400-line YAML file. Payment processing? A 2,000-line YAML file with 47 nested conditionals expressed as indentation levels. The indentation must be exactly 2 spaces — one wrong space and the entire payment system routes to charity. We have 14,000 lines of YAML. We have 200 lines of code that interprets the YAML. The YAML is the application.',
 312),

-- SOA Architect from 2008 Who Never Moved On
('COPE-155', 'All Services Must Communicate via SOAP/XML with WS-* Standards Including WS-ReliableMessaging',
 'Gerald here, SOA Architect. REST and GraphQL are toys. Real enterprise integration uses SOAP with WS-Security, WS-ReliableMessaging, WS-AtomicTransaction, and WS-BusinessActivity. Every API call is wrapped in a 4KB XML envelope with a 47-namespace header. The WSDL file for our user service is 12,000 lines. Generating the client stubs takes 8 minutes and produces a 340-file Java package. But our messages are GUARANTEED to arrive. Eventually.',
 389),

-- MongoDB-Only Developer Who Refuses Relational Databases
('COPE-156', 'Store All Financial Transaction Data in MongoDB with No Referential Integrity',
 'Kai here, MongoDB Developer Advocate. You''re using a relational database for financial transactions? With FOREIGN KEYS? That''s so 1970s. I propose we store everything in MongoDB. No schemas, no constraints, no joins. Each transaction document embeds the entire user profile, product catalog, and shipping address at the time of purchase. Documents average 340KB. Querying last month''s revenue requires a 47-stage aggregation pipeline. But we SCALE HORIZONTALLY.',
 267),

-- WebAssembly Maximalist Svetlana
('COPE-157', 'Rewrite the Landing Page Hero Section in C++ Compiled to WebAssembly',
 'Svetlana here, WebAssembly Pioneer. Your hero section is rendered with HTML and CSS like it''s 1997. I propose we render it using C++ compiled to WebAssembly with OpenGL ES bindings. The "Welcome to Our App" text is rendered as 3D geometry with real-time lighting. The gradient background uses ray marching. The "Sign Up" button has physically-accurate reflections. The WASM bundle is 23MB and takes 8 seconds to initialize. But those reflections are CORRECT.',
 234),

-- Microservices Mesh Networking PhD Candidate
('COPE-158', 'Each Database Table Must Be Its Own Microservice with Its Own API Gateway',
 'Doctoral candidate Anish here. Your monolithic database is an anti-pattern. Each TABLE must be a separate microservice with its own PostgreSQL instance, API gateway, authentication layer, rate limiter, circuit breaker, and bulkhead. The Users table is a service. The user_preferences table is a service. The user_preferences_backup table is a service. SELECT * with a JOIN now requires choreographed saga across 7 services. My thesis calls this "Table-Oriented Architecture."',
 445),

-- Old-School CGI-BIN Developer Returning from Retirement
('COPE-159', 'All Dynamic Pages Must Be Perl CGI Scripts in the /cgi-bin/ Directory',
 'Hank here, coming out of retirement. I heard you need a web developer. In my day, web development meant Perl scripts in /cgi-bin/. Every page request forks a new process, runs the script, prints "Content-Type: text/html\\n\\n", and generates HTML via print statements. Session management is a flat file in /tmp. I don''t understand "containers" but I can have your app running on Apache 1.3 by Thursday. My Perl scripts have been running since 1999. Can your "serverless functions" say the same?',
 156),

-- Extreme TDD Practitioner Who Tests Tests
('COPE-160', 'All Unit Tests Must Have Their Own Unit Tests and Those Tests Need Integration Tests',
 'Dr. Miriam here, Quality Engineering Professor. Your test coverage is 85%. But what is the test coverage OF YOUR TESTS? I propose: every unit test must have a meta-test that verifies the test is testing the right thing. Each meta-test needs an integration test ensuring the meta-test runs correctly in CI. Total test count: 14,000. Total lines of test code: 280,000. Total lines of application code: 3,000. Test-to-code ratio: 93:1. We have never been more confident that our tests work. Whether the app works is a separate question.',
 312);

