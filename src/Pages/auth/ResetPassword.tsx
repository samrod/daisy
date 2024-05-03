import { useState } from 'react'
import { Link, useHistory } from "react-router-dom";
import { Alert, Form, Button, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Layout from "./Layout";

export default function ResetPassword() {
  const { resetPassword, getFormHandlers } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const { onChangeEmail, onChangePassword } = getFormHandlers({ setEmail, setPassword });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await resetPassword(email, password);
      history.push('/app');
    } catch(e) {
      setError('Password reset failed');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Reset Password</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="emai">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" required onChange={onChangeEmail} />
            </Form.Group>

            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" required onChange={onChangePassword} />
            </Form.Group>

            <Button disabled={loading} className="w-100" type="submit">Login</Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Need an accont? <Link to="/signup">Sign Up</Link>
      </div>
    </Layout>
  )
}
