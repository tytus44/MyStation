/**
 * AMMINISTRAZIONE.JS
 * Gestione completa della sezione amministrazione clienti
 * con transazioni, storico e funzionalità di import/export
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // ELEMENTI DOM
    // ============================================

    // Griglia e ricerca
    const clientsGrid = document.getElementById('clients-grid');
    const searchClientInput = document.getElementById('search-client-input');
    const clearClientSearchBtn = document.getElementById('clear-client-search-btn');

    // Pulsanti toolbar
    const newClientBtn = document.getElementById('new-client-btn');
    const importClientsBtn = document.getElementById('import-clients-btn');
    const exportClientsBtn = document.getElementById('export-clients-btn');
    const printClientsBtn = document.getElementById('print-clients-btn');

    // Modale nuovo cliente
    const newClientModal = document.getElementById('new-client-modal');
    const closeClientModalBtn = document.getElementById('close-client-modal-btn');
    const saveClientBtn = document.getElementById('save-client-btn');

    // Modale transazione
    const transactionModal = document.getElementById('transaction-modal');
    const closeTransactionModalBtn = document.getElementById('close-transaction-modal-btn');
    const clientNameHeader = document.getElementById('client-name-header');
    const clientBalanceHeader = document.getElementById('client-balance-header');

    // Pulsanti transazione
    const payFullBtn = document.getElementById('pay-full-btn');
    const payPartialBtn = document.getElementById('pay-partial-btn');
    const printTransactionBtn = document.getElementById('print-transaction-btn');
    const deleteClientBtn = document.getElementById('delete-client-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');

    // Modale storico
    const historyModal = document.getElementById('history-modal');
    const closeHistoryModalBtn = document.getElementById('close-history-modal-btn');
    const historyTableBody = document.getElementById('history-table-body');
    const historyClientName = document.getElementById('history-client-name');

    // Input nascosti
    const clientsFileInput = document.getElementById('clients-file-input');

    // Alert personalizzato
    const customAlertBox = document.getElementById('custom-alert-box');

    // ============================================
    // STATO APPLICAZIONE
    // ============================================

    let allClients = [];
    let currentClientIndex = -1;
    let editingTransactionIndex = -1;

    // ============================================
    // FUNZIONI UTILITY
    // ============================================

    /**
     * Mostra alert personalizzato
     */
    function showAlert(message) {
        customAlertBox.textContent = message;
        customAlertBox.classList.add('show');
        setTimeout(() => {
            customAlertBox.classList.remove('show');
        }, 3000);
    }

    /**
     * Genera colore casuale per icone
     */
    function getRandomColor() {
        const colors = [
            '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A1FF33', '#5733FF',
            '#FFC300', '#C70039', '#900C3F', '#581845', '#E96479', '#D63484',
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#6C5CE7'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Formatta numero con separatore migliaia e simbolo euro
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Parsifica stringa valuta in numero
     */
    function parseCurrency(str) {
        if (!str) return 0;
        // Rimuove tutto tranne numeri, virgola e punto
        const cleanStr = str.replace(/[^\d,.-]/g, '');
        // Sostituisce virgola con punto per parsing
        const normalized = cleanStr.replace(',', '.');
        return parseFloat(normalized) || 0;
    }

    /**
     * Formatta data in formato italiano
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    /**
     * Converte data italiana in formato ISO
     */
    function parseItalianDate(dateStr) {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
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
     * Calcola totale cliente
     */
    function calculateClientTotal(client) {
        if (!client.transactions || client.transactions.length === 0) {
            return 0;
        }
        return client.transactions.reduce((total, trans) => {
            // Le transazioni negative sono pagamenti
            return total + (trans.amount || 0);
        }, 0);
    }

    // ============================================
    // RENDERING
    // ============================================

    /**
     * Renderizza griglia clienti
     */
    function renderClients(clients) {
        if (!clientsGrid) return;

        clientsGrid.innerHTML = '';

        if (clients.length === 0) {
            clientsGrid.innerHTML = '<p style="text-align: center; color: #61667A; padding: 40px;">Nessun cliente trovato.</p>';
            return;
        }

        clients.forEach((client, index) => {
            const clientBox = document.createElement('div');
            clientBox.classList.add('client-box');
            clientBox.dataset.clientIndex = index;

            const total = calculateClientTotal(client);
            const totalClass = total > 0 ? 'client-debt' : 'client-credit';

            clientBox.innerHTML = `
                <div class="client-header">
                    <div class="client-icon-container" style="background: ${client.color || getRandomColor()}">
                        <i class="fa-solid fa-coins"></i>
                    </div>
                    <div class="client-details">
                        <h3 class="client-name">${client.name || 'Cliente Sconosciuto'}</h3>
                        <p class="client-total ${totalClass}">${formatCurrency(Math.abs(total))}</p>
                    </div>
                </div>
                <div class="client-status">
                    ${total > 0 ? '<span class="status-badge debt">Da pagare</span>' :
                      total < 0 ? '<span class="status-badge credit">Credito</span>' :
                      '<span class="status-badge paid">Saldato</span>'}
                </div>
            `;

            // Click su box cliente apre modale transazione
            clientBox.addEventListener('click', () => openTransactionModal(index));

            clientsGrid.appendChild(clientBox);
        });
    }

    /**
     * Renderizza tabella storico
     */
    function renderHistory(client) {
        if (!historyTableBody) return;

        historyTableBody.innerHTML = '';

        if (!client.transactions || client.transactions.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #61667A;">Nessuna transazione registrata</td>
                </tr>
            `;
            return;
        }

        client.transactions.forEach((trans, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="text" class="history-date-input" value="${formatDate(trans.date)}"
                           data-trans-index="${index}" data-field="date">
                </td>
                <td>
                    <input type="text" class="history-desc-input" value="${trans.description || ''}"
                           data-trans-index="${index}" data-field="description">
                </td>
                <td class="${trans.amount > 0 ? 'amount-positive' : 'amount-negative'}">
                    <input type="text" class="history-amount-input" value="${formatCurrency(trans.amount)}"
                           data-trans-index="${index}" data-field="amount">
                </td>
                <td>
                    <span class="history-type ${trans.type || 'charge'}">${getTransactionTypeLabel(trans.type)}</span>
                </td>
                <td>
                    <button class="history-delete-btn" data-trans-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            historyTableBody.appendChild(row);
        });

        // Aggiungi event listeners per modifica inline
        historyTableBody.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', handleHistoryEdit);
        });

        // Aggiungi event listeners per eliminazione
        historyTableBody.querySelectorAll('.history-delete-btn').forEach(btn => {
            btn.addEventListener('click', handleHistoryDelete);
        });
    }

    /**
     * Ottiene etichetta tipo transazione
     */
    function getTransactionTypeLabel(type) {
        const labels = {
            'charge': 'Addebito',
            'payment': 'Pagamento',
            'partial': 'Acconto'
        };
        return labels[type] || 'Addebito';
    }

    // ============================================
    // GESTIONE MODALI
    // ============================================

    /**
     * Apre modale nuovo cliente
     */
    function openNewClientModal() {
        if (!newClientModal) return;

        // Reset form
        document.getElementById('client-name-input').value = '';
        document.getElementById('client-initial-balance').value = '';

        newClientModal.style.display = 'flex';
    }

    /**
     * Chiude modale nuovo cliente
     */
    function closeNewClientModal() {
        if (!newClientModal) return;
        newClientModal.style.display = 'none';
    }

    /**
     * Apre modale transazione
     */
    function openTransactionModal(index) {
        if (!transactionModal || index < 0 || index >= allClients.length) return;

        currentClientIndex = index;
        const client = allClients[index];
        const total = calculateClientTotal(client);

        // Aggiorna header
        clientNameHeader.textContent = client.name;
        clientBalanceHeader.textContent = formatCurrency(total);
        clientBalanceHeader.className = total > 0 ? 'balance-debt' : 'balance-credit';

        // Reset form
        document.getElementById('transaction-date').value = getTodayISO();
        document.getElementById('transaction-description').value = '';
        document.getElementById('transaction-amount').value = '';

        transactionModal.style.display = 'flex';
    }

    /**
     * Chiude modale transazione
     */
    function closeTransactionModal() {
        if (!transactionModal) return;
        transactionModal.style.display = 'none';
        currentClientIndex = -1;
    }

    /**
     * Apre modale storico
     */
    function openHistoryModal() {
        if (!historyModal || currentClientIndex < 0) return;

        const client = allClients[currentClientIndex];
        historyClientName.textContent = client.name;

        renderHistory(client);
        historyModal.style.display = 'flex';
    }

    /**
     * Chiude modale storico
     */
    function closeHistoryModal() {
        if (!historyModal) return;
        historyModal.style.display = 'none';
    }

    // ============================================
    // GESTIONE CLIENTI
    // ============================================

    /**
     * Salva nuovo cliente
     */
    function saveNewClient() {
        const name = document.getElementById('client-name-input').value.trim();
        const initialBalance = parseCurrency(document.getElementById('client-initial-balance').value);

        if (!name) {
            showAlert('Il nome del cliente è obbligatorio');
            return;
        }

        const newClient = {
            id: Date.now().toString(),
            name: name,
            color: getRandomColor(),
            transactions: [],
            createdAt: new Date().toISOString()
        };

        // Se c'è un saldo iniziale, crea transazione
        if (initialBalance !== 0) {
            newClient.transactions.push({
                date: getTodayISO(),
                description: 'Saldo iniziale',
                amount: initialBalance,
                type: initialBalance > 0 ? 'charge' : 'payment'
            });
        }

        allClients.push(newClient);
        renderClients(allClients);
        closeNewClientModal();
        saveToLocalStorage();
        showAlert('Cliente aggiunto con successo');
    }

    /**
     * Elimina cliente
     */
    function deleteClient() {
        if (currentClientIndex < 0) return;

        const client = allClients[currentClientIndex];

        if (confirm(`Sei sicuro di voler eliminare il cliente "${client.name}"? Questa azione non può essere annullata.`)) {
            allClients.splice(currentClientIndex, 1);
            renderClients(allClients);
            closeTransactionModal();
            saveToLocalStorage();
            showAlert('Cliente eliminato');
        }
    }

    // ============================================
    // GESTIONE TRANSAZIONI
    // ============================================

    /**
     * Aggiunge transazione
     */
    function addTransaction(type) {
        if (currentClientIndex < 0) return;

        const date = document.getElementById('transaction-date').value;
        const description = document.getElementById('transaction-description').value.trim() || 'Carburante';
        const amount = parseCurrency(document.getElementById('transaction-amount').value);

        if (!date) {
            showAlert('La data è obbligatoria');
            return;
        }

        if (amount <= 0) {
            showAlert('L\'importo deve essere maggiore di zero');
            return;
        }

        const client = allClients[currentClientIndex];

        if (!client.transactions) {
            client.transactions = [];
        }

        // Determina l'importo in base al tipo
        let transactionAmount = amount;
        let transactionType = type;

        if (type === 'payment' || type === 'partial') {
            transactionAmount = -amount; // Pagamenti sono negativi
        } else {
            transactionType = 'charge';
        }

        // Aggiungi transazione
        client.transactions.push({
            date: date,
            description: description,
            amount: transactionAmount,
            type: transactionType,
            timestamp: new Date().toISOString()
        });

        // Aggiorna UI
        const total = calculateClientTotal(client);
        clientBalanceHeader.textContent = formatCurrency(total);
        clientBalanceHeader.className = total > 0 ? 'balance-debt' : 'balance-credit';

        // Reset form
        document.getElementById('transaction-description').value = '';
        document.getElementById('transaction-amount').value = '';

        // Salva e aggiorna
        saveToLocalStorage();
        renderClients(allClients);

        const message = type === 'payment' ? 'Pagamento completo registrato' :
                       type === 'partial' ? 'Acconto registrato' :
                       'Addebito registrato';
        showAlert(message);

        // Se pagamento completo e saldo è 0, chiudi modale
        if (type === 'payment' && Math.abs(total) < 0.01) {
            setTimeout(() => closeTransactionModal(), 1500);
        }
    }

    /**
     * Gestisce modifica storico
     */
    function handleHistoryEdit(e) {
        const input = e.target;
        const transIndex = parseInt(input.dataset.transIndex);
        const field = input.dataset.field;

        if (currentClientIndex < 0 || transIndex < 0) return;

        const client = allClients[currentClientIndex];
        const transaction = client.transactions[transIndex];

        switch(field) {
            case 'date':
                const isoDate = parseItalianDate(input.value);
                if (isoDate) {
                    transaction.date = isoDate;
                }
                break;
            case 'description':
                transaction.description = input.value;
                break;
            case 'amount':
                const amount = parseCurrency(input.value);
                transaction.amount = amount;
                transaction.type = amount > 0 ? 'charge' : 'payment';
                break;
        }

        saveToLocalStorage();
        renderClients(allClients);

        // Aggiorna balance nel modale transazione
        const total = calculateClientTotal(client);
        clientBalanceHeader.textContent = formatCurrency(total);
        clientBalanceHeader.className = total > 0 ? 'balance-debt' : 'balance-credit';
    }

    /**
     * Gestisce eliminazione da storico
     */
    function handleHistoryDelete(e) {
        const btn = e.target.closest('.history-delete-btn');
        const transIndex = parseInt(btn.dataset.transIndex);

        if (currentClientIndex < 0 || transIndex < 0) return;

        if (confirm('Eliminare questa transazione?')) {
            const client = allClients[currentClientIndex];
            client.transactions.splice(transIndex, 1);

            saveToLocalStorage();
            renderClients(allClients);
            renderHistory(client);

            // Aggiorna balance
            const total = calculateClientTotal(client);
            clientBalanceHeader.textContent = formatCurrency(total);
            clientBalanceHeader.className = total > 0 ? 'balance-debt' : 'balance-credit';

            showAlert('Transazione eliminata');
        }
    }

    /**
     * Stampa transazione
     */
    function printTransaction() {
        if (currentClientIndex < 0) return;

        const client = allClients[currentClientIndex];
        const total = calculateClientTotal(client);

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Riepilogo ${client.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .info { margin: 20px 0; }
                    .total { font-size: 24px; font-weight: bold; color: ${total > 0 ? '#DC2626' : '#2ECC71'}; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f5f5f5; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <h1>Riepilogo Cliente</h1>
                <div class="info">
                    <p><strong>Cliente:</strong> ${client.name}</p>
                    <p><strong>Data stampa:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
                    <p class="total">Saldo: ${formatCurrency(total)}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descrizione</th>
                            <th>Importo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${client.transactions.map(t => `
                            <tr>
                                <td>${formatDate(t.date)}</td>
                                <td>${t.description}</td>
                                <td style="color: ${t.amount > 0 ? '#DC2626' : '#2ECC71'}">${formatCurrency(t.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // ============================================
    // RICERCA
    // ============================================

    /**
     * Aggiorna UI ricerca
     */
    function updateSearchUI(query) {
        if (!clearClientSearchBtn) return;
        clearClientSearchBtn.style.display = query.length > 0 ? 'block' : 'none';
    }

    /**
     * Filtra clienti
     */
    function filterClients(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const filteredClients = allClients.filter(client => {
            const name = (client.name || '').toLowerCase();
            return name.includes(normalizedQuery);
        });
        renderClients(filteredClients);
    }

    // ============================================
    // IMPORT/EXPORT
    // ============================================

    /**
     * Esporta clienti in JSON
     */
    function exportClients() {
        const dataStr = JSON.stringify(allClients, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `clienti_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showAlert('Clienti esportati con successo');
    }

    /**
     * Importa clienti da JSON
     */
    function importClients(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedClients = JSON.parse(e.target.result);
                if (Array.isArray(importedClients)) {
                    // Aggiungi colori casuali se mancanti
                    importedClients.forEach(client => {
                        if (!client.color) {
                            client.color = getRandomColor();
                        }
                        if (!client.transactions) {
                            client.transactions = [];
                        }
                    });

                    allClients = [...allClients, ...importedClients];
                    renderClients(allClients);
                    saveToLocalStorage();
                    showAlert(`${importedClients.length} clienti importati con successo`);
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
     * Stampa lista clienti
     */
    function printClientsList() {
        const printWindow = window.open('', '_blank');
        const clientsHTML = allClients.map(client => {
            const total = calculateClientTotal(client);
            return `
                <tr>
                    <td>${client.name}</td>
                    <td style="text-align: right; color: ${total > 0 ? '#DC2626' : '#2ECC71'}">
                        ${formatCurrency(total)}
                    </td>
                </tr>
            `;
        }).join('');

        const totalGeneral = allClients.reduce((sum, client) => sum + calculateClientTotal(client), 0);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Lista Clienti</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f5f5f5; font-weight: bold; }
                    .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <h1>Lista Clienti - ${new Date().toLocaleDateString('it-IT')}</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th style="text-align: right;">Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientsHTML}
                        <tr class="total-row">
                            <td>TOTALE GENERALE</td>
                            <td style="text-align: right; color: ${totalGeneral > 0 ? '#DC2626' : '#2ECC71'}">
                                ${formatCurrency(totalGeneral)}
                            </td>
                        </tr>
                    </tbody>
                </table>
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
     * Salva dati in localStorage
     */
    function saveToLocalStorage() {
        if (window.MemoriaStorage) {
            MemoriaStorage.saveClients(allClients);
        }
    }

    /**
     * Carica dati da localStorage
     */
    function loadFromLocalStorage() {
        if (window.MemoriaStorage) {
            allClients = MemoriaStorage.loadClients();
            renderClients(allClients);
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    // Ricerca
    if (searchClientInput) {
        searchClientInput.addEventListener('input', (e) => {
            const query = e.target.value;
            updateSearchUI(query);
            filterClients(query);
        });
    }

    if (clearClientSearchBtn) {
        clearClientSearchBtn.addEventListener('click', () => {
            searchClientInput.value = '';
            updateSearchUI('');
            renderClients(allClients);
        });
    }

    // Toolbar buttons
    if (newClientBtn) {
        newClientBtn.addEventListener('click', openNewClientModal);
    }

    if (importClientsBtn) {
        importClientsBtn.addEventListener('click', () => {
            clientsFileInput.click();
        });
    }

    if (exportClientsBtn) {
        exportClientsBtn.addEventListener('click', exportClients);
    }

    if (printClientsBtn) {
        printClientsBtn.addEventListener('click', printClientsList);
    }

    // File input
    if (clientsFileInput) {
        clientsFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importClients(file);
            }
            clientsFileInput.value = '';
        });
    }

    // Modale nuovo cliente
    if (closeClientModalBtn) {
        closeClientModalBtn.addEventListener('click', closeNewClientModal);
    }

    if (saveClientBtn) {
        saveClientBtn.addEventListener('click', saveNewClient);
    }

    // Modale transazione
    if (closeTransactionModalBtn) {
        closeTransactionModalBtn.addEventListener('click', closeTransactionModal);
    }

    if (payFullBtn) {
        payFullBtn.addEventListener('click', () => addTransaction('payment'));
    }

    if (payPartialBtn) {
        payPartialBtn.addEventListener('click', () => addTransaction('partial'));
    }

    if (printTransactionBtn) {
        printTransactionBtn.addEventListener('click', printTransaction);
    }

    if (deleteClientBtn) {
        deleteClientBtn.addEventListener('click', deleteClient);
    }

    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', openHistoryModal);
    }

    // Modale storico
    if (closeHistoryModalBtn) {
        closeHistoryModalBtn.addEventListener('click', closeHistoryModal);
    }

    // Click fuori dai modali per chiuderli
    window.addEventListener('click', (event) => {
        if (event.target === newClientModal) {
            closeNewClientModal();
        }
        if (event.target === transactionModal) {
            closeTransactionModal();
        }
        if (event.target === historyModal) {
            closeHistoryModal();
        }
    });

    // Formattazione automatica importo durante digitazione
    const amountInput = document.getElementById('transaction-amount');
    if (amountInput) {
        amountInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d,]/g, '');
            // Limita a 2 decimali
            const parts = value.split(',');
            if (parts[1] && parts[1].length > 2) {
                parts[1] = parts[1].substring(0, 2);
                value = parts.join(',');
                e.target.value = value;
            }
        });
    }

    // ============================================
    // INIZIALIZZAZIONE
    // ============================================

    // Carica dati all'avvio
    loadFromLocalStorage();

    // Se non ci sono clienti, mostra messaggio
    if (allClients.length === 0 && clientsGrid) {
        renderClients([]);
    }
});
