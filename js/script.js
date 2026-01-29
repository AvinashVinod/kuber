document.addEventListener('DOMContentLoaded', function() {
  const logo = document.querySelector('img[src*="logo"]');
  if (logo) {
    console.log('Logo src in navbar:', logo.src);
    console.log('Current page URL:', window.location.href);
    console.log('Expected full path:', new URL(logo.src, window.location.href).href);
    
    // Test if image loads
    const testImg = new Image();
    testImg.onload = () => console.log('Logo loads successfully');
    testImg.onerror = () => console.error('Logo fails to load');
    testImg.src = logo.src;
  }
});

function loadComponentsParallel() {
  // Get current page URL to determine correct paths
  const basePath = window.location.pathname.includes('/kuber/') ? './' : '../';
  
  const components = [
    { id: "nav-placeholder", url: `${basePath}html/navbar.html` },
    { id: "footer-placeholder", url: `${basePath}html/footer.html` },
    { id: "contact-placeholder", url: `${basePath}html/contact.html` },
  ];

  // Create promises for all components
  const promises = components.map((component) => {
    return fetch(component.url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${component.url}`);
        return response.text();
      })
      .then((html) => {
        const placeholder = document.getElementById(component.id);
        if (placeholder) {
          placeholder.innerHTML = html;
        }
      })
      .catch((error) => {
        console.error(`Error loading ${component.url}:`, error);
      });
  });

  // When all components are loaded
  Promise.all(promises)
    .then(() => {
      console.log("All components loaded");

      // Initialize navbar scripts
      if (typeof initializeNavScripts === "function") {
        initializeNavScripts();
      }

      // Check for hash on initial load
      checkHashAndLoadPage();
    })
    .catch((error) => {
      console.error("Error loading components:", error);
    });
}

// Start loading when DOM is ready
document.addEventListener("DOMContentLoaded", loadComponentsParallel);

// Check hash and load appropriate page
function checkHashAndLoadPage() {
  const hash = window.location.hash;
  
  // If no hash but we have a stored page (from before reload), restore it
  if ((!hash || hash === '#') && localStorage.getItem('currentPage')) {
    const storedPage = localStorage.getItem('currentPage');
    const storedHash = localStorage.getItem('currentHash');
    
    console.log('Restoring page after reload:', storedPage, storedHash);
    
    // Restore hash
    if (storedHash) {
      window.location.hash = storedHash;
    }
    
    // Load the stored page
    loadPage(storedPage, false);
    return;
  }
  
  if (hash && hash !== '#') {
    // Map hash to page files
    const pageMap = {
      '#services': '/kuber/html/services.html',
      '#wedding': '/kuber/html/services.html',
      '#event-management': '/kuber/html/services.html',
      '#decor': '/kuber/html/services.html',
      '#corporate': '/kuber/html/services.html',
      '#about': '#about-section',
      '#gallery': '#gallery-section',
      '#blog': '#blog-section',
      '#contact': '#contact'
    };

    const targetPage = pageMap[hash];
    if (targetPage && targetPage.includes('.html')) {
      // Load page
      loadPage(targetPage, false);
    } else if (targetPage) {
      // Scroll to section
      const section = document.querySelector(targetPage);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  } else {
    // Clear stored page if we're on home
    localStorage.removeItem('currentPage');
    localStorage.removeItem('currentHash');
  }
}

function initializeNavScripts() {
  // 1. Select all elements (These now exist in the DOM)
  const navbar = document.getElementById("navbar");
  const subNav = document.querySelector(".nav__sub-nav");
  const subNavLinks = document.querySelectorAll(".nav__sub-nav-links li");
  const servicesNavLink = document.querySelector(".services__nav-link");
  const logo = navbar.querySelector(".logo__img");
  const navList = navbar.querySelector("ul");

  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const spans = menuBtn.querySelectorAll("span");
  const servicesToggle = document.getElementById("mobile-services-toggle");
  const mobileSubNav = document.getElementById("mobile-sub-nav");
  const servicesArrow = document.getElementById("services-arrow");

  const modal = document.getElementById("video-modal");
  const modalIframe = document.getElementById("modal-iframe");
  const closeModal = document.getElementById("close-modal");
  const cards = document.querySelectorAll(".testimonial-card");

  const ajaxLinks = document.querySelectorAll('.ajax-link');
  const pageContent = document.getElementById('page-content');

  // 2. Initial Burger State
  spans[0].style.transform = "translateY(-8px)";
  spans[2].style.transform = "translateY(8px)";

  // 3. Desktop Scroll Logic (Moved inside here)
  window.onscroll = function () {
    if (window.scrollY > 50) {
      navbar.classList.add("bg-white", "shadow-lg", "px-4");
      navList.classList.replace("text-white", "text-black");
      subNav.classList.replace("top-[108%]", "top-[140%]");

      subNavLinks.forEach((link) =>
        link.classList.add("hover:bg-black", "hover:text-white"),
      );
      servicesNavLink.classList.add("hover:bg-black", "hover:text-white");
      logo.classList.replace(
        "logo__img--before-scroll",
        "logo__img--after-scroll",
      );
    } else {
      navbar.classList.remove("bg-white", "shadow-lg", "px-4");
      navList.classList.replace("text-black", "text-white");
      subNav.classList.replace("top-[140%]", "top-[108%]");

      subNavLinks.forEach((link) =>
        link.classList.remove("hover:bg-black", "hover:text-white"),
      );
      servicesNavLink.classList.remove("hover:bg-black", "hover:text-white");
      logo.classList.replace(
        "logo__img--after-scroll",
        "logo__img--before-scroll",
      );
    }
  };

  // 4. Hamburger Toggle
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("translate-y-0");
    const isMenuOpening = mobileMenu.classList.contains("translate-y-0");

    if (isMenuOpening) {
      spans[0].style.transform = "translateY(0) rotate(45deg)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "translateY(0) rotate(-45deg)";
    } else {
      spans[0].style.transform =
        "translateY(-10px) rotate(0deg) translateY(2px)";
      spans[1].style.opacity = "1";
      spans[2].style.transform =
        "translateY(10px) rotate(0deg) translateY(-2px)";
      mobileSubNav.style.maxHeight = "0px";
      mobileSubNav.style.opacity = "0";
    }
  });

  // 5. Mobile Accordion
  servicesToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen =
      mobileSubNav.style.maxHeight && mobileSubNav.style.maxHeight !== "0px";
    if (isOpen) {
      mobileSubNav.style.maxHeight = "0px";
      mobileSubNav.style.opacity = "0";
      servicesArrow.style.transform = "rotate(0deg)";
    } else {
      mobileSubNav.style.maxHeight = mobileSubNav.scrollHeight + "px";
      mobileSubNav.style.opacity = "1";
      servicesArrow.style.transform = "rotate(180deg)";
    }
  });

  // Video Modal Functionality
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const videoId = card.getAttribute("data-video-id");
      const currentOrigin = window.location.origin;

      modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${currentOrigin}`;

      modal.classList.remove("hidden");
      modal.classList.add("flex");
      setTimeout(() => modal.classList.add("opacity-100"), 10);
      document.body.style.overflow = "hidden";
    });
  });

  const closeFunction = () => {
    modal.classList.remove("opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      modalIframe.src = "";
      document.body.style.overflow = "";
    }, 300);
  };

  closeModal.addEventListener("click", closeFunction);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeFunction();
  });

  // AJAX Navigation with hash-based routing (prevents 404 errors)
  // This handles ALL ajax-link clicks including subnav items
  ajaxLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default # behavior
      
      const targetPage = this.getAttribute('data-target');
      const pageName = this.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      
      console.log('Ajax link clicked:', pageName, targetPage);
      
      // Update hash (this won't cause 404 errors on refresh)
      window.location.hash = pageName;
      
      // Load the page
      loadPage(targetPage, true);

      // Close mobile menu if open
      if (mobileMenu && mobileMenu.classList.contains("translate-y-0")) {
        menuBtn.click();
      }
    });
  });

  // Handle ONLY logo clicks for home - NOT regular # links
  const logoLinks = document.querySelectorAll('.logo__img');
  logoLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Logo clicked - going home');
      
      // Clear stored page
      localStorage.removeItem('currentPage');
      localStorage.removeItem('currentHash');
      
      // Clear hash and reload
      window.location.hash = '';
      location.reload();
    });
  });

  // Handle specific home link clicks (not ajax-links with #)
  const homeLink = document.querySelector('a[href="/kuber/"]');
  if (homeLink) {
    homeLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Home link clicked');
      
      // Clear stored page
      localStorage.removeItem('currentPage');
      localStorage.removeItem('currentHash');
      
      // Clear hash and reload
      window.location.hash = '';
      location.reload();
    });
  }

  // Handle hash changes (back/forward button)
  window.addEventListener('hashchange', function() {
    const hash = window.location.hash;
    console.log('Hash changed to:', hash);
    
    if (!hash || hash === '#') {
      // Going back to home
      localStorage.removeItem('currentPage');
      localStorage.removeItem('currentHash');
      location.reload();
    } else {
      checkHashAndLoadPage();
    }
  });
}

