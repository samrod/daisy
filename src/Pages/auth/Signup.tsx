import { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from '../../context/AuthContext';
import Layout from "./Layout";
import { Alert, Button, Row, TextGroup } from '../../components';

export default function Signup() {
  const { signup, getFormHandlers } = useAuth();
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);
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
          <h2 className="text-center mb-4">Sign up</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextGroup
              label="Email"
              textProps={{
                type: "email",
                error: !validEmail,
                onChange: onChangeEmail,
                setValid: setValidEmail,
              }}
            />

            <TextGroup
              label="Password"
              textProps={{
                type: "password",
                autoComplete: "new-password",
                onChange: onChangePassword,
              }}
            />

            <TextGroup
              label="Confirm"
              textProps={{
                type: "password",
                autoComplete: "new-password",
                onChange: onChangeConfirm,
              }}
            />
            <Row>
              <Button disabled={loading} type="submit">Sign Up</Button>
            </Row>
          </form>
      <div className="w-100 text-center mt-2">
        Already have an accont? <Link to="/login">Log in</Link>
      </div>
    </Layout>
  )
}
