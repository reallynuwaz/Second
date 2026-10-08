/* ===================== หมวดหมู่ย่อย (ใช้สร้างเมนู hover แบบ eBay) =====================
   แต่ละหมวดหลักมีหมวดย่อยไว้ให้กด — กดแล้วจะไปหน้า category.html พร้อมกรองคำค้นในหมวดนั้นให้เลย
   ถ้าอยากแก้/เพิ่มหมวดย่อย แก้ตรงนี้ที่เดียว มีผลกับเมนู hover ทุกหน้าอัตโนมัติ */
const CATEGORY_SUBCATS = {
  'ไอที': ['คอมพิวเตอร์/โน้ตบุ๊ก', 'มือถือ/แท็บเล็ต', 'กล้อง', 'อุปกรณ์เสริมไอที', 'เกม/คอนโซล'],
  'แฟชั่น': ['เสื้อผ้าผู้ชาย', 'เสื้อผ้าผู้หญิง', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ/นาฬิกา'],
  'ของใช้ในบ้าน': ['เฟอร์นิเจอร์', 'เครื่องใช้ไฟฟ้า', 'ของแต่งบ้าน', 'ครัว/ทำอาหาร', 'สวน/นอกบ้าน'],
  'ยานพาหนะ': ['รถยนต์', 'รถจักรยานยนต์', 'จักรยาน', 'อะไหล่/อุปกรณ์แต่งรถ', 'อุปกรณ์เสริมยานพาหนะ'],
  'กีฬา': ['อุปกรณ์ฟิตเนส', 'ฟุตบอล', 'จักรยาน', 'แคมป์ปิ้ง/เอาท์ดอร์', 'ชุดกีฬา'],
  'ของสะสม': ['การ์ดสะสม', 'ของเล่นโมเดล', 'เหรียญ/ธนบัตร', 'ของเก่า/วินเทจ', 'งานศิลปะ'],
  'หนังสือ': ['หนังสือเรียน', 'นิยาย/วรรณกรรม', 'การ์ตูน/มังงะ', 'นิตยสาร', 'ตำราวิชาการ'],
  'อื่นๆ': ['เครื่องดนตรี', 'สัตว์เลี้ยง/อุปกรณ์', 'งานฝีมือ', 'ของทั่วไป']
};

/* ===================== เมนูหมวดหมู่แบบ hover เปิด dropdown (สไตล์ eBay) =====================
   หา element #navlinks (ต้องมี <div class="navlinks" id="navlinks"></div> ในหน้า HTML)
   แล้วสร้างเมนู + dropdown ให้อัตโนมัติจาก CATEGORY_SUBCATS */
function buildCategoryNav(){
  const navlinks = document.getElementById('navlinks');
  if(!navlinks) return;
  const wrap = navlinks.closest('.mega-wrap') || navlinks.parentElement;

  const categories = Object.keys(CATEGORY_SUBCATS);
  navlinks.innerHTML = `<div class="nav-indicator" id="navIndicator"></div>`
    + categories.map(cat => `<div class="nav-item" data-cat="${cat}">${cat}</div>`).join('')
    + `<div class="mega" id="megaMenu"><div class="mega-inner" id="megaInner"></div></div>`;

  const mega = document.getElementById('megaMenu');
  const megaInner = document.getElementById('megaInner');
  const indicator = document.getElementById('navIndicator');

  navlinks.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      const cat = item.dataset.cat;

      // เลื่อนเส้นขีดไปอยู่ใต้เมนูที่ชี้อยู่ (แบบเว็บ SPORTPLUS เดิม)
      indicator.style.left = item.offsetLeft + 'px';
      indicator.style.width = item.offsetWidth + 'px';
      indicator.classList.add('show');

      megaInner.innerHTML = `
        <h4>${cat}</h4>
        <ul>
          <li><a href="category.html?category=${encodeURIComponent(cat)}">ดูทั้งหมดในหมวด ${cat}</a></li>
          ${CATEGORY_SUBCATS[cat].map(sub => `
            <li><a href="category.html?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(sub)}">${sub}</a></li>
          `).join('')}
        </ul>
      `;
      mega.classList.add('open');
    });
  });

  wrap.addEventListener('mouseleave', () => {
    mega.classList.remove('open');
    indicator.classList.remove('show');
  });
}

/* ===================== หมวดหมู่ + รูปไอคอนประกอบ =====================
   ใส่ path รูปของคุณเองแทน emoji ได้เลย เช่น "img/categories/it.png"
   วางไฟล์รูปไว้ในโฟลเดอร์ img/categories/ (สร้างโฟลเดอร์นี้เพิ่มเอง) */
const CATEGORY_ICONS = {
  'ไอที': 'img/categories/it.png',
  'แฟชั่น': 'img/categories/fasion.png',
  'ของใช้ในบ้าน': 'img/categories/inhome.png',
  'ยานพาหนะ': 'img/categories/vehicle.png',
  'กีฬา': 'img/categories/sports.png',
  'ของสะสม': 'img/categories/collectibles.png',
  'หนังสือ': 'img/categories/books.png',
  'อื่นๆ': 'img/categories/other.png'
};

