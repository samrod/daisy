import { isEmpty } from "lodash";
import { getData, updateData, useGuideState, useClientState, DB_LINKS, deletePropValue, updateGuide, guidePropExists } from ".";

const getState = (key: string) => {
  const guideState = useGuideState.getState();
  const clientState = useClientState.getState();
  const value = guideState[key] || clientState[key];

  if (!isEmpty(value)) {
    return value;
  } else {
    console.warn(`*** getState "${key}" empty in: `, guideState, clientState);
  }
};

export const getLinkData = (key: string, callback: (params: unknown) => void) => {
  const clientLink = getState("clientLink");
  if (clientLink) {
    // console.log(`*** ${window.location.pathname} getLinkData:`, key);
    getData({ path: `/${DB_LINKS}/${clientLink}`, key, callback});
  }
};

export const updateLinkData = (key: string, value) => {
  const clientLink = getState("clientLink");
  if (clientLink) {
    updateData(`${DB_LINKS}/${clientLink}/${key}`, value);
  }
};

export const updateClientLink = async (clientLink: string) => {
  const { setClientLink, activePreset: preset, user } = useGuideState.getState();
  const { uid, setPreset } = useClientState.getState();
  const oldClientLink = await guidePropExists("clientLink");
  deletePropValue(DB_LINKS, oldClientLink as string);
  setClientLink(clientLink);
  setPreset(preset);
  updateGuide("clientLink", clientLink);
  updateLinkData("", { status: 0, preset, guide: user?.uid, client: uid });
};

