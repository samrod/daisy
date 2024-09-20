import { useState, useCallback, FormEvent, useEffect, useRef } from "react"
import { isEmpty } from "lodash";

import { getAuth, updateEmail, updatePassword, createUpdateEmail as updateEmailFB } from "state";
import { Alert, Button, TextGroup, Col } from "components";
import { useAuth } from "context/AuthContext";
import Styles from "./UserPanel.module.scss";

export const Account = () => {
  const { getFormHandlers } = useAuth();
  const { currentUser } = getAuth();
  const [email, setEmail] = useState(currentUser?.email);
  const [password, setPassword] = useState(currentUser["password"]);
  const [confirm, setConfirm] = useState(currentUser["password"]);
  const [alert, setAlert] = useState("");
  const [validEmail, setValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [disabled, setDisabled] = useState(true);

  const passwordsMatch = useRef(true);
  const emailChanged = useRef(false);

  const { onChangeEmail, onChangePassword, onChangeConfirm } = getFormHandlers({ setPassword, setConfirm, setEmail });

  const showAlert = (message: string, type: string) => {
    setAlertType(type);
    setAlert(message);
    setTimeout(setAlert.bind(null, ""), 15000);
  };

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!passwordsMatch.current) {
      showAlert("Passwords don't match", "warn");
      return e;
    }

    setAlert("");
    
    setLoading(true);
    if (passwordsMatch.current) {
      updatePassword(currentUser, password).then(() => {
        showAlert("Password updated successfully.", "success");
      }).catch((e) => {
        showAlert(e.message, "error");
      }).finally(() => {
        setLoading(false);
      });
    }

    if (emailChanged) {
      updateEmail(currentUser, email).then(() => {
        updateEmailFB(currentUser, email);
        showAlert("Email updated successfully.", "success");
      }).catch((e) => {
        showAlert(e.message, "error");
      }).finally(() => {
        setLoading(false);
      });
    } else {
      showAlert("This is your current email address.", "warn");
      setLoading(false);
    }
  }, [email, currentUser, password]);

  useEffect(() => {
    const passConfirmEmpty = isEmpty(confirm) || isEmpty(password)
    passwordsMatch.current = confirm === password;
    emailChanged.current = !isEmpty(email) && email !== currentUser?.email;
    setDisabled(loading || (!emailChanged.current && !(!passConfirmEmpty && passwordsMatch.current)));
  }, [loading, email, confirm, password, currentUser.email]);

  return (
    <Col as="form" cols={4} klass={Styles.form} onSubmit={handleSubmit}>
      <h4 className="text-center">Change email or password</h4>
      <input className="hidden" type="text" name="username" autoComplete="username" />
      <Alert persist variant={alertType}>{alert}</Alert>
      <TextGroup
        label="Email"
        inline
        textProps={{
          setValid: setValidEmail,
          type: "email",
          error: !validEmail,
          onChange: onChangeEmail,
          defaultValue: currentUser?.email,
          autoFocus: true,
        }}
      />
      <TextGroup
        label="Password"
        inline
        textProps={{
          type: "password",
          autoComplete: "new-password",
          onChange: onChangePassword,
          placeholder: "Leave blank to keep current",
        }}
      />

      <TextGroup
        label="Confirm"
        inline
        textProps={{
          type: "password",
          error: !passwordsMatch.current,
          autoComplete: "new-password",
          onChange: onChangeConfirm,
          placeholder: "Leave blank to keep current",
        }}
      />
      <Button disabled={disabled} loading={loading} type="submit">UPDATE</Button>
    </Col>
  )
}
