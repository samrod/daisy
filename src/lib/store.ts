import { ref, set, query, onValue, push, equalTo, orderByChild, get, limitToLast } from "firebase/database";

import { db } from "./firebase";
import { User } from "firebase/auth";
import { DEFAULT_PRESET_NAME, defaults } from "./constants";
import { useStore } from "./state";

type Setting = string | number | boolean;

interface CreatePreset {
  settings?: typeof defaults;
  name?: string;
}

interface GetData {
  key: string;
  callback: (setting: boolean | string | object) => void;
  path?: string;
  debug?: boolean;
}

const executeCallback = ({ key, path, callback, debug }: GetData) => (snapshot) => {
  const val = snapshot.val();
  if ((typeof val).match(/undefined|null/i) ) {
    console.warn(`*** ${key} returned "${val}" from ${path}/${key}`);
    return;
  }
  if (debug) {
    console.log(`*** ${key} returned "${val}" from ${path}`);
  }
  callback(val)
};

export const getData = (params: GetData) => {
  const { path, key} = params;
  const keyRef = ref(db, `${path}/${key}`);
  return onValue(keyRef, executeCallback(params));
};

export const getUserData = ({ key, callback, debug }: GetData) => {
  const { user: { uid } } = useStore.getState();
  if (!uid) {
    return;
  }
  const path = `/users/${uid}`;
  return getData({ path, key, callback, debug });
};

export const isUniqueUserProp = async (key: string, value: string) => {
  if (!key || value === undefined || value === null) {
    return "Invalid key or value";
  }
  const queryRef = query(
    ref(db, "users"),
    orderByChild(key),
    equalTo(value),
  );
  try {
    const snapshot = await get(queryRef);
    return !snapshot.exists();
  } catch (error) {
    return error;
  }
};

export const createUser = (user: User) => {
  createUpdateEmail(user);
  captureLogin({ user });
  createPreset({});
};

export const updateUser = (key: string, value: Setting) => {
  const { user } = useStore.getState();
  set(ref(db, `users/${user.uid}/${key}`), value);
};

export const updateSetting = (setting: string, value: Setting | { [key: string]: Setting }) => {
  const { activePreset } = useStore.getState();
  set(ref(db, `presets/${activePreset}/${setting}`), value);
};

export const togglePlay = () => {
  const { settings: { playing } } = useStore.getState();
  updateSetting("playing", !playing);
};

export const createPreset = ({ settings = defaults, name = DEFAULT_PRESET_NAME }: CreatePreset) => {
  const presetId = crypto.randomUUID();

  updateUser(`presets/${presetId}`, name);
  updateUser("activePreset", presetId);
  updateSetting(presetId, settings);
};

export const createUpdateEmail = (user: User, newEmail?: string) => {
  const { uid } = user;
  const email = user.email || newEmail;
  const usersRef = ref(db, `users/${uid}/email`);
  set(usersRef, email);
};

export const captureLogin = ({ user }) => {
  const { uid, metadata: { lastSignInTime } } = user;
  const loginListRef = ref(db, `users/${uid}/logins`);
  const newLoginRef = push(loginListRef)
  set(newLoginRef, lastSignInTime);
};
