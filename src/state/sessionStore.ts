import firebase from 'firebase/compat/app';
import { differenceInSeconds } from "date-fns/differenceInSeconds";
import {
  getData,
  updateData,
  DB_SESSIONS,
  serverStamp,
  readPropValue,
  DB_LINKS,
  EXPIRE_SESSION_SECONDS,
  deletePropValue
} from "../lib";
import {
  useClientState,
  pushClientData,
  useGuideState,  
  pushGuideData,
  updateLinkData,
  currentLinkExists,
  useSessionState,
} from '.';

export const getSessionData = (key: string, callback: (params: unknown) => void) => {
  getData({ path: `${DB_SESSIONS}/`, key, callback});
};

export const updateSessionData = async (key: string, value: string | number | {}) => {
  const clientLink = useGuideState.getState().clientLink || useClientState.getState().clientLink;
  if (!clientLink) {
    console.warn(`*** updateSessionData: clientLink is "${clientLink}"`);
    return;
  }
  const session = useSessionState.getState().session || await readPropValue(`${DB_LINKS}/${clientLink}/`, "session");
  if (!session) {
    console.warn(`*** updateSessionData: session is "${session}"`);
    return;
  }
  await updateData(`${DB_SESSIONS}/${session}/${key}`, value);
};

export const pushSessionData = async () => {
  const { clientLink, user } = useGuideState.getState();
  if (!clientLink) {
    console.warn(`*** pushSessionData: clientLink is "${clientLink}"`);
    return;
  }
  if (!user) {
    console.warn(`*** pushSessionData: user is "${user}"`);
  }
  const session = await readPropValue(`${DB_LINKS}/${clientLink}/`, "session");
  pushGuideData(DB_SESSIONS, session);
};

export const sessionFromStorage = () => {
  const stateString = localStorage.getItem("daisy-session");
  return JSON.parse(stateString);
};

export const createSession = async () => {
  const { setUpdatedAt, setSession } = useSessionState.getState();
  if (useSessionState.getState().session) {
    return;
  }
  setUpdatedAt();
  setSession();
  const { status, guide, preset, username, uid: client } = useClientState.getState();
  const { session, updatedAt } = useSessionState.getState();
  await pushClientData(DB_SESSIONS, session);
  await updateLinkData("session", session);
  await updateSessionData("", {
    client,
    guide,
    status,
    preset,
    username,
    createdAt: updatedAt,
    updatedAt,
  });
};

export const endSession = async (explicit = false) => {
  const { clientLink, setStatus, setUsername } = useClientState.getState();

  await deletePropValue(`${DB_LINKS}/${clientLink}`, "session");
  await updateSessionData("endedAt", serverStamp());
  await updateSessionData("terminatedBy", explicit ? "guide" : "expiration");
  useSessionState.setState({
    session: null,
    updatedAt: null,
    sessionStatus: "available",
  });

  setUsername("");
  setStatus(explicit ? 5 : 8);
};

export const sessionExpired = () => {
  const { updatedAt } = useSessionState.getState();
  if (!updatedAt) {
    console.log("*** sessionExpired: updatedAt not set");
    return true;
  }
  const { seconds, nanoseconds } = updatedAt;
  const oldStamp = new firebase.firestore.Timestamp(seconds, nanoseconds);
  const timeDelta = Math.abs(differenceInSeconds( oldStamp.toDate(), serverStamp().toDate()) );
  return timeDelta > EXPIRE_SESSION_SECONDS;
};
