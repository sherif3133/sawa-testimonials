/* Sawa Testimonials: the student review form (written, voice message or video). Arabic, RTL, Sawa visual identity. */
(function () {
  if (!document.getElementById('sawa-brand-fonts')) {
    var lf = document.createElement('link');
    lf.id = 'sawa-brand-fonts'; lf.rel = 'stylesheet';
    lf.href = 'https://fonts.googleapis.com/css2?family=Changa:wght@500;800&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap';
    document.head.appendChild(lf);
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
      user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>'
    };

    var css = ':host{display:block;direction:rtl;--fill:' + C.fill + ';font-family:"IBM Plex Sans Arabic",system-ui,-apple-system,"Segoe UI",sans-serif;color:' + C.ink + ';line-height:1.6;font-size:16px;text-align:right}'
      + '*{box-sizing:border-box}[hidden]{display:none!important}'
      + '.box{max-width:680px;margin:0 auto;background:' + C.card + ';border:1px solid ' + C.line + ';border-radius:' + r + 'px;padding:clamp(22px,4vw,40px);display:grid;gap:20px}'
      + 'h2{margin:0;font-family:"Changa","IBM Plex Sans Arabic",sans-serif;font-weight:800;font-size:clamp(26px,4vw,38px);line-height:1.2;color:' + C.head + ';text-wrap:balance}'
      + '.intro{margin:-8px 0 0;color:' + C.muted + ';white-space:pre-line;font-size:16.5px}'
      + '.row2{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}'
      + '.f{display:grid;gap:7px;font-weight:600;font-size:15px;color:' + C.head + '}'
      + '.f small,.hint{font-weight:400;color:' + C.muted + ';font-size:13.5px}'
      + 'input,textarea{font:inherit;color:' + C.ink + ';background:' + C.field + ';border:1px solid ' + C.line + ';border-radius:' + rf + 'px;padding:12px 14px;width:100%}'
      + 'textarea{min-height:140px;resize:vertical;unicode-bidi:plaintext}'
      + 'input:focus,textarea:focus{outline:2px solid ' + C.head + ';outline-offset:0;border-color:transparent}'
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
      + '.timer{font-variant-numeric:tabular-nums;font-weight:600;color:' + C.head + ';direction:ltr}'
      + 'audio,video{width:100%;display:block;border-radius:' + rf + 'px}video{max-height:320px;background:#0F0F10}'
      + '.link{color:' + C.head + ';text-decoration:underline;text-underline-offset:3px;cursor:pointer;background:none;border:0;padding:0;font:inherit}'
      + '.stars{display:flex;gap:4px;direction:ltr;justify-content:flex-end}.stars button{border:0;background:none;padding:2px;cursor:pointer;color:' + C.line + ';line-height:0}'
      + '.stars button.on{color:' + C.head + '}.stars svg{width:30px;height:30px}'
      + '.rate{border:0;padding:0;margin:0}.rate legend{font-weight:600;font-size:15px;color:' + C.head + ';padding:0;margin-bottom:8px}'
      + '.photo{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
      + '.av{width:54px;height:54px;border-radius:50%;background:' + C.field + ';border:1px dashed ' + C.muted + ';overflow:hidden;display:grid;place-items:center;color:' + C.muted + ';flex:none}'
      + '.av img{width:100%;height:100%;object-fit:cover}'
      + '.btn2{display:inline-flex;align-items:center;gap:8px;border:1.5px solid ' + C.line + ';background:transparent;color:' + C.ink + ';border-radius:999px;padding:9px 18px;font:inherit;font-size:15px;font-weight:600;cursor:pointer}'
      + '.btn2:hover{border-color:' + C.head + '}.btn2 svg{width:18px;height:18px}'
      + '.hp{position:absolute;clip-path:inset(50%);overflow:hidden;width:1px;height:1px;opacity:0}'
      + '.chk{display:flex;gap:10px;align-items:flex-start;font-size:15px;cursor:pointer}.chk input{width:18px;height:18px;margin-top:4px;accent-color:' + C.head + ';flex:none;padding:0}'
      + '.err{color:#E3262B;font-weight:600;font-size:15px;margin:0}.err:empty{display:none}'
      + '.bar{height:8px;border-radius:99px;background:' + C.field + ';overflow:hidden;border:1px solid ' + C.line + '}.bar i{display:block;height:100%;width:0;background:' + C.head + ';transition:width .2s;margin-inline-start:auto}'
      + '.send{border:0;background:#E3262B;color:#FFFFFF;border-radius:999px;padding:15px 32px;font:inherit;font-weight:600;font-size:17px;cursor:pointer;justify-self:start}'
      + '.send:hover{opacity:.9}.send:disabled{opacity:.6;cursor:default}'
      + '.done{text-align:center;justify-items:center}.tick{width:64px;height:64px;border-radius:50%;background:' + C.fill + ';color:' + C.fillInk + ';display:grid;place-items:center;font-size:30px}'
      + 'button:focus-visible{outline:2px solid #E3262B;outline-offset:2px}'
      + '@media (prefers-reduced-motion:reduce){.recbtn.on .dot{animation:none}.bar i{transition:none}}';

    root.innerHTML = '<style>' + css + '</style>'
      + '<form class="box" novalidate>'
      + '<h2 dir="auto">' + esc(cfg.title) + '</h2>' + (cfg.intro ? '<p class="intro" dir="auto">' + esc(cfg.intro) + '</p>' : '')
      + '<div class="row2"><label class="f">اسمك<input name="name" maxlength="80" autocomplete="name" dir="auto"></label>'
      + '<label class="f">عن نفسك <small>اختياري، مثلًا: "طالب، مستوى B1"</small><input name="role" maxlength="120" dir="auto"></label></div>'
      + '<div class="f"><span>عايز تشارك تجربتك إزاي؟</span><div class="kinds" role="group" aria-label="نوع التقييم">'
      + '<button type="button" class="kind" data-k="text" aria-pressed="true">' + ic.text + 'اكتب</button>'
      + '<button type="button" class="kind" data-k="audio" aria-pressed="false">' + ic.audio + 'رسالة صوتية</button>'
      + '<button type="button" class="kind" data-k="video" aria-pressed="false">' + ic.video + 'فيديو</button></div></div>'
      + '<div class="panel" data-p="audio" hidden>'
      + '<div class="rec"><button type="button" class="recbtn"><span class="dot"></span><span class="rl">ابدأ التسجيل</span></button><span class="timer">0:00</span><span class="hint">لحد ٣ دقايق</span></div>'
      + '<audio class="playback" controls hidden></audio>'
      + '<span class="hint">مش عارف تسجل من هنا؟ <button type="button" class="link pick-audio">ارفع ملف صوت</button></span>'
      + '<input type="file" class="audio-file" accept="audio/*" hidden>'
      + '</div>'
      + '<div class="panel" data-p="video" hidden>'
      + '<div class="photo"><button type="button" class="btn2 pick-video">' + ic.video + 'اختار أو صوّر فيديو</button><span class="hint vname">لحد ' + maxMB + ' ميجا</span></div>'
      + '<video class="vprev" controls playsinline hidden></video>'
      + '<input type="file" class="video-file" accept="video/*" hidden>'
      + '<label class="f">أو حط لينك يوتيوب أو Loom <small>أحسن للفيديوهات الطويلة</small><input name="video_url" type="url" placeholder="https://youtu.be/…" inputmode="url" dir="ltr"></label>'
      + '</div>'
      + '<label class="f"><span class="tlabel">تقييمك</span><textarea name="text" maxlength="4000" dir="auto" placeholder="احكيلنا: كنت فين، وبقيت فين؟"></textarea></label>'
      + '<fieldset class="rate"><legend>تقييمك من ٥</legend><div class="stars">'
      + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-n="' + n + '" aria-label="' + n + ' من ٥" aria-pressed="false">' + star + '</button>'; }).join('')
      + '</div></fieldset>'
      + '<div class="photo"><span class="av" aria-hidden="true">' + ic.user + '</span><button type="button" class="btn2 pick-photo">ضيف صورتك</button><span class="hint">اختياري</span><input type="file" class="photo-file" accept="image/*" hidden></div>'
      + '<input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">'
      + '<label class="chk"><input type="checkbox" name="consent"><span dir="auto">' + esc(cfg.consent) + '</span></label>'
      + '<p class="err" role="alert"></p>'
      + '<div class="bar" hidden><i></i></div>'
      + '<button class="send" type="submit">' + esc(cfg.button || 'ابعت') + '</button>'
      + '</form>'
      + '<div class="box done" hidden><div class="tick" aria-hidden="true">✓</div><h2 dir="auto">' + esc(cfg.thanks) + '</h2></div>';

    var $ = function (s) { return root.querySelector(s); };
    var form = $('form'), errEl = $('.err'), send = $('.send'), opened = Date.now();
    var kind = 'text', rating = 5, photoBlob = null, audioBlob = null, audioName = '', videoFile = null;
    function err(msg) { errEl.textContent = msg || ''; }

    function setKind(k) {
      kind = k;
      root.querySelectorAll('.kind').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)); });
      root.querySelectorAll('.panel').forEach(function (p) { p.hidden = p.dataset.p !== k; });
      $('.tlabel').textContent = k === 'text' ? 'تقييمك' : 'عايز تكتب حاجة كمان؟ (اختياري)';
      err('');
    }
    $('.kinds').addEventListener('click', function (e) { var b = e.target.closest('.kind'); if (b) setKind(b.dataset.k); });

    function paint() { root.querySelectorAll('.stars button').forEach(function (b) { var n = +b.dataset.n; b.classList.toggle('on', n <= rating); b.setAttribute('aria-pressed', String(n === rating)); }); }
    paint();
    $('.stars').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { rating = +b.dataset.n; paint(); } });

    var rec = null, chunks = [], stream = null, tick = null, started = 0, LIMIT = 180;
    var recBtn = $('.recbtn'), timer = $('.timer'), playback = $('.playback');
    function showAudio(blob, name) { audioBlob = blob; audioName = name; playback.src = URL.createObjectURL(blob); playback.hidden = false; }
    function stopRec() { if (rec && rec.state === 'recording') rec.stop(); }
    recBtn.addEventListener('click', function () {
      if (rec && rec.state === 'recording') return stopRec();
      err('');
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) return err('المتصفح ده مش بيدعم التسجيل. ارفع ملف صوت بدل كده.');
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
          clearInterval(tick); recBtn.classList.remove('on'); $('.rl').textContent = 'سجّل تاني';
        };
        rec.start(); started = Date.now(); audioBlob = null; playback.hidden = true;
        recBtn.classList.add('on'); $('.rl').textContent = 'وقّف التسجيل';
        tick = setInterval(function () {
          var sec = Math.floor((Date.now() - started) / 1000);
          timer.textContent = Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
          if (sec >= LIMIT) stopRec();
        }, 250);
      }).catch(function () { err('مقدرناش نوصل للمايك. اسمح للمتصفح يستخدم المايك، أو ارفع ملف صوت.'); });
    });
    $('.pick-audio').addEventListener('click', function () { $('.audio-file').click(); });
    $('.audio-file').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      if (f.size > maxBytes) return err('الملف ده ' + Math.ceil(f.size / 1048576) + ' ميجا، والحد الأقصى ' + maxMB + ' ميجا.');
      err(''); showAudio(f, f.name);
    });

    $('.pick-video').addEventListener('click', function () { $('.video-file').click(); });
    $('.video-file').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      if (f.size > maxBytes) {
        videoFile = null; $('.vprev').hidden = true;
        return err('الفيديو ده ' + Math.ceil(f.size / 1048576) + ' ميجا، والحد الأقصى ' + maxMB + ' ميجا. ارفعه على يوتيوب (unlisted تمام) أو Loom وحط اللينك تحت.');
      }
      err(''); videoFile = f;
      $('.vname').textContent = f.name + ' · ' + (f.size / 1048576).toFixed(1) + ' ميجا';
      $('.vprev').src = URL.createObjectURL(f); $('.vprev').hidden = false;
      $('.pick-video').lastChild.textContent = 'اختار فيديو تاني';
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
          photoBlob = b;
          $('.av').innerHTML = '<img alt="">'; $('.av img').src = URL.createObjectURL(b);
          $('.pick-photo').textContent = 'غيّر الصورة';
        }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { err('الصورة دي مش راضية تفتح. جرب JPG أو PNG.'); };
      img.src = url;
    });

    function val(n) { return (form.querySelector('[name="' + n + '"]').value || '').trim(); }
    function done() { form.hidden = true; $('.done').hidden = false; host.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); err('');
      stopRec();
      var name = val('name'), text = val('text'), vurl = val('video_url');
      if (!name) return err('اكتب اسمك.');
      if (kind === 'text' && text.length < 10) return err('اكتب كام كلمة عن تجربتك.');
      if (kind === 'audio' && !audioBlob) return err('سجّل رسالتك الصوتية الأول.');
      if (kind === 'video' && !videoFile && !vurl) return err('اختار فيديو، أو حط لينك يوتيوب أو Loom.');
      if (kind === 'video' && !videoFile && !/^https?:\/\/([a-z0-9-]+\.)*(youtube\.com|youtu\.be|loom\.com)\//i.test(vurl)) return err('اللينك لازم يكون من يوتيوب أو Loom.');
      if (!form.querySelector('[name=consent]').checked) return err('علّم على المربع عشان نقدر ننشر تقييمك.');
      if (cfg.preview) return done();

      var fd = new FormData();
      fd.append('name', name); fd.append('role', val('role')); fd.append('text', text);
      fd.append('kind', kind); fd.append('rating', String(rating)); fd.append('consent', '1');
      fd.append('website', val('website')); fd.append('elapsed', String(Date.now() - opened));
      if (kind === 'video' && !videoFile) fd.append('video_url', vurl);
      if (kind === 'audio') fd.append('audio', audioBlob, audioName);
      if (kind === 'video' && videoFile) fd.append('video', videoFile, videoFile.name);
      if (photoBlob) fd.append('photo', photoBlob, 'photo.jpg');

      send.disabled = true; send.textContent = 'بيتبعت…';
      var bar = $('.bar'), fill = bar.firstChild;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', cfg.endpoint);
      xhr.upload.onprogress = function (ev) { if (ev.lengthComputable && ev.total > 200000) { bar.hidden = false; fill.style.width = Math.round(ev.loaded / ev.total * 100) + '%'; } };
      function reset(msg) { send.disabled = false; send.textContent = cfg.button || 'ابعت'; bar.hidden = true; err(msg); }
      xhr.onload = function () {
        var res = null; try { res = JSON.parse(xhr.responseText); } catch (x) {}
        if (xhr.status >= 200 && xhr.status < 300 && res && res.ok) return done();
        if (xhr.status === 413) return reset('الملف ده أكبر من اللي الموقع يقبله. ارفع الفيديو على يوتيوب أو Loom وحط اللينك.');
        reset((res && res.message) || 'تقييمك متبعتش. جرب تاني.');
      };
      xhr.onerror = function () { reset('تقييمك متبعتش. اتأكد من النت وجرب تاني.'); };
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
