// Configuration de l'API
// Utiliser l'URL de l'API depuis la configuration globale
const API_URL = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost:3001/api';
let currentEvaluationId = null;
let formStatus = 'draft';

// Initialisation des canvas de signature
const signatureCanvases = {
    N: null,
    N1: null,
    N2: null
};

// Initialiser l'application
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification
    checkAuthentication();
    
    initializeSignatureCanvases();
    calculateScores();
    loadFromURL();
    updateStatusDisplay();
    
    // Mettre à jour l'année dans la section objectifs quand elle change
    const anneeInput = document.getElementById('annee');
    if (anneeInput) {
        anneeInput.addEventListener('input', function() {
            const anneeObjectifs = document.getElementById('anneeObjectifs');
            if (anneeObjectifs) {
                anneeObjectifs.textContent = this.value || '20__';
            }
        });
    }
    
    // Définir la date d'aujourd'hui par défaut
    const dateEval = document.getElementById('dateEvaluation');
    if (dateEval && !dateEval.value) {
        dateEval.value = new Date().toISOString().split('T')[0];
    }
});

// Vérifier l'authentification
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    // Vérifier si on est en mode visualisation (paramètre URL)
    const urlParams = new URLSearchParams(window.location.search);
    const isViewMode = urlParams.has('id');
    
    console.log('🔍 Vérification authentification:', { token: !!token, role, userName, isViewMode });
    
    // Si on est en mode visualisation, accepter N1 et N2
    if (isViewMode && token && (role === 'N1' || role === 'N2')) {
        console.log('✅ Mode visualisation autorisé pour', role);
        
        // Afficher le nom de l'utilisateur
        const userNameElement = document.getElementById('userName');
        if (userNameElement && userName) {
            userNameElement.textContent = `👤 ${userName}`;
            console.log('✅ Nom affiché:', userName);
        }
        
        // En mode N2, masquer les boutons de modification
        if (role === 'N2') {
            setTimeout(() => {
                const btnSave = document.getElementById('btnSave');
                const btnSubmit = document.getElementById('btnSubmit');
                if (btnSave) btnSave.style.display = 'none';
                if (btnSubmit) btnSubmit.style.display = 'none';
                
                // Désactiver tous les champs
                disableFormFields();
            }, 1000);
        }
        
        return;
    }
    
    // Mode création/édition : seul N1 est autorisé
    if (!token || role !== 'N1') {
        console.log('❌ Authentification invalide - Redirection vers login');
        // Nettoyer la session
        localStorage.clear();
        sessionStorage.clear();
        // Rediriger vers la page de connexion
        window.location.replace('login.html');
        return;
    }
    
    // Afficher le nom de l'utilisateur
    const userNameElement = document.getElementById('userName');
    if (userNameElement && userName) {
        userNameElement.textContent = `👤 ${userName}`;
        console.log('✅ Nom affiché:', userName);
    } else {
        console.error('❌ Élément userName non trouvé ou userName vide');
    }
}

// Déconnexion
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?\n\nAssurez-vous d\'avoir sauvegardé votre travail.')) {
        // Nettoyer complètement la session
        localStorage.clear();
        sessionStorage.clear();
        // Rediriger vers login (replace pour empêcher retour)
        window.location.replace('login.html');
    }
}

// Initialiser les canvas de signature
function initializeSignatureCanvases() {
    ['N', 'N1', 'N2'].forEach(role => {
        const canvas = document.getElementById(`canvas${role}`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            signatureCanvases[role] = { canvas, ctx, isDrawing: false };
            
            // Événements souris
            canvas.addEventListener('mousedown', (e) => startDrawing(role, e));
            canvas.addEventListener('mousemove', (e) => draw(role, e));
            canvas.addEventListener('mouseup', () => stopDrawing(role));
            canvas.addEventListener('mouseout', () => stopDrawing(role));
            
            // Événements tactiles
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                canvas.dispatchEvent(mouseEvent);
            });
            
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                canvas.dispatchEvent(mouseEvent);
            });
            
            canvas.addEventListener('touchend', (e) => {
                e.preventDefault();
                const mouseEvent = new MouseEvent('mouseup', {});
                canvas.dispatchEvent(mouseEvent);
            });
        }
    });
}

