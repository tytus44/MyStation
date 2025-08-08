const contactsGrid = document.getElementById('contacts-grid');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const importBtn = document.getElementById('import-vcf-btn');
const exportBtn = document.getElementById('export-vcf-btn');
const deleteAllBtn = document.getElementById('delete-all-btn');
const newContactBtn = document.getElementById('new-contact-btn');
const newContactModal = document.getElementById('new-contact-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveContactBtn = document.getElementById('save-contact-btn');
const vcfFileInput = document.getElementById('vcf-file-input');
const customAlertBox = document.getElementById('custom-alert-box');

let allContacts = [];

// Load contacts from storage on startup
document.addEventListener('DOMContentLoaded', () => {
    if (window.MemoriaStorage) {
        allContacts = MemoriaStorage.loadContacts();
        renderContacts(allContacts);
    }
});

// Custom alert function
function showAlert(message) {
    customAlertBox.textContent = message;
    customAlertBox.classList.add('show');
    setTimeout(() => {
        customAlertBox.classList.remove('show');
    }, 3000);
}

// VCF parsing function
function parseVCF(text) {
    const contacts = [];
    const vcards = text.split('END:VCARD').filter(v => v.trim() !== '');

    vcards.forEach(vcardText => {
        const contact = {};
        const lines = vcardText.split('\n');

        lines.forEach(line => {
            const [key, value] = line.split(':');
            if (key && value) {
                const cleanKey = key.split(';')[0].trim();
                contact[cleanKey] = value.trim();
            }
        });
        contacts.push(contact);
    });
    return contacts;
}

// Random color for contact icons
function getRandomColor() {
    const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A1FF33', '#5733FF',
        '#FFC300', '#C70039', '#900C3F', '#581845', '#E96479', '#D63484'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Render contacts to the grid
function renderContacts(contacts) {
    contactsGrid.innerHTML = '';
    if (contacts.length === 0) {
        contactsGrid.innerHTML = '<p style="text-align: center; color: #61667A; padding: 40px;">Nessun contatto trovato.</p>';
        return;
    }
    contacts.forEach(contact => {
        const contactBox = document.createElement('div');
        contactBox.classList.add('contact-box');

        const header = document.createElement('div');
        header.classList.add('contact-header');

        const iconContainer = document.createElement('div');
        iconContainer.classList.add('contact-icon-container');
        iconContainer.style.background = getRandomColor();
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-user');
        iconContainer.appendChild(icon);

        const details = document.createElement('div');
        details.classList.add('contact-details');

        const name = document.createElement('h3');
        name.classList.add('contact-name');
        name.textContent = contact.FN || 'Nome Sconosciuto';

        const org = document.createElement('p');
        org.classList.add('contact-org');
        org.textContent = contact.ORG || 'Nessuna Organizzazione';

        details.appendChild(name);
        details.appendChild(org);

        header.appendChild(iconContainer);
        header.appendChild(details);

        const infoList = document.createElement('ul');
        infoList.classList.add('contact-info-list');

        if (contact.TEL) {
            const telItem = document.createElement('li');
            telItem.classList.add('contact-info-item');
            telItem.innerHTML = `<i class="fas fa-phone"></i> <span>${contact.TEL}</span>`;
            infoList.appendChild(telItem);
        }

        if (contact.EMAIL) {
            const emailItem = document.createElement('li');
            emailItem.classList.add('contact-info-item');
            emailItem.innerHTML = `<i class="fas fa-envelope"></i> <span>${contact.EMAIL}</span>`;
            infoList.appendChild(emailItem);
        }

        if (contact.NOTE) {
            const notesItem = document.createElement('li');
            notesItem.classList.add('contact-info-item');
            notesItem.innerHTML = `<i class="fas fa-sticky-note"></i> <span>${contact.NOTE.replace(/\\n/g, ' ')}</span>`;
            infoList.appendChild(notesItem);
        }

        contactBox.appendChild(header);
        contactBox.appendChild(infoList);

        contactsGrid.appendChild(contactBox);
    });
}

// Update search UI
function updateSearchUI(query) {
    if (query.length > 0) {
        clearSearchBtn.style.display = 'block';
    } else {
        clearSearchBtn.style.display = 'none';
    }
}

// Filter contacts based on search query
function filterContacts(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const filteredContacts = allContacts.filter(contact => {
        const name = (contact.FN || '').toLowerCase();
        const org = (contact.ORG || '').toLowerCase();
        const tel = (contact.TEL || '').toLowerCase();
        const email = (contact.EMAIL || '').toLowerCase();
        const note = (contact.NOTE || '').toLowerCase();
        return name.includes(normalizedQuery) ||
               org.includes(normalizedQuery) ||
               tel.includes(normalizedQuery) ||
               email.includes(normalizedQuery) ||
               note.includes(normalizedQuery);
    });
    renderContacts(filteredContacts);
}

// Search input event listener
searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    updateSearchUI(query);
    filterContacts(query);
});

