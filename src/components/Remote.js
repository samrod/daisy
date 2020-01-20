import React, { Component } from 'react';
import { camelCase } from 'lodash';
import Slider from './Slider';
import { bindEvent, sendMessage, receiveMessage } from '../common/utils';
import { defaults, limits } from '../common/constants';
import './Remote.scss';

export default class Remote extends Component {
  state = defaults;
  minSpeed = limits.minSpeed;
  maxSpeed = limits.maxSpeed;
  minVolume = limits.minVolume;
  maxVolume = limits.maxVolume;
  speedAdjustIncrement = limits.speedAdjustIncrement;
  volumeAdjustIncrement = limits.volumeAdjustIncrement;

  popup = window.parent === window.self;
  bindings = [
    { selector: 'body', handler: 'keys', event: 'keypress' },
    { selector: '.swatch, .shape', handler: 'setRange' },
    { selector: '[data-action=angle]', handler: 'flashAngle', event: 'mousedown' },
    { selector: '[data-action=angle]', handler: 'hideAngle', event: 'mouseup' },
  ];

  componentDidMount() {
    this.init();
  }

  init() {
    this.bindings.forEach(bindEvent.bind(this));
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
      // console.log(action, params);
    }
  };

  popRemote = () => {
    sendMessage({ action: 'popRemote' });
  };

  flashAngle = () => {
    sendMessage({ action: 'flashAngle' });
  };

  hideAngle = () => {
    sendMessage({ action: 'hideAngle' });
  };

  killRemote = () => {
    sendMessage({ action: 'killRemote' });
    this.sendSettings();
  };

  keys = ({ keyCode, key }) => {
    let speed, volume;

    switch (keyCode) {
      case 39:
        speed = Math.min(this.state.speed + this.speedAdjustIncrement, this.maxSpeed);
        this.setState({ speed }, () => sendMessage({ action: 'setSpeed', params: this.state.speed }));
        break;
      case 37:
        speed = Math.max(this.state.speed - this.speedAdjustIncrement, this.minSpeed);
        this.setState({ speed }, () => sendMessage({ action: 'setSpeed', params: this.state.speed }));
        break;
      case 38:
        volume = Math.min(this.state.volume + this.volumeAdjustIncrement, this.maxVolume);
        this.setState({ volume }, () => sendMessage({ action: 'setVolume', params: this.state.volume }));
        break;
      case 40:
        volume = Math.max(this.state.volume - this.volumeAdjustIncrement, this.minVolume);
        this.setState({ volume }, () => sendMessage({ action: 'setVolume', params: this.state.volume }));
        break;
      case 32:
        speed = this.state.speed ? 0 : this.previousSpeed;
        this.previousSpeed = this.state.speed;
        this.setState({ speed }, () => sendMessage({ action: 'setSpeed', params: this.state.speed }));
        break;
      default:
        break;
    }
    // console.log({ keyCode, key });
  };

  render() {
    return (
      <div id="remote" className={this.popup ? 'popup' : ''}>
        {!this.popup &&
          <div className="popButton" title="Pop Remote" onClick={this.popRemote} id="pop">&#10696;</div>
        }
        <div className="swatches">
          <div className="row">
            <div className="swatch" data-action="color" data-option="white" />
            <div className="swatch" data-action="color" data-option="red" />
            <div className="swatch" data-action="color" data-option="yellow" />
            <div className="swatch" data-action="color" data-option="orange" />
          </div>
          <Slider name="opacity" label={false} min={.1} max={1} step={.05} value={this.state.opacity} onChange={this.setRange} />
          <div className="row">
            <div className="swatch" data-action="color" data-option="green" />
            <div className="swatch" data-action="color" data-option="cyan" />
            <div className="swatch" data-action="color" data-option="blue" />
            <div className="swatch" data-action="color" data-option="magenta" />
          </div>
        </div>

        <div className="sliders">
          <div className="row">
            <Slider name="speed" min={this.minSpeed} max={this.maxSpeed} value={this.state.speed} onChange={e => this.setRange(e, false)} onMouseUp={this.setRange} />
            <Slider name="pitch" min={50} max={2000} value={this.state.pitch} onChange={this.setRange} />
            <Slider name="volume" min={this.minVolume} max={this.maxVolume} value={this.state.volume} onChange={this.setRange} />
            <Slider name="wave" min={0} max={25} value={this.state.wave} onChange={this.setRange} />
          </div>
          <div className="row">
            <Slider name="background" min={0} max={1} step={.01} value={this.state.background} onChange={this.setRange} />
            <Slider name="size" min={1} max={15} step={.25} value={this.state.size} onChange={this.setRange} />
            <Slider name="angle" min={-45} max={45} value={this.state.angle} onChange={this.setRange} />
            <Slider name="length" min={10} max={50} value={this.state.length} onChange={this.setRange} />
          </div>
        </div>

        <div className="shapes">
          <div className="shape" data-action="shape" data-option="circle">&#9679;</div>
          <div className="shape" data-action="shape" data-option="square">&#9632;</div>
          <div className="shape diamond" data-action="shape" data-option="diamond">&#9670;</div>
        </div>

      </div>
    );
  }
}
