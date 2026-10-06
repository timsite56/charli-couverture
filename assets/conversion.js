/* ──────────────────────────────────────────────────────────────
   Charli Couverture — suivi des conversions Google Ads + formulaires.

   Pour activer le suivi : renseigner ADS_ID (AW-XXXXXXXXXX) et les
   libellés de conversion créés dans Google Ads. Tant que ADS_ID est
   vide, rien n'est envoyé à Google (les événements restent dans
   window.dataLayer, lisibles par Google Tag Manager si on l'ajoute).
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var ADS_ID = '';            // ex. 'AW-1234567890'
  var LABEL_LEAD = '';        // conversion « Formulaire de devis »
  var LABEL_CALL = '';        // conversion « Clic sur le téléphone »
  var WEB3FORMS_KEY = 'a6ffc352-1b91-4975-989e-b4e37e807f78';
  var TEL = '+33601382003', TEL_AFFICHE = '06 01 38 20 03';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  /* Consent Mode v2 : tout est refusé par défaut, le bandeau met à jour. */
  var CONSENT_KEY = 'charli_consent', choix = null;
  try { choix = localStorage.getItem(CONSENT_KEY); } catch (_) {}
  function consentement(ok) {
    var v = ok ? 'granted' : 'denied';
    return { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v };
  }
  gtag('consent', 'default', consentement(false));
  if (choix === 'oui') gtag('consent', 'update', consentement(true));

  if (ADS_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ADS_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', ADS_ID);
  }

  function conversion(label, name) {
    window.dataLayer.push({ event: name });
    if (ADS_ID && label) gtag('event', 'conversion', { send_to: ADS_ID + '/' + label });
  }

  /* Origine du visiteur : gclid / utm conservés pour la session, puis
     joints à la demande de devis — Charli voit dans l'e-mail si le contact
     vient de la publicité. */
  var ORIGINE_KEY = 'charli_origine';
  try {
    var q = new URLSearchParams(location.search), parts = [];
    ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_campaign', 'utm_term'].forEach(function (k) {
      if (q.get(k)) parts.push(k + '=' + q.get(k));
    });
    if (parts.length) sessionStorage.setItem(ORIGINE_KEY, parts.join(' · '));
  } catch (_) {}
  function origine() {
    var o = '';
    try { o = sessionStorage.getItem(ORIGINE_KEY) || ''; } catch (_) {}
    if (!o) o = document.referrer ? 'Site référent : ' + document.referrer : 'Accès direct';
    else if (/gclid|gbraid|wbraid/.test(o)) o = 'Google Ads · ' + o;
    return o + ' · page : ' + location.pathname;
  }

  document.addEventListener('DOMContentLoaded', function () {
    /* Barre d'appel mobile */
    if (!document.querySelector('.callbar') && !document.body.hasAttribute('data-no-callbar')) {
      var bar = document.createElement('div');
      bar.className = 'callbar';
      var devisHref = document.getElementById('devis') ? '#devis'
        : (document.getElementById('lead') ? '#lead' : 'index.html#devis');
      bar.innerHTML =
        '<a class="cb-call" href="tel:' + TEL + '"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 010 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>Appeler</a>' +
        '<a class="cb-devis" href="' + devisHref + '">Devis gratuit</a>';
      document.body.appendChild(bar);
    }

    /* Bandeau cookies (seulement si le suivi Google Ads est actif) */
    if (ADS_ID && !choix) {
      var cb = document.createElement('div');
      cb.className = 'cookiebar';
      cb.innerHTML = '<p>Nous utilisons des cookies Google pour mesurer l\u2019efficacité de nos annonces. <a href="mentions-legales.html">En savoir plus</a></p>' +
        '<div><button type="button" data-c="non">Refuser</button><button type="button" data-c="oui">Accepter</button></div>';
      cb.addEventListener('click', function (e) {
        var c = e.target.getAttribute && e.target.getAttribute('data-c');
        if (!c) return;
        try { localStorage.setItem(CONSENT_KEY, c); } catch (_) {}
        if (c === 'oui') gtag('consent', 'update', consentement(true));
        cb.remove();
      });
      document.body.appendChild(cb);
    }

    /* Clics sur le téléphone et WhatsApp */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.indexOf('tel:') === 0) conversion(LABEL_CALL, 'clic_telephone');
      else if (href.indexOf('wa.me') !== -1) window.dataLayer.push({ event: 'clic_whatsapp' });
    }, true);

    /* Champ « origine » dans tous les formulaires de devis */
    document.querySelectorAll('form#devisForm, form.lead-form').forEach(function (f) {
      var h = document.createElement('input');
      h.type = 'hidden'; h.name = 'origine'; h.value = origine();
      f.appendChild(h);
    });

    /* Formulaires courts des pages intérieures */
    document.querySelectorAll('form.lead-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]'), txt = btn.innerHTML;
        btn.disabled = true; btn.textContent = 'Envoi en cours…';
        var fd = new FormData(form);
        fd.set('access_key', WEB3FORMS_KEY);
        fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (!j.success) throw new Error(j.message || 'Erreur');
            location.href = 'merci.html';
          })
          .catch(function () {
            btn.disabled = false; btn.innerHTML = txt;
            alert('L’envoi n’a pas abouti. Appelez-nous directement au ' + TEL_AFFICHE + '.');
          });
      });
    });

    /* Page merci = conversion « demande de devis » */
    if (document.body.hasAttribute('data-merci')) conversion(LABEL_LEAD, 'demande_devis');
  });
})();
