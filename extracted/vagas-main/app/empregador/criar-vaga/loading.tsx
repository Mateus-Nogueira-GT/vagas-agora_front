import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="w-full pb-10">
      {/* Cabeçalho */}
      <div className="flex min-h-[120px] items-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 sm:px-6 md:px-10">
        <div className="w-full">
          <Skeleton className="h-8 w-24 bg-white/20 mb-2" />
          <Skeleton className="h-10 w-64 bg-white/20" />
        </div>
      </div>

      {/* Formulário */}
      <div className="relative z-10 -mt-6 px-4 sm:px-6 md:px-10">
        <div className="bg-white border border-[#4400CC]/30 rounded-lg shadow-lg p-6 md:p-8">
          {/* Tabs */}
          <Skeleton className="h-10 w-full mb-6" />

          {/* Conteúdo do formulário */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-64 mb-4" />

              <div className="space-y-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end pt-4 border-t border-[#4400CC]/10">
              <Skeleton className="h-10 w-32 mr-2" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
