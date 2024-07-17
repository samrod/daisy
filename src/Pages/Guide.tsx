import { useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { isEmpty } from 'lodash';

import {
  limits,
  receiveMessage,
  setKeys,
  useGuideState,
  useClientState,
  getGuideData,
  getLinkData,
  pushSessionData,
  useEventBinder,
} from "../lib";
import { defaultModalState, Display, Modal } from "../components";
import Styles from "./Guide.module.scss";

const Guide = () => {
  const State = useGuideState(state => state);
  const { setStatus, setUsername, setGuide } = useClientState(state => state);
  const { userMode, setActiveSetting, clientLink, setClientLink, clientStatus, setClientStatus, clientName, setClientName, user } = State;
  
  const [hidden, setHidden] = useState(true);
  const [modalActive, setModalActive] = useState(false);
  const [modal, setModal] = useState(defaultModalState);

  const toolbarBusy = useRef(false);
  const toolbarTimer = useRef<NodeJS.Timeout | number>();
  const toolbar = useRef<HTMLIFrameElement>();
  const clientLinkRef = useRef(clientLink);
  
  const setToolbarBusy = () => {
    toolbarBusy.current = true;
    clearTimeout(toolbarTimer.current);
  };

  const setToolbarFree = () => {
    setTimeout(() => {
      toolbarBusy.current = false;
    }, 50);
  };

  const toggleToolbar = useCallback(() => {
    clearTimeout(toolbarTimer.current);
    if (hidden) {
      setHidden(false);
    } else {
      if (!toolbarBusy.current) {
        toolbarTimer.current = setTimeout(() => {
          setHidden(true);
        },
        limits.toolbarHideDelay
        );
      }
    }
  }, [hidden]);

  const setClientStates = ({ status, username }) => {
    setClientStatus(status);
    setClientName(username);
  };

  const onDenyClientRequest = useCallback(() => {
    setStatus(4, clientLink);
  }, [clientLink]);

  const onAcceptClientRequest = useCallback(() => {
    setGuide(user.uid);
    setStatus(3, clientLink);
  }, [clientLink]);

  const onCancelEndSessionModal = () => {
    setModalActive(false);
  };

  const onEndClientSession = useCallback(() => {
    setStatus(5, clientLinkRef.current);
    setUsername("");
    setModalActive(false);
  }, []);

  const showEndSessionModal = useCallback(() => {
    setModalActive(true);
    setModal({
      title: `End ${clientName}'s session`,
      body: `Are you sure you want to end this session with ${clientName}?`,
      cancel: {
        text: "Cancel",
        action: onCancelEndSessionModal,
      },
      accept: {
        text: "End Session",
        action: onEndClientSession,
      },
    });
  }, [clientLink, clientName, onEndClientSession, onCancelEndSessionModal]);

  const showJoinRequestModal = () => {
    setModal({
      title: `Request from ${clientName}`,
      body: `Allow ${clientName} to join this session?`,
      cancel: {
        text: "Deny",
        action: onDenyClientRequest,
      },
      accept: {
        text: "Allow",
        action: onAcceptClientRequest,
      },
    });
  };

  useEffect(() => {
    if (clientStatus === 7) {
      pushSessionData();
    }
  }, [clientStatus]);

  useEffect(() => {
    setHidden(false);
    setModalActive(clientStatus === 2);
    showJoinRequestModal();
  }, [clientStatus, clientName]);

  useEffect(() => {
    clientLinkRef.current = clientLink;
    if (!isEmpty(clientLink)) {
      getLinkData("", setClientStates);
    }
  }, [clientLink]);

  useEventBinder(
    [
      { event: 'mouseout', element: toolbar.current, handler: setToolbarFree },
      { event: 'mouseover', element: toolbar.current, handler: setToolbarBusy },
      { event: 'mousemove', element: document.body, handler: toggleToolbar },
      { event: 'message', element: window, handler: receiveMessage.bind({ setKeys, setActiveSetting, showEndSessionModal }) },
    ],
    [setActiveSetting, toggleToolbar, toolbar.current]
  );

  useEffect(() => {
    getGuideData("clientLink", setClientLink);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Display>
      <Modal active={modalActive} {...modal} />

      <iframe
        ref={toolbar}
        src="./remote"
        name="remote"
        title="remote"
        className={cn(Styles.toolbar, { hidden, userMode })}
      />
    </Display>
  );
};

export default Guide;
