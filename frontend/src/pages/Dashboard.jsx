import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MatchCard from '../components/MatchCard';
import TagPill from '../components/TagPill';
import EmptyState from '../components/EmptyState';
import { getMe } from '../api/auth';
import { listOffers, createOffer, deleteOffer } from '../api/offers';
import { listWants, createWant, deleteWant } from '../api/wants';
import { listMatches } from '../api/matches';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [offers, setOffers] = useState([]);
  const [wants, setWants] = useState([]);
  const [matches, setMatches] = useState([]);
  
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showWantForm, setShowWantForm] = useState(false);
  
  const [newOffer, setNewOffer] = useState({ title: '', category: '', tags: '', description: '' });
  const [newWant, setNewWant] = useState({ title: '', category: '', tags: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const u = await getMe();
      setUser(u);
      const [o, w, m] = await Promise.all([
        listOffers(100, 0),
        listWants(100, 0),
        listMatches(100, 0)
      ]);
      setOffers(o.items.filter(item => item.user_id === u.id));
      setWants(w.items.filter(item => item.user_id === u.id));
      setMatches(m.matches);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newOffer.tags.split(',').map(t => t.trim()).filter(Boolean);
      await createOffer(newOffer.title, newOffer.category, tagsArray, newOffer.description);
      setNewOffer({ title: '', category: '', tags: '', description: '' });
      setShowOfferForm(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWant = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newWant.tags.split(',').map(t => t.trim()).filter(Boolean);
      await createWant(newWant.title, newWant.category, tagsArray, newWant.description);
      setNewWant({ title: '', category: '', tags: '', description: '' });
      setShowWantForm(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await deleteOffer(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWant = async (id) => {
    try {
      await deleteWant(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        {user && (
          <div className={styles.profileHeader}>
            <h2>Welcome back, {user.name}</h2>
            <div className={styles.statsRow}>
              <span className={styles.rating}>⭐ {user.average_rating ? user.average_rating.toFixed(1) : 'New'} ({user.review_count} reviews)</span>
              {user.badges && user.badges.length > 0 && (
                <div className={styles.badges}>
                  {user.badges.map(badge => (
                    <span key={badge} className={styles.badge} title={badge}>🏆 {badge}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className={styles.columns}>
          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <h3>My Offers</h3>
              <button className={styles.addBtn} onClick={() => setShowOfferForm(!showOfferForm)}>
                {showOfferForm ? 'Cancel' : '+ New Offer'}
              </button>
            </div>
            
            {showOfferForm && (
              <form onSubmit={handleCreateOffer} className={styles.formCard}>
                <input required placeholder="Title" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} />
                <select 
                  value={newOffer.category} 
                  onChange={e => setNewOffer({...newOffer, category: e.target.value})}
                  className={styles.categorySelect}
                >
                  <option value="">Select Category</option>
                  <option value="Technology">Technology</option>
                  <option value="Language">Language</option>
                  <option value="Music">Music</option>
                  <option value="Arts & Crafts">Arts & Crafts</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Business">Business</option>
                  <option value="Fitness">Fitness</option>
                </select>
                <input required placeholder="Tags (comma separated)" value={newOffer.tags} onChange={e => setNewOffer({...newOffer, tags: e.target.value})} />
                <textarea placeholder="Description" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} />
                <button type="submit" className={styles.saveBtn}>Save</button>
              </form>
            )}

            <div className={styles.list}>
              {offers.length === 0 && !showOfferForm ? (
                 <EmptyState icon="🎁" title="No offers yet" description="List skills you can teach others." />
              ) : (
                offers.map(offer => (
                  <div key={offer.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{offer.title}</h4>
                      {offer.category && <span className={styles.itemCategory}>{offer.category}</span>}
                      <div className={styles.actions}>
                        <button onClick={() => handleDeleteOffer(offer.id)}>🗑️</button>
                      </div>
                    </div>
                    <div className={styles.tags}>
                      {offer.tags.map(t => <TagPill key={t} tag={t} />)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <h3>My Wants</h3>
              <button className={styles.addBtn} onClick={() => setShowWantForm(!showWantForm)}>
                {showWantForm ? 'Cancel' : '+ New Want'}
              </button>
            </div>

            {showWantForm && (
              <form onSubmit={handleCreateWant} className={styles.formCard}>
                <input required placeholder="Title" value={newWant.title} onChange={e => setNewWant({...newWant, title: e.target.value})} />
                <select 
                  value={newWant.category} 
                  onChange={e => setNewWant({...newWant, category: e.target.value})}
                  className={styles.categorySelect}
                >
                  <option value="">Select Category</option>
                  <option value="Technology">Technology</option>
                  <option value="Language">Language</option>
                  <option value="Music">Music</option>
                  <option value="Arts & Crafts">Arts & Crafts</option>
                  <option value="Cooking">Cooking</option>
                  <option value="Business">Business</option>
                  <option value="Fitness">Fitness</option>
                </select>
                <input required placeholder="Tags (comma separated)" value={newWant.tags} onChange={e => setNewWant({...newWant, tags: e.target.value})} />
                <textarea placeholder="Description" value={newWant.description} onChange={e => setNewWant({...newWant, description: e.target.value})} />
                <button type="submit" className={styles.saveBtn}>Save</button>
              </form>
            )}

            <div className={styles.list}>
              {wants.length === 0 && !showWantForm ? (
                 <EmptyState icon="🎯" title="No wants yet" description="List skills you want to learn." />
              ) : (
                wants.map(want => (
                  <div key={want.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <h4>{want.title}</h4>
                      {want.category && <span className={styles.itemCategory}>{want.category}</span>}
                      <div className={styles.actions}>
                        <button onClick={() => handleDeleteWant(want.id)}>🗑️</button>
                      </div>
                    </div>
                    <div className={styles.tags}>
                      {want.tags.map(t => <TagPill key={t} tag={t} />)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <section className={styles.matchesSection}>
          <h2>My Matches</h2>
          {matches.length === 0 ? (
             <EmptyState icon="🤝" title="No matches yet" description="Add more offers and wants to find compatible partners." />
          ) : (
            <div className={styles.matchesGrid}>
              {matches.map(match => (
                <MatchCard key={match.id} match={match} onMessageClick={(id) => navigate(`/messages/${id}`)} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
