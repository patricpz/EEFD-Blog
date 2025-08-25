# Configuração do Google OAuth

Para usar o login com Google, você precisa configurar as seguintes variáveis de ambiente:

## 1. Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ 
4. Vá para "Credenciais" no menu lateral
5. Clique em "Criar credenciais" > "ID do cliente OAuth 2.0"
6. Configure a tela de consentimento OAuth
7. Adicione os URIs de redirecionamento autorizados:
   - `http://localhost:3000/api/auth/callback/google` (desenvolvimento)
   - `https://seu-dominio.com/api/auth/callback/google` (produção)

## 2. Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Google OAuth
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

## 3. Gerar NEXTAUTH_SECRET

Você pode gerar uma chave secreta usando:

```bash
openssl rand -base64 32
```

## 4. Testar

Após configurar as variáveis de ambiente, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

Agora você deve ver o botão "Entrar com Google" nas páginas de login e registro. 