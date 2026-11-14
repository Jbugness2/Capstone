// Header: turns solid once you scroll
const header = document.querySelector(".site-header");
const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });
}

// Friendly placeholder for any image that hasn't been added to /assets yet
function showPlaceholder(img) {
  if (img.dataset.handled) return;
  img.dataset.handled = "1";
  const box = document.createElement("div");
  box.className = "placeholder";
  box.innerHTML = "<span>" + (img.alt || "Image") + "<br><code>" + img.getAttribute("src") + "</code></span>";
  img.replaceWith(box);
}
document.querySelectorAll("img").forEach((img) => {
  if (img.complete && img.naturalWidth === 0) showPlaceholder(img);
  img.addEventListener("error", () => showPlaceholder(img));
});

// Carousels (scroll-snap + dots + arrows). A carousel with one slide just shows it.
document.querySelectorAll("[data-carousel]").forEach((c) => {
  const track = c.querySelector(".slides");
  const slides = [...track.children];
  if (slides.length < 2) { c.classList.add("single"); return; }

  const dots = document.createElement("div");
  dots.className = "dots";
  const go = (i) => track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Slide " + (i + 1) + " of " + slides.length);
    b.addEventListener("click", () => go(i));
    dots.appendChild(b);
  });
  c.appendChild(dots);

  const index = () => Math.round(track.scrollLeft / track.clientWidth);
  ["prev", "next"].forEach((dir) => {
    const a = document.createElement("button");
    a.type = "button";
    a.className = "arrow " + dir;
    a.setAttribute("aria-label", dir === "prev" ? "Previous slide" : "Next slide");
    a.textContent = dir === "prev" ? "‹" : "›";
    a.addEventListener("click", () => go(Math.max(0, Math.min(slides.length - 1, index() + (dir === "prev" ? -1 : 1)))));
    c.appendChild(a);
  });

  const update = () => [...dots.children].forEach((d, j) => d.classList.toggle("on", j === index()));
  track.addEventListener("scroll", update, { passive: true });
  update();
});

// Gentle reveal on scroll
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add("in"));
}
