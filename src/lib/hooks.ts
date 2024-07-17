import { useEffect, useRef } from 'react';
import { isEmpty, noop } from 'lodash';
import { bindEvent, unbindEvent, updateLinkData, useClientState } from '.';

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

export const useEventBinder = (bindList = [], dependencies = []) => {
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
  }, dependencies);
};

export const useUnloadHandler = () => {
  const { preset, setLocalPriority, setStatus } = useClientState(state => state);

  const onUnload = () => {
    updateLinkData("status", 0);
    setLocalPriority(true);
  };

  useEventBinder(isEmpty(preset) ? [] : [
      { event: 'beforeunload', element: window, handler: onUnload},
      { event: 'unload', element: window, handler: onUnload},
    ], [setStatus, setLocalPriority]
  );
};

