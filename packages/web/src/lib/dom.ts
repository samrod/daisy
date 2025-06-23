import { togglePlay, updateSetting, useGuideState, useLinkState } from "@/state";

export function unbindEvent({ element, event, handler }: BindParams) {
  element.removeEventListener(event, handler);
}

export function bindEvent({ element, event, handler, options = {} }: BindParams) {
  element.addEventListener(event, handler, options);
}

const changeSetting = (key: string, fn: () => void) => {
  fn();
  updateSetting(key, useLinkState.getState().settings[key]);
};

export const setKeys = ({ key }: KeyboardEvent) => {
  const State = useLinkState.getState();
  const { userMode } = useGuideState.getState();
  if (userMode) {
    return;
  }
  // console.log(`*** ${document.location.pathname} setKeys: "${key}"`, test.settings.playing, State.settings.playing);
  switch (key) {
    case "ArrowDown":
      changeSetting("volume", State.volumeDown);
      break;
    case "ArrowUp":
      changeSetting("volume", State.volumeUp);
      break;
    case " ":
      togglePlay();
      break;
    case "ArrowLeft":
      changeSetting("speed", State.speedDown);
      break;
    case "ArrowRight":
      changeSetting("speed", State.speedUp);
      break;
    default:
      break;
  }
};

