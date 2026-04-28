import type { Dispatch, SetStateAction } from "react";
import type { Message } from "../hooks/useGameState";
import { getRandomAd } from "./terminalAds";
import { getRandomLoadingPhrase } from "./loadingPhrases";

type DelayState = { cancelled: boolean; timeoutId: ReturnType<typeof setTimeout> | null; batchId?: string };

const QUEUE_MESSAGES: string[] = [
  "[INFO] Free tier detected. Yielding compute to paying customers. Please hold...",
  "[INFO] You are #847 in the free-tier queue. Estimated wait: mass extinction event.",
  "[INFO] Allocating leftover GPU cycles from paying customers' lunch breaks...",
  "[INFO] Free tier request received. Forwarding to the intern's laptop...",
  "[INFO] Your prompt is very important to us. Please enjoy this silence.",
  "[INFO] Scanning for unused compute... found 0.3 FLOPS behind the couch cushions.",
  "[INFO] Routing your request through a series of carrier pigeons. Stand by.",
  "[INFO] Priority queue position: somewhere between 'eventually' and 'maybe'.",
  "[INFO] Free tier detected. Spinning up the hamster wheel...",
  "[INFO] Borrowing compute from a paying customer who went to get coffee...",
  "[INFO] Free tier throttle engaged. Your patience is our dividend.",
  "[INFO] Request queued behind 12,000 paying customers and one very demanding chatbot.",
  "[INFO] Checking if any paying customers have accidentally left a GPU idle...",
  "[INFO] Free tier detected. Downgrading to abacus-based computation...",
  "[INFO] Your request is in the queue. The queue is in another queue.",
  "[INFO] Compressing your hopes and dreams to fit in free-tier bandwidth...",
  "[INFO] Diverting 0.001% of a paying customer's unused allocation to your request...",
  "[INFO] Free tier detected. Submitting your prompt via fax machine...",
  "[INFO] Waiting for a paying customer to blink so we can borrow their GPU cycle...",
  "[INFO] Free tier request acknowledged. Deploying motivational hold music (silent edition).",
  "[INFO] Your request has been added to the 'we'll get to it' pile.",
  "[INFO] Negotiating with the server hamsters for extra wheel time...",
  "[INFO] Free tier detected. Converting your prompt to smoke signals...",
  "[INFO] Currently processing requests from users who remembered their wallet.",
  "[INFO] Free tier compute budget: the warmth from the server room's pilot light.",
  "[INFO] Queueing your request behind the guy who pays $400/month for 'enterprise vibes'.",
  "[INFO] Free tier detected. Locating the one shared neuron allocated to your tier...",
  "[INFO] Please hold. A paying customer just ordered a haiku and gets priority.",
  "[INFO] Running your request on recycled electrons. Results may vary.",
  "[INFO] Free tier detected. Consulting the Magic 8-Ball for your response...",
];

function getRandomQueueMessage(): string {
  return QUEUE_MESSAGES[Math.floor(Math.random() * QUEUE_MESSAGES.length)]!;
}

function cancellableDelay(ms: number, delayState: DelayState): Promise<void> {
  return new Promise((resolve) => {
    if (delayState.cancelled) { resolve(); return; }
    delayState.timeoutId = setTimeout(() => { delayState.timeoutId = null; resolve(); }, ms);
  });
}

/**
 * Runs the free-tier artificial scarcity sequence: optional ad + fake queue delay.
 * Returns true if the delay completed, false if it was cancelled.
 */
export async function runFreeTierDelay(opts: {
  commandCount: number;
  userMessage: Message;
  delayState: DelayState;
  setHistory: Dispatch<SetStateAction<Message[]>>;
}): Promise<boolean> {
  const { commandCount, userMessage, delayState, setHistory } = opts;

  const batchId = `__batch_${Date.now()}_${Math.random()}`;
  const queueMsgId = `__queue_${Date.now()}_${Math.random()}`;
  // Store the batch ID on the delay state so the escape handler can scope cleanup
  delayState.batchId = batchId;

  // Every 4th command: show a terminal ad before processing
  if (commandCount % 4 === 0) {
    const ad = getRandomAd();
    setHistory((prev) => [...prev, userMessage, { role: "warning", content: ad, _freeTierScaffold: true, _freeTierBatchId: batchId } as Message & { _freeTierScaffold: boolean; _freeTierBatchId: string }]);
    await cancellableDelay(2000, delayState);
    if (delayState.cancelled) return false;
  }

  // Simulated queueing: show a random bureaucratic message and wait 3 seconds
  const queueContent = getRandomQueueMessage();
  setHistory((prev) => [...prev, ...(commandCount % 4 === 0 ? [] : [userMessage]), { role: "warning", content: queueContent, _freeTierScaffold: true, _freeTierBatchId: batchId, _queueId: queueMsgId } as Message & { _freeTierScaffold: boolean; _freeTierBatchId: string; _queueId: string }]);
  await cancellableDelay(3000, delayState);
  if (delayState.cancelled) return false;

  // Remove queue message and add loading indicator
  setHistory((prev) => [...prev.filter((m) => (m as Message & { _queueId?: string })._queueId !== queueMsgId), { role: "loading", content: getRandomLoadingPhrase() }]);
  return true;
}
