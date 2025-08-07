/* ========== GESTIONE CARICO - JAVASCRIPT COMPLETO ========== */

// Variabili globali per la gestione del carico
let caricoData = [];
let filteredCaricoData = [];
let caricoInitialized = false;
let editMode = false;
let originalCaricoData = []; // Per annullare le modifiche

// FUNZIONI STORAGE CARICO
function saveCaricoToStorage() {
    try {
        const dataToSave = JSON.stringify(caricoData);
        localStorage.setItem('mystation_carico', dataToSave);
        console.log('💾 Dati carico salvati nel localStorage:', caricoData.length, 'record');
        console.log('🔍 Dati salvati:', caricoData.slice(0, 2)); // Mostra i primi 2 per debug
        
        // Salva anche i dati dell'anno precedente
        savePreviousYearData();
        
        return true;
    } catch (error) {
        console.error('❌ Errore salvataggio carico:', error);
        if (window.showModal) {
            window.showModal('success-modal', 'Errore nel salvataggio dati: ' + error.message);
        }
        return false;
    }
}

function loadCaricoFromStorage() {
    try {
        const stored = localStorage.getItem('mystation_carico');
        console.log('📂 Tentativo caricamento da localStorage...');
        
        if (stored) {
            const parsedData = JSON.parse(stored);
            if (Array.isArray(parsedData)) {
                caricoData = parsedData;
                // Ordina per data (più recenti prima)
                caricoData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                console.log('✅ Dati carico caricati dal localStorage:', caricoData.length, 'record');
                console.log('🔍 Primi dati caricati:', caricoData.slice(0, 2)); // Mostra i primi 2 per debug
                
                // Carica anche i dati dell'anno precedente
                loadPreviousYearData();
                
                return true;
            } else {
                console.warn('⚠️ Dati localStorage non sono un array, inizializzazione vuota');
                caricoData = [];
                return false;
            }
        } else {
            console.log('📭 Nessun dato nel localStorage, inizializzazione vuota');
            caricoData = [];
            return false;
        }
    } catch (error) {
        console.error('❌ Errore caricamento carico:', error);
        caricoData = [];
        return false;
    }
}

// Inizializzazione del modulo carico
function initCaricoFunctionality() {
    if (caricoInitialized) return;
    console.log('🚛 Inizializzazione funzionalità carico...');
    caricoInitialized = true;

    // Prima carica i dati dal localStorage
    loadCaricoFromStorage();
    
    // Poi setup event listeners e menu (che imposta i default su "anno")
    setupCaricoEventListeners();
    setupDependentMenus();
    setupSummaryTableListeners();
    
    // Assicurati che i filtri siano impostati correttamente su "anno"
    setTimeout(() => {
        const periodFilter = document.getElementById('carico-period-filter');
        if (periodFilter && periodFilter.value !== 'anno') {
            console.log('🔧 Correzione filtro periodo da', periodFilter.value, 'a anno');
            periodFilter.value = 'anno';
            updateDetailFilter();
        }
    }, 50);
    
    // Infine visualizza i dati o tabella vuota
    if (caricoData.length > 0) {
        console.log('📊 Dati trovati, applicazione filtri...');
        applyCaricoFilters(); // Applica i filtri di default (anno corrente)
    } else {
        console.log('📭 Nessun dato trovato, visualizzazione tabella vuota');
        showCaricoEmpty();
    }
    
    console.log('✅ Carico inizializzato con successo. Record caricati:', caricoData.length);
}

// Setup event listeners per i controlli del carico
function setupCaricoEventListeners() {
    // Pulsante nuovo carico
    const addCaricoBtn = document.getElementById('add-carico-btn');
    if (addCaricoBtn) {
        addCaricoBtn.addEventListener('click', openAddCaricoModal);
    }

    // Pulsante salva nuovo carico
    const saveCaricoBtn = document.getElementById('save-carico-btn');
    if (saveCaricoBtn) {
        saveCaricoBtn.addEventListener('click', saveNewCarico);
    }

    // Pulsante importa JSON
    const importBtn = document.getElementById('import-carico-btn');
    if (importBtn) {
        importBtn.addEventListener('click', importCaricoJSON);
    }

    // Pulsante esporta JSON
    const exportBtn = document.getElementById('export-carico-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCaricoData);
    }

    // Pulsante reset anno
    const resetYearBtn = document.getElementById('reset-year-btn');
    if (resetYearBtn) {
        resetYearBtn.addEventListener('click', () => {
            if (window.showConfirmModal) {
                window.showConfirmModal(
                    'Sei sicuro di voler resettare tutti i dati dell\'anno? Questa azione non può essere annullata.',
                    resetCaricoYear
                );
            } else {
                if (confirm('Sei sicuro di voler resettare tutti i dati dell\'anno?')) {
                    resetCaricoYear();
                }
            }
        });
    }

    // Pulsante edit mode
    const editBtn = document.getElementById('edit-carico-btn');
    if (editBtn) {
        editBtn.addEventListener('click', toggleEditMode);
    }

    // Filtri
    const periodFilter = document.getElementById('carico-period-filter');
    const detailFilter = document.getElementById('carico-detail-filter');
    
    if (periodFilter) {
        periodFilter.addEventListener('change', updateDetailFilter);
    }

    // Pulsanti filtri
    const applyFilterBtn = document.getElementById('carico-apply-filter');
    const resetFilterBtn = document.getElementById('carico-reset-filter');
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyCaricoFilters);
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetCaricoFilters);
    }
}

