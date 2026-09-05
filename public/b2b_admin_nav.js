/* SEADREAM B2B 全站角色快捷導覽 v1.2.0
   使用方式：放到 B2B public/b2b_admin_nav.js，並在 B2B 頁面 </body> 前載入。
   本檔會讀取 Firebase Authentication 與 users/{uid}，依 role / permissions 顯示入口。
*/
(function () {
  'use strict';

  const VERSION = 'seadream_b2b_quick_nav_v1_2_0';
  const NAV_ID = 'sdB2BQuickNav';
  const SHOP_ORIGIN = 'https://www.seadream.com.tw';
  const B2B_HOME = '/index.html';
  const OPEN_ACTION_KEY = 'sdOpen';

  const ACTION_BUTTONS = {
    addProduct: 'addProductBtn',
    options: 'manageOptionsBtn',
    quotes: 'adminQuotesBtn',
    users: 'adminUsersBtn'
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function asTrue(value) {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  function currentPath() {
    const path = (location.pathname || '/').toLowerCase();
    if (path === '/' || path.endsWith('/')) return '/index.html';
    return path;
  }

  function isCurrent(href) {
    if (!href || /^https?:/i.test(href)) return false;
    const hrefPath = href.split('?')[0].split('#')[0].toLowerCase();
    return currentPath().endsWith(hrefPath.toLowerCase());
  }

  function normalizeProfile(profile, user) {
    const p = profile && typeof profile === 'object' ? profile : {};
    const role = String(p.role || (asTrue(p.isAdmin) ? 'admin' : 'user')).trim().toLowerCase();
    const isAdmin = role === 'admin' || asTrue(p.isAdmin);
    const rawPerms = p.permissions && typeof p.permissions === 'object' ? p.permissions : {};
    const permissions = {
      equipmentAdmin: isAdmin || asTrue(rawPerms.equipmentAdmin),
      livestockAdmin: isAdmin || asTrue(rawPerms.livestockAdmin) || asTrue(p.livestockAdmin) || asTrue(p.canManageLivestock) || asTrue(p.livestockManager),
      orderAdmin: isAdmin || asTrue(rawPerms.orderAdmin),
      shopHomeAdmin: isAdmin || asTrue(rawPerms.shopHomeAdmin),
      userAdmin: isAdmin || asTrue(rawPerms.userAdmin),
      chatAdmin: isAdmin || asTrue(rawPerms.chatAdmin)
    };
    const status = String(p.status || (isAdmin ? 'active' : 'inactive')).trim().toLowerCase();
    const active = status === 'active';
    const displayName = String(
      p.contactName || p.name || p.companyName || (user && user.displayName) || (user && user.email) || '會員'
    ).trim();
    return { role, isAdmin, permissions, status, active, displayName };
  }

  function access(profile) {
    const a = profile || normalizeProfile({}, null);
    const p = a.permissions;
    return {
      equipment: a.active && (a.isAdmin || a.role === 'wholesale' || p.equipmentAdmin || p.orderAdmin || p.shopHomeAdmin || p.userAdmin),
      livestockSales: a.active && (a.isAdmin || a.role === 'wholesale' || p.livestockAdmin),
      livestockOrders: a.active && (a.isAdmin || a.role === 'wholesale' || p.orderAdmin || p.livestockAdmin),
      livestockAdmin: a.active && (a.isAdmin || p.livestockAdmin),
      quoteAdmin: a.active && (a.isAdmin || p.orderAdmin || p.equipmentAdmin),
      equipmentAdmin: a.active && (a.isAdmin || p.equipmentAdmin),
      shopAdmin: a.active && (a.isAdmin || p.shopHomeAdmin),
      userAdmin: a.active && (a.isAdmin || p.userAdmin),
      chatAdmin: a.active && (a.isAdmin || p.chatAdmin),
      element: a.active && (a.isAdmin || p.livestockAdmin || p.equipmentAdmin || p.orderAdmin || p.userAdmin),
      anyManager: a.active && (a.isAdmin || p.equipmentAdmin || p.livestockAdmin || p.orderAdmin || p.shopHomeAdmin || p.userAdmin || p.chatAdmin)
    };
  }

  function injectStyle() {
    if (document.getElementById('sdB2BQuickNavStyle')) return;
    const style = document.createElement('style');
    style.id = 'sdB2BQuickNavStyle';
    style.textContent = `
      :root{--sd-b2b-quicknav-height:56px}
      #${NAV_ID}{position:sticky;top:0;z-index:2147483000;width:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC","Microsoft JhengHei",Arial,sans-serif;color:#eaf8ff;background:rgba(4,17,28,.97);border-bottom:1px solid rgba(114,239,221,.28);box-shadow:0 10px 30px rgba(0,0,0,.26);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
      #${NAV_ID} *{box-sizing:border-box}
      #${NAV_ID} .sdq-shell{width:min(1680px,calc(100vw - 20px));min-height:56px;margin:0 auto;display:flex;align-items:center;gap:8px;padding:7px 0}
      #${NAV_ID} .sdq-brand{display:inline-flex;align-items:center;gap:8px;flex:0 0 auto;color:#eaf8ff;text-decoration:none;font-weight:1000;white-space:nowrap;padding:5px 8px;border-radius:12px}
      #${NAV_ID} .sdq-brand:hover{background:rgba(255,255,255,.06)}
      #${NAV_ID} .sdq-mark{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,#4cc9f0,#1b7fff 55%,#72efdd);color:#03121f;font-size:13px;font-weight:1000;box-shadow:0 8px 22px rgba(76,201,240,.22)}
      #${NAV_ID} .sdq-brandtext{display:grid;line-height:1.05}.sdq-brandtext small{color:#8fb1c5;font-size:10px;font-weight:800;margin-top:3px}
      #${NAV_ID} .sdq-menu{display:flex;align-items:center;gap:6px;min-width:0;flex:1 1 auto}
      #${NAV_ID} .sdq-main{display:flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap}
      #${NAV_ID} a.sdq-btn,#${NAV_ID} button.sdq-btn{appearance:none;border:1px solid rgba(148,197,255,.20);background:rgba(255,255,255,.055);color:#eaf8ff;border-radius:11px;min-height:36px;padding:7px 10px;display:inline-flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;font-size:12px;font-weight:900;white-space:nowrap;cursor:pointer;transition:.15s ease}
      #${NAV_ID} a.sdq-btn:hover,#${NAV_ID} button.sdq-btn:hover{transform:translateY(-1px);border-color:rgba(114,239,221,.55);background:rgba(114,239,221,.10)}
      #${NAV_ID} .sdq-btn.active{border-color:rgba(114,239,221,.70);background:rgba(114,239,221,.16);color:#bffff5;box-shadow:inset 0 0 0 1px rgba(114,239,221,.08)}
      #${NAV_ID} .sdq-btn.admin{border-color:rgba(255,209,102,.32);color:#ffe4a5;background:rgba(255,209,102,.07)}
      #${NAV_ID} .sdq-btn.front{border-color:rgba(76,201,240,.35);color:#ccefff}
      #${NAV_ID} .sdq-right{margin-left:auto;display:flex;align-items:center;gap:6px;flex:0 0 auto}
      #${NAV_ID} .sdq-role{max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid rgba(114,239,221,.28);background:rgba(114,239,221,.08);color:#bffff5;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900}
      #${NAV_ID} .sdq-role.inactive{border-color:rgba(255,107,107,.35);background:rgba(255,107,107,.08);color:#ffc6c6}
      #${NAV_ID} .sdq-more{position:relative}
      #${NAV_ID} .sdq-dropdown{display:none;position:absolute;top:calc(100% + 8px);right:0;width:250px;padding:8px;border:1px solid rgba(148,197,255,.24);border-radius:15px;background:rgba(6,24,38,.99);box-shadow:0 20px 55px rgba(0,0,0,.42);z-index:10}
      #${NAV_ID} .sdq-more.open .sdq-dropdown{display:grid;gap:6px}
      #${NAV_ID} .sdq-dropdown .sdq-btn{width:100%;justify-content:flex-start;min-height:38px}
      #${NAV_ID} .sdq-group-title{padding:6px 7px 3px;color:#7f9fb2;font-size:10px;font-weight:1000;letter-spacing:.08em}
      #${NAV_ID} .sdq-mobile-toggle{display:none;margin-left:auto}
      body.sd-b2b-quicknav-ready [data-sd-adjusted-sticky="1"]{top:var(--sd-b2b-quicknav-height)!important}
      @media(max-width:1180px){
        #${NAV_ID} .sdq-mobile-toggle{display:inline-flex}
        #${NAV_ID} .sdq-menu{display:none;position:absolute;left:10px;right:10px;top:calc(100% + 1px);padding:10px;border:1px solid rgba(148,197,255,.24);border-radius:0 0 16px 16px;background:rgba(4,17,28,.99);box-shadow:0 22px 55px rgba(0,0,0,.42);max-height:calc(100vh - var(--sd-b2b-quicknav-height) - 14px);overflow:auto}
        #${NAV_ID}.mobile-open .sdq-menu{display:block}
        #${NAV_ID} .sdq-main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
        #${NAV_ID} .sdq-main .sdq-btn{width:100%;justify-content:flex-start}
        #${NAV_ID} .sdq-right{margin:10px 0 0;padding-top:10px;border-top:1px solid rgba(148,197,255,.16);display:grid;grid-template-columns:1fr 1fr;gap:7px}
        #${NAV_ID} .sdq-role{max-width:none;grid-column:1/-1;text-align:center}
        #${NAV_ID} .sdq-more{position:static}
        #${NAV_ID} .sdq-dropdown{position:static;width:auto;margin-top:7px;box-shadow:none;background:rgba(255,255,255,.025)}
      }
      @media(max-width:680px){
        #${NAV_ID} .sdq-shell{width:calc(100vw - 12px);padding:6px 0}
        #${NAV_ID} .sdq-brandtext span{font-size:12px}.sdq-brandtext small{display:none}
        #${NAV_ID} .sdq-main{grid-template-columns:1fr 1fr}
        #${NAV_ID} .sdq-right{grid-template-columns:1fr}
        #${NAV_ID} .sdq-role{grid-column:auto}
      }
    `;
    document.head.appendChild(style);
  }

  function link(item, extraClass) {
    const active = item.href && isCurrent(item.href) ? ' active' : '';
    const cls = 'sdq-btn' + active + (extraClass ? ' ' + extraClass : '');
    if (item.action) {
      return '<button type="button" class="' + cls + '" data-sdq-action="' + esc(item.action) + '">' + esc(item.label) + '</button>';
    }
    const target = item.external ? ' target="_blank" rel="noopener"' : '';
    return '<a class="' + cls + '" href="' + esc(item.href) + '"' + target + '>' + esc(item.label) + '</a>';
  }

  function makeItems(profile) {
    const can = access(profile);
    const main = [{ label: 'B2B 首頁', href: B2B_HOME }];
    if (can.anyManager) main.push({ label: '管理中心', href: '/admin-center.html' });
    const admin = [];

    if (can.equipment) main.push({ label: '設備批發', href: '/order.html' });
    if (can.livestockSales) main.push({ label: '活體販售', href: '/livestock_b2b.html' });
    if (can.livestockOrders) main.push({ label: '活體訂單', href: '/livestock_order.html' });
    if (can.livestockAdmin) main.push({ label: '活體管理', href: '/livestock_admin.html' });
    if (can.chatAdmin) main.push({ label: '客服管理', href: '/chat_admin.html' });

    if (can.equipmentAdmin) {
      admin.push({ label: '快速新增商品', action: 'addProduct' });
      admin.push({ label: '品牌／分類管理', action: 'options' });
    }
    if (can.quoteAdmin) admin.push({ label: '報價管理', action: 'quotes' });
    if (can.userAdmin) admin.push({ label: '人員管理', action: 'users' });
    if (can.userAdmin) admin.push({ label: '活動紀錄', href: '/activity_logs_admin.html' });
    if (can.element) admin.push({ label: '元素調整', href: '/element_calculator.html' });
    if (can.equipmentAdmin) admin.push({ label: '同步公開商品', href: SHOP_ORIGIN + '/sync-public-products.html', external: true });

    return { main, admin, can };
  }

  function roleText(profile) {
    if (!profile) return '未登入';
    const roleMap = { admin: '最高管理員', staff: '工作人員', wholesale: '批發會員', user: '一般會員' };
    return (roleMap[profile.role] || profile.role || '會員') + '｜' + profile.displayName;
  }

  function render(profile) {
    const nav = document.getElementById(NAV_ID);
    if (!nav) return;
    const items = makeItems(profile);
    const mainHtml = items.main.map(function (item) { return link(item); }).join('');
    const adminHtml = items.admin.length
      ? '<div class="sdq-more"><button type="button" class="sdq-btn admin" data-sdq-toggle="more">更多管理 ▾</button><div class="sdq-dropdown"><div class="sdq-group-title">管理快捷操作</div>' + items.admin.map(function (item) { return link(item, 'admin'); }).join('') + '</div></div>'
      : '';
    const roleClass = profile && !profile.active ? ' inactive' : '';

    nav.innerHTML = '<div class="sdq-shell">' +
      '<a class="sdq-brand" href="' + B2B_HOME + '"><span class="sdq-mark">SD</span><span class="sdq-brandtext"><span>快捷導覽</span><small>' + esc(VERSION.replace('seadream_b2b_quick_nav_', 'v').replaceAll('_', '.')) + '</small></span></a>' +
      '<button type="button" class="sdq-btn sdq-mobile-toggle" data-sdq-toggle="mobile">☰ 管理選單</button>' +
      '<div class="sdq-menu"><div class="sdq-main">' + mainHtml + adminHtml + '</div>' +
      '<div class="sdq-right">' +
        link({ label: '官網首頁', href: SHOP_ORIGIN + '/', external: true }, 'front') +
        link({ label: '商品商城', href: SHOP_ORIGIN + '/shop.html', external: true }, 'front') +
        (items.can.shopAdmin ? link({ label: '商城管理中心', href: '/admin-center.html' }, 'admin') : '') +
        '<span class="sdq-role' + roleClass + '" title="' + esc(roleText(profile)) + '">' + esc(roleText(profile)) + '</span>' +
      '</div></div></div>';

    bindNavEvents();
    updateNavHeight();
  }

  function performAction(action) {
    const id = ACTION_BUTTONS[action];
    if (!id) return;
    if (currentPath().endsWith('/order.html')) {
      openOrderActionWhenReady(action);
      return;
    }
    const url = new URL('/order.html', location.origin);
    url.searchParams.set(OPEN_ACTION_KEY, action);
    location.href = url.pathname + url.search;
  }

  function isUsableButton(el) {
    if (!el || el.disabled) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (el.classList.contains('hidden')) return false;
    return true;
  }

  function openOrderActionWhenReady(forcedAction) {
    const queryAction = new URLSearchParams(location.search).get(OPEN_ACTION_KEY);
    const action = forcedAction || queryAction;
    const id = ACTION_BUTTONS[action];
    if (!id) return;
    let tries = 0;
    const timer = setInterval(function () {
      tries += 1;
      const el = document.getElementById(id);
      if (isUsableButton(el)) {
        clearInterval(timer);
        el.click();
        if (queryAction) {
          const url = new URL(location.href);
          url.searchParams.delete(OPEN_ACTION_KEY);
          history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      } else if (tries >= 80) {
        clearInterval(timer);
      }
    }, 150);
  }

  function bindNavEvents() {
    const nav = document.getElementById(NAV_ID);
    if (!nav) return;
    nav.querySelectorAll('[data-sdq-toggle="mobile"]').forEach(function (btn) {
      btn.addEventListener('click', function () { nav.classList.toggle('mobile-open'); });
    });
    nav.querySelectorAll('[data-sdq-toggle="more"]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.stopPropagation();
        const holder = btn.closest('.sdq-more');
        if (holder) holder.classList.toggle('open');
      });
    });
    nav.querySelectorAll('[data-sdq-action]').forEach(function (btn) {
      btn.addEventListener('click', function () { performAction(btn.getAttribute('data-sdq-action')); });
    });
    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target)) {
        nav.classList.remove('mobile-open');
        nav.querySelectorAll('.sdq-more.open').forEach(function (el) { el.classList.remove('open'); });
      }
    }, { passive: true });
  }

  function adjustStickyElements() {
    const nav = document.getElementById(NAV_ID);
    if (!nav) return;
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === nav || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
      try {
        const css = getComputedStyle(el);
        if (css.position === 'sticky' && parseFloat(css.top || '0') <= 1) {
          el.setAttribute('data-sd-adjusted-sticky', '1');
        }
      } catch (error) {}
    });
    document.querySelectorAll('.topbar').forEach(function (el) {
      if (el !== nav) el.setAttribute('data-sd-adjusted-sticky', '1');
    });
  }

  function updateNavHeight() {
    const nav = document.getElementById(NAV_ID);
    if (!nav) return;
    const height = Math.max(48, Math.ceil(nav.getBoundingClientRect().height));
    document.documentElement.style.setProperty('--sd-b2b-quicknav-height', height + 'px');
    adjustStickyElements();
  }

  function waitForFirebase() {
    return new Promise(function (resolve) {
      let tries = 0;
      const timer = setInterval(function () {
        tries += 1;
        if (window.firebase && firebase.apps && firebase.apps.length && firebase.auth && firebase.firestore) {
          clearInterval(timer);
          resolve(true);
        } else if (tries >= 100) {
          clearInterval(timer);
          resolve(false);
        }
      }, 100);
    });
  }

  async function bootAuth() {
    const ready = await waitForFirebase();
    if (!ready) {
      render(null);
      return;
    }
    const auth = firebase.auth();
    const db = firebase.firestore();
    auth.onAuthStateChanged(async function (user) {
      if (!user) {
        render(null);
        return;
      }
      let data = {};
      try {
        const snap = await db.collection('users').doc(user.uid).get();
        data = snap.exists ? (snap.data() || {}) : {};
      } catch (error) {
        console.warn('[SEADREAM QuickNav] profile read failed', error);
      }
      const profile = normalizeProfile(data, user);
      render(profile);
      if (currentPath().endsWith('/order.html')) openOrderActionWhenReady();
    });
  }

  function init() {
    if (document.getElementById(NAV_ID)) return;
    injectStyle();
    const nav = document.createElement('div');
    nav.id = NAV_ID;
    nav.innerHTML = '<div class="sdq-shell"><a class="sdq-brand" href="' + B2B_HOME + '"><span class="sdq-mark">SD</span><span class="sdq-brandtext"><span>快捷導覽</span><small>權限讀取中</small></span></a><button type="button" class="sdq-btn sdq-mobile-toggle">☰ 管理選單</button><div class="sdq-menu"><div class="sdq-main"><span class="sdq-role">正在讀取登入權限…</span></div></div></div>';
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.classList.add('sd-b2b-quicknav-ready');
    updateNavHeight();
    if ('ResizeObserver' in window) new ResizeObserver(updateNavHeight).observe(nav);
    window.addEventListener('resize', updateNavHeight, { passive: true });
    setTimeout(adjustStickyElements, 250);
    setTimeout(adjustStickyElements, 1200);
    bootAuth();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
