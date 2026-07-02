# Informe Técnico: Estrategias de Despliegue de Software

## Paso 1: Descripción Técnica y Contexto Ágil de Estrategias de Despliegue
A continuación, se describen las distintas estrategias de despliegue requeridas (all-in-once, rolling update, canary, blue-green), identificando sus características principales en un contexto ágil. 
1. Estrategia: All-in-Once (Recreación / Big Bang)
- Propósito y Mecanismo de Actualización: Su objetivo es sustituir la totalidad de la aplicación antigua por la nueva versión de manera simultánea. El mecanismo implica detener el tráfico de usuarios, dar de baja por completo la versión actual (generando downtime), desplegar la nueva versión en la misma infraestructura, y finalmente restaurar el acceso al público.
- Secuencia Típica: Corte de tráfico ➔ Apagado Versión A ➔ Instalación Versión B ➔ Pruebas de humo ➔ Reapertura de tráfico.
- Riesgos: Genera una interrupción obligatoria del servicio y, en caso de fallos, el tiempo de recuperación (rollback) es lento y de alto impacto operativo.
- Relación con Prácticas Ágiles: Es la estrategia menos compatible con metodologías ágiles. Al requerir ventanas de mantenimiento, imposibilita las entregas frecuentes. Retrasa el feedback de los usuarios y eleva drásticamente el riesgo de cada liberación, ya que se acumulan muchos cambios en un solo gran pase a producción.
2. Estrategia: Rolling Update (Actualización Progresiva)
- Propósito y Mecanismo de Actualización: Busca actualizar el software de manera gradual sin interrumpir el servicio. El mecanismo consiste en reemplazar progresivamente las instancias (como contenedores o pods) de la versión antigua por la nueva. El balanceador de carga redirige el tráfico a las nuevas instancias solo después de que estas superan sus pruebas de salud (health checks).
- Secuencia Típica: Levantar nodo Versión B ➔ Validar Health Check ➔ Enrutar tráfico a nodo B ➔ Apagar nodo Versión A ➔ Repetir hasta el 100%.
- Riesgos: Exige que ambas versiones coexistan en paralelo durante la actualización. Si la base de datos sufre cambios estructurales, puede haber problemas de compatibilidad (backward compatibility) entre la Versión A y B.
- Relación con Prácticas Ágiles: Facilita enormemente las entregas frecuentes al garantizar zero downtime. Reduce el riesgo operativo porque, si un nuevo contenedor falla, el proceso se detiene automáticamente, permitiendo al equipo reaccionar rápidamente antes de afectar a todo el clúster.
3. Estrategia: Blue-Green Deployment (Azul-Verde)
- Propósito y Mecanismo de Actualización: Su propósito es aislar el despliegue del tráfico en vivo para mitigar errores. Funciona manteniendo dos entornos de infraestructura idénticos: el entorno "Blue" atiende a los usuarios actuales, mientras la nueva versión se instala en el entorno "Green". El mecanismo clave es el cambio de enrutamiento a nivel de red (DNS o Load Balancer) de un entorno al otro de forma instantánea.
-  Secuencia Típica: Despliegue en Green ➔ Pruebas QA en Green ➔ Conmutación total de tráfico (Switch) de Blue a Green ➔ Monitoreo.
-  Riesgos: Requiere duplicar temporalmente los costos de infraestructura y presenta desafíos complejos en la sincronización de transacciones en curso de la base de datos justo en el momento del cambio de tráfico.
-    Relación con Prácticas Ágiles: Ofrece una reducción de riesgo inigualable, ya que el equipo obtiene feedback rápido y real en un entorno idéntico a producción antes de que los clientes lo vean. Si algo falla tras la liberación, el rollback es inmediato, lo que da confianza para realizar entregas extremadamente frecuentes.
4. Estrategia: Canary Deployment (Despliegue Canario)
- Propósito y Mecanismo de Actualización: Diseñada para probar la nueva versión con tráfico real antes del despliegue masivo. El mecanismo introduce la nueva versión junto a la antigua, pero el balanceador de carga desvía solo un pequeño porcentaje de usuarios (ej. 5%) hacia la novedad.
-  Secuencia Típica: Despliegue de Versión B ➔ Enrutar 5% de usuarios reales a Versión B ➔ Analizar métricas y errores ➔ Escalar gradualmente al 25%, 50% y 100%.
-  Riesgos: Exige alta madurez técnica, telemetría avanzada y reglas de enrutamiento complejas (Service Mesh o Application Load Balancers) para monitorear el comportamiento de ese pequeño porcentaje.
-   Relación con Prácticas Ágiles: Es la máxima representación del feedback rápido. Permite validar hipótesis de negocio directamente con los clientes. Minimiza radicalmente el riesgo, ya que un error crítico solo afectará a una fracción minúscula de los usuarios (reducción del radio de impacto), alineándose perfectamente con la experimentación ágil.
5. Comparación Explícita entre Estrategias
Para comprender su correcta aplicación, es vital no confundir los enfoques de cada estrategia:  - Disponibilidad: Mientras que All-in-Once asume que los cortes de servicio son aceptables, Rolling Update, Blue-Green y Canary están diseñadas específicamente para evitar el downtime.
- Gestión de la Capacidad (Rolling vs. Blue-Green): Rolling Update reemplaza gradualmente los componentes dentro de la misma infraestructura, optimizando costos. Por el contrario, Blue-Green duplica físicamente toda la capacidad del entorno para asegurar un cambio instantáneo y seguro.
- Gestión del Riesgo (Rolling vs. Canary): Aunque ambas son graduales, su enfoque es distinto. Rolling Update se centra en la estabilidad de la infraestructura (nodo por nodo), mientras que Canary se enfoca puramente en segmentar a los usuarios reales para obtener métricas de negocio y comportamiento antes de comprometer a toda la base de clientes. 

