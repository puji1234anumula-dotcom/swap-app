import styles from './MatchCard.module.css';

export default function MatchCard({ match, onMessageClick }) {
  const isMutual = match.mutual;
  
  const statusColors = {
    pending: styles.statusPending,
    accepted: styles.statusAccepted,
    completed: styles.statusCompleted,
    declined: styles.statusDeclined
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {isMutual && <span className={styles.mutualBadge}>Mutual Match</span>}
        <span className={`${styles.statusBadge} ${statusColors[match.status] || ''}`}>
          {match.status}
        </span>
      </div>
      
      <div className={styles.titles}>
        <div className={styles.titleBox}>
          <span className={styles.label}>They want</span>
          <strong>{match.want_title}</strong>
        </div>
        <div className={styles.arrow}>↔</div>
        <div className={styles.titleBox}>
          <span className={styles.label}>You offer</span>
          <strong>{match.offer_title}</strong>
        </div>
      </div>

      <button className={styles.messageBtn} onClick={() => onMessageClick(match.id)}>
        Message
      </button>
    </div>
  );
}
