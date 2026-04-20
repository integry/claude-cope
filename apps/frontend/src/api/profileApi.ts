import type { ServerProfile } from "@claude-cope/shared/profile";
import { API_BASE } from "../config";

type ProfileResult = { success: boolean; profile?: ServerProfile; error?: string };

async function profilePost(path: string, body: Record<string, unknown>): Promise<ProfileResult> {
  try {
    const res = await fetch(`${API_BASE}/api/account/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json() as ProfileResult;
    if (!res.ok) {
      return { success: false, error: data.error ?? `HTTP ${res.status}` };
    }
    return data;
  } catch {
    return { success: false, error: "Network error" };
  }
}

export function buyGeneratorServer(username: string, generatorId: string, amount: number): Promise<ProfileResult> {
  return profilePost("buy-generator", { username, generatorId, amount });
}

export function buyUpgradeServer(username: string, upgradeId: string): Promise<ProfileResult> {
  return profilePost("buy-upgrade", { username, upgradeId });
}

export function buyThemeServer(username: string, themeId: string): Promise<ProfileResult> {
  return profilePost("buy-theme", { username, themeId });
}

export function unlockAchievementServer(username: string, achievementId: string): Promise<ProfileResult> {
  return profilePost("unlock-achievement", { username, achievementId });
}

export function updateBuddyServer(username: string, buddyType: string | null, isShiny: boolean): Promise<ProfileResult> {
  return profilePost("update-buddy", { username, buddyType, isShiny });
}

export function updateTicketServer(username: string, activeTicket: { id: string; title: string; sprintProgress: number; sprintGoal: number } | null): Promise<ProfileResult> {
  return profilePost("update-ticket", { username, activeTicket });
}
