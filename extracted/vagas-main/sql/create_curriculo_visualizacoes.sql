-- Tabela para registrar as visualizações dos currículos
-- Esta tabela armazena quando um usuário visualiza o currículo de um candidato

CREATE TABLE IF NOT EXISTS curriculo_visualizacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
    visualizador_id TEXT NOT NULL, -- Pode ser um UUID de usuário logado ou um ID de visitor
    data_visualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_curriculo_visualizacoes_candidato_id
    ON curriculo_visualizacoes(candidato_id);

CREATE INDEX IF NOT EXISTS idx_curriculo_visualizacoes_data
    ON curriculo_visualizacoes(data_visualizacao);

CREATE INDEX IF NOT EXISTS idx_curriculo_visualizacoes_candidato_data
    ON curriculo_visualizacoes(candidato_id, data_visualizacao);

-- Índice composto para evitar visualizações duplicadas no mesmo dia
CREATE UNIQUE INDEX IF NOT EXISTS idx_curriculo_visualizacoes_unique_daily
    ON curriculo_visualizacoes(candidato_id, visualizador_id, DATE(data_visualizacao));

-- Habilitar RLS (Row Level Security) para segurança
ALTER TABLE curriculo_visualizacoes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção por qualquer usuário (necessário para visitors)
CREATE POLICY IF NOT EXISTS "Permitir inserção de visualizações" ON curriculo_visualizacoes
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura apenas do próprio candidato
CREATE POLICY IF NOT EXISTS "Candidatos podem ler suas visualizações" ON curriculo_visualizacoes
    FOR SELECT USING (
        candidato_id IN (
            SELECT id FROM candidatos
            WHERE user_id = auth.uid()
        )
    );

-- Comentários para documentação
COMMENT ON TABLE curriculo_visualizacoes IS 'Registra as visualizações dos currículos dos candidatos';
COMMENT ON COLUMN curriculo_visualizacoes.candidato_id IS 'ID do candidato cujo currículo foi visualizado';
COMMENT ON COLUMN curriculo_visualizacoes.visualizador_id IS 'ID do usuário que visualizou (pode ser UUID de usuário ou ID de visitor)';
COMMENT ON COLUMN curriculo_visualizacoes.data_visualizacao IS 'Data e hora da visualização';