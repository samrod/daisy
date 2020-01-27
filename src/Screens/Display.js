import React, { PureComponent } from 'react';
import { bindEvent, receiveMessage, sendMessage } from '../common/utils';
import { defaults, limits } from '../common/constants';
import './Display.scss';

export default class Display extends PureComponent {
  state = {
    remoteMode: '',
    hidden: '',
    settings: defaults,
    motionBarActive: false,
    odd: true,
  };
  callbacks = {
    length: 'updateMainAnimation',
    wave: 'updateWaveAnimation',
  };
  limits = limits;
  animatorStylesheets = ['length', 'wave'];

  get displayStyle() {
    const { background } = this.state.settings;
    return { backgroundColor: `rgba(0,0,0,${background})` };
  }

  get targetStyle() {
    const { velocity, state } = this;
    const { size, opacity } = state.settings;
    return {
      width: `${size}vw`,
      height: `${size}vw`,
      opacity: opacity,
      animationDuration: `${velocity}ms`,
      animationTimingFunction: this.timingFunction,
    };
  }

  get targetClass() {
    const { color, shape, background } = this.state.settings;
    let newColor = color;
    if (color === 'white' && background <= .5) {
     newColor = 'black';
    }
    if (color === 'black' && background > .5) {
      newColor ='white';
    }
    return `color-${newColor} shape-${shape}`;
  }

  get containerStyle() {
    const { velocity, state } = this;
    const { angle, length, size } = state.settings;
    return {
      width: `${length * 2}vw`,
      transform: `rotateZ(${angle}deg)`,
      animationDuration: `${velocity / limits.waveAmplitude}ms`,
      borderRadius: `${size/2}vw`,
    };
  }

  get containerClass() {
    const { settings: { angle }, motionBarActive } = this.state;
    const levelClass = motionBarActive && Number(angle) === 0 ? 'containerLevel' : '';
    const activeClass = motionBarActive ? 'containerActive' : '';
    return `${levelClass} ${activeClass}`;
  }

  get lightbarStyle() {
    const { lightbar } = this.state.settings;
    return {
      opacity: lightbar,
    };
  }

  get timingFunction() {
    const { odd, steps: numString } = this.state.settings;
    const steps = Number(numString) - 1;
    if (!steps) {
      return 'ease-in-out';
    }
    const directionLimit = odd ? 'start' : 'end';
    return `steps(${steps}, ${directionLimit})`;
  }

  get velocity() {
    const { maxSpeed, minSpeed } = this.limits;
    const { speed } = this.state.settings;
    return speed ? maxSpeed - speed + minSpeed : 0;
  }

  get lights() {
    const { light, state } = this;
    const { steps } = state.settings;
    if (steps > 1) {
      return Array.apply(null, Array(Number(steps))).map(light);
    }
    return null;
  }

  get distance() {
    const { length, size } = this.state.settings;
    return length - (size / 2);
  }

  componentDidMount() {
    this.bindEvents();
    this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    this.animatorStylesheets.forEach(this.createAnimatorStylesheet.bind(this));
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

  updateMainAnimation = () => {
    const body = `
      @keyframes bounce {
        0% { left: -${this.distance}vw; }
        100%  { left: ${this.distance}vw; }
      }
    `;
    this.updateAnimation('length', body);
  };

  updateWaveAnimation = () => {
    const { state: { settings: { wave } } } = this;
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
    this.updateAnimation('wave', body);
  };

  updateAnimation(context, css) {
    const stylesheet = this[`${context}Styles`];
    const index = stylesheet.sheet.cssRules.length;
    index && stylesheet.sheet.deleteRule(0);
    stylesheet.sheet.insertRule(css, 0);
  }

  set = ({ setting, data }) => {
    const { settings } = this.state;
    const callback = this[this.callbacks[setting]] || (() => true);
    this.setState({
      settings: {
        ...settings,
        [setting]: data,
      },
    }, callback);
  };

  light = (item, index) => {
    const { width, height } = this.targetStyle;
    return (
      <div key={index} className="lightWrapper" style={{ width, height }}>
        <div className="icon" style={{ width, height, ...this.lightbarStyle }} />
      </div>
    );
  };

  flashBar = () => {
    this.setState({ motionBarActive: true });
  };

  hideBar = () => {
    this.setState({ motionBarActive: false });
  };

  popRemote() {
    const top = window.screen.availHeight - 150;
    this.remote = window.open('/remote', "_blank", `top=${top},height=150,width=1000,toolbar=0,titlebar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0`);
    this.setState({ remoteMode: 'remoteMode' }, this.sendSettings);
  }

  sendSettings = () => {
    const { state, toolbar, remote } = this;
    const { settings: params } = state;
    const action = 'updateSettings';
    const target = window.location.href + (remote ? 'remote' : 'embedded');
    const windowObj = remote || toolbar.contentWindow;
    sendMessage({ action, params }, target, windowObj);
  };

  killRemote(route) {
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

  toggleSteppedAnimationFlow(flow) {
    const { settings } = this.state;
    const { steps, odd } = settings;
    if (flow === odd) {
      return;
    }
    if (steps >= 1) {
      this.setState({
        settings: {
          ...settings,
          odd: flow,
        },
       });
    }
  }

  ping = ({target: { offsetLeft }}) => {
    const panX = (offsetLeft - (window.innerWidth / 2)) * 10;
    const { audioCtx } = this;
    const source = audioCtx.createOscillator();
    const volume = audioCtx.createGain();
    const panner = audioCtx.createPanner();
    // const reverb = audioCtx.createConvolver();
    this.toggleSteppedAnimationFlow(panX <= 0);

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
    if (isFinite(this.state.settings.volume)) {
      volume.gain.value = parseFloat(this.state.settings.volume);
    }
    if (isFinite(this.state.settings.pitch)) {
      source.frequency.value = parseFloat(this.state.settings.pitch);
    }
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
      <div id="display" style={this.displayStyle}>
        <div
          id="container"
          className={this.containerClass}
          style={this.containerStyle}
        >
          <div id="lightbar" className={this.targetClass}>
            {this.lights}
          </div>
          <div
            id="target"
            className={this.targetClass}
            style={this.targetStyle}
            onClick={this.updateMainAnimation}
            onAnimationIteration={this.ping}
          >
            <div className="icon"></div>
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
