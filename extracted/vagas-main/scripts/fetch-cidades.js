// Script para baixar todas as cidades do Brasil do IBGE
const https = require('https');
const fs = require('fs');
const path = require('path');

const URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';

console.log('📥 Baixando cidades do IBGE...');
https.get(URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const municipios = JSON.parse(data);

      // Agrupar por estado
      const cidadesPorEstado = {};

      municipios.forEach(municipio => {
        // Estrutura da API IBGE: municipio.microrregiao?.mesorregiao?.UF?.sigla
        const uf = municipio.microrregiao?.mesorregiao?.UF?.sigla;
        const nome = municipio.nome;

        if (!uf || !nome) {
          console.warn('⚠️  Município sem UF ou nome:', municipio);
          return;
        }

        if (!cidadesPorEstado[uf]) {
          cidadesPorEstado[uf] = [];
        }

        cidadesPorEstado[uf].push(nome);
      });

      // Ordenar alfabeticamente
      Object.keys(cidadesPorEstado).forEach(uf => {
        cidadesPorEstado[uf].sort();
      });

      // Gerar código TypeScript
      let tsCode = `// Todas as cidades brasileiras por estado (IBGE)\n`;
      tsCode += `// Total: ${municipios.length} municípios\n`;
      tsCode += `// Gerado automaticamente em ${new Date().toISOString()}\n\n`;
      tsCode += `export const TODAS_CIDADES: Record<string, string[]> = {\n`;

      Object.keys(cidadesPorEstado).sort().forEach(uf => {
        tsCode += `  '${uf}': [\n`;
        const cidades = cidadesPorEstado[uf];

        // Dividir em linhas de ~5 cidades para melhor legibilidade
        for (let i = 0; i < cidades.length; i += 5) {
          const chunk = cidades.slice(i, i + 5);
          // Escapar aspas simples dentro dos nomes
          tsCode += `    ${chunk.map(c => `'${c.replace(/'/g, "\\'")}'`).join(', ')}${i + 5 < cidades.length ? ',' : ''}\n`;
        }

        tsCode += `  ],\n`;
      });

      tsCode += `}\n`;

      // Salvar arquivo
      const outputPath = path.join(__dirname, '..', 'lib', 'data', 'todas-cidades.ts');
      fs.writeFileSync(outputPath, tsCode, 'utf-8');

      console.log(`✅ Arquivo gerado com sucesso!`);
      console.log(`📍 Localização: ${outputPath}`);
      console.log(`📊 Total de cidades: ${municipios.length}`);
      console.log(`🗺️  Estados: ${Object.keys(cidadesPorEstado).length}`);

      // Mostrar estatísticas por estado
      console.log('\n📋 Cidades por estado:');
      Object.keys(cidadesPorEstado).sort().forEach(uf => {
        console.log(`   ${uf}: ${cidadesPorEstado[uf].length} cidades`);
      });

    } catch (error) {
      console.error('❌ Erro ao processar dados:', error);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('❌ Erro ao baixar dados:', error);
  process.exit(1);
});