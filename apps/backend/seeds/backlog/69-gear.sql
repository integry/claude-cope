-- GEAR: robotics, manufacturing, industrial control, PLCs, and factory-floor software pain
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Factory Systems Director Bram
-- REPORTER: Bram | Factory Systems Director | Has seen too many PLC "improvements" increase throughput and also triple the amount of folklore required to touch the line safely.
('GEAR-1211', 'Force Every PLC Change to Admit How Much New Technician Mythology It Will Create',
 'Control logic updates keep arriving dressed as efficiency while quietly making maintenance more ceremonial, more fragile, and more dependent on one guy named Gary. Add a burden note before throughput gains hide their downstream curse.',
 'log plc changes in plain english',
  144),

('GEAR-1212', 'Teach the HMI the Difference Between Real Danger and Ordinary Machine Drama',
 'Operator trust dies when every minor state shift turns the whole screen red like the factory just entered judgment. Split peril from melodrama before the alarms mean everything and therefore nothing.',
 'label hmi alerts danger or noise',
  144),

-- Robotics Fleet PM Keiko
-- REPORTER: Keiko | Robotics Fleet PM | Knows warehouse robots do not operate in geometry; they operate in forklift politics and painted-line disrespect.
('GEAR-1213', 'Teach Warehouse Robots That Forklifts Are Moving Political Weather',
 'Autonomous routes keep assuming the floor is orderly when it is actually full of pallets, urgency, human improvisation, and forklift drivers who treat painted paths as philosophical suggestions. Add human-chaos mode before the bots learn humility the hard way.',
 'simulate forklift traffic in robot planner',
  144),

('GEAR-1214', 'Count Near-Miss Dances Separately from Actual Collision Prevention',
 'Some safety stacks are not eliminating accidents so much as replacing them with elegant deadlock ballets and route hesitation. Break near-miss choreography out into its own counter before the system gets praised for making danger look tidier.',
 'track near misses separately from collisions',
  144),

-- Manufacturing Data PM Luis
-- REPORTER: Luis | Manufacturing Data PM | Is tired of OEE quietly blaming steel for downtime that was actually caused by software pausing to think about itself.
('GEAR-1215', 'Expose Machine Downtime Caused by Software Thinking Too Long',
 'Idle time keeps getting blamed on equipment when a growing slice is really firmware hesitation, orchestration drift, and code politely arranging itself while the line waits. Break software delay out before steel takes the blame for JavaScript again.',
 'expose downtime caused by software overthinking',
  144),

('GEAR-1216', 'Track Scrap Caused by Settings That Were Legal and Still Completely Idiotic',
 'A surprising amount of bad output comes from configuration combinations that passed validation, satisfied forms, and still should never have met real material. Add a category for accepted nonsense before compliance keeps impersonating wisdom.',
 'track scrap caused by compliance settings',
  144),

-- Industrial Networking Lead Priya
-- REPORTER: Priya | Industrial Networking Lead | Can point at a switch and tell whether it was designed, inherited, or installed by a very confident electrician during a bad week.
('GEAR-1217', 'Color-Code the Factory Network by Design Versus Historical Wiring Improvisation',
 'Plant networks keep presenting themselves as architecture when large parts are really cable archaeology with uptime attached. Mark the accidental sections before outage planning turns into speculative fiction.',
 'color-code factory network by wiring improvisation',
  144),

('GEAR-1218', 'Show When One Tiny Gateway Has Quietly Become Governor of the Entire Factory Mood',
 'We have too many critical flows resting on one fanless little brick nobody worries about until it becomes the emotional center of half the line. Add a dependency weight view before a cheap box gains sovereign power by surprise.',
 'show gateway dependency on factory dashboard',
  144),

-- Safety Systems Engineer Tomas
-- REPORTER: Tomas | Safety Systems Engineer | Maintains one sacred rule: software may observe the red button, but it may not get curious about touching it.
('GEAR-1219', 'Make Safety Integrations Prove They Only Look at the Red Button',
 'The line between observing emergency-stop circuits and getting ideas about them must stay bright, loud, and legally boring. Require proof before convenience starts inching toward influence.',
 'hardcode safety integration to ignore everything except red',
  144),

('GEAR-1220', 'Let Incident Reviews Admit When Physics, Process, and Courage All Helped Cause the Accident',
 'Too many root-cause writeups flatten ugly afternoons into one elegant reason when the truth involves wear, timing, overrides, assumptions, and one brave click too many. Add multi-layer blame before the report flatters itself.',
 'add physics helped checkbox to incident reviews',
  144),

-- Maintenance Planning PM Hana
-- REPORTER: Hana | Maintenance Planning PM | Knows predictive maintenance can sound exactly like a wise old mechanic right up until it is just a spreadsheet gossiping about vibration.
('GEAR-1221', 'Teach Predictive Maintenance the Difference Between Real Failure and Vibration Gossip',
 'Sensor-heavy systems keep upgrading every anomaly into prophecy. Add ambition markers so planners can tell looming failure from mathematically decorated nervousness.',
 'classify maintenance alerts by confidence',
  144),

('GEAR-1222', 'Warn Us When One Boring Spare Part Is About to Become a Philosophical Lesson',
 'Inventory buffers look solid until one unremarkable belt or seal becomes unavailable and the line discovers that resilience was secretly being rented from luck. Add alerts before procurement turns metaphysical.',
 'warn when spare parts hit shortages',
  144),

-- Vision Systems Lead Nico
-- REPORTER: Nico | Vision Systems Lead | Knows cameras are happiest when the lighting is stable, the dust behaves, and reality itself has agreed not to become abstract art today.
('GEAR-1223', 'Stop the Defect Model from Confusing Lighting Drama with Actual Product Failure',
 'Machine vision remains too confident in environments where glare, bulb aging, dust, and reflective packaging can turn inspection into gallery work. Add environment confidence so photons stop getting written up as defects.',
 'stop defect models confusing lighting with failure',
  144),

('GEAR-1224', 'Make Calibration Prove Whether the Floor Moved or the Model Just Found Religion',
 'Regression in a vision line can come from hardware drift, environmental shift, or the model developing a stricter doctrine overnight. Add a sanity check before recalibration turns into weekly theology.',
 'make calibration prove floor shift versus model religion',
  144),

-- Chief Industrial Software Officer Petra
-- REPORTER: Petra | Chief Industrial Software Officer | Wants one honest number showing whether the software truly runs the line or is just arguing with machinery at industrial volume.
('GEAR-1225', 'Turn the Control Panel Amber When the Factory Is Clearly Winning the Argument',
 'If alarms are noisy, robots are improvising, the network is lying, and maintenance is translating around all of it, the system should stop projecting command. Add an amber state that says the software is negotiating with the line, not running it.',
 'turn panel amber during manual overrides',
  144),;
