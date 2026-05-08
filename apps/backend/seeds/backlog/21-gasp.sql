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
  116),;
