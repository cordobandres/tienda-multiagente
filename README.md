# 🛒 E-Commerce Multi-Agent Platform (Colombia)

Plataforma e-commerce impulsada por un sistema de **Agentes de IA autónomos** para asistencia de ventas, diseño adaptable, pruebas automatizadas y procesamiento de pagos con PSE / Nequi / Tarjetas vía Mercado Pago Colombia.

## 🤖 Sistema Multiagente

1. **Agente Frontend (UI Architect):** Personaliza la interfaz y componentes según la temática del negocio.
2. **Agente Backend & Pagos:** Maneja el carrito, stock e integración segura con Mercado Pago.
3. **Agente de Ventas ("Aura"):** Chatbot con IA que sugiere productos y aplica cupones dinámicos.
4. **Agente QA & Testing:** Simula y valida el flujo de compras e integración de API.

## 🚀 Tecnologías

* **Framework:** Next.js (App Router) + React + TypeScript
* **Estilos:** Tailwind CSS + Lucide Icons
* **Pasarela de Pago:** Mercado Pago Colombia (PSE, Nequi, Tarjetas)
* **Motor de IA:** Google Gemini API
* **Despliegue:** Vercel

## 📦 Instalación Local

```bash
# 1. Clonar repositorio
git clone [https://github.com/cordobandres/tienda-multiagente.git](https://github.com/cordobandres/tienda-multiagente.git)

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Iniciar servidor
npm run dev