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
  144),;
