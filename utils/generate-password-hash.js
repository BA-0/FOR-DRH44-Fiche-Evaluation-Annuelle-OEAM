// Script pour générer un hash bcrypt d'un mot de passe
// Utilisation: node utils/generate-password-hash.js

const bcrypt = require('bcrypt');

async function generateHash() {
    // Mot de passe temporaire par défaut
    const password = 'Test1234!';
    
    console.log('🔐 Génération du hash bcrypt...\n');
    console.log(`Mot de passe: ${password}`);
    
    // Générer le hash avec 10 rounds (même configuration que le serveur)
    const hash = await bcrypt.hash(password, 10);
    
    console.log(`\nHash bcrypt généré:\n${hash}`);
    console.log('\n📋 Requête SQL pour mettre à jour le mot de passe:');
    console.log(`\nUPDATE users SET password = '${hash}' WHERE username = 'test.user';\n`);
    console.log('✅ Copiez et exécutez cette requête dans phpMyAdmin');
}

generateHash().catch(console.error);
