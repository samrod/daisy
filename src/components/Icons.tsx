interface IconProps {
  name?: string;
}

const Icon = ({ name }: IconProps) => {
  if (name) {
    return ( <span className={`icon i-${name}`} /> );
  }
  return null;
};

export default Icon;
