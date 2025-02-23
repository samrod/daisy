import { create } from "zustand";
import firebase from 'firebase/compat';
import { persist, createJSONStorage, devtools } from "zustand/middleware";

import { endSession, sessionFromStorage, useClientState } from './';
import {
  update,
  consoleLog,
  objDiff,
  uuid,
  serverStamp,
  EXPIRE_SESSION_SECONDS,
} from "lib";
import { isNull } from "lodash";

type SessionStateTypes = {
  session?: null | string;
  sessionStatus: null | string;
  updatedAt: null | firebase.firestore.Timestamp;
  localSession: boolean;
  timer?: undefined | ReturnType<typeof setTimeout>;
  trigger?: string;
}

type SessionStateActions = {
  setSessionStatus: (value: string) => void;
  setSession: (sessionId?: string) => void;
  setUpdatedAt: (reset?: boolean) => void;
  setLocalSession: (local: boolean) => void;
};

const sessionStates: SessionStateTypes = {
  session: null,
  sessionStatus: null,
  updatedAt: null,
  localSession: false,
  trigger: null,
};

const sessionStateActions = (set, get) => ({
  setSessionStatus: async (status) => {
    await update(set, (state) => {
      state.sessionStatus = status;
      state.trigger = "setSessionStatus";
    })
  },
  setSession: async (sessionId = uuid()) => await update(set, (state) => {
    const newSession = !isNull(sessionId) || state.session === sessionId ? sessionId : null;
    state.session = newSession;
    state.trigger = "setSession";
  }),
  setUpdatedAt: async (reset = false) => await update(set, (state) => {
    clearTimeout(state.timer as number);
    if (reset === true) {
      state.updatedAt = null;
    } else {
      const { status } = useClientState.getState();
      if (status === 7) {
        state.updatedAt = serverStamp();
        state.timer = setTimeout(endSession, EXPIRE_SESSION_SECONDS * 1000);
      }
    }
    state.trigger = "setUpdatedAt";
  }),
  setLocalSession: async (local: boolean) => await update(set, (state) => {
    state.localSession = local;
    state.trigger = "setLocalSession";
  }),
});

const sessionStateCreator = (set, get) => ({
  ...sessionStates,
  ...sessionStateActions(set, get),
});

const persistOptions = {
  name: "daisy-session",
  storage: createJSONStorage(() => localStorage),
  partialize: (state: SessionStateTypes) => {
    const { sessionStatus, session, localSession, updatedAt } = state;
    if (session) {
      const newState = { sessionStatus, session, localSession, updatedAt };
      let prevState: SessionStateTypes;
      try {
        prevState = sessionFromStorage()?.state;
        const diff = objDiff(newState, prevState);
        if (diff) {
          consoleLog("persist session", diff, "#09C");
        }
      } catch (e) {}
      return newState;
    }
    if (localSession) {
      return { localSession };
    }
  },
  onRehydrateStorage: (prevState: SessionStateTypes) => {
    return (state, error) => {
      setTimeout(() => {
        if (error) {
          consoleLog("rehydrate session", error, "error");
          return;
        }
        consoleLog("rehydrate session", objDiff(prevState, state));
      });
    };
  },
  onFinishHydration: (state: SessionStateTypes) => {
    consoleLog("rehydrated session", state);
  },
};

export const useSessionState = create<SessionStateTypes & SessionStateActions>()(
  devtools(
    persist(sessionStateCreator, persistOptions),
    { name: "sessionState", store: "sessionState" }
  )
);

useSessionState.subscribe(({trigger, ...state }, { trigger: preTrigger, ...preState }) => {
  const diff = objDiff(preState, state);
  if (diff) {
    consoleLog(trigger, diff, "#C60");
  }
});
