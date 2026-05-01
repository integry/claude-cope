export { WELL_KNOWN_KEYS } from "@claude-cope/shared/config";

export interface ConfigEntry {
  key: string;
  tier: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface ConfigForm {
  key: string;
  tier: string;
  value: string;
  description: string;
}

export const emptyForm: ConfigForm = { key: "", tier: "*", value: "", description: "" };
