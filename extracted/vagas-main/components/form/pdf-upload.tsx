"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FileText, Upload, X, Download, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import { uploadApiService } from "@/lib/api/upload-api"
import toast from "react-hot-toast"

interface PDFUploadProps {
  userId: string
  currentPdfUrl?: string
  currentPdfName?: string
  onUploadSuccess: (url: string, fileName: string) => void
  onRemove?: () => void
  disabled?: boolean
  maxSizeMB?: number
}

export function PDFUpload({
  userId,
  currentPdfUrl,
  currentPdfName,
  onUploadSuccess,
  onRemove,
  disabled = false,
  maxSizeMB = 10
}: PDFUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    // Validar tipo de arquivo
    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos')
      return
    }

    // Validar tamanho
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simular progresso enquanto faz upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 200)

      const result = await uploadApiService.uploadCurriculoPDF(userId, file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Chamar callback de sucesso
      onUploadSuccess(result.url, file.name)

      toast.success('Currículo PDF enviado com sucesso!')

      // Resetar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      toast.error(error.message || 'Erro ao enviar PDF')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemovePDF = async () => {
    if (!onRemove) return

    try {
      onRemove()
      toast.success('PDF removido com sucesso')
    } catch (error) {
      console.error('Erro ao remover PDF:', error)
      toast.error('Erro ao remover PDF')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (disabled || isUploading) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-[#4400CC]" />
        <Label className="text-base font-semibold text-gray-900">
          Currículo em PDF
        </Label>
      </div>

      {/* Área de upload ou arquivo atual */}
      {currentPdfUrl && !isUploading ? (
        <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-green-100 rounded">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <p className="font-medium text-green-900">Currículo PDF anexado</p>
                </div>
                <p className="text-sm text-green-700 mt-1 truncate">
                  {currentPdfName || 'curriculo.pdf'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(currentPdfUrl, '_blank')}
                disabled={disabled}
              >
                <Download className="h-4 w-4 mr-1" />
                Ver
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePDF}
                disabled={disabled}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isUploading
              ? 'border-[#4400CC] bg-[#4400CC]/5'
              : 'border-gray-300 hover:border-[#4400CC] hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="space-y-3">
              <Loader2 className="h-12 w-12 text-[#4400CC] animate-spin mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Enviando PDF...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                  <div
                    className="bg-[#4400CC] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                Clique para selecionar ou arraste um PDF
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Máximo {maxSizeMB}MB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar PDF
              </Button>
            </>
          )}
        </div>
      )}

      {/* Informações */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900 space-y-1">
            <p>
              <strong>Por que anexar seu currículo em PDF?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Empresas podem visualizar seu currículo formatado</li>
              <li>Facilita o processo de candidatura</li>
              <li>Mantém a formatação original do seu documento</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-900">
            <strong>Importante:</strong> Certifique-se de que seu PDF não contém informações
            pessoais sensíveis como RG, CPF ou dados bancários.
          </p>
        </div>
      </div>
    </div>
  )
}
