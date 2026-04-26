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

export function buyGeneratorServer(username: string, generatorId: string, amount: number, licenseKeyHash: string): Promise<ProfileResult> {
  return profilePost("buy-generator", { username, generatorId, amount, licenseKeyHash });
}

export function buyUpgradeServer(username: string, upgradeId: string, licenseKeyHash: string): Promise<ProfileResult> {
  return profilePost("buy-upgrade", { username, upgradeId, licenseKeyHash });
}

export function buyThemeServer(username: string, themeId: string, licenseKeyHash: string): Promise<ProfileResult> {
  return profilePost("buy-theme", { username, themeId, licenseKeyHash });
}

export function unlockAchievementServer(username: string, achievementId: string, licenseKeyHash: string): Promise<ProfileResult> {
  return profilePost("unlock-achievement", { username, achievementId, licenseKeyHash });
}

export function updateBuddyServer(username: string, buddyType: string | null, isShiny: boolean, licenseKeyHash: string): Promise<ProfileResult> {
  return profilePost("update-buddy", { username, buddyType, isShiny, licenseKeyHash });
}

export function updateTicketServer(username: string, activeTicket: { id: string; title: string; sprintProgress: number; sprintGoal: number } | null, licenseKeyHash: string): Promise<ProfileResult> {
  return profilePost("update-ticket", { username, activeTicket, licenseKeyHash });
}
