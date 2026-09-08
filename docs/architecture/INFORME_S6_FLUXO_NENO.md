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

| **Imaxes nas paradas** | `PercorridoRuta` (cabeceira), `docs/content/media_atribucions.json` | 16 fotos de Wikimedia Commons con licenza libre (CC0, CC BY, CC BY-SA), buscadas pola API de Commons, filtradas por licenza e **escollidas mirando follas de contacto** (Edge headless). Cargadas como `media` tipo `image` nos nodos; a etiqueta leva "Foto: autor · licenza · Wikimedia Commons" e píntase ao pé da imaxe (a atribución é obrigatoria nas CC BY). Para cambiar unha foto: `DELETE /media/:id` + `POST /nodo/:id/media`. |

Regra de ouro das imaxes: **só licenzas libres e sempre con atribución visible**; nada de Google Images.

**Ideas seguintes, por orde de impacto:** (1) imaxes nas paradas (VisorMedio xa existe; falta
media nos nodos novos — Wikimedia Commons CC), (2) espertar + elección de rol narrativa (§3.1-3.2),
(3) "O teu soño" real ligado ao test de Oberón, (4) rutas `secondary` para o instituto reutilizando
os mesmos nodos (o texto secondary xa está), (5) máis rutas "como funciona": o lume, o pan xa, o
sal, a marea, o móbil, o lixo/reciclaxe.

## 4-ter. Rolda 3 — onboarding e catálogo completo

| Peza | Onde | Que fai |
|---|---|---|
| **Espertar** (§3.1) | `PrimeiroContacto.js` | Guión novo: "Isto é todo o que se pode aprender" → "Ninguén o coñece enteiro" → Lúa preséntase → "Pero ti vas ter o teu propio camiño" → "Como queres viaxar polo universo?" + botón "Elixir o meu camiño". Textos por i18n. **Nota:** `/assets/lua-intro.mp3` segue sendo a voz do guión vello; se se quere voz, hai que regravala. |
| **Elección** (§3.2) | `components/SeleccionRol.js` | Lúa conta cada camiño ao tocar a carta (2 frases por rol, claves `rolLua*`), botón "Este son eu", cabeceira "Como queres viaxar polo universo?". A especialidade segue sendo o paso 2, saltable. Arranxo: as habilidades das cartas mostraban a clave en bruto (`rolHabFisico`). |
| **Aterraxe na portada** (§3.4) | `App.js` | Tras escoller camiño, e ao entrar en cada sesión, o alumnado empeza na portada ("A miña viaxe"); profesores e exploradores sen conta seguen no mapa. Desde a portada sáese co "← Volver ao mapa". |
| **Tutorial primeiro** | `PortadaNeno.js` | "A viaxe do pan" encabeza sempre o catálogo. |
| **Rutas publicadas** | backend `/journeys`, `PUT /journeys/:id` | As 8 rutas pasaron a `published`+`public`. `/journeys` filtra por rol (token opcional): quen non é profesor só ve esas. |
| **Contido** | `docs/content/como_funciona_o_mundo_2.seed.mjs` | A viaxe do lixo (lixo → contedor → planta de reciclaxe → obxecto novo) e Por que sobe e baixa o mar (Lúa no ceo → marea → marisqueo → ameixa). 8 fotos Commons con atribución (`media_atribucions.json`, 24 en total). |

| **"O teu soño" v1** | `PortadaNeno.js` | Oficio escollido (de `roles.js`) ou camiño do usuario, "Cambiar"/"Escoller" (reabre SeleccionRol), "Facer o test de oficios" (PanelOberonTest). Ao completar o tutorial: "Ver o oficio por dentro" abre `OberonProfesionVista('panadeiro')` nun overlay. Só o panadeiro ten árbore en Oberón; a táboa `OFICIOS_OBERON` no ficheiro é onde se engaden os seguintes. |

| **Contido (3ª entrega)** | `docs/content/como_funciona_o_mundo_3.seed.mjs` | Como arde o lume (leña → aire → chispa → lume; triángulo do lume, incendios, 112) e A viaxe do sal (mar salgado → salina → sal → conserva; salina romana de Vigo, conserveiras). 8 fotos (32 en total). |
| **Metrónomo de Lúa** | `frasesLua.json`, `PortadaNeno.js` | Se o último avance da ruta activa foi hoxe (`ts` de `/progreso/rutas`), Lúa di que a misión do día está feita e non apura (§3.4). |

