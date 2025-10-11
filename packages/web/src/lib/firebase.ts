import { isEmpty, isEqual } from "lodash";
import { child, get, getDatabase, onValue, ref, set } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { type FirebaseApp, type FirebaseOptions, initializeApp } from "firebase/app";
import { Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
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

export const deletePropValue = async (path: string, key: string) => {
  consoleLog("deletePropValue", `${path}: ${key}`);
  return await apiDelete(path, key);
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

export const updateData = async (path: string, value: DataType, useClient = false, context = "updateData") => {
  if (isEmpty(path)) {
    consoleLog(context, `missing path`, "error");
    return;
  }
  if (typeof value === "undefined" || value === null) {
    consoleLog(context, `"${path}: value missing"`, "error");
    return;
  }
  try {
    if (useClient) {
      consoleLog(context, `[client] ${path}: ${value}`);
      await set(ref(db, path), value);
    } else {
      consoleLog(context, `[api] ${path}: ${value}`);
      await apiPost(path, value);
    }
  } catch(e) {
    consoleLog(`${context}: ${path}/${value}`, e, "error");
  }
};

export const pushData = async (path: string, value: DataType, index?: number, useClient = false) => {
  const data = (await readPropValue(path, "/")) || [];
  const array = Object.values(data);
  const valueAlreadyExists = array.some((item) => {
    return typeof value === 'object' && typeof item === 'object'
      ? isEqual(item, value)
      : item === value;
  });
  if (typeof index === "number") {
    array[index] = value;
    await updateData(path, array, useClient, "pushData");
  } else {
    if (valueAlreadyExists) {
      console.warn(`*** pushData: ${JSON.stringify(value)} already exists in ${path}.`);
      return;
    }
    array.push(value);
    await updateData(path, array, useClient, "pushData");
  }
};

export const deleteDataAtIndex = async (path, index, useClient = false) => {
  const arrayData = (await readPropValue(path, '/')) || [];
  const newArray = Object.values(arrayData).filter((_, i) => i !== index);
  await updateData(path, newArray, useClient, "deleteDataAtIndex");
};

export const serverStamp = () => Timestamp.now();
export const parseDate = ({ seconds, nanoseconds }) => new Timestamp(seconds, nanoseconds).toDate();

const env = (import.meta as any).env;
const API_BASE = env.VITE_API_BASE;

export const apiPost = async (collection: string, data: DataType) => {
  const url = `${API_BASE}/${collection}`;
  let idToken = null;
  if (auth.currentUser) {
    idToken = await auth.currentUser.getIdToken();
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken && { "Authorization": `Bearer ${idToken}` })
      },
      body: JSON.stringify({data}),
    });
    if (!res.ok) {
      consoleLog(`apiPost ${res.status}`, `path: ${url}, data: ${data}`, "error");
      return undefined;
    }
    consoleLog(`apiPost ${res.status}`, `${url} ${JSON.stringify(data)}`, "info");
    return await res.json();
  } catch (e) {
    consoleLog("apiPost", e, "error");
    return undefined;
  }
};

export const apiDelete = async (collection: string, id: string) => {
  if (!id) {
    consoleLog("apiDelete", "requires an id", "error");
    return undefined;
  }
  const url = `${API_BASE}/${collection}/${id}`;
  let idToken = null;
  if (auth.currentUser) {
    idToken = await auth.currentUser.getIdToken();
  }
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        ...(idToken && { "Authorization": `Bearer ${idToken}` })
      }
    });
    if (!res.ok) {
      consoleLog("apiDelete", `failed: ${res.status}`, "error");
      return undefined;
    }
    return await res.json();
  } catch (e) {
    consoleLog("apiDelete", e, "error");
    return undefined;
  }
};

const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
};

const app: FirebaseApp = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
