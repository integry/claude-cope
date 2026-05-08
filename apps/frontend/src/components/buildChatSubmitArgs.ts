import type { Message, GameState } from "../hooks/useGameState";
import type { ServerProfile } from "@claude-cope/shared/profile";
import { API_BASE } from "../config";
import { supabase } from "../supabaseClient";
import { updateTicketServer } from "../api/profileApi";
import type { PendingCompletedRewardMerge } from "../hooks/profileSync";

interface SprintContext {
  getState: () => GameState;
  updateTicketProgress: (amount: number) => void;
  addActiveTD: (amount: number) => void;
  playChime: () => void;
  setState: (fn: (prev: GameState) => GameState) => void;
  onCompletedRewardPending?: (pending: PendingCompletedRewardMerge) => void;
  onCompletedRewardProfile?: (profile: ServerProfile, ticketId: string) => void;
}

export function syncCompletedTicketReward(params: {
  username: string;
  ticketId: string;
  proKeyHash?: string;
  currentTD?: number;
  totalTDEarned?: number;
  inventory?: Record<string, number>;
  upgrades?: string[];
}): Promise<{ profile?: ServerProfile } | null> {
  const { username, ticketId, proKeyHash, currentTD = 0, totalTDEarned = 0, inventory = {}, upgrades = [] } = params;
  return fetch(`${API_BASE}/api/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      currentTD,
      totalTDEarned,
      inventory,
      upgrades,
      completedTaskIds: [ticketId],
      ...(proKeyHash ? { proKeyHash } : {}),
    }),
  })
    .then(async (res) => {
      if (!res.ok) return null;
      return await res.json().catch(() => null) as { profile?: ServerProfile } | null;
    })
    .catch(() => null);
}

/** Build the onSprintProgress callback and a getter for the sprint-complete message */
export function buildSprintCallbacks(ctx: SprintContext) {
  let sprintCompleteMessage: Message | null = null;

  const onSprintProgress = (rawAmount: number) => {
    const amount = Math.round(rawAmount * 1.5);
    const current = ctx.getState();
    const ticket = current.activeTicket;
    if (!ticket) return;

    const willComplete =
      Math.min(ticket.sprintProgress + amount, ticket.sprintGoal) >= ticket.sprintGoal;

    if (!willComplete) {
      ctx.updateTicketProgress(amount);
      return;
    }

    const completedTicketId = ticket.id;
    const completedTicketTitle = ticket.title;
    const completedUsername = current.username;
    const completedProKeyHash = current.proKeyHash;
    const payout = ticket.sprintGoal * 10;
    const pendingReward = {
      minimumCurrentTD: current.economy.currentTD + payout,
      minimumTotalTDEarned: current.economy.totalTDEarned + payout,
      pendingTaskIds: [completedTicketId],
    };

    ctx.setState((prev) => {
      if (!prev.activeTicket || prev.activeTicket.id !== completedTicketId) return prev;
      return {
        ...prev,
        activeTicket: null,
        pendingCompletedTaskIds: [...prev.pendingCompletedTaskIds, completedTicketId],
      };
    });

    ctx.addActiveTD(payout);
    ctx.playChime();
    sprintCompleteMessage = { role: "system", content: `[⚠️ SPRINT COMPLETE] Ticket ${completedTicketId} "${completedTicketTitle}" delivered! You earned **${payout.toLocaleString()} TD**. The board is pleased... for now.` };

    if (completedUsername && completedProKeyHash) {
      ctx.onCompletedRewardPending?.(pendingReward);
      void syncCompletedTicketReward({
        username: completedUsername,
        ticketId: completedTicketId,
        proKeyHash: completedProKeyHash,
        currentTD: pendingReward.minimumCurrentTD,
        totalTDEarned: pendingReward.minimumTotalTDEarned,
        inventory: current.inventory,
        upgrades: current.upgrades,
      }).then((result) => {
        if (result?.profile) {
          ctx.onCompletedRewardProfile?.(result.profile, completedTicketId);
        }
      });
      void updateTicketServer(completedUsername, null, completedProKeyHash);
    }

    const completedMessage = `✅ ${completedUsername || "A player"} completed ticket "${completedTicketTitle}" and earned ${payout.toLocaleString()} TD!`;
    fetch(`${API_BASE}/api/recent-events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: completedMessage }) }).catch(() => {});
    supabase?.channel('global_incidents').send({ type: 'broadcast', event: 'new_incident', payload: { message: completedMessage } }).catch(() => {});
  };

  const getSprintCompleteMessage = () => { const msg = sprintCompleteMessage; sprintCompleteMessage = null; return msg; };

  return { onSprintProgress, getSprintCompleteMessage };
}
