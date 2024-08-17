import { Col } from "components";
import Styles from "./UserPanel.module.scss";
import { useGuideState } from "state";

export const Presets = () => {
  const { presets } = useGuideState(state => state);
  // console.log("*** Presets: ", presets);

  return (
    <Col cols={4}>
      <h3 className="text-center mt-3 mb-3">Preset Settings</h3>
    </Col>
  );
};
