-- MESH: abstraction layers, service sprawl, platform self-harm, and architectural overreach
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Platform Architect Yaroslav
-- REPORTER: Yaroslav | Platform Architect | Builds wrappers around wrappers until clarity becomes somebody else's staffing problem.
('MESH-466', 'Put One Official Facade in Front of the Other Seven Facades',
 'The system has acquired enough interfaces, adapters, wrappers, and service boundaries that no one can expose them directly without admitting what happened. Add one sanctioned facade on top so teams stop picking their own favorite wrapper and platform can centralize the confusion professionally.',
 'wrap the wrappers in one official facade',
  233),

('MESH-467', 'Every Internal API Must Publish a Capability Manifest Nobody Reads but Everyone Cites',
 'APIs should not merely respond. They should self-describe with enough formality to make integration meetings feel pre-solved. Require a capability manifest listing verbs, limits, intentions, and adjacent promises. Reading it is secondary. Citing it is the feature.',
 'make internal apis publish capability manifests',
  144),

-- Service Mesh Enthusiast Ingrid
-- REPORTER: Ingrid | Service Mesh Enthusiast | Refuses to stop at packets when team politics are the more volatile protocol.
('MESH-468', 'The Service Mesh Must Also Mediate Team Boundaries for Consistency',
 'We have successfully routed traffic through sidecars but left social contracts tragically unproxied. Extend the mesh model so ownership handoffs, escalation routes, and latency budgets between teams are expressed in the same language as retries and circuit breakers.',
 'make service mesh mediate team boundaries',
  233),

('MESH-469', 'All Internal Calls Need Tracing Rich Enough to Show Which Abstraction Added the Delay',
 'End-to-end traces tell us where time went, but not which layer of platform ambition consumed it. Annotate spans with whether the delay came from business logic, serialization, auth, queuing, or a noble abstraction somebody introduced to prevent tight coupling three years before this ruined lunch.',
 'add tracing that names the slow abstraction',
  144),

-- Platform PM Jonah
-- REPORTER: Jonah | Platform PM | Makes new layers fill out forms before they earn more nouns and accidental longevity.
('MESH-470', 'Create a Platform Intake Form That Requires Teams to Prove They Truly Need Another Layer',
 'New layers appear too easily because they still sound strategic by default. Before any team adds a gateway, adapter, façade, broker, orchestrator, or helper service, require an intake explaining what the existing complexity failed to achieve and why another conceptual floor will not simply turn the building into geology.',
 'make teams justify every new platform layer',
  144),

('MESH-471', 'The Shared Platform SDK Must Support Patterns It Quietly Hopes Nobody Uses',
 'Teams insist on edge cases, one-off integrations, and operational exceptions with the confidence of people who do not have to maintain the SDK afterward. Expand the platform SDK to support them officially, but annotate the APIs so future archaeology can tell which paths were blessed and which were tolerated under protest.',
 'make shared sdk support tolerated edge cases',
  144),

-- Backend Guild Chair Tereza
-- REPORTER: Tereza | Backend Guild Chair | Makes baby services announce the medium-sized monster they plan to become.
('MESH-472', 'Every New Microservice Must Name the Monolith It Secretly Wants to Become',
 'We keep decomposing systems into hopeful fragments without admitting each fragment carries an ancestral desire to accumulate responsibilities and become a medium-sized problem. Require new services to declare their likely future monolith shape at birth.',
 'make new microservices name their final form',
  144),

('MESH-473', 'The Domain Model Needs a Diagram Showing Which Contexts Only Exist Because of Org Charts',
 'Bounded contexts are presented as business truth when some are clearly shaped by reporting lines, mergers, and one persuasive director from 2022. Add a diagram separating conceptual necessity from org-chart residue so politics and product stop wearing the same costume.',
 'add a diagram for all the fake contexts',
  144),

-- API Governance Lead Chantal
-- REPORTER: Chantal | API Governance Lead | Prices reversibility before consensus turns a temporary field into constitutional law.
('MESH-474', 'All Shared Schemas Must Include a "How Hard Will This Be to Undo?" Estimate',
 'Teams keep proposing shared objects as if unification were morally free. Add a required estimate for how painful each schema choice will be to unwind once one consumer turns a temporary field into constitutional law. Reversibility deserves a price tag up front.',
 'make shared schemas show migration pain',
  144),

('MESH-475', 'The API Review Council Must Rate Endpoints on Whether They Feel "Too Convenient"',
 'Some endpoints are elegant in the dangerous way that encourages overreach, hidden coupling, and one giant route becoming the emotional-support API for half the company. Add a convenience score so suspiciously useful surfaces get examined before they become inevitable.',
 'make api review council rate endpoints',
  89),

-- Infrastructure Planner Soren
-- REPORTER: Soren | Infrastructure Planner | Gives jobs genealogy and event verbs stricter meanings than panic usually allows.
('MESH-476', 'Every Background Job Needs a Provenance Chain for Why It Still Exists',
 'Background jobs accumulate like quiet folklore, each with a schedule, a purpose, and immunity from being questioned. Require every job to document origin, owner, downstream effect, and the last time somebody was brave enough to ask whether it should continue breathing.',
 'add provenance chain to background jobs',
  144),

('MESH-477', 'The Event Taxonomy Must Stop Letting Three Teams Mean Different Things by "Updated"',
 'Updated is not a meaningful event name when Sales means status changed, Product means metadata drifted, and Ops means we touched it while panicking. Normalize the taxonomy so verbs earn specificity commensurate with the chaos they drive downstream.',
 'stop three teams calling everything updated',
  144),

-- Principal Engineer Rina
-- REPORTER: Rina | Principal Engineer | Wants accidental internal products and service sprawl taxed before neglect becomes strategy.
('MESH-478', 'The Internal Platform Should Admit When It Is Just a Product Nobody Wanted to Staff',
 'We keep calling things internal platforms when what we mean is a product with customers, support obligations, roadmap politics, and no appetite for being recognized as such. Add operating metadata for owner, users, adoption risk, and whether the team still pretends this is just tooling.',
 'add staffing disclaimer to platform docs',
  144),

('MESH-479', 'Create a "Complexity Budget" for Teams That Keep Solving Problems with New Services',
 'Simplicity cannot survive if complexity remains fiscally free. Assign each team a budget covering services, queues, schemas, workers, dashboards, on-call surfaces, and magical helpers. Once they exceed it, new architecture must be paid for by deleting something real.',
 'add complexity budget for teams adding services',
  233),

-- CTO Advisor Elise
-- REPORTER: Elise | CTO Advisor | Forces architecture reviews to sit quietly with the possibility that doing less was available.
('MESH-480', 'The Architecture Review Deck Must Include a Slide Titled "What If We Just Did Less?"',
 'Review decks already have enough optimism, layers, and tasteful boxes. Add one brutally simple slide asking whether the proposed complexity is necessary, reversible, comprehensible, and survivable by the team inheriting it after the champions discover sleep or startups.',
 'add a what if we did less slide',
  144),;
