const products = [
  { id: "linen-throw", name: "Sunday linen throw", detail: "Washed European linen · Oat", price: 89, category: "home", badge: "Bestseller", image: "photo-1600210492486-724fe5c67fb0" },
  { id: "everyday-mug", name: "Everyday stoneware mug", detail: "Hand-finished ceramic · Chalk", price: 28, category: "home", badge: "Small batch", image: "photo-1577937927133-66ef06acdf18" },
  { id: "ritual-oil", name: "Slow morning body oil", detail: "Neroli & soft cedar · 100 ml", price: 34, category: "ritual", badge: "A little ritual", image: "photo-1608571423902-eed4a5ad8108" },
  { id: "market-tote", name: "The market tote", detail: "Recycled cotton canvas · Moss", price: 42, category: "wear", badge: "", image: "photo-1590874103328-eac38a683ce7" },
  { id: "weekend-candle", name: "A slow Sunday candle", detail: "Beeswax & fig leaf · 220 g", price: 36, category: "ritual", badge: "Made by hand", image: "photo-1603006905003-be475563bc59" },
  { id: "relaxed-shirt", name: "Easy does it shirt", detail: "Organic cotton poplin · Cloud", price: 76, category: "wear", badge: "", image: "photo-1598554747436-c9293d6a588f" },
  { id: "little-vase", name: "Little things vase", detail: "Hand-thrown stoneware · Sand", price: 48, category: "home", badge: "", image: "photo-1578500494198-246f612d3b3d" },
  { id: "sleep-mask", name: "Soft landing eye mask", detail: "Mulberry silk · Dusty rose", price: 32, category: "ritual", badge: "Sleep well", image: "photo-1611930022073-b7a4ba5fcccd" }
];

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#product-search");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const cart = new Map();
const favorites = new Set();
let activeFilter = "all";
let toastTimeout;

const heroSlides = [
  {
    image: "photo-1618221195710-dd6b41faaea6",
    alt: "Sunlit, thoughtfully styled living room with soft natural textures",
    eyebrow: "MAKE ROOM FOR THE GOOD",
    title: "A softer kind<br />of <em>everyday.</em>",
    copy: "Thoughtful little things for slow mornings, cozy corners, and everything in between.",
    cta: "Find your everyday",
    caption: "Made for the moments that matter"
  },
  {
    image: "photo-1616486338812-3dadae4b4ace",
    alt: "Calm, sunlit home interior with warm natural details",
    eyebrow: "A HOME THAT FEELS LIKE YOU",
    title: "Come home<br />to <em>calm.</em>",
    copy: "Easy, considered pieces to make your favorite corners feel even more like yours.",
    cta: "Find your home things",
    caption: "Little comforts, right where you need them"
  },
  {
    image: "photo-1600210492486-724fe5c67fb0",
    alt: "A cozy living space filled with soft neutral furnishings",
    eyebrow: "SLOW DOWN, SOFTLY",
    title: "Make space<br />for <em>slow.</em>",
    copy: "Everyday rituals, softer textures, and small reminders to take your time.",
    cta: "Find your slow moments",
    caption: "For slower mornings and softer landings"
  }
];
const heroImage = document.querySelector(".hero-image");
const heroDots = document.querySelector(".hero-dots");
let currentHeroSlide = 0;
let heroImageRequest = 0;

function renderHeroDots() {
  heroDots.innerHTML = heroSlides.map((slide, index) => `
    <button class="hero-dot" type="button" data-hero-slide="${index}" aria-label="Show slide ${index + 1}: ${slide.eyebrow}" aria-current="${index === currentHeroSlide}"></button>
  `).join("");
}

function showHeroSlide(index) {
  currentHeroSlide = (index + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[currentHeroSlide];
  const imageRequest = ++heroImageRequest;
  const title = document.querySelector("#hero-title");
  const image = new Image();
  image.onload = () => {
    if (imageRequest !== heroImageRequest) return;
    heroImage.src = image.src;
    heroImage.alt = slide.alt;
    heroImage.classList.remove("is-changing");
    void heroImage.offsetWidth;
    heroImage.classList.add("is-changing");
  };
  image.onerror = () => {
    if (imageRequest === heroImageRequest) showToast("This slide image could not be loaded.");
  };
  image.src = imageUrl(slide.image, 2200);
  document.querySelector(".hero-eyebrow").textContent = slide.eyebrow;
  title.innerHTML = slide.title;
  document.querySelector(".hero-copy").textContent = slide.copy;
  document.querySelector(".hero-cta").firstChild.textContent = `${slide.cta} `;
  document.querySelector(".hero-caption").textContent = slide.caption;
  document.querySelector(".hero-count").textContent = `${String(currentHeroSlide + 1).padStart(2, "0")} / ${String(heroSlides.length).padStart(2, "0")}`;
  renderHeroDots();
}

renderHeroDots();
document.querySelector(".hero-previous").addEventListener("click", () => showHeroSlide(currentHeroSlide - 1));
document.querySelector(".hero-next").addEventListener("click", () => showHeroSlide(currentHeroSlide + 1));
heroDots.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-hero-slide]");
  if (dot) showHeroSlide(Number(dot.dataset.heroSlide));
});
window.setInterval(() => {
  if (!document.hidden) showHeroSlide(currentHeroSlide + 1);
}, 6000);

