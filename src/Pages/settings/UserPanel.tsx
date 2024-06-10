import { useState } from 'react';
import { Card } from 'react-bootstrap';
import Tabs from 'react-bootstrap/Tabs';

import { Button as CloseButton } from '../../components';
import { Tab } from './';
import './UserPanel.scss';

interface UserPanelProps {
  toggleUserPanel: () => void;
}

const panels = [ "Email", "Password", "Link", "Presets"];

export const UserPanel = ({ toggleUserPanel }: UserPanelProps) => {
  const [key, setKey] = useState("email");

  return (
    <div className="user-panel">
      <CloseButton action={toggleUserPanel} klass="close">&#10006;</CloseButton>
      <Card>
        <Card.Body>
          <Tabs activeKey={key} onSelect={setKey}>
            {panels.map(Tab)}
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};
