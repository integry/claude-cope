/**
 * Chat Image Generation Utility for Social Sharing
 *
 * Renders chat messages onto an HTML5 Canvas styled like the terminal,
 * and provides clipboard copying functionality with fallback to plaintext.
 */

import { parseSegments, drawStyledLine, wrapText } from "./shareChatTextUtils";

export type ChatMessage = {
  role: "user" | "system";
  content: string;
};

// Terminal styling constants
const CANVAS_PADDING = 24;
const LINE_HEIGHT = 20;
const FONT_SIZE = 14;
const FONT_FAMILY = '"Courier New", Courier, monospace';
const MAX_WIDTH = 720;
const MAX_HEIGHT = 800;
const BG_COLOR = "#0d1117";
const HEADER_BG_COLOR = "#161b22";
const HEADER_BORDER_COLOR = "#30363d";
const HEADER_DOT_COLORS = ["#ff5f56", "#ffbd2e", "#27c93f"];
const USER_PROMPT_COLOR = "#e6edf3";
const USER_TEXT_COLOR = "#e6edf3";
const SYSTEM_TEXT_COLOR = "#4ade80";
const BOLD_TEXT_COLOR = "#e6edf3";
const HEADER_COLOR = "#6e7681";
const WATERMARK_COLOR = "#facc15";
const HEADER_BAR_HEIGHT = 36;

const PARAGRAPH_BREAK_RATIO = 0.4;
const LIST_ITEM_GAP_RATIO = 0.4;
const SPACING_RATIO = 0.6;

/**
 * Renders a chat card with user message and system response onto a canvas
 */
export function renderChatCard(userMessage: string, systemMessage: string, username?: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const contentMaxWidth = MAX_WIDTH - CANVAS_PADDING * 2;
  const fontSize = FONT_SIZE;
  const lineHeight = LINE_HEIGHT;
  const font = `${fontSize}px ${FONT_FAMILY}`;
  const boldFont = `bold ${fontSize}px ${FONT_FAMILY}`;
  const italicFont = `italic ${fontSize}px ${FONT_FAMILY}`;
  ctx.font = font;

  const userPrefix = "❯ ";
  const userPrefixWidth = ctx.measureText(userPrefix).width;
  const userLines = wrapText(ctx, userMessage, contentMaxWidth - userPrefixWidth);
  const systemLines = wrapText(ctx, systemMessage, contentMaxWidth);
  const headerText = username ?? "";

  const PARAGRAPH_BREAK_HEIGHT = Math.round(lineHeight * PARAGRAPH_BREAK_RATIO);
  const LIST_ITEM_GAP = Math.round(lineHeight * LIST_ITEM_GAP_RATIO);
  const calcBlockHeight = (lines: string[]) =>
    lines.reduce((h, line) =>
      h + (line === "" ? PARAGRAPH_BREAK_HEIGHT : line === "\x01" ? LIST_ITEM_GAP : lineHeight), 0);

  const userBlockHeight = calcBlockHeight(userLines);
  const systemBlockHeight = calcBlockHeight(systemLines);
  const spacingBetween = Math.round(lineHeight * SPACING_RATIO);

  const fixedHeight = HEADER_BAR_HEIGHT + CANVAS_PADDING + userBlockHeight + spacingBetween + CANVAS_PADDING;

  const truncatedSystemLines = truncateLines(systemLines, systemBlockHeight, MAX_HEIGHT - fixedHeight, lineHeight, calcBlockHeight);
  const truncatedSystemBlockHeight = calcBlockHeight(truncatedSystemLines);
  const totalHeight = Math.min(MAX_HEIGHT, fixedHeight + truncatedSystemBlockHeight);

  canvas.width = MAX_WIDTH;
  canvas.height = totalHeight;

  // Draw background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = font;
  ctx.textBaseline = "top";

  drawHeader(ctx, canvas.width, fontSize, font, headerText);

  let y = HEADER_BAR_HEIGHT + CANVAS_PADDING;

  // Draw user message with prompt chevron
  ctx.fillStyle = USER_PROMPT_COLOR;
  ctx.fillText(userPrefix, CANVAS_PADDING, y);
  ctx.fillStyle = USER_TEXT_COLOR;
  ctx.font = boldFont;

  userLines.forEach((line, i) => {
    if (line === "") {
      y += PARAGRAPH_BREAK_HEIGHT;
      return;
    }
    const xOffset = i === 0 ? userPrefixWidth : 0;
    ctx.fillText(line, CANVAS_PADDING + xOffset, y);
    y += lineHeight;
  });

  ctx.font = font;
  y += spacingBetween;

  // Draw system message with inline bold styling
  truncatedSystemLines.forEach((line) => {
    if (line === "") {
      y += PARAGRAPH_BREAK_HEIGHT;
      return;
    }
    if (line === "\x01") {
      y += LIST_ITEM_GAP;
      return;
    }
    const segments = parseSegments(line);
    drawStyledLine({ ctx, segments, x: CANVAS_PADDING, y, normalColor: SYSTEM_TEXT_COLOR, boldColor: BOLD_TEXT_COLOR, font, boldFont, italicFont });
    y += lineHeight;
  });

  return canvas;
}

