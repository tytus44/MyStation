/**
 * MEMORIA.JS
 * Sistema unificato di gestione localStorage per MyStation
 * Gestisce il salvataggio e caricamento dati per tutte le sezioni
 */

const MemoriaStorage = {
    
    // ============================================
    // CONFIGURAZIONE
    // ============================================
    
    // Chiavi localStorage
    keys: {
        anagrafica: 'mystation_anagrafica_contacts',
        amministrazione: 'mystation_amministrazione_clients',
        registro: 'mystation_registro_loads',
        settings: 'mystation_settings',
        theme: 'mystation_theme',
        lastBackup: 'mystation_last_backup'
    },
    
    // ============================================
    // METODI GENERALI
    // ============================================
    
    /**
     * Verifica se localStorage è disponibile
     */
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.error('localStorage non disponibile:', e);
            return false;
        }
    },
    
    /**
     * Ottiene la dimensione totale utilizzata in localStorage (in KB)
     */
    getStorageSize() {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        return (totalSize / 1024).toFixed(2); // Converti in KB
    },
    
    /**
     * Pulisce dati obsoleti (più vecchi di X giorni)
     */
    cleanOldData(daysToKeep = 365) {
        const now = Date.now();
        const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // Converti giorni in millisecondi
        
        for (let key in localStorage) {
            if (key.startsWith('mystation_temp_') || key.startsWith('mystation_old_')) {
                try {
                    const data = JSON.parse(localStorage[key]);
                    if (data.timestamp && (now - data.timestamp) > maxAge) {
                        localStorage.removeItem(key);
                        console.log(`Rimosso dato obsoleto: ${key}`);
                    }
                } catch (e) {
                    // Se non è JSON valido o non ha timestamp, ignora
                }
            }
        }
    },
    
    // ============================================
    // ANAGRAFICA
    // ============================================
    
    /**
     * Salva contatti anagrafica
     */
    saveContacts(contacts) {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.setItem(this.keys.anagrafica, JSON.stringify(contacts));
            console.log('Contatti salvati:', contacts.length);
            return true;
        } catch (e) {
            console.error('Errore salvataggio contatti:', e);
            if (e.name === 'QuotaExceededError') {
                this.handleQuotaExceeded();
            }
            return false;
        }
    },
    
    /**
     * Carica contatti anagrafica
     */
    loadContacts() {
        if (!this.isAvailable()) return [];
        
        try {
            const data = localStorage.getItem(this.keys.anagrafica);
            if (data) {
                const contacts = JSON.parse(data);
                // Gestisci sia il formato vecchio che nuovo
                if (Array.isArray(contacts)) {
                    return contacts;
                } else if (contacts.contacts) {
                    return contacts.contacts;
                }
            }
        } catch (e) {
            console.error('Errore caricamento contatti:', e);
        }
        return [];
    },
    
    /**
     * Elimina tutti i contatti
     */
    clearContacts() {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.removeItem(this.keys.anagrafica);
            return true;
        } catch (e) {
            console.error('Errore eliminazione contatti:', e);
            return false;
        }
    },
    
    // ============================================
    // AMMINISTRAZIONE
    // ============================================
    
    /**
     * Salva clienti amministrazione
     */
    saveClients(clients) {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.setItem(this.keys.amministrazione, JSON.stringify(clients));
            console.log('Clienti salvati:', clients.length);
            return true;
        } catch (e) {
            console.error('Errore salvataggio clienti:', e);
            if (e.name === 'QuotaExceededError') {
                this.handleQuotaExceeded();
            }
            return false;
        }
    },
    
    /**
     * Carica clienti amministrazione
     */
    loadClients() {
        if (!this.isAvailable()) return [];
        
        try {
            const data = localStorage.getItem(this.keys.amministrazione);
            if (data) {
                const parsed = JSON.parse(data);
                // Gestisci sia il formato vecchio che nuovo
                let clients = [];
                if (Array.isArray(parsed)) {
                    clients = parsed;
                } else if (parsed.clients) {
                    clients = parsed.clients;
                }
                
                // Migrazione dati se necessario
                clients.forEach(client => {
                    if (!client.color) {
                        client.color = this.getRandomColor();
                    }
                    if (!client.transactions) {
                        client.transactions = [];
                    }
                    if (!client.id) {
                        client.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                    }
                });
                
                return clients;
            }
        } catch (e) {
            console.error('Errore caricamento clienti:', e);
        }
        return [];
    },
    
    /**
     * Elimina tutti i clienti
     */
    clearClients() {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.removeItem(this.keys.amministrazione);
            return true;
        } catch (e) {
            console.error('Errore eliminazione clienti:', e);
            return false;
        }
    },
    
    // ============================================
    // REGISTRO DI CARICO
    // ============================================
    
    /**
     * Salva registro di carico
     */
    saveRegistro(loads) {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.setItem(this.keys.registro, JSON.stringify(loads));
            console.log('Registro salvato:', loads.length);
            return true;
        } catch (e) {
            console.error('Errore salvataggio registro:', e);
            if (e.name === 'QuotaExceededError') {
                this.handleQuotaExceeded();
            }
            return false;
        }
    },
    
    /**
     * Carica registro di carico
     */
    loadRegistro() {
        if (!this.isAvailable()) return [];
        
        try {
            const data = localStorage.getItem(this.keys.registro);
            if (data) {
                const parsed = JSON.parse(data);
                // Gestisci sia il formato vecchio che nuovo
                let loads = [];
                if (Array.isArray(parsed)) {
                    loads = parsed;
                } else if (parsed.loads) {
                    loads = parsed.loads;
                }
                
                // Assicura che ogni carico abbia un ID
                loads.forEach(load => {
                    if (!load.id) {
                        load.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                    }
                });
                
                return loads;
            }
        } catch (e) {
            console.error('Errore caricamento registro:', e);
        }
        return [];
    },
    
    /**
     * Elimina registro di carico
     */
    clearRegistro() {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.removeItem(this.keys.registro);
            return true;
        } catch (e) {
            console.error('Errore eliminazione registro:', e);
            return false;
        }
    },
    
    // ============================================
    // GESTIONE TEMA
    // ============================================
    
    /**
     * Salva tema selezionato
     */
    saveTheme(theme) {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.setItem(this.keys.theme, theme);
            this.applyTheme(theme);
            return true;
        } catch (e) {
            console.error('Errore salvataggio tema:', e);
            return false;
        }
    },
    
    /**
     * Carica tema salvato
     */
    loadTheme() {
        if (!this.isAvailable()) return 'dark';
        
        try {
            return localStorage.getItem(this.keys.theme) || 'dark';
        } catch (e) {
            console.error('Errore caricamento tema:', e);
            return 'dark';
        }
    },
    
    /**
     * Applica tema all'interfaccia
     */
    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.classList.add('light-theme');
            root.classList.remove('dark-theme');
        } else {
            root.classList.add('dark-theme');
            root.classList.remove('light-theme');
        }
        
        // Aggiorna lo switch del tema se esiste
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = theme === 'light';
        }
    },
    
    /**
     * Toggle tema
     */
    toggleTheme() {
        const currentTheme = this.loadTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.saveTheme(newTheme);
        return newTheme;
    },
    
    // ============================================
    // BACKUP E RIPRISTINO
    // ============================================
    
    /**
     * Crea backup completo di tutti i dati
     */
    createBackup() {
        const contacts = this.loadContacts();
        const clients = this.loadClients();
        const registro = this.loadRegistro();
        const settings = this.loadSettings();
        const theme = this.loadTheme();
        
        const backup = {
            timestamp: Date.now(),
            date: new Date().toISOString(),
            version: '1.0',
            data: {
                contacts: contacts,
                clients: clients,
                registro: registro,
                settings: settings,
                theme: theme
            }
        };
        
        console.log('Backup creato:', {
            contatti: contacts.length,
            clienti: clients.length,
            carichi: registro.length
        });
        
        return backup;
    },
    
    /**
     * Esporta backup come file JSON
     */
    exportBackup() {
        const backup = this.createBackup();
        const dataStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        
        link.href = URL.createObjectURL(blob);
        link.download = `mystation_backup_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Salva timestamp ultimo backup
        localStorage.setItem(this.keys.lastBackup, Date.now().toString());
        
        return true;
    },
    
    /**
     * Ripristina dati da backup
     */
    restoreBackup(backupData) {
        try {
            let backup;
            
            // Se è una stringa, parsala
            if (typeof backupData === 'string') {
                backup = JSON.parse(backupData);
            } else {
                backup = backupData;
            }
            
            // Verifica struttura backup
            if (!backup.data) {
                throw new Error('Formato backup non valido');
            }
            
            // Ripristina dati
            let restored = 0;
            
            if (backup.data.contacts) {
                // Salva direttamente l'array di contatti
                localStorage.setItem(this.keys.anagrafica, JSON.stringify(backup.data.contacts));
                restored++;
            }
            
            if (backup.data.clients) {
                // Salva direttamente l'array di clienti
                localStorage.setItem(this.keys.amministrazione, JSON.stringify(backup.data.clients));
                restored++;
            }
            
            if (backup.data.registro) {
                // Salva direttamente l'array di carichi
                localStorage.setItem(this.keys.registro, JSON.stringify(backup.data.registro));
                restored++;
            }
            
            if (backup.data.settings) {
                this.saveSettings(backup.data.settings);
                restored++;
            }
            
            if (backup.data.theme) {
                this.saveTheme(backup.data.theme);
                restored++;
            }
            
            return {
                success: true,
                restored: restored,
                date: backup.date || 'Data sconosciuta'
            };
            
        } catch (e) {
            console.error('Errore ripristino backup:', e);
            return {
                success: false,
                error: e.message
            };
        }
    },
    
    // ============================================
    // IMPOSTAZIONI
    // ============================================
    
    /**
     * Salva impostazioni
     */
    saveSettings(settings) {
        if (!this.isAvailable()) return false;
        
        try {
            localStorage.setItem(this.keys.settings, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Errore salvataggio impostazioni:', e);
            return false;
        }
    },
    
    /**
     * Carica impostazioni
     */
    loadSettings() {
        if (!this.isAvailable()) return {};
        
        try {
            const data = localStorage.getItem(this.keys.settings);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Errore caricamento impostazioni:', e);
            return {};
        }
    },
    
    // ============================================
    // UTILITY
    // ============================================
    
    /**
     * Genera colore casuale (utility condivisa)
     */
    getRandomColor() {
        const colors = [
            '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A1FF33', '#5733FF',
            '#FFC300', '#C70039', '#900C3F', '#581845', '#E96479', '#D63484',
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#6C5CE7',
            '#A8E6CF', '#FFDAC1', '#FF8B94', '#FFD3B6', '#FFAAA5', '#FF8B94'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    /**
     * Gestisce errore quota superata
     */
    handleQuotaExceeded() {
        console.warn('Quota localStorage superata!');
        
        // Prova a pulire dati vecchi
        this.cleanOldData(30);
        
        // Notifica utente
        if (window.showAlert) {
            window.showAlert('Spazio di archiviazione insufficiente. Alcuni dati vecchi sono stati eliminati.');
        }
    },
    
    /**
     * Reset completo di tutti i dati
     */
    resetAll() {
        if (!confirm('Sei sicuro di voler eliminare TUTTI i dati? Questa azione non può essere annullata.')) {
            return false;
        }
        
        try {
            // Rimuovi tutte le chiavi MyStation
            for (let key in localStorage) {
                if (key.startsWith('mystation_') || key.includes('amministrazione') || key.includes('anagrafica')) {
                    localStorage.removeItem(key);
                }
            }
            
            // Ricarica la pagina per resettare lo stato
            window.location.reload();
            return true;
            
        } catch (e) {
            console.error('Errore reset dati:', e);
            return false;
        }
    },
    
    /**
     * Ottiene statistiche di utilizzo
     */
    getStats() {
        const contacts = this.loadContacts();
        const clients = this.loadClients();
        const registro = this.loadRegistro();
        const settings = this.loadSettings();
        const theme = this.loadTheme();
        
        const stats = {
            totalContacts: contacts.length,
            totalClients: clients.length,
            totalLoads: registro.length,
            totalTransactions: clients.reduce((sum, client) => 
                sum + (client.transactions ? client.transactions.length : 0), 0),
            storageUsed: this.getStorageSize() + ' KB',
            currentTheme: theme,
            lastBackup: localStorage.getItem(this.keys.lastBackup) 
                ? new Date(parseInt(localStorage.getItem(this.keys.lastBackup))).toLocaleString('it-IT')
                : 'Mai',
            hasSettings: Object.keys(settings).length > 0
        };
        
        return stats;
    }
};

// ============================================
// INIZIALIZZAZIONE E AUTO-BACKUP
// ============================================

// Controlla e pulisce dati vecchi all'avvio
document.addEventListener('DOMContentLoaded', () => {
    if (MemoriaStorage.isAvailable()) {
        // Pulisci dati temporanei vecchi
        MemoriaStorage.cleanOldData(30);
        
        // Applica tema salvato
        const savedTheme = MemoriaStorage.loadTheme();
        MemoriaStorage.applyTheme(savedTheme);
        
        // Log statistiche in console (solo in development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('MyStation Storage Stats:', MemoriaStorage.getStats());
        }
        
        // Auto-backup settimanale
        const lastBackup = localStorage.getItem(MemoriaStorage.keys.lastBackup);
        if (lastBackup) {
            const daysSinceBackup = (Date.now() - parseInt(lastBackup)) / (1000 * 60 * 60 * 24);
            if (daysSinceBackup > 7) {
                console.log('Backup automatico in corso...');
                // Salva backup nel localStorage con prefisso auto_
                const backup = MemoriaStorage.createBackup();
                localStorage.setItem('mystation_auto_backup', JSON.stringify(backup));
                localStorage.setItem(MemoriaStorage.keys.lastBackup, Date.now().toString());
            }
        }
    } else {
        console.error('localStorage non disponibile. I dati non verranno salvati.');
    }
});

// Esponi globalmente per utilizzo in altri script
window.MemoriaStorage = MemoriaStorage;