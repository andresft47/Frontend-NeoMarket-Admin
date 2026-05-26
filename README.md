# NeoMarket - Frontend Administrador

Este es el frontend del proyecto **NeoMarket - Administrador**, la interfaz dedicada para la gestión comercial, control de inventario y análisis predictivo del negocio. Está construido utilizando tecnologías modernas para garantizar un rendimiento óptimo y una experiencia de usuario del más alto nivel con un sistema de diseño premium.

## 🚀 Tecnologías y Dependencias

El panel de administración utiliza `npm` para gestionar sus dependencias. Las principales herramientas son:
- **React (v18)**: Librería principal para construir la interfaz de usuario interactiva y reactiva.
- **Vite (v5/v6)**: Entorno de desarrollo ultrarrápido y empaquetador moderno de última generación.
- **Recharts**: Biblioteca de visualización de datos moderna para el análisis del negocio (Gráficos interactivos de ventas, métodos de pago y productos más vendidos).
- **Vanilla CSS**: Estilos premium personalizados a medida (`App.css` y `index.css`) con variables globales de diseño, paletas de colores sofisticadas, sombras premium, bordes redondeados y micro-animaciones (libre de emojis genéricos).
- **React Router DOM**: Para el enrutamiento protegido y la navegación fluida entre los paneles del administrador.
- **Axios**: Cliente HTTP para consumir los servicios del backend REST en Spring Boot.

## ⚙️ Configuración y Despliegue

La configuración principal se encuentra en los siguientes archivos:
- **`vite.config.js`**: Configuración del servidor de desarrollo de Vite.
  - **Puerto de desarrollo:** Configurado explícitamente en el puerto **`5174`** (`http://localhost:5174`).
  - **Proxy de API:** Redirecciona de manera automática todas las peticiones con prefijo `/api` al backend de Spring Boot en `http://localhost:8080`, asegurando que no haya problemas de CORS ni configuraciones manuales de red durante el desarrollo.

## 🖥️ Módulos Disponibles en el Panel

1. **📊 Panel de Control (Dashboard)**: Indicadores de estado KPI (Ventas de Hoy, Ventas del Mes, Clientes Activos, Alertas de Stock) y gráficos interactivos en tiempo real (evolución de ventas, top 5 de productos más vendidos y distribución de métodos de pago).
2. **🛍️ Historial de Compras**: Registro histórico completo de transacciones. Permite filtrar dinámicamente por rango de fechas mediante un selector calendario moderno con iconos vectoriales, ver detalles facturados y exportar reportes en formatos PDF y Excel.
3. **📦 Control de Inventario**: Gestión integral del catálogo de productos, semáforos visuales de stock, cálculo de márgenes de ganancia y alertas automáticas de seguridad por stock bajo.
4. **📋 Pedidos Sugeridos**: Módulo de abastecimiento inteligente que calcula automáticamente la cantidad óptima a pedir basado en la rotación del inventario.
5. **🔮 Predicciones de Clientes**: Análisis avanzado del comportamiento del cliente y hábitos de consumo recurrentes para la toma de decisiones comerciales.

## 🛠️ Cómo Ejecutar el Proyecto Localmente

Para correr el frontend del administrador necesitas tener instalado **Node.js** (versión 18 o superior) y tener el backend de Spring Boot (`localhost:8080`) en ejecución.

1. **Abre tu terminal** y asegúrate de estar en la carpeta `frontend_Admin`.
2. **Instala las dependencias** (solo es necesario la primera vez o si se agregan nuevas librerías):
   ```bash
   npm install
   ```
3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
4. Abre en tu navegador la dirección indicada en la consola: `http://localhost:5174`.

## 📦 Construcción para Producción

Para compilar y minificar el código listo para desplegar en un servidor de producción:
```bash
npm run build
```
Esto generará una carpeta `dist` optimizada en la raíz del subproyecto para su fácil distribución y hosting.
