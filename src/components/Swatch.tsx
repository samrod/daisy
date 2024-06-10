export const Swatch = (setValue: () => void, color: string, index: number) => (
  <div
    key={`swatch-${index}`}
    className="swatch"
    data-action="color"
    data-option={color}
    onClick={setValue}
  />
);
