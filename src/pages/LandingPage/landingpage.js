import React, { useState, useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import { useNavigate } from 'react-router-dom';
import './css/styles.css';

const LandingPage = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();

  const exploreButtonHandler = () => {
    navigate('/login');;
  };

  // Function to handle theme toggle
  const toggleTheme = () => {
    const themeButton = document.getElementById("theme-button");
    const darkTheme = "dark-theme";
    const iconTheme = "ri-sun-line";

    // Toggle theme class
    document.body.classList.toggle(darkTheme);
    themeButton.classList.toggle(iconTheme);

    // Store the selected theme in localStorage
    const newTheme = document.body.classList.contains(darkTheme) ? "dark" : "light";
    const newIcon = themeButton.classList.contains(iconTheme) ? "ri-moon-line" : "ri-sun-line";
    localStorage.setItem("selected-theme", newTheme);
    localStorage.setItem("selected-icon", newIcon);

    // Update state
    setIsDarkTheme(newTheme === "dark");
  };

  // Handle menu toggle
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking a link
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    // Initialize ScrollReveal
    const sr = ScrollReveal({
      origin: 'top',
      distance: '60px',
      duration: 2500,
      delay: 400,
    });

    // ScrollReveal for various elements
    sr.reveal('.home__data');
    sr.reveal('.home__img', { delay: 500 });
    sr.reveal('.home__social', { delay: 600 });
    sr.reveal('.about__img, .contact__box', { origin: 'left' });
    sr.reveal('.about__data, .contact__form', { origin: 'right' });
    sr.reveal('.steps__card, .product__card, .questions__group, .footer', { interval: 100 });

    // Accordion functionality
    const accordionItems = document.querySelectorAll('.questions__item');
    
    accordionItems.forEach((item) => {
      const accordionHeader = item.querySelector('.questions__header');
      
      // Add click event for each accordion header
      accordionHeader.addEventListener('click', () => {
        const openItem = document.querySelector('.accordion-open');
        toggleItem(item);

        // Close other open items
        if (openItem && openItem !== item) {
          toggleItem(openItem);
        }
      });
    });

    // Function to toggle the accordion content
    const toggleItem = (item) => {
      const accordionContent = item.querySelector('.questions__content');

      // If the item is open, close it
      if (item.classList.contains('accordion-open')) {
        accordionContent.removeAttribute('style');
        item.classList.remove('accordion-open');
      } else {
        // If the item is closed, open it
        accordionContent.style.height = accordionContent.scrollHeight + 'px';
        item.classList.add('accordion-open');
      }
    };

    // Handle theme initialization
    const selectedTheme = localStorage.getItem("selected-theme");
    const selectedIcon = localStorage.getItem("selected-icon");

    if (selectedTheme) {
      document.body.classList[selectedTheme === "dark" ? "add" : "remove"]("dark-theme");
      setIsDarkTheme(selectedTheme === "dark");
    }

    const themeButton = document.getElementById("theme-button");
    if (selectedIcon) {
      themeButton.classList[selectedIcon === "ri-sun-line" ? "add" : "remove"]("ri-moon-line");
    }

    // Scroll Header and Active Links
    const scrollHeader = () => {
      const header = document.getElementById('header');
      if (window.scrollY >= 80) header.classList.add('scroll-header');
      else header.classList.remove('scroll-header');
    };

    const scrollActive = () => {
      const scrollY = window.pageYOffset;
      const sections = document.querySelectorAll('section[id]');

      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 58;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.add('active-link');
        } else {
          document.querySelector('.nav__menu a[href*=' + sectionId + ']').classList.remove('active-link');
        }
      });
    };

    const scrollUp = () => {
      const scrollUp = document.getElementById('scroll-up');
      if (window.scrollY >= 400) scrollUp.classList.add('show-scroll');
      else scrollUp.classList.remove('show-scroll');
    };

    window.addEventListener('scroll', scrollHeader);
    window.addEventListener('scroll', scrollActive);
    window.addEventListener('scroll', scrollUp);

    return () => {
      window.removeEventListener('scroll', scrollHeader);
      window.removeEventListener('scroll', scrollActive);
      window.removeEventListener('scroll', scrollUp);
    };
  }, []);

  return (
    <>
      {/* Header */}
      <header className="header" id="header">
        <nav className="nav container">
          <a href="#" className="nav__logo">
            <i className="ri-quill-pen-line nav__logo-icon"></i> SkySketch
          </a>
  
          {/* Navigation Menu */}
          <div className={`nav__menu ${isMenuOpen ? 'show-menu' : ''}`} id="nav-menu">
            <ul className="nav__list">
              <li className="nav__item">
                <a href="#home" className="nav__link active-link" onClick={closeMenu}>Home</a>
              </li>
              <li className="nav__item">
                <a href="#about" className="nav__link" onClick={closeMenu}>About</a>
              </li>
              <li className="nav__item">
                <a href="#products" className="nav__link" onClick={closeMenu}>Plans</a>
              </li>
              <li className="nav__item">
                <a href="#faqs" className="nav__link" onClick={closeMenu}>FAQs</a>
              </li>
              <li className="nav__item">
                <a href="#contact" className="nav__link" onClick={closeMenu}>Contact Us</a>
              </li>
            </ul>
  
            {/* Close Button inside Menu */}
            <div
              className="nav__close"
              id="nav-close"
              onClick={toggleMenu}
            >
              <i className="ri-close-line"></i>
            </div>
          </div>
    
          <div className="nav__btns">
            {/* Theme change */}
            <i
              className={`ri-moon-line change-theme ${isDarkTheme ? 'ri-sun-line' : ''}`}
              id="theme-button"
              onClick={toggleTheme}  // Attach the click handler
            ></i>

          <div
            className="nav__toggle"
            id="nav-toggle"
            onClick={toggleMenu}
          >
            <i className="ri-menu-line"></i>
          </div>
          </div>
        </nav>
      </header>

  
      {/* Main */}
      <main className="main">
        {/* Home */}
        <section className="home" id="home">
          <div className="home__container container grid">
            <img src="./assets/img/home.png" alt="" className="home__img" />
  
            <div className="home__data">
              <h1 className="home__title">
                An Interactive <br /> Fingertip Teaching
              </h1>
              <p className="home__description">
              Bring your ideas to life with SkySketch. 
              Transform whiteboards and presentations into interactive, creative spaces.
              </p>
              <button onClick={exploreButtonHandler} className="button button--flex">
                Explore <i className="ri-arrow-right-down-line button__icon"></i>
              </button>
            </div>
  
            <div className="home__social">
              <span className="home__social-follow">Follow Me</span>
  
              <div className="home__social-links">
                <a href="https://www.linkedin.com/in/ajinkyajdv/" target="_blank" className="home__social-link" rel="noopener noreferrer">
                  <i className="ri-linkedin-fill"></i>
                </a>
                <a href="https://github.com/ajinkyajdv" target="_blank" className="home__social-link" rel="noopener noreferrer">
                  <i className="ri-github-line"></i>
                </a>
                <a href="https://twitter.com/" target="_blank" className="home__social-link" rel="noopener noreferrer">
                  <i className="ri-twitter-fill"></i>
                </a>
              </div>
            </div>
          </div>
        </section>
        
        <section className="about section container" id="about">
        <div className="about__container grid">
          <img src="./assets/img/about.png" alt="" className="about__img" />

          <div className="about__data">
            <h2 className="section__title about__title">
              Who we really are & <br /> why choose SkySketch
            </h2>

            <p className="about__description">
            SkySketch revolutionizes creative workflows with AI-powered drawing analysis, whiteboard tools, and gesture-based PDF and PPT annotations.
            </p>

            <div className="about__details">
              <p className="about__details-description">
                <i className="ri-checkbox-fill about__details-icon"></i>
                We provide a seamless whiteboard experience for all your creative needs.
              </p>
              <p className="about__details-description">
                <i className="ri-checkbox-fill about__details-icon"></i>
                We offer powerful features for annotating PDFs, PPTs, and 3D models.
              </p>
              <p className="about__details-description">
                <i className="ri-checkbox-fill about__details-icon"></i>
                Gesture-based interactions for a more intuitive design process.
              </p>
              <p className="about__details-description">
                <i className="ri-checkbox-fill about__details-icon"></i>
                100% satisfaction guaranteed with SkySketch’s advanced tools.
              </p>
            </div>

            <a href="#" className="button--link button--flex">
              Start Creating Now <i className="ri-arrow-right-down-line button__icon"></i>
            </a>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="steps section container">
        <div className="steps__bg">
          <h2 className="section__title-center steps__title">
            Key Features of SkySketch
          </h2>

          <div className="steps__container grid">
            <div className="steps__card">
              <div className="steps__card-number">01</div>
              <h3 className="steps__card-title">Interactive Whiteboard</h3>
              <p className="steps__card-description">
                Create, annotate, and collaborate seamlessly on a virtual whiteboard for all your creative needs.
              </p>
            </div>

            <div className="steps__card">
              <div className="steps__card-number">02</div>
              <h3 className="steps__card-title">PDF & PPT Annotation</h3>
              <p className="steps__card-description">
                Upload and annotate PDFs and PowerPoint presentations directly within the app.
              </p>
            </div>

            <div className="steps__card">
              <div className="steps__card-number">03</div>
              <h3 className="steps__card-title">3D Model Support</h3>
              <p className="steps__card-description">
                Upload, view, and interact with 3D models for a more immersive design experience.
              </p>
            </div>

            <div className="steps__card">
              <div className="steps__card-number">04</div>
              <h3 className="steps__card-title">Gesture-Based Interactions</h3>
              <p className="steps__card-description">
                Use hand gestures for intuitive navigation and design manipulation on the whiteboard.
              </p>
            </div>

            <div className="steps__card">
              <div className="steps__card-number">05</div>
              <h3 className="steps__card-title">Math Problem-Solving with GenAI</h3>
              <p className="steps__card-description">
                Solve complex math problems effortlessly using GenAI's advanced algorithms.
              </p>
            </div>

            <div className="steps__card">
              <div className="steps__card-number">06</div>
              <h3 className="steps__card-title">Cloud Storage & Collaboration</h3>
              <p className="steps__card-description">
                Store your work in the cloud and collaborate in real time with others on your designs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="product section container" id="products">
        <h2 className="section__title-center">
          Choose the Perfect Plan for You <br /> and Get Started
        </h2>

        <p className="product__description">
          Here are some subscription plans with varying levels of features and storage. 
          Whether you're a beginner or looking for advanced tools, we have a plan for you. Start your journey with SkySketch today!
        </p>

        <div className="product__container grid">
          <article className="product__card">
            <div className="product__circle"></div>
            <img src="./assets/img/product1.png" alt="" className="product__img" />
            <h3 className="product__title">Free</h3>
            <span className="product__price">₹0</span>
            <button className="button--flex product__button">
              <i className="ri-shopping-bag-line"></i>
            </button>
          </article>

          <article className="product__card">
            <div className="product__circle"></div>
            <img src="./assets/img/product2.png" alt="" className="product__img" />
            <h3 className="product__title">Basic</h3>
            <span className="product__price">₹250</span>
            <button className="button--flex product__button">
              <i className="ri-shopping-bag-line"></i>
            </button>
          </article>

          <article className="product__card">
            <div className="product__circle"></div>
            <img src="./assets/img/product3.png" alt="" className="product__img" />
            <h3 className="product__title">Advance</h3>
            <span className="product__price">₹500</span>
            <button className="button--flex product__button">
              <i className="ri-shopping-bag-line"></i>
            </button>
          </article>
        </div>
      </section>

      {/* Common Questions Section */}
      <section className="questions section" id="faqs">
        <h2 className="section__title-center questions__title container">
          Common Questions <br /> about SkySketch
        </h2>

        <div className="questions__container container grid">
          <div className="questions__group">
            {/* Question Item 1 */}
            <div className="questions__item">
              <header className="questions__header">
                <i className="ri-add-line questions__icon"></i>
                <h3 className="questions__item-title">
                  How do I annotate PDFs or PPTs in SkySketch?
                </h3>
              </header>
              <div className="questions__content">
                <p className="questions__description">
                  SkySketch allows you to upload your PDF or PPT files via Google Drive and annotate them directly using the whiteboard tools. You can highlight, draw, or add text with ease.
                </p>
              </div>
            </div>

            {/* Question Item 2 */}
            <div className="questions__item">
              <header className="questions__header">
                <i className="ri-add-line questions__icon"></i>
                <h3 className="questions__item-title">
                  Can I interact with 3D models?
                </h3>
              </header>
              <div className="questions__content">
                <p className="questions__description">
                  Yes! SkySketch supports 3D model handling, allowing you to rotate, zoom, and draw on models directly within the platform.
                </p>
              </div>
            </div>

            {/* Question Item 3 */}
            <div className="questions__item">
              <header className="questions__header">
                <i className="ri-add-line questions__icon"></i>
                <h3 className="questions__item-title">
                  How does gesture-based interaction work?
                </h3>
              </header>
              <div className="questions__content">
                <p className="questions__description">
                  With gesture-based interaction, you can control PPT navigation or drawing using hand gestures. This feature utilizes Mediapipe Hands for accurate tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="questions__group">
            {/* Question Item 4 */}
            <div className="questions__item">
              <header className="questions__header">
                <i className="ri-add-line questions__icon"></i>
                <h3 className="questions__item-title">
                  How do I use SkySketch for solving math problems?
                </h3>
              </header>
              <div className="questions__content">
                <p className="questions__description">
                  Simply draw or write the math problem on the whiteboard, and SkySketch's GenAI integration will provide solutions or step-by-step guidance.
                </p>
              </div>
            </div>

            {/* Question Item 5 */}
            <div className="questions__item">
              <header className="questions__header">
                <i className="ri-add-line questions__icon"></i>
                <h3 className="questions__item-title">
                  Can I save my annotations and sketches?
                </h3>
              </header>
              <div className="questions__content">
                <p className="questions__description">
                  Yes, SkySketch offers storage functionality via Firebase. Your work is saved individually and can be accessed anytime.
                </p>
              </div>
            </div>

            {/* Question Item 6 */}
            <div className="questions__item">
              <header className="questions__header">
                <i className="ri-add-line questions__icon"></i>
                <h3 className="questions__item-title">
                  Is SkySketch suitable for collaborative work?
                </h3>
              </header>
              <div className="questions__content">
                <p className="questions__description">
                  SkySketch is not designed for collaboration or meeting features. It focuses on individual annotation, sketching, and GenAI-enhanced tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section className="contact section container" id="contact">
        <div className="contact__container grid">
          <div className="contact__box">
            <h2 className="section__title">
              Reach out to me today <br /> via any of the given <br /> information
            </h2>

            <div className="contact__data">
              <div className="contact__information">
                <h3 className="contact__subtitle">Call us for instant support</h3>
                <span className="contact__description">
                  <i className="ri-phone-line contact__icon"></i>
                  +91 9769756046
                </span>
              </div>

              <div className="contact__information">
                <h3 className="contact__subtitle">Write me by mail</h3>
                <span className="contact__description">
                  <i className="ri-mail-line contact__icon"></i>
                  theajinkyajadhav@gmail.com
                </span>
              </div>
            </div>
          </div>

          <form action="" className="contact__form">
            <div className="contact__inputs">
              <div className="contact__content">
                <input type="email" placeholder=" " className="contact__input" />
                <label htmlFor="" className="contact__label">Email</label>
              </div>

              <div className="contact__content">
                <input type="text" placeholder=" " className="contact__input" />
                <label htmlFor="" className="contact__label">Subject</label>
              </div>

              <div className="contact__content contact__area">
                <textarea name="message" placeholder=" " className="contact__input"></textarea>
                <label htmlFor="" className="contact__label">Message</label>
              </div>
            </div>

            <button className="button button--flex">
              Send Message
              <i className="ri-arrow-right-up-line button__icon"></i>
            </button>
          </form>
        </div>
      </section>

      </main>
      {/* Footer Section */}
      <footer className="footer section">
        <div className="footer__container container grid">
          <div className="footer__content">
            <a href="#" className="footer__logo">
              <i className="ri-quill-pen-line footer__logo-icon"></i> SkySketch
            </a>

            <h3 className="footer__title">
              Subscribe to our newsletter <br /> to stay updated
            </h3>

            <div className="footer__subscribe">
              <input type="email" placeholder="Enter your email" className="footer__input" />

              <button className="button button--flex footer__button">
                Subscribe
                <i className="ri-arrow-right-up-line button__icon"></i>
              </button>
            </div>
          </div>

          <div className="footer__content">
            <h3 className="footer__title">Our Address</h3>

            <ul className="footer__data">
              <li className="footer__information">421301</li>
              <li className="footer__information">Mumbai</li>
              <li className="footer__information">9769756046</li>
            </ul>
          </div>

          <div className="footer__content">
            <h3 className="footer__title">Contact Us</h3>

            <ul className="footer__data">
              <li className="footer__information">+91 9769756046</li>
              
              <div className="footer__social">
                <a href="https://www.facebook.com/" className="footer__social-link">
                  <i className="ri-facebook-fill"></i>
                </a>
                <a href="https://www.instagram.com/" className="footer__social-link">
                  <i className="ri-instagram-line"></i>
                </a>
                <a href="https://twitter.com/" className="footer__social-link">
                  <i className="ri-twitter-fill"></i>
                </a>
              </div>
            </ul>
          </div>

          <div className="footer__content">
            <h3 className="footer__title">
              We accept all credit cards
            </h3>

            <div className="footer__cards">
              <img src="./assets/img/card1.png" alt="" className="footer__card" />
              <img src="./assets/img/card2.png" alt="" className="footer__card" />
              <img src="./assets/img/card3.png" alt="" className="footer__card" />
              <img src="./assets/img/card4.png" alt="" className="footer__card" />
            </div>
          </div>
        </div>

        <p className="footer__copy">&#169; ajinkyajdv </p>
      </footer>

      {/* Scroll Up Button */}
      <a href="#" className="scrollup" id="scroll-up">
        <i className="ri-arrow-up-fill scrollup__icon"></i>
      </a>
    </>
  );
};

export default LandingPage;
