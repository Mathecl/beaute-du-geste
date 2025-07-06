interface LogoIconProps {
    className?: string
    size?: number
  }
  
  export function LogoIcon({ className = "", size = 40 }: LogoIconProps) {
    return (
      <div className={`${className}`} style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Version simplifiée pour favicon */}
          <circle cx="50" cy="50" r="45" fill="#FDFBF7" stroke="#C1A97C" strokeWidth="3" />
  
          <g transform="translate(50,50)">
            <ellipse cx="0" cy="-15" rx="6" ry="14" fill="#F2D6D0" />
            <ellipse cx="-12" cy="-8" rx="5" ry="12" fill="#F2D6D0" transform="rotate(-45)" />
            <ellipse cx="12" cy="-8" rx="5" ry="12" fill="#F2D6D0" transform="rotate(45)" />
            <ellipse cx="-10" cy="6" rx="4" ry="10" fill="#F2D6D0" transform="rotate(-30)" />
            <ellipse cx="10" cy="6" rx="4" ry="10" fill="#F2D6D0" transform="rotate(30)" />
          </g>
  
          <circle cx="50" cy="50" r="5" fill="#C1A97C" />
        </svg>
      </div>
    )
  }
  