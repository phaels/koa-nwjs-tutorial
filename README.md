# 🚀 Koa.js NW.js Desktop App Tutorial

<img width="1219" height="1144" alt="Bildschirmfoto_20251030_192744" src="https://github.com/user-attachments/assets/fc668efc-7796-4727-863a-cdbb66261264" />

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)
![NW.js](https://img.shields.io/badge/NW.js-latest-orange.svg)
![Koa.js](https://img.shields.io/badge/koa.js-2.x-green.svg)
![Bootstrap](https://img.shields.io/badge/bootstrap-5.3-purple.svg)

**Eine vollständige plattformübergreifende Desktop-Anwendung mit Node.js, Koa.js, EJS und Bootstrap**

[Features](#-features) • [Installation](#-installation) • [Verwendung](#-verwendung) • [Spenden](#-spenden) • [Lizenz](#-lizenz)

</div>

---

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Voraussetzungen](#-voraussetzungen)
- [Installation](#-installation)
- [Projektstruktur](#-projektstruktur)
- [Entwicklung](#-entwicklung)
- [Build & Distribution](#-build--distribution)
- [Konfiguration](#-konfiguration)
- [API Dokumentation](#-api-dokumentation)
- [Troubleshooting](#-troubleshooting)
- [Spenden](#-spenden)
- [Contributing](#-contributing)
- [Lizenz](#-lizenz)

---

## ✨ Features

### 🖥️ **Plattformübergreifend**
Läuft nativ auf Windows, macOS und Linux

### ⚡ **Moderne Middleware-Architektur**
- **Koa.js Framework**: Minimalistisches, expressives Web-Framework
- **Async/Await Support**: Moderne asynchrone Programmierung
- **Kaskadierende Middleware**: Elegante Middleware-Verarbeitung

### 🎨 **Modernes UI Design**
- **Bootstrap 5.3**: Responsives, mobil-optimiertes Design
- **Bootstrap Icons**: 1800+ hochwertige SVG-Icons
- **jQuery 3.7**: Vereinfachte DOM-Manipulation

### 📄 **Template Engine**
- **EJS**: Dynamische HTML-Seiten mit Partials
- Wiederverwendbare Komponenten
- Server-seitiges Rendering

### 🌐 **CDN-basiert**
Alle Frontend-Bibliotheken via CDN - keine lokalen Dependencies

### 📦 **Desktop Integration**
- Native Desktop-Anwendung mit NW.js
- Chromium + Node.js in einer App
- Zugriff auf Betriebssystem-APIs

### 🗜️ **Portable Builds**
Erstelle eigenständige Executables für alle Plattformen

---

## 🔧 Voraussetzungen

Bevor du startest, stelle sicher, dass du folgendes installiert hast:

- **Node.js** (Version 18.x oder höher) - [Download](https://nodejs.org/)
- **npm** (wird mit Node.js installiert)
- **Git** (optional) - [Download](https://git-scm.com/)

### Node.js Version prüfen

```bash
node --version
npm --version
```

---

## 🚀 Installation

### Schritt 1: Projekt erstellen

```bash
mkdir koa-nwjs-tutorial
cd koa-nwjs-tutorial
mkdir -p views/pages views/partials public
```

## 📁 Projektstruktur

```
koa-nwjs-tutorial/
├── package.json
├── server.js
├── README.md
├── public/
├── views/
│   ├── pages/
│   │   ├── index.ejs
│   │   ├── about.ejs
│   │   └── 404.ejs
│   └── partials/
│       ├── head.ejs
│       ├── header.ejs
│       └── footer.ejs
└── build/
```

---

### Schritt 2: package.json erstellen

**package.json:**
```json
{
  "name": "bootstrap-nwjs-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "koa": "^2.15.3",
    "koa-router": "^12.0.1",
    "koa-views": "^7.0.2",
    "koa-static": "^5.0.0",
    "koa-logger": "^3.2.1",
    "ejs": "^3.1.9",
    "jquery": "*",
    "bootstrap": "*",
    "bootstrap-icons": "*"
  },
  "description": "Bootstrap NW.js Desktop Anwendung mit Koa.js",
  "node-main": "server.js",
  "main": "http://localhost:8080",
  "window": {
    "toolbar": true,
    "width": 1000,
    "height": 600,
    "resizable": true,
    "min_width": 800,
    "min_height": 600
  },
  "scripts": {
    "start": "nw .",
    "dev": "node server.js",
    "build:win": "nwbuild --mode=build --platforms win64 .",
    "build:mac": "nwbuild --mode=build --platforms osx64 .",
    "build:linux": "nwbuild --mode=build --platforms linux64 .",
    "build:all": "nwbuild --mode=build --platforms win64,osx64,linux64 ."
  },
  "author": "Martin Imle",
  "license": "MIT"
}
```

### Schritt 3: Dependencies installieren

```bash
npm install
```

### Schritt 4: Server erstellen

**server.js:**
```javascript
const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const serve = require('koa-static');
const logger = require('koa-logger');
const path = require('path');

const app = new Koa();
const router = new Router();

// Middleware
app.use(logger());

// Statische Dateien
app.use(serve(path.join(__dirname, 'public')));

// Template Engine
app.use(views(path.join(__dirname, 'views'), {
  extension: 'ejs',
  map: { ejs: 'ejs' }
}));

// Context erweitern
app.use(async (ctx, next) => {
  ctx.state.dev = process.env.NODE_ENV !== 'production';
  await next();
});

// Routen
router.get('/', async (ctx) => {
  await ctx.render('pages/index', {
    title: 'Home',
    active: 'home'
  });
});

router.get('/about', async (ctx) => {
  await ctx.render('pages/about', {
    title: 'Über',
    active: 'about'
  });
});

// API Beispiel
router.get('/api/status', async (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    framework: 'Koa.js'
  };
});

// Koa.js Features Demo Route
router.get('/api/koa-features', async (ctx) => {
  ctx.body = {
    features: [
      'Async/Await Support',
      'Kaskadierende Middleware',
      'Context Object',
      'Request/Response Wrapper',
      'Error Handling',
      'Modern ES6+ Syntax'
    ],
    middleware: [
      'koa-router - Routing',
      'koa-views - Template Engine',
      'koa-static - Static Files',
      'koa-logger - Logging'
    ]
  };
});

// Middleware Chain Demo
router.get('/demo/middleware', async (ctx, next) => {
  // Erste Middleware
  ctx.state.startTime = Date.now();
  console.log('🔄 Middleware 1 - Startzeit gesetzt');
  await next();
  
  // Nach der Response
  const duration = Date.now() - ctx.state.startTime;
  console.log(`⏱️  Request dauerte: ${duration}ms`);
}, async (ctx, next) => {
  // Zweite Middleware
  ctx.state.userAgent = ctx.headers['user-agent'];
  console.log('🔍 Middleware 2 - User Agent extrahiert');
  await next();
}, async (ctx) => {
  // Finale Handler
  ctx.body = {
    message: 'Koa.js Middleware Demo',
    features: 'Kaskadierende Middleware in Aktion',
    startTime: ctx.state.startTime,
    userAgent: ctx.state.userAgent,
    requestId: Math.random().toString(36).substr(2, 9)
  };
});

// 404 Handler
router.get('(.*)', async (ctx) => {
  ctx.status = 404;
  await ctx.render('pages/404', { title: '404 - Nicht gefunden' });
});

// Router anwenden
app.use(router.routes());
app.use(router.allowedMethods());

// Error Handling
app.on('error', (err, ctx) => {
  console.error('🚨 Server Error:', err);
});

// Graceful Shutdown
const closeGracefully = async (signal) => {
  console.log(`\n🛑 Received signal to terminate: ${signal}`);
  process.exit(0);
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

// Server starten
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('🚀 Koa.js Server erfolgreich gestartet!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server URL:     http://localhost:${PORT}`);
  console.log(`🌍 Network:        http://${HOST}:${PORT}`);
  console.log(`📊 Status:         Bereit für Verbindungen`);
  console.log(`⚡ Framework:      Koa.js mit Async/Await`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 Drücke Strg+C zum Beenden');
  console.log('');
});
```

### Schritt 5: Views erstellen

**views/partials/head.ejs:**
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Koa.js NW.js Desktop App Tutorial">
<meta name="author" content="Dein Name">
<title><%= title || 'Koa.js NW.js App' %> - Koa.js Desktop App</title>

<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- Bootstrap JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">

<style>
  .card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }
  
  .jumbotron {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .footer {
    background-color: #f8f9fa;
    border-top: 1px solid #dee2e6;
  }
  
  .feature-badge {
    font-size: 0.7rem;
  }
  
  .demo-section {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 2rem;
    margin: 2rem 0;
  }
</style>
```

**views/partials/header.ejs:**
```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="/">
      <i class="bi bi-lightning-charge-fill text-warning"></i> 
      Koa.js Desktop App
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link <%= active === 'home' ? 'active' : '' %>" href="/">
            <i class="bi bi-house-door"></i> Home
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link <%= active === 'about' ? 'active' : '' %>" href="/about">
            <i class="bi bi-info-circle"></i> Über
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/api/status" target="_blank">
            <i class="bi bi-activity"></i> API Status
          </a>
        </li>
      </ul>
      <div class="d-flex align-items-center">
        <span class="badge bg-success">
          <i class="bi bi-node-plus"></i> Koa.js v2
        </span>
      </div>
    </div>
  </div>
</nav>
```

**views/partials/footer.ejs:**
```html
<footer class="footer mt-auto py-4 bg-light">
  <div class="container">
    <div class="row">
      <div class="col-md-6 text-center text-md-start">
        <span class="text-muted">
          © <%= new Date().getFullYear() %> Koa.js NW.js Tutorial
        </span>
      </div>
      <div class="col-md-6 text-center text-md-end">
        <span class="text-muted">
          <i class="bi bi-node-plus text-success"></i> Modern & Expressive
        </span>
      </div>
    </div>
  </div>
</footer>
```

**views/pages/index.ejs:**
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <%- include('../partials/head'); %>
</head>
<body class="d-flex flex-column min-vh-100">
  
  <header>
    <%- include('../partials/header'); %>
  </header>
  
  <main class="container-fluid flex-grow-1 my-4">
    <!-- Hero Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="jumbotron p-5 rounded-3 shadow">
          <h1 class="display-3 fw-bold">
            <i class="bi bi-rocket-takeoff"></i> Willkommen!
          </h1>
          <p class="lead fs-4">
            Eine <strong>moderne</strong> NW.js Desktop-Anwendung mit <strong>Koa.js</strong> und EJS.
          </p>
          <hr class="my-4 border-light">
          <div class="alert alert-light border-0">
            <i class="bi bi-lightning fs-4"></i> 
            <strong>Framework-Vorteil:</strong> Koa.js bietet elegante Async/Await Middleware!
          </div>
          <a href="/about" class="btn btn-light btn-lg">
            <i class="bi bi-info-circle"></i> Mehr erfahren
          </a>
        </div>
      </div>
    </div>

    <!-- Koa.js Features Demo Section -->
    <div class="demo-section">
      <h2 class="text-center mb-4">
        <i class="bi bi-star-fill text-warning"></i> Koa.js Features Demo
      </h2>
      
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-list-check"></i> Koa.js Features
              </h5>
            </div>
            <div class="card-body">
              <div id="koaFeatures"></div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">
                <i class="bi bi-plug"></i> Middleware Demo
              </h5>
            </div>
            <div class="card-body">
              <button class="btn btn-outline-success mb-3" onclick="testMiddleware()">
                <i class="bi bi-play-circle"></i> Middleware Chain testen
              </button>
              <div id="middlewareResult"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">
                <i class="bi bi-cpu"></i> System Status
              </h5>
            </div>
            <div class="card-body">
              <div class="row" id="systemStatus">
                <div class="col-md-3 text-center">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Cards -->
    <div class="row g-4">
      <div class="col-md-4">
        <div class="card h-100 text-center shadow-sm">
          <div class="card-body">
            <i class="bi bi-node-plus display-1 text-success"></i>
            <h5 class="card-title mt-3">Koa.js Framework</h5>
            <p class="card-text text-muted">
              Modernes Web-Framework mit Async/Await Support und kaskadierender Middleware
            </p>
            <div class="badge bg-success feature-badge">Async/Await</div>
            <div class="badge bg-info feature-badge">Middleware</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 text-center shadow-sm">
          <div class="card-body">
            <i class="bi bi-bootstrap-fill display-1 text-primary"></i>
            <h5 class="card-title mt-3">Bootstrap 5.3</h5>
            <p class="card-text text-muted">
              Modernes, responsives Design mit Utility-First CSS und flexiblem Grid-System
            </p>
            <div class="badge bg-primary feature-badge">Responsive</div>
            <div class="badge bg-purple feature-badge">Modern</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 text-center shadow-sm">
          <div class="card-body">
            <i class="bi bi-window-desktop display-1 text-warning"></i>
            <h5 class="card-title mt-3">NW.js Desktop</h5>
            <p class="card-text text-muted">
              Plattformübergreifende Desktop-App mit Chromium und Node.js Integration
            </p>
            <div class="badge bg-warning feature-badge">Cross-Platform</div>
            <div class="badge bg-danger feature-badge">Native</div>
          </div>
        </div>
      </div>
    </div>
  </main>
  
  <footer>
    <%- include('../partials/footer'); %>
  </footer>

  <script>
    $(document).ready(function() {
      // Add hover effects
      $(".card").hover(
        function() { $(this).addClass('shadow'); },
        function() { $(this).removeClass('shadow'); }
      );
      
      // Load Koa.js features
      loadKoaFeatures();
      
      // Load system status
      loadSystemStatus();
    });

    async function loadKoaFeatures() {
      try {
        const response = await fetch('/api/koa-features');
        const data = await response.json();
        
        let featuresHtml = '<ul class="list-group list-group-flush">';
        data.features.forEach(feature => {
          featuresHtml += `<li class="list-group-item">
            <i class="bi bi-check-circle-fill text-success"></i> ${feature}
          </li>`;
        });
        featuresHtml += '</ul>';
        
        $('#koaFeatures').html(featuresHtml);
      } catch (error) {
        $('#koaFeatures').html('<div class="alert alert-danger">Fehler beim Laden der Features</div>');
      }
    }

    async function testMiddleware() {
      try {
        const response = await fetch('/demo/middleware');
        const data = await response.json();
        
        const resultHtml = `
          <div class="alert alert-success">
            <h6><i class="bi bi-check-circle"></i> Middleware Demo erfolgreich!</h6>
            <small>
              <strong>Request ID:</strong> ${data.requestId}<br>
              <strong>Dauer:</strong> ${Date.now() - data.startTime}ms<br>
              <strong>User Agent:</strong> ${data.userAgent.substring(0, 50)}...
            </small>
          </div>
        `;
        
        $('#middlewareResult').html(resultHtml);
      } catch (error) {
        $('#middlewareResult').html('<div class="alert alert-danger">Fehler beim Testen der Middleware</div>');
      }
    }

    async function loadSystemStatus() {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        const statusHtml = `
          <div class="row text-center">
            <div class="col-md-3 mb-3">
              <div class="card bg-light">
                <div class="card-body">
                  <i class="bi bi-cpu-fill display-6 text-primary"></i>
                  <h6>Memory</h6>
                  <span class="badge bg-info">${Math.round(data.memory.heapUsed / 1024 / 1024)} MB</span>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card bg-light">
                <div class="card-body">
                  <i class="bi bi-clock-fill display-6 text-success"></i>
                  <h6>Uptime</h6>
                  <span class="badge bg-success">${Math.round(data.uptime)}s</span>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card bg-light">
                <div class="card-body">
                  <i class="bi bi-check-circle-fill display-6 text-warning"></i>
                  <h6>Status</h6>
                  <span class="badge bg-warning">${data.status}</span>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card bg-light">
                <div class="card-body">
                  <i class="bi bi-node-plus display-6 text-danger"></i>
                  <h6>Framework</h6>
                  <span class="badge bg-danger">${data.framework}</span>
                </div>
              </div>
            </div>
          </div>
        `;
        
        $('#systemStatus').html(statusHtml);
      } catch (error) {
        $('#systemStatus').html('<div class="alert alert-danger">Fehler beim Laden des Systemstatus</div>');
      }
    }
  </script>
</body>
</html>
```

**views/pages/about.ejs:**
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <%- include('../partials/head'); %>
</head>
<body class="d-flex flex-column min-vh-100">
  
  <header>
    <%- include('../partials/header'); %>
  </header>
  
  <main class="container flex-grow-1 my-4">
    <div class="row">
      <div class="col-lg-8">
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-primary text-white">
            <h2 class="mb-0">
              <i class="bi bi-info-circle-fill"></i> Über diese Anwendung
            </h2>
          </div>
          <div class="card-body">
            <h4 class="mb-3">Koa.js NW.js Desktop App Tutorial</h4>
            <p class="lead">
              Eine <strong>moderne</strong> plattformübergreifende Desktop-Anwendung mit expressiven Web-Technologien.
            </p>
            
            <h5 class="mt-4 mb-3">
              <i class="bi bi-tools"></i> Technologie-Stack
            </h5>
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>Node.js:</strong> JavaScript-Laufzeitumgebung
                </span>
                <span class="badge bg-success rounded-pill">v18+</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>Koa.js:</strong> Modernes Web-Framework von Express-Erstellern
                </span>
                <span class="badge bg-primary rounded-pill">v2.15</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>EJS:</strong> Template-Engine für dynamisches HTML
                </span>
                <span class="badge bg-info rounded-pill">v3.1</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>Bootstrap:</strong> CSS-Framework für responsives Design
                </span>
                <span class="badge bg-purple rounded-pill">v5.3</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>NW.js:</strong> Desktop-App-Wrapper (Chromium + Node.js)
                </span>
                <span class="badge bg-danger rounded-pill">latest</span>
              </li>
            </ul>
            
            <h5 class="mt-4 mb-3">
              <i class="bi bi-lightning"></i> Koa.js Vorteile
            </h5>
            <div class="row">
              <div class="col-md-6">
                <ul class="list-unstyled">
                  <li><i class="bi bi-check text-success"></i> Async/Await First</li>
                  <li><i class="bi bi-check text-success"></i> Kaskadierende Middleware</li>
                  <li><i class="bi bi-check text-success"></i> Elegante Error Handling</li>
                </ul>
              </div>
              <div class="col-md-6">
                <ul class="list-unstyled">
                  <li><i class="bi bi-check text-success"></i> Minimalistischer Core</li>
                  <li><i class="bi bi-check text-success"></i> Context-basiert</li>
                  <li><i class="bi bi-check text-success"></i> Hohe Performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4">
        <!-- System Info -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-secondary text-white">
            <h5 class="mb-0">
              <i class="bi bi-laptop"></i> System-Info
            </h5>
          </div>
          <div class="card-body">
            <table class="table table-sm">
              <tbody>
                <tr>
                  <td><strong>Version:</strong></td>
                  <td>1.0.0</td>
                </tr>
                <tr>
                  <td><strong>Lizenz:</strong></td>
                  <td>MIT</td>
                </tr>
                <tr>
                  <td><strong>Server:</strong></td>
                  <td>Koa.js</td>
                </tr>
                <tr>
                  <td><strong>Port:</strong></td>
                  <td>8080</td>
                </tr>
                <tr>
                  <td><strong>Framework:</strong></td>
                  <td><span class="badge bg-success">Koa.js v2</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Koa.js Middleware Info -->
        <div class="card shadow-sm">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">
              <i class="bi bi-diagram-3"></i> Middleware Flow
            </h5>
          </div>
          <div class="card-body">
            <ol class="small">
              <li>Request Logging</li>
              <li>Static File Serving</li>
              <li>Template Engine</li>
              <li>Context Extension</li>
              <li>Router Handling</li>
              <li>Response Sending</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </main>
  
  <footer>
    <%- include('../partials/footer'); %>
  </footer>
</body>
</html>
```

**views/pages/404.ejs:**
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <%- include('../partials/head'); %>
</head>
<body class="d-flex flex-column min-vh-100">
  
  <header>
    <%- include('../partials/header'); %>
  </header>
  
  <main class="container flex-grow-1 my-4 text-center">
    <div class="row">
      <div class="col-12">
        <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
        <h1 class="display-1 fw-bold">404</h1>
        <h2>Seite nicht gefunden</h2>
        <p class="lead">Die angeforderte Seite existiert nicht.</p>
        <a href="/" class="btn btn-primary btn-lg mt-3">
          <i class="bi bi-house"></i> Zur Startseite
        </a>
      </div>
    </div>
  </main>
  
  <footer>
    <%- include('../partials/footer'); %>
  </footer>
</body>
</html>
```

---

## 💻 Entwicklung

### Development Server starten

```bash
npm run dev
```

Öffne dann deinen Browser unter: **http://localhost:8080**

### Als Desktop-App testen

```bash
npm install -g nw
npm start
```

---

## 📦 Build & Distribution

### Builds erstellen

```bash
# Windows Build
npm run build:win

# macOS Build  
npm run build:mac

# Linux Build
npm run build:linux

# Alle Plattformen
npm run build:all
```

---

## 💝 Spenden

Wenn dir dieses Tutorial geholfen hat und du meine Arbeit unterstützen möchtest, würde ich mich über eine Spende freuen:

**PayPal:** m.imle@gmx.net

[![PayPal Spenden](https://www.paypalobjects.com/de_DE/DE/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=DEINE_BUTTON_ID)

Jede Spende, egal wie klein, hilft mir, weitere Tutorials und Projekte zu erstellen. Vielen Dank für deine Unterstützung! ❤️

---

## 📄 Lizenz

MIT License

---

<div align="center">

**⭐ Wenn dir dieses Projekt gefällt, gib ihm einen Stern auf GitHub! ⭐**

Made with ❤️ and ⚡ Koa.js

</div>
