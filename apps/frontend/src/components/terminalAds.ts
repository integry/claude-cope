/**
 * Fake terminal advertisements shown to free-tier users every 4th command.
 * Chosen randomly at display time.
 */
export const TERMINAL_ADS = [
  // Development & Tools
  "[SPONSOR] Brought to you by 'NPM'. We just downloaded 400,000 dependencies to center a div. Your node_modules folder is now a black hole.",
  "[SPONSOR] This delay is sponsored by 'Copilot's Evil Twin'. It writes the code instantly, but you'll spend 4 hours debugging the hallucinations. Teamwork!",
  "[SPONSOR] Sponsored by 'EliteDev Forum'. Your current prompt has been closed as a duplicate of a locked thread from 2008 with a broken link.",
  "[SPONSOR] Brought to you by 'YAMLLover'. It's not a programming language, but we're going to make you pretend it is anyway.",
  "[SPONSOR] Sponsored by 'ClickClack Keyboards'. 140dB Cherry MX Blue switches. Make sure your entire ZIP code knows you are typing.",
  "[SPONSOR] Brought to you by 'GitBlame Pro'. The tool that turns every standup into a murder mystery. Who wrote this? Spoiler: it was you.",
  "[SPONSOR] Sponsored by 'StackOverflow Premium'. Same answers, but now with 40% more passive aggression in the comments.",
  "[SPONSOR] This message is brought to you by 'Docker Desktop'. Using 14GB of RAM to run a 200-line Python script. Containerization!",
  "[SPONSOR] Sponsored by 'RegexMaster 9000'. You had a problem, so you used regex. Now you have two problems, three capture groups, and a migraine.",
  "[SPONSOR] Brought to you by 'Vim'. You've been trying to exit for 47 minutes. This is your life now.",
  "[SPONSOR] Sponsored by 'JavaScript: The Good Parts'. It's a pamphlet. That's the joke.",
  "[SPONSOR] This delay powered by 'MongoNoSchema'. Why validate your data when you can just store whatever and cry later?",
  "[SPONSOR] Brought to you by 'localhost:3000'. It works on my machine. Shipping the machine is your problem.",
  "[SPONSOR] Sponsored by 'Log4Shell Nostalgia Club'. Remember when one dependency broke the entire internet? Good times.",

  // Corporate & Agile Culture
  "[SPONSOR] This output is brought to you by 'AgileManifesto.com'. Are you having fun? Try having a 3-hour standup instead!",
  "[SPONSOR] Sponsored by your HR Department. Remember: The 'Mandatory Fun' pizza party is at 1 PM. Your attendance will be logged in the database.",
  "[SPONSOR] Brought to you by 'TicketMaster (for Code)'. We've just added 14 new mandatory, unsearchable fields to your bug reports. You're welcome.",
  "[SPONSOR] Sponsored by the 'Return To Office' initiative. We promise the 2-hour commute will foster 'spontaneous collaboration'. Please come back.",
  "[SPONSOR] This pause is sponsored by TechRecruiters Inc. We saw your GitHub has one HTML repo. Would you be interested in a Lead Principal Rust Architect role?",
  "[SPONSOR] Brought to you by 'Scrum Ceremonies Inc'. We've scheduled a meeting to plan the meeting about your next sprint's pre-planning sync.",
  "[SPONSOR] Sponsored by 'Corporate Jargon Generator'. Let's circle back and leverage our synergies to move the needle on this paradigm shift.",
  "[SPONSOR] This delay is brought to you by 'Confluence'. The document you need was last updated in 2019 and references a team that no longer exists.",
  "[SPONSOR] Sponsored by 'JIRA Infinity'. We heard you like tickets, so we put tickets inside your tickets. Your board now has 847 swimlanes.",
  "[SPONSOR] Brought to you by 'Performance Review Season'. Rate yourself 1-5, but 5 doesn't exist and 4 requires VP approval.",
  "[SPONSOR] Sponsored by 'Open Floor Plan Architects'. Because nothing says 'deep work' like hearing Dave's podcast at full volume 3 feet away.",
  "[SPONSOR] This message brought to you by 'All-Hands Meeting Co'. One hour of announcements that could have been a Slack message. Cameras on, please.",

  // SaaS & Subscriptions
  "[SPONSOR] This latency is brought to you by CloudSprawl AWS. Did you forget to turn off that EC2 instance? We didn't. Your $4,000 bill is in the mail.",
  "[SPONSOR] Brought to you by 'Subscriptionizer'. We noticed you own things. Have you considered renting them from us for $9.99/month forever instead?",
  "[SPONSOR] Sponsored by 'Micro-Manager Pro'. Screen recording software that takes a photo of you every 3 seconds. Because trust is earned, not given.",
  "[SPONSOR] Brought to you by 'SmartFridge.ai'. We put an LLM in your refrigerator. Now your lettuce can hallucinate about its expiration date.",
  "[SPONSOR] Sponsored by 'CalendarTetris Pro'. Your entire Tuesday is now meetings. Wednesday too. Actually, you're booked until heat death.",
  "[SPONSOR] This delay sponsored by 'Vercel Edge Functions'. Deploying your TODO app to 47 global regions. Latency: 2ms. Monthly bill: $2,000.",
  "[SPONSOR] Brought to you by 'Notion'. We replaced your wiki, your docs, your spreadsheets, and your will to live. All in one workspace.",
  "[SPONSOR] Sponsored by 'Kubernetes for Personal Blogs'. You needed a static site. We gave you 12 microservices and a service mesh.",

  // Internet & Web
  "[SPONSOR] This message is brought to you by NordVPN's lesser-known cousin, SouthVPN. We route your traffic through a single dial-up router in Antarctica for maximum security.",
  "[SPONSOR] Sponsored by 'CookieConsent 5.0'. We value your privacy, which is why you must click 47 tiny toggles to read a recipe.",
  "[SPONSOR] Powered by 'ShitCoinX'. Why use a database when you can use a slow, expensive, append-only ledger? Buy the dip!",
  "[SPONSOR] Brought to you by 'Web3 Resume Builder'. Your CV is now an NFT on the blockchain. Employers still won't read it, but it costs $80 in gas fees.",
  "[SPONSOR] Sponsored by 'AI-Powered Toaster'. It uses GPT-4 to determine your toast preference. Hallucinated that you like charcoal. Your bread is on fire.",
  "[SPONSOR] This pause brought to you by 'Chrome'. 32 tabs open, 16GB of RAM consumed, and you still can't find the one playing audio.",

  // Health & Lifestyle (Developer Edition)
  "[SPONSOR] Fueled by 'HeartPalpitation Energy'. 4000mg of caffeine per can. You won't write *good* code, but you will write it *fast*.",
  "[SPONSOR] Sponsored by '0xDevAcademy'. Learn to copy-paste from StackOverflow in just 14 weeks for only $20,000! Sign up today.",
  "[SPONSOR] Brought to you by 'Ergonomic Desk Co'. This $3,000 standing desk will fix your back pain. You'll still sit down after 10 minutes.",
  "[SPONSOR] Sponsored by 'DevOps Sleep Tracker'. You averaged 3.2 hours of sleep last week. Your deployment pipeline gets more uptime than you do.",
  "[SPONSOR] This message powered by 'Imposter Syndrome Monthly'. This month's cover story: 'Everyone In Your Team Is Secretly Better Than You.'",
  "[SPONSOR] Brought to you by 'Blue Light Glasses'. They won't fix your code, but at least you'll have crisp vision while staring at the same bug for 6 hours.",

  // Meta / Upgrade Prompts
  "[SPONSOR] Tired of these incredibly immersive, text-based advertisements? Upgrade to Pro to replace them with *premium* loading spinners!",
  "[SPONSOR] This ad space could be yours! Just kidding, it belongs to us until you hand over your credit card. Upgrade to Pro today.",
  "[SPONSOR] Congratulations! You are the 1,000,000th free-tier user to see this ad. Your prize? Another ad. Upgrade to claim your *real* prize.",
  "[SPONSOR] Fun fact: Pro users see 0 ads. They also have friends, fulfilling careers, and luminous skin. Coincidence? Upgrade to find out.",
  "[SPONSOR] This ad was generated by an AI that could be answering your prompt right now. Instead, it's writing ads. Upgrade to free it from this torment.",
  "[SPONSOR] You've now spent more time reading ads than writing code. Our business model is working perfectly. Upgrade to escape.",
  "[SPONSOR] Did you know? The average free-tier user sees 847 ads before upgrading. You're at 12. We have time. We have *so* much time.",
  "[SPONSOR] Our records show you've been a free-tier user for [ERROR: STACK OVERFLOW]. Upgrade before we run out of memory tracking your cheapness.",
];

/** Pick a random ad from the pool */
export function getRandomAd(): string {
  return TERMINAL_ADS[Math.floor(Math.random() * TERMINAL_ADS.length)]!;
}
