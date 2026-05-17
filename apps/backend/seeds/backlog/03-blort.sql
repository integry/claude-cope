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

-- REPORTER: Todd | Firebase Founder | Calls vendor lock-in "velocity" with a straight face.
('BLORT-176', 'Rebuild Notifications on Firebase So Product Can Ship from a Beach Chair',
 'You keep talking about architecture while Product keeps talking about this quarter. Firebase gives us auth, push, analytics, remote config, crash reporting, and the warm feeling of never quite knowing where our vendor ends and our source tree begins. If the console can toggle it, we should not be wasting engineers on understanding it.',
 'rebuild notifications on firebase',
  144),

('BLORT-177', 'Store User Documents in Firestore Even the Ones That Used to Need Transactions',
 'Firestore wants us to think in documents, collections, and denormalized hope. Lean in. Payment state, shipping state, audit state, and emotional state can all live in separate documents that mostly agree with each other. If we need a transaction spanning several of them, that is just the system encouraging us to rethink what "consistency" means.',
 'store all user docs in firestore',
  233),

-- REPORTER: Sven | Prisma Developer | Wants the database schema to feel like corporate poetry.
('BLORT-178', 'Put Prisma in Front of Everything Including the Parts That Used to Be Simple SQL',
 'Direct SQL has too much eye contact. Prisma gives us a schema, a client, a migration engine, and a consistent place for every table rename to become a personality event. The generated types alone will calm investors. If an edge case requires raw SQL later, we can bury it in a helper called unsafeButTemporary and then never discuss it again.',
 'put prisma in front of everything',
  144),

-- REPORTER: Logan | tRPC Believer | Wants the frontend and backend to share one giant compiler-enforced fate.
('BLORT-179', 'Replace the Public API with tRPC So Type Errors Can Cross Team Boundaries Instantly',
 'REST encourages distance. Distance encourages autonomy. tRPC fixes this by making the frontend and backend share one intensely personal type graph. A change to one procedure should be able to freeze half the repository with compiler grief, otherwise we are not really collaborating. If mobile cannot consume it, that is a growth opportunity for mobile.',
 'replace the public api with trpc',
  144),

-- REPORTER: Skyler | Tailwind Maximalist | Treats HTML class lists like emotional screenplays.
('BLORT-180', 'All UI Changes Must Be Implemented in Tailwind Utility Strings Longer Than the Component',
 'CSS files imply permanence and independent thought. Tailwind keeps everything where it belongs: directly on the element, in one string, with the full emotional arc of the component visible to anyone willing to scroll sideways. If a button cannot communicate its hover state, layout rules, color token history, and breakpoint anxieties in 37 class names, it is under-specified.',
 'implement ui changes in tailwind strings',
  144),

-- REPORTER: Zane | shadcn/ui Enthusiast | Wants everyone copy-pasting components with absolute conviction.
('BLORT-181', 'Adopt shadcn/ui Everywhere So We Can Vendor Our Identity One Component at a Time',
 'Installing components from a registry was too communal. Copy them into the repo so each popover can become our responsibility forever. This is not cloning code; it is assuming design custody. Once we have 48 lightly modified button variants drifting across the workspace, we will finally own our stack in the only way that matters: accidentally.',
 'use shadcn/ui for basically everything',
  144),

-- REPORTER: Elara | SvelteKit Developer | Thinks writing less code magically results in more destiny.
('BLORT-182', 'Rebuild the Settings App in SvelteKit Because Stores Feel More Honest Than Context',
 'React keeps asking us to explain ourselves. SvelteKit simply compiles away the guilt. Rebuild the settings experience with load functions, server actions, and a store or three that gradually become the product nervous system. If hydration breaks, at least it will do so with fewer dependencies and a superior sense of craft.',
 'rebuild the settings app in sveltekit',
  144),

-- REPORTER: Bastien | Nuxt Consultant | Describes every configuration file as an exercise in full-stack ergonomics.
('BLORT-183', 'Port the Customer Portal to Nuxt So We Can Have Opinions About Rendering Modes',
 'The portal should not merely render; it should negotiate whether it wishes to be SSR, SSG, ISR, hybrid, edge, or spiritually client-side this quarter. Nuxt gives us modules, conventions, auto-imports, and just enough hidden machinery to make debugging feel aristocratic. If route rules multiply faster than features, governance is finally winning.',
 'port the customer portal to nuxt',
  233),

-- REPORTER: Caleb | Remix Loyalist | Wants standard HTML forms to be both the interface and the religion.
('BLORT-184', 'Replace Half the SPA with Remix Forms So Every Click Can Pretend to Be a Document',
 'Your app uses client state where browser behavior would gladly make things weird for free. Remix lets every interaction travel through loaders and actions like it is 2009 but with superior branding. If a modal close event cannot become a form submission with redirect semantics, we are leaving tradition unexplored.',
 'replace half the spa with remix forms',
  144),

-- REPORTER: Dakota | Expo Mobile PM | Thinks over-the-air updates without QA approval are a lifestyle.
('BLORT-185', 'Ship the Next Mobile Release Through Expo OTA at 4 PM Without Telling QA',
 'App store review cycles are just bureaucracy wearing a Cupertino lanyard. With Expo OTA, we can deploy fixes, regressions, design pivots, and accidental white screens straight into users'' pockets before QA has found the meeting link. If an update only bricks Android devices in Finland, that is still a narrower blast radius than waiting for process.',
 'pipe mobile changes through ota updates',
  233),

-- REPORTER: Jude | Capacitor Developer | Wants the web app to wear native clothing and ask for camera permissions.
('BLORT-186', 'Wrap the Existing Site in Capacitor and Call It a Native Strategy',
 'We do not need separate mobile architecture when the browser already contains most of our ambition. Wrap the app in Capacitor, ask for camera, filesystem, contacts, geolocation, push, and maybe microphone just in case. Once the same hydration bug happens inside an app icon, leadership will finally understand omnichannel.',
 'wrap the site in capacitor',
  144),

-- REPORTER: Nash | AI Product Manager | Wants autonomous agents to replace planning, strategy, and human accountability.
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

-- REPORTER: Chase | Vibe-Coding Founder | Thinks a single 400-word prompt is a viable product strategy.
('BLORT-195', 'The MVP Should Be Rebuilt This Weekend by One Founder, Cursor, and a Dangerous Amount of Electrolytes',
 'We have overcomplicated a fundamentally simple business with "architecture" and "discipline." This weekend I am renting a cabin, bringing two laptops, one AI IDE, and whatever supplements make time feel editable. By Monday I expect a new MVP with chat, billing, analytics, referrals, and a multi-tenant admin panel generated in one continuous fugue state. If anything breaks later, that just means we moved faster than doubt.',
 'rebuild the mvp this weekend with cursor',
  377),

-- REPORTER: Kev | Smart Contract Founder | Wants to put a crypto wallet prompt in front of literally everything.
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
