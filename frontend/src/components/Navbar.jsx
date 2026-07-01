import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listNotifications } from '../api/notifications';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const token = localStorage.getItem('swap_token');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (token) {
      listNotifications(1, 0).then(data => {
        setUnread(data.unread || 0);
      }).catch(console.error);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('swap_token');
    navigate('/auth');
  };

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.leftNav}>
          <Link to="/" className={styles.logo}>SWAP</Link>
        </div>
        
        <div className={styles.links}>
          <select 
            className={styles.languageToggle} 
            value={i18n.language} 
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="ta">தமிழ் (Tamil)</option>
          </select>

          {token ? (
            <>
              <Link to="/browse" className={styles.link}>{t('nav_browse_skills')}</Link>
              <Link to="/messages" className={styles.link}>{t('nav_messages')}</Link>
              <Link to="/dashboard" className={styles.link}>{t('nav_dashboard')}</Link>
              <div className={styles.relative}>
                 <button className={styles.ghostBtn} onClick={handleLogout}>{t('nav_logout')}</button>
                 {unread > 0 && <span className={styles.badge}>{unread}</span>}
              </div>
            </>
          ) : (
            <>
              <span className={styles.link}>{t('nav_how_it_works')}</span>
              <Link to="/browse" className={styles.link}>{t('nav_browse_skills')}</Link>
              <Link to="/auth" className={styles.ghostBtn}>{t('nav_login')}</Link>
              <Link to="/auth" className={styles.btn}>{t('nav_get_started')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