// Clear search button event listener
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    updateSearchUI('');
    renderContacts(allContacts);
});

// Import VCF button event listener
importBtn.addEventListener('click', () => {
    vcfFileInput.click();
});

// VCF file input change event listener
vcfFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            allContacts = parseVCF(content);
            if (window.MemoriaStorage) {
                MemoriaStorage.saveContacts(allContacts);
            }
            renderContacts(allContacts);
        };
        reader.readAsText(file);
    }
    vcfFileInput.value = '';
});

// Export VCF button event listener
exportBtn.addEventListener('click', () => {
    let vcfContent = '';
    allContacts.forEach(contact => {
        vcfContent += 'BEGIN:VCARD\n';
        vcfContent += 'VERSION:3.0\n';
        if (contact.FN) vcfContent += `FN:${contact.FN}\n`;
        if (contact.ORG) vcfContent += `ORG:${contact.ORG}\n`;
        if (contact.TEL) vcfContent += `TEL:${contact.TEL}\n`;
        if (contact.EMAIL) vcfContent += `EMAIL:${contact.EMAIL}\n`;
        if (contact.NOTE) vcfContent += `NOTE:${contact.NOTE.replace(/\n/g, '\\n')}\n`;
        vcfContent += 'END:VCARD\n';
    });
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mystation_contatti.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Delete all contacts button event listener
deleteAllBtn.addEventListener('click', () => {
    if (confirm('Sei sicuro di voler eliminare tutti i contatti? Questa azione non può essere annullata.')) {
        allContacts = [];
        if (window.MemoriaStorage) {
            MemoriaStorage.saveContacts(allContacts);
        }
        renderContacts(allContacts);
    }
});

// New contact modal handling
newContactBtn.addEventListener('click', () => {
    newContactModal.style.display = 'flex';
});

closeModalBtn.addEventListener('click', () => {
    newContactModal.style.display = 'none';
});

// Save new contact button event listener
saveContactBtn.addEventListener('click', () => {
    const name = document.getElementById('contact-name').value;
    const org = document.getElementById('contact-org').value;
    const tel = document.getElementById('contact-tel').value;
    const email = document.getElementById('contact-email').value;
    const notes = document.getElementById('contact-notes').value;

    if (name.trim() === '') {
        showAlert('Il nome è obbligatorio.');
        return;
    }

    const newContact = {
        FN: name,
        ORG: org,
        TEL: tel,
        EMAIL: email,
        NOTE: notes
    };

    allContacts.push(newContact);
    if (window.MemoriaStorage) {
        MemoriaStorage.saveContacts(allContacts);
    }
    renderContacts(allContacts);
    newContactModal.style.display = 'none';

    // Reset modal form
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-org').value = '';
    document.getElementById('contact-tel').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-notes').value = '';
});

window.addEventListener('click', (event) => {
    if (event.target == newContactModal) {
        newContactModal.style.display = 'none';
    }
});
