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
