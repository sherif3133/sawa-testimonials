/* Sawa Testimonials: the student review form (written, voice message or video). Simple English, Sawa visual identity. */
(function () {
  if (!document.getElementById('sawa-form-fonts')) {
    var lf = document.createElement('link');
    lf.id = 'sawa-form-fonts'; lf.rel = 'stylesheet';
    lf.href = 'https://fonts.googleapis.com/css2?family=Changa:wght@500;800&family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap';
    document.head.appendChild(lf);
  }

  var QUESTIONS = ['How did you find the community?', 'How did it help your English?', 'What problems did you have before, and how do you deal with them now?', 'What new things did you learn?'];
  var STORY_HINT = 'عرفت الكوميونيتي ازاي؟\n'
    + 'ازاي ساعدك في الانجليزي؟\n'
    + 'كانت ايه المشاكل اللي بتواجهك قبل كده ودلوقتي بتتعامل معاها ازاي؟\n'
    + 'اتعلمت ايه جديد؟';

  /** True when a text has at least as many Arabic letters as Latin ones (Arabic with some English words is fine). */
  function mostlyArabic(t) {
    var ar = (t.match(/[؀-ۿ]/g) || []).length, en = (t.match(/[A-Za-z]/g) || []).length;
    return ar > 0 && ar >= en;
  }

  function renderReviewForm(host, cfg) {
    var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    var dark = cfg.theme === 'dark';
    var maxBytes = +cfg.maxUpload || 8 * 1048576, maxMB = Math.max(1, Math.floor(maxBytes / 1048576));
    var C = dark
      ? { card: '#1A1A1B', ink: '#E9E7E4', head: '#FFFFFF', muted: '#8A8584', line: '#2A2A2B', field: '#0F0F10', fill: '#FFFFFF', fillInk: '#0F0F10' }
      : { card: '#FFFFFF', ink: '#2B2A29', head: '#0F0F10', muted: '#8A8584', line: '#E6E3DF', field: '#F6F5F3', fill: '#0F0F10', fillInk: '#FFFFFF' };
    var r = Math.max(0, Math.min(40, cfg.radius == null ? 16 : +cfg.radius)), rf = Math.max(4, r - 6);
    var star = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"/></svg>';
    var ic = {
      text: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
      audio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM18 11a6 6 0 0 1-12 0M12 17v4"/></svg>',
      video: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h12v10H3zM15 10l6-3v10l-6-3"/></svg>',
      user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
      camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
      gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8C10 4 7 4 7 6s3 2 5 2c2 0 5 0 5-2s-3-2-5 2"/></svg>',
      lang: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h7M7.5 3v2M5 9c1.5 3 4 5 6 6M10 5c-1 4-3 7-6 9M12 21l4.5-10L21 21M13.5 18h6"/></svg>'
    };
    var examples = (cfg.examples || []).filter(function (x) { return x && x.text; });
    /** Escapes a review and turns its ==highlight== and **highlight** marks into <mark>. */
    function marks(t) { return esc(t).replace(/==([\s\S]+?)==/g, '<mark>$1</mark>').replace(/\*\*([\s\S]+?)\*\*/g, '<mark>$1</mark>'); }
    var req = '<span class="req" aria-hidden="true">*</span>';

    var css = ':host{display:block;direction:ltr;--fill:' + C.fill + ';font-family:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:' + C.ink + ';line-height:1.6;font-size:16px;text-align:left}'
      + '*{box-sizing:border-box}[hidden]{display:none!important}'
      + '.box{max-width:680px;margin:0 auto;background:' + C.card + ';border:1px solid ' + C.line + ';border-radius:' + r + 'px;padding:clamp(22px,4vw,40px);display:grid;gap:20px}'
      + 'h2{margin:0;font-family:"Changa","IBM Plex Sans",sans-serif;font-weight:800;font-size:clamp(26px,4vw,38px);line-height:1.2;color:' + C.head + ';text-wrap:balance}'
      + '.intro{margin:-8px 0 0;color:' + C.muted + ';white-space:pre-line;font-size:16.5px}'
      + '.row2{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}'
      + '.f{display:grid;gap:7px;font-weight:600;font-size:15px;color:' + C.head + ';align-content:start}'
      + '.f small,.hint{font-weight:400;color:' + C.muted + ';font-size:13.5px}'
      + '.req{color:#E3262B;margin-left:3px}'
      + 'input,textarea{font:inherit;font-weight:400;color:' + C.ink + ';background:' + C.field + ';border:1px solid ' + C.line + ';border-radius:' + rf + 'px;padding:12px 14px;width:100%}'
      + 'textarea{min-height:200px;resize:vertical;line-height:1.7;font-family:"IBM Plex Sans Arabic","IBM Plex Sans",sans-serif;unicode-bidi:plaintext}'
      + 'input::placeholder,textarea::placeholder{color:' + C.muted + ';opacity:1}'
      + 'input:focus,textarea:focus{outline:2px solid ' + C.head + ';outline-offset:0;border-color:transparent}'
      + '.bad input,.bad textarea,.bad .av{border-color:#E3262B}'
      + '.ferr{color:#E3262B;font-weight:400;font-size:13.5px;margin:0}.ferr:empty{display:none}'
      + '.kinds{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}'
      + '.kind{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 8px;border:1.5px solid ' + C.line + ';border-radius:' + rf + 'px;background:transparent;color:' + C.ink + ';font:inherit;font-size:15px;font-weight:600;cursor:pointer;text-align:center}'
      + '.kind svg,.btn2 svg,.av svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
      + '.kind:hover{border-color:' + C.head + '}'
      + '.kind[aria-pressed="true"]{border-color:' + C.fill + ';background:' + C.fill + ';color:' + C.fillInk + '}'
      + '.panel{display:grid;gap:12px;padding:18px;border-radius:' + rf + 'px;background:' + C.field + ';border:1px solid ' + C.line + '}'
      + '.rec{display:flex;align-items:center;gap:14px;flex-wrap:wrap}'
      + '.recbtn{display:inline-flex;align-items:center;gap:10px;border:0;background:' + C.fill + ';color:' + C.fillInk + ';border-radius:999px;padding:12px 22px;font:inherit;font-weight:600;cursor:pointer}'
      + '.recbtn .dot{width:12px;height:12px;border-radius:50%;background:#E3262B}'
      + '.recbtn.on .dot{border-radius:2px;animation:pulse 1s infinite}'
      + '@keyframes pulse{50%{opacity:.35}}'
      + '.timer{font-variant-numeric:tabular-nums;font-weight:600;color:' + C.head + '}'
      + 'audio,video{width:100%;display:block;border-radius:' + rf + 'px}video{max-height:320px;background:#0F0F10}'
      + '.link{color:' + C.head + ';text-decoration:underline;text-underline-offset:3px;cursor:pointer;background:none;border:0;padding:0;font:inherit}'
      + '.wc{display:flex;align-items:center;gap:10px;font-weight:400;font-size:13.5px;color:' + C.muted + '}'
      + '.wcbar{flex:1;max-width:220px;height:6px;border-radius:99px;background:' + C.field + ';border:1px solid ' + C.line + ';overflow:hidden}'
      + '.wcbar i{display:block;height:100%;width:0;background:' + C.muted + ';transition:width .15s}'
      + '.wc.ok{color:#1D6B3A}.wc.ok .wcbar i{background:#1D6B3A}'
      + '.stars{display:flex;gap:4px}.stars button{border:0;background:none;padding:2px;cursor:pointer;color:' + C.line + ';line-height:0}'
      + '.stars button.on{color:' + C.head + '}.stars svg{width:30px;height:30px}'
      + '.rate{border:0;padding:0;margin:0}.rate legend{font-weight:600;font-size:15px;color:' + C.head + ';padding:0;margin-bottom:8px}'
      + '.photo{display:flex;align-items:center;gap:16px;flex-wrap:wrap}'
      + '.photo .f{gap:8px}'
      + '.av{width:76px;height:76px;border-radius:50%;background:' + C.field + ';border:1.5px dashed ' + C.muted + ';overflow:hidden;display:grid;place-items:center;color:' + C.muted + ';flex:none}'
      + '.av.has{border-style:solid;border-color:' + C.line + '}.av img{width:100%;height:100%;object-fit:cover}'
      + '.btn2{display:inline-flex;align-items:center;gap:8px;border:1.5px solid ' + C.line + ';background:transparent;color:' + C.ink + ';border-radius:999px;padding:9px 18px;font:inherit;font-size:15px;font-weight:600;cursor:pointer;justify-self:start}'
      + '.btn2:hover{border-color:' + C.head + '}.btn2 svg{width:18px;height:18px}'
      + '.hp{position:absolute;clip-path:inset(50%);overflow:hidden;width:1px;height:1px;opacity:0}'
      + '.chk{display:flex;gap:10px;align-items:flex-start;font-size:15px;cursor:pointer}.chk input{width:18px;height:18px;margin-top:4px;accent-color:' + C.head + ';flex:none;padding:0}'
      + '.err{color:#E3262B;font-weight:600;font-size:15px;margin:0}.err:empty{display:none}'
      + '.bar{height:8px;border-radius:99px;background:' + C.field + ';overflow:hidden;border:1px solid ' + C.line + '}.bar i{display:block;height:100%;width:0;background:' + C.head + ';transition:width .2s}'
      + '.send{border:0;background:#E3262B;color:#FFFFFF;border-radius:999px;padding:15px 32px;font:inherit;font-weight:600;font-size:17px;cursor:pointer;justify-self:start}'
      + '.send:hover{opacity:.9}.send:disabled{opacity:.6;cursor:default}'
      + '.gift{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:' + rf + 'px;background:' + (dark ? '#123A22' : '#E7F5EC') + ';color:' + (dark ? '#A8E6BF' : '#1D6B3A') + ';font-size:15.5px}'
      + '.gift svg{width:24px;height:24px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.gift b{font-weight:600}'
      + '.next{margin:0;padding-left:22px;display:grid;gap:6px;text-align:left;max-width:460px}.next b{color:' + C.head + '}'
      + '.done{text-align:center;justify-items:center}.tick{width:64px;height:64px;border-radius:50%;background:' + C.fill + ';color:' + C.fillInk + ';display:grid;place-items:center;font-size:30px}'
      + '.note{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:' + rf + 'px;background:' + (dark ? '#3A1213' : '#FDECEC') + ';color:' + (dark ? '#FFB3B3' : '#B3171C') + ';font-size:15.5px}'
      + '.note svg{width:24px;height:24px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.note b{font-weight:600}'
      + '.qs{margin:0;padding-left:22px;display:grid;gap:2px}'
      + '.exs{display:grid;gap:10px}'
      + '.ex{border:1px solid ' + C.line + ';border-radius:' + rf + 'px;padding:14px 16px;display:grid;gap:10px}'
      + '.exhd{display:flex;align-items:center;gap:10px;font-weight:600;font-size:15px;color:' + C.head + '}'
      + '.exav{width:40px;height:40px;border-radius:50%;object-fit:cover;background:' + C.field + ';flex:none}'
      + '.extx{margin:0;direction:rtl;text-align:right;font-family:"IBM Plex Sans Arabic","IBM Plex Sans",sans-serif;font-size:15.5px;line-height:1.8;white-space:pre-line;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}'
      + '.ex.open .extx{display:block}'
      + '.extx mark{background:#FFF0A8;color:inherit;border-radius:3px;padding:0 2px}'
      + '.exmore{justify-self:start;border:1px solid ' + C.line + ';background:transparent;color:' + C.ink + ';border-radius:999px;padding:4px 14px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}'
      + '.exmore:hover{border-color:' + C.head + '}'
      + 'button:focus-visible{outline:2px solid #E3262B;outline-offset:2px}'
      + '@media (prefers-reduced-motion:reduce){.recbtn.on .dot{animation:none}.bar i{transition:none}}';

    root.innerHTML = '<style>' + css + '</style>'
      + '<form class="box" novalidate>'
      + '<h2>' + esc(cfg.title) + '</h2>' + (cfg.intro ? '<p class="intro">' + esc(cfg.intro) + '</p>' : '')
      + '<div class="gift">' + ic.gift + '<div><b>Your gift: free access to the Sawa App.</b> Send a good review and you get it when Sherif approves your review.</div></div>'
      + '<div class="note">' + ic.lang + '<div><b>Write your review in Arabic.</b> Most of our students read Arabic, so your story helps them more in Arabic. Voice messages and videos should be in Arabic too.'
        + '<p style="margin:8px 0 0"><b>Write it yourself, in your own words.</b> Do not use AI (like ChatGPT) to write your review. Reviews written with AI will be rejected.</p></div></div>'
      + '<div class="f"><span>A good review answers these questions:</span><ol class="qs">' + QUESTIONS.map(function (q) { return '<li style="font-weight:400">' + esc(q) + '</li>'; }).join('') + '</ol></div>'
      + (examples.length ? '<div class="f"><span>Need ideas? Read what other students wrote:</span><div class="exs">' + examples.map(function (x) {
        return '<div class="ex"><div class="exhd">' + (x.avatar ? '<img class="exav" src="' + esc(x.avatar) + '" alt="" loading="lazy">' : '') + esc(x.name) + '</div>'
          + '<p class="extx" dir="rtl">' + marks(x.text) + '</p><button type="button" class="exmore">Read all</button></div>';
      }).join('') + '</div></div>' : '')
      + '<div class="photo" data-f="photo"><span class="av" aria-hidden="true">' + ic.user + '</span>'
      + '<div class="f"><span>Your photo' + req + '</span><button type="button" class="btn2 pick-photo">' + ic.camera + '<span>Add your photo</span></button><p class="ferr"></p></div>'
      + '<input type="file" class="photo-file" accept="image/*" hidden></div>'
      + '<div class="row2"><label class="f" data-f="name"><span>Your full name' + req + '</span><input name="name" maxlength="80" autocomplete="name" placeholder="Mona Ahmed Hassan" required><p class="ferr"></p></label>'
      + '<label class="f" data-f="role"><span>Your job or studies' + req + '</span><input name="role" maxlength="120" placeholder="Nurse · or · Engineering student" required><p class="ferr"></p></label>'
      + '<label class="f" data-f="skool"><span>Your name on Skool' + req + '</span><input name="skool" maxlength="80" placeholder="Mona Ahmed" required><small>The name people see on your Skool profile.</small><p class="ferr"></p></label>'
      + '<label class="f" data-f="email"><span>Your email' + req + '</span><input name="email" type="email" maxlength="120" autocomplete="email" inputmode="email" placeholder="mona@gmail.com" required><small>We send your app login here.</small><p class="ferr"></p></label></div>'
      + '<div class="f"><span>How do you want to share?</span><div class="kinds" role="group" aria-label="How do you want to share?">'
      + '<button type="button" class="kind" data-k="text" aria-pressed="true">' + ic.text + 'Write</button>'
      + '<button type="button" class="kind" data-k="audio" aria-pressed="false">' + ic.audio + 'Voice message</button>'
      + '<button type="button" class="kind" data-k="video" aria-pressed="false">' + ic.video + 'Video</button></div></div>'
      + '<div class="panel" data-p="audio" hidden>'
      + '<div class="rec"><button type="button" class="recbtn"><span class="dot"></span><span class="rl">Start recording</span></button><span class="timer">0:00</span><span class="hint">Up to 3 minutes</span></div>'
      + '<audio class="playback" controls hidden></audio>'
      + '<span class="hint">Can\'t record here? <button type="button" class="link pick-audio">Upload a sound file</button></span>'
      + '<input type="file" class="audio-file" accept="audio/*" hidden>'
      + '</div>'
      + '<div class="panel" data-p="video" hidden>'
      + '<div class="photo"><button type="button" class="btn2 pick-video">' + ic.video + '<span>Choose or record a video</span></button><span class="hint vname">Up to ' + maxMB + ' MB</span></div>'
      + '<video class="vprev" controls playsinline hidden></video>'
      + '<input type="file" class="video-file" accept="video/*" hidden>'
      + '<label class="f">Or paste a YouTube or Loom link <small>Better for long videos</small><input name="video_url" type="url" placeholder="https://youtu.be/…" inputmode="url"></label>'
      + '</div>'
      + '<label class="f" data-f="text"><span class="tlabel">Your story (in Arabic)' + req + '</span><textarea name="text" maxlength="4000" dir="rtl" placeholder="' + esc(STORY_HINT) + '"></textarea>'
      + '<span class="wc" aria-live="polite"><span class="wcbar"><i></i></span><span class="wclbl"></span></span><p class="ferr"></p></label>'
      + '<fieldset class="rate" data-f="rating"><legend>Your rating' + req + '</legend><div class="stars">'
      + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-n="' + n + '" aria-label="' + n + ' out of 5" aria-pressed="false">' + star + '</button>'; }).join('')
      + '</div><p class="ferr"></p></fieldset>'
      + '<input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">'
      + '<div class="f" data-f="consent"><label class="chk"><input type="checkbox" name="consent"><span>' + esc(cfg.consent) + '</span></label><p class="ferr"></p></div>'
      + '<p class="err" role="alert"></p>'
      + '<div class="bar" hidden><i></i></div>'
      + '<button class="send" type="submit">' + esc(cfg.button || 'Send') + '</button>'
      + '</form>'
      + '<div class="box done" hidden><div class="tick" aria-hidden="true">✓</div><h2>' + esc(cfg.thanks) + '</h2>'
      + '<ol class="next"><li>Sherif reads your review (usually within a day).</li><li>If it\'s approved, you get an email at <b class="mail"></b> to open the Sawa App.</li><li>If it\'s too short, you get an email asking you to write a bit more.</li></ol></div>';

    var $ = function (s) { return root.querySelector(s); };
    var form = $('form'), errEl = $('.err'), send = $('.send'), opened = Date.now();
    var kind = 'text', rating = 0, photoBlob = null, audioBlob = null, audioName = '', videoFile = null;
    function err(msg) { errEl.textContent = msg || ''; }
    function fieldErr(f, msg) {
      var box = $('[data-f="' + f + '"]'); if (!box) return;
      box.classList.toggle('bad', !!msg);
      var p = box.querySelector('.ferr'); if (p) p.textContent = msg || '';
    }
    function clearErrs() { root.querySelectorAll('[data-f]').forEach(function (b) { fieldErr(b.dataset.f, ''); }); err(''); }
    form.addEventListener('input', function (e) { var b = e.target.closest('[data-f]'); if (b) fieldErr(b.dataset.f, ''); });
    form.addEventListener('change', function (e) { var b = e.target.closest('[data-f]'); if (b) fieldErr(b.dataset.f, ''); });

    function setKind(k) {
      kind = k;
      root.querySelectorAll('.kind').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)); });
      root.querySelectorAll('.panel').forEach(function (p) { p.hidden = p.dataset.p !== k; });
      $('.tlabel').innerHTML = k === 'text' ? 'Your story (in Arabic)' + req : 'Anything to add in writing? <small>(optional)</small>';
      fieldErr('text', ''); err(''); count();
    }
    $('.kinds').addEventListener('click', function (e) { var b = e.target.closest('.kind'); if (b) setKind(b.dataset.k); });

    // Live word counter for written reviews: "12 / 40 words · 28 more to go", green once it's enough.
    var MIN_WORDS = +cfg.minWords || 40;
    function words(t) { return t.trim().split(/\s+/).filter(Boolean).length; }
    function count() {
      var wc = $('.wc'), n = words($('[name=text]').value);
      wc.hidden = kind !== 'text';
      wc.classList.toggle('ok', n >= MIN_WORDS);
      wc.querySelector('i').style.width = Math.min(100, Math.round(n / MIN_WORDS * 100)) + '%';
      $('.wclbl').textContent = n >= MIN_WORDS ? n + ' words · great' : n + ' / ' + MIN_WORDS + ' words · ' + (MIN_WORDS - n) + ' more to go';
    }
    $('[name=text]').addEventListener('input', count);
    count();

    function paint() { root.querySelectorAll('.stars button').forEach(function (b) { var n = +b.dataset.n; b.classList.toggle('on', n <= rating); b.setAttribute('aria-pressed', String(n === rating)); }); }
    paint();

    root.querySelectorAll('.ex').forEach(function (c) {
      var b = c.querySelector('.exmore'), t = c.querySelector('.extx');
      function fits() { if (!c.classList.contains('open')) b.hidden = t.scrollHeight <= t.clientHeight + 2; }
      requestAnimationFrame(fits);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fits);
      b.addEventListener('click', function () { var o = c.classList.toggle('open'); b.textContent = o ? 'Show less' : 'Read all'; });
    });
    $('.stars').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { rating = +b.dataset.n; paint(); fieldErr('rating', ''); } });

    var rec = null, chunks = [], stream = null, tick = null, started = 0, LIMIT = 180;
    var recBtn = $('.recbtn'), timer = $('.timer'), playback = $('.playback');
    function showAudio(blob, name) { audioBlob = blob; audioName = name; playback.src = URL.createObjectURL(blob); playback.hidden = false; }
    function stopRec() { if (rec && rec.state === 'recording') rec.stop(); }
    recBtn.addEventListener('click', function () {
      if (rec && rec.state === 'recording') return stopRec();
      err('');
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) return err('This browser can\'t record. Upload a sound file instead.');
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s; chunks = [];
        var types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
        var type = ''; for (var i = 0; i < types.length; i++) if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(types[i])) { type = types[i]; break; }
        rec = type ? new MediaRecorder(s, { mimeType: type }) : new MediaRecorder(s);
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          var t = (rec.mimeType || type || 'audio/webm').split(';')[0];
          showAudio(new Blob(chunks, { type: t }), 'voice-message.' + (/mp4/.test(t) ? 'm4a' : /ogg/.test(t) ? 'ogg' : 'webm'));
          stream.getTracks().forEach(function (tr) { tr.stop(); });
          clearInterval(tick); recBtn.classList.remove('on'); $('.rl').textContent = 'Record again';
        };
        rec.start(); started = Date.now(); audioBlob = null; playback.hidden = true;
        recBtn.classList.add('on'); $('.rl').textContent = 'Stop recording';
        tick = setInterval(function () {
          var sec = Math.floor((Date.now() - started) / 1000);
          timer.textContent = Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
          if (sec >= LIMIT) stopRec();
        }, 250);
      }).catch(function () { err('We can\'t use your microphone. Allow the microphone in your browser, or upload a sound file.'); });
    });
    $('.pick-audio').addEventListener('click', function () { $('.audio-file').click(); });
    $('.audio-file').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      if (f.size > maxBytes) return err('This file is ' + Math.ceil(f.size / 1048576) + ' MB. The limit is ' + maxMB + ' MB.');
      err(''); showAudio(f, f.name);
    });

    $('.pick-video').addEventListener('click', function () { $('.video-file').click(); });
    $('.video-file').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      if (f.size > maxBytes) {
        videoFile = null; $('.vprev').hidden = true;
        return err('This video is ' + Math.ceil(f.size / 1048576) + ' MB. The limit is ' + maxMB + ' MB. Put it on YouTube (unlisted is fine) or Loom and paste the link below.');
      }
      err(''); videoFile = f;
      $('.vname').textContent = f.name + ' · ' + (f.size / 1048576).toFixed(1) + ' MB';
      $('.vprev').src = URL.createObjectURL(f); $('.vprev').hidden = false;
      $('.pick-video span').textContent = 'Choose another video';
    });

    $('.pick-photo').addEventListener('click', function () { $('.photo-file').click(); });
    $('.photo-file').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function () {
        var k = Math.min(1, 400 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          photoBlob = b; fieldErr('photo', '');
          $('.av').classList.add('has');
          $('.av').innerHTML = '<img alt="">'; $('.av img').src = URL.createObjectURL(b);
          $('.pick-photo span').textContent = 'Change photo';
        }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { fieldErr('photo', 'This photo won\'t open. Try a JPG or PNG.'); };
      img.src = url;
    });

    function val(n) { return (form.querySelector('[name="' + n + '"]').value || '').trim(); }
    function done() { $('.done .mail').textContent = val('email'); form.hidden = true; $('.done').hidden = false; host.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clearErrs();
      stopRec();
      var name = val('name'), role = val('role'), skool = val('skool'), email = val('email'), text = val('text'), vurl = val('video_url'), bad = [];
      if (!photoBlob) bad.push(['photo', 'Add a photo of yourself.']);
      if (!name) bad.push(['name', 'Write your name.']);
      if (!role) bad.push(['role', 'Write your job or what you study.']);
      if (!skool) bad.push(['skool', 'Write your name on Skool.']);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad.push(['email', 'Write a correct email.']);
      if (kind === 'text' && words(text) < MIN_WORDS) bad.push(['text', 'Write at least ' + MIN_WORDS + ' words. You have ' + words(text) + '.']);
      else if (kind === 'text' && !mostlyArabic(text)) bad.push(['text', 'Write your review in Arabic.']);
      if (!rating) bad.push(['rating', 'Choose your rating (1 to 5 stars).']);
      if (!form.querySelector('[name=consent]').checked) bad.push(['consent', 'Tick the box so we can use your review.']);
      bad.forEach(function (b) { fieldErr(b[0], b[1]); });
      if (kind === 'audio' && !audioBlob) return err('Record your voice message first.');
      if (kind === 'video' && !videoFile && !vurl) return err('Choose a video, or paste a YouTube or Loom link.');
      if (kind === 'video' && !videoFile && !/^https?:\/\/([a-z0-9-]+\.)*(youtube\.com|youtu\.be|loom\.com)\//i.test(vurl)) return err('The link must be from YouTube or Loom.');
      if (bad.length) { $('[data-f="' + bad[0][0] + '"]').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      if (cfg.preview) return done();

      var fd = new FormData();
      fd.append('name', name); fd.append('role', role); fd.append('skool', skool); fd.append('email', email); fd.append('text', text);
      fd.append('kind', kind); fd.append('rating', String(rating)); fd.append('consent', '1');
      fd.append('website', val('website')); fd.append('elapsed', String(Date.now() - opened));
      if (kind === 'video' && !videoFile) fd.append('video_url', vurl);
      if (kind === 'audio') fd.append('audio', audioBlob, audioName);
      if (kind === 'video' && videoFile) fd.append('video', videoFile, videoFile.name);
      fd.append('photo', photoBlob, 'photo.jpg');

      send.disabled = true; send.textContent = 'Sending…';
      var bar = $('.bar'), fill = bar.firstChild;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', cfg.endpoint);
      xhr.upload.onprogress = function (ev) { if (ev.lengthComputable && ev.total > 200000) { bar.hidden = false; fill.style.width = Math.round(ev.loaded / ev.total * 100) + '%'; } };
      function reset(msg) { send.disabled = false; send.textContent = cfg.button || 'Send'; bar.hidden = true; err(msg); }
      xhr.onload = function () {
        var res = null; try { res = JSON.parse(xhr.responseText); } catch (x) {}
        if (xhr.status >= 200 && xhr.status < 300 && res && res.ok) {
          return done();
        }
        if (xhr.status === 413) return reset('This file is too big for the website. Put the video on YouTube or Loom and paste the link.');
        reset((res && res.message) || 'Your review was not sent. Try again.');
      };
      xhr.onerror = function () { reset('Your review was not sent. Check your internet and try again.'); };
      xhr.send(fd);
    });
  }

  function boot() {
    document.querySelectorAll('.sawa-review-form').forEach(function (el) {
      if (el.dataset.ready) return;
      var data = el.nextElementSibling;
      if (!data || !data.classList.contains('sawa-form-data')) return;
      try { el.dataset.ready = '1'; renderReviewForm(el, JSON.parse(data.textContent)); }
      catch (e) { if (window.console) console.error('Sawa review form:', e); }
    });
  }
  window.SawaReviewForm = { render: renderReviewForm, boot: boot };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  if (window.jQuery) window.jQuery(window).on('elementor/frontend/init', function () { setTimeout(boot, 300); });
})();
