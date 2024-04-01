import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from "react-dom";
import cn from 'classnames';

import { bindEvent, unbindEvent, receiveMessage, generateSound, setKeys } from '../lib/utils';
import { limits } from '../lib/constants';
import { useStore } from "../lib/state";
import Remote from './Remote';
import './Display.scss';

const Display = () => {
  const State = useStore(state => state);
  const { settings, userMode, motionBarActive, activeSetting } = State;
  const { size, speed, steps, lightbar, angle, length, background, opacity, color, shape, playing, wave, pitch, volume: gain } = settings;

  const [hidden, setHidden] = useState(true);
  const [odd, setOdd] = useState(true);

  const animatorStylesheets = useRef(['length', 'wave']);
  const initialized = useRef(false);
  const playbackStarted = useRef(false);
  const toolbarBusy = useRef(false);
  const toolbarTimer = useRef(0);
  const toolbar = useRef();
  const bindList = useRef();

  let absoluteSize, containerStyle, targetStyle, displayStyle, targetClass, containerClass = "";
  const mountNode = toolbar.current?.contentWindow?.document?.body;

  const lights = () => {
    if (steps > 1) {
      return Array.apply(null, Array(steps)).map(light);
    }
    return null;
  };

  const distance = useCallback(() => {
    return length - (absoluteSize / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [absoluteSize, length, shape, size]);

  const createAnimatorStylesheet = useCallback(name => {
    const styleElement = document.createElement('style');
    document.head.append(styleElement);
    animatorStylesheets.current[`${name}Styles`] = styleElement;
  }, [animatorStylesheets]);

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

  const updateAnimation = (context, css) => {
    const stylesheet = animatorStylesheets.current[`${context}Styles`];
    const index = stylesheet.sheet.cssRules.length;
    index && stylesheet.sheet.deleteRule(0);
    stylesheet.sheet.insertRule(css, 0);
  };

  const light = (item, index) => {
    const { width, height } = targetStyle;
    const marginLeft = (absoluteSize - parseInt(width)) / 2 + 'vw';
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
  }, [hidden]);

  const toggleSteppedAnimationFlow = e => {
    const flow = parseInt(getComputedStyle(e.target).left) < 0;
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

  const routeKeys = useCallback((e) => {
    setKeys(e, State);
  }, [State]);

  const ping = e => {
    const { audioPanRange } = limits;
    toggleSteppedAnimationFlow(e);
    if (gain === 0 ) {
      return;
    }
    const twoStepReverse = steps !== 2 ? 1 : -1;
    const panX = (odd ? audioPanRange : -audioPanRange) * twoStepReverse;
    generateSound({ panX, pitch, gain, duration: 70 });
  };

  const bindEvents = useCallback(() => {
    bindList.current = [
      { event: 'mouseout', element: toolbar.current, handler: setToolbarFree },
      { event: 'mouseover', element: toolbar.current, handler: setToolbarBusy },
      { event: 'mousemove', element: document.body, handler: toggleToolbar },
      { event: 'keydown', element: document.body, handler: (e) => setKeys(e, State), options: { capture: true }},
      { event: 'message', element: window, handler: receiveMessage.bind({routeKeys}) },
    ];
  
    if (toolbar.current && !initialized.current) {
      bindList.current.forEach(bindEvent);
    }
  }, [State, routeKeys, toggleToolbar]);

  const unbindEvents = useCallback(() => {
    if (toolbar.current && !initialized.current) {
      bindList.forEach(unbindEvent);
    }
  }, [bindList]);

  const updateClassesAndStyles = () => {
    console.log("*** updateClassesAndStyles");
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
    absoluteSize = shape !== 'diamond' ? size : Math.sqrt((size ** 2) << 1);
    containerClass = `${levelClass} ${motionBarActive ? "containerActive" : ""}`;
    targetClass = `color-${newColor} shape-${shape}`;
    displayStyle = { backgroundColor: `rgba(0,0,0,${background})` };  
    targetStyle = {
      width: `${size}vw`,
      height: `${size}vw`,
      opacity: opacity,
      animationName: "bounce",
      animationDuration: `${velocity}ms`,
      animationTimingFunction: timingFunction,
      animationPlayState: playing ? "running" : "paused",
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
    if (!initialized.current) {
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    bindEvents();
    initialized.current = true;
    animatorStylesheets.current.forEach(createAnimatorStylesheet);
     return unbindEvents;
  });

  updateClassesAndStyles();

  return (
    <div id="display" style={displayStyle}>
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
          className={targetClass}
          style={targetStyle}
          onAnimationIteration={ping}
        >
          <div className="bullseye"></div>
        </div>
      </div>
      <iframe
        ref={toolbar}
        src="./embedded"
        name="remote"
        title="remote"
        className={cn('toolbar', { hidden, userMode })}
      >
        {mountNode && createPortal(<div><Remote /></div>, mountNode)}
    </iframe>
    </div>
  );
};

export default Display;
