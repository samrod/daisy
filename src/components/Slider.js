import React from "react";

const Slider = ({ name, label=true, min, max, step=1, value, onMouseUp=() => true, onChange, ...props }) => {
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
        max={max}
        min={min}
        onMouseUp={onBlur}
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
