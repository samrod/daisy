import { useRef, useState, useCallback, FormEventHandler } from 'react'
import { Alert, Form, Button, Row } from "react-bootstrap";
// import Alert from "react-bootstrap/Alert";
// import Form from "react-bootstrap/Form";
// import Button from "react-bootstrap/Button";
// import Row from "react-bootstrap/Row";
import { useAuth } from '../../context/AuthContext';

interface UpdateAccountProps {
  onClose: () => void;
}

const UpdateAccount = ({ onClose }: UpdateAccountProps) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const { currentUser, updateEmail, updatePassword, logout } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback((e): FormEventHandler<HTMLFormElement> => {
    e.preventDefault();

    if (passwordRef.current?.value !== confirmRef.current?.value) {
      setError('Passwords don\'t match');
      return e;
    }

    const promises: string[] = [];
    setLoading(true);
    setError('');

    if (emailRef.current?.value !== currentUser?.email) {
      promises.push(updateEmail(emailRef.current?.value));
    }
    if (passwordRef.current?.value) {
      promises.push(updatePassword(passwordRef.current?.value));
    }

    Promise.all(promises).then(() => {
      onClose();
    }).catch(({ message }) => {
      setError(message);
    }).finally(() => {
      setLoading(false);
    })
    return e;

  }, [currentUser, updateEmail, updatePassword, onClose]);

  return (
    <>
      <h4 className="text-center mb-3">Update Account</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="accountForm">
        <Form.Group id="emai">
          <Form.Label>Email</Form.Label>
          <Form.Control size="sm" type="email" autoComplete="email" ref={emailRef} required defaultValue={currentUser?.email} />
        </Form.Group>

        <Form.Group id="password">
          <Form.Label>Password</Form.Label>
          <Form.Control size="sm" type="password" autoComplete="off" ref={passwordRef} placeholder="Leave blank to keep current" />
        </Form.Group>

        <Form.Group id="confirm">
          <Form.Label>Confirm</Form.Label>
          <Form.Control size="sm" type="password" autoComplete="off" ref={confirmRef} placeholder="Leave blank to keep current" />
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
