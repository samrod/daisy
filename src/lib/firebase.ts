import { isEmpty } from "lodash";
import { child, get, getDatabase, onValue, push, ref, remove, set } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import "firebase/compat/firestore";
import { useGuideState } from ".";

export const serverStamp = firebase.firestore.Timestamp;
export type { User } from "firebase/auth";
export type Object = string | number | boolean;
export type DataType = Object | { [key: string]: Object | {}};
export interface GetData {
  key: string;
  callback: (setting: number | boolean | string | object) => void;
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

export const deletePropValue = async (path: string, key: string ) => {
  const dataRef = child(ref(db), `${path}/${key}`);
  return await remove(dataRef);
};

export const readPropValue = async (key: string, value: string) => {
  if (!key || value === undefined || value === null) {
    return "Invalid key or value";
  }
  const queryRef = child(ref(db), `${key}/${value}`);
  const snapshot = await get(queryRef);
  if (snapshot.exists()) {
    return snapshot.toJSON();
  }
  return undefined;
};

export const propExists = async (key: string, value: string) => {
  const response = await readPropValue(key, value);
  return typeof response !== "undefined" ? response : false;
};

export const updateData = async (path: string, value:  DataType) => {
  if (isEmpty(path)) {
    console.warn(`*** updateData: missing path`);
    return;
  }
  if (typeof value === "undefined" || value === null) {
    console.warn(`*** updateData: value missing for ${path}`)
    return;
  }
  await set(ref(db, path), value);
};

export const pushData = async(path: string, value: DataType) => {
  const loginListRef = ref(db, path);
  const newLoginRef = push(loginListRef)
  if (!value) {
    console.warn(`*** pushData: value undefined for ${path}`)
    return;
  }
  await set(newLoginRef, value);
};

const updateSettingFromFirebase = (key: string) => (val) => {
  const { setSetting } = useGuideState.getState();
   setSetting(key, val);
};

const bindSettingToValue = (activePreset: string, key: string) => {
  getData({ path: `presets/${activePreset}`, key, callback: updateSettingFromFirebase(key) })
};

export const bindAllSettingsToValues = () => {
  const { activePreset, settings } = useGuideState.getState();
  Object.keys(settings).forEach(bindSettingToValue.bind(null, activePreset));
};

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const analytics = getAnalytics(app);
// export default app;
