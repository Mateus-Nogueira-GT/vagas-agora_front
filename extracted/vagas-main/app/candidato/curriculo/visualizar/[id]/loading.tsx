import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="w-full pb-16">
      {/* Banner Skeleton */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6">
        <Skeleton className="h-8 w-64 bg-white/20 mb-2" />
        <Skeleton className="h-5 w-96 bg-white/20" />
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="px-4 sm:px-6 md:px-10 py-4">
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Content Skeleton */}
      <div className="px-4 sm:px-6 md:px-10">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar Skeleton */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-40 h-40 rounded-full mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-6 w-20 mb-6" />
                  <div className="space-y-2 w-full border-t border-gray-200 pt-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="flex-1">
                <Skeleton className="h-px w-full my-6" />

                <div className="space-y-8">
                  {/* About Section */}
                  <div>
                    <Skeleton className="h-6 w-32 mb-3" />
                    <Skeleton className="h-20 w-full" />
                  </div>

                  {/* Experience Section */}
                  <div>
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                            <div>
                              <Skeleton className="h-5 w-40 mb-1" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-4 w-24 mt-2 md:mt-0" />
                          </div>
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div>
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                        <div>
                          <Skeleton className="h-5 w-48 mb-1" />
                          <Skeleton className="h-4 w-56" />
                        </div>
                        <Skeleton className="h-4 w-32 mt-2 md:mt-0" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>

                  {/* Languages Section */}
                  <div>
                    <Skeleton className="h-6 w-24 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div>
                    <Skeleton className="h-6 w-44 mb-4" />
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <Skeleton key={i} className="h-7 w-16 rounded-full" />
                      ))}
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div>
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