const formatPrice = (price) => `$${price.toFixed(2)}`;
const imageUrl = (id, width = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeFilter === "all" || product.category === activeFilter;
    const matchesQuery = `${product.name} ${product.detail} ${product.category}`.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${imageUrl(product.image)}" alt="${product.name}" loading="lazy" />
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="favorite-button${favorites.has(product.id) ? " is-favorite" : ""}" type="button" data-favorite="${product.id}" aria-label="${favorites.has(product.id) ? "Remove from" : "Add to"} favorites" aria-pressed="${favorites.has(product.id)}">♡</button>
        <button class="quick-add" type="button" data-add="${product.id}">Add to your bag <span aria-hidden="true">+</span></button>
      </div>
      <div class="product-info"><h3 class="product-name">${product.name}</h3><span class="product-price">${formatPrice(product.price)}</span></div>
      <p class="product-detail">${product.detail}</p>
    </article>
  `).join("");
  document.querySelector(".no-results").hidden = visibleProducts.length > 0;
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function updateCart() {
  const count = [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = products.reduce((sum, product) => sum + product.price * (cart.get(product.id) || 0), 0);
  document.querySelector(".cart-count").textContent = count;
  document.querySelector(".drawer-count").textContent = `(${count})`;
  document.querySelector(".cart-subtotal strong span").textContent = subtotal.toFixed(2);
  document.querySelector(".cart-empty").classList.toggle("is-visible", count === 0);
  document.querySelector(".cart-footer").hidden = count === 0;
  document.querySelector(".checkout-button").disabled = count === 0;

  document.querySelector(".cart-items").innerHTML = products
    .filter((product) => cart.has(product.id))
    .map((product) => `
      <article class="cart-line">
        <img src="${imageUrl(product.image, 200)}" alt="" />
        <div>
          <h3 class="cart-line-title">${product.name}</h3>
          <p class="cart-line-price">${formatPrice(product.price)}</p>
          <div class="quantity-control" aria-label="Quantity">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
            <span>${cart.get(product.id)}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-remove="${product.id}" aria-label="Remove ${product.name}">×</button>
      </article>
    `).join("");
}

function setCartOpen(isOpen) {
  const drawer = document.querySelector(".cart-drawer");
  const overlay = document.querySelector(".overlay");
  drawer.classList.toggle("is-open", isOpen);
  drawer.setAttribute("aria-hidden", String(!isOpen));
  overlay.hidden = !isOpen;
  document.body.classList.toggle("drawer-open", isOpen);
  document.querySelector(".cart-toggle").setAttribute("aria-expanded", String(isOpen));
  if (isOpen) requestAnimationFrame(() => overlay.classList.add("is-visible"));
  else overlay.classList.remove("is-visible");
}

function setFilter(filter) {
  activeFilter = filter;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderProducts();
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");
  if (addButton) {
    const { add: productId } = addButton.dataset;
    cart.set(productId, (cart.get(productId) || 0) + 1);
    updateCart();
    showToast("A good thing, added to your bag.");
  }
  if (favoriteButton) {
    const { favorite: productId } = favoriteButton.dataset;
    favorites.has(productId) ? favorites.delete(productId) : favorites.add(productId);
    renderProducts();
  }
});

filterButtons.forEach((button) => button.addEventListener("click", () => setFilter(button.dataset.filter)));
searchInput.addEventListener("input", renderProducts);
document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => setFilter(link.dataset.navCategory));
});
document.querySelector(".cart-toggle").addEventListener("click", () => setCartOpen(true));
document.querySelector(".close-cart").addEventListener("click", () => setCartOpen(false));
document.querySelector(".continue-shopping").addEventListener("click", () => setCartOpen(false));
document.querySelector(".overlay").addEventListener("click", () => setCartOpen(false));
document.querySelector(".search-toggle").addEventListener("click", () => {
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => searchInput.focus(), 350);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setCartOpen(false);
});

document.querySelector(".cart-items").addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) {
    const id = quantityButton.dataset.quantity;
    const quantity = (cart.get(id) || 0) + Number(quantityButton.dataset.change);
    if (quantity > 0) cart.set(id, quantity);
    else cart.delete(id);
    updateCart();
  }
  if (removeButton) {
    cart.delete(removeButton.dataset.remove);
    updateCart();
  }
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  showToast("Checkout is coming soon. Thanks for stopping by!");
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const menu = document.querySelector(".main-nav");
  const isOpen = menu.classList.toggle("is-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
  event.currentTarget.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});
document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".main-nav").classList.remove("is-open");
    document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
  });
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#email");
  if (!email.checkValidity()) {
    email.reportValidity();
    return;
  }
  document.querySelector(".newsletter-message").textContent = "You’re on the list. Look out for a little note from us.";
  event.currentTarget.reset();
});

renderProducts();
updateCart();