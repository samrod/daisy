import React, { Component } from 'react';

export default class Icon extends Component {
  render() {
    const { name } = this.props;
    if (name) {
      return ( <span className={`icon i-${name}`} /> );
    }
    return null;
  }
}
