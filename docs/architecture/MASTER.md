# GAIA — MASTER.md

> Documento-guía único do proxecto. Punto de entrada para calquera sesión de traballo.
> Se nalgún momento "Claude se perde", **este ficheiro é a fonte de verdade**.
>
> Última auditoría: 2026-06-16 · Frontend (`Gaia_To_public.zip`, 85 fich., ~31.900 liñas) + `package.json` + **backend `index.js` (2.902 liñas, 53 rutas)**.
> Estado (fin sesión 2026-06-16): **2 repos públicos en GitHub e verificados sen segredos** —
> `gaia-frontend` (commit inicial + API centralizada + i18n por locales + README) e `gaia-backend`
> Estado (2ª sesión, peche): **§10.1 COMPLETA** (constantes de dominio: fonte única no backend) ·
> **Yggdrasil integrado e funcionando** (Fases 1-2; 3 en curso) · Marble: conversor listo, piloto pendente ·
> Decisión: **conxelar `D:\Gaia\frontend` (vella)** — a carpeta de traballo é a do repo. Detalle en §10.
> **Estado (3ª sesión, peche): MULTIVERSO + LOD OPERATIVOS · Marble COMPLETO dentro (1.653 nodos / 4.873 rel.)**
> — dous universos co botón 🌌, mapa escalonado (esqueleto por defecto, expandir ao picar),
> `/nodo` e `/import` gravando `universo`. Detalle en §10, Sesión 3.
> **Estado (4ª sesión): EXPERIENCIA DO NENO en marcha** — deseño en `docs/design/EXPERIENCIA_NENO.md`,
> mapa con estilo flat + label culling, e a rebanda da senda COMPLETA (F1 progreso persistente,
> F2 SendaRuta, F3 bucle senda↔paso con XP).
> **Estado (5ª sesión, peche): NOVO MODELO DE TRABALLO — Claude Code como EXECUTOR** (test aprobado:
> `PortadaNeno.js` construída por axente con briefing). Portada diaria v1 operativa (boceto 5) +
> decisión "autoservizo v1" + Arquivo unificado con RutaNeno. Detalle en §10, Sesións 4-5.

---

## 0. Como usar este documento

1. **Sempre que abramos sesión**, pásame este `MASTER.md` (ou a súa URL de GitHub).
2. Está dividido en: *que é GAIA* → *estado real* → *auditoría* → *plan* → *como traballamos*.
3. As **decisións** viven en `docs/architecture/decisions/` (ADRs). Os **briefings** temporais en `docs/architecture/briefings/`.
4. Cando algo cambie de verdade, actualízase aquí. Non en notas soltas.

---

## 1. Que é GAIA (esencia)

GAIA é un **grafo de coñecemento navegable** onde todo son nodos conectados e o nivel de detalle
está no *usuario*, non no *nodo*. As regras fundamentais (resumo operativo):

| # | Regra | Implicación técnica |
|---|-------|---------------------|
| 1 | Todo son nodos conectados | Sen páxinas illadas; o modelo é un grafo (Neo4j) |
| 2 | Múltiples rutas válidas entre dous nodos | `Journey` / rutas son entidades de primeira clase |
| 3 | O grafo adáptase ao usuario (`primary` / `secondary` / `expert`) | O nivel é estado do usuario, filtra a suxestión |
| 4 | O nivel é filtro de suxestión, non muro | Calquera nodo é accesible a calquera nivel |
| 5 | Relacións con profundidade variable | A mesma orixe→destino pode ter `via` distintos por nivel |
| 6 | Portais no texto sempre accesibles | Ligazóns inline `[texto↗]` → nodo destino, contido adaptado |
| 7 | Toda relación ten `context` | `Auga→Motor` non significa nada sen contexto |
| 8 | O coñecemento é composable | Os nodos reutilízanse, **non se duplican** |
| 9 | As conexións directas valídanse | O constructor suxire nodos intermedios; o editor decide |

**Modelo de relación (canónico):**
```json
{
  "source": "trigo",
  "target": "pan",
  "type": "INGREDIENT_OF",
  "context": "panadería",
  "via": null,
  "level": "primary",
  "strength": "high"   // high = fundamental | medium = importante | low = periférica
}
```

---

## 2. Estado real (auditado, non aspiracional)

### Stack (confirmado por `package.json`)
- **Frontend:** **React 19.2.4** + **Create React App** (`react-scripts 5.0.1`). `name: "frontend"`, `private: true`.
- **Mapa/grafo:** `force-graph`, `react-force-graph-2d`, `react-force-graph-3d`, `three-spritetext` (base de `MapaUniverso.js`).
- **Backend:** **Express + Neo4j** (`neo4j-driver`). O servidor real é un **`index.js` (2.902 liñas, 53 rutas)** — *NON está dentro do frontend* (ver §2-bis e §3.4). Seguridade: `helmet`, `express-rate-limit`, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, honeypot anti-bot, límites de uso de IA.
- **i18n:** sistema propio en `src/i18n.js` (función `t(idioma, clave, ...args)`), idiomas `gl` / `es` / `en`.
- ⚠️ React 19 é punteiro; se un `npm install` limpo protesta por peer-deps dos wrappers de force-graph, usar `--legacy-peer-deps`.
- **Base de URL da API:** `process.env.REACT_APP_API` (fallback `http://localhost:4000`).

### Módulos principais (por tamaño)
| Ficheiro | Liñas | Rol |
|----------|------:|-----|
| `ModoProfesor.js` | 1.896 | Modo docente |
| `Editor.js` | 1.456 | Editor de nodos |
| `App.js` | 1.374 | Raíz + routing + moita lóxica |
| `components/PanelPerfil.js` | 1.332 | Perfil de usuario |
| `PanelOberonTest.js` | 1.223 | Banco de probas Oberón |
| `TabelaNodos.js` | 1.186 | Táboa de nodos |
| `ModoExame.js` | 1.155 | Modo exame / retos |
| `OberonProfesionVista.js` | 1.149 | Vista de profesión (Oberón) |

### Oberón (estado segundo notas + código)
- ✅ Backend: schema (`01_schema*.cypher`), seed Panadeiro/Camareiro, endpoint profesión v2.
- ✅ Skill tree v6 (SVG procedural — *alcanzou teito estético*), `VisorMedio.js`, Inspector.
- 🟡 Decisión pendente: aceptar v6 / repintar / mestura.
- 🔜 Niveis reais, tabs CAMIÑO/CONEXIÓNS/HISTORIA/PERFIL, móbil, ADRs.

### 2-bis. Backend (`index.js`) — aclaración importante
**Os ficheiros de `src/Oberon/` NON son o backend que corre: son fragmentos** (schemas `.cypher`, seeds,
anacos de endpoints, `05_integracion_app_js.md`) pensados para pegar no servidor real. O **servidor real é
`index.js`** (Express, 2.902 liñas, 53 rutas, monolito ben seccionado). Vive fóra do frontend.

Superficie da API (grupos): `auth` (rexistro/login/perfil/rol) · `xp` · `oberon` (profesions/skills/test) ·
`nodos` (CRUD + relacions/contexto/journeys/media) · `relacions` (CRUD + tipos) · `journeys` (CRUD + stops) ·
`config` (`/config/:key`, `/config/idiomas`) · `import` (carga masiva) · `lua` (proxy a Anthropic) ·
`retos/exame` · `envios/validación` · `profesor/centros` (ranking, dashboard, alumnos, límites).

**Esquema canónico (fonte de verdade real, en `index.js`):**
- Tipos de nodo: `origin`, `galaxy`, `constellation`, `system`, `concept`, `process`.
- Tipos de relación (12): `PERTENCE_A`, `PARTE_DE`, `E_UN`, `INSTANCIA_DE`, `TRANSFORMA`, `PRODUCE`, `USA`, `RELACIONADO_CON`, `SIMILAR_A`, `INSPIRADO_EN`, `ANTES_DE`, `DESPOIS_DE`.
- Niveis dificultade: `primary`/`secondary`/`expert` · relevancia: `high`/`medium`/`low` · status: `draft`/`validated`/`deprecated`.

> ⚠️ Os `type` do exemplo das regras (`INGREDIENT_OF`) eran *ilustrativos*. Os reais son os 12 de arriba.

---

## 3. Auditoría — resultados

Veredicto: **base sólida e funcional**. O **frontend é seguro de publicar** (ver 3.1). Falta traballo de
empaquetado (ficheiros raíz, separar backend), pero **non hai bloqueante de seguridade no frontend**.

### 🟢 3.1 Seguridade — frontend OK para publicar

| Achado | Estado | Acción |
|--------|--------|--------|
| Claves/contrasinais hardcoded no código | ✅ **Ningunha atopada** | — |
| Chamadas directas a Anthropic/`sk-ant`/`x-api-key` no frontend | ✅ **Cero** — Lúa fala co backend (`${API}/lua`) | — |
| `.env` real (= `.fake_env` saneado) | ✅ Só `REACT_APP_API` = IP + porto 4000 | Renomear a `.env.example` |
| `Authorization: Bearer ${token}` | ✅ Usa variable, non literal | — |
| Historial Git (`.git`) | 🟢 Limpeza opcional (non bloqueante) | Fase 0 cosmética — ver §6 |

> **Punto clave (CRA):** todo o que empeza por `REACT_APP_` compílase **dentro do bundle público**.
> Logo `REACT_APP_API` **non é un segredo por deseño** — calquera que abra a web compilada xa o ve.
> Aínda que esa IP+porto estivese no historial Git, non expón nada que a app compilada non expoña xa.
> → A alarma de *"rexenerar a chave / chave comprometida"* **NON aplica ao frontend**.
>
> **⚠️ Onde SI importa a Fase 0:** no **repo do backend** (cando se publique). Aí viven os segredos de
> verdade: clave de Anthropic (`sk-ant`), contrasinal de Neo4j, etc. Reservar a rigorosidade para ese repo.

