import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { limits } from '../lib/constants';
import { sendMessage } from "../lib/utils";

interface SliderProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  name: string;
  label?: boolean | string;
}

export const Slider = ({ name, label, value, ...props }: SliderProps) => {
  const title = (label || name).toString();
  const { onMouseUp, onChange } = props;

  const onFocus = () => {
    sendMessage({ action: "setActiveSetting", params: name }, undefined, window.location.href);
  };

  const onBlur = e => {
    e.target.blur();
    (window.opener || window.parent).focus();
    onMouseUp && onMouseUp.call(this, e);
    sendMessage({ action: "setActiveSetting", params: "" }, undefined, window.location.href);
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
        onMouseDown={onFocus}
        onMouseUp={onBlur}
        onChange={onChange}
        type="range"
        value={value}
      />
    </div>
  );
};
