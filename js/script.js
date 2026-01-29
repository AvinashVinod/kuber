/* =====================================================
   BASE PATH (AUTO-DETECT: local /kuber vs production /)
===================================================== */
const BASE_PATH = window.location.pathname.includes("/kuber/")
  ? "/kuber/"
  : "/";

function asset(path) {
  const result = BASE_PATH + path.replace(/^\/+/, "");
  console.log("Asset path:", result);
  return result;
}

/* =====================================================
   DOM READY
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  debugLogo();
  loadComponentsParallel();
  initAOS();
  initSwiper();
});

/* =====================================================
   LOGO DEBUG
===================================================== */
function debugLogo() {
  const logo = document.querySelector('img[src*="logo"]');
  if (!logo) return;

  console.log("Logo src:", logo.src);
  console.log("Page URL:", window.location.href);

  const img = new Image();
  img.onload = () => console.log("✅ Logo loads");
  img.onerror = () => console.error("❌ Logo fails");
  img.src = logo.src;
}

/* =====================================================
   LOAD COMPONENTS (NAV / FOOTER / CONTACT)
===================================================== */
function loadComponentsParallel() {
  const components = [
    { id: "nav-placeholder", url: asset("html/navbar.html") },
    { id: "footer-placeholder", url: asset("html/footer.html") },
    { id: "contact-placeholder", url: asset("html/contact.html") },
  ];

  Promise.all(
    components.map(c =>
      fetch(c.url)
        .then(res => {
          if (!res.ok) throw new Error(c.url);
          return res.text();
        })
        .then(html => {
          const el = document.getElementById(c.id);
          if (el) el.innerHTML = html;
        })
    )
  )
    .then(() => {
      console.log("✅ All components loaded");
      fixAssets();
      initializeNavScripts();
      handleHashRouting();
    })
    .catch(err => {
      console.error("❌ Component load error:", err);
    });
}

/* =====================================================
   FIX IMG / SOURCE PATHS AFTER AJAX LOAD
===================================================== */
function fixAssets() {
  document.querySelectorAll("img, source").forEach(el => {
    const src = el.getAttribute("src") || el.getAttribute("data-src");
    if (!src || src.startsWith("http") || src.startsWith(BASE_PATH)) return;
    
    const newSrc = asset(src);
    if (el.tagName === "SOURCE") {
      el.setAttribute("srcset", newSrc);
    } else {
      el.src = newSrc;
    }
  });
}

/* =====================================================
   HASH ROUTING
===================================================== */
function handleHashRouting() {
  const hash = window.location.hash.replace("#", "");
  
  console.log("Current hash:", hash);

  const map = {
    services: "html/services.html",
    wedding: "html/services.html",
    "event-management": "html/services.html",
    decor: "html/services.html",
    corporate: "html/services.html",
  };

  if (map[hash]) {
    console.log("Loading page for hash:", hash);
    loadPage(map[hash], false);
  } else if (hash && !hash.startsWith("about") && !hash.startsWith("contact") && !hash.startsWith("gallery") && !hash.startsWith("blog")) {
    // Check if there's a stored page from before reload
    const stored = localStorage.getItem("currentPage");
    if (stored) {
      console.log("Restoring stored page:", stored);
      loadPage(stored, false);
    }
  }
}

function checkHashAndLoadPage() {
  handleHashRouting();
}

