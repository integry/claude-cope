-- BLOAT: toolchain sprawl, package mania, framework churn, and dependency self-harm
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Build Systems Engineer Timo
-- REPORTER: Timo | Build Systems Engineer | Measures modernity by how many tools must suffer together before the app can ship.
('BLOAT-496', 'The Frontend Build Should Fail If Fewer Than Nine Tools Participate',
 'The current toolchain has become alarmingly comprehensible. A modern frontend build should require a package manager, a bundler, a second bundler, a transpiler, a post-transpiler, a CSS stage, a type stage, a lint stage, a formatting suggestion, and at least one plugin whose maintenance status is interpretive.',
 'make frontend builds require nine tools',
  233),

('BLOAT-497', 'Every Dependency Update Must Produce a Human-Readable Explanation of Which New Problems It Invented',
 'Changelogs remain too optimistic and too adjacent to marketing. Add a local summary step after dependency bumps that translates upgrades into operational truth: which scripts broke, which type definitions became more judgmental, which peer deps are now in a feelings-based relationship, and whether the lockfile radiates intent or distress.',
 'make dependency updates explain their new problems',
  144),

-- Web Platform Lead Frances
-- REPORTER: Frances | Web Platform Lead | Shames ornamental dependencies and lets the monorepo briefly question its own destiny.
('BLOAT-498', 'The Package Manager Must Detect When We Installed a Library Just to Avoid Writing Twelve Lines',
 'Convenience has crossed into ornamental dependency accumulation. Add a linter that estimates whether a newly added library merely replaces a dozen lines of code, a mildly unpleasant regex, or one afternoon of mature adulthood. Teams may proceed anyway, but the tarball should arrive under supervision.',
 'make package manager shame us for tiny dependencies',
  89),

('BLOAT-499', 'All Monorepo Tooling Needs a "Would This Be Easier as Separate Repos?" Indicator We Ignore',
 'Monorepo tooling currently assumes unity is self-justifying. Add an indicator estimating whether each new layer of caching, graph resolution, workspace linking, and filtered execution is compensating for a social problem disguised as source-control philosophy. We will still ignore it. The dashboard should ask anyway.',
 'add should this be separate repos warning',
  144),

-- JavaScript Council Chair Basil
-- REPORTER: Basil | JavaScript Council Chair | Forces teams to decommission one frontend belief before converting to another in public.
('BLOAT-500', 'Create a Framework Sunset Policy So We Stop Discovering Three Frontend Religions per Quarter',
 'Teams keep adopting frameworks as if the company were a conference hallway where nobody pays maintenance after the sticker photo. Establish a sunset policy for libraries, state managers, meta-frameworks, CSS approaches, and bundlers so one belief retires before the next is installed.',
 'create a framework sunset policy',
  144),

('BLOAT-501', 'The UI Kit Must Work in React, Vue, Svelte, and the One Legacy Screen No One Wants to Touch',
 'Leadership keeps describing the component library as universal, which would be less stressful if it did not currently mean React with aspirations. Expand the kit to support four frameworks and one ancient screen implemented in a style best described as handcrafted browser diplomacy.',
 'make ui kit work in every framework',
  233),

-- Dev Productivity PM Haruka
-- REPORTER: Haruka | Developer Productivity PM | Routes workflow improvements through committee so nobody becomes suspiciously efficient in private.
('BLOAT-502', 'Gate New Dev Tools Behind an Approval Screen So Nobody Improves Their Workflow in Secret',
 'Personal tooling choices keep evolving faster than governance can contain the blast radius. Any new formatter, linter, task runner, package-script pattern, editor extension, or local helper must pass through an approval screen that evaluates not just utility but the cultural consequences of one person becoming too fast for everyone else.',
 'gate new dev tools behind an approval screen',
  89),

('BLOAT-503', 'Every CLI Command Needs a Wrapper So Nobody Has to Remember What the Original Tool Does',
 'Native tool interfaces remain tragically specific and therefore exclusionary. Wrap common commands in our own abstractions with friendlier flags, more corporate nouns, and enough hidden assumptions that new hires stop learning the underlying tools altogether. Leaving later should feel like moving planets.',
 'write a wrapper so i can use this',
  144),

-- Release Toolsmith Mikkel
-- REPORTER: Mikkel | Release Toolsmith | Caches mysterious outputs and translates offended plugin dialect into plain-language blame.
('BLOAT-504', 'The Build Cache Must Cache Things We No Longer Understand but Are Afraid to Recompute',
 'Caching currently optimizes repeat work while leaving existential uncertainty unpriced. Extend the cache policy to preserve outputs whose provenance, necessity, or inner shape have grown obscure over time yet whose regeneration feels dangerously educational. Some artifacts should persist purely to protect morale.',
 'make build cache keep scary expensive stuff',
  144),

('BLOAT-505', 'All Toolchain Errors Need a Mode That Explains Them Without Assuming Stockholm Syndrome',
 'Tooling errors still write as though the reader already shares a long, tender history with loaders, plugins, transpilation stages, and one invisible cache directory under a moonlit path. Add a plain-language mode that explains what failed, why the stack trace sounds offended, and which layer deserves the anger.',
 'add no stockholm syndrome mode to toolchain errors',
  89),

-- Staff Engineer Noor
-- REPORTER: Noor | Staff Engineer | Publicly ranks analytics pixels above actual product features and waits for shame to rebalance the bytes.
('BLOAT-506', 'The Bundle Analyzer Must Show Which Marketing Pixels Are Living Better Than Core Features',
 'Our bundle report still treats all bytes as equal, which is how marketing scripts keep graduating into architectural nobility while product features negotiate over leftovers. Add a view comparing weight, criticality, and business honesty so we can finally see which trackers and chat widgets eat better than checkout logic.',
 'make bundle analyzer shame the fat marketing pixels',
  144),

('BLOAT-507', 'Every New Build Step Must Name the Old Build Step It Secretly Distrusts',
 'Build chains do not grow randomly. They grow because one step stopped trusting another and expressed that distrust as a plugin. Require new steps to cite the exact predecessor they are compensating for and whether this is a temporary patch or a permanent schism.',
 'make new build steps blame old ones',
  144),

-- Open Source Programs Manager Elsa
-- REPORTER: Elsa | Open Source Programs Manager | Tracks maintainer loneliness and license acronyms like both are supply-chain risk indicators.
('BLOAT-508', 'Track Which Dependencies Are Maintained by One Person and a Vague Sense of Duty',
 'Supply chain risk should not begin and end with vulnerability scans. Add metadata for whether dependencies are backed by a company, a foundation, or one heroic maintainer whose issue replies alternate between grace and visible exhaustion.',
 'track dependencies maintained by one person and duty',
  144),

('BLOAT-509', 'Stamp the Package That Forced Legal to Learn a New Acronym',
 'Legal does not need another spreadsheet of SPDX codes without texture. Stamp the exact package that introduced the fresh licensing problem, who added it, and whether the usage was essential or just the byproduct of someone installing a markdown helper with recreational ambition.',
 'stamp packages that scared legal',
  89),

-- Frontend Architect Jules
-- REPORTER: Jules | Frontend Architect | Feeds every team the same tokens through different rituals so uniqueness stays mostly ceremonial.
('BLOAT-510', 'Create a CSS Toolchain That Lets Every Team Feel Unique While Shipping the Same Design Token',
 'We are close to a wonderful equilibrium where every team believes it has its own CSS identity while all roads still pass through the same token registry, post-processing stack, purge ritual, and naming-convention grievance. Preserve that balance deliberately.',
 'make css toolchain fake uniqueness for every team',
  89),;
