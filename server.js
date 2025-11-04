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
