import styles from './TagPill.module.css';

export default function TagPill({ tag, onClick }) {
  return (
    <span 
      className={`${styles.pill} ${onClick ? styles.clickable : ''}`} 
      onClick={onClick}
    >
      {tag}
    </span>
  );
}
