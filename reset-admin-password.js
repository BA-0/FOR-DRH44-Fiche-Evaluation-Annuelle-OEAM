// ============================================
// Réinitialiser le mot de passe admin
// ============================================

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'formulaire_evaluation',
    port: 3306
};

async function resetAdminPassword() {
    console.log('\n============================================================');
    console.log('     RÉINITIALISATION MOT DE PASSE ADMIN');
    console.log('============================================================\n');

    const newPassword = 'Test123@';
    
    try {
        // Générer le hash bcrypt
        console.log('[1/3] Génération du hash bcrypt...');
        const hash = await bcrypt.hash(newPassword, 10);
        console.log('✅ Hash généré:', hash);

        // Connexion à la base
        console.log('\n[2/3] Connexion à MySQL...');
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connecté à MySQL');

        // Mise à jour du mot de passe
        console.log('\n[3/3] Mise à jour du mot de passe admin...');
        const [result] = await connection.execute(
            'UPDATE users SET password = ? WHERE username = ?',
            [hash, 'admin']
        );

        if (result.affectedRows === 0) {
            console.log('⚠️  Aucun utilisateur "admin" trouvé - Création...');
            
            await connection.execute(
                `INSERT INTO users (username, password, email, role, name, is_active, first_login) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                ['admin', hash, 'admin@senico.com', 'admin', 'Administrateur', true, false]
            );
            console.log('✅ Utilisateur admin créé');
        } else {
            console.log('✅ Mot de passe mis à jour');
        }

        await connection.end();

        console.log('\n============================================================');
        console.log('✅ SUCCÈS !');
        console.log('============================================================');
        console.log('\nNouveaux identifiants:');
        console.log('  Username: admin');
        console.log('  Password: Test123@');
        console.log('\nVous pouvez maintenant vous connecter sur:');
        console.log('  http://localhost:3001/login.html');
        console.log('============================================================\n');

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.log('\nVérifiez que:');
        console.log('  1. WAMP Server est démarré (icône verte)');
        console.log('  2. La base "formulaire_evaluation" existe');
        console.log('  3. npm install a été exécuté\n');
    }
}

resetAdminPassword();
