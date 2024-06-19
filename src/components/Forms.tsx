import { InputHTMLAttributes, ButtonHTMLAttributes, FC, ReactElement, MouseEventHandler, useState, ChangeEvent, useCallback, SetStateAction, Dispatch, useRef } from "react";
import { RotatingLines } from "react-loader-spinner";
import { camelCase, isEmpty, noop } from "lodash";
import cn from "classnames";
import validator from "validator";

import { Icon } from ".";
import Styles from "./Forms.module.scss";

interface FormElementProps {
  klass?: string;
  customClass?: string | boolean;
  variant?: string;
  size?: string;
  stretch?: boolean;
  error?: boolean;
}

interface ButtonProps extends FormElementProps, ButtonHTMLAttributes<HTMLButtonElement>  {
  leftIcon?: string;
  rightIcon?: string;
  tip?: string;
  circle?: number | boolean;
  loading?: boolean;
  value?: string;
  disabled?: boolean;
  action?: (e:MouseEventHandler<HTMLButtonElement>) => void;
};

export const Button: FC<ButtonProps> = ({
  children,
  leftIcon,
  rightIcon,
  tip,
  klass,
  circle = false,
  variant = "standard",
  value,
  size = "md",
  customClass = false,
  stretch = false,
  loading = false,
  disabled = false,
  ...props
}) => {

  let rounded = "";
  let style = {};

  if (circle) {
    rounded = "rounded-full";
    style["width"] = `${circle}px`;
    style["height"] = `${circle}px`;
  };

  const classes = cn(
    customClass || Styles.button,
    klass,
    rounded,
    variant,
    size,
    stretch && "w-full",
  );

  return (
    <button
      className={classes}
      style={style}
      disabled={disabled || loading}
      {...props as ButtonHTMLAttributes<HTMLButtonElement>}
    >
      {leftIcon && <Icon name={leftIcon} />}
      {children || value}
      {rightIcon && <Icon name={rightIcon} />}
      {tip && <div className="tip">{tip}</div>}
      {loading && (
        <div className={Styles.spinner}>
          <RotatingLines
            width="24"
            strokeColor="white"
            strokeWidth="3"
            animationDuration="0.25s"
          />
        </div>      
      )}
    </button>
  );
};


interface TextfieldProps extends FormElementProps, Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  setValid?: Dispatch<SetStateAction<boolean>>;
};

export const Textfield: FC<TextfieldProps> = ({
  size = "md",
  stretch,
  customClass,
  klass,
  type,
  onChange,
  setValid = noop,
  autoComplete,
  error = false,
  ...props
}) => {
  const field = useRef<HTMLInputElement>();
  const classes = cn(
    customClass || Styles.textfield,
    klass,
    size,
    {
      error,
      "w-full": stretch,
    }
  );

  const _onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (type === "email") {
      checkEmail();
    }
    onChange(e);
  }, []);

  const checkEmail = () => {
    if (field.current) {
      if (isEmpty(field.current.value)) {
        setValid(true);
        return;
      }
      setValid(validator.isEmail(field.current.value));
    }
  };

  return (
    <input
      ref={field}
      className={classes}
      type={type}
      autoComplete={autoComplete || type==="email" ? "email" : ""}
      onChange={_onChange}
      {...props}
    />
  );
};

interface LabelProps {
  name: string;
  klass?: string;
  size?: string;
  children: ReactElement | string;
}

export const Label: FC<LabelProps> = ({ name, size="md", children, klass = "" }) => {
  return (
    <label className={cn(Styles.label, size, klass)} htmlFor={name}>
      {children}
    </label>
  );
};

interface TextGroupProps {
  name?: string;
  size?: string;
  label: string;
  inline?: boolean;
  textProps: TextfieldProps;
}

export const TextGroup: FC<TextGroupProps> = ({ name, size="md", label, inline = false, textProps, ...props }) => {
  const _name = name || camelCase(label);

  return (
    <div className={cn(Styles.textGroup, inline ? "justify-between items-center" : "flex-col")}>
      <Label klass="flex-1" name={_name} size={size}>{label}:</Label>
      <Textfield klass={inline && "w-9/12"} id={_name} name={_name} size={size} {...textProps} />
    </div>
  );
};

interface AlertProps {
  size?: string;
  variant?: string;
  title?: string;
  children: ReactElement | string;
}

export const Alert = ({ size = "md", variant = "error", title, children }: AlertProps) => {
  if (!children) {
    return null;
  }
  return (
    <div className={cn(Styles.alert, variant, size)}>
      {title && <h5>{title}</h5>}
      {children}
    </div>
  );
};
