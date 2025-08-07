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
        
        // MODIFICA: Usa il data-page esistente invece di sovrascriverlo con il testo
        const existingDataPage = link.getAttribute('data-page');
        const navText = navTextElement.textContent.toLowerCase().trim();
        
        // Se esiste già un data-page, mantienilo, altrimenti usa il testo
        const pageId = existingDataPage || navText;
        
        console.log(`🔗 Setup link ${index}: "${navText}" -> data-page: "${pageId}"`);
        
        // Imposta o mantieni il data-page
        if (!existingDataPage) {
            link.setAttribute('data-page', pageId);
        }
        
        // Rimuovi listener precedenti se esistenti
        link.removeEventListener('click', handleNavClick);
        
        // Aggiungi nuovo listener
        function handleNavClick(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🖱️ Click su navigazione:', navText, '-> pagina:', pageId);
            
            // Rimuovi active da tutti i link
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Aggiungi active al link cliccato
            link.classList.add('active');
            
            // Chiama cambio pagina con il data-page corretto
            changePageContent(pageId);
            
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
        const amministrazioneControls = document.getElementById('note-header-controls');
        const creditiControls = document.getElementById('crediti-header-controls');

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
            if (amministrazioneControls) {
                amministrazioneControls.classList.add('hidden');
                console.log('📊 Controlli amministrazione nascosti');
            }
            if (creditiControls) {
                creditiControls.classList.add('hidden');
                console.log('💳 Controlli crediti nascosti');
            }
            
            // Mostra solo i controlli per la pagina corrente
            if (page === 'rubrica' && rubricaControls) {
                rubricaControls.classList.remove('hidden');
                console.log('✅ Controlli rubrica mostrati');
            } else if (page === 'carico' && caricoControls) {
                caricoControls.classList.remove('hidden');
                console.log('✅ Controlli carico mostrati');
            } else if (page === 'note' && amministrazioneControls) {
                amministrazioneControls.classList.remove('hidden');
                console.log('✅ Controlli amministrazione mostrati');
            } else if (page === 'crediti' && creditiControls) {
                creditiControls.classList.remove('hidden');
                console.log('✅ Controlli crediti mostrati');
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
            } else if (page === 'note') {
                console.log('📊 Inizializzazione amministrazione...');
                initAmministrazioneFunctionality();
            } else if (page === 'crediti') {
                console.log('💳 Inizializzazione crediti...');
                if (typeof window.initAmministrazioneCrediti === 'function') {
                    window.initAmministrazioneCrediti();
                    console.log('✅ Crediti inizializzati');
                }
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

    // GESTIONE AMMINISTRAZIONE - VARIABILI GLOBALI
    let amministrazioneData = [];
    let filteredAmministrazioneData = [];
    let amministrazioneInitialized = false;
    let currentEditingAmministrazione = null;

    // FUNZIONI STORAGE AMMINISTRAZIONE
    function saveAmministrazioneToStorage() {
        try {
            localStorage.setItem('mystation_amministrazione', JSON.stringify(amministrazioneData));
            console.log('💾 Dati amministrazione salvati:', amministrazioneData.length, 'operazioni');
            return true;
        } catch (error) {
            console.error('❌ Errore salvataggio amministrazione:', error);
            showModal('success-modal', 'Errore nel salvataggio: ' + error.message);
            return false;
        }
    }

    function loadAmministrazioneFromStorage() {
        try {
            const stored = localStorage.getItem('mystation_amministrazione');
            console.log('📂 Tentativo caricamento da localStorage...');
            
            if (stored) {
                const parsedData = JSON.parse(stored);
                if (Array.isArray(parsedData)) {
                    amministrazioneData = parsedData;
                    // Ordina per data (più recenti prima)
                    amministrazioneData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    console.log('✅ Dati amministrazione caricati dal localStorage:', amministrazioneData.length, 'operazioni');
                    return true;
                } else {
                    console.warn('⚠️ Dati localStorage non sono un array, inizializzazione vuota');
                    amministrazioneData = [];
                    return false;
                }
            } else {
                console.log('📭 Nessun dato nel localStorage, inizializzazione vuota');
                amministrazioneData = [];
                return false;
            }
        } catch (error) {
            console.error('❌ Errore caricamento amministrazione:', error);
            amministrazioneData = [];
            return false;
        }
    }

    // INIZIALIZZAZIONE AMMINISTRAZIONE
    function initAmministrazioneFunctionality() {
        if (amministrazioneInitialized) return;
        console.log('📊 Inizializzazione funzionalità amministrazione...');
        amministrazioneInitialized = true;

        // Prima carica i dati dal localStorage
        loadAmministrazioneFromStorage();
        
        // Setup event listeners
        setupAmministrazioneEventListeners();
        
        // Visualizza i dati o tabella vuota
        if (amministrazioneData.length > 0) {
            console.log('📊 Dati trovati, applicazione filtri...');
            applyAmministrazioneFilters();
        } else {
            console.log('📭 Nessun dato trovato, visualizzazione tabella vuota');
            showAmministrazioneEmpty();
        }
        
        console.log('✅ Amministrazione inizializzata con successo. Operazioni caricate:', amministrazioneData.length);
    }

    // Setup event listeners per i controlli amministrazione
    function setupAmministrazioneEventListeners() {
        // Pulsante nuova operazione
        const addBtn = document.getElementById('add-amministrazione-btn');
        if (addBtn) {
            addBtn.addEventListener('click', openAddAmministrazioneModal);
        }

        // Pulsante salva nuova operazione
        const saveBtn = document.getElementById('save-amministrazione-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveNewAmministrazione);
        }

        // Pulsante importa
        const importBtn = document.getElementById('import-amministrazione-btn');
        if (importBtn) {
            importBtn.addEventListener('click', importAmministrazioneJSON);
        }

        // Pulsante esporta
        const exportBtn = document.getElementById('export-amministrazione-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportAmministrazioneData);
        }

        // Pulsante stampa
        const printBtn = document.getElementById('print-amministrazione-btn');
        if (printBtn) {
            printBtn.addEventListener('click', printAmministrazioneData);
        }

        // Ricerca
        const searchInput = document.getElementById('amministrazione-search');
        const searchClear = document.getElementById('amministrazione-search-clear');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterAmministrazione(e.target.value.toLowerCase());
                if (searchClear) {
                    searchClear.style.display = e.target.value ? 'block' : 'none';
                }
            });
        }
        
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                filterAmministrazione('');
                searchClear.style.display = 'none';
            });
        }

        // Filtro tipo
        const filterSelect = document.getElementById('amministrazione-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', applyAmministrazioneFilters);
        }
    }

    // Apertura modal nuova operazione
    function openAddAmministrazioneModal() {
        // Imposta data odierna
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('new-amministrazione-date');
        if (dateInput) {
            dateInput.value = today;
        }

        // Reset form
        const form = document.getElementById('new-amministrazione-form');
        if (form) {
            const inputs = form.querySelectorAll('input:not(#new-amministrazione-date), select, textarea');
            inputs.forEach(input => {
                if (input.type === 'number') {
                    input.value = '';
                } else {
                    input.value = '';
                }
            });
        }

        showModal('add-amministrazione-modal');
    }

    // Salvataggio nuova operazione
    function saveNewAmministrazione() {
        const form = document.getElementById('new-amministrazione-form');
        if (!form) return;

        const formData = new FormData(form);
        const data = {};
        
        // Raccogli dati dal form
        data.date = document.getElementById('new-amministrazione-date')?.value;
        data.tipo = document.getElementById('new-amministrazione-tipo')?.value;
        data.descrizione = document.getElementById('new-amministrazione-descrizione')?.value.trim();
        data.importo = parseFloat(document.getElementById('new-amministrazione-importo')?.value) || 0;
        data.categoria = document.getElementById('new-amministrazione-categoria')?.value;
        data.responsabile = document.getElementById('new-amministrazione-responsabile')?.value.trim();
        data.note = document.getElementById('new-amministrazione-note')?.value.trim();

        // Validazione
        if (!data.date || !data.tipo || !data.descrizione || data.importo <= 0) {
            showModal('success-modal', 'Data, Tipo, Descrizione e Importo sono obbligatori');
            return;
        }

        // Crea record
        const newRecord = {
            id: generateAmministrazioneId(),
            date: data.date,
            tipo: data.tipo,
            descrizione: data.descrizione,
            importo: data.importo,
            categoria: data.categoria || '',
            responsabile: data.responsabile || '',
            note: data.note || '',
            timestamp: new Date(data.date).toISOString()
        };

        // Aggiungi ai dati
        amministrazioneData.push(newRecord);
        
        // Riordina per data (più recenti prima)
        amministrazioneData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Salva nel localStorage
        saveAmministrazioneToStorage();
        
        // Aggiorna visualizzazione
        applyAmministrazioneFilters();
        
        // Chiudi modale e mostra successo
        closeModal('add-amministrazione-modal');
        showModal('success-modal', `Operazione "${data.descrizione}" aggiunta con successo`);
    }

    // Genera ID univoco per operazione
    function generateAmministrazioneId() {
        const existing = amministrazioneData.map(op => op.id).filter(id => !isNaN(id));
        return existing.length > 0 ? Math.max.apply(null, existing) + 1 : 1;
    }

    // Visualizzazione tabella vuota iniziale
    function showAmministrazioneEmpty() {
        const tbody = document.getElementById('amministrazione-tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fas fa-clipboard-list" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: var(--primary-color);"></i>
                        <div style="font-size: 1rem; margin-bottom: 0.5rem;">Nessuna operazione registrata</div>
                        <div style="font-size: 0.875rem;">Aggiungi la prima operazione amministrativa</div>
                    </td>
                </tr>
            `;
        }
        
        // Azzera statistiche
        updateAmministrazioneStats({ entrate: 0, uscite: 0, operazioni: 0 });
    }

    // Visualizzazione dati nella tabella
    function displayAmministrazioneData() {
        const tbody = document.getElementById('amministrazione-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!filteredAmministrazioneData.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        <i class="fas fa-filter" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                        <div>Nessuna operazione per i filtri selezionati</div>
                    </td>
                </tr>
            `;
            updateAmministrazioneStats({ entrate: 0, uscite: 0, operazioni: 0 });
            return;
        }

        // Calcola statistiche
        const stats = {
            entrate: filteredAmministrazioneData
                .filter(op => op.tipo === 'entrata')
                .reduce((sum, op) => sum + (op.importo || 0), 0),
            uscite: filteredAmministrazioneData
                .filter(op => op.tipo === 'uscita')
                .reduce((sum, op) => sum + (op.importo || 0), 0),
            operazioni: filteredAmministrazioneData.length
        };
        updateAmministrazioneStats(stats);

        // Visualizza i dati
        filteredAmministrazioneData.forEach((operation) => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${operation.id}</td>
                <td>${formatAmministrazioneDate(new Date(operation.timestamp))}</td>
                <td><span class="status-badge ${operation.tipo}">${getTipoDisplayName(operation.tipo)}</span></td>
                <td>${operation.descrizione}</td>
                <td class="amount-cell ${getAmountClass(operation.tipo, operation.importo)}">${formatAmministrazioneAmount(operation.tipo, operation.importo)}</td>
                <td>${operation.categoria || '-'}</td>
                <td>${operation.responsabile || '-'}</td>
                <td>
                    <button class="action-btn" onclick="openEditAmministrazioneModal(${JSON.stringify(operation).replace(/"/g, '&quot;')})" title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Funzioni utility per formattazione
    function formatAmministrazioneDate(date) {
        if (!date || isNaN(date)) return 'Data non valida';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function formatAmministrazioneAmount(tipo, importo) {
        const formatted = new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(importo);
        
        return tipo === 'uscita' ? `-${formatted}` : formatted;
    }

    function getTipoDisplayName(tipo) {
        const names = {
            'entrata': 'Entrata',
            'uscita': 'Uscita',
            'in-sospeso': 'In sospeso'
        };
        return names[tipo] || tipo;
    }

    function getAmountClass(tipo, importo) {
        if (tipo === 'entrata') return 'amount-positive';
        if (tipo === 'uscita') return 'amount-negative';
        return '';
    }

    // Aggiorna statistiche amministrazione
    function updateAmministrazioneStats(stats) {
        const entrateElement = document.getElementById('amministrazione-entrate-stat');
        const usciteElement = document.getElementById('amministrazione-uscite-stat');
        const bilancioElement = document.getElementById('amministrazione-bilancio-stat');
        const operazioniElement = document.getElementById('amministrazione-operazioni-stat');
        
        const entrateCountElement = document.getElementById('amministrazione-entrate-count');
        const usciteCountElement = document.getElementById('amministrazione-uscite-count');

        if (entrateElement) entrateElement.textContent = formatCurrency(stats.entrate);
        if (usciteElement) usciteElement.textContent = formatCurrency(stats.uscite);
        if (bilancioElement) bilancioElement.textContent = formatCurrency(stats.entrate - stats.uscite);
        if (operazioniElement) operazioniElement.textContent = stats.operazioni.toString();

        // Conta operazioni per tipo
        const entrateCount = filteredAmministrazioneData.filter(op => op.tipo === 'entrata').length;
        const usciteCount = filteredAmministrazioneData.filter(op => op.tipo === 'uscita').length;
        
        if (entrateCountElement) entrateCountElement.textContent = entrateCount.toString();
        if (usciteCountElement) usciteCountElement.textContent = usciteCount.toString();
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    // Applicazione filtri amministrazione
    function applyAmministrazioneFilters() {
        if (!amministrazioneData.length) {
            showAmministrazioneEmpty();
            return;
        }

        const filterSelect = document.getElementById('amministrazione-filter');
        const filterValue = filterSelect ? filterSelect.value : 'tutti';

        filteredAmministrazioneData = amministrazioneData.filter(operation => {
            if (filterValue === 'tutti') return true;
            return operation.tipo === filterValue;
        });

        displayAmministrazioneData();
    }

    // Ricerca operazioni
    function filterAmministrazione(term) {
        if (!term) {
            applyAmministrazioneFilters();
            return;
        }

        const rows = document.querySelectorAll('#amministrazione-tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(term);
            row.style.display = isVisible ? '' : 'none';
        });
    }

    // Modifica operazione
    function openEditAmministrazioneModal(operation) {
        currentEditingAmministrazione = operation;
        
        const elements = {
            date: document.getElementById('edit-amministrazione-date'),
            tipo: document.getElementById('edit-amministrazione-tipo'),
            descrizione: document.getElementById('edit-amministrazione-descrizione'),
            importo: document.getElementById('edit-amministrazione-importo'),
            categoria: document.getElementById('edit-amministrazione-categoria'),
            responsabile: document.getElementById('edit-amministrazione-responsabile'),
            note: document.getElementById('edit-amministrazione-note')
        };
        
        if (elements.date) elements.date.value = operation.date || '';
        if (elements.tipo) elements.tipo.value = operation.tipo || '';
        if (elements.descrizione) elements.descrizione.value = operation.descrizione || '';
        if (elements.importo) elements.importo.value = operation.importo || '';
        if (elements.categoria) elements.categoria.value = operation.categoria || '';
        if (elements.responsabile) elements.responsabile.value = operation.responsabile || '';
        if (elements.note) elements.note.value = operation.note || '';
        
        showModal('edit-amministrazione-modal');
    }

    function saveAmministrazioneChanges() {
        if (!currentEditingAmministrazione) return;

        const data = {
            date: document.getElementById('edit-amministrazione-date')?.value,
            tipo: document.getElementById('edit-amministrazione-tipo')?.value,
            descrizione: document.getElementById('edit-amministrazione-descrizione')?.value.trim(),
            importo: parseFloat(document.getElementById('edit-amministrazione-importo')?.value) || 0,
            categoria: document.getElementById('edit-amministrazione-categoria')?.value,
            responsabile: document.getElementById('edit-amministrazione-responsabile')?.value.trim(),
            note: document.getElementById('edit-amministrazione-note')?.value.trim()
        };

        // Validazione
        if (!data.date || !data.tipo || !data.descrizione || data.importo <= 0) {
            showModal('success-modal', 'Data, Tipo, Descrizione e Importo sono obbligatori');
            return;
        }

        const idx = amministrazioneData.findIndex(op => op.id === currentEditingAmministrazione.id);
        if (idx > -1) {
            // Sostituzione senza spread operator per compatibilità
            amministrazioneData[idx].date = data.date;
            amministrazioneData[idx].tipo = data.tipo;
            amministrazioneData[idx].descrizione = data.descrizione;
            amministrazioneData[idx].importo = data.importo;
            amministrazioneData[idx].categoria = data.categoria;
            amministrazioneData[idx].responsabile = data.responsabile;
            amministrazioneData[idx].note = data.note;
            amministrazioneData[idx].timestamp = new Date(data.date).toISOString();
            
            // Riordina per data
            amministrazioneData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            saveAmministrazioneToStorage();
            applyAmministrazioneFilters();
            closeModal('edit-amministrazione-modal');
            showModal('success-modal', `Operazione "${data.descrizione}" modificata`);
        }
    }

    function deleteAmministrazioneFromEdit() {
        if (!currentEditingAmministrazione) return;
        
        closeModal('edit-amministrazione-modal');
        
        showConfirmModal(`Eliminare l'operazione "${currentEditingAmministrazione.descrizione}"?`, () => {
            const idx = amministrazioneData.findIndex(op => op.id === currentEditingAmministrazione.id);
            if (idx > -1) {
                amministrazioneData.splice(idx, 1);
                saveAmministrazioneToStorage();
                applyAmministrazioneFilters();
                showModal('success-modal', `Operazione "${currentEditingAmministrazione.descrizione}" eliminata`);
                currentEditingAmministrazione = null;
            }
        });
    }

    // Importazione dati JSON
    function importAmministrazioneJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    let dataArray = [];
                    
                    if (Array.isArray(jsonData)) {
                        dataArray = jsonData;
                    } else if (jsonData.data && Array.isArray(jsonData.data)) {
                        dataArray = jsonData.data;
                    } else {
                        throw new Error('Formato JSON non valido');
                    }
                    
                    if (!dataArray.length) {
                        throw new Error('Il file JSON è vuoto');
                    }
                    
                    // Valida e pulisci i dati
                    const validData = dataArray.filter(item => 
                        item && item.descrizione && item.importo && item.tipo
                    ).map(item => ({
                        id: item.id || generateAmministrazioneId(),
                        date: item.date || new Date().toISOString().split('T')[0],
                        tipo: item.tipo,
                        descrizione: item.descrizione,
                        importo: Number(item.importo) || 0,
                        categoria: item.categoria || '',
                        responsabile: item.responsabile || '',
                        note: item.note || '',
                        timestamp: item.timestamp || new Date(item.date || new Date()).toISOString()
                    }));
                    
                    if (!validData.length) {
                        throw new Error('Nessun record valido trovato');
                    }
                    
                    amministrazioneData = validData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    saveAmministrazioneToStorage();
                    applyAmministrazioneFilters();
                    
                    showModal('success-modal', `✅ Importate ${validData.length} operazioni da ${file.name}`);
                    
                } catch (error) {
                    showModal('success-modal', `Errore durante l'importazione: ${error.message}`);
                    console.error('❌ Errore importazione JSON:', error);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Esportazione dati
    function exportAmministrazioneData() {
        if (!amministrazioneData.length) {
            showModal('success-modal', 'Nessuna operazione da esportare');
            return;
        }

        const jsonContent = JSON.stringify({clienti: amministrazioneData, timestamp: new Date().toISOString()}, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `amministrazione_mystation_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showModal('success-modal', `Esportate ${amministrazioneData.length} operazioni`);
    }

    // Stampa dati
    function printAmministrazioneData() {
        if (!filteredAmministrazioneData.length) {
            showModal('success-modal', 'Nessuna operazione da stampare');
            return;
        }

        const printWindow = window.open('', '_blank');
        const printContent = generatePrintContent();
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    function generatePrintContent() {
        const stats = {
            entrate: filteredAmministrazioneData
                .filter(op => op.tipo === 'entrata')
                .reduce((sum, op) => sum + (op.importo || 0), 0),
            uscite: filteredAmministrazioneData
                .filter(op => op.tipo === 'uscita')
                .reduce((sum, op) => sum + (op.importo || 0), 0)
        };

        let content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Report Amministrazione - MyStation</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
                    .stat-box { text-align: center; padding: 15px; border: 1px solid #ddd; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .amount-positive { color: green; }
                    .amount-negative { color: red; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>MyStation - Report Amministrazione</h1>
                    <p>Generato il ${new Date().toLocaleDateString('it-IT')}</p>
                </div>
                
                <div class="stats">
                    <div class="stat-box">
                        <h3>Entrate</h3>
                        <p>${formatCurrency(stats.entrate)}</p>
                    </div>
                    <div class="stat-box">
                        <h3>Uscite</h3>
                        <p>${formatCurrency(stats.uscite)}</p>
                    </div>
                    <div class="stat-box">
                        <h3>Bilancio</h3>
                        <p>${formatCurrency(stats.entrate - stats.uscite)}</p>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Descrizione</th>
                            <th>Importo</th>
                            <th>Categoria</th>
                            <th>Responsabile</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        filteredAmministrazioneData.forEach(op => {
            content += `
                <tr>
                    <td>${formatAmministrazioneDate(new Date(op.timestamp))}</td>
                    <td>${getTipoDisplayName(op.tipo)}</td>
                    <td>${op.descrizione}</td>
                    <td class="${getAmountClass(op.tipo, op.importo)}">${formatAmministrazioneAmount(op.tipo, op.importo)}</td>
                    <td>${op.categoria || '-'}</td>
                    <td>${op.responsabile || '-'}</td>
                </tr>
            `;
        });

        content += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        return content;
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
    
    // Esposizione funzioni amministrazione
    window.initAmministrazioneFunctionality = initAmministrazioneFunctionality;
    window.openAddAmministrazioneModal = openAddAmministrazioneModal;
    window.saveNewAmministrazione = saveNewAmministrazione;
    window.openEditAmministrazioneModal = openEditAmministrazioneModal;
    window.saveAmministrazioneChanges = saveAmministrazioneChanges;
    window.deleteAmministrazioneFromEdit = deleteAmministrazioneFromEdit;
    window.importAmministrazioneJSON = importAmministrazioneJSON;
    window.exportAmministrazioneData = exportAmministrazioneData;
    window.printAmministrazioneData = printAmministrazioneData;
    
    console.log('🚀 MyStation inizializzato con successo');
});