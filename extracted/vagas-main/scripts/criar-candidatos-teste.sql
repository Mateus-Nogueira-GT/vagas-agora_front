-- Script para criar 2 candidatos de teste
-- Execute este script no Supabase SQL Editor

-- 1. Criar os perfis de usuário (profiles)
INSERT INTO profiles (id, email, role, ativo, data_cadastro, ultimo_acesso)
VALUES
  ('cf905ff6-b981-4223-92d8-fe5bbb73babe', 'joao.silva@email.com', 'candidato', true, NOW(), NOW()),
  ('2a568ac2-c060-45d6-b3d1-ea6d00899f95', 'maria.santos@email.com', 'candidato', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Criar os dados completos dos candidatos
INSERT INTO candidatos (
  id,
  nome_completo,
  telefone,
  data_nascimento,
  titulo_profissional,
  nivel_senioridade,
  endereco,
  disponibilidade_imediata,
  pretensao_salarial_min,
  pretensao_salarial_max
)
VALUES
  (
    'cf905ff6-b981-4223-92d8-fe5bbb73babe',
    'João Silva',
    '(11) 98765-4321',
    '1990-05-15',
    'Desenvolvedor Full Stack',
    'Pleno',
    '{"cep": "01310-100", "rua": "Av. Paulista", "numero": "1578", "cidade": "São Paulo", "estado": "SP", "bairro": "Bela Vista"}'::jsonb,
    true,
    5000.00,
    8000.00
  ),
  (
    '2a568ac2-c060-45d6-b3d1-ea6d00899f95',
    'Maria Santos',
    '(21) 99876-5432',
    '1995-08-22',
    'Designer UX/UI',
    'Júnior',
    '{"cep": "20040-020", "rua": "Av. Rio Branco", "numero": "156", "cidade": "Rio de Janeiro", "estado": "RJ", "bairro": "Centro"}'::jsonb,
    false,
    3500.00,
    5500.00
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se os candidatos foram criados
SELECT
  p.id,
  p.email,
  c.nome_completo,
  c.titulo_profissional,
  c.nivel_senioridade,
  c.endereco->>'cidade' as cidade,
  c.endereco->>'estado' as estado
FROM profiles p
INNER JOIN candidatos c ON c.id = p.id
WHERE p.email IN ('joao.silva@email.com', 'maria.santos@email.com');
