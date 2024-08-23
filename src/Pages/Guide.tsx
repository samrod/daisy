import { useCallback, useEffect, useRef, useState } from "react";
import { debounce, isEmpty } from "lodash";
import cn from "classnames";

import { limits, receiveMessage, setKeys, useEventBinder } from "lib";
import { useGuideState, useClientState, getLinkData, useLinkState, deletePreset } from "state";
import { defaultModalState, Display, Modal, modalActionsCallback, ModalStateType } from "components";
import Styles from "./Guide.module.scss";

interface ModalActions {
  [key: string]: (...args: any[]) => void
}
const Guide = () => {
  const { userMode, clientStatus, clientName, user, setClientStatus, setClientName } = useGuideState(state => state);
  const { settings, clientLink, setActiveSetting } = useLinkState(state => state);
  const { setStatus, setGuide } = useClientState(state => state);
  
  const [hidden, setHidden] = useState(true);
  const [modalActive, setModalActive] = useState(false);
  const [modal, setModal] = useState(defaultModalState);

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
      cancel: {
        ...cancel,
        action: modalActionsCallback(modalActions.current)(cancel.action),
      },
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

    onCancelEndSessionModal: useCallback(() => {
      setModalActive(false);
    }, [setModalActive]),

    onEndClientSession: useCallback(() => {
      setStatus(5);
      setModalActive(false);
    }, [setStatus]),

    onCancelPresetAction: useCallback(() => {
      console.log("** deny delete/update preset: ");
      setModalActive(false);
    }, []),

    onConfirmDeletePreset: useCallback((id) => {
      console.log("** confirm delete preset: ", id);
      deletePreset(id);
      setModalActive(false);
    }, []),

    onConfirmUpdatePreset: useCallback((id) => {
      console.log("** confirm update preset: ", id);
      setModalActive(false);
    }, []),
  };

  useEffect(() => {
    setModalActive(clientStatus === 2);
    if (clientStatus === 2) {
      showJoinRequestModal();
    }
  }, [clientStatus, clientName, showJoinRequestModal]);

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

  return (
    <Display settings={settings}>
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
