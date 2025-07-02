import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { sendConfirmResetPasswordRequest } from '../../api/authApi';

const ConfirmResetPasswordForm = () => {
  const { token } = useParams();  // вот здесь
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('reset_password_no_token'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('reset_password_password_too_short'));
      return;
    }

    setIsSubmitting(true);
    try {
      await sendConfirmResetPasswordRequest(token, password);
      toast.success(t('reset_password_success'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || t('reset_password_unknown_error');
      toast.error(errMsg);
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
            <label>{t('reset_password_new_password_label')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder={t('reset_password_new_password_placeholder')}
            />
          </div>
          <button type="submit" disabled={isSubmitting} className={isSubmitting ? 'loading' : ''}>
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

export default ConfirmResetPasswordForm;
