/* =====================================================
   BASE PATH (AUTO-DETECT: local /kuber vs production /)
===================================================== */
const BASE_PATH = window.location.pathname.includes("/kuber/")
  ? "/kuber/"
  : "/";

function asset(path) {
  const result = BASE_PATH + path.replace(/^\/+/, "");
  // console.log("Asset path:", result);
  return result;
}

/* =====================================================
   DOM READY
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  debugLogo();
  loadComponentsParallel();
  initSwiper();
});

function debugLogo() {
  const logo = document.querySelector('img[src*="logo"]');
  if (!logo) return;
  // console.log("Logo src:", logo.src);
  const img = new Image();
  // img.onload = () => console.log("✅ Logo loads");
  // img.onerror = () => console.error("❌ Logo fails");
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
    components.map((c) =>
      fetch(c.url)
        .then((res) => {
          if (!res.ok) throw new Error(c.url);
          return res.text();
        })
        .then((html) => {
          const el = document.getElementById(c.id);
          if (el) el.innerHTML = html;
        }),
    ),
  )
    .then(() => {
      // console.log("✅ All components loaded");
      fixAssets();
      initializeNavScripts();
      handleHashRouting();
      initAOS();
    })
    .catch((err) => {
      console.error("❌ Component load error:", err);
    });
}

function fixAssets() {
  document.querySelectorAll("img, source").forEach((el) => {
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
  // console.log("Current hash:", hash);
  const map = {
    services: "html/services.html",
    wedding: "html/services.html",
    "event-management": "html/services.html",
    decor: "html/services.html",
    corporate: "html/services.html",
    gallery: "html/gallery.html",
    blog: "html/blogs.html",
    "contact-us": "html/contactContainer.html",
  };

  if (map[hash]) {
    // console.log("Loading page for hash:", hash);
    loadPage(map[hash], false);
  } else if (hash && !hash.startsWith("about") && !hash.startsWith("contact") && !hash.startsWith("gallery") && !hash.startsWith("blogs")) {
    const stored = localStorage.getItem("currentPage");
    if (stored) {
      // console.log("Restoring stored page:", stored);
      loadPage(stored, false);
    }
  }
}

function checkHashAndLoadPage() {
  handleHashRouting();
}

/* =====================================================
   🔥 FIXED: INIT AOS FOR AJAX NAVIGATION
===================================================== */
function initAOS() {
  if (typeof AOS === "undefined") {
    console.warn("AOS not loaded yet - retrying in 500ms");
    setTimeout(initAOS, 500);
    return;
  }

  // console.log("🎬 Initializing AOS...");

  // 🔥 CRITICAL FIX 1: Remove ALL AOS classes from ALL elements
  document.querySelectorAll('[data-aos]').forEach(el => {
    el.classList.remove('aos-init', 'aos-animate');
    // Reset inline styles that AOS might have added
    el.style.transform = '';
    el.style.opacity = '';
  });

  // 🔥 CRITICAL FIX 2: Add data-aos to elements that need animation
  const items = document.querySelectorAll(".gallery-item, .about-page [data-aos], .services-page [data-aos]");
  // console.log(`Found ${items.length} items to animate`);
  
  items.forEach((item, index) => {
    if (!item.hasAttribute("data-aos")) {
      item.setAttribute("data-aos", "fade-up");
      item.setAttribute("data-aos-delay", (index % 4) * 100);
    }
  });

  // 🔥 CRITICAL FIX 3: Initialize with once: false for AJAX
  AOS.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: false,  // 🔥 MUST BE FALSE for AJAX pages
    offset: 50,
    disable: false,
    startEvent: 'load',
    initClassName: 'aos-init',
    animatedClassName: 'aos-animate',
    useClassNames: false,
    disableMutationObserver: false,
    debounceDelay: 50,
    throttleDelay: 99,
    mirror: false,
  });

  // 🔥 CRITICAL FIX 4: Multiple refresh cycles with delays
  setTimeout(() => {
    AOS.refresh();
    // console.log("✅ AOS refreshed (1/3) - Elements:", document.querySelectorAll('[data-aos]').length);
  }, 50);

  setTimeout(() => {
    AOS.refresh();
    // console.log("✅ AOS refreshed (2/3)");
  }, 150);

  setTimeout(() => {
    AOS.refresh();
    // console.log("✅ AOS refreshed (3/3 - final)");
  }, 300);
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
  const ajaxLinks = document.querySelectorAll(".ajax-link");

  // console.log("Found ajax links:", ajaxLinks.length);

  if (spans.length >= 3) {
    spans[0].style.transform = "translateY(-8px)";
    spans[2].style.transform = "translateY(8px)";
  }

  window.onscroll = function () {
    if (window.scrollY > 50) {
      navbar.classList.add("bg-white", "shadow-lg", "px-4");
      navList?.classList.replace("text-white", "text-black");
      subNav?.classList.replace("top-[108%]", "top-[140%]");
      subNavLinks.forEach((link) => link.classList.add("hover:bg-[#511730]", "hover:text-white"));
      servicesNavLink?.classList.add("hover:bg-[#511730]", "hover:text-white");
      logo?.classList.replace("logo__img--before-scroll", "logo__img--after-scroll");
    } else {
      navbar.classList.remove("bg-white", "shadow-lg", "px-4");
      navList?.classList.replace("text-black", "text-white");
      subNav?.classList.replace("top-[140%]", "top-[108%]");
      logo?.classList.replace("logo__img--after-scroll", "logo__img--before-scroll");
    }
  };

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

  servicesToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    const parentLi = servicesToggle.closest('.mobile-link-container');
    const isOpen = mobileSubNav?.style.maxHeight && mobileSubNav.style.maxHeight !== "0px";
    if (isOpen) {
      mobileSubNav.style.maxHeight = "0px";
      mobileSubNav.style.opacity = "0";
      if (servicesArrow) servicesArrow.style.transform = "rotate(0deg)";
      parentLi.classList.remove('text-[#ca8a04]');
    } else {
      mobileSubNav.style.maxHeight = mobileSubNav.scrollHeight + "px";
      mobileSubNav.style.opacity = "1";
      if (servicesArrow) servicesArrow.style.transform = "rotate(180deg)";
      parentLi.classList.add('text-[#ca8a04]');
    }
  });

  const cards = document.querySelectorAll(".testimonial-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const videoId = card.getAttribute("data-video-id");
      if (modalIframe) {
        modalIframe.src = `https://www.youtube.com/embed/${videoId}?si=eNUm1uafksusDCrk&autoplay=1`;
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

  ajaxLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetPage = this.getAttribute("data-target");
      const pageName = this.textContent.trim().toLowerCase().replace(/\s+/g, "-");
      window.location.hash = pageName;
      loadPage(targetPage, true);
      if (mobileMenu?.classList.contains("translate-y-0")) {
        menuBtn?.click();
      }
    });
  });

  const homeLinks = document.querySelectorAll(".home-link");
  homeLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.hash = "";
      localStorage.removeItem("currentPage");
      window.location.href = BASE_PATH;
    });
  });

  window.addEventListener("hashchange", checkHashAndLoadPage);
}

