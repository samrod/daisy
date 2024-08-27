import { MouseEvent } from "react";
import { create } from "zustand";
import { User, update, consoleLog, objDiff, readPropValue, DB_GUIDES } from "lib";
import { updateGuideData, useLinkState } from ".";

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
  setInitialValues: () => void;
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

const guideActions = (set): GuideActionsTypes => ({
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
        updateGuideData("userMode", newUserMode);
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
      updateGuideData("clientName", name);
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
  setInitialValues: async () => {
    const { user: { uid }, } = useGuideState.getState();
    const { setClientLink } = useLinkState.getState();
    if (!uid) {
      return;
    }
    try {
      const data: GuideStateTypes & { clientLink?: string } = await readPropValue(`${DB_GUIDES}/${uid}`, "") as GuideStateTypes;
      if (data == null || typeof data === "string") {
        return;
      }
      update(set, (state) => {
        const { activePreset, presets, userMode } = data;
        state.activePreset = activePreset ?? state.activePreset;
        state.userMode = userMode ?? state.userMode;
        state.presets = presets ?? state.Object.values(presets);
        state.trigger =  "setInitialValues";
      });
      setClientLink(data.clientLink);
    } catch (e) {
      consoleLog("setInitialValues", e, "error");
    }
  },
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