// GESTIONE EDIT MODE
function toggleEditMode() {
    editMode = !editMode;
    const table = document.getElementById('carico-table');
    const banner = document.getElementById('edit-mode-banner');
    const editBtn = document.getElementById('edit-carico-btn');
    
    if (editMode) {
        // Salva copia dei dati originali
        originalCaricoData = JSON.parse(JSON.stringify(filteredCaricoData));
        
        // Attiva modalità editing
        table.classList.add('edit-mode');
        banner.classList.add('active');
        editBtn.innerHTML = '<i class="fas fa-save"></i>';
        editBtn.title = 'Salva Modifiche';
        editBtn.classList.remove('btn-secondary');
        
        // Rendi editabili TUTTE le celle (data, autista, valori numerici)
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td');
            // Rendi editabili TUTTE le colonne (0-9: data, autista, prodotti e differenze)
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                cell.classList.add('editable');
                cell.contentEditable = true;
                
                // Event listener per salvare le modifiche
                cell.addEventListener('blur', function() {
                    const newValue = this.textContent.trim();
                    updateCaricoValue(rowIndex, i, newValue);
                });
                
                cell.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.blur();
                    }
                });
            }
        });
        
        if (window.showModal) {
            window.showModal('success-modal', 'Modalità modifica attivata - Clicca su qualsiasi cella per modificare');
        }
        
    } else {
        // Salva le modifiche
        saveCaricoChanges();
        
        // Disattiva modalità editing
        table.classList.remove('edit-mode');
        banner.classList.remove('active');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Modifica Carico';
        editBtn.classList.add('btn-secondary');
        
        // Rimuovi editabilità
        const cells = table.querySelectorAll('td.editable');
        cells.forEach(cell => {
            cell.classList.remove('editable');
            cell.contentEditable = false;
        });
    }
}

function updateCaricoValue(rowIndex, columnIndex, newValue) {
    if (rowIndex >= filteredCaricoData.length) return;
    
    const row = filteredCaricoData[rowIndex];
    
    // Mappa indici colonna ai campi
    const fieldMap = {
        0: 'date',         // Data
        1: 'driver',       // Autista
        2: 'benzina', 3: 'diffBenzina',
        4: 'gasolio', 5: 'diffGasolio',
        6: 'diesel', 7: 'diffDiesel',
        8: 'hvolution', 9: 'diffHvolution'
    };
    
    const field = fieldMap[columnIndex];
    if (!field) return;
    
    // Gestione specifica per tipo di campo
    if (field === 'date') {
        // Validazione e conversione data
        if (isValidDateFormat(newValue)) {
            const convertedDate = convertDateFromDisplay(newValue);
            if (convertedDate) {
                row.date = convertedDate.dateString;
                row.timestamp = convertedDate.timestamp;
                console.log('📅 Data aggiornata:', { 
                    input: newValue, 
                    converted: convertedDate 
                });
            } else {
                console.warn('⚠️ Formato data non valido:', newValue);
                // Ripristina il valore originale nella cella
                setTimeout(() => {
                    const cell = document.querySelector(`tbody tr:nth-child(${rowIndex + 1}) td:nth-child(1)`);
                    if (cell) cell.textContent = formatDateForDisplay(new Date(row.timestamp));
                }, 10);
            }
        }
    } else if (field === 'driver') {
        // Gestione autista - salva nome completo
        if (newValue && newValue.trim().length > 0) {
            row.driver = newValue.trim();
            console.log('👤 Autista aggiornato:', newValue.trim());
        } else {
            console.warn('⚠️ Nome autista vuoto, operazione annullata');
            // Ripristina il valore originale
            setTimeout(() => {
                const cell = document.querySelector(`tbody tr:nth-child(${rowIndex + 1}) td:nth-child(2)`);
                if (cell) cell.textContent = formatDriverName(row.driver);
            }, 10);
        }
    } else {
        // Gestione campi numerici
        const numValue = parseInt(newValue) || 0;
        row[field] = numValue;
        console.log(`🔢 Campo ${field} aggiornato:`, numValue);
    }
}

// Validazione formato data dd/mm
function isValidDateFormat(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;
    
    // Accetta formati: dd/mm, d/m, dd/m, d/mm
    const dateRegex = /^(\d{1,2})\/(\d{1,2})$/;
    const match = dateStr.match(dateRegex);
    
    if (!match) return false;
    
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    
    // Validazione base
    return day >= 1 && day <= 31 && month >= 1 && month <= 12;
}

// Converte data da formato display (dd/mm) a formato storage completo
function convertDateFromDisplay(dateStr) {
    if (!isValidDateFormat(dateStr)) return null;
    
    const parts = dateStr.split('/');
    const day = parseInt(parts[0]).toString().padStart(2, '0');
    const month = parseInt(parts[1]).toString().padStart(2, '0');
    const currentYear = new Date().getFullYear();
    
    // Crea la data completa
    const fullDateStr = `${currentYear}-${month}-${day}`;
    const timestamp = new Date(fullDateStr).toISOString();
    
    return {
        dateString: fullDateStr.split('T')[0], // YYYY-MM-DD
        timestamp: timestamp
    };
}

function saveCaricoChanges() {
    // Aggiorna caricoData con le modifiche da filteredCaricoData
    filteredCaricoData.forEach(filteredRow => {
        const originalIndex = caricoData.findIndex(row => 
            row.timestamp === filteredRow.timestamp && 
            row.driver === filteredRow.driver
        );
        if (originalIndex !== -1) {
            caricoData[originalIndex] = { ...filteredRow };
        }
    });
    
    // Salva nel localStorage
    saveCaricoToStorage();
    
    // Aggiorna visualizzazione
    displayCaricoData();
    
    if (window.showModal) {
        window.showModal('success-modal', 'Modifiche salvate con successo!');
    }
}

// Setup menu dipendenti per i filtri
function setupDependentMenus() {
    // Imposta il valore di default su "anno" PRIMA di aggiornare il menu dettaglio
    const periodFilter = document.getElementById('carico-period-filter');
    if (periodFilter) {
        periodFilter.value = 'anno';
        console.log('🔧 Filtro periodo impostato su: anno');
    }
    
    // Ora aggiorna il menu dettaglio che selezionerà automaticamente l'anno corrente
    updateDetailFilter();
}

