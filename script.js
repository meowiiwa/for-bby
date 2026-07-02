const pages = [...document.querySelectorAll(".page")];
const dotsWrap = document.getElementById("dots");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const startBtn = document.getElementById("startBtn");
const song = document.getElementById("loveSong");
const musicToggle = document.getElementById("musicToggle");
const musicText = document.getElementById("musicText");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const answerText = document.getElementById("answerText");

let pageIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let hasTriedAutoplay = false;

const proposalLines = [
  "I promise we can make the distance feel smaller together.",
  "If you say yes, today officially becomes my favorite date.",
  "I am not asking for perfect. I just want us."
];

function buildDots() {
  dotsWrap.replaceChildren();
  pages.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to page ${index + 1}`);
    dot.addEventListener("click", () => goToPage(index));
    dotsWrap.appendChild(dot);
  });
}

function updateDots() {
  [...dotsWrap.children].forEach((dot, index) => {
    dot.classList.toggle("is-active", index === pageIndex);
  });
}

function goToPage(nextIndex) {
  const clamped = Math.max(0, Math.min(pages.length - 1, nextIndex));
  if (clamped === pageIndex) return;

  pages[pageIndex].classList.remove("is-active");
  pageIndex = clamped;
  pages[pageIndex].classList.add("is-active");
  updateDots();
}

function nudgePage(direction) {
  goToPage(pageIndex + direction);
}

async function tryPlayMusic(force = false) {
  if (!song || (hasTriedAutoplay && !force)) return;
  hasTriedAutoplay = true;

  try {
    song.muted = false;
    song.volume = 0.72;
    await song.play();
    setMusicState(true);
  } catch (error) {
    hasTriedAutoplay = false;
    setMusicState(false);
  }
}

function setMusicState(isPlaying) {
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
  musicText.textContent = isPlaying ? "Rest of My Life" : "Play";
}

function moveNoButton() {
  const parent = noBtn.parentElement.getBoundingClientRect();
  const button = noBtn.getBoundingClientRect();
  const maxX = Math.max(0, parent.width - button.width);
  const maxY = Math.max(0, parent.height - button.height);
  const nextX = Math.random() * maxX - maxX / 2;
  const nextY = Math.random() * maxY - maxY / 2;

  noBtn.style.transform = `translate(${nextX}px, ${nextY}px) rotate(${Math.random() * 10 - 5}deg)`;
  answerText.textContent = proposalLines[Math.floor(Math.random() * proposalLines.length)];
}

buildDots();
updateDots();
tryPlayMusic();
window.addEventListener("load", () => tryPlayMusic(true));

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && song.paused) {
    tryPlayMusic(true);
  }
});

startBtn.addEventListener("click", () => {
  tryPlayMusic(true);
  goToPage(1);
});

nextBtn.addEventListener("click", () => {
  tryPlayMusic(true);
  nudgePage(1);
});

prevBtn.addEventListener("click", () => nudgePage(-1));

musicToggle.addEventListener("click", async () => {
  if (song.paused) {
    await tryPlayMusic(true);
  } else {
    song.pause();
    setMusicState(false);
  }
});

yesBtn.addEventListener("click", () => {
  tryPlayMusic(true);
  answerText.textContent = "Yes? Then I am officially the happiest person across every timezone.";
  yesBtn.textContent = "Officially us";
  noBtn.style.opacity = "0";
  noBtn.style.pointerEvents = "none";
  document.body.classList.add("accepted");
});

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " ") {
    tryPlayMusic(true);
    nudgePage(1);
  }

  if (event.key === "ArrowLeft") {
    nudgePage(-1);
  }
});

document.addEventListener("pointerdown", () => tryPlayMusic(true), { once: true });

document.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (event) => {
  const endX = event.changedTouches[0].clientX;
  const endY = event.changedTouches[0].clientY;
  const deltaX = endX - touchStartX;
  const deltaY = endY - touchStartY;

  if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY)) {
    tryPlayMusic(true);
    nudgePage(deltaX < 0 ? 1 : -1);
  }
}, { passive: true });
