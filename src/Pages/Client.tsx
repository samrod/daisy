import { useCallback, useEffect, useRef, useState } from 'react';
import cn from "classnames";

import { bindAllSettingsToValues, CLIENT_STATES, useUnloadHandler, useFullscreenHandler, useSessionCheck, } from "../lib";
import { useClientState, useGuideState, createClient, createSession, getLinkData, useSessionState } from '../state';
import { ClientLogin, Cloud, Display, NotAvailable } from "../components";
import { ReactComponent as Logo } from "../assets/daisy-logo.svg"
import Styles from "./Client.module.scss";

const Client = () => {
  const { uid, preset, status, username, clientLink, setUsername, setClientLink, setStatus, setGuide, setLocalPriority } = useClientState(state => state);
  const { sessionStatus, setLocalSession, setUpdatedAt } = useSessionState(state => state);
  const { setActivePreset } = useGuideState(state => state);  
  const [nickname, setNickname] = useState(username)
  const [slideIn, setSlideIn] = useState(false);
  const sessionBusyRef = useRef<boolean>();

  const clientStatus = CLIENT_STATES[status];

  useSessionCheck();
  useUnloadHandler();
  useFullscreenHandler(clientStatus === "active");

  const findGuide = useCallback(async () => {
    bindAllSettingsToValues();
    if (clientStatus === "unavailable") {
      setStatus(1);
    }
  }, [setStatus, clientStatus]);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    switch (clientStatus) {
      case "unavailable":
      case "present":
      case "denied":
      case "done":
        setLocalSession(true);
        setStatus(2);
        setUsername(nickname);
        break;
      case "cancelled":
        setLocalSession(false);
        break;
      case "authorized":
        setStatus(7);
        break;
    }
  }, [clientStatus, setStatus, nickname, setUsername]);

  useEffect(() => {
    if (preset === null) {
      return;
    }
    if (sessionStatus === "available") {
      if (clientStatus === "active") {
        createClient();
        createSession();
      }
      setActivePreset(preset);
      findGuide();
    }
  }, [clientLink, clientStatus, sessionStatus, preset, uid, setUpdatedAt, findGuide, setActivePreset]);

  useEffect(() => {
    if (clientLink && !sessionBusyRef.current) {
      getLinkData("status", (status: number) => setStatus(status, false));
      getLinkData("guide", setGuide);
      setTimeout(setLocalPriority.bind(null, false), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientLink]);

  useEffect(() => {
    setClientLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (clientStatus === "active" && sessionStatus === "available") {
    return (
      <Display />
    );
  }

  return (
    <div className={Styles.page}>
      <Cloud offset={-5} scaleX={1.5} />
      <Cloud offset={90} scaleY={0.5} />
      <form className={cn(Styles.card, "slider", { slideIn })} onSubmit={onSubmit}>
        <div className="step">
          <Logo className={Styles.logo} />
        </div>
        {sessionStatus === "busy" && <NotAvailable onReady={setSlideIn} state={sessionStatus} />}
        {sessionStatus === "available" && <ClientLogin onReady={setSlideIn} onSubmit={onSubmit} nickname={nickname} setNickname={setNickname} />}
        {sessionStatus === "unavailable" && <NotAvailable onReady={setSlideIn} state={sessionStatus} />}
      </form>
    </div>
  );
};

export default Client;
