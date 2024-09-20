import { EventHandler } from "react";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
  type SettingsTypes = typeof defaults;
}
