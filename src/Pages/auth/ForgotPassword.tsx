import { useState } from 'react'
import { Link } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from '../../context/AuthContext';
import { Alert, Button, Row, TextGroup } from '../../components';

export default function ForgotPassword() {
  const { resetPassword, getFormHandlers } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [validEmail, setValidEmail] = useState(true);

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
      <h2 className="text-center mb-4">Password Reset</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
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
        <Row>
          <Button disabled={loading} type="submit">Reset Password</Button>
        </Row>
        <div className="w-100 text-center mt-3">
          <Link to="/login">Login</Link>
        </div>
      </form>
      <div className="w-100 text-center mt-2">
        Need an accont? <Link to="/signup">Sign Up</Link>
      </div>
    </Layout>
  )
}
