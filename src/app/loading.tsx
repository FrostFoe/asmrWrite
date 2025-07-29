import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-full bg-background">
      {/* Desktop sidebar skeleton */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="flex-1 space-y-2 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 lg:pl-72">
        <div className="h-full space-y-8 p-4 sm:p-6 lg:p-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-10 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-44" />
              <Skeleton className="h-10 w-20" />
            </div>
          </header>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      {/* Mobile bottom nav skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-sm lg:hidden">
        <div className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}