## Paso 2: Análisis Comparativo de Variables Críticas 
Este apartado evalúa en profundidad el impacto operativo, técnico y financiero de las cuatro estrategias de despliegue (all-in-once, rolling update, blue-green y canary) sobre las cuatro variables críticas establecidas en la rúbrica: uptime, facilidad y velocidad de rollback, costo operativo y de infraestructura, y velocidad de despliegue. A continuación, se presenta un análisis detallado complementado con escenarios reales de la industria y una matriz comparativa integral.  
1. Análisis Detallado por Variable Crítica
A. Uptime / Disponibilidad del Servicio
La disponibilidad del servicio determina la continuidad del negocio y el cumplimiento de los Acuerdos de Nivel de Servicio (SLA). El impacto de cada estrategia varía radicalmente:
- All-in-Once: Presenta un impacto crítico y negativo en el uptime. Al requerir la baja por completo de la versión actual para instalar la nueva versión, rompe la disponibilidad de manera inmediata.
   - Escenario Real: En una plataforma de gestión de pedidos, aplicar este enfoque durante horas de alta transaccionalidad detendría por completo la entrada de ingresos y degradaría la confianza del cliente.
- Rolling Update: Mantiene una alta disponibilidad (Zero Downtime). El orquestador de contenedores (como Amazon ECS o EKS) actualiza los nodos o pods de manera escalonada, asegurando que el balanceador de carga redirija el tráfico únicamente a las instancias que han superado con éxito las pruebas de salud (health checks).
- Blue-Green Deployment: Garantiza una disponibilidad del 100%. Debido a que la nueva versión ya está completamente desplegada y operativa en un entorno aislado ("Green"), la conmutación de los usuarios se realiza mediante un cambio en las reglas del balanceador de carga o del DNS de forma instantánea.
-  Canary Deployment: Ofrece un control excepcional de la disponibilidad. Protege al 95% o 90% de la base de usuarios de posibles fallos no detectados en ambientes de prueba, aislando la nueva versión a un porcentaje minúsculo de tráfico real.
 ---
