import { Router } from 'express';
import authController from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { authSchema } from '../utils/validators.js';
import User from '../models/User.js';
import { verifyResetPasswordToken, generateResetPasswordToken } from '../utils/jwt.js';
import { sendEmail } from '../services/emailService.js';
import { verifyEmailToken } from '../utils/jwt.js';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/register', validate(authSchema.register), authController.register);
router.post('/login', validate(authSchema.login), authController.login);
router.get('/confirm-email', async (req, res) => {
    try {
      const { token } = req.query;
      const { email } = verifyEmailToken(token);
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      await user.update({ email_confirmed: true });
      
      return res.status(200).json({ message: 'Email успешно подтвержден' });
      
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: 'Неверный или просроченный токен' });
    }
});
// Сброс пароля
router.post('/reset-password', authSchema.reset_password, async (req, res) => {
  try {
    const { email } = req.body;

    // Ищем пользователя по email
    const user = await User.findOne({ where: { email } });

    // Отвечаем одинаково при отсутствии пользователя, чтобы не раскрывать информацию
    if (!user) {
      return res.json({ message: 'Если Email найден, проверьте почту' });
    }

    // Генерируем токен сброса пароля
    const rpToken = generateResetPasswordToken(user.email);

    const confirmLink = `${process.env.FRONTEND_URL}/confirm-reset-password/${rpToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Подтвердите сброс пароля',
        html: `Нажмите <a href="${confirmLink}">здесь</a> для сброса пароля`,
      });
    } catch (emailError) {
      console.error('Ошибка отправки письма сброса пароля:', emailError);
      // Не прерываем выполнение, чтобы не раскрывать пользователю детали
    }

    return res.json({ message: 'Если Email найден, проверьте почту' });
  } catch (error) {
    console.error('Ошибка в /reset-password:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  }
});


router.post('/confirm-reset-password', authSchema.confirm_reset_password, async (req, res) => {
  try {
    const { token, password } = req.body;

    // Проверяем и декодируем токен
    const payload = verifyResetPasswordToken(token);
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Неверный или просроченный токен' });
    }

    // Ищем пользователя по email из токена
    const user = await User.findOne({ where: { email: payload.email } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Хэшируем новый пароль
    const newHash = await bcrypt.hash(password, 10);

    // Обновляем пароль
    await user.update({ password_hash: newHash });

    return res.json({ message: 'Пароль успешно обновлен' });
  } catch (err) {
    console.error('Ошибка в /confirm-reset-password:', err);
    return res.status(400).json({ message: 'Неверный или просроченный токен' });
  }
});


export default router;