**Backend (`index.js`) — revisado:**
- ✅ Todos os segredos por `process.env` (`JWT_SECRET`, `NEO4J_*`, `ANTHROPIC_API_KEY`, `CODIGO_PROFESOR`). **Cero valores hardcoded.**
- ✅ `JWT_SECRET` obrigatorio (`process.exit(1)` se falta). Boa práctica.
- ⚠️ **Fallback de contrasinal por defecto:** `process.env.NEO4J_PASS || 'gaia1234'`. Asegúrate de que o Neo4j real **non** usa `gaia1234` e de que `.env` ten o real. Idealmente, eliminar o fallback en produción.
- ⚠️ `PORT = 4000` **hardcoded** → usar `process.env.PORT || 4000`.
- ⚠️ `neo4j.driver(..., { encrypted: false })` → vale en local (`bolt://localhost`), pero **debe ir cifrado** se algún día apunta a un Neo4j remoto (`neo4j+s://`).
- 👉 Antes de publicar o backend: crear o seu `.env.example`, `.gitignore`, e executar a Fase 0 (§6) **de verdade** sobre o seu historial.

### 🟠 3.2 Hardcoding (o teu segundo encargo)

| Patrón | Onde | Impacto | Fix |
|--------|------|---------|-----|
| `const API = process.env.REACT_APP_API \|\| 'http://localhost:4000'` | **32 ficheiros idénticos** | Cambiar fallback/host = 32 edicións | Un só `src/config/api.js` exportado |
| Cores hex literais (`#e8a547`×53, `#5dd4a8`×38, …) | Espalladas no JS | Recolor = centos de edicións | Mover a tokens, referenciar sempre |
| **1.847** `style={{…}}` inline | Todo o frontend (App.js: 157) | Rediseño = inviable a man | Sistema de estilos (tokens + objeto `S`/CSS) |
| **Dous** ficheiros de tokens (`src/tokens.css` + `src/ESTILO/02-tokens.css`) | Estilo | Confusión, deriva | Unificar nun só |
| Texto de usuario **fóra de i18n** | `roles.js`, `niveis.js`, `cursos.js` | Nunca se traducen (só galego) | Claves i18n (ver §5) |
| Datos rexionais hardcoded | `centros.js` (centros de Galicia), `cursos.js` (ESO/FP) | Atado a Galicia | Mover a config/backend |

### 🟡 3.3 i18n — funciona, pero non escala a "engadir idioma fácil"

- ✅ **230 chamadas reais** `t(idioma, 'clave')`, **189 claves**. Boa cobertura.
- ⚠️ Estrutura **por clave**: cada entrada leva `{ gl, es, en }` inline. O propio ficheiro avisa:
  *"imposible engadir sen todos os idiomas"*. **Engadir `fr` = tocar as 189 entradas.** Iso é o contrario do teu obxectivo.
- ⚠️ `t()` esixe pasar `idioma` **a man en cada chamada** → fráxil (fácil esquecelo / pasar o erróneo).
- ⚠️ Texto en `roles.js`/`niveis.js`/`cursos.js` non pasa por `t()` → invisible para a tradución.
- 👉 **Solución en §5.**

### 🟡 3.4 Estrutura / saúde do código

| Achado | Detalle |
|--------|---------|
| **`Oberon/` mal etiquetado** | `src/Oberon/*.cypher`, `*_endpoint*.js`, `profesions_seed.json` **non son o backend**: son **fragmentos** para pegar no `index.js` real. Aínda así viven no frontend → moverlos ao repo do backend (`db/`, `routes/`). |
| **Constantes de dominio duplicadas front↔back** | `NIVEIS_USUARIO` está **idéntico** en `frontend/src/niveis.js` e en `index.js`. Tamén cursos, roles e nomes de relacións (`NOMES_RELACIONS`). Fonte de verdade partida → risco de desincronización. O backend xa expón `/config/:key`, `/relacions/tipos`, `/config/idiomas`: o frontend debería **consumir** eses, non duplicar. |
| **Backend monolito** | `index.js` = 2.902 liñas / 53 rutas nun só ficheiro. Funciona, pero a prazo: partir en `routes/` por dominio. |
| **Ficheiros raíz** | ✅ Confirmados: `package.json`, `package-lock.json`, `README.md` (boilerplate CRA — a reescribir). Verificar que `public/index.html` existe en local. |
| **Compoñentes-monolito** | 8 ficheiros > 1.000 liñas. `App.js` mestura routing + estado + UI. Difíciles de manter e de que eu os "lea" enteiros. |
| **Ficheiro morto** | `src/skills_canonicas.js` (0 bytes) — duplicado baleiro do real en `Oberon/`. Borrar. |
| **Mestura gl/es** | Nomes e contidos en galego e castelán (`EspecificacionesOberon.txt`). Decidir idioma de código/docs. |
| **Pendentes de contido** | `harina→fariña`, `Profesion.epigrafe_gl → "Mestre da fariña e do tempo"` (cando exista editor). |

---

## 4. Plan de reestruturación (estrutura obxectivo)

Separar **dous repos** (como xa tiñas planeado). Frontend primeiro.

```
gaia-frontend/                  ← repo público #1
├── public/
│   └── index.html
├── src/
│   ├── config/
│   │   ├── api.js              ← ÚNICA definición de API (mata as 32 copias)
│   │   └── mapa.js             ← (antigo mapaConfig.js)
│   ├── i18n/
│   │   ├── index.js            ← función t() + provider de idioma
│   │   └── locales/
│   │       ├── gl.json
│   │       ├── es.json
│   │       └── en.json         ← engadir idioma = engadir 1 ficheiro
│   ├── lib/                    ← helpers (authHeaders, fetch wrapper)
│   ├── contexts/               ← UserContext, UIContext, MapaContext (xa existen)
│   ├── features/               ← agrupar por dominio, romper os monolitos
│   │   ├── mapa/               ← MapaUniverso, BuscadorMapa, PanelConfigMapa…
│   │   ├── editor/             ← Editor, EditorRelacions, EditorRutas, Constructor*…
│   │   ├── oberon/             ← OberonProfesionVista, PanelOberonTest, VisorMedio…
│   │   ├── exame/              ← ModoExame, RetoInteractivo…
│   │   ├── profesor/           ← ModoProfesor, DashboardCentro, RankingCentros…
│   │   └── perfil/             ← PanelPerfil, PanelXP, NotificacionXP…
│   ├── components/             ← compoñentes reutilizables puros (GaiaLogo…)
│   ├── styles/
│   │   └── tokens.css          ← UN só ficheiro de tokens (fusionar os dous)
│   └── data/                   ← datos non-texto (config rexional) → idealmente backend
├── .env.example
├── .gitignore
├── package.json
└── README.md

gaia-backend/                   ← repo #2 (Express + Neo4j)
├── db/
│   ├── schema/                 ← *.cypher (desde src/Oberon/)
│   └── seed/                   ← seeds + profesions_seed.json (desde src/Oberon/)
├── src/
│   ├── index.js                ← servidor (hoxe monolito 2.902 liñas)
│   ├── routes/                 ← (futuro) partir as 53 rutas por dominio
│   ├── lib/                    ← driver Neo4j, middleware JWT, helpers, límites IA
│   └── ingestion/              ← 🆕 pipeline de fontes abertas (§7)
├── .env.example                ← 🆕 (JWT_SECRET, NEO4J_*, ANTHROPIC_API_KEY, PORT…)
├── .gitignore                  ← 🆕
├── package.json
└── README.md
```

### Prioridades (orde recomendada)
1. ✅ **Git-ready mínimo**: `.gitignore`, `.env.example`, `README.md` creados. Pendente: borrar `src/skills_canonicas.js` (0 bytes) e commitear `package-lock.json`.
2. 🔜 **`src/config/api.js`** + substituír as 32 copias *(en curso)*.
3. **Separar backend** (`src/Oberon/` → repo/carpeta `gaia-backend`). Aquí si: Fase 0 de seguridade (§6).
4. **Reestruturar i18n** (§5).
5. **Tokens unificados** + empezar a drenar estilos inline (incremental, non todo dunha vez).
6. (Futuro) romper monolitos por `features/`.
7. (Futuro) estética + ferramentas extra.

---

## 5. Estratexia i18n — "engadir idioma fácil"

**Obxectivo:** engadir un idioma novo = **crear un ficheiro**, nada máis.

### Cambio 1 — Inverter a estrutura (por idioma, non por clave)
De `{ clave: { gl, es, en } }` (un ficheiro monstro) a **un JSON por idioma**:

```
src/i18n/locales/gl.json   → { "explorar": "Explorar", "relacions": "Relacións", ... }
src/i18n/locales/es.json   → { "explorar": "Explorar", "relacions": "Relaciones", ... }
src/i18n/locales/en.json   → { "explorar": "Explore",  "relacions": "Relations", ... }
```
Engadir francés = copiar `gl.json` → `fr.json` e traducir. **Cero edicións noutros sitios.**
(Compatible co teu endpoint dinámico `${API}/config/idiomas` e o botón "+ Engadir idioma".)

### Cambio 2 — Idioma desde contexto, non como argumento
Hoxe: `t(idioma, 'clave')` en 230 sitios. Mellor: un provider/hook que coñece o idioma activo:
```js
const { t } = useI18n();   // t('clave') — sen pasar idioma a man
t('idiomaEngadido', nome); // interpolación segue igual
```
*Migración suave:* mantén `t(idioma, clave)` funcionando e engade o hook por riba; migra ficheiro a ficheiro.

### Cambio 3 — Sacar o texto dos datos
`roles.js`, `niveis.js`, `cursos.js` levan texto galego cru. Pasalo a claves:
```js
// antes
{ id: 'explorador', descripcion: 'Descubro, me adapto e sobrevivo.' }
// despois
{ id: 'explorador', descKey: 'rol.explorador.desc' }   // texto vive nos locales/
```

### Regra de ouro
> Ningún texto visible para o usuario debería estar fóra de `locales/`. Se aparece unha cadea
> con acentos dentro dun `.js` que non sexa un locale → é un bug de i18n.

---

## 6. Checklist Git (antes de subir)

