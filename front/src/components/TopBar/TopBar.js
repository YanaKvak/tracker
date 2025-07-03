import React, { useEffect, useState } from 'react';
import { FaShareAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { FaComment } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getAvatarLetter } from '../../utils';
import useAssetUrl from '../../hooks/useAssetUrl';
import { logout } from '../../store/slices/authSlice';
import { getUserById } from '../../api/userApi';
import { FaMailBulk } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { createCallback } from '../../api/supportApi';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import './TopBar.css';

const TopBar = ({ onLogout }) => {
  const { t, i18n } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const getAssetUrl = useAssetUrl();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCallback({ text, email: user.email });
      toast.success('Сообщение отправлено!');
      setText('');
      setShowForm(false);
    } catch (err) {
      toast.error('Ошибка при отправке');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await getUserById(user.id);
        setProfileData({
          name: response.username,
          email: response.email,
          avatar: response.avatar_url || null,
        });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        if (error.response?.status === 401) {
          dispatch(logout());
          navigate('/login');
        }
      }
    };

    loadProfile();
  }, [user, navigate, dispatch]);


  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
    i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <div className="top-bar">
      <div>
        <ToastContainer />
      </div>
      <div className="top-bar-actions">
        {user ? (
          <div className="user-controls">
            <div>
              <button 
                onClick={() => setShowForm(true)} 
                className="chat-button"
                aria-label="Поддержка"
              >
                <FaMailBulk aria-hidden="true" />
                <span className="visually-hidden">Поддержка</span>
              </button>
            </div>
            <div className="user-avatar">
              {profileData.avatar ? (
                <img
                  src={getAssetUrl(profileData.avatar)}
                  alt={`Аватар пользователя ${profileData.name}`}
                  className="avatar-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    setProfileData(prev => ({
                      ...prev,
                      avatar: prev.avatar || null
                    }));
                  }}
                />
              ) : (
                <div 
                  className="avatar-placeholder"
                  aria-hidden="true"
                >
                  {getAvatarLetter(user?.username, user?.email)}
                </div>
              )}
            </div>
            <button 
              onClick={onLogout} 
              className="logout-button"
              aria-label="Выйти из системы"
            >
              <FaSignOutAlt aria-hidden="true" />
              <span className="visually-hidden">Выйти</span>
            </button>
          </div>
        ) : (
          <button 
            className="login-btn" 
            onClick={() => navigate('/login')}
            aria-label="Войти в систему"
          >
            <FaUser aria-hidden="true" />
            <span className="visually-hidden">Войти</span>
          </button>
        )}
      </div>

      {showForm && (
      <div className="event-modal-overlay">
          <div className="event-modal">
              <div className="event-modal-header">
                  <h3>{t('callback_title')}</h3>
                  <button
                  className="close-modal"
                  onClick={() => {
                      setShowForm(false);
                      setText('');
                  }}
                  >
                  <FaTimes />
                  </button>
              </div>

              <div className="form-group">
                  <label>{t('callback_text')}</label>
                  <textarea
                  type="text"
                  className="form-control"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  />
              </div>

              <div className="form-actions">
                  <button
                  className="save-event-button"
                  onClick={handleSubmit}
                  disabled={!text}
                  >
                  {t('save_modal_new_chat')}
                  </button>
              </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default TopBar;