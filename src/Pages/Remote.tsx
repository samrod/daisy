import { useCallback, useEffect, useState, ChangeEvent, useRef } from "react";
import { isEmpty } from "lodash";
import cn from "classnames";

import { Slider, Swatch ,Button, Tabs, Clock, Row, ClientStatus } from "../components";
import { UserPanel } from "./settings";
import { bindEvent, unbindEvent, setKeys } from "../lib/utils";
import { CLIENT_STATES } from "../lib/constants";
import { getUserData, updateSetting } from "../lib/guideStore";
import { getClientData } from "../lib/clientStore";
import { useGuideState } from "../lib/guideState";
import Styles from "./Remote.module.scss";

const Remote = () => {
  const { clientStatus, setClientStatus, clientLink, setClientLink, settings, setSetting, userMode, setUserMode } = useGuideState(state => state);
  const { size, speed, angle, length, background, opacity, playing, volume, pitch, lightbar, steps, wave } = settings;
  const [speedSliderValue, setSpeedSliderValue] = useState(speed);
  const localState = {
    speed: setSpeedSliderValue,
  };

  const [panel, setPanel] = useState("appearance");
  const [lastPlayingState, setLastPlayingState] = useState(false);
  const [speedSliderActive, setSpeedSliderActive] = useState(false);
  const [speedSliderDragged, setSpeedSliderDragged] = useState(false);
  const [, setFakePasued] = useState(false);
  const [userPanelExists, setUserPanelExists] = useState(false);

  const bindList = useRef<BindParams[]>();

  const persistPlay = useCallback(() => {
    setSetting("playing", !playing);
    updateSetting("playing", !playing);
  }, [playing, setSetting]);

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
    const { value, dataset: { action, option } } = target;
    const data = option || Number(value);
    if (localState[action]) {
      localState[action](data);
    }
    if (execute) {
      setSetting(action, data);
      updateSetting(action, data)
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
      updateSetting("playing", false);

    }
  };

  const onSpeedSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e, false);
  };

  const onSpeedSliderMouseUp = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e);
    if (lastPlayingState && speedSliderDragged) {
      setFakePasued(false);
    }
    setSpeedSliderDragged(false);
    setSpeedSliderActive(false);
  };

  const addUserPanelToDom = useCallback((e) => {
    setUserPanelExists(true);
    setUserMode(e)
  }, [userMode]);

  const removeUserPanelFromDom = useCallback(() => {
    setUserPanelExists(userMode);
  }, [userMode]);

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
    if (!isEmpty(clientLink)) {
      getClientData("status", setClientStatus)
    }
  }, [clientLink, setClientStatus]);

  useEffect(() => {
    if (window.parent["bound"]) {
      return;
    }
    bindEvents();
    return unbindEvents;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn(Styles.remote, { userMode })} onTransitionEnd={removeUserPanelFromDom}>
      <div className={Styles.page}>
        <div className={Styles.topButtons}>
          <Button leftIcon="user" klass={cn(Styles.standardButton, CLIENT_STATES[clientStatus])} variant="black" onClick={addUserPanelToDom} />
          <Button leftIcon={!playing ? "play" : "pause"} circle={40} klass={Styles.playButton} variant="black" onClick={persistPlay} />
        </div>
        <Row nowrap stretch={false} klass={Styles.statusDisplay}>
          <Clock playing={playing} />
          <ClientStatus />
        </Row>

        <Tabs.Panels>
          <Tabs 
            options={['Motion', 'Appearance', 'Sound']}
            callback={onTabClick}
            state={panel}
            action="panel"
            size="small"
          />

          <Tabs.Panel active={panel} title="motion">
            <div className={Styles.sliders}>
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
          </Tabs.Panel>

          <Tabs.Panel active={panel} title="appearance">
            <div className={Styles.swatches}>
              <div className="row">
                {['white', 'red', 'orange', 'yellow'].map(Swatch.bind(null, setValue))}
              </div>
              <div className="row">
                {['green', 'cyan', 'blue', 'magenta'].map(Swatch.bind(null, setValue))}
              </div>
            </div>
            <div className={Styles.sliders}>
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
            <div className={Styles.shapes}>
              <div className={Styles.shape} data-action="shape" data-option="circle" onClick={setValue}>&#9679;</div>
              <div className={Styles.shape} data-action="shape" data-option="square" onClick={setValue}>&#9632;</div>
              <div className={Styles.shape} data-action="shape" data-option="diamond" onClick={setValue}>&#9670;</div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel active={panel} title="sound">
            <div className={Styles.sliders}>
              <div className="row">
                <Slider name="volume" value={volume} onChange={setValue} />
                {showAudioSliders() &&
                  <Slider name="pitch" value={pitch} onChange={setValue} />
                }
              </div>
            </div>
          </Tabs.Panel>

        </Tabs.Panels>
      </div>
      <UserPanel exists={userPanelExists} />
    </div>
  );
}

export default Remote;

