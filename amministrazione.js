/* ========== GESTIONE CREDITI CLIENTI - MYSATION ========== */

let creditiData = [];
let creditiInitialized = false;

// ===== STORAGE =====
function saveCreditiToStorage() {
    try {
        localStorage.setItem('mystation_crediti', JSON.stringify(creditiData));
        console.log('💾 Crediti salvati:', creditiData.length, 'clienti');
    } catch (error) {
        console.error('❌ Errore salvataggio crediti:', error);
    }
}

function loadCreditiFromStorage() {
    try {
        const stored = localStorage.getItem('mystation_crediti');
        creditiData = stored ? JSON.parse(stored) : [];
        console.log('📂 Crediti caricati:', creditiData.length, 'clienti');
    } catch (error) {
        console.error('❌ Errore caricamento crediti:', error);
        creditiData = [];
    }
}

// ===== INIZIALIZZAZIONE =====
function initAmministrazioneCrediti() {
    if (creditiInitialized) return;
    creditiInitialized = true;
    loadCreditiFromStorage();
    setupCreditiEventListeners();
    renderListaCrediti();
    console.log('✅ Crediti inizializzati');
}

function setupCreditiEventListeners() {
    // pulsanti header
    document.getElementById('add-credito-cliente')?.addEventListener('click', apriModalNuovoCliente);
    document.getElementById('add-transazione')?.addEventListener('click', apriModalNuovaTransazione);
    document.getElementById('import-crediti')?.addEventListener('click', importaCreditiJSON);
    document.getElementById('export-crediti')?.addEventListener('click', esportaCreditiJSON);
    document.getElementById('print-estratto')?.addEventListener('click', stampaMultipliEstratti);

    // form modali
    document.getElementById('form-nuovo-cliente')?.addEventListener('submit', salvaNuovoCliente);
    document.getElementById('form-transazione')?.addEventListener('submit', salvaTransazione);
}

