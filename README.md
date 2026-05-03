# hangr — frontend

Cliente React do Hangr.

**Deploy:** https://hangr.com.br | **API:** https://hangr.com.br/api Cria parties com amigos, vota em categorias de rolê e descobre lugares próximos baseado na localização do grupo.

## Stack

- React 19 + Vite
- Framer Motion (animações)
- Lucide React (ícones)
- React Router DOM
- React Leaflet (mapa de lugares)
- @react-oauth/google (login com Google)

## Rodando localmente

```bash
cd hangr-frontend
npm install
```

Crie um `.env` na raiz do frontend:

```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=...
```

Depois:

```bash
npm run dev
```

Abre em `http://localhost:5173`.

## Páginas

- `/auth` — login e cadastro (email/senha ou Google)
- `/onboarding` — seleção de categorias favoritas no primeiro acesso
- `/home` — parties do usuário, criar nova party, entrar com código
- `/party/criar` — formulário de criação
- `/party/join/:codigo` — entrar numa party pelo link de convite
- `/party/:codigo` — tela principal da party (votação, resultado, chat, explorar lugares)
- `/explorar` — busca pública de lugares por categoria e cidade
- `/historico` — feed social de parties encerradas
- `/profile` — perfil, categorias favoritas, seguir pessoas

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API Flask |
| `VITE_GOOGLE_CLIENT_ID` | Client ID do Google OAuth |

## Build

```bash
npm run build
```

Gera os arquivos estáticos em `dist/`.
