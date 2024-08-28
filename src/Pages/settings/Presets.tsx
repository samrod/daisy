import { useCallback, useEffect, useState } from "react";

import { createPreset, getGuideData, getSettingsFromPreset, useGuideState } from "state";
import { Button, Col, PresetData, PresetRow } from "components";
import { DB_PRESETS } from "lib";
import Styles from "components/Presets.module.scss";

import { ReactComponent as IconAngle } from "assets/setting_angle.svg";
import { ReactComponent as IconFrequency } from "assets/setting_frequency.svg";
import { ReactComponent as IconLength } from "assets/setting_length.svg";
// import { ReactComponent as IconPitch } from "assets/setting_pitch.svg";
import { ReactComponent as IconSpeed } from "assets/setting_speed.svg";
import { ReactComponent as IconSteps } from "assets/setting_steps.svg";
import { ReactComponent as IconVolume } from "assets/setting_volume.svg";
import { ReactComponent as IconWave } from "assets/setting_wave.svg";

export const Presets = () => {
  const [settings, setSettings] = useState<PresetData[]>([]);
  const { presets, setPresets } = useGuideState(state => state);

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
  
  useEffect(() => {
    getGuideData(DB_PRESETS, setPresets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return (
    <Col items="start">
      <Col nowrap self="stretch">
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
              <th className={Styles.actions} />
            </tr>
          </thead>
          <tbody>
            {settings?.map((preset, index, items) => (
              <PresetRow key={preset.id} {...preset} index={index} required={items.length === 1} />
            ))}
          </tbody>
        </table>
      </Col>
      <Button value="Add Preset" onClick={onAddPreset} size="sm" />
    </Col>
  );
};
