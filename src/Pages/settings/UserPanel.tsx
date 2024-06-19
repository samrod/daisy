import { MouseEventHandler, useState } from "react";

import { useGuideState } from "../../lib/guideState";
import { Button as CloseButton, Tabs } from "../../components";
import * as SettingComponents from "./";
import Styles from "./UserPanel.module.scss";

interface UserPanelProps {
  toggleUserPanel: MouseEventHandler<HTMLButtonElement>;
}

const panels = [ "Email", "Password", "Link", "Presets"];

export const UserPanel = ({ toggleUserPanel }: UserPanelProps) => {
  const { userMode } = useGuideState(state => state);
  const [tab, setTab] = useState("email");

  const onTabClick = ({ target }) => {
    setTab(target.dataset.option);
  };

  if (!userMode) {
    return null;
  }
  return (
    <div className="user-panel">
      <CloseButton onClick={toggleUserPanel} customClass={Styles.close} variant="black" circle={33}>&#10006;</CloseButton>
      <Tabs.Panels theme="light">
        <Tabs options={panels} state={tab} callback={onTabClick} action="panel" />
          {panels.map((key, index) => {
            const PanelContent = SettingComponents[key]
            return (
              <Tabs.Panel key={`tab-panel-${index}`} klass={Styles.panel} active={tab} title={key}>
                <PanelContent />
              </Tabs.Panel>
            );
          })}
      </Tabs.Panels>
    </div>
  );
};
