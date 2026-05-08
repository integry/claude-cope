-- CRUD: admin panels, internal tools, app builders, and productized mediocrity
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Internal Tools PM Vanessa
-- REPORTER: Vanessa | Internal Tools PM | Thinks validation and consequences are anti-patterns when product wants to move furniture.
('CRUD-301', 'Rebuild the Admin Panel in a Low-Code Builder So Product Can Break It Without Waiting',
 'Engineering has monopolized the admin panel for too long with things like validation and consequence. Move it into a low-code builder where product can drag fields, permissions, and button labels around at the speed of changing its mind. If a bulk refund button ends up next to a harmless toggle, that is product autonomy finding its natural habitat.',
 'rebuild the admin panel in a low-code builder',
  233),

('CRUD-302', 'All Backoffice Screens Must Support Bulk Actions We Have Not Thought Through Yet',
 'Clicking one record at a time communicates distrust. Every internal screen needs bulk archive, bulk reassign, bulk notify, bulk gently nudge, and one configurable button whose purpose can be invented in the meeting immediately before launch. Edge cases can wait for the first irreversible accident to explain themselves.',
 'add bulk actions to every backoffice screen',
  144),

-- App Platform Lead Jerome
-- REPORTER: Jerome | App Platform Lead | Builds frameworks large enough to hide every future regret behind tabs.
('CRUD-303', 'Create a Generic Settings Framework That Can Model Every Future Regret',
 'Teams keep adding bespoke settings pages when what we clearly need is one universal settings framework with tabs, sub-tabs, collapsible policy cards, scoped overrides, environment defaults, and a side rail for controls nobody remembers enabling. If users cannot find the toggle, that only proves the framework is finally complete.',
 'create a generic settings framework can model',
  233),

('CRUD-304', 'The Form Builder Must Support Conditional Logic So Nested It Qualifies as Folklore',
 'Our current form builder is offensively linear. Real business logic requires if this, unless that, except for enterprise, unless mobile, unless imported, unless Tuesday after 4 PM. Give business users a rule engine powerful enough to preserve the company''s contradictions in their native habitat.',
 'stack conditional branches until opening the form editor',
  233),

-- Customer Ops Director Alicia
-- REPORTER: Alicia | Customer Ops Director | Prefers centralized confusion to scattered confusion with worse filters.
('CRUD-305', 'Support Needs a Timeline View That Combines User Actions, Internal Notes, and Pure Suspicion',
 'The current customer timeline tells me what happened but not what people privately feared was happening. Build one view that merges audit events, support notes, account changes, Slack excerpts, and unverified hunches typed during live escalations. If the truth stays messy, the mess should at least be filterable.',
 'make a support timeline for everything',
  144),

('CRUD-306', 'Add a One-Click "Fix Customer" Button for the Executive Escalation Queue',
 'Important customers do not have time for root causes. They need a button. When leadership pings Support with Please fix this account now, the UI should offer one decisive-looking action that clears caches, resends invites, rotates a token, whispers to billing, or all four. The exact mechanics can evolve. The confidence must ship first.',
 'add one-click fix customer button',
  89),

-- Growth Product Designer Mina
-- REPORTER: Mina | Growth Product Designer | Styles emptiness as potential and instability as product flexibility.
('CRUD-307', 'Every Empty State Must Offer the User a Template, a Wizard, and Unsolicited Confidence',
 'Empty states are too honest about the absence of value. Whenever a list is empty, a project has no items, or a dashboard has no data, offer a starter template, a setup wizard, and a paragraph implying the user is one brave click away from operational elegance. We are not hiding emptiness. We are styling it as a runway.',
 'make empty states push templates and wizards',
  89),

('CRUD-308', 'The Table Component Must Support Inline Editing, Inline Validation, and Inline Regret',
 'Users hate detail pages because they imply sequence and consequence. Make every table cell editable, validatable, partially rejectable, and savable in place until each row feels both flexible and faintly dangerous. If half the row updates and the other half sulks, that is a conversation between the user and modern software.',
 'make tables support inline editing everywhere',
  144),

-- Head of RevOps Gareth
-- REPORTER: Gareth | Head of RevOps | Hands non-engineers enough automation to annex the backend by accident.
('CRUD-309', 'Build a Workflow Builder for Non-Engineers That Can Accidentally Become the Backend',
 'We keep asking engineering for tiny automations and receiving estimates involving quarters and adulthood. Build a workflow canvas so non-engineers can define triggers, filters, branches, enrichments, Slack messages, escalations, and billing side effects themselves. If it quietly starts owning core business logic, that only proves adoption.',
 'build a workflow builder non-engineers can accidentally',
  233),

('CRUD-310', 'All Approval Flows Need a "Skip Because I Know What I''m Doing" Escape Hatch',
 'Governance has become a drag on informed improvisation. Add a bypass to every approval screen for operators with enough confidence or enough title. The system can log who skipped what later, once velocity has enjoyed its head start.',
 'add a bypass for confident adults',
  144),

-- BI Product Analyst Lena
-- REPORTER: Lena | BI Product Analyst | Wants dashboards to infer intent from hesitation and upsell CSV users out of guilt.
('CRUD-311', 'The Report Builder Must Suggest KPIs Based on Which Dropdown the User Looked at Longest',
 'Most users do not know which metric they want until a dashboard hints at one hard enough. Add a recommendation layer that infers intent from hover time, tab hesitation, and whether they opened export before choosing dimensions. It is time to bring personalization to charts the same way e-commerce brought it to socks.',
 'make report builder guess kpis from dropdowns',
  144),

('CRUD-312', 'Every Export Modal Must Upsell the User to a Dashboard They Will Never Open Again',
 'If a user is exporting raw data, that is a cry for a product surface we failed to oversell. Before delivering the CSV, present two alternate dashboards, one premium add-on, and a note implying manual analysis may signal untapped strategic appetite. The file can still leave, but not unjudged.',
 'make export modals upsell dashboards',
  89),

-- Operations Architect Hugo
-- REPORTER: Hugo | Operations Architect | Calls consensus expensive and replaces it with tabs, overrides, and folklore search.
('CRUD-313', 'Create a Master Data Console Where Everyone Can Edit Shared Entities and Nobody Can Agree',
 'Centralized master data sounds wonderful until departments meet it. Build a console for products, plans, regions, tags, segments, exceptions, and statuses that claims to be the source of truth while still permitting local overrides, flags, and notes beginning with for finance only. Consensus is expensive. Tabs are cheaper.',
 'build source of truth console',
  233),

('CRUD-314', 'The Internal Search Tool Should Index Wikis, Tickets, Dashboards, and Accidental Lore',
 'Search currently finds documents but misses the folklore that actually explains the company. Index the wiki, the ticket queue, runbooks, dashboard titles, incident summaries, and any Slack phrase repeated twelve times with the tone of inherited warning. We do not need perfect relevance. We need to discover why everybody fears a cron job called lavender.',
 'feed the search index enough formal docs',
  233),

-- COO Natalie
-- REPORTER: Natalie | COO | Wants five oversized tiles to do violence to nuance on behalf of leadership.
('CRUD-315', 'Launch an Executive Cockpit That Summarizes the Entire Business in Five Overconfident Tiles',
 'Leadership should not have to experience the business as a forest of tabs and caveats. Build an executive cockpit with five oversized tiles: Revenue, Risk, Delivery, Customer Mood, and Strategic Heat. Each should flatten dozens of conflicting signals into one decisive color and a sentence bold enough to survive a board-deck screenshot.',
 'launch an executive cockpit for everything',
  144),;
