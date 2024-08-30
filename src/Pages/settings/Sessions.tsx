import { useCallback, useEffect, useRef, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { differenceInHours, differenceInMinutes, differenceInSeconds, format } from "date-fns";
import { findIndex } from "lodash";

import { readGuideProp } from "state";
import { DB_PRESETS, DB_SESSIONS, parseDate, readPropValue } from "lib";
import Styles from "./sessions.module.scss";

interface SessionDataType {
  username: string;
  preset: string;
  createdAt: Timestamp;
  endedAt: Timestamp;
  terminatedBy: string;
}

interface PrettySessionType {
  presetName: any;
  username: string;
  terminatedBy: string;
  duration: string;
  date: string;
  time: string;
}

interface PresetType {
  id: string;
  name: string;
}

const formatDuration = (startDate: Date, endDate: Date): string => {
  const hours = differenceInHours(endDate, startDate);
  const minutes = differenceInMinutes(endDate, startDate) % 60;
  const seconds = differenceInSeconds(endDate, startDate) % 60;
  return (hours > 0)
    ? `${hours}h:${minutes}m`
    : `${minutes}m:${seconds}s`;
};

export const Sessions = () => {
  const [sessions, setSessions] = useState<PrettySessionType[]>([]);
  const presets = useRef<PresetType[]>([]);

  const cleanSession = useCallback(async (id: string): Promise<PrettySessionType> => {
    const data = await readPropValue(DB_SESSIONS, id);
    let username, preset, createdAt, endedAt, terminatedBy;
    try {
      ({ username, preset, createdAt, endedAt, terminatedBy } = data as SessionDataType);
    } catch (e) {
      console.warn("*** Sessions cleanSession: ", e.message);
    }
    if (!createdAt) {
      return;
    }
    const startDate = parseDate(createdAt);
    const date = format(startDate, "MM/d/yy");
    const time = format(startDate, "h:m aaa");
    const duration = formatDuration(startDate, parseDate(endedAt));
    const presetIndex = findIndex(presets.current, { id: preset });
    const presetName = presetIndex > -1 ? presets.current[presetIndex].name: "n/a";

    return { presetName, username, terminatedBy, duration, date, time };
  }, [presets]);

  const fetchPresetsAndSessions = useCallback(async () => {
    const response = await readGuideProp(DB_PRESETS);
    presets.current = Object.values(response);
    const sessionIds = await readGuideProp(DB_SESSIONS);
    const cleanedSessions = await Promise.all(
      Object.values(sessionIds).map(cleanSession)
    );
    setSessions(cleanedSessions.filter(i => i != null));
  }, [cleanSession]);

  useEffect(() => {
    fetchPresetsAndSessions();
}, [fetchPresetsAndSessions]);

return (
  <table className={Styles.sessions}>
    <thead>
      <tr>
        <th className={Styles.username}>Username</th>
        <th className={Styles.preset}>Preset</th>
        <th className={Styles.terminatedBy}>Ended By</th>
        <th className={Styles.startedAt}>Date / Time</th>
        <th className={Styles.duration}>Duration</th>
      </tr>
    </thead>
    <tbody>
      {sessions.map(({ presetName, username, terminatedBy, duration, date, time }: PrettySessionType, index) => (
        <tr key={`session-${index}`}>
          <td className={Styles.username}>{username}</td>
          <td className={Styles.preset}>{presetName}</td>
          <td className={Styles.terminatedBy}>{terminatedBy}</td>
          <td className={Styles.startedAt}>{date} - {time}</td>
          <td className={Styles.duration}>{duration}</td>
        </tr>
      ))}
    </tbody>
  </table>
  );
};
