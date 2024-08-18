import { isEmpty } from "lodash";

type LevelTypes = "info" | "warn" | "error" | "standard" | string;
const levels: { [key: string]: string } = {
  info: "#090",
  warn: "#990",
  error: "#C00",
  standard: "#069",
};

const logStyle = (level: LevelTypes) => `
  background-color: ${levels[level] || level};
  color: black;
  padding: 5px;
  margin-: 5px 0;
`;

const logTitleStyle = (level: LevelTypes) => `
  font-weight: bold;
  font-size: 11px;
  color: ${levels[level] || level};
  border: 2px solid ${levels[level] || level};
  padding: 3px 5px;
  border-left: 0;
  width: 100px;
`;

const serialize = (data: unknown) => JSON.parse(JSON.stringify(data));
const stringifyClean = (data: unknown) => {
  if (typeof data !== "object") {
    return data;
  }
  const string = JSON.stringify(data);
  return string.replace(/^"(.+)"$/, "$1");
};

export const objDiff = (_obj1: unknown, _obj2: unknown) => {
  if (!_obj1 || !_obj2) {
    return false;
  }
  const diff = {};
  const obj1 = serialize(_obj1);
  const obj2 = serialize(_obj2);
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
        diff[key] = `${stringifyClean(value1)} => ${stringifyClean(value2)}`;
      }
    }
  });
  return isEmpty(diff) ? false : diff;
};

export const consoleLog = (
    message: string,
    extraInfo: { [key: string]: any } | string | number,
    level: string | LevelTypes = "standard",
    pre?: boolean,
    post?: boolean,
  ) => {
    if (process.env.NODE_ENV === "production") {
      return;
    }
    const preGap = pre ? "\n" : "";
    const postGap = post ? "\n" : "";
    console.log(`${preGap}%c${window.location.pathname}%c ${message}${postGap}`, logStyle(level), logTitleStyle(level), extraInfo);
};
