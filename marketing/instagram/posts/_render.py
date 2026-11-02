"""Gera os slides 1080x1350 de um carrossel a partir de slides.json (uso: python3 _render.py PASTA)."""
import json, sys, pathlib, base64, html
pasta = pathlib.Path(sys.argv[1]); dados = json.loads((pasta / "slides.json").read_text(encoding="utf-8"))
logo = base64.b64encode((pasta.parent / "_logo.png").read_bytes()).decode()
LARANJA, ESCURO, CLARO = "#C2570C", "#1C1917", "#FFF7F0"
css = f"""
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:Inter,sans-serif}}
section{{width:1080px;height:1350px;position:relative;overflow:hidden;padding:150px 130px;display:flex;flex-direction:column;justify-content:center}}
.capa{{background:{LARANJA};color:#fff}} .escuro{{background:{ESCURO};color:#fff}} .claro{{background:{CLARO};color:{ESCURO}}}
h1{{font-size:118px;line-height:1.02;font-weight:900;letter-spacing:-3px}}
h2{{font-size:76px;line-height:1.08;font-weight:800;letter-spacing:-1.5px;margin-bottom:44px}}
.claro h2{{color:{LARANJA}}}
p{{font-size:44px;line-height:1.35;font-weight:500}}
.sub{{font-size:48px;margin-top:48px;font-weight:600;opacity:.95}}
.big{{font-size:150px;font-weight:900;letter-spacing:-4px;color:{LARANJA};line-height:1}}
.escuro .big{{color:#F08A3C}}
ul{{list-style:none}} li{{font-size:44px;line-height:1.3;font-weight:600;padding:22px 0;border-bottom:3px solid rgba(0,0,0,.08);display:flex;gap:26px}}
.escuro li{{border-color:rgba(255,255,255,.12)}}
li b{{color:{LARANJA};min-width:56px}} .escuro li b{{color:#F08A3C}}
.rodape{{position:absolute;left:130px;right:130px;bottom:70px;display:flex;justify-content:space-between;align-items:center;font-size:30px;font-weight:700;opacity:.85}}
.marca{{display:flex;align-items:center;gap:16px}} .marca img{{width:52px;height:52px}}
.capa .marca img,.escuro .marca img{{background:#fff;border-radius:14px;padding:6px}}
.tag{{display:inline-block;font-size:30px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;opacity:.9}}
.conta{{font-size:44px;font-weight:700;background:rgba(194,87,12,.1);border-left:10px solid {LARANJA};padding:30px 36px;margin-top:40px;border-radius:8px}}
.escuro .conta{{background:rgba(240,138,60,.15);border-color:#F08A3C}}
"""
partes = []
n = len(dados["slides"])
for i, s in enumerate(dados["slides"], 1):
    corpo = s["html"]
    partes.append(f'<section class="{s["estilo"]}">{corpo}<div class="rodape"><span class="marca"><img src="data:image/png;base64,{logo}">@obra.facil.app</span><span>{i}/{n}</span></div></section>')
(pasta / "slides.html").write_text(f"<!doctype html><html><head><meta charset='utf-8'><style>{css}</style></head><body>{''.join(partes)}</body></html>", encoding="utf-8")
print(n, "slides")
