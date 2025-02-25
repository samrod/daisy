import { useCallback, useEffect, useState, ChangeEvent, useRef, MouseEventHandler } from "react";
import { isEmpty } from "lodash";
import cn from "classnames";

import { useGuideState, updateSetting, getLinkData, useLinkState } from "state";
import { setKeys, useEventBinder } from "lib";
import { Slider, Swatch, Button, Tabs, Clock, Row, ClientStatus } from "components";
import { UserPanel } from "./settings";
import Styles from "./Remote.module.scss";

const Remote = () => {
  useEventBinder([{ event: 'keydown', element: document.body, handler: setKeys, options: { capture: true }}]);

  const { setClientStatus, userMode, setUserMode } = useGuideState(state => state);
  const { clientLink, setSetting } = useLinkState(state => state);
  const settingsRef = useRef(useLinkState.getState().settings);
  const { size, speed, angle, length, background, opacity, playing, volume, pitch, lightbar, steps, wave, duration } = settingsRef.current;
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

  const persistPlay = useCallback(() => {
    setSetting("playing", !playing);
    updateSetting("playing", !playing);
  }, [playing, setSetting]);

  const showLightbarSlider = () => {
    const { steps, wave } = settingsRef.current;
    return steps > 1 && !Number(wave);
  };

  const showWaveSlider = () => {
    const { lightbar } = settingsRef.current;
    return !Number(lightbar);
  };

  const showAudioSliders = () => {
    const { volume } = settingsRef.current;
    return !!Number(volume);
  };

  const onTabClick = ({ target }) => {
    setPanel(target.dataset.option);
  };

  const setValue = ({ target }, execute = true) => {
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

  const onSpeedSliderMouseUp: MouseEventHandler<HTMLInputElement> = (e) => {
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
  }, [setUserMode]);

  const removeUserPanelFromDom = useCallback(() => {
    setUserPanelExists(userMode);
  }, [userMode]);

  useEffect(() => {
    setSpeedSliderValue(speed);
  },[speed]);

  useEffect(() => {
    if (!isEmpty(clientLink)) {
      getLinkData("status", setClientStatus)
    }
  }, [clientLink, setClientStatus]);

  useEffect(() => {
    if (window.parent["bound"]) {
      return;
    }
    useLinkState.subscribe(state => (settingsRef.current = state.settings));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn(Styles.remote, { userMode })} onTransitionEnd={removeUserPanelFromDom}>
      <div className={Styles.page}>
        <div className={Styles.topButtons}>
          <Button leftIcon="user" klass={Styles.standardButton} variant="black" onClick={addUserPanelToDom} />
          <Button leftIcon={!playing ? "play" : "pause"} circle={40} klass={Styles.playButton} variant="black" onClick={persistPlay} />
        </div>
        <Row nowrap cols="auto" justify="between" gap={0} klass={Styles.statusDisplay}>
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

          <Tabs.Panel active={panel} title="motion" klass={`${Styles.sliders} mx-1 content-center`}>
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
          </Tabs.Panel>

          <Tabs.Panel active={panel} title="appearance">
            <Row cols={1} justify="between" klass="mr-2">
              <Row nowrap>
                {['white', 'red', 'orange', 'yellow'].map(Swatch.bind(null, setValue))}
              </Row>
              <Row nowrap>
                {['green', 'cyan', 'blue', 'magenta'].map(Swatch.bind(null, setValue))}
              </Row>
            </Row>
            <Row klass={Styles.sliders} gap={0}>
              <Slider name="steps" value={steps} onChange={setValue} />
              {showLightbarSlider() &&
                <Slider name="lightbar" value={lightbar} onChange={setValue} />
              }
              <Slider name="background" value={background} onChange={setValue} />
              <Slider name="opacity" value={opacity} onChange={setValue} />
              <Slider name="size" value={size} onChange={setValue} />
            </Row>
            <div className={Styles.shapes}>
              <div className={Styles.shape} data-action="shape" data-option="circle" onClick={setValue}>&#9679;</div>
              <div className={Styles.shape} data-action="shape" data-option="square" onClick={setValue}>&#9632;</div>
              <div className={Styles.shape} data-action="shape" data-option="diamond" onClick={setValue}>&#9670;</div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel active={panel} title="sound" klass={Styles.sliders}>
            <Row>
              <Slider name="volume" value={volume} onChange={setValue} />
              {showAudioSliders() &&
                <>
                  <Slider name="pitch" value={pitch} onChange={setValue} />
                  <Slider name="duration" value={duration} onChange={setValue} />
                </>
              }
            </Row>
          </Tabs.Panel>

        </Tabs.Panels>
      </div>
      <UserPanel exists={userPanelExists} />
    </div>
  );
}

export default Remote;

