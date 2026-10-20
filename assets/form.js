/* Sawa Testimonials: the student review form (written, voice message or video). */
(function () {
  function renderReviewForm(host, cfg) {
    var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    var dark = cfg.theme === 'dark';
    var accent = /^#[0-9a-f]{6}$/i.test(cfg.accent || '') ? cfg.accent : '#ae1e20';
    var maxBytes = +cfg.maxUpload || 8 * 1048576, maxMB = Math.max(1, Math.floor(maxBytes / 1048576));
    var font = 'inherit';
    if (cfg.font && cfg.font !== 'inherit') {
      font = "'" + cfg.font.replace(/'/g, '') + "', system-ui, -apple-system, 'Segoe UI', sans-serif";
      var fid = 'sawa-font-' + cfg.font.replace(/\W/g, '');
      if (!document.getElementById(fid)) {
        var l = document.createElement('link'); l.id = fid; l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=' + cfg.font.trim().replace(/\s+/g, '+') + ':wght@400;600;700&display=swap';
        document.head.appendChild(l);
      }
    }
    var C = dark
      ? { card: '#1d2127', ink: '#e8eaee', head: '#ffffff', muted: '#9ba1ab', line: 'rgba(255,255,255,.14)', field: '#14171b' }
      : { card: '#ffffff', ink: '#2a2d33', head: '#121418', muted: '#6b7079', line: 'rgba(16,24,40,.16)', field: '#f7f8fa' };
    var r = Math.max(0, Math.min(40, +cfg.radius || 0)), rf = Math.max(4, r - 6);
    var star = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"/></svg>';
    var ic = {
      text: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 17.2V20h2.8l8.3-8.3-2.8-2.8L4 17.2zM19.7 7.1a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0l-1.3 1.3 2.8 2.8 1.3-1.3z"/></svg>',
      audio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-2.1A7 7 0 0 0 19 12h-2z"/></svg>',
      video: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15 8v8H5V8h10m1-2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4V7a1 1 0 0 0-1-1z"/></svg>'
    };

    var css = ':host{display:block;--a:' + accent + ';font-family:' + font + ';color:' + C.ink + ';line-height:1.5;font-size:16px;text-align:left}'
      + '*{box-sizing:border-box}[hidden]{display:none!important}'
      + '.box{max-width:640px;margin:0 auto;background:' + C.card + ';border:1px solid ' + C.line + ';border-radius:' + r + 'px;padding:clamp(20px,4vw,32px);box-shadow:0 10px 30px -18px rgba(0,0,0,.35);display:grid;gap:18px}'
      + 'h2{margin:0;font-size:clamp(22px,3.4vw,30px);line-height:1.2;color:' + C.head + ';font-family:inherit;text-wrap:balance}'
      + '.intro{margin:-6px 0 0;color:' + C.muted + ';white-space:pre-line}'
      + '.row2{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}'
      + '.f{display:grid;gap:6px;font-weight:600;font-size:14.5px;color:' + C.head + '}'
      + '.f small,.hint{font-weight:400;color:' + C.muted + ';font-size:13px}'
      + 'input,textarea{font:inherit;color:' + C.ink + ';background:' + C.field + ';border:1px solid ' + C.line + ';border-radius:' + rf + 'px;padding:11px 13px;width:100%}'
      + 'textarea{min-height:130px;resize:vertical;unicode-bidi:plaintext}'
      + 'input:focus,textarea:focus{outline:2px solid var(--a);outline-offset:0;border-color:transparent}'
      + '.kinds{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}'
      + '.kind{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border:1.5px solid ' + C.line + ';border-radius:' + rf + 'px;background:transparent;color:' + C.ink + ';font:inherit;font-size:14px;font-weight:600;cursor:pointer;text-align:center}'
      + '.kind svg{width:24px;height:24px}.kind:hover{border-color:var(--a)}'
      + '.kind[aria-pressed="true"]{border-color:var(--a);background:color-mix(in srgb,var(--a) 14%,transparent);color:' + C.head + '}'
      + '.panel{display:grid;gap:10px;padding:16px;border-radius:' + rf + 'px;background:' + C.field + ';border:1px solid ' + C.line + '}'
      + '.rec{display:flex;align-items:center;gap:14px;flex-wrap:wrap}'
      + '.recbtn{display:inline-flex;align-items:center;gap:10px;border:0;background:var(--a);color:#fff;border-radius:999px;padding:11px 20px 11px 16px;font:inherit;font-weight:700;cursor:pointer}'
      + '.recbtn .dot{width:12px;height:12px;border-radius:50%;background:#fff}'
      + '.recbtn.on .dot{border-radius:2px;animation:pulse 1s infinite}'
      + '@keyframes pulse{50%{opacity:.35}}'
      + '.timer{font-variant-numeric:tabular-nums;font-weight:700;color:' + C.head + '}'
      + 'audio,video{width:100%;display:block;border-radius:' + rf + 'px}video{max-height:320px;background:#000}'
      + '.link{color:var(--a);text-decoration:underline;cursor:pointer;background:none;border:0;padding:0;font:inherit}'
      + '.stars{display:flex;gap:4px}.stars button{border:0;background:none;padding:2px;cursor:pointer;color:' + C.line + ';line-height:0}'
      + '.stars button.on{color:#f5a524}.stars svg{width:30px;height:30px}'
      + '.rate{border:0;padding:0;margin:0}.rate legend{font-weight:600;font-size:14.5px;color:' + C.head + ';padding:0;margin-bottom:6px}'
      + '.photo{display:flex;align-items:center;gap:12px;flex-wrap:wrap}'
      + '.av{width:52px;height:52px;border-radius:50%;background:' + C.field + ';border:1px dashed ' + C.line + ';overflow:hidden;display:grid;place-items:center;color:' + C.muted + ';flex:none}'
      + '.av img{width:100%;height:100%;object-fit:cover}.av svg{width:24px;height:24px}'
      + '.btn2{border:1px solid ' + C.line + ';background:transparent;color:' + C.ink + ';border-radius:999px;padding:8px 16px;font:inherit;font-size:14px;cursor:pointer}'
      + '.btn2:hover{border-color:var(--a)}'
      + '.hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}'
      + '.chk{display:flex;gap:10px;align-items:flex-start;font-size:14.5px;cursor:pointer}.chk input{width:18px;height:18px;margin-top:3px;accent-color:var(--a);flex:none;padding:0}'
      + '.err{color:#e5484d;font-weight:600;font-size:14px;margin:0}.err:empty{display:none}'
      + '.bar{height:8px;border-radius:99px;background:' + C.field + ';overflow:hidden}.bar i{display:block;height:100%;width:0;background:var(--a);transition:width .2s}'
      + '.send{border:0;background:var(--a);color:#fff;border-radius:999px;padding:13px 28px;font:inherit;font-weight:700;cursor:pointer;justify-self:start}'
      + '.send:hover{filter:brightness(1.1)}.send:disabled{opacity:.6;cursor:default}'
      + '.done{text-align:center;justify-items:center}.tick{width:64px;height:64px;border-radius:50%;background:var(--a);color:#fff;display:grid;place-items:center;font-size:32px}'
      + 'button:focus-visible{outline:2px solid var(--a);outline-offset:2px}'
      + '@media (prefers-reduced-motion:reduce){.recbtn.on .dot{animation:none}.bar i{transition:none}}';

    root.innerHTML = '<style>' + css + '</style>'
      + '<form class="box" novalidate>'
      + '<h2 dir="auto">' + esc(cfg.title) + '</h2>' + (cfg.intro ? '<p class="intro" dir="auto">' + esc(cfg.intro) + '</p>' : '')
      + '<div class="row2"><label class="f">Your name<input name="name" maxlength="80" autocomplete="name" dir="auto"></label>'
      + '<label class="f">About you <small>optional, e.g. “Student, B1 level”</small><input name="role" maxlength="120" dir="auto"></label></div>'
      + '<div class="f"><span>How would you like to share?</span><div class="kinds" role="group" aria-label="Review type">'
      + '<button type="button" class="kind" data-k="text" aria-pressed="true">' + ic.text + 'Write</button>'
      + '<button type="button" class="kind" data-k="audio" aria-pressed="false">' + ic.audio + 'Voice message</button>'
      + '<button type="button" class="kind" data-k="video" aria-pressed="false">' + ic.video + 'Video</button></div></div>'
      + '<div class="panel" data-p="audio" hidden>'
      + '<div class="rec"><button type="button" class="recbtn"><span class="dot"></span><span class="rl">Start recording</span></button><span class="timer">0:00</span><span class="hint">up to 3 minutes</span></div>'
      + '<audio class="playback" controls hidden></audio>'
      + '<span class="hint">Can\'t record here? <button type="button" class="link pick-audio">Upload an audio file</button></span>'
      + '<input type="file" class="audio-file" accept="audio/*" hidden>'
      + '</div>'
      + '<div class="panel" data-p="video" hidden>'
      + '<div class="photo"><button type="button" class="btn2 pick-video">Choose or record a video</button><span class="hint vname">Up to ' + maxMB + ' MB</span></div>'
      + '<video class="vprev" controls playsinline hidden></video>'
      + '<input type="file" class="video-file" accept="video/*" hidden>'
      + '<label class="f">Or paste a YouTube or Loom link <small>best for longer videos</small><input name="video_url" type="url" placeholder="https://youtu.be/…" inputmode="url"></label>'
      + '</div>'
      + '<label class="f"><span class="tlabel">Your review</span><textarea name="text" maxlength="4000" dir="auto"></textarea></label>'
      + '<fieldset class="rate"><legend>Your rating</legend><div class="stars">'
      + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-n="' + n + '" aria-label="' + n + ' star' + (n > 1 ? 's' : '') + '" aria-pressed="false">' + star + '</button>'; }).join('')
      + '</div></fieldset>'
      + '<div class="photo"><span class="av" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z"/></svg></span><button type="button" class="btn2 pick-photo">Add your photo</button><span class="hint">optional</span><input type="file" class="photo-file" accept="image/*" hidden></div>'
      + '<input name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">'
      + '<label class="chk"><input type="checkbox" name="consent"><span dir="auto">' + esc(cfg.consent) + '</span></label>'
      + '<p class="err" role="alert"></p>'
      + '<div class="bar" hidden><i></i></div>'
      + '<button class="send" type="submit">' + esc(cfg.button || 'Send') + '</button>'
      + '</form>'
      + '<div class="box done" hidden><div class="tick" aria-hidden="true">✓</div><h2 dir="auto">' + esc(cfg.thanks) + '</h2></div>';

    var $ = function (s) { return root.querySelector(s); };
    var form = $('form'), errEl = $('.err'), send = $('.send'), opened = Date.now();
    var kind = 'text', rating = 5, photoBlob = null, audioBlob = null, audioName = '', videoFile = null;
    function err(msg) { errEl.textContent = msg || ''; }

    /* type switch */
    function setKind(k) {
      kind = k;
      root.querySelectorAll('.kind').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === k)); });
      root.querySelectorAll('.panel').forEach(function (p) { p.hidden = p.dataset.p !== k; });
      $('.tlabel').textContent = k === 'text' ? 'Your review' : 'Anything you\'d like to add in writing? (optional)';
      err('');
    }
    $('.kinds').addEventListener('click', function (e) { var b = e.target.closest('.kind'); if (b) setKind(b.dataset.k); });

    /* stars */
    function paint() { root.querySelectorAll('.stars button').forEach(function (b) { var n = +b.dataset.n; b.classList.toggle('on', n <= rating); b.setAttribute('aria-pressed', String(n === rating)); }); }
    paint();
    $('.stars').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { rating = +b.dataset.n; paint(); } });

    /* voice recording */
    var rec = null, chunks = [], stream = null, tick = null, started = 0, LIMIT = 180;
    var recBtn = $('.recbtn'), timer = $('.timer'), playback = $('.playback');
    function showAudio(blob, name) {
      audioBlob = blob; audioName = name;
      playback.src = URL.createObjectURL(blob); playback.hidden = false;
    }
    function stopRec() { if (rec && rec.state === 'recording') rec.stop(); }
    recBtn.addEventListener('click', function () {
      if (rec && rec.state === 'recording') return stopRec();
      err('');
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) return err('Recording isn\'t supported in this browser. Upload an audio file instead.');
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
      }).catch(function () { err('We couldn\'t use your microphone. Allow microphone access in your browser, or upload an audio file instead.'); });
    });
    $('.pick-audio').addEventListener('click', function () { $('.audio-file').click(); });
    $('.audio-file').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      if (f.size > maxBytes) return err('That file is ' + Math.ceil(f.size / 1048576) + ' MB. The limit is ' + maxMB + ' MB.');
      err(''); showAudio(f, f.name);
    });

    /* video */
    $('.pick-video').addEventListener('click', function () { $('.video-file').click(); });
    $('.video-file').addEventListener('change', function () {
      var f = this.files[0]; if (!f) return;
      if (f.size > maxBytes) {
        videoFile = null; $('.vprev').hidden = true;
        return err('That video is ' + Math.ceil(f.size / 1048576) + ' MB, and the limit is ' + maxMB + ' MB. Upload it to YouTube (unlisted is fine) or Loom and paste the link below.');
      }
      err(''); videoFile = f;
      $('.vname').textContent = f.name + ' · ' + (f.size / 1048576).toFixed(1) + ' MB';
      $('.vprev').src = URL.createObjectURL(f); $('.vprev').hidden = false;
      $('.pick-video').textContent = 'Choose a different video';
    });

    /* photo */
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
          $('.pick-photo').textContent = 'Change photo';
        }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { err('That photo couldn\'t be read. Try a JPG or PNG.'); };
      img.src = url;
    });

    /* submit */
    function val(n) { return (form.querySelector('[name="' + n + '"]').value || '').trim(); }
    function done() { form.hidden = true; $('.done').hidden = false; host.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); err('');
      stopRec();
      var name = val('name'), text = val('text'), vurl = val('video_url');
      if (!name) return err('Please add your name.');
      if (kind === 'text' && text.length < 10) return err('Please write a few words about your experience.');
      if (kind === 'audio' && !audioBlob) return err('Please record your voice message first.');
      if (kind === 'video' && !videoFile && !vurl) return err('Please choose a video, or paste a YouTube or Loom link.');
      if (kind === 'video' && !videoFile && !/^https?:\/\/([a-z0-9-]+\.)*(youtube\.com|youtu\.be|loom\.com)\//i.test(vurl)) return err('The link should be a YouTube or Loom link.');
      if (!form.querySelector('[name=consent]').checked) return err('Please tick the box so we can share your review.');
      if (cfg.preview) return done();

      var fd = new FormData();
      fd.append('name', name); fd.append('role', val('role')); fd.append('text', text);
      fd.append('kind', kind); fd.append('rating', String(rating)); fd.append('consent', '1');
      fd.append('website', val('website')); fd.append('elapsed', String(Date.now() - opened));
      if (kind === 'video' && !videoFile) fd.append('video_url', vurl);
      if (kind === 'audio') fd.append('audio', audioBlob, audioName);
      if (kind === 'video' && videoFile) fd.append('video', videoFile, videoFile.name);
      if (photoBlob) fd.append('photo', photoBlob, 'photo.jpg');

      send.disabled = true; send.textContent = 'Sending…';
      var bar = $('.bar'), fill = bar.firstChild;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', cfg.endpoint);
      xhr.upload.onprogress = function (ev) { if (ev.lengthComputable && ev.total > 200000) { bar.hidden = false; fill.style.width = Math.round(ev.loaded / ev.total * 100) + '%'; } };
      function reset(msg) { send.disabled = false; send.textContent = cfg.button || 'Send'; bar.hidden = true; err(msg); }
      xhr.onload = function () {
        var res = null; try { res = JSON.parse(xhr.responseText); } catch (x) {}
        if (xhr.status >= 200 && xhr.status < 300 && res && res.ok) return done();
        if (xhr.status === 413) return reset('That file is too big for the website. Upload your video to YouTube or Loom and paste the link instead.');
        reset((res && res.message) || 'Your review couldn\'t be sent. Please try again.');
      };
      xhr.onerror = function () { reset('Your review couldn\'t be sent. Check your internet connection and try again.'); };
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
