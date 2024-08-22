import { findIndex } from "lodash";
import {
  DB_GUIDES, DB_PRESETS, DEFAULT_PRESET_NAME, defaults,
  deleteDataAtIndex,
  deletePropValue,
  pushData, readPropValue, updateData, uuid,
} from "lib";
import { deleteGuideData, getGuideData, guidePropExists, updateGuide, updateLinkData, useGuideState } from ".";

export const getSettingsFromPreset = async (key: string): Promise<typeof defaults> => {
  if (!key) {
    return;
  }
  const response = await readPropValue(`${DB_PRESETS}/`, key);
  if (isDefaultType(response)) {
    return response as typeof defaults;
  }
  return;
};

export const selectPreset = async (preset: string) => {
  const settings = await getSettingsFromPreset(preset); 
  updateLinkData("settings", settings);
  updateLinkData("preset", preset);
};

interface CreatePreset {
  settings?: typeof defaults;
  name?: string;
}

export const createPreset = async ({ settings = defaults, name = DEFAULT_PRESET_NAME }: CreatePreset) => {
  const { user } = useGuideState.getState();
  if (!user?.uid ) {
    return;
  }
  const presetId = uuid();

  await updateGuide("activePreset", presetId);
  await updateData(`${DB_PRESETS}/${presetId}`, settings);
  getGuideData("activePreset", selectPreset);
  await pushData(`${DB_GUIDES}/${user.uid}/${DB_PRESETS}`, { id: presetId, name })
};

interface PresetsTypes {
  id: string;
  name: string;
}

export const deletePreset = async (id: string) => {
  const { user } = useGuideState.getState();
  if (!user?.uid ) {
    return;
  }
  const presets = await guidePropExists(DB_PRESETS) as PresetsTypes[];
  const index = findIndex(Object.values(presets), { "id": id });
  console.log("*** deletePreset: ", index);
  await deletePropValue(DB_PRESETS, id);
  await deleteDataAtIndex(`${DB_GUIDES}/${user.uid}/presets/`, index);
};

function isDefaultType(response: any = {}): response is typeof defaults {
  return (
    'size' in response &&
    'speed' in response &&
    'angle' in response &&
    'pitch' in response &&
    'volume' in response &&
    'wave' in response &&
    'length' in response &&
    'background' in response &&
    'opacity' in response &&
    'lightbar' in response &&
    'steps' in response &&
    'color' in response &&
    'shape' in response &&
    'playing' in response
  );
}
