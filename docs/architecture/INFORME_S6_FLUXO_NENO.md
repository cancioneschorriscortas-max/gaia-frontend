# Informe da sesión 6 — o fluxo do neno probado de punta a punta

> Executor: Claude Code, 7 de setembro de 2026. Encargo: "perfeccionar GAIA" con autonomía.
> Todo o que se cambiou está en commits locais **sen push** (frontend `fc4eae4`, `3a10399`;
> backend `3daa41a` e seguinte). O director revisa e empurra.

## 1. Como se probou

Levantouse a pila real na máquina do director: Neo4j 5.26 (1.801 nodos, 3 rutas), o backend
`index.js` en `localhost:4000` e o frontend en `localhost:3000` (con `.env.local`, ignorado por git).
Creouse unha conta de proba local (`Proba Executor`, profesor) e percorreuse a app como un neno:
intro → mapa → "A miña viaxe" → "A viaxe do pan" → senda → 4 pasos con reto → ruta completa →
portada con 40 XP. Repetiuse a 375px (móbil emulado). Fixéronse 2 chamadas reais a
`/avaliar-reto` (custo de API do director) para ver a voz de Lúa antes e despois.

## 2. Datos que se tocaron na BD local (reversibles)

| Que | Como desfacelo |
|---|---|
| Retos `reto_primary_gl/es/en` nos nodos `o_trigo`, `a_farina`, `a_masa`, `o_pan`; `reto_bloqueado=false` | Editor de nodos, ou `PUT /nodo/:id` |
| Journey `a_viaxe_do_pan` (🍞, módulo Galicia, 4 paradas en orde) | `DELETE /journeys/a_viaxe_do_pan` (profesor) |
| Usuario `Proba Executor` (profesor, centro "Centro de proba") con progreso e 40 XP | borrar en Neo4j: `MATCH (u:Usuario {nome:'Proba Executor'}) DETACH DELETE u` |

O texto dos retos é o do documento de revisión (`docs/content/VIAXE_DO_PAN_revision.md` §6),
co formato "pregunta + a) b) c)" e traducido a es/en. A liña *(resposta: X)* NON se cargou.

## 3. Bugs atopados e arranxados

| # | Onde | Que pasaba | Arranxo |
|---|---|---|---|
| 1 | `RetoInteractivo` | **Ao pasar de paso, a avaliación e a resposta do paso anterior quedaban debaixo da pregunta nova** (visto en vivo: paso 2 co feedback do trigo) | estado reséstase ao cambiar `nodoId`/`pregunta` |
| 2 | `RetoInteractivo` | 500/400 do backend ocultaban o formulario sen reintento; `NaN` en XP | `res.ok` + puntos válidos ou erro con formulario á vista |
| 3 | `RetoInteractivo` | as opcións a) b) c) saían nunha soa liña | `whiteSpace: pre-line` |
| 4 | `RetoInteractivo` | prometía "+20 XP" e daba 15; etiqueta "RETO · PRIMARY" en inglés | XP real de `XP_ACCIONS`; nivel por `t()` |
| 5 | `PercorridoRuta` | 404 ou ruta sen pasos → pantalla en branco | fase `erro` con mensaxe e volta |
| 6 | `PercorridoRuta` | nodo que non carga → "sen contido" e avanzaba | nodo marcado con erro e mensaxe propia |
| 7 | `SendaVisual` | **a 375px as etiquetas medían 6px e as paradas 16px** | disposición vertical por debaixo de 480px de contedor |
| 8 | `SendaVisual` | paradas non focables, candado mudo | teclado + aria; Lúa avisa ao tocar unha pechada |
| 9 | `PortadaNeno` | sen volta explícita (a portada tapa a barra do móbil); ruta con progreso borrada → botón a un 404 | "← Volver ao mapa"; aviso + catálogo |
| 10 | `ArbolInstitucional` | **inusable en móbil** (300px fixos + detalle con ancho negativo, contido cortado polo pé) | unha columna con volta, `flex:1/minHeight:0`, Escape |
| 11 | `ArbolInstitucional` | carreira de fetch ao cambiar rápido de ruta | cancelación |
| 12 | `BarraInferiorMovil` | "A miña viaxe" partíase en dúas liñas; resultados da busca sen teclado; tipo de nodo en inglés | nowrap; role/tabIndex/onKeyDown; tipo por `t()` |
| 13 | backend `/journeys/:id`, `/progreso/rutas` | só `label_gl` → senda e portada sempre en galego para es/en | `label_{idioma}` en todos |
| 14 | backend `/auth/login` | o formulario di "centro (opcional)" pero o backend esixía o mesmo centro do rexistro → "Credenciais incorrectas" | se non cadra e só hai un usuario con ese nome, entra (contrasinal obrigatorio) |
| 15 | backend `/avaliar-reto` | Lúa dicíalle a un neno de 8 anos "demostra coñecemento claro da bioloxía do trigo" e "estrutura reprodutiva", con "grano" | prompt por nivel: voz de neno, galego normativo, pista en vez de resposta |
| 16 | i18n | ~80 cadeas cableadas nos ficheiros do fluxo do neno e do Arquivo | 99 claves novas, todo por `t()` |

Comprobado en vivo tras os cambios: reto reséstase (textarea baleiro no paso 2), "Reto · Primaria",
"+15 XP", opcións en liñas, senda vertical lexible a 375px, Arquivo en móbil cunha columna e volta,
`label_es` nos stops, login sen centro OK, Lúa con resposta errada:
*"Mira a foto dun trigo: onde ves aqueles graniños xuntiños e doradiños no alto? Ese é o lugar onde medra o gran."*

