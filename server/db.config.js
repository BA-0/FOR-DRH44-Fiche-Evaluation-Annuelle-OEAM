// Configuration de la connexion à la base de données MySQL
// Pour WAMP Server

module.exports = {
    // Configuration MySQL
    host: 'localhost',      // Serveur MySQL (localhost pour WAMP)
    port: 3306,             // Port MySQL par défaut
    user: 'root',           // Utilisateur MySQL (root par défaut dans WAMP)
    password: '',           // Mot de passe (vide par défaut dans WAMP)
    database: 'formulaire_evaluation',
    
    // Options de connexion
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    
    // Paramètres supplémentaires
    charset: 'utf8mb4',
    timezone: '+00:00',
    
    // Pour le développement
    debug: false,
    
    // Pool de connexions
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Note: Pour la production, utilisez des variables d'environnement
// Exemple avec .env:
// DB_HOST=localhost
// DB_USER=root
// DB_PASSWORD=votre_mot_de_passe
// DB_NAME=formulaire_evaluation
