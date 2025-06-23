import { User } from ".";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }

  type SettingsTypes = typeof defaults;
  interface BindParams {
    event: string;
    element: HTMLElement | Window;
    handler: (e: Event) => void;
    options?: AddEventListenerOptions
  }

  type UpdateTypes = {
    [key: string]: boolean | string | {} | [] | SettingsTypes | User;
  }
}
