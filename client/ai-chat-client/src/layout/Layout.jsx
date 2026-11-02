import React, { useState, useEffect } from "react";
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Offcanvas,
} from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import style from "../assets/styles/layout.module.scss";
import { Outlet } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";
import { useChatHook } from "../hooks/useChatHook";
import chatIcon from "../assets/img/customer-service.png";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "../auth/authSlice";
import logoUrl from "../assets/img/myeg-logo.png";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { onCreateConversation } = useChatHook();

  const user = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const getInitials = () => {
    console.log(user);
    if (user.firstname || user.lastname)
      return user?.firstname[0].toUpperCase() + user?.lastname[0].toUpperCase();
  };

  const onLogout = () => {
    localStorage.clear();
    dispatch(clearCredentials());
  };

  return (
    <>
      <header className={style.header}>
        {/* Top Bar */}
        <div className={style.topBar}>
          <div className={style.topBarContent}>
            <div className={style.contactInfo}>
              <span>📞 Hotline: (02) 8250 4848</span>
              <span>⏰ Mon - Fri: 9:00 AM - 6:00 PM</span>
            </div>
            <div>
              <span>PH | English</span>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <nav className={style.navbar}>
          <div className={style.logoContainer}>
            <img src={logoUrl} alt="MYEG Philippines" className={style.logo} />
          </div>

          <ul className={style.navList}>
            <li className={style.navItem}>
              <a href="#government">Government Services</a>
            </li>
            <li className={style.navItem}>
              <a href="#insurance">Insurance</a>
            </li>
            <li className={style.navItem}>
              <a href="#payment-gateway">Payment Gateway</a>
            </li>
            <li className={style.navItem}>
              <a href="#about">About Us</a>
            </li>
          </ul>

          <div className={style.navActions}>
            {user.isAuthenticated ? (
              <div className={style.userSection}>
                <div
                  className={style.userBadge}
                  title={`${user.firstName} ${user.lastName}`}
                >
                  <div className={style.avatar}>
                    {getInitials(user.firstName, user.lastName)}
                  </div>
                  <span className={style.userName}>
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <button className={style.btnLogout} onClick={() => onLogout()}>
                  Logout
                </button>
              </div>
            ) : (
              <button
                className={style.btnPrimary}
                onClick={() => navigate("/login")}
              >
                Login / Register
              </button>
            )}
          </div>
        </nav>
      </header>

      <div className="w-100">
        <Outlet />
        {isOpen ? (
          <ChatWidget setIsOpen={setIsOpen} />
        ) : (
          <div className={style["chat-container"]}>
            <button
              className={style["chat-button"]}
              onClick={() => {
                if (!isOpen) {
                  onCreateConversation();
                  setIsOpen(true);
                }
              }}
            >
              <img src={chatIcon} />
            </button>
            <span>Need Help?</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;
