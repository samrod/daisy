import { isEmpty } from "lodash";

type LevelTypes = "info" | "warn" | "error" | "standard";
const levels: { [key: string]: string } = {
  info: "#090",
  warn: "#990",
  error: "#F33",
  standard: "#069",
};

const logStyle = (level: LevelTypes) => `
  background-color: ${levels[level]};
  color: black;
  padding: 5px;
  margin-: 5px 0;
`;

const logTitleStyle = (level: LevelTypes) => `
  font-weight: bold;
  font-size: 11px;
  color: ${levels[level]};
  border: 2px solid ${levels[level]};
  padding: 3px 5px;
  border-left: 0;
  width: 100px;
`;

export const objDiff = (obj1, obj2) => {
  if (!obj1 || !obj2) {
    return false;
  }
  const diff = {};
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
  allKeys.forEach(key => {
    const value1 = obj1[key];
    const value2 = obj2[key];

    if (typeof value1 === 'object' && value1 !== null && typeof value2 === 'object' && value2 !== null) {
      const nestedDiff = objDiff(value1, value2);
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    } else {
      if (value1 !== value2) {
        diff[key] = `${value1} => ${value2}`;
      }
    }
  });
  return isEmpty(diff) ? false : diff;
};

export const consoleLog = (
    message: string,
    extraInfo: { [key: string]: any } | string | number,
    level: LevelTypes = "standard",
    pre?: boolean,
    post?: boolean,
  ) => {
    const preGap = pre ? "\n" : "";
    const postGap = post ? "\n" : "";
  console.log(`${preGap}%c${window.location.pathname}%c ${message}${postGap}`, logStyle(level), logTitleStyle(level), extraInfo);
};
