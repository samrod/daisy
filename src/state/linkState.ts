import { create } from "zustand";
import { defaults, limits, update, consoleLog, objDiff } from "lib";

const { volume, speed } = limits;

export type LinkStateTypes = {
  settings: typeof defaults;
  clientLink: string | null;
  clientStatus: number;
  clientName: string;
  preset: string;
  motionBarActive: boolean;
  activeSetting: string;
  trigger: null | string;
}

export type LinkActionsTypes = {
  setSetting: (setting: string, value: string | number | boolean) => void;
  volumeUp: () => void;
  volumeDown: () => void;
  speedUp: () => void;
  speedDown: () => void;
  setClientLink: (state: string) => void;
  setActiveSetting: (setting: string) => void;
};

const linkStates: LinkStateTypes = {
  settings: defaults,
  motionBarActive: false,
  activeSetting: "",
  clientLink: null,
  clientStatus: 0,
  clientName: "",
  preset: "",
  trigger: null,
};

const linkActions = (set): LinkActionsTypes => ({
  setSetting: (setting, value) => update(set, (state) => {
    state.settings[setting] = value;
    state.trigger = "setSetting";
  }),
  setActiveSetting: (setting) => update(set, (state) => {
    state.activeSetting = setting;
    state.motionBarActive = !!setting.match(/angle|length/);
    state.trigger = "setActiveSetting";
  }),
  volumeDown: () => update(set, ({ settings }) => { 
    if (typeof settings === 'object' && settings !== null && 'volume' in settings) {
      settings.volume = Math.max(settings.volume - volume.nudge, volume.min);
    }
  }),
  volumeUp: () => update(set, ({ settings }) => {
    if (typeof settings === 'object' && settings !== null && 'volume' in settings) {
      settings.volume = Math.min(settings.volume + volume.nudge, volume.max);
    }
  }),
  speedUp: () => update(set, ({ settings }) => { 
    if (typeof settings === 'object' && settings !== null && 'speed' in settings) {
      settings.speed = Math.min(settings.speed + speed.nudge, speed.max);
    }
  }),
  speedDown: () => update(set, ({ settings }) => {
    if (typeof settings === 'object' && settings !== null && 'speed' in settings) {
      settings.speed = Math.max(settings.speed - speed.nudge, speed.min);
    }
  }),
  setClientLink: (link) => update(set, (state) => {
    state.clientLink = link;
    state.trigger = "setClientLink";
  }),
});

export const useLinkState = create<LinkStateTypes & LinkActionsTypes>((set) => ({
  ...linkStates,
  ...linkActions(set),
}));

useLinkState.subscribe(({ trigger, ...state }, {trigger: j2, ...preState}) => {
  if (trigger === "setSetting") {
    return;
  }
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "#09F" );
  }
});
