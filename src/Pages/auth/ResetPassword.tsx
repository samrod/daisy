import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Layout from "./Layout";
import { Alert, Button, Row, TextGroup } from "../../components";

export default function ResetPassword() {
  const { resetPassword, getFormHandlers } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validEmail, setValidEmail] = useState(true);
  const history = useNavigate();

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
      <h2 className="text-center mb-4">Reset Password</h2>
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

        <Row>
          <Button disabled={loading} type="submit">Login</Button>
        </Row>
      </form>
      <div className="w-100 text-center mt-2">
        Need an accont? <Link to="/signup">Sign Up</Link>
      </div>
    </Layout>
  )
}
