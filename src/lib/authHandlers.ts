import { Dispatch, ChangeEvent } from "react";
import {
  User,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateEmail,
  sendPasswordResetEmail,
  updatePassword
} from "firebase/auth";

import { auth } from "./firebase";
import { captureLogin, createGuide, createUpdateEmail as updateEmailFBRT } from "../state";

interface FormHandlerProps {
  setEmail?: Dispatch<React.SetStateAction<string>>;
  setPassword?: Dispatch<React.SetStateAction<string>>;
  setConfirm?: Dispatch<React.SetStateAction<string>>;
}

export const useAuthHandlers = (currentUser: User) => ({
  currentUser,
  logout: () => signOut(auth),
  login: async (email: string, password: string) => {
    const user = await signInWithEmailAndPassword(auth, email, password);
    captureLogin(user);
  },
  signup: async (email: string, password: string) => {
    const newUser = await createUserWithEmailAndPassword(auth, email, password);
    await createGuide(newUser.user);
  },
  updateEmail: (email: string) => {
    updateEmail(currentUser, email);
    updateEmailFBRT(currentUser);
  },
  resetPassword: (email: string) => sendPasswordResetEmail(auth, email),
  updatePassword: (password: string) => updatePassword(currentUser, password),

  getFormHandlers: ({ setEmail, setPassword, setConfirm }: FormHandlerProps) => ({
    onChangeEmail: ({ target }: ChangeEvent<HTMLInputElement>) => {
      setEmail(target.value);
    },
    onChangePassword: ({ target }: ChangeEvent<HTMLInputElement>) => {
      setPassword(target.value);
    },
    onChangeConfirm: ({ target }: ChangeEvent<HTMLInputElement>) => {
      setConfirm(target.value);
    },
  }),
});
