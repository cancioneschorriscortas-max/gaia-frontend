# REGRAS FUNDAMENTAIS DO GRAFO GAIA

## 1. Todo son nodos conectados
Non hai páxinas illadas. Todo responde: con que se relaciona isto?

## 2. Non existe unha única ruta correcta
Entre dous nodos poden existir múltiples rutas válidas.
Cada ruta representa un modelo mental, nivel de detalle ou contexto.

## 3. O grafo adáptase ao usuario
O nivel está no usuario, non no nodo.
- primary   → neno / público xeral
- secondary → estudante / aprendiz
- expert    → profesional / investigador

## 4. O nivel é un filtro de suxestión, non un muro
Calquera usuario pode acceder a calquera nodo.
O nivel determina o que o sistema suxire por defecto.

## 5. As relacións teñen profundidade variable
- primary:   Trigo → Pan
- secondary: Trigo → Fariña → Pan
- expert:    Trigo → Moenda → Fariña → Amasado → Fermentación → Cocción → Pan

## 6. Os portais no texto son sempre accesibles
Dentro do texto de calquera nodo pode haber ligazóns a outros nodos.
Accesibles independentemente do nivel do usuario.
O contido do nodo destino adáptase ao nivel do usuario.

## 7. Toda relación debe ter contexto
Exemplo: Auga → Motor non di nada sen contexto.
Contexto: refrixeración, vapor, industria...

## 8. O coñecemento é composable
Os nodos reutilízanse en múltiples contextos.
Fermentación aparece en: pan, cervexa, iogur...
Non se duplica — reutilízase.

## 9. As conexións directas deben validarse
O constructor suxire nodos intermedios cando existen.
O editor decide se son necesarios.
Non é obrigatorio, é recomendado.

## MODELO DE RELACIÓN
{
  "source": "trigo",
  "target": "pan",
  "type": "INGREDIENT_OF",
  "context": "panadería",
  "via": null,
  "level": "primary"
}

## MODELO DE PORTAL NO TEXTO
"A fariña obtense [moendo o trigo↗]."
O portal leva ao nodo destino.
O contido móstrase adaptado ao nivel do usuario.

## Actualización

{
  "source": "trigo",
  "target": "pan",
  "type": "INGREDIENT_OF",
  "context": "panadería",
  "via": null,
  "level": "primary",
  "strength": "high"
}
```

**Criterios de strength:**
```
high   → relación fundamental, sempre relevante
         Exemplo: Trigo → Fariña

medium → relación importante pero non esencial
         Exemplo: Fariña → Glute

low    → relación periférica, contexto específico
         Exemplo: Fariña → Historia da moenda


## Na Conceptos a ter en conta para fases posteriores

O usuario escribe: “motor térmico”

O sistema:

busca en label

busca en aliases

Resultado → mesmo nodo

👉 Perfecto

2. No constructor (CRÍTICO)

Antes de crear nodo novo:

Normalización:

minúsculas

quitar acentos

singular/plural

Busca en:

labels

aliases

Se hai match:

⚠️ Este nodo xa existe:
"Motor de combustión"

¿Queres reutilizalo?
¿Ou crear un novo concepto distinto?

👉 Aquí evitas o cancro nº1 dos grafos: duplicación silenciosa

3. No sistema (nivel máis pro)

Hai dous tipos de alias (isto é importante separalos):

A) Alias reais (sinónimos)

motor de explosión

combustion engine

👉 mesmo concepto

B) Alias perigosos (case sinónimos)

motor de gasolina

👉 NON sempre é o mesmo

Aquí tes tres opcións:

Permitilo (rápido, pero impreciso)

Bloquealo (seguro, pero lento)

👉 Marcalo como alias débil

💡 Mellora clave (nivel Deus)

Engade tipo de alias:

"aliases": {
  "gl": [
    { "value": "motor de explosión", "type": "exact" },
    { "value": "motor térmico", "type": "broad" },
    { "value": "motor de gasolina", "type": "narrow" }
  ]
}
Tipos:

exact → sinónimo real

broad → máis xeral

narrow → máis específico

🚀 Por que isto é brutal

Porque resolve 3 problemas gordos:

1. Evita duplicados

👉 básico pero vital

2. Mellora busca radicalmente

👉 o usuario non precisa “acertar o nome correcto”

3. Permite evolución natural

