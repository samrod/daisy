export const CLIENT_STATES = [
  "unavailable", // 0
  "present",     // 1
  "waiting",     // 2
  "authorized",  // 3
  "denied",      // 4
  "done",        // 5
  "cancelled",   // 6
  "active",      // 7
  "expired",     // 8
];

export const CLIENT_STATE_DISPLAYS = (clientLink, clientName) => ({
  unavailable: "no one connected",
  present: `someon's at ${clientLink}`,
  waiting: `${clientName} is waiting`,
  authorized: `waiing for ${clientName} to join`,
  denied: `${clientName} was denied`,
  done: "You ended the session.",
  cancelled: `${clientName} cancelled request`,
  active: `${clientName} is active`,
  expired: `${clientName}'s session expired.`,
});

export const DEFAULT_PRESET_NAME = "Basic Settings";
export const LINK_PLACEHOLDER = "custom link";
export const EXPIRE_SESSION_SECONDS = 30;

export const DB_LINKS = "links";
export const DB_GUIDES = "guides";
export const DB_CLIENTS = "clients";
export const DB_PRESETS = "presets";
export const DB_SESSIONS = "sessions";

export const defaults = {
  size: 3,
  speed: 2500,
  angle: 0,
  pitch: 250,
  volume: 0,
  wave: 0,
  length: 50,
  background: 1,
  opacity: 1,
  lightbar: 0,
  steps: 1,
  color: "white",
  shape: "circle",
  playing: false,
};

export const limits = {
  wave: { min: 0, max: 25, amplitude: 2.5 },
  angle: { min: -45, max: 45 },
  length: { min: 10, max: 50 },
  speed: { min: 250, max: 3000, nudge: 10 },
  volume: { min: 0, max: 5000, nudge: 100 },
  pitch: { min: 50, max: 2000 },
  steps: { min: 1, max: 8 },
  lightbar: { min: 0, max: 0.5, step: 0.01 },
  background: { min: 0, max: 1, step: 0.01 },
  opacity: { min: 0, max: 1, step: 0.01 },
  size: { min: 1, max: 15, step: 0.1 },
  audioPanRange: 10000,
  toolbarHideDelay: 3000,
};
