-- ============================================================================
-- PROYECTO ACADÉMICO: MusicLab - Sistema de Gestión Musical Comunitaria
-- Entidad Objetivo: Asociación Musical y Cultural Sonora (Reemplazar por entidad local)
-- Motor de Base de Datos: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ============================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS `musiclab_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `musiclab_db`;

-- Desactivar temporalmente revisión de claves foráneas para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `favoritos`;
DROP TABLE IF EXISTS `lista_canciones`;
DROP TABLE IF EXISTS `listas_reproduccion`;
DROP TABLE IF EXISTS `cancion_generos`;
DROP TABLE IF EXISTS `canciones`;
DROP TABLE IF EXISTS `generos`;
DROP TABLE IF EXISTS `albumes`;
DROP TABLE IF EXISTS `artistas`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 2. DEFINICIÓN DE TABLAS, RESTRICCIONES E ÍNDICES
-- ============================================================================

-- TABLA 1: ROLES
-- Define los privilegios en el sistema (Administrador, Solo consulta).
CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 2: USUARIOS
-- Cuentas de acceso con contraseñas encriptadas y rol asignado.
CREATE TABLE `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rol_id` INT UNSIGNED NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `salt` VARCHAR(64) NOT NULL,
  `estado` ENUM('activo', 'inactivo', 'suspendido') NOT NULL DEFAULT 'activo',
  `fecha_registro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_acceso` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_usuarios_email` (`email`),
  KEY `idx_usuarios_rol` (`rol_id`),
  CONSTRAINT `fk_usuarios_roles`
    FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 3: ARTISTAS
-- Intérpretes, solistas o bandas de la comunidad musical.
CREATE TABLE `artistas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `biografia` TEXT NULL,
  `pais_origen` VARCHAR(80) NOT NULL DEFAULT 'Local',
  `anio_inicio` SMALLINT UNSIGNED NULL,
  `sitio_web` VARCHAR(255) NULL,
  `imagen_url` VARCHAR(500) NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_artistas_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 4: ALBUMES
-- Producciones discográficas o EPs editados por artistas.
CREATE TABLE `albumes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `artista_id` INT UNSIGNED NOT NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `anio_lanzamiento` SMALLINT UNSIGNED NOT NULL,
  `discografica` VARCHAR(100) NULL,
  `descripcion` TEXT NULL,
  `portada_url` VARCHAR(500) NULL,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_albumes_artista` (`artista_id`),
  KEY `idx_albumes_titulo` (`titulo`),
  CONSTRAINT `fk_albumes_artistas`
    FOREIGN KEY (`artista_id`) REFERENCES `artistas` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 5: GENEROS
-- Taxonomía de estilos musicales (Folk, Rock, Jazz, Fusión, etc.).
CREATE TABLE `generos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(60) NOT NULL,
  `descripcion` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_generos_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 6: CANCIONES
-- Catálogo principal de pistas musicales con metadatos y referencia de archivo.
-- Fuente por defecto: Proveedores de streaming (YouTube, SoundCloud, Enlace Directo).
CREATE TABLE `canciones` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `artista_id` INT UNSIGNED NOT NULL,
  `album_id` INT UNSIGNED NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `duracion_segundos` SMALLINT UNSIGNED NOT NULL,
  `anio_lanzamiento` SMALLINT UNSIGNED NOT NULL,
  `pista_numero` TINYINT UNSIGNED NULL DEFAULT 1,
  `proveedor_audio` ENUM('youtube', 'soundcloud', 'direct_url', 'spotify') NOT NULL DEFAULT 'youtube',
  `proveedor_id` VARCHAR(100) NULL,
  `archivo_url` VARCHAR(500) NOT NULL,
  `bit_rate_kbps` SMALLINT UNSIGNED NULL DEFAULT 320,
  `fecha_subida` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_canciones_artista` (`artista_id`),
  KEY `idx_canciones_album` (`album_id`),
  KEY `idx_canciones_titulo` (`titulo`),
  KEY `idx_canciones_anio` (`anio_lanzamiento`),
  KEY `idx_canciones_proveedor` (`proveedor_audio`),
  CONSTRAINT `fk_canciones_artistas`
    FOREIGN KEY (`artista_id`) REFERENCES `artistas` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_canciones_albumes`
    FOREIGN KEY (`album_id`) REFERENCES `albumes` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 7: CANCION_GENEROS (Relación N:M entre Canciones y Géneros)
