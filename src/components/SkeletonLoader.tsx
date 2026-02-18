import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  rows?: number;
}

/** Generic skeleton loader for lists / tables */
const SkeletonLoader = ({ rows = 5 }: SkeletonLoaderProps) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
