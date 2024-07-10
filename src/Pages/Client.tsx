import { useCallback, useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import cn from "classnames";

import {
  bindAllSettingsToValues,
  useClientState,
  useGuideState,
  getLinkData,
  CLIENT_STATES,
  useUnloadHandler,
  useFullscreenHandler
} from "../lib";
import { ClientLogin, Display, PageMissing } from "../components";
import { ReactComponent as Logo } from "../assets/daisy-logo.svg"
import Styles from "./Client.module.scss";

const Client = () => {
  const { preset, clientLink, setClientLink, status, setStatus, setGuide, setLocalPriority } = useClientState(state => state);
  const { setActivePreset } = useGuideState(state => state);

  const clientStatus = CLIENT_STATES[status];

  const [clientLinkAvailable, setClientLinkAvailable] = useState(null);
  const [authorized, setAuthorized] = useState(clientStatus === "active");
  const [slideIn, setSlideIn] = useState(false);

  useUnloadHandler();
  useFullscreenHandler(authorized);

  const findGuide = useCallback(async () => {
    bindAllSettingsToValues();
    if (clientStatus === "unavailable") {
      setStatus(1);
    }
  }, [setStatus, clientStatus]);

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
      getLinkData("status", setStatus);
      getLinkData("guide", setGuide);
      setTimeout(setLocalPriority.bind(null, false), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientLink]);

  useEffect(() => {
    setAuthorized(clientStatus === "active");
  }, [clientStatus]);

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
