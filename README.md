# TechMarket: Estandarización de Pipelines CI/CD

Este proyecto implementa una solución de Integración y Entrega Continua (CI/CD) para la empresa **TechMarket**, enfocada en la agilidad, seguridad y reutilización de componentes.

---

## 1. Diseño y Estandarización

Se ha establecido una estructura de carpetas estándar utilizando `.github/workflows/` para centralizar la automatización.

- **Dockerfile Multi-stage**: Optimiza el build de la aplicación Node.js, separando las dependencias de construcción de las de ejecución para generar imágenes más ligeras y seguras.
- **Versionamiento**: Se aplican buenas prácticas de etiquetado de imágenes para asegurar la consistencia en los despliegues.

---

## 2. Integración de Componentes Externos

Para agilizar el desarrollo y mejorar la seguridad, se integran las siguientes acciones de GitHub Marketplace:

- `actions/checkout@v4`: Para la gestión eficiente del código fuente.
- `actions/setup-node@v4`: Con soporte de caché para reducir tiempos de instalación.
- `aws-actions/configure-aws-credentials`: Para una gestión segura de identidades sin exponer secretos.

---

## 3. Parametrización y Reutilización

Las plantillas están diseñadas para ser flexibles y evitar la duplicidad de código:

- **Inputs de Workflow**: El pipeline de Kubernetes (`kubernetes.yml`) permite elegir la estrategia de despliegue (**Rolling, Canary, Blue-Green**) y el clúster de destino mediante parámetros.
- **Variables de Entorno**: El uso de `ARG` y `ENV` en el Dockerfile permite inyectar configuraciones (como el color de la app) en tiempo de ejecución.
- **Instalación reproducible**: Se utiliza `npm ci` en el pipeline para asegurar instalaciones consistentes basadas en `package-lock.json`.

---

## 4. Valor al Negocio (TechMarket)

- **Reducción de Errores**: La automatización de pruebas y auditorías (`npm test`, `npm audit`) minimiza fallos en producción.
- **Agilidad**: El uso de caché y plantillas reduce el "Time-to-Market" de nuevas funcionalidades.
- **Eficiencia Operativa**: Las estrategias de despliegue parametrizadas aseguran un **Zero Downtime**, permitiendo que la tienda de TechMarket esté siempre disponible para los clientes.

---

## 5. Uso de Plantillas Reutilizables

Las plantillas se encuentran en:

.github/workflows/

Inicialmente se consideró organizarlas en `.github/workflows/templates/`, sin embargo, debido a una limitación de GitHub Actions, los reusable workflows deben ubicarse directamente en la raíz de `.github/workflows/` para poder ser invocados mediante `uses:`.

Ejemplo de uso:

```yaml
jobs:
  build:
    uses: ./.github/workflows/template_build.yml
    with:
      node_version: "20"
      image_name: "techmarket-app"
