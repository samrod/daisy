import { useCallback, useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash';
import cn from "classnames";

import {
  bindAllSettingsToValues,
  useClientState,
  useGuideState,
  getClientData,
  bindEvent
} from "../lib";
import { Alert, Button, Display, Row, Textfield } from "../components";
import { ReactComponent as Logo } from "../assets/daisy-logo.svg"
import Styles from "./Client.module.scss";

const ClientLogin = ({ setAuthorized, slideIn, onReady }) => {
  const { status, setStatus, username, setUsername } = useClientState(state => state);

  const [cta, setCta] = useState("Join");
  const [nickname, setNickname] = useState(username)
  const [message, setMessage] = useState<string | null>();
  const [alertVariant, setAlertVariant] = useState("standard");

  const bindList = useRef<BindParams[]>();
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  const onCancel = useCallback((e) => {
    e.preventDefault();
    setStatus(5);
  }, [setStatus]);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    setStatus(2);
    setUsername(nickname);
  }, [setStatus, nickname, setUsername]);

  const onChange = useCallback(({ target }) => {
    setNickname(target.value);
  }, []);

  const reset = useCallback((delay: number = 0) => {
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setStatus(1);
      setMessage(null);
    }, delay);
  }, [setStatus]);

  const exit = useCallback(() => {
    setStatus(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCta = useCallback(() => {
    switch (status) {
      case 1:
        clearTimeout(resetTimer.current);
        setCta("Join");
        setAuthorized(false);
        break;
      case 2:
        setMessage(null);
        setCta("Waiting...");
        reset(300000);
        break;
      case 3:
        clearTimeout(resetTimer.current);
        setMessage("Authorized");
        setAlertVariant("success");
        setCta("Joined");
        setTimeout(setAuthorized.bind(null, true), 3000);
        break;
      case 4:
        setCta("Join");
        reset();
        setMessage("Your guide is not ready.");
        setAlertVariant("standard");
        reset(10000);
        break;;
      case 5:
        setMessage("Your guide ended your session.");
        setAlertVariant("standard");
        setAuthorized(false);
        setCta("Join");
        reset(30000);
    }
  }, [status, reset, setAuthorized]);

  const bindEvents = useCallback(() => {
    bindList.current = [
      { event: 'beforeunload', element: window, handler: exit},
      { event: 'unload', element: window, handler: exit},
    ];

    bindList.current.forEach(bindEvent);
  }, [exit]);

  useEffect(() => {
    updateCta();
  }, [status, updateCta]);

  useEffect(() => {
    bindEvents();
    onReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={cn("step2 slider", { slideIn })}>
        <h2>Welcome</h2>
      </div>
      <form onSubmit={onSubmit}>
        <div className={cn("step3 slider", { slideIn })}>
          <Alert size="sm" persist variant={alertVariant} klass="my-0">{message}</Alert>
          <Textfield
            type="text"
            value={nickname}
            onChange={onChange}
            autoComplete="off"
            placeholder="Pick a username"
            maxLength={30}
            autoFocus
            size="lg"
            stretch
            name="username"
          />
        </div>
        <Row justify="between" klass={cn("step4 slider", { slideIn })}>
          {status === 2 && (
            <Button variant="success" value="Cancel" onClick={onCancel} />
          )}
          <Button
            type="submit"
            value={cta}
            onClick={onSubmit}
            disabled={isEmpty(nickname)}
            stretch={status!==2}
            loading={status===2}
          />
        </Row>
      </form>
    </>
  );
}

const LinkMissing = ({ slideIn, onReady }) => {
  useEffect(() => {
    setTimeout(onReady.bind(null, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className={cn("step2 slider", { slideIn })}>
        <h2>This page is not available</h2>
      </div>
      <Row className={cn("step3 slider", { slideIn })}>
        <h5>Check with your guide for the right link.</h5>
      </Row>
    </>
  )
}

const Guide = () => {
  const { preset, clientLink, setClientLink, status, setStatus } = useClientState(state => state);
  const { setActivePreset } = useGuideState(state => state);

  const [clientLinkAvailable, setClientLinkAvailable] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  const findGuide = useCallback(async () => {
    bindAllSettingsToValues();
    if (!status) {
      setStatus(1);
    }
  }, [status, setStatus]);

  useEffect(() => {
    if (preset === null) {
      return;
    }
    if (!isEmpty(preset)) {
      setClientLinkAvailable("available");
      setActivePreset(preset);
      findGuide();
    } else {
      setTimeout(setClientLinkAvailable.bind(null, "unavailable"));
    }
  }, [findGuide, preset, setActivePreset]);

  useEffect(() => {
    if (!clientLinkAvailable) {
      getClientData("status", setStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientLink]);

  useEffect(() => {
    setClientLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authorized) {
    return (
      <Display />
    );
  }
  return (
    <div className={Styles.page}>
      <div className={cn("step1 slider", { slideIn })}>
        <Logo className={Styles.logo} />
      </div>
      {clientLinkAvailable === "available" && <ClientLogin slideIn={slideIn} onReady={setSlideIn} setAuthorized={setAuthorized} />}
      {clientLinkAvailable === "unavailable" && <LinkMissing slideIn={slideIn} onReady={setSlideIn} />}
    </div>
  );
};

export default Guide;
