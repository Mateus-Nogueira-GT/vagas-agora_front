import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function JobDetailsSkeleton() {
  return (
    <div className="w-full pb-24">
      {/* Cabeçalho da empresa - Skeleton */}
      <div className="bg-[#4400CC] p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-xl mr-4" />
          <div>
            <Skeleton className="h-8 w-48 mb-2 bg-white/20" />
            <Skeleton className="h-4 w-64 bg-white/20" />
          </div>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-3">
          <Skeleton className="h-9 w-32 bg-white/20" />
          <Skeleton className="h-9 w-40 bg-white/20" />
        </div>
      </div>

      <div className="px-4 md:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Título e salário */}
            <div>
              <Skeleton className="h-8 w-96 mb-2" />
              <Skeleton className="h-6 w-48 mt-2" />
            </div>

            {/* Cards de informações principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-gray-200">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Skeleton className="h-6 w-6 rounded-full mb-2" />
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-5 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-28 rounded-full" />
              ))}
            </div>

            {/* Descrição da vaga */}
            <div>
              <Skeleton className="h-6 w-48 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Diferenciais */}
            <div>
              <Skeleton className="h-6 w-56 mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start">
                    <Skeleton className="h-5 w-5 rounded-full mr-2 mt-0.5 flex-shrink-0" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Responsabilidades */}
            <div>
              <Skeleton className="h-6 w-48 mb-3" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start">
                    <Skeleton className="h-6 w-6 rounded-full mr-3 flex-shrink-0" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Requisitos */}
            <div>
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="bg-[#4400CC]/5 p-4 rounded-lg mb-4">
                <Skeleton className="h-5 w-40 mb-3" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start">
                      <Skeleton className="h-6 w-6 rounded-full mr-3 flex-shrink-0" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Benefícios */}
            <div>
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border border-gray-200">
                    <CardContent className="p-4 flex items-center">
                      <Skeleton className="h-5 w-5 rounded-full mr-3" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna lateral */}
          <div className="space-y-6">
            {/* Sobre a empresa */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>

            {/* Candidatura */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-56 mb-4" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </CardContent>
            </Card>

            {/* Vagas similares */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div className="flex items-center flex-1">
                        <Skeleton className="w-8 h-8 rounded-lg mr-3" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
