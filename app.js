/* =========================================
   Anime Hub — Logic Core (Cinematic Update)
   ========================================= */

const APP = (() => {

  // 1. تعريف العوالم الـ 6 بألوانها الخاصة
  const WORLDS = [
    { id: "naruto", name: "Naruto", accent: "#f97316", image: "assets/worlds/naruto.webp", subtitle: "عالم الشينوبي" },
    { id: "onepiece", name: "One Piece", accent: "#ef4444", image: "assets/worlds/onepiece.webp", subtitle: "عصر القراصنة" },
    { id: "demonslayer", name: "Demon Slayer", accent: "#22c55e", image: "assets/worlds/demonslayer.webp", subtitle: "تنفس الماء" },
    { id: "jjk", name: "Jujutsu Kaisen", accent: "#a855f7", image: "assets/worlds/jjk.webp", subtitle: "الطاقة الملعونة" },
    { id: "aot", name: "Attack on Titan", accent: "#854d0e", image: "assets/worlds/aot.webp", subtitle: "أجنحة الحرية" },
    { id: "mha", name: "My Hero Academia", accent: "#eab308", image: "assets/worlds/mha.webp", subtitle: "أنا هنا!" }
  ];

  // بيانات المنتجات (عينات)
  const PRODUCTS = [
    { id: "nar-01", world: "naruto", name: "Kurama Figure Limited", price: 299, type: "figure", tier: "premium", tags: ["360", "top"] },
    { id: "op-01", world: "onepiece", name: "Luffy Gear 5", price: 350, type: "figure", tier: "premium", tags: ["360", "top"] },
    { id: "ds-01", world: "demonslayer", name: "Tanjiro Sword", price: 150, type: "accessory", tier: "mid", tags: [] },
    { id: "jjk-01", world: "jjk", name: "Gojo Eyes Mask", price: 80, type: "apparel", tier: "entry", tags: [] },
    { id: "aot-01", world: "aot", name: "Eren Titan Form", price: 400, type: "figure", tier: "premium", tags: ["360"] },
    { id: "mha-01", world: "mha", name: "Deku Smash Hoodie", price: 120, type: "apparel", tier: "mid", tags: [] }
  ];

  // الحالة العامة
  const state = {
    cart: [],
    activeWorld: null,
    currentSlide: 0,
    sliderInterval: null
  };

  // عناصر DOM
  const el = {
    viewRoot: () => document.getElementById("viewRoot"),
    sheet: () => document.getElementById("worldSheet"),
    cartCount: () => document.getElementById("cartCount")
  };

  // --- دوال المساعدة ---
  function getProduct(id) { return PRODUCTS.find(p => p.id === id); }
  function getWorld(id) { return WORLDS.find(w => w.id === id); }
  function setAccent(color) { document.documentElement.style.setProperty("--accent", color); }
  
  // --- منطق السلايدر التلقائي ---
  function startHeroSlider() {
    const slider = document.getElementById("heroSlider");
    const dots = document.querySelectorAll(".dot");
    const slides = document.querySelectorAll(".slide");
    
    if (!slider || slides.length === 0) return;

    // تنظيف أي مؤقت سابق
    if (state.sliderInterval) clearInterval(state.sliderInterval);

    function showSlide(index) {
      state.currentSlide = index;
      slider.style.transform = `translateX(${index * 100}%)`; // RTL: الموجب يحرك لليمين في بعض المتصفحات، هنا نستخدم الافتراضي
      // تعديل للحالة العربية RTL:
      slider.style.transform = `translateX(${index * 100}%)`; 
      
      slides.forEach((s, i) => s.classList.toggle("active", i === index));
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
      
      // تغيير لون التمييز حسب الشريحة
      const worldId = slides[index].getAttribute("data-world-id");
      const w = getWorld(worldId);
      if(w) setAccent(w.accent);
    }

    // تشغيل تلقائي
    state.sliderInterval = setInterval(() => {
      let next = (state.currentSlide + 1) % slides.length;
      showSlide(next);
    }, 4000); // كل 4 ثواني

    // دعم السحب باللمس
    let touchStartX = 0;
    slider.addEventListener("touchstart", e => touchStartX = e.touches[0].clientX, {passive: true});
    slider.addEventListener("touchend", e => {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchStartX - touchEndX > 50) { // سحب لليسار
        let next = (state.currentSlide + 1) % slides.length;
        showSlide(next);
        clearInterval(state.sliderInterval); // إيقاف التلقائي عند التفاعل
      }
      if (touchEndX - touchStartX > 50) { // سحب لليمين
        let prev = (state.currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
        clearInterval(state.sliderInterval);
      }
    }, {passive: true});
  }

  // --- الرندرة (Rendering) ---

  function renderHub() {
    // 1. تحضير شرائح السلايدر (أهم العوالم)
    const featuredWorlds = [WORLDS[0], WORLDS[1], WORLDS[2]]; // ناروتو، ون بيس، ديمون سلاير
    
    const sliderHtml = `
      <div class="hero-slider-container">
        <div class="hero-slider" id="heroSlider">
          ${featuredWorlds.map((w, i) => `
            <div class="slide ${i===0?'active':''}" data-world-id="${w.id}">
              <div class="slide__bg" style="background-image: url('${w.image}');"></div>
              <div class="slide__content">
                <span class="slide__tag">Featured World</span>
                <h2 class="slide__title">${w.name}</h2>
                <p class="slide__desc">${w.subtitle} - اكتشف أفخم المنتجات والمجسمات الحصرية.</p>
                <button class="slide__btn" onclick="location.hash='#/world/${w.id}'">استكشف الآن</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="slider-dots">
          ${featuredWorlds.map((_, i) => `<div class="dot ${i===0?'active':''}"></div>`).join('')}
        </div>
      </div>
    `;

    // 2. تحضير المنتجات
    const topProducts = PRODUCTS.filter(p => p.tags.includes("top"));

    el.viewRoot().innerHTML = `
      ${sliderHtml}

      <div class="container" style="position:relative; z-index:10;">
        
        <!-- شريط العوالم -->
        <section class="section">
          <div class="section__head">
            <h3 class="section__title">تصفح العوالم</h3>
          </div>
          <div class="world-strip">
            ${WORLDS.map(w => `
              <div class="world-pill" onclick="location.hash='#/world/${w.id}'">
                <img src="${w.image}" alt="">
                <span>${w.name}</span>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- المنتجات المميزة -->
        <section class="section">
          <div class="section__head">
            <h3 class="section__title">الأكثر طلباً</h3>
            <a href="#/hub" class="section__link">عرض الكل</a>
          </div>
          <div class="h-scroll">
            ${topProducts.map(p => renderProductCard(p)).join('')}
          </div>
        </section>

        <!-- شبكة العوالم الكاملة -->
        <section class="section" id="worlds">
          <div class="section__head">
            <h3 class="section__title">كل العوالم</h3>
          </div>
          <div class="grid">
            ${WORLDS.map(w => `
              <div class="wcard" onclick="location.hash='#/world/${w.id}'">
                <img class="wcard__bg" src="${w.image}" loading="lazy">
                <div class="wcard__overlay">
                  <div class="wcard__title">${w.name}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

      </div>
    `;

    // تفعيل السلايدر بعد الرندرة
    requestAnimationFrame(startHeroSlider);
    updateNav("hub");
  }

  function renderProductCard(p) {
    const w = getWorld(p.world);
    // نستخدم صورة العنصر إذا وجدت، أو صورة العالم مؤقتاً
    const img = `assets/products/${p.id}.webp`; 
    // Fallback لصورة العالم إذا لم تكن صورة المنتج موجودة (لأغراض العرض)
    const displayImg = img; 

    return `
      <div class="pcard" onclick="location.hash='#/product/${p.id}'">
        <div class="pcard__img-wrap">
          <img class="pcard__img" src="${displayImg}" onerror="this.src='${w.image}'" loading="lazy">
          ${p.tags.includes("360") ? '<span class="tag-360">360°</span>' : ''}
        </div>
        <div class="pcard__info">
          <h4 class="pcard__title">${p.name}</h4>
          <div class="pcard__price">${p.price} ر.س</div>
        </div>
      </div>
    `;
  }

  function renderWorldPage(worldId) {
    const w = getWorld(worldId);
    if (!w) return renderHub();

    setAccent(w.accent);
    const items = PRODUCTS.filter(p => p.world === worldId);

    el.viewRoot().innerHTML = `
      <div class="product-hero">
        <img class="product-hero__img" src="${w.image}">
        <div style="position:absolute; bottom:20px; right:20px; z-index:2;">
            <h1 style="font-size:40px; margin:0; text-shadow:0 2px 10px #000;">${w.name}</h1>
            <p style="opacity:0.8;">${w.subtitle}</p>
        </div>
      </div>

      <div class="container section" style="margin-top: 20px;">
        <div class="grid" style="grid-template-columns: repeat(2, 1fr);">
             ${items.map(p => renderProductCard(p)).join('')}
        </div>
        ${items.length === 0 ? '<p style="text-align:center; padding:40px; opacity:0.5;">لا توجد منتجات حالياً.</p>' : ''}
      </div>
    `;
    updateNav("worlds");
  }

  function renderProductPage(pid) {
    const p = getProduct(pid);
    if (!p) return renderHub();
    const w = getWorld(p.world);
    setAccent(w.accent);

    el.viewRoot().innerHTML = `
      <div class="product-hero" style="height:40vh;">
        <img class="product-hero__img" src="assets/products/${p.id}.webp" onerror="this.src='${w.image}'">
      </div>
      
      <div class="product-details">
        <div style="display:flex; justify-content:space-between;">
            <span style="background:${w.accent}; color:#000; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px;">${w.name}</span>
            ${p.tags.includes("360") ? '<span class="tag-360" style="position:static;">360 VIEW</span>' : ''}
        </div>
        <h1 class="pd-title">${p.name}</h1>
        <span class="pd-price">${p.price} ر.س</span>

        ${p.tags.includes("360") ? `
            <div class="viewer-stage" style="margin-bottom:20px;">
                <img src="assets/products/${p.id}.webp" onerror="this.src='${w.image}'">
                <div style="position:absolute; bottom:10px; opacity:0.7; font-size:12px;">اسحب للتدوير</div>
            </div>
        ` : ''}

        <button class="btn btn--primary" onclick="APP.addToCart('${p.id}')">إضافة للسلة</button>
        <button class="btn btn--ghost" onclick="history.back()">عودة</button>

        <div style="margin-top:20px; opacity:0.7; line-height:1.6;">
            وصف تجريبي للمنتج. يتميز هذا المجسم بدقة التفاصيل والألوان الزاهية المستوحاة من أنمي ${w.name}.
        </div>
      </div>
    `;
  }

  // --- السلة والتوجيه ---
  function updateNav(page) {
    document.querySelectorAll(".bn-item").forEach(b => b.removeAttribute("aria-current"));
    const btn = document.querySelector(`[data-nav="${page}"]`);
    if(btn) btn.setAttribute("aria-current", "page");
  }

  function router() {
    const hash = location.hash;
    if (hash.startsWith("#/world/")) {
      renderWorldPage(hash.split("/")[2]);
    } else if (hash.startsWith("#/product/")) {
      renderProductPage(hash.split("/")[2]);
    } else if (hash === "#/cart") {
        el.viewRoot().innerHTML = `<div class="container section" style="padding-top:100px; text-align:center;"><h1>السلة</h1><p>قريباً...</p></div>`;
        updateNav("cart");
    } else {
      renderHub();
    }
    window.scrollTo(0,0);
  }

  function init() {
    window.addEventListener("hashchange", router);
    router();
    
    // ربط أزرار التنقل السفلية
    document.querySelectorAll(".bn-item").forEach(btn => {
        btn.addEventListener("click", () => {
            const dest = btn.getAttribute("data-nav");
            if(dest === "hub") location.hash = "#/hub";
            if(dest === "worlds") location.hash = "#/hub"; // مؤقتاً
            if(dest === "cart") location.hash = "#/cart";
        });
    });
  }

  return { 
    init, 
    addToCart: (id) => { 
        alert("تمت الإضافة للسلة (تجريبي)"); 
        state.cart.push(id);
        document.getElementById("cartCount").innerText = state.cart.length;
    } 
  };
})();

document.addEventListener("DOMContentLoaded", APP.init);