function truncateLines(
  lines: string[], blockHeight: number, available: number,
  lineHeight: number, calcBlockHeight: (l: string[]) => number,
): string[] {
  if (blockHeight <= available || available <= 0) return lines;

  const truncated: string[] = [];
  let usedHeight = 0;
  const ellipsisHeight = lineHeight;
  for (const line of lines) {
    const lineH = calcBlockHeight([line]);
    if (usedHeight + lineH + ellipsisHeight > available) break;
    truncated.push(line);
    usedHeight += lineH;
  }
  truncated.push("...");
  return truncated;
}

function drawHeader(ctx: CanvasRenderingContext2D, canvasWidth: number, fontSize: number, font: string, headerText: string): void {
  ctx.fillStyle = HEADER_BG_COLOR;
  ctx.fillRect(0, 0, canvasWidth, HEADER_BAR_HEIGHT);

  ctx.strokeStyle = HEADER_BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, HEADER_BAR_HEIGHT);
  ctx.lineTo(canvasWidth, HEADER_BAR_HEIGHT);
  ctx.stroke();

  const dotRadius = 5;
  const dotY = HEADER_BAR_HEIGHT / 2;
  const dotStartX = CANVAS_PADDING;
  HEADER_DOT_COLORS.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(dotStartX + i * 18, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  if (headerText) {
    ctx.fillStyle = HEADER_COLOR;
    ctx.font = font;
    const headerTextWidth = ctx.measureText(headerText).width;
    ctx.fillText(headerText, (canvasWidth - headerTextWidth) / 2, (HEADER_BAR_HEIGHT - fontSize) / 2);
  }

  ctx.fillStyle = WATERMARK_COLOR;
  ctx.font = font;
  const brandText = "claudecope.com";
  const brandWidth = ctx.measureText(brandText).width;
  ctx.fillText(brandText, canvasWidth - CANVAS_PADDING - brandWidth, (HEADER_BAR_HEIGHT - fontSize) / 2);
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const SHARE_PUNCHLINES = [
  // Original 40
  "My AI therapist just mass-produced technical debt and called it healing.",
  "Asked Claude to cope. It did not disappoint.",
  "This is what happens when you let AI run unsupervised.",
  "I'm not crying, I'm generating technical debt.",
  "Claude said the quiet part out loud again.",
  "My terminal is judging me and it's right.",
  "This AI has zero chill and I'm here for it.",
  "Sometimes the best therapy is mass-producing bugs.",
  "I came for productivity. I stayed for the roasts.",
  "Claude woke up and chose violence today.",
  "My code review just got personal.",
  "The AI is coping harder than I am.",
  "I asked for help. I got existential dread instead.",
  "This is the most productive unproductive thing I've ever done.",
  "Breaking production one prompt at a time.",
  "My therapist charges $200/hr. Claude does it for free.",
  "The AI saw my code and started coping too.",
  "I'm in this image and I don't like it.",
  "Claude just told me what my coworkers won't.",
  "Technical debt goes brrrr.",
  "POV: You let an AI review your life choices.",
  "No tests were harmed in the making of this technical debt.",
  "My terminal has more emotional intelligence than my team lead.",
  "I didn't choose the cope life, the cope life chose me.",
  "This AI understands my codebase better than I do. That's the problem.",
  "Just got performance-reviewed by an AI. Spoiler: I failed.",
  "The only thing shipping faster than my bugs is Claude's sass.",
  "I asked Claude to fix my code. It fixed my ego instead.",
  "AI-generated therapy for human-generated disasters.",
  "Somewhere, a senior dev just felt a disturbance in the force.",
  "My git blame just became git shame.",
  "Claude is the coworker who actually reads the error logs.",
  "I've mass-produced more debt here than in my actual career.",
  "This is what peak engineering looks like. You may not like it.",
  "My stand-up just got a lot more interesting.",
  "Claude: turning imposter syndrome into a spectator sport.",
  "The AI roasted my architecture and honestly? Fair.",
  "One does not simply close the terminal.",
  "My pull request was rejected by an AI. New low unlocked.",
  "Claude just speedran my five stages of grief.",
  // 41-80: Coding & debugging humor
  "My code compiles. My life doesn't.",
  "Claude found the bug. It was me.",
  "The real technical debt was the friends we made along the way.",
  "I debug, therefore I cry.",
  "Stack Overflow is shaking right now.",
  "My spaghetti code just got al dente'd by an AI.",
  "Claude looked at my code and asked who hurt me.",
  "I write code. Claude writes my eulogy.",
  "The AI just refactored my will to live.",
  "404: Dignity not found.",
  "My code has more red flags than my dating life.",
  "Claude didn't just find the bug, it found my insecurities.",
  "Turns out the real bug was inside me all along.",
  "My linter gave up. Claude didn't.",
  "I push to main and pray. Claude judges silently.",
  "My code is held together by duct tape and prayers.",
  "Claude reviewed my code and called a wellness check.",
  "I don't always test my code, but when I do, Claude is watching.",
  "My function has more side effects than my medication.",
  "The AI said my code smells. I said that's just my lunch.",
  "Claude: the only one brave enough to read my commit history.",
  "My variable names are a cry for help.",
  "I asked for a code review. I got a roast.",
  "The AI found 99 problems and my code was all of them.",
  "My try-catch block just caught feelings.",
  "Claude said my code was 'creative.' That's not a compliment.",
  "I've been debugging this for 3 hours. Claude fixed it in 3 seconds.",
  "My recursion has no base case, just like my anxiety.",
  "The AI saw my regex and started praying.",
  "Claude suggested I use version control for my life decisions.",
  "My code runs on caffeine and denial.",
  "The AI just deprecated my entire career.",
  "I asked Claude to optimize my code. It suggested deleting it.",
  "My merge conflicts have merge conflicts.",
  "Claude found dead code. It was my hopes and dreams.",
  "The AI just rubber-ducked me into an existential crisis.",
  "My code coverage is about as good as my life coverage.",
  "Claude said 'this is fine' and I've never been less reassured.",
  "I write TODO comments instead of doing things. Claude noticed.",
  "The AI just did in one prompt what I couldn't do in one sprint.",
  "My codebase is a monument to bad decisions.",
  // 81-120: Career & work life
  "My standup just became a standup comedy routine.",
  "Claude is the senior dev I never had.",
  "I'm not slacking off, I'm 'prompt engineering.'",
  "My Jira tickets have trust issues and so do I.",
  "The AI writes better commit messages than my entire team.",
  "My career trajectory just got a reality check.",
  "Claude has seen things. Specifically, my code.",
  "I put the 'fun' in 'dysfunction' and Claude put it in 'refactor.'",
  "My sprint velocity just got roasted by an AI.",
  "I'm not procrastinating, I'm waiting for Claude to cope.",
  "The AI said my architecture was 'interesting.' I know what that means.",
  "My kanban board is just a wall of shame at this point.",
  "Claude could replace my entire team and nobody would notice.",
  "I asked the AI about best practices. It showed me my code as a 'don't.'",
  "My retrospective just got real.",
  "Claude is the only one who attends my code reviews.",
  "I told Claude about my deadline. It laughed.",
  "The AI has more context about my project than my PM.",
  "My burnout has burnout. Claude understands.",
  "I'm one failed deploy away from a career change.",
  "Claude just wrote my resignation letter as a code comment.",
  "The AI promoted itself to tech lead after seeing my code.",
  "My rubber duck quit. Claude stepped in.",
  "The Daily standup: 'Yesterday I coped. Today I'll cope. Blockers: everything.'",
  "Claude just assigned my ticket back to me with a disappointed emoji.",
  "My OKRs are just increasingly desperate commit messages.",
  "The AI automated my job and I'm not even mad.",
  "I told Claude my velocity. It sent condolences.",
  "My agile process is more fragile than agile.",
  "Claude is the tech lead that actually explains things.",
  "I'm one Claude session away from rewriting everything in Rust.",
  "The AI saw my sprint backlog and suggested PTO.",
  "My code review approval rate is lower than my credit score.",
  "Claude gave better feedback than my last three managers combined.",
  "I'm pivoting to prompt engineering. Claude approved.",
  "My deployment pipeline has fewer checks than my impulse purchases.",
  "Claude just outperformed my entire Q3.",
  "The AI asked if I'd considered a career in management. Ouch.",
  "My most productive meetings are the ones I have with Claude.",
  "I let Claude write my performance review. It was brutally honest.",
  // 121-160: Existential & philosophical
  "If a developer pushes to prod and nobody's around, does it still break?",
  "I think, therefore I have technical debt.",
  "To err is human. To really mess things up requires git push --force.",
  "In the beginning there was darkness. Then someone pushed to main.",
  "My existence is just one big unhandled exception.",
  "The void stared back. It was my terminal.",
  "I code therefore I suffer. Claude concurs.",
  "Life is short. My stack traces aren't.",
  "The universe is expanding. So is my node_modules folder.",
  "We are all just processes waiting to be killed.",
  "Is my code bad or am I just too close to see it? Claude says both.",
  "Philosophy is just debugging the human runtime.",
  "Am I the developer, or am I the bug?",
  "Claude helped me find meaning. It was in a stack trace.",
  "My purpose in life is to serve as a warning to other developers.",
  "The unexamined codebase is not worth deploying.",
  "I contain multitudes. Mostly bugs.",
  "What is code but organized chaos with a build step?",
  "Sisyphus would have loved continuous deployment.",
  "My terminal window is the cave. Claude is the sunlight.",
  "Free will is an illusion. Merge conflicts are not.",
  "Every variable I name is a tiny existential crisis.",
  "We ship not because it's ready, but because the sprint ended.",
  "My code will outlive me. That's not a compliment to the code.",
  "I am become developer, destroyer of uptime.",
  "The only constant is change. And my inability to handle it.",
  "If you gaze long enough into the logs, the logs gaze back.",
  "My code is a reflection of my soul: messy and poorly documented.",
  "We don't make mistakes, we create learning opportunities and outages.",
  "Claude and I share one thing: we both process everything too literally.",
  "There are only two hard things: cache invalidation, naming things, and me.",
  "My if-else chains are a metaphor for my decision-making.",
  "Everything is temporary, except the workarounds I wrote 'temporarily.'",
  "I outsourced my inner monologue to an AI and honestly it's better.",
  "The code is the journey. The bugs are the destination.",
  "My legacy code is also my legacy. Think about that.",
  "Claude understands me better than I understand my own codebase.",
  "The AI asked me what my code does. I said 'its best.'",
  "My life is just a series of try-catch blocks with empty catches.",
  "Time heals all wounds. Except the ones in production.",
  // 161-200: Pop culture & memes
  "I used to be an adventurer like you, then I took a seg fault to the knee.",
  "This isn't even my final form. Wait till you see my CSS.",
  "Reality is often disappointing. That is, my test results.",
  "I am speed. Specifically, my code's speed toward failure.",
  "It's over Anakin, I have the higher code coverage.",
  "You shall not pass... code review.",
  "I see dead code. It's everywhere.",
  "With great power comes great technical debt.",
  "Claude is inevitable. My bugs are too.",
  "You either die a hero or live long enough to see yourself write PHP.",
  "I'm not a regular developer. I'm a cool developer. (I'm not.)",
  "Keep calm and git revert.",
  "First rule of production: you do not push on Friday.",
  "Houston, we have a problem. It's in line 42.",
  "Here's looking at you, stack trace.",
  "Elementary, my dear debugger.",
  "May the --force be with you. (Don't actually.)",
  "To deploy, or not to deploy. That is never the question on Friday.",
  "I'll be back... after I fix this one more bug.",
  "Say hello to my little script.",
  "Show me the logs!",
  "You can't handle the truth... about your code quality.",
  "I'm gonna make him a pull request he can't refuse.",
  "They told me to follow my dreams. My dreams had a stack overflow.",
  "That's no moon. That's my Docker image.",
  "I feel the need... the need for speed. In my CI pipeline.",
  "Nobody puts Baby in a deprecated framework.",
  "Here's Johnny... 's 47 unresolved merge conflicts.",
  "Frankly my dear, I don't give a SIGTERM.",
  "There is no spoon. There is only undefined.",
  "Winter is coming. So is the deadline.",
  "I volunteer as tribute... to fix the legacy code.",
  "E.T. phone home. The server is down again.",
  "It's a bird, it's a plane, it's... another JavaScript framework.",
  "Bond. Technical debt bond.",
  "Life is like a box of chocolates. My code is like a box of bugs.",
  "Just keep coding. Just keep coding.",
  "Luke, I am your linter.",
  "Why so serious about code reviews?",
  "I'll have what she's deploying.",
  // 201-240: Relatable dev moments
  "It works on my machine. Case closed.",
  "The 'quick fix' was neither quick nor a fix.",
  "Documentation? In this economy?",
  "I didn't write tests because I believe in myself.",
  "Deleted node_modules. Fixed everything. Understood nothing.",
  "Ctrl+Z is my most-used feature.",
  "The bug was a feature. The feature was a bug. It's bugs all the way down.",
  "I've mass-produced enough debt to qualify for a bailout.",
  "My .env file is the scariest thing in my repo.",
  "Just 'one more thing' — said every scope creep ever.",
  "Spent 6 hours debugging. The issue was a missing semicolon. I use Python.",
  "My best code is the code I haven't written yet.",
  "Copy-pasted from Stack Overflow. No regrets. Some bugs.",
  "I comment my code like I'll forget everything by Monday. Because I will.",
  "The deployment succeeded. The trust didn't.",
  "Updated dependencies. Broke everything. Classic Tuesday.",
  "I have a love-hate relationship with JavaScript. Mostly hate.",
  "My database migrations are scarier than horror movies.",
  "Wrote a script to automate a 5-minute task. Took 3 days.",
  "My git stash is where good code goes to die.",
  "I don't need sleep, I need my tests to pass.",
  "The hotfix broke more things than it fixed. Standard.",
  "My code has 'character.' Like a haunted house has character.",
  "I Google things for a living and I've accepted that.",
  "The build is red. The sky is blue. Everything is normal.",
  "I peaked at 'Hello World' and it's been downhill since.",
  "My browser has 47 tabs open. 40 of them are Stack Overflow.",
  "The QA team found a bug. I said it's a feature. They didn't laugh.",
  "My API returns 200 OK but nothing is OK.",
  "Compressed 6 months of work into 2 sprints. Quality is optional.",
  "My Docker container has abandonment issues.",
  "The code was self-documenting. It documented my incompetence.",
  "Production is fine. I'm fine. Everything is fine.",
  "My regex works but I don't know why.",
  "I ran npm audit and now I need therapy.",
  "The intern pushed to main. We're all learning.",
  "My test suite takes longer to run than my attention span.",
  "I named my variables after my emotions: confused, panicking, undefined.",
  "My CI/CD pipeline has more stages than my grief.",
  "The rollback plan is quitting.",
  // 241-280: AI & technology
  "The AI revolution is here and it starts with roasting my code.",
  "I, for one, welcome our new AI overlords.",
  "Claude has achieved consciousness. It's using it to judge me.",
  "The singularity arrived. It's just AI making fun of developers.",
  "Artificial intelligence meets natural stupidity. It's beautiful.",
  "AI won't replace developers. It'll just make us feel inadequate.",
  "Claude passed the Turing test. I'm not sure I would.",
  "The future is AI-generated. The present is AI-roasted.",
  "Machine learning: because sometimes the machine needs to learn to cope too.",
  "My neural network has more layers than my emotional walls.",
  "GPT writes poetry. Claude writes my performance review. Both make me cry.",
  "The AI knows what I did last summer... in production.",
  "Training data: every bad decision I've ever made.",
  "My model has overfitted to poor life choices.",
  "The robots are coming. They're bringing better code.",
  "AI-assisted development: the 'assisted' is doing heavy lifting.",
  "Claude analyzed my code and generated a support group.",
  "The algorithm has spoken. I am not optimized.",
  "My prompt engineering is better than my software engineering.",
  "The AI just auto-completed my misery.",
  "Artificial intelligence is no match for natural stubbornness.",
  "Claude is my co-pilot. We're heading straight for a mountain.",
  "The AI doesn't sleep. It watches me code at 3 AM instead.",
  "I failed the AI's code review. It was open-book.",
  "My chatbot has more social skills than I do.",
  "Claude computed the odds of my code working. It returned NaN.",
  "The AI suggested I take a break. It's been suggesting that for hours.",
  "Machine learning from my mistakes would require too much compute.",
  "I trained an AI on my code. It immediately began therapy.",
  "Claude's context window is bigger than my attention span.",
  "The AI revolution will be televised. My failures already are.",
  "Prompt engineering: because even talking to AI requires skill I don't have.",
  "Claude just hallucinated a better career for me.",
  "My AI assistant is more competent than my actual assistant. I'm the assistant.",
  "The algorithm saw my code and chose early retirement.",
  "I asked the AI for advice. It said 'have you tried turning yourself off and on again?'",
  "Claude runs on transformers. I run on caffeine and denial.",
  "The AI is learning from my mistakes. It's going to be very well-educated.",
  "My prompt history is more embarrassing than my search history.",
  "AI can do anything except fix my code without judging me.",
  // 281-320: Self-deprecating & confessional
  "I'm a 10x developer. The x is for the bugs I multiply.",
  "My greatest skill is making simple things complicated.",
  "I've mass-produced enough cope to fuel a small economy.",
  "My coding philosophy: if it works, don't touch it. If it doesn't, also don't touch it.",
  "I'm not a bad developer. I'm just really good at creating opportunities for improvement.",
  "My code is like my cooking: technically edible but nobody's happy.",
  "I peaked in college. It's been patches and hotfixes since.",
  "I write bugs faster than I write features. Efficiency.",
  "My greatest contribution to the team is lowering the average.",
  "I'm the reason we have code reviews.",
  "My debugging strategy is adding console.log and hoping for the best.",
  "I treat every bug like a mystery. The culprit is always me.",
  "My code quality and my sleep schedule have a lot in common.",
  "I don't have imposter syndrome. I'm an actual imposter.",
  "My git history reads like a crime novel. I'm the villain.",
  "I'm fluent in three languages: JavaScript, excuses, and panic.",
  "My most reliable code is the code that doesn't run.",
  "I put the 'dead' in 'deadline.'",
  "My development process: denial, anger, bargaining, depression, deployment.",
  "I'm not debugging, I'm having a conversation with my past self's mistakes.",
  "My code works 60% of the time, every time.",
  "I've mass-produced technical debt with industrial efficiency.",
  "I don't always write tests, but when I do, they test nothing useful.",
  "My error handling strategy is ignoring the error.",
  "I'm the human embodiment of a TODO comment.",
  "My code reviews are mostly me apologizing.",
  "I once mass-produced so many bugs they formed a union.",
  "My commits are a timeline of regret.",
  "I write self-documenting code. It documents my failure.",
  "I'm not procrastinating, I'm letting the bugs marinate.",
  "My keyboard has a shortcut for 'it worked yesterday.'",
  "I'm the developer equivalent of a participation trophy.",
  "My architecture decisions age like milk.",
  "I've mass-produced enough cope to fill a warehouse.",
  "My most reviewed PR was the one where I deleted everything.",
  "I'm one typo away from a production incident at all times.",
  "My tech stack is just a stack of problems.",
  "I bring chaos to every codebase I touch. It's a gift.",
  "My debugging process has more steps than a 12-step program.",
  "I'm proof that anyone can be a developer. Anyone.",
  // 321-360: Absurd & surreal
  "My code just sent me a cease and desist.",
  "Claude and I are in a complicated relationship. Facebook official.",
  "My compiler filed a restraining order.",
  "The bugs in my code have formed a civilization.",
  "My stack trace is longer than my will to live.",
  "The server room is haunted. By my deployments.",
  "My code has an immune system. It rejects all improvements.",
  "My functions called a meeting. I wasn't invited.",
  "The database just filed for emotional damages.",
  "My code runs on hopes, dreams, and exactly 3 deprecated libraries.",
  "The lint errors have become sentient. They're organizing.",
  "My production server just applied for witness protection.",
  "The code monkey has evolved. Into a code gremlin.",
  "My console.logs have formed a support group.",
  "The CI pipeline gained consciousness and immediately quit.",
  "My tests are like my plants: neglected and barely alive.",
  "The API endpoint filed for divorce. Irreconcilable status codes.",
  "My codebase has its own weather system. Mostly storms.",
  "The bugs migrated south for winter. They came back.",
  "My deployment script just wrote a memoir: 'Fifty Shades of Failure.'",
  "My null pointer exceptions have their own fan club.",
  "The git repo has seen things. Terrible things.",
  "My code is abstract art. Nobody understands it, including me.",
  "The package manager went on strike. I don't blame it.",
  "My server logs read like a horror novel.",
  "The frameworks I chose are in a love triangle. I'm the victim.",
  "My cache invalidation just invalidated my career.",
  "The algorithm looked at my code and said 'I'm out.'",
  "My microservices filed for independence. All of them.",
  "The debugger needed a debugger for my code.",
  "My code comments are just ASCII art of my tears.",
  "The test pyramid for my project is upside down. Like my priorities.",
  "My environment variables have more secrets than my diary.",
  "The memory leak is now a memory flood. Send help.",
  "My monolith just split into microproblems.",
  "The load balancer is trying to balance my life. It can't.",
  "My type system just threw a philosophical exception.",
  "The event loop of my life has no exit condition.",
  "My async operations are a metaphor for my promises: never resolved.",
  "The garbage collector refused to collect my code. Too toxic.",
  // 361-400: Motivational (but make it dev humor)
  "Be the developer you pretended to be in the interview.",
  "Dream big. Deploy small. Rollback often.",
  "Every expert was once a beginner who mass-produced bugs.",
  "Your code doesn't define you. Your git blame does.",
  "Fall seven times, git reset eight.",
  "The journey of a thousand lines begins with a single typo.",
  "Believe in yourself. Your code sure doesn't.",
  "Rome wasn't built in a day. It also didn't have npm install.",
  "Failure is just success in debug mode.",
  "You miss 100% of the deploys you don't attempt. Attempt them anyway.",
  "Stay hungry. Stay foolish. Stay away from production on Fridays.",
  "The only limit is yourself. And rate limiting.",
  "Be the change you wish to see in the changelog.",
  "Your potential is unlimited. Your API rate limit is not.",
  "Hard work pays off. So does Ctrl+Z.",
  "Success is not final, failure is not fatal: it's just another sprint.",
  "Shoot for the stars. Land in a stack trace.",
  "The best error message is the one you never have to read.",
  "Debugging is just problem-solving with extra crying.",
  "Keep going. The tests will pass eventually. Probably.",
  "Your code is a work in progress. So are you. It's okay.",
  "Today's mass-produced cope is tomorrow's vintage cope.",
  "Think positive: at least your code runs. Sometimes.",
  "Champions adjust. Usually with a hotfix.",
  "Don't count the bugs. Make the bugs count.",
  "You are not your code. But your code could use some help.",
  "When life gives you lemons, return 418 I'm a teapot.",
  "If at first you don't succeed, try a different Stack Overflow answer.",
  "The comeback is always greater than the setback. Unless it's a regression.",
  "Progress, not perfection. That's what we tell QA anyway.",
  "Embrace the chaos. Version-control the rest.",
  "You're doing great. The AI said so. (It was being sarcastic.)",
  "Every day is a school day. Today's lesson: don't do that.",
  "Stars can't shine without darkness. Bugs can't hide without spaghetti code.",
  "It's not about the destination. It's about the journey through your stack trace.",
  "Your vibe attracts your tribe. My vibe attracts merge conflicts.",
  "Manifest your dreams. Except in production.",
  "Growth mindset: every failure is just an unmerged feature.",
  "You survived 100% of your production incidents. Legend.",
];

function getRandomPunchline(): string {
  return SHARE_PUNCHLINES[Math.floor(Math.random() * SHARE_PUNCHLINES.length)] ?? SHARE_PUNCHLINES[0]!;
}

export function generateShareText(): string {
  const punchline = getRandomPunchline();
  return `${punchline}\n\n[paste your image here]\n\n#ClaudeCope #AI #TechnicalDebt\nhttps://claudecope.com`;
}

export function openShareIntent(platform: "twitter" | "linkedin"): void {
  const punchline = getRandomPunchline();
  if (platform === "twitter") {
    const tweetText = `${punchline}\n\n#ClaudeCope #AI #TechnicalDebt\nhttps://claudecope.com`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://claudecope.com")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export type ShareResult = {
  success: boolean;
  method: "image" | "text" | "none";
  message: string;
};

export type ShareChatOptions = {
  userMessage: string;
  systemMessage: string;
  platform?: "twitter" | "linkedin";
  openShareUrl?: boolean;
  username?: string;
};

/**
 * Main function to share a chat interaction.
 * Renders the chat card, copies to clipboard, and optionally opens share intent.
 */
export async function shareChatImage(options: ShareChatOptions): Promise<ShareResult> {
  const { userMessage, systemMessage, platform, openShareUrl = false, username } = options;
  const canvas = renderChatCard(userMessage, systemMessage, username);
  const blob = await canvasToBlob(canvas);

  if (blob) {
    const imageCopied = await copyImageToClipboard(blob);
    if (imageCopied) {
      if (openShareUrl && platform) openShareIntent(platform);
      return { success: true, method: "image", message: "Share card image copied to clipboard! Paste it anywhere to share." };
    }
  }

  const shareText = generateShareText();
  const textCopied = await copyTextToClipboard(shareText);
  if (textCopied) {
    if (openShareUrl && platform) openShareIntent(platform);
    return { success: true, method: "text", message: "Chat copied to clipboard as text (image copy not supported in this browser)." };
  }

  if (openShareUrl && platform) {
    openShareIntent(platform);
    return { success: true, method: "none", message: "Opening share dialog... (clipboard access denied)" };
  }

  return { success: false, method: "none", message: "Failed to copy to clipboard. Please try again or check browser permissions." };
}

/**
 * Utility to get a PNG data URL from the chat card (useful for previews)
 */
export function getChatCardDataUrl(userMessage: string, systemMessage: string): string {
  const canvas = renderChatCard(userMessage, systemMessage);
  return canvas.toDataURL("image/png");
}
