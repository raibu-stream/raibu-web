// Get the canvas element
let canvas = document.querySelector(".background");

// Create 100 stars
for (let i = 0; i < 100; i++) {
  let star = document.createElement("div");
  star.className = "star";
  // Assign a speed class to each star
  let rand = Math.random();
  if (rand < 0.1) {
    star.classList.add("fast");
    star.dataset.speed = 0.4;
  } else if (rand < 0.3) {
    star.classList.add("normal");
    star.dataset.speed = 0.3;
  } else if (rand < 0.6) {
    star.classList.add("slow");
    star.dataset.speed = 0.2;
  } else {
    star.classList.add("slowest");
    star.dataset.speed = 0.1;
  }
  canvas.appendChild(star);
}

// Position stars randomly within the background div
let stars = document.querySelectorAll(".star");
stars.forEach((star) => {
  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";
});

// Check if the user has requested reduced motion
let reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Animate stars
function animateStars() {
  if (!reduceMotion) {
    stars.forEach((star) => {
      let left = parseFloat(star.style.left.replace("%", ""));
      // Use the star's speed to adjust its position
      left -= parseFloat(star.dataset.speed);
      if (left < 0) left = 100; // Reset star to right when it reaches the left
      star.style.left = left + "%";
    });
    requestAnimationFrame(animateStars);
  }
}
animateStars();

let target = { x: 0, y: 0 };
let current = { x: 0, y: 0 };
let ease = 0.05; // Decrease this value to make the transition last longer

// Update current position to move towards target position
function updatePosition() {
  if (!reduceMotion) {
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    stars.forEach((star) => {
      star.style.transform = `translate(${current.x * 50}px, ${
        current.y * 50
      }px)`;
    });
    requestAnimationFrame(updatePosition);
  }
}
updatePosition();

// Update target position on mouse move
canvas.addEventListener("mousemove", (event) => {
  target.x = event.clientX / window.innerWidth;
  target.y = event.clientY / window.innerHeight;
});
