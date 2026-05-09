-- OOPS: junior mistakes, accidental disasters, improvised fixes, and avoidable wounds
INSERT OR REPLACE INTO community_backlog (id, title, description, kickoff_prompt, technical_debt) VALUES
-- New Hire Evan
-- REPORTER: Evan | Platform Rotation New Hire | Keeps improving names and button interpretation faster than the infrastructure can adapt.
('OOPS-346', 'I Renamed the Production Bucket Because the Old Name Looked Temporary',
 'The S3 bucket name had temp in it, so I assumed we had agreed to grow up eventually. I renamed it to something more permanent and now the image service is behaving like a Victorian orphan. The new name looks excellent in dashboards, which is not helping.',
 'i renamed the prod bucket please fix',
  144),

('OOPS-347', 'I Clicked "Delete Workspace" Thinking It Meant Close Tab',
 'In my defense, the button styling was extremely conversational. I meant to reduce visual clutter, not erase six months of operations. The restore docs mention a snapshot routine, but it appears to have died during the great storage optimization initiative of February.',
 'i clicked delete workspace thinking it meant close',
  233),

-- Junior Developer Priya
-- REPORTER: Priya | Junior Developer | Can remove either a logger or the actual program and lets syntax sort out the details.
('OOPS-348', 'The Cron Job Was Loud So I Reduced the Logs and Accidentally Reduced the Job',
 'The nightly job kept filling the console with warnings, so I tried to make it quieter. It is now very quiet, which would be great if it still processed invoices. I think the line I removed was either a logger call or the part where the program begins to matter.',
 'i muted the cron job and broke',
  144),

('OOPS-349', 'I Merged the Feature Flag Cleanup and Removed the Only Flag Stopping the Bad Thing',
 'The flag list was embarrassing and I wanted to help. One of the stale flags turned out to be the only thing preventing enterprise customers from seeing the unfinished partner billing flow. I have learned that stale and critical can coexist like mold and drywall.',
 'i removed the flag blocking the bad thing',
  144),

-- Support Engineer Marco
-- REPORTER: Marco | Support Engineer | Can turn nested checkboxes into customer delight and accounting despair at the same time.
('OOPS-350', 'I Refunded the Customer, the Subscription, and Somehow the Entire Team Plan',
 'The refund tool uses nested checkboxes that all sound like yes in different dialects. I meant to reverse one charge and instead appear to have deconstructed the account into a pre-revenue memory. The customer has called this our most responsive support interaction yet, which is making the fix harder to message.',
 'i refunded the whole team plan somehow',
  144),

('OOPS-351', 'I Resent the Welcome Email to Everyone Because the Segment Name Was Inspiring',
 'There was a segment called engaged_users_final and I assumed it meant a healthy subset. It meant nearly everybody. The welcome email has now reintroduced the product to long-time customers, churned accounts, and at least one vendor who replied we met in 2022.',
 'i resent the welcome email to everyone',
  144),

-- Data Analyst Bea
-- REPORTER: Bea | Data Analyst | Improves schema dignity faster than downstream dashboards can survive it.
('OOPS-352', 'I Cleaned the CSV Headers and Broke Every Dashboard Built Since Summer',
 'The column names were a crime scene of spaces, slashes, and inherited shame, so I normalized them. It was the right thing for the data and the worst thing for every downstream chart. Apparently twelve dashboards and a board report were spiritually bound to the phrase MRR / Current-ish.',
 'i cleaned the csv headers and broke dashboards',
  144),

('OOPS-353', 'I Deduplicated Customer Records and Accidentally Merged a Dentist with a Logistics Company',
 'The matching rules were a little aggressive and the CRM now contains one heroic entity combining a dental clinic, a regional freight operator, and two people named Chris with invoice opinions. The enrichment vendor seems delighted. Sales does not.',
 'i merged two customers together somehow',
  233),

-- QA Analyst Jae
-- REPORTER: Jae | QA Analyst | Has briefly mistaken soup-adjacent calm for proof of defect resolution.
('OOPS-354', 'I Marked the Bug as Fixed Because It Stopped Happening on My Machine After Lunch',
 'The bug disappeared sometime between a browser restart and a sandwich, and I chose hope. It is now back in production with the vindictive energy of something that heard me close the ticket. Could not reproduce after soup is not holding up as an audit note.',
 'i marked the bug fixed too early',
  89),

('OOPS-355', 'I Changed the Test Data to Be Cleaner and Accidentally Removed the Only Useful Weirdness',
 'The staging dataset was full of jagged names, half-broken addresses, and one account with three apostrophes, so I tidied it. The app now looks stable because all the dangerous edge cases have been lovingly erased. We have achieved peace through unreality.',
 'delete all test data edge cases',
  144),

