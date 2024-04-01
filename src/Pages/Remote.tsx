import React, { useEffect, useState, MouseEvent, useRef, ChangeEvent } from "react";
import cn from "classnames";

import { useStore } from "../lib/state";
import Slider from "../components/Slider";
import Swatch from "../components/Swatch";
import Button from "../components/Button";
import Tabs from "../components/Tabs";
import Clock from "../components/Clock";
import UserPanel from "./UserPanel";
import RemoteEmbedded from "./RemoteEmbedded";
import "./Remote.scss";

const embedded = window.location.pathname === "/embedded";

const Remote = () => {
  const startTime = useRef(new Date().getTime());
  
  const State = useStore(state => state);
  const { settings, userMode, toggleUserMode, setSettings, togglePlay, flashBar, hideBar } = State;
  const { size, speed, angle, length, background, opacity, playing, volume, pitch, lightbar, steps, wave } = settings;
  const [speedSliderValue, setSpeedSliderValue] = useState(speed);
  const localState = {
    speed: setSpeedSliderValue,
  };

  const [panel, setPanel] = useState("appearance");
  const [lastPlayingState, setLastPlayingState] = useState(false);
  const [speedSliderActive, setSpeedSliderActive] = useState(false);
  const [speedSliderDragged, setSpeedSliderDragged] = useState(false);

  const showLightbarSlider = () => {
    const { steps, wave } = settings;
    return steps > 1 && !Number(wave);
  };

  const showWaveSlider = () => {
    const { lightbar } = settings;
    return !Number(lightbar);
  };

  const showAudioSliders = () => {
    const { volume } = settings;
    return !!Number(volume);
  };

  const onTabClick = ({ target }) => {
    setPanel(target.dataset.option);
  };

  const setValue = (e: any, execute = true) => {
    const { target } = e;
    const { value, dataset: { action: rawAction, option } } = target;
    const data = option || Number(value);
    if (localState[rawAction]) {
      localState[rawAction](data);
    }
    if (execute) {
      setSettings(rawAction, data);
    }
  }

  const onSpeedSliderMouseDown = (e: MouseEvent) => {
    setSpeedSliderActive(true);
    setLastPlayingState(playing);
  };

  const onSpeedSliderMove = () => {
    if (speedSliderActive && lastPlayingState && playing) {
      setSpeedSliderDragged(true);
      setSettings("playing", false);
    }
  }

  const onSpeedSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e, false);
  };

  const onSpeedSliderMouseUp = e => {
    setValue(e);
    if (lastPlayingState && speedSliderDragged) {
      setTimeout(togglePlay, 0, true);
    }
    setSpeedSliderDragged(false);
    setSpeedSliderActive(false);
  };

  useEffect(() => {
    setSpeedSliderValue(speed);
  },[speed]);

  return (
    <div id="remote" className={cn({ userMode })}>
      <div className="page">
        <div className="topButtons">
          <Button leftIcon={playing ? 'pause' : 'play'} klass="playButton" action={togglePlay} />
          <Button leftIcon="user" klass="standardButton" action={toggleUserMode} />
        </div>
        <Clock playing={playing} startTime={startTime.current} />
        <Tabs 
          options={['Motion', 'Appearance', 'Sound']}
          callback={onTabClick}
          state={panel}
          action="panel"
        />
        <div className="panels">

          <div className={cn('panel', { active: panel === 'motion' })}>
            <div className="sliders">
              <div className="row">
                <Slider
                  name="speed"
                  value={speedSliderValue}
                  onChange={onSpeedSliderChange}
                  onMouseDown={onSpeedSliderMouseDown}
                  onMouseUp={onSpeedSliderMouseUp}
                  onMouseMove={onSpeedSliderMove}
                />
                {showWaveSlider() &&
                  <Slider name="wave" value={wave} onChange={setValue} />
                }
                <Slider name="angle" value={angle} onChange={setValue} onMouseDown={flashBar.bind(this, 'angle')} onMouseUp={hideBar} />
                <Slider name="length" value={length} onChange={setValue} onMouseDown={flashBar.bind(this, 'length')} onMouseUp={hideBar} />
              </div>
            </div>
          </div>

          <div className={cn('panel', { active: panel === 'appearance' })}>
            <div className="swatches">
              <div className="row">
                {['white', 'red', 'orange', 'yellow'].map(Swatch.bind(null, setValue))}
              </div>
              <div className="row">
                {['green', 'cyan', 'blue', 'magenta'].map(Swatch.bind(null, setValue))}
              </div>
            </div>
            <div className="sliders">
              <div className="row">
                <Slider name="steps" value={steps} onChange={setValue} />
                {showLightbarSlider() &&
                  <Slider name="lightbar" value={lightbar} onChange={setValue} />
                }
                <Slider name="background" value={background} onChange={setValue} />
                <Slider name="opacity" value={opacity} onChange={setValue} />
                <Slider name="size" value={size} onChange={setValue} />
              </div>
            </div>
            <div className="shapes">
              <div className="shape" data-action="shape" data-option="circle" onClick={setValue}>&#9679;</div>
              <div className="shape" data-action="shape" data-option="square" onClick={setValue}>&#9632;</div>
              <div className="shape diamond" data-action="shape" data-option="diamond" onClick={setValue}>&#9670;</div>
            </div>
          </div>

          <div className={cn('panel', { active: panel === 'sound' })}>
            <div className="sliders">
              <div className="row">
                <Slider name="volume" value={volume} onChange={setValue} />
                {showAudioSliders() &&
                  <Slider name="pitch" value={pitch} onChange={setValue} />
                }
              </div>
            </div>
          </div>

        </div>
      </div>
      <UserPanel toggleUserPanel={toggleUserMode} />
    </div>
  );
}

export default embedded ? RemoteEmbedded : Remote;
