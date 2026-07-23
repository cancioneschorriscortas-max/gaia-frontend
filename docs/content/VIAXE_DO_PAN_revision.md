# "A viaxe do pan" — borrador para revisión do director

> Entregable de contido do briefing `BRIEFING_CONTIDO_PAN.md`.
> **Nada disto está na base de datos.** Non se tocou Neo4j nin código.
> Ficheiro irmán: `docs/content/viaxe-do-pan-import.json` (listo para o Import do modo arquitecto).
>
> **O que hai que revisar aquí é a VOZ**, frase a frase. O resto (ids, tipos,
> relacións) xa está validado contra as regras do `/import`.

---

## 1. Auditoría previa (regra 0.5 do briefing) — LEE ISTO PRIMEIRO

O briefing pedía retos "tipo pregunta con 3 opcións". **Ese formato non existe no
modelo de datos de GAIA.** Foi o que atopei auditando o código real:

| Pregunta | Resposta atopada | Onde |
|---|---|---|
| Como se garda un reto? | Como **texto libre** nunha propiedade do propio nodo: `reto_primary_{idioma}`, `reto_secondary_{idioma}`, `reto_expert_{idioma}` | `PUT /nodo/:id` — [index.js:1406](file:///D:/gaia-backend/index.js) |
| Hai campo para as opcións ou para a resposta correcta? | **Non.** Só existen ademais `reto_bloqueado` (bool) e `reto_puntos` (número, por defecto 10) | `GET /nodo/:id` — index.js:1118-1137 |
| Como se corrixe? | **Avalíao a IA.** O alumno escribe nun `<textarea>` e o texto vai a `POST /avaliar-reto`, que llo pasa a Claude para que o puntúe | [RetoInteractivo.js:216](src/RetoInteractivo.js:216) e index.js:2336 |
| Pódense cargar polo `/import`? | **Non.** O `/import` só escribe `label_*`, `text_primary_*`, `text_secondary_*` e `text_expert_*`. Ignora calquera campo `reto_*` | index.js:2135-2145 |

**Consecuencias, e o que fixen:**

1. Os retos **NON van no JSON** (o import descartaríaos en silencio, que é peor que non poñelos).
   Van na sección 6 deste documento marcados **PENDENTE DE CARGA MANUAL** —
   cárganse desde o editor de nodos, que si escribe `reto_*`.
2. Mantiven o formato de 3 opcións **dentro do texto da pregunta**. Funciona:
   o neno le as opcións e escribe a súa resposta, e a IA avalíaa. Así respéitase
   a intención do briefing (imposible fallar con atención) sen inventar esquema.

---

## 2. Decisións do executor

- **Ids libres, sen sufixo.** Comprobei con `GET /nodos` (1.797 nodos) que
  `o_trigo`, `a_farina`, `a_masa` e `o_pan` **non existen**. Non fixo falla `_tut`.
- **`PERTENCE_A` → `gastronomia_galicia`** ("Gastronomía de Galicia", `constellation`),
  que existe e é a candidata clara. Os catro nodos cólganse dela.
- **Tipos de relación:** mantiven os tres que suxería o briefing. `PRODUCE`
  (trigo→fariña) e `PARTE_DE` (fariña→masa) son claros. En `a_masa TRANSFORMA o_pan`
  dubidei con `PRODUCE`, pero quedei con **TRANSFORMA** porque o interesante
  pedagoxicamente é o **cambio de estado** no forno, non o resultado.
- **Portais todos cara a nodos que existirán.** Puxen os catro apuntando dentro
  do propio lote (ver sección 5), para que ningún quede roto o día do import.
  Os portais que serían mellores —"muíño", "lévedo", "panadeiro/a"— apuntarían a
  nodos que **aínda non existen**; déixoos propostos ao final.
- **Sen media**, como pedía o punto 6 do briefing.

**Dous avisos sobre o import (non son erros meus, son do endpoint):**

- **`centro`:** o `/import` fai `nodo.centro || req.usuario.centro`. Como o
  fallback usa o centro de quen importa, **estes catro nodos quedarán etiquetados
  co teu centro** aínda que eu deixe o campo fóra. Se non queres iso, hai que
  baleirar `centro` a man despois, no editor.
- **`pt`:** os idiomas activos son `["gl","es","en","pt"]`, e o import crea os
  campos dos catro. Como o briefing só pedía tres, **os campos `_pt` quedarán
  baleiros**. Non rompe nada; anótoo por se queres portugués antes de importar.

---

## 3. Os catro nodos

### 1 · `o_trigo`

| | |
|---|---|
| **label_gl** | O trigo |
| **label_es** | El trigo |
| **label_en** | Wheat |

**text_primary_gl** *(63 palabras)*
> O trigo é unha herba alta que medra nos campos. No alto de cada talo hai unha
> espiga chea de grans pequeniños e duros. Cada gran garda dentro comida abondo
> para facer nacer outra planta. Cando o campo se volve dourado, é tempo de segar.
> Despois hai que separar os grans da palla e levalos a **moer**. E ao moelos nace
> algo branco.

`[portal: "moer" → a_farina]` — é o portal que pide o deseño (§3.3: *"moendo o trigo ↗"*).

**text_primary_es**
> El trigo es una hierba alta que crece en los campos. En lo alto de cada tallo hay
> una espiga llena de granos pequeñitos y duros. Cada grano guarda dentro comida
> suficiente para hacer nacer otra planta. Cuando el campo se vuelve dorado, es
> tiempo de segar. Después hay que separar los granos de la paja y llevarlos a
> moler. Y al molerlos nace algo blanco.

**text_primary_en**
> Wheat is a tall grass that grows in fields. At the top of each stalk there is an
> ear full of tiny, hard grains. Each grain holds enough food inside to make a new
> plant grow. When the field turns golden, it is time to harvest. Then the grains
> are separated from the straw and taken to be milled. And when they are milled,
> something white is born.

**text_secondary_gl**
> O trigo leva connosco uns dez mil anos: é unha das primeiras plantas que as
> persoas aprenderon a cultivar. En Galicia tamén se sementaron moito o centeo e o
> millo, porque aguantan mellor a chuvia e o frío. Por iso aquí houbo durante
> séculos pan de moitas cores.

**text_secondary_es**
> El trigo lleva con nosotros unos diez mil años: es una de las primeras plantas que
> las personas aprendieron a cultivar. En Galicia también se sembraron mucho el
> centeno y el maíz, porque aguantan mejor la lluvia y el frío. Por eso aquí hubo
> durante siglos pan de muchos colores.

**text_secondary_en**
> Wheat has been with us for about ten thousand years: it is one of the first plants
> people learned to farm. In Galicia, rye and maize were also widely sown, because
> they cope better with rain and cold. That is why bread here came in many colours
> for centuries.

---

### 2 · `a_farina`

| | |
|---|---|
| **label_gl** | A fariña |
| **label_es** | La harina |
| **label_en** | Flour |

**text_primary_gl** *(62 palabras)*
> A fariña é o po branco que sae de moer o gran de trigo. Antes as moas movíanse
> coa forza dun río ou do vento: por iso hai muíños á beira da auga. Se metes a man
> nun saco de fariña, escápache entre os dedos coma a area. Ela soa non sabe a case
> nada. Pero mestúraa con auga e terás **masa**.

`[portal: "masa" → a_masa]`

**text_primary_es**
> La harina es el polvo blanco que sale de moler el grano de trigo. Antes las muelas
> se movían con la fuerza de un río o del viento: por eso hay molinos a la orilla del
> agua. Si metes la mano en un saco de harina, se te escapa entre los dedos como la
> arena. Ella sola no sabe a casi nada. Pero mézclala con agua y tendrás masa.

**text_primary_en**
> Flour is the white powder you get from milling wheat grain. Long ago the millstones
> were turned by a river or by the wind: that is why mills stand beside the water. If
> you put your hand into a sack of flour, it slips through your fingers like sand. On
> its own it tastes of almost nothing. But mix it with water and you will have dough.

**text_secondary_gl**
> Dentro do gran hai amidón e unhas proteínas chamadas glute. O amidón é a comida
> gardada para a planta nova. O glute é o que fará que a masa estire sen romper, coma
> unha goma. Por iso non todas as fariñas serven para todo: cada unha ten a súa
> cantidade.

**text_secondary_es**
> Dentro del grano hay almidón y unas proteínas llamadas gluten. El almidón es la
> comida guardada para la planta nueva. El gluten es lo que hará que la masa estire
> sin romperse, como una goma. Por eso no todas las harinas sirven para todo: cada
> una tiene su cantidad.

**text_secondary_en**
> Inside the grain there is starch and some proteins called gluten. The starch is food
> stored for the new plant. The gluten is what lets dough stretch without tearing, like
> a rubber band. That is why not every flour works for everything: each one has its own
> amount.

---

### 3 · `a_masa`

| | |
|---|---|
| **label_gl** | A masa |
| **label_es** | La masa |
| **label_en** | Dough |

**text_primary_gl** *(62 palabras)*
> Xunta fariña e auga e terás masa. Amásaa un pouco e vólvese elástica, coma unha
> pelota branda. Agora engade o lévedo: un ser vivo pequeniño que come o azucre da
> fariña e solta burbullas de aire. Esas burbullas fan que a masa medre soa. Tápaa e
> agarda, porque o tempo tamén é un ingrediente. Cando estea gorda, xa pode ir ao
> **forno**.

`[portal: "forno" → o_pan]`

**text_primary_es**
> Junta harina y agua y tendrás masa. Amásala un poco y se vuelve elástica, como una
> pelota blanda. Ahora añade la levadura: un ser vivo pequeñito que come el azúcar de
> la harina y suelta burbujas de aire. Esas burbujas hacen que la masa crezca sola.
> Tápala y espera, porque el tiempo también es un ingrediente. Cuando esté gorda, ya
> puede ir al horno.

**text_primary_en**
> Put flour and water together and you have dough. Knead it a little and it turns
> stretchy, like a soft ball. Now add the yeast: a tiny living thing that eats the
> sugar in the flour and lets out bubbles of air. Those bubbles make the dough rise
> all by itself. Cover it and wait, because time is an ingredient too. When it is
> plump, it can go into the oven.

**text_secondary_gl**
> O lévedo é un fungo, parente afastado dos cogomelos, pero tan pequeno que non o ves.
> Ao comer o azucre solta gas e un pouco de alcohol; o gas queda preso na rede de
> glute e incha a masa. Se a deixas máis tempo en frío, sabe mellor: as burbullas
> fanse amodo.

**text_secondary_es**
> La levadura es un hongo, pariente lejano de las setas, pero tan pequeño que no lo
> ves. Al comer el azúcar suelta gas y un poco de alcohol; el gas queda atrapado en la
> red de gluten e hincha la masa. Si la dejas más tiempo en frío, sabe mejor: las
> burbujas se hacen despacio.

**text_secondary_en**
> Yeast is a fungus, a distant relative of mushrooms, but so small you cannot see it.
> As it eats the sugar it releases gas and a little alcohol; the gas is trapped in the
> gluten net and puffs the dough up. If you leave it longer in the cold, it tastes
> better: the bubbles form slowly.

---

### 4 · `o_pan`

| | |
|---|---|
| **label_gl** | O pan |
| **label_es** | El pan |
| **label_en** | Bread |

**text_primary_gl** *(59 palabras)*
> O forno quente cocea a masa. Por fóra dourase e faise crocante; por dentro, as
> burbullas quedan atrapadas e deixan buratos. Ese cheiro que enche a casa é o do pan
> acabado de facer. Do **gran** do campo ao pan da mesa hai moitas mans e moito tempo.
> Agora, cando comas unha rebanda, xa sabes a viaxe que fixo.

`[portal: "gran" → o_trigo]` — pecha o círculo e volve ao principio da viaxe.

**text_primary_es**
> El horno caliente cuece la masa. Por fuera se dora y se hace crujiente; por dentro,
> las burbujas quedan atrapadas y dejan agujeros. Ese olor que llena la casa es el del
> pan recién hecho. Del grano del campo al pan de la mesa hay muchas manos y mucho
> tiempo. Ahora, cuando comas una rebanada, ya sabes el viaje que hizo.

**text_primary_en**
> The hot oven bakes the dough. Outside it turns golden and crisp; inside, the bubbles
> stay trapped and leave holes. That smell filling the house is fresh bread. From the
> grain in the field to the bread on the table there are many hands and a lot of time.
> Now, when you eat a slice, you know the journey it made.

**text_secondary_gl**
> A codia é escura porque o lume xunta os azucres e as proteínas e crea sabores novos.
> En Galicia hai pans con nome propio, como o pan de Cea ou a bolla de Carballo, e case
> cada comarca ten o seu. Todos naceron do mesmo: gran, auga, tempo e lume.

**text_secondary_es**
> La corteza es oscura porque el fuego junta los azúcares y las proteínas y crea sabores
> nuevos. En Galicia hay panes con nombre propio, como el pan de Cea o la bolla de
> Carballo, y casi cada comarca tiene el suyo. Todos nacieron de lo mismo: grano, agua,
> tiempo y fuego.

**text_secondary_en**
> The crust is dark because heat joins the sugars and proteins and creates new flavours.
> In Galicia there are breads with names of their own, such as pan de Cea or bolla de
> Carballo, and nearly every district has one. They all come from the same things:
> grain, water, time and fire.

---

## 4. Relacións propostas (10)

**Cadea do proceso**

| Orixe | Tipo | Destino | context_gl |
|---|---|---|---|
| `o_trigo` | PRODUCE | `a_farina` | Ao moer o gran de trigo obtense fariña |
| `a_farina` | PARTE_DE | `a_masa` | A fariña é o ingrediente principal da masa |
| `a_masa` | TRANSFORMA | `o_pan` | No forno a masa transfórmase en pan |

**Orde pedagóxica** (`ANTES_DE`, encadeando os catro)

| Orixe | Destino |
|---|---|
| `o_trigo` | `a_farina` |
| `a_farina` | `a_masa` |
| `a_masa` | `o_pan` |

**Ancoraxe ao universo** — os catro `PERTENCE_A` → `gastronomia_galicia`.

Todas levan `context_gl`/`_es`/`_en` (Regra 7). `strength`: `high` na cadea e na
orde, `medium` nas ancoraxes (agás `o_pan`, `high`).

---

## 5. Portais

| Nodo | Palabra no texto | Destino | Estado |
|---|---|---|---|
| `o_trigo` | "moer" | `a_farina` | ✅ no lote |
| `a_farina` | "masa" | `a_masa` | ✅ no lote |
| `a_masa` | "forno" | `o_pan` | ✅ no lote |
| `o_pan` | "gran" | `o_trigo` | ✅ no lote (pecha o círculo) |

**Portais desexables que hoxe non se poden facer** (o nodo destino non existe):
"muíño" en `a_farina`, "lévedo" en `a_masa`, "panadeiro/a" en `o_pan`. As tres
palabras xa están nos textos, así que o día que existan eses nodos só hai que
marcalas. O de "panadeiro/a" encaixaría ademais coa revelación do soño de Oberón
(§3.3, parada 4).

---

## 6. Retos — ⚠️ PENDENTE DE CARGA MANUAL

**Non van no JSON.** O `/import` ignora os campos `reto_*` (ver sección 1).
Hai que pegalos no editor de nodos, campo **`reto_primary_gl`** de cada nodo.
Suxestión: `reto_puntos` = 10 (o defecto) e `reto_bloqueado` = false, para que
o neno os vexa sen ter que desbloquealos no tutorial.

**`o_trigo` → `reto_primary_gl`**
> Onde medra o gran do trigo?
> a) nas raíces, baixo terra
> b) na espiga, no alto do talo
> c) nas follas
>
> *(resposta: b)*

