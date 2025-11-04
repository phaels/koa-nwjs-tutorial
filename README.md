# 🚀 Koa.js + Handlebars.js NW.js Desktop App - Optimierte Version

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.x-brightgreen.svg)

**Schlanke, performante Desktop-Anwendung - 100% offline**

</div>

---

## 📋 Projektstruktur

```bash
koa-handlebars-app/
├── views/
│   ├── layouts/
│   │   └── main.hbs
│   ├── partials/
│   │   ├── header.hbs
│   │   └── footer.hbs
│   └── pages/
│       ├── index.hbs
│       ├── about.hbs
│       └── 404.hbs
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── vendor/
│       ├── jquery/
│       │   └── jquery.min.js
│       ├── bootstrap/
│       │   ├── css/
│       │   │   └── bootstrap.min.css
│       │   └── js/
│       │       └── bootstrap.bundle.min.js
│       └── bootstrap-icons/
│           ├── bootstrap-icons.css
│           └── fonts/
│               ├── bootstrap-icons.woff2
│               └── bootstrap-icons.woff
├── scripts/
│   └── setup-deps.js
├── server.js
├── package.json
└── .gitignore
```

---

## 📄 1. package.json

```json
{
  "name": "koa-handlebars-app",
  "version": "1.0.0",
  "description": "Performante Desktop App mit Koa.js & Handlebars",
  "main": "http://localhost:8080",
  "node-main": "server.js",
  "window": {
    "title": "Koa + Handlebars App",
    "width": 1200,
    "height": 800,
    "min_width": 800,
    "min_height": 600,
    "position": "center",
    "icon": "public/favicon.ico"
  },
  "scripts": {
    "start": "nw .",
    "dev": "node server.js",
    "setup": "node scripts/setup-deps.js"
  },
  "dependencies": {
    "koa": "^2.15.3",
    "koa-router": "^12.0.1",
    "koa-static": "^5.0.0",
    "koa-handlebars": "^1.0.1",
    "handlebars": "^4.7.8"
  },
  "keywords": ["koa", "handlebars", "nwjs", "desktop-app", "offline"],
  "author": "Martin Imle",
  "license": "MIT"
}
```

---

## 🔧 2. server.js - Optimierter Hauptserver

