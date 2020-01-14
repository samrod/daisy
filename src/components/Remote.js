import React, { Component } from 'react';

export default class Remote extends Component {
  render() {
    return (
      <div className="toolbar hidden">

        <div className="swatches">
          <div className="row">
            <div className="swatch" data-color="white" />
            <div className="swatch" data-color="red" />
            <div className="swatch" data-color="yellow" />
            <div className="swatch" data-color="orange" />
          </div>
          <div className="row">
            <div className="swatch" data-color="green" />
            <div className="swatch" data-color="cyan" />
            <div className="swatch" data-color="blue" />
            <div className="swatch" data-color="magenta" />
          </div>
        </div>

        <div className="sliders">
          <div className="row">
            <div className="slider">
              size
              <input type="range" id="size" min="1" max="15" step=".25" defaultValue={7.5} />
            </div>
            <div className="slider">
              angle
              <input type="range" id="angle" min="-45" max="45" defaultValue={0} />
            </div>
            <div className="slider">
              wave
              <input type="range" id="wave" min="0" max="25" defaultValue={0} />
            </div>
            <div className="slider">
              opacity
              <input type="range" id="opacity" min=".1" max="1" step=".05" defaultValue={1} />
            </div>
          </div>
          <div className="row">
          <div className="slider">
              length
              <input type="range" id="length" min="10" max="50" defaultValue={50} />
            </div>
            <div className="slider">
              pitch
              <input type="range" id="pitch" min="100" max="1500" defaultValue={650} />
            </div>
            <div className="slider">
              speed
              <input type="range" id="speed" min="250" max="3000" defaultValue={1000} />
            </div>
            <div className="slider">
              volume
              <input type="range" id="volume" min="0" max="50" defaultValue={25} />
            </div>
          </div>
        </div>

        <div className="shapes">
          <div className="shape" data-shape="circle">&#9679;</div>
          <div className="shape" data-shape="square">&#9632;</div>
          <div className="shape diamond" data-shape="diamond">&#9670;</div>
        </div>

      </div>
    );
  }
}
