# Informe de Remediación: Resiliencia en Despliegues para TechMarket

Este documento detalla las estrategias de remediación ante fallos en producción, diseñadas para asegurar la continuidad operativa de "TechMarket Orders".

## 1. Escenarios de Error por Estrategia (IL3.1)

A continuación, se identifican las contingencias críticas asociadas a cada estrategia de despliegue:

- **All-in-Once**: Fallo total durante el despliegue. El servicio queda inoperativo (100% downtime) hasta que se realice una intervención manual.
- **Rolling Update**: Inconsistencia de datos. Al coexistir instancias con versiones diferentes (v1 y v2), las transacciones de pedidos pueden fallar debido a cambios en la estructura de la base de datos no compatibles.
- **Canary**: Falla de enrutamiento o telemetría. Errores críticos que afectan a una fracción de usuarios, pero que pasan desapercibidos si la configuración del *Service Mesh* es incorrecta.
- **Blue-Green**: Error en la conmutación (Switch). Si el ALB falla al redirigir el tráfico hacia el entorno Green, el servicio puede quedar "colgado" o inaccesible para los clientes.

## 2. Tabla Comparativa de Mecanismos de Remediación (IL3.2)

Evaluación del impacto de las acciones correctivas sobre la disponibilidad y el costo:

| Mecanismo | Tiempo Recuperación (MTTR) | Costo Operativo | Impacto Disponibilidad |
| :--- | :--- | :--- | :--- |
| **Rollback** | Medio (Re-despliegue) | Bajo | Alta (Regresa a estado sano) |
| **Hotfix** | Alto (Requiere codificación) | Alto (Manual) | Variable (Degradación posible) |
| **Feature Toggle** | Instantáneo | Muy Bajo | Muy Alta (No requiere deploy) |
| **Re-despliegue** | Muy Alto | Bajo | Baja (Servicio caído) |

## 3. Diseño de Flujo de Remediación Integral (IL3.3)

Para "TechMarket Orders", implementamos un flujo de **auto-reparación (Auto-Healing)** basado en:

1.  **Detección**: Monitoreo mediante AWS CloudWatch sobre los códigos de estado HTTP 5xx del ALB.
2.  **Notificación**: Activación de una alarma que notifica vía Webhook hacia el Pipeline de GitHub.
3.  **Acción**: Ejecución automática del Workflow `remediacion.yml` que realiza un `kubectl rollout undo` para revertir al último entorno estable.
4.  **Verificación**: Ejecución de tests de salud automatizados para validar que el servicio recuperó su estado 200 OK.

## 4. Implementación del Pipeline de Remediación (IL3.4)

El siguiente workflow automatiza la corrección sin intervención humana:

```yaml
name: Remediación Automática (Rollback)
on:
  repository_dispatch:
    types: [trigger-rollback]

jobs:
  remediacion:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout código
        uses: actions/checkout@v4
      
      - name: Ejecutar Rollback
        run: |
          kubectl rollout undo deployment/techmarket-orders-blue
          
      - name: Verificar Estado
        run: |
          kubectl rollout status deployment/techmarket-orders-blue
          curl -f http://techmarket-orders-service/health || exit 1