import { isEmpty } from "lodash";
import { matchPath } from "react-router";
import { getData, updateData, DB_LINKS, deletePropValue, DB_GUIDES, readPropValue } from "lib";
import { useClientState, useGuideState, guidePropExists, updateGuide } from ".";

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

export const getLinkData = async (key: string, callback: (params: unknown) => void) => {
  const clientLink = getState("clientLink");
  if (clientLink) {
    // console.log(`*** ${window.location.pathname} getLinkData:`, key);
    await getData({ path: `/${DB_LINKS}/${clientLink}`, key, callback});
  }
};

export const updateLinkData = async (key: string, value) => {
  const clientLink = getState("clientLink");
  if (clientLink) {
    await updateData(`${DB_LINKS}/${clientLink}/${key}`, value);
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

export const clientLinkFromPath = () => {
  const matchPathData = matchPath({ path: "/:clientLink" }, window.location.pathname);
  if (!matchPathData?.params?.clientLink) {
    return null;
  }
  return matchPathData.params.clientLink;
};

export const currentLinkExists = async (): Promise<{ preset?: string; clientLink: string } | null> => {
  try {
    const guideState = useGuideState.getState();
    const user = guideState.user;
    if (user) {
      const clientLink = guideState.clientLink || await readPropValue(`${DB_GUIDES}/${user.uid}`, "clientLink") + "";
      return { clientLink };
    }
    const clientLink = clientLinkFromPath();
    const response = await readPropValue(`${DB_LINKS}/${clientLink}`, "");
    if (response) {
      return { clientLink, ...(response as object) };
    }
    return { clientLink: null };
  } catch(e) {
    console.log("*** ", e);
    return null;
  }
};
