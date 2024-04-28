import { useEffect } from 'react';
import { createTimeModel, useTimeModel } from "react-compound-timer";
import './Clock.scss';

const timer = createTimeModel({
  startImmediately: false,
});

const formatSecs = s => s.toString().padStart(2, 0);
const formatHours = h => Number(h) && `${h}:`;

const Clock = ({ playing }) => {
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

  return <div className="clock">
    {formatHours(h)}{m}:{formatSecs(s)}
  </div>;
};

export default Clock;
