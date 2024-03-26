import React, { useEffect, useState, useCallback, useRef } from 'react';
import { bindEvent, receiveMessage, sendMessage, generateSound, setKeys } from '../common/utils';
import { defaults, limits } from '../common/constants';
import { noop } from 'lodash';
import cn from 'classnames';
import './Display.scss';

const animationCallbacks = {
  length: 'updateMainAnimation',
  wave: 'updateWaveAnimation',
  size: 'updateMainAnimation',
  shape: 'updateMainAnimation',
};

const Display = () => {
  const [remoteMode, setRemoteMode] = useState(false);
  const [userMode, _setUserMode] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [settings, setSettings] = useState(defaults);
  const [motionBarActive, setMotionBarActive] = useState(false);
  const [odd, setOdd] = useState(true);

  const animatorStylesheets = useRef(['length', 'wave']);
  const PublicMethods = useRef();
  const toolbarTimer = useRef(0);
  const toolbarBusy = useRef(false);
  const callback = useRef(noop);
  const target = useRef("");
  const toolbar = useRef();
  const remote = useRef();
  const mini = useRef();
  const isMini = useRef(window.location.pathname.includes("/mini"))

  const set = useCallback(({ setting, data })  => {
    callback.current = PublicMethods.current[animationCallbacks[setting]] || noop;
    // console.log(setting, data);
    setSettings({ ...settings, [setting]: data });
  }, [settings]);

  const sendSettingsToRemote = useCallback(() => {
    if (isMini.current) {
      return false;
    }
    sendMessageToRemote({ action: "updateSettings", params: settings });
  }, [settings]);

  const sendMessageToRemote = data => {
    if (isMini.current || !toolbar.current) {
      return false;
    }
    const targetFrame = window.location.href + (remote.current ? 'remote' : 'embedded');
    const windowObj = [remote.current || toolbar.current.contentWindow];
    sendMessage(data, windowObj, targetFrame);
  };

  const displayStyle = () => {
    const { background } = settings;
    return { backgroundColor: `rgba(0,0,0,${background})` };
  };

  const targetStyle = () => {
    const { size, opacity, playing } = settings;
    return {
      width: `${size}vw`,
      height: `${size}vw`,
      opacity: opacity,
      animationName: 'bounce',
      // animationDelay: `${timeOffset}ms`,
      animationDuration: `${velocity()}ms`,
      animationTimingFunction: timingFunction(),
      animationPlayState: playing ? 'running' : 'paused',
    };
  };

  const targetClass = () => {
    const { color, shape, background } = settings;
    let newColor = color;
    if (color === 'white' && background <= .5) {
     newColor = 'black';
    }
    if (color === 'black' && background > .5) {
      newColor ='white';
    }
    return `color-${newColor} shape-${shape}`;
  };

  const containerStyle = () => {
    const { angle, length, size } = settings;
    return {
      width: `${length * 2}vw`,
      transform: `rotateZ(${angle}deg)`,
      animationDuration: `${velocity() / limits.wave.amplitude}ms`,
      borderRadius: `${size/2}vw`,
    };
  };

  const containerClass = () => {
    const { angle, activeSetting } = settings;
    let levelClass = '';
    if (motionBarActive && Number(angle) === 0 && activeSetting === 'angle') {
      levelClass = 'containerLevel';
      hapticBump();
    };
    const activeClass = motionBarActive ? 'containerActive' : '';
    return `${levelClass} ${activeClass}`;
  };

  const timingFunction = () => {
    const { steps: numString } = settings;
    const steps = Number(numString) - 1;
    if (!steps) {
      return 'ease-in-out';
    }
    const directionLimit = odd ? 'start' : 'end';
    return `steps(${steps}, ${directionLimit})`;
  };

  const velocity = () => {
    const { speed: { min, max} } = limits;
    const { speed } = settings;

    if (speed) {
      return max - speed + min;
    }
    return 1000000;
  };

  const lights = () => {
    const { steps } = settings;
    if (steps > 1) {
      return Array.apply(null, Array(Number(steps))).map(light);
    }
    return null;
  };

  const absoluteSize = useCallback(() => {
    const { shape, size } = settings;
    return shape !== 'diamond' ? size : Math.sqrt((size ** 2) * 2);
  }, [settings]);

  const distance = useCallback(() => {
    const { length } = settings;
    return length - (absoluteSize() / 2);
  }, [absoluteSize, settings]);

  const setMiniMode = useCallback(() => {
    if (isMini.current) {
      popRemote.current = noop;
      ping.current = noop;
      window.blur();
      const parent = window.open('', 'Remote');
      parent.focus();
    }
  }, []);

  const createAnimatorStylesheet = useCallback(name => {
    const styleElement = document.createElement('style');
    document.head.append(styleElement);
    animatorStylesheets.current[`${name}Styles`] = styleElement;
  }, [animatorStylesheets]);

  // const getTargetPosition = () => {
  //   targetPosition = getComputedStyle(target.current).left;
  //   if (settings.playing) {
  //     setTimeout(getTargetPosition, 1000/30);
  //   }
  // };

  const updateMainAnimation = useCallback(() => {
    const body =`
        @keyframes bounce {
          0% { left: -${distance()}vw; }
          100%  { left: ${distance()}vw; }
        }
      `;
    updateAnimation('length', body);
    sendSettingsToRemote();
  }, [distance, sendSettingsToRemote]);

  const updateWaveAnimation = useCallback(() => {
    const { wave } = settings;
    const body = `
      @keyframes wave {
        0% { top: -${wave}vh; }
        100%  { top: ${wave}vh; }
      }
    `;
    updateAnimation('wave', body);
  }, [settings]);

  const updateAnimation = (context, css) => {
    const stylesheet = animatorStylesheets.current[`${context}Styles`];
    const index = stylesheet.sheet.cssRules.length;
    index && stylesheet.sheet.deleteRule(0);
    stylesheet.sheet.insertRule(css, 0);
  };

  const routeToMini = ({ data }) => {
    if (typeof data === "string") {
      sendMessage(JSON.parse(data), [mini.current], window.location.href + 'mini');
    }
  };

  const light = (item, index) => {
    const { width, height } = targetStyle();
    const { lightbar: opacity, steps } = settings;
    const marginLeft = (absoluteSize() - parseInt(width)) / 2 + 'vw';
    const left = (distance() * 2 / (steps - 1) * index) + 'vw';

    return (
      <div key={index} className="lightWrapper" style={{ left, marginLeft, width, height }}>
        <div className="bullseye" style={{ width, height, opacity }} />
      </div>
    );
  };

  const flashBar = activeSetting => {
    setMotionBarActive(true)
  };

  const hideBar = () => {
    setMotionBarActive(false);
  };

  let popRemote = useRef(() => {
    const top = window.screen.availHeight - 150;
    const { miniSize } = limits;
    const left = window.screen.width - miniSize;
    mini.current = window.open('/mini', "_mini", `left=${left},height=${miniSize},width=${miniSize},toolbar=0,titlebar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0`);
    remote.current = window.open('/remote', "_blank", `top=${top}, height=150, width=1000, resizable`);
    setRemoteMode(true, sendSettingsToRemote);
  });

  const killRemote = () => {
    setTimeout(() => {
      remote.current && remote.current.close();
      mini && mini.close();
      remote.current = undefined;
    });
    setRemoteMode(false);
    setHidden(false);
  };

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
    if ( remoteMode ) {
      return;
    }
    clearTimeout(toolbarTimer.current);
    if (hidden) {
      setHidden(false);
    }
    if (!toolbarBusy.current) {
      toolbarTimer.current = setTimeout(() => {
        setHidden(true);
      },
      limits.toolbarHideDelay
      );
    }
  }, [hidden, remoteMode]);

  const setUserMode = useCallback(({ active = true }) => {
    _setUserMode(active);
    if (remoteMode) {
      const top = window.screen.availHeight - (active ? 450 : 150);
      remote.resizeTo(1000, active ? 450 : 205);
      remote.moveTo(0, top);
    }
  }, [remoteMode]);

  const toggleSteppedAnimationFlow = e => {
    const flow = parseInt(getComputedStyle(e.target).left) < 0;
    const { steps } = settings;
    if (flow === odd) {
      return;
    }
    if (steps >= 1) {
      setOdd(flow);
    }
  };

  const hapticBump = () => {
    generateSound({ pitch: 225, gain: 0.2, duration: 70 });
  };

  let ping = useRef(e => {
    const { pitch, steps, volume: gain } = settings;
    const { audioPanRange } = limits;
    toggleSteppedAnimationFlow(e);
    if (Number(gain) === 0 ) {
      return;
    }
    const twoStepReverse = Number(steps) !== 2 ? 1 : -1;
    const panX = (odd ? audioPanRange : -audioPanRange) * twoStepReverse;
    generateSound({ panX, pitch, gain, duration: 70 });
  });

  const togglePlay = useCallback((override) => {
    const playing = typeof override !== 'undefined' ? override : !settings.playing;
    set({ setting: 'playing', data: playing });
  }, [settings, set]);

  const bindEvents = useCallback(() => {
    PublicMethods.current = {
      updateWaveAnimation,
      updateMainAnimation,
      flashBar,
      hideBar,
      setUserMode,
      settings,
      set,
      setSettings,
      togglePlay,
      popRemote: popRemote.current,
      setToolbarBusy,
      sendSettingsToRemote,
    };

    bindEvent({ element: window, event: 'message', handler: receiveMessage.bind(PublicMethods.current) });
    if (!isMini.current) {
      [
        { event: 'mouseout', element: toolbar.current, handler: setToolbarFree },
        { event: 'mouseover', element: toolbar.current, handler: setToolbarBusy },
        { event: 'mousemove', element: document.body, handler: toggleToolbar },
        { event: 'keydown', element: document.body, handler: setKeys.bind(PublicMethods.current, undefined) },
        { event: 'message', element: window, handler: routeToMini },
        { event: 'pagehide', element: window, handler: killRemote },
      ].forEach(bindEvent);
    }
  }, [sendSettingsToRemote, set, setUserMode, settings, togglePlay, toggleToolbar, updateMainAnimation, updateWaveAnimation]);

  useEffect((e) => {
    bindEvents();
    toggleToolbar();
    // updateMainAnimation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect((e) => {
    setMiniMode();
    target.current = document.querySelector('#target');
    animatorStylesheets.current.forEach(createAnimatorStylesheet);
  }, [createAnimatorStylesheet, setMiniMode]);

  useEffect(() => {
    callback.current();
    callback.current = noop;
    updateMainAnimation();
    console.log("*** settings: ", settings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  return (
    <div id="display" style={displayStyle()}>
      <div
        id="container"
        className={containerClass()}
        style={containerStyle()}
      >
        <div id="lightbar" className={targetClass()}>
          {lights()}
        </div>
        <div
          id="target"
          className={targetClass()}
          style={targetStyle()}
          onClick={togglePlay}
          onAnimationIteration={ping.current}
        >
          <div className="bullseye"></div>
        </div>
      </div>
      {!isMini.current &&
        <iframe
          title="remote"
          name="remote"
          className={cn('toolbar', { hidden, userMode, remoteMode })}
          src="./embedded"
          ref={toolbar}
        />
      }
    </div>
  );
};

export default Display;
