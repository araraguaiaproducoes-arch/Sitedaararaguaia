# Araraguaia — estático COMPLETO (Assistente + Notícias + Sobre + LGPD + Publicação GitHub)

## O que tem
- **Assistente (ChatGPT) Admin** com três intenções: criar edital, criar notícia, criar página "Sobre".
- **Publicação no GitHub** (commit automático) via `/api/publish`.
- **Notícias**: `data/noticias.json` e páginas `index.html` (teasers) e `noticias.html` (lista completa).
- **Página Sobre** (`sobre.html`), substituível via Assistente.
- **LGPD**: checkbox de consentimento obrigatório nos formulários.
- **Poppins** como tipografia e paleta refinada (preto + amarelo + azul).

## Variáveis de ambiente (Vercel → Settings → Environment Variables)
- `OPENAI_API_KEY` = sua chave.
- `ADMIN_PASS` = senha para abrir o chat admin e usar as APIs.
- **Para publicar no GitHub (opcional):**
  - `GITHUB_TOKEN` = token com escopo `repo`.
  - `GITHUB_OWNER` = dono da conta/org do repositório.
  - `GITHUB_REPO` = nome do repositório.
  - `GITHUB_BRANCH` = branch (padrão: main).

## Rotas de diagnóstico
- `/api/health` → mostra se as variáveis estão **present**.

## Como usar o Assistente
1) Abra `https://seusite.vercel.app/?admin=1` → clique no ✦ → informe a senha (`ADMIN_PASS`).
2) Selecione a **Intenção** (Edital / Notícia / Sobre), escreva sua solicitação e clique **Gerar**.
3) O painel mostra **prévia** e oferece **download** do arquivo (editais.json / noticias.json / sobre.html).
4) Se as variáveis do GitHub estiverem configuradas, preencha **caminho** (ex.: `data/noticias.json`) e **mensagem** e clique **Publicar no GitHub**.

> Observação: como o site é estático, o conteúdo público vem dos arquivos em `/data` e páginas `.html`. Publicar = **commit** de arquivos no seu repo.

## Estrutura
index.html
noticias.html
sobre.html
privacidade.html
styles.css
script.js
chat.js
api/
  assistente.js
  publish.js
  health.js
assets/
  logo-araguaia.png
  poster-araguaia.jpg
  intro-araguaia.mp4 (adicione)
data/
  editais.json
  noticias.json
