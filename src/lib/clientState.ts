import { matchPath } from 'react-router';
import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import firebase from 'firebase/compat';

import {
  update,
  readPropValue,
  updateLinkData,
  consoleLog,
  objDiff,
  createSession,
  DB_LINKS,
  uuid,
  createClient,
  serverStamp,
  sessionExpired,
} from ".";
import { differenceInSeconds } from 'date-fns/differenceInSeconds';
import { debounce, isEmpty } from 'lodash';

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
  sessionTime: null | firebase.firestore.Timestamp;

  setStatus: (status: number, clientLink?: string) => void;
  setPreset: (preset: string) => void;
  setGuide: (guide: string) => void;
  setClientLink: () => void;
  setUsername: (name: string) => void;
  setLocalPriority: (flag: boolean) => void;
  setSessionTime: () => void;
  rehydrate: (ClientStateTypes) => void;
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

export const useClientState = create<ClientStateTypes>()(devtools(
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
    sessionTime: null,

    setStatus: async (status, clientLink) => {
      const validLink = clientLink ? { clientLink} : await currentLinkExists();
      update(set, (state) => {
        if (status === state.status) {
          return;
        }
        if (state.localPriority && state.status) {
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
          state.createdAd ??= serverStamp();
          updateLinkData("client", state.uid);
          createClient();
          if (sessionExpired(state.sessionTime)) {
            state.session = uuid();
            state.sessionTime = serverStamp();
            createSession();
          }
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
          if (!isEmpty(clientLink)) {
            State.clientLink = clientLink;
          }
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
    setSessionTime: () => update(set, (state) => {
      state.sessionTime = serverStamp();
      state.trigger = "setSessionTime";
    }),
    rehydrate: set,
}),
  {
    name: "daisy-session",
    storage: createJSONStorage(() => localStorage),
    partialize: ({ clientLink, previousStatus, status, uid, ...rest }) => {
      const match = matchPath({ path: "/:clientLink" }, window.location.pathname);
      if (!match) {
        return;
      }
      if (uid) {
        const { params } = match;
        const link = clientLink === params.clientLink ? clientLink : null;
        const newStatus = status ? status : previousStatus;
        return { status: newStatus, uid, clientLink: link, ...rest };
      }
      return {};
    },
    onRehydrateStorage: (prevState) => {
      return (state, error) => {
        const { params } = matchPath({ path: "/:clientLink" }, window.location.pathname);
        setTimeout(() => {
          if (error) {
            consoleLog("rehydrate", error, "error");
            return;
          }
          const validClientLink = state.clientLink === params.clientLink;
          const { rehydrate } = useClientState.getState();
          if (validClientLink) {
            rehydrate(state);
            consoleLog("rehydrate", objDiff(prevState, state), "standard");
          } else {
            consoleLog("rehydrate", "invalid link. No rehydration.");
            rehydrate({});
          }
        });
      };
    },
  },
), { name: "clientState", store: "clientState" }));

useClientState.subscribe(({trigger, ...state }, { trigger: preTrigger, ...preState }) => {
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "warn");
  }
});