// Aggiorna il menu dettaglio in base al periodo selezionato
function updateDetailFilter() {
    const periodFilter = document.getElementById('carico-period-filter');
    const detailFilter = document.getElementById('carico-detail-filter');
    
    if (!periodFilter || !detailFilter) return;
    
    const period = periodFilter.value;
    detailFilter.innerHTML = '';
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    switch (period) {
        case 'anno':
            for (let year = currentYear; year >= currentYear - 5; year--) {
                const selected = year === currentYear ? 'selected' : '';
                detailFilter.innerHTML += `<option value="${year}" ${selected}>${year}</option>`;
            }
            break;
        case 'semestre':
            detailFilter.innerHTML += `<option value="1">1° Semestre ${currentYear}</option>`;
            detailFilter.innerHTML += `<option value="2" selected>2° Semestre ${currentYear}</option>`;
            break;
        case 'trimestre':
            for (let t = 4; t >= 1; t--) {
                const selected = t === Math.ceil(currentMonth / 3) ? 'selected' : '';
                detailFilter.innerHTML += `<option value="${t}" ${selected}>${t}° Trimestre ${currentYear}</option>`;
            }
            break;
        case 'mese':
            const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
                          'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
            for (let m = currentMonth; m >= 1; m--) {
                const selected = m === currentMonth ? 'selected' : '';
                detailFilter.innerHTML += `<option value="${m}" ${selected}>${months[m-1]} ${currentYear}</option>`;
            }
            break;
    }
}

// Apertura modal nuovo carico
function openAddCaricoModal() {
    // Imposta data odierna
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('new-carico-date');
    if (dateInput) {
        dateInput.value = today;
    }
    
    // Reset form
    const form = document.getElementById('new-carico-form');
    if (form) {
        const inputs = form.querySelectorAll('input[type="number"], input[type="text"]:not(#new-carico-date)');
        inputs.forEach(input => input.value = '');
    }
    
    window.showModal('add-carico-modal');
}

// Salvataggio nuovo carico
function saveNewCarico() {
    // Controlli null per evitare errori
    const dateInput = document.getElementById('new-carico-date');
    const driverInput = document.getElementById('new-carico-driver');
    
    if (!dateInput || !driverInput) {
        console.error('Elementi form non trovati');
        return;
    }
    
    const date = dateInput.value;
    const driver = driverInput.value.trim();
    
    if (!date || !driver) {
        window.showModal('success-modal', 'Data e Autista sono obbligatori');
        return;
    }
    
    // Costruisci record con controlli null
    const newRecord = {
        date,
        driver,
        benzina: parseInt(document.getElementById('new-carico-benzina')?.value) || 0,
        diffBenzina: parseInt(document.getElementById('new-carico-diff-benzina')?.value) || 0,
        gasolio: parseInt(document.getElementById('new-carico-gasolio')?.value) || 0,
        diffGasolio: parseInt(document.getElementById('new-carico-diff-gasolio')?.value) || 0,
        diesel: parseInt(document.getElementById('new-carico-diesel')?.value) || 0,
        diffDiesel: parseInt(document.getElementById('new-carico-diff-diesel')?.value) || 0,
        hvolution: parseInt(document.getElementById('new-carico-hvolution')?.value) || 0,
        diffHvolution: parseInt(document.getElementById('new-carico-diff-hvolution')?.value) || 0,
        timestamp: new Date(date).toISOString()
    };
    
    // Aggiungi ai dati
    caricoData.push(newRecord);
    
    // Riordina per data (più recenti prima)
    caricoData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Salva nel localStorage
    saveCaricoToStorage();
    
    // Aggiorna visualizzazione
    applyCaricoFilters();
    
    // Chiudi modale e mostra successo
    window.closeModal('add-carico-modal');
    window.showModal('success-modal', `Nuovo carico per ${driver} aggiunto con successo`);
}

// Visualizzazione tabella vuota iniziale
function showCaricoEmpty() {
    const tbody = document.getElementById('carico-tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fas fa-download" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: var(--primary-color);"></i>
                    <div style="font-size: 1rem; margin-bottom: 0.5rem;">Nessun dato caricato</div>
                    <div style="font-size: 0.875rem;">Usa il pulsante "Importa JSON" per caricare i dati</div>
                </td>
            </tr>
        `;
    }
    
    // Azzera le statistiche e autista top
    updateCaricoStats({ benzina: 0, gasolio: 0, diesel: 0, hvolution: 0 });
    
    // Azzera anche la tabella riepilogo
    resetSummaryTable();
    
    // Nascondi loading e errori
    showCaricoLoading(false);
}

// Visualizzazione dati nella tabella
function displayCaricoData() {
    const tbody = document.getElementById('carico-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!filteredCaricoData.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-filter" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                    <div>Nessun dato per il periodo selezionato</div>
                </td>
            </tr>
        `;
        // Aggiorna anche la tabella riepilogo quando non ci sono dati
        updateSummaryTable();
        return;
    }

    // Calcola statistiche per il periodo filtrato
    const stats = {
        benzina: filteredCaricoData.reduce((sum, row) => sum + (row.benzina || 0), 0),
        gasolio: filteredCaricoData.reduce((sum, row) => sum + (row.gasolio || 0), 0),
        diesel: filteredCaricoData.reduce((sum, row) => sum + (row.diesel || 0), 0),
        hvolution: filteredCaricoData.reduce((sum, row) => sum + (row.hvolution || 0), 0)
    };
    updateCaricoStats(stats);

    // Visualizza i dati
    filteredCaricoData.forEach((row, index) => {
        const tr = document.createElement('tr');
        
        // Debug per verificare il formato data
        if (index < 2) { // Solo per i primi 2 record per debug
            console.log('🔍 Debug data row', index + 1, ':', {
                originalTimestamp: row.timestamp,
                parsedDate: new Date(row.timestamp),
                formattedDate: formatDateForDisplay(new Date(row.timestamp)),
                fullDriver: row.driver,
                displayDriver: formatDriverName(row.driver)
            });
        }
        
        tr.innerHTML = `
            <td>${formatDateForDisplay(new Date(row.timestamp))}</td>
            <td class="driver-name">${formatDriverName(row.driver)}</td>
            <td>${formatCaricoNumber(row.benzina)}</td>
            <td class="${getCaricoGradientClass(row.diffBenzina)}">${formatCaricoDiff(row.diffBenzina)}</td>
            <td>${formatCaricoNumber(row.gasolio)}</td>
            <td class="${getCaricoGradientClass(row.diffGasolio)}">${formatCaricoDiff(row.diffGasolio)}</td>
            <td>${formatCaricoNumber(row.diesel)}</td>
            <td class="${getCaricoGradientClass(row.diffDiesel)}">${formatCaricoDiff(row.diffDiesel)}</td>
            <td>${formatCaricoNumber(row.hvolution)}</td>
            <td class="${getCaricoGradientClass(row.diffHvolution)}">${formatCaricoDiff(row.diffHvolution)}</td>
        `;
        tbody.appendChild(tr);
    });

    // Aggiorna la tabella riepilogo
    updateSummaryTable();
}

