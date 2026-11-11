/**
 * Privacy Multi-Model Dynamic Engine
 * Supports URL query parameters: ?m=slug, ?modelo=slug or path/subdomain lookup.
 */

let activeModelData = null;
let selectedPlanData = null;
let countdownInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  loadModelData();
});

/**
 * Fetch modelos.json and render active model
 */
async function loadModelData() {
  try {
    const response = await fetch("modelos.json");
    if (!response.ok) throw new Error("Erro ao carregar modelos.json");
    const data = await response.json();
    
    // Determine which model to load from URL parameters or hostname
    const modelSlug = getActiveModelSlug(data);
    activeModelData = data.modelos[modelSlug] || data.modelos[data.default] || Object.values(data.modelos)[0];

    renderModelPage(activeModelData);
  } catch (error) {
    console.error("Falha ao carregar dados dinâmicos:", error);
  }
}

/**
 * Get Model Slug from URL Query Params (?m=rayssa or ?modelo=rayssa) or Hostname
 */
function getActiveModelSlug(data) {
  const urlParams = new URLSearchParams(window.location.search);
  const paramSlug = urlParams.get("m") || urlParams.get("modelo") || urlParams.get("id");
  if (paramSlug && data.modelos[paramSlug.toLowerCase()]) {
    return paramSlug.toLowerCase();
  }

  // Check subdomains (e.g. rayssa.seusite.com)
  const hostnameParts = window.location.hostname.split('.');
  if (hostnameParts.length > 2) {
    const sub = hostnameParts[0].toLowerCase();
    if (data.modelos[sub]) return sub;
  }

  return data.default || "rayssa";
}

/**
 * Render Model Data into DOM Elements
 */
