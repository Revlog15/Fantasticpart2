import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError('Login gagal. Silakan cek email dan password Anda.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>LOGIN</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="input-group">
      <input
        type="password"
              value={password}
        onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (minimal 6 karakter)"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="login-button">
            Masuk
          </button>
        </form>
        <p className="register-link">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 