// Aggiorna statistiche del carico con controlli null
function updateCaricoStats(stats) {
    const benzinaStat = document.getElementById('carico-benzina-stat');
    const gasolioStat = document.getElementById('carico-gasolio-stat');
    const dieselStat = document.getElementById('carico-diesel-stat');
    const hvolutionStat = document.getElementById('carico-hvolution-stat');
    const totalStat = document.getElementById('carico-total-stat');
    const topAutistaStat = document.getElementById('carico-top-autista');
    
    // Controlli null per evitare errori
    if (benzinaStat) benzinaStat.textContent = formatCaricoNumber(stats.benzina);
    if (gasolioStat) gasolioStat.textContent = formatCaricoNumber(stats.gasolio);
    if (dieselStat) dieselStat.textContent = formatCaricoNumber(stats.diesel);
    if (hvolutionStat) hvolutionStat.textContent = formatCaricoNumber(stats.hvolution);
    if (totalStat) totalStat.textContent = formatCaricoNumber(stats.benzina + stats.gasolio + stats.diesel + stats.hvolution);
    
    // Calcola e aggiorna Autista Top
    if (topAutistaStat) {
        const topDriver = calculateTopDriver();
        topAutistaStat.textContent = topDriver.name;
        
        // Aggiorna il tooltip con informazioni dettagliate
        const topDriverElement = topAutistaStat.parentElement;
        if (topDriverElement && topDriver.name !== 'N/D') {
            topDriverElement.title = `${topDriver.name}: ${topDriver.count} carichi (${topDriver.percentage}%)`;
        } else {
            topDriverElement.title = 'Nessun dato disponibile per il periodo selezionato';
        }
    }
}

// Calcola l'autista che ha effettuato più carichi nel periodo filtrato
function calculateTopDriver() {
    // Se non ci sono dati filtrati, ritorna N/D
    if (!filteredCaricoData || filteredCaricoData.length === 0) {
        return { name: 'N/D', count: 0, percentage: 0 };
    }
    
    // Conta i carichi per ogni autista
    const driverCounts = {};
    
    filteredCaricoData.forEach(record => {
        const driver = record.driver || 'Sconosciuto';
        driverCounts[driver] = (driverCounts[driver] || 0) + 1;
    });
    
    // Trova l'autista con più carichi
    let topDriver = { name: 'N/D', count: 0 };
    
    for (const [driver, count] of Object.entries(driverCounts)) {
        if (count > topDriver.count) {
            topDriver = { name: driver, count: count };
        }
    }
    
    // Calcola la percentuale
    const percentage = filteredCaricoData.length > 0 
        ? Math.round((topDriver.count / filteredCaricoData.length) * 100) 
        : 0;
    
    // Debug log per verificare il calcolo
    console.log('🏆 Autista Top calcolato:', {
        totalRecords: filteredCaricoData.length,
        driverCounts: driverCounts,
        topDriver: { ...topDriver, percentage }
    });
    
    return { ...topDriver, percentage };
}

// Applicazione filtri
function applyCaricoFilters() {
    if (!caricoData.length) {
        showCaricoEmpty();
        return;
    }

    const periodFilter = document.getElementById('carico-period-filter');
    const detailFilter = document.getElementById('carico-detail-filter');
    
    if (!periodFilter || !detailFilter) return;
    
    const period = periodFilter.value || 'anno'; // Default: anno completo
    const detail = parseInt(detailFilter.value) || new Date().getFullYear(); // Default: anno corrente
    const currentYear = new Date().getFullYear();

    filteredCaricoData = caricoData.filter(row => {
        const rowDate = new Date(row.timestamp);
        const rowYear = rowDate.getFullYear();
        const rowMonth = rowDate.getMonth() + 1;

        switch (period) {
            case 'anno':
                return rowYear === detail;
            case 'semestre':
                return rowYear === currentYear && 
                       ((detail === 1 && rowMonth <= 6) || (detail === 2 && rowMonth > 6));
            case 'trimestre':
                const trimesterStart = (detail - 1) * 3 + 1;
                const trimesterEnd = detail * 3;
                return rowYear === currentYear && rowMonth >= trimesterStart && rowMonth <= trimesterEnd;
            case 'mese':
                return rowYear === currentYear && rowMonth === detail;
            default:
                return rowYear === currentYear; // Fallback: anno corrente
        }
    });

    displayCaricoData();
}

// Reset filtri - imposta i valori di default
function resetCaricoFilters() {
    // Forza l'impostazione su "anno" (intero anno corrente)
    const periodFilter = document.getElementById('carico-period-filter');
    
    if (periodFilter) {
        periodFilter.value = 'anno';
        console.log('🔄 Reset filtri: periodo impostato su anno');
        updateDetailFilter(); // Questo aggiornerà anche il menu dettaglio con anno corrente selezionato
    }
    
    // Verifica che il valore sia effettivamente cambiato
    setTimeout(() => {
        if (periodFilter && periodFilter.value !== 'anno') {
            console.warn('⚠️ Filtro periodo non impostato correttamente, nuovo tentativo...');
            periodFilter.selectedIndex = 0; // Forza il primo elemento (Anno corrente)
        }
    }, 10);
    
    // Se non ci sono dati, mostra tabella vuota
    if (!caricoData || caricoData.length === 0) {
        showCaricoEmpty();
        return;
    }
    
    // Applica i filtri resettati (intero anno)
    setTimeout(() => applyCaricoFilters(), 100);
}

