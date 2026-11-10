import { Router } from 'express';
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/authMiddleware.ts';
import * as authCtrl from '../controllers/authController.ts';
import * as songCtrl from '../controllers/songController.ts';
import * as artistCtrl from '../controllers/artistController.ts';
import * as albumCtrl from '../controllers/albumController.ts';
import * as genreCtrl from '../controllers/genreController.ts';
import * as playlistCtrl from '../controllers/playlistController.ts';
import * as favoriteCtrl from '../controllers/favoriteController.ts';
import * as dbCtrl from '../controllers/databaseController.ts';

const router = Router();

// ==================== AUTENTICACIÓN ====================
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticateToken, authCtrl.getCurrentUser);
router.get('/auth/demo', authCtrl.getDemoCredentials);

// ==================== CANCIONES ====================
router.get('/songs', optionalAuth, songCtrl.listSongs);
router.get('/songs/:id', optionalAuth, songCtrl.getSongById);
router.post('/songs', authenticateToken, requireAdmin, songCtrl.createSong);
router.put('/songs/:id', authenticateToken, requireAdmin, songCtrl.updateSong);
router.delete('/songs/:id', authenticateToken, requireAdmin, songCtrl.deleteSong);

// ==================== ARTISTAS ====================
router.get('/artists', artistCtrl.listArtists);
router.post('/artists', authenticateToken, requireAdmin, artistCtrl.createArtist);
router.put('/artists/:id', authenticateToken, requireAdmin, artistCtrl.updateArtist);
router.delete('/artists/:id', authenticateToken, requireAdmin, artistCtrl.deleteArtist);

// ==================== ÁLBUMES ====================
router.get('/albums', albumCtrl.listAlbums);
router.post('/albums', authenticateToken, requireAdmin, albumCtrl.createAlbum);
router.put('/albums/:id', authenticateToken, requireAdmin, albumCtrl.updateAlbum);
router.delete('/albums/:id', authenticateToken, requireAdmin, albumCtrl.deleteAlbum);

// ==================== GÉNEROS ====================
router.get('/genres', genreCtrl.listGenres);
router.post('/genres', authenticateToken, requireAdmin, genreCtrl.createGenre);
router.put('/genres/:id', authenticateToken, requireAdmin, genreCtrl.updateGenre);
router.delete('/genres/:id', authenticateToken, requireAdmin, genreCtrl.deleteGenre);

// ==================== LISTAS DE REPRODUCCIÓN ====================
router.get('/playlists', optionalAuth, playlistCtrl.listPlaylists);
router.get('/playlists/:id', optionalAuth, playlistCtrl.getPlaylistById);
router.post('/playlists', authenticateToken, playlistCtrl.createPlaylist);
router.post('/playlists/:id/songs', authenticateToken, playlistCtrl.addSongToPlaylist);
router.delete('/playlists/:id/songs/:cancionId', authenticateToken, playlistCtrl.removeSongFromPlaylist);
router.delete('/playlists/:id', authenticateToken, playlistCtrl.deletePlaylist);

// ==================== FAVORITOS ====================
router.get('/favorites', authenticateToken, favoriteCtrl.listFavorites);
router.post('/favorites/:cancionId', authenticateToken, favoriteCtrl.toggleFavorite);

// ==================== BASE DE DATOS Y CONSOLA SQL ====================
router.get('/database/schema', dbCtrl.getDatabaseMetadata);
router.get('/database/analytics', dbCtrl.getAnalyticsData);
router.post('/database/query', authenticateToken, dbCtrl.executeSQLQuery);
router.post('/database/reset', authenticateToken, requireAdmin, dbCtrl.resetDatabase);
router.get('/database/download-sql', dbCtrl.downloadSchemaSQL);

export default router;