/* ===================== เมนูบนสุด (โชว์ตามสถานะล็อกอิน) ===================== */
function renderNav(){
  buildCategoryNav(); // สร้างเมนู hover หมวดหมู่ก่อน แล้วค่อยสร้างฝั่งขวา (ล็อกอิน/ลงขาย)

  const navRight = document.getElementById('navRight');
  if(!navRight) return;

  const user = getUser();
  if(user){
    navRight.innerHTML = `
      <a href="sell.html" class="sell-btn">+ ลงขายสินค้า</a>
      <div class="user-chip">
        👤 ${user.name}
        <a href="my-listings.html" style="text-decoration:underline;">ประกาศของฉัน</a>
        <button class="logout-btn" id="logoutBtn">ออกจากระบบ</button>
      </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', () => {
      clearAuth();
      window.location.href = 'index.html';
    });
  } else {
    navRight.innerHTML = `
      <a href="sell.html" class="sell-btn">+ ลงขายสินค้า</a>
      <div class="auth-links">
        <a href="login.html">เข้าสู่ระบบ</a>
        <a href="register.html">สมัครสมาชิก</a>
      </div>
    `;
  }
}

/* ===================== การ์ดสินค้า (ใช้ซ้ำได้ทุกหน้าที่โชว์ grid สินค้า) ===================== */
function listingCardHTML(item){
  const img = item.images && item.images[0]
    ? `<img src="${imageUrl(item.images[0])}" alt="${item.title}">`
    : `<div class="noimg">🖼️</div>`;
  const sold = item.status === 'sold' ? '<span class="badge-sold">ขายแล้ว</span>' : '';
  const sellerName = item.seller && item.seller.name ? item.seller.name : '';

  return `
    <a href="listing.html?id=${item._id}" class="card">
      <div class="card-img">
        ${sold}
        ${item.condition ? `<span class="badge-cond">${item.condition}</span>` : ''}
        ${img}
      </div>
      <div class="card-body">
        <span class="card-cat">${item.category}${item.subcategory ? ' · ' + item.subcategory : ''}</span>
        <span class="card-title">${item.title}</span>
        <span class="card-price">฿${Number(item.price).toLocaleString()}</span>
        ${sellerName ? `<span class="card-seller">ผู้ขาย: ${sellerName}</span>` : ''}
      </div>
    </a>
  `;
}

/* ===================== MARQUEE (แถบสินค้าเลื่อนอัตโนมัติไม่รู้จบ ใช้ที่หน้าแรก) ===================== */
function renderMarquee(containerId, items){
  const track = document.getElementById(containerId);
  if(!track) return;
  if(!items || items.length === 0){ track.innerHTML = ''; return; }
  // เอา array มาต่อกันเอง 2 รอบ เพื่อให้เลื่อนวนลูปได้ต่อเนื่องไม่มีรอยต่อ
  const doubled = [...items, ...items];
  track.innerHTML = doubled.map(listingCardHTML).join('');
}

function renderListingGrid(containerId, items){
  const grid = document.getElementById(containerId);
  if(!grid) return;
  if(!items || items.length === 0){
    grid.innerHTML = '';
    grid.outerHTML = `
      <div class="empty-state" id="${containerId}">
        <div class="big">📭</div>
        <strong>ยังไม่มีประกาศขายในหมวดนี้</strong>
        <p style="margin-top:6px;">เป็นคนแรกที่ลงขายสิ! <a href="sell.html" style="text-decoration:underline;">กดลงขายสินค้า</a></p>
      </div>
    `;
    return;
  }
  grid.innerHTML = items.map((item, i) =>
    listingCardHTML(item).replace('class="card"', `class="card fade-up" style="animation-delay:${Math.min(i * 0.05, 0.6)}s"`)
  ).join('');
}

/* ===================== SKELETON LOADING (โชว์ระหว่างรอข้อมูลจาก backend) ===================== */
function showSkeleton(containerId, count = 8){
  const grid = document.getElementById(containerId);
  if(!grid) return;
  grid.innerHTML = Array.from({ length: count }).map(() => `
    <div class="card skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="card-body">
        <div class="skeleton skeleton-line" style="width:40%;"></div>
        <div class="skeleton skeleton-line" style="width:80%;"></div>
        <div class="skeleton skeleton-line" style="width:30%; margin-top:auto;"></div>
      </div>
    </div>
  `).join('');
}

/* ===================== TOAST NOTIFICATION (แทน alert() ให้ดูทันสมัยขึ้น) ===================== */
function toast(message, type = 'info'){
  let host = document.getElementById('toastHost');
  if(!host){
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  const icons = { success: '✅', error: '⚠️', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

/* ===================== HEADER เงา/หดตัวตอนเลื่อนจอ ===================== */
(function initStickyHeaderShadow(){
  const header = document.querySelector('header');
  if(!header) return;
  window.addEventListener('scroll', () => {
    if(window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }, { passive: true });
})();

/* ===================== Fade-in ให้ section ต่างๆ ตอนเลื่อนจอมาเห็น ===================== */
(function initScrollReveal(){
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
  });
})();