**`a_farina` → `reto_primary_gl`**
> Que hai que facerlle ao gran para convertelo en fariña?
> a) moelo
> b) cocelo no forno
> c) deixalo ao sol
>
> *(resposta: a)*

**`a_masa` → `reto_primary_gl`**
> Que fai o lévedo dentro da masa?
> a) póna dura
> b) solta burbullas que a fan medrar
> c) dálle cor
>
> *(resposta: b)*

**`o_pan` → `reto_primary_gl`**
> Por que ten buratos o pan por dentro?
> a) porque llos fan cun garfo antes de cocelo
> b) porque as burbullas quedaron atrapadas ao cocer
> c) porque a fariña xa ten buratos
>
> *(resposta: b)*

> **Nota:** a liña *(resposta: X)* é **para ti, non para o nodo** — non a pegues
> no campo. A corrección faina a IA en `/avaliar-reto` a partir do que escriba
> o neno, e as catro respostas están literalmente no `text_primary` do seu nodo.

---

## 7. Validación executada

Corrida contra a BD en local e contra as regras reais do `/import`:

- ✅ Os catro ids **non existen** na BD (comprobado sobre 1.797 nodos).
- ✅ `label_gl` en todos · `type` `concept` · `status` `draft` · `difficulty` `primary` · `relevance` `medium` · `universo` `gaia`.
- ✅ Os 5 tipos de relación usados (`PRODUCE`, `PARTE_DE`, `TRANSFORMA`, `ANTES_DE`, `PERTENCE_A`) están entre os 12 canónicos.
- ✅ Todos os extremos das relacións son nodos do lote ou existentes (`gastronomia_galicia`, verificado).
- ✅ `context_gl`/`_es`/`_en` en **todas** as relacións.
- ✅ Palabras do `text_primary_gl`: 63 · 62 · 62 · 59 (rango pedido: 40-70).
- ✅ Cero aparicións de "harina" en texto galego.

---

## 8. Que fago eu despois (recordatorio do briefing)

Revisas a voz aquí → axustas o que queiras → pegas o JSON no Import do modo
arquitecto → cargas os 4 retos a man no editor → creas a journey "A viaxe do pan"
no EditorRutas cos catro stops nesta orde → próbala como neno desde "A miña viaxe".
