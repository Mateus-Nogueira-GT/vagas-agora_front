'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Mail } from 'lucide-react'

export default function ContaDesativadaPage() {
  const router = useRouter()

  useEffect(() => {
    // Limpar o localStorage para garantir logout completo
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Conta Desativada</CardTitle>
          <CardDescription className="text-base">
            Sua conta foi desativada pelo administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 text-center">
              Você não tem mais acesso ao sistema. Para reativar sua conta,
              entre em contato com o administrador.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/ajuda')}
              className="w-full"
              variant="default"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contatar Administrador
            </Button>

            <Button
              onClick={() => router.push('/')}
              className="w-full"
              variant="outline"
            >
              Voltar para Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
