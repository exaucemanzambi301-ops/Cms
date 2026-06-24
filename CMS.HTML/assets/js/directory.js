// Petit annuaire client-side utilisant IndexedDB pour retrouver un profil patient
(function () {
    const DB_NAME = 'cms_directory_db';
    const DB_VERSION = 1;
    const STORE = 'patients';

    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function (e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    const os = db.createObjectStore(STORE, { keyPath: 'patient_id', autoIncrement: true });
                    os.createIndex('numero_dossier', 'numero_dossier', { unique: true });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function findPatientByDossier(numero_dossier) {
        if (!numero_dossier) return null;
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const store = tx.objectStore(STORE);
            const index = store.index('numero_dossier');
            const req = index.get(numero_dossier);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }

    async function addPatient(patient) {
        const db = await openDB();
        const existing = await findPatientByDossier(patient.numero_dossier);
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const store = tx.objectStore(STORE);
            let req;
            if (existing && existing.patient_id) {
                const updated = Object.assign({}, existing, patient);
                req = store.put(updated);
            } else {
                req = store.add(patient);
            }
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function getAllPatients() {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const store = tx.objectStore(STORE);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async function addSamplePatients() {
        const samples = [
            { nom: 'Kabuya', postnom: 'Jean', telephone: '+243900000001', email: 'kabuya@example.com', numero_dossier: 'D001' },
            { nom: 'Mbuyi', postnom: 'Alice', telephone: '+243900000002', email: 'mbuyi@example.com', numero_dossier: 'D002' },
            { nom: 'Nzila', postnom: 'Paul', telephone: '+243900000003', email: 'nzila@example.com', numero_dossier: 'D003' }
        ];
        for (const p of samples) {
            try { await addPatient(p); } catch (e) { /* ignore duplicates */ }
        }
    }

    function createButton(patient) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dir-btn';
        btn.textContent = (patient.nom || '') + ' ' + (patient.postnom || '') + (patient.numero_dossier ? ' — ' + patient.numero_dossier : '');
        btn.addEventListener('click', () => {
            fillFormWithPatient(patient);
        });
        return btn;
    }

    function fillFormWithPatient(patient) {
        // Remplit le formulaire RDV si présent
        try {
            const setIf = (id, value) => { const el = document.getElementById(id); if (el) el.value = value || ''; };
            setIf('nom', patient.nom);
            setIf('postnom', patient.postnom);
            setIf('telephone', patient.telephone);
            setIf('email', patient.email);
            setIf('numero_dossier', patient.numero_dossier);

            // Sauvegarde dans localStorage pour cohérence avec cms.js
            const existing = JSON.parse(localStorage.getItem('rdvFormData') || '{}');
            const merged = Object.assign({}, existing, {
                nom: patient.nom,
                postnom: patient.postnom,
                telephone: patient.telephone,
                email: patient.email,
                numero_dossier: patient.numero_dossier
            });
            localStorage.setItem('rdvFormData', JSON.stringify(merged));

            // feedback visuel
            const msg = document.getElementById('authMessage');
            if (msg) { msg.textContent = 'Profil chargé depuis l’annuaire.'; msg.style.color = '#1a7f0f'; }
            const currentPath = window.location.pathname;
            if (!document.getElementById('rdvForm') && currentPath.endsWith('profiles.html')) {
                window.location.href = 'Rdv.html';
            }
        } catch (e) {
            console.error('Erreur lors du remplissage du formulaire :', e);
        }
    }

    async function renderDirectory(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        try {
            const list = await getAllPatients();
            if (!list.length) {
                const note = document.createElement('p');
                note.textContent = 'Aucun profil enregistré. Vous pouvez charger des exemples.';
                container.appendChild(note);
                return;
            }
            const wrap = document.createElement('div');
            wrap.className = 'dir-wrap';
            for (const p of list) {
                wrap.appendChild(createButton(p));
            }
            container.appendChild(wrap);
        } catch (e) {
            console.error(e);
        }
    }

    // Expose API globale simple
    window.Directory = {
        init: async function () { await openDB(); },
        addSamplePatients,
        getAllPatients,
        renderDirectory,
        addPatient
    };

})();