/* =====================================================
   🔥 FIXED: LOAD PAGE WITH PROPER AOS HANDLING
===================================================== */
function loadPage(page, scrollTop = true) {
  const container = document.getElementById("page-content");
  if (!container) {
    return;
  }

  localStorage.setItem("currentPage", page);

  if (scrollTop) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  container.style.transition = "opacity 0.3s ease";
  container.style.opacity = "0";

  setTimeout(() => {
    const fullPath = asset(page);

    fetch(fullPath + "?v=" + Date.now())
      .then((res) => {
        if (!res.ok) throw new Error("404");
        return res.text();
      })
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const newContent = doc.querySelector(".services-page, .about-page, .gallery-page, .blogs-page");

        if (newContent) {
          container.innerHTML = newContent.innerHTML;
        } else {
          console.warn("⚠️  No page wrapper found, using body");
          container.innerHTML = doc.body.innerHTML;
        }

        fixAssets();
        initPageSpecificScripts();

        // 🔥 CRITICAL: Wait for DOM to be ready, then init AOS
        setTimeout(() => {
          container.style.opacity = "1";
          
          // Initialize AOS after fade-in begins
          setTimeout(() => {
            initAOS();
          }, 100);
        }, 50);
      })
      .catch((err) => {
        console.error("❌ Page load failed:", err);
        container.innerHTML = "<div class='flex items-center justify-center p-10 text-center h-[100vh]'><h1 class='text-4xl'>Page not found</h1></div>";
        container.style.opacity = "1";
      });
  }, 300);
}