B. Impacto y Facilidad de Rollback
El rollback es la capacidad de revertir de forma segura la infraestructura a un estado estable anterior ante un fallo crítico en producción. 
- All-in-Once: El proceso de retorno es altamente complejo, manual y lento. Si la nueva versión experimenta un error de ejecución, se debe repetir el ciclo completo a la inversa: detener el tráfico, desinstalar la versión defectuosa, reinstalar el artefacto anterior y volver a levantar el servicio, prolongando el tiempo medio de reparación (MTTR).
-  Rolling Update: El rollback está automatizado pero es progresivo. El orquestador invierte la secuencia de actualización, reemplazando los contenedores nuevos por los antiguos. El inconveniente técnico radica en que el proceso toma tiempo, lo que significa que un subgrupo de usuarios continuará experimentando errores hasta que finalice la sustitución completa.
-  Blue-Green Deployment: Representa el estándar de oro en simplicidad y velocidad de rollback. Como el entorno original ("Blue") permanece intacto y encendido en paralelo, revertir el cambio es tan rápido como volver a conmutar el balanceador de carga hacia el entorno antiguo, resolviendo la incidencia en cuestión de segundos.
-   Canary Deployment: Proporciona un mecanismo de rollback inmediato y de bajísimo impacto operativo. Al detectar anomalías en la telemetría del grupo canario (por ejemplo, un aumento en los códigos de estado HTTP 5xx), el pipeline o el balanceador desvía automáticamente el tráfico de vuelta al entorno principal estable, limitando el radio de impacto a una fracción mínima de clientes.
---
C. Costo Operativo y de Infraestructura
La eficiencia financiera y la complejidad de la automatización son factores clave al evaluar la viabilidad de un pipeline de entrega continua.  
- All-in-Once: Es la opción con menor costo de infraestructura. No requiere duplicar recursos computacionales ni configurar lógica de red avanzada, operando siempre sobre la misma capacidad aprovisionada.
- Rolling Update: Mantiene un costo bajo-medio. Solo requiere un margen temporal de sobre-aprovisionamiento (configurado mediante parámetros como maxSurge en Kubernetes), permitiendo levantar contenedores adicionales antes de destruir los antiguos sin duplicar la infraestructura global.
- Blue-Green Deployment: Conlleva un costo financiero sumamente elevado. Exige mantener dos entornos idénticos en paralelo durante la ventana de despliegue, duplicando la cantidad de instancias, bases de datos réplica y costos de red asociados en el proveedor de nube.
-   Canary Deployment: Presenta un costo de infraestructura moderado, pero un alto costo operativo de ingeniería. Si bien el gasto en cómputo extra es mínimo (solo para las instancias canarias), requiere una inversión sustancial en herramientas de observabilidad, sistemas de enrutamiento avanzado (como un Service Mesh) y la configuración de pipelines con lógica condicional compleja.
---
D. Velocidad de DespliegueMide el tiempo transcurrido desde que se inicia la fase de entrega hasta que el 100% del tráfico interactúa con el nuevo código.
-   All-in-Once: Es técnicamente rápida en su ejecución directa (suponiendo que no ocurran fallos), pero suele ralentizarse en la práctica debido al estrés y exhaustividad de las pruebas previas por el temor a una caída total del servicio.
-   Rolling Update: Tiene una velocidad moderada-lenta. Está supeditada al tiempo que toman las instancias en iniciar, estabilizarse y aprobar secuencialmente los health checks establecidos antes de avanzar con el siguiente bloque de nodos.
-    Blue-Green Deployment: Velocidad de entrega alta. Aunque el despliegue inicial en el entorno Green se realice de forma pasiva, la propagación del cambio hacia los usuarios finales ocurre de manera instantánea en un solo movimiento de red.
-    Canary Deployment: Es la estrategia más lenta por diseño. La propagación del cambio está planificada para transcurrir a lo largo de horas o días, incrementando el flujo de tráfico de manera muy escalonada (ej. 5%, 10%, 25%, 50%, 100%) con el fin de recopilar datos estadísticos suficientes bajo escenarios de carga real.  
2. Matriz Comparativa de Ventajas y DesventajasA continuación, se sintetizan los trade-offs de cada enfoque técnico para facilitar una toma de decisiones alineada con los objetivos del negocio y de TI:

