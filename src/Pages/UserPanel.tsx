import React from 'react';
import CloseButton from '../components/Button';
import { Card } from 'react-bootstrap';
import './UserPanel.scss';
import Account from './auth/Account';

interface UserPanelProps {
  toggleUserPanel: () => void;
}

export default function UserPanel({ toggleUserPanel }: UserPanelProps) {

  return (
    <div className="user-panel">
      <CloseButton action={toggleUserPanel} klass="close">&#10006;</CloseButton>
      <Card>
        <Card.Body>
          <Account onClose={toggleUserPanel} />
        </Card.Body>
      </Card>
    </div>
  );
};
