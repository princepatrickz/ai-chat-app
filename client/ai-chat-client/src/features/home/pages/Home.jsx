import React, { useState } from "react";
import Header from "./Header";
import styles from "../../../assets/styles/home.module.scss";
import { useSelector } from "react-redux";
import myegLogo from "../../../assets/img/myeg-logo.png";

const Home = () => {
  const [transactionRef, setTransactionRef] = useState("");
  const user = useSelector((state) => state.auth);

  const services = [
    {
      title: "SSS Contributions & Loans",
      desc: "Pay SSS loans and generated PRN contributions seamlessly online.",
      icon: "📄",
      link: "#",
    },
    {
      title: "NBI Clearance Application",
      desc: "Schedule appointments, renew online, and opt for door-to-door delivery.",
      icon: "🛡️",
      link: "#",
    },
    {
      title: "BIR Tax Payments",
      desc: "Settle income tax, registration fees, and penalties conveniently.",
      icon: "🏛️",
      link: "#",
    },
    {
      title: "PhilHealth Premiums",
      desc: "Hassle-free online payment for your monthly premium contributions.",
      icon: "🏥",
      link: "#",
    },
    {
      title: "TIEZA Travel Tax",
      desc: "Pay travel taxes ahead of time and apply for reduced tax rates online.",
      icon: "✈️",
      link: "#",
    },
    {
      title: "Digital Insurance",
      desc: "Comprehensive coverage including Health, Travel, and Burial Assistance.",
      icon: "🔒",
      link: "#",
    },
  ];

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          {/* Left Hero Text */}
          <div className={styles.heroText}>
            <h1>
              One-Stop Online <span>Government Solutions</span>
            </h1>
            <p>
              Perform government transactions, settle fees, and access secure
              payment gateway services anytime, anywhere in the Philippines.
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.primaryBtn}>Explore Services</button>
              <button className={styles.secondaryBtn}>Partner With Us</button>
            </div>
          </div>

          {/* Right Card Panel: Conditional Content to Keep Layout Full */}
          {user.isAuthenticated ? (
            <div className={styles.heroCard}>
              <h3>Track Transaction Status</h3>
              <div className={styles.searchGroup}>
                <select>
                  <option value="">Select Service Category</option>
                  <option value="nbi">NBI Clearance</option>
                  <option value="sss">SSS Contribution / Loan</option>
                  <option value="bir">BIR Tax Payment</option>
                  <option value="tieza">TIEZA Travel Tax</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter Reference Number"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
                <button>Verify Payment</button>
              </div>
            </div>
          ) : (
            /* Unauthenticated Fallback Card to prevent plain empty space */
            <div className={styles.heroQuickCard}>
              <h3>Popular Online Services</h3>
              <ul className={styles.quickLinks}>
                <li>
                  <a href="#sss">📄 SSS Loans & PRN Contributions</a>
                </li>
                <li>
                  <a href="#nbi">🛡️ NBI Clearance Renewal</a>
                </li>
                <li>
                  <a href="#bir">🏛️ BIR Income Tax Payment</a>
                </li>
                <li>
                  <a href="#tieza">✈️ TIEZA Travel Tax Online</a>
                </li>
              </ul>
              <p className={styles.loginHint}>
                Log in to track existing transactions and view payment history.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Services Section */}
      <section className={styles.servicesSection} id="government">
        <div className={styles.sectionHeader}>
          <h2>Popular Services</h2>
          <p>
            Fast, easy, and secure digital processing for key Philippine
            agencies.
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((item, idx) => (
            <div className={styles.serviceCard} key={idx}>
              <div className={styles.iconWrapper}>{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              <a href={item.link} className={styles.cardLink}>
                Proceed Online &rarr;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Key Numbers / Network Stats */}
      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.statItem}>
            <h3>100,000+</h3>
            <p>Over-The-Counter Channels</p>
          </div>
          <div className={styles.statItem}>
            <h3>100%</h3>
            <p>Encrypted & Secure</p>
          </div>
          <div className={styles.statItem}>
            <h3>10+</h3>
            <p>Partner Government Agencies</p>
          </div>
          <div className={styles.statItem}>
            <h3>24/7</h3>
            <p>Online Payment Accessibility</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
