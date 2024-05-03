import { useState } from 'react'
import { Link } from "react-router-dom";
import { Alert, Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Layout from "./Layout";

export default function ForgotPassword() {
  const { resetPassword, getFormHandlers } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // const history = useHistory();

  const { onChangeEmail } = getFormHandlers({ setEmail });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions.');
    } catch(e) {
      setError('Password reset failed');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Password Reset</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="emai">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" onChange={onChangeEmail} required />
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">Reset Password</Button>
            <div className="w-100 text-center mt-3">
              <Link to="/login">Login</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an accont? <Link to="/signup">Sign Up</Link>
      </div>
    </Layout>
  )
}
