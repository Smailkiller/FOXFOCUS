import React from 'react';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  compact?: boolean;
}

export const PixelCard: React.FC<PixelCardProps> = ({ children, className = "", title, compact = false }) => {
  const padding = compact ? "p-2" : "p-4";
  return (
    <div className={`relative bg-white border-4 border-black shadow-pixel ${padding} ${className}`}>
      {title && (
        <div className="absolute -top-4 left-2 bg-fox-500 text-white px-2 py-0.5 border-2 border-black text-[10px] font-pixel uppercase tracking-widest">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
}

export const PixelButton: React.FC<PixelButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = "", 
  isLoading,
  disabled,
  ...props 
}) => {
  // Reduced padding and font size for compactness
  const baseStyles = "font-pixel text-[10px] sm:text-xs px-2 py-2 border-2 border-black transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none focus:outline-none uppercase";
  
  const variants = {
    primary: "bg-fox-500 text-white shadow-pixel-sm hover:bg-fox-400",
    secondary: "bg-gray-200 text-black shadow-pixel-sm hover:bg-gray-100",
    danger: "bg-red-500 text-white shadow-pixel-sm hover:bg-red-400",
    success: "bg-green-500 text-white shadow-pixel-sm hover:bg-green-400",
  };

  const disabledStyle = "bg-gray-300 text-gray-500 shadow-none cursor-not-allowed translate-x-[2px] translate-y-[2px]";

  return (
    <button
      className={`${baseStyles} ${disabled || isLoading ? disabledStyle : variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "..." : children}
    </button>
  );
};

interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PixelInput: React.FC<PixelInputProps> = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full bg-white border-2 border-black p-2 font-pixel text-xs shadow-pixel-inset focus:outline-none focus:bg-yellow-50 ${className}`}
      {...props}
    />
  );
};