👉 a xente pode chamar ás cousas como queira sen romper o sistema

⚠️ Onde pode fallar (sen drama, pero importante)
1. Ambigüidade

“banco”

entidade financeira

asento

👉 solución futura:

desambiguación por contexto

2. Crecemento descontrolado de aliases

Se todo vale → lixo

👉 solución:

sistema de validación / reputación

ou límite por nodo

🧨 Resumo claro

O que acabas de definir:

👉 É o sistema inmunitario do grafo

Sen isto:

duplicación

caos

inconsistencias

Con isto:

coherencia

escalabilidade real

experiencia de usuario fluída

Siguiente paso lóxico

Se queres facer isto ben de verdade:

👉 definir:

regras de normalización

política de alias (quen pode engadir, como se validan)

e detección automática de conflitos

E aquí vai a verdade directa:

Se implementas ben:

aliases

contexto

relacións

## Actualización


O problema (sutil pero importante)

Tes isto:

(auga)-[:APPEARS_IN]->(quimica)
(auga)-[:APPEARS_IN]->(quimica_organica)

👉 Isto rompe a coherencia da capa intermedia

Por que?

Porque estás saltando niveis:

constelación

galaxia

sistema

👉 e iso fai que a navegación perda sentido

🔥 Regra que necesitas (simple e potente)

👉 APPEARS_IN só debe apuntar a SYSTEM

Nunca a:

constelación ❌

galaxia ❌

⚙️ Modelo corrixido
(quimica_organica)-[:BELONGS_TO]->(quimica)
(carbohidratos)-[:BELONGS_TO]->(quimica_organica)

(auga)-[:APPEARS_IN {role:"molécula"}]->(carbohidratos)
🧠 E entón… como aparece en “Química”?

👉 Por inferencia

Porque:

carbohidratos → química orgánica → química

👉 Non necesitas duplicar relacións

💡 Isto é clave

Se fas:

auga → química
auga → química orgánica
auga → carbohidratos

👉 introduces:

redundancia

incoherencias futuras

mantemento infernal

🚀 Modelo mental correcto

Nodo → conéctase ao nivel máis específico posible

O resto → dedúcese polo grafo

🧨 Frase para tatuar (case 😄)

👉 “Conecta abaixo, infire arriba”

⚠️ Excepción (para máis adiante)

Ás veces quererás dicir:

“isto é xeral de toda a química”

Vale, pero entón:
👉 creas un sistema tipo:

"sistema": "fundamentos_quimica"

E conectas aí.

🧪 O teu exemplo quedaría perfecto así
(n:Node {type:"constellation", id:"quimica"})
(n:Node {type:"galaxy", id:"quimica_organica"})
(n:Node {type:"system", id:"carbohidratos"})
(n:Node {type:"concept", id:"auga"})

(quimica_organica)-[:BELONGS_TO]->(quimica)
(carbohidratos)-[:BELONGS_TO]->(quimica_organica)

(auga)-[:APPEARS_IN {role:"molécula"}]->(carbohidratos)
🧨 Resumo directo

Todo correcto → case perfecto ✅

Problema → estás conectando demasiado arriba ⚠️

Solución → só conectar a SYSTEM 🔥

Beneficio → menos ruído, máis coherencia 🧠

🚀 Siguiente paso

Agora que isto está claro:

👉 constrúe o buscador de nodos para relacións

Porque xa tes:

modelo correcto

regras claras

E agora toca facer que sexa usable sen volverte tolo 😄
## actualización 
{
  "id": "auga",
  "type": "concept",
  "status": "draft | validated | deprecated",
  "relevance": "high | medium | low",
  "labels": { "gl": "Auga", "es": "Agua", "en": "Water" },
  "content": { ... },
  "media": [ ... ]
}
```

**REGRAS:**
```
type     → define a natureza. Non cambia nunca.
           Determina estilo visual e schema de campos.
           NON determina comportamento nin visibilidade.

status   → determina visibilidade e recomendación.
           draft       → só visible para editores
           validated   → visible para todos
           deprecated  → oculto, mantido por historial

relevance → determina orde e suxestións.
           high   → aparece primeiro, suxírese máis
           medium → comportamento normal
           low    → aparece ao final, raramente suxerido

PROHIBIDO:
if (type === "system") { // non mostrar contido }
→ Rompe a flexibilidade. Todo tipo pode ter calquera contido.