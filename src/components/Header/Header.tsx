import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header: React.FC = () => {
    const [logoHovered, setLogoHovered] = useState(false);

    const handleLogoMouseEnter = () => setLogoHovered(true);
    const handleLogoMouseLeave = () => setLogoHovered(false);

    return (
      <header className="header">
          <div className="header-inner">
              {/* 로고 영역 (화면 왼쪽 끝) */}
              <div className="logo-container">
                  <Link
                    to="/"
                    className={logoHovered ? "logo logo-hovered" : "logo"}
                    onMouseEnter={handleLogoMouseEnter}
                    onMouseLeave={handleLogoMouseLeave}
                  >
                      <svg
                        version="1.1"
                        id="myRealEstateLogo"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        x="0px"
                        y="0px"
                        viewBox="0 0 300 100"
                        xmlSpace="preserve"
                        className="logo-image"
                      >
                          <title>My Real Estate Logo</title>
                          <style type="text/css">
                              {`
                  .house { fill: #004080; }
                  .logo-text { 
                    fill: #333333; 
                    font-family: 'Poppins', sans-serif; 
                    font-size: 30px; 
                    dominant-baseline: middle;
                  }
                `}
                          </style>
                          {/* 집 모양 아이콘 */}
                          <path className="house" d="M50,70 L50,45 L65,30 L80,45 L80,70 Z" />
                          {/* 로고 텍스트 */}
                          <text x="90" y="55" className="logo-text">
                              My Real Estate
                          </text>
                      </svg>
                  </Link>
              </div>

              {/* 네비게이션 영역 (화면 오른쪽 끝) */}
              <div className="nav-container">
                  <nav className="nav">
                      <ul>
                          <li>
                              <Link to="/">Home</Link>
                          </li>
                          <li>
                              <a href="#listings">Listings</a>
                          </li>
                          <li>
                              <a href="#contact">Contact</a>
                          </li>
                          <li>
                              <Link to="/manage">매물 목록</Link>
                          </li>
                      </ul>
                  </nav>
              </div>
          </div>
      </header>
    );
};

export default Header;
