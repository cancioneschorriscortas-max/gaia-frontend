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
