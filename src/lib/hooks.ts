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
    } else if (localSession || (!persistedSessionRef.current || sessionsMatch)) {
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
  const { setSupressCallback, setLocalPriority, setStatus } = useClientState(state => state);
  const { setUpdatedAt } = useSessionState.getState();
  const unloadEvents = useRef([]);

  const presentOrLocalSession = () => {
    const { localSession } = useSessionState.getState();
    const { status } = useClientState.getState();
    return status === 1 || localSession
  };

  const onPageHide = async () => {
    if (presentOrLocalSession()) {
      setLocalPriority(true);
      await updateLinkData("status", 0);
      setUpdatedAt();
    }
  };

  const onVisibilitychange = async () => {
    if (presentOrLocalSession()) {
      if (document.visibilityState === "hidden") {
        setSupressCallback(true);
        await updateLinkData("status", 9);
      } else {
        setSupressCallback(false);
        await updateLinkData("status", useClientState.getState().status);
        setUpdatedAt();
      }
    }
  };

  const checkSessionAndDefineEvents = () => {
    const { sessionStatus } = useSessionState.getState();
    if (sessionStatus === "available") {
      unloadEvents.current = [
        { event: "pagehide", element: window, handler: onPageHide },
        { event: "visibilitychange", element: document, handler: onVisibilitychange },
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

