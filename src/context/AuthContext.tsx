import { ChangeEvent, Dispatch, createContext, useContext, useEffect, useState } from 'react';
import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User,
  updateEmail,
  updatePassword,
} from 'firebase/auth';

import { auth } from '../lib/firebase';
import { createUser, createUpdateEmail as updateEmailFBRT, captureLogin } from "../lib/store";

const AuthContext = createContext({});

interface FormHandlerProps {
  setEmail?: Dispatch<React.SetStateAction<string>>;
  setPassword?: Dispatch<React.SetStateAction<string>>;
  setConfirm?: Dispatch<React.SetStateAction<string>>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setLoading(false);
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    logout: () => signOut(auth),
    login: async (email: string, password: string) => {
      const user = await signInWithEmailAndPassword(auth, email, password);
      captureLogin(user);
    },
    signup: async (email: string, password: string) => {
      const newUser = await createUserWithEmailAndPassword(auth, email, password);
      createUser(newUser.user);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
};
