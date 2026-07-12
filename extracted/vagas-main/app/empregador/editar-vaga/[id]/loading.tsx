import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="w-full pb-10">
      <div className="px-4 pt-4 sm:px-6 md:px-10">
        {/* Header Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Form Skeleton */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-6">
              {/* Tabs skeleton */}
              <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 flex-1" />
                ))}
              </div>

              {/* Form fields skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>

              <div className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
