import { matchPath } from 'react-router';
import { isEmpty } from "lodash";
import { create } from "zustand";

import { update, readPropValue, updateClientData, consoleLog, objDiff } from ".";

type ClientStateTypes = {
  status: number;
  preset: string;
  clientLink: string;
  username: string;
  trigger: null | string;

  setStatus: (status: number, clientLink?: string) => void;
  setPreset: (prest: string) => void;
  setClientLink: () => void;
  setUsername: (name: string) => void;
};

const currentLinkExists = async () => {
  const match = matchPath({ path: "/:clientLink" }, window.location.pathname);
  if (!match) {
    return;
  }
  const { params: { clientLink }} = match;
  const response = await readPropValue("clientLinks", clientLink);
  if (response) {
    return { clientLink, ...response as object};
  }
};

export const useClientState = create<ClientStateTypes>((set) => ({
  status: 0,
  preset: "",
  clientLink: "",
  username: "",
  trigger: null,

  setStatus: async (status, clientLink) => {
    const validLink = clientLink ? { clientLink} : await currentLinkExists();

    update(set, (state) => {
      if (!isEmpty(state?.clientLink) || validLink?.clientLink) {
        state.status = status;
        state.trigger = "setStatus";
        updateClientData("status", status);
      }
    })
  },
  setPreset: (preset) => update(set, (state) => {
    state.preset = preset;
    state.trigger = "setPreset";
  }),
  setClientLink: async () => {
    const response = await currentLinkExists();
    await update(set, (State) => {
      if (response) {
        const { preset, clientLink } = response;
        State.clientLink = clientLink;
        State.preset = preset;
        State.trigger = "setClientLink";
      }
    });
  },
  setUsername: (name) => {
    update(set, (State) => {
      State.username = name;
      State.trigger = "setUsernae";
      updateClientData("username", name);
    })
  }
}));

useClientState.subscribe(({trigger, ...state }, { trigger: preTrigger, ...preState }) => {
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "warn");
  }
});
