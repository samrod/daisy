import { useState, useCallback, FormEvent } from "react"

import { getAuth, updatePassword } from "state";
import { Alert, Button, TextGroup, Row, Col } from "components";
import { useAuth } from "context/AuthContext";
import Styles from "./UserPanel.module.scss";

export const Password = () => {
  const { getFormHandlers } = useAuth();
  const { currentUser } = getAuth();
  const [password, setPassword] = useState(currentUser["password"]);
  const [confirm, setConfirm] = useState(currentUser["password"]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { onChangePassword, onChangeConfirm } = getFormHandlers({ setPassword, setConfirm });

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords don't match");
      return e;
    }

    setLoading(true);
    setError("");

    if (password && password !== currentUser["password"]) {
      const result = await updatePassword(currentUser, password);
      console.log("*** result: ", result);
    }
  }, [currentUser, password, confirm]);

  return (
    <Col as="form" cols={4} klass={Styles.form} onSubmit={handleSubmit}>
      <h3 className="text-center">Change Your Password</h3>
      <input className="hidden" type="text" name="username" autoComplete="username" />
      <Alert variant="warn">{error}</Alert>
      <TextGroup
        label="Password"
        textProps={{
          type: "password",
          autoComplete: "new-password",
          onChange: onChangePassword,
          placeholder: "Leave blank to keep current",
        }}
      />

      <TextGroup
        label="Confirm Password"
        textProps={{
          type: "password",
          autoComplete: "new-password",
          onChange: onChangeConfirm,
          placeholder: "Leave blank to keep current",
        }}
      />
      <Row>
        <Button disabled={loading} type="submit">UPDATE</Button>
      </Row>
    </Col>
  )
}
