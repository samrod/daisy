import React, { Component } from 'react';
import { camelCase } from 'lodash';
import './Remote.scss';

export default class Remote extends Component {
  popup = window.parent === window.self;
  bindings = [
    { selector: '.swatch, .shape', handler: 'setRange' },
    { selector: '.valueSlider', handler: 'setRange', event: 'input' },
    { selector: '[data-action=speed]', handler: 'setRange', event: 'change' },
    { selector: '[data-action=angle]', handler: 'flashAngle', event: 'mousedown' },
    { selector: '[data-action=angle]', handler: 'hideAngle', event: 'mouseup' },
  ];

  componentDidMount() {
    this.init();
  }

  init() {
    this.bindings.forEach(this.bindEvent);
    window.addEventListener('unload', this.killRemote);
  }

  sendMessage(data) {
    const message = JSON.stringify(data);
    const display = window.opener || window.parent;
    display.postMessage(message, window.location.href);
  }

  setElement = (selector) => {
    const name = selector.replace(/^\.|#/, '');
    this[name] = document.querySelector(selector)
  };

  bindEvent = ({ selector, event = 'click', handler }) => {
    document.querySelectorAll(selector).forEach(item => item.addEventListener(event, this[handler]));
  };

  setRange = ({ target: { value, dataset: { action: rawAction, option }}}) => {
    const params = value || option;
    const action = camelCase(`set ${rawAction}`);
    this.sendMessage({ action, params });
  };

  popRemote = () => {
    this.sendMessage({ action: 'popRemote' });
  };

  flashAngle = () => {
    this.sendMessage({ action: 'flashAngle' });
  };

  hideAngle = () => {
    this.sendMessage({ action: 'hideAngle' });
  };

  killRemote = () => {
    this.sendMessage({ action: 'killRemote' });
  };

  render() {
    return (
      <div id="remote" className={this.popup ? 'popup' : ''}>
        {!this.popup &&
          <div onClick={this.popRemote} id="pop">Pop Remote</div>
        }
        <div className="swatches">
          <div className="row">
            <div className="swatch" data-action="color" data-option="white" />
            <div className="swatch" data-action="color" data-option="red" />
            <div className="swatch" data-action="color" data-option="yellow" />
            <div className="swatch" data-action="color" data-option="orange" />
          </div>
          <div className="row">
            <div className="swatch" data-action="color" data-option="green" />
            <div className="swatch" data-action="color" data-option="cyan" />
            <div className="swatch" data-action="color" data-option="blue" />
            <div className="swatch" data-action="color" data-option="magenta" />
          </div>
          <div className="slider">
            <input type="range" className="valueSlider" data-action="opacity" min=".1" max="1" step=".05" defaultValue={1} />
          </div>
        </div>

        <div className="sliders">
          <div className="row">
            <div className="slider">
              size
              <input type="range" className="valueSlider" data-action="size" min="1" max="15" step=".25" defaultValue={7.5} />
            </div>
            <div className="slider">
              angle
              <input type="range" className="valueSlider" data-action="angle" min="-45" max="45" defaultValue={0} />
            </div>
            <div className="slider">
              wave
              <input type="range" className="valueSlider" data-action="wave" min="0" max="25" defaultValue={0} />
            </div>
            <div className="slider">
              background
              <input type="range" className="valueSlider" data-action="background" min="0" max="1" step=".01" defaultValue={1} />
            </div>
          </div>
          <div className="row">
          <div className="slider">
              length
              <input type="range" className="valueSlider" data-action="length" min="10" max="50" defaultValue={50} />
            </div>
            <div className="slider">
              pitch
              <input type="range" className="valueSlider" data-action="pitch" min="100" max="1500" defaultValue={650} />
            </div>
            <div className="slider">
              speed
              <input type="range" data-action="speed" min="250" max="3000" defaultValue={1000} />
            </div>
            <div className="slider">
              volume
              <input type="range" className="valueSlider" data-action="volume" min="0" max="50" defaultValue={25} />
            </div>
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
