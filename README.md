# Blog Platform - Plataforma de Artigos

Uma plataforma moderna de blog inspirada no Medium, construída com Next.js 15, TypeScript, Prisma e NextAuth.

## 🚀 Funcionalidades

### ✨ Sistema de Autenticação
- **Login com Email e Senha**: Sistema tradicional de autenticação
- **Login com Google OAuth**: Integração com Google para login social
- **Registro de Usuários**: Cadastro com validação e hash seguro de senhas
- **Sessões Persistentes**: Manutenção de login entre sessões

### 📝 Sistema de Artigos
- **Criação de Artigos**: Editor de texto com suporte a Markdown
- **Tags e Categorização**: Sistema de tags para organização
- **Imagens de Capa**: Suporte a imagens de capa para artigos
- **Status de Publicação**: Controle de rascunhos e publicação
- **Estatísticas**: Contagem de claps e comentários

### 🎨 Interface Moderna
- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Tema Escuro/Claro**: Suporte a modo escuro
- **Cards de Artigos**: Layout inspirado no Medium
- **Navegação Intuitiva**: Header com links principais

### 🔧 Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilização**: Tailwind CSS
- **Autenticação**: NextAuth.js
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Hash de Senhas**: bcryptjs
- **Formatação de Data**: date-fns

## 📁 Estrutura do Projeto

```
blog-adv/
├── app/                    # App Router do Next.js
│   ├── api/               # APIs
│   │   ├── auth/          # Autenticação
│   │   └── articles/      # CRUD de artigos
│   ├── article/[id]/      # Página individual do artigo
│   ├── articles/          # Listagem de artigos
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── write/             # Editor de artigos
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI
│   ├── ArticleCard.tsx   # Card de artigo
│   ├── HeaderBar.tsx     # Header da aplicação
│   └── GoogleLoginButton.tsx
├── lib/                  # Utilitários
│   ├── auth.ts          # Configuração NextAuth
│   ├── prisma.ts        # Cliente Prisma
│   └── utils.ts         # Funções utilitárias
├── prisma/              # Schema e migrações
│   └── schema.prisma    # Schema do banco
└── types/               # Tipos TypeScript
```

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd blog-adv
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

### 4. Configure o banco de dados
```bash
npx prisma generate
npx prisma db push
```

### 5. Execute o projeto
```bash
npm run dev
```

Acesse `http://localhost:3000` no seu navegador.

## 📖 Como Usar

### Para Usuários

1. **Registro**: Acesse `/register` para criar uma conta
2. **Login**: Use `/login` para acessar sua conta
3. **Escrever**: Clique em "Escrever" no header para criar artigos
4. **Explorar**: Navegue pelos artigos na página inicial ou `/articles`
5. **Ler**: Clique em qualquer artigo para ler o conteúdo completo

### Para Desenvolvedores

#### Criando um Artigo
```typescript
// Exemplo de criação via API
const response = await fetch('/api/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Meu Artigo',
    subtitle: 'Subtítulo opcional',
    content: 'Conteúdo do artigo...',
    tags: ['tecnologia', 'programação'],
    cover_image_url: 'https://exemplo.com/imagem.jpg'
  })
});
```

#### Buscando Artigos
```typescript
// Buscar artigos publicados
const articles = await prisma.article.findMany({
  where: { status: 'publicado' },
  include: {
    author: true,
    tags: { include: { tag: true } },
    _count: { select: { claps: true, comments: true } }
  }
});
```

## 🔐 Segurança

- **Senhas**: Hash com bcrypt (12 rounds)
- **Autenticação**: JWT tokens seguros
- **Validação**: Validação de entrada em todas as APIs
- **CORS**: Configuração adequada para APIs
- **Rate Limiting**: Proteção contra ataques (recomendado implementar)

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- **Netlify**: Suporte completo ao Next.js
- **Railway**: Deploy com PostgreSQL incluído
- **Heroku**: Suporte tradicional

## 📈 Próximos Passos

### Funcionalidades Planejadas
- [ ] Sistema de comentários
- [ ] Sistema de claps (aplausos)
- [ ] Busca e filtros avançados
- [ ] Editor de texto rico (TipTap)
- [ ] Sistema de notificações
- [ ] Perfil de usuário
- [ ] Sistema de seguidores
- [ ] Moderação de conteúdo
- [ ] Analytics de artigos

### Melhorias Técnicas
- [ ] Cache com Redis
- [ ] Upload de imagens
- [ ] SEO otimizado
- [ ] PWA (Progressive Web App)
- [ ] Testes automatizados
- [ ] CI/CD pipeline

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando Next.js, TypeScript e Prisma**
# EEFD-Blog
