import { map } from "lodash";
import { PropsWithChildren, createElement } from "react";

export const Row = ({ gap = 4, ...props }) => {
  return baseGrid({ type: "row", gap, ...props });
};

export const Col = ({ gap = 0, ...props }) => {
  return baseGrid({ type: "col", gap,  ...props });
};

const align = (props) => {
  return map(props, (value, key) => value ? `${key}-${value} ` : "").join("");
}

interface BaseGridProps {
  nowrap?: boolean;
  justify?: string;
  content?: string;
  items?: string;
  self?: string;
  stretch?: boolean;
  klass?: string;
  gap?: number;
  cols?: string;
  as?: string;
  type: string;
}

const baseGrid = ({
  nowrap = false,
  justify = "start",
  content = null,
  items = null,
  self = null,
  stretch = true,
  klass = "",
  gap,
  cols = "full",
  as = "div",
  type,
  children,
  ...props
}: PropsWithChildren<BaseGridProps>) => {
  const width = typeof cols === "string" ? `w-${cols}` : `w-${cols}/6`;
  const alignment = align({ justify, content, items, self });
  const className = `flex flex-${type} ${width} ${nowrap ? "flex-nowrap" : "flex-wrap"} ${alignment} gap-${gap} ${klass}`;
  return createElement(as, { className, ...props }, children);
}
