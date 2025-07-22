import Image from "next/image"

import { Suspense } from 'react';

interface LogoIconProps {
  className?: string
  size?: number
}

export function LogoIcon({ className = "", size = 40 }: LogoIconProps) {
  return (
    <div className={`${className} relative`} style={{ width: size, height: size }}>
      <Suspense fallback={<p>Chargement de l'image...</p>}>
        <Image src="/icon-512x512.png" alt="Beauté du Geste" fill className="object-contain" />
      </Suspense>
    </div>
  )
}
