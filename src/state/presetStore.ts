import {
  DB_GUIDES, DB_PRESETS, DEFAULT_PRESET_NAME, defaults,
  pushData, readPropValue, updateData, uuid,
} from "lib";
import { getGuideData, updateGuide, updateLinkData, useGuideState } from ".";

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
  await pushData(`${DB_GUIDES}/${user.uid}/${DB_PRESETS}`, { id: presetId, name })
  await updateData(`${DB_PRESETS}/${presetId}`, settings);
  getGuideData("activePreset", selectPreset);
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
