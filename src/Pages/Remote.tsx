import { useCallback, useEffect, useState, ChangeEvent, useRef } from "react";
import cn from "classnames";

import { bindEvent, unbindEvent, setKeys } from "../lib/utils";
import { useStore } from "../lib/state";
import Slider from "../components/Slider";
import Swatch from "../components/Swatch";
import Button from "../components/Button";
import Tabs from "../components/Tabs";
import Clock from "../components/Clock";
import UserPanel from "./settings/UserPanel";
import "./Remote.scss";

const Remote = () => {
  const State = useStore(state => state);
  const { settings, setSetting, userMode, setUserMode } = State;
  const { size, speed, angle, length, background, opacity, playing, volume, pitch, lightbar, steps, wave } = settings;
  const [speedSliderValue, setSpeedSliderValue] = useState(speed);
  const localState = {
    speed: setSpeedSliderValue,
  };

  const [panel, setPanel] = useState("appearance");
  const [lastPlayingState, setLastPlayingState] = useState(false);
  const [speedSliderActive, setSpeedSliderActive] = useState(false);
  const [speedSliderDragged, setSpeedSliderDragged] = useState(false);
  const [fakePaused, setFakePasued] = useState(false);

  const bindList = useRef<BindParams[]>();

  const persistPlay = useCallback(() => {
    setSetting("playing", !playing)
  }, [playing]);

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

  const setValue = ({ target }: ChangeEvent<HTMLInputElement>, execute = true) => {
    const { value, dataset: { action: rawAction, option } } = target;
    const data = option || Number(value);
    if (localState[rawAction]) {
      localState[rawAction](data);
    }
    if (execute) {
      setSetting(rawAction, data);
    }
  };

  const onSpeedSliderMouseDown = () => {
    setSpeedSliderActive(true);
    setLastPlayingState(playing);
    setFakePasued(true);
  };

  const onSpeedSliderMove = () => {
    if (speedSliderActive && lastPlayingState && playing) {
      setSpeedSliderDragged(true);
      setSetting("playing", false);
    }
  }

  const onSpeedSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e, false);
  };

  const onSpeedSliderMouseUp = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e);
    if (lastPlayingState && speedSliderDragged) {
      togglePlay();
      setFakePasued(false);
    }
    setSpeedSliderDragged(false);
    setSpeedSliderActive(false);
  };

  const bindEvents = useCallback(() => {
    bindList.current = [
      { event: 'keydown', element: document.body, handler: setKeys, options: { capture: true }},
    ];

    bindList.current.forEach(bindEvent);
    window.parent["bound"] = true;
  }, []);

  const unbindEvents = useCallback(() => {
    bindList.current.forEach(unbindEvent);
  }, [bindList]);

  useEffect(() => {
    setSpeedSliderValue(speed);
  },[speed]);

  useEffect(() => {
    if (window.parent["bound"]) {
      return;
    }
    bindEvents();
    return unbindEvents;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log("*** /remote playing: ", playing, State);

  return (
    <div id="remote" className={cn({ userMode })}>
      <div className="page">
        <div className="topButtons">
          <Button leftIcon={!playing ? "play" : "pause"} klass="playButton" action={persistPlay} />
          <Button leftIcon="user" klass="standardButton" action={setUserMode} />
        </div>
        <Clock playing={playing} />
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
                <Slider name="angle" value={angle} onChange={setValue} />
                <Slider name="length" value={length} onChange={setValue} />
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
      <UserPanel toggleUserPanel={setUserMode} />
    </div>
  );
}

export default Remote;
