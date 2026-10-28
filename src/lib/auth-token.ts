import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'git_infotronique_dynamic_qr_secret_2026_xyz';

export interface DynamicQrTokenPayload {
  userId: string;
  matricule: string;
  nom: string;
  prenom: string;
  niveau: string;
  timestamp: number;
}

/**
 * Génère un token sécurisé pour le QR code dynamique d'accès.
 * Valide pour une courte période (ex: 5 minutes) afin d'éviter la réutilisation ou les captures d'écran.
 */
export function generateAccessQrToken(user: {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  niveau: string;
}): string {
  const payload: DynamicQrTokenPayload = {
    userId: user.id,
    matricule: user.matricule,
    nom: user.nom,
    prenom: user.prenom,
    niveau: user.niveau,
    timestamp: Date.now(),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' });
}

/**
 * Vérifie et décode le token JWT du QR code d'accès.
 */
export function verifyAccessQrToken(token: string): DynamicQrTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DynamicQrTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Hachage sécurisé de mot de passe (Bcrypt 10 rounds).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Vérification de mot de passe.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
