// ═══════════════════════════════════════════════════════════════════
// MGTM EXPRESS — OTP & JWT UTILITIES
// ═══════════════════════════════════════════════════════════════════
// Naglalaman ng mga helper functions para sa:
//   - OTP generation (6-digit code)
//   - JWT token creation at verification
//   - Token expiry handling
// ═══════════════════════════════════════════════════════════════════

'use strict';

const crypto = require('crypto');
const jwt    = require('jsonwebtoken');

// ── OTP Generation ─────────────────────────────────────────────────
/**
 * Gumawa ng cryptographically secure na 6-digit OTP
 * Gumagamit ng crypto.randomInt para mas secure kaysa sa Math.random()
 * @returns {string} 6-digit OTP code (e.g. "482910")
 */
function generateOTP() {
  // randomInt(min, max) — inclusive ng min, exclusive ng max
  // 100000 to 999999 = laging 6 digits, hindi magsisimula sa 0
  return crypto.randomInt(100000, 999999).toString();
}

// ── OTP Expiry ─────────────────────────────────────────────────────
/**
 * Kalkulahin ang expiry time ng OTP
 * Batay sa OTP_EXPIRES_MINUTES sa .env (default: 5 minutes)
 * @returns {Date} Expiry datetime
 */
function getOTPExpiry() {
  const minutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '5', 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

// ── OTP Validation ─────────────────────────────────────────────────
/**
 * I-check kung valid at hindi pa expired ang OTP
 * @param {string} inputCode - OTP na ini-input ng user
 * @param {string} storedCode - OTP na nakaimbak sa database
 * @param {Date} expiresAt - Expiry time ng OTP
 * @param {boolean} isUsed - Kung nagamit na ang OTP
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateOTP(inputCode, storedCode, expiresAt, isUsed) {
  // Check kung nagamit na
  if (isUsed) {
    return { valid: false, error: 'Nagamit na ang OTP na ito. Humingi ng bago.' };
  }

  // Check kung expired na
  if (new Date() > new Date(expiresAt)) {
    const minutesAgo = Math.floor((Date.now() - new Date(expiresAt).getTime()) / 60000);
    return {
      valid: false,
      error: `Expired na ang OTP (${minutesAgo} minuto na ang nakalipas). Humingi ng bagong OTP.`,
    };
  }

  // Check kung tama ang code
  // Gumagamit ng timing-safe comparison para maiwasan ang timing attacks
  if (inputCode.trim() !== storedCode) {
    return { valid: false, error: 'Mali ang OTP code. Subukan muli.' };
  }

  return { valid: true, error: null };
}

// ── JWT Token Generation ────────────────────────────────────────────
/**
 * Gumawa ng JWT access token para sa authenticated user
 * @param {string} userId - UUID ng user sa database
 * @param {string} role - Role ng user (CUSTOMER, ADMIN, etc.)
 * @param {string} phone - Phone number ng user
 * @returns {string} Signed JWT token
 */
function generateToken(userId, role, phone) {
  const secret  = process.env.JWT_SECRET;
  const expires = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET ay hindi naka-set sa environment variables!');
  }

  return jwt.sign(
    {
      userId,
      role,
      phone,
      // Nagdagdag ng iat (issued at) para sa token tracking
      iat: Math.floor(Date.now() / 1000),
    },
    secret,
    {
      expiresIn: expires,
      issuer:    'mgtm-express',         // Para ma-identify kung saan galing ang token
      audience:  'mgtm-express-users',   // Para sa token audience validation
    }
  );
}

// ── JWT Token Verification ──────────────────────────────────────────
/**
 * I-verify at i-decode ang JWT token
 * @param {string} token - JWT token string
 * @returns {{ decoded: object|null, error: string|null }}
 */
function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return { decoded: null, error: 'JWT_SECRET hindi configured' };
    }

    const decoded = jwt.verify(token, secret, {
      issuer:   'mgtm-express',
      audience: 'mgtm-express-users',
    });

    return { decoded, error: null };

  } catch (err) {
    // Magbigay ng specific error messages para sa debugging
    if (err.name === 'TokenExpiredError') {
      return {
        decoded: null,
        error:   'Expired na ang session. Mag-login muli.',
      };
    }
    if (err.name === 'JsonWebTokenError') {
      return {
        decoded: null,
        error:   'Invalid na token. Mag-login muli.',
      };
    }
    if (err.name === 'NotBeforeError') {
      return {
        decoded: null,
        error:   'Hindi pa valid ang token.',
      };
    }
    return {
      decoded: null,
      error:   'Token verification failed.',
    };
  }
}

// ── Phone Number Formatter ──────────────────────────────────────────
/**
 * I-format ang Philippine phone number para sa SMS sending
 * Converts: 09XXXXXXXXX → 639XXXXXXXXX
 * @param {string} phone - Raw phone number input
 * @returns {string} Formatted phone number para sa Semaphore API
 */
function formatPhoneForSMS(phone) {
  // Tanggalin ang spaces, dashes, at parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // 09XXXXXXXXX → 639XXXXXXXXX
  if (cleaned.startsWith('0')) {
    return '63' + cleaned.slice(1);
  }

  // +639XXXXXXXXX → 639XXXXXXXXX (tanggalin ang +)
  if (cleaned.startsWith('+63')) {
    return cleaned.slice(1);
  }

  // 639XXXXXXXXX → wala nang baguhin
  if (cleaned.startsWith('63')) {
    return cleaned;
  }

  // Default: ibalik as-is
  return cleaned;
}

/**
 * I-validate ang Philippine phone number format
 * @param {string} phone - Phone number na ivi-validate
 * @returns {{ valid: boolean, error: string|null, formatted: string|null }}
 */
function validatePhilippinePhone(phone) {
  if (!phone) {
    return { valid: false, error: 'Kailangan ang phone number.', formatted: null };
  }

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Accepted formats:
  // 09XXXXXXXXX (11 digits, starts with 09)
  // +639XXXXXXXXX (starts with +639)
  // 639XXXXXXXXX (starts with 639)
  const validPatterns = [
    /^09\d{9}$/,      // 09XXXXXXXXX
    /^\+639\d{9}$/,   // +639XXXXXXXXX
    /^639\d{9}$/,     // 639XXXXXXXXX
  ];

  const isValid = validPatterns.some(pattern => pattern.test(cleaned));

  if (!isValid) {
    return {
      valid:     false,
      error:     'Hindi valid ang phone number. Gamitin ang format: 09XXXXXXXXX',
      formatted: null,
    };
  }

  return {
    valid:     true,
    error:     null,
    formatted: formatPhoneForSMS(cleaned),
  };
}

// ── Token Expiry Info ───────────────────────────────────────────────
/**
 * Kunin ang remaining time ng token bago mag-expire
 * @param {string} token - JWT token
 * @returns {{ expiresIn: number|null, expiresAt: Date|null }}
 */
function getTokenExpiry(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return { expiresIn: null, expiresAt: null };

    const expiresAt = new Date(decoded.exp * 1000);
    const expiresIn = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));

    return { expiresIn, expiresAt };
  } catch {
    return { expiresIn: null, expiresAt: null };
  }
}

module.exports = {
  generateOTP,
  getOTPExpiry,
  validateOTP,
  generateToken,
  verifyToken,
  formatPhoneForSMS,
  validatePhilippinePhone,
  getTokenExpiry,
};
