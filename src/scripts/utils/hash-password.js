// Script pour hasher les mots de passe avec bcrypt
const bcrypt = require('bcrypt');

// Fonction pour hasher un mot de passe
async function hashPassword(password) {
    try {
        const saltRounds = 10; // Nombre de rounds pour bcrypt (plus = plus sécurisé mais plus lent)
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (error) {
        console.error('Erreur lors du hashing:', error);
        throw error;
    }
}

// Fonction pour vérifier un mot de passe
async function verifyPassword(password, hash) {
    try {
        const match = await bcrypt.compare(password, hash);
        return match;
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        throw error;
    }
}

// Script principal
async function main() {
    const password = process.argv[2];
    
    if (!password) {
        console.log('Usage: node hash-password.js <mot_de_passe>');
        console.log('Exemple: node hash-password.js eval123');
        return;
    }
    
    console.log('\n🔐 Génération du hash bcrypt...\n');
    
    const hash = await hashPassword(password);
    
    console.log('Mot de passe:', password);
    console.log('Hash bcrypt:', hash);
    
    // Vérification
    const isValid = await verifyPassword(password, hash);
    console.log('Vérification:', isValid ? '✅ OK' : '❌ Erreur');
    
    console.log('\n📋 Pour utiliser ce hash dans la base de données:');
    console.log(`INSERT INTO users (username, password, role, name, email) VALUES`);
    console.log(`('votre_username', '${hash}', 'N1', 'Nom Complet', 'email@example.com');\n`);
}

// Exécuter si appelé directement
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { hashPassword, verifyPassword };
