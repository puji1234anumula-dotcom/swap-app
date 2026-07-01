import TagPill from './TagPill';
import styles from './SkillCard.module.css';

export default function SkillCard({ title, category, tags = [], description, userId, createdAt }) {
  const date = createdAt ? new Date(createdAt).toLocaleDateString() : '';
  const displayId = userId ? userId.substring(0, 8) : 'Unknown';

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      
      {category && (
        <div className={styles.categoryBadge}>{category}</div>
      )}
      
      {tags && tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map(tag => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
      )}
      
      {description && (
        <p className={styles.description}>{description}</p>
      )}
      
      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar} />
          <span>User {displayId}</span>
        </div>
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  );
}
