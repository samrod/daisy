import { MouseEvent } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { User, update, consoleLog, objDiff, readPropValue, DB_GUIDES, DB_PRESETS } from "lib";
import { updateLinkData, updateGuideData, useLinkState, readGuideProp, PresetsTypes } from ".";
import { find } from "lodash";
export type GuideStateTypes = {
  userMode: boolean;
  user?: User;
  activePreset: string;
  clientStatus: number;
  clientName: string;
  presets: { id: string; name: string; }[];
  modalActive: boolean;
  trigger: null | string;
}

type GuideActionsTypes = {
  setActivePreset: (setting: string) => void;
  setPresets: (preset: string) => void;
  setUser: (user: User) => void;
  setUserMode: (userMode: boolean | MouseEvent<HTMLButtonElement>) => void;
  setClientStatus: (state: number) => void;
  setClientName: (name: string, persist?: boolean) => void;
  setModalActive: (flag: boolean)  => void;
  setInitialValues: () => void;
};

const guideStates = {
  userMode: false,
  user: null,
  activePreset: "",
  clientStatus: 0,
  clientName: "",
  presets: [],
  modalActive: false,
  trigger: null,
};

const guideActions = (set): GuideActionsTypes => ({
  setUser: async (user) => await update(set, (State) => {
    State.user = user;
    State.trigger = "setUser";
  }),
  setUserMode: async (userMode: boolean | MouseEvent<HTMLButtonElement>, persist = true) => await update(set, (state) => {
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
  setClientStatus: async (status) => await update(set, (state) => {
    state.clientStatus = status;
    state.trigger = "setClientStatus";
  }),
  setClientName: async (name, persist = true) => await update(set, (state) => {
    state.clientName = name;
    state.trigger = "setClientName";
    if (persist) {
      updateGuideData("clientName", name);
    }
  }),
  setPresets: async (preset: string) => await update(set, (state) => {
    state.presets = preset;
    state.trigger = "setPresets";
  }),
  setActivePreset: async (activePreset) => {
    const { setPreset, setPresetName } = useLinkState.getState();
    const presetList = await readGuideProp(DB_PRESETS) as PresetsTypes[];
    const presetName = find(presetList, { id: activePreset })?.name;
    await update(set, (state) => {
      state.activePreset = activePreset;
      updateLinkData("activePreset", activePreset);
      setPreset(activePreset);
      setPresetName(presetName);
      state.trigger = "setActivePreset";
    });
  },
  setModalActive: async (flag) => await update(set, (state) => {
    state.modalActive = flag;
    state.trigger = "setModalActive";
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
      await update(set, (state) => {
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

export const useGuideState = create<GuideStateTypes & GuideActionsTypes>()(
  devtools((set) => ({
    ...guideStates,
    ...guideActions(set),
  }))
);

useGuideState.subscribe(({ trigger, user, ...state }, {user: j1 ,trigger: j2, ...preState}) => {
  if (trigger === "setSetting") {
    return;
  }
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "info" );
  }
});
