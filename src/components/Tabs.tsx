import { MouseEventHandler } from 'react'
import cn from 'classnames';

interface TabsProps {
  options: string[];
  callback: MouseEventHandler<HTMLDivElement>;
  state: string;
  action: string;
}

export const Tabs = ({ options, action, callback, state}: TabsProps) => {

  const tab = (label: string, index: number) => {
    const option = label.toLowerCase();

    return (
      <div
        key={`tab-${index}`}
        onClick={callback}
        data-action={action}
        data-option={option}
        className={cn('tab', { active: state === option })}
      >
        {label}
      </div>
    )
  };

  return (
    <div className="tabs">
      {options.map(tab)}
    </div>
  );
};
