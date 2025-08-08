/**
 * REGISTRO.JS
 * Gestione completa del registro di carico
 * con filtri avanzati e funzionalità di import/export
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // ELEMENTI DOM
    // ============================================
    
    // Griglia e filtri
    const registroGrid = document.getElementById('registro-grid');
    const filterPeriodSelect = document.getElementById('filter-period-select');
    const filterValueSelect = document.getElementById('filter-value-select');
    const confirmFilterBtn = document.getElementById('confirm-filter-btn');
    const resetFilterBtn = document.getElementById('reset-filter-btn');
    
    // Pulsanti toolbar
    const newLoadBtn = document.getElementById('new-load-btn');
    const importRegistroBtn = document.getElementById('import-registro-btn');
    const exportRegistroBtn = document.getElementById('export-registro-btn');
    const printRegistroBtn = document.getElementById('print-registro-btn');
    const resetYearBtn = document.getElementById('reset-year-btn');
    
    // Modale nuovo carico
    const newLoadModal = document.getElementById('new-load-modal');
    const closeLoadModalBtn = document.getElementById('close-load-modal-btn');
    const saveLoadBtn = document.getElementById('save-load-btn');
    
    // Input file nascosto
    const registroFileInput = document.getElementById('registro-file-input');
    
    // Alert personalizzato
    const customAlertBox = document.getElementById('custom-alert-box');
    
    // ============================================
    // STATO APPLICAZIONE
    // ============================================
    
    let allLoads = [];
    let filteredLoads = [];
    let currentFilter = {
        period: 'anno',
        value: new Date().getFullYear().toString()
    };
    
    // ============================================
    // CONFIGURAZIONE FILTRI
    // ============================================
    
    const months = [
        { value: '01', label: 'Gennaio' },
        { value: '02', label: 'Febbraio' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Aprile' },
        { value: '05', label: 'Maggio' },
        { value: '06', label: 'Giugno' },
        { value: '07', label: 'Luglio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Settembre' },
        { value: '10', label: 'Ottobre' },
        { value: '11', label: 'Novembre' },
        { value: '12', label: 'Dicembre' }
    ];
    
    const quarters = [
        { value: 'Q1', label: '1° Trimestre (Gen-Mar)' },
        { value: 'Q2', label: '2° Trimestre (Apr-Giu)' },
        { value: 'Q3', label: '3° Trimestre (Lug-Set)' },
        { value: 'Q4', label: '4° Trimestre (Ott-Dic)' }
    ];
    
    const semesters = [
        { value: 'S1', label: '1° Semestre (Gen-Giu)' },
        { value: 'S2', label: '2° Semestre (Lug-Dic)' }
    ];
    
    // ============================================
    // FUNZIONI UTILITY
    // ============================================
    
    /**
     * Mostra alert personalizzato
     */
    function showAlert(message) {
        if (!customAlertBox) return;
        customAlertBox.textContent = message;
        customAlertBox.classList.add('show');
        setTimeout(() => {
            customAlertBox.classList.remove('show');
        }, 3000);
    }
    
    /**
     * Genera ID univoco
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Formatta data in formato italiano
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    /**
     * Ottiene data odierna in formato ISO
     */
    function getTodayISO() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Formatta numero con separatore migliaia
     */
    function formatNumber(num) {
        return new Intl.NumberFormat('it-IT').format(num);
    }
    
    /**
     * Calcola totali del periodo
     */
    function calculateTotals(loads) {
        return loads.reduce((totals, load) => {
            totals.quantity += parseFloat(load.quantity || 0);
            totals.value += parseFloat(load.value || 0);
            totals.count++;
            return totals;
        }, { quantity: 0, value: 0, count: 0 });
    }
    
    // ============================================
    // GESTIONE FILTRI
    // ============================================
    
    /**
     * Aggiorna opzioni del secondo select
     */
    function updateFilterValueOptions() {
        if (!filterValueSelect || !filterPeriodSelect) return;
        
        const period = filterPeriodSelect.value;
        const currentYear = new Date().getFullYear();
        
        filterValueSelect.innerHTML = '';
        
        switch(period) {
            case 'mese':
                months.forEach(month => {
                    const option = document.createElement('option');
                    option.value = month.value;
                    option.textContent = month.label;
                    if (month.value === String(new Date().getMonth() + 1).padStart(2, '0')) {
                        option.selected = true;
                    }
                    filterValueSelect.appendChild(option);
                });
                break;
                
            case 'trimestre':
                quarters.forEach(quarter => {
                    const option = document.createElement('option');
                    option.value = quarter.value;
                    option.textContent = quarter.label;
                    const currentQ = 'Q' + Math.ceil((new Date().getMonth() + 1) / 3);
                    if (quarter.value === currentQ) {
                        option.selected = true;
                    }
                    filterValueSelect.appendChild(option);
                });
                break;
                
            case 'semestre':
                semesters.forEach(semester => {
                    const option = document.createElement('option');
                    option.value = semester.value;
                    option.textContent = semester.label;
                    const currentS = new Date().getMonth() < 6 ? 'S1' : 'S2';
                    if (semester.value === currentS) {
                        option.selected = true;
                    }
                    filterValueSelect.appendChild(option);
                });
                break;
                
            case 'anno':
            default:
                // Ultimi 5 anni
                for (let i = 0; i < 5; i++) {
                    const year = currentYear - i;
                    const option = document.createElement('option');
                    option.value = year.toString();
                    option.textContent = year.toString();
                    if (i === 0) option.selected = true;
                    filterValueSelect.appendChild(option);
                }
                break;
        }
    }
    
    /**
     * Applica filtri ai carichi
     */
    function applyFilters() {
        const period = filterPeriodSelect.value;
        const value = filterValueSelect.value;
        const currentYear = new Date().getFullYear();
        
        filteredLoads = allLoads.filter(load => {
            const loadDate = new Date(load.date);
            const loadMonth = loadDate.getMonth() + 1;
            const loadYear = loadDate.getFullYear();
            
            switch(period) {
                case 'mese':
                    return loadMonth === parseInt(value) && loadYear === currentYear;
                    
                case 'trimestre':
                    const quarter = Math.ceil(loadMonth / 3);
                    return 'Q' + quarter === value && loadYear === currentYear;
                    
                case 'semestre':
                    const semester = loadMonth <= 6 ? 'S1' : 'S2';
                    return semester === value && loadYear === currentYear;
                    
                case 'anno':
                default:
                    return loadYear === parseInt(value);
            }
        });
        
        currentFilter = { period, value };
        renderLoads(filteredLoads);
        updateSummary(filteredLoads);
    }
    
    /**
     * Reset filtri
     */
    function resetFilters() {
        if (filterPeriodSelect) {
            filterPeriodSelect.value = 'anno';
            updateFilterValueOptions();
            applyFilters();
        }
    }
    
    // ============================================
    // RENDERING
    // ============================================
    
    /**
     * Aggiorna riepilogo
     */
    function updateSummary(loads) {
        const summaryEl = document.getElementById('registro-summary');
        if (!summaryEl) return;
        
        const totals = calculateTotals(loads);
        
        summaryEl.innerHTML = `
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">Carichi Totali</div>
                    <div class="summary-value">${totals.count}</div>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-weight"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">Quantità Totale</div>
                    <div class="summary-value">${formatNumber(totals.quantity)} L</div>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-euro-sign"></i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">Valore Totale</div>
                    <div class="summary-value">€ ${formatNumber(totals.value.toFixed(2))}</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Renderizza carichi
     */
    function renderLoads(loads) {
        if (!registroGrid) return;
        
        registroGrid.innerHTML = '';
        
        if (loads.length === 0) {
            registroGrid.innerHTML = '<p style="text-align: center; color: #61667A; padding: 40px;">Nessun carico trovato per il periodo selezionato.</p>';
            return;
        }
        
        // Ordina per data decrescente
        loads.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        loads.forEach(load => {
            const loadCard = document.createElement('div');
            loadCard.classList.add('load-card');
            
            loadCard.innerHTML = `
                <div class="load-header">
                    <div class="load-date">${formatDate(load.date)}</div>
                    <div class="load-actions">
                        <button class="load-action-btn edit-btn" data-id="${load.id}" title="Modifica">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="load-action-btn delete-btn" data-id="${load.id}" title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="load-body">
                    <div class="load-info">
                        <div class="load-label">Fornitore</div>
                        <div class="load-value">${load.supplier || 'N/D'}</div>
                    </div>
                    <div class="load-info">
                        <div class="load-label">Prodotto</div>
                        <div class="load-value">${load.product || 'N/D'}</div>
                    </div>
                    <div class="load-info">
                        <div class="load-label">Quantità</div>
                        <div class="load-value">${formatNumber(load.quantity)} L</div>
                    </div>
                    <div class="load-info">
                        <div class="load-label">Prezzo/L</div>
                        <div class="load-value">€ ${load.pricePerLiter}</div>
                    </div>
                    <div class="load-info highlight">
                        <div class="load-label">Totale</div>
                        <div class="load-value">€ ${formatNumber(load.value.toFixed(2))}</div>
                    </div>
                </div>
                ${load.notes ? `<div class="load-notes"><i class="fas fa-sticky-note"></i> ${load.notes}</div>` : ''}
            `;
            
            registroGrid.appendChild(loadCard);
        });
        
        // Aggiungi event listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => editLoad(e.target.closest('.edit-btn').dataset.id));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteLoad(e.target.closest('.delete-btn').dataset.id));
        });
    }
    
    // ============================================
    // GESTIONE CARICHI
    // ============================================
    
    /**
     * Apre modale nuovo carico
     */
    function openNewLoadModal(loadToEdit = null) {
        if (!newLoadModal) return;
        
        // Reset o popola form
        if (loadToEdit) {
            document.getElementById('load-date').value = loadToEdit.date;
            document.getElementById('load-supplier').value = loadToEdit.supplier || '';
            document.getElementById('load-product').value = loadToEdit.product || '';
            document.getElementById('load-quantity').value = loadToEdit.quantity || '';
            document.getElementById('load-price').value = loadToEdit.pricePerLiter || '';
            document.getElementById('load-notes').value = loadToEdit.notes || '';
            newLoadModal.dataset.editId = loadToEdit.id;
        } else {
            document.getElementById('load-date').value = getTodayISO();
            document.getElementById('load-supplier').value = '';
            document.getElementById('load-product').value = 'Gasolio';
            document.getElementById('load-quantity').value = '';
            document.getElementById('load-price').value = '';
            document.getElementById('load-notes').value = '';
            delete newLoadModal.dataset.editId;
        }
        
        newLoadModal.style.display = 'flex';
    }
    
    /**
     * Chiude modale nuovo carico
     */
    function closeNewLoadModal() {
        if (!newLoadModal) return;
        newLoadModal.style.display = 'none';
    }
    
    /**
     * Salva nuovo carico
     */
    function saveNewLoad() {
        const date = document.getElementById('load-date').value;
        const supplier = document.getElementById('load-supplier').value.trim();
        const product = document.getElementById('load-product').value.trim();
        const quantity = parseFloat(document.getElementById('load-quantity').value);
        const pricePerLiter = parseFloat(document.getElementById('load-price').value);
        const notes = document.getElementById('load-notes').value.trim();
        
        if (!date || !supplier || !product || !quantity || !pricePerLiter) {
            showAlert('Compilare tutti i campi obbligatori');
            return;
        }
        
        const loadData = {
            date,
            supplier,
            product,
            quantity,
            pricePerLiter,
            value: quantity * pricePerLiter,
            notes,
            timestamp: new Date().toISOString()
        };
        
        if (newLoadModal.dataset.editId) {
            // Modifica carico esistente
            const index = allLoads.findIndex(l => l.id === newLoadModal.dataset.editId);
            if (index !== -1) {
                allLoads[index] = { ...allLoads[index], ...loadData };
                showAlert('Carico modificato con successo');
            }
        } else {
            // Nuovo carico
            loadData.id = generateId();
            allLoads.push(loadData);
            showAlert('Carico aggiunto con successo');
        }
        
        saveToLocalStorage();
        applyFilters();
        closeNewLoadModal();
    }
    
    /**
     * Modifica carico
     */
    function editLoad(id) {
        const load = allLoads.find(l => l.id === id);
        if (load) {
            openNewLoadModal(load);
        }
    }
    
    /**
     * Elimina carico
     */
    function deleteLoad(id) {
        if (confirm('Eliminare questo carico?')) {
            allLoads = allLoads.filter(l => l.id !== id);
            saveToLocalStorage();
            applyFilters();
            showAlert('Carico eliminato');
        }
    }
    
    /**
     * Reset anno
     */
    function resetYear() {
        const currentYear = new Date().getFullYear();
        const yearLoads = allLoads.filter(load => {
            return new Date(load.date).getFullYear() === currentYear;
        });
        
        if (yearLoads.length === 0) {
            showAlert('Nessun carico da eliminare per l\'anno corrente');
            return;
        }
        
        if (confirm(`Eliminare tutti i ${yearLoads.length} carichi del ${currentYear}? Questa azione non può essere annullata.`)) {
            allLoads = allLoads.filter(load => {
                return new Date(load.date).getFullYear() !== currentYear;
            });
            saveToLocalStorage();
            applyFilters();
            showAlert(`Eliminati ${yearLoads.length} carichi del ${currentYear}`);
        }
    }
    
    // ============================================
    // IMPORT/EXPORT
    // ============================================
    
    /**
     * Esporta registro
     */
    function exportRegistro() {
        const dataStr = JSON.stringify(allLoads, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `registro_carico_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showAlert('Registro esportato con successo');
    }
    
    /**
     * Importa registro
     */
    function importRegistro(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedLoads = JSON.parse(e.target.result);
                if (Array.isArray(importedLoads)) {
                    // Assegna ID se mancanti
                    importedLoads.forEach(load => {
                        if (!load.id) load.id = generateId();
                    });
                    
                    allLoads = [...allLoads, ...importedLoads];
                    saveToLocalStorage();
                    applyFilters();
                    showAlert(`${importedLoads.length} carichi importati con successo`);
                } else {
                    showAlert('Formato file non valido');
                }
            } catch (error) {
                showAlert('Errore durante l\'importazione del file');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
    
    /**
     * Stampa registro
     */
    function printRegistro() {
        const printWindow = window.open('', '_blank');
        const totals = calculateTotals(filteredLoads);
        
        const loadsHTML = filteredLoads.map(load => `
            <tr>
                <td>${formatDate(load.date)}</td>
                <td>${load.supplier}</td>
                <td>${load.product}</td>
                <td style="text-align: right;">${formatNumber(load.quantity)}</td>
                <td style="text-align: right;">€ ${load.pricePerLiter}</td>
                <td style="text-align: right; font-weight: bold;">€ ${formatNumber(load.value.toFixed(2))}</td>
            </tr>
        `).join('');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Registro di Carico</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .header { margin-bottom: 20px; }
                    .period { color: #666; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f5f5f5; font-weight: bold; }
                    .totals { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 5px; }
                    .totals-row { display: flex; justify-content: space-between; margin: 10px 0; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Registro di Carico</h1>
                    <div class="period">Periodo: ${currentFilter.period} - ${currentFilter.value}</div>
                    <div class="period">Data stampa: ${new Date().toLocaleDateString('it-IT')}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Fornitore</th>
                            <th>Prodotto</th>
                            <th style="text-align: right;">Quantità (L)</th>
                            <th style="text-align: right;">Prezzo/L</th>
                            <th style="text-align: right;">Totale</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${loadsHTML}
                    </tbody>
                </table>
                <div class="totals">
                    <h3>Riepilogo</h3>
                    <div class="totals-row">
                        <span>Numero Carichi:</span>
                        <strong>${totals.count}</strong>
                    </div>
                    <div class="totals-row">
                        <span>Quantità Totale:</span>
                        <strong>${formatNumber(totals.quantity)} L</strong>
                    </div>
                    <div class="totals-row">
                        <span>Valore Totale:</span>
                        <strong>€ ${formatNumber(totals.value.toFixed(2))}</strong>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
    
    // ============================================
    // LOCAL STORAGE
    // ============================================
    
    /**
     * Salva dati
     */
    function saveToLocalStorage() {
        if (window.MemoriaStorage) {
            window.MemoriaStorage.saveRegistro(allLoads);
        }
    }
    
    /**
     * Carica dati
     */
    function loadFromLocalStorage() {
        if (window.MemoriaStorage) {
            allLoads = window.MemoriaStorage.loadRegistro();
        }
        applyFilters();
    }
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    // Filtri
    if (filterPeriodSelect) {
        filterPeriodSelect.addEventListener('change', updateFilterValueOptions);
    }
    
    if (confirmFilterBtn) {
        confirmFilterBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetFilters);
    }
    
    // Toolbar
    if (newLoadBtn) {
        newLoadBtn.addEventListener('click', () => openNewLoadModal());
    }
    
    if (importRegistroBtn) {
        importRegistroBtn.addEventListener('click', () => {
            registroFileInput.click();
        });
    }
    
    if (exportRegistroBtn) {
        exportRegistroBtn.addEventListener('click', exportRegistro);
    }
    
    if (printRegistroBtn) {
        printRegistroBtn.addEventListener('click', printRegistro);
    }
    
    if (resetYearBtn) {
        resetYearBtn.addEventListener('click', resetYear);
    }
    
    // File input
    if (registroFileInput) {
        registroFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importRegistro(file);
            }
            registroFileInput.value = '';
        });
    }
    
    // Modale
    if (closeLoadModalBtn) {
        closeLoadModalBtn.addEventListener('click', closeNewLoadModal);
    }
    
    if (saveLoadBtn) {
        saveLoadBtn.addEventListener('click', saveNewLoad);
    }
    
    // Click fuori dal modale
    window.addEventListener('click', (event) => {
        if (event.target === newLoadModal) {
            closeNewLoadModal();
        }
    });
    
    // ============================================
    // INIZIALIZZAZIONE
    // ============================================
    
    // Inizializza filtri
    updateFilterValueOptions();
    
    // Carica dati
    loadFromLocalStorage();
});