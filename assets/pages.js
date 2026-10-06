/* ──────────────────────────────────────────────────────────────
   Charli Couverture — script commun aux pages intérieures.
   data/content.json reste la source unique : nom, téléphone et
   description de pied de page y sont repris.
   ────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var burger = document.getElementById('burger'),
        navLinks = document.getElementById('navLinks');
    if (burger && navLinks) {
      burger.addEventListener('click', function () { navLinks.classList.toggle('open'); });
      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { navLinks.classList.remove('open'); });
      });
    }
    var nav = document.getElementById('nav');
    function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: .12 });
    document.querySelectorAll('.fade').forEach(function (el) { obs.observe(el); });

    document.querySelectorAll('.faq-q').forEach(function (b) {
      b.addEventListener('click', function () {
        var item = b.closest('.faq-item'), a = item.querySelector('.faq-a');
        var open = item.classList.toggle('open');
        a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
      });
    });
  });

  fetch('data/content.json',{cache:'no-cache'})
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.telephone_tel) {
        document.querySelectorAll('.phone-link').forEach(function (a) { a.href = 'tel:' + d.telephone_tel; });
      }
      if (d.telephone_affiche) {
        document.querySelectorAll('.phone-text').forEach(function (s) { s.textContent = d.telephone_affiche; });
      }
      if (d.nom_entreprise) {
        var mots = d.nom_entreprise.trim().split(/\s+/);
        document.querySelectorAll('.brand-name').forEach(function (el) {
          el.innerHTML = mots.length > 1
            ? mots[0] + ' <span>' + mots.slice(1).join(' ') + '</span>'
            : d.nom_entreprise;
        });
        document.querySelectorAll('.brand-plain').forEach(function (el) { el.textContent = d.nom_entreprise; });
      }
      if (d.footer_description) {
        document.querySelectorAll('.footer-desc').forEach(function (el) { el.textContent = d.footer_description; });
      }
      if (d.annee) {
        document.querySelectorAll('.brand-annee').forEach(function (el) { el.textContent = d.annee; });
      }
    })
    .catch(function (e) { console.error('content.json :', e); });
})();
