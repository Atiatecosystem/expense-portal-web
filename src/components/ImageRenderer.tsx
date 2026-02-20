import { ImageProps } from '@/types/images';
import React, { useState } from 'react';

/**
 * A component for rendering images with performance optimizations.
 * 
 * Performance improvements:
 * - Lazy loading to defer off-screen images
 * - Async decoding to not block the main thread
 * - Loading skeleton/placeholder to reduce perceived load time
 * - Proper aspect ratio to prevent layout shifts (CLS)
 * - Error handling with fallback
 */
const ImageRenderer: React.FC<ImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = true,
  aspectRatio = '16/9'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    console.error(`Failed to load image: ${src}`);
  };

  // Generate a placeholder style with the correct aspect ratio
  const placeholderStyle = {
    paddingBottom: aspectRatio === '16/9' ? '56.25%' : aspectRatio,
  };

  // Use a placeholder image or gradient while loading
  const placeholderImage = hasError
    ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e0e0e0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle"%3EImage Unavailable%3C/text%3E%3C/svg%3E'
    : null;

  return (
    <div
      className={`image-renderer-container ${className}`}
      style={{ position: 'relative', overflow: 'hidden', width: '100%' }}
    >
      {/* Loading skeleton/placeholder */}
      {placeholder && !isLoaded && !hasError && (
        <div
          className="image-placeholder"
          style={{
            ...placeholderStyle,
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            zIndex: 1,
          }}
        >
          <style>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div
          className="image-error"
          style={{
            ...placeholderStyle,
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
            fontSize: '14px',
            fontFamily: 'sans-serif',
            zIndex: 1,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '48px', height: '48px', marginBottom: '8px' }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}

      {/* Actual image */}
      <img
        src={hasError ? placeholderImage : (src ?? '')}
        alt={alt ?? 'Image'}
        className={`image-renderer ${isLoaded ? 'loaded' : 'loading'} ${className}`}
        // Performance optimizations:
        loading="lazy"        // Lazy load off-screen images
        decoding="async"      // Decode asynchronously to not block main thread
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          position: 'relative',
          zIndex: 2,
        }}
      />
    </div>
  );
};

export default ImageRenderer;
