-- ZANY: deliberately miscellaneous cursed leftovers, weird platforms, and final backlog oddities
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- Office Infrastructure Curator Nell
-- REPORTER: Nell | Office Infrastructure Curator | Takes missing yogurt and fake room occupancy more seriously than some teams take platform risk.
('ZANY-976', 'Treat Missing Yogurt as a Supply Chain Incident',
 'Snack disappearance has crossed the line from petty annoyance into measurable trust collapse. Wire the breakroom fridge weight-sensors into the ERP system. If the yogurt inventory drops without a corresponding badge swipe, trigger an automated "Supply Chain Incident" alert to the Facilities Slack channel.',
 'wire breakroom fridge sensors to incident alerts',
  89),

('ZANY-977', 'Teach Room Tablets the Difference Between Real Meetings and Prestige Linger',
 'Conference rooms stay occupied because people keep performing importance for six extra minutes after the useful part ends. Write a script that checks the room''s motion sensors against the calendar end-time. If there is movement but no active screen-sharing, label the duration "Prestige Linger" in the utilization dashboard.',
 'track fake meeting extensions in the dashboard',
  89),

-- Corporate Archivist Simon
-- REPORTER: Simon | Corporate Archivist | Fights a lonely war against handsome dead PDFs and wiki pages preserved mainly by old certainty and carpet smell.
('ZANY-978', 'Stop Intranet Search from Worshipping PDFs That Smell Like 2014',
 'Search keeps overranking elderly documents whose formatting radiates permanence despite being obsolete by three systems and two reorgs. Demote the handsome dead PDFs before the intranet fully turns into a mausoleum concierge.',
 'stop intranet search worshipping old pdfs',
  89),

('ZANY-979', 'Put a Badge on Wiki Pages That Says "Sounded Right When Written"',
 'Some documentation is accurate. Some is just a preserved moment of markdown confidence from someone who had no idea the future would object. Mark the difference so old certainty stops passing for maintenance.',
 'badge wiki pages that once sounded right',
  89),

-- Enterprise Gadget PM Yuki
-- REPORTER: Yuki | Enterprise Gadget PM | Has seen enough keynote tablets betray executives mid-flight to stop trusting software updates around symbolic events.
('ZANY-980', 'Stop the CEO Demo Tablet from Updating During Flights, Summits, or Emotional Milestones',
 'Executive demo hardware keeps discovering new software at the exact moment a room full of people wants inevitability instead. Add occasion awareness so the tablet can preserve both trust and the keynote.',
 'stop ceo demo tablets updating',
  144),

('ZANY-981', 'Give Badge Readers a Graceful Mode for Investors Who Think Doors Are Optional',
 'There is a recurring premium edge case where a wealthy visitor assumes access control should yield to title, confidence, and vague urgency. Add a fallback that protects security without turning the lobby into a referendum on money and friction.',
 'give badge readers investor mode',
  89),

-- Workplace Automation Hacker Priyesh
-- REPORTER: Priyesh | Workplace Automation Hacker | Understands that printers, calendars, and room sensors all eventually become political instruments with batteries.
('ZANY-982', 'Make the Printer Queue Rank Jobs by Career Damage Potential',
 'Some print jobs are handouts. Others are HR packets, board decks, or budget materials whose delay can alter an afternoon and maybe a promotion. Rank the queue by combustibility instead of naïve first-in-first-out civility.',
 'rank print jobs by career damage',
  144),

('ZANY-983', 'Warn When a Calendar Invite Is Really Just Passive-Aggressive Performance Art',
 'Shared calendars now carry subtext through titles and the strategic misuse of "optional." Build an Outlook plugin that analyzes attendee hierarchy vs. meeting topic. If an invite includes three VPs for a "Quick Sync" at 4:45 PM on a Friday, append a red `[HOSTILE]` tag to the subject line.',
 'make outlook plugin flag hostile calendar invites',
  89),

