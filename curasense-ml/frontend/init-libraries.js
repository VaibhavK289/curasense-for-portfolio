// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

// Initialize Particles.js for background effect with balanced colors
particlesJS('particles-js', {
    particles: {
        number: { value: 40, density: { enable: true, value_area: 900 } },
        color: { value: '#94a3b8' },
        shape: { type: 'circle' },
        opacity: {
            value: 0.35,
            random: true,
            anim: { enable: true, speed: 0.8, opacity_min: 0.15, sync: false }
        },
        size: {
            value: 3,
            random: true,
            anim: { enable: true, speed: 2, size_min: 0.5, sync: false }
        },
        line_linked: {
            enable: true,
            distance: 140,
            color: '#cbd5e1',
            opacity: 0.25,
            width: 1
        },
        move: {
            enable: true,
            speed: 1,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: { enable: false, rotateX: 600, rotateY: 1200 }
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true
        },
        modes: {
            grab: { distance: 120, line_linked: { opacity: 0.5 } },
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 3 }
        }
    },
    retina_detect: true
});

// Add GSAP animations for sidebar and its components
// Ensure sidebar is visible
gsap.set('.sidebar', { display: 'flex', visibility: 'visible', opacity: 1 });

// Create master timeline for smooth entrance
const sidebarTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

// Sidebar slide in from left
sidebarTimeline.from('.sidebar', {
    duration: 0.6,
    x: -250,
    ease: 'power2.out'
});

// Logo animation with bounce
sidebarTimeline.from('.logo', {
    duration: 0.8,
    opacity: 0,
    y: -30,
    ease: 'back.out(1.7)'
}, '-=0.3');

// Logo text with shimmer
sidebarTimeline.from('.logo h2', {
    duration: 1.5,
    opacity: 0,
    y: -20,
    scale: 0.9,
    ease: 'bounce.out'
}, '-=0.5');

// Stagger animation for navigation items
sidebarTimeline.from('.nav-item', {
    duration: 0.6,
    opacity: 0,
    x: -40,
    stagger: 0.1,
    ease: 'back.out(1.5)'
}, '-=0.4');

// Quick actions fade in
sidebarTimeline.from('.quick-actions', {
    duration: 0.6,
    opacity: 0,
    y: 20,
    ease: 'power2.out'
}, '-=0.2');

// Action buttons with scale effect
sidebarTimeline.from('.action-btn', {
    duration: 0.4,
    opacity: 0,
    scale: 0.85,
    stagger: 0.1,
    ease: 'back.out(1.5)'
}, '-=0.3');

// Add interactive hover animations
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        gsap.to(this, {
            duration: 0.3,
            x: 8,
            scale: 1.02,
            ease: 'power2.out'
        });
    });
    
    item.addEventListener('mouseleave', function() {
        gsap.to(this, {
            duration: 0.3,
            x: 0,
            scale: 1,
            ease: 'power2.out'
        });
    });
});

// Action button pulse on hover
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        gsap.to(this, {
            duration: 0.3,
            scale: 1.05,
            ease: 'power2.out'
        });
    });
    
    btn.addEventListener('mouseleave', function() {
        gsap.to(this, {
            duration: 0.3,
            scale: 1,
            ease: 'power2.out'
        });
    });
});

// Enhanced toast notification function
window.showToast = function(message, type = 'success') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        stopOnFocus: true,
        style: {
            background: type === 'success' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : type === 'error'
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
        },
        onClick: function(){}
    }).showToast();
};

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add 3D parallax effect to cards
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.action-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        } else {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        }
    });
});

// Performance optimization: Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        AOS.refresh();
    }, 250);
});

// Add loading state animations
window.showLoading = function() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        gsap.from(overlay, { duration: 0.3, opacity: 0 });
    }
};

window.hideLoading = function() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        gsap.to(overlay, { 
            duration: 0.3, 
            opacity: 0, 
            onComplete: () => overlay.style.display = 'none' 
        });
    }
};

// Add micro-interactions to buttons
document.querySelectorAll('button, .btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('mouseenter', function() {
        gsap.to(this, { duration: 0.3, scale: 1.05, ease: 'power2.out' });
    });
    
    button.addEventListener('mouseleave', function() {
        gsap.to(this, { duration: 0.3, scale: 1, ease: 'power2.out' });
    });
    
    button.addEventListener('mousedown', function() {
        gsap.to(this, { duration: 0.1, scale: 0.95 });
    });
    
    button.addEventListener('mouseup', function() {
        gsap.to(this, { duration: 0.2, scale: 1.05 });
    });
});

// Add typing effect for headings
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect on page load
window.addEventListener('load', () => {
    const mainHeading = document.querySelector('.dashboard-header h1');
    if (mainHeading) {
        const text = mainHeading.textContent;
        typeWriter(mainHeading, text, 80);
    }
});

// Add ripple effect to action cards
document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Enhanced 3D Card Tracking Effect
document.querySelectorAll('.card-3d').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        const rotateX = deltaY * -15; // Max 15 degrees
        const rotateY = deltaX * 15;
        
        const glowX = (deltaX + 1) * 50; // 0-100%
        const glowY = (deltaY + 1) * 50;
        
        gsap.to(this, {
            duration: 0.3,
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
            ease: 'power2.out'
        });
        
        // Update shine position
        const shine = this.querySelector('.card-shine');
        if (shine) {
            shine.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.8) 0%, transparent 50%)`;
        }
    });
    
    card.addEventListener('mouseleave', function() {
        gsap.to(this, {
            duration: 0.5,
            rotateX: 0,
            rotateY: 0,
            ease: 'power2.out'
        });
    });
});

// Smooth scroll reveal for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease-out';
    cardObserver.observe(card);
});

// Enhanced button hover animations
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.btn-icon');
        if (icon) {
            gsap.to(icon, {
                duration: 0.3,
                x: 5,
                ease: 'power2.out'
            });
        }
    });
    
    btn.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.btn-icon');
        if (icon) {
            gsap.to(icon, {
                duration: 0.3,
                x: 0,
                ease: 'power2.out'
            });
        }
    });
});

// Parallax effect for header icons
document.addEventListener('mousemove', (e) => {
    const headerIcons = document.querySelectorAll('.header-icon');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    headerIcons.forEach(icon => {
        const moveX = (mouseX - 0.5) * 20;
        const moveY = (mouseY - 0.5) * 20;
        
        gsap.to(icon, {
            duration: 0.5,
            x: moveX,
            y: moveY,
            ease: 'power2.out'
        });
    });
});

console.log('%c✨ CuraSense Dashboard Loaded Successfully!', 'color: #4a90e2; font-size: 16px; font-weight: bold;');
