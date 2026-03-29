/**
 * Boilerplate animations.js
 * Handles lightweight UI transitions.
 */

const animations = {
    fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        let start = null;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            element.style.opacity = Math.min(progress / duration, 1);
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
};

window.animations = animations;
