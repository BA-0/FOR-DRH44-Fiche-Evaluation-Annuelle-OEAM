// ===============================================
// SYSTÈME DE NAVIGATION - SENICO SA
// ===============================================

class NavigationSystem {
    constructor() {
        this.history = [];
        this.currentPage = this.getPageName();
        this.init();
    }

    init() {
        // Sauvegarder la page actuelle dans l'historique
        this.savePage();
        
        // Écouter les changements de page
        window.addEventListener('beforeunload', () => {
            this.savePage();
        });
    }

    getPageName() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);
        return page || 'index.html';
    }

    savePage() {
        const pageData = {
            page: this.currentPage,
            url: window.location.href,
            timestamp: Date.now()
        };

        // Récupérer l'historique existant
        const historyStr = sessionStorage.getItem('navHistory');
        const history = historyStr ? JSON.parse(historyStr) : [];

        // Ajouter la page actuelle
        history.push(pageData);

        // Garder seulement les 10 dernières pages
        if (history.length > 10) {
            history.shift();
        }

        sessionStorage.setItem('navHistory', JSON.stringify(history));
    }

    goBack() {
        // Utiliser l'historique du navigateur
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Si pas d'historique, retourner au dashboard
            this.goToDashboard();
        }
    }

    goToDashboard() {
        window.location.href = 'dashboard.html';
    }

    getPreviousPage() {
        const historyStr = sessionStorage.getItem('navHistory');
        if (!historyStr) return null;

        const history = JSON.parse(historyStr);
        if (history.length < 2) return null;

        // Retourner l'avant-dernière page
        return history[history.length - 2];
    }

    canGoBack() {
        return window.history.length > 1 || this.getPreviousPage() !== null;
    }
}

// Créer une instance globale
window.navigation = new NavigationSystem();

// Fonction utilitaire pour le bouton retour
function navigateBack() {
    window.navigation.goBack();
}

// Fonction pour aller au dashboard
function goToDashboard() {
    window.navigation.goToDashboard();
}

// Créer le bouton retour dynamiquement
function createBackButton(options = {}) {
    const {
        text = 'Retour',
        icon = '←',
        container = null,
        variant = 'default', // 'default', 'alt', 'compact'
        position = 'header' // 'header', 'top', 'custom'
    } = options;

    const button = document.createElement('button');
    button.className = `back-button ${variant}`;
    button.innerHTML = `
        <span class="back-button-icon">${icon}</span>
        <span class="back-button-text">${text}</span>
    `;
    
    button.addEventListener('click', (e) => {
        e.preventDefault();
        navigateBack();
    });

    if (container) {
        container.appendChild(button);
    } else if (position === 'header') {
        // Ajouter au début du header-content
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            const logoSection = headerContent.querySelector('.logo-section');
            if (logoSection) {
                headerContent.insertBefore(button, logoSection);
            } else {
                headerContent.prepend(button);
            }
        }
    } else if (position === 'top') {
        // Ajouter au début du body
        document.body.insertBefore(button, document.body.firstChild);
    }

    return button;
}

// Créer un fil d'Ariane (breadcrumb)
function createBreadcrumb(pages) {
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'breadcrumb';

    pages.forEach((page, index) => {
        if (index > 0) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '›';
            breadcrumb.appendChild(separator);
        }

        if (page.url) {
            const link = document.createElement('a');
            link.href = page.url;
            link.textContent = page.text;
            breadcrumb.appendChild(link);
        } else {
            const span = document.createElement('span');
            span.textContent = page.text;
            breadcrumb.appendChild(span);
        }
    });

    return breadcrumb;
}

// Auto-initialisation pour les pages avec .header
window.addEventListener('DOMContentLoaded', () => {
    // Ajouter automatiquement le bouton retour si l'option est activée
    const autoBackButton = document.body.dataset.autoBackButton;
    
    if (autoBackButton === 'true') {
        const variant = document.body.dataset.backButtonVariant || 'default';
        createBackButton({ variant });
    }
});

console.log('%c🧭 Système de navigation SENICO SA chargé', 'color: #4A9D5F; font-size: 14px; font-weight: bold;');
console.log('%cUtilisation:', 'color: #3498db; font-weight: bold;');
console.log('navigateBack() - Retour à la page précédente');
console.log('goToDashboard() - Retour au tableau de bord');
console.log('createBackButton({ text, icon, variant }) - Créer un bouton personnalisé');