// Reset dati anno
function resetCaricoYear() {
    const currentYear = new Date().getFullYear();
    const originalLength = caricoData.length;
    
    caricoData = caricoData.filter(row => {
        const rowYear = new Date(row.timestamp).getFullYear();
        return rowYear !== currentYear;
    });
    
    const deletedCount = originalLength - caricoData.length;
    
    // Salva nel localStorage
    saveCaricoToStorage();
    
    applyCaricoFilters();
    
    if (deletedCount > 0) {
        window.showModal('success-modal', `Eliminati ${deletedCount} record dell'anno ${currentYear}`);
    } else {
        window.showModal('success-modal', `Nessun record trovato per l'anno ${currentYear}`);
    }
}

// Importazione dati JSON con supporto formati multipli
function importCaricoJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        showCaricoLoading(true);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                let dataArray = [];
                
                // Supporta formati multipli
                if (Array.isArray(jsonData)) {
                    // Formato 1: Array diretto
                    dataArray = jsonData;
                } else if (jsonData.history && Array.isArray(jsonData.history)) {
                    // Formato 2: Oggetto con proprietà "history"
                    dataArray = jsonData.history;
                } else if (jsonData.data && Array.isArray(jsonData.data)) {
                    // Formato 3: Oggetto con proprietà "data"
                    dataArray = jsonData.data;
                } else {
                    throw new Error('Formato JSON non riconosciuto. Il file deve contenere un array di oggetti o un oggetto con proprietà "history" o "data".');
                }
                
                if (!dataArray.length) {
                    throw new Error('Il file JSON è vuoto o non contiene dati validi');
                }
                
                // Valida e pulisci i dati
                const validData = dataArray.filter(item => 
                    item && 
                    (item.date || item.timestamp) && 
                    (item.driver || item.autista) &&
                    (typeof (item.date || item.timestamp) === 'string') && 
                    (typeof (item.driver || item.autista) === 'string')
                ).map(item => ({
                    date: item.date || new Date(item.timestamp).toISOString().split('T')[0],
                    driver: item.driver || item.autista,
                    timestamp: item.timestamp || new Date(item.date).toISOString(),
                    benzina: Number(item.benzina) || 0,
                    diffBenzina: Number(item.diffBenzina || item.diff_benzina) || 0,
                    gasolio: Number(item.gasolio) || 0,
                    diffGasolio: Number(item.diffGasolio || item.diff_gasolio) || 0,
                    diesel: Number(item.diesel) || 0,
                    diffDiesel: Number(item.diffDiesel || item.diff_diesel) || 0,
                    hvolution: Number(item.hvolution) || 0,
                    diffHvolution: Number(item.diffHvolution || item.diff_hvolution) || 0
                }));
                
                if (!validData.length) {
                    throw new Error('Nessun record valido trovato nel file. Verifica che i dati abbiano almeno "date/timestamp" e "driver/autista"');
                }
                
                caricoData = validData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                // Salva nel localStorage
                saveCaricoToStorage();
                
                showCaricoLoading(false);
                resetCaricoFilters();
                
                window.showModal('success-modal', `✅ Importati ${validData.length} record da ${file.name}`);
                console.log('📊 Dati carico importati:', validData.length, 'record');
                
            } catch (error) {
                showCaricoLoading(false);
                showCaricoError(`Errore durante l'importazione: ${error.message}`);
                console.error('❌ Errore importazione JSON:', error);
            }
        };
        
        reader.onerror = function() {
            showCaricoLoading(false);
            showCaricoError('Errore durante la lettura del file');
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Esportazione dati JSON
function exportCaricoData() {
    if (!caricoData.length) {
        // Se non ci sono dati, offri di scaricare un file JSON di esempio
        if (window.showConfirmModal) {
            window.showConfirmModal(
                'Nessun dato da esportare. Vuoi scaricare un file JSON di esempio per l\'importazione?',
                generateExampleJSON
            );
        } else {
            if (confirm('Nessun dato da esportare. Vuoi scaricare un file JSON di esempio?')) {
                generateExampleJSON();
            }
        }
        return;
    }

    const periodFilter = document.getElementById('carico-period-filter');
    const detailFilter = document.getElementById('carico-detail-filter');
    
    const period = periodFilter?.value || 'mese';
    const detail = detailFilter?.value || '1';
    const year = new Date().getFullYear();

    // Usa i dati dell'anno corrente per l'export
    const yearData = caricoData.filter(row => {
        const rowYear = new Date(row.timestamp).getFullYear();
        return rowYear === year;
    });

    if (yearData.length === 0) {
        window.showModal('success-modal', `Nessun dato trovato per l'anno ${year}`);
        return;
    }

    // Esporta in formato JSON
    const jsonContent = JSON.stringify(yearData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `carico_${period}_${detail}_${year}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    window.showModal('success-modal', `Esportati ${yearData.length} record JSON per ${period} ${detail} ${year}`);
}

// Genera file JSON di esempio per l'importazione
function generateExampleJSON() {
    const exampleData = [
        {
            "date": "2025-01-15",
            "driver": "Mario Rossi",
            "benzina": 5000,
            "diffBenzina": 150,
            "gasolio": 8000,
            "diffGasolio": -200,
            "diesel": 3000,
            "diffDiesel": 75,
            "hvolution": 2000,
            "diffHvolution": 100,
            "timestamp": "2025-01-15T08:30:00.000Z"
        },
        {
            "date": "2025-01-14",
            "driver": "Giuseppe Verdi",
            "benzina": 4500,
            "diffBenzina": -50,
            "gasolio": 7500,
            "diffGasolio": 300,
            "diesel": 2800,
            "diffDiesel": 0,
            "hvolution": 1800,
            "diffHvolution": -25,
            "timestamp": "2025-01-14T09:15:00.000Z"
        },
        {
            "date": "2025-01-13",
            "driver": "Anna Bianchi",
            "benzina": 5200,
            "diffBenzina": 200,
            "gasolio": 8200,
            "diffGasolio": 150,
            "diesel": 3100,
            "diffDiesel": 50,
            "hvolution": 2100,
            "diffHvolution": 75,
            "timestamp": "2025-01-13T07:45:00.000Z"
        }
    ];

    const jsonContent = JSON.stringify(exampleData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `esempio_carico_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    window.showModal('success-modal', 'File JSON di esempio scaricato! Usa questo formato per importare i tuoi dati.');
}

// Utility: formattazione numeri
function formatCaricoNumber(num) {
    if (!num) return '0';
    return new Intl.NumberFormat('it-IT').format(num);
}

// Utility: formattazione differenze
function formatCaricoDiff(diff) {
    if (!diff) return '0';
    return diff > 0 ? `+${diff}` : diff.toString();
}

// Utility: classe CSS per le differenze
function getCaricoGradientClass(diff) {
    if (!diff) return 'diff-zero';
    return diff > 0 ? 'diff-positive' : 'diff-negative';
}

// Utility: formattazione nome autista (solo cognome - prima parola)
function formatDriverName(fullName) {
    if (!fullName || typeof fullName !== 'string') {
        return 'N/D';
    }
    
    // Pulisci la stringa da spazi multipli e caratteri nascosti
    const cleanName = fullName.trim().replace(/\s+/g, ' ');
    
    // Estrai solo la PRIMA parola (anche se il cognome è composto)
    const words = cleanName.split(' ');
    const firstName = words[0];
    
    // Debug per vedere cosa stiamo processando
    if (words.length > 1) {
        console.log('👤 Formato autista:', { 
            original: fullName, 
            cleaned: cleanName, 
            allWords: words,
            displayed: firstName 
        });
    }
    
    return firstName || 'N/D';
}

// Utility: formattazione data per visualizzazione
function formatDateForDisplay(date) {
    // Assicurati che sia un oggetto Date valido
    if (!date || isNaN(date)) {
        console.warn('⚠️ Data non valida per formattazione:', date);
        return 'Data non valida';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Formato italiano corto: dd/mm (senza anno)
    return `${day}/${month}`;
}

// Utility: mostra/nascondi loading
function showCaricoLoading(show) {
    const loadingElement = document.getElementById('carico-loading');
    const tableElement = document.getElementById('carico-table');
    const errorElement = document.getElementById('carico-error');
    
    if (loadingElement) loadingElement.style.display = show ? 'block' : 'none';
    if (tableElement) tableElement.style.display = show ? 'none' : 'block';
    if (errorElement) errorElement.classList.add('hidden');
}

// Utility: mostra errore
function showCaricoError(message) {
    const loadingElement = document.getElementById('carico-loading');
    const tableElement = document.getElementById('carico-table');
    const errorElement = document.getElementById('carico-error');
    const errorText = document.getElementById('carico-error-text');
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (tableElement) tableElement.style.display = 'none';
    if (errorElement) {
        errorElement.classList.remove('hidden');
        if (errorText) errorText.textContent = message;
    }
}

// Test funzionalità localStorage
function testCaricoStorage() {
    console.log('🧪 Test localStorage carico...');
    
    // Test scrittura
    const testData = [
        {
            date: "2025-01-01",
            driver: "Test Driver",
            benzina: 1000,
            timestamp: new Date().toISOString()
        }
    ];
    
    try {
        localStorage.setItem('mystation_carico_test', JSON.stringify(testData));
        const retrieved = localStorage.getItem('mystation_carico_test');
        const parsed = JSON.parse(retrieved);
        
        if (parsed && parsed.length === 1 && parsed[0].driver === "Test Driver") {
            console.log('✅ Test localStorage SUCCESS');
            localStorage.removeItem('mystation_carico_test');
            return true;
        } else {
            console.log('❌ Test localStorage FAILED - dati non corrispondenti');
            return false;
        }
    } catch (error) {
        console.log('❌ Test localStorage FAILED:', error);
        return false;
    }
}

// Inizializzazione automatica quando il DOM è pronto (se non già inizializzata)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚛 DOM ready - carico.js caricato');
    
    // Setup event listeners per la tabella riepilogo
    setupSummaryTableListeners();
    
    // Auto-inizializza solo se siamo nella pagina carico
    setTimeout(() => {
        const caricoContent = document.getElementById('carico-content');
        if (caricoContent && !caricoContent.classList.contains('hidden')) {
            console.log('🚛 Auto-inizializzazione carico (pagina attiva)');
            initCaricoFunctionality();
        }
    }, 500);
});

// FUNZIONI TABELLA RIEPILOGO

// Setup event listeners per la tabella riepilogo
function setupSummaryTableListeners() {
    // Aggiorna header anno precedente all'inizializzazione
    updatePreviousYearHeader();
    
    // Event listeners per gli input anno precedente
    const prevInputs = document.querySelectorAll('.prev-year-input');
    prevInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Riaggiorna i totali quando cambiano i valori dell'anno precedente
            updateSummaryTable();
            // Salva i valori aggiornati
            savePreviousYearData();
        });
        
        input.addEventListener('blur', function() {
            // Forza il salvataggio quando l'utente esce dal campo
            savePreviousYearData();
        });
    });
    
    console.log('📋 Event listeners tabella riepilogo configurati');
}