### Fase 0 — Auditoría de historial (en `D:\Gaia\`)
**Para o FRONTEND: opcional / cosmética** (o frontend non ten segredos — §3.1). **Para o BACKEND: obrigatoria** antes de publicalo.
```bash
# 1. Apareceu .env algunha vez?
git log --all --full-history -- .env
git log --all --full-history -- frontend/.env
# 2. Outros segredos no historial? (relevante sobre todo no backend)
git log --all -p | grep -i "api_key\|sk-ant\|password\|secret"
# 3. Emails do autor expostos?
git log --all --pretty=format:"%an %ae" | sort -u
```
- **Frontend:** se (1) devolve algo, é só unha IP local → non é fuga real. Limpar só por estética.
- **Backend:** se (2) atopa `sk-ant`/contrasinal → **chave comprometida**: rexenerar en Anthropic **e** limpar historial.
- **Recomendación:** se o historial vello non aporta valor (é o teu caso), o máis simple e seguro é
  **borrar `.git`, `git init` novo, primeiro commit limpo**. (Opción A das túas notas. ✔️ De acordo.)
- Alternativa se queres conservar historial: **BFG Repo-Cleaner**.

### Ficheiros a engadir / commitear
- `.gitignore` e `.env.example` → **xa creados** (sesións anteriores).
- `README.md` real de GAIA → **creado** (substitúe o boilerplate de CRA).
- **Commitear `package-lock.json`** (instalacións reproducibles).
- Borrar `src/skills_canonicas.js` (0 bytes).

### Conta destino
- `cancioneschorriscortas-max` · **só frontend** no primeiro repo · backend separado máis adiante.

---

## 7. Roadmap — alimentar o grafo desde fontes abertas

Obxectivo futuro: xerar nodos/relacións automaticamente desde fontes abertas (Wikipedia, etc.).
**Vantaxe enorme:** xa usas **Neo4j**, que é un grafo nativo → o destino encaixa de serie.

### Recomendación de fontes (de máis a menos estruturada)
1. **Wikidata** (preferida): xa é un grafo con entidades e relacións *tipadas* (P-properties).
   Mapea case 1:1 ao teu modelo `source/target/type/context`. API SPARQL aberta.
2. **DBpedia**: extracción estruturada da Wikipedia; boa para taxonomías e categorías.
3. **Wikipedia (texto)**: secundaria — útil para **contido dos nodos por nivel** e para extraer
   relacións con axuda dun LLM cando non existan en Wikidata.

### Pipeline proposto (no `gaia-backend/src/ingestion/`)
```
[Fonte]            [Extracción]          [Mapeo a GAIA]              [Validación]        [Grafo]
Wikidata/DBpedia → entidades+relacións → node{type,level} +         → PanelValidacion → Neo4j
Wikipedia (texto)  (SPARQL / API)        relation{type,context,        (humano aproba)    (MERGE,
                                          via,strength}                                    sen duplicar)
```
- **Mapeo:** unha capa que traduce P-properties de Wikidata → os teus 12 `type` reais (`PERTENCE_A`,
  `E_UN`, `PRODUCE`, `USA`, …) e asigna `context`, `level` (`primary`/`secondary`/`expert`) e `strength`
  (`high`/`medium`/`low`).
- **Boa noticia — moita infraestrutura xa existe:**
  - **`POST /import`** (carga masiva) → punto de entrada natural do ingerido (ou un `/ingestion` novo ao lado).
  - **Sistema de `/envio` + `/envios-pendentes` + `/envio/:id/:accion`** e `PanelValidacion.js` →
    **xa é a cola de aprobación humana**. O ingerido entra como `envio` en estado `draft` e un profesor/editor valida.
    Encaixa coa Regra 9 (as conexións directas valídanse) e cos `status` `draft`/`validated`.
- **Composabilidade (Regra 8):** as rutas de creación xa traballan sobre Neo4j; ao ingerir usar **`MERGE`
  por `id`**, nunca `CREATE` cego → un concepto reutilízase, non se duplica.
- **`strength` automático:** derivable de sinais (frecuencia de co-ocorrencia, nº de fontes que a citan).

### Decisións a tomar antes (ADRs futuros)
- Idioma fonte de ingestión e como xerar as traducións dos nodos importados.
- Licenzas: Wikidata (CC0, libre), Wikipedia (CC BY-SA → atribución obrigatoria). Documentar.
- Onde vive o `id` canónico dun nodo importado (mapeo a QIDs de Wikidata?).

---

## 8. Como traballamos (método)

- **Director–Executor:** ti decides (director), eu executo. Este `MASTER.md` é o contrato compartido.
- **Non pegar 1.300 liñas cada vez.** Mellor: subir a GitHub e eu accedo por `web_fetch` ao ficheiro concreto.
- **Briefings curtos** por sesión en `docs/architecture/briefings/`; decisións firmes en `decisions/` (ADRs).
- **Unha cousa de cada vez.** A reestruturación é incremental (sobre todo os 1.847 estilos inline).

### Glosario rápido
| Termo | Significado |
|-------|-------------|
| **Oberón** | Subsistema de profesións/skill tree dentro de GAIA |
| **Lúa** | Asistente (`AsistenteLua.js`) |
| **Nodo** | Unidade de coñecemento no grafo |
| **Journey / Ruta** | Secuencia ordenada de nodos (un camiño válido) |
| **Portal** | Ligazón inline no texto dun nodo cara a outro nodo |
| **Nivel** | `primary` / `secondary` / `expert` — atributo do *usuario* |
| **strength** | `high` / `medium` / `low` — relevancia dunha relación |

---

## 9. Backlog / decisións pendentes (ADRs)
- [ ] ADR-001 — XP de Oberón vs XP de GAIA (¿unificados?)
- [ ] ADR-002 — CTA de entrada a Oberón
- [x] ADR-003 — Estética do skill tree → **resolto por ADR-006** (adoptar Yggdrasil Forge)
- [ ] ADR-004 — Idioma do código e da documentación (gl/es/en)
- [x] ADR-005 — Fonte primaria de ingestión → **resolto: Marble Skill Taxonomy** (curricular; Wikidata queda para dominios non curriculares no futuro). Modelo "multiverso": o contido de Marble como territorio propio, ligado por portais desde nodos normais.
- [x] **ADR-006 — Adoptar Yggdrasil Forge para o render de Oberón** — **DESBLOQUEADO e INTEGRADO** (Fases 1-2 funcionando). Ver `decisions/ADR-006-yggdrasil-oberon.md`.
- [ ] Pendente de contido: `harina→fariña`; `epigrafe_gl → "Mestre da fariña e do tempo"`

---

## 10. Bitácora

### Sesión 6 — Executor autónomo: fluxo do neno de punta a punta, móbil e i18n

**Encargo do director:** "perfeccionar GAIA" con autonomía (probar como usuario, mellorar,
estender). Informe completo con achados e backlog en `docs/architecture/INFORME_S6_FLUXO_NENO.md`.

**Feito:**
- **Pila local levantada e documentada:** Neo4j en `C:\neo4j-community-5.26.22` (`bin\neo4j.bat console`),
  backend `node index.js` en `D:\gaia-backend`, frontend con `.env.local` → `http://localhost:4000`
  (ignorado por git; o `.env` segue apuntando á IP da LAN).
- **"A viaxe do pan" xa se pode percorrer de punta a punta:** os 4 nodos xa estaban importados
  (director); o executor cargou os 4 retos (`reto_primary_gl/es/en`, `reto_bloqueado=false`) e creou
  a journey `a_viaxe_do_pan` (🍞, módulo Galicia, 4 paradas). Probado como neno: portada → senda →
  4 pasos con reto → ruta completa → +40 XP. Conta de proba local: `Proba Executor`
  (profesor, centro "Centro de proba"; credenciais no scratchpad da sesión, non no repo).
- **Fluxo do neno (commit `fc4eae4`):** RetoInteractivo arrastraba a avaliación do paso anterior
  (bug grave, arranxado), erros sen saída, XP prometido 20 vs real 15, opcións do reto nunha soa
  liña; PercorridoRuta con fase `erro`; **SendaVisual VERTICAL en móbil** (a 375px as etiquetas
  quedaban en 6px); PortadaNeno con volta ao mapa e caso "ruta desaparecida"; a11y (teclado,
  aria, progressbar); todas as cadeas destes ficheiros por `t()`.
- **Arquivo de Rutas (commit `3a10399`):** en móbil era inusable (panel de 300px fixos + detalle
  con ancho negativo); agora unha columna con volta; Escape pecha; i18n completa; barra inferior por `t()`.
- **Backend (`gaia-backend` commits `3daa41a`, seguinte):** stops e `/progreso/rutas` con
  `label_{idioma}`; login co centro opcional de verdade; **voz de Lúa por nivel** en `/avaliar-reto`
  (en primaria: neno de 8-10 anos, frases curtas, galego normativo, pista en vez de resposta).
  Antes dicía "estrutura reprodutiva" e "grano" a un neno de 8 anos.
- 99 claves i18n novas (gl/es/en).

**Rolda 2 (mesma sesión, encargo "fai que mole, que sexa adictivo aprender"):**
- **Portais inline EXISTEN xa** (Regra 6): `[[palabra|nodo]]` no texto → `src/portais.js`. No
  percorrido abren un **panel de desvío** (excursión sen perder o paso; os portais de dentro seguen
  o fío), XP `NODO_NOVO` a primeira vez, carta 🔭 co primeiro portal. Os 4 nodos do pan lévanos.
- **Lúa v1 SEN IA** (§4 de EXPERIENCIA_NENO): `src/data/frasesLua.json` + `src/lua.js`. Portada,
  senda, desvío e fin de ruta falan desde o banco.
- **Cartas coleccionables** (§3.4): `src/data/cartas.json` (7 cartas, 4 coleccións), `GET/POST
  /cartas` no backend, revelación con volta ao rematar a ruta, colección na portada con siluetas.
- **Contido "como funciona o mundo":** 3 rutas novas × 4 nodos (gl/es/en, portais, retos, 33
  relacións): **A viaxe da auga 💧, A viaxe da luz ⚡, De onde vén o leite 🐄**. Fonte:
  `docs/content/como_funciona_o_mundo.seed.mjs`. Xa hai 6 rutas na BD local.
- Probado como neno: portal → desvío → carta 🔭; ruta da auga completa → carta 💧; colección 2/7.
- **Imaxes nas paradas:** 16 fotos de Wikimedia Commons (CC0/CC BY/CC BY-SA), escollidas a man
  con follas de contacto, cargadas como media dos nodos e pintadas como cabeceira de cada paso
  coa atribución ao pé. Lista en `docs/content/media_atribucions.json`.

