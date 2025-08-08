document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    // Seleziona tutte le sezioni di pagina (non più content-section)
    const sections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const themeSwitch = document.getElementById('theme-switch');

    // Toggle sidebar per mobile
    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }
    
    // Assegna la funzione al pulsante mobile se esiste
    if (mobileMenuBtn) {
        mobileMenuBtn.onclick = toggleSidebar;
    }

    // Gestione click sui link di navigazione
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Rimuovi classe active da tutti i link
            navLinks.forEach(l => l.classList.remove('active'));
            // Aggiungi classe active al link cliccato
            link.classList.add('active');

            // Ottieni la pagina da mostrare
            const page = link.dataset.page;
            
            // Nascondi tutte le sezioni
            sections.forEach(s => s.style.display = 'none');
            
            // Mostra la sezione target
            const targetSection = document.getElementById(`${page}-content`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }

            // Aggiorna header della pagina
            const titleText = link.querySelector('.nav-text').textContent;
            updatePageHeader(pageTitle, pageSubtitle, titleText, page);
            
            // Chiudi sidebar su mobile dopo la navigazione
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Funzione per aggiornare l'header della pagina
    function updatePageHeader(pageTitle, pageSubtitle, titleText, page) {
        // Gestione speciale per pagine con toolbar personalizzata
        if (page === 'anagrafica' || page === 'amministrazione' || page === 'registro') {
            // Nascondi titolo e sottotitolo per pagine con toolbar
            // perché hanno la loro toolbar personalizzata
            pageTitle.style.display = 'none';
            pageSubtitle.style.display = 'none';
        } else {
            // Per tutte le altre pagine, mostra titolo e sottotitolo
            pageTitle.textContent = titleText;
            pageSubtitle.textContent = `Contenuto della sezione ${titleText}.`;
            pageTitle.style.display = 'block';
            pageSubtitle.style.display = 'block';
        }
    }

    // Stato iniziale - mostra Home
    sections.forEach(s => s.style.display = 'none');
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
        homeContent.style.display = 'block';
    }
    
    // Imposta header iniziale per Home
    updatePageHeader(pageTitle, pageSubtitle, 'Home', 'home');
    
    // Gestione responsive per il pulsante menu mobile
    function checkMobileMenu() {
        if (mobileMenuBtn) {
            if (window.innerWidth <= 768) {
                mobileMenuBtn.style.display = 'block';
            } else {
                mobileMenuBtn.style.display = 'none';
                sidebar.classList.remove('open');
            }
        }
    }
    
    // Controlla al caricamento e al resize
    checkMobileMenu();
    window.addEventListener('resize', checkMobileMenu);
    
    // ============================================
    // GESTIONE TEMA
    // ============================================
    
    // Gestione switch tema
    if (themeSwitch) {
        // Imposta stato iniziale dello switch
        const currentTheme = window.MemoriaStorage ? window.MemoriaStorage.loadTheme() : 'dark';
        themeSwitch.checked = currentTheme === 'light';
        
        // Gestione cambio tema
        themeSwitch.addEventListener('change', () => {
            if (window.MemoriaStorage) {
                const newTheme = themeSwitch.checked ? 'light' : 'dark';
                window.MemoriaStorage.saveTheme(newTheme);
            }
        });
    }
});