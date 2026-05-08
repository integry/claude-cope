-- DRIFT: model decay, data shift, automation entropy, and machine learning disappointment
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- ML Reliability Lead Sachi
-- REPORTER: Sachi | ML Reliability Lead | Spends her days figuring out whether the model is getting dumber or the users have simply become statistically feral.
('DRIFT-781', 'Teach the Monitoring Stack the Difference Between Drift and Users Going Weird',
 'Distribution shift is not always the model failing. Sometimes the market, the product, or society itself just starts behaving like a raccoon with admin access. Update monitoring so we can tell whether the model forgot the world or the world invented fresh nonsense overnight.',
 'teach monitoring drift versus user weirdness',
  144),

('DRIFT-782', 'Make Retraining Jobs Admit What Fresh Nonsense They Are Promoting to Truth',
 'Every retrain is partly learning and partly surrender. Add a required field showing which new behaviors, edge cases, or institutional shortcuts just got sanctified as ground truth because the latest mess arrived in a neat enough format.',
 'make retraining jobs admit their new nonsense',
  144),

-- Applied AI PM Lorenzo
-- REPORTER: Lorenzo | Applied AI PM | Distrusts eval scores earned on ancient clean-room users who would now be rejected by the product''s actual intake form.
('DRIFT-783', 'Retire the Eval Set for Users Who No Longer Exist',
 'Our test harness still represents a cleaner, calmer, more literate user than the one currently arriving with screenshots, CSVs, multilingual half-prompts, and visible distress. Refresh the evals before the product keeps acing exams no real user would ever sit through.',
 'retire eval sets for dead users',
  144),

('DRIFT-784', 'Count How Many AI "Automations" Still Need a Human Cleanup Pass',
 'Many flows look automated only because users quietly rewrite prompts, repair outputs, check facts, and explain context to each other in Slack before the system gets the credit. Add a human-fixup counter after every AI-assisted flow so the dashboards stop billing fiction as efficiency.',
 'count ai automations humans still babysit',
  144),

-- Data Labeling Manager Ines
-- REPORTER: Ines | Data Labeling Manager | Knows some labels come from judgment and others come from hunger, deadline fog, and a deeply human need to be done.
('DRIFT-785', 'Record Whether a Label Was Chosen with Confidence or Just Exhaustion',
 'Not all annotations are born equal. Some reflect careful judgment. Others are the product of a long shift, bad guidance, and someone reaching for closure because lunch and rent are both real. Mark confidence and fatigue before the dataset flattens both into destiny.',
 'record whether labels came from confidence or exhaustion',
  144),

('DRIFT-786', 'Separate Prompt Changes That Improved Quality from Ones That Merely Reduced Complaints',
 'We keep shipping prompt edits after one or two loud tickets and calling the result better without asking whether the outputs improved or the inbox just got quieter. Tag changes by actual impact before the revision log learns to flatter itself.',
 'split better prompts from quieter prompts',
  89),

-- Forecasting Scientist Pavel
-- REPORTER: Pavel | Forecasting Scientist | Watches models grade reality on homework they secretly assigned themselves three weeks earlier.
('DRIFT-787', 'Install a Panic Light for Models Learning from Their Own Bad Decisions',
 'When a model shapes staffing, pricing, or exposure, the world starts echoing that choice back like it was neutral evidence all along. Add a panic light for self-confirming loops before the model starts mistaking arranged outcomes for predictive genius.',
 'add panic light for self-learning models',
  144),

('DRIFT-788', 'Make the Feature Store Admit Which Inputs Are Really Just Quantified Panic',
 'We have let too many desperation signals into serious models: retries, urgent clicks, midnight bursts, and other digital body language from people having a bad day. Tag the panic features before the model starts calling distress sophistication.',
 'label panic inputs in feature stores',
  144),

-- AI Safety PM Janel
-- REPORTER: Janel | AI Safety PM | Celebrates safer behavior only after checking whether the model became secure or just more irritating in a blazer.
('DRIFT-789', 'Track When the Model Got Safer Mainly by Becoming More Annoying',
 'We keep celebrating lower risk without measuring the collateral rise in needless refusals, boring caution, and that special municipal tone that makes users feel like they need a permit to ask for help. Add an annoyance score to the safety review.',
 'track when safer models got more annoying',
  89),

('DRIFT-790', 'Warn Us When the RAG Stack Is Being Carried by the Same Three Holy Documents',
 'Some retrieval systems look robust only because a tiny priesthood of evergreen docs keeps saving the model from the broader swamp of stale junk around them. Add a warning when three files are doing all the real work for the cathedral.',
 'warn when rag uses the same docs',
  89),

-- Principal MLOps Engineer Bruno
-- REPORTER: Bruno | Principal MLOps Engineer | Suspects every long-running batch job is secretly scoring the present using assumptions embalmed in a previous quarter.
('DRIFT-791', 'Make Batch Inference Jobs Declare Which Quarter They Still Think It Is',
 'Some jobs are still scoring users with assumptions preserved months ago as if nobody changed the product, the market, or human behavior since then. Attach freshness notes before leadership mistakes old thinking for model calm.',
 'make batch jobs declare their quarter',
  89),

('DRIFT-792', 'Stop Calling It Improvement When Fine-Tuning Just Sands Off the Personality',
 'Several of our "better" variants are simply flatter, safer, and more corporate in tone. Track whether a tuning pass increased truth, reduced weirdness, narrowed style variance, or just beige-washed the answer until fewer people remembered it.',
 'stop calling de-personalizing the model improvement',
  89),

-- Staff Researcher Naomi
-- REPORTER: Naomi | Staff Researcher | Has seen enough mushy model answers to know evasiveness deserves its own crime category.
('DRIFT-793', 'Distinguish Wrong Answers from Answers That Are Just Cowardly Fog',
 'A surprising number of bad outputs are not ignorant so much as evasive: vague, hedged, generic, and backing slowly away from commitment. Add a failure mode for strategic mush so the model stops hiding bad answers inside tasteful mist.',
 'split wrong answers from cowardly fog',
  89),

('DRIFT-794', 'Flag Benchmarks We Only Love Because We Already Know How to Beat Them',
 'Some benchmarks are no longer tests. They are comfort objects with charts. Mark the old favorites so we can tell the difference between genuine generalization and another triumphant lap around a track the team already memorized.',
 'flag benchmarks we only love',
  144),

-- Chief AI Operations Officer Mirek
-- REPORTER: Mirek | Chief AI Operations Officer | Knows there is a special class of outage where every dashboard is green and the model still feels like a useless coworker.
('DRIFT-795', 'Open a War Room for Models That Are Technically Fine and Socially Useless',
 'Sometimes latency is green, infra is calm, and accuracy has not visibly cratered, yet users still leave annoyed because the model became timid, repetitive, or painfully literal in all the wrong places. Add a socially-useless incident flag and route those runs into the same triage flow as actual outages before the graphs get around to admitting it.',
 'open war room for technically fine useless models',
  144),;