| **Rutas de secundaria** | `PercorridoRuta.js`, `PortadaNeno.js`, `docs/content/rutas_secundaria_1.seed.mjs` | `journey.level` manda: en `secondary` a capa "e por que?" vai aberta e o reto é `reto_secondary` (pregunta aberta, 30 XP; cae a primary se falta). Catálogo con chip e orde por curso (`usuario.curso`: `*prim` → primaria primeiro). Receita para máis: escribir `reto_secondary_*` nos nodos e crear a journey con `level: 'secondary'`. |

| **Camiños a medias / feitos** | `PortadaNeno.js` | Debaixo do destacado, os outros camiños empezados (parada x de y, Continuar) e os completos (Volver percorrer). Antes un segundo camiño empezado facía desaparecer o primeiro da portada. A carta nova soa (`sonXP`). |

| **Contido (4ª entrega)** | `docs/content/como_funciona_o_mundo_4.seed.mjs` | Como chega a mensaxe ao móbil (mensaxe → onda de radio → antena → cable submarino; binario, celas, Sada) e A viaxe da pataca (semente → leira → colleita → caldo; Andes, A Limia, solanina). 8 fotos (40 en total). |

| **Rolda 5: cómodo e útil** | varios | Pé do Arquivo sen afirmación institucional (decisión do director). Teclado no percorrido (Escape, ← →). Axuda da sintaxe de portais no Editor. **Profesor:** chip 🧭 completados/empezados e 🃏 cartas en cada alumno; tocar a tarxeta despraza os seus camiños un a un (`GET /centro/:centro/alumnos/:id/rutas`). +3 rutas de secundaria (auga, marea, sal) e 3 cartas. Total: 17 rutas, 18 cartas. |

| **Rolda 6** | `docs/content/como_funciona_o_mundo_5.seed.mjs`, `EditorRutas.js` | A viaxe da comida polo corpo (boca → estómago → intestino → sangue) e De onde vén o tempo (Sol → borrasca → anticiclón → parte do tempo, con portais a `o_vento` e `a_chuvia`: as rutas empezan a cruzarse). **EditorRutas:** "Pública" mandaba `visibility: validated` (400) e non existía forma de publicar desde a app; agora manda `public` e o status segue á visibilidade. |

| **Rolda 7: crear rutas desde a app** | `ConstructorRutas.js`, `EditorRutas.js` | "Publicar xa" (por defecto) fai o segundo PUT que deixa a ruta published/public; "Ver como neno" abre a senda e os pasos reais desde o editor. Receita para o director: Xestión → Rutas → nome + pasos (busca de nodos) → Crear; para portais e imaxes, Editor de nodos (axuda de sintaxe baixo o texto) e `POST /nodo/:id/media`. |

| **Explorar → senda** | `BottomSheet.js`, backend `/nodo/:id/journeys` | Na folla móbil dun nodo, "Camiños que pasan por aquí" lista as rutas publicadas que o inclúen e "Ir ao camiño" abre a senda. Así o mapa libre devolve o neno ás rutas (Regra 2). |

| **Nivel experto** | `PercorridoRuta.js`, `docs/content/rutas_experto_1.seed.mjs` | `journey.level = expert` → capa `text_expert` visible (bloque 🎓) e `reto_expert` (60 XP). Receita: escribir `text_expert_*` e `reto_expert_*` nos nodos (Editor de nodos, pestana Experto) e crear a journey con nivel Experto. |

| **Explorar libre guiado** | `PortadaNeno.js`, `App.js` | "O universo enteiro" abre o mapa xa centrado na parada actual do neno (`seleccionarNodoConTransicion`), de modo que ve as conexións dun nodo coñecido e os camiños que pasan por el. |

| **Mapa "Os meus camiños"** | `MapaUniverso.js`, `App.js`, backend `/journeys/nodos` | Filtro do mapa: esqueleto (galaxias/constelacións) + só os nodos que son parada dunha ruta visible. Por defecto para o alumnado; o botón 🧭 (baixo o 🌌) alterna con todo o universo. Cada estrela dese mapa ten texto, foto, reto e camiño. |

