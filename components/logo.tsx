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
      dark: "text-gold",
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
          <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Cercle extérieur doré */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={variant === "light" ? "#FFFFFF" : "#C1A97C"}
              strokeWidth="2"
              opacity="0.6"
            />
  
            {/* Pétales de fleur stylisés */}
            <g transform="translate(50,50)">
              {/* Pétale central haut */}
              <ellipse cx="0" cy="-20" rx="8" ry="18" fill={variant === "light" ? "#FFFFFF" : "#F2D6D0"} opacity="0.8" />
  
              {/* Pétales latéraux */}
              <ellipse
                cx="-15"
                cy="-10"
                rx="6"
                ry="14"
                fill={variant === "light" ? "#FFFFFF" : "#F2D6D0"}
                opacity="0.7"
                transform="rotate(-45)"
              />
              <ellipse
                cx="15"
                cy="-10"
                rx="6"
                ry="14"
                fill={variant === "light" ? "#FFFFFF" : "#F2D6D0"}
                opacity="0.7"
                transform="rotate(45)"
              />
  
              {/* Pétales inférieurs */}
              <ellipse
                cx="-12"
                cy="8"
                rx="5"
                ry="12"
                fill={variant === "light" ? "#FFFFFF" : "#F2D6D0"}
                opacity="0.6"
                transform="rotate(-30)"
              />
              <ellipse
                cx="12"
                cy="8"
                rx="5"
                ry="12"
                fill={variant === "light" ? "#FFFFFF" : "#F2D6D0"}
                opacity="0.6"
                transform="rotate(30)"
              />
            </g>
  
            {/* Centre de la fleur */}
            <circle cx="50" cy="50" r="6" fill={variant === "light" ? "#FFFFFF" : "#C1A97C"} opacity="0.9" />
  
            {/* Points décoratifs */}
            <circle cx="50" cy="15" r="1.5" fill={variant === "light" ? "#FFFFFF" : "#C1A97C"} opacity="0.4" />
            <circle cx="75" cy="35" r="1" fill={variant === "light" ? "#FFFFFF" : "#F2D6D0"} opacity="0.6" />
            <circle cx="25" cy="35" r="1" fill={variant === "light" ? "#FFFFFF" : "#F2D6D0"} opacity="0.6" />
            <circle cx="70" cy="70" r="1.5" fill={variant === "light" ? "#FFFFFF" : "#C1A97C"} opacity="0.3" />
            <circle cx="30" cy="70" r="1.5" fill={variant === "light" ? "#FFFFFF" : "#C1A97C"} opacity="0.3" />
          </svg>
        </div>
  
        <div className={`flex flex-col ${size === "hero" ? "text-center" : ""}`}>
          <span className={`font-playfair font-bold leading-tight ${titleSizes[size]} ${textColors[variant]}`}>
            Beauté du Geste
          </span>
          <span className={`font-light tracking-wide ${subtitleSizes[size]} ${subtitleColors[variant]}`}>
            Art du Kobido
          </span>
        </div>
      </div>
    )
  }
  