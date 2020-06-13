import React, { Component } from 'react';
import { bindEvent, unbindEvent, sendMessage, receiveMessage } from '../common/utils';
import Slider from '../components/Slider';
import Button from '../components/Button';
import { defaults, limits } from '../common/constants';
import './Remote.scss';

window.name = 'Remote';

export default class Remote extends Component {
  limits = limits;
  popup = window.parent === window.self;
  state = defaults;

  componentDidMount() {
    this.bindEvents();
    this.sendSettings();
  }

  componentWillUnmount() {
    this.mainEvents.forEach(unbindEvent);
    this.events.forEach(unbindEvent);
    unbindEvent({ event: 'message', handler: receiveMessage.bind(this), element: window });
  }

  get showLightbarSlider() {
    const { steps, wave } = this.state;
    return steps > 1 && !Number(wave);
  }

  get showWaveSlider() {
    const { lightbar } = this.state;
    return !Number(lightbar);
  }

  get showAudioSliders() {
    const { volume } = this.state;
    return !!Number(volume);
  }

  get targetWindow() {
    return [window.opener || window.parent];
  }

  bindEvents() {
    [
      { event: 'message', element: window, handler: receiveMessage.bind(this) },
      { event: 'keydown', element: document.body, handler: this.keys },
      { event: 'unload', element: window, handler: this.killRemote },
    ].forEach(bindEvent);
  }

  setRange = ({ target: { value, dataset: { action: rawAction, option } } }, execute = true) => {
    const data = value || option;
    this.setState({ [rawAction]: data });
    if (execute) {
      this.set(rawAction, data);
    }
  };

  set(setting, data) {
    sendMessage({ action: 'set', params: { setting, data } }, this.targetWindow );
  }

  flashBar = () => {
    sendMessage({ action: 'flashBar' }, this.targetWindow);
  };

  hideBar = () => {
    sendMessage({ action: 'hideBar' }, this.targetWindow);
  };

  sendSettings() {
    sendMessage({ action: 'sendSettings' }, this.targetWindow);
  }

  updateSettings = props => {
    this.setState(props);
  };

  popRemote = () => {
    sendMessage({ action: 'popRemote' }, this.targetWindow);
  };

  killRemote = () => {
    sendMessage({ action: 'killRemote' }, this.targetWindow);
    this.sendSettings();
  };


  togglePlay = () => {
    const { playing } = this.state;
    this.setState({
        playing: !playing,
      },
      () => sendMessage({ action: 'updateMainAnimation', params: this.state.playing })
    );
  };

  keys = ({ keyCode, key, type }) => {
    const { state } = this;
    let speed, volume;

    switch (keyCode) {
      case 38:
        volume = Math.min(state.volume + limits.volumeAdjustIncrement, limits.maxVolume);
        this.setState({ volume });
        this.set('volume', volume);
        break;
      case 40:
        volume = Math.max(state.volume - limits.volumeAdjustIncrement, limits.minVolume);
        this.setState({ volume });
        this.set('volume', volume);
        break;
      case 32:
        this.togglePlay();
        break;
      case 39:
        speed = Math.min(state.speed + limits.speedAdjustIncrement, limits.maxSpeed);
        this.setState({ speed });
        this.set('speed', speed);
        break;
      case 37:
        speed = Math.max(state.speed - limits.speedAdjustIncrement, limits.minSpeed);
        this.setState({ speed });
        this.set('speed', speed);
        break;
      default:
        break;
    }
    // console.log({ type, keyCode, key });
  };

  render() {
    const { setRange, togglePlay, flashBar, hideBar, popup, popRemote, state } = this;
    const { panel } = state;

    return (
      <div id="remote" className={popup ? 'popup' : ''}>
        <div className="page">
          {!popup &&
            <div className="popButton" title="Pop Remote" onClick={popRemote} id="pop">&#10696;</div>
          }
          <div className="topButtons">
            <Button leftIcon={state.playing ? 'pause' : 'play'} klass="playButton" action={togglePlay} />
            {!this.popup &&
              <Button leftIcon="remote-settings-fill" klass="standardButton" action={popRemote} />
            }
          </div>
          <div className=""></div>
          <div className="tabs">
            <div onClick={setRange} data-action="panel" data-option="motion" className={`tab ${panel === 'motion' ? 'active' : ''}`}>Motion</div>
            <div onClick={setRange} data-action="panel" data-option="appearance" className={`tab ${panel === 'appearance' ? 'active' : ''}`}>Appearance</div>
            <div onClick={setRange} data-action="panel" data-option="sound" className={`tab ${panel === 'sound' ? 'active' : ''}`}>Sound</div>
          </div>
          <div className="panels">

            <div className={`panel ${panel === 'motion' ? 'active' : ''}`}>
              <div className="sliders">
                <div className="row">
                  <Slider name="speed" min={limits.minSpeed} max={limits.maxSpeed} value={state.speed} onChange={e => setRange(e, false)} onMouseUp={setRange} />
                  {this.showWaveSlider &&
                    <Slider name="wave" min={0} max={25} value={state.wave} onChange={setRange} />
                  }
                  <Slider name="angle" min={-45} max={45} value={state.angle} onChange={setRange} onMouseDown={flashBar} onMouseUp={hideBar} />
                  <Slider name="length" min={10} max={50} value={state.length} onChange={setRange} onMouseDown={flashBar} onMouseUp={hideBar} />
                </div>
              </div>
            </div>

            <div className={`panel ${panel === 'appearance' ? 'active' : ''}`}>
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
                  <Slider name="steps" min={1} max={8} value={state.steps} onChange={setRange} />
                  {this.showLightbarSlider &&
                    <Slider name="lightbar" min={0} max={.5} step={.05} value={state.lightbar} onChange={setRange} />
                  }
                  <Slider name="background" min={0} max={1} step={.01} value={state.background} onChange={setRange} />
                  <Slider name="opacity" min={.1} max={1} step={.05} value={state.opacity} onChange={setRange} />
                  <Slider name="size" min={1} max={15} step={.25} value={state.size} onChange={setRange} />
                </div>
              </div>
              <div className="shapes">
                <div className="shape" data-action="shape" data-option="circle" onClick={setRange}>&#9679;</div>
                <div className="shape" data-action="shape" data-option="square" onClick={setRange}>&#9632;</div>
                <div className="shape diamond" data-action="shape" data-option="diamond" onClick={setRange}>&#9670;</div>
              </div>
            </div>

            <div className={`panel ${panel === 'sound' ? 'active' : ''}`}>
              <div className="sliders">
                <div className="row">
                  <Slider name="volume" min={limits.minVolume} max={limits.maxVolume} value={state.volume} onChange={setRange} />
                  {this.showAudioSliders &&
                    <Slider name="pitch" min={50} max={2000} value={state.pitch} onChange={setRange} />
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