// Aggiorna la tabella riepilogo con i dati attuali
function updateSummaryTable() {
    // Aggiorna il titolo dell'anno precedente dinamicamente
    updatePreviousYearHeader();
    
    // Calcola i dati dalla tabella carico filtrata
    if (!filteredCaricoData || !filteredCaricoData.length) {
        resetSummaryTable();
        return;
    }

    console.log('📊 Aggiornamento tabella riepilogo con', filteredCaricoData.length, 'record');

    // Calcola totali per prodotto e separa le differenze positive e negative
    const summary = {
        benzina: { litri: 0, diffPositive: 0, diffNegative: 0, diffTotal: 0 },
        gasolio: { litri: 0, diffPositive: 0, diffNegative: 0, diffTotal: 0 },
        diesel: { litri: 0, diffPositive: 0, diffNegative: 0, diffTotal: 0 },
        hvolution: { litri: 0, diffPositive: 0, diffNegative: 0, diffTotal: 0 }
    };

    filteredCaricoData.forEach(row => {
        // Benzina
        summary.benzina.litri += row.benzina || 0;
        const diffBenzina = row.diffBenzina || 0;
        if (diffBenzina > 0) summary.benzina.diffPositive += diffBenzina;
        if (diffBenzina < 0) summary.benzina.diffNegative += Math.abs(diffBenzina);
        summary.benzina.diffTotal += diffBenzina;
        
        // Gasolio
        summary.gasolio.litri += row.gasolio || 0;
        const diffGasolio = row.diffGasolio || 0;
        if (diffGasolio > 0) summary.gasolio.diffPositive += diffGasolio;
        if (diffGasolio < 0) summary.gasolio.diffNegative += Math.abs(diffGasolio);
        summary.gasolio.diffTotal += diffGasolio;
        
        // Diesel
        summary.diesel.litri += row.diesel || 0;
        const diffDiesel = row.diffDiesel || 0;
        if (diffDiesel > 0) summary.diesel.diffPositive += diffDiesel;
        if (diffDiesel < 0) summary.diesel.diffNegative += Math.abs(diffDiesel);
        summary.diesel.diffTotal += diffDiesel;
        
        // Hvolution
        summary.hvolution.litri += row.hvolution || 0;
        const diffHvolution = row.diffHvolution || 0;
        if (diffHvolution > 0) summary.hvolution.diffPositive += diffHvolution;
        if (diffHvolution < 0) summary.hvolution.diffNegative += Math.abs(diffHvolution);
        summary.hvolution.diffTotal += diffHvolution;
    });

    // Aggiorna la tabella per ogni prodotto
    updateProductRow('benzina', summary.benzina);
    updateProductRow('gasolio', summary.gasolio);
    updateProductRow('diesel', summary.diesel);
    updateProductRow('hvolution', summary.hvolution);

    // Calcola e aggiorna totali
    updateTotalRow(summary);
    
    // Aggiorna anno nel titolo
    const currentYear = new Date().getFullYear();
    const titleElement = document.getElementById('summary-year-title');
    if (titleElement) {
        titleElement.textContent = `TOTALE ANNO (${currentYear})`;
    }
    
    console.log('✅ Tabella riepilogo aggiornata');
}

