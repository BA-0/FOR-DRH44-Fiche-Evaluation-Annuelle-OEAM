const fetch = require('node-fetch');
const API_URL = 'http://localhost:3001/api';

async function testSubmission() {
    console.log('\n🧪 TEST DE SOUMISSION\n');
    console.log('═══════════════════════════════════════════════\n');
    
    // Tester de soumettre l'évaluation ID 59 (DSI)
    const testId = 59;
    
    try {
        console.log(`📤 Tentative de soumission de l'évaluation #${testId}...\n`);
        
        const response = await fetch(`${API_URL}/evaluations/${testId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log(`Statut HTTP: ${response.status} ${response.statusText}`);
        
        const result = await response.json();
        console.log('\nRéponse du serveur:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('\n✅ SOUMISSION RÉUSSIE !');
            
            // Vérifier que N+2 voit bien l'évaluation
            console.log('\n🔍 Vérification côté N+2...');
            const checkResponse = await fetch(`${API_URL}/evaluations/pending/ousseynou.seck@senico.sn`);
            const checkData = await checkResponse.json();
            
            if (checkData.success) {
                const found = checkData.evaluations.find(e => e.id === testId);
                if (found) {
                    console.log(`✅ N+2 voit bien l'évaluation #${testId}`);
                    console.log(`   Évalué: ${found.evalue_nom}`);
                    console.log(`   Status: ${found.status}`);
                } else {
                    console.log(`❌ N+2 ne voit PAS l'évaluation #${testId}`);
                }
                console.log(`\n📊 Total d'évaluations pour N+2: ${checkData.evaluations.length}`);
            }
        } else {
            console.log(`\n❌ ÉCHEC: ${result.error || 'Erreur inconnue'}`);
        }
        
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('\nDétails:', error);
    }
    
    console.log('\n═══════════════════════════════════════════════\n');
}

testSubmission();