-- Customer Demo Engineer Becca
-- REPORTER: Becca | Customer Demo Engineer | Distrusts pristine sample accounts and wants demo environments with at least one unlucky adult trapped inside them.
('ZANY-984', 'Make Demo Data Slightly Broken So It Resembles Civilization',
 'Synthetic demos are suspiciously free of duplicate accounts, malformed names, mixed currencies, and legacy garbage. Roughen the sample data until it starts looking like the world we actually charge people to survive.',
 'make demo data slightly broken',
  144),

('ZANY-985', 'Add a Sample User Who Is Competent but Chronically Unlucky',
 'Current demo personas are either blessed or confused. Add one who does everything right and still gets kneecapped by policy, timing, or system mood, because customers recognize that person instantly and sales quietly respects them.',
 'add sample user who is chronically unlucky',
  89),

-- Experimental Interfaces Researcher Hugo
-- REPORTER: Hugo | Experimental Interfaces Researcher | Wishes voice and gesture systems would admit how often they are freestyling over room noise and enthusiastic arm flailing.
('ZANY-986', 'Make the Voice Assistant Sound Less Certain When It Is Guessing from Acoustic Soup',
 'Speech systems over-project confidence right in the mushy zone where room noise, half-formed intent, and acoustic superstition are doing most of the work. Lower the swagger before wrongness starts arriving in a soothing tone.',
 'make voice assistant sound less sure when guessing',
  89),

('ZANY-987', 'Teach Gesture Controls the Difference Between Commands and Emphatic Human Arms',
 'Gesture UIs remain too eager to interpret ordinary emphasis as system control. Add an emphatic-but-noninteractive state before one animated explanation accidentally mutes, closes, or approves something expensive.',
 'teach gesture controls emphatic human arms',
  89),

-- Corporate Folklore Analyst Mina
-- REPORTER: Mina | Corporate Folklore Analyst | Catalogs the exact moment a managerly rumor turns into an office law everyone follows despite no document ever authorizing it.
('ZANY-988', 'Split Real Policy from the Stories Managers Keep Telling with Authority',
 'Companies accumulate a layer of oral compliance where half-remembered decisions harden into superstition. Add an "Is This Real?" upvote button to the HR Wiki. If a policy page gets downvoted by more than three legal team members, automatically prepend `[FOLKLORE]` to the page title.',
 'add folklore voting button to hr wiki',
  144),

('ZANY-989', 'Predict Which Exception Will Be Remembered as Tradition in Six Months',
 'Temporary exceptions rarely stay temporary once enough confident people repeat them. Add a "Tradition Forecast" column to the Ops approval queue. Train a basic model to flag any workaround that has been approved three times in one month, so we know which duct tape is becoming load-bearing.',
 'add tradition forecast column to ops queue',
  89),

-- Platform Curiosity Officer Devon
-- REPORTER: Devon | Platform Curiosity Officer | Refuses to let staging become so clean that engineers forget reality contains weird little knives.
('ZANY-990', 'Hide One Tasteful Landmine in Every Sandbox So Nobody Gets Comfortable',
 'Test environments that are too clean teach the wrong kind of courage. Seed one strange but plausible edge case so teams occasionally remember the world is not made of symmetric forms and agreeable fake names.',
 'hide one tasteful landmine in every sandbox',
  144),

('ZANY-991', 'Mark the Demos That Only Work Because the Presenter Memorized Around the Broken Part',
 'Some internal demos appear stable because the presenter knows exactly which tab not to open and where to narrate over the latency. Add a flag so choreography stops laundering fragility into competence.',
 'mark the demos that only work',
  89),

-- Chief Administrative Surrealist Petra
-- REPORTER: Petra | Chief Administrative Surrealist | Reviews reimbursements and procurement requests for signs that the explanation has started doing more work than the evidence.
('ZANY-992', 'Reject Expense Claims Whose Moral Justification Is More Detailed Than the Receipt',
 'Expense notes are becoming tiny novellas because the charge is delicate, weird, or openly disallowed and somebody believes enough prose can soften reality. Detect when the narrative is carrying more weight than the proof.',
 'reject expense claims with ethical novellas',
  144),

