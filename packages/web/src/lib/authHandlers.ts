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

import { auth, DB_GUIDES, readPropValue } from "@/lib";
import { captureLogin, createGuide, createUpdateEmail as updateEmailFBRT } from "@/state";

export interface FormHandlerProps {
  setEmail?: Dispatch<React.SetStateAction<string>>;
  setPassword?: Dispatch<React.SetStateAction<string>>;
  setConfirm?: Dispatch<React.SetStateAction<string>>;
}

export interface FormEventHandlers {
  onChangeEmail: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeConfirm: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const useAuthHandlers = (currentUser: User | null) => ({
  currentUser,
  logout: () => signOut(auth),
  login: async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    try {
      const guideExists = await readPropValue(DB_GUIDES, credential.user.uid);
      if (!guideExists) {
        await createGuide(credential.user);
      } else {
        await captureLogin(credential);
      }
    } catch (e) {
      await createGuide(credential.user);
    }
  },
  signup: async (email: string, password: string) => {
    const newUser = await createUserWithEmailAndPassword(auth, email, password);
    await createGuide(newUser.user);
  },
  updateEmail: (email: string) => {
    updateEmail(currentUser, email);
    updateEmailFBRT(currentUser);
  },
  resetPassword: async (email: string) => await sendPasswordResetEmail(auth, email),
  updatePassword: (password: string) => updatePassword(currentUser, password),

  getFormHandlers: ({ setEmail, setPassword, setConfirm }: FormHandlerProps): FormEventHandlers => ({
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
