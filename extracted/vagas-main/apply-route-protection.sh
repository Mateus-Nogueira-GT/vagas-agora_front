#!/bin/bash

# Script para aplicar proteção de rotas em todas as páginas do sistema
# Executa comandos de find e replace para adicionar ProtectedRoute

echo "🔒 Aplicando proteção de rotas em todas as páginas..."

# Função para aplicar proteção em uma página
apply_protection() {
    local file=$1
    local role=$2
    
    echo "Aplicando proteção em $file para role: $role"
    
    # Adicionar import se não existir
    if ! grep -q "ProtectedRoute" "$file"; then
        # Encontra a última linha de import e adiciona o novo import
        sed -i '' '/^import.*from.*$/a\
import { ProtectedRoute } from "@/components/auth/protected-route"
' "$file"
    fi
    
    # Substituir o return para adicionar ProtectedRoute
    sed -i '' "s|return (|return (\
    <ProtectedRoute allowedRoles={['$role']}>|g" "$file"
    
    # Adicionar fechamento do ProtectedRoute antes do último )}
    sed -i '' 's|  )|    </ProtectedRoute>\
  )|g' "$file"
}

# Aplicar proteção nas páginas do admin
echo "📊 Protegendo páginas do admin..."
find app/admin -name "page.tsx" | while read file; do
    apply_protection "$file" "admin"
done

# Aplicar proteção nas páginas do empregador
echo "🏢 Protegendo páginas do empregador..."
find app/empregador -name "page.tsx" | while read file; do
    apply_protection "$file" "empregador"
done

# Aplicar proteção nas páginas do candidato
echo "👤 Protegendo páginas do candidato..."
find app/candidato -name "page.tsx" | while read file; do
    apply_protection "$file" "candidato"
done

echo "✅ Proteção de rotas aplicada com sucesso!"
echo ""
echo "📋 Páginas protegidas:"
echo "   🔸 Admin: $(find app/admin -name "page.tsx" | wc -l) páginas"
echo "   🔸 Empregador: $(find app/empregador -name "page.tsx" | wc -l) páginas"
echo "   🔸 Candidato: $(find app/candidato -name "page.tsx" | wc -l) páginas"
echo ""
echo "🚨 Importante: Revise manualmente se alguma página possui estrutura diferente!"
