import React, { PureComponent } from 'react';
import { bindEvent, receiveMessage, sendMessage, generateSound, setKeys } from '../common/utils';
import { defaults, limits } from '../common/constants';
import classNames from 'classnames';
import './Display.scss';

export default class Display extends PureComponent {
  state = {
    remoteMode: false,
    hidden: false,
    settings: defaults,
    motionBarActive: false,
    odd: true,
  };
  noop = () => true;
  callbacks = {
    length: 'updateMainAnimation',
    wave: 'updateWaveAnimation',
    size: 'updateMainAnimation',
    shape: 'updateMainAnimation',
  };
  limits = limits;
  animatorStylesheets = ['length', 'wave'];

  get displayStyle() {
    const { background } = this.state.settings;
    return { backgroundColor: `rgba(0,0,0,${background})` };
  }

  get targetStyle() {
    const { velocity, state } = this;
    const { size, opacity, playing } = state.settings;
    return {
      width: `${size}vw`,
      height: `${size}vw`,
      opacity: opacity,
      left: this.targetPosition,
      animationName: playing ? 'bounce' : 'none',
      animationDelay: `${this.timeOffset}ms`,
      animationDuration: playing ? `${velocity}ms` : '1000s',
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
      animationDuration: `${velocity / limits.wave.amplitude}ms`,
      borderRadius: `${size/2}vw`,
    };
  }

  get containerClass() {
    const { settings: { angle }, motionBarActive, activeSetting } = this.state;
    let levelClass = '';
    if (motionBarActive && Number(angle) === 0 && activeSetting === 'angle') {
      levelClass = 'containerLevel';
      this.hapticBump();
    };
    const activeClass = motionBarActive ? 'containerActive' : '';
    return `${levelClass} ${activeClass}`;
  }

  get timingFunction() {
    const { odd, settings: { steps: numString } } = this.state;
    const steps = Number(numString) - 1;
    if (!steps) {
      return 'ease-in-out';
    }
    const directionLimit = odd ? 'start' : 'end';
    return `steps(${steps}, ${directionLimit})`;
  }

  get velocity() {
    const { speed: { min, max} } = this.limits;
    const { speed } = this.state.settings;

    if (speed) {
      return max - speed + min;
    }
    return 1000000;
  }

  get lights() {
    const { light, state } = this;
    const { steps } = state.settings;
    if (steps > 1) {
      return Array.apply(null, Array(Number(steps))).map(light);
    }
    return null;
  }

  get absoluteSize() {
    const { shape, size } = this.state.settings;
    return shape !== 'diamond' ? size : Math.sqrt((size ** 2) * 2);
  }

  get distance() {
    const { length } = this.state.settings;
    return length - (this.absoluteSize / 2);
  }

  get isMini() {
    const { match: { path } } = this.props;
    return path === '/mini';
  }

  componentDidMount() {
    this.bindEvents();
    this.animatorStylesheets.forEach(this.createAnimatorStylesheet.bind(this));
    this.target = document.querySelector('#target');
    this.toggleToolbar();
    this.setMiniMode();
  }

  setMiniMode() {
    const { noop } = this;
    if (this.isMini) {
      this.popRemote = noop;
      this.sendSettingsToRemote = noop;
      this.sendMessageToRemote = noop;
      this.ping = this.toggleSteppedAnimationFlow;
      window.blur();
      const parent = window.open('', 'Remote');
      parent.focus();
    }
  }


  bindEvents() {
    bindEvent({ element: window, event: 'message', handler: receiveMessage.bind(this) });
    if (!this.isMini) {
      [
        { event: 'mouseout', element: this.toolbar, handler: this.setToolbarFree },
        { event: 'mouseover', element: this.toolbar, handler: this.setToolbarBusy },
        { event: 'mousemove', element: document.body, handler: this.toggleToolbar },
        { event: 'keydown', element: document.body, handler: setKeys.bind(this, this.sendSettingsToRemote) },
        { event: 'message', element: window, handler: this.routeToMini },
        { event: 'pagehide', element: window, handler: this.killRemote },
      ].forEach(bindEvent);
    }
  }

  createAnimatorStylesheet = name => {
    const styleElement = document.createElement('style');
    document.head.append(styleElement);
    this[`${name}Styles`] = styleElement;
  };

  getTargetPosition = () => {
    this.targetPosition = getComputedStyle(this.target).left;
    if (this.state.settings.playing) {
      setTimeout(this.getTargetPosition, 1000/30);
    }
  };

  updateMainAnimation = (play = this.state.settings.playing) => {
    this.set({ setting: 'playing', data: play });
    const body =`
        @keyframes bounce {
          0% { left: -${this.distance}vw; }
          100%  { left: ${this.distance}vw; }
        }
      `;
    this.getTargetPosition();
    this.updateAnimation('length', body);
    this.sendSettingsToRemote();
  };

