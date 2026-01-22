const navbar = document.getElementById('navbar');
const subNav = document.querySelector(".nav__sub-nav");
const subNavLinks = document.querySelectorAll(".nav__sub-nav-links li");
const servicesNavLink = document.querySelector(".services__nav-link");
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const spans = menuBtn.querySelectorAll('span');
const servicesToggle = document.getElementById('mobile-services-toggle');
const mobileSubNav = document.getElementById('mobile-sub-nav');
const servicesArrow = document.getElementById('services-arrow');

// --- Scroll Logic ---
window.onscroll = function() {
    const logo = navbar.querySelector('.logo__img');
    const navList = navbar.querySelector('ul');

    if (window.scrollY > 50) {
        navbar.classList.add('bg-white', 'shadow-lg', 'px-4');
        navList.classList.replace('text-white', 'text-black');
        subNav.classList.replace("top-[108%]", "top-[140%]");
        
        subNavLinks.forEach(link => link.classList.add("hover:bg-black", "hover:text-white"));
        servicesNavLink.classList.add("hover:bg-black", "hover:text-white");
        logo.classList.replace("logo__img--before-scroll", "logo__img--after-scroll");
        
        // Change hamburger color to black when scrolled
        spans.forEach(s => s.classList.replace('bg-white', 'bg-black'));
    } else {
        navbar.classList.remove('bg-white', 'shadow-lg', 'px-4');
        navList.classList.replace('text-black', 'text-white');
        subNav.classList.replace("top-[140%]", "top-[108%]");
        
        subNavLinks.forEach(link => link.classList.remove("hover:bg-black", "hover:text-white"));
        servicesNavLink.classList.remove("hover:bg-black", "hover:text-white");
        logo.classList.replace("logo__img--after-scroll", "logo__img--before-scroll");
    }
};

spans[0].style.transform = "translateY(-8px)";
spans[2].style.transform = "translateY(8px)";

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('translate-y-0');
    
    const isMenuOpening = mobileMenu.classList.contains('translate-y-0');

    if (isMenuOpening) {
        // Perfect Close
        spans[0].style.transform = "translateY(0) rotate(45deg)";
        spans[1].style.opacity = "0";
        spans[2].style.transform = "translateY(0) rotate(-45deg)";
    } else {
        // Perfect Hamburger
        spans[0].style.transform = "translateY(-10px) rotate(0deg) translateY(2px)";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "translateY(10px) rotate(0deg) translateY(-2px)";

        mobileSubNav.style.maxHeight = "0px";
        mobileSubNav.style.opacity = "0";
        servicesArrow.style.transform = "rotate(0deg)";
    }
});


servicesToggle.addEventListener('click', (e) => {
    e.preventDefault();
    
    const isOpen = mobileSubNav.style.maxHeight && mobileSubNav.style.maxHeight !== "0px";
    
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