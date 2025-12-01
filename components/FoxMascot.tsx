import React from 'react';

export const FoxMascot: React.FC<{ mood?: 'happy' | 'sleeping' | 'focused' }> = ({ mood = 'happy' }) => {
  return (
    <svg width="64" height="64" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixel-art">
      {/* Body/Head Base */}
      <rect x="5" y="6" width="6" height="6" fill="#f97316" />
      <rect x="4" y="8" width="8" height="4" fill="#f97316" />
      
      {/* Ears */}
      <rect x="4" y="4" width="2" height="2" fill="#f97316" />
      <rect x="10" y="4" width="2" height="2" fill="#f97316" />
      <rect x="5" y="5" width="1" height="1" fill="#fff" />
      <rect x="10" y="5" width="1" height="1" fill="#fff" />

      {/* Eyes */}
      {mood === 'sleeping' ? (
         <>
          <rect x="6" y="8" width="2" height="1" fill="#000" />
          <rect x="10" y="8" width="2" height="1" fill="#000" />
         </>
      ) : (
         <>
          <rect x="6" y="8" width="1" height="1" fill="#000" />
          <rect x="11" y="8" width="1" height="1" fill="#000" />
         </>
      )}

      {/* Nose */}
      <rect x="8" y="10" width="2" height="1" fill="#000" />
      
      {/* Cheeks/Whiskers */}
      <rect x="3" y="9" width="1" height="2" fill="#fff" />
      <rect x="12" y="9" width="1" height="2" fill="#fff" />
      <rect x="4" y="11" width="2" height="1" fill="#fff" />
      <rect x="10" y="11" width="2" height="1" fill="#fff" />
      
      {/* Tail (if visible, just a hint) */}
      <rect x="12" y="12" width="3" height="2" fill="#c2410c" />
    </svg>
  );
};

export const MiniFoxIcon: React.FC = () => (
    <svg width="24" height="24" viewBox="0 0 8 8" fill="none" className="inline-block mr-2">
        <rect x="2" y="2" width="1" height="1" fill="#f97316"/>
        <rect x="5" y="2" width="1" height="1" fill="#f97316"/>
        <rect x="1" y="3" width="6" height="3" fill="#f97316"/>
        <rect x="2" y="4" width="1" height="1" fill="#000"/>
        <rect x="5" y="4" width="1" height="1" fill="#000"/>
        <rect x="3" y="5" width="2" height="1" fill="#000"/>
    </svg>
);
