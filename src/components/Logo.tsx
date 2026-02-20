const Logo = ({ className = "h-16 w-auto" }: { className?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Green decorative border */}
        <path d="M10 40 Q10 10, 40 10 L160 10 Q190 10, 190 40 L190 60 L10 60 Z" fill="#0B5D3D"/>
        
        {/* Sun/Crown rays */}
        <path d="M100 15 L105 35 L110 15 L115 35 L120 15 L125 35 L130 15 L125 35 L120 35 L115 35 L110 35 L105 35 L100 35 L95 35 L90 35 L85 35 L80 15 L85 35 L90 15 L95 35 Z" fill="#F4C430"/>
        
        {/* Sun circle */}
        <circle cx="100" cy="35" r="15" fill="#F4C430"/>
        
        {/* Shield/badge shape - red/orange gradient */}
        <path d="M40 65 Q40 55, 50 55 L150 55 Q160 55, 160 65 L160 140 Q160 170, 100 190 Q40 170, 40 140 Z" fill="url(#heroGradient)"/>
        
        {/* HERO text */}
        <text x="100" y="100" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="white" textAnchor="middle">HERO</text>
        
        {/* Premium Lager text */}
        <text x="100" y="120" fontFamily="Arial, sans-serif" fontSize="10" fill="white" textAnchor="middle" fontWeight="600">PREMIUM</text>
        <text x="100" y="132" fontFamily="Arial, sans-serif" fontSize="10" fill="white" textAnchor="middle" fontWeight="600">LAGER</text>
        
        {/* Star decoration */}
        <path d="M100 145 L103 154 L112 154 L105 159 L108 168 L100 163 L92 168 L95 159 L88 154 L97 154 Z" fill="#F4C430"/>
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="heroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#C44827', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#D94727', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Logo;
