import React from "react";
import Nav from "react-bootstrap/Nav";
import { NavLink, Outlet } from "react-router-dom";

import style from "../../../assets/styles/admin/settings.module.scss";

const navItems = [
  { label: "Overview", icon: "⌂", path: "/admin" },
  {
    label: "AI Service",
    icon: "✦",
    children: [
      { label: "Prompts", path: "/admin/ai/prompts" },
      { label: "Guardrails", path: "/admin/ai/guardrails" },
    ],
  },
  {
    label: "Knowledge",
    icon: "▣",
    children: [
      { label: "Documents", path: "/admin/knowledge/documents" },
      { label: "Retrieval", path: "/admin/knowledge/retrieval" },
    ],
  },
  { label: "Conversations", icon: "◌", path: "/admin/conversations" },
  { label: "Analytics", icon: "▥", path: "/admin/analytics" },
];

const ChatSettings = () => {
  return (
    <div className={style["container"]}>
      <aside className={style["admin-sidebar"]}>
        <div className={style["sidebar-brand"]}>
          <div className={style["brand-icon"]}>AI</div>
          <div className={style["brand-info"]}>
            <span className={style["brand-title"]}>AI Service</span>
            <span className={style["brand-subtitle"]}>Administration</span>
          </div>
        </div>
        <div className={style["sidebar-divider"]} />
        <nav className={style["sidebar-nav"]}>
          {navItems.map((item) => (
            <div className={style["nav-group"]} key={item.label}>
              {item.path ? (
                <NavLink
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    style[`nav-item ${isActive ? "active" : ""}`]
                  }
                >
                  <div className={style["nav-parent"]}>
                    <span className={style["nav-icon"]}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              ) : (
                <>
                  <div className={style["nav-section-title"]}>
                    <span className={style["nav-icon"]}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <div className={style["nav-children"]}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          style[`nav-child ${isActive ? "active" : ""}`]
                        }
                      >
                        <span> {child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>
        {/* <div className={style["sidebar-bottom"]}>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              style[`nav-item ${isActive ? "active" : ""}`]
            }
          >
            <span className={style["nav-icon"]}>⚙</span> <span>Settings</span>
          </NavLink>
          <div className={style["admin-profile"]}>
            <div className={style["profile-avatar"]}> A </div>
            <div className={style["profile-info"]}>
              <span className={style["profile-name"]}>Administrator</span>
              <span className={style["profile-role"]}>System Admin</span>
            </div>
            <button className={style["profile-menu"]}> ⋮ </button>
          </div>
        </div> */}
      </aside>

      <main className={style["admin-main"]}>
        <header className={style["admin-topbar"]}>
          <div>
            <h1>AI Service</h1>
            <p>Manage your AI customer service system</p>
          </div>
        </header>
        <section className={style["admin-content"]}>
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default ChatSettings;
