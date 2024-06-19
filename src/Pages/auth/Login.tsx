import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import Layout from "./Layout";
import { Alert, Button, TextGroup, Col, Row } from "../../components";

export default function Login() {
  const { login, getFormHandlers } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validEmail, setValidEmail] = useState(true);
  const navigate = useNavigate();

  const { onChangeEmail, onChangePassword } = getFormHandlers({ setEmail, setPassword });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      setLoading(false);
      navigate("/");
    } catch({ code, message }) {
      if ( code?.match(/not-found/gi)) {
        setError("Email or password not found.");
      } else {
        setError(message);
      }
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <h2 className="text-center mb-4">Log in</h2>
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
        <div className="w-100 text-center mt-3">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
      <div className="w-100 text-center mt-2">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </Layout>
  )
}
