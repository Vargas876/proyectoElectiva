# 🚗 Driver & Trip Management API

API RESTful tipo Uber para gestión de conductores y viajes con sistema de rating inteligente.

## 📋 Características

- ✅ CRUD completo para Conductores y Viajes
- 🔐 Autenticación JWT
- ⭐ Sistema de rating automático inteligente
- 📊 Análisis de factores de rating (clima, puntualidad, eficiencia)
- 📚 Documentación Swagger
- ☁️ Desplegado en la nube

## 🚀 Tecnologías

- **Backend:** Node.js + Express
- **Base de Datos:** MongoDB Atlas
- **Autenticación:** JWT
- **Documentación:** Swagger
- **Despliegue:** Vercel/Railway

## 📦 Instalación

```bash
git clone <tu-repo>
cd driver-trip-api
npm install
npm start
```

{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
