import React from "react";
import { limits } from '../common/constants';

const Slider = ({ name, label=true, value, onMouseUp=() => true, onChange, ...props }) => {
  const onBlur = e => {
    e.target.blur();
    (window.opener || window.parent).focus();
    onMouseUp.call(this, e);
  };

  const title = label && name;

  return (
    <div className="slider">
      {title}{title.length && `: ${value}`}
      <input
        className="valueSlider"
        data-action={name}
        max={limits[name].max}
        min={limits[name].min}
        step={limits[name].step || 1}
        onMouseUp={onBlur}
        onChange={onChange}
        type="range"
        value={value}
        {...props}
      />
    </div>
  );
};

export default Slider;