```javascript
const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const path = require('path');
const Handlebars = require('handlebars');
const fs = require('fs').promises;

const app = new Koa();
const router = new Router();
const PORT = 8080;

// Handlebars Helpers (kompakt)
const helpers = {
  eq: (a, b) => a === b,
  formatDate: (date) => new Date(date).toLocaleDateString('de-DE'),
  json: (obj) => JSON.stringify(obj, null, 2),
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1)
};

Object.entries(helpers).forEach(([name, fn]) => 
  Handlebars.registerHelper(name, fn)
);

// Template-Cache für Performance
const templateCache = new Map();
const partialsCache = new Map();

// Partials laden (einmalig beim Start)
async function loadPartials() {
  if (partialsCache.size > 0) return partialsCache;
  
  const partialsDir = path.join(__dirname, 'views/partials');
  try {
    const partialFiles = await fs.readdir(partialsDir);
    
    await Promise.all(partialFiles.map(async (file) => {
      if (file.endsWith('.hbs')) {
        const name = path.basename(file, '.hbs');
        const content = await fs.readFile(path.join(partialsDir, file), 'utf-8');
        Handlebars.registerPartial(name, content);
        partialsCache.set(name, content);
      }
    }));
  } catch (err) {
    console.warn('Partials konnten nicht geladen werden:', err.message);
  }
  
  return partialsCache;
}

// Optimierte Template-Rendering Funktion
async function renderTemplate(name, data = {}) {
  const cacheKey = name;
  
  // Partials sicherstellen
  await loadPartials();
  
  if (templateCache.has(cacheKey) && process.env.NODE_ENV === 'production') {
    const template = templateCache.get(cacheKey);
    return template(data);
  }

  const layoutPath = path.join(__dirname, 'views/layouts/main.hbs');
  const templatePath = path.join(__dirname, `views/pages/${name}.hbs`);
  
  const [layoutContent, templateContent] = await Promise.all([
    fs.readFile(layoutPath, 'utf-8'),
    fs.readFile(templatePath, 'utf-8')
  ]);

  const pageTemplate = Handlebars.compile(templateContent);
  const layoutTemplate = Handlebars.compile(layoutContent);
  
  const compiledTemplate = (data) => {
    const content = pageTemplate(data);
    return layoutTemplate({ ...data, body: content });
  };
  
  templateCache.set(cacheKey, compiledTemplate);
  return compiledTemplate(data);
}

// Security Middleware
app.use(async (ctx, next) => {
  // Security Headers
  ctx.set('X-Content-Type-Options', 'nosniff');
  ctx.set('X-Frame-Options', 'DENY');
  ctx.set('X-XSS-Protection', '1; mode=block');
  ctx.set('Strict-Transport-Security', 'max-age=31536000');
  
  await next();
});

// Static Files Middleware
app.use(serve(path.join(__dirname, 'public'), {
  maxAge: 86400000, // 1 day cache
  gzip: true
}));

// Context Middleware
app.use(async (ctx, next) => {
  ctx.state.year = new Date().getFullYear();
  ctx.state.appName = 'Koa + Handlebars';
  await next();
});

// Logger Middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
});

// Koa.js Feature Demo Routes
router.get('/koa-demo', async (ctx) => {
  ctx.body = {
    framework: 'Koa.js v2.15.3',
    features: [
      'Async/Await Middleware',
      'Cascading Context',
      'No Callback Hell',
      'Lightweight Core'
    ],
    middleware: [
      'ctx.request - Enhanced Request',
      'ctx.response - Enhanced Response',
      'ctx.state - Namespace for passing data',
      'ctx.throw - Error throwing'
    ]
  };
});

// Koa Context Demo
router.get('/context-demo', async (ctx) => {
  // Koa Context Features demonstrieren
  ctx.set('X-Koa-Demo', 'Context Feature Demo');
  
  ctx.body = {
    request: {
      method: ctx.method,
      url: ctx.url,
      originalUrl: ctx.originalUrl,
      origin: ctx.origin,
      href: ctx.href,
      path: ctx.path,
      query: ctx.query,
      querystring: ctx.querystring,
      search: ctx.search,
      host: ctx.host,
      hostname: ctx.hostname,
      fresh: ctx.fresh,
      stale: ctx.stale,
      idempotent: ctx.idempotent,
      socket: {
        remoteAddress: ctx.ip,
        remotePort: ctx.socket.remotePort
      },
      headers: ctx.headers
    },
    response: {
      status: ctx.status,
      message: ctx.message,
      body: ctx.body,
      length: ctx.length,
      type: ctx.type,
      lastModified: ctx.lastModified,
      etag: ctx.etag,
      headerSent: ctx.headerSent,
      writable: ctx.writable
    },
    state: ctx.state,
    app: {
      env: ctx.app.env,
      proxy: ctx.app.proxy,
      subdomainOffset: ctx.app.subdomainOffset
    }
  };
});

// Koa Router Features
const apiRouter = new Router({ prefix: '/api' });

apiRouter.get('/users', async (ctx) => {
  ctx.body = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
    { id: 3, name: 'Charlie', role: 'user' }
  ];
});

apiRouter.get('/users/:id', async (ctx) => {
  const users = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
    { id: 3, name: 'Charlie', role: 'user' }
  ];
  const user = users.find(u => u.id === parseInt(ctx.params.id));
  
  if (!user) {
    ctx.throw(404, 'User nicht gefunden');
  }
  
  ctx.body = user;
});

apiRouter.post('/users', async (ctx) => {
  // Simuliere User Creation
  ctx.status = 201;
  ctx.body = {
    id: Math.floor(Math.random() * 1000),
    name: ctx.request.body.name,
    role: 'user',
    createdAt: new Date().toISOString()
  };
});

// Haupt-Routen
router.get('/', async (ctx) => {
  ctx.type = 'html';
  ctx.body = await renderTemplate('index', {
    title: 'Home',
    active: 'home',
    features: [
      { name: 'Koa.js Middleware', icon: 'bi-layer-forward' },
      { name: 'Handlebars Templates', icon: 'bi-file-code' },
      { name: 'Bootstrap UI', icon: 'bi-bootstrap' },
      { name: 'jQuery Interactivity', icon: 'bi-lightning' }
    ]
  });
});

router.get('/about', async (ctx) => {
  ctx.type = 'html';
  ctx.body = await renderTemplate('about', {
    title: 'Über',
    active: 'about'
  });
});

// Koa Middleware Demo Route
router.get('/middleware-demo', async (ctx) => {
  ctx.type = 'html';
  ctx.body = await renderTemplate('middleware', {
    title: 'Koa Middleware',
    active: 'middleware'
  });
});

// API Routen (kompakt)
router.get('/api/status', async (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    framework: 'Koa.js v2.15.3',
    templateEngine: 'Handlebars v4.7.8',
    offline: true,
    koaFeatures: [
      'Async/Await Support',
      'Cascading Middleware',
      'Context Object',
      'Error Handling'
    ]
  };
});

router.get('/api/features', async (ctx) => {
  ctx.body = {
    koa: [
      'Async/Await Support',
      'Kaskadierende Middleware',
      'Context Object',
      'Error Handling'
    ],
    handlebars: [
      'Logic-less Templates',
      'Partials & Layouts',
      'Custom Helpers',
      'Template Caching'
    ],
    jquery: [
      'DOM Manipulation',
      'Event Handling',
      'AJAX Support',
      'Animations'
    ]
  };
});

router.get('/api/stack', async (ctx) => {
  ctx.body = [
    { name: 'Node.js', version: 'v18+', desc: 'JavaScript Runtime', icon: 'bi-diagram-3' },
    { name: 'Koa.js', version: 'v2.15.3', desc: 'Web Framework', icon: 'bi-lightning' },
    { name: 'Handlebars', version: 'v4.7.8', desc: 'Template Engine', icon: 'bi-file-code' },
    { name: 'Bootstrap', version: 'v5.3.3', desc: 'CSS Framework', icon: 'bi-bootstrap' },
    { name: 'jQuery', version: 'v3.7.1', desc: 'JS Library', icon: 'bi-gear' },
    { name: 'NW.js', version: 'latest', desc: 'Desktop Wrapper', icon: 'bi-window-desktop' }
  ];
});

// Koa Error Handling Demo
router.get('/error-demo', async (ctx) => {
  // Demo von Koa's Error Handling
  if (ctx.query.throw) {
    ctx.throw(400, 'Dies ist ein Demo-Fehler');
  }
  
  ctx.body = {
    message: 'Besuche /error-demo?throw=true um Error Handling zu sehen',
    features: [
      'ctx.throw(status, message)',
      'Automatic error propagation',
      'Custom error handling'
    ]
  };
});

// 404 Handler
app.use(async (ctx, next) => {
  await next();
  if (ctx.status === 404) {
    ctx.type = 'html';
    ctx.body = await renderTemplate('404', { 
      title: '404',
      path: ctx.path 
    });
  }
});

// Router anwenden
app.use(router.routes());
app.use(router.allowedMethods());
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Global Error Handling Middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: {
        status: ctx.status,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    };
    ctx.app.emit('error', err, ctx);
  }
});

// Error Event Handler
app.on('error', (err, ctx) => {
  console.error('Server Error:', err);
  if (ctx) {
    console.error('Fehler in Route:', ctx.method, ctx.url);
  }
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM empfangen, Server wird heruntergefahren...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT empfangen, Server wird heruntergefahren...');
  process.exit(0);
});

// Server starten
app.listen(PORT, () => {
  console.log('\n🚀 Server läuft auf http://localhost:' + PORT);
  console.log('📦 Offline-Modus: Aktiv');
  console.log('⚡ Koa.js Framework: Geladen');
  console.log('🎨 Handlebars Templates: Aktiv\n');
});
```

