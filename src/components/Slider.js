import React from "react";

const Slider = ({ name, label=true, min, max, step=1, value, onMouseUp=() => true, onChange, ...props }) => {
  return (
    <div className="slider">
      {label && name}: {value}
      <input
        className="valueSlider"
        data-action={name}
        max={max}
        min={min}
        onMouseUp={onMouseUp}
        onChange={onChange}
        step={step}
        type="range"
        value={value}
        {...props}
      />
    </div>
  );
};

export default Slider;
