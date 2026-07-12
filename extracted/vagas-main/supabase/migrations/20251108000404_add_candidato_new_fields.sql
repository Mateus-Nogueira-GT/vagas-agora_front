-- Adicionar campos de localização (latitude e longitude) para busca por proximidade
ALTER TABLE candidatos
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Adicionar mais redes sociais
ALTER TABLE candidatos
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT;

-- Adicionar campos de disponibilidade detalhada
ALTER TABLE candidatos
ADD COLUMN IF NOT EXISTS inicio_imediato BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aviso_previo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aceita_presencial BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS aceita_hibrido BOOLEAN DEFAULT true;

-- Adicionar campo para currículo em PDF
ALTER TABLE candidatos
ADD COLUMN IF NOT EXISTS curriculo_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS compartilhar_pdf BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN candidatos.latitude IS 'Latitude da localização do candidato para busca por proximidade';
COMMENT ON COLUMN candidatos.longitude IS 'Longitude da localização do candidato para busca por proximidade';
COMMENT ON COLUMN candidatos.inicio_imediato IS 'Disponível para início imediato (exclusivo com aviso_previo)';
COMMENT ON COLUMN candidatos.aviso_previo IS 'Cumprindo aviso prévio (exclusivo com inicio_imediato)';
COMMENT ON COLUMN candidatos.aceita_presencial IS 'Aceita trabalho presencial';
COMMENT ON COLUMN candidatos.aceita_hibrido IS 'Aceita trabalho híbrido';
COMMENT ON COLUMN candidatos.curriculo_pdf_url IS 'URL do currículo em PDF no Supabase Storage';
COMMENT ON COLUMN candidatos.compartilhar_pdf IS 'Se o PDF deve ser compartilhado publicamente';
