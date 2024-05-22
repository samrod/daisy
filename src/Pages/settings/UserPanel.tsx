import CloseButton from '../../components/Button';
import { Card } from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import './UserPanel.scss';
import Account from './Account';
import Link from './Link';
import { useState } from 'react';

interface UserPanelProps {
  toggleUserPanel: () => void;
}

export default function UserPanel({ toggleUserPanel }: UserPanelProps) {
  const [key, setKey] = useState("account");

  return (
    <div className="user-panel">
      <CloseButton action={toggleUserPanel} klass="close">&#10006;</CloseButton>
      <Card>
        <Card.Body>
          <Tabs activeKey={key} onSelect={setKey}>
            <Tab eventKey="account" title="Account">
              <Account />
            </Tab>
            <Tab eventKey="link" title="Custom Link">
              <Link />
            </Tab>
            <Tab eventKey="presets" title="Presets">
              <h4 className="text-center mt-3 mb-3">Preset Settings</h4>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};