**Rolda 3 (8 set 2026, "sigue cando queiras"):**
- **Espertar (§3.1) e elección (§3.2) FEITOS:** PrimeiroContacto co guión de tres frases de Lúa
  e "Como queres viaxar polo universo?"; SeleccionRol como "elixe o teu starter" (Lúa conta cada
  camiño ao tocalo, botón "Este son eu"); **o alumnado aterra na súa portada** ao entrar e tras
  escoller camiño (bucle diario §3.4). O tutorial vai primeiro no catálogo.
- **Rutas publicadas e filtradas:** as 8 rutas do neno están `published`/`public`; `/journeys`
  só devolve esas a quen non é profesor (token opcional). Conta de proba alumna: `Nena Proba`.
- **2 rutas máis "como funciona o mundo":** A viaxe do lixo ♻️ e Por que sobe e baixa o mar 🌊
  (8 nodos, 21 relacións, 2 cartas, 8 fotos). Total: **8 rutas, 24 paradas con foto, 9 cartas.**
- Arranxo de paso: as habilidades das cartas de rol saían coa clave i18n en bruto.
- **"O teu soño" xa é real (v1):** mostra o oficio ou camiño escollido (roles.js), permite
  cambialo (reabre SeleccionRol) e facer o test de oficios; ao completar "A viaxe do pan"
  desbloquea "Ver o oficio por dentro" → a vista de Oberón do panadeiro, dentro da portada.
  Arranxado en Neo4j o `epigrafe_gl` pendente ("harina" → "fariña").
- **+2 rutas: Como arde o lume 🔥 e A viaxe do sal 🧂** (triángulo do lume; salinas romanas de
  Vigo e conserveiras). **Total: 10 rutas, 32 paradas con foto, 11 cartas.** Lúa co metrónomo:
  se hoxe xa avanzaches, dío e non apura.
- **Rutas de SECUNDARIA (primeiras dúas):** "A luz, por dentro" 🧲 e "O lume, por dentro" 🧪
  reutilizan os nodos (Regra 8: composable, non duplicar) coa capa "e por que?" aberta e
  `reto_secondary` aberto (30 XP). O catálogo ordena polo curso do alumno e marca "Secundaria".
  **Total: 12 rutas (10 primaria + 2 secundaria), 13 cartas.**
- **+2 rutas de primaria: Como chega a mensaxe ao móbil 📱 e A viaxe da pataca 🥔.** A portada
  lista tamén os camiños a medias e os feitos (antes un segundo camiño facía desaparecer o
  primeiro). **Total: 14 rutas, 40 paradas con foto, 15 cartas.**
- **Profesor:** a lista de alumnos do centro mostra camiños completados/empezados e cartas
  (`/centro/:centro/alumnos` amplía a consulta con PROGRESO e `u.cartas`).

**Rolda 5 (8 set 2026):** o director mandou retirar o pé "Xunta de Galicia" do Arquivo (agora
"GAIA · grafo de coñecemento galego · 2026", "Proxecto GAIA", "Acceso aberto"). Teclado no
percorrido (Escape, ← →). Editor coa axuda da sintaxe de portais. Panel do profesor: tocar un
alumno despraza os seus camiños un a un (`GET /centro/:centro/alumnos/:id/rutas`). +3 rutas de
secundaria (auga, marea, sal "por dentro") e 3 cartas. **Total: 17 rutas (12 primaria + 5
secundaria), 40 paradas con foto, 18 cartas.**

**Rolda 6:** +2 rutas de primaria (A viaxe da comida polo corpo 🍎, De onde vén o tempo ⛅, con
portais cara a nodos doutras rutas: vento, chuvia) e 2 cartas. **Bug de EditorRutas arranxado:**
o selector de visibilidade mandaba `validated` (400 no backend) e non había forma de publicar
unha ruta desde a app; agora "Pública" → `public` e o `status` segue á visibilidade
(published/draft). **Total: 19 rutas (14 primaria + 5 secundaria), 48 paradas con foto, 20 cartas.**

**Rolda 7 (ferramenta cómoda para quen crea):** ConstructorRutas con "Publicar xa" marcado por
defecto (POST + PUT published/public; probado: a ruta nova aparece no catálogo do neno) e
EditorRutas con "Ver como neno" (RutaNeno nun overlay sen saír do editor). **Ponte explorar → senda:**
na folla móbil do nodo, "Camiños que pasan por aquí" abre RutaNeno (`/nodo/:id/journeys`, coa
mesma visibilidade ca `/journeys`).

**Rolda 8:** primeira ruta de nivel **experto**, "A luz, a fondo" 🎓 (capa `text_expert` e
`reto_expert` nos 4 nodos da luz: Coriolis/Betz, Faraday-Lenz, I²R e rede síncrona, cadro
eléctrico). Os tres niveis da Regra 3 xa viven nos mesmos nodos. **Total: 20 rutas (14 primaria +
5 secundaria + 1 experto), 21 cartas.**

**Próximo (ver informe):** voz de Lúa gravada para o espertar (`/assets/lua-intro.mp3` é a
vella); máis rutas expert coa mesma receita; máis rutas "como funciona" (a música, o diñeiro, o
reloxo). **Mapa guiado:** "Explorar libre" abre o mapa centrado na parada actual do neno; e o mapa ten
**modo "Os meus camiños"** (só esqueleto + paradas das rutas visibles, `GET /journeys/nodos`),
que é o por defecto para o alumnado; un botón 🧭 alterna con "Todo o universo".

**Rolda 9:** revisión visual das 48 fotos en follas de contacto (substituídas leite e sal) e segunda
ruta de experto, "O lume, a fondo" 🔬. **Total: 21 rutas (14 primaria + 5 secundaria + 2 experto),
48 paradas con foto, 22 cartas.**

**Rolda 10:** **misión da semana** na portada do neno: 4 temas (mar 🐚, enerxía ⚡, terra 🌱,
como funciona 🔧) que rotan pola semana do ano, cada un con 3 rutas; a tarxeta lista as rutas
(feitas/pendentes, clic abre a ruta) e, ao rematar as tres, dá unha carta especial e +50 XP unha
soa vez (`src/data/misions.json`, `XP_ACCIONS.MISION_SEMANA`). **Total: 21 rutas, 48 paradas con foto, 26 cartas.**

**Rolda 11:** Lúa fala da misión da semana (cando queda unha ruta empúrraa polo nome; cando está
feita e non hai camiño activo, dío) e terceira ruta de experto, "A auga, a fondo" 💧🎓
(`docs/content/rutas_experto_3.seed.mjs`: calor latente e chuvia orográfica, bacías e Q=A·v, ETAP
fronte a EDAR, presión da rede). **Total: 22 rutas (14 primaria + 5 secundaria + 3 experto), 48 paradas
con foto, 27 cartas.**

**Rolda 12:** a misión da semana chega ao profesor: na lapela de alumnado, panel co tema da semana
e contadores (completa / a medias / sen empezar) e chip por alumno (`src/misions.js` compartido;
backend `/centro/:centro/alumnos` devolve `rutasFeitas`).

**Rolda 13:** Modo profesor desde o móbil: entrada no menú móbil e cabeceira/lapelas/Xestión
adaptadas a menos de 760 px (`ModoProfesor.js` con anchura reactiva).

**Rolda 14:** cuarta ruta de experto, "O pan, a fondo" 🥖🎓 (`docs/content/rutas_experto_4.seed.mjs`:
xenoma do trigo e partes do gran, glute e amidón, fermentación con ecuación, o forno grao a grao).
Co tutorial do pan xa hai unha versión experta de cada tema "a fondo": luz, lume, auga e pan.
**Total: 23 rutas (14 primaria + 5 secundaria + 4 experto), 48 paradas con foto, 28 cartas.**

**Rolda 15:** repaso da Xestión do profesor a 375 px (Nodos, Crear nodo, Relacións, Rutas, Editor):
formularios e buscas caben; só a táboa de nodos desbordaba (agora métricas fluídas e táboas con scroll
horizontal no seu marco). Quinta misión da semana, "A semana do prato" 🍽️, para que a rotación non se
repita cada mes. **29 cartas.**

**Rolda 16:** ruta nova de primaria "De onde vén a música" 🎵 (`docs/content/como_funciona_o_mundo_6.seed.mjs`):
a vibración, a gaita, o oído e a gravación, con fotos de Commons e portal ao móbil. **Total: 24 rutas
(15 primaria + 5 secundaria + 4 experto), 52 paradas con foto, 30 cartas.**

**Rolda 17:** ruta de primaria "A viaxe dunha carta" 📮 (`docs/content/como_funciona_o_mundo_7.seed.mjs`: sobre e
selo, caixa de correos, centro de clasificación, carteira/carteiro; portal ao móbil) e sexta misión da semana
"A semana das mensaxes" ✉️ (carta, móbil, música). **Total: 25 rutas (16 primaria + 5 secundaria + 4 experto),
56 paradas con foto, 32 cartas, 6 misións.**

**Rolda 18:** dúas rutas de secundaria sobre as paradas novas, "O son, por dentro" 🔊 (vibración, oído,
gravación, onda de radio) e "As mensaxes, por dentro" 📨 (sobre, centro de clasificación, mensaxe, cable
submarino), con retos abertos de cálculo e razoamento (`docs/content/rutas_secundaria_3.seed.mjs`).
**Total: 27 rutas (16 primaria + 7 secundaria + 4 experto), 56 paradas con foto, 34 cartas.**

**Rolda 19:** revisión visual das 56 fotos en folla de contacto completa; substituída a salina (saía unha
montaña nevada) por traballadores recollendo sal. Receita nova: as miniaturas pídense á API de Commons
(`iiurlwidth=320`) e descárganse en local antes de capturar, porque o host de miniaturas devolve 400 a
anchuras non xeradas.

