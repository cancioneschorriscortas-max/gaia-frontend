# BRIEFING — Portada diaria do neno (para Claude Code)

> Tarefa para o axente executor. Director: o chat de arquitectura.
> Contexto xeral do proxecto: `docs/architecture/MASTER.md` (ler primeiro).
> Deseño de referencia: `docs/design/EXPERIENCIA_NENO.md` §3.4 (o bucle diario).

## 0. Regras de traballo (OBRIGATORIAS)

1. `git pull` antes de empezar.
2. Traballa SÓ no repo frontend (`gaia-frontend`). **NON toques**: `MapaUniverso.js`,
   `mapaConfig.js`, `niveis.js`, `cursos.js`, `roles.js`, nada de `docs/`, nin o backend.
3. Ao rematar: `git add` dos ficheiros tocados + **commit local. NON fagas push** —
   o director revisa o diff e pusha el.
4. Se algo do briefing é imposible ou ambiguo, elixe a opción máis simple,
   e déixao anotado en comentario `// DECISIÓN EXECUTOR: ...` no código.
5. Estilo de código da casa: JavaScript (non TS), compoñentes función, estilos inline,
   comentarios de bloque `// ── INICIO: nome ──` / `// ── FIN: nome ──`, textos en galego.

## 1. Que se constrúe

`src/PortadaNeno.js` — a pantalla de inicio diaria do usuario neno, que ensambla
pezas XA EXISTENTES. É a pantalla descrita no boceto 5 do deseño: tres zonas
verticais + dúas tarxetas secundarias.

### Layout (de arriba a abaixo, fondo `#0a1020`, máx. 860px centrado)

**Zona 1 — Lúa saúda (a mensaxe do día):**
- Á esquerda: a mascota Lúa (SVG dunha lúa crecente kawaii — cópiaa de
  `src/SendaRuta.js`, xa hai unha alí co path feito; faina de ~44px).
- Ao lado: bocadillo (fondo `#101a30`, borde `#2a3a5c`, radius 10) cunha frase:
  - mañá (hora < 13): "Bos días, {nome}! O universo abriu cedo hoxe."
  - tarde: "Boa tarde, {nome}! Quedou algo a medio descubrir?"
  - se hai ruta activa sen completar, engade: "A túa misión espera."
  - {nome} = primeiro nome do usuario (useUser). Sen usuario → sen nome, frase igual.
- Á dereita: chip co XP e nivel actuais (useUser xa os ten: xp.total, nivel).

**Zona 2 — "O TEU CAMIÑO" (a ruta activa):**
- Datos: `GET /progreso/rutas` (con authHeaders de useUser). Devolve
  `{ rutas: [{id, label, icono, indice, totalPasos, completada, ts}] }` ordenadas
  por actividade recente.
- A "ruta activa" = a primeira NON completada da lista. Casos:
  a) Hai activa → mostrar o seu `icono + label`, e DEBAIXO a senda visual:
     importa `{ SendaVisual }` de `./SendaRuta` — pero SendaVisual precisa os stops
     completos, así que fai fetch a `GET /journeys/{id}` para os stops e pásalle
     `stops`, `indice`, `completada`. Botón dominante dourado (`#e8a547`, radius 22):
     "Á misión de hoxe" → abre a ruta (ver Zona de navegación).
  b) Non hai ningunha ruta empezada → mensaxe "Aínda non tes camiño. Explora o
     universo ou pide unha ruta ao teu profe." + botón "Explorar o universo".
  c) Todas completadas → a última completada coa senda toda verde + botón
     "Volver percorrer" e nota "Camiños completos 🌟".

**Zona 3 — fila de dúas tarxetas (+ unha de soño):**
- **"O TEU SOÑO"** (tarxeta ancha): de momento ESTÁTICA (v1): icona 🥖 + texto
  "Panadeira/o · o teu oficio espérate" + subtexto "chegará con Oberón".
  (Non chames a ningún endpoint de Oberón — v1 é un placeholder bonito.)
- **"Cartas · N"**: placeholder v1 — dous rectángulos de cores solapados (SVG ou divs
  rotados) e o texto "Cartas · 0". Non funcional aínda (cursor default).
- **"Explorar libre"**: mini-debuxo de 3 puntos conectados (como constelación) +
  texto. Ao tocar → mesma acción que "Explorar o universo" (ver navegación).

### Navegación (props do compoñente)

```js
<PortadaNeno
  idioma="gl"
  onAbrirRuta={(journeyId) => ...}   // abre RutaNeno con esa ruta
  onExplorar={() => ...}             // vai ao mapa
/>
```
O compoñente NON decide a navegación global: recibe callbacks.

## 2. Integración mínima en App.js (REVERSIBLE)

- Engade estado `const [portadaNeno, setPortadaNeno] = useState(null)`
  (`null` | `'portada'` | `{ ruta: journeyId }`).
- Un botón de acceso TEMPORAL e discreto no mesmo sitio onde App xa renderiza
  botóns de modo/cabeceira (busca como está feito o botón do modo usuario e imita
  o patrón): texto "🧭 Explorador". Márcao con comentario
  `{/* TEMPORAL: acceso portada neno — a integración definitiva virá co onboarding */}`.
- Ao pulsalo → render a pantalla completa:
  - `portadaNeno === 'portada'` → `<PortadaNeno onAbrirRuta={(id)=>setPortadaNeno({ruta:id})} onExplorar={()=>setPortadaNeno(null)} />`
  - `portadaNeno?.ruta` → `<RutaNeno journeyId={portadaNeno.ruta} onSair={()=>setPortadaNeno('portada')} />`
  (RutaNeno xa existe en `src/RutaNeno.js` — repasa as súas props antes.)
- Saír de todo → `setPortadaNeno(null)` volve á app normal.

## 3. Criterios de aceptación (comproba TI antes do commit)

1. `npm start` compila sen erros nin warnings novos de ESLint.
2. Botón "🧭 Explorador" visible → abre a portada.
3. Coa conta de proba (hai rutas con progreso na BD): a Zona 2 mostra a ruta
   real coa senda pintada no estado correcto (paradas feitas en verde).
4. "Á misión de hoxe" → abre RutaNeno desa ruta → saír → volve á portada.
5. "Explorar libre" / "Explorar o universo" → pecha a portada (app normal).
6. Sen login (localStorage limpo): a portada non peta — Zona 2 en caso (b).
7. Commit local claro: `feat(neno): portada diaria v1 — Lúa, camiño activo e tarxetas (boceto 5)`.
   SEN push.

## 4. Notas de contexto útiles

- `useUser()` está en `src/contexts/UserContext.js`: dá `usuario`, `xp`, `nivel`,
  `authHeaders()`.
- `API` impórtase de `./config/api`.
- Paleta: fondo `#0a1020` · dourado `#e8a547` · verde `#5dd4a8` · azul `#9bb3ff`
  · rosa `#ff9fb8` · branco-lúa `#e8f0ff` · texto `#f5f7ff` / secundario `#8fa3c8`.
- Filosofía visual (do deseño): unha idea por zona, UN só botón dominante,
  o secundario á vista pero apagado. Nada de modais.
