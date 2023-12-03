// Check if the user has requested reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Add a class to the body that disables animations and transitions
    document.body.classList.add('reduce-motion');
}