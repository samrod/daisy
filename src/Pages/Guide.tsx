import { useCallback, useEffect, useRef, useState } from "react";
import { isEmpty } from "lodash";
import cn from "classnames";

import { limits, receiveMessage, setKeys, useEventBinder } from "lib";
import { useGuideState, useClientState, getLinkData } from "state";
import { defaultModalState, Display, Modal } from "components";
import Styles from "./Guide.module.scss";

const Guide = () => {
  const { userMode, clientLink, clientStatus, clientName, user, setActiveSetting, setClientStatus, setClientName } = useGuideState(state => state);
  const { setStatus, setGuide } = useClientState(state => state);
  
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

  const setClientStates = useCallback((data) => {
    if (!data) {
      return;
    }
    toggleToolbar();
    const { status, username } = data;
    if (username) {
      setClientStatus(status);
      setClientName(username, false);
    }
  }, [setClientName, toggleToolbar, setClientStatus]);

  const onDenyClientRequest = useCallback(() => {
    setStatus(4);
  }, [setStatus]);

  const onAcceptClientRequest = useCallback(() => {
    setGuide(user.uid);
    setStatus(3);
  }, [user, setGuide, setStatus]);

  const onCancelEndSessionModal = useCallback(() => {
    setModalActive(false);
  }, [setModalActive]);

  const onEndClientSession = useCallback(() => {
    setStatus(5);
    setModalActive(false);
  }, [setStatus]);

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
  }, [clientName, onEndClientSession, onCancelEndSessionModal]);

  const showJoinRequestModal = useCallback(() => {
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
  }, [clientName, onAcceptClientRequest, onDenyClientRequest]);

  useEffect(() => {
    setModalActive(clientStatus === 2);
    showJoinRequestModal();
  }, [clientStatus, clientName, showJoinRequestModal]);

  useEffect(() => {
    clientLinkRef.current = clientLink;
    if (!isEmpty(clientLink)) {
      getLinkData("", setClientStates);
    }
  }, [clientLink, setClientStatus, setClientStates]);

  useEventBinder(
    [
      { event: 'mouseout', element: toolbar.current, handler: setToolbarFree },
      { event: 'mouseover', element: toolbar.current, handler: setToolbarBusy },
      { event: 'mousemove', element: document.body, handler: toggleToolbar },
      { event: 'message', element: window, handler: receiveMessage.bind({ setKeys, setActiveSetting, showEndSessionModal }) },
    ],
    [setActiveSetting, toggleToolbar, toolbar.current]
  );

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
