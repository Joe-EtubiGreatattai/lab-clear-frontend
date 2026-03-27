const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
  </div>
);

export const TableRowSkeleton = ({ cols = 4 }) => (
  <tr className="border-b border-slate-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-3 px-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const ResultDetailSkeleton = () => (
  <div className="space-y-6">
    <div className="card">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7">
        <div className="card space-y-4">
          <Skeleton className="h-16 -mx-6 -mt-6 mb-6 rounded-t-2xl" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="pl-4 border-l-2 border-slate-200 space-y-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className="card space-y-3">
          <Skeleton className="h-4 w-24" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
    </div>
  </div>
);

export default Skeleton;
