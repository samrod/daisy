import { useCallback, useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import cn from "classnames";

import {
  bindAllSettingsToValues,
  useClientState,
  useGuideState,
  getClientData,
  enterFullscreen,
  exitFullscreen,
  CLIENT_STATES
} from "../lib";
import { ClientLogin, Display, PageMissing } from "../components";
import { ReactComponent as Logo } from "../assets/daisy-logo.svg"
import Styles from "./Client.module.scss";

const Client = () => {
  const { preset, clientLink, setClientLink, status, setStatus } = useClientState(state => state);
  const { setActivePreset } = useGuideState(state => state);

  const [clientLinkAvailable, setClientLinkAvailable] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const clientStatus = CLIENT_STATES[status];

  const findGuide = useCallback(async () => {
    bindAllSettingsToValues();
    if (clientStatus === "unavailable") {
      setStatus(1);
    }
  }, [setStatus]);

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
    if (clientStatus === "done") {
      setAuthorized(false);
    }
  }, [clientStatus]);

  useEffect(() => {
    if (authorized) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [authorized]);

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
      {clientLinkAvailable === "unavailable" && <PageMissing slideIn={slideIn} onReady={setSlideIn} />}
    </div>
  );
};

export default Client;
