/* Sawa Testimonials: the gift page after a review (full name, Skool name, email → Sawa App access). Simple English. */
(function () {
  if (!document.getElementById('sawa-form-fonts')) {
    var lf = document.createElement('link');
    lf.id = 'sawa-form-fonts'; lf.rel = 'stylesheet';
    lf.href = 'https://fonts.googleapis.com/css2?family=Changa:wght@500;800&family=IBM+Plex+Sans:wght@400;600&display=swap';
    document.head.appendChild(lf);
  }

  function renderGift(host, cfg) {
    var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    var dark = cfg.theme === 'dark';
    var C = dark
      ? { card: '#1A1A1B', ink: '#E9E7E4', head: '#FFFFFF', muted: '#8A8584', line: '#2A2A2B', field: '#0F0F10', fill: '#FFFFFF', fillInk: '#0F0F10' }
      : { card: '#FFFFFF', ink: '#2B2A29', head: '#0F0F10', muted: '#8A8584', line: '#E6E3DF', field: '#F6F5F3', fill: '#0F0F10', fillInk: '#FFFFFF' };
    var r = Math.max(0, Math.min(40, cfg.radius == null ? 16 : +cfg.radius)), rf = Math.max(4, r - 6);
    var code = (new URLSearchParams(window.location.search).get('gift') || '').replace(/[^A-Za-z0-9]/g, '');
    var req = '<span class="req" aria-hidden="true">*</span>';
    var ic = {
      gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8C10 4 7 4 7 6s3 2 5 2c2 0 5 0 5-2s-3-2-5 2"/></svg>',
      mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/></svg>',
      check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'
    };

    var css = ':host{display:block;direction:ltr;font-family:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:' + C.ink + ';line-height:1.6;font-size:16px;text-align:left}'
      + '*{box-sizing:border-box}[hidden]{display:none!important}'
      + '.box{max-width:600px;margin:0 auto;background:' + C.card + ';border:1px solid ' + C.line + ';border-radius:' + r + 'px;padding:clamp(22px,4vw,40px);display:grid;gap:20px}'
      + 'h2{margin:0;font-family:"Changa","IBM Plex Sans",sans-serif;font-weight:800;font-size:clamp(26px,4vw,36px);line-height:1.2;color:' + C.head + ';text-wrap:balance}'
      + '.intro{margin:-8px 0 0;color:' + C.muted + ';font-size:16.5px}'
      + '.badge{display:inline-flex;align-items:center;gap:6px;justify-self:start;font-size:14px;font-weight:600;padding:5px 14px;border-radius:999px;background:#E7F5EC;color:#1D6B3A}'
      + '.badge svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}'
      + '.icon{width:60px;height:60px;border-radius:50%;background:' + C.fill + ';color:' + C.fillInk + ';display:grid;place-items:center}'
      + '.icon svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
      + '.f{display:grid;gap:7px;font-weight:600;font-size:15px;color:' + C.head + '}'
      + '.f small{font-weight:400;color:' + C.muted + ';font-size:13.5px}'
      + '.req{color:#E3262B;margin-left:3px}'
      + 'input{font:inherit;font-weight:400;color:' + C.ink + ';background:' + C.field + ';border:1px solid ' + C.line + ';border-radius:' + rf + 'px;padding:12px 14px;width:100%}'
      + 'input::placeholder{color:' + C.muted + ';opacity:1}'
      + 'input:focus{outline:2px solid ' + C.head + ';outline-offset:0;border-color:transparent}'
      + '.bad input{border-color:#E3262B}'
      + '.ferr{color:#E3262B;font-weight:400;font-size:13.5px;margin:0}.ferr:empty{display:none}'
      + '.hp{position:absolute;clip-path:inset(50%);overflow:hidden;width:1px;height:1px;opacity:0}'
      + '.err{color:#E3262B;font-weight:600;font-size:15px;margin:0}.err:empty{display:none}'
      + '.send{border:0;background:#E3262B;color:#FFFFFF;border-radius:999px;padding:15px 32px;font:inherit;font-weight:600;font-size:17px;cursor:pointer;justify-self:start;text-decoration:none;display:inline-block}'
      + '.send:hover{opacity:.9}.send:disabled{opacity:.6;cursor:default}'
      + 'ol{margin:0;padding-left:22px;display:grid;gap:6px}ol b{color:' + C.head + '}'
      + 'button:focus-visible,a:focus-visible{outline:2px solid #E3262B;outline-offset:2px}';

    root.innerHTML = '<style>' + css + '</style>'
      + '<div class="box nocode"' + (code ? ' hidden' : '') + '><div class="icon">' + ic.gift + '</div>'
      + '<h2>Send a review to get your gift</h2>'
      + '<p class="intro">Tell us how Sawa English helped your English. After you send your review, you can get free access to the Sawa App.</p>'
      + '<a class="send" href="' + esc(cfg.reviewUrl) + '">Write my review</a></div>'
      + '<form class="box" novalidate' + (code ? '' : ' hidden') + '>'
      + '<span class="badge">' + ic.check + 'Thank you! Your review was sent.</span>'
      + '<div class="icon">' + ic.gift + '</div>'
      + '<div><h2>Your gift: free access to the Sawa App</h2>'
      + '<p class="intro" style="margin-top:8px">Fill in your details below. Sherif will check them and send you an email to open the app.</p></div>'
      + '<label class="f" data-f="full_name"><span>Your full name' + req + '</span><input name="full_name" maxlength="80" autocomplete="name" placeholder="Mona Ahmed Hassan"><p class="ferr"></p></label>'
      + '<label class="f" data-f="skool"><span>Your name on Skool' + req + '</span><input name="skool" maxlength="80" placeholder="Mona Ahmed"><small>The name people see on your Skool profile.</small><p class="ferr"></p></label>'
      + '<label class="f" data-f="email"><span>Your email' + req + '</span><input name="email" type="email" maxlength="120" autocomplete="email" inputmode="email" placeholder="mona@gmail.com"><small>We send your app login to this email.</small><p class="ferr"></p></label>'
      + '<input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">'
      + '<p class="err" role="alert"></p>'
      + '<button class="send" type="submit">Get my gift</button>'
      + '</form>'
      + '<div class="box pending" hidden><div class="icon">' + ic.mail + '</div><h2>Your gift is on the way</h2>'
      + '<ol><li>Sherif checks your details (usually within a day).</li><li>You get an email at <b class="mail"></b>.</li><li>Click the link in the email, make a password and open the Sawa App.</li></ol></div>'
      + '<div class="box member" hidden><div class="icon">' + ic.check + '</div><h2>You already have the Sawa App</h2>'
      + '<p class="intro" style="margin:0">Sign in with <b class="mail"></b> to open it.</p><a class="send app" href="#">Open the Sawa App</a></div>';

    var $ = function (s) { return root.querySelector(s); };
    var form = $('form'), errEl = $('.err'), send = $('.send[type=submit]');
    function fieldErr(f, msg) { var b = $('[data-f="' + f + '"]'); b.classList.toggle('bad', !!msg); b.querySelector('.ferr').textContent = msg || ''; }
    form.addEventListener('input', function (e) { var b = e.target.closest('[data-f]'); if (b) fieldErr(b.dataset.f, ''); errEl.textContent = ''; });
    function val(n) { return (form.querySelector('[name="' + n + '"]').value || '').trim(); }
    function show(which, email) {
      form.hidden = true; $('.' + which).hidden = false;
      root.querySelectorAll('.mail').forEach(function (m) { m.textContent = email; });
      host.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault(); errEl.textContent = '';
      var name = val('full_name'), skool = val('skool'), email = val('email'), bad = [];
      if (!name) bad.push(['full_name', 'Write your full name.']);
      if (!skool) bad.push(['skool', 'Write your name on Skool.']);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push(['email', 'Write a correct email.']);
      bad.forEach(function (b) { fieldErr(b[0], b[1]); });
      if (bad.length) return;
      if (cfg.preview) return show('pending', email);

      var fd = new FormData();
      fd.append('gift', code); fd.append('full_name', name); fd.append('skool', skool); fd.append('email', email); fd.append('website', val('website'));
      send.disabled = true; send.textContent = 'Sending…';
      function reset(msg) { send.disabled = false; send.textContent = 'Get my gift'; errEl.textContent = msg; }
      fetch(cfg.endpoint, { method: 'POST', body: fd }).then(function (res) {
        return res.json().catch(function () { return null; });
      }).then(function (res) {
        if (!res || !res.ok) return reset((res && res.message) || 'Your gift was not sent. Try again.');
        if (res.status === 'member') { $('.app').href = res.app || '/app/'; return show('member', email); }
        show('pending', email);
      }).catch(function () { reset('Your gift was not sent. Check your internet and try again.'); });
    });
  }

  function boot() {
    document.querySelectorAll('.sawa-gift-form').forEach(function (el) {
      if (el.dataset.ready) return;
      var data = el.nextElementSibling;
      if (!data || !data.classList.contains('sawa-gift-data')) return;
      try { el.dataset.ready = '1'; renderGift(el, JSON.parse(data.textContent)); }
      catch (e) { if (window.console) console.error('Sawa gift form:', e); }
    });
  }
  window.SawaGiftForm = { render: renderGift, boot: boot };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  if (window.jQuery) window.jQuery(window).on('elementor/frontend/init', function () { setTimeout(boot, 300); });
})();