// Function to load a page programmatically
function loadPage(targetPage, scrollToTop = true) {
  const pageContent = document.getElementById('page-content');
  
  if (!pageContent) {
    console.error('pageContent element not found');
    return;
  }

  // Store current page in localStorage so it persists on reload
  localStorage.setItem('currentPage', targetPage);
  localStorage.setItem('currentHash', window.location.hash);

  console.log('Loading page:', targetPage, 'with hash:', window.location.hash);

  // Scroll to top smoothly if requested
  if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Fade out current content
  pageContent.style.transition = "opacity 0.3s ease";
  pageContent.style.opacity = "0";
  
  setTimeout(() => {
    // Fetch and Load Content with cache busting
    const cacheBuster = '?v=' + new Date().getTime();
    fetch(targetPage + cacheBuster)
      .then(response => {
        if (!response.ok) throw new Error("Page not found");
        return response.text();
      })
      .then(html => {
        // Parse the HTML to extract only the page content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector('.services-page, .about-page, .gallery-page, .blog-page') || doc.body;
        
        // Replace content
        pageContent.innerHTML = newContent.innerHTML;
        
        // Fade in new content
        setTimeout(() => {
          pageContent.style.opacity = "1";
          
          // Re-initialize dynamic components
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
          
          // Re-initialize any page-specific scripts
          initPageSpecificScripts();
        }, 50);
      })
      .catch(error => {
        console.error('Error loading page:', error);
        pageContent.innerHTML = '<div class="p-10 text-center"><h1 class="text-4xl">Page not found</h1><p class="mt-4">The requested page could not be loaded.</p></div>';
        pageContent.style.opacity = "1";
      });
  }, 300);
}