| **Revisión das fotos** | `docs/content/media_atribucions.json` | As 48 fotos revisadas a ollo (follas de contacto con Edge headless). Substituídas: o leite (saía café con leite → vaso de leite) e o sal (marca comercial → sal mariño). Receita para revisar outra vez: xerar unha folla HTML coas URLs do JSON e capturala. |
| **Experto 2** | `docs/content/rutas_experto_2.seed.mjs` | "O lume, a fondo": poder calorífico e humidade, composición do aire e estequiometría, enerxía de activación e tetraedro do lume, ecuación da combustión e transmisión da calor. |
| **Misión da semana** | `PortadaNeno.js`, `src/data/misions.json`, `niveis.js` | Tarxeta "Misión da semana": un tema por semana (rota pola semana do ano, igual para toda a clase) con 3 rutas; marca as feitas, abre as pendentes e ao completar as 3 dá a carta do tema e +50 XP unha soa vez (a carta é idempotente no backend, o XP colga de `nova`). Para cambiar temas ou rutas, editar o JSON; para engadir un tema fai falta a súa carta en `cartas.json` (`evento: mision_semana`). |
| **Lúa e a misión** | `src/data/frasesLua.json`, `PortadaNeno.js` | Contexto novo `misionFalta` no banco de frases: con 1 ruta pendente Lúa nomea a ruta que falta; coa misión feita e sen camiño activo, dío. Ten prioridade sobre a frase da misión do día. |
| **Experto 3** | `docs/content/rutas_experto_3.seed.mjs` | "A auga, a fondo": ciclo da auga con números (calor latente, 1 mm = 1 L/m², chuvia orográfica), bacía e caudal, ETAP fronte a EDAR (cloro libre, DBO₅), presión (10 m = 1 bar) e consumo. Carta "Dez metros, un bar". |
| **Misión no profesor** | `ModoProfesor.js`, `src/misions.js`, backend `/centro/:centro/alumnos` | Panel "Misión da semana" enriba da lista de alumnado: tema, e cantos a levan completa, a medias ou sen empezar (respecta os filtros). En cada alumno, chip co emoji do tema e n/3. O backend devolve `rutasFeitas` (ids completados) na mesma consulta, sen peticións extra. |
| **Profesor no móbil** | `App.js` (menú móbil), `ModoProfesor.js` | Con pantalla estreita a app entra en modo móbil e o botón "⚙ Editor" non existía: o profesorado non podía entrar. Agora hai "Modo profesor" no menú móbil e o modo adáptase: cabeceira en dúas liñas, lapelas con scroll horizontal, sen botón Arquitecto, Xestión coa barra en fila. Probado a 375 px coas lapelas Dashboard, Alumnado e Xestión. |
| **Experto 4** | `docs/content/rutas_experto_4.seed.mjs` | "O pan, a fondo": trigo hexaploide e rendemento por hectárea, fariña de forza e glute, fermentación (C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂, temperaturas, masa nai), forno (oven spring, xelatinización, Maillard, retrogradación). Carta "A codia ten nome". |
| **Xestión no móbil** | `TabelaNodos.js` | Probadas a 375 px as cinco vistas de Xestión co editor de nodos aberto (33 campos) e o construtor de rutas cunha parada engadida: sen desbordamento. A táboa de nodos si desbordaba: as 4 métricas pasan a columnas fluídas (2 por fila no móbil) e as dúas táboas desprázanse en horizontal dentro do seu marco. |
| **Misión 5** | `src/data/misions.json`, `cartas.json` | "A semana do prato" (Galicia no Prato, a comida polo corpo, o sal) con carta propia. Cinco temas: a rotación semanal tarda cinco semanas en repetir. |
| **Ruta 15: a música** | `docs/content/como_funciona_o_mundo_6.seed.mjs` | "De onde vén a música": a vibración (frecuencia, 440 Hz, 340 m/s), a gaita (fol, soprete, punteiro, ronco, palletas; Cantigas de Santa María), o oído (tímpano, tres ósos, caracol, 85 dB) e a gravación (micrófono, 44.100 números por segundo, fonógrafo 1877, CD 1982) con portal ao móbil. Fotos: cordas vibrando, gaiteiro, esquema do oído, micrófono. Carta "Unha canción son números". |

Contas de proba alumnas: `Nena Proba` e `Neno Proba` (5º primaria, centro "Centro de proba"); as
contrasinais están no scratchpad da sesión. Serve para ver o fluxo enteiro do neno: espertar → elección → portada.

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
