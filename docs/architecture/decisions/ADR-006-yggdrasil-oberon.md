# ADR-006 — Adoptar Yggdrasil Forge para o render de Oberón

- **Estado:** Aceptado (decisión tomada) · **BLOQUEADO** ata que Yggdrasil publique (ver §Bloqueos)
- **Data:** 2026-06-16
- **Resolve:** ADR-003 (estética do skill tree: v6 SVG / repintar / mestura)
- **Fontes:** `RESPOSTA_integracion_GAIA.md`, `panadeiro.fixture.json`, verificación contra `index.js` e npm.

---

## Contexto

O skill tree de Oberón alcanzou un teito estético tras 8-9 iteracións con SVG procedural (v6). Foi a razón
de parar Oberón e arquitecturar. Yggdrasil Forge ofrece un motor de skill trees **publicado en npm** que
renderiza exactamente a vista perseguida (tarxetas por grupo + inspector con niveis 1-3, acción clave e
"subir nivel") — confirmado pola maqueta do exemplo `oberon-panadeiro`.

## Decisión

Adoptar o motor de **Yggdrasil Forge** para o render de Oberón, consumíndoo por **npm** (repos separados,
sen monorepo nin `pnpm link`). Xubilar o skill tree v6 SVG propio e o inspector propio cando a integración
estea operativa.

## Verificación (feita, non especulación)

- ✅ Paquetes en npm nas versións declaradas: `@yggdrasil-forge/core` 0.2.0, `/react` 0.2.0, `/common` 0.1.0, `/importers` **0.0.1**.
- ✅ **Contrato de datos real:** o endpoint `GET /oberon/profesion/:id/completa` (en `index.js`) devolve **campo por campo** a forma de `panadeiro.fixture.json`. O adaptador `importGaiaProfession(...)` consómea directa — sen escribir conversión en GAIA.
- ✅ Consumible desde **CRA / JavaScript** (distribúe `.cjs` + `.d.ts`); non require migrar GAIA a TypeScript.
- ✅ `importers` 0.0.1 **NON** trae o adaptador GAIA (só Mermaid/Cytoscape/GraphML/CSV) → debe publicarse 0.1.0.

## Riscos / matices detectados (non estaban no documento)

1. **React:** o motor esixe `react: ^19.2.7`; GAIA está en **19.2.4** → subir React (≥19.2.7) ou `--legacy-peer-deps`.
2. **Bug de contido:** `epigrafe_gl: "Mestre da harina e do tempo"` → debe ser **"fariña"**. Corrixir na BD antes de xerar (propágase ao render).
3. **Fallback "copiar compoñentes" é caro:** `ClusterCards`/`DetailPanel` son `.tsx`; nun CRA só-JS habería que meter TS ou portar a JSX. → Preferir a vía de **publicalos en `@react`** e `npm i`.
4. **Persistencia a deseñar:** o motor persiste `currentTier` por nodo (vía `toJSON`/`fromJSON`); GAIA xa ten o seu modelo de progreso (`/test/calcular`, `/test/meu`). Hai que mapear un ao outro.

## Bloqueos (acción de Yggdrasil — verificado en npm o 2026-06-16: NADA publicado aínda)

1. Publicar `@yggdrasil-forge/importers` **0.1.0** (co adaptador). *Hoxe: `latest = 0.0.1`.*
2. Promover os compoñentes a `@yggdrasil-forge/react` co tag **`@next`**. *Hoxe: `latest = 0.2.0`, sen tag `@next`.*
   - Nomes confirmados: **`ClusterCardsView`** (vista tarxetas) e **`NodeInspector`** (inspector).
   - Superficie de uso prevista:
     ```js
     // cando se publique:
     npm install @yggdrasil-forge/react@next
     import { ClusterCardsView, NodeInspector } from '@yggdrasil-forge/react'
     ```

> ⚠️ `npm install ...@next` **fallará** ata que exista o tag. Antes de integrar, comprobar:
> `npm view @yggdrasil-forge/react dist-tags` (debe aparecer `next`) e `npm view @yggdrasil-forge/importers version` (debe ser ≥ 0.1.0).

## Consecuencias

- **NON refactorizar** `OberonProfesionVista.js`, o skill tree SVG nin o inspector propio — quedarán obsoletos.
- **Prep en GAIA mentres se agarda** (desbloqueado xa): corrixir "harina→fariña", subir React, e seguir coa limpeza de constantes (independente).
- **Cando Yggdrasil publique:** `npm install @yggdrasil-forge/core @yggdrasil-forge/importers @yggdrasil-forge/common @yggdrasil-forge/react@next` → `importGaiaProfession(GET) → new TreeEngine(treeDef)` → `import { ClusterCardsView, NodeInspector } from '@yggdrasil-forge/react'` cun `oberonTheme` → persistencia `toJSON`/`fromJSON` contra Neo4j.
- **Despois (conxunto):** texto por nivel (`tiers[]`), vídeo (cablear `VisorMedio.js`), hexágono de afinidade (dos stats que o motor xa computa).
