import { useEffect, useCallback, useRef } from "react";
import { bindEvent, unbindEvent, sendMessage } from "../lib/utils";
import "./Remote.scss";

const EmbeddedRemote = () => {
  const bindList = useRef<BindParams[]>();

  const bindEvents = useCallback(() => {
    bindList.current = [
      { event: "keydown", element: document.body, handler: (e: KeyboardEvent) => sendMessage({ action: 'routeKeys', params: { key: e.key }}, undefined, window.location.href) },
    ];
  
    bindList.current.forEach(bindEvent);
    window.parent["bound"] = true;
  }, []);

  const unbindEvents = useCallback(() => {
    bindList.current.forEach(unbindEvent);
  }, [bindList]);
  
  useEffect(() => {
    if (window.parent["bound"]) {
      return;
    }
    bindEvents();
    return unbindEvents;
  });

  return <></>;
}

export default EmbeddedRemote
