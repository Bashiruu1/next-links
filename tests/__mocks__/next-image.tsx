/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Minimal next/image mock for jsdom test environment.
 * Renders a plain <img> with the same props, skipping all Next.js
 * image-optimisation internals that rely on the Node.js server.
 */
import React from "react";

interface MockImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function MockImage({ src, alt, fill: _fill, sizes: _sizes, priority: _priority, ...rest }: MockImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...rest} />;
}

MockImage.displayName = "NextImageMock";

export default MockImage;
