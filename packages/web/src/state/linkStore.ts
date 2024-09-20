import { isEmpty } from "lodash";
import { matchPath } from "react-router";
import { getData, updateData, DB_LINKS, deletePropValue, DB_GUIDES, readPropValue, propExists, uuid, DataType } from "lib";
import { useClientState, useGuideState, guidePropExists, updateGuideData, selectPreset, useLinkState, getSettingsFromPreset } from ".";

const getState = (key: string) => {
  const linkState = useLinkState.getState();
  const clientState = useClientState.getState();
  const value = linkState[key] || clientState[key];

  if (!isEmpty(value)) {
    return value;
  } else {
    console.warn(`*** getState "${key}" empty in: `, linkState, clientState);
  }
};

export const getLinkData = (key: string, callback: (params: unknown) => void) => {
  const clientLink = getState("clientLink");
  if (clientLink) {
    getData({ path: `/${DB_LINKS}/${clientLink}`, key, callback});
  }
};

export const updateLinkData = async (key: string, value) => {
  const clientLink = getState("clientLink");
  if (clientLink) {
    await updateData(`${DB_LINKS}/${clientLink}/${key}`, value);
  }
};

export const updateSetting = async (setting: string, value: DataType) => {
  const { activePreset } = useGuideState.getState();
  if (!activePreset) {
    return;
  }
  await updateLinkData(`settings/${setting}`, value);
};

export const updateSettingFromPreset = async (preset: string) => {
  const settings = await getSettingsFromPreset(preset);
  await updateSetting("", settings);
};

export const togglePlay = () => {
  const { settings: { playing } } = useLinkState.getState();
  updateSetting("playing", !playing);
};

export const updateClientLink = async (clientLink: string) => {
  const { activePreset: preset, user } = useGuideState.getState();
  const { setClientLink } = useLinkState.getState();
  const { uid, setPreset } = useClientState.getState();
  const oldClientLink = await guidePropExists("clientLink");
  await deletePropValue(DB_LINKS, oldClientLink as string);
  setClientLink(clientLink);
  await updateGuideData("clientLink", clientLink);
  setPreset(preset);
  await updateLinkData("", { status: 0, guide: user?.uid, client: uid });
  await selectPreset(preset);
};

export const clientLinkFromPath = () => {
  const matchPathData = matchPath({ path: "/:clientLink" }, window.location.pathname);
  if (!matchPathData?.params?.clientLink) {
    return null;
  }
  return matchPathData.params.clientLink;
};

export const clientLinkFromStore = async () => {
  const clientLink = clientLinkFromPath();
  const response = await readPropValue(`${DB_LINKS}/${clientLink}`, "");
  if (response) {
    return { clientLink, ...(response as object) };
  }
};

export const currentLinkExists = async (): Promise<{ preset?: string; clientLink: string } | null> => {
  try {
    const guideState = useGuideState.getState();
    const linkState = useLinkState.getState();
    const user = guideState.user;
    if (user) {
      const clientLink = linkState.clientLink || await readPropValue(`${DB_GUIDES}/${user.uid}`, "clientLink") + "";
      return { clientLink };
    }
    return await clientLinkFromStore();
  } catch(e) {
    console.log("*** ", e);
    return null;
  }
};

export function uniqueClientLink(value: string, checkOnly: true): Promise<boolean>;
export function uniqueClientLink(value: string, checkOnly?: false): Promise<string>;

export async function uniqueClientLink(value: string, checkOnly = false): Promise<boolean | string> {
  const exists = await propExists(DB_LINKS, value);
  if (checkOnly) {
    return exists as boolean;
  }
  return exists ? `${value}-${uuid().substring(0, 3)}` : value as string;
};

const updateSettingFromFirebase = (key: string) => (val) => {
  const { setSetting } = useLinkState.getState();
   setSetting(key, val);
};

const bindSettingToValue = (activePreset: string, key: string) => {
  getLinkData(`settings/${key}`, updateSettingFromFirebase(key));
};

export const subscribeAllSettings = () => {
  const { activePreset } = useGuideState.getState();
  const { settings } = useLinkState.getState();
  if (!settings) {
    return;
  }
  getLinkData("activePreset", updateSettingFromPreset)
  Object.keys(settings).forEach(bindSettingToValue.bind(null, activePreset));
};

export interface PersistedLinkType {
  session?: string;
  username?: string;
  status: number;
  settings: SettingsTypes;
  preset: string;
  guide: string;
  client: string;
}
