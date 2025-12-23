// Script pour changer le statut de l'évaluation #66 à "submitted"
const db = require('./server/db');

async function updateEvaluation() {
    try {
        // Mettre à jour l'évaluation #66
        const sql = `
            UPDATE evaluations 
            SET status = 'submitted',
                updated_at = NOW()
            WHERE id = 66
        `;
        
        await db.query(sql);
        console.log('✅ Évaluation #66 mise à jour : status = submitted');
        
        // Vérifier le résultat
        const check = await db.query('SELECT id, status, evaluateur_nom, evalue_nom, email_n2 FROM evaluations WHERE id = 66');
        console.log('\n📋 Résultat:', check[0]);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

updateEvaluation();
