-- RANK: search, recommendations, autocomplete, retrieval quality, and relevance cults
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Search Quality Lead Helena
-- REPORTER: Helena | Search Quality Lead | Is tired of old loud documents winning just because they have had more time to accumulate dust, links, and institutional self-esteem.
('RANK-1046', 'Stop Rewarding Documents for Existing Loudly',
 'Our ranking still favors pages that are old, bloated, and rich in metadata over answers that are simply better. Reduce the seniority privilege before search starts feeling like internal politics with a query box.',
 'stop rewarding documents for existing loudly',
  144),

('RANK-1047', 'Classify Zero-Result Searches by How Much They Feel Like Betrayal',
 'Some misses are harmless. Others land like the product just admitted it has never heard of the thing a sane person assumed it would know. Add a mood class so we can fix the painful absences first.',
 'add rage score to zero results',
  144),

-- Recommendations PM Sora
-- REPORTER: Sora | Recommendations PM | Distrusts any discovery engine that keeps recommending popularity in a fake mustache and calling it personalization.
('RANK-1048', 'Stop Calling Popular Items "Recommendations" Just Because They Wear a New Hat',
 'We keep celebrating discovery wins that are really just the same successful items being reintroduced with better shelf placement and a fresh adjective. Add novelty checks before recycled popularity starts grading itself.',
 'make search stop calling popular items recommendations',
  144),

('RANK-1049', 'Teach the Feed to Ignore Clicks People Made Because Doom Felt Magnetic',
 'A lot of engagement comes from dread, compulsion, and the urge to inspect a digital accident against better judgment. Filter doom-click behavior before the model starts learning that unhealthy attention equals taste.',
 'teach the feed to ignore clicks people made',
  144),

-- Search Infrastructure Engineer Kamil
-- REPORTER: Kamil | Search Infrastructure Engineer | Has watched one extra colon at midnight convince the parser to reinvent the user''s entire soul.
('RANK-1050', 'Stop Letting Punctuation Trigger a Full Relevance Identity Crisis',
 'Certain punctuation marks are producing interpretation shifts dramatic enough to feel less like parsing and more like divination. Calm the engine before one stray symbol rewrites the meaning of the hunt.',
 'stop punctuation causing relevance crises',
  89),

('RANK-1051', 'Flag the Synonyms We Only Added Because Sales Wanted Them to Be True',
 'Synonym dictionaries get dangerous the moment pipeline pressure starts flattening actual conceptual differences into close enough to sell. Warn when a merge was born from revenue desire instead of language reality.',
 'flag the synonyms we only added',
  144),

-- Catalog Discovery Analyst Mireille
-- REPORTER: Mireille | Catalog Discovery Analyst | Knows half the facet panel exists to soothe internal stakeholders who wanted to see their pet category survive in public.
('RANK-1052', 'Mark Which Filters Help Users and Which Filters Exist to Reassure Merchants',
 'Not every facet improves navigation. Some are diplomatic offerings to internal constituencies who wanted proof their category still mattered. Tag the reassurance filters before the sidebar becomes a memorial wall.',
 'label filters users need versus merchant theater',
  89),

('RANK-1053', 'Put at Least One Correct but Vague Human into Every Search Eval Set',
 'Benchmarks are too full of neat, fully articulated queries and not full enough of real people who know what they want but phrase it like they are late to something. Add the foggy humans before search gets overfit to librarians.',
 'put one correct but vague human in evals',
  144),

-- Content Ranking Scientist Idris
-- REPORTER: Idris | Content Ranking Scientist | Keeps having to explain that making everything more intense is not the same as making anything better.
('RANK-1054', 'Flag Ranking Wins That Only Happened Because We Made Everything More Extreme',
 'Some experiments boost clicks by turning urgency, outrage, or stimulation up until the content becomes impossible to ignore and deeply unlovable. Mark those wins before intensity keeps masquerading as usefulness.',
 'flag ranking wins that only happened',
  144),

('RANK-1055', 'Teach Autocomplete Not to Professionally Finish the User''s Worst Idea',
 'Autocomplete becomes socially dangerous when it helps panic, gossip, self-diagnosis, or expensive confusion arrive with perfect speed. Add some manners before the box starts collaborating too effectively with humanity''s weaker instincts.',
 'stop autocomplete finishing bad ideas',
  144),

-- Marketplace Search PM Lena
-- REPORTER: Lena | Marketplace Search PM | Can smell the listings that rank purely by soaking themselves in adjectives and calling it discoverability.
('RANK-1056', 'Detect Sellers Winning on Metadata Overhydration',
 'Some listings rank well because they have marinated themselves in tags, adjectives, and descriptor sludge until the index gives up and lets them through. Detect the overhydrated ones before lexical occupancy becomes strategy.',
 'detect sellers winning on metadata overhydration',
  144),

('RANK-1057', 'Warn When Relevance Tuning Has Bent Around One Loud Customer Story',
 'Search policy keeps swinging because one screenshot, one complaint, or one rich anecdote achieved political mass. Detect those moments before ranking starts orbiting whoever yelled most memorably.',
 'warn when relevance bends for one story',
  89),

-- Retrieval Architect Benji
-- REPORTER: Benji | Retrieval Architect | Treats blended ranking like a hostile coalition government between truth, vectors, freshness, policy, and one monetization clause in a hat.
('RANK-1058', 'Make the Blending Layer Explain How the Ranking Coalition Reached This Compromise',
 'Search blending is not harmony. It is lexical match, vector similarity, freshness, promotions, trust, and business rules arguing in one car. Explain which faction won instead of pretending every result emerged from pure relevance.',
 'make blending layers explain ranking compromises',
  144),

('RANK-1059', 'Show the Searches Users Repeated Like They Were Arguing with the Product',
 'Repeat queries are often not discovery. They are negotiation. Surface the sessions where users keep reformulating because they are trying to convince the system a thing exists and deserve acknowledgment for trying.',
 'show searches users repeated in anger',
  89),

-- Chief Relevance Officer Petra
-- REPORTER: Petra | Chief Relevance Officer | Thinks embarrassing results improve dramatically when the last person who tuned them has to stand next to them in daylight.
('RANK-1060', 'Attach Human Names to Search Results Weird Enough to Start a Meeting',
 'If the system surfaces something useless, creepy, or socially indefensible, show who tuned it last. Relevance improves when click-through optimism has to share a room with personal accountability.',
 'name weird search results early',
  144),;
