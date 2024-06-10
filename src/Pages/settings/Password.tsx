import { useState, useCallback, FormEvent } from 'react'
import { Alert, Form, Button, Row } from "react-bootstrap";
import { getAuth, updatePassword } from "firebase/auth";

import { useAuth } from '../../context/AuthContext';

export const Password = () => {
  const { logout, getFormHandlers } = useAuth();
  const { currentUser } = getAuth();
  const [password, setPassword] = useState(currentUser?.password);
  const [confirm, setConfirm] = useState(currentUser?.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { onChangePassword, onChangeConfirm } = getFormHandlers({ setPassword, setConfirm });

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirm) {
      setError('Passwords don\'t match');
      return e;
    }

    setLoading(true);
    setError("");

    if (password && password !== currentUser?.password) {
      const result = await updatePassword(currentUser, password);
      console.log("*** result: ", result);
    }
  }, [currentUser, password, confirm]);

  return (
    <>
      <h4 className="text-center mt-3 mb-3">Change Your Password</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="accountForm">
        <Form.Group id="password">
          <Form.Label>Password</Form.Label>
          <Form.Control size="sm" type="password" autoComplete="new-password" onChange={onChangePassword} placeholder="Leave blank to keep current" />
        </Form.Group>

        <Form.Group id="confirm">
          <Form.Label>Confirm</Form.Label>
          <Form.Control size="sm" type="password" autoComplete="new-password" onChange={onChangeConfirm} placeholder="Leave blank to keep current" />
        </Form.Group>

        <Row>
          <Button size="sm" onClick={logout} variant="success">LOGOUT</Button>
          <Button size="sm" disabled={loading} type="submit">UPDATE</Button>
        </Row>
        </Form>
    </>
  )
}
