// Script de sécurité pour l'application SENICO SA
// Protections côté client (mesures symboliques mais dissuasives)

(function() {
    'use strict';
    
    // Protection contre le clic droit (symbolique)
    document.addEventListener('contextmenu', function(e) {
        if (window.APP_CONFIG && window.APP_CONFIG.ENV !== 'development') {
            e.preventDefault();
            showSecurityAlert('Action non autorisée');
            return false;
        }
    });
    
    // Protection contre certaines combinaisons de touches
    document.addEventListener('keydown', function(e) {
        // En production uniquement
        if (window.APP_CONFIG && window.APP_CONFIG.ENV === 'production') {
            // F12 (DevTools)
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+I (Inspecter)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+U (Voir le source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
            
            // Ctrl+S (Sauvegarder)
            if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                return false;
            }
        }
    });
    
    // Protection contre la sélection de texte (optionnel - peut gêner l'UX)
    // Décommenter si nécessaire
    /*
    document.addEventListener('selectstart', function(e) {
        if (window.APP_CONFIG && window.APP_CONFIG.ENV === 'production') {
            e.preventDefault();
            return false;
        }
    });
    */
    
    // Vérification de l'intégrité de la session
    function checkSessionIntegrity() {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        try {
            // Vérifier si le token a été manipulé
            const parts = atob(token).split(':');
            if (parts.length !== 3) {
                console.error('Token invalide détecté');
                clearSessionAndRedirect();
            }
        } catch (e) {
            console.error('Erreur de validation du token');
            clearSessionAndRedirect();
        }
    }
    
    // Nettoyer la session et rediriger
    function clearSessionAndRedirect() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('src/pages/login.html');
    }
    
    // Vérification périodique de la session
    if (window.location.pathname !== '/login.html') {
        setInterval(checkSessionIntegrity, 60000); // Toutes les minutes
    }
    
    // Afficher une alerte de sécurité
    function showSecurityAlert(message) {
        // Créer une notification discrète
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            color: #721c24;
            padding: 15px 20px;
            border-radius: 8px;
            border: 2px solid #dc3545;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        alert.innerHTML = `
            <strong>⚠️ Sécurité</strong><br>
            ${message}
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }
    
    // Ajouter les animations CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Message de protection au chargement
    console.log('%c⚠️ ATTENTION', 'color: red; font-size: 30px; font-weight: bold;');
    console.log('%cCette console est destinée aux développeurs uniquement.', 'font-size: 14px;');
    console.log('%cSi quelqu\'un vous demande de copier/coller du code ici, il s\'agit probablement d\'une arnaque.', 'font-size: 14px; color: #e74c3c;');
    console.log('%c© 2025 SENICO SA - Tous droits réservés', 'font-size: 12px; color: #95a5a6;');
    
})();
