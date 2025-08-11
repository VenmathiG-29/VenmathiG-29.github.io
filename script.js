/* -----------------------
   Small JS glue for:
   - theme toggle (persistent)
   - mobile nav toggle
   - modal open/close for post reading
   - reading progress bar
   - scroll-to-top button
   - animated staggered entry for posts
   ------------------------*/

(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = localStorage.getItem('aurora-theme');
  const mobileBtn = document.getElementById('mobileNavBtn');
  const primaryNav = document.getElementById('primaryNav');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const closeModal = document.getElementById('closeModal');
  const openLinks = document.querySelectorAll('[data-open]');
  const posts = Array.from(document.querySelectorAll('.post-card'));
  const progress = document.getElementById('readingProgress');
  const scrollTopBtn = document.getElementById('scrollTop');

  /* ---------------- theme ---------------- */
  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    localStorage.setItem('aurora-theme', theme);
    themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'false' : 'true');
  }

  if(storedTheme){
    applyTheme(storedTheme);
  } else {
    // use system preference default
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const cur = root.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'light' ? 'dark' : 'light');
  });

  /* ---------------- mobile nav ---------------- */
  mobileBtn.addEventListener('click', () => {
    const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
    mobileBtn.setAttribute('aria-expanded', String(!expanded));
    primaryNav.classList.toggle('open');
    mobileBtn.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
  });

  // close mobile nav when a nav item is clicked (small screens)
  primaryNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if(primaryNav.classList.contains('open')){
      primaryNav.classList.remove('open');
      mobileBtn.setAttribute('aria-expanded','false');
    }
  }));

  /* ---------------- modal reading ---------------- */
  function openModal(title, content){
    modalTitle.textContent = title;
    modalContent.textContent = content;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    // focus close
    closeModal.focus();
  }
  function closeModalFn(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }

  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = e.target.closest('.post-card');
      if(!card) return;
      openModal(card.dataset.title, card.dataset.content);
    });
  });

  closeModal.addEventListener('click', closeModalFn);
  modal.addEventListener('click', (e) => { if(e.target === modal) closeModalFn(); });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeModalFn();
  });

  // allow Enter/Space on card to open
  posts.forEach(card => {
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const link = card.querySelector('[data-open]');
        if(link) link.click();
      }
    });
  });

  /* ---------------- reading progress ---------------- */
  function updateProgress(){
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / (docH || 1)) * 100;
    progress.style.width = scrolled + '%';
  }
  window.addEventListener('scroll', () => {
    updateProgress();
    // show scroll-top button after 300px
    if(window.scrollY > 300) scrollTopBtn.classList.add('show'); else scrollTopBtn.classList.remove('show');
  }, {passive:true});
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------------- scroll to top ---------------- */
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({top:0,behavior:'smooth'});
  });

  /* ---------------- staggered load animation for posts ---------------- */
  // use CSS variable --delay to stagger
  posts.forEach((p, i) => {
    const delay = 80 * i; // ms
    p.style.setProperty('--delay', `${delay}ms`);
    // small timeout to allow CSS to animate from initial state
    window.setTimeout(() => p.classList.add('loaded'), 60 + delay);
  });

  /* ---------------- small A11Y & enhancements ---------------- */
  // make mobile nav close with Escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      if(primaryNav.classList.contains('open')){
        primaryNav.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded','false');
      }
      closeModalFn();
    }
  });

  // simple announce for subscribe/demo actions (if you add buttons)
  // you're free to extend with real subscribe logic

})();
