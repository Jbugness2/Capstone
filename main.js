// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
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

// Gentle reveal on scroll
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add("in"));
}
