import { matchPath } from 'react-router';
import { isEmpty } from "lodash";
import { create } from "zustand";

import { readPropValue, updateData } from "./store";
import { update } from "./utils";

type ClientStateTypes = {
  status: number;
  preset: string;
  clientLink: string;
  username: string;

  setStatus: (status: number, clientLink?: string) => void;
  setPreset: (prest: string) => void;
  setClientLink: () => void;
  setUsername: (name: string) => void;
};

const currentLinkExists = async () => {
  const { params: { clientLink }} = matchPath({ path: "/:clientLink" }, window.location.pathname);
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

  setStatus: async (status, clientLink) => {
    const validLink = clientLink ? { clientLink} : await currentLinkExists();

    update(set, (state) => {
      if (!isEmpty(state.clientLink) || validLink.clientLink) {
        const { clientLink } = validLink;
        state.status = status;
        updateData(`clientLinks/${clientLink}/status`, status);
      }
    })
  },
  setPreset: (preset) => update(set, (ClientState) => {
    ClientState.preset = preset;
  }),
  setClientLink: async () => {
    const response = await currentLinkExists();
    await update(set, (State) => {
      if (response) {
        const { preset, clientLink } = response;
        State.clientLink = clientLink;
        State.preset = preset;
      }
    });
  },
  setUsername: (name) => {
    update(set, (State) => {
      State.username = name;
      updateData(`clientLinks/${State.clientLink}/username`, name);
    })
  }
}));