// Aggiorna il titolo della colonna anno precedente
function updatePreviousYearHeader() {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const headerElement = document.getElementById('prev-year-header');
    if (headerElement) {
        headerElement.textContent = `(${previousYear})`;
    }
}

function updateProductRow(product, data) {
    const litri = data.litri;
    const diffTotal = data.diffTotal;
    const piu = data.diffPositive;
    const meno = data.diffNegative;

    // Aggiorna celle
    const litriElement = document.getElementById(`summary-${product}-litri`);
    const piuElement = document.getElementById(`summary-${product}-piu`);
    const menoElement = document.getElementById(`summary-${product}-meno`);
    const diffElement = document.getElementById(`summary-${product}-diff`);
    const totalElement = document.getElementById(`summary-${product}-total`);
    
    if (litriElement) litriElement.textContent = formatSummaryNumber(litri);
    if (piuElement) piuElement.textContent = formatSummaryNumber(piu);
    if (menoElement) menoElement.textContent = formatSummaryNumber(meno);
    
    if (diffElement) {
        diffElement.textContent = formatSummaryDiff(diffTotal);
        diffElement.className = `diff-cell ${getDiffClass(diffTotal)}`;
    }

    // Calcola totale: LITRI + DIFFERENZA + ANNO_PRECEDENTE
    const prevInput = document.getElementById(`summary-${product}-prev`);
    const prevValue = prevInput ? parseInt(prevInput.value) || 0 : 0;
    const total = litri + diffTotal + prevValue;
    
    if (totalElement) totalElement.textContent = formatSummaryNumber(total);
}

function updateTotalRow(summary) {
    const totalLitri = summary.benzina.litri + summary.gasolio.litri + summary.diesel.litri + summary.hvolution.litri;
    const totalDiffTotal = summary.benzina.diffTotal + summary.gasolio.diffTotal + summary.diesel.diffTotal + summary.hvolution.diffTotal;
    const totalPiu = summary.benzina.diffPositive + summary.gasolio.diffPositive + summary.diesel.diffPositive + summary.hvolution.diffPositive;
    const totalMeno = summary.benzina.diffNegative + summary.gasolio.diffNegative + summary.diesel.diffNegative + summary.hvolution.diffNegative;

    const elements = {
        litri: document.getElementById('summary-total-litri'),
        piu: document.getElementById('summary-total-piu'),
        meno: document.getElementById('summary-total-meno'),
        diff: document.getElementById('summary-total-diff'),
        prev: document.getElementById('summary-total-prev'),
        final: document.getElementById('summary-total-final')
    };

    if (elements.litri) elements.litri.textContent = formatSummaryNumber(totalLitri);
    if (elements.piu) elements.piu.textContent = formatSummaryNumber(totalPiu);
    if (elements.meno) elements.meno.textContent = formatSummaryNumber(totalMeno);
    
    if (elements.diff) {
        elements.diff.textContent = formatSummaryDiff(totalDiffTotal);
        elements.diff.className = `diff-cell ${getDiffClass(totalDiffTotal)}`;
    }

    // Calcola totale anno precedente
    const prevBenzina = parseInt(document.getElementById('summary-benzina-prev')?.value) || 0;
    const prevGasolio = parseInt(document.getElementById('summary-gasolio-prev')?.value) || 0;
    const prevDiesel = parseInt(document.getElementById('summary-diesel-prev')?.value) || 0;
    const prevHvolution = parseInt(document.getElementById('summary-hvolution-prev')?.value) || 0;
    const totalPrev = prevBenzina + prevGasolio + prevDiesel + prevHvolution;

    if (elements.prev) elements.prev.textContent = formatSummaryNumber(totalPrev);
    
    // Calcola totale finale: LITRI + DIFFERENZA + ANNO_PRECEDENTE
    const finalTotal = totalLitri + totalDiffTotal + totalPrev;
    if (elements.final) elements.final.textContent = formatSummaryNumber(finalTotal);
}