// Fonctions de dessin pour signature
function startDrawing(role, e) {
    const sig = signatureCanvases[role];
    if (!sig) return;
    
    sig.isDrawing = true;
    const rect = sig.canvas.getBoundingClientRect();
    sig.ctx.beginPath();
    sig.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(role, e) {
    const sig = signatureCanvases[role];
    if (!sig || !sig.isDrawing) return;
    
    const rect = sig.canvas.getBoundingClientRect();
    sig.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    sig.ctx.strokeStyle = '#2c3e50';
    sig.ctx.lineWidth = 2;
    sig.ctx.lineCap = 'round';
    sig.ctx.stroke();
}

function stopDrawing(role) {
    const sig = signatureCanvases[role];
    if (!sig) return;
    sig.isDrawing = false;
}

// Effacer une signature
function clearSignature(role) {
    const sig = signatureCanvases[role];
    if (!sig) return;
    sig.ctx.clearRect(0, 0, sig.canvas.width, sig.canvas.height);
}

// Calculer les scores
function calculateScores() {
    // Score N°1 - Objectifs
    let totalObjectifs = 0;
    let countObjectifs = 0;
    for (let i = 1; i <= 5; i++) {
        const radios = document.getElementsByName('taux' + i);
        for (const radio of radios) {
            if (radio.checked) {
                totalObjectifs += parseInt(radio.value);
                countObjectifs++;
                break;
            }
        }
    }
    const scoreN1 = countObjectifs > 0 ? Math.round(totalObjectifs / countObjectifs) : 0;
    document.getElementById('scoreN1').textContent = scoreN1;
    
    // Score N°2 - Savoir-faire et Savoir-être (30 critères)
    // 1. Qualités Professionnelles (10 critères)
    let totalQP = 0;
    let countQP = 0;
    for (let i = 1; i <= 10; i++) {
        const radios = document.getElementsByName('qp' + i);
        for (const radio of radios) {
            if (radio.checked) {
                totalQP += parseInt(radio.value);
                countQP++;
                break;
            }
        }
    }
    const moyenneQP = countQP > 0 ? Math.round(totalQP / countQP) : 0;
    document.getElementById('totalQP').textContent = moyenneQP;
    
    // 2. Qualités Personnelles (10 critères)
    let totalQPE = 0;
    let countQPE = 0;
    for (let i = 1; i <= 10; i++) {
        const radios = document.getElementsByName('qpe' + i);
        for (const radio of radios) {
            if (radio.checked) {
                totalQPE += parseInt(radio.value);
                countQPE++;
                break;
            }
        }
    }
    const moyenneQPE = countQPE > 0 ? Math.round(totalQPE / countQPE) : 0;
    document.getElementById('totalQPE').textContent = moyenneQPE;
    
    // 3. Qualités Relationnelles (10 critères)
    let totalQR = 0;
    let countQR = 0;
    for (let i = 1; i <= 10; i++) {
        const radios = document.getElementsByName('qr' + i);
        for (const radio of radios) {
            if (radio.checked) {
                totalQR += parseInt(radio.value);
                countQR++;
                break;
            }
        }
    }
    const moyenneQR = countQR > 0 ? Math.round(totalQR / countQR) : 0;
    document.getElementById('totalQR').textContent = moyenneQR;
    
    // Score N°2 = (Total 1 + Total 2 + Total 3) / 3
    const scoreN2 = Math.round((moyenneQP + moyenneQPE + moyenneQR) / 3);
    document.getElementById('scoreN2').textContent = scoreN2;
    
    // Mise à jour du tableau Score Final
    document.getElementById('displayN1').textContent = scoreN1;
    document.getElementById('displayN2').textContent = scoreN2;
    const total = scoreN1 + scoreN2;
    document.getElementById('displayTotal').textContent = total;
    
    // Score Final = (N°1 + N°2) / 2
    const scoreFinal = Math.round((scoreN1 + scoreN2) / 2);
    document.getElementById('scoreFinal').textContent = scoreFinal;
    
    // Mettre à jour l'année dans la section objectifs
    const annee = document.getElementById('annee')?.value || '20__';
    const anneeObjectifs = document.getElementById('anneeObjectifs');
    if (anneeObjectifs) {
        anneeObjectifs.textContent = annee;
    }
}

// Collecter les données du formulaire
function collectFormData() {
    const data = {
        dateEvaluation: document.getElementById('dateEvaluation')?.value || '',
        direction: document.getElementById('direction').value,
        service: document.getElementById('service').value,
        evaluateurNom: document.getElementById('evaluateurNom').value,
        evaluateurFonction: document.getElementById('evaluateurFonction').value,
        evalueNom: document.getElementById('evalueNom').value,
        evalueFonction: document.getElementById('evalueFonction').value,
        categorie: document.getElementById('categorie').value,
        emailN2: document.getElementById('emailN2').value,
        annee: document.getElementById('annee').value,
        objectifs: [],
        competences: {
            qualitesProfessionnelles: [],
            qualitesPersonnelles: [],
            qualitesRelationnelles: []
        },
        observations: {
            evaluateur: {
                pointsForts: [
                    document.getElementById('pf1')?.value || '',
                    document.getElementById('pf2')?.value || '',
                    document.getElementById('pf3')?.value || ''
                ],
                pointsFaibles: [
                    document.getElementById('pa1')?.value || '',
                    document.getElementById('pa2')?.value || '',
                    document.getElementById('pa3')?.value || ''
                ],
                axesProgres: [
                    document.getElementById('axe1')?.value || '',
                    document.getElementById('axe2')?.value || '',
                    document.getElementById('axe3')?.value || ''
                ]
            },
            evalue: {
                reussites: [
                    document.getElementById('reussite1')?.value || '',
                    document.getElementById('reussite2')?.value || '',
                    document.getElementById('reussite3')?.value || ''
                ],
                difficultes: [
                    document.getElementById('difficulte1')?.value || '',
                    document.getElementById('difficulte2')?.value || '',
                    document.getElementById('difficulte3')?.value || ''
                ],
                souhaits: [
                    document.getElementById('souhait1')?.value || '',
                    document.getElementById('souhait2')?.value || '',
                    document.getElementById('souhait3')?.value || ''
                ]
            }
        },
        scores: {
            scoreN1: document.getElementById('scoreN1').textContent,
            scoreN2: document.getElementById('scoreN2').textContent,
            scoreFinal: document.getElementById('scoreFinal').textContent,
            totalQP: document.getElementById('totalQP')?.textContent || '0',
            totalQPE: document.getElementById('totalQPE')?.textContent || '0',
            totalQR: document.getElementById('totalQR')?.textContent || '0'
        },
        signatures: {
            N: {
                nom: document.getElementById('signatureNomN')?.value || '',
                date: document.getElementById('signatureDateN')?.value || '',
                image: signatureCanvases.N?.canvas.toDataURL() || ''
            },
            N1: {
                nom: document.getElementById('signatureNomN1')?.value || '',
                date: document.getElementById('signatureDateN1')?.value || '',
                image: signatureCanvases.N1?.canvas.toDataURL() || ''
            },
            N2: {
                nom: document.getElementById('signatureNomN2')?.value || '',
                date: document.getElementById('signatureDateN2')?.value || '',
                image: signatureCanvases.N2?.canvas.toDataURL() || ''
            }
        }
    };
    
    // Objectifs
    for (let i = 1; i <= 5; i++) {
        const radios = document.getElementsByName('taux' + i);
        let selectedValue = null;
        for (const radio of radios) {
            if (radio.checked) {
                selectedValue = radio.value;
                break;
            }
        }
        data.objectifs.push({
            objectif: document.getElementById('obj' + i)?.value || '',
            indicateur: document.getElementById('ind' + i)?.value || '',
            taux: selectedValue
        });
    }
    
    // Qualités Professionnelles
    for (let i = 1; i <= 10; i++) {
        const radios = document.getElementsByName('qp' + i);
        let selectedValue = null;
        for (const radio of radios) {
            if (radio.checked) {
                selectedValue = radio.value;
                break;
            }
        }
        data.competences.qualitesProfessionnelles.push({
            critere: i,
            score: selectedValue
        });
    }
    
    // Qualités Personnelles
    for (let i = 1; i <= 10; i++) {
        const radios = document.getElementsByName('qpe' + i);
        let selectedValue = null;
        for (const radio of radios) {
            if (radio.checked) {
                selectedValue = radio.value;
                break;
            }
        }
        data.competences.qualitesPersonnelles.push({
            critere: i,
            score: selectedValue
        });
    }
    
    // Qualités Relationnelles
    for (let i = 1; i <= 10; i++) {
        const radios = document.getElementsByName('qr' + i);
        let selectedValue = null;
        for (const radio of radios) {
            if (radio.checked) {
                selectedValue = radio.value;
                break;
            }
        }
        data.competences.qualitesRelationnelles.push({
            critere: i,
            score: selectedValue
        });
    }
    
    return data;
}

// Afficher une alerte
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.innerHTML = `
        <strong>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</strong> ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
    `;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Afficher le chargement
function showLoading(show) {
    const loading = document.getElementById('loading');
    const formContent = document.getElementById('formContent');
    if (show) {
        loading.classList.add('active');
        formContent.style.opacity = '0.5';
    } else {
        loading.classList.remove('active');
        formContent.style.opacity = '1';
    }
}

// Mettre à jour l'affichage du statut
function updateStatusDisplay() {
    const banner = document.getElementById('statusBanner');
    const statusText = document.getElementById('statusText');
    
    banner.style.display = 'block';
    banner.className = 'status-banner';
    
    switch(formStatus) {
        case 'draft':
            banner.classList.add('status-draft');
            statusText.textContent = '📝 Brouillon - En cours de remplissage';
            break;
        case 'submitted':
            banner.classList.add('status-submitted');
            statusText.textContent = '📤 Soumis à N+2 - En attente de validation';
            document.getElementById('btnSubmit').disabled = true;
            break;
        case 'validated':
            banner.classList.add('status-validated');
            statusText.textContent = '✅ Validé par N+2 - Prêt pour archivage';
            document.getElementById('btnSubmit').disabled = true;
            document.getElementById('btnSave').disabled = true;
            break;
    }
}

// Sauvegarder le brouillon
async function saveDraft() {
    showLoading(true);
    const data = collectFormData();
    
    console.log('Données collectées pour sauvegarde:', data);
    
    try {
        let response;
        if (currentEvaluationId) {
            // Mise à jour
            console.log('Mise à jour de l\'évaluation', currentEvaluationId);
            response = await fetch(`${API_URL}/evaluations/${currentEvaluationId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                body: JSON.stringify(data)
            });
        } else {
            // Création
            console.log('Création d\'une nouvelle évaluation');
            response = await fetch(`${API_URL}/evaluations`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                body: JSON.stringify(data)
            });
        }
        
        const result = await response.json();
        console.log('Résultat de la sauvegarde:', result);
        
        if (result.success) {
            currentEvaluationId = result.evaluation.id;
            showAlert('✅ Brouillon sauvegardé avec succès !', 'success');
            
            // Mettre à jour l'URL
            window.history.pushState({}, '', `?id=${currentEvaluationId}`);
        } else {
            showAlert('❌ Erreur lors de la sauvegarde: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('❌ Erreur détaillée de sauvegarde:', error);
        
        // Message d'erreur plus détaillé
        const errorMsg = error.message && error.message.includes('Failed to fetch')
            ? '❌ Impossible de se connecter au serveur. Vérifiez que le serveur est démarré (node server-mysql.js)'
            : `❌ Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`;
        
        showAlert(errorMsg, 'error');
    } finally {
        showLoading(false);
    }
}

// Télécharger le formulaire en PDF
async function downloadPDF() {
    // Sauvegarder d'abord si pas encore fait
    if (!currentEvaluationId) {
        console.log('Pas d\'ID d\'évaluation, sauvegarde en cours...');
        await saveDraft();
        if (!currentEvaluationId) {
            showAlert('❌ Veuillez remplir le formulaire avant de télécharger le PDF', 'error');
            return;
        }
    }
    
    console.log('Téléchargement PDF pour l\'évaluation ID:', currentEvaluationId);
    showLoading(true);
    
    try {
        // Vérifier si pdf-generator.js et jsPDF sont chargés
        if (typeof generatePDF === 'function' && typeof window.jspdf !== 'undefined') {
            console.log('Génération du PDF avec jsPDF...');
            // Appeler generatePDF avec l'ID (la fonction fait elle-même l'appel API)
            await generatePDF(currentEvaluationId);
            showAlert('✅ PDF téléchargé avec succès !', 'success');
        } else {
            // Fallback : utiliser window.print()
            console.warn('jsPDF non disponible, utilisation de window.print()');
            showAlert('📄 Impression du formulaire... Utilisez "Enregistrer en PDF" dans la boîte de dialogue d\'impression', 'info');
            window.print();
        }
    } catch (error) {
        console.error('Erreur PDF complète:', error);
        showAlert('❌ Erreur: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Valider les champs requis
function validateForm() {
    const requiredFields = [
        'direction', 'service', 'evaluateurNom', 'evaluateurFonction',
        'evalueNom', 'evalueFonction', 'categorie', 'emailN2', 'annee'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            showAlert(`⚠️ Le champ "${field.placeholder || fieldId}" est obligatoire`, 'error');
            field.focus();
            return false;
        }
    }
    
    // Vérifier les signatures N et N+1
    if (!document.getElementById('signatureNomN').value || !document.getElementById('signatureDateN').value) {
        showAlert('⚠️ La signature de l\'évalué (N) est requise', 'error');
        return false;
    }
    
    if (!document.getElementById('signatureNomN1').value || !document.getElementById('signatureDateN1').value) {
        showAlert('⚠️ La signature de l\'évaluateur (N+1) est requise', 'error');
        return false;
    }
    
    // Vérifier que les signatures ont été dessinées
    const canvasN = signatureCanvases.N.canvas;
    const canvasN1 = signatureCanvases.N1.canvas;
    
    if (isCanvasBlank(canvasN)) {
        showAlert('⚠️ Veuillez signer sur le canvas de l\'évalué (N)', 'error');
        return false;
    }
    
    if (isCanvasBlank(canvasN1)) {
        showAlert('⚠️ Veuillez signer sur le canvas de l\'évaluateur (N+1)', 'error');
        return false;
    }
    
    return true;
}

// Vérifier si un canvas est vide
function isCanvasBlank(canvas) {
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL();
}

// Soumettre à N+2
async function submitToN2() {
    if (!validateForm()) {
        return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir soumettre cette évaluation à N+2 ?\n\nUne fois soumise, vous ne pourrez plus la modifier.')) {
        return;
    }
    
    // Sauvegarder d'abord si pas encore fait
    if (!currentEvaluationId) {
        await saveDraft();
        if (!currentEvaluationId) {
            showAlert('❌ Erreur: impossible de sauvegarder l\'évaluation', 'error');
            return;
        }
    }
    
    showLoading(true);
    
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            showAlert('❌ Session expirée. Veuillez vous reconnecter.', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        console.log('📤 Soumission de l\'évaluation #' + currentEvaluationId);
        
        const response = await fetch(`${API_URL}/evaluations/${currentEvaluationId}/submit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });
        
        console.log('Réponse serveur:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur serveur:', response.status, errorText);
            throw new Error(`Erreur serveur: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Résultat:', result);
        
        if (result.success) {
            formStatus = 'submitted';
            updateStatusDisplay();
            showAlert('✅ Évaluation soumise avec succès à N+2 !\n\n📧 Un email de notification a été envoyé.\n\nLa page va se rafraîchir...', 'success');
            
            // Désactiver les champs
            disableFormFields();
            
            // Rafraîchir la page après 2 secondes
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            showAlert('❌ Erreur lors de la soumission: ' + (result.error || 'Erreur inconnue'), 'error');
        }
    } catch (error) {
        console.error('Erreur complète:', error);
        showAlert('❌ Erreur de connexion au serveur: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Désactiver les champs du formulaire
function disableFormFields() {
    const inputs = document.querySelectorAll('input:not([type="button"]), textarea, select');
    inputs.forEach(input => {
        if (!input.id.includes('N2')) {
            input.disabled = true;
        }
    });
    
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => radio.disabled = true);
}

// Charger une évaluation depuis l'URL
async function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        await loadEvaluation(id);
    }
}

// Charger une évaluation
async function loadEvaluation(id) {
    showLoading(true);
    
    try {
        console.log(`📥 Chargement de l'évaluation ID: ${id}`);
        const response = await fetch(`${API_URL}/evaluations/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 Résultat du chargement:', result);
        
        if (result.success) {
            const data = result.evaluation;
            currentEvaluationId = id;
            formStatus = data.status || 'draft';
            
            // Remplir les champs
            document.getElementById('direction').value = data.direction || '';
            document.getElementById('service').value = data.service || '';
            document.getElementById('evaluateurNom').value = data.evaluateurNom || '';
            document.getElementById('evaluateurFonction').value = data.evaluateurFonction || '';
            document.getElementById('evalueNom').value = data.evalueNom || '';
            document.getElementById('evalueFonction').value = data.evalueFonction || '';
            document.getElementById('categorie').value = data.categorie || '';
            document.getElementById('emailN2').value = data.emailN2 || '';
            document.getElementById('annee').value = data.annee || '';
            
            // Charger les objectifs
            if (data.objectifs) {
                data.objectifs.forEach((obj, i) => {
                    const index = i + 1;
                    if (document.getElementById('obj' + index)) {
                        document.getElementById('obj' + index).value = obj.objectif || '';
                    }
                    if (document.getElementById('ind' + index)) {
                        document.getElementById('ind' + index).value = obj.indicateur || '';
                    }
                    if (obj.taux) {
                        const radios = document.getElementsByName('taux' + index);
                        for (const radio of radios) {
                            if (radio.value === obj.taux) {
                                radio.checked = true;
                                break;
                            }
                        }
                    }
                });
            }
            
            // Charger les observations (structure corrigée)
            if (data.observations) {
                // Observations de l'évaluateur
                if (data.observations.evaluateur) {
                    const pointsForts = data.observations.evaluateur.pointsForts || [];
                    if (pointsForts[0]) document.getElementById('pf1').value = pointsForts[0];
                    if (pointsForts[1]) document.getElementById('pf2').value = pointsForts[1];
                    if (pointsForts[2]) document.getElementById('pf3').value = pointsForts[2];
                    
                    const pointsFaibles = data.observations.evaluateur.pointsFaibles || [];
                    if (pointsFaibles[0]) document.getElementById('pa1').value = pointsFaibles[0];
                    if (pointsFaibles[1]) document.getElementById('pa2').value = pointsFaibles[1];
                    if (pointsFaibles[2]) document.getElementById('pa3').value = pointsFaibles[2];
                    
                    const axesProgres = data.observations.evaluateur.axesProgres || [];
                    if (axesProgres[0]) document.getElementById('axe1').value = axesProgres[0];
                    if (axesProgres[1]) document.getElementById('axe2').value = axesProgres[1];
                    if (axesProgres[2]) document.getElementById('axe3').value = axesProgres[2];
                }
                
                // Observations de l'évalué
                if (data.observations.evalue) {
                    const reussites = data.observations.evalue.reussites || [];
                    if (reussites[0]) document.getElementById('reussite1').value = reussites[0];
                    if (reussites[1]) document.getElementById('reussite2').value = reussites[1];
                    if (reussites[2]) document.getElementById('reussite3').value = reussites[2];
                    
                    const difficultes = data.observations.evalue.difficultes || [];
                    if (difficultes[0]) document.getElementById('difficulte1').value = difficultes[0];
                    if (difficultes[1]) document.getElementById('difficulte2').value = difficultes[1];
                    if (difficultes[2]) document.getElementById('difficulte3').value = difficultes[2];
                    
                    const souhaits = data.observations.evalue.souhaits || [];
                    if (souhaits[0]) document.getElementById('souhait1').value = souhaits[0];
                    if (souhaits[1]) document.getElementById('souhait2').value = souhaits[1];
                    if (souhaits[2]) document.getElementById('souhait3').value = souhaits[2];
                }
            }
            
            // Charger les compétences (CODE MANQUANT AJOUTÉ!)
            if (data.competences) {
                // Qualités Professionnelles
                if (data.competences.qualitesProfessionnelles) {
                    data.competences.qualitesProfessionnelles.forEach((item, index) => {
                        if (item.score) {
                            const radioName = 'qp' + (index + 1);
                            const radio = document.querySelector(`input[name="${radioName}"][value="${item.score}"]`);
                            if (radio) radio.checked = true;
                        }
                    });
                }
                
                // Qualités Personnelles
                if (data.competences.qualitesPersonnelles) {
                    data.competences.qualitesPersonnelles.forEach((item, index) => {
                        if (item.score) {
                            const radioName = 'qpe' + (index + 1);
                            const radio = document.querySelector(`input[name="${radioName}"][value="${item.score}"]`);
                            if (radio) radio.checked = true;
                        }
                    });
                }
                
                // Qualités Relationnelles
                if (data.competences.qualitesRelationnelles) {
                    data.competences.qualitesRelationnelles.forEach((item, index) => {
                        if (item.score) {
                            const radioName = 'qr' + (index + 1);
                            const radio = document.querySelector(`input[name="${radioName}"][value="${item.score}"]`);
                            if (radio) radio.checked = true;
                        }
                    });
                }
            }
            
            // Charger les signatures
            if (data.signatures) {
                ['N', 'N1', 'N2'].forEach(role => {
                    if (data.signatures[role]) {
                        const sig = data.signatures[role];
                        if (document.getElementById(`signatureNom${role}`)) {
                            document.getElementById(`signatureNom${role}`).value = sig.nom || '';
                        }
                        if (document.getElementById(`signatureDate${role}`)) {
                            document.getElementById(`signatureDate${role}`).value = sig.date || '';
                        }
                        if (sig.image && signatureCanvases[role]) {
                            const img = new Image();
                            img.onload = function() {
                                signatureCanvases[role].ctx.drawImage(img, 0, 0);
                            };
                            img.src = sig.image;
                        }
                    }
                });
            }
            
            calculateScores();
            updateStatusDisplay();
            
            if (formStatus !== 'draft') {
                disableFormFields();
            }
            
            showAlert('✅ Évaluation chargée avec succès', 'success');
        } else {
            showAlert('❌ Erreur lors du chargement: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('❌ Erreur détaillée:', error);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        // Message d'erreur plus détaillé
        const errorMsg = error.message.includes('Failed to fetch') 
            ? '❌ Impossible de se connecter au serveur. Vérifiez que le serveur est démarré (node server-mysql.js)'
            : `❌ Erreur de chargement: ${error.message}`;
        
        showAlert(errorMsg, 'error');
    } finally {
        showLoading(false);
    }
}

// =====================================================
// GESTION DES ONGLETS ET ÉVALUATIONS VALIDÉES (N+1)
// =====================================================

// Changer d'onglet
function switchTab(tab) {
    const formContent = document.getElementById('formContent');
    const validatedSection = document.getElementById('validatedSection');
    const tabFormulaire = document.getElementById('tabFormulaire');
    const tabValidated = document.getElementById('tabValidated');
    
    if (tab === 'formulaire') {
        formContent.style.display = 'block';
        validatedSection.style.display = 'none';
        tabFormulaire.style.background = 'linear-gradient(135deg, #4A9D5F 0%, #6BC17D 100%)';
        tabFormulaire.style.color = 'white';
        tabValidated.style.background = '#e0e0e0';
        tabValidated.style.color = '#666';
    } else if (tab === 'validated') {
        formContent.style.display = 'none';
        validatedSection.style.display = 'block';
        tabFormulaire.style.background = '#e0e0e0';
        tabFormulaire.style.color = '#666';
        tabValidated.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
        tabValidated.style.color = 'white';
        
        // Pré-remplir l'email si disponible
        const userEmail = localStorage.getItem('userEmail');
        const emailInput = document.getElementById('emailN1Validated');
        if (userEmail && emailInput && !emailInput.value) {
            emailInput.value = userEmail;
        }
    }
}

// Charger les évaluations validées
let validatedEvaluations = [];

async function loadValidatedEvaluations() {
    const email = document.getElementById('emailN1Validated').value.trim();
    const userEmail = localStorage.getItem('userEmail');
    
    if (!email) {
        showAlert('⚠️ Veuillez entrer votre adresse email', 'error');
        return;
    }
    
    // Vérifier que l'email correspond à l'utilisateur connecté
    if (userEmail && email.toLowerCase() !== userEmail.toLowerCase()) {
        const confirmLoad = confirm(
            `⚠️ ATTENTION\n\n` +
            `L'email saisi (${email}) ne correspond pas à votre profil connecté (${userEmail}).\n\n` +
            `Voulez-vous vraiment charger les évaluations pour cet email ?`
        );
        
        if (!confirmLoad) {
            document.getElementById('emailN1Validated').value = userEmail;
            return;
        }
    }
    
    document.getElementById('validatedLoadingContainer').style.display = 'block';
    document.getElementById('validatedEvaluationsContainer').innerHTML = '';
    
    try {
        // Utiliser la nouvelle route pour les évaluateurs N+1
        const response = await fetch(`${API_URL}/evaluations/evaluator/${encodeURIComponent(email)}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Filtrer uniquement les évaluations validées
            validatedEvaluations = result.evaluations.filter(e => e.status === 'validated');
            
            displayValidatedEvaluations();
            updateValidatedStats();
            document.getElementById('validatedStatsContainer').style.display = 'block';
            
            if (validatedEvaluations.length === 0) {
                showAlert('ℹ️ Aucune évaluation validée trouvée pour cet email', 'info');
            } else {
                showAlert(`✅ ${validatedEvaluations.length} évaluation(s) validée(s) chargée(s)`, 'success');
            }
        } else {
            showAlert('❌ Erreur lors du chargement: ' + (result.error || 'Erreur inconnue'), 'error');
        }
    } catch (error) {
        showAlert('❌ Erreur de connexion au serveur', 'error');
        console.error('Erreur:', error);
    } finally {
        document.getElementById('validatedLoadingContainer').style.display = 'none';
    }
}

// Afficher les évaluations validées
function displayValidatedEvaluations() {
    const container = document.getElementById('validatedEvaluationsContainer');
    
    if (validatedEvaluations.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #7f8c8d;">
                <div style="font-size: 80px; margin-bottom: 20px;">📭</div>
                <h2>Aucune évaluation validée</h2>
                <p>Vous n'avez pas encore d'évaluation validée par le N+2.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = validatedEvaluations.map(evaluation => {
        const evalueNom = evaluation.evalue_nom || evaluation.evalueNom || 'N/A';
        const evaluateurNom = evaluation.evaluateur_nom || evaluation.evaluateurNom || 'N/A';
        const evalueFonction = evaluation.evalue_fonction || evaluation.evalueFonction || 'N/A';
        const direction = evaluation.direction || 'N/A';
        const service = evaluation.service || 'N/A';
        const validatedAt = evaluation.validated_at || evaluation.validatedAt;
        const scoreFinal = evaluation.score_final || evaluation.scoreFinal || '0';
        
        return `
            <div style="background: white; border: 2px solid #27ae60; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div style="font-size: 20px; font-weight: bold; color: #2c3e50;">
                        📋 Évaluation de ${evalueNom}
                    </div>
                    <div style="background-color: #d4edda; color: #155724; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                        ✅ Validée
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0;">
                    <div style="padding: 10px; background-color: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">Évaluateur (N+1)</div>
                        <div style="font-size: 14px; color: #2c3e50; font-weight: 600;">${evaluateurNom}</div>
                    </div>
                    <div style="padding: 10px; background-color: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">Fonction</div>
                        <div style="font-size: 14px; color: #2c3e50; font-weight: 600;">${evalueFonction}</div>
                    </div>
                    <div style="padding: 10px; background-color: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">Direction</div>
                        <div style="font-size: 14px; color: #2c3e50; font-weight: 600;">${direction}</div>
                    </div>
                    <div style="padding: 10px; background-color: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">Service</div>
                        <div style="font-size: 14px; color: #2c3e50; font-weight: 600;">${service}</div>
                    </div>
                    <div style="padding: 10px; background-color: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">Validée le</div>
                        <div style="font-size: 14px; color: #2c3e50; font-weight: 600;">${validatedAt ? new Date(validatedAt).toLocaleDateString('fr-FR') : 'N/A'}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; margin: 20px 0;">
                    <div style="flex: 1; padding: 15px; background: linear-gradient(135deg, #27ae60 0%, #229954 100%); border-radius: 8px; text-align: center; color: white;">
                        <div style="font-size: 12px; margin-bottom: 5px;">Score Final</div>
                        <div style="font-size: 24px; font-weight: bold;">${scoreFinal}%</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="viewValidatedEvaluation(${evaluation.id})" style="flex: 1; padding: 12px 25px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                        👁️ Voir le détail complet
                    </button>
                    <button onclick="downloadValidatedPDF(${evaluation.id})" style="flex: 1; padding: 12px 25px; background: linear-gradient(135deg, #E30613 0%, #FF3B47 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                        📥 Télécharger le PDF
                    </button>
                    <button onclick="viewValidatedSignatures(${evaluation.id})" style="flex: 1; padding: 12px 25px; background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
                        📋 Voir les signatures
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Mettre à jour les statistiques
function updateValidatedStats() {
    document.getElementById('statValidatedCount').textContent = validatedEvaluations.length;
}

// Voir une évaluation validée en détail
function viewValidatedEvaluation(id) {
    window.open(`formulaire-online.html?id=${id}`, '_blank');
}

// Télécharger le PDF d'une évaluation validée
async function downloadValidatedPDF(evaluationId) {
    try {
        showAlert('📄 Génération du PDF en cours...', 'info');
        
        const result = await generatePDF(evaluationId);
        
        if (result.success) {
            showAlert(`✅ PDF téléchargé : ${result.fileName}`, 'success');
        } else {
            showAlert('❌ Erreur lors de la génération du PDF', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        showAlert('❌ Erreur lors de la génération du PDF', 'error');
    }
}

// Voir les signatures d'une évaluation validée
async function viewValidatedSignatures(evaluationId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/evaluations/${evaluationId}/full`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const result = await response.json();
        
        if (!result.success || !result.evaluation) {
            showAlert('❌ Erreur lors du chargement des détails', 'error');
            return;
        }
        
        const evaluation = result.evaluation;
        const signatures = evaluation.signatures || {};
        
        let signaturesHTML = '<div style="padding: 20px;">';
        
        // Signature N
        if (signatures.N && signatures.N.image) {
            signaturesHTML += `
                <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 10px; border: 2px solid #4A9D5F;">
                    <h3 style="color: #4A9D5F; margin-bottom: 15px;">✍️ Signature de l'Évalué (N)</h3>
                    <div style="text-align: center; margin-bottom: 15px;">
                        <img src="${signatures.N.image}" style="max-width: 500px; height: auto; border: 2px solid #dee2e6; border-radius: 8px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 15px; background-color: white; border-radius: 8px;">
                        <div><strong>Nom:</strong> ${signatures.N.nom || 'N/A'}</div>
                        <div><strong>Date:</strong> ${signatures.N.date || 'N/A'}</div>
                    </div>
                </div>
            `;
        }
        
        // Signature N+1
        if (signatures.N1 && signatures.N1.image) {
            signaturesHTML += `
                <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 10px; border: 2px solid #3498db;">
                    <h3 style="color: #3498db; margin-bottom: 15px;">✍️ Signature de l'Évaluateur (N+1)</h3>
                    <div style="text-align: center; margin-bottom: 15px;">
                        <img src="${signatures.N1.image}" style="max-width: 500px; height: auto; border: 2px solid #dee2e6; border-radius: 8px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 15px; background-color: white; border-radius: 8px;">
                        <div><strong>Nom:</strong> ${signatures.N1.nom || 'N/A'}</div>
                        <div><strong>Date:</strong> ${signatures.N1.date || 'N/A'}</div>
                    </div>
                </div>
            `;
        }
        
        // Signature N+2
        if (signatures.N2 && signatures.N2.image) {
            signaturesHTML += `
                <div style="margin-bottom: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 10px; border: 2px solid #e74c3c;">
                    <h3 style="color: #e74c3c; margin-bottom: 15px;">✍️ Signature du Validateur (N+2)</h3>
                    <div style="text-align: center; margin-bottom: 15px;">
                        <img src="${signatures.N2.image}" style="max-width: 500px; height: auto; border: 2px solid #dee2e6; border-radius: 8px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 15px; background-color: white; border-radius: 8px;">
                        <div><strong>Nom:</strong> ${signatures.N2.nom || 'N/A'}</div>
                        <div><strong>Date:</strong> ${signatures.N2.date || 'N/A'}</div>
                    </div>
                </div>
            `;
        }
        
        signaturesHTML += '</div>';
        
        // Créer et afficher un modal personnalisé
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;';
        modal.innerHTML = `
            <div style="background-color: white; border-radius: 15px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; padding: 20px 30px; border-radius: 15px 15px 0 0;">
                    <h2 style="margin: 0; font-size: 24px;">📋 Évaluation Validée - Toutes les Signatures</h2>
                </div>
                <div style="padding: 30px;">
                    <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #28a745;">
                        <strong>✅ Évaluation validée</strong><br>
                        <strong>Évalué:</strong> ${evaluation.evalueNom || 'N/A'}<br>
                        <strong>Score final:</strong> ${evaluation.scores?.scoreFinal || 0}%<br>
                        <strong>Date de validation:</strong> ${evaluation.validatedAt ? new Date(evaluation.validatedAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                    ${signaturesHTML}
                </div>
                <div style="padding: 20px 30px; border-top: 2px solid #e0e0e0; text-align: right;">
                    <button onclick="downloadValidatedPDF(${evaluationId})" style="padding: 12px 25px; background: linear-gradient(135deg, #E30613 0%, #FF3B47 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 10px;">
                        📥 Télécharger le PDF
                    </button>
                    <button onclick="this.closest('div[style*=\\'position: fixed\\']').remove()" style="padding: 12px 25px; background-color: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        ❌ Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fermer en cliquant en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('❌ Erreur lors du chargement des signatures', 'error');
    }
}

// Exposer les fonctions au scope global pour les boutons onclick
window.viewValidatedEvaluation = viewValidatedEvaluation;
window.downloadValidatedPDF = downloadValidatedPDF;
window.viewValidatedSignatures = viewValidatedSignatures;
window.loadValidatedEvaluations = loadValidatedEvaluations;
