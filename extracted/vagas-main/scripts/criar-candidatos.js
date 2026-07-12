// Script para criar candidatos de teste no banco de dados
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function criarCandidatos() {
  console.log('Criando candidatos de teste...\n')
  // 1. Criar perfis de usuário
  const candidatosData = [
    {
      id: 'cf905ff6-b981-4223-92d8-fe5bbb73babe',
      email: 'joao.silva@email.com',
      nome_completo: 'João Silva',
      telefone: '(11) 98765-4321',
      data_nascimento: '1990-05-15',
      titulo_profissional: 'Desenvolvedor Full Stack',
      nivel_senioridade: 'Pleno',
      endereco: {
        cep: '01310-100',
        rua: 'Av. Paulista',
        numero: '1578',
        cidade: 'São Paulo',
        estado: 'SP',
        bairro: 'Bela Vista'
      },
      disponibilidade_imediata: true,
      pretensao_salarial_min: 5000.00,
      pretensao_salarial_max: 8000.00
    },
    {
      id: '2a568ac2-c060-45d6-b3d1-ea6d00899f95',
      email: 'maria.santos@email.com',
      nome_completo: 'Maria Santos',
      telefone: '(21) 99876-5432',
      data_nascimento: '1995-08-22',
      titulo_profissional: 'Designer UX/UI',
      nivel_senioridade: 'Júnior',
      endereco: {
        cep: '20040-020',
        rua: 'Av. Rio Branco',
        numero: '156',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        bairro: 'Centro'
      },
      disponibilidade_imediata: false,
      pretensao_salarial_min: 3500.00,
      pretensao_salarial_max: 5500.00
    }
  ]

  for (const candidato of candidatosData) {
    console.log(`Criando candidato: ${candidato.nome_completo}`)

    // Criar profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: candidato.id,
        email: candidato.email,
        role: 'candidato',
        ativo: true,
        data_cadastro: new Date().toISOString(),
        ultimo_acesso: new Date().toISOString()
      })
      .select()

    if (profileError) {
      console.error(`❌ Erro ao criar profile para ${candidato.email}:`, profileError.message)
      continue
    }

    // Criar candidato
    const { data: candidatoData, error: candidatoError } = await supabase
      .from('candidatos')
      .upsert({
        id: candidato.id,
        nome_completo: candidato.nome_completo,
        telefone: candidato.telefone,
        data_nascimento: candidato.data_nascimento,
        titulo_profissional: candidato.titulo_profissional,
        nivel_senioridade: candidato.nivel_senioridade,
        endereco: candidato.endereco,
        disponibilidade_imediata: candidato.disponibilidade_imediata,
        pretensao_salarial_min: candidato.pretensao_salarial_min,
        pretensao_salarial_max: candidato.pretensao_salarial_max
      })
      .select()

    if (candidatoError) {
      console.error(`❌ Erro ao criar candidato ${candidato.nome_completo}:`, candidatoError.message)
    } else {
      console.log(`✅ Candidato ${candidato.nome_completo} criado com sucesso!`)
    }
  }

  // Verificar candidatos criados
  console.log('\n📋 Listando candidatos criados:')
  const { data: candidatos, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      candidatos (
        nome_completo,
        titulo_profissional,
        nivel_senioridade,
        endereco
      )
    `)
    .eq('role', 'candidato')
    .in('email', ['joao.silva@email.com', 'maria.santos@email.com'])

  if (error) {
    console.error('❌ Erro ao listar candidatos:', error.message)
  } else {
    console.log(JSON.stringify(candidatos, null, 2))
  }

  console.log('\n✨ Processo concluído!')
}

criarCandidatos()