**Rolda 20:** ruta de primaria "A viaxe do peixe á mesa" 🐟 (`docs/content/como_funciona_o_mundo_8.seed.mjs`:
o barco, a lonxa e a poxa á baixa, o xeo e a cadea de frío, a peixaría; portal ao mariñeiro). Entra na misión
"A semana do mar" no lugar dos oficios do mar. **Total: 28 rutas (17 primaria + 7 secundaria + 4 experto),
60 paradas con foto, 35 cartas.**

**Rolda 21:** ruta de primaria "De onde vén o papel" 📄 (`docs/content/como_funciona_o_mundo_9.seed.mjs`:
a árbore (eucalipto e monte galego), a pasta (kraft, Lourizán), a máquina de papel (Fourdrinier, gramaxe, A4)
e o caderno (reciclaxe, portal ao contedor azul). **Total: 29 rutas (18 primaria + 7 secundaria + 4 experto),
64 paradas con foto, 36 cartas.**

**Rolda 22:** quinto experto "Conservar, a fondo" 🧪🎓 (`docs/content/rutas_experto_5.seed.mjs`: sal e actividade
de auga, xeo e Q10, conserva e botulinum/F0, leite e pasteurización/UHT) e sétima misión "A semana do bosque" 🌲
(papel, lume, tempo). **Total: 30 rutas (18 primaria + 7 secundaria + 5 experto), 64 paradas con foto, 38 cartas,
7 misións.**

**Rolda 23 (Oberón honesto, sen assets por decisión do director):** o test de oficios pasa a ser a chave
da porta de Oberón (Biblia §2): sen test, "O teu soño" ofrece o test primeiro. A vista v6 do panadeiro
deixa de inventar números: afinidade real co perfil do test (GET /test/meu) ou ningunha; fóra "XP Oberón
1.250", "7/56", "NIVEL 2 DE 3", os niveis e o "como medra" do amasado copiados en todas as microskills;
só a pestana HABILIDADES e un selo ADIANTO. **Bug atopado e arranxado no backend: faltaba `POST /test/gardar`**
(o panel do test chamábao desde maio e devolvía 404: ningún test se gardou nunca). Decisión pendente do
director/arquitecto: integración de Yggdrasil Forge (ADR-006); a v6 segue obsoleta.

**Rolda 24:** fluxo enteiro do neno desde cero cunha conta nova (rexistro → espertar → rol → portada):
funciona, pero a portada media 6.600 px porque o catálogo listaba as 30 rutas de golpe. Agora "Para empezar"
mostra 5 (tutorial, as 3 da misión da semana e unha máis) e "Ver todos os camiños (30)" despregа o resto con
cabeceiras Primaria / Secundaria / Experto; as rutas da misión levan un chip.

**Rolda 25:** o mesmo fluxo a 375 px (benvida, login, espertar, rol, especialidade, portada, senda, pasos):
sen desbordamentos; foto e reto caben; dous enlaces de texto pasan a ter zona táctil de 36 px. A vista de
Oberón (v6) no móbil tiña o centro a 0 px e a cabeceira a 785 px: agora apila as tres columnas por baixo
de 760 px.

**Rolda 26:** Lúa remata a frase do día cun gancho cando non hai misión a punto: o XP que falta para o
seguinte título (se vai polo 60 %) ou as cartas que leva (días pares). Ruta de secundaria "A industria, por
dentro" 🏭 (barco e cotas, poxa, pasta kraft, máquina de papel). **Total: 31 rutas (18 primaria + 8 secundaria
+ 5 experto), 64 paradas con foto, 39 cartas, 7 misións.**

**Rolda 27:** resumo semanal para o profesor no Dashboard: alumnos activos, camiños completados, retos
respondidos con nota media, XP gañados, actividade por día e últimos camiños completados (backend
`GET /centro/:centro/semana`, só lectura, últimos 7 días).

**Rolda 28:** probado o avaliador real de Lúa (backend `/avaliar-reto`, Haiku) con respostas boas, malas e
parciais de secundaria e experto. Fallo atopado: "sé xeneroso" e a regra de opción múltiple aplicábanse a
todos os niveis, e o modelo deu por bo un cálculo errado (6 km cando son 2). Agora hai RIGOR por nivel
(primaria xenerosa; secundaria e experto penalizan cifras e conceptos errados e partes sen responder), o
modelo resolve a pregunta antes de puntuar, "acertou" só leva o que está ben, máis regras de galego
(lembra/afonda/morren, sen ¿ ¡) e 600 tokens no experto.

**Rolda 29:** a gran misión do curso: dentro da tarxeta da misión da semana, as sete semanas cos seus emojis
(acesas as que xa teñen carta) e, ao ter as sete, a carta "Mestre do Ano" 🏆 e +100 XP unha soa vez
(`XP_ACCIONS.GRAN_MISION`). **40 cartas.**

