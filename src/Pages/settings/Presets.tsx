import { useCallback, useEffect, useState } from "react";
import { Col } from "components";
import { defaults } from "lib";
// import Styles from "./UserPanel.module.scss";
import { getSettingsFromPreset, useGuideState } from "state";

interface PresetData {
  id: string;
  name: string;
  settings: typeof defaults;
}

const Preset = ({ settings, name, id }) => {
  const { size,speed,angle,pitch,volume,wave,length,background,opacity,lightbar,steps,color,shape } = settings;
  return (
    <div>
      {name}<br />
      {background}, {opacity}, {lightbar}, {steps}, {color}, {shape}<br />
      {size}, {speed}, {angle}, {pitch}, {volume}, {wave}, {length}
    </div>
  );
};

export const Presets = () => {
  const [settings, setSettings] = useState<PresetData[]>([]);
  const { presets } = useGuideState(state => state);

  const fetchPresets = useCallback(async () => {
    const fetchedPresets = await Promise.all(
      presets.map(async ({ id, name }) => {
        const _settings = await getSettingsFromPreset(id);
        if (!_settings) {
          return null;
        }
        return { id, name, settings: _settings };
      })
    );
    setSettings(fetchedPresets.filter(Boolean) as PresetData[]);
  }, [presets]);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  return (
    <Col cols={4}>
      <h3 className="text-center mt-3 mb-3">Preset Settings</h3>
      {settings.map((preset) => (
        <Preset key={preset.id} {...preset} />
      ))}
    </Col>
  );
};