function resetSummaryTable() {
    // Aggiorna il titolo dell'anno precedente
    updatePreviousYearHeader();
    
    const products = ['benzina', 'gasolio', 'diesel', 'hvolution'];
    
    products.forEach(product => {
        const elements = {
            litri: document.getElementById(`summary-${product}-litri`),
            piu: document.getElementById(`summary-${product}-piu`),
            meno: document.getElementById(`summary-${product}-meno`),
            diff: document.getElementById(`summary-${product}-diff`),
            total: document.getElementById(`summary-${product}-total`)
        };
        
        if (elements.litri) elements.litri.textContent = '0';
        if (elements.piu) elements.piu.textContent = '0';
        if (elements.meno) elements.meno.textContent = '0';
        if (elements.diff) {
            elements.diff.textContent = '0';
            elements.diff.className = 'diff-cell zero';
        }
        if (elements.total) elements.total.textContent = '0';
    });

    // Reset totali
    const totalElements = {
        litri: document.getElementById('summary-total-litri'),
        piu: document.getElementById('summary-total-piu'),
        meno: document.getElementById('summary-total-meno'),
        diff: document.getElementById('summary-total-diff'),
        prev: document.getElementById('summary-total-prev'),
        final: document.getElementById('summary-total-final')
    };
    
    Object.values(totalElements).forEach(element => {
        if (element) {
            element.textContent = '0';
            if (element.id === 'summary-total-diff') {
                element.className = 'diff-cell zero';
            }
        }
    });
}

// Salva valori anno precedente nel localStorage
function savePreviousYearData() {
    try {
        const prevData = {
            benzina: parseInt(document.getElementById('summary-benzina-prev')?.value) || 0,
            gasolio: parseInt(document.getElementById('summary-gasolio-prev')?.value) || 0,
            diesel: parseInt(document.getElementById('summary-diesel-prev')?.value) || 0,
            hvolution: parseInt(document.getElementById('summary-hvolution-prev')?.value) || 0
        };
        
        localStorage.setItem('mystation_carico_prev_year', JSON.stringify(prevData));
        console.log('💾 Dati anno precedente salvati:', prevData);
        return true;
    } catch (error) {
        console.error('❌ Errore salvataggio anno precedente:', error);
        return false;
    }
}

// Carica valori anno precedente dal localStorage
function loadPreviousYearData() {
    try {
        const stored = localStorage.getItem('mystation_carico_prev_year');
        if (stored) {
            const prevData = JSON.parse(stored);
            
            // Imposta i valori negli input
            const elements = {
                benzina: document.getElementById('summary-benzina-prev'),
                gasolio: document.getElementById('summary-gasolio-prev'),
                diesel: document.getElementById('summary-diesel-prev'),
                hvolution: document.getElementById('summary-hvolution-prev')
            };
            
            Object.keys(elements).forEach(product => {
                if (elements[product] && prevData[product] !== undefined) {
                    elements[product].value = prevData[product];
                }
            });
            
            console.log('📂 Dati anno precedente caricati:', prevData);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Errore caricamento anno precedente:', error);
        return false;
    }
}

// Utility functions per la tabella riepilogo
function formatSummaryNumber(num) {
    if (!num || num === 0) return '0';
    return new Intl.NumberFormat('it-IT').format(num);
}

function formatSummaryDiff(diff) {
    if (!diff || diff === 0) return '0';
    return diff > 0 ? `+${diff}` : diff.toString();
}

function getDiffClass(diff) {
    if (!diff || diff === 0) return 'zero';
    return diff > 0 ? 'positive' : 'negative';
}

// Esposizione funzioni globali
window.initCaricoFunctionality = initCaricoFunctionality;
window.exportCaricoData = exportCaricoData;
window.importCaricoJSON = importCaricoJSON;
window.generateExampleJSON = generateExampleJSON;
window.testCaricoStorage = testCaricoStorage;
window.toggleEditMode = toggleEditMode;
window.formatDriverName = formatDriverName; // Espongo per debug

// Esponi funzioni globali per la tabella riepilogo
window.updateSummaryTable = updateSummaryTable;
window.resetSummaryTable = resetSummaryTable;
window.savePreviousYearData = savePreviousYearData;
window.loadPreviousYearData = loadPreviousYearData;
window.updatePreviousYearHeader = updatePreviousYearHeader;

// Debug: verifica che le funzioni siano esposte
console.log('🚛 Funzioni carico esposte globalmente:');
console.log('- initCaricoFunctionality:', typeof window.initCaricoFunctionality);
console.log('- exportCaricoData:', typeof window.exportCaricoData);
console.log('- toggleEditMode:', typeof window.toggleEditMode);
console.log('- formatDriverName:', typeof window.formatDriverName);

// Funzione di test per verificare il formato nomi
window.testDriverNames = function() {
    console.log('🧪 Test formattazione nomi autisti:');
    
    if (!filteredCaricoData || filteredCaricoData.length === 0) {
        console.log('❌ Nessun dato carico disponibile per il test');
        return;
    }
    
    // Analizza i primi 10 autisti
    const sampleDrivers = filteredCaricoData.slice(0, 10);
    sampleDrivers.forEach((record, index) => {
        const original = record.driver;
        const formatted = formatDriverName(original);
        console.log(`${index + 1}. "${original}" → "${formatted}"`);
    });
    
    // Statistiche
    const uniqueDrivers = [...new Set(filteredCaricoData.map(r => r.driver))];
    console.log(`📊 Trovati ${uniqueDrivers.length} autisti unici nei dati filtrati`);
};