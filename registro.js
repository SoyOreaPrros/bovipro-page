/*
 * Bovipro — formulario de registro conectado a Supabase
 * -----------------------------------------------------
 * - Se abre desde cualquier elemento con el atributo [data-registro].
 * - Valida en el cliente y crea la cuenta con Supabase Auth (signUp).
 * - Requiere cargar antes la librería de Supabase (CDN) en el HTML.
 */
(function () {
  'use strict';

  // ⚠️ Reemplaza con los datos de tu proyecto (Supabase → Project Settings → API).
  // La anon/publishable key es pública por diseño; NUNCA pongas la service_role aquí.
  var SUPABASE_URL = 'https://voooyptyzfwyudmyigyt.supabase.co/auth/v1/health';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb295cHR5emZ3eXVkbXlpZ3l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDc1NDIsImV4cCI6MjEwNjI4MzU0Mn0.3f77cBTGuLyzSB2HaMh1rf_-OEr4r639XqVq5G9h1sU';

  var sb = null;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.error('Supabase no está cargado. Agrega el <script> del CDN antes de registro.js');
  }

  var CSS = [
    '.cta[data-registro]{cursor:pointer;opacity:1;}',
    '.cta[data-registro]:hover{opacity:.85;}',
    'dialog.reg{border:1px solid var(--line,#C9BB98);border-radius:4px;background:var(--cream,#FBF8F0);',
    '  color:var(--charcoal,#241F16);padding:0;width:min(460px,calc(100vw - 32px));',
    '  max-height:calc(100vh - 32px);overflow:auto;font-family:"Inter",sans-serif;',
    '  box-shadow:0 24px 60px rgba(34,52,32,.35);}',
    'dialog.reg::backdrop{background:rgba(36,31,22,.6);}',
    '.reg-body{padding:30px 30px 26px;position:relative;}',
    '.reg-close{position:absolute;top:12px;right:14px;background:none;border:0;font-size:26px;line-height:1;',
    '  color:var(--tan-deep,#8A5D2A);cursor:pointer;padding:4px 8px;}',
    '.reg-close:hover{color:var(--forest-deep,#223420);}',
    '.reg h2{font-family:"Fraunces",serif;font-weight:500;font-size:26px;margin:0 0 4px;color:var(--forest-deep,#223420);}',
    '.reg .reg-sub{margin:0 0 20px;font-size:14.5px;color:#5c5442;line-height:1.5;}',
    '.reg-field{margin-bottom:14px;}',
    '.reg-field label{display:block;font-size:13.5px;font-weight:600;margin-bottom:5px;color:var(--charcoal,#241F16);}',
    '.reg-field input{width:100%;padding:10px 12px;font:inherit;font-size:15px;background:#fff;',
    '  border:1px solid var(--line,#C9BB98);border-radius:3px;color:var(--charcoal,#241F16);}',
    '.reg-field input:focus{outline:2px solid var(--forest,#33502F);outline-offset:1px;border-color:var(--forest,#33502F);}',
    '.reg-field input[aria-invalid="true"]{border-color:#a3391f;}',
    '.reg-err{display:block;min-height:0;margin-top:4px;font-size:12.5px;color:#a3391f;}',
    '.reg-terms{display:flex;gap:9px;align-items:flex-start;font-size:13.5px;line-height:1.45;margin:6px 0 4px;}',
    '.reg-terms input{margin-top:3px;accent-color:var(--forest,#33502F);}',
    '.reg-submit{width:100%;margin-top:16px;padding:12px 22px;border-radius:3px;border:1px solid var(--forest-deep,#223420);',
    '  background:var(--forest,#33502F);color:var(--cream,#FBF8F0);font:inherit;font-size:14.5px;font-weight:600;cursor:pointer;}',
    '.reg-submit:hover{background:var(--forest-deep,#223420);}',
    '.reg-err[data-for="general"]{text-align:center;margin-top:12px;}',
    '.reg-submit:disabled{opacity:.6;cursor:wait;}',
    '.reg-ok{text-align:center;padding:14px 0 4px;}',
    '.reg-ok .reg-check{width:52px;height:52px;margin:0 auto 14px;border-radius:50%;background:var(--forest,#33502F);',
    '  color:var(--cream,#FBF8F0);display:flex;align-items:center;justify-content:center;font-size:26px;}',
    '.reg-ok p{margin:0 0 18px;font-size:15px;line-height:1.55;}',
    '.reg-hidden{display:none;}'
  ].join('\n');

  var HTML = [
    '<div class="reg-body">',
    '  <button type="button" class="reg-close" aria-label="Cerrar">&times;</button>',
    '  <div id="reg-form-view">',
    '    <h2 id="reg-title">Crear cuenta</h2>',
    '    <p class="reg-sub">Regístrate para conocer Bovipro cuando esté disponible.</p>',
    '    <form id="reg-form" novalidate autocomplete="on">',
    '      <div class="reg-field"><label for="reg-nombre">Nombre completo</label>',
    '        <input id="reg-nombre" name="nombre" type="text" autocomplete="name" required>',
    '        <span class="reg-err" data-for="nombre" role="alert"></span></div>',
    '      <div class="reg-field"><label for="reg-email">Correo electrónico</label>',
    '        <input id="reg-email" name="email" type="email" autocomplete="email" required>',
    '        <span class="reg-err" data-for="email" role="alert"></span></div>',
    '      <div class="reg-field"><label for="reg-pass">Contraseña</label>',
    '        <input id="reg-pass" name="pass" type="password" autocomplete="new-password" minlength="8" required>',
    '        <span class="reg-err" data-for="pass" role="alert"></span></div>',
    '      <div class="reg-field"><label for="reg-pass2">Confirmar contraseña</label>',
    '        <input id="reg-pass2" name="pass2" type="password" autocomplete="new-password" required>',
    '        <span class="reg-err" data-for="pass2" role="alert"></span></div>',
    '      <label class="reg-terms"><input id="reg-terms" name="terms" type="checkbox">',
    '        <span>Acepto los términos de uso y el aviso de privacidad.</span></label>',
    '      <span class="reg-err" data-for="terms" role="alert"></span>',
    '      <button type="submit" class="reg-submit">Registrarse</button>',
    '      <span class="reg-err" data-for="general" role="alert"></span>',
    '    </form>',
    '  </div>',
    '  <div id="reg-ok-view" class="reg-ok reg-hidden">',
    '    <div class="reg-check" aria-hidden="true">&#10003;</div>',
    '    <h2>¡Cuenta creada!</h2>',
    '    <p>Gracias, <strong id="reg-ok-name"></strong>. Revisa tu correo para confirmar tu cuenta.</p>',
    '    <button type="button" class="reg-submit reg-done">Cerrar</button>',
    '  </div>',
    '</div>'
  ].join('\n');

  var dlg, form, formView, okView;

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    dlg = document.createElement('dialog');
    dlg.className = 'reg';
    dlg.setAttribute('aria-labelledby', 'reg-title');
    dlg.innerHTML = HTML;
    document.body.appendChild(dlg);

    form = dlg.querySelector('#reg-form');
    formView = dlg.querySelector('#reg-form-view');
    okView = dlg.querySelector('#reg-ok-view');

    dlg.querySelector('.reg-close').addEventListener('click', close);
    dlg.querySelector('.reg-done').addEventListener('click', close);
    // Clic en el fondo oscuro cierra el modal
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    // Al cerrarse (ESC, botón, etc.) se descarta todo lo escrito
    dlg.addEventListener('close', reset);
    form.addEventListener('submit', onSubmit);
    // Limpia el error de un campo al editarlo
    form.addEventListener('input', function (e) {
      if (e.target.name) setError(e.target.name, '');
    });
  }

  function open() {
    if (!dlg) build();
    reset();
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', ''); // respaldo para navegadores sin <dialog>
    var first = dlg.querySelector('#reg-nombre');
    if (first) first.focus();
  }

  function close() {
    if (!dlg) return;
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
    reset();
  }

  function reset() {
    if (!form) return;
    form.reset();
    ['nombre', 'email', 'pass', 'pass2', 'terms', 'general'].forEach(function (n) { setError(n, ''); });
    formView.classList.remove('reg-hidden');
    okView.classList.add('reg-hidden');
  }

  function setError(name, msg) {
    var span = form.querySelector('.reg-err[data-for="' + name + '"]');
    var input = form.elements[name];
    if (span) span.textContent = msg;
    if (input && input.type !== 'checkbox') input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function onSubmit(e) {
    e.preventDefault(); // nunca se envía nada a ningún lado
    var f = form.elements;
    var nombre = f.nombre.value.trim();
    var email = f.email.value.trim();
    var pass = f.pass.value;
    var pass2 = f.pass2.value;
    var ok = true;
    var firstBad = null;

    function fail(name, msg) {
      setError(name, msg);
      ok = false;
      if (!firstBad) firstBad = f[name];
    }

    if (nombre.length < 3) fail('nombre', 'Escribe tu nombre completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail('email', 'Ingresa un correo válido.');
    if (pass.length < 8) fail('pass', 'Mínimo 8 caracteres.');
    if (pass2 !== pass || !pass2) fail('pass2', 'Las contraseñas no coinciden.');
    if (!f.terms.checked) fail('terms', 'Debes aceptar los términos para continuar.');

    if (!ok) { firstBad.focus(); return; }

    if (!sb) {
      setError('general', 'No se pudo conectar con el servidor. Intenta más tarde.');
      return;
    }

    var submitBtn = form.querySelector('.reg-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando cuenta…';
    setError('general', '');

    // Crea el usuario en Supabase Auth; el nombre se guarda en user_metadata
    sb.auth.signUp({
      email: email,
      password: pass,
      options: { data: { nombre: nombre } }
    }).then(function (res) {
      if (res.error) {
        setError('general', traducirError(res.error));
        return;
      }
      okView.querySelector('#reg-ok-name').textContent = nombre.split(/\s+/)[0];
      form.reset();
      formView.classList.add('reg-hidden');
      okView.classList.remove('reg-hidden');
      okView.querySelector('.reg-done').focus();
    }).catch(function () {
      setError('general', 'Error de conexión. Intenta de nuevo.');
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Registrarse';
    });
  }

  function traducirError(err) {
    var m = (err.message || '').toLowerCase();
    if (m.indexOf('already registered') !== -1) return 'Este correo ya está registrado.';
    if (m.indexOf('password') !== -1) return 'La contraseña no cumple los requisitos.';
    if (m.indexOf('rate limit') !== -1) return 'Demasiados intentos. Espera unos minutos.';
    return 'No se pudo crear la cuenta. Intenta de nuevo.';
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-registro]');
    if (btn) { e.preventDefault(); open(); }
  });
})();
