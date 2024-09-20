import { useCallback, useEffect, useRef, useState } from "react";
import { debounce, isEmpty } from "lodash";
import cn from "classnames";

import { limits, receiveMessage, setKeys, useEventBinder } from "lib";
import { useGuideState, useClientState, getLinkData, useLinkState, deletePreset, updatePresetFromClientLink } from "state";
import { defaultModalState, Display, Modal, modalActionsCallback, ModalStateType } from "components";
import Styles from "./Guide.module.scss";
import { useAuth } from "context/AuthContext";

interface ModalActions {
  [key: string]: (...args: any[]) => void
}

const Guide = () => {
  const { userMode, clientStatus, clientName, user, setModalActive, setInitialValues, setClientStatus, setClientName } = useGuideState(state => state);
  const { settings, clientLink, setActiveSetting } = useLinkState(state => state);
  const { setStatus, setGuide } = useClientState(state => state);
  const { logout } = useAuth();

  const [modal, setModal] = useState(defaultModalState);
  const [hidden, setHidden] = useState(true);

  const toolbarBusy = useRef(false);
  const toolbarTimer = useRef<NodeJS.Timeout | number>();
  const toolbar = useRef<HTMLIFrameElement>();
  const clientLinkRef = useRef(clientLink);
  const linkDataBound = useRef(false);
  const modalActions = useRef<ModalActions>({});
  
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
    }
    if (!toolbarBusy.current) {
      toolbarTimer.current = setTimeout(setHidden.bind(null, true), limits.toolbarHideDelay);
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

  const showModal = useCallback(({ cancel, accept, ...modalData }: ModalStateType) => {
    setModalActive(true);
    setModal({
      ...modalData,
      cancel: cancel ? {
        ...cancel,
        action: modalActionsCallback(modalActions.current)(cancel.action),
      } : undefined,
      accept: {
        ...accept,
        action: modalActionsCallback(modalActions.current)(accept.action),
      },
    });
  }, [setModalActive, setModal]);

  const showJoinRequestModal = useCallback(() => {
    showModal({
      title: `Request from ${clientName}`,
      body: `Allow ${clientName} to join this session?`,
      cancel: {
        text: "Deny",
        action: ["onDenyClientRequest"],
      },
      accept: {
        text: "Allow",
        action: ["onAcceptClientRequest"],
      },
    });
  }, [clientName, showModal]);

  modalActions.current = {
    onDenyClientRequest: useCallback(() => {
      setStatus(4);
    }, [setStatus]),

    onAcceptClientRequest: useCallback(() => {
      setGuide(user.uid);
      setStatus(3);
    }, [user, setGuide, setStatus]),

    onEndClientSession: useCallback(() => {
      setStatus(5);
      setModalActive(false);
    }, [setStatus, setModalActive]),

    onConfirmDeletePreset: useCallback(async (id) => {
      await deletePreset(id);
      setModalActive(false);
    }, [setModalActive]),

    onConfirmUpdatePreset: useCallback(async (id) => {
      await updatePresetFromClientLink(id);
      setModalActive(false);
    }, [setModalActive]),

    logout,
  };

  useEffect(() => {
    setModalActive(clientStatus === 2);
    if (clientStatus === 2) {
      showJoinRequestModal();
    }
  }, [clientStatus, clientName, setModalActive, showJoinRequestModal]);

  useEffect(() => {
    clientLinkRef.current = clientLink;
    if (!isEmpty(clientLink) && !linkDataBound.current) {
      getLinkData("", setClientStates);
      linkDataBound.current = true;
    }
  }, [clientLink, setClientStatus, setClientStates]);

  useEventBinder(
    [
      { event: 'mouseout', element: toolbar.current, handler: setToolbarFree },
      { event: 'mouseover', element: toolbar.current, handler: setToolbarBusy },
      { event: 'mousemove', element: document.body, handler: debounce(toggleToolbar, 250, { leading: true }) },
      { event: 'message', element: window, handler: receiveMessage.bind({ setKeys, setActiveSetting, showModal }) },
    ],
    [setActiveSetting, toggleToolbar, toolbar.current]
  );

  useEffect(() => {
    setInitialValues();
  }, [setInitialValues]);

  return (
    <Display settings={settings}>
      <Modal {...modal} />

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