('ZANY-993', 'Let Procurement Requests Say "The Current Thing Offends My Soul"',
 'Not every purchase request comes from clean ROI. Some come from long exposure to a tool that has become spiritually corrosive. Add a "This Offends My Soul" option to the Procurement Intake dropdown. If selected, disable the ROI calculator and automatically route the ticket to the VP of Finance with a mandatory text box for venting.',
 'add soul offense override to procurement form',
  89),

-- Workflow Anthropologist Oscar
-- REPORTER: Oscar | Workflow Anthropologist | Studies the exact moment a new portal quietly duplicates a legacy ritual nobody had the courage to kill first.
('ZANY-994', 'Ask Every New Onboarding Step Which Old Ritual It Is Accidentally Duplicating',
 'Onboarding steps keep growing around team customs, legacy emails, and one ritual somebody swears is essential. Add a duplication check before software laminates tradition into yet another mandatory click path.',
 'ask onboarding steps which ritual they duplicate',
  89),

('ZANY-995', 'Count Survey Questions Added Because Somebody Had a Bad Tuesday',
 'Survey sprawl often comes from one recent incident getting promoted into quarter-scale listening theater. Build a cron job that checks the SurveyMonkey API for new questions and cross-references them against PagerDuty alerts from the last 48 hours. Print a dashboard metric showing exactly how much of our "curiosity" is just fresh trauma.',
 'cross reference new survey questions with pagerduty',
  89),

-- Enterprise Absurdity Fellow Lana
-- REPORTER: Lana | Enterprise Absurdity Fellow | Maintains the sacred registry of acronyms clearly reverse-engineered from panic, slide urgency, and funding opportunity.
('ZANY-996', 'Flag New Acronyms That Were Obviously Reverse-Engineered from Panic',
 'Some internal programs are named first and explained later with heroic creativity. Build a Confluence webhook that runs a dictionary check on new project acronyms. If the underlying words do not form a grammatically coherent sentence, highlight the acronym in neon pink so it stops settling into budgets without shame.',
 'highlight fake confluence backronyms in neon pink',
  144),

('ZANY-997', 'Put a "Would Fewer People Help?" Prompt on Steering Committee Invites',
 'Committee gravity is one of our most renewable resources. Add a prompt to calendar invites with more than eight people asking if the guest list improves the decision, or merely deepens the ambiance of procedural adulthood.',
 'warn when meeting invites look like hostage situations',
  89),

-- Misc Systems Custodian Ravi
-- REPORTER: Ravi | Misc Systems Custodian | Has accepted that the fax bridge is no longer temporary and is in fact a mature organism with legal significance and a pulse.
('ZANY-998', 'Reclassify the Legacy Fax Integration as a Native Species',
 'We have spent too long calling the fax bridge temporary while routing critical traffic through it. Go into the AWS tag editor and the internal Service Registry. Remove the "deprecated" tag, add "load-bearing," and change its lifecycle status from "Sunsetting" to "Immortal." It is time to treat this organ with respect.',
 'remove deprecated tag from the fax bridge',
  144),

('ZANY-999', 'Give Every Temporary Workaround Old Enough to Rent a Car a Birthday Badge',
 'Temporary fixes gain camouflage from familiarity. Write a script that scans the codebase for `// TODO: temporary` comments using `git blame`. If the comment is older than 5 years, automatically inject a 🎂 emoji next to it in the GitHub UI, and post a birthday announcement in the `#engineering` Slack channel.',
 'make slack bot celebrate five year old todos',
  89),

-- Grand Marshal of Backlog Excess Inez
-- REPORTER: Inez | Grand Marshal of Backlog Excess | Realizes the backlog is no longer merely tracking work and may now qualify as its own hostile administrative civilization.
('ZANY-1000', 'Add a Bureaucratic-Universe Warning to the Backlog Home Screen',
 'At some point we stopped documenting tasks and started curating an entire cosmology of rituals, hazards, debts, and process wildlife. Add a self-aware warning banner to the backlog home screen so the system can confess what it has become before it annexes neighboring realities.',
 'warn when backlog enters bureaucratic universe',
  233),;
