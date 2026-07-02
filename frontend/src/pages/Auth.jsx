import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, loginWithGoogle } from '../api/auth';
import { auth, googleProvider } from '../firebase';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Auth.module.css';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [wakingUp, setWakingUp] = useState(false); // shown when backend is cold-starting
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // On every page load, check if the user just returned from Google redirect
  useEffect(() => {
    // Show "waking up" after 3s if backend is still cold-starting
    const wakeTimer = setTimeout(() => setWakingUp(true), 3000);

    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          setWakingUp(true); // backend call is about to happen, may take time
          const idToken = await result.user.getIdToken();
          const data = await loginWithGoogle(idToken);
          localStorage.setItem('swap_token', data.access_token);
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        console.error('Google Redirect Result Error:', err.code, err.message);
        if (err.code && err.code !== 'auth/no-auth-event') {
          const msg = err.response?.data?.detail || err.message || '';
          if (msg.toLowerCase().includes('network') || !err.response) {
            setError('Server is waking up — please wait 30 seconds and try again.');
          } else {
            setError(msg || 'Google Sign-In failed. Please try again.');
          }
        }
      })
      .finally(() => {
        clearTimeout(wakeTimer);
        setWakingUp(false);
        setLoading(false);
      });

    return () => clearTimeout(wakeTimer);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Show waking up after 3s if backend is cold-starting
    const wakeTimer = setTimeout(() => setWakingUp(true), 3000);
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
      const msg = err.response?.data?.detail || err.message || '';
      if (!err.response) {
        setError('Server is waking up — please wait 30 seconds and try again.');
      } else {
        setError(msg || 'An error occurred. Please try again.');
      }
    } finally {
      clearTimeout(wakeTimer);
      setWakingUp(false);
      setLoading(false);
    }
  };

  // ✅ Use redirect flow directly — no popup (popup is broken by COOP on Google's end)
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
      // Page will navigate away; when it comes back, useEffect above handles the result
    } catch (err) {
      console.error('Google Sign-In Error:', err.code, err.message);
      setError(err.message || 'Google Sign-In failed. Please try again.');
      setLoading(false);
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
            <div className={styles.error} style={{color: '#f59e0b'}}>
              ⏳ Waking up server... please wait ~30 seconds
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
          Continue with Google
        </button>
      </div>
    </div>
  );
}
