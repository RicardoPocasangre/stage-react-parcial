// Prepara dist/ para GitHub Pages: 404.html (copia de index.html, para que las
// rutas profundas lo recarguen como SPA) y .nojekyll (evita el procesado Jekyll).
import { copyFileSync, writeFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
writeFileSync('dist/.nojekyll', '')
console.log('postbuild: dist/404.html y dist/.nojekyll listos')
