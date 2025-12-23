// Script temporaire pour vérifier l'évaluation #66
const db = require('./server/db');

async function checkEvaluation() {
    try {
        const sql = `
            SELECT id, evaluateur_nom, evalue_nom, email_n2, status, 
                   date_evaluation, created_at, updated_at 
            FROM evaluations 
            WHERE id = 66 OR DATE(created_at) = CURDATE()
            ORDER BY id DESC
        `;
        
        const results = await db.query(sql);
        
        console.log('\n📊 Évaluations trouvées:', results.length);
        console.log('='.repeat(80));
        
        results.forEach(eval => {
            console.log(`\n📋 Évaluation #${eval.id}`);
            console.log(`   Évaluateur: ${eval.evaluateur_nom}`);
            console.log(`   Évalué: ${eval.evalue_nom}`);
            console.log(`   Email N+2: ${eval.email_n2}`);
            console.log(`   Status: ${eval.status}`);
            console.log(`   Date évaluation: ${eval.date_evaluation}`);
            console.log(`   Créé le: ${eval.created_at}`);
            console.log(`   Modifié le: ${eval.updated_at}`);
        });
        
        console.log('\n' + '='.repeat(80));
        
        await db.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        await db.close();
        process.exit(1);
    }
}

checkEvaluation();
