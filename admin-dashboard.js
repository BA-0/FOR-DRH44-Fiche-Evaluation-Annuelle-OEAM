// admin-dashboard.js - Script pour le tableau de bord administrateur
// ============================================================================

// Configuration API
const API_BASE_URL = 'http://localhost:3001/api';

// État global
let allUsers = [];
let allEvaluations = [];
let allLogs = [];
let filteredUsers = [];
let filteredEvaluations = [];
let filteredLogs = [];

// ============================================================================
// INITIALISATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification admin
    checkAdminAuth();
    
    // Initialiser les onglets
    initTabs();
    
    // Charger toutes les données
    loadAllData();
    
    // Actualisation automatique toutes les 5 minutes
    setInterval(loadAllData, 300000);
    
    // Bouton actualiser manuel
    const refreshBtn = document.querySelector('[onclick="loadAllData()"]');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            this.style.animation = 'spin 1s linear';
            await loadAllData();
            setTimeout(() => this.style.animation = '', 1000);
            showNotification('Données actualisées', 'success');
        });
    }
});

// Vérifier si l'utilisateur est admin
function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    if (!token || userRole !== 'admin') {
        showNotification('Accès refusé. Vous devez être administrateur.', 'error');
        setTimeout(() => {
            window.location.href = 'src/pages/login.html';
        }, 2000);
        return false;
    }
    
    // Afficher le nom de l'utilisateur
    if (userName) {
        document.querySelector('.admin-header h1').innerHTML = `
            🛡️ Tableau de Bord Administrateur
            <span class="admin-badge">ADMIN</span>
            <small style="font-size: 14px; font-weight: 400; margin-left: 15px;">
                Bienvenue, ${userName}
            </small>
        `;
    }
    
    return true;
}

// ============================================================================
// GESTION DES ONGLETS
// ============================================================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons et contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');
            
            // Afficher le contenu correspondant
            const tabId = button.getAttribute('data-tab');
            document.getElementById('tab-' + tabId).classList.add('active');
            
            // Charger les données spécifiques si nécessaire
            if (tabId === 'stats') {
                loadStatistics();
            } else if (tabId === 'logs') {
                loadAuditLogs();
            }
        });
    });
}

// ============================================================================
// CHARGEMENT DES DONNÉES
// ============================================================================

async function loadAllData() {
    try {
        // Charger les données d'abord
        await Promise.all([
            loadUsers(),
            loadEvaluations()
        ]);
        
        // Puis mettre à jour les statistiques avec les données chargées
        await updateStatistics();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showNotification('Erreur lors du chargement des données', 'error');
    }
}

// Charger les utilisateurs
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Erreur de chargement');
        
        allUsers = await response.json();
        filteredUsers = [...allUsers];
        renderUsersTable();
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('usersTableBody').innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-state">
                        <h3>❌ Erreur de chargement</h3>
                        <p>${error.message}</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Charger les évaluations
