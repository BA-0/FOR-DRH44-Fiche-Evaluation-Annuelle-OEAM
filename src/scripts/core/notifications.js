// ===============================================
// SYSTÈME DE NOTIFICATIONS MODERNE - SENICO SA
// ===============================================

class NotificationSystem {
    constructor() {
        this.container = null;
        this.toastContainer = null;
        this.init();
    }

    init() {
        // Créer le conteneur de notifications
        if (!document.querySelector('.notification-container')) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.notification-container');
        }

        // Créer le conteneur de toasts
        if (!document.querySelector('.toast-container')) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        } else {
            this.toastContainer = document.querySelector('.toast-container');
        }
    }

    // Nettoyer les messages (enlever localhost et URLs techniques)
    cleanMessage(message) {
        if (!message) return message;
        
        let cleaned = message.toString();
        
        // Supprimer les URLs localhost complètes
        cleaned = cleaned.replace(/https?:\/\/localhost:\d+[^\s]*/gi, '');
        cleaned = cleaned.replace(/localhost:\d+[^\s]*/gi, '');
        
        // Supprimer les URLs de développement
        cleaned = cleaned.replace(/https?:\/\/127\.0\.0\.1:\d+[^\s]*/gi, '');
        cleaned = cleaned.replace(/127\.0\.0\.1:\d+[^\s]*/gi, '');
        
        // Nettoyer les espaces multiples
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        return cleaned;
    }

    // Notification principale
    show(options) {
        const {
            type = 'info',
            title,
            message,
            duration = 5000,
            closable = true
        } = options;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        // Nettoyer le message et le titre
        const cleanedMessage = this.cleanMessage(message);
        const cleanedTitle = this.cleanMessage(title);

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-content">
                ${cleanedTitle ? `<div class="notification-title">${cleanedTitle}</div>` : ''}
                <div class="notification-message">${cleanedMessage}</div>
            </div>
            ${closable ? '<button class="notification-close">×</button>' : ''}
        `;

        this.container.appendChild(notification);

        // Bouton de fermeture
        if (closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.remove(notification));
        }

        // Auto-suppression
        if (duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }

        return notification;
    }

    // Méthodes raccourcies
    success(message, title = '✅ Succès') {
        return this.show({ type: 'success', title, message });
    }

    error(message, title = '❌ Erreur') {
        return this.show({ type: 'error', title, message });
    }

    warning(message, title = '⚠️ Attention') {
        return this.show({ type: 'warning', title, message });
    }

    info(message, title = 'ℹ️ Information') {
        return this.show({ type: 'info', title, message });
    }

    // Toast compact (en bas)
    toast(message, duration = 3000) {
        const cleanedMessage = this.cleanMessage(message);
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="toast-icon">💬</span>
            <span>${cleanedMessage}</span>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    }

    // Supprimer une notification
    remove(notification) {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
    }

    // Tout supprimer
    clear() {
        const notifications = this.container.querySelectorAll('.notification');
        notifications.forEach(notif => this.remove(notif));
    }
}

// Modal de confirmation moderne
class ConfirmDialog {
    constructor() {
        this.overlay = null;
        this.createOverlay();
    }

    createOverlay() {
        if (document.querySelector('.confirm-modal-overlay')) {
            this.overlay = document.querySelector('.confirm-modal-overlay');
            return;
        }

        this.overlay = document.createElement('div');
        this.overlay.className = 'confirm-modal-overlay';
        document.body.appendChild(this.overlay);

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
    }

    cleanMessage(message) {
        if (!message) return message;
        
        let cleaned = message.toString();
        
        // Supprimer les URLs localhost complètes
        cleaned = cleaned.replace(/https?:\/\/localhost:\d+[^\s]*/gi, '');
        cleaned = cleaned.replace(/localhost:\d+[^\s<>]*/gi, '');
        
        // Supprimer les URLs de développement
        cleaned = cleaned.replace(/https?:\/\/127\.0\.0\.1:\d+[^\s]*/gi, '');
        cleaned = cleaned.replace(/127\.0\.0\.1:\d+[^\s<>]*/gi, '');
        
        // Nettoyer les espaces multiples
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        return cleaned;
    }

    cleanMessage(message) {
        if (!message) return message;
        
        let cleaned = message.toString();
        
        // Supprimer les URLs localhost complètes
        cleaned = cleaned.replace(/https?:\/\/localhost:\d+[^\s]*/gi, '');
        cleaned = cleaned.replace(/localhost:\d+[^\s<>]*/gi, '');
        
        // Supprimer les URLs de développement
        cleaned = cleaned.replace(/https?:\/\/127\.0\.0\.1:\d+[^\s]*/gi, '');
        cleaned = cleaned.replace(/127\.0\.0\.1:\d+[^\s<>]*/gi, '');
        
        // Nettoyer les espaces multiples
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        return cleaned;
    }

    show(options) {
        return new Promise((resolve) => {
            const {
                title = 'Confirmation',
                message = 'Êtes-vous sûr ?',
                icon = '❓',
                confirmText = 'Confirmer',
                cancelText = 'Annuler',
                type = 'primary' // primary, danger
            } = options;

            // Nettoyer les messages
            const cleanedTitle = this.cleanMessage(title);
            const cleanedMessage = this.cleanMessage(message);

            this.overlay.innerHTML = `
                <div class="confirm-modal">
                    <div class="confirm-modal-icon">${icon}</div>
                    <div class="confirm-modal-content">
                        <div class="confirm-modal-title">${cleanedTitle}</div>
                        <div class="confirm-modal-message">${cleanedMessage}</div>
                        <div class="confirm-modal-actions">
                            <button class="confirm-modal-button secondary" data-action="cancel">
                                ${cancelText}
                            </button>
                            <button class="confirm-modal-button ${type}" data-action="confirm">
                                ${confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this.overlay.classList.add('show');

            // Gestion des boutons
            const buttons = this.overlay.querySelectorAll('.confirm-modal-button');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    this.hide();
                    resolve(action === 'confirm');
                });
            });

            // ESC pour fermer
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    this.hide();
                    resolve(false);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    }

    hide() {
        this.overlay.classList.remove('show');
    }

    // Méthodes raccourcies
    async confirm(message, title = 'Confirmation') {
        return await this.show({
            title,
            message,
            icon: '❓',
            type: 'primary'
        });
    }

    async danger(message, title = 'Attention') {
        return await this.show({
            title,
            message,
            icon: '⚠️',
            confirmText: 'Supprimer',
            type: 'danger'
        });
    }

    async delete(itemName = 'cet élément') {
        return await this.show({
            title: 'Confirmer la suppression',
            message: `Êtes-vous sûr de vouloir supprimer ${itemName} ?<br><br>Cette action est <strong>irréversible</strong>.`,
            icon: '🗑️',
            confirmText: 'Supprimer définitivement',
            cancelText: 'Annuler',
            type: 'danger'
        });
    }

    async logout() {
        return await this.show({
            title: 'Déconnexion',
            message: 'Voulez-vous vraiment vous déconnecter ?<br><br>Assurez-vous d\'avoir sauvegardé votre travail.',
            icon: '🚪',
            confirmText: 'Se déconnecter',
            cancelText: 'Rester connecté',
            type: 'primary'
        });
    }
}

