// Configuration
// Utiliser l'URL de l'API depuis la configuration globale
const API_URL = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost:3001/api';
let userRole = '';
let userEmail = '';
let userName = '';

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard loading...'); // Debug
    if (checkAuthentication()) {
        await loadDashboardData();
    }
});

// Vérifier l'authentification
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    
    console.log('Checking auth:', { token: !!token, role, email, name }); // Debug
    
    // Vérification stricte : tous les éléments doivent être présents
    if (!token || !role || !email) {
        console.log('Authentication failed, redirecting to login');
        // Nettoyer le localStorage pour éviter des données corrompues
        localStorage.clear();
        sessionStorage.clear();
        // Redirection immédiate vers login
        window.location.replace('src/pages/login.html');
        return false;
    }
    
    userRole = role;
    userEmail = email;
    userName = name || 'Utilisateur';
    
    // Afficher les informations utilisateur
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    if (userRoleElement) {
        userRoleElement.textContent = role === 'N1' ? 'Évaluateur (N+1)' : 'Validateur (N+2)';
    }
    
    // Avatar initiales
    const avatar = document.getElementById('userAvatar');
    if (avatar && userName) {
        const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        avatar.textContent = initials;
    }
    
    return true;
}

// Charger les données du dashboard
async function loadDashboardData() {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('dashboardContent').style.display = 'none';
        
        // Charger les évaluations selon le rôle
        let response;
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        
        if (userRole === 'N1') {
            // Pour N+1, utiliser la route evaluator qui filtre par email et nom d'évaluateur
            response = await fetch(`${API_URL}/evaluations/evaluator/${encodeURIComponent(userEmail)}`, {
                headers: headers
            });
        } else {
            // Pour N+2, utiliser la route pending qui filtre par email_n2
            response = await fetch(`${API_URL}/evaluations/pending/${encodeURIComponent(userEmail)}`, {
                headers: headers
            });
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log('API Response:', result); // Debug log
        
        // Afficher le dashboard même sans données
        const evaluations = (result.success && result.evaluations) ? result.evaluations : [];
        console.log('Evaluations loaded:', evaluations.length); // Debug log
        
        displayStats(evaluations);
        displayQuickActions();
        displayRecentActivity(evaluations);
        displayTodoList(evaluations);
        
        document.getElementById('dashboardContent').style.display = 'block';
        
    } catch (error) {
        console.error('Erreur:', error);
        showAlert('Erreur de connexion au serveur: ' + error.message, 'error');
        
        // Afficher le dashboard avec des données vides
        displayStats([]);
        displayQuickActions();
        displayRecentActivity([]);
        displayTodoList([]);
        document.getElementById('dashboardContent').style.display = 'block';
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Afficher les statistiques
function displayStats(evaluations) {
    const statsGrid = document.getElementById('statsGrid');
    
    if (userRole === 'N1') {
        // Stats pour N+1
        const drafts = evaluations.filter(e => e.status === 'draft').length;
        const submitted = evaluations.filter(e => e.status === 'submitted').length;
        const validated = evaluations.filter(e => e.status === 'validated').length;
        const total = evaluations.length;
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-value">${drafts}</div>
                        <div class="stat-label">Brouillons</div>
                    </div>
                    <div class="stat-icon warning">
                        <i class="fas fa-file-alt"></i>
                    </div>
                </div>
                <div class="stat-trend">
                    <i class="fas fa-info-circle"></i>
                    <span>Non soumis à N+2</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-value">${submitted}</div>
                        <div class="stat-label">En Attente</div>
                    </div>
                    <div class="stat-icon info">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
                <div class="stat-trend">
                    <i class="fas fa-hourglass-half"></i>
                    <span>En cours de validation</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-value">${validated}</div>
                        <div class="stat-label">Validées</div>
                    </div>
                    <div class="stat-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="stat-trend trend-up">
                    <i class="fas fa-arrow-up"></i>
                    <span>Processus terminé</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-value">${total}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat-icon primary">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                </div>
                <div class="stat-trend">
                    <i class="fas fa-chart-line"></i>
                    <span>Toutes évaluations</span>
                </div>
            </div>
        `;
    } else if (userRole === 'N2') {
        // Stats pour N+2
        const pending = evaluations.filter(e => e.status === 'submitted').length;
        const validated = evaluations.filter(e => e.status === 'validated').length;
        const total = evaluations.length;
        const completionRate = total > 0 ? Math.round((validated / total) * 100) : 0;
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-value">${pending}</div>
                        <div class="stat-label">À Valider</div>
                    </div>
                    <div class="stat-icon warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
                <div class="stat-trend">
                    <i class="fas fa-tasks"></i>
                    <span>Nécessite votre validation</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-value">${validated}</div>
                        <div class="stat-label">Validées</div>
                    </div>
                    <div class="stat-icon success">
                        <i class="fas fa-check-double"></i>
                    </div>
                </div>
                <div class="stat-trend trend-up">
                    <i class="fas fa-check"></i>
                    <span>Validation complète</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-value">${completionRate}%</div>
                        <div class="stat-label">Taux de Validation</div>
                    </div>
                    <div class="stat-icon info">
                        <i class="fas fa-percentage"></i>
                    </div>
                </div>
                <div class="stat-trend ${completionRate >= 50 ? 'trend-up' : ''}">
                    <i class="fas fa-chart-pie"></i>
                    <span>${validated} sur ${total}</span>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-value">${total}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat-icon primary">
                        <i class="fas fa-list"></i>
                    </div>
                </div>
                <div class="stat-trend">
                    <i class="fas fa-database"></i>
                    <span>Toutes évaluations</span>
                </div>
            </div>
        `;
    }
}

// Afficher les actions rapides
function displayQuickActions() {
    const actionsGrid = document.getElementById('actionsGrid');
    
    if (userRole === 'N1') {
        actionsGrid.innerHTML = `
            <a href="formulaire-online.html" class="action-btn">
                <i class="fas fa-plus-circle"></i>
                <div class="action-content">
                    <h4>Nouvelle Évaluation</h4>
                    <p>Créer une nouvelle évaluation</p>
                </div>
            </a>
            
            <a href="drafts-manager.html" class="action-btn">
                <i class="fas fa-folder-open"></i>
                <div class="action-content">
                    <h4>Mes Brouillons</h4>
                    <p>Gérer mes brouillons</p>
                </div>
            </a>
            
            <a href="formulaire-online.html" class="action-btn" onclick="event.preventDefault(); switchToValidatedTab()">
                <i class="fas fa-check-circle"></i>
                <div class="action-content">
                    <h4>Évaluations Validées</h4>
                    <p>Consulter les validations</p>
                </div>
            </a>
            
            <button class="action-btn" onclick="exportAllToExcel()">
                <i class="fas fa-file-excel"></i>
                <div class="action-content">
                    <h4>Export Excel</h4>
                    <p>Télécharger toutes mes évaluations</p>
                </div>
            </button>
        `;
    } else {
        actionsGrid.innerHTML = `
            <a href="validation.html" class="action-btn">
                <i class="fas fa-clipboard-check"></i>
                <div class="action-content">
                    <h4>Valider Évaluations</h4>
                    <p>Évaluations en attente</p>
                </div>
            </a>
            
            <a href="validation.html" class="action-btn" onclick="event.preventDefault(); showValidatedInValidation()">
                <i class="fas fa-check-double"></i>
                <div class="action-content">
                    <h4>Évaluations Validées</h4>
                    <p>Consulter les validées</p>
                </div>
            </a>
            
            <button class="action-btn" onclick="exportAllToExcel()">
                <i class="fas fa-file-excel"></i>
                <div class="action-content">
                    <h4>Export Excel</h4>
                    <p>Télécharger toutes les évaluations</p>
                </div>
            </button>
        `;
    }
}

// Afficher l'activité récente
function displayRecentActivity(evaluations) {
    const container = document.getElementById('recentActivity');
    
    // Trier par date
    const recent = evaluations
        .sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at);
            const dateB = new Date(b.updated_at || b.created_at);
            return dateB - dateA;
        })
        .slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d; text-align: center; padding: 20px;">Aucune activité récente</p>';
        return;
    }
    
    container.innerHTML = recent.map(eval => {
        const name = eval.evalue_nom || eval.evalueNom || 'N/A';
        const date = new Date(eval.updated_at || eval.created_at);
        const timeAgo = getTimeAgo(date);
        const statusClass = eval.status === 'validated' ? 'validated' : eval.status === 'submitted' ? 'pending' : 'draft';
        const statusText = eval.status === 'validated' ? 'Validée' : eval.status === 'submitted' ? 'En attente' : 'Brouillon';
        
        return `
            <div class="activity-item">
                <div class="activity-header">
                    <div class="activity-title">Évaluation de ${name}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
                <div class="activity-desc">
                    ${eval.direction || 'N/A'} - ${eval.service || 'N/A'}
                    <span class="status-badge status-${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Afficher la liste des tâches
function displayTodoList(evaluations) {
    const container = document.getElementById('todoList');
    
    let todos = [];
    
    if (userRole === 'N1') {
        const drafts = evaluations.filter(e => e.status === 'draft');
        const pending = evaluations.filter(e => e.status === 'submitted');
        
        if (drafts.length > 0) {
            todos.push({
                icon: 'fa-file-alt',
                color: 'warning',
                text: `Terminer ${drafts.length} brouillon(s)`,
                action: 'formulaire-online.html'
            });
        }
        
        if (pending.length > 0) {
            todos.push({
                icon: 'fa-clock',
                color: 'info',
                text: `${pending.length} évaluation(s) en attente de validation`,
                action: '#'
            });
        }
    } else if (userRole === 'N2') {
        const pending = evaluations.filter(e => e.status === 'submitted');
        
        if (pending.length > 0) {
            todos.push({
                icon: 'fa-exclamation-circle',
                color: 'warning',
                text: `Valider ${pending.length} évaluation(s)`,
                action: 'validation.html'
            });
        }
    }
    
    if (todos.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <i class="fas fa-check-circle" style="font-size: 48px; color: var(--success); margin-bottom: 15px;"></i>
                <p style="color: #7f8c8d; font-weight: 600;">Tout est à jour !</p>
                <p style="color: #7f8c8d; font-size: 13px;">Aucune tâche en attente</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = todos.map(todo => `
        <a href="${todo.action}" style="text-decoration: none; color: inherit; display: block; margin-bottom: 12px;">
            <div class="activity-item" style="border-left-color: var(--${todo.color});">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fas ${todo.icon}" style="color: var(--${todo.color}); font-size: 20px;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--dark);">${todo.text}</div>
                    </div>
                    <i class="fas fa-chevron-right" style="color: #7f8c8d;"></i>
                </div>
            </div>
        </a>
    `).join('');
}

// Export all evaluations to Excel
async function exportAllToExcel() {
    try {
        // Vérifier que SheetJS est chargé
        if (typeof XLSX === 'undefined') {
            showAlert('Bibliothèque Excel non chargée. Veuillez recharger la page.', 'error');
            return;
        }
        
        showAlert('Export en cours...', 'info');
        
        const token = localStorage.getItem('authToken');
        const endpoint = userRole === 'N1' 
            ? `${API_URL}/evaluations/evaluator/${encodeURIComponent(userEmail)}`
            : `${API_URL}/evaluations/pending/${encodeURIComponent(userEmail)}`;
        
        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            const evaluations = result.evaluations || [];
            
            if (evaluations.length === 0) {
                showAlert('Aucune évaluation à exporter', 'info');
                return;
            }
            
            const fileName = `evaluations_${userRole}_${new Date().toISOString().split('T')[0]}.xlsx`;
            await exportToExcel(evaluations, fileName);
        } else {
            showAlert('Erreur lors de la récupération des données', 'error');
        }
    } catch (error) {
        console.error('Export error:', error);
        showAlert('Erreur lors de l\'export: ' + error.message, 'error');
    }
}

// Calculer le temps écoulé
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} j`;
    
    return date.toLocaleDateString('fr-FR');
}

// Afficher une alerte
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    alertContainer.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

// Déconnexion
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        // Nettoyer complètement la session
        localStorage.clear();
        sessionStorage.clear();
        // Redirection vers login (replace pour empêcher retour)
        window.location.replace('src/pages/login.html');
    }
}

// Actions
function switchToValidatedTab() {
    window.location.href = 'formulaire-online.html#validated';
}

function showStatistics() {
    showAlert('Fonctionnalité en cours de développement', 'info');
}

function showExportOptions() {
    if (confirm('Voulez-vous exporter vos évaluations au format Excel ?')) {
        showAlert('Export Excel en cours de développement', 'info');
    }
}
