import { createElement } from "react";

export const Row = ({ gap = 4, ...props }) => {
  return baseGrid({ type: "row", gap, ...props });
};

export const Col = ({ gap = 0, ...props }) => {
  return baseGrid({ type: "col", gap,  ...props });
};

const baseGrid = ({
  nowrap = false,
  justify = "start",
  content = "normal",
  stretch = true,
  klass = "",
  gap,
  cols = "full",
  as = "div",
  type,
  children,
  ...props
}) => {
  const width = typeof cols === "string" ? `w-${cols}` : `w-${cols}/6`;
  const className = `flex flex-${type} ${width} ${nowrap ? "flex-nowrap" : "flex-wrap"} justify-${justify} content-${content} gap-${gap} ${klass}`;
  return createElement(as, { className, ...props }, children);
}
