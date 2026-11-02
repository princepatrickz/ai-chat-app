import React from "react";
import styles from '../../../assets/styles/header.module.scss'

const Header = ({ logoUrl }) => {
  return (
    <header className={styles.header}>
      {/* Top Utility Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.contactInfo}>
            <span>📞 Hotline: (02) 8250 4848</span>
            <span>⏰ Mon - Fri: 9:00 AM - 6:00 PM</span>
          </div>
          <div>
            <span>PH | English</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <img src={logoUrl} alt="MYEG Philippines" className={styles.logo} />
        </div>

        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <a href="#government">Government Services</a>
          </li>
          <li className={styles.navItem}>
            <a href="#insurance">Insurance</a>
          </li>
          <li className={styles.navItem}>
            <a href="#payment-gateway">Payment Gateway</a>
          </li>
          <li className={styles.navItem}>
            <a href="#about">About Us</a>
          </li>
        </ul>

        <div className={styles.navActions}>
          <button className={styles.btnOutline}>Check Status</button>
          <button className={styles.btnPrimary}>Login / Register</button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
