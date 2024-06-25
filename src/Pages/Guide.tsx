import { useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { isEmpty } from 'lodash';

import { defaultModalState, Display, Modal } from "../components";
import { limits } from '../lib/constants';
import { bindEvent, receiveMessage, setKeys, unbindEvent } from '../lib/utils';
import { useGuideState } from "../lib/guideState";
import { useClientState } from "../lib/clientState";
import { getUserData } from '../lib/guideStore';
import { getClientData } from '../lib/clientStore';
import Styles from "./Guide.module.scss";

const Guide = () => {
  const State = useGuideState(state => state);
  const { setStatus, setUsername, } = useClientState(state => state);
  const { userMode, setActiveSetting, clientLink, setClientLink, clientStatus, setClientStatus, clientName, setClientName } = State;
  
  const [hidden, setHidden] = useState(true);
  const [modalActive, setModalActive] = useState(false);
  const [modal, setModal] = useState(defaultModalState);

  const initialized = useRef(false);
  const toolbarBusy = useRef(false);
  const toolbarTimer = useRef<NodeJS.Timeout | number>();
  const toolbar = useRef<HTMLIFrameElement>();
  const bindList = useRef<BindParams[]>();
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
    if (!hidden) {
      return;
    } else {
      setHidden(false);
    }
    if (!toolbarBusy.current) {
      toolbarTimer.current = setTimeout(() => {
        setHidden(true);
      },
      limits.toolbarHideDelay
      );
    }
  }, [hidden]);

  const bindEvents = useCallback(() => {
    bindList.current = [
      { event: 'mouseout', element: toolbar.current, handler: setToolbarFree },
      { event: 'mouseover', element: toolbar.current, handler: setToolbarBusy },
      { event: 'mousemove', element: document.body, handler: toggleToolbar },
      { event: 'message', element: window, handler: receiveMessage.bind({ setKeys, setActiveSetting, showEndSessionModal }) },
    ];
  
    if (toolbar.current && !initialized.current) {
      bindList.current.forEach(bindEvent);
    }
    initialized.current = true;
  }, [setActiveSetting, toggleToolbar]);

  const unbindEvents = useCallback(() => {
    bindList.current.forEach(unbindEvent);
  }, [bindList]);

  const setClientStates = ({ status, username }) => {
    setClientStatus(status);
    setClientName(username);
  };

  const onDenyClientRequest = useCallback(() => {
    setStatus(4, clientLink);
  }, [clientLink]);

  const onAcceptClientRequest = useCallback(() => {
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
    setHidden(false);
    setModalActive(clientStatus === 2);
    showJoinRequestModal();
  }, [clientStatus, clientName]);

  useEffect(() => {
    clientLinkRef.current = clientLink;
    if (!isEmpty(clientLink)) {
      getClientData("", setClientStates);
    }
  }, [clientLink]);

  useEffect(() => {
    bindEvents();
    getUserData("clientLink", setClientLink);
    return unbindEvents;
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
