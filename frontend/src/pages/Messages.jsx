import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MessageBubble from '../components/MessageBubble';
import EmptyState from '../components/EmptyState';
import { listMatches } from '../api/matches';
import { listMessages, sendMessage } from '../api/messages';
import { getMatchSchedules, createSchedule, acceptSchedule } from '../api/schedules';
import { createReview } from '../api/reviews';
import { getMe } from '../api/auth';
import client from '../api/client';
import styles from './Messages.module.css';

export default function Messages() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [input, setInput] = useState('');
  
  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
    listMatches(100, 0).then(data => setMatches(data.matches)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!matchId) return;

    const fetchMessages = async () => {
      try {
        const data = await listMessages(matchId, 100, 0);
        setMessages(data.messages);
        
        const schedData = await getMatchSchedules(matchId);
        setSchedules(schedData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !matchId) return;
    try {
      await sendMessage(matchId, input);
      setInput('');
      const data = await listMessages(matchId, 100, 0);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleDate || !matchId) return;
    try {
      await createSchedule(matchId, new Date(scheduleDate).toISOString());
      setShowScheduleModal(false);
      setScheduleDate('');
      const schedData = await getMatchSchedules(matchId);
      setSchedules(schedData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptSchedule = async (schedId) => {
    try {
      await acceptSchedule(schedId);
      const schedData = await getMatchSchedules(matchId);
      setSchedules(schedData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!matchId) return;
    try {
      await createReview(matchId, parseInt(reviewRating), reviewComment);
      setShowReviewModal(false);
      alert('Review submitted successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to submit review');
    }
  };

  const markComplete = async () => {
    try {
      await client.patch(`/matches/${matchId}`, { status: 'completed' });
      listMatches(100, 0).then(data => setMatches(data.matches)).catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedMatch = matches.find(m => m.id === matchId);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Active Matches</h3>
          {matches.length === 0 ? (
            <p className={styles.noMatches}>No matches yet.</p>
          ) : (
            matches.map(m => (
              <div 
                key={m.id} 
                className={`${styles.matchItem} ${m.id === matchId ? styles.activeMatch : ''}`}
                onClick={() => navigate(`/messages/${m.id}`)}
              >
                <div className={styles.matchTitles}>
                  <span>{m.want_title}</span>
                  <span className={styles.arrow}>↔</span>
                  <span>{m.offer_title}</span>
                </div>
                <span className={styles.statusBadge}>{m.status}</span>
              </div>
            ))
          )}
        </div>

        <div className={styles.chatArea}>
          {!matchId ? (
            <EmptyState icon="💬" title="Your Messages" description="Select a match to start messaging." />
          ) : (
            <>
              <div className={styles.chatHeader}>
                {selectedMatch ? (
                  <>
                    <h4>{selectedMatch.want_title} ↔ {selectedMatch.offer_title}</h4>
                    <div className={styles.headerActions}>
                      {selectedMatch.status === 'accepted' && (
                        <>
                          <button onClick={() => setShowScheduleModal(true)} className={styles.actionBtn}>Schedule</button>
                          <button onClick={markComplete} className={styles.completeBtn}>Mark Complete</button>
                        </>
                      )}
                      {selectedMatch.status === 'completed' && (
                        <button onClick={() => setShowReviewModal(true)} className={styles.actionBtn}>Leave Review</button>
                      )}
                    </div>
                  </>
                ) : (
                  <h4>Chat</h4>
                )}
              </div>
              
              {schedules.length > 0 && (
                <div className={styles.schedulesBar}>
                  <h5>Schedules</h5>
                  <div className={styles.scheduleList}>
                    {schedules.map(s => (
                      <div key={s.id} className={styles.scheduleItem}>
                        <span>{new Date(s.scheduled_at).toLocaleString()}</span>
                        <span className={styles.scheduleStatus}>{s.status}</span>
                        {s.status === 'proposed' && s.proposed_by_id !== user?.id && (
                          <button onClick={() => handleAcceptSchedule(s.id)} className={styles.acceptBtn}>Accept</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.messagesList}>
                {messages.length === 0 ? (
                  <div className={styles.emptyChat}>No messages yet. Say hello!</div>
                ) : (
                  messages.map(msg => (
                    <MessageBubble 
                      key={msg.id} 
                      body={msg.body} 
                      timestamp={msg.timestamp} 
                      isSent={user && msg.sender_id === user.id} 
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className={styles.inputArea}>
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Type a message..." 
                  className={styles.input}
                />
                <button type="submit" className={styles.sendBtn} disabled={!input.trim()}>Send</button>
              </form>
            </>
          )}
        </div>
        {/* Modals */}
        {showScheduleModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Propose a Schedule</h3>
              <form onSubmit={handleScheduleSubmit}>
                <input 
                  type="datetime-local" 
                  value={scheduleDate} 
                  onChange={e => setScheduleDate(e.target.value)} 
                  required
                  className={styles.modalInput}
                />
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                  <button type="submit" className={styles.saveBtn}>Propose</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showReviewModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Leave a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <label>Rating (1-5)</label>
                <select value={reviewRating} onChange={e => setReviewRating(e.target.value)} className={styles.modalInput}>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Terrible</option>
                </select>
                <textarea 
                  placeholder="Leave a comment (optional)..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className={styles.modalInput}
                  rows={4}
                />
                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowReviewModal(false)}>Cancel</button>
                  <button type="submit" className={styles.saveBtn}>Submit Review</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
