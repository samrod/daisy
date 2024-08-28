import { useState } from "react";

import { Button as CloseButton, Tabs } from "components";
import { getAuth, useGuideState } from "state";
import * as SettingComponents from "./";
import Styles from "./UserPanel.module.scss";

const panels = [ "Email", "Password", "Link", "Presets"];

export const UserPanel = ({ exists }) => {
  const { currentUser } = getAuth();
  const { setUserMode } = useGuideState(state => state);
  const [tab, setTab] = useState("presets");

  const onTabClick = ({ target }) => {
    setTab(target.dataset.option);
  };

  if (!exists || !currentUser) {
    return null;
  }

  return (
    <div className="user-panel">
      <CloseButton onClick={setUserMode} customClass={Styles.close} variant="black" circle={33} value="&#10006;" />
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
