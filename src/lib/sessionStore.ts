import { getData, updateData, useGuideState, pushData, uuid, useClientState, DB_GUIDES, DB_SESSIONS, DB_CLIENTS, serverStamp, pushClientData, pushGuideData, readPropValue, DB_LINKS } from ".";

export const getSessionData = (key: string, callback: (params: unknown) => void) => {
  getData({ path: `/sessions/`, key, callback});
};

export const updateSessionData = (key: string, value: string | number | {}) => {
  updateData(`sessions/${key}`, value);
};

export const pushSessionData = async () => {
  const { clientLink } = useGuideState.getState();
  const session = await readPropValue(`${DB_LINKS}/${clientLink}/`, "session");
  if (session) {
    pushGuideData(DB_SESSIONS, session);
  }
};

export const createSession = () => {
  const { status, guide, preset, username, session, uid: clientId } = useClientState.getState();
  if (!session) {
    return;
  }
  updateSessionData(session, {
    clientId,
    guide,
    status,
    preset,
    username,
    createdAt: serverStamp.now(),
  });
};
