// Configuration de l'API
// Utiliser l'URL de l'API depuis la configuration globale
const API_URL = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost:3001/api';
let currentEmail = '';
let evaluations = []; // Évaluations affichées (peut être filtrée)
let allEvaluations = []; // Toutes les évaluations (pour les stats globales)
let currentEvaluationForValidation = null;

// Canvas de signature
let signatureCanvas = null;
let signatureCtx = null;
let isDrawing = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 Initialisation de la page de validation...');
        
        // Vérifier l'authentification
        checkAuthentication();
        
        console.log('✅ Authentification vérifiée');
        
        initializeSignatureCanvas();
        
        console.log('✅ Canvas de signature initialisé');
        
        // Récupérer l'email de la session
        const userEmail = localStorage.getItem('userEmail');
        console.log('📧 Email utilisateur:', userEmail);
        
        if (userEmail) {
            // Pré-remplir l'email automatiquement
            const emailInput = document.getElementById('emailN2Input');
            if (emailInput) {
                emailInput.value = userEmail;
            }
            
            // Vérifier si on doit afficher les évaluations validées
            const showValidated = sessionStorage.getItem('showValidated');
            
            if (showValidated === 'true') {
                // Charger directement les évaluations validées
                console.log('🎯 Chargement automatique des évaluations validées...');
                sessionStorage.removeItem('showValidated');
                setTimeout(() => {
                    loadValidatedEvaluations();
                }, 300);
            } else {
                // Charger automatiquement les évaluations en attente
                console.log('🎯 Chargement automatique des évaluations en attente...');
                setTimeout(() => {
                    loadPendingEvaluations();
                }, 300);
            }
        } else {
            // Pas d'email : afficher une alerte
            console.error('❌ Aucun email trouvé dans la session');
            showAlert('❌ Erreur: Aucun email trouvé. Veuillez vous reconnecter.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
        
        // Définir la date du jour par défaut
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('modalSignatureDate');
        if (dateInput) {
            dateInput.value = today;
            console.log('✅ Date définie:', today);
        }
        
        console.log('✅ Initialisation terminée avec succès');
    } catch (error) {
        console.error('❌ ERREUR lors de l\'initialisation:', error);
        console.error('Stack:', error.stack);
        showAlert('❌ Erreur lors de l\'initialisation de la page: ' + error.message, 'error');
    }
});

// Afficher le modal de demande d'email
function showEmailModal() {
    try {
        console.log('📋 showEmailModal appelée');
        const modal = document.getElementById('emailModal');
        if (modal) {
            console.log('✅ Modal trouvé, affichage...');
            modal.classList.add('show');
            
            // Permettre de soumettre avec la touche Entrée
            const emailInput = document.getElementById('emailModalInput');
            if (emailInput) {
                console.log('✅ emailModalInput trouvé');
                emailInput.focus();
                emailInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        console.log('⌨️ Touche Entrée pressée');
                        submitEmailModal();
                    }
                });
            } else {
                console.error('❌ emailModalInput non trouvé');
            }
        } else {
            console.error('❌ Modal emailModal non trouvé dans le DOM');
            showAlert('❌ Erreur: Modal d\'email non trouvé', 'error');
        }
    } catch (error) {
        console.error('❌ Erreur dans showEmailModal:', error);
        showAlert('❌ Erreur lors de l\'affichage du modal: ' + error.message, 'error');
    }
}

// Fermer le modal d'email et charger les évaluations
function submitEmailModal() {
    const emailInput = document.getElementById('emailModalInput');
    const email = emailInput.value.trim();
    
    if (!email) {
        showAlert('⚠️ Veuillez entrer votre adresse email', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('⚠️ Veuillez entrer une adresse email valide', 'error');
        return;
    }
    
    // Sauvegarder l'email
    document.getElementById('emailN2Input').value = email;
    currentEmail = email;
    
    // Fermer le modal
    const modal = document.getElementById('emailModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Charger les évaluations
    loadPendingEvaluations();
}

// Valider le format de l'email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Vérifier l'authentification
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log('🔍 Vérification authentification N+2:', { 
        token: !!token, 
        role, 
        userName,
        userEmail 
    });
    
    // Vérification stricte : token, rôle N2 et email requis
    if (!token || role !== 'N2' || !userEmail) {
        console.error('❌ Authentification invalide - Redirection vers login');
        // Nettoyer complètement la session
        localStorage.clear();
        sessionStorage.clear();
        // Redirection immédiate
        window.location.replace('login.html');
        return;
    }
    
    // Vérifier que l'email est défini
    if (!userEmail) {
        console.error('⚠️ Email utilisateur non défini dans localStorage');
        showAlert('⚠️ Erreur de session : email non défini. Veuillez vous reconnecter.', 'error');
        setTimeout(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        }, 3000);
        return;
    }
    
    // Afficher le nom de l'utilisateur
    const userNameElement = document.getElementById('userName');
    if (userNameElement && userName) {
        userNameElement.textContent = `👤 ${userName}`;
        console.log('✅ Nom N+2 affiché:', userName);
    } else {
        console.error('❌ Élément userName non trouvé ou userName vide');
    }
    
    // Afficher les informations de diagnostic (pour debug)
    console.log('📋 Profil connecté:');
    console.log('   - Nom:', userName);
    console.log('   - Email:', userEmail);
    console.log('   - Rôle:', role);
}

