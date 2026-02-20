export interface ImageProps {
  src: string;
  alt: string;
  className?: string; // Optional for styling
  placeholder?: boolean; // Show loading skeleton
  aspectRatio?: string; // Aspect ratio for placeholder (e.g., '16/9', '4/3')
}
