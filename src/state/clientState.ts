import { isEmpty } from 'lodash';
import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, devtools } from "zustand/middleware";

import { currentLinkExists, updateLinkData, clientLinkFromPath } from './';
import {
  update, readPropValue, consoleLog, objDiff, DB_LINKS,
  uuid, serverStamp,
} from "lib";

type ClientStateTypes = {
  status: number;
  previousStatus: number | null;
  preset: null | string;
  clientLink: null | string;
  username: string;
  uid: null | string;
  guide: null | string;
  trigger: null | string;
  localPriority: boolean;
  suppressCallback: boolean;
}

type ClientStateActions = {
  setStatus: (status: number, persist?: boolean) => void;
  setPreset: (preset: string) => void;
  setGuide: (guide: string) => void;
  setClientLink: () => void;
  setUsername: (name?: string, persist?: boolean) => void;
  setLocalPriority: (flag: boolean) => void;
  setSupressCallback: (flag: boolean) => void;
  setCreatedAt: () => void;
  setUid: (uid?: string) => void;
};

const clientStates = {
  status: 0,
  previousStatus: null,
  localPriority: false,
  suppressCallback: false,
  preset: null,
  clientLink: null,
  username: "",
  uid: null,
  guide: null,
  trigger: null,
};

const clientStateActions = (set, get): ClientStateActions => ({
  setStatus: async (status, persist = true) => {
    if (get().suppressCallback) {
      return;
    }
    const validLink = await currentLinkExists();
    if (!validLink?.clientLink) {
      return;
    }
    const persistedStatus = await readPropValue(`${DB_LINKS}/${validLink.clientLink}`, "status");
    await update(set, (state) => {
      const noChange = Number(persistedStatus) === status && state.status === status;
      if (noChange) {
        return;
      }
      if (state.localPriority && state.status) {
        updateLinkData("status", state.status);
        return;
      }
      state.previousStatus = state.status;
      state.status = status;
      if (persist) {
        updateLinkData("status", status);
      }
      state.trigger = "setStatus";
    });
  },
  setPreset: async (preset: string) => await update(set, (state) => {
    state.preset = preset;
    state.trigger = "setPreset";
  }),
  setGuide: async (id) => await update(set, (state) => {
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
  setUsername: async (name, persist = true) => {
    await update(set, (State) => {
      State.username = name;
      State.trigger = "setUsername";
      if (persist) {
        updateLinkData("username", name);
      }
    })
  },
  setCreatedAt: async () => await update(set, (state) => {
    state.createdAt = serverStamp();
    state.trigger = "setCreatedAt";
  }),
  setLocalPriority: async (enabled) => await update(set, (state) => {
    state.localPriority = enabled;
    state.trigger = "setLocalPriority";
  }),
  setUid: async (uid = uuid()) => await update(set, (state) => {
    state.uid ??= uid;
    state.trigger = "setUid";
  }),
  setSupressCallback: async (enabled) => await update(set, (state) => {
    state.suppressCallback = enabled;
    state.trigger = "setSupressCallback";
  }),
});

const persistOptions = {
  name: "daisy-data",
  storage: createJSONStorage(() => localStorage),
  partialize: ({ clientLink, previousStatus, status, uid, ...rest }) => {
    const link = clientLinkFromPath();
    if (!link) {
      return null;
    }
    if (uid && link) {
      const newStatus = status ? status : previousStatus;
      const newPersist = { status: newStatus, uid, clientLink: link, ...rest };
      try {
        const prevState = JSON.parse(localStorage.getItem("daisy-data"))?.state;
        const diff = objDiff(newPersist, prevState);
        if (diff) {
          consoleLog("persist client", diff, "#09C");
        }
      } catch (e) {}

      return newPersist;
    }
    return null;
  },
  skipHydration: true,
  onRehydrateStorage: (prevState: ClientStateTypes) => {
    return (state, error) => {
      const clientLink = clientLinkFromPath();
      setTimeout(() => {
        if (error) {
          consoleLog("rehydrate client", error, "error");
          return;
        }
        const validClientLink = state.clientLink === clientLink;
        if (validClientLink) {
          consoleLog("rehydrate client", objDiff(prevState, state));
        } else {
          consoleLog("rehydrate client", "invalid link. No rehydration.");
        }
      });
    };
  },
};

const clientStateCreator: StateCreator<ClientStateTypes & ClientStateActions> = (set, get) => ({
  ...clientStates,
  ...clientStateActions(set, get),
});

export const useClientState = create<ClientStateTypes & ClientStateActions>()(
  devtools(
    persist(clientStateCreator, persistOptions),
    { name: "clientState", store: "clientState" }
  )
);

useClientState.subscribe(({trigger, ...state }, { trigger: preTrigger, ...preState }) => {
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "warn");
  }
});
