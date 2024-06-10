import { useState, useCallback, FormEvent } from 'react'
import { Alert, Form, Button, Row } from "react-bootstrap";
import { getAuth, updateEmail } from "firebase/auth";

import { useAuth } from '../../context/AuthContext';
import { createUpdateEmail as updateEmailFB } from "../../lib/store";

export const Email = () => {
  const { logout, getFormHandlers } = useAuth();
  const { currentUser } = getAuth();
  const [email, setEmail] = useState(currentUser?.email);
  const [error, setError] = useState('');
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
    <>
      <h4 className="text-center mt-3 mb-3">Update Your Email Address</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="accountForm">
        <Form.Group id="email">
          <Form.Label>Email</Form.Label>
          <Form.Control size="sm" type="email" autoComplete="email" onChange={onChangeEmail} required defaultValue={currentUser?.email} />
        </Form.Group>

        <Row>
          <Button size="sm" onClick={logout} variant="success">LOGOUT</Button>
          <Button size="sm" disabled={loading} type="submit">UPDATE</Button>
        </Row>
        </Form>
    </>
  )
}
