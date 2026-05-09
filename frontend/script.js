document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const toggleButton = document.querySelector('.toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggleButton && navLinks) { // Add a check to ensure elements exist
        toggleButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            toggleButton.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        });

        // Close menu when a link is clicked (for single-page navigation)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    toggleButton.setAttribute('aria-expanded', false);
                }
            });
        });
    }


    // --- Dark/Light Mode Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (themeToggleBtn && body) { // Add a check to ensure elements exist
        // Check for user's preferred theme in localStorage or system preference
        const currentTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (currentTheme === 'dark' || (!currentTheme && prefersDark)) {
            body.classList.add('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for dark mode
        } else {
            body.classList.remove('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for light mode
        }

        // Event listener for the theme toggle button
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
    }


    // --- Testimonial Animation with Intersection Observer ---
    const testimonialObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // When the testimonial enters the viewport, add an 'animated' class
                entry.target.classList.add('testimonial-animated');
                // Stop observing once it has been animated
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2 // Trigger when 20% of the item is visible
    });

    const testimonials = document.querySelectorAll('.testimonial');

    // Only observe if testimonials exist on the page
    if (testimonials.length > 0) {
        testimonials.forEach(testimonial => {
            testimonialObserver.observe(testimonial);
        });
    }
});