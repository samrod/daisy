import { isEmpty, isEqual } from "lodash";
import { child, get, getDatabase, onValue, ref, remove, set } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import "firebase/compat/firestore";

import { consoleLog } from ".";

export type { User } from "firebase/auth";
export type Object = string | number | boolean;
export type DataType = Object | { [key: string]: Object | {}} | object[];
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

export const getData = async (params: GetData) => {
  const { path, key} = params;
  const keyRef = ref(db, `${path}/${key}`);
  return onValue(keyRef, executeCallback(params));
};

export const deletePropValue = async (path: string, key: string ) => {
  const dataRef = child(ref(db), `${path}/${key}`);
  consoleLog("deletePropValue", `${path}: ${key}`);
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
    consoleLog("updateData", `missing path`, "error");
    return;
  }
  if (typeof value === "undefined" || value === null) {
    consoleLog("updateData", `"${path}: value missing"`, "error");
    return;
  }
  try {
    consoleLog("updateData", `${path}: ${value}`);
    await set(ref(db, path), value);
  } catch(e) {
    consoleLog(`updateData: ${path}/${value}`, e, "error");
  }
};

export const pushData = async (path: string, value: DataType, index?: number) => {
  const data = (await readPropValue(path, "/")) || [];
  const array = Object.values(data);
  const valueAlreadyExists = array.some((item) => {
    return typeof value === 'object' && typeof item === 'object'
      ? isEqual(item, value)
      : item === value;
  });
  if (typeof index === "number") {
    array[index] = value;
    try {
      consoleLog("pushData", `${path}[${index}]: ${value}`);
      await set(ref(db, path), array);
    } catch(e) {
      consoleLog(`pushData: ${path}`, e, "error");
    }
  } else {
    if (valueAlreadyExists) {
      console.warn(`*** pushData: ${JSON.stringify(value)} already exists in ${path}.`);
      return;
    }
    array.push(value);
    try {
      consoleLog("pushData", `${path}: ${value}`);
      await set(ref(db, path), array);
    } catch(e) {
      consoleLog(`pushData: ${path}`, e, "error");
    }
  }
};

export const deleteDataAtIndex = async (path, index) => {
  const arrayData = (await readPropValue(path, '/')) || [];
  const newArray = Object.values(arrayData).filter((_, i) => i !== index);
  await updateData(path, newArray);
};

export const serverStamp = () => firebase.firestore.Timestamp.now();
export const parseDate = ({ seconds, nanoseconds }) => new firebase.firestore.Timestamp(seconds, nanoseconds).toDate();

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
