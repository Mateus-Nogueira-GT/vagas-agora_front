-- Adicionar campos de disponibilidade para mudança
ALTER TABLE candidatos
ADD COLUMN IF NOT EXISTS mudanca_cidade BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mudanca_estado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mudanca_pais BOOLEAN DEFAULT false;

-- Adicionar campos de disponibilidade para início (tipo de disponibilidade)
ALTER TABLE candidatos
ADD COLUMN IF NOT EXISTS disponibilidade_tipo VARCHAR(50) DEFAULT 'imediato';

-- Adicionar campos de modalidade de trabalho
ALTER TABLE candidatos
ADD COLUMN IF NOT EXISTS aceita_presencial BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS aceita_hibrido BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS aceita_remoto BOOLEAN DEFAULT true;

-- Comentários para documentação
COMMENT ON COLUMN candidatos.mudanca_cidade IS 'Disponível para mudar de cidade';
COMMENT ON COLUMN candidatos.mudanca_estado IS 'Disponível para mudar de estado';
COMMENT ON COLUMN candidatos.mudanca_pais IS 'Disponível para mudar de país';
COMMENT ON COLUMN candidatos.disponibilidade_tipo IS 'Tipo de disponibilidade: imediato ou com_aviso_previo';
COMMENT ON COLUMN candidatos.aceita_presencial IS 'Aceita trabalho presencial';
COMMENT ON COLUMN candidatos.aceita_hibrido IS 'Aceita trabalho híbrido';
COMMENT ON COLUMN candidatos.aceita_remoto IS 'Aceita trabalho remoto';
