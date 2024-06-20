import { MouseEventHandler, useState } from "react";

import { useGuideState } from "../../lib/guideState";
import { Button as CloseButton, Tabs } from "../../components";
import * as SettingComponents from "./";
import Styles from "./UserPanel.module.scss";

const panels = [ "Email", "Password", "Link", "Presets"];

export const UserPanel = ({ exists }) => {
  const { userMode, setUserMode } = useGuideState(state => state);
  const [tab, setTab] = useState("email");

  const onTabClick = ({ target }) => {
    setTab(target.dataset.option);
  };

  if (!exists) {
    return null;
  }

  return (
    <div className="user-panel">
      <CloseButton onClick={setUserMode} customClass={Styles.close} variant="black" circle={33}>&#10006;</CloseButton>
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
