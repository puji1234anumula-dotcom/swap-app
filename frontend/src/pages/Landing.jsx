import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';
import styles from './Landing.module.css';

const MOCK_SKILLS = [
  { id: 1, title: 'Learn Python', tags: ['Python', 'Programming'], description: 'I can teach you Python basics in exchange for Spanish lessons.', userId: '12345678', createdAt: new Date().toISOString() },
  { id: 2, title: 'Guitar Lessons', tags: ['Music', 'Guitar'], description: 'Experienced guitarist looking to learn web design.', userId: '87654321', createdAt: new Date().toISOString() },
  { id: 3, title: 'Web Design', tags: ['Design', 'UI/UX'], description: 'Figma and UI/UX basics.', userId: '56781234', createdAt: new Date().toISOString() },
  { id: 4, title: 'Spanish Tutoring', tags: ['Language', 'Spanish'], description: 'Native Spanish speaker.', userId: '23456781', createdAt: new Date().toISOString() },
  { id: 5, title: 'Yoga Basics', tags: ['Fitness', 'Yoga'], description: 'Certified yoga instructor.', userId: '34567812', createdAt: new Date().toISOString() },
  { id: 6, title: 'Cooking: Italian', tags: ['Cooking', 'Italian'], description: 'Learn to make authentic pasta.', userId: '45678123', createdAt: new Date().toISOString() },
];

export default function Landing() {
  const { t } = useTranslation();
  
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.headline}>{t('hero_headline')}</h1>
          <p className={styles.subheadline}>{t('hero_subheadline')}</p>
          <Link to="/auth" className={styles.cta}>{t('hero_cta')}</Link>
        </section>

        <section className={styles.howItWorks}>
          <h2>{t('how_it_works_title')}</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <h3>{t('step_1_title')}</h3>
              <p>{t('step_1_desc')}</p>
            </div>
            <div className={styles.step}>
              <h3>{t('step_2_title')}</h3>
              <p>{t('step_2_desc')}</p>
            </div>
            <div className={styles.step}>
              <h3>{t('step_3_title')}</h3>
              <p>{t('step_3_desc')}</p>
            </div>
          </div>
        </section>

        <section className={styles.featured}>
          <h2>{t('featured_skills')}</h2>
          <div className={styles.grid}>
            {MOCK_SKILLS.map(skill => (
              <SkillCard key={skill.id} {...skill} />
            ))}
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <p>SWAP &copy; 2026 &mdash; Trade what you know.</p>
      </footer>
    </div>
  );
}
