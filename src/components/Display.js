import React, { Component } from 'react';
import { bindEvent, receiveMessage } from '../common/utils';
import { defaults, limits } from '../common/constants';
import './Display.scss';

export default class Display extends Component {
  state = {
    remoteMode: '',
    hidden: '',
  };
  minSpeed = limits.minSpeed;
  maxSpeed = limits.maxSpeed;
  bindings = [
    { selector: '#target', handler: 'ping', event: 'animationiteration' },
    { selector: '#target', handler: 'updateMainAnimation' },
    { selector: 'body', handler: 'toggleToolbar', event: 'mousemove' },
  ];
  selectors = [ '.toolbar', '#container', '#target', '#dynamicStyles', '#display' ];

  get targetStyle() {
    const { size, speed, opacity } = this;
    return {
      width: `${size}vw`,
      height: `${size}vw`,
      opacity: opacity,
      animationDuration: `${speed}ms`,
    };
  }

  get containerStyle() {
    const { angle, speed } = this;
    return {
      transform: `rotateZ(${angle}deg)`,
      'animationDuration': `${speed/3}ms`,
    };
  }

  componentDidMount() {
    this.init();
  }

  init() {
    Object.assign(this, defaults);
    const styleElement = document.createElement('style');
    styleElement.setAttribute('id', 'dynamicStyles');
    document.head.append(styleElement);

    this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    this.selectors.forEach(this.setElement);
    this.bindings.forEach(bindEvent.bind(this));
    window.addEventListener('message', receiveMessage.bind(this));
    this.target.className = 'color-white shape-circle';
    this.updateDynamicStyles();
  }

  updateDynamicStyles = () => {
    const { targetStyle, containerStyle } = this;
    Object.assign(this.target.style, targetStyle);
    Object.assign(this.container.style, containerStyle);
    this.display.style.backgroundColor = `rgba(0,0,0,${this.background})`;
  };

  updateMainAnimation = () => {
    const { length, size, dynamicStyles } = this;
    const distance = length - (size / 2);
    const index = dynamicStyles.sheet.cssRules.length;
    const body = `
      @keyframes bounce {
        0% { left: -${distance}vw; }
        100%  { left: ${distance}vw; }
      }
    `;
    dynamicStyles.sheet.insertRule(body, index);
  };

  updateWaveAnimation = () => {
    const index = this.dynamicStyles.sheet.cssRules.length;
    const body = `
      @keyframes wave {
        0% { top: -${this.wave}vh; }
        100%  { top: ${this.wave}vh; }
      }
    `;
    // const body = `
    //   @keyframes wave {
    //     0% { top: 0; }
    //     25% { top: -${this.wave}vh; }
    //     50% { top: 0; }
    //     75%  { top: ${this.wave}vh; }
    //     100%  { top: 0; }
    //   }
    // `;
    this.dynamicStyles.sheet.insertRule(body, index);
  };

  setElement = selector => {
    const name = selector.replace(/^\.|#/, '');
    this[name] = document.querySelector(selector)
  };

  setColor = newColor => {
    const switchToblack = newColor === 'white' && this.background <= .5;
    const newClass = !switchToblack ? `color-${newColor}` : 'color-black';
    const newClasses = this.target.className.replace(/ *color-[a-z]+/gi, newClass);
    this.target.className = newClasses;
    this.color = newColor;
  };

  setShape = newShape => {
    const newClass = ` shape-${newShape}`;
    const newClasses = this.target.className.replace(/ *shape-[a-z]+/gi, newClass);
    this.target.className = newClasses;
  };

  setSize = value => {
    this.size = value;
    this.updateDynamicStyles();
    this.updateMainAnimation();
  };

  setBackground = value => {
    this.background = value;

    if (this.color === 'white' && value <= .5) {
      this.setColor('black');
    }
    if (this.color === 'black' && value > .5) {
      this.setColor('white');
    }

    this.updateDynamicStyles()
  };

  setPitch = value => {
    this.pitch = value;
  };

  setWave = value => {
    this.wave = value;
    this.updateWaveAnimation();
  };

  setLength = value => {
    this.length = value;
    this.updateMainAnimation();
  };

  setVolume = value => {
    this.volume = value;
  };

  setSpeed = value => {
    this.speed = value ? this.maxSpeed - value + this.minSpeed : 0;
    this.updateDynamicStyles();
  };

  setAngle = value => {
    this.angle = Number(value);
    const { container, angle } = this;
    const hasLevel = container.className.indexOf('containerLevel') > -1;
    if (!angle) {
      container.className = container.className + ' containerLevel';
    } else if (hasLevel) {
      container.className = container.className.replace(' containerLevel', '');
    }
    this.updateDynamicStyles();
  };

  setOpacity = value => {
    this.opacity = value;
    this.updateDynamicStyles();
  };

  flashAngle = () => {
    this.container.className += ' containerActive';
  };

  hideAngle = () => {
    this.container.className = '';
  };

  popRemote() {
    const top = window.screen.availHeight - 150;
    window.open('/remote', "_blank", `top=${top},height=150,width=1000,toolbar=0,titlebar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0`);
    this.setState({ remoteMode: 'remoteMode' });
  }

  killRemote() {
    this.setState({
      remoteMode: '',
      hidden: '',
    });
  }

  toggleToolbar = ({clientY}) => {
    const { remoteMode, hidden } = this.state;
    if ( remoteMode ) {
      return;
    }
    const toolbarZone = window.innerHeight - this.toolbar.clientHeight - 30;
    const toolbarNeeded = clientY >= toolbarZone;

    if (toolbarNeeded) {
      if (hidden.length) {
        this.setState({ hidden: '' });
      }
    } else if (!hidden) {
      this.setState({ hidden: 'hidden' });
    }
  };

  ping = ({target: { offsetLeft }}) => {
    const panX = (offsetLeft - (window.innerWidth / 2)) * 10;
    const { audioCtx } = this;
    const source = audioCtx.createOscillator();
    const volume = audioCtx.createGain();
    const panner = audioCtx.createPanner();
    const reverb = audioCtx.createConvolver();

    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 1;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;
    panner.setPosition(panX,0,0);

    const duration = this.speed / 2500;
    volume.gain.value = this.volume;
    reverb.buffer = this.impulseResponse(duration, 4.5);
    source.frequency.value = this.pitch;
    source.type = 'sine';

    source.connect(volume);
    volume.connect(panner);
    panner.connect(audioCtx.destination);

    source.start();

    setTimeout( () => source.stop(), 70 );
  };

  impulseResponse = ( duration, decay = 2.0, reverse = false ) => {
    const { audioCtx } = this;
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (var i = 0; i < length; i++){
      var n = reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 2) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 2) * Math.pow(1 - n / length, decay);
    }
    return impulse;
  };

  render() {
    return (
      <div id="display">
        <div id="container">
          <div id="target">
            <div id="icon"></div>
          </div>
        </div>
        <iframe title="remote" className={`toolbar ${this.state.hidden} ${this.state.remoteMode}`} src="./remote" />
      </div>
    );
  }
}
