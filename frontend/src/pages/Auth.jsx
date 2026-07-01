import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, loginWithGoogle } from '../api/auth';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import LoadingSpinner from '../components/LoadingSpinner';
import styles from './Auth.module.css';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

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
      // Trigger popup immediately before any state updates so browsers don't block it
      const result = await signInWithPopup(auth, googleProvider);
      setLoading(true);
      
      const idToken = await result.user.getIdToken();
      const data = await loginWithGoogle(idToken);
      localStorage.setItem('swap_token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
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
