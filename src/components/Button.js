import React, { Component } from 'react';
import Icon from './Icons';
import './Button.scss';

export default class Button extends Component {
  render() {
    const { children, leftIcon, rightIcon, action, tip, klass } = this.props;
    return (
      <div className={`button ${klass}`} onClick={action}>
        <Icon name={leftIcon} />
        {children}
        <Icon name={rightIcon} />
        {tip && <div className="tip">{tip}</div>}
      </div>
    )
  }
}
