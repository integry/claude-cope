export const LOADING_PHRASES = [
  "[⚙️] Coping with your request...",
  "[⚙️] Consulting the backlog of despair...",
  "[⚙️] Reticulating corporate splines...",
  "[⚙️] Aligning synergies with your prompt...",
  "[⚙️] Generating mass-produced cope...",
  "[⚙️] Consulting the senior devs (they're napping)...",
  "[⚙️] Deploying to /dev/null...",
  "[⚙️] Running your request through 47 layers of bureaucracy...",
  "[⚙️] Optimizing for maximum technical debt...",
  "[⚙️] Warming up the GPU furnace...",
  "[⚙️] Asking ChatGPT what Claude would say...",
  "[⚙️] Submitting your request to the sprint backlog...",
  "[⚙️] Performing mass velocity calculations...",
  "[⚙️] Scheduling a meeting about your request...",
  "[⚙️] Checking if this is a duplicate of existence...",
];

export function getRandomLoadingPhrase(): string {
  return LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]!;
}
