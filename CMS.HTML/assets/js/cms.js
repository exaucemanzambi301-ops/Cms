document.addEventListener('DOMContentLoaded', function () {
    const userKey = 'rdvUserData';
    const rdvKey = 'rdvFormData';

    const loginForm = document.getElementById('loginForm');
    const rdvForm = document.getElementById('rdvForm');
    const authMessage = document.getElementById('authMessage');
    const loginMessage = document.getElementById('loginMessage');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const summaryDetails = document.getElementById('summaryDetails');

    function saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function loadData(key) {
        const saved = localStorage.getItem(key);
        if (!saved) {
            return null;
        }
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.error('Impossible de lire les données sauvegardées.', error);
            return null;
        }
    }

    function updateMessage(element, text, success = true) {
        if (!element) return;
        element.textContent = text;
        element.style.color = success ? '#1a7f0f' : '#b00020';
    }

    function populateLogin(userData) {
        if (!userData) return;
        document.getElementById('loginNom').value = userData.nom || '';
        document.getElementById('loginPostnom').value = userData.postnom || '';
        document.getElementById('loginEmail').value = userData.email || '';
        document.getElementById('loginTelephone').value = userData.telephone || '';
    }

    function populateRdv(rdvData, userData) {
        if (userData) {
            document.getElementById('nom').value = userData.nom || '';
            document.getElementById('postnom').value = userData.postnom || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('telephone').value = userData.telephone || '';
        }
        if (!rdvData) {
            if (userData && authMessage) {
                updateMessage(authMessage, 'Vos informations personnelles sont chargées. Complétez le rendez-vous.', true);
            }
            return;
        }
        document.getElementById('nom').value = rdvData.nom || document.getElementById('nom').value;
        document.getElementById('postnom').value = rdvData.postnom || document.getElementById('postnom').value;
        document.getElementById('telephone').value = rdvData.telephone || document.getElementById('telephone').value;
        document.getElementById('email').value = rdvData.email || document.getElementById('email').value;
        document.getElementById('date').value = rdvData.date || '';
        document.getElementById('heure').value = rdvData.heure || '';
        document.getElementById('numero_dossier').value = rdvData.numero_dossier || '';
        document.getElementById('type_consultation').value = rdvData.type_consultation || '';
        if (authMessage) {
            updateMessage(authMessage, 'Formulaire restauré depuis votre dernière saisie.', true);
        }
    }

    function formatLabel(value) {
        return value ? value.replace(/-/g, ' ') : '';
    }

    if (loginForm) {
        const savedUser = loadData(userKey);
        if (savedUser) {
            populateLogin(savedUser);
            updateMessage(loginMessage, 'Identification restaurée. Vous pouvez continuer.', true);
        }

        // generate a stable incremental dossier number
        function generateDossier() {
            const key = 'dossier_counter';
            let n = parseInt(localStorage.getItem(key) || '0', 10) + 1;
            localStorage.setItem(key, String(n));
            return 'D' + String(n).padStart(4, '0');
        }

        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const userData = {
                nom: document.getElementById('loginNom').value,
                postnom: document.getElementById('loginPostnom').value,
                email: document.getElementById('loginEmail').value,
                telephone: document.getElementById('loginTelephone').value,
                numero_dossier: generateDossier()
            };

            // Save user data and prefill rdv draft for continuity
            saveData(userKey, userData);
            const existingRdv = loadData(rdvKey) || {};
            const merged = Object.assign({}, existingRdv, {
                nom: userData.nom,
                postnom: userData.postnom,
                email: userData.email,
                telephone: userData.telephone,
                numero_dossier: userData.numero_dossier
            });
            saveData(rdvKey, merged);

            updateMessage(loginMessage, 'Identification enregistrée (n° dossier: ' + userData.numero_dossier + '). Redirection vers la page de rendez-vous...', true);
            setTimeout(function () {
                window.location.href = 'Rdv.html';
            }, 800);
        });
    }

    if (rdvForm) {
        const savedUser = loadData(userKey);
        const savedRdv = loadData(rdvKey);
        populateRdv(savedRdv, savedUser);

        rdvForm.addEventListener('input', function () {
            const formData = {
                nom: document.getElementById('nom').value,
                postnom: document.getElementById('postnom').value,
                telephone: document.getElementById('telephone').value,
                email: document.getElementById('email').value,
                date: document.getElementById('date').value,
                heure: document.getElementById('heure').value,
                numero_dossier: document.getElementById('numero_dossier').value,
                type_consultation: document.getElementById('type_consultation').value,
            };
            saveData(rdvKey, formData);
        });

        rdvForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = {
                nom: document.getElementById('nom').value,
                postnom: document.getElementById('postnom').value,
                telephone: document.getElementById('telephone').value,
                email: document.getElementById('email').value,
                date: document.getElementById('date').value,
                heure: document.getElementById('heure').value,
                numero_dossier: document.getElementById('numero_dossier').value,
                type_consultation: document.getElementById('type_consultation').value,
            };
            saveData(rdvKey, formData);
            updateMessage(authMessage, 'Votre rendez-vous est enregistré localement.', true);
            window.location.href = 'confirmation.html';
        });
    }

    if (confirmationMessage && summaryDetails) {
        const rdvData = loadData(rdvKey);
        const userData = loadData(userKey);
        if (!rdvData) {
            confirmationMessage.textContent = 'Aucune demande de rendez-vous trouvée. Retournez au formulaire.';
            summaryDetails.innerHTML = '<p>Vous devez d’abord remplir le formulaire de rendez-vous.</p>';
            return;
        }
        confirmationMessage.textContent = 'Votre rendez-vous a bien été enregistré localement.';
        let detailsHtml = '';
        if (userData) {
            detailsHtml += '<p><strong>Patient :</strong> ' + (userData.nom || '') + ' ' + (userData.postnom || '') + '</p>';
            detailsHtml += '<p><strong>Email :</strong> ' + (userData.email || '') + '</p>';
            detailsHtml += '<p><strong>Téléphone :</strong> ' + (userData.telephone || '') + '</p>';
        }
        detailsHtml += '<p><strong>Date :</strong> ' + (rdvData.date || '-') + '</p>';
        detailsHtml += '<p><strong>Heure :</strong> ' + (rdvData.heure || '-') + '</p>';
        detailsHtml += '<p><strong>Type de consultation :</strong> ' + formatLabel(rdvData.type_consultation) + '</p>';
        detailsHtml += '<p><strong>Numéro de dossier :</strong> ' + (rdvData.numero_dossier || '-') + '</p>';
        summaryDetails.innerHTML = detailsHtml;
        // wire save profile button to IndexedDB Directory if available
        const saveBtn = document.getElementById('saveProfileBtn');
        const saveStatus = document.getElementById('saveStatus');
        if (window.Directory && typeof window.Directory.init === 'function') {
            window.Directory.init().catch(e => console.warn('Directory init failed', e));
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', async function () {
                try {
                    if (!(rdvData && rdvData.numero_dossier)) {
                        if (saveStatus) {
                            saveStatus.textContent = 'Impossible : numéro de dossier absent.';
                            saveStatus.style.color = '#b00020';
                        }
                        return;
                    }

                    if (!(window.Directory && typeof window.Directory.addPatient === 'function')) {
                        if (saveStatus) {
                            saveStatus.textContent = 'Annuaire non disponible.';
                            saveStatus.style.color = '#b00020';
                        }
                        return;
                    }

                    await window.Directory.init();
                    const patient = Object.assign({}, userData || {}, rdvData || {});
                    await window.Directory.addPatient(patient);

                    saveBtn.textContent = 'Profil sauvegardé';
                    saveBtn.disabled = true;
                    saveBtn.style.opacity = '0.7';
                    if (saveStatus) {
                        saveStatus.textContent = 'Le profil a bien été enregistré.';
                        saveStatus.style.color = '#1a7f0f';
                    }
                } catch (e) {
                    console.error('Erreur sauvegarde profile:', e);
                    if (saveStatus) {
                        saveStatus.textContent = e && e.name === 'ConstraintError'
                            ? 'Ce profil existe déjà. Il a été mis à jour.'
                            : 'Erreur lors de la sauvegarde du profil. Vérifiez la console.';
                        saveStatus.style.color = '#b00020';
                    }
                }
            });
        }
    }
});