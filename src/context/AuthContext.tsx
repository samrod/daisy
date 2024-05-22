import { ChangeEvent, Dispatch, createContext, useContext, useEffect, useRef, useState } from 'react';
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
import { createUser, createUpdateEmail as updateEmailFBRT, captureLogin, getUserData, getData } from "../lib/store";
import { useStore } from '../lib/state';
import { isEmpty } from 'lodash';

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
  const presetsBoundToStore = useRef(false);
  const settingsBoundToStore = useRef(false);
  const { settings, setSetting, presets, activePreset, setUserMode, setActivePreset, setPresets, setUser } = useStore();
  const [currentUser, setCurrentUser] = useState<User>();
  const [loading, setLoading] = useState(true);

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

  const updateSettingFromFirebase = (key: string) => (val) => {
    // console.log(`*** ${document.location.pathname} FB Update:`, key, val);
    setSetting(key, val);
  };

  const bindSettingToValue = (key: string) => {
    getData({ path: `presets/${activePreset}`, key, callback: updateSettingFromFirebase(key) })
  };

  useEffect(() => {
    if (settingsBoundToStore.current || isEmpty(presets)) {
      return;
    }
    Object.keys(settings).forEach(bindSettingToValue);
    settingsBoundToStore.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [presets]);

  useEffect(() => {
    if (!currentUser?.uid || presetsBoundToStore.current) {
      return;
    }

    getUserData({ key: "activePreset", callback: setActivePreset });
    getUserData({ key: "userMode", callback: setUserMode });
    getUserData({ key: `presets`, callback: setPresets });

    presetsBoundToStore.current = true;
  }, [activePreset, currentUser, presets, setActivePreset, setPresets, setUserMode]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setLoading(false);
      setCurrentUser(user);
      setUser(user);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
};
