import { useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import { useGuideState } from "../lib/guideState";
import { Display } from "../components";
import { limits } from '../lib/constants';
import { bindEvent, receiveMessage, setKeys, unbindEvent } from '../lib/utils';

const Guide = () => {
  const State = useGuideState(state => state);
  const { userMode, setActiveSetting } = State;
  
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

  useEffect(() => {
    bindEvents();
    return unbindEvents;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Display>
      <iframe
        ref={toolbar}
        src="./remote"
        name="remote"
        title="remote"
        className={cn('toolbar', { hidden, userMode })}
      />
    </Display>
  );
};

export default Guide;
