import { Dispatch, createContext, useContext, useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash';

import { User, auth } from '../lib/firebase';
import { useGuideState } from "../lib/guideState";
import { getUserData, bindAllSettingsToValues } from "../lib/guideStore";
import { useAuthHandlers } from '../lib/authHandlers';

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
  const { presets, activePreset, setUserMode, setActivePreset, setPresets, setUser } = useGuideState();
  const [currentUser, setCurrentUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  const value = useAuthHandlers(currentUser);

  useEffect(() => {
    if (settingsBoundToStore.current || isEmpty(presets)) {
      return;
    }
    bindAllSettingsToValues();
    settingsBoundToStore.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presets, activePreset]);

  useEffect(() => {
    if (!currentUser?.uid || presetsBoundToStore.current) {
      return;
    }

    getUserData("activePreset", setActivePreset);
    getUserData("userMode", setUserMode);
    getUserData(`presets`, setPresets);

    presetsBoundToStore.current = true;
  }, [activePreset, currentUser, presets, setActivePreset, setPresets, setUserMode]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setLoading(false);
      setCurrentUser(user);
      setUser(user);
    });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
};
