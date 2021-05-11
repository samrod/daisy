import { debounce } from 'lodash';
import React, { Component, createRef } from 'react';
import { bindEvent, unbindEvent, sendMessage, receiveMessage, setKeys } from '../common/utils';
import Slider from '../components/Slider';
import Clock from '../components/Clock';
import Button from '../components/Button';
import { defaults, limits } from '../common/constants';
import './Remote.scss';

window.name = 'Remote';

export default class Remote extends Component {
  limits = limits;
  popup = window.parent === window.self;
  state = {
    settings: {
      ...defaults,
      startTime: new Date().getTime(),
    },
  };

  componentDidMount() {
    this.bindEvents();
    this.sendSettingsToRemote();
  }

  componentWillUnmount() {
    unbindEvent({ event: 'message', handler: receiveMessage.bind(this), element: window });
  }

  get showLightbarSlider() {
    const { steps, wave } = this.state.settings;
    return steps > 1 && !Number(wave);
  }

  get showWaveSlider() {
    const { lightbar } = this.state.settings;
    return !Number(lightbar);
  }

  get showAudioSliders() {
    const { volume } = this.state.settings;
    return !!Number(volume);
  }

  get targetWindow() {
    return [window.opener || window.parent];
  }

  bindEvents() {
    [
      { event: 'mousemove', element: document.body, handler: debounce(this.setToolbarBusy, 25) },
      { event: 'message', element: window, handler: receiveMessage.bind(this) },
      { event: 'keydown', element: document.body, handler: setKeys.bind(this, undefined) },
      { event: 'pagehide', element: window, handler: this.killRemote },
    ].forEach(bindEvent);
  }

  setRange = ({ target: { value, dataset: { action: rawAction, option } } }, execute = true) => {
    const data = value || option;
    const { settings } = this.state;
    this.setState({
      settings: {
        ...settings,
        [rawAction]: data,
       },
    });
    if (execute) {
      this.set({ setting: rawAction, data });
    }
  };

  set({ setting, data }) {
    sendMessage({ action: 'set', params: { setting, data } }, this.targetWindow );
  }

  setToolbarBusy = () => {
    sendMessage({ action: 'setToolbarBusy' });
  };

  flashBar = activeSetting => {
    sendMessage({ action: 'flashBar', params: activeSetting }, this.targetWindow);
  };

  hideBar = () => {
    sendMessage({ action: 'hideBar' }, this.targetWindow);
  };

  sendSettingsToRemote() {
    sendMessage({ action: 'sendSettingsToRemote' }, this.targetWindow);
  }

  updateSettings = settings => {
    this.setState({ settings });
  };

  popRemote = () => {
    sendMessage({ action: 'popRemote' }, this.targetWindow);
  };

  killRemote = () => {
    this.sendSettingsToRemote();
    // this.updateClock();
    sendMessage({ action: 'killRemote' }, this.targetWindow);
  };

  // updateClock() {
  //   const { settings } = this.state;
  //   this.setState({
  //     settings: {
  //       ...settings,
  //       startTime: new Date().getTime(),
  //     },
  //   });
  // }

  togglePlay = () => {
    sendMessage({ action: 'togglePlay' });
  };

  render() {
    const { setRange, togglePlay, flashBar, hideBar, popup, popRemote, state } = this;
    const { settings } = state;

    return (
      <div id="remote" className={popup ? 'popup' : ''}>
        <div className="page">
          {!popup &&
            <div className="popButton" title="Pop Remote" onClick={popRemote} id="pop">&#10696;</div>
          }
          <div className="topButtons">
            <Button leftIcon={settings.playing ? 'pause' : 'play'} klass="playButton" action={togglePlay} />
            {!this.popup &&
              <Button leftIcon="remote-settings-fill" klass="standardButton" action={popRemote} />
            }
          </div>
          <Clock
            ref={this.timer}
            playing={settings.playing}
            startTime={settings.startTime}
          />
          <div className="tabs">
            <div onClick={setRange} data-action="panel" data-option="motion" className={`tab ${settings.panel === 'motion' ? 'active' : ''}`}>Motion</div>
            <div onClick={setRange} data-action="panel" data-option="appearance" className={`tab ${settings.panel === 'appearance' ? 'active' : ''}`}>Appearance</div>
            <div onClick={setRange} data-action="panel" data-option="sound" className={`tab ${settings.panel === 'sound' ? 'active' : ''}`}>Sound</div>
          </div>
          <div className="panels">

            <div className={`panel ${settings.panel === 'motion' ? 'active' : ''}`}>
              <div className="sliders">
                <div className="row">
                  <Slider name="speed" value={settings.speed} onChange={e => setRange(e, false)} onMouseUp={setRange} />
                  {this.showWaveSlider &&
                    <Slider name="wave" value={settings.wave} onChange={setRange} />
                  }
                  <Slider name="angle" value={settings.angle} onChange={setRange} onMouseDown={flashBar.bind(this, 'angle')} onMouseUp={hideBar} />
                  <Slider name="length" value={settings.length} onChange={setRange} onMouseDown={flashBar.bind(this, 'length')} onMouseUp={hideBar} />
                </div>
              </div>
            </div>

            <div className={`panel ${settings.panel === 'appearance' ? 'active' : ''}`}>
              <div className="swatches">
                <div className="row">
                  <div className="swatch" data-action="color" data-option="white" onClick={setRange} />
                  <div className="swatch" data-action="color" data-option="red" onClick={setRange} />
                  <div className="swatch" data-action="color" data-option="orange" onClick={setRange} />
                  <div className="swatch" data-action="color" data-option="yellow" onClick={setRange} />
                </div>
                <div className="row">
                  <div className="swatch" data-action="color" data-option="green" onClick={setRange} />
                  <div className="swatch" data-action="color" data-option="cyan" onClick={setRange} />
                  <div className="swatch" data-action="color" data-option="blue" onClick={setRange} />
                  <div className="swatch" data-action="color" data-option="magenta" onClick={setRange} />
                </div>
              </div>
              <div className="sliders">
                <div className="row">
                  <Slider name="steps" value={settings.steps} onChange={setRange} />
                  {this.showLightbarSlider &&
                    <Slider name="lightbar" value={settings.lightbar} onChange={setRange} />
                  }
                  <Slider name="background" value={settings.background} onChange={setRange} />
                  <Slider name="opacity" value={settings.opacity} onChange={setRange} />
                  <Slider name="size" value={settings.size} onChange={setRange} />
                </div>
              </div>
              <div className="shapes">
                <div className="shape" data-action="shape" data-option="circle" onClick={setRange}>&#9679;</div>
                <div className="shape" data-action="shape" data-option="square" onClick={setRange}>&#9632;</div>
                <div className="shape diamond" data-action="shape" data-option="diamond" onClick={setRange}>&#9670;</div>
              </div>
            </div>

            <div className={`panel ${settings.panel === 'sound' ? 'active' : ''}`}>
              <div className="sliders">
                <div className="row">
                  <Slider name="volume" value={settings.volume} onChange={setRange} />
                  {this.showAudioSliders &&
                    <Slider name="pitch" value={settings.pitch} onChange={setRange} />
                  }
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
}
