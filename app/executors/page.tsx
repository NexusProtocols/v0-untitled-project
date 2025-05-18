"use client"

import Link from "next/link"

export default function ExecutorsPage() {
  return (
    <div className="executors-page">
      <header>
        <div className="container header-container">
          <Link href="/" className="logo">
            NEXUS<span>.</span>
          </Link>
          <nav>
            <ul>
              <li>
                <Link href="/">
                  <i className="fas fa-home"></i> Home
                </Link>
              </li>
              <li>
                <Link href="/scripts">
                  <i className="fas fa-code"></i> Scripts
                </Link>
              </li>
              <li>
                <Link href="/key-generator">
                  <i className="fas fa-key"></i> Key
                </Link>
              </li>
              <li>
                <Link href="https://discord.gg/ZWCqcuxAv3">
                  <i className="fab fa-discord"></i> Discord
                </Link>
              </li>
              <li>
                <Link href="/premium-key">
                  <i className="fas fa-crown"></i> Premium Key
                </Link>
              </li>
              <li>
                <Link href="/executors" className="active">
                  <i className="fas fa-terminal"></i> Executors
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="executors">
        <div className="container">
          <div className="section-title">
            <h2>BEST EXECUTORS</h2>
            <p>Select from our range of powerful and undetectable script execution tools</p>
          </div>

          <div className="executors-grid">
            {/* Wave Executor */}
            <div className="executor-card featured">
              <span className="executor-badge">PAID</span>
              <img
                src="https://cdn.sellsn.io/142d60b2-b958-45f8-bc4c-a7ed326d6a15.png"
                alt="Wave Executor"
                className="executor-image"
              />
              <div className="executor-content">
                <h3>Wave</h3>
                <p>The most advanced executor with unparalleled performance and security features.</p>

                <ul className="executor-features">
                  <li>
                    <i className="fas fa-check"></i> Ultra-fast execution
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Advanced anti-detection
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Built-in script hub
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Auto-update system
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Multi-game support
                  </li>
                </ul>

                <div className="executor-actions">
                  <a href="https://cdn.getwave.gg/userinterface/Wave-Setup.exe" className="executor-download">
                    <i className="fas fa-download"></i> DOWNLOAD
                  </a>
                  <a href="https://getwave.gg/" className="executor-info" title="More Info">
                    <i className="fas fa-info-circle"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Coming Soon Executor */}
            <div className="executor-card">
              <span className="executor-badge">Free</span>
              <img
                className="executor-image"
                alt="Coming Soon Executor"
                src="https://bytebreaker.cc/assets/images/share.jpg?v=f9214227"
              />
              <div className="executor-content">
                <h3>bytebreaker.cc</h3>
                <p>Free Pc Web Executor 90% UNC</p>

                <ul className="executor-features">
                  <li>
                    <i className="fas fa-check"></i> Fast script execution
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Basic anti-detection
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Built-in script hub
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Low resource usage
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Stable performance
                  </li>
                </ul>

                <div className="executor-actions">
                  <a href="http://a.directfiledl.com/getfile?id=72232183&s=9429BB72" className="executor-download">
                    <i className="fas fa-download"></i> DOWNLOAD
                  </a>
                  <a href="https://bytebreaker.cc/" className="executor-info" title="More Info">
                    <i className="fas fa-info-circle"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Codex Mobile Executor */}
            <div className="executor-card">
              <span className="executor-badge">Mobile</span>
              <img
                src="https://cdn.sellsn.io/987b657b-ea89-49e9-965f-f0273558b9cc.png"
                alt="Codex Mobile Executor"
                className="executor-image"
              />
              <div className="executor-content">
                <h3>Codex MOBILE</h3>
                <p>Optimized executor for mobile gaming platforms.</p>

                <ul className="executor-features">
                  <li>
                    <i className="fas fa-check"></i> Android/iOS support
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Touch-optimized UI
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Built-in script hub
                  </li>
                  <li>
                    <i className="fas fa-check"></i> 100% UNC
                  </li>
                  <li>
                    <i className="fas fa-check"></i> Low battery usage
                  </li>
                </ul>

                <div className="executor-actions">
                  <a
                    href="https://download2444.mediafire.com/lu8x9jgv5yfgm1zt-S_tivaOS_6rPUTjemOlx5UPzk1BkIfzUKQ_W3ptJ_mMjWzmWsk_QJqnu9Wl4w5jcUyTgEavU_s_sNlk28ryuq-UN6fgl1iElJYPZoD3-9hg1BXeG7mZBozJ43SKJ5LtNp77bZ8fw-uHvPdZdSWiDnQ0Cec/rwycygi6rvci9to/Codex+v2.668.660.apk"
                    className="executor-download"
                  >
                    <i className="fas fa-download"></i> Android
                  </a>
                  <a href="https://roxploits.gitbook.io/iosdirectinstall" className="executor-download">
                    <i className="fas fa-download"></i> iOS
                  </a>
                  <a href="https://Codex.lol" className="executor-info" title="More Info">
                    <i className="fas fa-info-circle"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="requirements">
        <div className="container">
          <div className="section-title">
            <h2>SYSTEM REQUIREMENTS</h2>
            <p>Ensure your system meets these specifications for optimal performance</p>
          </div>

          <div className="requirements-grid">
            <div className="requirement-card">
              <h3>Windows</h3>
              <ul>
                <li>
                  <i className="fas fa-check"></i> Windows 10/11 (64-bit)
                </li>
                <li>
                  <i className="fas fa-check"></i> 4GB RAM minimum
                </li>
                <li>
                  <i className="fas fa-check"></i> 500MB free storage
                </li>
                <li>
                  <i className="fas fa-check"></i> .NET Framework 4.8
                </li>
                <li>
                  <i className="fas fa-check"></i> DirectX 11
                </li>
              </ul>
            </div>

            <div className="requirement-card">
              <h3>MacOS</h3>
              <ul>
                <li>
                  <i className="fas fa-check"></i> macOS 10.15 or later
                </li>
                <li>
                  <i className="fas fa-check"></i> 8GB RAM recommended
                </li>
                <li>
                  <i className="fas fa-check"></i> Intel/Apple Silicon
                </li>
                <li>
                  <i className="fas fa-check"></i> 1GB free storage
                </li>
              </ul>
            </div>

            <div className="requirement-card">
              <h3>Mobile</h3>
              <ul>
                <li>
                  <i className="fas fa-check"></i> Android 9+ / iOS 14+
                </li>
                <li>
                  <i className="fas fa-check"></i> 3GB RAM minimum
                </li>
                <li>
                  <i className="fas fa-check"></i> 200MB free space
                </li>
                <li>
                  <i className="fas fa-check"></i> Root/JB not required
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>
                <i className="fas fa-cubes"></i> PRODUCTS
              </h3>
              <ul>
                <li>
                  <Link href="/script-hub">
                    <i className="fas fa-code-branch"></i> Script Hub
                  </Link>
                </li>
                <li>
                  <Link href="/key-generator">
                    <i className="fas fa-key"></i> Key Generator
                  </Link>
                </li>
                <li>
                  <Link href="/executors">
                    <i className="fas fa-bolt"></i> Executors
                  </Link>
                </li>
                <li>
                  <Link href="/mobile">
                    <i className="fas fa-mobile-alt"></i> Mobile Version
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>
                <i className="fas fa-book"></i> RESOURCES
              </h3>
              <ul>
                <li>
                  <Link href="#">
                    <i className="fas fa-file-alt"></i> Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#">
                    <i className="fas fa-graduation-cap"></i> Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#">
                    <i className="fas fa-cog"></i> Script API
                  </Link>
                </li>
                <li>
                  <Link href="#">
                    <i className="fas fa-history"></i> Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>
                <i className="fas fa-balance-scale"></i> LEGAL
              </h3>
              <ul>
                <li>
                  <Link href="#">
                    <i className="fas fa-file-contract"></i> Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#">
                    <i className="fas fa-lock"></i> Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#">
                    <i className="fas fa-money-bill-wave"></i> Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="#">
                    <i className="fas fa-exclamation-triangle"></i> Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>
                <i className="fas fa-users"></i> CONNECT
              </h3>
              <div className="social-links">
                <a href="https://discord.gg/ZWCqcuxAv3">
                  <i className="fab fa-discord"></i>
                </a>
                <a href="#">
                  <i className="fab fa-telegram"></i>
                </a>
                <a href="https://www.youtube.com/@VoltrexScriptHub?subcrition_confirmation">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="#">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="copyright">
            <i className="far fa-copyright"></i> 2025 NEXUS. All rights reserved. | Not affiliated with Roblox
            Corporation.
          </div>
        </div>
      </footer>

      {/* Add Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <style jsx>{`
        :root {
          --primary: #00c9ff;
          --secondary: #00b8ff;
          --accent: #00e8ff;
          --dark: #0a0a0a;
          --darker: #050505;
          --light: #e0e0e0;
          --gray: #1a1a1a;
          --text: #ffffff;
          --hover-bg: rgba(0, 255, 157, 0.1);
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        
        body {
          background-color: var(--dark);
          color: var(--text);
          line-height: 1.6;
          overflow-x: hidden;
        }
        
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        /* Cyberpunk Header */
        header {
          background-color: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 15px 0;
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-size: 28px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          letter-spacing: -0.5px;
        }
        
        .logo span {
          color: var(--text);
        }
        
        /* Matrix Navigation */
        nav ul {
          display: flex;
          list-style: none;
          gap: 10px;
        }
        
        nav ul li a {
          color: var(--text);
          text-decoration: none;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 4px;
          transition: all 0.3s ease;
          font-size: 15px;
          position: relative;
          opacity: 0.9;
        }
        
        nav ul li a:hover {
          color: var(--primary);
          background-color: var(--hover-bg);
        }
        
        nav ul li a.active {
          color: var(--primary);
          background-color: var(--hover-bg);
        }
        
        nav ul li a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 20px;
          width: calc(100% - 40px);
          height: 2px;
          background-color: var(--primary);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        
        nav ul li a:hover::after {
          transform: scaleX(1);
        }
        
        /* Executors Section - Enhanced */
        .executors {
          padding: 80px 0;
          background-color: var(--darker);
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 60px;
        }
        
        .section-title h2 {
          font-size: 36px;
          color: var(--text);
          margin-bottom: 15px;
          position: relative;
        }
        
        .section-title h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
        }
        
        .executors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }
        
        .executor-card {
          background-color: var(--gray);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .executor-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 201, 255, 0.2);
        }
        
        .executor-card.featured {
          border: 1px solid var(--accent);
        }
        
        .executor-card.featured::before {
          content: 'FEATURED';
          position: absolute;
          top: 15px;
          right: -35px;
          background-color: var(--accent);
          color: var(--dark);
          padding: 5px 40px;
          font-size: 12px;
          font-weight: bold;
          transform: rotate(45deg);
          z-index: 2;
        }
        
        .executor-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .executor-content {
          padding: 25px;
        }
        
        .executor-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background-color: rgba(0, 0, 0, 0.7);
          color: var(--primary);
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .executor-card h3 {
          font-size: 24px;
          margin-bottom: 15px;
          color: var(--primary);
        }
        
        .executor-card p {
          color: var(--light);
          opacity: 0.8;
          margin-bottom: 20px;
          font-size: 15px;
        }
        
        .executor-features {
          list-style: none;
          margin: 20px 0;
        }
        
        .executor-features li {
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          font-size: 14px;
        }
        
        .executor-features li i {
          margin-right: 10px;
          color: var(--secondary);
        }
        
        .executor-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 25px;
        }
        
        .executor-download {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: var(--dark);
          padding: 12px 25px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          flex-grow: 1;
          text-align: center;
          margin-right: 10px;
        }
        
        .executor-download:hover {
          background: linear-gradient(135deg, var(--secondary), var(--primary));
          box-shadow: 0 0 20px rgba(0, 201, 255, 0.4);
          transform: translateY(-2px);
        }
        
        .executor-download i {
          margin-right: 8px;
        }
        
        .executor-info {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--text);
          padding: 12px;
          border-radius: 6px;
          transition: all 0.3s;
          width: 45px;
          height: 45px;
        }
        
        .executor-info:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        /* System Requirements */
        .requirements {
          padding: 60px 0;
          background-color: var(--dark);
        }
        
        .requirements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }
        
        .requirement-card {
          background-color: var(--gray);
          padding: 25px;
          border-radius: 6px;
          border-left: 3px solid var(--secondary);
        }
        
        .requirement-card h3 {
          color: var(--secondary);
          margin-bottom: 15px;
          font-size: 20px;
        }
        
        .requirement-card ul {
          list-style: none;
        }
        
        .requirement-card ul li {
          padding: 6px 0;
          display: flex;
          align-items: center;
        }
        
        .requirement-card ul li i {
          margin-right: 10px;
          color: var(--primary);
        }
        
        /* Footer */
        footer {
          background-color: var(--darker);
          padding: 70px 0 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          margin-bottom: 50px;
        }
        
        .footer-column h3 {
          font-size: 18px;
          margin-bottom: 25px;
          color: var(--primary);
          position: relative;
          padding-bottom: 10px;
        }
        
        .footer-column h3::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background-color: var(--primary);
        }
        
        .footer-column ul {
          list-style: none;
        }
        
        .footer-column ul li {
          margin-bottom: 12px;
        }
        
        .footer-column ul li a {
          color: #a0a0a0;
          text-decoration: none;
          transition: all 0.3s;
          font-size: 14px;
        }
        
        .footer-column ul li a:hover {
          color: var(--primary);
          padding-left: 5px;
        }
        
        .social-links {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        
        .social-links a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 4px;
          background-color: var(--gray);
          color: var(--text);
          font-size: 16px;
          transition: all 0.3s;
        }
        
        .social-links a:hover {
          background-color: var(--primary);
          color: var(--dark);
          transform: translateY(-3px);
        }
        
        .copyright {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: #666;
          font-size: 13px;
        }
        
        /* Responsive Design */
        @media (max-width: 992px) {
          .section-title h2 {
            font-size: 30px;
          }
        }
        
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
          }
          
          .logo {
            margin-bottom: 20px;
          }
          
          nav ul {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .executor-actions {
            flex-direction: column;
          }
          
          .executor-download {
            width: 100%;
            margin-right: 0;
            margin-bottom: 10px;
          }
          
          .executor-info {
            width: 100%;
          }
        }
        
        @media (max-width: 576px) {
          .executors-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
