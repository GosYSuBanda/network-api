const jwt = require('jsonwebtoken');

class JWTService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'finsmart-network-secret-key-2024';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    this.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
  }

  /**
   * Generar token de acceso
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'finsmart-network'
    });
  }

  /**
   * Generar token de refresh
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'finsmart-network'
    });
  }

  /**
   * Verificar token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      throw new Error('Error al verificar token');
    }
  }

  /**
   * Decodificar token sin verificar (útil para obtener info básica)
   */
  decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Generar ambos tokens (access y refresh)
   */
  generateTokens(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.roleId
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ userId: user._id }),
      expiresIn: this.JWT_EXPIRES_IN
    };
  }

  /**
   * Extraer token del header Authorization
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = new JWTService(); 