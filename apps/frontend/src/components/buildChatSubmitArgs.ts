import type { Message, GameState } from "../hooks/useGameState";
import { API_BASE } from "../config";
import { supabase } from "../supabaseClient";
import { updateTicketServer } from "../api/profileApi";

interface SprintContext {
  state: GameState;
  updateTicketProgress: (amount: number) => void;
  addActiveTD: (amount: number) => void;
  playChime: () => void;
  setState: (fn: (prev: GameState) => GameState) => void;
}

/** Build the onSprintProgress callback and a getter for the sprint-complete message */
export function buildSprintCallbacks(ctx: SprintContext) {
  let sprintCompleteMessage: Message | null = null;

  const onSprintProgress = (rawAmount: number) => {
    if (!ctx.state.activeTicket) return;
    const amount = Math.round(rawAmount * 1.5);
    ctx.updateTicketProgress(amount);
    if (Math.min(ctx.state.activeTicket.sprintProgress + amount, ctx.state.activeTicket.sprintGoal) >= ctx.state.activeTicket.sprintGoal) {
      const payout = ctx.state.activeTicket.sprintGoal * 10;
      ctx.addActiveTD(payout); ctx.playChime();
      sprintCompleteMessage = { role: "system", content: `[⚠️ SPRINT COMPLETE] Ticket ${ctx.state.activeTicket!.id} "${ctx.state.activeTicket!.title}" delivered! You earned **${payout.toLocaleString()} TD**. The board is pleased... for now.` };
      ctx.setState((prev) => ({
        ...prev,
        activeTicket: null,
        pendingCompletedTaskIds: [...prev.pendingCompletedTaskIds, ctx.state.activeTicket!.id],
      }));
      if (ctx.state.proKeyHash && ctx.state.username) {
        void updateTicketServer(ctx.state.username, null, ctx.state.proKeyHash);
      }
      const completedMessage = `✅ ${ctx.state.username || "A player"} completed ticket "${ctx.state.activeTicket!.title}" and earned ${payout.toLocaleString()} TD!`;
      fetch(`${API_BASE}/api/recent-events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: completedMessage }) }).catch(() => {});
      supabase?.channel('global_incidents').send({ type: 'broadcast', event: 'new_incident', payload: { message: completedMessage } }).catch(() => {});
    }
  };

  const getSprintCompleteMessage = () => { const msg = sprintCompleteMessage; sprintCompleteMessage = null; return msg; };

  return { onSprintProgress, getSprintCompleteMessage };
}
