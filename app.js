function loadComponent(id, file, callback) {
  fetch(file)
    .then((res) => res.text())
    .then((html) => {
      const mount = document.getElementById(id);
      if (!mount) return;
      mount.innerHTML = html;
      if (typeof callback === "function") callback();
    })
    .catch((err) => console.error(`Failed to load ${file}:`, err));
}

// initialize navbar interactivity AFTER it’s loaded
function initNavbar() {
  const menu = document.querySelector('#mobile-menu');
  const menuLinks = document.querySelector('.navbar__menu');
  if (!menu || !menuLinks) return;

  menu.addEventListener('click', () => {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
  });
}

// Load navbar & footer
loadComponent("navbar", "components/navbar.html", initNavbar);
loadComponent("footer", "components/footer.html");
