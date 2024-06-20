import cn from "classnames";

import Styles from "./Modal.module.scss";
import { useEffect, useState } from "react";

const Modal = ({ children, title = "", active = false }) => {
  const [_visible, setVisible] = useState(false);
  const [_invisible, setInvisible] = useState(false);
  const [exists, setExists] = useState(false);

  const show = () => {
    setVisible(active);
  };

  const kill = () => {
    setExists(active);
  }

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
  }, [active]);

  if (!exists) {
    return null;
  }

  return (
    <div className={cn(Styles.modal, { _visible, _invisible })}>
      {title && <Modal.Head>{title}</Modal.Head>}
      {children}
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

export { Modal };
