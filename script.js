const navbar = document.getElementById('navbar');
const subNav = document.querySelector(".nav__sub-nav");  
const subNavLinks = document.querySelectorAll(".nav__sub-nav-links li");
const servicesNavLink = document.querySelector(".services__nav-link");

window.onscroll = function() {
    const logo = navbar.querySelector('.logo__img');
    const navList = navbar.querySelector('ul');

    if (window.scrollY > 50) {
        navbar.classList.add('bg-white', 'shadow-lg', 'px-4');
        navList.classList.replace('text-white', 'text-black');
        
        subNav.classList.add("top-[135%]");
        
        subNavLinks.forEach(link => link.classList.add("hover:bg-black", "hover:text-white"));
        servicesNavLink.classList.add("hover:bg-black", "hover:text-white");

        logo.classList.replace("logo__img--before-scroll", "logo__img--after-scroll");
    } else {
        navbar.classList.remove('bg-white', 'shadow-lg', 'px-4');
        navList.classList.replace('text-black', 'text-white');
        
        subNav.classList.remove("top-[135%]");
        subNav.classList.add("top-[105%]");
        
        subNavLinks.forEach(link => link.classList.remove("hover:bg-black", "hover:text-white"));
        servicesNavLink.classList.remove("hover:bg-black", "hover:text-white");
        
        logo.classList.replace("logo__img--after-scroll", "logo__img--before-scroll");
    }
};