async function loadEvaluations() {
    try {
        const response = await fetch(`${API_BASE_URL}/evaluations/all`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Erreur de chargement');
        
        allEvaluations = await response.json();
        filteredEvaluations = [...allEvaluations];
        renderEvaluationsTable();
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('evaluationsTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-state">
                        <h3>❌ Erreur de chargement</h3>
                        <p>${error.message}</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Charger les logs d'audit
async function loadAuditLogs() {
    try {
        const response = await fetch(`${API_BASE_URL}/audit-logs`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Erreur de chargement');
        
        allLogs = await response.json();
        filteredLogs = [...allLogs];
        renderLogsTable();
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('logsTableBody').innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-state">
                        <h3>❌ Erreur de chargement</h3>
                        <p>${error.message}</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// ============================================================================
// AFFICHAGE DES TABLEAUX
// ============================================================================

// Afficher le tableau des utilisateurs
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <h3>Aucun utilisateur trouvé</h3>
                        <p>Essayez de modifier vos filtres de recherche</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td><strong>${user.username}</strong></td>
            <td>${user.name || '-'}</td>
            <td>${user.email || '-'}</td>
            <td>
                <span class="status-badge status-${user.role === 'admin' ? 'validated' : 'active'}">
                    ${getRoleLabel(user.role)}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.is_active ? 'status-active' : 'status-inactive'}">
                    ${user.is_active ? 'Actif' : 'Inactif'}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.first_login ? 'status-pending' : 'status-validated'}" title="${user.first_login ? 'Changement de mot de passe requis' : 'Mot de passe changé'}">
                    ${user.first_login ? '🔐 Oui' : '✅ Non'}
                </span>
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="editUser(${user.id})" title="Modifier">
                        ✏️
                    </button>
                    <button class="btn-action" style="background: linear-gradient(135deg, #f39c12, #e67e22);" onclick="resetUserPassword(${user.id}, '${user.username}')" title="Réinitialiser le mot de passe">
                        🔑
                    </button>
                    <button class="btn-action btn-disable" onclick="toggleUserStatus(${user.id}, ${user.is_active})" title="${user.is_active ? 'Désactiver' : 'Activer'}">
                        ${user.is_active ? '🔒' : '🔓'}
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="btn-action btn-delete" onclick="deleteUser(${user.id})" title="Supprimer">
                            🗑️
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Afficher le tableau des évaluations
function renderEvaluationsTable() {
    const tbody = document.getElementById('evaluationsTableBody');
    
    if (filteredEvaluations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <h3>Aucune évaluation trouvée</h3>
                        <p>Essayez de modifier vos filtres de recherche</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredEvaluations.map(eval => `
        <tr>
            <td>${eval.id}</td>
            <td><strong>${eval.evalue_nom || '-'}</strong></td>
            <td>${eval.evaluateur_nom || '-'}</td>
            <td>${eval.direction || '-'}</td>
            <td>${eval.service || '-'}</td>
            <td>${eval.annee || '-'}</td>
            <td>
                <span class="status-badge status-${eval.status}">
                    ${getStatusLabel(eval.status)}
                </span>
            </td>
            <td>${eval.submitted_at ? formatDate(eval.submitted_at) : '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewEvaluation(${eval.id})" title="Voir">
                        👁️
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteEvaluation(${eval.id})" title="Supprimer">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Afficher le tableau des logs
function renderLogsTable() {
    const tbody = document.getElementById('logsTableBody');
    
    if (filteredLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-state">
                        <h3>Aucun log trouvé</h3>
                        <p>Essayez de modifier vos filtres de recherche</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredLogs.map(log => `
        <tr>
            <td>${log.id}</td>
            <td>${formatDateTime(log.created_at)}</td>
            <td>${log.user_name || `User #${log.user_id}`}</td>
            <td><strong>${log.action}</strong></td>
            <td>${log.evaluation_id || '-'}</td>
            <td>${log.old_status || '-'}</td>
            <td>${log.new_status || '-'}</td>
            <td>${log.ip_address || '-'}</td>
            <td>${log.details || '-'}</td>
        </tr>
    `).join('');
}

// ============================================================================
// FILTRES ET RECHERCHE
// ============================================================================

// Filtrer les utilisateurs
function filterUsers() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    filteredUsers = allUsers.filter(user => {
        const matchesSearch = 
            user.username.toLowerCase().includes(searchTerm) ||
            (user.name && user.name.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm));
        
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.is_active.toString() === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    renderUsersTable();
}

// Filtrer les évaluations
function filterEvaluations() {
    const searchTerm = document.getElementById('searchEvaluations').value.toLowerCase();
    const statusFilter = document.getElementById('filterEvalStatus').value;
    const yearFilter = document.getElementById('filterYear').value;
    
    filteredEvaluations = allEvaluations.filter(eval => {
        const matchesSearch = 
            (eval.evalue_nom && eval.evalue_nom.toLowerCase().includes(searchTerm)) ||
            (eval.evaluateur_nom && eval.evaluateur_nom.toLowerCase().includes(searchTerm)) ||
            (eval.direction && eval.direction.toLowerCase().includes(searchTerm)) ||
            (eval.service && eval.service.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilter || eval.status === statusFilter;
        const matchesYear = !yearFilter || eval.annee.toString() === yearFilter;
        
        return matchesSearch && matchesStatus && matchesYear;
    });
    
    renderEvaluationsTable();
}

// Filtrer les logs
function filterLogs() {
    const searchTerm = document.getElementById('searchLogs').value.toLowerCase();
    const actionFilter = document.getElementById('filterAction').value;
    
    filteredLogs = allLogs.filter(log => {
        const matchesSearch = 
            (log.user_name && log.user_name.toLowerCase().includes(searchTerm)) ||
            (log.action && log.action.toLowerCase().includes(searchTerm)) ||
            (log.details && log.details.toLowerCase().includes(searchTerm));
        
        const matchesAction = !actionFilter || log.action === actionFilter;
        
        return matchesSearch && matchesAction;
    });
    
    renderLogsTable();
}

// ============================================================================
// GESTION DES UTILISATEURS
// ============================================================================

// Ouvrir le modal d'ajout d'utilisateur
function openAddUserModal() {
    document.getElementById('userModalTitle').textContent = '➕ Nouvel Utilisateur';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('passwordGroup').querySelector('label').textContent = 'Mot de passe *';
    document.getElementById('password').required = true;
    document.getElementById('userModal').classList.add('active');
}

// Éditer un utilisateur
async function editUser(userId) {
    try {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;
        
        document.getElementById('userModalTitle').textContent = '✏️ Modifier l\'Utilisateur';
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('fullName').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('role').value = user.role;
        document.getElementById('isActive').value = user.is_active ? '1' : '0';
        document.getElementById('password').value = '';
        document.getElementById('password').required = false;
        document.getElementById('passwordGroup').querySelector('label').textContent = 'Mot de passe (optionnel)';
        
        document.getElementById('userModal').classList.add('active');
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du chargement de l\'utilisateur', 'error');
    }
}

// Enregistrer un utilisateur
async function saveUser(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const userData = {
        username: document.getElementById('username').value,
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        is_active: parseInt(document.getElementById('isActive').value)
    };
    
    const password = document.getElementById('password').value;
    if (password) {
        userData.password = password;
    }
    
    try {
        const url = userId 
            ? `${API_BASE_URL}/users/${userId}`
            : `${API_BASE_URL}/users`;
        
        const method = userId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de l\'enregistrement');
        }
        
        showNotification(
            userId ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
            'success'
        );
        
        closeUserModal();
        await loadUsers();
        await updateStatistics();
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
}

// Fermer le modal utilisateur
function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    document.getElementById('userForm').reset();
}

// Basculer le statut d'un utilisateur
async function toggleUserStatus(userId, currentStatus) {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activer' : 'désactiver';
    
    if (!confirm(`Voulez-vous vraiment ${action} cet utilisateur ?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ is_active: newStatus })
        });
        
        if (!response.ok) throw new Error('Erreur lors de la modification');
        
        showNotification(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`, 'success');
        await loadUsers();
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
}

// Supprimer un utilisateur
async function deleteUser(userId) {
    if (!confirm('⚠️ Voulez-vous vraiment supprimer cet utilisateur ?\n\nCette action est irréversible et supprimera également toutes les évaluations associées.')) {
        return;
    }
    
    // Double confirmation
    if (!confirm('Confirmez-vous la suppression définitive ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        
        showNotification('Utilisateur supprimé avec succès', 'success');
        await loadUsers();
        await updateStatistics();
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
}

// ============================================================================
// GESTION DES ÉVALUATIONS
// ============================================================================

// Voir une évaluation
function viewEvaluation(evalId) {
    window.open(`formulaire-online.html?id=${evalId}&view=true`, '_blank');
}

// Supprimer une évaluation
async function deleteEvaluation(evalId) {
    if (!confirm('⚠️ Voulez-vous vraiment supprimer cette évaluation ?\n\nCette action est irréversible.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/evaluations/${evalId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        
        showNotification('Évaluation supprimée avec succès', 'success');
        await loadEvaluations();
        await updateStatistics();
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
}

// ============================================================================
// STATISTIQUES
// ============================================================================

// Mettre à jour les statistiques
async function updateStatistics() {
    try {
        // Statistiques utilisateurs
        const totalUsers = allUsers.length;
        const activeUsers = allUsers.filter(u => u.is_active).length;
        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('usersChange').textContent = `+${activeUsers} actifs`;
        
        // Statistiques évaluations
        const totalEvals = allEvaluations.length;
        const pendingEvals = allEvaluations.filter(e => e.status === 'submitted').length;
        const validatedEvals = allEvaluations.filter(e => e.status === 'validated').length;
        
        document.getElementById('totalEvaluations').textContent = totalEvals;
        document.getElementById('pendingEvaluations').textContent = pendingEvals;
        document.getElementById('validatedEvaluations').textContent = validatedEvals;
        
        // Pourcentages
        if (totalEvals > 0) {
            document.getElementById('pendingPercent').textContent = 
                `${Math.round((pendingEvals / totalEvals) * 100)}%`;
            document.getElementById('validatedPercent').textContent = 
                `${Math.round((validatedEvals / totalEvals) * 100)}%`;
        }
        
        // Changements du mois (simulation)
        const thisMonth = new Date().getMonth();
        const evalsThisMonth = allEvaluations.filter(e => {
            if (!e.created_at) return false;
            return new Date(e.created_at).getMonth() === thisMonth;
        }).length;
        
        document.getElementById('evalsChange').textContent = `+${evalsThisMonth}`;
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
}

// Charger les graphiques statistiques avec Chart.js
function loadStatistics() {
    console.log('Chargement des graphiques statistiques avec Chart.js...');
    
    if (typeof Chart === 'undefined') {
        console.error('Chart.js n\'est pas chargé');
        return;
    }
    
    // 1. Graphique: Évaluations par Statut (Doughnut)
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        const statusCounts = {
            draft: allEvaluations.filter(e => e.status === 'draft').length,
            submitted: allEvaluations.filter(e => e.status === 'submitted').length,
            validated: allEvaluations.filter(e => e.status === 'validated').length
        };
        
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Brouillons', 'En attente', 'Validées'],
                datasets: [{
                    data: [statusCounts.draft, statusCounts.submitted, statusCounts.validated],
                    backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { family: 'Poppins', size: 12 } }
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    }
    
    // 2. Graphique: Évaluations par Mois (Bar)
    const monthCtx = document.getElementById('monthChart');
    if (monthCtx) {
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthCounts = new Array(12).fill(0);
        
        allEvaluations.forEach(e => {
            if (e.created_at) {
                const month = new Date(e.created_at).getMonth();
                monthCounts[month]++;
            }
        });
        
        new Chart(monthCtx, {
            type: 'bar',
            data: {
                labels: monthNames,
                datasets: [{
                    label: 'Évaluations',
                    data: monthCounts,
                    backgroundColor: '#4A9D5F',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
    
    // 3. Graphique: Utilisateurs par Rôle (Pie)
    const roleCtx = document.getElementById('roleChart');
    if (roleCtx) {
        const roleCounts = {
            admin: allUsers.filter(u => u.role === 'admin').length,
            N1: allUsers.filter(u => u.role === 'N1').length,
            N2: allUsers.filter(u => u.role === 'N2').length
        };
        
        new Chart(roleCtx, {
            type: 'pie',
            data: {
                labels: ['Admin', 'N1 - Évaluateur', 'N2 - Validateur'],
                datasets: [{
                    data: [roleCounts.admin, roleCounts.N1, roleCounts.N2],
                    backgroundColor: ['#E30613', '#4A9D5F', '#42A5F5'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { family: 'Poppins', size: 12 } }
                    }
                }
            }
        });
    }
    
    // 4. Graphique: Évaluations par Direction (Bar horizontal)
    const directionCtx = document.getElementById('directionChart');
    if (directionCtx) {
        const directionCounts = {};
        allEvaluations.forEach(e => {
            const dir = e.direction || 'Non spécifié';
            directionCounts[dir] = (directionCounts[dir] || 0) + 1;
        });
        
        const sortedDirections = Object.entries(directionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Top 10
        
        new Chart(directionCtx, {
            type: 'bar',
            data: {
                labels: sortedDirections.map(d => d[0]),
                datasets: [{
                    label: 'Évaluations',
                    data: sortedDirections.map(d => d[1]),
                    backgroundColor: '#6BC17D',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Enregistrer la configuration
async function saveSettings() {
    const settings = {
        defaultEmail: document.getElementById('defaultEmail').value,
        currentYear: document.getElementById('currentYear').value,
        passwordPolicy: document.getElementById('passwordPolicy').value,
        sessionTimeout: document.getElementById('sessionTimeout').value,
        maintenanceMode: document.getElementById('maintenanceMode').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(settings)
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
        
        showNotification('Configuration enregistrée avec succès', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
}

// Exporter la base de données
async function exportDatabase() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/export-database`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'export');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showNotification('Base de données exportée avec succès', 'success');
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
}

// Confirmer la réinitialisation de la base de données
function confirmResetDatabase() {
    if (!confirm('⚠️ ATTENTION : Cette action va supprimer TOUTES les données !\n\nUne sauvegarde automatique sera créée.\n\nContinuer ?')) {
        return;
    }
    
    if (!confirm('Tapez "SUPPRIMER" pour confirmer')) {
        return;
    }
    
    resetDatabase();
}

// Réinitialiser la base de données
async function resetDatabase() {
    try {
        // Créer une sauvegarde d'abord
        await exportDatabase();
        
        const response = await fetch(`${API_BASE_URL}/admin/reset-database`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la réinitialisation');
        
        showNotification('Base de données réinitialisée avec succès', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
}

// Exporter les logs
function exportLogs() {
    const csv = ['ID,Date/Heure,Utilisateur,Action,Évaluation,Ancien Statut,Nouveau Statut,IP,Détails'];
    
    filteredLogs.forEach(log => {
        csv.push([
            log.id,
            formatDateTime(log.created_at),
            log.user_name || `User #${log.user_id}`,
            log.action,
            log.evaluation_id || '',
            log.old_status || '',
            log.new_status || '',
            log.ip_address || '',
            (log.details || '').replace(/,/g, ';')
        ].join(','));
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('Logs exportés avec succès', 'success');
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Obtenir le libellé du rôle
function getRoleLabel(role) {
    const labels = {
        'admin': 'Administrateur',
        'N1': 'N1 - Évaluateur',
        'N2': 'N2 - Validateur'
    };
    return labels[role] || role;
}

// Obtenir le libellé du statut
function getStatusLabel(status) {
    const labels = {
        'draft': 'Brouillon',
        'submitted': 'Soumis',
        'validated': 'Validé'
    };
    return labels[status] || status;
}

// Formater une date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Formater une date et heure
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Afficher une notification
function showNotification(message, type = 'info') {
    if (typeof showCustomNotification === 'function') {
        showCustomNotification(message, type);
    } else {
        alert(message);
    }
}

// Réinitialiser le mot de passe d'un utilisateur
async function resetUserPassword(userId, username) {
    const confirmMsg = `🔑 Réinitialiser le mot de passe de "${username}" ?\n\n` +
                      `Cette action va :\n` +
                      `• Réinitialiser le mot de passe à "Test123@"\n` +
                      `• Activer le flag "first_login"\n` +
                      `• Forcer l'utilisateur à changer son mot de passe à la prochaine connexion\n\n` +
                      `Voulez-vous continuer ?`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('✅ Mot de passe réinitialisé avec succès !', 'success');
            showNotification(`🔐 Nouveau mot de passe : Test123@ (à changer à la prochaine connexion)`, 'info');
            await loadUsers(); // Recharger la liste
        } else {
            showNotification('❌ Erreur: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('❌ Erreur lors de la réinitialisation du mot de passe', 'error');
    }
}

// Déconnexion
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        console.log('🚪 Déconnexion administrateur...');
        
        // Nettoyer complètement toutes les données
        localStorage.clear();
        sessionStorage.clear();
        
        // Supprimer tous les cookies
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('✅ Session administrateur nettoyée');
        
        // Redirection avec replace pour empêcher le retour en arrière
        window.location.replace('src/pages/login.html');
    }
}

// Fermer les modals en cliquant en dehors
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});
