import styles from './MessageBubble.module.css';

export default function MessageBubble({ body, timestamp, isSent }) {
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`${styles.wrapper} ${isSent ? styles.sentWrapper : styles.receivedWrapper}`}>
      <div className={`${styles.bubble} ${isSent ? styles.sent : styles.received}`}>
        <p className={styles.body}>{body}</p>
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  );
}
