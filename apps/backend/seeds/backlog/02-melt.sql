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
  377),;
