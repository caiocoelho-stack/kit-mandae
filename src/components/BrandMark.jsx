import React, { useState, useEffect, useRef } from 'react';

function BrandMark({ size = 28, glow = true }) {
  return (
    <div className="brand-mark" style={{ width: size, height: size, borderRadius: Math.round(size * 0.25), boxShadow: glow ? "0 0 0 2px rgba(232,97,74,0.18), 0 0 14px rgba(232,97,74,0.4)" : "none" }}>
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: size * 0.62, height: size * 0.62 }}>
        {/* stylized cursive 'm' */}
        <path d="M3.4 17.5 L3.4 8.5 Q3.4 6.8 4.7 6.6 Q5.8 6.4 6.6 7.2 Q7.1 7.7 7.4 8.7 Q8 7.1 9.3 6.6 Q10.6 6.1 11.6 6.9 Q12.5 7.6 12.5 9.1 L12.5 17.5"
              stroke="#fff" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* arrow curving right */}
        <path d="M14.3 12.5 Q16.5 12.5 18 13.8 L17 12.7 M18 13.8 L16.7 14.9"
              stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}


export default BrandMark;
