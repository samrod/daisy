import { DependencyList, useEffect, useRef } from 'react';
import { debounce, noop } from 'lodash';
import { DB_LINKS, bindEvent, readPropValue, unbindEvent } from '.';
import { useClientState, updateLinkData, sessionFromStorage, useSessionState, sessionExpired, endSession } from '../state';

export const useSessionCheck = () => {
  const { clientLink, status } = useClientState.getState();
  const { session, localSession, setSessionStatus } = useSessionState.getState();
  const persistedSessionRef = useRef<string | {} | null>(null);

  const reinitializeSession = () => {
    const { session, setUpdatedAt } = useSessionState.getState();
    if (session) {
      if (sessionExpired()) {
        endSession();
      } else {
        setUpdatedAt();
      }
    }
  };

  const updateSessionStatus = async () => {
    if (clientLink) {
      persistedSessionRef.current = await readPropValue(`${DB_LINKS}/${clientLink}/`, "session");
    }

    const sessionsMatch = persistedSessionRef.current === sessionFromStorage()?.state?.session;

    if (!clientLink) {
      setSessionStatus("unavailable");
    } else if (status === 1) {
      setSessionStatus("available");
    } else if (localSession && (!persistedSessionRef.current || sessionsMatch)) {
      setSessionStatus("available");
      reinitializeSession();
    } else {
      setSessionStatus("busy");
    }
  };

  useEffect(() => {
    updateSessionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSessionStatus, session, clientLink, status]);
};

export const useFullscreenHandler = (authorized) => {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }
    if (authorized) {
      document.documentElement
        .requestFullscreen({ navigationUI: "hide" })
        .catch(noop);
    } else {
      if (document.fullscreenEnabled) {
        document.exitFullscreen().catch(noop);
      }
    }
  }, [authorized]);
};

export const useEventBinder = (bindList = [], dependencies: DependencyList = []) => {
  const eventsBound = useRef(false);

  useEffect(() => {
    if (!eventsBound.current && !dependencies.includes(undefined)) {
      bindList.forEach(bindEvent);
      eventsBound.current = true;
    }
    return () => {
      if (eventsBound.current) {
        bindList.forEach(unbindEvent);
        eventsBound.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencies]);
};

export const useUnloadHandler = () => {
  const { setLocalPriority, setStatus } = useClientState(state => state);
  const { localSession, sessionStatus, setUpdatedAt } = useSessionState.getState();
  const unloadEvents = useRef([]);

  const onUnload = () => {
    if (!window["unloadEventFired"] && localSession) {
      updateLinkData("status", 0);
      setLocalPriority(true);
      setUpdatedAt();
      window["unloadEventFired"] = true;
    }
  };

  const checkSessionAndDefineEvents = () => {
    if (sessionStatus === "available") {
      unloadEvents.current = [
        { event: "beforeunload", element: window, handler: onUnload},
        { event: "unload", element: window, handler: onUnload},
        { event: "mousemove", element: document, handler: debounce(setUpdatedAt, 1000) },
      ];
      window["unloadEventSet"] = true;
    }
  };

  if (!window["unloadEventSet"]) {
    checkSessionAndDefineEvents();
  }

  useEventBinder(unloadEvents.current, [setStatus, setLocalPriority, unloadEvents.current]
  );
};

