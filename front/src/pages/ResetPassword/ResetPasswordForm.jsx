import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { sendResetPasswordRequest } from '../../api/authApi';
import '../auth.css';

const ResetPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t, i18n } = useTranslation();
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendResetPasswordRequest(email);
      toast.success(t('reset_password_request_sent'));
      setEmail(''); // очистить поле после успешной отправки
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
                       error.response?.data?.error ||
                       error.response?.statusText ||
                       error.message ||
                       'Неизвестная ошибка';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-bg">
      <ToastContainer />
      <div className="auth-container">
        <h2>{t('reset_password_title')}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('login_email_label')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="Email"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={isSubmitting ? 'loading' : ''}
          >
            {isSubmitting ? t('reset_password_button_loading') : t('reset_password_button')}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">{t('back_to_login')}</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
