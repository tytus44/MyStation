/* ========== APPLICAZIONE PRINCIPALE - MYSTATION DASHBOARD ========== */

// INIZIALIZZAZIONE E GESTIONE DEL DOM
document.addEventListener('DOMContentLoaded', function () {

    // GESTIONE TEMA SCURO/CHIARO
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);

        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

        localStorage.setItem('theme', newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    themeToggle.querySelector('i').className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

    // GESTIONE MODAL ABOUT (CLICK SU LOGO)
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
        logoContainer.addEventListener('click', () => showModal('about-modal'));
        logoContainer.style.cursor = 'pointer';
    }

    // SIDEBAR MOBILE
    const sidebar = document.getElementById('sidebar');
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 &&
            !sidebar.contains(e.target) &&
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) sidebar.classList.remove('open');
    });

    // NAVIGAZIONE PAGINE
    const navLinks = document.querySelectorAll('.nav-link');
    const contentArea = document.getElementById('content-area');

    console.log('🔍 Link navigazione trovati:', navLinks.length);

    navLinks.forEach((link, index) => {
        const navTextElement = link.querySelector('.nav-text');
        if (!navTextElement) {
            console.error('❌ Elemento .nav-text non trovato in link:', index);
            return;
        }
        
        const navText = navTextElement.textContent.toLowerCase().trim();
        console.log(`🔗 Setup link ${index}: "${navText}"`);
        
        link.setAttribute('data-page', navText);
        
        // Rimuovi listener precedenti se esistenti
        link.removeEventListener('click', handleNavClick);
        
        // Aggiungi nuovo listener
        function handleNavClick(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Click su navigazione:', navText);
            
            // Rimuovi active da tutti i link
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Aggiungi active al link cliccato
            link.classList.add('active');
            
            // Chiama cambio pagina
            changePageContent(navText);
            
            // Chiudi sidebar mobile se aperta
            if (window.innerWidth <= 1024) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) sidebar.classList.remove('open');
            }
        }
        
        link.addEventListener('click', handleNavClick);
    });

    // GESTIONE CAMBIO PAGINA E HEADER CONTROLS
    function changePageContent(page) {
        console.log('🔄 Cambio pagina verso:', page);
        
        // STEP 1: Nascondi TUTTE le sezioni prima di mostrare quella richiesta
        document.querySelectorAll('.page-content').forEach(content => {
            content.classList.add('hidden');
            console.log('🔒 Nascosto:', content.id);
        });
        
        const header = document.querySelector('.header');
        const rubricaControls = document.getElementById('rubrica-header-controls');
        const caricoControls = document.getElementById('carico-header-controls');

        // STEP 2: Gestisci header e controlli
        if (page === 'home') {
            header?.classList.add('hidden');
            console.log('🏠 Header nascosto per home');
        } else {
            header?.classList.remove('hidden');
            console.log('📋 Header mostrato per:', page);
            
            // Nascondi TUTTI i controlli header prima
            if (rubricaControls) {
                rubricaControls.classList.add('hidden');
                console.log('📋 Controlli rubrica nascosti');
            }
            if (caricoControls) {
                caricoControls.classList.add('hidden');
                console.log('🚛 Controlli carico nascosti');
            }
            
            // Mostra solo i controlli per la pagina corrente
            if (page === 'rubrica' && rubricaControls) {
                rubricaControls.classList.remove('hidden');
                console.log('✅ Controlli rubrica mostrati');
            } else if (page === 'carico' && caricoControls) {
                caricoControls.classList.remove('hidden');
                console.log('✅ Controlli carico mostrati');
            }
        }

        // STEP 3: Mostra SOLO la sezione richiesta
        const targetPageId = `${page}-content`;
        const pageContent = document.getElementById(targetPageId);
        
        console.log('🔍 Cercando elemento:', targetPageId);
        
        if (pageContent) {
            pageContent.classList.remove('hidden');
            console.log('✅ Mostrato contenuto:', targetPageId);
            
            // STEP 4: Inizializzazione specifica per sezione
            if (page === 'rubrica') {
                console.log('📋 Inizializzazione rubrica...');
                initRubricaFunctionality();
            } else if (page === 'carico') {
                console.log('🚛 Inizializzazione carico...');
                
                // Assicurati che la funzione carico sia disponibile
                if (typeof window.initCaricoFunctionality === 'function') {
                    window.initCaricoFunctionality();
                    console.log('✅ Carico inizializzato');
                } else {
                    console.error('❌ initCaricoFunctionality non disponibile');
                    console.log('🔍 Funzioni window disponibili:', Object.keys(window).filter(k => k.includes('carico') || k.includes('Carico')));
                }
                
                // Debug per verificare che la sezione sia effettivamente visibile
                setTimeout(() => {
                    const isVisible = !pageContent.classList.contains('hidden');
                    console.log('🔍 Sezione carico visibile dopo 100ms:', isVisible);
                    
                    // Controlla se ci sono altre sezioni visibili
                    const visibleSections = document.querySelectorAll('.page-content:not(.hidden)');
                    console.log('🔍 Sezioni visibili:', Array.from(visibleSections).map(s => s.id));
                }, 100);
            }
            
        } else {
            console.error('❌ ERRORE: Elemento pagina non trovato:', targetPageId);
            
            // Debug: mostra tutti gli elementi page-content disponibili
            const allPageContents = document.querySelectorAll('.page-content');
            console.log('🔍 Elementi page-content disponibili:', Array.from(allPageContents).map(el => ({
                id: el.id,
                classes: el.className,
                hidden: el.classList.contains('hidden')
            })));
        }
    }

    // GESTIONE MODALI
    function showModal(modalId, msg = null) {
        if (msg && modalId === 'success-modal') {
            const msgElement = document.getElementById('success-message');
            if (msgElement) msgElement.textContent = msg;
        }
        document.getElementById('modal-overlay')?.classList.add('active');
        document.getElementById(modalId)?.classList.add('active');
    }
    
    function closeModal(modalId) {
        document.getElementById(modalId)?.classList.remove('active');
        document.getElementById('modal-overlay')?.classList.remove('active');
    }
    
    function showConfirmModal(msg, onConfirm) {
        const confirmMessage = document.getElementById('confirm-message');
        if (confirmMessage) confirmMessage.textContent = msg;
        
        const confirmBtn = document.getElementById('confirm-action');
        if (confirmBtn) {
            const newBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
            newBtn.addEventListener('click', () => { 
                closeModal('confirm-modal'); 
                onConfirm(); 
            });
        }
        showModal('confirm-modal');
    }

    // GESTIONE RUBRICA - VARIABILI GLOBALI
    let clientsData = [];
    let rubricaInitialized = false;

    // FUNZIONI STORAGE RUBRICA
    function saveClientsToStorage() {
        localStorage.setItem('mystation_clients', JSON.stringify(clientsData));
        updateContactsCounter();
    }

    function loadClientsFromStorage() {
        const stored = localStorage.getItem('mystation_clients');
        if (stored) {
            try {
                clientsData = JSON.parse(stored);
                renderClients();
                updateContactsCounter();
            } catch (e) {
                console.error('Errore caricamento contatti:', e);
                clientsData = [];
            }
        }
    }

    function updateContactsCounter() {
        const counter = document.getElementById('total-contacts');
        if (counter) counter.textContent = clientsData.length;
    }

    // RENDERING RUBRICA
    function renderClients() {
        const grid = document.getElementById('clients-grid');
        if (!grid) return;

        grid.innerHTML = '';
        
        if (!clientsData.length) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                    <i class="fas fa-address-book" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Nessun contatto</h3>
                    <p style="margin-bottom: 2rem;">Inizia aggiungendo il tuo primo contatto</p>
                    <button class="btn" onclick="openAddClientModal()">
                        <i class="fas fa-user-plus"></i> Aggiungi Contatto
                    </button>
                </div>
            `;
            return;
        }

        // Ordina i contatti alfabeticamente per nome
        const sortedClients = [...clientsData].sort((a, b) => {
            return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'it', { 
                numeric: true, 
                sensitivity: 'base' 
            });
        });
        
        console.log('📋 Rendering contatti ordinati alfabeticamente:', sortedClients.length);

        sortedClients.forEach((client, index) => {
            const card = createClientCard(client, index);
            grid.appendChild(card);
        });
    }

    // CREAZIONE CARD CLIENTE - NUOVA VERSIONE SENZA MODALE
    function createClientCard(client, index = 0) {
        const card = document.createElement('div');
        card.className = 'client-card-simple';
        
        // Array di colori per le icone (come i box stats nella home)
        const iconColors = [
            { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }, // primary
            { bg: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }, // secondary  
            { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }, // accent
            { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }, // success
            { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }, // violet
            { bg: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }, // pink
            { bg: 'rgba(20, 184, 166, 0.1)', color: '#14b8a6' }, // teal
            { bg: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' }, // orange
        ];
        
        const colorScheme = iconColors[index % iconColors.length];
        
        // Usa sempre l'icona user per tutte le card
        const icon = 'fas fa-user';
        
        card.innerHTML = `
            <div class="client-card-header-simple">
                <div class="client-card-icon-simple" style="background: ${colorScheme.bg}; color: ${colorScheme.color};">
                    <i class="${icon}"></i>
                </div>
                <div class="client-card-name-section">
                    <div class="client-name-simple">${client.name}</div>
                    ${client.organization ? `<div class="client-org-simple">${client.organization}</div>` : ''}
                </div>
                <button class="edit-client-btn" onclick="openEditClientModal(${JSON.stringify(client).replace(/"/g, '&quot;')})" title="Modifica">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <div class="client-card-details">
                <div class="client-detail-item ${client.phone ? '' : 'empty-detail'}">
                    <i class="fas fa-phone"></i>
                    <span>${client.phone || 'Non specificato'}</span>
                </div>
                <div class="client-detail-item ${client.email ? '' : 'empty-detail'}">
                    <i class="fas fa-envelope"></i>
                    <span>${client.email || 'Non specificato'}</span>
                </div>
                ${!card.innerHTML.includes('client-org-simple') ? `
                <div class="client-detail-item ${client.organization ? '' : 'empty-detail'}">
                    <i class="fas fa-building"></i>
                    <span>${client.organization || 'Non specificato'}</span>
                </div>` : ''}
                <div class="client-detail-item ${client.notes ? '' : 'empty-detail'}">
                    <i class="fas fa-sticky-note"></i>
                    <span>${client.notes || 'Nessuna nota'}</span>
                </div>
            </div>
        `;
        
        return card;
    }

    // MODAL ADD / EDIT CLIENT
    let currentEditingClient = null;
    
    function openAddClientModal() {
        ['add-name', 'add-phone', 'add-email', 'add-organization', 'add-notes'].forEach(id => { 
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        showModal('add-client-modal');
    }
    
    function saveNewClient() {
        const nameElement = document.getElementById('add-name');
        if (!nameElement) return;
        
        const name = nameElement.value.trim();
        if (!name) return showModal('success-modal', 'Nome richiesto');
        if (clientsData.some(c => c.name.toLowerCase() === name.toLowerCase()))
            return showModal('success-modal', 'Contatto già esistente');
            
        clientsData.push({
            name,
            phone: document.getElementById('add-phone')?.value.trim() || '',
            email: document.getElementById('add-email')?.value.trim() || '',
            organization: document.getElementById('add-organization')?.value.trim() || '',
            notes: document.getElementById('add-notes')?.value.trim() || ''
        });
        saveClientsToStorage();
        renderClients();
        closeModal('add-client-modal');
        showModal('success-modal', `${name} aggiunto`);
    }
    
    // MODIFICA CLIENT CON CONTROLLI NULL
    function openEditClientModal(client) {
        currentEditingClient = client;
        
        // Controlli null per evitare errori
        const editName = document.getElementById('edit-name');
        const editPhone = document.getElementById('edit-phone');
        const editEmail = document.getElementById('edit-email');
        const editOrg = document.getElementById('edit-organization');
        const editNotes = document.getElementById('edit-notes');
        
        if (editName) editName.value = client.name || '';
        if (editPhone) editPhone.value = client.phone || '';
        if (editEmail) editEmail.value = client.email || '';
        if (editOrg) editOrg.value = client.organization || '';
        if (editNotes) editNotes.value = client.notes || '';
        
        showModal('edit-client-modal');
    }
    
    function saveClientChanges() {
        const nameElement = document.getElementById('edit-name');
        if (!nameElement) return;
        
        const name = nameElement.value.trim();
        if (!name) return showModal('success-modal', 'Nome richiesto');
        
        const idx = clientsData.findIndex(c => c.name === currentEditingClient.name);
        if (idx > -1) {
            clientsData[idx] = {
                name,
                phone: document.getElementById('edit-phone')?.value.trim() || '',
                email: document.getElementById('edit-email')?.value.trim() || '',
                organization: document.getElementById('edit-organization')?.value.trim() || '',
                notes: document.getElementById('edit-notes')?.value.trim() || ''
            };
            saveClientsToStorage();
            renderClients();
            closeModal('edit-client-modal');
            showModal('success-modal', `${name} modificato`);
        }
    }

    // ELIMINA CONTATTO DAL MODALE DI MODIFICA
    function deleteClientFromEdit() {
        if (!currentEditingClient) return;
        
        closeModal('edit-client-modal');
        
        showConfirmModal(`Eliminare ${currentEditingClient.name}?`, () => {
            const idx = clientsData.findIndex(c => c.name === currentEditingClient.name);
            if (idx > -1) {
                clientsData.splice(idx, 1);
                saveClientsToStorage();
                renderClients();
                showModal('success-modal', `${currentEditingClient.name} eliminato`);
                currentEditingClient = null;
            }
        });
    }

    // ELIMINA CONTATTO
    function deleteClient(client) {
        showConfirmModal(`Eliminare ${client.name}?`, () => {
            const idx = clientsData.findIndex(c => c.name === client.name);
            if (idx > -1) {
                clientsData.splice(idx, 1);
                saveClientsToStorage();
                renderClients();
                showModal('success-modal', `${client.name} eliminato`);
            }
        });
    }

    // BULK EDIT
    function openBulkEditModal() {
        if (!clientsData.length) return showModal('success-modal', 'Nessun contatto');
        const bulkOrgElement = document.getElementById('bulk-organization');
        if (bulkOrgElement) bulkOrgElement.value = '';
        populateClientsSelection();
        showModal('bulk-edit-modal');
    }
    
    function populateClientsSelection() {
        const container = document.getElementById('clients-selection');
        if (!container) return;
        container.innerHTML = '';
        clientsData.forEach((client, idx) => {
            const div = document.createElement('div');
            div.className = 'client-selection-item';
            div.innerHTML = `<input type="checkbox" class="client-selection-checkbox" data-index="${idx}">
                             <div class="client-selection-name">${client.name}</div>
                             <div class="client-selection-info">${client.organization || ''}</div>`;
            container.appendChild(div);
        });
    }
    
    function saveBulkEdit() {
        const checked = [...document.querySelectorAll('.client-selection-checkbox:checked')];
        if (!checked.length) return showModal('success-modal', 'Seleziona almeno un contatto');
        
        const orgElement = document.getElementById('bulk-organization');
        const org = orgElement ? orgElement.value.trim() : '';
        let changed = 0;
        
        checked.forEach(cb => {
            const idx = Number(cb.dataset.index);
            if (org && clientsData[idx]) { 
                clientsData[idx].organization = org; 
                changed++; 
            }
        });
        
        if (changed > 0) {
            saveClientsToStorage();
            renderClients();
            closeModal('bulk-edit-modal');
            showModal('success-modal', `${changed} contatti modificati`);
        }
    }

    // RICERCA SEMPLICE
    function filterClients(term) {
        document.querySelectorAll('.client-card-simple').forEach(card => {
            const name = card.querySelector('.client-name-simple').textContent.toLowerCase();
            const org = card.querySelector('.client-org-simple')?.textContent.toLowerCase() || '';
            const contactDetails = Array.from(card.querySelectorAll('.client-detail-item span'))
                .map(span => span.textContent.toLowerCase()).join(' ');
            
            const isVisible = name.includes(term) || org.includes(term) || contactDetails.includes(term);
            card.style.display = isVisible ? 'block' : 'none';
        });
    }

    // IMPORT/EXPORT VCARD
    function importVCardFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.vcf';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const vcardText = e.target.result;
                    const contacts = parseVCard(vcardText);
                    if (contacts.length) {
                        clientsData.push(...contacts);
                        saveClientsToStorage();
                        renderClients();
                        showModal('success-modal', `${contacts.length} contatti importati`);
                    } else {
                        showModal('success-modal', 'Nessun contatto valido trovato');
                    }
                } catch (err) {
                    showModal('success-modal', 'Errore durante l\'importazione');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    function parseVCard(vcardText) {
        const contacts = [];
        const vcards = vcardText.split('BEGIN:VCARD');
        
        vcards.forEach(vcard => {
            if (!vcard.trim()) return;
            
            const lines = vcard.split('\n');
            const contact = { name: '', phone: '', email: '', organization: '', notes: '' };
            
            lines.forEach(line => {
                const cleanLine = line.trim();
                if (cleanLine.startsWith('FN:')) {
                    contact.name = cleanLine.substring(3);
                } else if (cleanLine.startsWith('TEL:')) {
                    contact.phone = cleanLine.substring(4);
                } else if (cleanLine.startsWith('EMAIL:')) {
                    contact.email = cleanLine.substring(6);
                } else if (cleanLine.startsWith('ORG:')) {
                    contact.organization = cleanLine.substring(4);
                } else if (cleanLine.startsWith('NOTE:')) {
                    contact.notes = cleanLine.substring(5);
                }
            });
            
            if (contact.name && !clientsData.some(c => c.name === contact.name)) {
                contacts.push(contact);
            }
        });
        
        return contacts;
    }

    function exportToVCard() {
        if (!clientsData.length) return showModal('success-modal', 'Nessun contatto da esportare');
        
        let vcardContent = '';
        clientsData.forEach(client => {
            vcardContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${client.name}\n`;
            if (client.phone) vcardContent += `TEL:${client.phone}\n`;
            if (client.email) vcardContent += `EMAIL:${client.email}\n`;
            if (client.organization) vcardContent += `ORG:${client.organization}\n`;
            if (client.notes) vcardContent += `NOTE:${client.notes}\n`;
            vcardContent += `END:VCARD\n`;
        });
        
        const blob = new Blob([vcardContent], { type: 'text/vcard' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `contatti_mystation_${new Date().toISOString().split('T')[0]}.vcf`;
        link.click();
        
        showModal('success-modal', `${clientsData.length} contatti esportati`);
    }

    // INIZIALIZZAZIONE RUBRICA
    function initRubricaFunctionality() {
        if (rubricaInitialized) return;
        rubricaInitialized = true;
        console.log('📋 Inizializzazione rubrica...');
        loadClientsFromStorage();

        // Event listeners controlli rubrica
        const addClientBtn = document.getElementById('add-client-btn');
        if (addClientBtn) addClientBtn.addEventListener('click', openAddClientModal);
        
        const bulkEditBtn = document.getElementById('bulk-edit-btn');
        if (bulkEditBtn) bulkEditBtn.addEventListener('click', openBulkEditModal);
        
        const importBtn = document.getElementById('import-clients-btn');
        if (importBtn) importBtn.addEventListener('click', importVCardFile);
        
        const exportBtn = document.getElementById('export-clients-btn');
        if (exportBtn) exportBtn.addEventListener('click', exportToVCard);
        
        const clearAllBtn = document.getElementById('clear-all-btn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => showConfirmModal('Eliminare TUTTA la rubrica?', () => {
                clientsData = [];
                localStorage.removeItem('mystation_clients');
                renderClients();
                showModal('success-modal', 'Rubrica eliminata');
            }));
        }

        // Ricerca contatti
        const clientSearch = document.getElementById('client-search');
        const searchClear = document.getElementById('search-clear');
        
        if (clientSearch) {
            clientSearch.addEventListener('input', (e) => {
                filterClients(e.target.value.toLowerCase());
                if (searchClear) {
                    searchClear.style.display = e.target.value ? 'block' : 'none';
                }
            });
        }
        
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                if (clientSearch) clientSearch.value = '';
                filterClients('');
                searchClear.style.display = 'none';
            });
        }

        console.log('✅ Rubrica inizializzata con successo');
    }

    // INIZIALIZZAZIONE FINALE
    console.log('🚀 Avvio inizializzazione MyStation...');
    
    // Inizializza subito la rubrica (sarà un no-op se già inizializzata)
    initRubricaFunctionality();
    
    // Inizializza la pagina home
    changePageContent('home');
    
    // Inizializza il carico se disponibile
    if (window.initCaricoFunctionality) {
        console.log('🚛 Inizializzazione carico globale...');
        window.initCaricoFunctionality();
    } else {
        console.warn('⚠️ initCaricoFunctionality non disponibile al caricamento');
    }
    
    // Esposizione funzioni globali
    window.closeModal = closeModal;
    window.showModal = showModal;
    window.showConfirmModal = showConfirmModal;
    window.openAddClientModal = openAddClientModal;
    window.saveNewClient = saveNewClient;
    window.openEditClientModal = openEditClientModal;
    window.saveClientChanges = saveClientChanges;
    window.saveBulkEdit = saveBulkEdit;
    window.deleteClient = deleteClient;
    window.deleteClientFromEdit = deleteClientFromEdit;
    window.initRubricaFunctionality = initRubricaFunctionality;
    
    console.log('🚀 MyStation inizializzato con successo');
});