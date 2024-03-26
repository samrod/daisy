import React, { useEffect, useCallback, useState, MouseEvent, useRef, ChangeEvent } from "react";
import { debounce } from "lodash";
import cn from "classnames";

import Slider from "../components/Slider";
import Clock from "../components/Clock";
import Button from "../components/Button";
import Tabs from "../components/Tabs";
import UserPanel from "./UserPanel";
import { bindEvent, unbindEvent, sendMessage, receiveMessage, setKeys } from "../common/utils";
import { defaults } from "../common/constants";
import "./Remote.scss";

window.name = "Remote";

const Remote = () => {
  const popup = useRef(window.parent === window.self);
  const targetWindow = useRef([window.opener || window.parent]);

  const [lastPlaying, setLastPlaying] = useState(false);
  const [speedSliderActive, setSpeedSliderActive] = useState(false);
  const [speedSliderDragged, setSpeedSliderDragged] = useState(false);
  const [userMode, setUserMode] = useState(false);
  const [settings, setSettings] = useState<typeof defaults>({
      ...defaults,
      startTime: new Date().getTime(),
  });

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

  interface SetType {
    setting: string;
    data?: number;
  }

  const set = ({ setting, data }: SetType) => {
    sendMessage({ action: 'set', params: { setting, data } }, targetWindow.current );
  };

  // const setValue = (e: MouseEventHandler<HTMLDivElement>, execute = true) => {
  const setValue = (e: any, execute = true) => {
    // console.log('*** setValue e: ', e);
    const { target } = e;
    const { value, dataset: { action: rawAction, option } } = target;
    const data = value || option;
    setSettings({
      ...settings,
      [rawAction]: data,
    });
    if (execute) {
      set({ setting: rawAction, data });
    }
  }

  // const setRange = (e: React.ChangeEventHandler<HTMLInputElement>, execute = true) => {
  const setRange = (e: any, execute = true) => {
      // console.log('*** setRange e: ', e);
    const { target } = e;
    const { value, dataset: { action: rawAction, option } } = target;
    const data = value || option;
    setSettings({
      ...settings,
      [rawAction]: data,
    });
    if (execute) {
      set({ setting: rawAction, data });
    }
  };

  const setToolbarBusy = () => {
    sendMessage({ action: 'setToolbarBusy' });
  };

  const flashBar = (activeSetting: boolean) => {
    sendMessage({ action: 'flashBar', params: activeSetting }, targetWindow.current);
  };

  const hideBar = () => {
    sendMessage({ action: 'hideBar' }, targetWindow.current);
  };

  const sendSettingsToRemote = useCallback(() => {
    sendMessage({ action: 'sendSettingsToRemote' }, targetWindow.current);
  }, []);

  const popRemote = () => {
    sendMessage({ action: 'popRemote' }, targetWindow.current);
  };

  const killRemote = useCallback(() => {
    sendSettingsToRemote();
    sendMessage({ action: 'killRemote' }, targetWindow.current);
  }, [sendSettingsToRemote]);

  const updateSettings = useCallback((newSettings: typeof defaults = settings) => {
    console.log("*** updateSettings: ", newSettings);
    setSettings(newSettings);
  }, [settings]);

  const togglePlay = useCallback(() => {
    sendMessage({ action: 'togglePlay', params: settings.playing });
  }, [settings.playing]);

  const onSpeedSliderMouseDown = (e: MouseEvent) => {
    setSpeedSliderActive(true);
    setLastPlaying(settings.playing);
  };

  const onSpeedSliderMove = () => {
    if (speedSliderActive && lastPlaying && settings.playing) {
      setSpeedSliderDragged(true);
      sendMessage({ action: 'togglePlay', params: false });
    }
  }

  const onSpeedSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRange(e, false);
  };

  const onSpeedSliderMouseUp = e => {
    setRange(e);
    if (lastPlaying && speedSliderDragged) {
      setTimeout(togglePlay, 0, true);
    }
    setSpeedSliderDragged(false);
    setSpeedSliderActive(false);
  };

  const toggleUserPanel = () => {
    setUserMode(!userMode);
  };

  const swatch = (color: string, index: number) => (
    <div
      key={`swatch-${index}`}
      className="swatch"
      data-action="color"
      data-option={color}
      onClick={setRange}
    />
  );

  const bindEvents = useCallback(() => {
    const PublicMethods = {
      updateSettings,
      togglePlay,
      setSettings,
      settings,
      set,
    };
    
    [
      { event: "mousemove", element: document.body, handler: debounce(setToolbarBusy, 25) },
      { event: "message", element: window, handler: receiveMessage.bind(PublicMethods) },
      { event: "keydown", element: document.body, handler: setKeys.bind(PublicMethods, undefined) },
      { event: "pagehide", element: window, handler: killRemote },
    ].forEach(bindEvent);
  }, [killRemote, settings, togglePlay, updateSettings]);

  useEffect(() => {
    sendMessage({ action: "setUserMode", params: { active: userMode } });
  }, [userMode]);

  useEffect(() => {
    bindEvents();
    sendSettingsToRemote();
    return () => {
      unbindEvent({ event: "message", handler: receiveMessage, element: window });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="remote" className={cn({ popup: popup.current, userMode })}>
      <div className="page">
        <div className="topButtons">
          <Button leftIcon={settings.playing ? 'pause' : 'play'} klass="playButton" action={togglePlay} />
          {!popup.current &&
            <Button leftIcon="remote-settings-fill" klass="standardButton" action={popRemote} />
          }
            <Button leftIcon="user" klass="standardButton" action={toggleUserPanel} />
        </div>
        <Clock playing={settings.playing} startTime={settings.startTime} />
        <Tabs 
          options={['Motion', 'Appearance', 'Sound']}
          callback={setValue}
          state={settings.panel}
          action="panel"
        />
        <div className="panels">

          <div className={cn('panel', { active: settings.panel === 'motion' })}>
            <div className="sliders">
              <div className="row">
                <Slider
                  name="speed"
                  value={settings.speed}
                  onChange={onSpeedSliderChange}
                  onMouseDown={onSpeedSliderMouseDown}
                  onMouseUp={onSpeedSliderMouseUp}
                  onMouseMove={onSpeedSliderMove}
                />
                {showWaveSlider() &&
                  <Slider name="wave" value={settings.wave} onChange={setRange} />
                }
                <Slider name="angle" value={settings.angle} onChange={setRange} onMouseDown={flashBar.bind(this, 'angle')} onMouseUp={hideBar} />
                <Slider name="length" value={settings.length} onChange={setRange} onMouseDown={flashBar.bind(this, 'length')} onMouseUp={hideBar} />
              </div>
            </div>
          </div>

          <div className={cn('panel', { active: settings.panel === 'appearance' })}>
            <div className="swatches">
              <div className="row">
                {['white', 'red', 'orange', 'yellow'].map(swatch)}
              </div>
              <div className="row">
                {['green', 'cyan', 'blue', 'magenta'].map(swatch)}
              </div>
            </div>
            <div className="sliders">
              <div className="row">
                <Slider name="steps" value={settings.steps} onChange={setRange} />
                {showLightbarSlider() &&
                  <Slider name="lightbar" value={settings.lightbar} onChange={setRange} />
                }
                <Slider name="background" value={settings.background} onChange={setRange} />
                <Slider name="opacity" value={settings.opacity} onChange={setRange} />
                <Slider name="size" value={settings.size} onChange={setRange} />
              </div>
            </div>
            <div className="shapes">
              <div className="shape" data-action="shape" data-option="circle" onClick={setValue}>&#9679;</div>
              <div className="shape" data-action="shape" data-option="square" onClick={setValue}>&#9632;</div>
              <div className="shape diamond" data-action="shape" data-option="diamond" onClick={setValue}>&#9670;</div>
            </div>
          </div>

          <div className={cn('panel', { active: settings.panel === 'sound' })}>
            <div className="sliders">
              <div className="row">
                <Slider name="volume" value={settings.volume} onChange={setRange} />
                {showAudioSliders() &&
                  <Slider name="pitch" value={settings.pitch} onChange={setRange} />
                }
              </div>
            </div>
          </div>

        </div>
      </div>
      <UserPanel userMode={userMode} toggleUserPanel={toggleUserPanel} />
    </div>
  );
}

export default Remote;