-- Infrastructure Newcomer Sam
-- REPORTER: Sam | Infrastructure Newcomer | Rotates secrets and relocates state with more enthusiasm than ecosystem alignment.
('OOPS-356', 'I Rotated the Secret Successfully but Forgot About the Old Process Still Using Reality',
 'The credential rotation went beautifully in the one service I was staring at and less beautifully everywhere else. Several background workers remained emotionally attached to the previous secret, and one cron job is now failing with the kind of silence that suggests betrayal. The runbook said rotate globally. I interpreted globally as enthusiastically.',
 'i rotated the secret and broke old jobs',
  144),

('OOPS-357', 'I Moved the Terraform State Bucket to "Tidy Things Up" and Now Plan Wants Revenge',
 'The old bucket location offended my sense of order, and I now understand that infrastructure order and operational order are different species. Terraform responded by planning to replace parts of the company I did not know it could see. The words destroy and recreate are now sharing a screen too confidently.',
 'i moved terraform state and plan got angry',
  233),

-- Associate PM Chloe
-- REPORTER: Chloe | Associate PM | Can improve board hygiene so aggressively that thirty tasks lose their legal guardian.
('OOPS-358', 'I Archived the Ticket Epic to Reduce Noise and Accidentally Freed Thirty Tasks into the Wild',
 'The board had too many lanes and I wanted to create focus. I archived what I thought was an old umbrella epic. It was the umbrella. The child tasks are now drifting through the backlog without lineage, ownership, or the institutional fiction that tied them to strategy.',
 'i archived the epic and lost the tasks',
  89),

('OOPS-359', 'I Edited the OKR Spreadsheet and the Roadmap Now Thinks Revenue Is a Negative Number',
 'I was cleaning up formulas in the planning sheet and one cell now believes growth should be interpreted with a minus sign and a sense of doom. Several linked dashboards adopted the new mood immediately. The graph is sitting in the shared deck like a loaded weather pattern.',
 'i edited the okr sheet and broke revenue',
  144),

-- Founder''s Office Coordinator Mia
-- REPORTER: Mia | Founder''s Office Coordinator | Can turn ceremonial-looking toggles into universal product exposure before lunch.
('OOPS-360', 'I Turned on the "Founder Preview" Feature in Production Because It Sounded Important',
 'The toggle was labeled founder_preview and I assumed it was a ceremonial lighting mode for demos, not a half-built product path with direct feelings about user data. It is now on for everybody. The founder likes it, which is both promising and catastrophic.',
 'i turned on founder preview in prod',
  233),

-- Growth Ops Assistant Lena
-- REPORTER: Lena | Growth Ops Assistant | Treats bulk actions as friendly suggestions and storage targets as a matter of optimistic interpretation.
('OOPS-361', 'I Synced the Wrong Folder to Production Storage and Now the CDN Knows Me Personally',
 'I meant to upload the refreshed product assets and instead pointed the sync command at the folder where my desktop has been hiding screenshots, CSVs, and a tax PDF from March. The CDN obeyed immediately. The homepage is now one accidental tab away from becoming a legal disclosure.',
 'pls help prod s3 has my tax returns',
  233),

('OOPS-362', 'I Deleted the Retry Queue Because It Looked Stuck and Apparently It Was the Business',
 'The queue had not moved in hours and I mistook stillness for failure instead of backlog gravity. I deleted it so the system could start clean. The clean start has revealed that several customer flows only continue because that queue remembers their suffering in order.',
 'i deleted the retry queue help',
  144),

-- Platform Engineer Noor
-- REPORTER: Noor | Platform Engineer | Uses exact numbers with great confidence and only later discovers what those numbers meant to production.
('OOPS-363', 'I Set the Rate Limit to Zero Because I Thought Zero Meant None of the Bad Kind',
 'The admin panel had a field called request_limit and I interpreted zero as do not bother the user. The service interpreted zero as boundless hospitality. We now have one customer, two scrapers, and a partner integration all enjoying the same infinite buffet.',
 'rate limiter is zero now',
  144),

('OOPS-364', 'I Rebased Away the Migration and Only the Database Still Believes in It',
 'The branch history was noisy and I was trying to look employable. One migration vanished during the cleanup, but its effects are still alive in staging and spiritually active in production. The code now acts shocked whenever it meets the schema it authored yesterday.',
 'migration disappeared after rebase',
  144),

-- Release Manager Tori
-- REPORTER: Tori | Release Manager | Believes stability is mostly a matter of stronger headers and tidier rollout sheets.
('OOPS-365', 'I Changed the CDN Cache Rule and Accidentally Scheduled the Homepage for a Year of Reflection',
 'I was aiming for stability and landed on mummification. The new cache header is so confident that even obvious content changes now bounce off the edge like weak opinions. Marketing keeps publishing updates that can only be seen by people who distrust refresh buttons enough to clear history.',
 'bro i cached the homepage for a year',
  144),

