import React, { useState } from "react";
import style from "../../../assets/styles/home.module.scss";
import { useNavigate } from "react-router-dom";

const stats = [
  { value: "99.99%", label: "Platform uptime" },
  { value: "120+", label: "Payment methods" },
  { value: "150+", label: "Countries supported" },
  { value: "24/7", label: "Customer support" },
];

const paymentMethods = [
  { icon: "VISA", label: "Cards" },
  { icon: "⌁", label: "Bank transfer" },
  { icon: "◉", label: "E-wallets" },
  { icon: "QR", label: "QR payments" },
];

const transactions = [
  {
    name: "Acme Store",
    type: "Card payment",
    amount: "+₱12,480",
    status: "Completed",
    time: "Just now",
  },
  {
    name: "Cloud Services",
    type: "Bank transfer",
    amount: "+₱8,920",
    status: "Completed",
    time: "2 min ago",
  },
  {
    name: "Maya Market",
    type: "E-wallet",
    amount: "+₱4,650",
    status: "Completed",
    time: "5 min ago",
  },
];

function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <main className={style["home"]}>
      <section className={style["hero"]}>
        <div className={style["hero-glow hero-glow-one"]} />
        <div className={style["hero-glow hero-glow-two"]} />

        <div className={style["hero-copy"]}>
          <div className={style["eyebrow"]}>
            <span className={style["eyebrow-dot"]} />
            Payments infrastructure for modern business
          </div>

          <h1>
            Move money.
            <br />
            <span>Move business.</span>
          </h1>

          <p className={style["hero-description"]}>
            A simple, secure payment gateway built to help businesses accept
            payments, manage transactions, and grow without friction.
          </p>

          <div className={style["hero-actions"]}>
            <button className={style["primary-button"]} type="button">
              Start accepting payments <span>→</span>
            </button>
            <button className={style["secondary-button"]} type="button">
              Talk to an expert
            </button>
          </div>

          <div className={style["hero-trust"]}>
            <div className={style["avatars"]}>
              <span>JD</span>
              <span>MK</span>
              <span>AL</span>
              <span>+</span>
            </div>
            <div>
              <strong>Trusted by 8,000+ businesses</strong>
              <small>from startups to enterprise</small>
            </div>
          </div>
        </div>

        <div
          className={style["hero-dashboard"]}
          aria-label="Payment dashboard preview"
        >
          <div className={style["dashboard-card dashboard-main"]}>
            <div className={style["dashboard-top"]}>
              <div>
                <span className={style["muted-label"]}>Available balance</span>
                <strong className={style["balance"]}>₱1,284,620.80</strong>
              </div>
              <button className={style["more-button"]} type="button">
                •••
              </button>
            </div>

            <div className={style["chart-wrap"]}>
              <div className={style["chart-labels"]}>
                <span>₱1.4M</span>
                <span>₱1.0M</span>
                <span>₱600K</span>
                <span>₱200K</span>
              </div>
              <svg
                className={style["chart"]}
                viewBox="0 0 500 180"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#79e2bd" stopOpacity=".28" />
                    <stop offset="100%" stopColor="#79e2bd" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className={style["grid-line"]}
                  d="M0 20H500 M0 70H500 M0 120H500 M0 170H500"
                />
                <path
                  className={style["area"]}
                  d="M0 135 C35 122 40 145 70 125 S115 80 145 105 S190 75 220 92 S255 112 280 72 S320 86 345 58 S385 78 415 48 S455 40 500 22 V180 H0Z"
                />
                <path
                  className={style["line"]}
                  d="M0 135 C35 122 40 145 70 125 S115 80 145 105 S190 75 220 92 S255 112 280 72 S320 86 345 58 S385 78 415 48 S455 40 500 22"
                />
                <circle cx="500" cy="22" r="5" />
              </svg>
              <div className={style["chart-months"]}>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
              </div>
            </div>

            <div className={style["dashboard-bottom"]}>
              <div>
                <span className={style["muted-label"]}>This month</span>
                <strong>
                  ₱426,820 <em>+18.4%</em>
                </strong>
              </div>
              <span className={style["period"]}>Last 6 months⌄</span>
            </div>
          </div>

          <div className={style["dashboard-card transaction-card"]}>
            <div className={style["transaction-header"]}>
              <div>
                <strong>Recent transactions</strong>
                <span>Live activity</span>
              </div>
              <span className={style["live-pill"]}>
                <i /> Live
              </span>
            </div>

            <div className={style["transaction-list"]}>
              {transactions.map((transaction) => (
                <div className={style["transaction"]} key={transaction.name}>
                  <div className={style["transaction-icon"]}>
                    {transaction.name.slice(0, 1)}
                  </div>
                  <div className={style["transaction-info"]}>
                    <strong>{transaction.name}</strong>
                    <span>
                      {transaction.type} · {transaction.time}
                    </span>
                  </div>
                  <div className={style["transaction-amount"]}>
                    <strong>{transaction.amount}</strong>
                    <span>{transaction.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={style["floating-success"]}>
            <span className={style["success-icon"]}>✓</span>
            <div>
              <strong>Payment received</strong>
              <small>₱24,500.00 · just now</small>
            </div>
          </div>
        </div>
      </section>

      <section className={style["stats-strip"]}>
        {stats.map((stat) => (
          <div className={style["stat"]} key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className={style["payments-section"]} id="payments">
        <div className={style["section-heading"]}>
          <div>
            <span className={style["section-kicker"]}>ONE INTEGRATION</span>
            <h2>
              Every payment.
              <br />
              <span>One platform.</span>
            </h2>
          </div>
          <p>
            Give customers more ways to pay while keeping your operations
            simple. Payflow brings your payment methods into one reliable stack.
          </p>
        </div>

        <div className={style["payment-grid"]}>
          {paymentMethods.map((method, index) => (
            <div className={style["payment-method"]} key={method.label}>
              <div className={style[`payment-logo logo-${index}`]}>
                {method.icon}
              </div>
              <div>
                <strong>{method.label}</strong>
                <span>Fast & secure</span>
              </div>
              <span className={style["arrow"]}>↗</span>
            </div>
          ))}
        </div>
      </section>

      <section className={style["security-section"]} id="solutions">
        <div className={style["security-visual"]}>
          <div className={style["security-orbit orbit-one"]} />
          <div className={style["security-orbit orbit-two"]} />
          <div className={style["security-core"]}>
            <span className={style["shield"]}>✓</span>
            <strong>Protected</strong>
            <small>Every transaction</small>
          </div>
          <div className={style["security-chip chip-one"]}>PCI DSS</div>
          <div className={style["security-chip chip-two"]}>256-bit SSL</div>
          <div className={style["security-chip chip-three"]}>Fraud Shield</div>
        </div>

        <div className={style["security-copy"]}>
          <span className={style["section-kicker"]}>BUILT FOR TRUST</span>
          <h2>
            Security shouldn't
            <br />
            <span>slow you down.</span>
          </h2>
          <p>
            Protect customer data and transactions with security controls
            designed into every layer of the payment experience.
          </p>
          <div className={style["feature-list"]}>
            <div>
              <span>✓</span>
              <div>
                <strong>Intelligent fraud protection</strong>
                <small>
                  Detect suspicious activity before it becomes a problem.
                </small>
              </div>
            </div>
            <div>
              <span>✓</span>
              <div>
                <strong>Enterprise-grade encryption</strong>
                <small>
                  Keep sensitive payment information protected end to end.
                </small>
              </div>
            </div>
            <div>
              <span>✓</span>
              <div>
                <strong>Real-time transaction monitoring</strong>
                <small>
                  See what's happening across your payment flow instantly.
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={style["developer-section"]} id="developers">
        <div className={style["developer-copy"]}>
          <span className={style["section-kicker"]}>FOR DEVELOPERS</span>
          <h2>
            Payments that
            <br />
            <span>feel effortless.</span>
          </h2>
          <p>
            Clean APIs, predictable responses, and developer-friendly tools let
            your team launch a payment experience without unnecessary
            complexity.
          </p>
          <button className={style["outline-button"]} type="button">
            Explore the API <span>→</span>
          </button>
        </div>

        <div className={style["code-window"]}>
          <div className={style["code-top"]}>
            <div className={style["window-dots"]}>
              <i />
              <i />
              <i />
            </div>
            <span>create-payment.js</span>
            <span>•••</span>
          </div>
          <pre>
            <code>{`const payment = await payflow.payments.create({
                  amount: 24500,
                  currency: "PHP",
                  customer: {
                    email: "customer@example.com"
                  },
                  payment_method: "card",
                  capture: true
                });

                console.log(payment.status);
                // → "succeeded"`}</code>
          </pre>
          <div className={style["code-status"]}>
            <span /> Request completed in 184ms
          </div>
        </div>
      </section>

      <section className={style["cta-section"]} id="company">
        <div className={style["cta-glow"]} />
        <span className={style["section-kicker"]}>READY WHEN YOU ARE</span>
        <h2>
          Build the payment experience
          <br />
          <span>your customers deserve.</span>
        </h2>
        <p>
          Start with Payflow and turn every payment into a better customer
          experience.
        </p>
        <div className={style["cta-actions"]}>
          <button className={style["primary-button light"]} type="button">
            Create your account <span>→</span>
          </button>
          <button
            className={style["secondary-button light-border"]}
            type="button"
          >
            Contact sales
          </button>
        </div>
      </section>

      <footer className={style["footer"]}>
        <div className={style["footer-brand"]}>
          <a className={style["brand"]} href="/" aria-label="Payflow home">
            <span className={style["brand-mark"]}>
              <span />
              <span />
            </span>
            <span>payflow</span>
          </a>
          <p>Payment infrastructure for ambitious businesses.</p>
        </div>
        <div className={style["footer-links"]}>
          <div>
            <strong>Product</strong>
            <a href="#payments">Payments</a>
            <a href="#solutions">Security</a>
            <a href="#developers">API</a>
          </div>
          <div>
            <strong>Company</strong>
            <a href="#company">About</a>
            <a href="#company">Careers</a>
            <a href="#company">Contact</a>
          </div>
          <div>
            <strong>Resources</strong>
            <a href="#developers">Documentation</a>
            <a href="#company">Support</a>
            <a href="#company">Status</a>
          </div>
        </div>
        <div className={style["footer-bottom"]}>
          <span>© 2026 Payflow Technologies</span>
          <span>Privacy · Terms · Compliance</span>
        </div>
      </footer>

      <button
        className={style[`chat-launcher ${chatOpen ? "active" : ""}`]}
        type="button"
        onClick={() => setChatOpen((value) => !value)}
        aria-label="Open AI customer support"
      >
        {chatOpen ? "×" : "✦"}
        <span className={style["chat-tooltip"]}>
          {chatOpen ? "Close support" : "Ask Payflow AI"}
        </span>
      </button>

      {chatOpen && (
        <div className={style["mini-chat"]}>
          <div className={style["mini-chat-header"]}>
            <div className={style["assistant-avatar"]}>✦</div>
            <div>
              <strong>Payflow AI</strong>
              <span>Online · Here to help</span>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className={style["mini-chat-body"]}>
            <div className={style["assistant-message"]}>
              Hi! I'm Payflow AI. I can help with payments, refunds, transfers,
              account questions, and more.
            </div>
            <div className={style["suggestions"]}>
              <button type="button">How do refunds work?</button>
              <button type="button">
                What payment methods do you support?
              </button>
              <button type="button">I need help with a transaction</button>
            </div>
          </div>
          <div className={style["mini-chat-input"]}>
            <input placeholder="Ask a question..." />
            <button type="button" aria-label="Send">
              ↑
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Home;