/* =====================================================
   PAGE-SPECIFIC SCRIPTS
===================================================== */
function initPageSpecificScripts() {
  renderBlogs();

  const faqButtons = document.querySelectorAll('.faq-button');
  if (faqButtons.length > 0) {
    faqButtons.forEach(button => {
      button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const content = faqItem.querySelector('.faq-content');
        const arrow = button.querySelector('.arrow-icon');
        const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

        document.querySelectorAll('.faq-content').forEach(otherContent => {
          otherContent.style.maxHeight = '0px';
          const otherArrow = otherContent.parentElement.querySelector('.arrow-icon');
          if(otherArrow) otherArrow.style.transform = 'rotate(0deg)';
        });

        if (!isOpen) {
          content.style.maxHeight = content.scrollHeight + "px";
          arrow.style.transform = 'rotate(180deg)';
        }
      });
    });
  }

  const cards = document.querySelectorAll(".testimonial-card");
  const modal = document.getElementById("video-modal");
  const modalIframe = document.getElementById("modal-iframe");
  if (cards.length > 0 && modal) {
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const videoId = card.getAttribute("data-video-id");
        if (modalIframe) {
          modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${window.location.origin}`;
        }
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        setTimeout(() => modal.classList.add("opacity-100"), 10);
        document.body.style.overflow = "hidden";
      });
    });
  }

  initSwiper();
}

function initSwiper() {
  if (typeof Swiper === "undefined") return;
  const swiperEl = document.querySelector(".story-swiper");
  if (!swiperEl) return;
  if (swiperEl.swiper) {
    swiperEl.swiper.destroy(true, true);
  }
  new Swiper(".story-swiper", {
    loop: true,
    speed: 800,
    autoplay: { delay: 4000, disableOnInteraction: false },
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: { rotate: 5, stretch: 0, depth: 100, modifier: 2, slideShadows: false },
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof Fancybox !== "undefined") {
    Fancybox.bind('[data-fancybox="services-gallery"]', {
      infinite: true,
      caption: false,
      Carousel: { Navigation: false },
    });
  }
});

// =====================================================
// RenderBlogs() and Pagination logic
// =====================================================

let currentBlogPage = 1;
const ITEMS_PER_PAGE = 12;

const blogData = [
  { title: "Seasonal Flower Guide kfhqewpifhpqewhripqewhrpqhrpqwhrpqw uohqwprhqpwhrqwrqpwrhqpwrh",   subtitle: "Crafting your perfect floral palette",   img: "./media/images/wedding.avif" },
  { title: "Spring Blooms",           subtitle: "Fresh starts and vibrant colors",         img: "./media/images/wedding.avif" },
  { title: "Winter Elegance",         subtitle: "Classic whites andqorhqwpehrqpwehrpqhrpqph deep greens",          img: "./media/images/wedding.avif" },
  { title: "The Art of Bouquets",     subtitle: "Arranging like a professional",           img: "./media/images/wedding.avif" },
  { title: "Sustainable Gardening",   subtitle: "Eco-friendly floral tips",                img: "./media/images/wedding.avif" },
  { title: "Romantic Roses",          subtitle: "The timeless symbol of love",             img: "./media/images/wedding.avif" },
  { title: "Wildflower Magic",        subtitle: "Bringing the meadow home",                img: "./media/images/wedding.avif" },
  { title: "Tropical Vibes",          subtitle: "Exotic plants for bright spaces",         img: "./media/images/wedding.avif" },
  { title: "Caring for Lilies",       subtitle: "Fragrance that lasts weeks",              img: "./media/images/wedding.avif" },
  { title: "Dried Flower Decor",      subtitle: "Preserving beauty forever",               img: "./media/images/wedding.avif" },
  { title: "Wedding Centerpieces",    subtitle: "Making your big day pop",                 img: "./media/images/wedding.avif" },
  { title: "Orchid Essentials",       subtitle: "Mastering the delicate orchid",           img: "./media/images/wedding.avif" },
  { title: "Autumn Harvest",          subtitle: "Warm tones and rustic textures",          img: "./media/images/wedding.avif" },
  { title: "Balcony Gardening",       subtitle: "Small spaces, big blooms",                img: "./media/images/wedding.avif" },
  { title: "Floral Scents",           subtitle: "Natural aromatherapy tips",               img: "./media/images/wedding.avif" },
  { title: "DIY Flower Crowns",       subtitle: "The ultimate festival accessory",         img: "./media/images/wedding.avif" },
  { title: "Succulent Styling",       subtitle: "Low maintenance, high style",             img: "./media/images/wedding.avif" },
  { title: "Pet-Safe Plants",         subtitle: "Keep your furry friends happy",           img: "./media/images/wedding.avif" },
    { title: "Seasonal Flower Guide",   subtitle: "Crafting your perfect floral palette",   img: "./media/images/wedding.avif" },
  { title: "Spring Blooms",           subtitle: "Fresh starts and vibrant colors",         img: "./media/images/wedding.avif" },
  { title: "Winter Elegance",         subtitle: "Classic whites and deep greens",          img: "./media/images/wedding.avif" },
  { title: "The Art of Bouquets",     subtitle: "Arranging like a professional",           img: "./media/images/wedding.avif" },
  { title: "Sustainable Gardening",   subtitle: "Eco-friendly floral tips",                img: "./media/images/wedding.avif" },
  { title: "Romantic Roses",          subtitle: "The timeless symbol of love",             img: "./media/images/wedding.avif" },
  { title: "Wildflower Magic",        subtitle: "Bringing the meadow home",                img: "./media/images/wedding.avif" },
  { title: "Tropical Vibes",          subtitle: "Exotic plants for bright spaces",         img: "./media/images/wedding.avif" },
  { title: "Caring for Lilies",       subtitle: "Fragrance that lasts weeks",              img: "./media/images/wedding.avif" },
  { title: "Dried Flower Decor",      subtitle: "Preserving beauty forever",               img: "./media/images/wedding.avif" },
  { title: "Wedding Centerpieces",    subtitle: "Making your big day pop",                 img: "./media/images/wedding.avif" },
  { title: "Orchid Essentials",       subtitle: "Mastering the delicate orchid",           img: "./media/images/wedding.avif" },
  { title: "Autumn Harvest",          subtitle: "Warm tones and rustic textures",          img: "./media/images/wedding.avif" },
  { title: "Balcony Gardening",       subtitle: "Small spaces, big blooms",                img: "./media/images/wedding.avif" },
  { title: "Floral Scents",           subtitle: "Natural aromatherapy tips",               img: "./media/images/wedding.avif" },
  { title: "DIY Flower Crowns",       subtitle: "The ultimate festival accessory",         img: "./media/images/wedding.avif" },
  { title: "Succulent Styling",       subtitle: "Low maintenance, high style",             img: "./media/images/wedding.avif" },
  { title: "Pet-Safe Plants",         subtitle: "Keep your furry friends happy",           img: "./media/images/wedding.avif" },
];

// Called on fresh blog page load — resets to page 1
function renderBlogs() {
  currentBlogPage = 1;
  renderBlogPage();
}

// Renders cards + pagination for currentBlogPage
function renderBlogPage() {
  const blogContainer = document.querySelector(".blogs");
  const paginationContainer = document.querySelector(".blog-pagination");
  if (!blogContainer) return;

  const totalPages = Math.ceil(blogData.length / ITEMS_PER_PAGE);
  const start = (currentBlogPage - 1) * ITEMS_PER_PAGE;
  const slice = blogData.slice(start, start + ITEMS_PER_PAGE);

  // ── Render Cards ──────────────────────────────────
// Inside renderBlogPage() function, update the mapping:

blogContainer.innerHTML = slice.map(blog => `
    <div class="blog-card-item blog group w-[290px] bg-white border-2 border-[#D2B194] rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 hover:-translate-y-2 cursor-pointer" 
         data-target="/html/blog.html"> <div class="h-64 overflow-hidden">
        <img src="${blog.img}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${blog.title}">
      </div>
      <div class="flex flex-col justify-between h-[190px]">
        <div class="p-6 pb-0 flex flex-col h-fit justify-between">
          <div>
            <h3 class="text-xl font-medium text-gray-900 leading-tight mb-2 line-clamp-1">${blog.title}</h3>
            <p class="text-sm text-gray-500 mb-6 line-clamp-2">${blog.subtitle}</p>
          </div>
        </div>
        <div class="flex items-center justify-between m-6 mt-0 p-3 bg-[#D2B194] text-white rounded-lg text-xs tracking-widest uppercase transition-all group-hover:bg-[#511730]">
          Read More
          <div class="px-[0.42rem] py-1 rounded-full bg-[#511730] group-hover:bg-[#D2B194]">
            <span class="transition-transform duration-300 h-2.5 w-2.5 inline-block ">
              <svg fill="#FFFFFF" width="100%" height="100%" viewBox="0 -6 524 524" xmlns="http://www.w3.org/2000/svg">
                <polygon points="150.46 478 129.86 456.5 339.11 256 129.86 55.49 150.46 34 382.14 256 150.46 478" stroke="#FFFFFF" stroke-width="40" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  // ── Render Pagination ─────────────────────────────
  if (!paginationContainer) return;

  // Build page number buttons
  let pageButtons = "";
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentBlogPage;
    pageButtons += `
      <button
        data-page="${i}"
        class="page-btn w-10 h-10 flex items-center justify-center rounded-full font-medium transition-all
          ${isActive
            ? "bg-[#F68FA2] text-white shadow-lg shadow-[#F68FA2]/30"
            : "text-white/60 hover:text-white hover:bg-white/10"
          }"
      >${i}</button>
    `;
  }

  paginationContainer.innerHTML = `
    <!-- Prev -->
    <button
      id="blog-prev"
      class="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center
             hover:bg-[#F68FA2] hover:border-[#F68FA2] transition-all
             ${currentBlogPage === 1 ? "opacity-30 pointer-events-none" : ""}"
    >
      <span class="sr-only">Previous</span>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>

    <!-- Page Numbers -->
    <div class="flex items-center space-x-2">
      ${pageButtons}
    </div>

    <!-- Next -->
    <button
      id="blog-next"
      class="w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center
             hover:bg-[#F68FA2] hover:border-[#F68FA2] transition-all
             ${currentBlogPage === totalPages ? "opacity-30 pointer-events-none" : ""}"
    >
      <span class="sr-only">Next</span>
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  `;

  // ── Wire up events ─────────────────────────────────
  paginationContainer.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentBlogPage = parseInt(btn.getAttribute("data-page"));
      renderBlogPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.getElementById("blog-prev")?.addEventListener("click", () => {
    if (currentBlogPage > 1) {
      currentBlogPage--;
      renderBlogPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  document.getElementById("blog-next")?.addEventListener("click", () => {
    if (currentBlogPage < totalPages) {
      currentBlogPage++;
      renderBlogPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  fixAssets();
  if (typeof AOS !== "undefined") AOS.refresh();

blogContainer.querySelectorAll(".blog-card-item").forEach(card => {
    card.addEventListener("click", () => {
        const target = card.getAttribute("data-target");
        
        // Update hash for browser history
        window.location.hash = "blog-details"; 
        
        // Use your existing AJAX loader
        loadPage(target, true);
    });
});
}

function debugAOS() {
  // console.log("=== AOS DEBUG ===");
  // console.log("AOS available:", typeof AOS !== "undefined");
  // console.log("Elements with data-aos:", document.querySelectorAll('[data-aos]').length);
  // console.log("Elements with aos-init:", document.querySelectorAll('.aos-init').length);
  // console.log("Elements with aos-animate:", document.querySelectorAll('.aos-animate').length);
  if (typeof AOS !== "undefined") {
    AOS.refresh();
  }
  // console.log("=== END DEBUG ===");
}

window.debugAOS = debugAOS;