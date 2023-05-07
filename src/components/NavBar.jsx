import React from 'react'
import { Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";

function NavBar() {

  const logout = () => {
        localStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("is_admin");
        window.location.href = "https://myblog-3rwk.onrender.com/login";
    };
    return (
      <div>
        {localStorage.getItem("is_admin") === "true" ? (
          <Navbar bg="dark" variant="dark" expand="lg">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Item>
                  <NavLink to="/home" className="nav-link">
                    Home
                  </NavLink>
                </Nav.Item>
                <Nav.Item>
                  <NavLink to="/write" className="nav-link">
                    Write
                  </NavLink>
                </Nav.Item>
                {/* <Nav.Item>
                  <NavLink to="/aboutme" className="nav-link">
                    AboutMe
                  </NavLink>
                </Nav.Item> */}
                <Nav.Item>
                  <NavLink to="/logout" className="nav-link" onClick={logout}>
                    Logout
                  </NavLink>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        ) : (
          <Navbar bg="dark" variant="dark" expand="lg">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Item>
                  <NavLink exact to="/home" className="nav-link">
                    Home
                  </NavLink>
                </Nav.Item>
                {/* <Nav.Item>
                  <NavLink exact to="/aboutme" className="nav-link">
                    AboutMe
                  </NavLink>
                </Nav.Item> */}
                <Nav.Item>
                  <NavLink
                    to="https://myblog-3rwk.onrender.com/logout"
                    className="nav-link"
                    onClick={logout}
                  >
                    Logout
                  </NavLink>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        )}
      </div>
    );
};

export default NavBar;