## 4. O que NON se tocou e o director debe decidir (backlog)

1. **Portais inline non existen.** `PercorridoRuta` pinta o texto plano; non hai sintaxe nin
   render de `[palabra ↗]`. A mecánica 1 do tutorial (§3.3 de EXPERIENCIA_NENO) non se pode
   ensinar hoxe. Proposta: sintaxe `[[moer|a_farina]]` no texto e un render que abra o nodo
   destino como paso extra (desvío premiado). É a peza que máis falta para o tutorial.
2. **`/journeys` expón rutas `draft`/`private` a calquera.** A portada do neno e o Arquivo
   mostran todo. Hoxe as 3 rutas son draft/private, así que filtrar deixaría a portada baleira:
   antes hai que validar/publicar as rutas (`status: validated`, `visibility: public`) e despois
   filtrar no backend.
3. **Pé do Arquivo:** "Xunta de Galicia · Consellería de educación · 2026" e "Acceso institucional"
   son afirmacións institucionais. Se non hai acordo real, convén retiralas (agora están en
   `locales/*.json`, claves `arquivoPeDereita`, `arquivoInstitucion`, `arquivoAcceso`).
4. **Banco de frases de Lúa v1** (EXPERIENCIA_NENO §4) segue sen existir: a portada e a senda
   usan 2-3 frases fixas por estado. É o seguinte paso natural e pequeno.
5. **"O teu soño" e "Cartas"** son placeholders (agora marcados "proximamente").
6. **`VisorNodo` pasa `puntosTotais={nodo.reto_puntos || 20}`** ao reto: promete o que diga o
   nodo, non o que dá o backend. Mesmo bug 4 noutra pantalla; non se tocou por estar fóra do fluxo.
7. **XP dobre en desenvolvemento:** React StrictMode duplica efectos; vense fetches dobres no
   Network. Non afecta a produción.
8. **Login:** o campo "centro" do formulario é un buscador de centros galegos; un usuario cun
   centro libre (como o de proba) non o pode escribir. Co arranxo 14 xa non fai falla, pero a
   etiqueta "(opcional)" agora é certa só se o nome é único.
9. **Intro:** a cinemática ("Escoitas iso?" … "Comeza por algo que che chame a atención") funciona
   pero non é a do espertar de EXPERIENCIA_NENO §3.1 (Lúa con tres frases). Non se tocou.
10. **Un 401 na consola ao arrincar** (`/auth/perfil` ou similar antes de ter token). Inofensivo.

## 4-bis. Rolda 2 — o que se engadiu para que "mole"

Encargo do director: liberdade para estender, cambiar fluxo e UI, e que aprender sexa adictivo.
Todo commit local sen push (frontend `feat(neno): portais inline…`, backend `feat(api): cartas…`).

| Peza | Onde | Que fai |
|---|---|---|
| **Portais inline** | `src/portais.js`, `PercorridoRuta`, `VisorNodo` | `[[palabra\|nodo]]` no texto. No percorrido abre un **panel de desvío** (o nodo destino, coa frase de Lúa, sen perder o paso; os portais de dentro encadean). +8 XP (`NODO_NOVO`) a primeira vez por nodo; carta 🔭 ao cruzar o primeiro portal. Os visitados quedan en `localStorage` por usuario. |
| **Lúa v1 sen IA** | `src/data/frasesLua.json`, `src/lua.js` | 25 frases por contexto (hora, estado da ruta, evento). Gaña a máis específica; entre iguais rota polo día. Portada, senda, desvío e fin de ruta. |
| **Cartas** | `src/data/cartas.json`, `ColeccionCartas.js`, backend `/cartas` | 7 cartas en 4 coleccións (mundo, oficios, natureza, exploración). Gáñanse ao completar unha ruta ou co primeiro portal. Revelación con volta; colección coas que faltan como siluetas e a pista de como conseguilas. |
| **Contido novo** | `docs/content/como_funciona_o_mundo.seed.mjs` | 12 nodos, 33 relacións, 3 rutas: **A viaxe da auga** (chuvia → río → depuradora → billa), **A viaxe da luz** (vento → xerador → rede → enchufe), **De onde vén o leite** (herba → vaca → leite → queixo). Texto primary 45-65 palabras para 8-10 anos, secondary "e por que?", es/en, portal por nodo (o último pecha o círculo), reto de 3 opcións. Datos de Galicia comprobados (Miño, Costa da Morte, rubia galega/frisona, tetilla, San Simón). |

Portais marcados tamén nos 4 nodos do pan (só se marcaron palabras que xa estaban no texto do director).

**Ideas seguintes, por orde de impacto:** (1) imaxes nas paradas (VisorMedio xa existe; falta
media nos nodos novos — Wikimedia Commons CC), (2) espertar + elección de rol narrativa (§3.1-3.2),
(3) "O teu soño" real ligado ao test de Oberón, (4) rutas `secondary` para o instituto reutilizando
os mesmos nodos (o texto secondary xa está), (5) máis rutas "como funciona": o lume, o pan xa, o
sal, a marea, o móbil, o lixo/reciclaxe.

## 5. Como arrincar a pila local (para a próxima sesión)

```
# Neo4j (xanela propia)
C:\neo4j-community-5.26.22\bin\neo4j.bat console
# backend
cd D:\gaia-backend && node index.js
# frontend (usa .env.local → http://localhost:4000)
cd D:\gaia-frontend && npm start
```
Se Docker Desktop está aberto non pasa nada, pero non fai falla: aquí Neo4j non vai en Docker.
