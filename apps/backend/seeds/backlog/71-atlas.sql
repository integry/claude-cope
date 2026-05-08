-- ATLAS: maps, geo, routing, fleet dispatch, geocoding, and spatial software anguish
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Location Data Lead Noor
-- REPORTER: Noor | Location Data Lead | Has accepted that half of geocoding is geometry and the other half is one resident saying "turn left at the old bakery that is now a vape shop."
('ATLAS-1241', 'Teach Geocoding That Some Addresses Are Basically Folklore with Numbers',
 'Formal address logic keeps collapsing when reality shows up as landmarks, local nicknames, inherited numbering sins, and one building everyone swears is "next to the old pharmacy." Add folklore tolerance before the map keeps acting shocked that humans describe place like humans.',
 'teach geocoding some addresses are folklore',
  144),

('ATLAS-1242', 'Make Reverse Geocoding Admit When the Pin Landed There by Luck',
 'Phones wobble. Buildings are dense. Sometimes the user was walking with the device in a tote bag. Stop returning parcel-level confidence when the coordinates were basically guessed through weather and optimism.',
 'make reverse geocoding admit lucky guesses',
  144),

-- Routing Systems PM Timo
-- REPORTER: Timo | Routing Systems PM | Knows roads are not lines on a graph so much as public arguments with lane markings.
('ATLAS-1243', 'Add a Traffic State for "The Road Is Open but the City Clearly Meant No"',
 'ETA logic keeps getting ambushed by parades, school pickup, double parking, cones, weather, and the municipal decision to turn one avenue into a full-body refusal. Stop acting like asphalt automatically implies cooperation.',
 'add traffic state for open but no',
  144),

('ATLAS-1244', 'Reject Routes That Only Make Sense If the Driver Is a Hovering Spreadsheet',
 'Optimization keeps generating gorgeous plans with impossible parking, cursed left turns, fake loading assumptions, and transfer timings only a drone would accept quietly. Add one basic human filter before the route planner insults another courier with math.',
 'reject routes that only work for hovering spreadsheets',
  144),

-- Logistics Intelligence Lead Hana
-- REPORTER: Hana | Logistics Intelligence Lead | Has watched too many delivery failures get blamed on "bad addresses" when the real problem was one feral buzzer panel and a concierge with principles.
('ATLAS-1245', 'Track Buildings That Require a Secret Handshake to Receive a Package',
 'Delivery analytics keep flattening gate codes, concierge moods, fake loading docks, buzzer myths, and "leave it at reception" instructions for receptions that do not exist. Name the building nonsense so the dashboard stops blaming the address for having culture.',
 'track buildings needing secret handshakes',
  144),

('ATLAS-1246', 'Show the Exact Places Drivers Ignored the Map for Excellent Reasons',
 'Route replay keeps treating every deviation like a tiny rebellion even when the driver was avoiding a barricade, a dead turn, or a deeply stupid instruction from our cheerful little route engine. Highlight the smart disobedience before ops punishes local knowledge again.',
 'show where drivers wisely ignored maps',
  144),

-- Geo UX PM Elise
-- REPORTER: Elise | Geo UX PM | Knows a pin can be only twenty meters off and still ruin somebody's groceries, stroller, knees, and faith in software.
('ATLAS-1247', 'Label Pins That Are Technically Close but Practically Up Another Hill',
 'A small map error turns into a real alley, staircase, courtyard, or muttered betrayal when someone is carrying bags or a child. Stop calling that "close enough" just because the dot looks tidy from space.',
 'label pins that are close but uphill',
  144),

('ATLAS-1248', 'Indoor Maps Should Stop Bluffing About Corridors They Met Last Tuesday',
 'Office towers, malls, and hospitals keep rearranging rooms while our indoor layer clings to one old PDF and a prayer. Add freshness and uncertainty cues before directions send people confidently into a drywall surprise.',
 'stop indoor maps bluffing about corridors',
  144),

-- Spatial Data Engineer Kian
-- REPORTER: Kian | Spatial Data Engineer | Has learned that every boundary line is either a law, a service region, a neighborhood feeling, or a polygon someone published too quickly.
('ATLAS-1249', 'Label Boundary Lines by Whether They Are Law, Convenience, or Neighborhood Propaganda',
 'Downstream systems keep treating every polygon like a sacred fact even when some lines are legal, some are logistical, and some are just how locals point while telling stories. Tag the reality type before another map pretends all borders carry the same authority.',
 'label boundaries as law convenience or propaganda',
  144),

('ATLAS-1250', 'Stop POI Ranking from Treating Internet Hype Like Useful Directions',
 'The loudest cafe online is not necessarily the best landmark for finding a pharmacy, a pickup point, or a sane turn. Put navigational usefulness back above digital charisma before place ranking becomes influencer cartography.',
 'stop poi ranking treating hype as directions',
  89),

-- Field Mapping Operations Lead Marta
-- REPORTER: Marta | Field Mapping Operations Lead | Is tired of temporary cones, weekend detours, and one dramatic lane closure becoming permanent truths in the sacred map forever.
('ATLAS-1251', 'Expire Temporary Road Changes Before Traffic Cones Achieve Immortality',
 'A weekend closure enters the system humbly and somehow lives there for months like a tiny orange constitutional amendment. Add decay rules before routing gets permanently redesigned by one heroic pile of cones.',
 'expire road changes fast',
  144),

('ATLAS-1252', 'Mark Reports Where the Citizen Is Correct and the Municipality Is Just Weird',
 'Correction queues keep dismissing perfectly valid reports because the official map is late, the lot got split, or the city is still honoring a numbering scheme invented during a local administrative fever. Flag civic weirdness before residents lose to stale paperwork again.',
 'mark reports where city is weird',
  144),

-- Chief Route Systems Officer Petra
-- REPORTER: Petra | Chief Route Systems Officer | Wants the map to lose one public argument with asphalt before it sends another driver into a lake out of algorithmic self-respect.
('ATLAS-1253', 'Routes That End in Water Should Wear a Big Experimental Badge',
 'If the same route keeps sending drivers, couriers, or tired civilians into lakes, barricades, or emotional side quests, we are past the point of calling it an edge case. Mark the route Experimental until the software learns to fear the physical world again.',
 'badge routes that end in water',
  144),;
