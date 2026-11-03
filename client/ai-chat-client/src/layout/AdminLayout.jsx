import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Offcanvas,
} from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import style from "../assets/styles/adminLayout.module.scss";
import logo from "../assets/img/myeg-logo.png";
import { FaUserCircle, FaUserCog, FaUserShield } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { TbLogout } from "react-icons/tb";
import { Outlet, useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { RiSecurePaymentFill } from "react-icons/ri";
import { TbReportSearch } from "react-icons/tb";
import { FaChartLine } from "react-icons/fa";
import { FaBookOpenReader } from "react-icons/fa6";
import { TiMessages } from "react-icons/ti";
import { RiNetworkFill } from "react-icons/ri";
import { ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { clearCredentials } from "../auth/authSlice";

const navItems = [
  { label: "Dashboard", icon: <MdDashboard />, path: "/admin/dashboard" },
  { label: "Payment Gateway", icon: <RiSecurePaymentFill />, path: "/admin" },
  { label: "Reports", icon: <TbReportSearch />, path: "/admin" },
  { label: "Services", icon: <RiNetworkFill />, path: "/admin" },
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
    icon: <FaBookOpenReader />,
    children: [
      { label: "Documents", path: "/admin/knowledge/documents" },
      { label: "Retrieval", path: "/admin/knowledge/retrieval" },
    ],
  },
  {
    label: "Conversations",
    icon: <TiMessages />,
    path: "/admin/conversations",
  },
  { label: "Analytics", icon: <FaChartLine />, path: "/admin/analytics" },
];

const getDropdownNav = (show, setShow, onLogout) => [
  {
    id: 1,
    url: "my-account",
    icon: <FaUserCog className={`${style["dropdown-icons"]} me-1`} />,
    label: "My Account",
  },
  {
    id: 2,
    url: "/account/user-management",
    icon: <FaUserShield className={`${style["dropdown-icons"]} me-1`} />,
    label: "Account Management",
  },
  {
    id: 3,
    url: "settings",
    icon: <IoMdSettings className={`${style["dropdown-icons"]} me-1`} />,
    label: "Settings",
  },
  {
    id: 4,
    url: "",
    icon: <TbLogout className={`${style["dropdown-icons"]} me-1`} />,
    label: "Logout",
    function: onLogout,
  },
];

const Layout = () => {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState();
  const [isTablet, setIsTablet] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsTablet(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    //to prevent offcanvass animation on refresh or first load of page
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    isTablet ? setShow(false) : setShow(true);
  }, [isTablet]);

  const onLogout = () => {
    localStorage.clear();
    dispatch(clearCredentials());
    navigate("/login");
  };

  const dropdownNav = getDropdownNav(show, setShow, onLogout);

  return (
    <div className={`${style["container"]} `}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        limit={2}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Offcanvas
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
        className={`off-canvass ${mounted ? "with-animation" : "no-animation"}`}
        placement="start"
        backdrop={false}
        scroll={true}
        enforceFocus={false}
        show={show}
        onHide={() => {
          setShow(!show);
        }}
      >
        <Offcanvas.Body className="d-flex flex-column">
          <Nav className="flex-column flex-grow-1 h-100 pe-3 g-5 align-items-start">
            <div className={style["sidebar-brand"]}>
              <div className={style["brand-icon"]}>AD</div>
              <div className={style["brand-info"]}>
                <span className={style["brand-title"]}>Admin Portal</span>
                <span className={style["brand-subtitle"]}>Administration</span>
              </div>
            </div>
            <div className={style["sidebar-divider"]} />

            {navItems.map((item) => (
              <div className={style["nav-group"]} key={item.label}>
                {item.path ? (
                  <NavLink
                    to={item.path}
                    // end={item.path === "/admin"}
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

            {isMobile && (
              <>
                <div
                  className="mt-auto text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  <hr className="w-100 border-3" />
                  {dropdownNav.map((item) => {
                    return (
                      <Nav.Link
                        key={item.id}
                        as={NavLink}
                        to={item.url}
                        //hidden={!isAllowed(item.roles)}
                        className={
                          location.pathname === item.url
                            ? "navlink-active"
                            : "navlink"
                        }
                        onClick={() => item.function?.()}
                      >
                        {item.icon} {item.label}
                      </Nav.Link>
                    );
                  })}
                </div>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <Navbar expand="false" className={style["navbar"]}>
        <Container fluid>
          <div className="d-flex align-items-center">
            <Navbar.Brand href="#">
              <img src={logo} style={{ width: "100px" }} />
            </Navbar.Brand>
            <Navbar.Toggle
              aria-controls="offcanvasNavbar"
              onClick={() => setShow(!show)}
            />
          </div>

          {!isMobile && (
            <NavDropdown
              className={`ms-auto ${style["nav-dropdown-menu"]}`}
              drop="down-centered"
              align="end"
              title={
                <>
                  <FaUserCircle className={style["navbar-dropdown-icon"]} />
                  Administrator
                  {/* {user.fullname} */}
                </>
              }
            >
              {dropdownNav.map((item) => {
                return (
                  <NavDropdown.Item
                    key={item.id}
                    as={item.url ? NavLink : Button}
                    to={item.url}
                    //hidden={!isAllowed(item.roles)}
                    className={
                      location.pathname === item.url
                        ? "navlink-active"
                        : "navlink"
                    }
                    onClick={() => item.function?.()}
                  >
                    {item.icon} {item.label}
                  </NavDropdown.Item>
                );
              })}
            </NavDropdown>
          )}
        </Container>
      </Navbar>

      <div
        className={`${style["main-content"]} ${show ? style["container-shift"] : ""}`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
