import { useCallback, useEffect, useRef, useState } from 'react';
import cn from "classnames";

import { CLIENT_STATES, useUnloadHandler, useFullscreenHandler, useSessionCheck, useRehydrate, } from "lib";
import { subscribeAllSettings, useClientState, useGuideState, createClient, createSession, getLinkData, useSessionState, useLinkState } from 'state';
import { ClientLogin, Clouds, Display, NotAvailable } from "components";
import { Logo } from "assets"
import Styles from "./Client.module.scss";

const cloudSettings = [
  { offset: -5, scaleX: 1.5 },
  { offset: 90, scaleY: 0.5 },
];

const Client = () => {
  const { uid, preset, status, username, clientLink, setUsername, setClientLink, setStatus, setGuide, setLocalPriority } = useClientState(state => state);
  const { sessionStatus, setLocalSession, setUpdatedAt } = useSessionState(state => state);
  const { setActivePreset } = useGuideState(state => state);
  const { settings } = useLinkState(state => state);
  const [nickname, setNickname] = useState(username)
  const [slideIn, setSlideIn] = useState(false);
  const sessionBusyRef = useRef<boolean>();

  const clientStatus = CLIENT_STATES[status];

  useRehydrate();
  useSessionCheck();
  useUnloadHandler();
  useFullscreenHandler(clientStatus === "active");

  const findGuide = useCallback(async () => {
    await subscribeAllSettings();
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
        setUsername(null);
        break;
      case "authorized":
        setStatus(7);
        break;
    }
  }, [clientStatus, nickname, setStatus, setLocalSession, setUsername]);

  useEffect(() => {
    if (preset === null) {
      return;
    }
    if (sessionStatus === "available") {
      if (clientStatus === "active") {
        createClient();
        createSession();
      }
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
      <Display settings={settings} />
    );
  }

  return (
    <div className={Styles.page}>
      <Clouds delay={3} cloudData={cloudSettings} />
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
