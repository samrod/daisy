import cn from "classnames";
import { noop } from "lodash";

import { ReactElement, useCallback, useEffect, useState } from "react";
import { Button, Row } from "../";
import { useEventBinder } from "lib";
import { useGuideState } from "state";
import Styles from "./Modal.module.scss";

interface ModalProps {
  children?: ReactElement;
  title?: string;
  body?: string;
  cancel?: {
    text: string;
    action: () => void;
  };
  accept?: {
    text: string;
    action: () => void;
  };
}

const Modal = ({
  children,
  title = "",
  body = "",
  cancel = { text: "Cancel", action: noop },
  accept,
}: ModalProps) => {
  const { modalActive, setModalActive } = useGuideState(state => state);
  const [_visible, setVisible] = useState(false);
  const [_invisible, setInvisible] = useState(false);
  const [exists, setExists] = useState(false);

  const onCancel = useCallback(() => {
    setModalActive(false);
    cancel.action();
  }, [setModalActive, cancel]);

  const show = useCallback(() => {
    setVisible(modalActive);
  }, [modalActive]);

  const kill = useCallback(() => {
    setExists(modalActive);
  }, [modalActive]);

  const onKeydown = useCallback(({ key }: KeyboardEvent) => {
    switch (key) {
      case "Escape":
        onCancel();
        break;
      case "Enter":
        accept.action();
        break;
    }
  }, [accept, onCancel]);

  useEffect(() => {
    if (!modalActive) {
      setInvisible(true);
      setTimeout(kill, 1000);
      setTimeout(show, 1000);
    } else {
      setExists(true);
      setInvisible(false);
      setTimeout(show, 100);
    }
  }, [modalActive, kill, show]);

  useEventBinder([{ event: "keydown", element: window, handler: onKeydown }], [cancel.action, onKeydown]);

  if (!exists) {
    return null;
  }

  if (children) {
    return (
      <div className={cn(Styles.modal, { _visible, _invisible })}>
        {title && <Modal.Head>{title}</Modal.Head>}
        {children}
      </div>
    );
  };

  return (
    <div className={cn(Styles.modal, { _visible, _invisible })}>
        <Modal.Body>
          <h3>{title}</h3>
          <p>{body}</p>
        </Modal.Body>
        <Modal.Foot>
          <Row justify="between">
            {cancel && <Button value={cancel.text} onClick={onCancel} autoFocus={true} />}
            <Button value={accept.text} variant="success" onClick={accept.action} />
          </Row>
        </Modal.Foot>
    </div>
  );
};

Modal.Head = ({ children }) => {
  return (
    <h4 className={Styles.head}>{children}</h4>
  );
};

Modal.Body = ({ children }) => {
  return (
    <div className={Styles.body}>
      {children}
    </div>
  );
};

Modal.Foot = ({ children }) => {
  return (
    <div className={Styles.foot}>
      {children}
    </div>
  );
};

export interface ModalStateProps {
  title: string;
  body: string;
  cancel: {
    text: string;
    action: string | (() => void);
  };
  accept: {
    text: string;
    action: string | (() => void);
  }
}

export interface ModalStateType extends Omit<ModalProps, 'cancel' | 'accept'> {
  cancel?: {
    text: string;
    action: string[];
  };
  accept?: {
    text: string;
    action: string[];
  };
}

export const modalActionsCallback = modalActions => (message: string[]): (() => void) | undefined => {
  if (Array.isArray(message)) {
    const [action, ...params] = message;
    const modalAction = modalActions[action];
    if (modalAction) {
      return modalAction.bind(null, ...params);
    }
  }
};

const defaultModalState: ModalProps = {
  title: "",
  body: "",
  cancel: {
    text: "",
    action: noop,
  },
  accept: {
    text: "",
    action: noop,
  },
};

const singleButtonModalState = {
  title: "",
  body: "",
  accept: {
    text: "",
    action: noop,
  },
};

export { Modal, defaultModalState, singleButtonModalState };
