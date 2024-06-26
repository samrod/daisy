import cn from "classnames";
import { noop } from "lodash";

import Styles from "./Modal.module.scss";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { Button, Row } from "../";
import { bindEvent, unbindEvent } from "../../lib";

interface ModalProps {
  children?: ReactElement;
  title?: string;
  body?: string;
  active: boolean;
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
  cancel,
  accept,
  active = false,
}: ModalProps) => {
  const [_visible, setVisible] = useState(false);
  const [_invisible, setInvisible] = useState(false);
  const [exists, setExists] = useState(false);

  const show = useCallback(() => {
    setVisible(active);
  }, [active]);

  const kill = useCallback(() => {
    setExists(active);
  }, [active]);

  const onKeydown = useCallback(({ key }: KeyboardEvent) => {
    switch (key) {
      case "Escape":
        cancel.action();
        break;
      case "Enter":
        accept.action();
        break;
    }
  }, [cancel, accept]);

  useEffect(() => {
    if (!active) {
      setInvisible(true);
      setTimeout(kill, 1000);
      setTimeout(show, 1000);
    } else {
      setExists(true);
      setInvisible(false);
      setTimeout(show, 100);
    }
  }, [active, kill, show]);

  useEffect(() => {
    if (!cancel) {
      return;
    }
    if (cancel.action) {
      bindEvent({ event: "keydown", element: window, handler: onKeydown });
    }
    return () => {
      unbindEvent({ event: "keydown", element: window, handler: onKeydown });
    };
}, [cancel, onKeydown]);

  useEffect(() => window.focus(), []);

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
  }

  return (
    <div className={cn(Styles.modal, { _visible, _invisible })}>
        <Modal.Body>
          <h3>{title}</h3>
          <p>{body}</p>
        </Modal.Body>
        <Modal.Foot>
          <Row justify="between">
            {cancel && <Button value={cancel.text} onClick={cancel.action} />}
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

const defaultModalState = {
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
