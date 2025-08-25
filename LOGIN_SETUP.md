# Sistema de Login com Email e Senha

O sistema agora suporta login tanto com Google OAuth quanto com email e senha tradicionais.

## Funcionalidades Implementadas

### 1. Login com Email e Senha
- Formulário de login funcional em `/login`
- Validação de credenciais usando bcrypt
- Integração com NextAuth.js
- Mensagens de erro para credenciais inválidas

### 2. Registro com Email e Senha
- Formulário de registro funcional em `/register`
- Validação de dados (nome, email, senha mínima de 6 caracteres)
- Hash seguro de senhas com bcrypt
- Verificação de email duplicado
- Redirecionamento automático após registro

### 3. Autenticação Mista
- Login com Google OAuth (já funcionando)
- Login com email e senha (novo)
- Ambos os métodos funcionam simultaneamente

## Como Usar

### Para Usuários

1. **Registro**:
   - Acesse `/register`
   - Preencha nome, email e senha (mínimo 6 caracteres)
   - Clique em "Cadastrar"
   - Será redirecionado para login após sucesso

2. **Login**:
   - Acesse `/login`
   - Use email e senha ou clique em "Entrar com Google"
   - Após login bem-sucedido, será redirecionado para a página inicial

### Para Desenvolvedores

#### Estrutura de Arquivos

```
app/
├── login/page.tsx          # Página de login
├── register/page.tsx       # Página de registro
└── api/auth/
    ├── register/route.ts   # API de registro
    └── [...nextauth]/route.ts # Configuração NextAuth

lib/
└── auth.ts                 # Configuração de autenticação

components/
├── GoogleLoginButton.tsx   # Botão de login Google
└── HeaderBar.tsx          # Header com status de login
```

#### Variáveis de Ambiente

Certifique-se de que o arquivo `.env` contenha:

```env
DATABASE_URL="sua-url-do-banco"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta"
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

#### Dependências

O sistema usa as seguintes dependências principais:
- `next-auth` - Autenticação
- `bcryptjs` - Hash de senhas
- `@auth/prisma-adapter` - Adaptador do Prisma
- `@prisma/client` - Cliente do banco de dados

## Segurança

- Senhas são hasheadas com bcrypt (12 rounds)
- Validação de entrada em todas as APIs
- Proteção contra emails duplicados
- Mensagens de erro genéricas para não revelar informações sensíveis

## Próximos Passos

Para melhorar o sistema, considere:

1. **Validação de Email**: Implementar verificação de email
2. **Recuperação de Senha**: Sistema de reset de senha
3. **Perfil do Usuário**: Página para editar informações
4. **Logs de Auditoria**: Registrar tentativas de login
5. **Rate Limiting**: Limitar tentativas de login

## Testando

1. Inicie o servidor: `npm run dev`
2. Acesse `http://localhost:3000/register`
3. Crie uma conta
4. Teste o login em `http://localhost:3000/login`
5. Verifique se o header mostra o status de login 