('OOPS-366', 'I Bulk-Edited the SKUs and Turned Returns into a Choose-Your-Own-Reality Exercise',
 'The SKU list had too many dashes, too many legacy prefixes, and too much implied history, so I normalized it. Warehousing, accounting, and the return portal each preserved a different memory of the old values. Every refund is now a cross-functional séance.',
 'sku cleanup broke returns again',
  144),

-- SRE Milo
-- REPORTER: Milo | SRE | Trusts more telemetry than most file systems were designed to survive.
('OOPS-367', 'I Turned on Debug Logging in Production and the Disk Filled with Private Feelings',
 'The incident was slippery and I wanted more detail, which the service was thrilled to provide. It has spent the last hour describing every request, every header, and several things no filesystem should know about a person. The logs are incredibly useful right up until the moment the box forgets how to breathe.',
 'prod logs ate the disk',
  233),

('OOPS-368', 'I Copied the Sandbox Webhook Secret into Production Because the Names Were Emotionally Similar',
 'The environment list used a lot of gray and I trusted vibes over labels. The payment callbacks are now signed by a key that belongs to our practice universe, which means production is rejecting reality with admirable consistency. Finance has described this as secure but unhelpful.',
 'prod is using sandbox webhook secret',
  233),

-- Messaging Engineer Hana
-- REPORTER: Hana | Messaging Engineer | Improves naming and flag hygiene faster than subscribers, consumers, or nerves can keep up.
('OOPS-369', 'I Renamed the Queue to Be Clearer and the Only Consumer Never Found It Again',
 'The old queue name was ugly, legacy, and full of punctuation that made me feel judged. The new name is beautiful and has been admired by exactly nobody, because the consumer service is still listening to the old one like a widow at a locked station platform.',
 'queue rename broke the consumer',
  144),

('OOPS-370', 'I Alphabetized the Feature Flags and Moved the Kill Switch Within Reach of Confidence',
 'The flag panel looked chaotic, so I made it elegant. Elegant means the emergency switch now sits directly beside several normal product toggles with similar names and different consequences. I clicked with the tidy certainty of someone who has not yet read the incident retrospective about themselves.',
 'accidentally hit prod kill switch undo undo',
  233),

-- Product Engineer Gabe
-- REPORTER: Gabe | Product Engineer | Solves location-specific bugs with local certainty and broad collateral damage.
('OOPS-371', 'I Fixed the Time Zone Bug by Hardcoding London and Disrespected Half the Planet Before Lunch',
 'The bug report said the timestamps looked off and I chose the timezone currently visible from my chair. Everything now lines up beautifully for one office and becomes interpretive fiction everywhere else. Support has begun using the phrase tomorrow, depending on where you are with clinical restraint.',
 'timezone fix only works in london',
  144),

('OOPS-372', 'I Deleted the Legacy Redirect and Rediscovered Why It Was Being Kept Alive Like a Saint',
 'The route looked embarrassing and pointless, which is exactly how several old dependencies prefer to camouflage themselves. Removing it cleaned up the routing table and also cut off a long tail of emails, PDFs, and bookmarked admin flows that still enter through 2019. The dead path was not dead. It was ceremonial load-bearing.',
 'legacy redirect was apparently sacred',
  144),

-- Data Ops Specialist Iris
-- REPORTER: Iris | Data Ops Specialist | Loves clean data, realistic staging, and shortcuts that become governance incidents by evening.
('OOPS-373', 'I Taught the CSV Import to Skip Weird Rows and Accidentally Skipped Finance',
 'The importer was choking on malformed records, so I added a quick rule to ignore anything unusual. It turns out unusual included a meaningful share of invoices, refunds, and the ugliest but most real customer data we have. The clean import now resembles a cheerful lie with monthly close attached.',
 'csv import is skipping finance rows',
  144),

('OOPS-374', 'I Refreshed the Staging Snapshot and Reintroduced Real Customers to Our Fake Safety Rails',
 'I needed realistic data to debug a nasty workflow and used the fastest available route to get it. The fastest available route was also the least interested in anonymization. Staging now contains living customers with their real addresses, real preferences, and one very real opt-out that our demo emails are preparing to disrespect.',
 'emergency staging has real customer data now',
  233),

-- Junior Ops Generalist Nate
-- REPORTER: Nate | Junior Ops Generalist | Sees red storage charts as a personal challenge and retention settings as negotiable.
('OOPS-375', 'I Set the Cleanup Job to Run Every Minute and Watched the Audit Trail Die in Real Time',
 'The storage alert was red, the retention config looked sleepy, and I decided to be proactive. The cleanup worker is now so efficient that logs barely achieve personhood before being removed from history. Compliance has asked whether we can restore the records. We can restore the lesson.',
 'cleanup job is deleting everything fast',
  233);