**Rolda 30 (9 set 2026):** ruta de primaria "De onde vén a roupa" 👕 (`docs/content/como_funciona_o_mundo_10.seed.mjs`:
a ovella e o liño galego, o fío que se retorce, o tear (urdime e trama, Jacquard), a tenda (etiqueta, Inditex,
moda rápida e pegada). **Total: 32 rutas (19 primaria + 8 secundaria + 5 experto), 68 paradas con foto, 41 cartas.**

**Rolda 31:** avaliador de Lúa en castelán e inglés. Fallo: cunha pregunta e resposta en inglés, Lúa
contestaba en galego (o prompt enteiro está en galego e a regra "Escribe en inglés" non abondaba). Agora a
regra de idioma vai na lingua destino, esixe TODOS os campos do JSON e repítese ao final do prompt;
secundaria non esixe datos que a pregunta non pide.

**Rolda 32:** oitava misión da semana "A semana da casa" 🏠 (roupa, papel, lixo; a gran misión pasa a oito
semanas) e sexto experto "As fibras, a fondo" 🧵🎓 (`docs/content/rutas_experto_6.seed.mjs`: queratina e
feltrado, torsión e tex, ligamentos e denim, celulosa, kraft e hornificación). **Total: 33 rutas (19 primaria +
8 secundaria + 6 experto), 68 paradas con foto, 43 cartas, 8 misións.**

**Rolda 33:** revisión visual das 12 fotos novas desde a revisión das 56 (peixe, papel, roupa): todas
correctas, sen cambios.

**Rolda 34:** ruta de primaria "De onde vén o mel" 🐝 (`docs/content/como_funciona_o_mundo_11.seed.mjs`: a abella
e a polinización, a colmea de hexágonos e a encima que fai o mel, o apicultor co afumador e a IXP Mel de Galicia,
o mel que non estraga; portal ao sal). **Total: 34 rutas (20 primaria + 8 secundaria + 6 experto), 72 paradas
con foto, 44 cartas, 8 misións.**

**Rolda 35:** revisión de coherencia do catálogo (34 rutas pola API): dúas rutas anteriores á sesión sen
etiqueta nin descrición en es/en ("Galicia no Prato", "Oficios Do Mar") e catro iconos repetidos entre rutas.
Arranxado con `docs/content/rutas_fix_catalogo.seed.mjs` (reexecutable en produción).

**Rolda 36:** Arquivo de Rutas con 34 rutas: os módulos van agora en orde fixa (Galicia co tutorial, Natureza,
Ciencia, Oficios) e dentro de cada un primeiro primaria, logo secundaria e experto, alfabético. Antes
"Ciencia" (18 rutas) ía primeiro e mesturaba niveis pola orde alfabética global.

**Rolda 37:** repaso das 33 frases de Lúa en es/en (dous retoques) e títulos de nivel traducidos: o backend
mándaos en galego ("Viaxeiro", "Cartógrafo") e en es/en saían así na portada, no menú, no panel de XP e no
perfil; agora `tituloNivel(idioma, titulo)` en `niveis.js`.

**Rolda 38:** repaso das 44 cartas nos tres idiomas. Traducións ben; dous datos corrixidos: a superficie do
intestino non é "unha pista de tenis" senón 30–40 m² (Helander & Fändriks 2014; carta, seed e nodo), e retirada
a afirmación non verificada de que os cables submarinos saen do mar en Sada (carta, seed e nodo). A carta da
semana do mar fala agora de peixe e non de oficios. `docs/content/nodos_fix_textos.seed.mjs` aplica os cambios
de nodos en produción.

**Rolda 39:** repaso de datos das 82 paradas de primaria (capa de secundaria). Catro afirmacións retocadas:
"aos soldados romanos pagábanlles en sal" (mito), "a pasteurización inventouna Pasteur" (leva o seu nome; o
método actual é posterior), "só un 10 % do peixe queda na comarca" (sen fonte) e "o Museo do Tear de Allariz ou
o de Vilardevós" (sen verificar). Aviso: as 6 paradas dos oficios do mar non teñen capa de secundaria.

**Rolda 40:** "Oficios do mar" completa (`docs/content/oficios_do_mar.seed.mjs`): as 6 paradas (mariñeiro, patrón,
percebeiro, redeira, cesteiro, calafate) tiñan só un parágrafo galego de primaria, sen es/en, sen secundaria,
sen retos nin fotos. Agora: primaria en voz de neno nos tres idiomas, secundaria (títulos e seguridade a bordo,
confrarías, PERMEX e topes do percebe, malla e pesca fantasma, materiais da cestería, calafateado e BIC 2019),
reto de opción múltiple e reto aberto, e 6 fotos de Commons. **78 paradas con foto.**

**Rolda 41:** repaso de datos das 24 capas de experto (auga, luz, fibras, conservar, lume, pan): calor latente,
lapse rate, Betz, Joule, diferencial de 30 mA, aw, Q10, F0, HTST/UHT, xenoma hexaploide… todo aguanta.
Un só retoque: "a conserveira galega naceu en 1836" pasa a "a mediados do século XIX" (data sen fonte firme).

**Rolda 42:** repaso dos 32 retos abertos de secundaria. Os das primeiras rutas ("A luz, por dentro", "A marea, por
dentro") eran preguntas de explicar sen ningún número, e os novos levan cálculo: nivelados os cinco máis lixeiros
(vento, xerador, rede, enchufe, Lúa) cun cálculo ou un dato que razoar, e corrixida a premisa "a Lúa case non move a
terra firme" (móvea uns 30 cm; o que non fai é desprazala).

**Rolda 43 (9 set 2026, tras o push):** novena ruta de secundaria "A abella, por dentro" 🍯
(`docs/content/rutas_secundaria_5.seed.mjs`): fracción de obreiras fóra, quilos de néctar por quilo de mel
(0,83/0,30 ≈ 2,8), mel vendible nun ano bo e malo, vidas de abella nun tarro. Carta "Tres quilos de néctar".
**Total: 35 rutas (20 primaria + 9 secundaria + 6 experto), 78 paradas con foto, 45 cartas, 8 misións.**

**Rolda 44:** os cinco retos nivelados de secundaria pasados polo avaliador real con resposta boa e mala:
boas 85–92, malas 25–50. O avaliador (tras os axustes das roldas 28, 31 e 43) discrimina ben; sen cambios de
prompt salvo "profundar" na lista de castelanismos.

**Rolda 45:** lapela Entrada do profesor probada con propostas reais dunha alumna (nodo novo "A castaña" e nota
sobre "o_mel"). Dous bugs no backend: `/envios-pendentes` mandaba `created_at` como obxecto DateTime de Neo4j e a
pantalla pintaba "Invalid Date" (agora vai en ISO como `data`); e ao validar, o slug comía o "ñ" ("a_castaa")
(agora normalízase con `idDesdeEtiqueta`, tamén sen acentos). Ademais, o resolver que usa o panel do profesor
(`POST /envio/:id/:accion`) tiraba o motivo do rexeite, non creaba as relacións que propuxera o alumno e usaba
outro vocabulario de estado ca o resolver antigo: agora garda `nota_profesor`/`resolved_at`, crea as relacións
(`MERGE (nodo)-[:TIPO]->(destino)`) e marca `validado`/`rexeitado`. Novo `GET /envios/meus` (o alumno ve as súas
propostas co estado e a nota) e zona "As túas propostas" na portada do neno: ⏳/✅/✋, "O profe di: «…»",
botón "Ver no mapa" (abre o mapa centrado no nodo que creou) e "Proponllo ao profe" (abre PanelEnvio).
Pechado o círculo: o alumno propón, o profe decide, o alumno ve o resultado e o seu nodo no mapa co seu nome.

**Rolda 46:** ruta de primaria "A viaxe do viño" 🍇 (`docs/content/como_funciona_o_mundo_12.seed.mjs`, módulo Galicia):
vide (parras e socalcos, pintado das uvas, filoxera), vendima (tesoiras e caixas, carrís da Ribeira Sacra, mosto, 1,1–1,2 kg
por botella), adega (lévedos, CO2 e a candea, 14–18 °C brancos, bocois de carballo) e viño (cinco DO, cuncas do Ribeiro,
furancho; por que é bebida de adultos, dito sen rodeos). Catro fotos de Commons. Carta "Un ano nunha botella".
No backend, `idDesdeEtiqueta` substitúe a `slugify` strict en todos os sitios (nodo, import, journey e os dous
resolvers): a ruta chámase `a_viaxe_do_vino` e non `a_viaxe_do_vio`.
**Total: 36 rutas (21 primaria + 9 secundaria + 6 experto), 82 paradas con foto, 46 cartas, 8 misións.**

**Rolda 47:** décima ruta de secundaria "A viña, por dentro" 🍇 (`docs/content/rutas_secundaria_6.seed.mjs`): quilos e
botellas de media hectárea, graos Brix a graos de alcol (20 °Brix ≈ 218 g/L ≈ 12,8°), quilos de CO2 dun depósito
(200 kg de azucre × 88/180 ≈ 98 kg) e mL e gramos de alcol nunha copa (18 mL, 14,2 g). Carta "Cen quilos de gas".
O avaliador, ao probar estes retos, deu ben as notas pero errou nas contas ao corrixir (dicía 17,6 kg de CO2 e
daba por bo un 12 mL que era 18) e volvía atribuír ideas que a resposta non tiña. Arranxo: en secundaria e
experto o JSON leva PRIMEIRO un campo "calculo" onde Lúa resolve a pregunta antes de puntuar (cadea de
razoamento breve); despois diso as catro probas dan cifras correctas e "Nada está ben" cando toca. Ademais o
parser tolera saltos de liña dentro dos textos (daban 500) e loguea o JSON inválido; max_tokens 900/1100.
**Total: 37 rutas (21 primaria + 10 secundaria + 6 experto), 82 paradas con foto, 47 cartas, 8 misións.**

**Rolda 48:** os retos de experto pasados polo avaliador co campo "calculo" (un reto con contas por cada unha das seis
rutas, resposta boa e mala): boas 82–93, malas 25–38, e as doce resolucións de Lúa en "calculo" son correctas
(180.000 L e 346 días; 15,2 A; 50 km e 80 g; 4 e 2 días; 1,8 kWh; 5.200 kg e 95 persoas). Un só desliz: en
"acertou" chamoulle correcta a unha división que o seu propio "calculo" desmentía; engadida a regra de que
ningunha cifra do alumno pode ir como correcta en "acertou" se non coincide coa de "calculo". E contra o crédito
inventado (seguía atribuíndolle ao alumno ideas que non escribira), regra de citar: cada acerto de "acertou" leva
unha cita curta «...» da resposta do alumno. Primeira versión mal: citaba o texto da parada como se fose do alumno
(a resposta mala de primaria subiu a 75); precisado "da RESPOSTA DO ALUMNO, nunca da pregunta nin da parada" volve
a 35, e á resposta mala de experto dille "Nada.". Ollo nas probas: 20 chamadas/minuto por IP e 25 retos/día por
alumno; as contas de proba esgótanse rápido (o profesor ten contador propio).

**Rolda 49:** comprobado en pantalla o límite diario (Nova, con 25 retos gastados, ve "Por hoxe xa chegaches ao
límite de retos. Mañá hai máis!" ao enviar). Ruta de primaria "A viaxe da castaña" 🌰
(`docs/content/como_funciona_o_mundo_13.seed.mjs`, módulo Galicia): castiñeiro (souto, ourizo, Pumbariños, tinta e
chancro, avespa do castiñeiro), castaña (o pan de Galicia antes da pataca; metade auga, por iso estoupa se non se
pica), sequeiro (fume e semanas, actividade de auga, o verme) e magosto (San Martiño, tiznarse, viño novo). O nodo
"A castaña" xa existía como proposta validada de Nena (rolda 45): o seed complétao por PUT e importa os outros tres
(comproba antes cales existen, para valer nunha base limpa). Fotos: o castiñeiro de Pumbariños, ourizos abertos,
sequeiros de Pena Folenche (A Pobra de Trives) e castañas na grella dun magosto. Carta "Pícaa antes de asala".
**Total: 38 rutas (22 primaria + 10 secundaria + 6 experto), 86 paradas con foto, 48 cartas, 8 misións.**

**Rolda 50 (10 set 2026):** calendario galego de Lúa. `src/data/epocas.json` + `src/epocas.js` (`epocaDoAno`): oito
épocas de data fixa (Maios, Letras Galegas, San Xoán, Día de Galicia, vendima 1 set–10 out, Samaín, magosto 2–11 nov,
Nadal 20 dec–6 xan; o Entroido non, que cambia de data). Tres delas levan ruta (lume, viño, castaña): no catálogo esa
ruta sobe co peso da misión e leva chip "🍇 é a época"; e Lúa engade á frase do día unha frase da época (dez frases
novas en `frasesLua.json` con `cando.epoca`, sen nome para non repetilo tras o saúdo; ese día substitúe o gancho).
Hoxe, vendima: "Setembro cheira a mosto. Sabes cantas uvas van nunha botella? Está en A viaxe do viño."
O dono conectou GitHub: desde esta rolda, push ao rematar cada rolda.

**Rolda 51 (10 set 2026): primeira rolda con subaxentes.** O dono pediu probar se se pode ir máis rápido con axudantes
en paralelo. Tres subaxentes (mesmo modelo, mesma conta) escribiron á vez tres rutas de primaria completas, cada un
cun brief pechado: modelo a copiar (`_12`), ids de nodos libres e ids de destino existentes para as relacións, regras
de galego normativo, tamaños dos textos, retos coa correcta en posicións distintas, e un informe final coa lista de
cifras e a súa confianza. Resultado: `como_funciona_o_mundo_14` "A viaxe do millo" 🌽 (millo, muíño, broa, hórreo),
`_15` "De onde vén a madeira" 🪵 (piñeiro, serradoiro, carpinteiro, moble) e `_16` "De onde vén a area" 🏖️ (rocha,
viaxe polo río, onda, duna). Calidade alta: só houbo que cambiar un castelanismo ("apillar" → "amorear") e unha
etiqueta ("O transporte" → "A viaxe polo río"); os tres seeds correron á primeira (12 nodos, 39 relacións). Fotos,
cartas ("Os tornarratos", "Feita de aire", "Un gran de cuarzo") e integración fíxoas o executor. Custo: uns 110k tokens
por subaxente e 7-8 minutos cada un, en paralelo. Receita reutilizable: scripts xenéricos `media_buscar_xeral.mjs`,
`media_seed_xeral.mjs`, `captura.ps1` e `revisar_seed.mjs` no scratchpad da sesión.
**Total: 41 rutas (25 primaria + 10 secundaria + 6 experto), 98 paradas con foto, 51 cartas, 8 misións.**

**Rolda 52:** segunda tanda con tres subaxentes: `como_funciona_o_mundo_17` "De onde vén o chocolate" 🍫 (cacao, gran de
cacao, fábrica, tableta: a primeira ruta que sae de Galicia, con comercio xusto dito con equilibrio), `_18` "Como voa
un paxaro" 🐦 (pluma, á, o corpo feito para voar, migración: sustentación con Newton e non só Bernoulli, Estaca de
Bares) e `_19` "De onde vén o vidro" 🫙 (vidro, forno, vidreiro, botella: continúa a ruta da area). Correccións do
executor: "soplan" → "sopran", "reblandecemento" → "abrandamento"; o subaxente do chocolate escolleu "vaíña" (RAG)
por conta propia. Nas fotos, un desliz meu: para "o corpo feito para voar" subira un esqueleto de avestruz (non voa);
substituído por un pombo en voo (`borrar_media.mjs` + resubida). Cartas "Derrete na boca", "Un compás dentro",
"Area que se ve a través". Tamén: o profesor ve a época do calendario no panel da misión (commit 0b3d802).
**Total: 44 rutas (28 primaria + 10 secundaria + 6 experto), 110 paradas con foto, 54 cartas, 8 misións.**

**Rolda 53:** terceira tanda con subaxentes, esta vez tres rutas de SECUNDARIA sobre as de primaria da mañá:
`rutas_secundaria_7` "O millo, por dentro" 🌽, `_8` "A area, por dentro" 🏖️ e `_9` "O voo, por dentro" 🐦 (retos de
cálculo + concepto, cartas "Secar sen tocar", "Cen veces máis", "Contar lixeiro"). Os redactores corrixiron dúas
cifras incoherentes do meu brief (0,5 g por pluma daban 2,5 kg de plumas nunha ave de 1 kg) e entregaron as solucións.
O avaliador fallou nun reto ben resolto: no do hórreo tomou "30 % de humidade" por 30 % de materia seca e deu 35 a
unha resposta correcta. Arranxo estrutural no backend (0e227d7): **solución de referencia do autor**
(`solucion_<nivel>` no nodo, só se garda cando vén no PUT) que `/avaliar-reto` mete no prompt como cifras fiables.
Coa referencia: 90 á resposta boa, 25 á mala. Os tres seeds levan agora `SOLUCIONS` e gárdanas; as 12 solucións
quedaron na base. Pendente: os retos de secundaria e experto anteriores (roldas 3-47) non teñen solución de
referencia aínda. Ollo probas: o login ten límite de 10 intentos/15 min por IP; os scripts levan reserva co token
gardado en `test_user.json`.
**Total: 47 rutas (28 primaria + 13 secundaria + 6 experto), 110 paradas con foto, 57 cartas, 8 misións.**

**Rolda 54:** solucións de referencia para os 64 retos anteriores (40 de secundaria, 24 de experto), escritas por catro
subaxentes en paralelo (a primeira tentativa morreu polo límite de sesión; relanzados). Cada solución leva cifras
con operacións e intervalo aceptable, regras de crédito parcial ("3,3 kg é só parcialmente correcto") e os
conceptos cos termos exactos do texto. Fonte de verdade: `docs/content/solucions_referencia.seed.mjs` (autocontido,
49 nodos). Probas: a resposta co atallo 1/0,3 no néctar baixa a 55 con explicación do porqué; a de experto no xeo, 75.
Achados dos redactores para o backlog: (1) `a_ameixa` e `o_marisqueo` teñen como "texto de secundaria" un texto de
primaria; (2) varios enunciados piden conceptos que o texto da parada non explica (afumador en `o_apicultor`,
diferencial en `o_enchufe`, fotosíntese en `a_lena`, osmose en `o_sal`, Pasteur en `a_conserva`, modulación en
`a_onda_de_radio`): ou se completa o texto ou se afrouxa o enunciado; (3) `o_xeo` (experto) ten unha pregunta
ambigua ("canto a 10 °C se deixa a caixa ao sol dúas horas").

**Rolda 55 (sen subaxentes, por tokens):** `docs/content/nodos_fix_textos_3.seed.mjs` dá texto de secundaria de verdade
(gl/es/en, 100-130 palabras) a oito paradas cuxos retos pedían o que a parada non explicaba: a ameixa (filtración,
zonas da ría, depuradora, toxinas), o marisqueo (recurso renovable, tamaño mínimo, topes, vedas, furtivismo), o
enchufe (magnetotérmico vs diferencial), a leña (fotosíntese, humidade), o sal (osmose, actividade de auga), a
conserva (Appert e Pasteur, autoclave, lata abombada), a onda de radio (modulación AM/FM/dixital); e o afumador
en `o_apicultor`. Queda do backlog: o enunciado ambiguo de `o_xeo` (experto).

**Rolda 56:** o dono preguntou se os nodos novos saen no mapa. Saen nos dous modos: "Os meus camiños" pinta as paradas
das rutas publicadas (114, con relacións) e "Todo o universo" non filtra por estado (1.901 nodos, 1.761 borradores).
`docs/content/validar_nodos_rutas.seed.mjs`: os 103 nodos escritos para as rutas (autor "GAIA — como funciona o
mundo") pasan de draft a validated, para distinguilos dos borradores vellos; os 11 que xa o estaban e os doutros
autores non se tocan. No mesmo seed, o reto de experto de `o_xeo` reescrito sen a ambigüidade (pide as horas de vida
útil que consome o descoido) coa súa solución de referencia.

---

### Sesión 5 (peche) — Claude Code como executor + Portada diaria

**O CAMBIO DE MODELO (ler isto se es un chat novo):** o proxecto pasa a un triángulo
**director (Agarfal) + arquitecto (chats de deseño coma este) + EXECUTOR (Claude Code
sobre os repos locais)**. O arquitecto escribe briefings autosuficientes en `docs/design/`;
o executor implementa; o director revisa e proba. **Regras do executor:** `git pull` antes;
non tocar ficheiros fóra do alcance do briefing; commit local **SEN push** (o push é do
director tras revisar); dúbidas → opción simple + comentario `// DECISIÓN EXECUTOR: ...`.

**Feito:**
- **Test do executor: APROBADO con nota.** Primeira tarefa real (briefing `docs/design/BRIEFING_PORTADA_NENO.md`): construíu `PortadaNeno.js` (350 liñas, estilo da casa exacto), diagnosticou un problema de UX con referencias de liña (a portada era un cul-de-sac: só lía rutas empezadas e a única entrada ao catálogo estaba agochada no menú ⚙), cazou un bug propio (`rutas[length-1]` con `ORDER BY DESC` → `rutas[0]`), e PAROU a pedir decisión de deseño en vez de improvisar. Revisión de código do arquitecto: limpa.
- **Decisión de deseño (director): modelo AUTOSERVIZO v1** — o neno escolle ruta (Principio 3, autonomía). O tutorial asignado por rol chegará co onboarding; a asignación por profesor é feature futura (non existe no backend: PROGRESO créase ao empezar, non ao asignar).
- **Opción C aplicada:** caso (b) da portada mostra "Camiños que podes empezar" (`GET /journeys`, mesma visibilidade que o Arquivo) abrindo `RutaNeno`; e o "Iniciar ruta" do **Arquivo (ArbolInstitucional) pasa a abrir RutaNeno** en vez de PercorridoRuta pelado — unha soa experiencia de ruta en toda a app.
- **`PortadaNeno.js` v1 (boceto 5):** Zona 1 Lúa+frase por hora+chip XP/nivel · Zona 2 ruta activa coa `SendaVisual` (casos: activa / sen rutas → catálogo / todas feitas → última con "Volver percorrer") · Zona 3 tarxetas Soño (placeholder Oberón), Cartas (placeholder) e Explorar. Acceso temporal: botón "🧭 Explorador" en App (marcado TEMPORAL ata o onboarding). Degradación: sen login/backend → caso (b), nunca peta.

**Próximo:**
1. **Contido "A viaxe do pan"** → briefing ao executor (`docs/design/BRIEFING_CONTIDO_PAN.md`): el redacta borrador + JSON de import en draft; o DIRECTOR revisa a VOZ (o texto para nenos é territorio do director) e importa pola porta de sempre.
2. **Oberón (outros chats): Fase 4 de Yggdrasil** (vista real + persistencia) — eses chats deben ler este MASTER antes; poden usar Claude Code como executor co mesmo modelo.
3. Banco de frases de Lúa v1 → elección de rol narrativa → espertar.
4. Fíos: unificar backend (candidata a tarefa de executor), tradución Marble (a man), portais entre universos, opacidade 0.01 como default (pendente confirmar).

---

### Sesión 4 — Experiencia do neno: deseño + estilo flat + senda (F1-F3)

**Feito:**
- **Multiverso extensible (peche S3):** universos derivados dos datos (engadir universo = importar datos co campo, cero código), botón 🌌 ciclador, reencadre ao viaxar (`zoomToFit` por `universoActivo`).
- **Deseño experiencia do neno:** investigación (SDT, Duolingo, Khan/Bloom, Zelda BotW, Scratch/Papert, Montessori, Tokkatsu) → **8 principios** + fluxo (espertar → elección de rol → tutorial "A viaxe do pan" → bucle diario) + 5 bocetos validados → **`docs/design/EXPERIENCIA_NENO.md`** (inventario existe/falta, banco de frases de Lúa v1 SEN IA, fóra-de-alcance, orde de implementación).
- **Dirección de arte FLAT:** `mapaConfig.js` novo (fondo `#0a1020`, paleta plana, glow/bloom/partículas a 0) + `renderNodo` flat (círculo sólido, aro-pulso no activo) + `onRenderFramePre` sen halos + **label culling por prioridade** (`labelRectsRef` + orde en `filtrarDatos` + colisión de rects → cero solapamentos; label do activo sempre). Nota: opacidade relacións 0.01 gustou (candidata a default). Incidencia: o recorte dun parche levou por diante `onNodeClick/onNodeHover/onBackgroundClick/onEngineStop` do 2D → restaurados; política nova de parches: incluír contexto posterior ao punto de corte.
- **REBANDA DA SENDA COMPLETA (F1-F3), probada:**
  - F1: `(Usuario)-[:PROGRESO {indice,completada,iniciada,ts}]->(Journey)`; `PUT/GET /journeys/:id/progreso` (indice só sobe; completada pegañenta) + `GET /progreso/rutas`; PercorridoRuta restaura e garda.
  - F2: `SendaRuta.js` = `SendaVisual` (presentacional: curva SVG, feitas ✓/actual pulsando/futuras 🔒) + wrapper (journey+progreso, Lúa con frase por estado, botón único).
  - F3: `RutaNeno.js` (senda↔paso; remonta con `key` ao volver → refetch + **pop de desbloqueo** `popActual`); `PercorridoRuta` con `pasoInicial`; **XP `RUTA_COMPLETADA` (+25 exploración)** só a 1ª vez.
- Fix: `ArbolInstitucional` — botón "Iniciar ruta" tapado polo footer fixo → padding inferior.
- **Fontes futuras mapeadas:** Epicure/KAIKAKU (embeddings 1.790 ingredientes; **MCP oficial `epicure-mcp.kaikaku.ai/mcp`** compatible coa API de Lúa → "Lúa chef"; memoria para IA local) · planos antigos (Diderot/ARTFL, patentes Google/USPTO/Espacenet, Smithsonian CC0 — encaixe: MEDIA dos nodos) · oficios tradicionais (Galipedia CC BY-SA, Artesanía de Galicia/Xunta, Galiciana; Monesma: ENLAZAR vídeos si, reproducir textos non) · Tokkatsu (portal U.Tokio; engordar Life Skills/PSD de Marble; mecánica de hábitos fóra do modelo actual, anotada).

---

### Sesión 3 (peche) — Multiverso + LOD + Marble completo

**Feito:**
- **MULTIVERSO implementado e operativo.** Cada nodo leva campo `universo` (`'gaia'` | `'marble'`; fallback `'gaia'` para todo o existente). Mapa cun botón **🌌** que alterna universo activo; o filtro aplica a nodos E relacións (links a nodos filtrados romperían force-graph). Nodo `origin` "Marble Curriculum" como segundo sol.
- **LOD (mapa escalonado).** Por defecto píntase só o esqueleto (`origin`+`galaxy`+`constellation`); **picar nunha galaxia/constelación ábrea/péchaa** (fillos vía `PERTENCE_A`). Regra defensiva: nodo sen pai móstrase sempre. Implementación: función única `filtrarDatos()` (universo+LOD+links) usada polos 3 puntos de carga; estado `nodosAbertos` (Set); `toggleAberto` nos dous onNodeClick (2D e 3D). O 3D con dataset completo xa é usable.
- **Marble COMPLETO importado:** `--all` → 1.653 nodos (1 origin, 8 galaxy, 54 constellation, 1.590 concept) + 4.873 relacións, no universo marble.
- **Backend — as dúas portas gravan `universo`:** `POST /import` (`nodo.universo || 'gaia'`) e `POST /nodo` (`req.body.universo || 'gaia'`). ⚠️ Bug cazado e arranxado: no `/nodo` puxérase `nodo.universo` (variable inexistente nese handler → ReferenceError ao crear nodos desde o editor). Probado: crear/borrar nodo OK. `GET /nodos` devolve o campo.
- **Conversor v2 (`marble2gaia.js`):** sen flags só axuda; `--all` explícito para o total; engade `universo` + origin. Footgun do "todo de golpe" desactivado.
- Atribución a Marble no README ✓ (via outro chat, merxeado).
- **Primeiro merge entre chats** resolto (README + LOD): fluxo multi-chat vía git funciona. Regra: `git pull` antes de traballar en calquera chat.

**Incidencias e leccións:**
- 1º import (`--all` sen multiverso) mesturou 1.652 nodos co universo GAIA → limpeza por `autor CONTAINS 'Marble'` (o deseño reversible funcionou). Diagnóstico raíz: o mapa non tiña mecanismo de escala nin de separación — de aí multiverso+LOD.
- Nodos importados antes do parche backend etiquetáronse a posteriori con `SET n.universo='marble'`.
- Placeholder `...` nun parche pegouse literal e rompeu o map → política nova: parches con código completo copiable.
- Os parches a man en DOUS index.js son fráxiles (o bug do /nodo naceu aí) → **sobe prioridade a unificación do backend** (que a carpeta que corre sexa o repo, como no frontend).

**Próximo (abrir por aquí):**
1. **Unificar backend**: `D:\gaia-backend` como carpeta de traballo real (actualizar `.bat`), conxelar copia de `D:\Gaia\index.js`. E renomear `D:\Gaia\frontend` → `frontend_OLD` (pendente da S2).
2. **Tradución EN→GL/ES** do contido Marble (pipeline por lotes co backend de Lúa).
3. **Portais GAIA↔Marble**: relacións entre universos mostradas como portas (hoxe o filtro ocúltaas).
4. Mellora rendemento LOD se molesta o refetch por clic: gardar resposta crúa en estado + useMemo (anotado no PARCHE_LOD).
5. Oberón/Yggdrasil: confirmar Fase 3 (coroa+fondo) e Fase 4 (vista real + persistencia) — en curso noutros chats.
6. Fíos: harina→fariña na BD, labels de profesións a BD/i18n, XP ao backend, PORT/NEO4J_PASS.

---

### Sesión 2 (peche) — Yggdrasil + Marble + §10.1

**Feito:**
- **Yggdrasil Forge (ADR-006) desbloqueado e integrado.** Paquetes en npm: core/react/common **0.4.0**, importers **0.2.0** (canal `@latest`, non `@next`). React subido a 19.2.7. **Fases 1-2 completas e commiteadas**: `ProbaYggdrasil.js` renderiza o panadeiro real (endpoint → `importGaiaProfession` → `TreeEngine` → `ClusterCardsView` + `NodeInspector` en galego, SUBIR NIVEL funcional). Nota API real: `ClusterCardsView` é presentacional (recibe `groups`, non `engine`).
  - 🟡 **Fase 3 en curso:** entregados `oberonIcons.js` (coroa) + parche de fondo (`FASE3_parche.md`) — **pendente de aplicar/confirmar**. O estilo cosmos vén de serie nos compoñentes (non hai CSS que importar). Pendente decidir: iconset das microskills (pedir `bakerIcons` a Yggdrasil ou crear propio).
  - 🔜 **Fase 4:** integrar en `OberonProfesionVista` + persistencia `toJSON`/`currentTier` ↔ Neo4j.
  - Bug coñecido (aceptado): iframe de vídeo baleiro no inspector — xestionarase co editor en modo arquitecto; `renderVideo` é a porta para cablear `VisorMedio`.
- **Marble Skill Taxonomy (ADR-005):** analizada cos datos reais (1.590 micro-topics primaria, 3.221 prerrequisitos con `reason`, ODbL+CC BY-SA). Mapeo case 1:1 ao modelo GAIA. **Conversor `marble2gaia.js` escrito e probado** (piloto Computing: 23 nodos + 58 relacións, validación limpa contra as regras do `/import`). Decisións: usar `ANTES_DE` para prerrequisitos (piloto reversible; migrable a `PRERREQUISITO_DE` despois), modelo **"multiverso"** (Marble como territorio propio ligado por portais). **Piloto pendente:** backup Neo4j → converter → POST /import con token de profe → atribución a Marble no README.
- **§10.1 COMPLETA — constantes de dominio, fonte única no backend:**
  - Fase A: hook `useTiposRelacion` (GET /relacions/tipos) → **bugfix**: PanelEnvio recuperou os 3 tipos que lle faltaban (INSTANCIA_DE, TRANSFORMA, INSPIRADO_EN). Constructor/Editor deduplicados.
  - Fase B: `GET /niveis`; `niveis.js` degradado a fallback autoactualizable (mesma API, consumidores intactos).
  - Fase C: `GET /cursos` (lista rica no backend) + `GET /roles` (modelo **C2**: ids validados, presentación no frontend); descricións e habilidades dos 4 roles **por fin no i18n** (16 claves novas × 3 idiomas).
- **Decisión de fluxo:** a carpeta de traballo do frontend é **`D:\gaia-frontend`** (repo). **Conxelar `D:\Gaia\frontend`** (renomear a `frontend_OLD`) — causou un accidente real nesta sesión (Fase C aplicada na carpeta errada). O backend segue correndo desde `D:\Gaia\` (cambios van nos DOUS index.js ata unificar).

**Achados novos anotados (futuro):**
- `roles.js` contén o catálogo de **60+ profesións de Oberón** → duplicación cruzada con Neo4j ('panadeiro' está nos dous). Migrar á BD.
- `XP_ACCIONS` só existe no frontend → o cliente decide o XP outorgado (integridade). Mover ao backend.
- `FILTRO_DESTINO` (ontoloxía relación→destinos) só no frontend. Candidata a subir ao backend.
- Backend: `PORT` hardcoded e fallback `NEO4J_PASS || 'gaia1234'` seguen pendentes.

**Próximo (abrir por aquí):**
1. Confirmar/rematar **Yggdrasil Fase 3** (coroa + fondo) e atacar a **Fase 4** (substituír a vista real + persistencia).
2. **Piloto Marble** (backup → Computing → validar no mapa) + atribución no README.
3. Conxelar a carpeta vella (renomear) e actualizar o `.bat`.
4. Fíos: harina→fariña na BD, labels de profesións a BD/i18n, XP ao backend.

---

### Sesión 1 — Repos + refactors base

**Feito:**
- Auditoría completa (frontend + backend).
- `gaia-frontend` público: commit inicial limpo → `config/api.js` (mata 32 copias) → i18n a `locales/*.json` (engadir idioma = 1 ficheiro) → README de GAIA.
- `gaia-backend` público: commit inicial limpo, **verificado sen segredos** (`.env` ignorado, `.env.example` con valores baleiros). Conta: `cancioneschorriscortas-max`.
- Repos creados de cero (`git init` novo) → o historial vello de `D:\Gaia\.git` (co `.env`) nunca se subiu.
- Fluxo de traballo: `D:\gaia-frontend` (probas/repo) + `D:\Gaia\frontend` (estable), backend compartido desde `D:\Gaia\`.

**Próximo (abrir por aquí):**
1. Duplicación de constantes front↔back (§3.4) — `NIVEIS_USUARIO`, cursos, roles, `NOMES_RELACIONS`. Backend = fonte de verdade; frontend consome `/relacions/tipos`, `/config`, etc. Cross-repo + backend en marcha.
2. Texto de `roles.js`/`niveis.js`/`cursos.js` aínda fóra do i18n (vai con #1).
3. Backend: `PORT = 4000` → `process.env.PORT || 4000`; eliminar fallback `NEO4J_PASS || 'gaia1234'`.
4. Mover `frontend/src/Oberon/` → `gaia-backend/db/` (schemas, seeds).
5. Horizonte: ingestión Wikidata (apóiase en `/import` + `/envio` + `PanelValidacion`).

---

*Fin do MASTER.md. Mantelo vivo: cando algo cambie de verdade, edítase aquí.*
