"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface DocumentUploadProps {
  vagaId: string
  onUploadSuccess?: (file: File) => void
}

export function DocumentUpload({ vagaId, onUploadSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File | null) => {
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Por favor, selecione um arquivo PDF, DOC ou DOCX')
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 5MB')
      return
    }

    setSelectedFile(file)
    toast.success('Documento selecionado com sucesso!')

    if (onUploadSuccess) {
      onUploadSuccess(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileInputChange}
        className="hidden"
        id="document-upload"
      />

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#4400CC] bg-[#4400CC]/5'
              : 'border-gray-200 hover:border-[#4400CC]/50 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-[#4400CC] mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium text-[#4400CC]">Clique para selecionar</span> ou arraste seu documento
          </p>
          <p className="text-xs text-gray-400">PDF, DOC ou DOCX (máx. 5MB)</p>
        </div>
      ) : (
        <div className="border border-[#4400CC]/30 rounded-lg p-4 bg-[#4400CC]/5">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-[#4400CC]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-[#4400CC]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                <div className="flex items-center mt-2">
                  <Check className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600 font-medium">Documento pronto para envio</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-red-600 -mt-1 -mr-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        {selectedFile
          ? 'O documento será enviado junto com sua candidatura'
          : 'Adicione documentos adicionais como portfólio ou carta de apresentação'}
      </p>
    </div>
  )
}