// Loading overlay
class LoadingOverlay {
    constructor() {
        this.overlay = null;
        this.createOverlay();
    }

    createOverlay() {
        if (document.querySelector('.loading-overlay')) {
            this.overlay = document.querySelector('.loading-overlay');
            return;
        }

        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Chargement en cours...</div>
        `;
        document.body.appendChild(this.overlay);
    }

    show(text = 'Chargement en cours...') {
        const textElement = this.overlay.querySelector('.loading-text');
        if (textElement) {
            textElement.textContent = text;
        }
        this.overlay.classList.add('show');
    }

    hide() {
        this.overlay.classList.remove('show');
    }

    async wrap(promise, text = 'Chargement en cours...') {
        this.show(text);
        try {
            const result = await promise;
            this.hide();
            return result;
        } catch (error) {
            this.hide();
            throw error;
  

// Fonction utilitaire globale pour nettoyer les messages d'erreur
window.cleanErrorMessage = function(error) {
    let message = '';
    
    if (typeof error === 'string') {
        message = error;
    } else if (error && error.message) {
        message = error.message;
    } else if (error && error.error) {
        message = error.error;
    } else {
        message = 'Une erreur est survenue';
    }
    
    // Supprimer les URLs localhost
    message = message.replace(/https?:\/\/localhost:\d+[^\s]*/gi, '');
    message = message.replace(/localhost:\d+[^\s]*/gi, '');
    message = message.replace(/https?:\/\/127\.0\.0\.1:\d+[^\s]*/gi, '');
    message = message.replace(/127\.0\.0\.1:\d+[^\s]*/gi, '');
    
    // Remplacer les messages techniques par des messages conviviaux
    if (message.toLowerCase().includes('fetch') || message.toLowerCase().includes('network')) {
        message = 'Erreur de connexion au serveur. Veuillez vérifier votre connexion.';
    }
    if (message.toLowerCase().includes('404')) {
        message = 'Ressource non trouvée.';
    }
    if (message.toLowerCase().includes('500')) {
        message = 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    if (message.toLowerCase().includes('401') || message.toLowerCase().includes('unauthorized')) {
        message = 'Session expirée. Veuillez vous reconnecter.';
    }
    if (message.toLowerCase().includes('403') || message.toLowerCase().includes('forbidden')) {
        message = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    }
    
    // Nettoyer les espaces multiples
    message = message.replace(/\s+/g, ' ').trim();
    
    return message || 'Une erreur est survenue';
};      }
    }
}

// Initialisation globale après le chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.notify = new NotificationSystem();
        window.confirmDialog = new ConfirmDialog();
        window.loading = new LoadingOverlay();
    });
} else {
    window.notify = new NotificationSystem();
    window.confirmDialog = new ConfirmDialog();
    window.loading = new LoadingOverlay();
}

// Compatibilité avec l'ancien système
window.showAlert = function(message, type = 'info') {
    const typeMap = {
        'success': 'success',
        'error': 'error',
        'warning': 'warning',
        'info': 'info'
    };
    
    // Si notify n'est pas encore initialisé, utiliser une alerte simple
    if (!window.notify) {
        console.warn('Notification system not ready yet, using console:', message);
        // Créer temporairement une notification simple
        setTimeout(() => {
            if (window.notify) {
                window.notify.show({
                    type: typeMap[type] || 'info',
                    message: message,
                    duration: 5000
                });
            } else {
                alert(message);
            }
        }, 100);
        return;
    }
    
    window.notify.show({
        type: typeMap[type] || 'info',
        message: message,
        duration: 5000
    });
};

// Console personnalisée
console.log('%c🎨 Système de notifications SENICO SA chargé', 'color: #4A9D5F; font-size: 14px; font-weight: bold;');
console.log('%cUtilisation:', 'color: #3498db; font-weight: bold;');
console.log('notify.success("Message de succès")');
console.log('notify.error("Message d\'erreur")');
console.log('notify.warning("Message d\'avertissement")');
console.log('notify.info("Message d\'information")');
console.log('notify.toast("Message rapide")');
console.log('await confirmDialog.confirm("Êtes-vous sûr ?")');
console.log('await confirmDialog.delete("ce fichier")');
console.log('loading.show("Chargement...")');
