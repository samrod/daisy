import firebase from 'firebase/compat/app';
import { differenceInSeconds } from "date-fns/differenceInSeconds";
import { getData, updateData, useGuideState, useClientState, DB_SESSIONS, serverStamp, pushGuideData, readPropValue, DB_LINKS, DB_GUIDES, EXPIRE_SESSION_SECONDS, updateLinkData, pushClientData } from ".";

export const getSessionData = (key: string, callback: (params: unknown) => void) => {
  getData({ path: `/sessions/`, key, callback});
};

export const updateSessionData = (key: string, value: string | number | {}) => {
  updateData(`sessions/${key}`, value);
};

export const pushSessionData = async (value) => {
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

export const createSession = () => {
  const { status, guide, preset, username, session, sessionTime, uid: clientId } = useClientState.getState();
  if (!session) {
    return;
  }
  pushClientData(DB_SESSIONS, session);
  updateLinkData("session", session);
  updateSessionData(session, {
    clientId,
    guide,
    status,
    preset,
    username,
    createdAt: sessionTime,
  });
};

export const sessionExpired = (sessionTime) => {
  if (!sessionTime) {
    return true;
  }
  const { seconds, nanoseconds } = sessionTime;
  const oldStamp = new firebase.firestore.Timestamp(seconds, nanoseconds);
  return Math.abs(differenceInSeconds(
    oldStamp.toDate(),
    serverStamp().toDate())
  ) > EXPIRE_SESSION_SECONDS;
};

