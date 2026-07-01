import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';
import TagPill from '../components/TagPill';
import EmptyState from '../components/EmptyState';
import { listOffers } from '../api/offers';
import styles from './Browse.module.css';

export default function Browse() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchOffers(0, true);
  }, []);

  const fetchOffers = async (currentOffset, category = selectedCategory, replace = false) => {
    try {
      const data = await listOffers(20, currentOffset, category || null);
      if (replace) {
        setOffers(data.items);
      } else {
        setOffers(prev => [...prev, ...data.items]);
      }
      setHasMore(data.items.length === 20);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let filtered = offers;
    if (search) {
      filtered = filtered.filter(o => o.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedTag) {
      filtered = filtered.filter(o => o.tags.includes(selectedTag));
    }
    setFilteredOffers(filtered);
  }, [offers, search, selectedTag]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setOffset(0);
    fetchOffers(0, category, true);
  };

  const handleLoadMore = () => {
    const newOffset = offset + 20;
    setOffset(newOffset);
    fetchOffers(newOffset);
  };

  const allTags = [...new Set(offers.flatMap(o => o.tags))];

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h2>Browse Skills</h2>
          <input 
            type="text" 
            placeholder="Search by title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <select 
            value={selectedCategory} 
            onChange={handleCategoryChange}
            className={styles.categorySelect}
          >
            <option value="">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Language">Language</option>
            <option value="Music">Music</option>
            <option value="Arts & Crafts">Arts & Crafts</option>
            <option value="Cooking">Cooking</option>
            <option value="Business">Business</option>
            <option value="Fitness">Fitness</option>
          </select>
        </div>

        {allTags.length > 0 && (
          <div className={styles.tagsContainer}>
            <TagPill 
              tag="All" 
              onClick={() => setSelectedTag(null)} 
            />
            {allTags.map(tag => (
              <TagPill 
                key={tag} 
                tag={tag} 
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} 
              />
            ))}
          </div>
        )}

        <div className={styles.grid}>
          {filteredOffers.length === 0 ? (
            <div className={styles.emptyWrapper}>
              <EmptyState icon="🔍" title="No results found" description="Try adjusting your search or filters." />
            </div>
          ) : (
            filteredOffers.map(offer => (
              <SkillCard 
                key={offer.id} 
                title={offer.title} 
                category={offer.category}
                tags={offer.tags} 
                description={offer.description} 
                userId={offer.user_id} 
                createdAt={offer.created_at} 
              />
            ))
          )}
        </div>

        {hasMore && filteredOffers.length > 0 && (
          <div className={styles.loadMore}>
            <button className={styles.loadBtn} onClick={handleLoadMore}>Load More</button>
          </div>
        )}
      </main>
    </div>
  );
}
