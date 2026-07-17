# GAIA — Grafo de coñecemento navegable

GAIA é unha plataforma educativa construída sobre un **grafo de coñecemento**: todo son nodos
conectados e o nivel de detalle adáptase ao usuario (`primary` / `secondary` / `expert`), non ao
nodo. Entre dous conceptos pode haber múltiples rutas válidas, cada unha cun modelo mental ou nivel
de profundidade distinto.

Este repositorio contén o **frontend**. O backend (Node.js + Neo4j) vive nun repositorio separado.

---

## Stack

- **React 19** + Create React App (`react-scripts`)
- Visualización do grafo: `force-graph`, `react-force-graph-2d` / `-3d`, `three-spritetext`
- Internacionalización: sistema propio (`src/i18n.js`), idiomas `gl` / `es` / `en`
- Backend: Node.js + **Neo4j** (repo aparte)

---

## Requisitos

- Node.js 18+ (recomendado 20/22)
- npm

---

## Arrincar en local

```bash
# 1. Instalar dependencias
npm install
#    (React 19 é punteiro; se hai conflito de peer-deps: npm install --legacy-peer-deps)

# 2. Configurar o entorno
cp .env.example .env
#    e edita .env coa URL do teu backend

# 3. Arrincar
npm start
#    abre http://localhost:3000
```

---

## Variables de entorno

Defínense en `.env` (nunca se commitea; ver `.env.example`).

| Variable | Descrición | Exemplo |
|----------|------------|---------|
| `REACT_APP_API` | URL base do backend (sen barra final) | `http://localhost:4000` |

> ⚠️ En Create React App, todo o que empeza por `REACT_APP_` **compílase no bundle público**.
> Non poñas segredos aquí — só configuración non sensible. As claves viven no backend.

---

## Estrutura (resumo)

```
src/
├── config/        configuración centralizada (api.js — URL única do backend)
├── i18n.js        textos e función de tradución t(idioma, clave)
├── contexts/      estado global (usuario, UI, mapa)
├── components/    compoñentes reutilizables
├── Oberon/        subsistema de profesións / skill tree  (→ moverase ao backend)
└── *.js           pantallas e módulos do dominio
```

Documentación de arquitectura completa en [`docs/architecture/MASTER.md`](docs/architecture/MASTER.md).

---

## Internacionalización (engadir un idioma)

Os textos están en `src/i18n.js`. Para engadir un idioma novo emprégase o sistema de idiomas
da app (botón **«+ Engadir idioma»**) ou engádense as traducións ao diccionario.

> Roadmap: migrar a ficheiros por idioma (`locales/gl.json`, `locales/es.json`, …) para que engadir
> un idioma sexa só crear un ficheiro. Ver `MASTER.md` §5.

---

## Scripts dispoñibles

| Comando | Que fai |
|---------|---------|
| `npm start` | Desenvolvemento en `http://localhost:3000` |
| `npm run build` | Compila para produción en `build/` |
| `npm test` | Lanza os tests |

---

## Documentación

- **[`docs/architecture/MASTER.md`](docs/architecture/MASTER.md)** — documento-guía único: arquitectura,
  auditoría, plan de traballo, estratexia i18n e roadmap.
- `docs/architecture/decisions/` — rexistro de decisións (ADRs).

---
## Atribucións

O universo curricular "Marble Curriculum" incorpora datos de
[Marble Skill Taxonomy](https://github.com/withmarbleapp/os-taxonomy)
(© Marble, [withmarble.com](https://withmarble.com)), baixo licenzas
[ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/) (base de datos)
e [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (contido).

## Licenza

_(Por definir.)_