---

## 📦 3. scripts/setup-deps.js - Dependency Downloader

```javascript
const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('📦 Lade lokale Dependencies...\n');

const deps = [
  {
    url: 'https://code.jquery.com/jquery-3.7.1.min.js',
    path: 'public/vendor/jquery/jquery.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    path: 'public/vendor/bootstrap/css/bootstrap.min.css'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
    path: 'public/vendor/bootstrap/js/bootstrap.bundle.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css',
    path: 'public/vendor/bootstrap-icons/bootstrap-icons.css'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/fonts/bootstrap-icons.woff2',
    path: 'public/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ ${path.basename(dest)}`);
          resolve();
        });
      } else {
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

(async () => {
  try {
    for (const dep of deps) {
      await download(dep.url, dep.path);
    }
    
    // Bootstrap Icons CSS anpassen
    const cssPath = 'public/vendor/bootstrap-icons/bootstrap-icons.css';
    let css = fs.readFileSync(cssPath, 'utf8');
    css = css.replace(/src: url\("\.\/fonts\//g, 'src: url("/vendor/bootstrap-icons/fonts/');
    fs.writeFileSync(cssPath, css);
    
    console.log('\n🎉 Alle Dependencies geladen!');
  } catch (err) {
    console.error('❌ Fehler:', err.message);
  }
})();
```

---

## 🎨 4. views/layouts/main.hbs - Haupt-Layout

```handlebars
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{title}} - {{appName}}</title>
  
  <link href="/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link href="/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
  <link href="/css/style.css" rel="stylesheet">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">
</head>
<body class="d-flex flex-column min-vh-100">
  
  <header>{{> header}}</header>
  
  <main class="flex-grow-1">
    {{{body}}}
  </main>
  
  <footer>{{> footer}}</footer>

  <script src="/vendor/jquery/jquery.min.js"></script>
  <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="/js/app.js"></script>
</body>
</html>
```

---

## 🔝 5. views/partials/header.hbs

```handlebars
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" href="/">
      <i class="bi bi-window-desktop text-primary"></i> {{appName}}
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="nav">
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <a class="nav-link {{#if (eq active 'home')}}active{{/if}}" href="/">
            <i class="bi bi-house-door"></i> Home
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link {{#if (eq active 'about')}}active{{/if}}" href="/about">
            <i class="bi bi-info-circle"></i> Über
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link {{#if (eq active 'middleware')}}active{{/if}}" href="/middleware-demo">
            <i class="bi bi-gear"></i> Koa Demo
          </a>
        </li>
      </ul>
      <span class="badge bg-success"><i class="bi bi-wifi-off"></i> Offline</span>
    </div>
  </div>
</nav>
```

---

## 🔻 6. views/partials/footer.hbs

```handlebars
<footer class="footer mt-auto py-3 bg-light border-top">
  <div class="container text-center">
    <span class="text-muted">© {{year}} {{appName}} - Offline Version</span>
  </div>
</footer>
```

---

## 🏠 7. views/pages/index.hbs - Hauptseite mit Feature-Demo

```handlebars
<div class="container my-5">
  
  <!-- Hero -->
  <div class="hero p-5 mb-5 bg-primary text-white rounded-3">
    <h1 class="display-4"><i class="bi bi-window-desktop"></i> Willkommen!</h1>
    <p class="lead">Performante Desktop-App mit Koa.js & Handlebars - 100% offline</p>
  </div>

  <!-- Koa.js Features -->
  <h2 class="mb-4"><i class="bi bi-lightning"></i> Koa.js Features</h2>
  
  <div class="row g-4 mb-5">
    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-header bg-success text-white">
          <i class="bi bi-activity"></i> System Status
        </div>
        <div class="card-body">
          <div id="status">
            <div class="spinner-border text-success"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-header bg-primary text-white">
          <i class="bi bi-stars"></i> Framework Features
        </div>
        <div class="card-body">
          <div id="features">
            <div class="spinner-border text-primary"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="card mb-5">
    <div class="card-header bg-warning">
      <h5 class="mb-0"><i class="bi bi-play-circle"></i> Koa.js Demo</h5>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-4 mb-3">
          <button class="btn btn-primary w-100" onclick="demo.loadStatus()">
            <i class="bi bi-arrow-clockwise"></i> Status aktualisieren
          </button>
        </div>
        <div class="col-md-4 mb-3">
          <button class="btn btn-success w-100" onclick="demo.testKoaContext()">
            <i class="bi bi-gear"></i> Koa Context Test
          </button>
        </div>
        <div class="col-md-4 mb-3">
          <button class="btn btn-info w-100" onclick="demo.testErrorHandling()">
            <i class="bi bi-exclamation-triangle"></i> Error Handling
          </button>
        </div>
      </div>
      <div id="demo-output" class="mt-3"></div>
    </div>
  </div>

  <!-- Tech Stack Icons -->
  <h3 class="mb-4"><i class="bi bi-stack"></i> Unser Tech Stack</h3>
  <div class="row g-3">
    {{#each features}}
    <div class="col-md-3">
      <div class="card text-center p-3">
        <i class="bi {{this.icon}} display-3 text-primary"></i>
        <h5 class="mt-2">{{this.name}}</h5>
      </div>
    </div>
    {{/each}}
  </div>

  <!-- Koa Middleware Demo -->
  <div class="card mt-5">
    <div class="card-header bg-dark text-white">
      <h4 class="mb-0"><i class="bi bi-diagram-3"></i> Koa.js Middleware Chain</h4>
    </div>
    <div class="card-body">
      <div class="row text-center">
        <div class="col-md-2">
          <i class="bi bi-shield-check display-4 text-success"></i>
          <h6>Security</h6>
        </div>
        <div class="col-md-2">
          <i class="bi bi-clock display-4 text-primary"></i>
          <h6>Logger</h6>
        </div>
        <div class="col-md-2">
          <i class="bi bi-folder display-4 text-warning"></i>
          <h6>Static Files</h6>
        </div>
        <div class="col-md-2">
          <i class="bi bi-router display-4 text-info"></i>
          <h6>Router</h6>
        </div>
        <div class="col-md-2">
          <i class="bi bi-file-code display-4 text-danger"></i>
          <h6>Templates</h6>
        </div>
        <div class="col-md-2">
          <i class="bi bi-bug display-4 text-secondary"></i>
          <h6>Error Handling</h6>
        </div>
      </div>
    </div>
  </div>
  
</div>
```

---

## ℹ️ 8. views/pages/about.hbs - Detaillierte Tech-Stack Info

```handlebars
<div class="container my-5">
  
  <div class="row">
    <div class="col-lg-8">
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h2 class="mb-0"><i class="bi bi-info-circle"></i> Über diese App</h2>
        </div>
        <div class="card-body">
          <p class="lead">Eine performante, vollständig offlinefähige Desktop-Anwendung.</p>
          
          <div class="alert alert-success">
            <h6><i class="bi bi-wifi-off"></i> 100% Offline-Fähig</h6>
            <p class="mb-0">Alle Dependencies lokal - keine Internetverbindung nötig.</p>
          </div>

          <h4 class="mt-4 mb-3"><i class="bi bi-stack"></i> Technologie-Stack</h4>
          <div id="tech-stack">
            <div class="spinner-border text-primary"></div>
          </div>

          <h4 class="mt-4 mb-3"><i class="bi bi-lightning"></i> Koa.js Features</h4>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <i class="bi bi-check-circle-fill text-success"></i> Async/Await Middleware
            </li>
            <li class="list-group-item">
              <i class="bi bi-check-circle-fill text-success"></i> Cascading Context
            </li>
            <li class="list-group-item">
              <i class="bi bi-check-circle-fill text-success"></i> Template-Caching
            </li>
            <li class="list-group-item">
              <i class="bi bi-check-circle-fill text-success"></i> Error Handling
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="card mb-4">
        <div class="card-header bg-dark text-white">
          <h5 class="mb-0"><i class="bi bi-gear"></i> App-Info</h5>
        </div>
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><td>Version:</td><td>1.0.0</td></tr>
              <tr><td>Lizenz:</td><td>MIT</td></tr>
              <tr><td>Port:</td><td>8080</td></tr>
              <tr><td>Offline:</td><td><span class="badge bg-success">Ja</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header bg-info text-white">
          <h5 class="mb-0"><i class="bi bi-diagram-3"></i> Koa.js Architektur</h5>
        </div>
        <div class="card-body">
          <small>
            <strong><i class="bi bi-arrow-right"></i></strong> Context Object<br>
            <strong><i class="bi bi-arrow-right"></i></strong> Middleware Chain<br>
            <strong><i class="bi bi-arrow-right"></i></strong> Request/Response<br>
            <strong><i class="bi bi-arrow-right"></i></strong> Error Propagation<br>
            <strong><i class="bi bi-arrow-right"></i></strong> Template Rendering
          </small>
        </div>
      </div>
    </div>
  </div>
  
</div>
```

---

## ⚙️ 9. views/pages/middleware.hbs - Koa Middleware Demo

```handlebars
<div class="container my-5">
  
  <div class="card mb-4">
    <div class="card-header bg-primary text-white">
      <h2 class="mb-0"><i class="bi bi-gear"></i> Koa.js Middleware Demo</h2>
    </div>
    <div class="card-body">
      <p class="lead">Erkunde die Leistungsfähigkeit von Koa.js Middleware</p>
      
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-success text-white">
              <i class="bi bi-activity"></i> Context Demo
            </div>
            <div class="card-body">
              <p>Teste Koa's Context Object mit allen Eigenschaften:</p>
              <button class="btn btn-success w-100" onclick="demo.testKoaContext()">
                <i class="bi bi-play-circle"></i> Context Test ausführen
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-warning text-white">
              <i class="bi bi-exclamation-triangle"></i> Error Handling
            </div>
            <div class="card-body">
              <p>Teste Koa's eingebaute Error Handling:</p>
              <button class="btn btn-warning w-100" onclick="demo.testErrorHandling()">
                <i class="bi bi-bug"></i> Error Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="middleware-output"></div>
    </div>
  </div>

  <!-- Koa Features Grid -->
  <h3 class="mb-4"><i class="bi bi-lightning"></i> Koa.js Core Features</h3>
  <div class="row g-3">
    <div class="col-md-4">
      <div class="card text-center p-3">
        <i class="bi bi-aspect-ratio display-3 text-primary"></i>
        <h5>Async/Await</h5>
        <small class="text-muted">Keine Callback-Hölle</small>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card text-center p-3">
        <i class="bi bi-diagram-3 display-3 text-success"></i>
        <h5>Cascading</h5>
        <small class="text-muted">Middleware Flow</small>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card text-center p-3">
        <i class="bi bi-wrench display-3 text-warning"></i>
        <h5>Context</h5>
        <small class="text-muted">Erweitertes Object</small>
      </div>
    </div>
  </div>
  
</div>
```

---

## ❌ 10. views/pages/404.hbs

```handlebars
<div class="container my-5">
  <div class="row justify-content-center">
    <div class="col-md-6 text-center">
      <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
      <h1 class="display-1 mt-3">404</h1>
      <p class="lead">Seite <code>{{path}}</code> nicht gefunden</p>
      <a href="/" class="btn btn-primary">
        <i class="bi bi-house-door"></i> Zur Startseite
      </a>
    </div>
  </div>
</div>
```

---

## 🎨 11. public/css/style.css - Optimiertes CSS

```css
/* Basis-Styling */
:root {
  --shadow-sm: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
  --shadow-md: 0 0.5rem 1rem rgba(0,0,0,0.15);
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

body {
  font-family: 'Segoe UI', Tahoma, sans-serif;
  background-color: #f8f9fa;
}

/* Cards mit Hover-Effekt */
.card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  box-shadow: var(--shadow-sm);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

/* Hero Section */
.hero {
  background: var(--primary-gradient);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.1);
}

.hero * {
  position: relative;
  z-index: 1;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* Koa-specific Styles */
.koa-badge {
  background: linear-gradient(45deg, #333, #666);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.middleware-chain {
  border-left: 3px solid #007bff;
  padding-left: 1rem;
  margin: 1rem 0;
}

.middleware-chain .step {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
}

/* Spinner Center */
.spinner-border {
  margin: 0 auto;
  display: block;
}

/* Feature Icons */
.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Context Demo Styles */
.context-demo {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.context-item {
  margin: 0.5rem 0;
  padding: 0.5rem;
  border-left: 3px solid #007bff;
  background: white;
}
```

---

## ⚡ 12. public/js/app.js - Erweiterte Client-Side JavaScript

```javascript
// Erweiterte Demo Funktionen mit Koa.js Features
const demo = {
  // Status laden
  async loadStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      
      $('#status').html(`
        <div class="fade-in">
          <div class="row text-center">
            <div class="col-6 mb-3">
              <h5>${data.memory} MB</h5>
              <small class="text-muted">Speicher</small>
            </div>
            <div class="col-6 mb-3">
              <h5>${data.uptime}s</h5>
              <small class="text-muted">Uptime</small>
            </div>
            <div class="col-12">
              <span class="badge bg-success">
                <i class="bi bi-check-circle"></i> ${data.status.toUpperCase()}
              </span>
              <div class="mt-2">
                <small class="text-muted koa-badge">Koa.js ${data.framework.split(' ')[1]}</small>
              </div>
            </div>
          </div>
        </div>
      `);
    } catch (err) {
      $('#status').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> Fehler beim Laden
        </div>
      `);
    }
  },

  // Features laden
  async loadFeatures() {
    try {
      const res = await fetch('/api/features');
      const data = await res.json();
      
      let html = '<div class="fade-in"><ul class="list-group">';
      
      ['koa', 'handlebars', 'jquery'].forEach(key => {
        html += `<li class="list-group-item">
          <strong><i class="bi bi-${this.getIconForFeature(key)}"></i> ${this.capitalize(key)}:</strong>
          ${data[key].slice(0, 3).join(', ')}
        </li>`;
      });
      
      html += '</ul></div>';
      $('#features').html(html);
    } catch (err) {
      $('#features').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> Fehler beim Laden
        </div>
      `);
    }
  },

  // Koa Context Demo
  async testKoaContext() {
    try {
      $('#demo-output, #middleware-output').html(`
        <div class="text-center">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">Lade Koa Context Daten...</p>
        </div>
      `);

      const res = await fetch('/context-demo');
      const data = await res.json();
      
      const output = `
        <div class="fade-in">
          <div class="alert alert-success">
            <h5><i class="bi bi-check-circle"></i> Koa Context Demo</h5>
            <p class="mb-0">Koa's Context Object erfolgreich geladen</p>
          </div>
          
          <div class="context-demo mt-3">
            <h6>Request Details:</h6>
            ${this.renderObject(data.request)}
            
            <h6 class="mt-3">Response Details:</h6>
            ${this.renderObject(data.response)}
            
            <h6 class="mt-3">App State:</h6>
            ${this.renderObject(data.state)}
          </div>
        </div>
      `;
      
      $('#demo-output, #middleware-output').html(output);
    } catch (err) {
      $('#demo-output, #middleware-output').html(`
        <div class="alert alert-danger fade-in">
          <i class="bi bi-exclamation-triangle"></i> Fehler: ${err.message}
        </div>
      `);
    }
  },

  // Error Handling Demo
  async testErrorHandling() {
    try {
      $('#demo-output, #middleware-output').html(`
        <div class="text-center">
          <div class="spinner-border text-warning"></div>
          <p class="mt-2">Teste Error Handling...</p>
        </div>
      `);

      const res = await fetch('/error-demo?throw=true');
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error.message);
      }
      
      const data = await res.json();
      $('#demo-output, #middleware-output').html(`
        <div class="alert alert-info fade-in">
          <i class="bi bi-info-circle"></i> ${data.message}
        </div>
      `);
    } catch (err) {
      $('#demo-output, #middleware-output').html(`
        <div class="alert alert-danger fade-in">
          <h5><i class="bi bi-bug"></i> Koa Error Handling Demo</h5>
          <p class="mb-0">Fehler erfolgreich abgefangen: <strong>${err.message}</strong></p>
          <small class="text-muted">Dies zeigt Koa's eingebaute Error Propagation</small>
        </div>
      `);
    }
  },

  // Tech Stack laden (About Page)
  async loadStack() {
    try {
      const res = await fetch('/api/stack');
      const stack = await res.json();
      
      let html = '<div class="fade-in"><div class="row g-3">';
      stack.forEach(item => {
        html += `
          <div class="col-md-6">
            <div class="card">
              <div class="card-body">
                <div class="d-flex align-items-center">
                  <i class="bi ${item.icon} display-6 text-primary me-3"></i>
                  <div>
                    <h5 class="mb-1">${item.name}</h5>
                    <p class="mb-1 text-muted">${item.desc}</p>
                    <span class="badge bg-primary">${item.version}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div></div>';
      
      $('#tech-stack').html(html);
    } catch (err) {
      $('#tech-stack').html(`
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle"></i> Fehler beim Laden
        </div>
      `);
    }
  },

  // Hilfsfunktionen
  getIconForFeature(feature) {
    const icons = {
      koa: 'lightning',
      handlebars: 'file-code',
      jquery: 'gear'
    };
    return icons[feature] || 'question-circle';
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  renderObject(obj, depth = 0) {
    if (depth > 2) return '<span class="text-muted">[Nested Object]</span>';
    
    let html = '';
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        html += `<div class="context-item" style="margin-left: ${depth * 20}px">
          <strong>${key}:</strong> ${this.renderObject(value, depth + 1)}
        </div>`;
      } else if (Array.isArray(value)) {
        html += `<div class="context-item" style="margin-left: ${depth * 20}px">
          <strong>${key}:</strong> [${value.slice(0, 3).join(', ')}${value.length > 3 ? '...' : ''}]
        </div>`;
      } else {
        html += `<div class="context-item" style="margin-left: ${depth * 20}px">
          <strong>${key}:</strong> <code>${value}</code>
        </div>`;
      }
    }
    return html;
  },

  // Animation Demo
  animateCard() {
    const card = $('#demo-output').closest('.card');
    card.addClass('shadow-lg');
    $('#demo-output').html(`
      <div class="alert alert-success fade-in">
        <i class="bi bi-check-circle"></i> Animation ausgeführt!
      </div>
    `);
    setTimeout(() => card.removeClass('shadow-lg'), 1000);
  }
};

// Auto-Load bei Seitenaufruf
$(document).ready(() => {
  // Home Page
  if ($('#status').length) {
    demo.loadStatus();
    demo.loadFeatures();
    setInterval(demo.loadStatus, 30000); // Update alle 30s
  }
  
  // About Page
  if ($('#tech-stack').length) {
    demo.loadStack();
  }
  
  // Card Hover Effects
  $('.card').hover(
    function() { $(this).addClass('shadow-lg'); },
    function() { $(this).removeClass('shadow-lg'); }
  );

  // Koa Middleware Visualisierung
  if ($('#middleware-output').length) {
    $('.middleware-chain').show();
  }
});
```

---

## 📝 13. .gitignore

```gitignore
node_modules/
package-lock.json
dist/
build/
*.log
.env
.DS_Store
cache/
.vscode/
.idea/
```

---

## 🚀 Installation & Start

### 1. Projekt erstellen

```bash
mkdir koa-handlebars-app && cd koa-handlebars-app
```

### 2. Alle Dateien erstellen (siehe oben)

### 3. Dependencies installieren

```bash
npm install
npm run setup
```

### 4. Server starten

```bash
npm run dev
```

**App öffnen:** http://localhost:8080

### 5. Als Desktop-App (optional)

```bash
npm install -g nw
npm start
```

---

## 🎯 Koa.js Features Implementiert

### ✅ Vollständige Koa.js Integration:

1. **Async/Await Middleware** - Moderne Promise-basierte Handhabung
2. **Cascading Context** - Middleware fließt durch alle Schichten
3. **Enhanced Context Object** - Erweiterte Request/Response Objekte
4. **Error Handling** - Robuste Fehlerbehandlung mit ctx.throw()
5. **Router System** - Flexible Route-Definitionen mit Präfixen

### ✅ Security Features:

1. **Security Headers** - XSS Protection, No-Sniff, Frame Options
2. **Static File Caching** - Performance-Optimierung
3. **Error Propagation** - Zentrale Fehlerbehandlung
4. **Input Validation** - Parametervalidierung

### ✅ Performance Optimierungen:

1. **Template Caching** - Kompilierte Templates im Memory
2. **Partial Caching** - Partials werden einmalig geladen
3. **Static File Caching** - Browser-Caching für Assets
4. **Promise Parallelization** - Parallele Datei-Operationen

---

## 💡 Koa.js API Endpoints

### Core Endpoints:
- `GET /` - Hauptseite mit Koa.js Demo
- `GET /about` - Technologie-Stack Details  
- `GET /middleware-demo` - Koa Middleware Demonstration

### API Endpoints:
- `GET /api/status` - System-Status mit Koa.js Info
- `GET /api/features` - Framework-Feature-Liste
- `GET /api/stack` - Technologie-Stack Details
- `GET /koa-demo` - Reine Koa.js Feature-Demo
- `GET /context-demo` - Koa Context Object Demo
- `GET /error-demo` - Error Handling Demonstration

### User API (Prefixed):
- `GET /api/users` - Benutzerliste
- `GET /api/users/:id` - Einzelner Benutzer
- `POST /api/users` - Benutzer erstellen (Demo)

---

## 📊 Koa.js Middleware Chain

```
Request 
  → Security Headers Middleware
  → Static File Middleware  
  → Context Enhancement
  → Logger Middleware
  → Router Middleware
  → Template Rendering
  → Error Handling
  → Response
```

---

## 💝 Support

Wenn dir dieses Tutorial geholfen hat:

**PayPal:** m.imle@gmx.net

**Vielen Dank! ❤️**

---

<div align="center">

**Made with ❤️, ⚡ Koa.js & 🔥 Handlebars**

[⬆ Zurück nach oben](#-koajs--handlebarsjs-nwjs-desktop-app---optimierte-version)

</div>
