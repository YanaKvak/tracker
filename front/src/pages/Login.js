import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './auth.css';

const Login = ({ onLogin = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      // Обработка ответа
      const authData = response.data;
      const token = authData.token;
      const user = authData.user;
      
      if (!token || !user) {
        throw new Error('Неполные данные аутентификации');
      }

      if (typeof onLogin === 'function') {
        onLogin(user, token);
      } else {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      navigate('/');
      
    } catch (error) {
      // Обработка ошибок
      let errorMsg = 'Ошибка при входе в систему';
      
      if (error.response) {
        errorMsg = error.response.data?.error || 
                  error.response.data?.message || 
                  error.response.statusText ||
                  `Ошибка сервера (${error.response.status})`;
      } else if (error.request) {
        errorMsg = 'Сервер не отвечает. Проверьте подключение к интернету';
      } else {
        errorMsg = error.message || 'Неизвестная ошибка';
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <h2>Авторизация</h2>
        
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
            <p className="error-hint">
              Проверьте правильность email и пароля. Если проблема сохраняется, 
              <Link to="/contact"> обратитесь в поддержку</Link>.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="Ваш email"
            />
          </div>
          
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Ваш пароль"
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Выполняется вход...' : 'Войти'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/register">Создать аккаунт </Link>
          <Link to="/forgot-password">Забыли пароль?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;