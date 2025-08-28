import { useCallback, useEffect, useState } from "react";

import { createPreset, getSettingsFromPreset, useGuideState } from "@/state";
import { Button, Col, PresetData, PresetRow } from "@/components";
import Styles from "@/components/Presets.module.scss";

import { IconAngle, IconFrequency, IconDuration, IconReverb, IconLength,
  IconSpeed, IconSteps, IconVolume, IconWave,
} from "@/assets";

export const Presets = () => {
  const [settings, setSettings] = useState<PresetData[]>([]);
  const { presets } = useGuideState(state => state);

  const fetchPresets = useCallback(async () => {
    const fetchedPresets = await Promise.all(
      Object.values(presets).map(async ({ id, name }) => {
        const _settings = await getSettingsFromPreset(id);
        if (!_settings) {
          return null;
        }
        return { id, name, settings: _settings };
      })
    );
    setSettings(fetchedPresets.filter(Boolean) as PresetData[]);
  }, [presets]);

  const onAddPreset = useCallback(async () => {
    await createPreset({});
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [presets, fetchPresets])
  
  return (
    <Col items="start">
      <table className={Styles.settingsTable}>
        <thead>
          <tr>
            <th className={Styles.thumbnail} />
            <th className={Styles.name}/>
            <th><IconSpeed title="Speed" /></th>
            <th><IconSteps title="Steps" /></th>
            <th><IconAngle title="Angle" /></th>
            <th><IconWave title="Wave" /></th>
            <th><IconLength title="Length" /></th>
            <th><IconVolume title="Volume" /></th>
            <th><IconFrequency title="Frequency" /></th>
            <th><IconDuration title="Duration" /></th>
            <th><IconReverb title="Reverb" /></th>
            <th className={Styles.actions} />
          </tr>
        </thead>
        <tbody>
          {settings?.map((preset, index, items) => (
            <PresetRow key={preset.id} {...preset} index={index} required={items.length === 1} />
          ))}
        </tbody>
      </table>
      <Button value="Add Preset" onClick={onAddPreset} size="sm" />
    </Col>
  );
};
