import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, loginWithGoogle } from '../api/auth';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Auth.module.css';
import client from '../api/client';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // ✅ Wake up the backend the moment this page loads so it's ready when needed
  useEffect(() => {
    client.get('/health').catch(() => {
      // Silently ignore — this is just a background warm-up ping
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const wakeTimer = setTimeout(() => setWakingUp(true), 4000);
    try {
      let data;
      if (isLogin) {
        data = await login(formData.email, formData.password);
      } else {
        data = await signup(formData.name, formData.email, formData.password);
      }
      localStorage.setItem('swap_token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Could not reach server. Please try again in 30 seconds.');
      } else {
        setError(err.response?.data?.detail || 'An error occurred. Please try again.');
      }
    } finally {
      clearTimeout(wakeTimer);
      setWakingUp(false);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      // Trigger popup immediately (must be called in a user gesture handler)
      const result = await signInWithPopup(auth, googleProvider);
      setLoading(true);
      const wakeTimer = setTimeout(() => setWakingUp(true), 4000);
      try {
        const idToken = await result.user.getIdToken();
        const data = await loginWithGoogle(idToken);
        localStorage.setItem('swap_token', data.access_token);
        navigate('/dashboard');
      } catch (backendErr) {
        if (!backendErr.response) {
          setError('Server is warming up — please wait 30 seconds and try again.');
        } else {
          setError(backendErr.response?.data?.detail || 'Sign-in failed. Please try again.');
        }
      } finally {
        clearTimeout(wakeTimer);
        setWakingUp(false);
        setLoading(false);
      }
    } catch (firebaseErr) {
      console.error('Google Sign-In Error:', firebaseErr.code, firebaseErr.message);
      if (firebaseErr.code === 'auth/popup-closed-by-user' || firebaseErr.code === 'auth/cancelled-popup-request') {
        // User closed the popup — no error needed
        return;
      }
      setError(firebaseErr.message || 'Google Sign-In failed. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo}>SWAP</h1>
          <p>Trade what you know.</p>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Log In
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <label>Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} />
            </div>
          )}
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input type="password" name="password" required minLength="8" value={formData.password} onChange={handleChange} />
          </div>

          {wakingUp && !error && (
            <div className={styles.error} style={{ color: '#f59e0b' }}>
              ⏳ Server warming up, please wait...
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <LoadingSpinner /> : <span>{isLogin ? 'Log In' : 'Create Account'}</span>}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className={styles.googleIcon} />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}
