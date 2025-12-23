// Script pour vérifier les données dans la base de données
const mysql = require('mysql2/promise');
const dbConfig = require('./db.config.js');

async function checkData() {
    let connection;
    
    try {
        console.log('📊 Connexion à la base de données...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connexion réussie!\n');
        
        // Vérifier la structure de la table evaluations
        console.log('🔍 STRUCTURE DE LA TABLE evaluations:');
        console.log('====================================');
        const [columns] = await connection.query('DESCRIBE evaluations');
        columns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });
        console.log('');
        
        // Vérifier les utilisateurs N+1
        console.log('👥 UTILISATEURS N+1:');
        console.log('==================');
        const [users] = await connection.query(
            'SELECT id, name, email, role FROM users WHERE role = ? ORDER BY name',
            ['N1']
        );
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email})`);
        });
        console.log(`Total: ${users.length} utilisateur(s)\n`);
        
        // Vérifier toutes les évaluations
        console.log('📝 TOUTES LES ÉVALUATIONS:');
        console.log('==========================');
        const [allEvals] = await connection.query(
            'SELECT id, evalue_nom, evaluateur_nom, status, created_at FROM evaluations ORDER BY created_at DESC LIMIT 20'
        );
        
        if (allEvals.length === 0) {
            console.log('❌ Aucune évaluation dans la base de données!');
        } else {
            console.log(`Nombre total: ${allEvals.length} évaluation(s)\n`);
            allEvals.forEach(ev => {
                console.log(`ID: ${ev.id}`);
                console.log(`  Évalué: ${ev.evalue_nom || 'N/A'}`);
                console.log(`  Évaluateur: ${ev.evaluateur_nom || 'N/A'}`);
                console.log(`  Statut: ${ev.status}`);
                console.log(`  Date: ${ev.created_at}`);
                console.log('---');
            });
        }
        
        // Pour chaque utilisateur N+1, compter ses évaluations
        console.log('\n📊 ÉVALUATIONS PAR UTILISATEUR N+1:');
        console.log('===================================');
        for (const user of users) {
            const [evals] = await connection.query(
                'SELECT COUNT(*) as count FROM evaluations WHERE evaluateur_nom = ?',
                [user.name]
            );
            console.log(`${user.name}: ${evals[0].count} évaluation(s)`);
        }
        
        // Vérifier spécifiquement pour BOUGAR DIOUF
        console.log('\n🔍 VÉRIFICATION SPÉCIFIQUE POUR BOUGAR DIOUF:');
        console.log('=============================================');
        const [bougarEvals] = await connection.query(
            `SELECT id, evalue_nom, evaluateur_nom, status 
             FROM evaluations 
             WHERE evaluateur_nom LIKE '%BOUGAR%' OR evaluateur_nom LIKE '%DIOUF%'`
        );
        
        if (bougarEvals.length === 0) {
            console.log('❌ Aucune évaluation trouvée pour BOUGAR DIOUF');
            console.log('\nℹ️  Vérifiez que:');
            console.log('   1. L\'utilisateur existe dans la table users');
            console.log('   2. Des évaluations ont été créées pour cet utilisateur');
            console.log('   3. Le champ evaluateur_nom correspond exactement');
        } else {
            console.log(`✅ ${bougarEvals.length} évaluation(s) trouvée(s):`);
            bougarEvals.forEach(ev => {
                console.log(`  - ${ev.evalue_nom} (${ev.status}) - Évaluateur: ${ev.evaluateur_nom}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Connexion fermée');
        }
    }
}

checkData();
