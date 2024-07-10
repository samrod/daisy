import { useCallback, useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash';
import cn from "classnames";

import { useClientState, useUnloadHandler, CLIENT_STATES } from "../lib";
import { Alert, Button, Row, Textfield } from "../components";

export const PageMissing = ({ slideIn, onReady }) => {
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
};

export const ClientLogin = ({ setAuthorized, slideIn, onReady }) => {
  const { status, setStatus, username, setUsername } = useClientState(state => state);

  const [cta, setCta] = useState("Join");
  const [nickname, setNickname] = useState(username)
  const [message, setMessage] = useState<string | null>();
  const [alertVariant, setAlertVariant] = useState("standard");

  const resetTimer = useRef<ReturnType<typeof setTimeout>>();
  const clientStatus = CLIENT_STATES[status];

  useUnloadHandler();

  const onCancel = useCallback((e) => {
    e.preventDefault();
    setStatus(6);
  }, [setStatus]);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    switch (clientStatus) {
      case "unavailable":
      case "present":
      case "denied":
      case "done":
        setStatus(2);
        setUsername(nickname);
        break;
      case "authorized":
        setStatus(7);
        break;
    }
  }, [clientStatus, setStatus, nickname, setUsername]);

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

  const updateCta = useCallback(() => {
    switch (clientStatus) {
      case "unavailable":
        clearTimeout(resetTimer.current);
        setCta("Join");
        setAuthorized(false);
        break;
      case "waiting":
        setMessage(null);
        setCta("Waiting...");
        reset(300000);
        break;
      case "authorized":
        clearTimeout(resetTimer.current);
        setMessage("Your request to join has been accepted");
        setAlertVariant("success");
        setCta("Enter Session");
        break;
      case "denied":
        setCta("Join");
        reset();
        setMessage("Your guide is not ready.");
        setAlertVariant("standard");
        reset(10000);
        break;;
      case "done":
        setMessage("Your guide ended your session.");
        setAlertVariant("standard");
        setAuthorized(false);
        setCta("Rejoin");
        reset(30000);
        break;;
      case "cancelled":
        setMessage("Request cancelled.");
        setCta("Join");
        reset(5000);
        break;;
    }
  }, [clientStatus, reset, setAuthorized]);

  useEffect(() => {
    updateCta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
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
            variant={status === 3 ? "success" : "standard"}
            disabled={isEmpty(nickname)}
            stretch={status!==2}
            loading={status===2}
          />
        </Row>
      </form>
    </>
  );
}
