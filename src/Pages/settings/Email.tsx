import { useState, useCallback, FormEvent } from 'react'

import { useAuth } from '../../context/AuthContext';
import { getAuth, updateEmail, createUpdateEmail as updateEmailFB } from "state";
import { Alert, Button, Col, Row, TextGroup } from '../../components';
import Styles from "./UserPanel.module.scss";

export const Email = () => {
  const { logout, getFormHandlers } = useAuth();
  const { currentUser } = getAuth();
  const [email, setEmail] = useState(currentUser?.email);
  const [error, setError] = useState('');
  const [validEmail, setValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  const { onChangeEmail } = getFormHandlers({ setEmail });

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    if (email && email !== currentUser?.email) {
      updateEmail(currentUser, email).then(() => {
        updateEmailFB(currentUser, email);
      }).catch((e) => {
        setError(e.message);
        setLoading(false);
      });
    }
  }, [currentUser, email]);

  return (
    <Col cols={4} as="form" justify="start" klass={Styles.form} onSubmit={handleSubmit}>
      <h3 className="text-center">Update Your Email Address</h3>
      <Alert>{error}</Alert>
      <TextGroup
        label="Email"
        textProps={{
          setValid: setValidEmail,
          type: "email",
          error: !validEmail,
          onChange: onChangeEmail,
          defaultValue: currentUser?.email,
        }}
      />
      <Row>
        <Button onClick={logout} variant="success">LOGOUT</Button>
        <Button disabled={loading || !validEmail} type="submit">UPDATE</Button>
      </Row>
    </Col>
  )
};
