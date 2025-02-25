import { useEffect, useState, useCallback, useRef, memo, ReactNode, useMemo } from 'react';
import { isEqual, noop } from "lodash";
import cn from "classnames";
import CSS from "csstype";

import { generateSound, setKeys, limits, useEventBinder } from "lib";
import { useLinkState } from 'state';
import Styles from "./Display.module.scss";

interface DisplayProps {
  settings: SettingsTypes;
  preview?: boolean;
  children?: ReactNode;
}

const _Display = ({ settings: _settings, preview, children }: DisplayProps) => {
  const settings = useMemo(() => _settings, [_settings]);
  useEventBinder(preview ? [] : [{ event: 'keydown', element: document.body, handler: setKeys }]);
  const { motionBarActive, activeSetting } = useLinkState(state => state);
  let validSettings = true, settingsRef, size, speed, steps, lightbar, angle, length, background, opacity, color, shape, playing, wave, pitch, gain, duration;
  settingsRef = useRef(settings);
  
  try {
    ({ size, speed, steps, lightbar, angle, length, background, opacity, color, shape, playing, wave, pitch, volume: gain, duration } = settingsRef.current);
  } catch (e) {
    validSettings = false;
  }

  const [odd, setOdd] = useState(true);
  const [, forceUpdate] = useState(false);

  const animatorStylesheets = useRef(['length', 'wave']);
  const initialized = useRef(false);
  const playbackStarted = useRef(false);
  const displayStyle = useRef<CSS.Properties>();

  let
    absoluteBallSize: number,
    targetClass: string,
    containerClass: string,
    bullseyeClass: string,
    containerStyle: CSS.Properties,
    targetStyle: CSS.Properties
  ;

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
          0% { transform: translate3d(-${_distance}vw, 0, 0); }
          100%  { transform: translate3d(${_distance}vw, 0, 0); }
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
    const marginLeft = (absoluteBallSize - parseInt(width + "")) / 2 + 'vw';
    const left = (distance() * 2 / (steps - 1) * index) + 'vw';

    return (
      <div key={index} className={Styles.lightWrapper} style={{ left, marginLeft, width, height }}>
        <div className={cn(Styles.bullseye, bullseyeClass)} style={{ width, height, opacity: lightbar }} />
      </div>
    );
  };

  const hapticBump = () => {
    generateSound({ pitch: 225, gain: 0.2, duration: 70 });
  };

  const onAnimationIteration = (e) => {
    toggleSteppedAnimationFlow(e);
    ping();
  }

  let toggleSteppedAnimationFlow = noop;
  const _toggleSteppedAnimationFlow = e => {
    const matrix = getComputedStyle(e.target).transform;
    const transX = Number(matrix.split(/[(), ]+/)[5]);
    const flow = transX < 0;
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
    generateSound({ panX, pitch, gain, duration });
  };

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
      levelClass = Styles.containerLevel;
      hapticBump();
    };

    absoluteBallSize = shape !== 'diamond' ? size : Math.sqrt((size ** 2) << 1);
    containerClass = `${levelClass} ${motionBarActive ? Styles.containerActive : ""}`;
    targetClass = `shape-${shape}`;
    bullseyeClass = `bg-${newColor}`;
    displayStyle.current = { backgroundColor: `rgba(0,0,0,${background})` };  
    targetStyle = {
      width: `${size}vw`,
      height: `${size}vw`,
      opacity: opacity,
      animationName: "bounce",
      animationDuration: `${velocity}ms`,
      animationTimingFunction: timingFunction,
    };
  };

  useEffect(() => {
    if (!initialized.current || !validSettings || preview) {
      return;
    }
    updateWaveAnimation();
  }, [updateWaveAnimation, wave, validSettings, preview]);

  useEffect(() => {
    if (!validSettings || preview) {
      return;
    }
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
    if (validSettings) {
      settingsRef.current = settings;
      forceUpdate(prev => !prev);
    }
  }, [settings, settingsRef, validSettings]);

  useEffect(() => {
    if (!validSettings || preview) {
      return;
    }
    animatorStylesheets.current.forEach(createAnimatorStylesheet);
    initialized.current = true;
    useLinkState.subscribe(state => (settingsRef.current = state.settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!validSettings) {
    return null;
  }

  updateClassesAndStyles();
  updateDirectionalCalls();
  

  return (
    <div className={`${Styles.display} display`} style={displayStyle.current}>
      <div
        className={cn(Styles.container, containerClass)}
        style={containerStyle}
      >
        <div className={cn(Styles.lightbar, targetClass)}>
          {lights()}
        </div>
        <div
          className={cn(Styles.target, targetClass, playing ? "playing" : "pause")}
          style={targetStyle}
          onAnimationIteration={onAnimationIteration}
        >
          <div className={cn(Styles.bullseye, bullseyeClass)} />
        </div>
      </div>
      {children}
    </div>
  );
};

const isEverythingEqual = (prev: SettingsTypes, next: SettingsTypes) => (
  JSON.stringify(prev.settings) === JSON.stringify(next.settings) && 
  isEqual(prev.children, next.children)
);

export const Display = memo(_Display, isEverythingEqual);
