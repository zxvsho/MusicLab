import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? ''
    : 'musiclab_super_secret_jwt_key_academic_demo_2026'
);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio en producción. Configure una clave aleatoria de al menos 32 caracteres.');
}
if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
}

export interface UserPayload {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  rol_nombre: string;
}

/**
 * Hash de contraseña con salt criptográfico para protección en BD.
 */
export function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

/**
 * Genera un salt criptográfico pseudoaleatorio.
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generador estándar de tokens JWT (RFC 7519) usando HMAC-SHA256 con crypto nativo.
 */
export function generateToken(payload: UserPayload): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + 60 * 60 * 24 // 24 horas
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * Valida y decodifica un token JWT.
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [b64Header, b64Payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${b64Header}.${b64Payload}`)
      .digest('base64url');

    if (signature !== expectedSig) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expirado
    }

    return {
      id: payload.id,
      nombre: payload.nombre,
      email: payload.email,
      rol_id: payload.rol_id,
      rol_nombre: payload.rol_nombre
    };
  } catch {
    return null;
  }
}