// ===== RENDERING =====
function renderListaCrediti() {
    const container = document.getElementById('crediti-lista');
    if (!container) return;

    container.innerHTML = '';

    if (!creditiData.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-credit-card"></i>
                <h3>Nessun cliente con credito</h3>
                <p>Inizia aggiungendo il primo cliente</p>
            </div>
        `;
        return;
    }

    creditiData.forEach(cliente => {
        container.appendChild(creaCardCliente(cliente));
    });
}

function creaCardCliente(cliente) {
    const card = document.createElement('div');
    card.className = 'credito-card';
    const totale = cliente.transazioni.reduce((s, t) => s + t.importo, 0);
    const alerta = totale > 500 ? 'alert' : '';

    card.innerHTML = `
        <div class="credito-header">
            <div>
                <h4>${cliente.nome}</h4>
                <span class="credito-tel">${cliente.telefono || 'N/D'}</span>
            </div>
            <div class="credito-totale ${alerta}">€ ${totale.toFixed(2)}</div>
        </div>
        <div class="credito-transazioni">
            ${cliente.transazioni.map(t => `
                <div class="transazione">
                    <span>${t.data}</span>
                    <span>${t.descrizione}</span>
                    <span class="${t.importo > 0 ? 'debito' : 'credito'}">€ ${t.importo.toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
        <div class="credito-actions">
            <button class="btn btn-sm" onclick="apriModalTransazione('${cliente.id}')">
                <i class="fas fa-plus"></i> Movimento
            </button>
            <button class="btn btn-sm btn-secondary" onclick="stampaEstrattoConto('${cliente.id}')">
                <i class="fas fa-print"></i> Stampa
            </button>
            <button class="btn btn-sm btn-danger" onclick="saldaTotale('${cliente.id}')">
                <i class="fas fa-check"></i> Salda
            </button>
        </div>
    `;
    return card;
}

// ===== MODALI =====
function apriModalNuovoCliente() {
    document.getElementById('cliente-nome').value = '';
    document.getElementById('cliente-telefono').value = '';
    window.showModal('nuovo-cliente-modal');
}

function apriModalNuovaTransazione(clienteId = null) {
    popolaSelectClienti();
    if (clienteId) document.getElementById('transazione-cliente').value = clienteId;
    document.getElementById('transazione-data').value = oggiCorto();
    document.getElementById('transazione-descrizione').value = 'Carburante';
    document.getElementById('transazione-importo').value = '';
    window.showModal('nuova-transazione-modal');
}

function popolaSelectClienti() {
    const select = document.getElementById('transazione-cliente');
    select.innerHTML = creditiData.map(c => 
        `<option value="${c.id}">${c.nome}</option>`
    ).join('');
}

// ===== SALVATAGGI =====
function salvaNuovoCliente(e) {
    e.preventDefault();
    const nome = document.getElementById('cliente-nome').value.trim();
    if (!nome) return;

    creditiData.push({
        id: 'CLI-' + Date.now(),
        nome,
        telefono: document.getElementById('cliente-telefono').value.trim(),
        transazioni: []
    });
    saveCreditiToStorage();
    renderListaCrediti();
    window.closeModal('nuovo-cliente-modal');
}

function salvaTransazione(e) {
    e.preventDefault();
    const clienteId = document.getElementById('transazione-cliente').value;
    const cliente = creditiData.find(c => c.id === clienteId);
    if (!cliente) return;

    cliente.transazioni.push({
        data: document.getElementById('transazione-data').value,
        descrizione: document.getElementById('transazione-descrizione').value,
        importo: parseFloat(document.getElementById('transazione-importo').value)
    });
    saveCreditiToStorage();
    renderListaCrediti();
    window.closeModal('nuova-transazione-modal');
}

function saldaTotale(clienteId) {
    const cliente = creditiData.find(c => c.id === clienteId);
    const totale = cliente.transazioni.reduce((s, t) => s + t.importo, 0);
    if (totale <= 0) return;

    cliente.transazioni.push({
        data: oggiCorto(),
        descrizione: 'Saldo totale',
        importo: -totale
    });
    saveCreditiToStorage();
    renderListaCrediti();
}

// ===== STAMPA =====
function stampaEstrattoConto(clienteId) {
    const cliente = creditiData.find(c => c.id === clienteId);
    const totale = cliente.transazioni.reduce((s, t) => s + t.importo, 0);

    const w = window.open('', '_blank');
    w.document.write(`
        <html>
        <head><title>Estratto Conto - ${cliente.nome}</title>
        <style>
            body{font-family:Arial;margin:2rem}
            table{width:100%;border-collapse:collapse}
            th,td{padding:0.5rem;border-bottom:1px solid #ddd}
            .totale{font-weight:bold;text-align:right;font-size:1.2rem;margin-top:1rem}
        </style>
        </head>
        <body>
        <h2>Estratto Conto</h2>
        <p><strong>Cliente:</strong> ${cliente.nome}</p>
        ${cliente.telefono ? `<p><strong>Tel:</strong> ${cliente.telefono}</p>` : ''}
        <table>
            <tr><th>Data</th><th>Descrizione</th><th>Importo (€)</th></tr>
            ${cliente.transazioni.map(t => `
                <tr>
                    <td>${t.data}</td>
                    <td>${t.descrizione}</td>
                    <td style="color:${t.importo>0?'red':'green'}">${t.importo.toFixed(2)}</td>
                </tr>
            `).join('')}
        </table>
        <div class="totale">Totale Dovuto: € ${totale.toFixed(2)}</div>
        </body></html>
    `);
    w.document.close();
    w.print();
}

function stampaMultipliEstratti() {
    if (!creditiData.length) return window.showModal('success-modal', 'Nessun cliente da stampare');
    
    creditiData.forEach(c => {
        if (c.transazioni.reduce((s,t)=>s+t.importo,0) > 0) {
            setTimeout(() => stampaEstrattoConto(c.id), 500);
        }
    });
}

// ===== IMPORT/EXPORT =====
function importaCreditiJSON() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result);
                creditiData = Array.isArray(data) ? data : data.clienti || [];
                saveCreditiToStorage();
                renderListaCrediti();
                window.showModal('success-modal', `Importati ${creditiData.length} clienti`);
            } catch {
                window.showModal('success-modal', 'File JSON non valido');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function esportaCreditiJSON() {
    if (!creditiData.length) return window.showModal('success-modal', 'Nessun dato da esportare');
    const blob = new Blob([JSON.stringify({clienti: creditiData, timestamp: new Date().toISOString()}, null, 2)], 
        {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `crediti-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

// ===== UTILITY =====
function oggiCorto() {
    const d = new Date();
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
}

// ===== ESPOSIZIONE GLOBALE =====
window.initAmministrazioneCrediti = initAmministrazioneCrediti;