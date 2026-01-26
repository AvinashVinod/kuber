function loadComponentsParallel() {
  const components = [
    { id: "nav-placeholder", url: "../html/navbar.html" },
    { id: "footer-placeholder", url: "../html/footer.html" },
    { id: "contact-placeholder", url: "../html/contact.html" },
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

      // Load contact JS files
      loadContactJavaScript();
    })
    .catch((error) => {
      console.error("Error loading components:", error);
    });
}

// Function to load contact-related JavaScript files
function loadContactJavaScript() {
  const scripts = [
    "../js/contact-form.js",
    "../js/validation.js",
    "../js/form-submission.js",
  ];

  scripts.forEach((scriptSrc) => {
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.defer = true;
    document.head.appendChild(script);
  });
}

// Start loading when DOM is ready
document.addEventListener("DOMContentLoaded", loadComponentsParallel);
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

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const videoId = card.getAttribute("data-video-id");
      // Set the YouTube URL with Autoplay
      modalIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

      // Show Modal
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      setTimeout(() => modal.classList.add("opacity-100"), 10);
      document.body.style.overflow = "hidden"; // Stop background scroll
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

document.addEventListener("DOMContentLoaded", function () {
  // Initialize AOS (Animate on Scroll)
AOS.init({
  duration: 800, // Animation duration in ms
  easing: 'ease-out', // Default easing
  once: true, // Whether animation should happen only once
  offset: 100, // Offset (in px) from the original trigger point
  delay: 0, // Delay between animations
});
var storySwiper = new Swiper('.story-swiper', {
        loop: true,
        speed: 800,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: {
            rotate: 5,        // Slight rotation for elegance
            stretch: 0,        // Space between slides
            depth: 100,       // Perspective depth
            modifier: 2,       // Effect multiplier
            slideShadows: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
});

loadNavbar();
