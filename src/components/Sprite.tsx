import type { CSSProperties } from 'react';
import { PROPS_SHEET, PROP_BOXES, type PropKey } from '@/lib/data';

/** A crop of the props sheet. Percent based, so it scales with its width; height follows the box ratio. */
export function Sprite({ name, className = '', style }: { name: PropKey; className?: string; style?: CSSProperties }) {
  const [x, y, w, h] = PROP_BOXES[name];
  return (
    <div
      aria-hidden="true"
      className={`sprite ${className}`}
      style={{
        aspectRatio: `${w} / ${h}`,
        backgroundImage: `url("${PROPS_SHEET}")`,
        backgroundSize: `${(1024 / w) * 100}% ${(688 / h) * 100}%`,
        backgroundPosition: `${(x / (1024 - w)) * 100}% ${(y / (688 - h)) * 100}%`,
        ...style,
      }}
    />
  );
}
