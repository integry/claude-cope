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
  144),;
