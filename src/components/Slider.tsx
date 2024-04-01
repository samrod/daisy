import React, { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { limits } from '../lib/constants';

interface SliderProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  name: string;
  label?: boolean | string;
}

const Slider = ({ name, label, value, ...props }: SliderProps) => {
  const title = (label || name).toString();
  const { onMouseUp, onChange } = props;
  const onBlur = e => {
    e.target.blur();
    (window.opener || window.parent).focus();
    onMouseUp && onMouseUp.call(this, e);
  };

  return (
    <div className="slider">
      <label>
        {title}{title.length && `: ${value}`}
      </label>
      <input
        {...props}
        className="valueSlider"
        data-action={name}
        max={limits[name].max}
        min={limits[name].min}
        step={limits[name].step || 1}
        onMouseUp={onBlur}
        onChange={onChange}
        type="range"
        value={value}
      />
    </div>
  );
};

export default Slider;
