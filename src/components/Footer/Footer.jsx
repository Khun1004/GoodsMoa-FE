import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaLocationArrow, FaMobileAlt } from "react-icons/fa";
import footerLogo from "../../assets/logo.png";
import "./Footer.css";

const FooterLinks = [
  {
    id: 1,
    title: "품",
    link: "/",
  },
  {
    id: 2,
    title: "커미션/판매",
    link: "/commission",
  },
  {
    id: 3,
    title: "중고거래",
    link: "/trade",
  },
  {
    id: 4,
    title: "쇼츠",
    link: "/shorts",
  },
  {
    id: 5,
    title: "커뮤니티",
    link: "/community",
  },
];

const Footer = () => {
  return (
    <div className="footer-wrapper">
      <div className="footer-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#064e3b" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* Company Details */}
            <div className="footer-company" data-aos="fade-right">
              <h1 className="footer-title">
                <img src={footerLogo} alt="굿즈모아 로고" className="footer-logo" />
                굿즈모아
              </h1>
              <p className="footer-description">굿즈모아를 이용해 주셔서 감사드립니다.</p>
              <p className="footer-description">많이 관심 부탁드립니다~~</p>
              
              <div className="footer-social-main">
                <a href="#" className="social-icon-wrapper">
                  <FaInstagram className="social-icon" />
                </a>
                <a href="#" className="social-icon-wrapper">
                  <FaFacebook className="social-icon" />
                </a>
                <a href="#" className="social-icon-wrapper">
                  <FaLinkedin className="social-icon" />
                </a>
              </div>
            </div>

            {/* Footer Links */}
            <div className="footer-links-section" data-aos="fade-up">
              <h2 className="footer-section-title">바로가기</h2>
              <ul className="footer-links-list">
                {FooterLinks.map((link) => (
                  <li className="footer-link" key={link.id}>
                    <a href={link.link}>{link.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-section" data-aos="fade-up" data-aos-delay="100">
              <h2 className="footer-section-title">커뮤니티</h2>
              <ul className="footer-links-list">
                <li className="footer-link"><a href="/notice">공지사항</a></li>
                <li className="footer-link"><a href="/faq">자주 묻는 질문</a></li>
                <li className="footer-link"><a href="/events">이벤트</a></li>
                <li className="footer-link"><a href="/support">고객지원</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-contact" data-aos="fade-left">
              <h2 className="footer-section-title">연락처</h2>
              <div className="contact-info">
                <div className="contact-item">
                  <FaLocationArrow className="contact-icon" />
                  <p>South Korea</p>
                </div>
                <div className="contact-item">
                  <FaMobileAlt className="contact-icon" />
                  <p>+82 1234 5678</p>
                </div>
              </div>
              
              <div className="footer-newsletter">
                <h3 className="newsletter-title">뉴스레터 구독</h3>
                <div className="newsletter-form">
                  <input type="email" placeholder="이메일 주소" className="newsletter-input" />
                  <button className="newsletter-button">구독</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p className="copyright">© {new Date().getFullYear()} 굿즈모아. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;