export const Row = ({
  nowrap = false,
  justify = "start",
  content = "normal",
  stretch = true,
  klass = "",
  children,
  ...props
}) => {
  const classes = `flex ${stretch && "w-full"} ${nowrap ? "flex-nowrap" : "flex-wrap"} flex-row justify-${justify} content-${content} gap-4 ${klass}`
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const Col = ({ children, ...props}) => {
  return (
    <div className="flex flex-col" {...props}>
      {children}
    </div>
  );
};
