/* =====================================================
   BASE PATH (AUTO-DETECT: local /kuber vs production /)
===================================================== */
const BASE_PATH = window.location.pathname.includes("/kuber/")
  ? "/kuber/"
  : "/";

function asset(path) {
  console.log(BASE_PATH + path.replace(/^\/+/, ""));
  return BASE_PATH + path.replace(/^\/+/, "");
}

/* =====================================================
   DOM READY
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  debugLogo();
  loadComponentsParallel();
  initAOS();
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
      fixAssets();
      initializeNavScripts();
      handleHashRouting();
    })
    .catch(console.error);
}

/* =====================================================
   FIX IMG / SOURCE PATHS AFTER AJAX LOAD
===================================================== */
function fixAssets() {
  document.querySelectorAll("img, source").forEach(el => {
    const src = el.getAttribute("src");
    if (!src || src.startsWith("http")) return;
    el.src = asset(src);
  });
}

/* =====================================================
   HASH ROUTING
===================================================== */
function handleHashRouting() {
  const hash = window.location.hash.replace("#", "");

  const map = {
    services: "html/services.html",
    wedding: "html/services.html",
    "event-management": "html/services.html",
    decor: "html/services.html",
    corporate: "html/services.html",
  };

  if (map[hash]) {
    loadPage(map[hash], false);
  }
}

/* =====================================================
   NAVBAR + INTERACTIONS
===================================================== */
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
    modal.classList.remove("opacity-100");
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
  ajaxLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetPage = this.getAttribute('data-target');
      const pageName = this.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      
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

  // Handle hash changes (back/forward button)
  window.addEventListener('hashchange', function() {
    checkHashAndLoadPage();
  });
}

/* =====================================================
   LOAD PAGE (AJAX)
===================================================== */
function loadPage(page, scrollTop = true) {
  const container = document.getElementById("page-content");
  if (!container) return;

  localStorage.setItem("currentPage", page);

  if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });

  container.style.opacity = "0";

  fetch(asset(page))
    .then(res => {
      if (!res.ok) throw new Error("404");
      return res.text();
    })
    .then(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      container.innerHTML = doc.body.innerHTML;
      fixAssets();
      initPageSpecificScripts();
      container.style.opacity = "1";
    })
    .catch(() => {
      container.innerHTML =
        "<div class='p-10 text-center'><h1>Page not found</h1></div>";
      container.style.opacity = "1";
    });
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