// Las rutas de public/ deben respetar `base` (GitHub Pages publica bajo /<repo>/).
export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