// Déconnexion
function logout() {
    console.log('🚪 Déconnexion en cours...');
    
    // Nettoyer complètement la session
    localStorage.clear();
    sessionStorage.clear();
    
    // Supprimer tous les cookies
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Session nettoyée');
    
    // Redirection avec replace (empêche le retour arrière)
    window.location.replace('login.html');
}

// Initialiser le canvas de signature dans le modal
function initializeSignatureCanvas() {
    signatureCanvas = document.getElementById('modalSignatureCanvas');
    signatureCtx = signatureCanvas.getContext('2d');
    
    // Événements souris
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);
    
    // Événements tactiles
    signatureCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = signatureCanvas.getBoundingClientRect();
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        signatureCanvas.dispatchEvent(mouseEvent);
    });
    
    signatureCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        signatureCanvas.dispatchEvent(mouseEvent);
    });
    
    signatureCanvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        signatureCanvas.dispatchEvent(new MouseEvent('mouseup', {}));
    });
}

function startDrawing(e) {
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    signatureCtx.beginPath();
    signatureCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = signatureCanvas.getBoundingClientRect();
    signatureCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    signatureCtx.strokeStyle = '#2c3e50';
    signatureCtx.lineWidth = 2;
    signatureCtx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function clearModalSignature() {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
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

// ==================== NOUVELLES FONCTIONS: ONGLETS, FILTRES ET EXPORT ====================

// État actuel de l'onglet (pending ou validated)
let currentTab = 'pending';
let filteredEvaluations = []; // Évaluations après filtrage

// Basculer entre les onglets (En attente / Validées)
function switchTab(tab) {
    currentTab = tab;
    
    // Mettre à jour les styles des boutons
    const tabPending = document.getElementById('tabPending');
    const tabValidated = document.getElementById('tabValidated');
    
    if (tab === 'pending') {
        tabPending.classList.add('active');
        tabValidated.classList.remove('active');
        tabPending.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
        tabPending.style.color = 'white';
        tabValidated.style.background = '#ecf0f1';
        tabValidated.style.color = '#7f8c8d';
    } else {
        tabValidated.classList.add('active');
        tabPending.classList.remove('active');
        tabValidated.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
        tabValidated.style.color = 'white';
        tabPending.style.background = '#ecf0f1';
        tabPending.style.color = '#7f8c8d';
    }
    
    // Réappliquer les filtres avec le nouvel onglet
    applyFilters();
}

// Appliquer les filtres (recherche, direction, score)
function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const directionFilter = document.getElementById('filterDirection').value;
    const scoreFilter = document.getElementById('filterScore').value;
    
    // Filtrer d'abord par onglet (pending ou validated)
    let filtered = allEvaluations.filter(eval => {
        if (currentTab === 'pending') {
            return eval.status === 'submitted';
        } else {
            return eval.status === 'validated';
        }
    });
    
    // Appliquer le filtre de recherche
    if (searchText) {
        filtered = filtered.filter(eval => 
            (eval.nom && eval.nom.toLowerCase().includes(searchText)) ||
            (eval.prenom && eval.prenom.toLowerCase().includes(searchText)) ||
            (eval.matricule && eval.matricule.toLowerCase().includes(searchText))
        );
    }
    
    // Appliquer le filtre de direction
    if (directionFilter) {
        filtered = filtered.filter(eval => eval.direction === directionFilter);
    }
    
    // Appliquer le filtre de score
    if (scoreFilter) {
        const [min, max] = scoreFilter.split('-').map(Number);
        filtered = filtered.filter(eval => {
            const scorePercent = ((eval.score || 0) / 100) * 100;
            return scorePercent >= min && scorePercent <= max;
        });
    }
    
    // Mettre à jour les évaluations affichées
    evaluations = filtered;
    filteredEvaluations = filtered;
    displayEvaluations();
    
    // Mettre à jour les compteurs dans les onglets
    updateTabCounts();
}

// Mettre à jour les compteurs dans les onglets
function updateTabCounts() {
    const pendingCount = allEvaluations.filter(e => e.status === 'submitted').length;
    const validatedCount = allEvaluations.filter(e => e.status === 'validated').length;
    
    document.getElementById('countPending').textContent = pendingCount;
    document.getElementById('countValidated').textContent = validatedCount;
}

// Actualiser les données
function refreshData() {
    const btn = event.target;
    btn.style.transform = 'rotate(360deg)';
    btn.style.transition = 'transform 0.5s';
    
    setTimeout(() => {
        btn.style.transform = 'rotate(0deg)';
    }, 500);
    
    if (currentTab === 'pending') {
        loadPendingEvaluations();
    } else {
        loadValidatedEvaluations();
    }
}

// Exporter vers Excel (format CSV)
function exportToExcel() {
    if (!evaluations || evaluations.length === 0) {
        showAlert('⚠️ Aucune évaluation à exporter', 'error');
        return;
    }
    
    // Déterminer quelles évaluations exporter
    const dataToExport = filteredEvaluations.length > 0 ? filteredEvaluations : evaluations;
    
    // Créer le contenu CSV
    let csv = '\uFEFF'; // BOM pour UTF-8
    csv += 'Matricule;Nom;Prénom;Direction;Poste;Score (%);Statut;Date Évaluation;Date Validation;Validateur N1;Validateur N2\n';
    
    dataToExport.forEach(eval => {
        const scorePercent = ((eval.score || 0) / 100) * 100;
        const status = eval.status === 'submitted' ? 'En attente' : 
                      eval.status === 'validated' ? 'Validée' : 
                      eval.status === 'draft' ? 'Brouillon' : eval.status;
        
        csv += `"${eval.matricule || ''}";`;
        csv += `"${eval.nom || ''}";`;
        csv += `"${eval.prenom || ''}";`;
        csv += `"${eval.direction || ''}";`;
        csv += `"${eval.poste || ''}";`;
        csv += `${scorePercent.toFixed(1)};`;
        csv += `"${status}";`;
        csv += `"${formatDate(eval.evaluation_date)}";`;
        csv += `"${eval.validated_at ? formatDate(eval.validated_at) : ''}";`;
        csv += `"${eval.validated_by_n1 || ''}";`;
        csv += `"${eval.validated_by_n2 || ''}"`;
        csv += '\n';
    });
    
    // Créer le fichier et déclencher le téléchargement
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `evaluations_${currentTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAlert(`✅ ${dataToExport.length} évaluation(s) exportée(s) vers ${fileName}`, 'success');
}

// Formater une date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

// ==================== NOUVELLES FONCTIONS: TRI, SÉLECTION, VUE RAPIDE ====================

// Tri des évaluations
function sortEvaluations() {
    const sortValue = document.getElementById('sortSelect').value;
    
    evaluations.sort((a, b) => {
        switch(sortValue) {
            case 'date-desc':
                return new Date(b.submitted_at || b.submittedAt) - new Date(a.submitted_at || a.submittedAt);
            case 'date-asc':
                return new Date(a.submitted_at || a.submittedAt) - new Date(b.submitted_at || b.submittedAt);
            case 'name-asc':
                const nameA = (a.evalue_nom || a.evalueNom || '').toLowerCase();
                const nameB = (b.evalue_nom || b.evalueNom || '').toLowerCase();
                return nameA.localeCompare(nameB);
            case 'name-desc':
                const nameA2 = (a.evalue_nom || a.evalueNom || '').toLowerCase();
                const nameB2 = (b.evalue_nom || b.evalueNom || '').toLowerCase();
                return nameB2.localeCompare(nameA2);
            case 'score-desc':
                return parseFloat(b.score_final || b.scoreFinal || 0) - parseFloat(a.score_final || a.scoreFinal || 0);
            case 'score-asc':
                return parseFloat(a.score_final || a.scoreFinal || 0) - parseFloat(b.score_final || b.scoreFinal || 0);
            default:
                return 0;
        }
    });
    
    displayEvaluations();
    showAlert(`✅ Évaluations triées`, 'success');
}

// Mettre à jour le compteur de sélection
function updateSelectionCount() {
    const checkboxes = document.querySelectorAll('.eval-checkbox:checked');
    const count = checkboxes.length;
    
    document.getElementById('selectionCount').textContent = `${count} sélectionné(s)`;
    document.getElementById('batchCount').textContent = count;
    
    const batchBtn = document.getElementById('batchValidateBtn');
    if (count > 0) {
        batchBtn.disabled = false;
        batchBtn.style.opacity = '1';
        batchBtn.style.cursor = 'pointer';
    } else {
        batchBtn.disabled = true;
        batchBtn.style.opacity = '0.5';
        batchBtn.style.cursor = 'not-allowed';
    }
    
    // Mettre en surbrillance les cartes sélectionnées
    document.querySelectorAll('.eval-checkbox').forEach(cb => {
        const card = cb.closest('.evaluation-card');
        if (cb.checked) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
    
    // Mettre à jour la checkbox "Tout sélectionner"
    const allCheckboxes = document.querySelectorAll('.eval-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox && allCheckboxes.length > 0) {
        selectAllCheckbox.checked = allCheckboxes.length === checkboxes.length;
    }
}

// Tout sélectionner / Tout désélectionner
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.eval-checkbox');
    
    checkboxes.forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
    
    updateSelectionCount();
}

// Annuler la sélection
function clearSelection() {
    document.querySelectorAll('.eval-checkbox').forEach(cb => {
        cb.checked = false;
    });
    document.getElementById('selectAllCheckbox').checked = false;
    updateSelectionCount();
    showAlert('✅ Sélection annulée', 'info');
}

// Validation par lot
async function batchValidate() {
    const checkboxes = document.querySelectorAll('.eval-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showAlert('⚠️ Veuillez sélectionner au moins une évaluation', 'error');
        return;
    }
    
    const count = checkboxes.length;
    const confirmMsg = `Voulez-vous vraiment valider ${count} évaluation(s) ?\n\nCette action nécessitera votre signature pour chaque évaluation.`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    // Ouvrir le modal de validation pour la première évaluation sélectionnée
    const firstEvalId = parseInt(checkboxes[0].dataset.evalId);
    
    // Stocker les IDs à valider dans une variable globale
    window.batchValidationIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.evalId));
    window.batchValidationIndex = 0;
    
    showAlert(`📝 Validation par lot: 1/${count} évaluations`, 'info');
    openValidationModal(firstEvalId);
}

// Vue rapide d'une évaluation (sans modal complet)
function quickViewEvaluation(evalId) {
    const evaluation = allEvaluations.find(e => e.id === evalId);
    if (!evaluation) {
        showAlert('❌ Évaluation introuvable', 'error');
        return;
    }
    
    const evalueNom = evaluation.evalue_nom || evaluation.evalueNom || 'N/A';
    const evaluateurNom = evaluation.evaluateur_nom || evaluation.evaluateurNom || 'N/A';
    const direction = evaluation.direction || 'N/A';
    const service = evaluation.service || 'N/A';
    const scoreFinal = evaluation.score_final || evaluation.scoreFinal || 0;
    const submittedAt = evaluation.submitted_at || evaluation.submittedAt;
    
    // Créer un modal simple
    const quickViewHTML = `
        <div class="modal show" id="quickViewModal" style="z-index: 3000;">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h2>👁️ Vue rapide - ${evalueNom}</h2>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <div style="color: #7f8c8d; font-size: 13px; margin-bottom: 5px;">👤 Évalué</div>
                            <div style="font-weight: 600; font-size: 16px;">${evalueNom}</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <div style="color: #7f8c8d; font-size: 13px; margin-bottom: 5px;">👨‍💼 Évaluateur (N+1)</div>
                            <div style="font-weight: 600; font-size: 16px;">${evaluateurNom}</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <div style="color: #7f8c8d; font-size: 13px; margin-bottom: 5px;">🏢 Direction</div>
                            <div style="font-weight: 600; font-size: 16px;">${direction}</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">
                            <div style="color: #7f8c8d; font-size: 13px; margin-bottom: 5px;">📅 Soumis le</div>
                            <div style="font-weight: 600; font-size: 16px;">${submittedAt ? new Date(submittedAt).toLocaleDateString('fr-FR') : 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 15px; text-align: center;">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Score Final</div>
                        <div style="font-size: 48px; font-weight: 700;">${parseFloat(scoreFinal).toFixed(1)}%</div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #f39c12; border-radius: 5px;">
                        <strong>💡 Info:</strong> Pour voir tous les détails, cliquez sur "Détail complet"
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="closeQuickView()" style="padding: 12px 25px; background: #e0e0e0; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Fermer
                    </button>
                    <button onclick="closeQuickView(); viewFullEvaluation(${evalId})" style="padding: 12px 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        📄 Détail complet
                    </button>
                    ${evaluation.status === 'submitted' ? `
                        <button onclick="closeQuickView(); openValidationModal(${evalId})" style="padding: 12px 25px; background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ✅ Valider
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', quickViewHTML);
}

// Fermer la vue rapide
function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        modal.remove();
    }
}

// Charger les évaluations en attente
async function loadPendingEvaluations() {
    const email = document.getElementById('emailN2Input').value.trim();
    const userEmail = localStorage.getItem('userEmail');
    
    if (!email) {
        showAlert('⚠️ Veuillez entrer votre adresse email', 'error');
        return;
    }
    
    // Avertissement si l'email saisi ne correspond pas au profil connecté
    if (userEmail && email.toLowerCase() !== userEmail.toLowerCase()) {
        const confirmLoad = confirm(
            `⚠️ ATTENTION\n\n` +
            `L'email saisi (${email}) ne correspond pas à votre profil connecté (${userEmail}).\n\n` +
            `Voulez-vous vraiment charger les évaluations pour cet email ?\n\n` +
            `Note : Vous ne pourrez valider que les évaluations assignées à votre email (${userEmail}).`
        );
        
        if (!confirmLoad) {
            document.getElementById('emailN2Input').value = userEmail;
            return;
        }
    }
    
    currentEmail = email;
    console.log('📧 Chargement des évaluations pour:', email);
    document.getElementById('loadingContainer').style.display = 'block';
    document.getElementById('evaluationsContainer').innerHTML = '';
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/evaluations/pending/${encodeURIComponent(email)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Stocker TOUTES les évaluations
            allEvaluations = result.evaluations;
            evaluations = result.evaluations.filter(e => e.status === 'submitted'); // Ne montrer que les "en attente" au départ
            currentTab = 'pending';
            
            displayEvaluations();
            updateStats();
            document.getElementById('statsContainer').style.display = 'grid';
            
            // Afficher la barre d'outils
            document.getElementById('toolbarContainer').style.display = 'block';
            
            // Remplir les options de direction (filtre)
            populateDirectionFilter();
            
            // Initialiser l'écouteur de recherche
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', applyFilters);
            }
            
            // Mettre à jour les compteurs des onglets
            updateTabCounts();
            
            if (allEvaluations.length === 0) {
                showAlert('ℹ️ Aucune évaluation trouvée pour cet email', 'info');
            } else {
                const pending = allEvaluations.filter(e => e.status === 'submitted').length;
                const validated = allEvaluations.filter(e => e.status === 'validated').length;
                showAlert(`✅ ${allEvaluations.length} évaluation(s) chargée(s) (${pending} en attente, ${validated} validée(s))`, 'success');
            }
        } else {
            const errorMsg = result.error || 'Erreur inconnue';
            showAlert('❌ Erreur lors du chargement: ' + errorMsg, 'error');
            console.error('Détails de l\'erreur:', result);
        }
    } catch (error) {
        showAlert('❌ Erreur de connexion au serveur. Vérifiez que le serveur Node.js est démarré (npm start).', 'error');
        console.error('Erreur complète:', error);
    } finally {
        document.getElementById('loadingContainer').style.display = 'none';
    }
}

