const mysql = require('mysql2/promise');

async function verifierBase() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 VÉRIFICATION DE LA BASE DE DONNÉES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'formulaire_evaluation'
    });

    try {
        // Vérifier les utilisateurs
        console.log('👥 UTILISATEURS:');
        const [users] = await connection.execute('SELECT * FROM users LIMIT 1');
        
        // D'abord vérifier la structure
        if (users.length > 0) {
            console.log('   Colonnes disponibles:', Object.keys(users[0]).join(', '));
        }
        
        const [allUsers] = await connection.execute('SELECT * FROM users ORDER BY id');
        console.log(`   Total: ${allUsers.length} utilisateurs\n`);
        
        if (users.length === 0) {
            console.log('   ❌ AUCUN UTILISATEUR TROUVÉ !');
            console.log('   ➡️  Vous devez exécuter le script reparer-base.sql dans phpMyAdmin\n');
        } else {
            allUsers.forEach(user => {
                console.log(`   ${user.role === 'N2' ? '📊' : '📝'} ${user.username} (${user.role}) - ${user.name}`);
            });
        }

        // Vérifier les évaluations
        console.log('\n📋 ÉVALUATIONS:');
        const [evals] = await connection.execute('SELECT id, evalue_nom, status FROM evaluations ORDER BY id');
        console.log(`   Total: ${evals.length} évaluations\n`);
        
        if (evals.length === 0) {
            console.log('   ❌ AUCUNE ÉVALUATION TROUVÉE !');
            console.log('   ➡️  Le script SQL n\'a pas été exécuté\n');
        } else {
            evals.forEach(ev => {
                const statusIcon = ev.status === 'draft' ? '📝' : ev.status === 'submitted' ? '✅' : ev.status === 'validated' ? '🎉' : '❓';
                console.log(`   ${statusIcon} #${ev.id} - ${ev.evalue_nom || 'N/A'} (${ev.status})`);
            });
        }

        // Vérifier les procédures stockées
        console.log('\n⚙️ PROCÉDURES STOCKÉES:');
        const [procs] = await connection.execute(
            `SELECT ROUTINE_NAME FROM information_schema.ROUTINES 
             WHERE ROUTINE_SCHEMA = 'formulaire_evaluation' 
             AND ROUTINE_TYPE = 'PROCEDURE'`
        );
        
        if (procs.length === 0) {
            console.log('   ❌ AUCUNE PROCÉDURE TROUVÉE !');
            console.log('   ➡️  Les procédures sp_submit_evaluation et sp_validate_evaluation sont manquantes\n');
        } else {
            procs.forEach(proc => {
                console.log(`   ✅ ${proc.ROUTINE_NAME}`);
            });
        }

        // Vérifier la table audit_log
        console.log('\n📊 TABLE AUDIT_LOG:');
        const [tables] = await connection.execute(
            `SELECT COUNT(*) as count FROM information_schema.tables 
             WHERE table_schema = 'formulaire_evaluation' 
             AND table_name = 'audit_log'`
        );
        
        if (tables[0].count === 0) {
            console.log('   ❌ Table audit_log manquante !');
        } else {
            const [logs] = await connection.execute('SELECT COUNT(*) as total FROM audit_log');
            console.log(`   ✅ Table existe (${logs[0].total} entrées)`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 RÉSUMÉ:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const allGood = users.length >= 7 && evals.length >= 5 && procs.length >= 2;

        if (allGood) {
            console.log('   ✅ La base de données est COMPLÈTE et PRÊTE !');
            console.log(`   ✅ ${users.length} utilisateurs avec mot de passe: test123`);
            console.log(`   ✅ ${evals.length} évaluations de test`);
            console.log(`   ✅ ${procs.length} procédures stockées`);
            console.log('\n   🎉 Vous pouvez lancer les tests maintenant !\n');
            console.log('   Commande: node test-complet.js\n');
        } else {
            console.log('   ❌ La base de données est INCOMPLÈTE !');
            console.log('\n   📋 ACTIONS REQUISES:');
            console.log('   1. Ouvrez phpMyAdmin: http://localhost/phpmyadmin/');
            console.log('   2. Cliquez sur l\'onglet "SQL"');
            console.log('   3. Ouvrez le fichier: reparer-base.sql');
            console.log('   4. Copiez TOUT le contenu');
            console.log('   5. Collez dans phpMyAdmin et cliquez "Exécuter"');
            console.log('\n   Après, relancez cette vérification: node verifier-etat.js\n');
        }

    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.log('\n⚠️  Vérifiez que WAMP est démarré et que MySQL fonctionne.\n');
    } finally {
        await connection.end();
    }
}

verifierBase();
