import { useState, useCallback, FormEvent, ChangeEvent } from 'react'
import { Alert, Form, Button, Row } from "react-bootstrap";
import { getAuth, updateEmail, updatePassword } from "firebase/auth";

import { useAuth } from '../../context/AuthContext';
import { createUpdateEmail as updateEmailFB } from "../../lib/store";

interface UpdateAccountProps {
  onClose: () => void;
}

const UpdateAccount = ({ onClose }: UpdateAccountProps) => {
  const { logout, getFormHandlers } = useAuth();
  const { currentUser } = getAuth();
  const [email, setEmail] = useState(currentUser?.email);
  const [password, setPassword] = useState(currentUser?.password);
  const [confirm, setConfirm] = useState(currentUser?.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { onChangeEmail, onChangePassword, onChangeConfirm } = getFormHandlers({ setEmail, setPassword, setConfirm });

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirm) {
      setError('Passwords don\'t match');
      return e;
    }

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
    if (password && password !== currentUser?.password) {
      const result = await updatePassword(currentUser, password);
      console.log("*** result: ", result);
    }
  }, [currentUser, email, password, confirm, updateEmail, updatePassword, onClose]);

  return (
    <>
      <h4 className="text-center mb-3">Update Account</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="accountForm">
        <Form.Group id="emai">
          <Form.Label>Email</Form.Label>[{email}]
          <Form.Control size="sm" type="email" autoComplete="email" onChange={onChangeEmail} required defaultValue={currentUser?.email} />
        </Form.Group>

        <Form.Group id="password">
          <Form.Label>Password</Form.Label>
          <Form.Control size="sm" type="password" autoComplete="off" onChange={onChangePassword} placeholder="Leave blank to keep current" />
        </Form.Group>

        <Form.Group id="confirm">
          <Form.Label>Confirm</Form.Label>
          <Form.Control size="sm" type="password" autoComplete="off" onChange={onChangeConfirm} placeholder="Leave blank to keep current" />
        </Form.Group>

        <Row>
          <Button size="sm" onClick={logout} variant="success">LOGOUT</Button>
          <Button size="sm" disabled={loading} type="submit">UPDATE</Button>
        </Row>
        </Form>
    </>
  )
}

export default UpdateAccount;
