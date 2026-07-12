// Environment configuration following BMAD best practices
interface EnvConfig {
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey?: string
  }
}

function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env: EnvConfig = {
  supabase: {
    url: validateEnvVar('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: validateEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

// Validate configuration on module load
export function validateConfig(): void {
  try {
    // Validate URL format
    new URL(env.supabase.url)
    
    // Validate API key format (basic JWT check)
    if (!env.supabase.anonKey.startsWith('eyJ')) {
      throw new Error('Invalid Supabase API key format')
    }
    
  } catch (error) {
    console.error('❌ Environment configuration validation failed:', error)
    throw error
  }
}
