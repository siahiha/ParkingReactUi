import type { ImgHTMLAttributes } from 'react';

export function ParkingControlLogo({ alt = 'EOS Parking logo', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src="/eos-parking-logo.png" alt={alt} {...props} />;
}
