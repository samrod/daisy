import { useRef, useState } from 'react'
import { Link, useHistory } from "react-router-dom";
import { Alert, Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Layout from "./Layout";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      setLoading(false);
      history.push('/');
    } catch({ code, message }) {
      if ( code.match(/not-found/gi)) {
        setError('Email or password not found.');
      } else {
        setError(message);
      }
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Log in</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="emai">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>

            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} required />
            </Form.Group>

            <Button disabled={loading} className="w-100" type="submit">Login</Button>
              <div className="w-100 text-center mt-3">
                <Link to="forgot-password">Forgot password?</Link>
              </div>
          </Form>
        </Card.Body>
      </Card>
        <div className="w-100 text-center mt-2">
          Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </Layout>
  )
}