  updateWaveAnimation = () => {
    const { state: { settings: { wave } } } = this;
    const body = `
      @keyframes wave {
        0% { top: -${wave}vh; }
        100%  { top: ${wave}vh; }
      }
    `;
    this.updateAnimation('wave', body);
  };

  routeToMini = ({ data }) => {
    sendMessage(JSON.parse(data), [this.mini], window.location.href + 'mini');
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
    const { lightbar: opacity } = this.state.settings;
    const marginLeft = (this.absoluteSize - parseInt(width)) / 2 + 'vw';
    const left = (this.distance * 2 / (this.state.settings.steps - 1) * index) + 'vw';

    return (
      <div key={index} className="lightWrapper" style={{ left, marginLeft, width, height }}>
        <div className="bullseye" style={{ width, height, opacity }} />
      </div>
    );
  };

  flashBar = activeSetting => {
    this.setState({ motionBarActive: true, activeSetting });
  };

  hideBar = () => {
    this.setState({ motionBarActive: false });
  };

  popRemote() {
    const top = window.screen.availHeight - 150;
    const { miniSize } = limits;
    const left = window.screen.width - miniSize;
    this.mini = window.open('/mini', "_mini", `left=${left},height=${miniSize},width=${miniSize},toolbar=0,titlebar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0`);
    this.remote = window.open('/remote', "_blank", `top=${top},height=150,width=1000,toolbar=0,titlebar=0,location=0,status=0,menubar=0,scrollbars=0,resizable=0`);
    this.setState({ remoteMode: true }, this.sendSettingsToRemote);
  }

  sendSettingsToRemote = () => {
    const { state } = this;
    const { settings: params } = state;
    const action = 'updateSettings';
    this.sendMessageToRemote({ action, params});
  };

  sendMessageToRemote = data => {
    const { toolbar, remote } = this;
    const targetFrame = window.location.href + (remote ? 'remote' : 'embedded');
    const windowObj = [remote || toolbar.contentWindow];
    sendMessage(data, windowObj, targetFrame);
  };

  killRemote = () => {
    setTimeout(() => {
      this.remote && this.remote.close();
      this.mini && this.mini.close();
      this.remote = undefined;
    });
    this.setState({
      remoteMode: false,
      hidden: false,
    });
  };

  setToolbarBusy = () => {
    this.toolbarBusy = true;
    clearTimeout(this.toolbarTimer);
  };

  setToolbarFree = () => {
    setTimeout(() => {
      this.toolbarBusy = false;
    }, 50);
  };

  toggleToolbar = () => {
    const { remoteMode, hidden } = this.state;
    if ( remoteMode ) {
      return;
    }
    clearTimeout(this.toolbarTimer);
    if (hidden) {
      this.setState({ hidden: false });
    }
    if (!this.toolbarBusy) {
      this.toolbarTimer = setTimeout(() =>
        this.setState({ hidden: true }),
        this.limits.toolbarHideDelay
      );
    }
  };

  toggleSteppedAnimationFlow = e => {
    const flow = parseInt(getComputedStyle(e.target).left) < 0;
    const { settings, odd } = this.state;
    const { steps } = settings;
    if (flow === odd) {
      return;
    }
    if (steps >= 1) {
      this.setState({
        odd: flow,
       });
    }
  }

  hapticBump = () => {
    generateSound({ pitch: 100, gain: 0.2, duration: 50 });
  };

  ping = e => {
    const { odd, settings: { pitch, steps, volume: gain } } = this.state;
    const { audioPanRange } = this.limits;
    this.toggleSteppedAnimationFlow(e);
    if (Number(gain) === 0 ) {
      return;
    }
    const twoStepReverse = Number(steps) !== 2 ? 1 : -1;
    const panX = (odd ? audioPanRange : -audioPanRange) * twoStepReverse;
    generateSound({ panX, pitch, gain, duration: 70 });
  };

  updateTimeOffset() {
    const { length, speed } = this.state.settings;
    const distance = window.innerWidth * length / 100;
    const position = parseInt(this.targetPosition);
    const absolutePosition = position + distance;
    const totalDistance = distance * 2;
    const percentComplete = absolutePosition / totalDistance;
    const offset = speed * percentComplete;
    this.timeOffset = -offset;
  }

  togglePlay = () => {
    const { playing } = this.state.settings;
    // if (playing) {
    //   this.updateTimeOffset();
    // } else {
    //   this.sendMessageToRemote({ action: 'resetClock' });
    // }
    // this.sendMessageToRemote({ action: 'updateClock' });
    this.updateMainAnimation(!playing);
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
            onClick={this.togglePlay}
            onAnimationIteration={this.ping}
          >
            <div className="bullseye"></div>
          </div>
        </div>
        {!this.isMini &&
          <iframe
            title="remote"
            name="remote"
            className={classNames('toolbar', { hidden, remoteMode })}
            src="./embedded"
            ref={this.setRef.bind(this, 'toolbar')}
          />
        }
      </div>
    );
  }
}