-- Permite que una canción pertenezca a varios estilos (ej: Rock + Fusión).
CREATE TABLE `cancion_generos` (
  `cancion_id` INT UNSIGNED NOT NULL,
  `genero_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`cancion_id`, `genero_id`),
  KEY `idx_cg_genero` (`genero_id`),
  CONSTRAINT `fk_cg_canciones`
    FOREIGN KEY (`cancion_id`) REFERENCES `canciones` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cg_generos`
    FOREIGN KEY (`genero_id`) REFERENCES `generos` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 8: LISTAS_REPRODUCCION
-- Colecciones curadas por usuarios de la comunidad.
CREATE TABLE `listas_reproduccion` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` INT UNSIGNED NOT NULL,
  `nombre` VARCHAR(120) NOT NULL,
  `descripcion` TEXT NULL,
  `es_publica` BOOLEAN NOT NULL DEFAULT TRUE,
  `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_listas_usuario` (`usuario_id`),
  CONSTRAINT `fk_listas_usuarios`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 9: LISTA_CANCIONES (Relación N:M entre Listas y Canciones)
-- Relaciona canciones con listas manteniendo orden de reproducción.
CREATE TABLE `lista_canciones` (
  `lista_id` INT UNSIGNED NOT NULL,
  `cancion_id` INT UNSIGNED NOT NULL,
  `orden` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `fecha_agregada` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lista_id`, `cancion_id`),
  KEY `idx_lc_cancion` (`cancion_id`),
  KEY `idx_lc_orden` (`lista_id`, `orden`),
  CONSTRAINT `fk_lc_listas`
    FOREIGN KEY (`lista_id`) REFERENCES `listas_reproduccion` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lc_canciones`
    FOREIGN KEY (`cancion_id`) REFERENCES `canciones` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLA 10: FAVORITOS (Relación N:M entre Usuarios y Canciones)
-- Permite registrar pistas guardadas por cada usuario registrado.
CREATE TABLE `favoritos` (
  `usuario_id` INT UNSIGNED NOT NULL,
  `cancion_id` INT UNSIGNED NOT NULL,
  `fecha_guardado` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`, `cancion_id`),
  KEY `idx_favoritos_cancion` (`cancion_id`),
  CONSTRAINT `fk_fav_usuarios`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_fav_canciones`
    FOREIGN KEY (`cancion_id`) REFERENCES `canciones` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. INSERCIÓN DE DATOS DE EJEMPLO COHERENTES (SEMILLAS ACADÉMICAS)
-- ============================================================================

-- Roles del sistema
INSERT INTO `roles` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Administrador', 'Control total: visualización, búsqueda, inserción, actualización y eliminación de registros.'),
(2, 'Solo consulta', 'Acceso de lectura y búsqueda. No puede modificar ni eliminar registros.');

-- Usuarios de demostración (Contraseña: Admin123! y Lector123!)
-- Hash generado mediante SHA256 con salt criptográfico
INSERT INTO `usuarios` (`id`, `rol_id`, `nombre`, `email`, `password_hash`, `salt`, `estado`) VALUES
(1, 1, 'Prof. Andrés Morales (Admin)', 'admin@musiclab.local', '7b11c08bebe6e1337b003e8d2e8b233a7e4cfbdae49b82ea57e93081beeb4f3d', 'salt_academic_admin_2026', 'activo'),
(2, 2, 'Clara Valenzuela (Estudiante)', 'lector@musiclab.local', 'c6d26715fbc99d9841f4864c3cbb982425e4cbe06ad9d3a778e907d0f3a0a4c2', 'salt_academic_lector_2026', 'activo');

-- Géneros musicales
INSERT INTO `generos` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Folk & Fusión Latinoamericana', 'Raíces folclóricas combinadas con texturas modernas e instrumentación de vientos y charangos.'),
(2, 'Rock Alternativo', 'Guitarras con distorsión melódica y letras de contenido social y reflexivo.'),
(3, 'Jazz Fusión', 'Armonías complejas, improvisación con bajo eléctrico y saxofón.'),
(4, 'Música Clásica Contemporánea', 'Piezas de cámara, cuerdas y piano con composiciones académicas de conservatorio.'),
(5, 'Synthwave & Electrónica Sonora', 'Sintetizadores analógicos, arpegios retro y cajas de ritmos vintage 80s.');

-- Artistas comunitarios
INSERT INTO `artistas` (`id`, `nombre`, `biografia`, `pais_origen`, `anio_inicio`, `sitio_web`, `imagen_url`) VALUES
(1, 'Ensamble Vientos del Sur', 'Agrupación regional dedicada a fusionar ritmos andinos y jazz contemporáneo en salas comunitarias.', 'Chile', 2018, 'https://vientosdelsur.example.org', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'),
(2, 'Los Ecos de la Bahía', 'Cuarteto de rock acústico y post-punk local con grabaciones independientes en cinta.', 'Chile', 2020, 'https://ecosdelabahia.example.org', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&q=80'),
(3, 'Camila Cordero', 'Compositora y pianista egresada de conservatorio regional, explora el minimalismo instrumental.', 'Argentina', 2019, 'https://camilacordero.example.org', 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500&q=80'),
(4, 'Sintetizadores de Medianoche', 'Proyecto de música electrónica retrofuturista inspirado en paisajes costeros nocturnos.', 'Uruguay', 2022, 'https://sintemedia.example.org', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80');

-- Álbumes
INSERT INTO `albumes` (`id`, `artista_id`, `titulo`, `anio_lanzamiento`, `discografica`, `descripcion`, `portada_url`) VALUES
(1, 1, 'Cordillera Infinita', 2023, 'Sello Independiente Sonora', 'Grabación en vivo realizada en el teatro municipal comunitario con acústica de madera natural.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'),
(2, 2, 'Niebla en el Muelle', 2024, 'Autoedición Comunitaria', 'Ocho temas que retratan la vida portuaria y los inviernos de la costa pacífica.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80'),
(3, 3, 'Resonancias de Cristal', 2022, 'Conservatorio Ediciones', 'Ciclo de estudios breves para piano solista y cuerdas frotadas.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'),
(4, 4, 'Luces de Neón 1984', 2025, 'Analog Wave Records', 'Sintetizadores polifónicos analógicos Juno-60 y secuenciadores de época.', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80');

-- Canciones (Fuente por defecto: Proveedor YouTube con referencia reproducible)
INSERT INTO `canciones` (`id`, `artista_id`, `album_id`, `titulo`, `duracion_segundos`, `anio_lanzamiento`, `pista_numero`, `proveedor_audio`, `proveedor_id`, `archivo_url`, `bit_rate_kbps`) VALUES
(1, 1, 1, 'Amanecer en el Valle', 245, 2023, 1, 'youtube', 'DWcJFNfaw9c', 'https://www.youtube.com/watch?v=DWcJFNfaw9c', 320),
(2, 1, 1, 'Vientos de Altura', 312, 2023, 2, 'youtube', 'jfKfPfyJRdk', 'https://www.youtube.com/watch?v=jfKfPfyJRdk', 320),
(3, 2, 2, 'Mareas de Invierno', 198, 2024, 1, 'youtube', '5qap5aO4i9A', 'https://www.youtube.com/watch?v=5qap5aO4i9A', 256),
(4, 2, 2, 'Callejón de Sombras', 224, 2024, 2, 'youtube', 'kXYiU_JCYtU', 'https://www.youtube.com/watch?v=kXYiU_JCYtU', 320),
(5, 3, 3, 'Nocturno en Do Menor', 185, 2022, 1, 'youtube', '4Tr0otuiQuU', 'https://www.youtube.com/watch?v=4Tr0otuiQuU', 320),
(6, 3, 3, 'Luz Filtrada', 210, 2022, 2, 'youtube', '7NOSDKb0HlU', 'https://www.youtube.com/watch?v=7NOSDKb0HlU', 320),
(7, 4, 4, 'Cybernetic Highway', 268, 2025, 1, 'youtube', 'MVPTGNGiI-4', 'https://www.youtube.com/watch?v=MVPTGNGiI-4', 320),
(8, 4, 4, 'Tokyo Midnight Drift', 290, 2025, 2, 'youtube', '21X5lGlDOfg', 'https://www.youtube.com/watch?v=21X5lGlDOfg', 320);

-- Relación Canciones con Géneros (N:M)
INSERT INTO `cancion_generos` (`cancion_id`, `genero_id`) VALUES
(1, 1), -- Amanecer en el Valle -> Folk & Fusión
(1, 3), -- Amanecer en el Valle -> Jazz Fusión
(2, 1), -- Vientos de Altura -> Folk & Fusión
(3, 2), -- Mareas de Invierno -> Rock Alternativo
(4, 2), -- Callejón de Sombras -> Rock Alternativo
(5, 4), -- Nocturno en Do Menor -> Música Clásica
(6, 4), -- Luz Filtrada -> Música Clásica
(7, 5), -- Cybernetic Highway -> Synthwave
(8, 5); -- Tokyo Midnight Drift -> Synthwave

-- Listas de reproducción de la comunidad
INSERT INTO `listas_reproduccion` (`id`, `usuario_id`, `nombre`, `descripcion`, `es_publica`) VALUES
(1, 1, 'Selección Esencial Comunitaria', 'Compilación curada de los mejores temas de artistas locales para difusión cultural.', TRUE),
(2, 2, 'Sesión de Estudio y Concentración', 'Pistas instrumentales y piezas para lectura y trabajo académico.', TRUE);

-- Canciones añadidas a las listas
INSERT INTO `lista_canciones` (`lista_id`, `cancion_id`, `orden`) VALUES
(1, 1, 1),
(1, 3, 2),
(1, 7, 3),
(2, 5, 1),
(2, 6, 2),
(2, 8, 3);

-- Favoritos iniciales
INSERT INTO `favoritos` (`usuario_id`, `cancion_id`) VALUES
(1, 1),
(1, 7),
(2, 3),
(2, 5);
