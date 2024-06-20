import { useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { isEmpty } from 'lodash';

import { useGuideState } from "../lib/guideState";
import { useClientState } from "../lib/clientState";
import { Button, Display, Modal, Row } from "../components";
import { limits } from '../lib/constants';
import { bindEvent, receiveMessage, setKeys, unbindEvent } from '../lib/utils';
import Styles from "./Guide.module.scss";
import { getUserData } from '../lib/guideStore';
import { getClientData } from '../lib/clientStore';

const Guide = () => {
  const State = useGuideState(state => state);
  const { setStatus, } = useClientState(state => state);
  const { userMode, setActiveSetting, clientLink, setClientLink, clientStatus, setClientStatus, clientName, setClientName } = State;
  
  const [hidden, setHidden] = useState(true);

  const initialized = useRef(false);
  const toolbarBusy = useRef(false);
  const toolbarTimer = useRef<NodeJS.Timeout | number>();
  const toolbar = useRef<HTMLIFrameElement>();
  const bindList = useRef<BindParams[]>();
  
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
      { event: 'message', element: window, handler: receiveMessage.bind({ setKeys, setActiveSetting }) },
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

  const onDenyClientRequest = () => {
    setStatus(4, clientLink);
  };

  const onAcceptClientRequest = () => {
    setStatus(3, clientLink);
  };

  useEffect(() => {
    setHidden(false);
  }, [clientStatus]);

  useEffect(() => {
    if (!isEmpty(clientLink)) {
      getClientData("", setClientStates);
    }
  }, [clientLink]);

  useEffect(() => {
    bindEvents();
    getUserData("clientLink",setClientLink);
    return unbindEvents;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Display>
      <Modal active={clientStatus === 2}>
        <Modal.Body>
          <h3>Request from {clientName}</h3>
          <p>Allow {clientName} to join this session?</p>
        </Modal.Body>
        <Modal.Foot>
          <Row justify="between">
            <Button value="Deny" onClick={onDenyClientRequest} />
            <Button value="Allow" variant="success" onClick={onAcceptClientRequest} />
          </Row>
        </Modal.Foot>
      </Modal>

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
