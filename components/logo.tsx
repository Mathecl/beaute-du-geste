import Image from "next/image"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "hero"
  variant?: "light" | "dark"
}

export function Logo({ className = "", size = "md", variant = "dark" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    hero: "w-20 h-20",
  }

  const textColors = {
    light: "text-white",
    dark: "text-charcoal",
  }

  const subtitleColors = {
    light: "text-white/90",
    dark: "text-burgundy",
  }

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    hero: "text-5xl md:text-6xl",
  }

  const subtitleSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    hero: "text-xl md:text-2xl",
  }

  return (
    <div className={`flex items-center ${size === "hero" ? "flex-col" : "space-x-3"} ${className}`}>
      <div className={`${sizeClasses[size]} relative ${size === "hero" ? "mb-4" : ""}`}>
        <Image src="/icon-512x512.png" alt="Beauté du Geste Logo" fill className="object-contain" />
      </div>

      <div className={`flex flex-col ${size === "hero" ? "text-center" : ""}`}>
        <span className={`font-advent-pro font-bold leading-tight ${titleSizes[size]} ${textColors[variant]}`}>
          Beauté du Geste
        </span>
        <span className={`font-light tracking-wide ${subtitleSizes[size]} ${subtitleColors[variant]}`}>
          Art du Kobido
        </span>
      </div>
    </div>
  )
}