| Estrategia | Ventajas Clave | Limitaciones | Impacto Uptime | Rollback | Gasto Infra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **All-in-Once** | Simplicidad | Interrupción | Bajo | Manual | Muy Bajo |
| **Rolling Update** | Zero downtime | Compatibilidad BD | Alto | Automatizada | Bajo |
| **Blue-Green** | Rollback instantáneo | Duplica costos | Máximo | Inmediato | Muy Alto |
| **Canary** | Feedback real | Telemetría compleja | Excelente | Segura | Moderado |

## Paso 3: Selección Justificada para "TechMarket Orders"
Estrategia Seleccionada: Blue-Green Deployment.
La implementación de la estrategia Blue-Green es la única alternativa viable para un servicio transaccional crítico como el procesamiento de pedidos en línea ("TechMarket Orders"). A continuación, se detalla la justificación técnica, legal y de negocio que avala esta decisión arquitectónica frente a otras estrategias de despliegue continuo.  
---
1. Requerimientos Técnicos y Arquitectura CloudEl microservicio Orders requiere un diseño de alta tolerancia a fallos mediante el uso de contenedores expuestos a través de una API en un entorno cloud. Al utilizar Amazon Web Services (AWS), Blue-Green permite aislar las pruebas de la nueva versión (entorno Green) sin afectar la infraestructura de producción actual (entorno Blue). Integrando el despliegue con Infraestructura como Código (IaC), se pueden aprovisionar los contenedores y gestionar las conexiones seguras hacia la base de datos relacional en Amazon RDS. La conmutación del tráfico se realiza a nivel de red mediante un Application Load Balancer (ALB), lo que garantiza una transición imperceptible para el usuario final y un aislamiento total de la microarquitectura.
---
2. Restricciones Legales y OperacionalesEl procesamiento de compras en línea involucra datos transaccionales sensibles, lo que exige un estricto cumplimiento normativo (compliance), trazabilidad absoluta y respaldo de datos.
   - Continuidad del Servicio: La legislación de protección al consumidor y las normativas de comercio electrónico exigen niveles mínimos de servicio. Un corte temporal (All-in-once) o una caída parcial (Rolling update con errores no detectados) podría derivar en multas o demandas por transacciones fallidas.
   - Respaldo y Rollback: Ante cualquier anomalía de integridad de datos detectada post-despliegue, Blue-Green proporciona la capacidad técnica de revertir el tráfico hacia el entorno original en cuestión de segundos, protegiendo las bases de datos y garantizando la trazabilidad sin pérdida de información transaccional.
---
3. Condiciones de Negocio y Rentabilidad OperativaEl equipo de desarrollo necesita asegurar alta disponibilidad y mínimo impacto en usuarios frente al tráfico esperado. Aunque Blue-Green Deployment implica duplicar la infraestructura temporalmente, este trade-off financiero está plenamente justificado bajo la premisa de negocio: "Consumimos más recursos ahora para asegurar cero downtime".
   - SLA (Service Level Agreement): El negocio no puede permitirse ventanas de mantenimiento prolongadas. Mantener un SLA del 99.99% asegura que el flujo de ingresos no se detenga. El costo de aprovisionar capacidad duplicada temporal en AWS es marginal comparado con las pérdidas económicas y el daño reputacional que ocasionaría la caída del sistema de pedidos en un momento de alta demanda.
   - Agilidad: Permite al equipo de ingeniería operar de forma ágil, realizando entregas continuas sin temor a romper el entorno de producción.
Conclusión:
Blue-Green Deployment es la estrategia superior para "TechMarket Orders" porque transforma un evento de alto riesgo y estrés técnico en una simple operación de enrutamiento de red. Alinea las capacidades técnicas del cloud con las exigencias legales de continuidad, protegiendo los ingresos del negocio y garantizando una experiencia de usuario sin interrupciones. 
