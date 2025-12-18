import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type Chapter = {
  emoji: string;
  title: string;
  description: string;
  link: string;
  color: string;
};

const chapters: Chapter[] = [
  {
    emoji: '🤖',
    title: 'Introduction to Physical AI',
    description: 'What is Physical AI? Components, History, Applications & Challenges',
    link: '/docs/introduction',
    color: '#FF6B6B',
  },
  {
    emoji: '🔧',
    title: 'ROS 2 Fundamentals',
    description: 'Nodes, Topics, Services, Actions, Workspace Setup & Best Practices',
    link: '/docs/ros2-fundamentals',
    color: '#4ECDC4',
  },
  {
    emoji: '🌐',
    title: 'Gazebo Simulation',
    description: 'Why Simulation? World & Models, URDF Format, Sensors & Integration',
    link: '/docs/gazebo-simulation',
    color: '#45B7D1',
  },
  {
    emoji: '🚀',
    title: 'NVIDIA Isaac Platform',
    description: 'Isaac Sim, Perception, Navigation, Manipulation & Domain Randomization',
    link: '/docs/nvidia-isaac',
    color: '#F7B801',
  },
  {
    emoji: '🧠',
    title: 'Vision-Language-Action Models',
    description: 'VLA Architecture, Training, Applications, Challenges & Real-world Deployment',
    link: '/docs/vision-language-action',
    color: '#95E1D3',
  },
  {
    emoji: '🎯',
    title: 'Capstone Project',
    description: 'End-to-End System, Perception, Planning, Control & Testing Evaluation',
    link: '/docs/capstone-project',
    color: '#C7CEEA',
  },
];

function ChapterCard({emoji, title, description, link, color}: Chapter) {
  return (
    <Link to={link} className={styles.cardLink}>
      <div
        className={styles.card}
        style={{
          borderLeftColor: color,
        } as React.CSSProperties}
        data-color={color}
      >
        <div className={styles.cardEmoji}>{emoji}</div>
        <div className={styles.cardContent}>
          <Heading as="h3" className={styles.cardTitle}>
            {title}
          </Heading>
          <p className={styles.cardDescription}>{description}</p>
        </div>
        <div className={styles.cardArrow} style={{color}}>→</div>
      </div>
    </Link>
  );
}

export default function ChaptersGrid(): ReactNode {
  return (
    <section className={styles.chaptersSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">📚 Explore All Chapters</Heading>
          <p>Master Physical AI & Humanoid Robotics with ROS 2, Simulation, and AI</p>
        </div>
        <div className={styles.chaptersGrid}>
          {chapters.map((chapter, idx) => (
            <ChapterCard key={idx} {...chapter} />
          ))}
        </div>
      </div>
    </section>
  );
}
