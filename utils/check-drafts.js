const fetch = require('node-fetch');
const API_URL = 'http://localhost:3001/api';

async function checkDraftEvaluations() {
    try {
        console.log('\n🔍 RECHERCHE DES ÉVALUATIONS NON SOUMISES\n');
        console.log('═══════════════════════════════════════════════\n');
        
        // Récupérer toutes les évaluations (il faudrait un endpoint admin)
        // Pour l'instant, testons avec les IDs connus
        const testIds = [46, 52, 53, 54, 55, 56, 57, 58, 59, 60];
        
        for (const id of testIds) {
            try {
                const response = await fetch(`${API_URL}/evaluations/${id}/full`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.evaluation) {
                        const eval = data.evaluation;
                        
                        // Vérifier si c'est pour ousseynou.seck@senico.sn
                        if (eval.emailN2 === 'ousseynou.seck@senico.sn') {
                            const statusIcon = eval.status === 'draft' ? '📝' : 
                                             eval.status === 'submitted' ? '✅' : '🔒';
                            
                            console.log(`${statusIcon} ID ${id}:`);
                            console.log(`   Évalué: ${eval.evalueNom}`);
                            console.log(`   Email N+2: ${eval.emailN2}`);
                            console.log(`   Status: ${eval.status}`);
                            console.log(`   Créé: ${new Date(eval.createdAt).toLocaleString('fr-FR')}`);
                            console.log('');
                            
                            if (eval.status === 'draft') {
                                console.log('   ⚠️  CETTE ÉVALUATION N\'A PAS ÉTÉ SOUMISE !');
                                console.log(`   🔗 Pour la soumettre, ouvrez:`);
                                console.log(`      http://localhost:3001/formulaire-online.html?id=${id}`);
                                console.log(`   👉 Puis cliquez sur "✅ Soumettre à N+2"\n`);
                            }
                        }
                    }
                }
            } catch (err) {
                // Ignorer les erreurs pour les IDs qui n'existent pas
            }
        }
        
        console.log('═══════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

checkDraftEvaluations();
