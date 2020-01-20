import React, { Component } from 'react';
import { camelCase } from 'lodash';
import Slider from './Slider';
import { bindEvent, sendMessage, receiveMessage } from '../common/utils';
import { defaults, limits } from '../common/constants';
import './Remote.scss';

export default class Remote extends Component {
  state = defaults;
  limits = limits;
  popup = window.parent === window.self;

  componentDidMount() {
    this.init();
  }

  init() {
    bindEvent('body', 'keypress', this.keys);
    (window.parent || window.opener).addEventListener('keydown', this.keys);
    window.addEventListener('unload', this.killRemote);
    window.addEventListener('message', receiveMessage.bind(this));
    this.sendSettings();
  }

  sendSettings() {
    sendMessage({ action: 'sendSettings' });;
  }

  updateSettings = props => {
    this.setState(props);
  };

  setRange = ({ target: { value, dataset: { action: rawAction, option }}}, execute = true) => {
    const params = value || option;
    const action = camelCase(`set ${rawAction}`);
    this.setState({ [rawAction]: value });
    if (execute) {
      sendMessage({ action, params });
    }
  };

  popRemote = () => {
    sendMessage({ action: 'popRemote' });
  };

  flashBar = () => {
    sendMessage({ action: 'flashBar' });
  };

  hideBar = () => {
    sendMessage({ action: 'hideBar' });
  };

  killRemote = () => {
    sendMessage({ action: 'killRemote' });
    this.sendSettings();
  };

  keys = ({ keyCode, key }) => {
    const { state, limits } = this;
    let speed, volume;

    switch (keyCode) {
      case 39:
        speed = Math.min(state.speed + limits.speedAdjustIncrement, limits.maxSpeed);
        this.setState({ speed }, () => sendMessage({ action: 'setSpeed', params: state.speed }));
        break;
      case 37:
        speed = Math.max(state.speed - limits.speedAdjustIncrement, limits.minSpeed);
        this.setState({ speed }, () => sendMessage({ action: 'setSpeed', params: state.speed }));
        break;
      case 38:
        volume = Math.min(state.volume + limits.volumeAdjustIncrement, limits.maxVolume);
        this.setState({ volume }, () => sendMessage({ action: 'setVolume', params: state.volume }));
        break;
      case 40:
        volume = Math.max(state.volume - limits.volumeAdjustIncrement, limits.minVolume);
        this.setState({ volume }, () => sendMessage({ action: 'setVolume', params: state.volume }));
        break;
      case 32:
        speed = state.speed ? 0 : this.previousSpeed;
        this.previousSpeed = state.speed;
        this.setState({ speed }, () => sendMessage({ action: 'setSpeed', params: state.speed }));
        break;
      default:
        break;
    }
    // console.log({ keyCode, key });
  };

  render() {
    const { state, limits, popup, popRemote, setRange, flashBar, hideBar } = this;
    return (
      <div id="remote" className={popup ? 'popup' : ''}>
        {!popup &&
          <div className="popButton" title="Pop Remote" onClick={popRemote} id="pop">&#10696;</div>
        }
        <div className="swatches">
          <div className="row">
            <div className="swatch" data-action="color" data-option="white" onClick={setRange} />
            <div className="swatch" data-action="color" data-option="red" onClick={setRange} />
            <div className="swatch" data-action="color" data-option="yellow" onClick={setRange} />
            <div className="swatch" data-action="color" data-option="orange" onClick={setRange} />
          </div>
          <Slider name="opacity" label={false} min={.1} max={1} step={.05} value={state.opacity} onChange={setRange} />
          <div className="row">
            <div className="swatch" data-action="color" data-option="green" onClick={setRange} />
            <div className="swatch" data-action="color" data-option="cyan" onClick={setRange} />
            <div className="swatch" data-action="color" data-option="blue" onClick={setRange} />
            <div className="swatch" data-action="color" data-option="magenta" onClick={setRange} />
          </div>
        </div>

        <div className="sliders">
          <div className="row">
            <Slider name="speed" min={limits.minSpeed} max={limits.maxSpeed} value={state.speed} onChange={e => setRange(e, false)} onMouseUp={setRange} />
            <Slider name="pitch" min={50} max={2000} value={state.pitch} onChange={setRange} />
            <Slider name="volume" min={limits.minVolume} max={limits.maxVolume} value={state.volume} onChange={setRange} />
            <Slider name="wave" min={0} max={25} value={state.wave} onChange={setRange} />
          </div>
          <div className="row">
            <Slider name="background" min={0} max={1} step={.01} value={state.background} onChange={setRange} />
            <Slider name="size" min={1} max={15} step={.25} value={state.size} onChange={setRange} />
            <Slider name="angle" min={-45} max={45} value={state.angle} onChange={setRange} onMouseDown={flashBar} onMouseUp={hideBar} />
            <Slider name="length" min={10} max={50} value={state.length} onChange={setRange} onMouseDown={flashBar} onMouseUp={hideBar} />
          </div>
        </div>

        <div className="shapes">
          <div className="shape" data-action="shape" data-option="circle" onClick={setRange}>&#9679;</div>
          <div className="shape" data-action="shape" data-option="square" onClick={setRange}>&#9632;</div>
          <div className="shape diamond" data-action="shape" data-option="diamond" onClick={setRange}>&#9670;</div>
        </div>

      </div>
    );
  }
}
