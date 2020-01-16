import React from "react";

const Slider = ({ name, label=true, min, max, step=1, value, onMouseUp=() => true, onChange }) => {
  return (
    <div className="slider">
      {label && name}
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
      />
    </div>
  );
};

export default Slider;
