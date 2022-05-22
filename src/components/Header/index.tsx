import Link from 'next/link';
import styles from './header.module.scss';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <img className={styles.logo} src="/assets/logo.svg" alt="logo"/>
          </a>
        </Link>
      </div>
    </header>
  );
}

export default Header