# Guia para agentes

Contexto y decisiones que un agente necesita antes de tocar este repositorio.

## Costo de integración continua

**Esto no es una preferencia de estilo: es un presupuesto que ya se agotó, y con
consecuencias.** La organización `dleonsystem` incluye **3 000 minutos de Actions al
mes para todos sus repositorios privados juntos**. En agosto de 2026 se agotó el día
11, y el **15 de agosto el gasto alcanzó el tope configurado y GitHub detuvo Actions
en los 51 repositorios**. Durante horas no hubo integración continua en ninguno: los
trabajos fallaban al arrancar, sin ejecutar un solo paso y sin registro.

La causa no fue verificar de más. Fue **repetir trabajo idéntico sin cachear** y
**medir dos veces el mismo commit**.

### Reglas al escribir o modificar un flujo

1. **Caché de dependencias.** `cache: npm` en `setup-node`, `cache: pip` en
   `setup-python`, y `actions/cache` para NuGet (`~/.nuget/packages`) y para los
   navegadores de Playwright (`~/.cache/ms-playwright`). La clave cuelga del archivo
   que fija las versiones, para que se invalide sola cuando cambian y no antes.
   **Nunca `--no-cache-dir`.**

2. **Filtro de rutas.** Como mínimo `paths-ignore` para `**/*.md` y la carpeta de
   documentación. Un cambio que no puede romper el código no debe levantar el
   pipeline. El filtro es acumulativo por commit: si toca documentación **y** código,
   la corrida se ejecuta igual.

3. **Un flujo por área.** GitHub filtra por ruta a nivel de **flujo**, no de job. Si
   el repositorio tiene áreas independientes, van en archivos separados. Evita
   acciones de terceros para gatear jobs: meten una dependencia externa en la
   compuerta de calidad.

4. **Concurrencia.** `cancel-in-progress` en ramas de trabajo. **Nunca** en las ramas
   de promoción: ahí cada commit necesita su propio veredicto para la trazabilidad.

5. **Un evento por commit.** Si una rama dispara por `push` y además tiene una PR
   abierta, el mismo árbol se mide dos veces. Deja el `push` sólo en las ramas de
   promoción.

6. **Ejecutores.** Sólo `ubuntu-latest`. Windows cuesta 2× y macOS 10×.

7. **Retención de artefactos** entre 5 y 7 días. El valor por omisión es 90.

8. **Un flujo que falla siempre no protege de nada** y sí gasta minutos. Si lleva
   semanas en rojo, arréglalo o desactívalo; no lo dejes como adorno.

El flujo `validar-flujos.yml` comprueba estas reglas en cada entrega que toque
`.github/workflows/`, y sólo sobre los flujos que esa entrega modifica. Cada regla se
puede eximir por archivo declarando el motivo; la sintaxis está en la cabecera del
propio flujo.

### Lo que se midió después de aplicarlas

Medición real sobre corridas de producción, no estimaciones:

| Repositorio | Antes | Después | Cambio |
|---|---|---|---|
| `lionsystems-quotation-tool` | 6.6 min | 2.6 min | **−61 %** |
| `py-sep` (compuerta de backend) | 4.1 min | 1.6 min | **−61 %** |
| `lga_legajo` (laboratorio) | 14.4 min | 12.7 min | **−11 %** |

**La lección, y es la que más importa: cachear ayuda cuando el tiempo se va en
descargar, y no ayuda cuando se va en ejecutar.**

En el laboratorio de `lga_legajo` el desglose por paso mostró que el **76 % del tiempo
son los bloques de evidencia ejecutándose**; instalar clientes y levantar Docker suman
61 segundos de 754. Las cachés no podían tocar el resto, y el ahorro real vino de otro
lado: **reducir el número de corridas**, de unas dieciséis diarias a cuatro.

De ahí una regla práctica: **antes de cachear, mide en qué se va el tiempo.** El
desglose por paso de una corrida cualquiera lo dice en un minuto:

```bash
gh api "/repos/OWNER/REPO/actions/runs/RUN_ID/jobs" \
  --jq '.jobs[] | .steps[] | select(.completed_at != null) |
        "\(.name)|\(.started_at)|\(.completed_at)"'
```

Si el grueso está en instalar, cachea. Si está en ejecutar, lo que sobra son
**corridas**, no segundos: revisa disparadores y filtros de ruta.

### Antes de fusionar un flujo nuevo, mídelo

```bash
# Corridas del mes, por flujo y resultado
gh api "/repos/OWNER/REPO/actions/runs?created=>=2026-08-01&per_page=100" \
  --jq '.workflow_runs[] | "\(.name)|\(.event)|\(.conclusion)"' | sort | uniq -c

# Factura real de la organización, por repositorio
gh api "/organizations/dleonsystem/settings/billing/usage?year=2026&month=8"
```

### Dos trampas que costaron horas

**Un despliegue que informa éxito no garantiza que el cambio se haya aplicado.** Con
`FailureAction=rollback`, `docker service update` imprime «converged» y devuelve
código 0 después de revertir. Verifica siempre **el valor efectivo**, no la salida del
comando.

**Cuando el presupuesto se agota, los fallos mienten.** Los trabajos aparecen en rojo
con cero pasos ejecutados y sin registro, lo que se parece mucho a un fallo de
configuración. Si algo falla a la vez en varios repositorios, mira la factura antes de
depurar el código.
