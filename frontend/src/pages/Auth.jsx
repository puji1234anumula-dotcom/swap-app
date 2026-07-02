import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, loginWithGoogle } from '../api/auth';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Auth.module.css';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // ✅ FIX: Handle redirect result when user is returned back to the page
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          const idToken = await result.user.getIdToken();
          const data = await loginWithGoogle(idToken);
          localStorage.setItem('swap_token', data.access_token);
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Google Redirect Result Error:', err);
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
          const detail = err.response?.data?.detail || err.message || 'Google Sign-In failed.';
          setError(detail);
        }
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
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
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      // ✅ FIX: Try popup first; if blocked by browser COOP policy, fall back to redirect
      const result = await signInWithPopup(auth, googleProvider);
      setLoading(true);
      const idToken = await result.user.getIdToken();
      const data = await loginWithGoogle(idToken);
      localStorage.setItem('swap_token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-In Error (popup):', err.code, err.message);

      // ✅ FIX: If popup fails due to COOP/browser policy, fall back to redirect flow
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.message?.includes('Cross-Origin') ||
        err.message?.includes('network') ||
        err.code === 'auth/network-request-failed'
      ) {
        try {
          // Redirect flow: user leaves the page and comes back; result is handled in useEffect
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          console.error('Google Sign-In Error (redirect):', redirectErr);
          setError('Google Sign-In failed. Please try again.');
        }
      } else {
        setError(err.response?.data?.detail || err.message || 'Google Sign-In failed.');
      }
    } finally {
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
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
          <button 
            type="button"
            className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
            onClick={() => setIsLogin(true)}
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
