import { MouseEventHandler, PropsWithChildren } from 'react';
import Icon from './Icons';
import './Button.scss';

interface ButtonProps {
  leftIcon?: string;
  rightIcon?: string;
  action: MouseEventHandler<HTMLDivElement>;
  tip?: string;
  klass: string;
}

const Button = ({ children, leftIcon, rightIcon, action, tip, klass }: PropsWithChildren<ButtonProps>) => {
  return (
    <div className={`button ${klass}`} onClick={action}>
      <Icon name={leftIcon} />
      {children}
      <Icon name={rightIcon} />
      {tip && <div className="tip">{tip}</div>}
    </div>
  );
};

export default Button;