// Remplir le filtre des directions avec les valeurs uniques
function populateDirectionFilter() {
    const directionFilter = document.getElementById('filterDirection');
    const directions = [...new Set(allEvaluations.map(e => e.direction).filter(d => d))];
    
    // Garder l'option "Toutes les directions"
    directionFilter.innerHTML = '<option value="">🏢 Toutes les directions</option>';
    
    // Ajouter chaque direction unique
    directions.sort().forEach(direction => {
        const option = document.createElement('option');
        option.value = direction;
        option.textContent = direction;
        directionFilter.appendChild(option);
    });
}

// Charger uniquement les évaluations validées (pour le bouton N+2)
async function loadValidatedEvaluations() {
    const email = document.getElementById('emailN2Input').value.trim();
    const userEmail = localStorage.getItem('userEmail');
    
    if (!email) {
        showAlert('⚠️ Veuillez entrer votre adresse email', 'error');
        return;
    }
    
    currentEmail = email;
    console.log('📧 Chargement des évaluations validées pour:', email);
    document.getElementById('loadingContainer').style.display = 'block';
    document.getElementById('evaluationsContainer').innerHTML = '';
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/evaluations/pending/${encodeURIComponent(email)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Stocker TOUTES les évaluations pour les stats
            allEvaluations = result.evaluations;
            // Filtrer pour ne garder que les évaluations validées à l'affichage
            evaluations = result.evaluations.filter(e => e.status === 'validated');
            currentTab = 'validated';
            
            displayEvaluations();
            updateStats();
            document.getElementById('statsContainer').style.display = 'grid';
            
            // Afficher la barre d'outils
            document.getElementById('toolbarContainer').style.display = 'block';
            
            // Remplir les options de direction (filtre)
            populateDirectionFilter();
            
            // Mettre à jour les onglets (activer l'onglet "Validées")
            switchTab('validated');
            updateTabCounts();
            
            if (evaluations.length === 0) {
                showAlert('ℹ️ Aucune évaluation validée trouvée', 'info');
            } else {
                const totalPending = allEvaluations.filter(e => e.status === 'submitted').length;
                const totalValidated = allEvaluations.filter(e => e.status === 'validated').length;
                showAlert(`✅ ${evaluations.length} évaluation(s) validée(s) affichée(s) (Total: ${totalPending} en attente, ${totalValidated} validées)`, 'success');
            }
        } else {
            const errorMsg = result.error || 'Erreur inconnue';
            showAlert('❌ Erreur lors du chargement: ' + errorMsg, 'error');
            console.error('Détails de l\'erreur:', result);
        }
    } catch (error) {
        showAlert('❌ Erreur de connexion au serveur. Vérifiez que le serveur Node.js est démarré (npm start).', 'error');
        console.error('Erreur complète:', error);
    } finally {
        document.getElementById('loadingContainer').style.display = 'none';
    }
}