/* =====================================================
   NAVBAR + INTERACTIONS
===================================================== */
function initializeNavScripts() {
  const navbar = document.getElementById("navbar");
  if (!navbar) {
    console.error("❌ Navbar not found");
    return;
  }

  const subNav = document.querySelector(".nav__sub-nav");
  const subNavLinks = document.querySelectorAll(".nav__sub-nav-links li");
  const servicesNavLink = document.querySelector(".services__nav-link");
  const logo = navbar.querySelector(".logo__img");
  const navList = navbar.querySelector("ul");

  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const spans = menuBtn?.querySelectorAll("span") || [];
  const servicesToggle = document.getElementById("mobile-services-toggle");
  const mobileSubNav = document.getElementById("mobile-sub-nav");
  const servicesArrow = document.getElementById("services-arrow");

  const modal = document.getElementById("video-modal");
  const modalIframe = document.getElementById("modal-iframe");
  const closeModal = document.getElementById("close-modal");

  const ajaxLinks = document.querySelectorAll('.ajax-link');
  const pageContent = document.getElementById('page-content');

  console.log("Found ajax links:", ajaxLinks.length);

  // Initial Burger State
  if (spans.length >= 3) {
    spans[0].style.transform = "translateY(-8px)";
    spans[2].style.transform = "translateY(8px)";
  }

  // Desktop Scroll Logic
  window.onscroll = function () {
    if (window.scrollY > 50) {
      navbar.classList.add("bg-white", "shadow-lg", "px-4");
      navList?.classList.replace("text-white", "text-black");
      subNav?.classList.replace("top-[108%]", "top-[140%]");

      subNavLinks.forEach((link) =>
        link.classList.add("hover:bg-black", "hover:text-white"),
      );
      servicesNavLink?.classList.add("hover:bg-black", "hover:text-white");
      logo?.classList.replace(
        "logo__img--before-scroll",
        "logo__img--after-scroll",
      );
    } else {
      navbar.classList.remove("bg-white", "shadow-lg", "px-4");
      navList?.classList.replace("text-black", "text-white");
      subNav?.classList.replace("top-[140%]", "top-[108%]");

      subNavLinks.forEach((link) =>
        link.classList.remove("hover:bg-black", "hover:text-white"),
      );
      servicesNavLink?.classList.remove("hover:bg-black", "hover:text-white");
      logo?.classList.replace(
        "logo__img--after-scroll",
        "logo__img--before-scroll",
      );
    }
  };

  // Hamburger Toggle
  menuBtn?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("translate-y-0");
    const isMenuOpening = mobileMenu?.classList.contains("translate-y-0");

    if (isMenuOpening) {
      spans[0].style.transform = "translateY(0) rotate(45deg)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "translateY(0) rotate(-45deg)";
    } else {
      spans[0].style.transform = "translateY(-10px) rotate(0deg) translateY(2px)";
      spans[1].style.opacity = "1";
      spans[2].style.transform = "translateY(10px) rotate(0deg) translateY(-2px)";
      if (mobileSubNav) {
        mobileSubNav.style.maxHeight = "0px";
        mobileSubNav.style.opacity = "0";
      }
    }
  });

  // Mobile Accordion
  servicesToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    const isOpen =
      mobileSubNav?.style.maxHeight && mobileSubNav.style.maxHeight !== "0px";
    if (isOpen) {
      mobileSubNav.style.maxHeight = "0px";
      mobileSubNav.style.opacity = "0";
      if (servicesArrow) servicesArrow.style.transform = "rotate(0deg)";
    } else {
      mobileSubNav.style.maxHeight = mobileSubNav.scrollHeight + "px";
      mobileSubNav.style.opacity = "1";
      if (servicesArrow) servicesArrow.style.transform = "rotate(180deg)";
    }
  });

  // Video Modal Functionality
  const cards = document.querySelectorAll(".testimonial-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const videoId = card.getAttribute("data-video-id");
      const currentOrigin = window.location.origin;

      if (modalIframe) {
        modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${currentOrigin}`;
      }

      modal?.classList.remove("hidden");
      modal?.classList.add("flex");
      setTimeout(() => modal?.classList.add("opacity-100"), 10);
      document.body.style.overflow = "hidden";
    });
  });

  const closeFunction = () => {
    modal?.classList.remove("opacity-100");
    setTimeout(() => {
      modal?.classList.add("hidden");
      modal?.classList.remove("flex");
      if (modalIframe) modalIframe.src = "";
      document.body.style.overflow = "";
    }, 300);
  };

  closeModal?.addEventListener("click", closeFunction);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeFunction();
  });

  // AJAX Navigation - THIS IS THE KEY PART!
  ajaxLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetPage = this.getAttribute('data-target');
      const pageName = this.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      
      console.log("🔵 Ajax link clicked!");
      console.log("   Text:", this.textContent.trim());
      console.log("   Target:", targetPage);
      console.log("   Hash will be:", pageName);
      
      // Update hash
      window.location.hash = pageName;
      
      // Load the page
      loadPage(targetPage, true);

      // Close mobile menu if open
      if (mobileMenu?.classList.contains("translate-y-0")) {
        menuBtn?.click();
      }
    });
  });

  // Handle hash changes (back/forward button)
  window.addEventListener('hashchange', function() {
    console.log("Hash changed to:", window.location.hash);
    checkHashAndLoadPage();
  });
}

/* =====================================================
   LOAD PAGE (AJAX)
===================================================== */
function loadPage(page, scrollTop = true) {
  const container = document.getElementById("page-content");
  if (!container) {
    console.error("❌ page-content container not found!");
    return;
  }

  console.log("📄 Loading page:", page);

  localStorage.setItem("currentPage", page);

  if (scrollTop) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Fade out
  container.style.transition = "opacity 0.3s ease";
  container.style.opacity = "0";

  setTimeout(() => {
    const fullPath = asset(page);
    console.log("   Fetching:", fullPath);
    
    fetch(fullPath + "?v=" + Date.now()) // Cache buster
      .then(res => {
        if (!res.ok) throw new Error("404");
        return res.text();
      })
      .then(html => {
        console.log("✅ Page loaded successfully");
        
        const doc = new DOMParser().parseFromString(html, "text/html");
        const newContent = doc.querySelector('.services-page, .about-page, .gallery-page, .blog-page');
        
        if (newContent) {
          container.innerHTML = newContent.innerHTML;
        } else {
          console.warn("⚠️  No page wrapper found, using body");
          container.innerHTML = doc.body.innerHTML;
        }
        
        fixAssets();
        initPageSpecificScripts();
        
        // Fade in
        setTimeout(() => {
          container.style.opacity = "1";
          
          // Re-init AOS
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
        }, 50);
      })
      .catch(err => {
        console.error("❌ Page load failed:", err);
        container.innerHTML =
          "<div class='flex items-center justify-center p-10 text-center h-[100vh]'><h1 class='text-4xl'>Page not found</h1><p class='mt-4'>Could not load: " + page + "</p></div>";
        container.style.opacity = "1";
      });
  }, 300);
}

/* =====================================================
   PAGE-SPECIFIC SCRIPTS
===================================================== */
function initPageSpecificScripts() {
  // Re-initialize video modals
  const cards = document.querySelectorAll(".testimonial-card");
  const modal = document.getElementById("video-modal");
  const modalIframe = document.getElementById("modal-iframe");
  
  if (cards.length > 0 && modal) {
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const videoId = card.getAttribute("data-video-id");
        const currentOrigin = window.location.origin;

        if (modalIframe) {
          modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${currentOrigin}`;
        }

        modal.classList.remove("hidden");
        modal.classList.add("flex");
        setTimeout(() => modal.classList.add("opacity-100"), 10);
        document.body.style.overflow = "hidden";
      });
    });
  }
  
  // Re-initialize Swiper if present
  initSwiper();
}

/* =====================================================
   INIT AOS
===================================================== */
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: "ease-out",
      once: false,
      offset: 100,
      delay: 0,
    });
  }
}

/* =====================================================
   INIT SWIPER
===================================================== */
function initSwiper() {
  if (typeof Swiper === 'undefined') return;
  
  const swiperEl = document.querySelector('.story-swiper');
  if (!swiperEl) return;
  
  // Destroy existing instance if any
  if (swiperEl.swiper) {
    swiperEl.swiper.destroy(true, true);
  }
  
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