// Function to initialize page-specific scripts (Swiper, etc.)
function initPageSpecificScripts() {
  // Re-initialize Swiper if present on the page
  const swiperElement = document.querySelector('.story-swiper');
  if (swiperElement && typeof Swiper !== 'undefined') {
    new Swiper(".story-swiper", {
      loop: true,
      speed: 800,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 5,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: false,
      },
    });
  }

  // Re-attach video modal listeners if testimonial cards exist
  const cards = document.querySelectorAll(".testimonial-card");
  const modal = document.getElementById("video-modal");
  const modalIframe = document.getElementById("modal-iframe");
  
  if (cards.length > 0 && modal) {
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const videoId = card.getAttribute("data-video-id");
        const currentOrigin = window.location.origin;

        modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${currentOrigin}`;

        modal.classList.remove("hidden");
        modal.classList.add("flex");
        setTimeout(() => modal.classList.add("opacity-100"), 10);
        document.body.style.overflow = "hidden";
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize AOS (Animate on Scroll)
  AOS.init({
    duration: 800,
    easing: "ease-out",
    once: false,
    offset: 100,
    delay: 0,
  });
  
  // Initialize Swiper on home page
  if (document.querySelector('.story-swiper')) {
    var storySwiper = new Swiper(".story-swiper", {
      loop: true,
      speed: 800,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
      },
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 5,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: false,
      },
    });
  }
});