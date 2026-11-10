import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import apiRouter from './src/server/routes/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Rutas de la API REST de MusicLab
  app.use('/api', apiRouter);

  // Integración de Vite Dev Server o archivos estáticos para SPA
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎵 [MusicLab Server] API y Frontend corriendo en http://0.0.0.0:${PORT}`);
    console.log(`🗄️ [Base de Datos] MySQL 'musiclab_db' inicializada con 10 tablas relacionadas.`);
    console.log(`🔑 [Cuentas Demo] Admin: admin@musiclab.local | Lector: lector@musiclab.local\n`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor MusicLab:', err);
  process.exit(1);
});
