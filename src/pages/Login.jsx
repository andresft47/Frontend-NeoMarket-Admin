import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Por favor ingresa tu correo.'); return; }
    if (!password)      { setError('Por favor ingresa tu contraseña.'); return; }

    setCargando(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        <div className="login-header">
          <div className="login-header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1>NeoMarket Admin</h1>
          <p>Ingresa con tu correo y contraseña</p>
        </div>

        <div className="login-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="admin@neomarket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={cargando}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={cargando}
              />
            </div>

            {error && (
              <div className="alert alert-error animate-fade-in">
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={cargando}>
              {cargando ? 'Ingresando…' : 'Ingresar al Sistema →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray-400)', marginTop: '24px' }}>
            © {new Date().getFullYear()} NeoMarket Inc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
