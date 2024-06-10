import { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { Alert, Form, Button, Card } from 'react-bootstrap';

import { useAuth } from '../../context/AuthContext';
import Layout from "./Layout";

export default function Signup() {
  const { signup, getFormHandlers } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { onChangeEmail, onChangePassword, onChangeConfirm } = getFormHandlers({ setEmail, setPassword, setConfirm });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirm) {
      return setError('Passwords don\'t match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch({ message }) {
      setError(message);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Sign up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="emai">
              <Form.Label>Email</Form.Label>
              <Form.Control autoComplete="email" type="email" onChange={onChangeEmail} required />
            </Form.Group>

            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control autoComplete="new-password" type="password" onChange={onChangePassword} required />
            </Form.Group>

            <Form.Group id="confirm">
              <Form.Label>Confirm</Form.Label>
              <Form.Control autoComplete="new-password" type="password" onChange={onChangeConfirm} required />
            </Form.Group>

            <Button disabled={loading} className="w-100" type="submit">Sign Up</Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Already have an accont? <Link to="/login">Log in</Link>
      </div>
    </Layout>
  )
}
