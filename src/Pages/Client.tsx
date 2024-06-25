import { useCallback, useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash';
import cn from "classnames";

import { bindAllSettingsToValues } from "../lib/guideStore";
import { useClientState } from '../lib/clientState';
import { useGuideState } from "../lib/guideState";
import { Alert, Button, Display, Row, Textfield } from "../components";
import { bindEvent } from '../lib/utils';
import { ReactComponent as Logo } from "../assets/daisy-logo.svg"
import Styles from "./Client.module.scss";
import { getClientData } from '../lib/clientStore';

const Guide = () => {
  const { preset, clientLink, setClientLink, status, setStatus, username, setUsername } = useClientState(state => state);
  const { setActivePreset } = useGuideState(state => state);
  const bindList = useRef<BindParams[]>();
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  const [cta, setCta] = useState("Join");
  const [slideIn, setSlideIn] = useState(false);
  const [nickname, setNickname] = useState(username)
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState<string | null>();
  const [alertVariant, setAlertVariant] = useState("standard");

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

  const findGuide = useCallback(async () => {
    bindAllSettingsToValues();
    if (!status) {
      setStatus(1);
    }
  }, [status, setStatus]);

  const exit = useCallback(() => {
    setStatus(0);
  }, []);

  const reset = (delay: number = 0) => {
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setStatus(1);
      setMessage(null);
    }, delay);
  };

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
  }, [status]);

  const bindEvents = useCallback(() => {
    bindList.current = [
      { event: 'beforeunload', element: window, handler: exit},
      { event: 'unload', element: window, handler: exit},
    ];

    bindList.current.forEach(bindEvent);
  }, [setStatus, exit]);

  useEffect(() => {
    updateCta();
  }, [status]);

  useEffect(() => {
    if (!isEmpty(preset)) {
      setActivePreset(preset);
      findGuide();
    }
  }, [findGuide, preset, setActivePreset]);

  useEffect(() => {
    if (!isEmpty(clientLink)) {
      getClientData("status", setStatus);
    }
  }, [clientLink]);

  useEffect(() => {
    setClientLink();
    bindEvents();
    setSlideIn(true);
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
    </div>
  );
};

export default Guide;
