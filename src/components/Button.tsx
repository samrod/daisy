import { MouseEventHandler, PropsWithChildren } from 'react';
import { Icon } from '.';
import './Button.scss';

interface ButtonProps {
  leftIcon?: string;
  rightIcon?: string;
  action: MouseEventHandler<HTMLDivElement>;
  tip?: string;
  klass: string;
}

export const Button = ({ children, leftIcon, rightIcon, action, tip, klass }: PropsWithChildren<ButtonProps>) => {
  return (
    <div className={`button ${klass}`} onClick={action}>
      <Icon name={leftIcon} />
      {children}
      <Icon name={rightIcon} />
      {tip && <div className="tip">{tip}</div>}
    </div>
  );
};
