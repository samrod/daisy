import { useCallback, useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash';

import { useUnloadHandler, CLIENT_STATES } from "lib";
import { useClientState, endSession } from '../state';
import { Alert, Button, Row, Textfield } from "../components";

const UNAVAILABLE_STATES = {
  "unavailable": {
    title: "This page is not available",
    body: "Check with your guide for the right link.",
  },
  "busy": {
    title: "Link busy.",
    body: "There's an active session at this link. Please try later."
  }
}

export const NotAvailable = ({ onReady, state }) => {
  const copy = useRef(UNAVAILABLE_STATES[state])
  useEffect(() => {
    setTimeout(onReady.bind(null, true));
    onReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!state) {
    return;
  }
  return (
    <>
      <div className="step">
        <h4>{copy.current.title}</h4>
      </div>
      <Row className="step">
        <h5>{copy.current.body}</h5>
      </Row>
    </>
  )
};

export const ClientLogin = ({ onReady, onSubmit, nickname, setNickname }) => {
  const { status, setStatus } = useClientState(state => state);

  const [cta, setCta] = useState("Join");
  const [message, setMessage] = useState<string | null>();
  const [alertVariant, setAlertVariant] = useState("standard");

  const resetTimer = useRef<ReturnType<typeof setTimeout>>();
  const clientStatus = CLIENT_STATES[status];

  useUnloadHandler();

  const onCancel = useCallback((e) => {
    e.preventDefault();
    setStatus(6);
  }, [setStatus]);

  const onChange = useCallback(({ target }) => {
    setNickname(target.value);
  }, [setNickname]);

  const reset = useCallback((delay: number = 0) => {
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setStatus(1);
      setMessage(null);
    }, delay);
  }, [setStatus]);

  const onStateUpdate = useCallback(() => {
    switch (clientStatus) {
      case "unavailable":
        clearTimeout(resetTimer.current);
        setCta("Join");
        break;
      case "present":
        setCta("Join");
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
        setCta("Rejoin");
        endSession(true);
        reset(30000);
        break;;
      case "cancelled":
        setMessage("Request cancelled.");
        setCta("Join");
        reset(5000);
        break;
      case "expired":
        setMessage("Your session expired due to inactivity.");
        endSession();
        reset(5000);
        break;
    }
  }, [clientStatus, reset]);

  useEffect(() => {
    onStateUpdate();
    onReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <>
      <div className="step">
        <h2>Welcome</h2>
      </div>
      <div className="step">
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
      <Row justify="between" klass="step">
        {status === 2 && (
          <Button variant="success" value="Cancel" onClick={onCancel} />
        )}
        <Button
          type="submit"
          value={cta}
          onClick={onSubmit}
          variant={status === 3 ? "success" : "standard"}
          disabled={isEmpty(nickname)}
          stretch={status !== 2}
          loading={status === 2}
        />
      </Row>
    </>
  );
}
