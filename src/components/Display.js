import React, { Component } from 'react';
import { bindEvent, receiveMessage, sendMessage } from '../common/utils';
import { defaults, limits } from '../common/constants';
import './Display.scss';

export default class Display extends Component {
  state = {
    remoteMode: '',
    hidden: '',
  };
  odd = true;
  settings = defaults;
  limits = limits;
  animatorStylesheets = ['length', 'wave'];

  get targetStyle() {
    const { settings: { size, opacity }, velocity } = this;
    return {
      width: `${size}vw`,
      height: `${size}vw`,
      opacity: opacity,
      animationDuration: `${velocity}ms`,
      animationTimingFunction: this.timingFunction,
    };
  }

  get containerStyle() {
    const { settings: { angle, length, size }, velocity } = this;
    return {
      width: `${length * 2}vw`,
      transform: `rotateZ(${angle}deg)`,
      animationDuration: `${velocity / limits.waveAmplitude}ms`,
      borderRadius: `${size/2}vw`,
    };
  }

  get timingFunction() {
    const { settings: { steps: numString }, odd } = this;
    const steps = Number(numString) - 1;
    if (!steps) {
      return 'ease-in-out';
    }
    const directionLimit = odd ? 'start' : 'end';
    return `steps(${steps}, ${directionLimit})`;
  }

  get velocity() {
    const { settings: { speed }, limits: { maxSpeed, minSpeed } } = this;
    return speed ? maxSpeed - speed + minSpeed : 0;
  }

  componentDidMount() {
    this.bindEvents();
    this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    this.animatorStylesheets.forEach(this.createAnimatorStylesheet.bind(this));
    this.target.className = 'color-white shape-circle';
    this.updateStyles();
  }

  bindEvents() {
    [
      { element: document.body, event: 'mousemove', handler: this.toggleToolbar },
      { element: window, event: 'message', handler: receiveMessage.bind(this) },
    ].forEach(bindEvent);
  }

  createAnimatorStylesheet = name => {
    const styleElement = document.createElement('style');
    document.head.append(styleElement);
    this[`${name}Styles`] = styleElement;
  };

  updateStyles = () => {
    const { display, target, targetStyle, container, containerStyle, settings: { background } } = this;
    Object.assign(target.style, targetStyle);
    Object.assign(container.style, containerStyle);
    display.style.backgroundColor = `rgba(0,0,0,${background})`;
  };

  updateMainAnimation = () => {
    const { settings: { length, size }, lengthStyles } = this;
    const distance = length - (size / 2);
    const index = lengthStyles.sheet.cssRules.length;
    const body = `
      @keyframes bounce {
        0% { left: -${distance}vw; }
        100%  { left: ${distance}vw; }
      }
    `;
    index && lengthStyles.sheet.deleteRule(0);
    lengthStyles.sheet.insertRule(body, 0);
  };

  updateWaveAnimation = () => {
    const { settings: { wave }, waveStyles } = this;
    const index = waveStyles.sheet.cssRules.length;
    const body = `
      @keyframes wave {
        0% { top: -${wave}vh; }
        100%  { top: ${wave}vh; }
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
    index && waveStyles.sheet.deleteRule(0);
    waveStyles.sheet.insertRule(body, 0);
  };

  setColor = newColor => {
    const switchToblack = newColor === 'white' && this.settings.background <= .5;
    const newClass = !switchToblack ? `color-${newColor}` : 'color-black';
    const newClasses = this.target.className.replace(/ *color-[a-z]+/gi, newClass);
    this.target.className = newClasses;
    this.settings.color = newColor;
  };

  setShape = newShape => {
    const newClass = ` shape-${newShape}`;
    const newClasses = this.target.className.replace(/ *shape-[a-z]+/gi, newClass);
    this.settings.shape = newShape;
    this.target.className = newClasses;
  };

  setSize = value => {
    this.settings.size = value;
    this.updateStyles();
    this.updateMainAnimation();
  };

  setBackground = value => {
    this.settings.background = value;

    if (this.settings.color === 'white' && value <= .5) {
      this.setColor('black');
    }
    if (this.settings.color === 'black' && value > .5) {
      this.setColor('white');
    }

    this.updateStyles()
  };

  setPitch = value => {
    this.settings.pitch = value;
  };

  setWave = value => {
    this.settings.wave = value;
    this.updateWaveAnimation();
  };

  setSteps = value => {
    this.settings.steps = value;
    this.updateStyles()
    this.updateMainAnimation();
  };

  setLength = value => {
    this.settings.length = value;
    this.updateStyles();
    this.updateMainAnimation();
  };

  setVolume = value => {
    this.settings.volume = value;
  };

  setSpeed = value => {
    this.settings.speed = value;
    this.updateStyles();
  };

  setOpacity = value => {
    this.settings.opacity = value;
    this.updateStyles();
  };

  setAngle = value => {
    this.settings.angle = Number(value);
    const { container, settings: { angle } } = this;
    const hasLevel = container.className.indexOf('containerLevel') > -1;
    if (!angle) {
      container.className = container.className + ' containerLevel';
    } else if (hasLevel) {
      container.className = container.className.replace(' containerLevel', '');
    }
    this.updateStyles();
  };

  flashBar = () => {
    this.container.className += ' containerActive';
  };

  hideBar = () => {
    this.container.className = '';
  };

  popRemote() {
    const top = window.screen.availHeight - 150;
    this.remote = window.open('/remote', "_blank", `top=${top},height=150,width=1000,toolbar=0,titlebar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0`);
    this.setState({ remoteMode: 'remoteMode' }, this.sendSettings);
  }

  sendSettings = () => {
    const { settings: params, toolbar, remote } = this;
    const action = 'updateSettings';
    const target = window.location.href + (remote ? 'remote' : 'embedded');
    const windowObj = remote || toolbar.contentWindow;
    sendMessage({ action, params }, target, windowObj);
  };

  killRemote() {
    this.remote = undefined;
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

  toggleAnimationStepsEndpoint(odd) {
    if (this.steps >= 1) {
      return;
    }
    this.odd = odd;
    this.updateStyles();
  }

  ping = ({target: { offsetLeft }}) => {
    const panX = (offsetLeft - (window.innerWidth / 2)) * 10;
    const { audioCtx } = this;
    const source = audioCtx.createOscillator();
    const volume = audioCtx.createGain();
    const panner = audioCtx.createPanner();
    // const reverb = audioCtx.createConvolver();
    this.toggleAnimationStepsEndpoint(panX <= 0);

    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 1;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;
    panner.setPosition(panX,0,0);

    // const duration = this.settings.speed / 2500;
    // reverb.buffer = this.impulseResponse(duration, 4.5);
    volume.gain.value = this.settings.volume;
    source.frequency.value = this.settings.pitch;
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

  setRef(key, ref) {
    this[key] = ref;
  }

  render() {
    const { hidden, remoteMode } = this.state;
    return (
      <div id="display" ref={this.setRef.bind(this, 'display')}>
        <div id="container" ref={this.setRef.bind(this, 'container')}>
          <div id="target" ref={this.setRef.bind(this, 'target')} onClick={this.updateMainAnimation} onAnimationIteration={this.ping}>
            <div id="icon"></div>
          </div>
        </div>
        <iframe
          title="remote"
          className={`toolbar ${hidden} ${remoteMode}`}
          src="./embedded"
          ref={this.setRef.bind(this, 'toolbar')}
        />
      </div>
    );
  }
}
