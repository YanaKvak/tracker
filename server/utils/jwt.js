import jwt from 'jsonwebtoken';

// Генерация общего JWT-токена
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Проверка общего токена
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const error = new Error('Недействительный или истёкший токен');
    error.status = 401;
    throw error;
  }
};

// Генерация токена для подтверждения email
const generateEmailToken = (email) => {
  return jwt.sign({ email }, process.env.EMAIL_SECRET, { expiresIn: '15m' });
};

// Проверка токена подтверждения email
const verifyEmailToken = (token) => {
  return jwt.verify(token, process.env.EMAIL_SECRET);
};

// Генерация токена для сброса пароля
const generateResetPasswordToken = (email) => {
  return jwt.sign({ email }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '15m' });
};

// Проверка токена сброса пароля
const verifyResetPasswordToken = (token) => {
  return jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
};

export {
  generateToken,
  verifyToken,
  generateEmailToken,
  verifyEmailToken,
  generateResetPasswordToken,
  verifyResetPasswordToken
};
