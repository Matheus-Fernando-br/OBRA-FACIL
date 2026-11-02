# Instagram @obra.facil.app

Conteúdo produzido com as skills de https://github.com/Jakeschincariol/instagram-agent-skill
(o pacote só escreve; quem publica é você, pelo app do Instagram ou pelo Meta Business Suite).

| Arquivo | O que é |
|---|---|
| `voice.md` | Voz da marca: público, tom, posições e regras |
| `perfil.md` | Nome, bio, link, destaques e tipo de conta |
| `plano.md` | Calendário: 2 posts por semana (terça e quinta, 19h) + rotina de interação |
| `posts/AAAA-MM-DD-tema/` | Slides prontos (PNG 1080×1350), legenda, texto alternativo |
| `posts/_render.py` + `posts/_png.cjs` | Geram os PNGs a partir de `slides.json` (`python3 _render.py PASTA && node _png.cjs PASTA`) |

## Como publicar um carrossel (2 minutos)
1. Baixe os PNGs da pasta do post para o celular (ou abra pelo computador no Meta Business Suite).
2. Instagram → **+** → **Post** → selecione os slides **na ordem** (01, 02, …).
3. Cole a legenda de `legenda.txt`.
4. Em **Configurações avançadas → Acessibilidade**, cole o texto alternativo.
5. Publique (ou **agende** pelo Meta Business Suite: business.facebook.com → Planejador).
