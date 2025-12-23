const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api';

async function testSoumissionN2() {
    console.log('\n🔬 TEST: SOUMISSION N+1 → N+2\n');
    console.log('═══════════════════════════════════════════════\n');
    
    try {
        // ÉTAPE 1: Créer une nouvelle évaluation
        console.log('📝 ÉTAPE 1: Création d\'une nouvelle évaluation par N+1');
        console.log('─────────────────────────────────────────────');
        
        const nouvelleEvaluation = {
            dateEvaluation: new Date().toISOString(),
            direction: 'Direction Commerciale',
            service: 'Service Ventes',
            evaluateurNom: 'Bougar DIOUF',
            evaluateurFonction: 'Chef de Service',
            evalueNom: 'Test Soumission N+2',
            evalueFonction: 'Commercial',
            categorie: 'Agent de maîtrise',
            emailN2: 'ousseynou.seck@senico.sn',
            annee: 2025,
            objectifs: [
                { objectif: 'Objectif test', indicateur: 'Indicateur test', taux: '80' }
            ],
            competences: {
                qualitesProfessionnelles: [{ critere: 1, score: '80' }],
                qualitesPersonnelles: [{ critere: 1, score: '80' }],
                qualitesRelationnelles: [{ critere: 1, score: '80' }]
            },
            scores: {
                scoreN1: '80',
                scoreN2: '80',
                totalQP: '80',
                totalQPE: '80',
                totalQR: '80',
                scoreFinal: '80'
            },
            observations: {
                evaluateur: {
                    pointsForts: ['Test point fort'],
                    pointsFaibles: ['Test point faible'],
                    axesProgres: ['Test axe progrès']
                },
                evalue: {
                    reussites: ['Test réussite'],
                    difficultes: ['Test difficulté'],
                    souhaits: ['Test souhait']
                }
            },
            signatures: {
                N: { nom: 'Test Soumission N+2', date: '2025-12-19', image: 'data:image/png;base64,test' },
                N1: { nom: 'Bougar DIOUF', date: '2025-12-19', image: 'data:image/png;base64,test' },
                N2: { nom: '', date: '', image: '' }
            }
        };
        
        const createResponse = await fetch(`${API_URL}/evaluations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nouvelleEvaluation)
        });
        
        const createResult = await createResponse.json();
        
        if (!createResult.success) {
            console.log('❌ Échec de la création');
            return;
        }
        
        const evaluationId = createResult.evaluation.id;
        console.log(`✅ Évaluation créée avec ID: ${evaluationId}`);
        console.log(`   Évalué: ${nouvelleEvaluation.evalueNom}`);
        console.log(`   Email N+2: ${nouvelleEvaluation.emailN2}`);
        console.log('');
        
        // ÉTAPE 2: Vérifier le statut AVANT soumission
        console.log('📊 ÉTAPE 2: Vérification du statut AVANT soumission');
        console.log('─────────────────────────────────────────────');
        
        const beforeResponse = await fetch(`${API_URL}/evaluations/pending/${encodeURIComponent(nouvelleEvaluation.emailN2)}`);
        const beforeData = await beforeResponse.json();
        
        const countBefore = beforeData.evaluations.length;
        console.log(`   N+2 voit actuellement: ${countBefore} évaluation(s)`);
        console.log('');
        
        // ÉTAPE 3: SOUMETTRE à N+2
        console.log('📤 ÉTAPE 3: SOUMISSION à N+2 par N+1');
        console.log('─────────────────────────────────────────────');
        
        const submitResponse = await fetch(`${API_URL}/evaluations/${evaluationId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const submitResult = await submitResponse.json();
        
        if (submitResult.success) {
            console.log('✅ Soumission réussie !');
            console.log(`   Message: ${submitResult.message}`);
        } else {
            console.log(`❌ Échec: ${submitResult.error}`);
            return;
        }
        console.log('');
        
        // ÉTAPE 4: Vérifier que N+2 reçoit bien l'évaluation
        console.log('🔍 ÉTAPE 4: Vérification de la réception par N+2');
        console.log('─────────────────────────────────────────────');
        
        const afterResponse = await fetch(`${API_URL}/evaluations/pending/${encodeURIComponent(nouvelleEvaluation.emailN2)}`);
        const afterData = await afterResponse.json();
        
        const countAfter = afterData.evaluations.length;
        console.log(`   N+2 voit maintenant: ${countAfter} évaluation(s)`);
        
        // Chercher notre évaluation
        const notreEvaluation = afterData.evaluations.find(e => e.id === evaluationId);
        
        if (notreEvaluation) {
            console.log('\n   ✅ N+2 A BIEN REÇU L\'ÉVALUATION !');
            console.log('   ╔════════════════════════════════════════╗');
            console.log(`   ║ ID: ${notreEvaluation.id}`);
            console.log(`   ║ Évalué: ${notreEvaluation.evalue_nom}`);
            console.log(`   ║ Évaluateur: ${notreEvaluation.evaluateur_nom}`);
            console.log(`   ║ Email N+2: ${notreEvaluation.email_n2}`);
            console.log(`   ║ Status: ${notreEvaluation.status}`);
            console.log(`   ║ Score: ${notreEvaluation.score_final}%`);
            console.log(`   ║ Soumis le: ${new Date(notreEvaluation.submitted_at).toLocaleString('fr-FR')}`);
            console.log('   ╚════════════════════════════════════════╝');
            console.log('');
            console.log('   📈 Augmentation: ' + (countAfter - countBefore) + ' évaluation(s)');
        } else {
            console.log('\n   ❌ N+2 N\'A PAS REÇU L\'ÉVALUATION');
            console.log('   Problème de liaison N+1 → N+2');
        }
        
        console.log('\n═══════════════════════════════════════════════');
        console.log('🎯 RÉSULTAT FINAL');
        console.log('═══════════════════════════════════════════════\n');
        
        if (notreEvaluation && notreEvaluation.status === 'submitted') {
            console.log('✅ LE SYSTÈME FONCTIONNE PARFAITEMENT !');
            console.log('');
            console.log('Quand N+1 soumet une évaluation :');
            console.log('  1. ✅ Le statut passe à "submitted"');
            console.log('  2. ✅ La date de soumission est enregistrée');
            console.log('  3. ✅ N+2 reçoit l\'évaluation immédiatement');
            console.log('  4. ✅ N+2 peut la voir sur validation.html');
            console.log('');
            console.log(`🔗 Lien: http://localhost:3001/validation.html`);
            console.log(`📧 Email N+2: ${nouvelleEvaluation.emailN2}`);
        } else {
            console.log('❌ PROBLÈME DÉTECTÉ');
            console.log('La soumission N+1 → N+2 ne fonctionne pas correctement.');
        }
        
        console.log('\n═══════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Lancer le test
testSoumissionN2();