function renderModelPage(model) {
  // Page Title
  document.title = `${model.nome} | Privacy`;

  // Header Title
  const headerName = document.querySelector(".creator-header-name");
  if (headerName) headerName.textContent = model.nome.split(" ")[0];

  // Banner Cover
  const bannerImg = document.querySelector(".banner-img");
  if (bannerImg) {
    bannerImg.src = model.fotoBanner;
    if (model.fotoBannerPosicao) bannerImg.style.objectPosition = model.fotoBannerPosicao;
  }

  // Profile Avatar
  const profileAvatar = document.querySelector(".profile-avatar");
  if (profileAvatar) {
    profileAvatar.src = model.fotoPerfil;
    if (model.fotoPerfilPosicao) profileAvatar.style.objectPosition = model.fotoPerfilPosicao;
    if (model.fotoPerfilScale && model.fotoPerfilScale !== 1) {
      profileAvatar.style.transform = `scale(${model.fotoPerfilScale})`;
    } else {
      profileAvatar.style.transform = "none";
    }
  }

  // Quote Avatar
  const quoteAvatars = document.querySelectorAll(".quote-avatar, .post-author-avatar");
  quoteAvatars.forEach(img => {
    img.src = model.fotoPerfil;
  });

  // Modal Benefit Creator Name
  const modalBenefitLi = document.querySelector(".modal-benefits li:nth-child(3)");
  if (modalBenefitLi && model.nome) {
    const firstName = model.nome.split(" ")[0].replace(/[^\p{L}]/gu, '');
    modalBenefitLi.textContent = `✅ Chat privado no VIP com a ${firstName}`;
  }

  // Meta Details
  const nameEl = document.querySelector(".creator-display-name");
  if (nameEl) {
    nameEl.innerHTML = `${model.nome} <span class="verified-badge" title="Perfil Verificado"><svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#0095f6"/><path d="M9 12l2 2 4-4" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  }

  const handleEl = document.querySelector(".creator-handle");
  if (handleEl) handleEl.textContent = model.handle;

  const bioEl = document.getElementById("bioText");
  if (bioEl) bioEl.textContent = model.bio;

  const locationEl = document.querySelector(".location-badge span");
  if (locationEl) locationEl.textContent = model.localizacao;

  // Statistics
  const statsContainer = document.querySelector(".stats-counters");
  if (statsContainer && model.estatisticas) {
    statsContainer.innerHTML = `
      <div class="stat-item" title="Fotos">
        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <span>${model.estatisticas.fotos}</span>
      </div>
      <div class="stat-item" title="Vídeos">
        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
        <span>${model.estatisticas.videos}</span>
      </div>
      <div class="stat-item" title="Trancados">
        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <span>${model.estatisticas.trancados}</span>
      </div>
      <div class="stat-item" title="Curtidas">
        <svg class="stat-icon heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        <span>${model.estatisticas.curtidas}</span>
      </div>
    `;
  }

  // Social Links
  if (model.redesSociais) {
    const socialPills = document.querySelectorAll(".social-pill-btn");
    if (socialPills[0] && model.redesSociais.instagram) socialPills[0].href = model.redesSociais.instagram;
    if (socialPills[1] && model.redesSociais.twitter) socialPills[1].href = model.redesSociais.twitter;
    if (socialPills[2] && model.redesSociais.tiktok) socialPills[2].href = model.redesSociais.tiktok;
  }

  // Offer Card
  if (model.ofertaDestaque) {
    const offerHeading = document.querySelector(".offer-heading-text");
    if (offerHeading) offerHeading.textContent = model.ofertaDestaque.titulo;

    const quoteAvatar = document.querySelector(".quote-avatar");
    if (quoteAvatar) quoteAvatar.src = model.fotoPerfil;

    const quoteText = document.querySelector(".quote-text");
    if (quoteText) quoteText.textContent = model.ofertaDestaque.citacao;

    const discountBadge = document.querySelector(".discount-badge");
    if (discountBadge) discountBadge.textContent = model.ofertaDestaque.descontoBadge;

    const primaryCta = document.querySelector(".primary-cta");
    if (primaryCta) {
      primaryCta.textContent = model.ofertaDestaque.textoBotao;
      primaryCta.onclick = () => handleCheckout(model.ofertaDestaque.titulo, model.ofertaDestaque.precoOferta, model.ofertaDestaque.checkoutUrl);
    }

    const strikethrough = document.querySelector(".price-strikethrough s");
    if (strikethrough) strikethrough.textContent = `R$ ${model.ofertaDestaque.precoOriginal}`;

    startCountdownTimer(model.ofertaDestaque.duracaoSegundos || 109800);
  }

  // Render Plans Accordion
  renderPlans(model.planos);

  // Render Tabs Stats
  if (model.estatisticas) {
    const tabPosts = document.querySelector("#tabPosts span");
    if (tabPosts) tabPosts.textContent = model.estatisticas.postagensTab || "1.757 Postagens";
    
    const tabMedia = document.querySelector("#tabMedia span");
    if (tabMedia) tabMedia.textContent = model.estatisticas.midiasTab || "1.840 Mídias";
  }

  // Render Feed Posts
  renderFeedPosts(model);

  // Initialize UI Event Listeners
  initBioToggle();
  initPlansAccordion();
}

/**
 * Dynamically Render Plans List
 */
function renderPlans(planos) {
  const plansList = document.getElementById("plansList");
  if (!plansList || !planos) return;

  plansList.innerHTML = planos.map(plan => `
    <div class="plan-card ${plan.destaque ? 'plan-highlight' : ''}" onclick="handleCheckout('${escapeJsString(plan.nome)}', '${plan.preco}', '${escapeJsString(plan.checkoutUrl)}')">
      <div class="plan-info">
        <div class="plan-name-row">
          <span class="plan-name">${plan.nome}</span>
        </div>
        <div class="plan-meta">
          <span class="plan-duration">${plan.duracao}</span>
          <span class="meta-dot">•</span>
          <span class="plan-shipping">${plan.entrega}</span>
        </div>
      </div>
      <div class="plan-price-action">
        <span class="plan-price">R$ ${plan.preco}</span>
      </div>
    </div>
  `).join("");
}

/**
 * Dynamically Render Feed Posts
 */
function renderFeedPosts(model) {
  const feedContainer = document.getElementById("feedContainer");
  if (!feedContainer || !model.postagens) return;

  feedContainer.innerHTML = model.postagens.map(post => {
    const targetPlan = model.planos.find(p => p.id === post.planoTriggerId) || model.planos[0];
    const checkoutUrl = targetPlan ? targetPlan.checkoutUrl : model.ofertaDestaque.checkoutUrl;

    return `
      <article class="feed-card">
        <div class="post-header">
          <img src="${model.fotoPerfil}" alt="${model.nome}" class="post-author-avatar">
          <div class="post-author-info">
            <div class="author-name-row">
              <span class="author-name">${model.nome}</span>
              <span class="verified-badge-sm">
                <svg viewBox="0 0 24 24" fill="#0095f6" width="14" height="14">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </span>
            </div>
            <span class="post-author-handle">${model.handle} • ${post.tempo}</span>
          </div>
          <button class="post-more-btn" aria-label="Opções">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
        </div>

        <p class="post-caption">${post.legenda}</p>

        <!-- Locked Teaser -->
        <div class="locked-media-box" onclick="handleCheckout('${escapeJsString(targetPlan.nome)}', '${targetPlan.preco}', '${escapeJsString(checkoutUrl)}')">
          <img src="${post.midiaTeaser}" alt="Conteúdo Bloqueado" class="locked-blur-bg">
          <div class="locked-overlay">
            <div class="lock-icon-circle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <span class="locked-title">${post.tituloTrancado}</span>
            <span class="locked-subtitle">${post.subtituloTrancado}</span>
            <button class="privacy-btn lock-cta-btn">
              Assinar para Desbloquear
            </button>
          </div>
        </div>

        <!-- Post Reactions -->
        <div class="post-actions-bar">
          <button class="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span>${post.curtidas}</span>
          </button>
          <button class="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span>${post.comentarios}</span>
          </button>
          <button class="action-btn share-btn" aria-label="Compartilhar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
        </div>
      </article>
    `;
  }).join("");
}

/**
 * Bio Read More Toggle
 */
function initBioToggle() {
  const readMoreBtn = document.getElementById("readMoreBtn");
  const bioText = document.getElementById("bioText");

  if (readMoreBtn && bioText) {
    readMoreBtn.onclick = () => {
      const isExpanded = bioText.classList.toggle("expanded");
      readMoreBtn.textContent = isExpanded ? "Ler menos" : "Ler mais";
    };
  }
}

/**
 * Countdown Timer
 */
function startCountdownTimer(seconds) {
  const timerDisplay = document.getElementById("timerDisplay");
  if (!timerDisplay) return;

  if (countdownInterval) clearInterval(countdownInterval);

  let totalSeconds = seconds;

  function updateTimer() {
    if (totalSeconds <= 0) {
      timerDisplay.textContent = "Oferta encerrando!";
      clearInterval(countdownInterval);
      return;
    }

    totalSeconds--;

    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let timeString = "";
    if (days > 0) timeString += `${days} dia, `;
    timeString += `${hours}h ${minutes}m ${secs}s`;

    timerDisplay.textContent = timeString;
  }

  updateTimer();
  countdownInterval = setInterval(updateTimer, 1000);
}

/**
 * Accordion Collapse
 */
function initPlansAccordion() {
  const header = document.getElementById("plansAccordionHeader");
  const list = document.getElementById("plansList");
  const arrow = header ? header.querySelector(".accordion-arrow") : null;

  if (header && list) {
    header.onclick = () => {
      if (list.style.display === "none") {
        list.style.display = "flex";
        if (arrow) arrow.classList.remove("rotated");
      } else {
        list.style.display = "none";
        if (arrow) arrow.classList.add("rotated");
      }
    };
  }
}

/**
 * Switch Feed Tabs
 */
function switchTab(tabName) {
  const tabPosts = document.getElementById("tabPosts");
  const tabMedia = document.getElementById("tabMedia");

  if (tabName === 'posts') {
    tabPosts.classList.add("active");
    tabMedia.classList.remove("active");
  } else {
    tabMedia.classList.add("active");
    tabPosts.classList.remove("active");
  }
}

/**
 * Handle Checkout Modal Open
 */
function handleCheckout(planTitle, planPrice, checkoutUrl = null) {
  const priceMap = {
    "19.90": "https://sharkautomacoes.com/a44804f8",
    "19,90": "https://sharkautomacoes.com/a44804f8",
    "29.90": "https://sharkautomacoes.com/d856bc77",
    "29,90": "https://sharkautomacoes.com/d856bc77",
    "22.90": "https://sharkautomacoes.com/4c9d7c35",
    "22,90": "https://sharkautomacoes.com/4c9d7c35",
    "23.90": "https://sharkautomacoes.com/4c9d7c35",
    "23,90": "https://sharkautomacoes.com/4c9d7c35",
    "15.90": "https://sharkautomacoes.com/384ad85d",
    "15,90": "https://sharkautomacoes.com/384ad85d",
    "10.90": "https://sharkautomacoes.com/25e605c7",
    "10,90": "https://sharkautomacoes.com/25e605c7"
  };

  let targetUrl = checkoutUrl;

  if (!targetUrl || targetUrl.includes("privacy.com.br") || targetUrl.includes("paylume.fans")) {
    const cleanPrice = (planPrice || "").toString().trim();
    if (priceMap[cleanPrice]) {
      targetUrl = priceMap[cleanPrice];
    } else if (activeModelData) {
      const foundPlan = activeModelData.planos && activeModelData.planos.find(p => p.preco === cleanPrice || p.preco.replace(',', '.') === cleanPrice.replace(',', '.'));
      if (foundPlan && foundPlan.checkoutUrl && !foundPlan.checkoutUrl.includes("privacy.com.br") && !foundPlan.checkoutUrl.includes("paylume.fans")) {
        targetUrl = foundPlan.checkoutUrl;
      } else if (activeModelData.ofertaDestaque && activeModelData.ofertaDestaque.checkoutUrl && !activeModelData.ofertaDestaque.checkoutUrl.includes("privacy.com.br") && !activeModelData.ofertaDestaque.checkoutUrl.includes("paylume.fans")) {
        targetUrl = activeModelData.ofertaDestaque.checkoutUrl;
      }
    }
  }

  if (!targetUrl) {
    targetUrl = priceMap[(planPrice || "").toString().trim()] || "https://sharkautomacoes.com/a44804f8";
  }

  selectedPlanData = {
    title: planTitle,
    price: planPrice,
    checkoutUrl: targetUrl
  };

  const modal = document.getElementById("checkoutModal");
  const modalTitle = document.getElementById("modalPlanTitle");
  const modalPrice = document.getElementById("modalPlanPrice");

  if (modalTitle) modalTitle.textContent = planTitle;
  if (modalPrice) modalPrice.textContent = `R$ ${parseFloat(planPrice.toString().replace(',', '.')).toFixed(2).replace('.', ',')}`;

  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

/**
 * Close Checkout Modal
 */
function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

/**
 * Redirect User to Payment Link
 */
function redirectToCheckout() {
  if (selectedPlanData && selectedPlanData.checkoutUrl) {
    window.open(selectedPlanData.checkoutUrl, "_blank");
  }
}

/**
 * Helper to escape quotes in JS attributes
 */
function escapeJsString(str) {
  if (!str) return "";
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
