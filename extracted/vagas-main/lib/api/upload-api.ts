// API service for file uploads using Supabase Storage
import { createClient } from '@supabase/supabase-js'
import { env, validateConfig } from '../config/env'

export interface UploadResponse {
  url: string
  path: string
}

class UploadApiService {
  private readonly supabase

  constructor() {
    validateConfig()
    this.supabase = createClient(env.supabase.url, env.supabase.anonKey)
  }

  async uploadProfileImage(userId: string, file: File): Promise<UploadResponse> {
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem')
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo deve ter no máximo 5MB')
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const fileName = `profile_${userId}_${timestamp}.${extension}`
      const filePath = `${userId}/${fileName}`

      // Upload para o bucket 'avatars'
      const { data, error } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(error.message || 'Erro ao fazer upload da imagem')
      }

      // Obter URL pública
      const { data: publicUrlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)

      return {
        url: publicUrlData.publicUrl,
        path: data.path
      }
    } catch (error) {
      console.error('Upload profile image error:', error)
      throw error
    }
  }

  async deleteProfileImage(path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from('avatars')
        .remove([path])

      if (error) {
        console.error('Delete image error:', error)
        throw new Error(error.message || 'Erro ao excluir imagem')
      }
    } catch (error) {
      console.error('Delete profile image error:', error)
      throw error
    }
  }

  async uploadPDF(userId: string, file: File): Promise<UploadResponse> {
    try {
      // Validar tipo de arquivo
      if (file.type !== 'application/pdf') {
        throw new Error('Arquivo deve ser um PDF')
      }

      // Validar tamanho (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo deve ter no máximo 10MB')
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const fileName = `curriculo_${userId}_${timestamp}.pdf`
      const filePath = `${userId}/${fileName}`

      // Upload para o bucket 'documents'
      const { data, error } = await this.supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload PDF error:', error)
        throw new Error(error.message || 'Erro ao fazer upload do PDF')
      }

      // Obter URL pública
      const { data: publicUrlData } = this.supabase.storage
        .from('documents')
        .getPublicUrl(data.path)

      return {
        url: publicUrlData.publicUrl,
        path: data.path
      }
    } catch (error) {
      console.error('Upload PDF error:', error)
      throw error
    }
  }

  async deletePDF(path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from('documents')
        .remove([path])

      if (error) {
        console.error('Delete PDF error:', error)
        throw new Error(error.message || 'Erro ao excluir PDF')
      }
    } catch (error) {
      console.error('Delete PDF error:', error)
      throw error
    }
  }

  async uploadCompanyLogo(companyId: string, file: File): Promise<UploadResponse> {
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem')
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo deve ter no máximo 5MB')
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const fileName = `logo_${companyId}_${timestamp}.${extension}`
      const filePath = `${companyId}/${fileName}`

      // Upload para o bucket 'company-logos'
      const { data, error } = await this.supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload logo error:', error)
        throw new Error(error.message || 'Erro ao fazer upload do logo')
      }

      // Obter URL pública
      const { data: publicUrlData } = this.supabase.storage
        .from('company-logos')
        .getPublicUrl(data.path)

      return {
        url: publicUrlData.publicUrl,
        path: data.path
      }
    } catch (error) {
      console.error('Upload company logo error:', error)
      throw error
    }
  }

  async deleteCompanyLogo(path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from('company-logos')
        .remove([path])

      if (error) {
        console.error('Delete logo error:', error)
        throw new Error(error.message || 'Erro ao excluir logo')
      }
    } catch (error) {
      console.error('Delete company logo error:', error)
      throw error
    }
  }

  /**
   * Upload de currículo em PDF (método específico)
   * Usa o mesmo bucket 'documents' mas com nomenclatura específica
   */
  async uploadCurriculoPDF(userId: string, file: File): Promise<UploadResponse> {
    try {
      // Validar tipo de arquivo
      if (file.type !== 'application/pdf') {
        throw new Error('Apenas arquivos PDF são permitidos')
      }

      // Validar tamanho (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo deve ter no máximo 10MB')
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const fileName = `curriculo_${userId}_${timestamp}.pdf`
      const filePath = `curriculos/${userId}/${fileName}`

      // Upload para o bucket 'documents'
      const { data, error } = await this.supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload currículo PDF error:', error)
        throw new Error(error.message || 'Erro ao fazer upload do currículo')
      }

      // Obter URL pública
      const { data: publicUrlData } = this.supabase.storage
        .from('documents')
        .getPublicUrl(data.path)

      return {
        url: publicUrlData.publicUrl,
        path: data.path
      }
    } catch (error) {
      console.error('Upload currículo PDF error:', error)
      throw error
    }
  }

  /**
   * Remove currículo PDF
   */
  async deleteCurriculoPDF(path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from('documents')
        .remove([path])

      if (error) {
        console.error('Delete currículo PDF error:', error)
        throw new Error(error.message || 'Erro ao excluir currículo')
      }
    } catch (error) {
      console.error('Delete currículo PDF error:', error)
      throw error
    }
  }
}

export const uploadApiService = new UploadApiService()
