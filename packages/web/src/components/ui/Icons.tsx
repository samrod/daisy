interface IconProps {
  name?: string;
}

export const Icon = ({ name }: IconProps) => {
  if (name) {
    return ( <span className={`icon i-${name}`} /> );
  }
  return null;
};