// Afficher les évaluations
function displayEvaluations() {
    const container = document.getElementById('evaluationsContainer');
    
    // Afficher/masquer la barre de validation par lot
    const batchBar = document.getElementById('batchActionsBar');
    if (batchBar) {
        batchBar.style.display = currentTab === 'pending' && evaluations.length > 0 ? 'block' : 'none';
    }
    
    if (evaluations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h2>Aucune évaluation ${currentTab === 'pending' ? 'en attente' : 'validée'}</h2>
                <p>Vous n'avez pas d'évaluation ${currentTab === 'pending' ? 'à valider' : 'validée'} pour le moment.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = evaluations.map(evaluation => {
        const isValidated = evaluation.status === 'validated';
        const isPending = evaluation.status === 'submitted';
        
        // Gérer les deux formats (snake_case de l'API et camelCase)
        const evalueNom = evaluation.evalue_nom || evaluation.evalueNom || 'N/A';
        const evaluateurNom = evaluation.evaluateur_nom || evaluation.evaluateurNom || 'N/A';
        const evaluateurFonction = evaluation.evaluateur_fonction || evaluation.evaluateurFonction || 'N/A';
        const direction = evaluation.direction || 'N/A';
        const service = evaluation.service || 'N/A';
        const submittedAt = evaluation.submitted_at || evaluation.submittedAt;
        const scoreFinal = evaluation.score_final || evaluation.scoreFinal || 0;
        const scorePercent = parseFloat(scoreFinal);
        
        // Badge de score coloré
        let scoreBadgeClass = 'score-low';
        if (scorePercent >= 70) scoreBadgeClass = 'score-excellent';
        else if (scorePercent >= 50) scoreBadgeClass = 'score-good';
        
        return `
            <div class="evaluation-card ${isValidated ? 'validated' : ''}" id="eval-card-${evaluation.id}" style="cursor: pointer;">
                <div class="eval-header" style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                        ${isPending ? `
                            <input type="checkbox" class="eval-checkbox" data-eval-id="${evaluation.id}" onclick="event.stopPropagation(); updateSelectionCount()">
                        ` : ''}
                        <div class="eval-title">📋 ${evalueNom}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="score-badge ${scoreBadgeClass}">${scorePercent.toFixed(1)}%</span>
                        <div class="eval-status ${isValidated ? 'status-validated' : 'status-pending'}">
                            ${isValidated ? '✅ Validée' : '⏳ En attente'}
                        </div>
                    </div>
                </div>
                
                <div class="eval-details">
                    <div class="eval-detail">
                        <div class="eval-detail-label">Évaluateur (N+1)</div>
                        <div class="eval-detail-value">${evaluateurNom}</div>
                    </div>
                    <div class="eval-detail">
                        <div class="eval-detail-label">Fonction</div>
                        <div class="eval-detail-value">${evaluateurFonction}</div>
                    </div>
                    <div class="eval-detail">
                        <div class="eval-detail-label">Direction</div>
                        <div class="eval-detail-value">${direction}</div>
                    </div>
                    <div class="eval-detail">
                        <div class="eval-detail-label">Service</div>
                        <div class="eval-detail-value">${service}</div>
                    </div>
                    <div class="eval-detail">
                        <div class="eval-detail-label">Soumis le</div>
                        <div class="eval-detail-value">${submittedAt ? new Date(submittedAt).toLocaleDateString('fr-FR') : 'N/A'}</div>
                    </div>
                </div>
                
                <div class="eval-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="quick-view-btn" onclick="event.stopPropagation(); quickViewEvaluation(${evaluation.id})">
                        👁️ Vue rapide
                    </button>
                    <button class="btn btn-view" onclick="event.stopPropagation(); viewFullEvaluation(${evaluation.id})">
                        📄 Détail complet
                    </button>
                    ${!isValidated ? `
                        <button class="btn btn-validate" onclick="event.stopPropagation(); openValidationModal(${evaluation.id})">
                            ✅ Valider
                        </button>
                    ` : `
                        <button class="btn btn-download" onclick="event.stopPropagation(); downloadPDF(${evaluation.id})">
                            📥 PDF
                        </button>
                        <button class="btn" onclick="event.stopPropagation(); viewValidatedDetails(${evaluation.id})" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white;">
                            📋 Signatures
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Mettre à jour les statistiques
function updateStats() {
    // Utiliser TOUTES les évaluations pour les stats (pas seulement celles affichées)
    const statsSource = allEvaluations.length > 0 ? allEvaluations : evaluations;
    const pending = statsSource.filter(e => e.status === 'submitted').length;
    const validated = statsSource.filter(e => e.status === 'validated').length;
    const total = statsSource.length;
    
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statValidated').textContent = validated;
    document.getElementById('statTotal').textContent = total;
    
    // Afficher un message informatif seulement si on affiche toutes les évaluations
    if (pending === 0 && validated > 0 && evaluations.length === allEvaluations.length) {
        showAlert(`✅ Toutes vos évaluations sont validées ! Total: ${validated}`, 'success');
    }
}

// Voir l'évaluation complète
function viewFullEvaluation(id) {
    const evaluation = evaluations.find(e => e.id === id);
    if (!evaluation) return;
    
    // Ouvrir dans une nouvelle fenêtre/onglet avec le formulaire en mode lecture seule
    const url = `formulaire-online.html?id=${id}`;
    window.open(url, '_blank');
}

// Ouvrir le modal de validation
function openValidationModal(id) {
    const evaluation = evaluations.find(e => e.id === id);
    if (!evaluation || evaluation.status === 'validated') {
        if (evaluation && evaluation.status === 'validated') {
            showAlert('✅ Cette évaluation a déjà été validée.', 'info');
        }
        return;
    }
    
    // VÉRIFICATION DE SÉCURITÉ : Vérifier que l'email N+2 correspond au profil connecté
    const userEmail = localStorage.getItem('userEmail');
    const evalEmailN2 = evaluation.email_n2 || evaluation.emailN2 || '';
    
    console.log('🔒 Vérification de sécurité profil N+2:');
    console.log('   - Email connecté:', userEmail);
    console.log('   - Email N+2 assigné:', evalEmailN2);
    console.log('   - Évaluation ID:', id);
    
    if (!userEmail) {
        showAlert('❌ Erreur : Votre email n\'est pas défini dans la session. Veuillez vous reconnecter.', 'error');
        console.error('❌ Email utilisateur non trouvé dans localStorage');
        return;
    }
    
    if (evalEmailN2.toLowerCase() !== userEmail.toLowerCase()) {
        showAlert(
            `❌ ACCÈS REFUSÉ\n\n` +
            `Cette évaluation n'est pas assignée à votre profil.\n\n` +
            `• Votre email : ${userEmail}\n` +
            `• Email N+2 assigné : ${evalEmailN2}\n\n` +
            `Seul le N+2 assigné peut valider cette évaluation.`,
            'error'
        );
        console.error('❌ Tentative d\'accès non autorisée:', {
            userEmail,
            evalEmailN2,
            evaluationId: id
        });
        return;
    }
    
    console.log('✅ Vérification réussie - Accès autorisé pour validation');
    currentEvaluationForValidation = evaluation;
    
    // Gérer les deux formats (snake_case de l'API et camelCase)
    const evalueNom = evaluation.evalue_nom || evaluation.evalueNom || 'N/A';
    const evaluateurNom = evaluation.evaluateur_nom || evaluation.evaluateurNom || 'N/A';
    const evalueFonction = evaluation.evalue_fonction || evaluation.evalueFonction || 'N/A';
    const direction = evaluation.direction || 'N/A';
    const service = evaluation.service || 'N/A';
    const annee = evaluation.annee || 'N/A';
    const scoreFinal = evaluation.score_final || evaluation.scoreFinal || '0';
    
    // Charger les signatures existantes via l'API
    loadSignaturesForValidation(id, evalueNom, evaluateurNom, evalueFonction, direction, service, annee, scoreFinal);
}

// Charger les signatures depuis l'API
async function loadSignaturesForValidation(id, evalueNom, evaluateurNom, evalueFonction, direction, service, annee, scoreFinal) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/evaluations/${id}/full`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        
        let signaturesHTML = '';
        
        if (result.success && result.evaluation && result.evaluation.signatures) {
            const signatures = result.evaluation.signatures;
            
            // Afficher la signature N si elle existe
            if (signatures.N && signatures.N.image) {
                signaturesHTML += `
                    <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 2px solid #dee2e6;">
                        <h4 style="color: #2c3e50; margin-bottom: 10px;">✍️ Signature de l'Évalué (N)</h4>
                        <div style="text-align: center;">
                            <img src="${signatures.N.image}" style="max-width: 400px; height: auto; border: 1px solid #dee2e6; border-radius: 5px; opacity: 0.8;">
                        </div>
                        <p style="margin-top: 10px; color: #6c757d;"><strong>Nom:</strong> ${signatures.N.nom || 'N/A'} | <strong>Date:</strong> ${signatures.N.date || 'N/A'}</p>
                    </div>
                `;
            }
            
            // Afficher la signature N+1 si elle existe
            if (signatures.N1 && signatures.N1.image) {
                signaturesHTML += `
                    <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 2px solid #dee2e6;">
                        <h4 style="color: #2c3e50; margin-bottom: 10px;">✍️ Signature de l'Évaluateur (N+1)</h4>
                        <div style="text-align: center;">
                            <img src="${signatures.N1.image}" style="max-width: 400px; height: auto; border: 1px solid #dee2e6; border-radius: 5px; opacity: 0.8;">
                        </div>
                        <p style="margin-top: 10px; color: #6c757d;"><strong>Nom:</strong> ${signatures.N1.nom || 'N/A'} | <strong>Date:</strong> ${signatures.N1.date || 'N/A'}</p>
                    </div>
                `;
            }
        }
    
    // Remplir les détails dans le modal
    document.getElementById('modalEvaluationDetails').innerHTML = `
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">📄 Détails de l'évaluation</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div>
                    <strong>Évalué (N) :</strong> ${evalueNom}
                </div>
                <div>
                    <strong>Fonction :</strong> ${evalueFonction}
                </div>
                <div>
                    <strong>Évaluateur (N+1) :</strong> ${evaluateurNom}
                </div>
                <div>
                    <strong>Direction :</strong> ${direction}
                </div>
                <div>
                    <strong>Service :</strong> ${service}
                </div>
                <div>
                    <strong>Année :</strong> ${annee}
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #4A9D5F 0%, #6BC17D 100%); color: white; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold;">
                    SCORE FINAL: ${scoreFinal}%
                </div>
            </div>
        </div>
        
        ${signaturesHTML ? `
            <div style="background-color: #e7f3ff; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 2px solid #0066cc;">
                <h3 style="color: #0066cc; margin-bottom: 15px;">📝 Signatures existantes (lecture seule)</h3>
                ${signaturesHTML}
            </div>
        ` : ''}
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border: 2px solid #ffc107; margin-bottom: 20px;">
            <strong>⚠️ Important :</strong> En validant cette évaluation, vous confirmez avoir examiné tous les détails et acceptez les résultats présentés.
        </div>
    `;
    
    // Réinitialiser la signature N+2
    clearModalSignature();
    document.getElementById('modalSignatureNom').value = '';
    
    // Afficher le modal
    document.getElementById('validationModal').classList.add('show');
        
    } catch (error) {
        console.error('Erreur lors du chargement des signatures:', error);
        // Continuer même en cas d'erreur
        document.getElementById('modalEvaluationDetails').innerHTML = `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">📄 Détails de l'évaluation</h3>
                <p>Score Final: ${scoreFinal}%</p>
            </div>
        `;
        document.getElementById('validationModal').classList.add('show');
    }
}

// Fermer le modal
function closeModal() {
    document.getElementById('validationModal').classList.remove('show');
    currentEvaluationForValidation = null;
}

// Vérifier si le canvas est vide
function isCanvasBlank(canvas) {
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL();
}

// Confirmer la validation
async function confirmValidation() {
    if (!currentEvaluationForValidation) return;
    
    const nom = document.getElementById('modalSignatureNom').value.trim();
    const date = document.getElementById('modalSignatureDate').value;
    
    if (!nom) {
        showAlert('⚠️ Veuillez entrer votre prénom et nom', 'error');
        return;
    }
    
    if (!date) {
        showAlert('⚠️ Veuillez sélectionner la date de validation', 'error');
        return;
    }
    
    if (isCanvasBlank(signatureCanvas)) {
        showAlert('⚠️ Veuillez apposer votre signature électronique', 'error');
        return;
    }
    
    if (!confirm('Confirmez-vous la validation de cette évaluation ?\n\nCette action est définitive.')) {
        return;
    }
    
    const signature = {
        nom: nom,
        date: date,
        image: signatureCanvas.toDataURL()
    };
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/evaluations/${currentEvaluationForValidation.id}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ signature })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('✅ Évaluation validée avec succès !', 'success');
            closeModal();
            
            // Vérifier si on est en mode validation par lot
            if (window.batchValidationIds && window.batchValidationIndex !== undefined) {
                window.batchValidationIndex++;
                
                if (window.batchValidationIndex < window.batchValidationIds.length) {
                    // Passer à l'évaluation suivante
                    const nextEvalId = window.batchValidationIds[window.batchValidationIndex];
                    const totalCount = window.batchValidationIds.length;
                    const currentCount = window.batchValidationIndex + 1;
                    
                    showAlert(`📝 Validation par lot: ${currentCount}/${totalCount} évaluations`, 'info');
                    
                    // Réinitialiser le canvas pour la prochaine signature
                    clearModalSignature();
                    
                    // Ouvrir le modal pour l'évaluation suivante
                    setTimeout(() => {
                        openValidationModal(nextEvalId);
                    }, 500);
                } else {
                    // Toutes les évaluations ont été validées
                    showAlert(`✅ Validation par lot terminée ! ${totalCount} évaluation(s) validée(s)`, 'success');
                    
                    // Nettoyer les variables de batch
                    delete window.batchValidationIds;
                    delete window.batchValidationIndex;
                    
                    // Décocher toutes les cases
                    clearSelection();
                    
                    // Recharger les évaluations
                    await loadPendingEvaluations();
                }
            } else {
                // Validation simple (pas de batch)
                await loadPendingEvaluations();
            }
        } else {
            showAlert('❌ Erreur lors de la validation: ' + result.error, 'error');
        }
    } catch (error) {
        showAlert('❌ Erreur de connexion au serveur', 'error');
        console.error(error);
    }
}

// Fermer le modal en cliquant en dehors
window.onclick = function(event) {
    const modal = document.getElementById('validationModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Télécharger le PDF d'une évaluation validée
async function downloadPDF(evaluationId) {
    try {
        showAlert('📄 Génération du PDF en cours...', 'info');
        
        // Utiliser la fonction du fichier pdf-generator.js
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

// Voir les détails d'une évaluation validée avec signatures
async function viewValidatedDetails(evaluationId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/evaluations/${evaluationId}/full`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header" style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%);">
                    <h2>📋 Évaluation Validée - Toutes les Signatures</h2>
                </div>
                <div class="modal-body">
                    <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #28a745;">
                        <strong>✅ Évaluation validée</strong><br>
                        <strong>Évalué:</strong> ${evaluation.evalueNom || 'N/A'}<br>
                        <strong>Score final:</strong> ${evaluation.scores?.scoreFinal || 0}%<br>
                        <strong>Date de validation:</strong> ${evaluation.validatedAt ? new Date(evaluation.validatedAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </div>
                    ${signaturesHTML}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-download" onclick="downloadPDF(${evaluationId})">
                        📥 Télécharger le PDF
                    </button>
                    <button class="btn" onclick="this.closest('.modal').remove()" style="background-color: #95a5a6; color: white;">
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
window.viewValidatedDetails = viewValidatedDetails;
window.downloadPDF = downloadPDF;
window.viewFullEvaluation = viewFullEvaluation;
window.validateEvaluation = validateEvaluation;
window.logout = logout;
window.loadPendingEvaluations = loadPendingEvaluations;
window.loadValidatedEvaluations = loadValidatedEvaluations;
window.submitEmailModal = submitEmailModal;
window.switchTab = switchTab;
window.applyFilters = applyFilters;
window.sortEvaluations = sortEvaluations;
window.exportToExcel = exportToExcel;
window.refreshData = refreshData;
window.toggleSelectAll = toggleSelectAll;
window.updateSelectionCount = updateSelectionCount;
window.clearSelection = clearSelection;
window.batchValidate = batchValidate;
window.quickViewEvaluation = quickViewEvaluation;
window.closeQuickView = closeQuickView;
window.openValidationModal = openValidationModal;
window.closeModal = closeModal;
window.confirmValidation = confirmValidation;
window.clearModalSignature = clearModalSignature;
