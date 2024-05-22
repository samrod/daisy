import { useEffect, useState, useCallback, useRef } from 'react';
import { noop } from "lodash";
import cn from 'classnames';
import CSS from "csstype";

import { bindEvent, unbindEvent, receiveMessage, generateSound, setKeys } from '../lib/utils';
import { limits } from '../lib/constants';
import { useStore } from "../lib/state";
import './Display.scss';

const Display = () => {
  const State = useStore(state => state);
  const { settings, userMode, motionBarActive, activeSetting, setActiveSetting, toggleUserMode } = State;
  const { size, speed, steps, lightbar, angle, length, background, opacity, color, shape, playing, wave, pitch, volume: gain } = settings;

  const [hidden, setHidden] = useState(true);
  const [odd, setOdd] = useState(true);

  const animatorStylesheets = useRef(['length', 'wave']);
  const initialized = useRef(false);
  const playbackStarted = useRef(false);
  const toolbarBusy = useRef(false);
  const toolbarTimer = useRef<NodeJS.Timeout | number>();
  const toolbar = useRef<HTMLIFrameElement>();
  const bindList = useRef<BindParams[]>();
  const displayStyle = useRef<CSS.Properties>();

  let
    absoluteBallSize: number,
    targetClass: string,
    containerClass: string,
    containerStyle: CSS.Properties,
    targetStyle: CSS.Properties;

  const lights = () => {
    if (steps > 1) {
      return Array.apply(null, Array(steps)).map(light);
    }
    return null;
  };

  const distance = useCallback(() => {
    return length - (absoluteBallSize / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [absoluteBallSize, length, shape, size]);

  const createAnimatorStylesheet = useCallback((name: string) => {
    const styleElement = document.createElement('style');
    const id = `${name}Styles`;
    styleElement.setAttribute("id", id)
    styleElement.setAttribute("type", "text/css")
    document.head.append(styleElement);
    animatorStylesheets.current[`${name}Styles`] = document.getElementById(id);
  }, [animatorStylesheets]);

  const updateAnimation = (context: string, css: string) => {
    const stylesheet = animatorStylesheets.current[`${context}Styles`];
    const index = stylesheet.sheet.cssRules.length;
    index && stylesheet.sheet.deleteRule(0);
    stylesheet.sheet.insertRule(css, 0);
  };

  const updateMainAnimation = useCallback(() => {
    const _distance = distance();
    const body =`
        @keyframes bounce {
          0% { left: -${_distance}vw; }
          100%  { left: ${_distance}vw; }
        }
      `;
    updateAnimation('length', body);
  }, [distance]);

  const updateWaveAnimation = useCallback(() => {
    const body = `
      @keyframes wave {
        0% { top: -${wave}vh; }
        100%  { top: ${wave}vh; }
      }
    `;
    updateAnimation('wave', body);
  }, [wave]);

  const light = (item, index) => {
    const { width, height } = targetStyle;
    const marginLeft = (absoluteBallSize - parseInt(width)) / 2 + 'vw';
    const left = (distance() * 2 / (steps - 1) * index) + 'vw';

    return (
      <div key={index} className="lightWrapper" style={{ left, marginLeft, width, height }}>
        <div className="bullseye" style={{ width, height, opacity: lightbar }} />
      </div>
    );
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

  const hapticBump = () => {
    generateSound({ pitch: 225, gain: 0.2, duration: 70 });
  };

  const routeKeys = useCallback((e) => {
    setKeys(e, State);
  }, [State]);

  const onAnimationIteration = (e) => {
    toggleSteppedAnimationFlow(e);
    ping();
  }

  let toggleSteppedAnimationFlow = noop;
  const _toggleSteppedAnimationFlow = e => {
    const flow = parseInt(getComputedStyle(e.target).left) < 0;
    if (flow === odd) {
      return;
    }
    if (steps >= 1) {
      setOdd(flow);
    }
  };

  const updateDirectionalCalls = () => {
    if (gain > 0) {
      toggleSteppedAnimationFlow = _toggleSteppedAnimationFlow;
      ping = _ping;
    } else {
      toggleSteppedAnimationFlow = steps > 1 ? _toggleSteppedAnimationFlow: noop;
      ping = noop;
    }
  }

  let ping = noop;
  const _ping = () => {
    const { audioPanRange } = limits;
    const twoStepReverse = steps !== 2 ? 1 : -1;
    const panX = (odd ? audioPanRange : -audioPanRange) * twoStepReverse;
    generateSound({ panX, pitch, gain, duration: 70 });
  };

  const bindEvents = useCallback(() => {
    bindList.current = [
      { event: 'mouseout', element: toolbar.current, handler: setToolbarFree },
      { event: 'mouseover', element: toolbar.current, handler: setToolbarBusy },
      { event: 'mousemove', element: document.body, handler: toggleToolbar },
      { event: 'keydown', element: document.body, handler: setKeys },
      { event: 'message', element: window, handler: receiveMessage.bind({ routeKeys, setActiveSetting, toggleUserMode }) },
    ];
  
    if (toolbar.current && !initialized.current) {
      bindList.current.forEach(bindEvent);
    }
    initialized.current = true;
  }, [routeKeys, setActiveSetting, toggleToolbar, toggleUserMode]);

  const unbindEvents = useCallback(() => {
    bindList.current.forEach(unbindEvent);
  }, [bindList]);

  const updateClassesAndStyles = () => {
    const stepped = steps - 1;
    const timingFunction = !stepped
      ? "ease-in-out"
      : `steps(${stepped}, ${odd ? "start" : "end"})`;
  
    const velocity = speed
      ? limits.speed.max - speed + limits.speed.min
      :  1000000;
  
    let newColor = color
    if (color === 'white' && background <= .5) {
      newColor = 'black';
    }
    if (color === 'black' && background > .5) {
      newColor ='white';
    }
  
    containerStyle = {
      width: `${length * 2}vw`,
      transform: `rotateZ(${angle}deg)`,
      animationDuration: `${velocity / limits.wave.amplitude}ms`,
      borderRadius: `${size/2}vw`,
    };
  
    let levelClass = "";
    if (motionBarActive && angle === 0 && activeSetting === 'angle') {
      levelClass = "containerLevel";
      hapticBump();
    };

    absoluteBallSize = shape !== 'diamond' ? size : Math.sqrt((size ** 2) << 1);
    containerClass = `${levelClass} ${motionBarActive ? "containerActive" : ""}`;
    targetClass = `color-${newColor} shape-${shape}`;
    displayStyle.current = { backgroundColor: `rgba(0,0,0,${background})` };  
    targetStyle = {
      width: `${size}vw`,
      height: `${size}vw`,
      opacity: opacity,
      animationName: "bounce",
      animationDuration: `${velocity}ms`,
      animationTimingFunction: timingFunction,
    };
  }

  useEffect(() => {
    if (!initialized.current) {
      return;
    }
    updateWaveAnimation();
  }, [updateWaveAnimation, wave]);

  useEffect(() => {
    if (playing) {
      playbackStarted.current = true;
    }
    if (!initialized.current || !playbackStarted.current) {
      return;
    }
    updateMainAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, shape, size, playing]);

  useEffect(() => {
    bindEvents();
    animatorStylesheets.current.forEach(createAnimatorStylesheet);
    return unbindEvents;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  updateClassesAndStyles();
  updateDirectionalCalls();

  // console.log("*** / playing: ", State);

  return (
    <div id="display" style={displayStyle.current}>
      <div
        id="container"
        className={containerClass}
        style={containerStyle}
      >
        <div id="lightbar" className={targetClass}>
          {lights()}
        </div>
        <div
          id="target"
          className={cn(targetClass, playing ? "playing" : "pause")}
          style={targetStyle}
          onAnimationIteration={onAnimationIteration}
        >
          <div className="bullseye"></div>
        </div>
      </div>
      <iframe
        ref={toolbar}
        src="./remote"
        name="remote"
        title="remote"
        className={cn('toolbar', { hidden, userMode })}
      />
    </div>
  );
};

export default Display;
