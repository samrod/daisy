import React, { useEffect, useCallback, useRef } from "react";
import { bindEvent, unbindEvent, sendMessage } from "../lib/utils";
import "./Remote.scss";

window.name = "Remote";

const EmbeddedRemote = () => {
  const bindList = useRef<BindParams[]>();

  const bindEvents = useCallback(() => {
    if (window.parent["bound"]) {
      return;
    }
    bindList.current = [
      { event: "keydown", element: document.body, handler: (e: KeyboardEvent) => sendMessage({ action: 'routeKeys', params: { key: e.key }}, undefined, window.location.href) },
    ];
  
    bindList.current.forEach(bindEvent);
    window.parent["bound"] = true;
  }, []);

  const unbindEvents = useCallback(() => {
    if (window.parent["bound"]) {
      return;
    }
    bindList.current.forEach(unbindEvent);
  }, [bindList]);

  useEffect(() => {
    bindEvents();
    return unbindEvents;
  });

  return <></>;
}

export default EmbeddedRemote
