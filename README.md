# Malla interactiva UMG

Proyecto estudiantil para explorar los planes de Electrónica y Sistemas y registrar el avance en el navegador. Los planes deben contrastarse con el pensum de la sede y la cohorte del estudiante.

## Ejecutar el proyecto

Usa Node.js 22.12 o superior y pnpm 10.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Para verificar tipos y compilar, ejecuta `pnpm exec tsc --noEmit` y `pnpm build`. El servidor donde publiques `dist/` debe servir `index.html` también para rutas como `/sistemas/malla` y `/electronica/avance`. El repositorio incluye `public/_redirects` para los alojamientos que reconocen ese formato.

## Incorporar una carrera

1. Crea un archivo en `src/data/` siguiendo el tipo `CareerConfig`. Usa un identificador y un prefijo de almacenamiento estables y únicos. Agrega el enlace de referencia, ciclos ordenados, cursos con créditos y prerrequisitos confirmados.
2. Importa la configuración en `src/data/curriculum.ts` y agrégala a `careerConfigs`. El selector, la vista previa y las rutas se generan desde ese catálogo.
3. Comprueba que los códigos no se repitan dentro del plan y que cada prerrequisito apunte a un curso anterior. Prueba la malla, el registro de notas y la separación del avance entre carreras.

El registro acepta notas de 0 a 100 con aprobación desde 61. Las notas de la implementación anterior aparecen como historial en la escala original de 0 a 500. El avance se guarda por carrera en el dispositivo y se puede reiniciar desde la malla o la pestaña de avance.
