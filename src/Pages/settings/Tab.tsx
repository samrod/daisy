import Tab from 'react-bootstrap/Tab';

import * as SettingComponents from './';
import './UserPanel.scss';

export const CustomTab = (key: string, index: number) => {
  const ThisTab = SettingComponents[key]
  return (
    <Tab key={`tab-${index}`} eventKey={key.toLowerCase()} title={key}>
      <ThisTab />
    </Tab>
  );
};
