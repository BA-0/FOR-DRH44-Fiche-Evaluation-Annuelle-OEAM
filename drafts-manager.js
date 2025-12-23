// Configuration
// Utiliser l'URL de l'API depuis la configuration globale
const API_URL = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost:3001/api';

// Authentication
const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');
const userRole = localStorage.getItem('userRole');

if (!userEmail || !userRole) {
    showAlert('Veuillez vous connecter pour accéder à cette page', 'error');
    setTimeout(() => window.location.href = 'login.html', 2000);
}

// Load drafts on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDrafts();
});

// Show alert
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} show`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Load drafts from server
async function loadDrafts() {
    const loading = document.getElementById('loading');
    const draftsContainer = document.getElementById('draftsContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    
    loading.style.display = 'block';
    draftsContainer.style.display = 'none';
    emptyState.style.display = 'none';
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/evaluations/evaluator/${userEmail}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des brouillons');
        }
        
        let drafts = await response.json();
        
        // Filter only drafts
        drafts = drafts.filter(evaluation => evaluation.statut === 'draft');
        
        // Apply search filter
        if (searchInput) {
            drafts = drafts.filter(draft => {
                const searchableText = `
                    ${draft.nom_evalue || ''} 
                    ${draft.direction || ''} 
                    ${draft.service || ''} 
                    ${draft.poste || ''}
                `.toLowerCase();
                return searchableText.includes(searchInput);
            });
        }
        
        // Apply sorting
        if (sortBy === 'recent') {
            drafts.sort((a, b) => new Date(b.date_derniere_modif || b.date_creation) - new Date(a.date_derniere_modif || a.date_creation));
        } else if (sortBy === 'oldest') {
            drafts.sort((a, b) => new Date(a.date_derniere_modif || a.date_creation) - new Date(b.date_derniere_modif || b.date_creation));
        } else if (sortBy === 'name') {
            drafts.sort((a, b) => (a.nom_evalue || '').localeCompare(b.nom_evalue || ''));
        }
        
        loading.style.display = 'none';
        
        // Update count
        document.getElementById('draftCount').textContent = drafts.length;
        
        if (drafts.length === 0) {
            emptyState.style.display = 'block';
        } else {
            displayDrafts(drafts);
            draftsContainer.style.display = 'grid';
        }
        
    } catch (error) {
        loading.style.display = 'none';
        console.error('Error loading drafts:', error);
        showAlert('Erreur lors du chargement des brouillons: ' + error.message, 'error');
        emptyState.style.display = 'block';
    }
}

// Display drafts
function displayDrafts(drafts) {
    const draftsContainer = document.getElementById('draftsContainer');
    draftsContainer.innerHTML = '';
    
    drafts.forEach(draft => {
        const draftCard = createDraftCard(draft);
        draftsContainer.appendChild(draftCard);
    });
}

// Create draft card
function createDraftCard(draft) {
    const card = document.createElement('div');
    card.className = 'draft-card';
    
    const lastModified = draft.date_derniere_modif || draft.date_creation;
    const dateStr = lastModified ? new Date(lastModified).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'Date inconnue';
    
    card.innerHTML = `
        <div class="draft-header">
            <div class="draft-title">
                <i class="fas fa-user"></i> ${draft.nom_evalue || 'Nom non renseigné'}
            </div>
            <div class="draft-badge">
                <i class="fas fa-clock"></i> Brouillon
            </div>
        </div>
        
        <div class="draft-details">
            <div class="draft-detail">
                <div class="draft-detail-label">Direction</div>
                <div class="draft-detail-value">${draft.direction || 'Non renseigné'}</div>
            </div>
            <div class="draft-detail">
                <div class="draft-detail-label">Service</div>
                <div class="draft-detail-value">${draft.service || 'Non renseigné'}</div>
            </div>
            <div class="draft-detail">
                <div class="draft-detail-label">Poste</div>
                <div class="draft-detail-value">${draft.poste || 'Non renseigné'}</div>
            </div>
            <div class="draft-detail">
                <div class="draft-detail-label">Dernière modification</div>
                <div class="draft-detail-value">${dateStr}</div>
            </div>
        </div>
        
        <div class="draft-actions">
            <button class="btn-action btn-edit" onclick="resumeDraft(${draft.id})">
                <i class="fas fa-edit"></i> Reprendre
            </button>
            <button class="btn-action btn-delete" onclick="confirmDelete(${draft.id}, '${draft.nom_evalue || 'ce brouillon'}')">
                <i class="fas fa-trash"></i> Supprimer
            </button>
        </div>
    `;
    
    return card;
}

// Resume draft
function resumeDraft(draftId) {
    // Store draft ID in localStorage and redirect to form
    localStorage.setItem('resumeDraftId', draftId);
    window.location.href = 'formulaire-online.html';
}

// Confirm delete
function confirmDelete(draftId, nom) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le brouillon de "${nom}" ?\n\nCette action est irréversible.`)) {
        deleteDraft(draftId);
    }
}

// Delete draft
async function deleteDraft(draftId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/evaluations/${draftId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du brouillon');
        }
        
        showAlert('Brouillon supprimé avec succès', 'success');
        
        // Reload drafts
        setTimeout(() => loadDrafts(), 1000);
        
    } catch (error) {
        console.error('Error deleting draft:', error);
        showAlert('Erreur lors de la suppression: ' + error.message, 'error');
    }
}

// Search on Enter key
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loadDrafts();
    }
});
