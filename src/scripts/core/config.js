// Configuration de l'application - À adapter selon l'environnement
// EN PRODUCTION : Modifier ces valeurs pour pointer vers votre serveur réel

const CONFIG = {
    // Environnement : 'development' ou 'production'
    ENV: 'development',
    
    // URL de l'API selon l'environnement
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001/api'  // Développement local
        : 'https://api.evaluation.senico.sn/api',  // Production (à adapter)
    
    // Configuration de sécurité
    SECURITY: {
        // Désactiver les console.log en production
        DISABLE_CONSOLE: window.location.hostname !== 'localhost',
        
        // Activer les protections anti-debug
        ENABLE_ANTI_DEBUG: window.location.hostname !== 'localhost',
        
        // Durée de validité du token (en minutes)
        TOKEN_EXPIRY: 480, // 8 heures
    },
    
    // Informations de l'application
    APP: {
        NAME: 'SENICO SA - Système d\'Évaluation',
        VERSION: '1.0.0',
        COPYRIGHT: '© 2025 SENICO SA - Tous droits réservés'
    }
};

// Désactiver console.log en production
if (CONFIG.SECURITY.DISABLE_CONSOLE) {
    console.log = function() {};
    console.info = function() {};
    console.warn = function() {};
    // Garder console.error pour le debugging critique
}

// Protection contre l'ouverture de la console DevTools
if (CONFIG.SECURITY.ENABLE_ANTI_DEBUG) {
    // Détection d'ouverture des DevTools
    const devtools = /./;
    devtools.toString = function() {
        this.opened = true;
    };
    
    setInterval(() => {
        if (devtools.opened) {
            // Ne pas bloquer complètement, juste avertir
            console.warn('⚠️ Accès développeur détecté');
        }
    }, 1000);
}

// Exporter la configuration
window.APP_CONFIG = CONFIG;
