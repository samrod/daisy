import { MouseEventHandler } from 'react'
import cn from 'classnames';

import Styles from "./Tabs.module.scss";

interface TabsProps {
  options: string[];
  callback: MouseEventHandler<HTMLDivElement>;
  state: string;
  action: string;
  size?: string;
}

const Tabs = ({ options, action, callback, state, size }: TabsProps) => {
  const tab = (label: string, index: number) => {
    const option = label.toLowerCase();

    return (
      <div
        key={`tab-${index}`}
        onClick={callback}
        data-action={action}
        data-option={option}
        className={cn(Styles.tab, size, { active: state === option })}
      >
        {label}
      </div>
    )
  };

  return (
    <div className={Styles.tabs}>
      {options.map(tab)}
    </div>
  );
};

Tabs.Panels = ({ children, theme = "dark" }) => (
  <div className={cn(Styles.tabPanels, Styles[theme])}>
    {children}
  </div>
);

Tabs.Panel = ({ active, title, klass = "", children }) => {
  return (
    <div className={cn(Styles.tabPanel, klass, { active: title.toLowerCase() === active })}>
      {children}
    </div>
  )
}

export { Tabs };
