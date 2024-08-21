import { MouseEvent } from "react";
import { create } from "zustand";
import { User, update, consoleLog, objDiff } from "lib";
import { updateGuide } from ".";

export type GuideStateTypes = {
  userMode: boolean;
  user?: User;
  activePreset: string;
  clientStatus: number;
  clientName: string;
  presets: { id: string; name: string; }[];
  trigger: null | string;
}

type GuideActionsTypes = {
  setActivePreset: (setting: string) => void;
  setPresets: (preset: string) => void;
  setUser: (user: User) => void;
  setUserMode: (userMode: boolean | MouseEvent<HTMLButtonElement>) => void;
  setClientStatus: (state: number) => void;
  setClientName: (name: string, persist?: boolean) => void;
};

const guideStates = {
  userMode: false,
  user: null,
  activePreset: "",
  clientStatus: 0,
  clientName: "",
  presets: [],
  trigger: null,
};

const guideActions = (set) => ({
  setUser: (user) => update(set, (State) => {
    State.user = user;
    State.trigger = "setUser";
  }),
  setUserMode: (userMode: boolean | MouseEvent<HTMLButtonElement>, persist = true) => update(set, (state) => {
    let newUserMode: boolean;
    if (typeof userMode === "boolean") {
      newUserMode = userMode;
    } else if (userMode && userMode?.type === "click") {
      newUserMode = !state.userMode;
    }
    if (state.userMode !== newUserMode) {
      state.userMode = newUserMode;
      if (persist) {
        updateGuide("userMode", newUserMode);
      }
      state.trigger = "setUserMode";
    }
  }),
  setClientStatus: (status) => update(set, (state) => {
    state.clientStatus = status;
    state.trigger = "setClientStatus";
  }),
  setClientName: (name, persist = true) => update(set, (state) => {
    state.clientName = name;
    state.trigger = "setClientName";
    if (persist) {
      updateGuide("clientName", name);
    }
  }),
  setPresets: (preset: string) => update(set, (state) => {
    state.presets = preset;
    state.trigger = "setPresets";
  }),
  setActivePreset: (activeSetting) => update(set, (state) => {
    state.activePreset = activeSetting;
    state.trigger = "setActivePreset";
  }),
});

export const useGuideState = create<GuideStateTypes & GuideActionsTypes>((set) => ({
  ...guideStates,
  ...guideActions(set),
}));

useGuideState.subscribe(({ trigger, user, ...state }, {user: j1 ,trigger: j2, ...preState}) => {
  if (trigger === "setSetting") {
    return;
  }
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "info" );
  }
});
