import { useEffect } from "react";
import { createTimeModel, useTimeModel } from "react-compound-timer";
import Styles from "./Clock.module.scss";

const timer = createTimeModel({
  startImmediately: false,
});

const formatSecs = s => s.toString().padStart(2, 0);
const formatHours = h => Number(h) && `${h}:`;

export const Clock = ({ playing }) => {
  const { value: { h, m, s} } = useTimeModel(timer);

  useEffect(() => {
    if (!timer) {
      return;
    }
    if (playing) {
      timer.changeTime(0);
      timer.start();
    } else {
      timer.stop();
    }
  }, [playing]);

  return <div className={Styles.clock}>
    {formatHours(h)}{m}:{formatSecs(s)}
  </div>;
};
