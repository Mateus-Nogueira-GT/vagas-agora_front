"use client"

import { useEffect } from "react"
import { Briefcase, Settings, Check, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useNotificacoes } from "@/hooks/use-notificacoes"
import { Notificacao } from "@/lib/api/notificacoes-api"

// Tipos de notificações constantes
const notificationTypes = {
  candidatura: {
    color: "#4400CC",
    icon: Briefcase,
  },
  sistema: {
    color: "#0057FF",
    icon: Settings,
  },
  alerta: {
    color: "#FFB800",
    icon: AlertCircle,
  },
} as const

// Tipos para as notificações (mantendo compatibilidade com o layout existente)
interface Notification {
  id: number
  type: keyof typeof notificationTypes
  title: string
  description: string
  date: string
  read: boolean
}

interface NotificationTypeInfo {
  color: string
  icon: React.ComponentType<any>
}

export default function Notifications() {
  const {
    notificacoes,
    isLoading,
    error,
    filtroAtivo,
    loadNotificacoes,
    marcarComoLida,
    excluirNotificacao,
    setFiltro
  } = useNotificacoes()

  useEffect(() => {
    loadNotificacoes('todas')
  }, [loadNotificacoes])

  // Converter notificações da API para o formato esperado pelo layout
  const convertNotificacao = (notif: Notificacao): Notification => ({
    id: notif.id,
    type: (notif.tipo as keyof typeof notificationTypes) || 'sistema',
    title: notif.titulo,
    description: notif.descricao,
    date: formatarData(notif.data),
    read: notif.lida
  })

  const formatarData = (dataISO: string): string => {
    const data = new Date(dataISO)
    const agora = new Date()
    const diffDias = Math.floor((agora.getTime() - data.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDias === 0) {
      return `Hoje, ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDias === 1) {
      return `Ontem, ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const notifications = notificacoes.map(convertNotificacao)

  return (
    <ProtectedRoute allowedRoles={['candidato']}>
      <div className="w-full pb-10">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Notificações</h1>
        <p className="text-base md:text-lg text-white/80 mt-2">Acompanhe atualizações sobre suas candidaturas</p>
      </div>

      <div className="px-4 sm:px-6 md:px-10 mt-6 sm:mt-8">
        {/* Filtros por tipo */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            className={`cursor-pointer px-4 py-1.5 text-sm font-medium ${
              filtroAtivo === 'todas'
                ? 'bg-[#4400CC] hover:bg-[#3300AA] text-white'
                : 'bg-white text-[#4400CC] border border-[#4400CC]/30 hover:bg-[#4400CC]/10'
            }`}
            variant={filtroAtivo === 'todas' ? 'default' : 'outline'}
            onClick={() => setFiltro('todas')}
          >
            Todas
          </Badge>
          <Badge
            className={`cursor-pointer px-4 py-1.5 text-sm font-medium ${
              filtroAtivo === 'nao-lidas'
                ? 'bg-[#4400CC] hover:bg-[#3300AA] text-white'
                : 'bg-white text-[#4400CC] border border-[#4400CC]/30 hover:bg-[#4400CC]/10'
            }`}
            variant={filtroAtivo === 'nao-lidas' ? 'default' : 'outline'}
            onClick={() => setFiltro('nao-lidas')}
          >
            Não lidas
          </Badge>
        </div>

        {/* Lista de notificações */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando notificações...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma notificação encontrada</div>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification as Notification}
                typeInfo={notificationTypes[notification.type as keyof typeof notificationTypes]}
                onMarcarComoLida={() => marcarComoLida(notification.id)}
                onExcluir={() => excluirNotificacao(notification.id)}
              />
            ))
          )}
        </div>

        {/* Botão para carregar mais */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5 hover:text-[#4400CC]"
          >
            Carregar mais notificações
          </Button>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}

// Componente de card de notificação
function NotificationCard({
  notification,
  typeInfo,
  onMarcarComoLida,
  onExcluir
}: {
  notification: Notification
  typeInfo: NotificationTypeInfo
  onMarcarComoLida: () => void
  onExcluir: () => void
}) {
  const { id, type, title, description, date, read } = notification
  const { color, icon: Icon } = typeInfo

  return (
    <Card
      className={`bg-white border-l-4 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all relative overflow-hidden ${
        read ? "" : "bg-[#4400CC]/5"
      }`}
      style={{ borderLeftColor: color }}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
            style={{ backgroundColor: `${color}10` }}
          >
            <Icon size={20} style={{ color: color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium text-gray-800">{title}</h3>
                  {!read && (
                    <span
                      className="w-2 h-2 rounded-full ml-2"
                      style={{ backgroundColor: color }}
                      aria-label="Não lida"
                    ></span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
                <p className="text-xs text-gray-500 mt-2">{date}</p>
              </div>
              <div className="flex space-x-1">
                {!read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-[#4400CC] hover:bg-[#4400CC]/10"
                    title="Marcar como lida"
                    onClick={onMarcarComoLida}
                  >
                    <Check size={16} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  title="Excluir notificação"
                  onClick={onExcluir}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
