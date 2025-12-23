const fetch = require('node-fetch');
const API_URL = 'http://localhost:3001/api';

async function submitAllDrafts() {
    console.log('\n📤 SOUMISSION DE TOUTES LES ÉVALUATIONS EN BROUILLON\n');
    console.log('═══════════════════════════════════════════════\n');
    
    const draftIds = [54, 55, 56, 58]; // 59 déjà soumis
    
    for (const id of draftIds) {
        try {
            console.log(`📝 Soumission de l'évaluation #${id}...`);
            
            const response = await fetch(`${API_URL}/evaluations/${id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`   ✅ Soumise avec succès\n`);
            } else {
                console.log(`   ❌ Échec: ${result.error}\n`);
            }
            
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}\n`);
        }
    }
    
    // Vérifier le résultat final
    console.log('═══════════════════════════════════════════════');
    console.log('🔍 VÉRIFICATION FINALE POUR N+2\n');
    
    const checkResponse = await fetch(`${API_URL}/evaluations/pending/ousseynou.seck@senico.sn`);
    const checkData = await checkResponse.json();
    
    if (checkData.success) {
        console.log(`📊 Total d'évaluations en attente: ${checkData.evaluations.length}\n`);
        
        checkData.evaluations.forEach((eval, index) => {
            console.log(`${index + 1}. ID ${eval.id} - ${eval.evalue_nom}`);
            console.log(`   Status: ${eval.status}`);
            console.log(`   Soumis: ${new Date(eval.submitted_at).toLocaleString('fr-FR')}\n`);
        });
    }
    
    console.log('═══════════════════════════════════════════════\n');
}

submitAllDrafts();
