/* Sawa Testimonials: the wall. English by default, Arabic (RTL) when the student picked العربية (Sawa_Lang).
   The reviews themselves are mostly Arabic and keep dir="auto". Sawa visual identity (Ink / White / Smoke, flat).
   Renders every .sawa-wall element from the JSON that follows it. */
(function () {
  var ICONS = {"YouTube":{"c":"#FF0000","s":"<path fill=\"currentColor\" d=\"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z\"/>"},"Facebook":{"c":"#0866FF","s":"<path fill=\"currentColor\" d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"/>"},"Instagram":{"c":"#FF0069","s":"<path fill=\"currentColor\" d=\"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077\"/>"},"WhatsApp":{"c":"#25D366","s":"<path fill=\"currentColor\" d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z\"/>"},"Telegram":{"c":"#26A5E4","s":"<path fill=\"currentColor\" d=\"M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z\"/>"},"Discord":{"c":"#5865F2","s":"<path fill=\"currentColor\" d=\"M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z\"/>"},"X":{"c":null,"s":"<path fill=\"currentColor\" d=\"M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z\"/>"},"TikTok":{"c":null,"s":"<path fill=\"currentColor\" d=\"M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z\"/>"},"Google":{"c":"#4285F4","s":"<path fill=\"currentColor\" d=\"M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z\"/>"},"Trustpilot":{"c":"#00B67A","s":"<path fill=\"currentColor\" d=\"M17.227 16.67l2.19 6.742-7.413-5.388 5.223-1.354zM24 9.31h-9.165L12.005.589l-2.84 8.723L0 9.3l7.422 5.397-2.84 8.714 7.422-5.388 4.583-3.326L24 9.311z\"/>"},"Loom":{"c":"#625DF5","s":"<path fill=\"currentColor\" d=\"M24 10.665h-7.018l6.078-3.509-1.335-2.312-6.078 3.509 3.508-6.077L16.843.94l-3.508 6.077V0h-2.67v7.018L7.156.94 4.844 2.275l3.509 6.077-6.078-3.508L.94 7.156l6.078 3.509H0v2.67h7.017L.94 16.844l1.335 2.313 6.077-3.508-3.509 6.077 2.312 1.335 3.509-6.078V24h2.67v-7.017l3.508 6.077 2.312-1.335-3.509-6.078 6.078 3.509 1.335-2.313-6.077-3.508h7.017v-2.67H24zm-12 4.966a3.645 3.645 0 1 1 0-7.29 3.645 3.645 0 0 1 0 7.29z\"/>"},"LinkedIn":{"c":"#0A66C2","s":"<path fill=\"currentColor\" d=\"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z\"/>"},"Email":{"c":null,"s":"<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linejoin=\"round\" d=\"M3 5.5h18v13H3z\"/><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linejoin=\"round\" d=\"M3.5 6l8.5 7 8.5-7\"/>"},"Website":{"c":null,"s":"<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" d=\"M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z\"/>"}};

  if (!document.getElementById('sawa-brand-fonts')) {
    var lf = document.createElement('link');
    lf.id = 'sawa-brand-fonts'; lf.rel = 'stylesheet';
    lf.href = 'https://fonts.googleapis.com/css2?family=Changa:wght@500;800&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap';
    document.head.appendChild(lf);
  }

  function renderTestimonialWall(host, cfg) {
    var s = cfg.settings || {}, items = (cfg.items || []).filter(function (t) { return !t.hidden; });
    items = items.filter(function (t) { return t.featured; }).concat(items.filter(function (t) { return !t.featured; }));
    var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    var AR = (window.SawaLang ? window.SawaLang.get() : document.documentElement.lang) === 'ar';
    function T(en, a) { return AR ? a : en; }
    if (!AR) s = Object.assign({}, s, { title: s.titleEn || s.title, subtitle: s.subtitleEn || s.subtitle, moreLabel: s.moreLabelEn || s.moreLabel });

    function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function rich(v) { return esc(v).replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>').replace(/\*\*/g, ''); }
    function safeUrl(u) { u = String(u || '').trim(); return /^(https?:\/\/|data:image\/)/i.test(u) ? u : ''; }
    function ytId(u) { var m = String(u || '').match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/); return m ? m[1] : null; }
    function loomId(u) { var m = String(u || '').match(/loom\.com\/(?:share|embed)\/([a-f0-9]{32})/i); return m ? m[1] : null; }
    function muxId(u) { var m = String(u || '').match(/(?:stream|player|image)\.mux\.com\/([A-Za-z0-9]{20,})/); return m ? m[1] : null; }
    function initials(n) { return String(n || '?').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase() || '?'; }
    function fmtDate(d) { if (!d) return ''; var x = new Date(d + 'T00:00:00'); return isNaN(x) ? '' : x.toLocaleDateString(AR ? 'ar-EG' : 'en-GB', { month: 'long', year: 'numeric' }); }
    function arNum(n) { return Number(n).toLocaleString(AR ? 'ar-EG' : 'en-US'); }

    var dark = s.theme === 'dark';
    var font = s.font && s.font !== 'inherit' ? "'" + s.font.replace(/'/g, '') + "', 'IBM Plex Sans Arabic', system-ui, sans-serif" : "'IBM Plex Sans Arabic', system-ui, -apple-system, 'Segoe UI', sans-serif";
    var C = dark
      ? { card: '#1A1A1B', ink: '#E9E7E4', head: '#FFFFFF', muted: '#8A8584', line: '#2A2A2B', chip: '#1A1A1B', fill: '#FFFFFF', fillInk: '#0F0F10', soft: '#2A2A2B' }
      : { card: '#FFFFFF', ink: '#2B2A29', head: '#0F0F10', muted: '#8A8584', line: '#E6E3DF', chip: '#FFFFFF', fill: '#0F0F10', fillInk: '#FFFFFF', soft: '#F6F5F3' };
    var radius = Math.max(0, Math.min(40, s.radius == null ? 14 : +s.radius));
    var star = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"/></svg>';
    var playSvg = '<span><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></span>';
    var trIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7M9 8h3"/></svg>';

    var css = ':host{display:block;direction:' + (AR ? 'rtl' : 'ltr') + ';--card:' + C.card + ';--ink:' + C.ink + ';--head:' + C.head + ';--muted:' + C.muted + ';--line:' + C.line + ';--chip:' + C.chip + ';--fill:' + C.fill + ';--fill-ink:' + C.fillInk + ';--soft:' + C.soft + ';--r:' + radius + 'px;font-family:' + font + ';line-height:1.7;text-align:right;font-size:16px}'
      + '*{box-sizing:border-box}[hidden]{display:none!important}'
      + '.wrap{max-width:1200px;margin:0 auto}'
      + '.head{text-align:center;margin:0 0 32px}'
      + 'h2{font-family:"Changa","IBM Plex Sans Arabic",sans-serif;font-size:clamp(30px,4.4vw,52px);line-height:1.15;margin:0 0 10px;font-weight:800;color:inherit;text-wrap:balance}'
      + '.sub{opacity:.75;font-size:18px;margin:0 auto;max-width:560px}'
      + '.sum{display:inline-flex;gap:10px;align-items:center;margin-top:16px;font-size:15px;color:var(--ink);border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 16px}'
      + '.sum b{font-family:"Changa",sans-serif;font-weight:800;color:var(--head);font-size:17px}'
      + '.stars{display:inline-flex;gap:2px;color:var(--head);direction:ltr}.stars svg{width:15px;height:15px;display:block}.stars .off{opacity:.2}'
      + '.filters{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 28px}'
      + '.chip{display:inline-flex;align-items:center;gap:8px;border:1.5px solid var(--line);background:var(--chip);color:var(--ink);border-radius:999px;padding:8px 16px;font:600 14.5px/1 inherit;font-family:inherit;cursor:pointer}'
      + '.chip svg{width:15px;height:15px}.chip:hover{border-color:var(--head)}'
      + '.chip[aria-pressed="true"]{background:var(--fill);border-color:var(--fill);color:var(--fill-ink)}'
      + '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}'
      + '.grid{display:flex;gap:16px;align-items:flex-start}'
      + '.col{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:16px}'
      + '.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:22px;color:var(--ink)}'
      + '.card.feat{border-color:var(--head)}'
      + '.who{display:flex;align-items:center;gap:12px}.id{flex:1;min-width:0}'
      + '.av{width:44px;height:44px;border-radius:50%;flex:none;object-fit:cover;background:var(--soft);color:var(--head);display:grid;place-items:center;font-weight:800;font-size:15px;font-family:"Changa",sans-serif}'
      + '.nm{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-family:"Changa","IBM Plex Sans Arabic",sans-serif;font-weight:800;font-size:16px;line-height:1.3;color:var(--head)}.nm>span{overflow-wrap:anywhere}'
      + '.rl{color:var(--muted);font-size:13.5px;line-height:1.4;overflow-wrap:anywhere}'
      + '.logo{flex:none;display:inline-flex;align-items:center;text-decoration:none;color:var(--muted);line-height:1}'
      + '.logo svg{width:15px;height:15px;display:block}a.logo:hover{color:var(--head)}'
      + '.skool{display:inline-flex;font-weight:800;font-size:12.5px;letter-spacing:-.02em;line-height:1;font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;direction:ltr}'
      + '.card .stars{margin-top:14px}'
      + '.text{margin:12px 0 0;font-size:16px;white-space:pre-line;overflow-wrap:anywhere;unicode-bidi:plaintext}'
      + '.text strong{color:var(--head)}'
      + '.more{background:none;border:0;padding:0;color:var(--head);font:inherit;font-weight:600;cursor:pointer;text-decoration:underline;text-underline-offset:3px}'
      + '.media{margin-top:14px;border-radius:max(0px,calc(var(--r) - 6px));overflow:hidden;background:#0F0F10;position:relative;aspect-ratio:16/9;width:100%}'
      + '.media.tall{aspect-ratio:9/16;max-height:520px}.media:first-child{margin-top:0}'
      + '.media.file{aspect-ratio:auto}.media.file video{display:block;width:100%;max-height:560px;background:#0F0F10}'
      + '.media iframe{position:absolute;inset:0;width:100%;height:100%;border:0}'
      + '.play{position:absolute;inset:0;width:100%;height:100%;border:0;padding:0;cursor:pointer;background:#0F0F10 center/cover no-repeat}'
      + '.play span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:58px;height:58px;border-radius:50%;background:#FFFFFF;display:grid;place-items:center}'
      + '.play svg{width:22px;height:22px;fill:#0F0F10;margin-left:3px}'
      + '.voice{margin-top:14px;display:flex;align-items:center;gap:10px;background:var(--soft);border-radius:999px;padding:6px 8px 6px 12px}'
      + '.voice .mic{width:30px;height:30px;border-radius:50%;background:var(--fill);display:grid;place-items:center;flex:none}.voice .mic svg{width:15px;height:15px;fill:var(--fill-ink)}'
      + '.voice audio{flex:1;min-width:0;height:36px}'
      + '.tr{margin-top:10px}.trbtn{display:inline-flex;align-items:center;gap:6px;border:0;background:none;padding:10px 0;min-height:44px;color:var(--head);font:600 14px/1.4 inherit;font-family:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:3px}'
      + '.trbtn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.trt{margin-top:8px}'
      + '.shot{margin-top:14px;display:block;width:100%;border:1px solid var(--line);border-radius:max(0px,calc(var(--r) - 6px));cursor:zoom-in;padding:0;background:none;overflow:hidden}'
      + '.shot:first-child{margin-top:0}.shot img{display:block;width:100%;height:auto;max-height:420px;object-fit:cover;object-position:top}'
      + '.foot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:16px;font-size:13px;color:var(--muted);flex-wrap:wrap}'
      + '.load{display:block;margin:32px auto 0;border:1.5px solid var(--fill);background:transparent;color:var(--head);border-radius:999px;padding:12px 26px;font:600 16px/1 inherit;font-family:inherit;cursor:pointer}'
      + '.load:hover{background:var(--fill);color:var(--fill-ink)}'
      + '.empty{text-align:center;opacity:.7;padding:32px 0}'
      + '.lb{position:fixed;inset:0;background:rgba(15,15,16,.92);display:flex;align-items:center;justify-content:center;padding:24px;z-index:2147483647;cursor:zoom-out}'
      + '.lb img{max-width:100%;max-height:100%;border-radius:8px}'
      + 'button:focus-visible,a:focus-visible{outline:2px solid #E3262B;outline-offset:2px}';

    function stars(n) {
      var h = '<span class="stars" role="img" aria-label="' + T(n + ' out of 5 stars', n + ' من ٥ نجوم') + '">';
      for (var i = 1; i <= 5; i++) h += i <= Math.round(n) ? star : '<span class="off">' + star + '</span>';
      return h + '</span>';
    }
    function mark(src) {
      if (src === 'Skool') return '<span class="skool" aria-hidden="true">skool</span>';
      var ic = ICONS[src];
      return ic ? '<svg viewBox="0 0 24 24" aria-hidden="true">' + ic.s + '</svg>' : '';
    }
    function logo(src, link) {
      if (!src || s.showSources === false) return '';
      var inner = mark(src); if (!inner) return '';
      return link
        ? '<a class="logo" href="' + esc(link) + '" target="_blank" rel="noopener" title="' + T('See it on ', 'شوفها على ') + esc(src) + '" aria-label="' + T('See the original on ', 'شوف الأصل على ') + esc(src) + '">' + inner + '</a>'
        : '<span class="logo" role="img" title="' + T('From ', 'من ') + esc(src) + '" aria-label="' + T('From ', 'من ') + esc(src) + '">' + inner + '</span>';
    }
    function shot(t) {
      var u = safeUrl(t.media); if (!u) return '';
      return '<button class="shot" data-zoom="' + esc(u) + '" aria-label="' + T('Make the picture bigger', 'كبّر الصورة') + '"><img src="' + esc(u) + '" alt="' + (t.name ? T('Post by ', 'بوست من ') + esc(t.name) : T('Review picture', 'صورة تقييم')) + '" loading="lazy"></button>';
    }
    function video(t) {
      var u = safeUrl(t.media), y = ytId(u), lm = loomId(u), mx = muxId(u), label = T('Play the video', 'شغّل الفيديو') + (t.name ? T(' by ', ' بتاع ') + esc(t.name) : '');
      if (y) return '<div class="media' + (/\/shorts\//.test(u) ? ' tall' : '') + '"><button class="play" data-src="https://www.youtube-nocookie.com/embed/' + y + '?autoplay=1&rel=0" style="background-image:url(https://i.ytimg.com/vi/' + y + '/hqdefault.jpg)" aria-label="' + label + '">' + playSvg + '</button></div>';
      if (lm) return '<div class="media"><iframe src="https://www.loom.com/embed/' + lm + '?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true" loading="lazy" allowfullscreen title="' + T('Review video', 'فيديو تقييم') + '"></iframe></div>';
      if (mx) return '<div class="media"><button class="play" data-src="https://player.mux.com/' + mx + '?autoplay=true" style="background-image:url(https://image.mux.com/' + mx + '/thumbnail.webp?width=480)" aria-label="' + label + '">' + playSvg + '</button></div>';
      if (u) return '<div class="media file"><video controls playsinline preload="metadata" src="' + esc(u) + '#t=0.1"></video></div>';
      return '';
    }
    function voice(t) {
      var u = safeUrl(t.media); if (!u) return '';
      return '<div class="voice"><span class="mic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-2.1A7 7 0 0 0 19 12h-2z"/></svg></span><audio controls preload="none" src="' + esc(u) + '" aria-label="' + T('Voice message', 'رسالة صوتية') + (t.name ? T(' from ', ' من ') + esc(t.name) : '') + '"></audio></div>';
    }

    function card(t) {
      var link = safeUrl(t.link), h = '<article class="card' + (t.featured ? ' feat' : '') + '">';
      var top = t.type === 'video' ? video(t) : t.type === 'image' ? shot(t) : '';
      h += top;
      var lg = logo(t.source, link);
      if (t.name) {
        var av = safeUrl(t.avatar) ? '<img class="av" src="' + esc(safeUrl(t.avatar)) + '" alt="" loading="lazy">' : '<span class="av" aria-hidden="true">' + esc(initials(t.name)) + '</span>';
        h += '<div class="who"' + (top ? ' style="margin-top:14px"' : '') + '>' + av + '<div class="id"><div class="nm"><span dir="auto">' + esc(t.name) + '</span>' + lg + '</div>' + (t.role ? '<div class="rl" dir="auto">' + esc(t.role) + '</div>' : '') + '</div></div>';
        lg = '';
      }
      if (s.showRatings !== false && +t.rating > 0) h += stars(+t.rating);
      if (t.type === 'audio') h += voice(t);
      if (t.transcript && (t.type === 'audio' || t.type === 'video')) {
        h += '<div class="tr"><button class="trbtn" data-tr aria-expanded="false">' + trIcon + '<span>' + T('Read the words', 'اقرا الكلام مكتوب') + '</span></button><p class="text trt" dir="auto" hidden>' + esc(t.transcript) + '</p></div>';
      }
      if (t.text) {
        var txt = String(t.text), plain = txt.replace(/\*\*/g, ''), LIM = 280;
        if (plain.length > LIM + 60) {
          var cut = plain.slice(0, LIM).replace(/\s+\S*$/, '');
          h += '<p class="text" dir="auto"><span>' + esc(cut) + '… </span><span hidden>' + rich(txt) + ' </span><button class="more" data-more aria-expanded="false">' + T('Read more', 'اقرا أكتر') + '</button></p>';
        } else h += '<p class="text" dir="auto">' + rich(txt) + '</p>';
      }
      if (t.type === 'text') h += shot(t);
      var date = s.showDates !== false ? fmtDate(t.date) : '';
      if (lg || date) h += '<div class="foot">' + (lg || '<span></span>') + (date ? '<span>' + esc(date) + '</span>' : '') + '</div>';
      return h + '</article>';
    }

    var rated = items.filter(function (t) { return +t.rating > 0; });
    var avg = rated.length ? rated.reduce(function (a, t) { return a + +t.rating; }, 0) / rated.length : 0;
    var sources = []; items.forEach(function (t) { if (t.source && t.source !== 'Other' && sources.indexOf(t.source) < 0) sources.push(t.source); });

    var head = '', showHead = !s.hideHeading;
    if ((showHead && (s.title || s.subtitle)) || (s.showSummary !== false && rated.length)) {
      head = '<header class="head">' + (showHead && s.title ? '<h2 dir="auto">' + esc(s.title) + '</h2>' : '') + (showHead && s.subtitle ? '<p class="sub" dir="auto">' + esc(s.subtitle) + '</p>' : '')
        + (s.showSummary !== false && rated.length ? '<div class="sum">' + stars(avg) + '<span><b>' + avg.toFixed(1) + '</b> ' + T('from ' + arNum(rated.length) + ' reviews', 'من ' + arNum(rated.length) + ' تقييم') + '</span></div>' : '') + '</header>';
    }
    var filters = s.showFilters !== false && sources.length > 1
      ? '<div class="filters" role="group" aria-label="' + T('Filter by source', 'فلترة حسب المصدر') + '"><button class="chip" data-f="" aria-pressed="true">' + T('All', 'الكل') + '</button>' + sources.map(function (x) { return '<button class="chip" data-f="' + esc(x) + '" aria-pressed="false">' + mark(x) + (x === 'Skool' ? '<span class="sr">Skool</span>' : esc(x)) + '</button>'; }).join('') + '</div>' : '';

    root.innerHTML = '<style>' + css + '</style><div class="wrap">' + head + filters + '<div class="grid"></div><button class="load" hidden>' + esc(s.moreLabel || T('Show more reviews', 'اعرض تقييمات أكتر')) + '</button></div>';
    var grid = root.querySelector('.grid'), loadBtn = root.querySelector('.load');
    var step = Math.max(1, parseInt(s.initialCount, 10) || 9), shown = step, filter = '', lastN = 0;

    function list() { return filter ? items.filter(function (t) { return t.source === filter; }) : items; }
    function columns() { var w = grid.clientWidth || host.clientWidth || 900; return Math.max(1, Math.min(parseInt(s.maxColumns, 10) || 3, Math.floor((w + 16) / 296))); }
    function layout() {
      var n = columns(), L = list(); lastN = n;
      grid.innerHTML = '';
      if (!L.length) { grid.innerHTML = '<p class="empty">' + T('No reviews yet.', 'مفيش تقييمات لسه.') + '</p>'; loadBtn.hidden = true; return; }
      var cols = [];
      for (var i = 0; i < n; i++) { var c = document.createElement('div'); c.className = 'col'; grid.appendChild(c); cols.push(c); }
      L.slice(0, shown).forEach(function (t) {
        var target = cols[0];
        for (var j = 1; j < cols.length; j++) if (cols[j].offsetHeight < target.offsetHeight) target = cols[j];
        target.insertAdjacentHTML('beforeend', card(t));
      });
      loadBtn.hidden = L.length <= shown;
    }

    root.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('button') : null;
      if (!el) { var lbx = e.target.closest && e.target.closest('.lb'); if (lbx) lbx.remove(); return; }
      if (el.dataset.src) {
        var f = document.createElement('iframe');
        f.src = el.dataset.src;
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; f.title = T('Review video', 'فيديو تقييم');
        el.replaceWith(f);
      } else if (el.hasAttribute('data-more')) {
        var p = el.parentNode, open = el.getAttribute('aria-expanded') === 'true';
        p.children[0].hidden = !open; p.children[1].hidden = open;
        el.setAttribute('aria-expanded', String(!open)); el.textContent = open ? T('Read more', 'اقرا أكتر') : T('Show less', 'اقفل');
      } else if (el.hasAttribute('data-tr')) {
        var tro = el.getAttribute('aria-expanded') === 'true';
        el.nextElementSibling.hidden = tro;
        el.setAttribute('aria-expanded', String(!tro)); el.lastChild.textContent = tro ? T('Read the words', 'اقرا الكلام مكتوب') : T('Hide the words', 'اخفي الكلام');
      } else if (el.dataset.zoom) {
        var lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', T('Picture', 'صورة'));
        lb.innerHTML = '<img alt="' + T('Review picture', 'صورة تقييم') + '">'; lb.firstChild.src = el.dataset.zoom;
        root.appendChild(lb);
      } else if (el.hasAttribute('data-f')) {
        filter = el.getAttribute('data-f'); shown = step;
        root.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === el)); });
        layout();
      } else if (el === loadBtn) { shown += step; layout(); }
    });
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var lb = root.querySelector('.lb'); if (lb) lb.remove(); } });

    layout();
    if (window.ResizeObserver) new ResizeObserver(function () { if (columns() !== lastN) layout(); }).observe(grid);
  }

  function boot() {
    document.querySelectorAll('.sawa-wall').forEach(function (el) {
      if (el.dataset.ready) return;
      var data = el.nextElementSibling;
      if (!data || !data.classList.contains('sawa-wall-data')) return;
      try { el.dataset.ready = '1'; el._sawaCfg = JSON.parse(data.textContent); renderTestimonialWall(el, el._sawaCfg); }
      catch (e) { if (window.console) console.error('Sawa testimonials:', e); }
    });
  }
  window.SawaWall = { render: renderTestimonialWall, boot: boot, icons: ICONS };
  // English | العربية switch: redraw every wall in the other language.
  document.addEventListener('sawa-lang', function () { document.querySelectorAll('.sawa-wall').forEach(function (el) {
    if (!el._sawaCfg) return;
    var n = el.cloneNode(false); n._sawaCfg = el._sawaCfg; // a fresh element, so the wall's click handlers aren't added twice
    el.parentNode.replaceChild(n, el); renderTestimonialWall(n, n._sawaCfg);
  }); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  if (window.jQuery) window.jQuery(window).on('elementor/frontend/init', function () { setTimeout(boot, 300); });
})();
