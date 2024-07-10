import { matchPath } from 'react-router';
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { update, readPropValue, updateLinkData, consoleLog, objDiff, createSession, DB_LINKS, uuid, createClient } from ".";

type ClientStateTypes = {
  status: number;
  previousStatus: number | null;
  preset: null | string;
  clientLink: null | string;
  username: string;
  uid: null | string;
  guide: null | string;
  session?: null | string;
  trigger: null | string;
  localPriority: boolean;

  setStatus: (status: number, clientLink?: string) => void;
  setPreset: (preset: string) => void;
  setGuide: (guide: string) => void;
  setClientLink: () => void;
  setUsername: (name: string) => void;
  setLocalPriority: (flag: boolean) => void;
};

const currentLinkExists = async (): Promise<{ preset: string; clientLink: string } | null> => {
  try {
    const match = matchPath({ path: "/:clientLink" }, window.location.pathname);
    if (!match) {
      return null;
    }
    const { params: { clientLink }} = match;
    const response = await readPropValue(DB_LINKS, clientLink);
    if (response) {
      return { clientLink, ...(response as object)};
    }
  } catch(e) {
    console.log("*** ", e);
    return null;
  }
};

export const useClientState = create<ClientStateTypes>()(
  persist((set) => ({
    status: 0,
    previousStatus: null,
    localPriority: false,
    preset: null,
    clientLink: null,
    username: "",
    uid: null,
    guide: null,
    session: null,
    trigger: null,

    setStatus: async (status, clientLink) => {
      const validLink = clientLink ? { clientLink} : await currentLinkExists();
      update(set, (state) => {
        if (status === state.status) {
          return;
        }
        if (state.localPriority) {
          updateLinkData("status", state.status);
          return;
        }
        if (state?.clientLink || validLink?.clientLink) {
          state.previousStatus = state.status;
          state.status = status;
          updateLinkData("status", status);
        }
        if (status === 7) {
          state.uid ??= uuid();
          state.session ??= uuid();
          updateLinkData("client", state.uid);
          updateLinkData("session", state.session);
          createClient()
          createSession();
        }
        state.trigger = "setStatus";
      });
    },
    setPreset: (preset) => update(set, (state) => {
      state.preset = preset;
      state.trigger = "setPreset";
    }),
    setGuide: (id) => update(set, (state) => {
      state.guide = id;
      state.trigger = "setGuide";
    }),
    setClientLink: async () => {
      const response = await currentLinkExists();
      await update(set, (State) => {
        if (response) {
          const { preset, clientLink } = response;
          State.clientLink = clientLink;
          State.preset = preset;
        } else {
          State.preset = "";
        }
        State.trigger = "setClientLink";
      });
    },
    setUsername: (name) => {
      update(set, (State) => {
        State.username = name;
        State.trigger = "setUsername";
        updateLinkData("username", name);
      })
    },
    setLocalPriority: (enabled) => update(set, (state) => {
      state.localPriority = enabled;
      state.trigger = "setLocalPriority";
    }),
  }),
  {
    name: "daisy-session",
    storage: createJSONStorage(() => localStorage),
    partialize: ({ previousStatus, status, ...rest }) => {
      const newStatus = status ? status : previousStatus;
      return { status: newStatus, ...rest };
    },
    onRehydrateStorage: (prevState) => {
      return (state, error) => {
        setTimeout(() => {
          if (error) {
            consoleLog("*** rehydration error: ", error, "error");
            return;
          }
          consoleLog("rehydrate", objDiff(prevState, state), "standard");
        });
      };
    },
  },
));

useClientState.subscribe(({trigger, ...state }, { trigger: preTrigger, ...preState }) => {
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "warn");
  }
});
