// Configuration de l'API
// Utiliser l'URL de l'API depuis la configuration globale
const API_URL = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost:3001/api';
let currentEmail = '';
let evaluations = [];
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
        
        // Afficher le modal de demande d'email au lieu de charger automatiquement
        const userEmail = localStorage.getItem('userEmail');
        console.log('📧 Email utilisateur:', userEmail);
        
        if (userEmail) {
            // Pré-remplir l'email mais toujours afficher le modal
            const emailInput = document.getElementById('emailModalInput');
            if (emailInput) {
                emailInput.value = userEmail;
                console.log('✅ Email pré-rempli:', userEmail);
            } else {
                console.error('❌ Element emailModalInput non trouvé');
            }
        }
        
        // Afficher le modal de demande d'email
        console.log('📋 Affichage du modal d\'email...');
        showEmailModal();
        
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
        window.location.replace('src/pages/login.html');
        return;
    }
    
    // Vérifier que l'email est défini
    if (!userEmail) {
        console.error('⚠️ Email utilisateur non défini dans localStorage');
        showAlert('⚠️ Erreur de session : email non défini. Veuillez vous reconnecter.', 'error');
        setTimeout(() => {
            localStorage.clear();
            window.location.href = 'src/pages/login.html';
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
    // Nettoyer complètement la session
    localStorage.clear();
    sessionStorage.clear();
    // Redirection vers login (replace pour empêcher retour)
    window.location.replace('src/pages/login.html');
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
            evaluations = result.evaluations;
            displayEvaluations();
            updateStats();
            document.getElementById('statsContainer').style.display = 'grid';
            
            if (evaluations.length === 0) {
                showAlert('ℹ️ Aucune évaluation trouvée pour cet email', 'info');
            } else {
                const pending = evaluations.filter(e => e.status === 'submitted').length;
                const validated = evaluations.filter(e => e.status === 'validated').length;
                showAlert(`✅ ${evaluations.length} évaluation(s) chargée(s) (${pending} en attente, ${validated} validée(s))`, 'success');
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
    
    if (evaluations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h2>Aucune évaluation en attente</h2>
                <p>Vous n'avez pas d'évaluation à valider pour le moment.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = evaluations.map(evaluation => {
        const isValidated = evaluation.status === 'validated';
        
        // Gérer les deux formats (snake_case de l'API et camelCase)
        const evalueNom = evaluation.evalue_nom || evaluation.evalueNom || 'N/A';
        const evaluateurNom = evaluation.evaluateur_nom || evaluation.evaluateurNom || 'N/A';
        const evaluateurMatricule = evaluation.evaluateurMatricule || '';
        const evalueFonction = evaluation.evalue_fonction || evaluation.evalueFonction || 'N/A';
        const direction = evaluation.direction || 'N/A';
        const service = evaluation.service || 'N/A';
        const submittedAt = evaluation.submitted_at || evaluation.submittedAt;
        const scoreFinal = evaluation.score_final || evaluation.scoreFinal || '0';
        
        return `
            <div class="evaluation-card ${isValidated ? 'validated' : ''}" style="cursor: pointer;">
                <div class="eval-header">
                    <div class="eval-title">📋 Évaluation de ${evalueNom}</div>
                    <div class="eval-status ${isValidated ? 'status-validated' : 'status-pending'}">
                        ${isValidated ? '✅ Validée' : '⏳ En attente'}
                    </div>
                </div>
                
                <div class="eval-details">
                    <div class="eval-detail">
                        <div class="eval-detail-label">Évaluateur (N+1)</div>
                        <div class="eval-detail-value">${evaluateurNom}</div>
                        <div class="eval-detail-label">Matricule N+1</div>
                        <div class="eval-detail-value">${evaluateurMatricule}</div>
                    </div>
                    <div class="eval-detail">
                        <div class="eval-detail-label">Fonction</div>
                        <div class="eval-detail-value">${evalueFonction}</div>
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
                
                <div class="eval-scores">
                    <div class="score-box score-final">
                        <div class="score-box-label">Score Final</div>
                        <div class="score-box-value">${scoreFinal}%</div>
                    </div>
                </div>
                
                <div class="eval-actions">
                    <button class="btn btn-view" onclick="event.stopPropagation(); viewFullEvaluation(${evaluation.id})">
                        👁️ Voir le détail complet
                    </button>
                    ${!isValidated ? `
                        <button class="btn btn-validate" onclick="event.stopPropagation(); openValidationModal(${evaluation.id})">
                            ✅ Valider cette évaluation
                        </button>
                    ` : `
                        <button class="btn btn-download" onclick="event.stopPropagation(); downloadPDF(${evaluation.id})">
                            📥 Télécharger le PDF
                        </button>
                        <button class="btn" onclick="event.stopPropagation(); viewValidatedDetails(${evaluation.id})" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white;">
                            📋 Voir les signatures
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Mettre à jour les statistiques
function updateStats() {
    const pending = evaluations.filter(e => e.status === 'submitted').length;
    const validated = evaluations.filter(e => e.status === 'validated').length;
    const total = evaluations.length;
    
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statValidated').textContent = validated;
    document.getElementById('statTotal').textContent = total;
    
    // Afficher un message informatif
    if (pending === 0 && validated > 0) {
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
                    <strong>Évaluateur (N+1) :</strong> ${evaluateurNom} <span style="margin-left:18px;"><strong>Matricule :</strong> ${evaluateurMatricule}</span>
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
            
            // Recharger les évaluations
            await loadPendingEvaluations();
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
                    <button class="btn btn-download" onclick="this.closest('.modal').remove(); downloadPDF(${evaluationId})">
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
