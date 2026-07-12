import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      // Dívida legada será tratada incrementalmente; o typecheck estrito permanece obrigatório.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@next/next/no-img-element': 'off',

      // O projeto ainda não adotou React Compiler. Essas regras não devem bloquear
      // correções funcionais até existir uma iniciativa dedicada de migração.
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',

      // Dependências incorretas de hooks permanecem bloqueantes.
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.bmad-core/**',
    '.cursor/**',
    '.playwright-mcp/**',
  ]),
])
