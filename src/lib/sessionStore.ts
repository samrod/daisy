import firebase from 'firebase/compat/app';
import { differenceInSeconds } from "date-fns/differenceInSeconds";
import { getData, updateData, useGuideState, useClientState, DB_SESSIONS, serverStamp, pushGuideData, readPropValue, DB_LINKS, DB_GUIDES, EXPIRE_SESSION_SECONDS, updateLinkData, pushClientData } from ".";

export const getSessionData = (key: string, callback: (params: unknown) => void) => {
  getData({ path: `${DB_SESSIONS}/`, key, callback});
};

export const updateSessionData = async (key: string, value: string | number | {}) => {
  await updateData(`${DB_SESSIONS}/${key}`, value);
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

export const createSession = async () => {
  const { status, guide, preset, username, session, sessionTime, uid: clientId } = useClientState.getState();
  if (!session) {
    return;
  }
  await pushClientData(DB_SESSIONS, session);
  await updateLinkData("session", session);
  await updateSessionData(session, {
    clientId,
    guide,
    status,
    preset,
    username,
    createdAt: sessionTime,
  });
};

export const endSession = async () => {
  const { clientLink } = useGuideState.getState();
  const session = await readPropValue(`${DB_LINKS}/${clientLink}`, "session");
  updateSessionData(`${session}/endedAt`, serverStamp());
};

export const sessionExpired = () => {
  const { sessionTime, sessionEndedAt } = useClientState.getState();
  if (!sessionTime || sessionEndedAt) {
    return true;
  }
  const { seconds, nanoseconds } = sessionTime;
  const oldStamp = new firebase.firestore.Timestamp(seconds, nanoseconds);
  const timeDelta = Math.abs(differenceInSeconds( oldStamp.toDate(), serverStamp().toDate()) );
  return timeDelta > EXPIRE_SESSION_SECONDS;
};

