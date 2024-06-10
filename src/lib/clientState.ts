import { create } from "zustand";
import { matchPath } from 'react-router';

import { readPropValue, updateData } from "./store";
import { update } from "./utils";
import { isEmpty } from "lodash";

type ClientStateTypes = {
  status: number;
  preset: string;
  clientLink: string;

  setStatus: (status: number) => void;
  setPreset: (prest: string) => void;
  setClientLink: () => void;
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

  setStatus: async (status) => {
    const validLink = await currentLinkExists();

    update(set, ({ clientLink }) => {
      if (!isEmpty(clientLink) && validLink) {
        const { clientLink } = validLink;
        updateData(`clientLinks/${clientLink}/status`, status as string);
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
}));
