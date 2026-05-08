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
 'make tests run only on ie6',
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
  144),;
