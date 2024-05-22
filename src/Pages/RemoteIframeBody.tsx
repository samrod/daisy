import { useEffect, useState, ChangeEvent } from "react";
import cn from "classnames";

import { useStore } from "../lib/state";
import { update, updateSetting } from "../lib/store";
import Slider from "../components/Slider";
import Swatch from "../components/Swatch";
import Button from "../components/Button";
import Tabs from "../components/Tabs";
import Clock from "../components/Clock";
import UserPanel from "./settings/UserPanel";
import RemoteEmbedded from "./RemoteIframeHeader";
import "./Remote.scss";

const embedded = window.location.pathname === "/embedded";

const Remote = () => {
  const State = useStore(state => state);
  const { settings, presets, userMode, toggleUserMode, togglePlay, activePreset } = State;
  const { size, speed, angle, length, background, opacity, playing, volume, pitch, lightbar, steps, wave } = settings;
  const [speedSliderValue, setSpeedSliderValue] = useState(speed);
  const localState = {
    speed: setSpeedSliderValue,
  };

  const [panel, setPanel] = useState("appearance");
  const [lastPlayingState, setLastPlayingState] = useState("pause");
  const [speedSliderActive, setSpeedSliderActive] = useState(false);
  const [speedSliderDragged, setSpeedSliderDragged] = useState(false);
  const [fakePaused, setFakePasued] = useState(false);

  const persistPlay = () => {
    updateSetting("playing", @playing);
  };

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
      updateSetting(rawAction, data);
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
      updateSetting("playing", false);
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
 
  useEffect(() => {
    setSpeedSliderValue(speed);
  },[speed]);

  return (
    <div id="remote" className={cn({ userMode })}>
      <div className="page">
        <div className="topButtons">
          <Button leftIcon={playing} klass="playButton" action={togglePlay} />
          <Button leftIcon="user" klass="standardButton" action={toggleUserMode} />
        </div>
        <Clock playing={playing || fakePaused} />
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
      <UserPanel toggleUserPanel={toggleUserMode} />
    </div>
  );
}

export default embedded ? RemoteEmbedded : Remote;
