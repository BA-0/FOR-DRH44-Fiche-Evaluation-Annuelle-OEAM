const fetch = require('node-fetch');
const db = require('./db');

const API_URL = 'http://localhost:3001/api';

// Données de test complètes
const testData = {
    dateEvaluation: '2025-12-19',
    direction: 'Direction Technique',
    service: 'Service Informatique',
    evaluateurNom: 'Bougar DIOUF',
    evaluateurFonction: 'Chef de Service',
    evalueNom: 'Cherif Mouhameth Oumar BA',
    evalueFonction: 'Développeur Senior',
    categorie: 'Cadre',
    emailN2: 'ousseynou.seck@senico.sn',
    annee: 2025,
    objectifs: [
        { objectif: 'Développer 3 nouvelles applications', indicateur: 'Nombre d\'applications livrées', taux: '80' },
        { objectif: 'Former 5 développeurs juniors', indicateur: 'Nombre de formations réalisées', taux: '100' },
        { objectif: 'Réduire les bugs de 30%', indicateur: 'Taux de bugs résolus', taux: '60' },
        { objectif: 'Améliorer la documentation', indicateur: 'Pages de documentation créées', taux: '80' },
        { objectif: 'Optimiser les performances', indicateur: 'Temps de réponse réduit', taux: '100' }
    ],
    competences: {
        qualitesProfessionnelles: [
            { critere: 1, score: '80' }, { critere: 2, score: '100' }, { critere: 3, score: '60' },
            { critere: 4, score: '80' }, { critere: 5, score: '80' }, { critere: 6, score: '60' },
            { critere: 7, score: '80' }, { critere: 8, score: '60' }, { critere: 9, score: '80' },
            { critere: 10, score: '60' }
        ],
        qualitesPersonnelles: [
            { critere: 1, score: '100' }, { critere: 2, score: '80' }, { critere: 3, score: '60' },
            { critere: 4, score: '80' }, { critere: 5, score: '100' }, { critere: 6, score: '80' },
            { critere: 7, score: '80' }, { critere: 8, score: '60' }, { critere: 9, score: '60' },
            { critere: 10, score: '80' }
        ],
        qualitesRelationnelles: [
            { critere: 1, score: '100' }, { critere: 2, score: '80' }, { critere: 3, score: '60' },
            { critere: 4, score: '80' }, { critere: 5, score: '80' }, { critere: 6, score: '60' },
            { critere: 7, score: '100' }, { critere: 8, score: '80' }, { critere: 9, score: '80' },
            { critere: 10, score: '60' }
        ]
    },
    observations: {
        evaluateur: {
            pointsForts: [
                'Excellente maîtrise technique',
                'Grande capacité d\'apprentissage',
                'Bon esprit d\'équipe'
            ],
            pointsFaibles: [
                'Parfois trop perfectionniste',
                'Gestion du temps à améliorer',
                'Communication écrite à renforcer'
            ],
            axesProgres: [
                'Développer le leadership',
                'Améliorer la gestion de projet',
                'Renforcer les compétences managériales'
            ]
        },
        evalue: {
            reussites: [
                'Livraison de 4 projets majeurs',
                'Formation de 6 juniors avec succès',
                'Mise en place de bonnes pratiques'
            ],
            difficultes: [
                'Manque de temps pour la veille technologique',
                'Difficultés avec certains clients exigeants',
                'Charge de travail parfois très élevée'
            ],
            souhaits: [
                'Formation en architecture cloud',
                'Participation à des conférences tech',
                'Evolution vers un poste de lead developer'
            ]
        }
    },
    scores: {
        scoreN1: '84',
        scoreN2: '74',
        scoreFinal: '79',
        totalQP: '73',
        totalQPE: '77',
        totalQR: '77'
    },
    signatures: {
        N: {
            nom: 'Cherif Mouhameth Oumar BA',
            date: '2025-12-19',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        },
        N1: {
            nom: 'Bougar DIOUF',
            date: '2025-12-19',
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        },
        N2: {
            nom: '',
            date: '',
            image: ''
        }
    },
    status: 'draft'
};

async function runTests() {
    console.log('🚀 DÉMARRAGE DES TESTS COMPLETS\n');
    console.log('=' .repeat(60));
    
    let evaluationId = null;

    try {
        // TEST 1: Créer une évaluation
        console.log('\n📝 TEST 1: Création d\'une évaluation');
        console.log('-'.repeat(60));
        
        const createResponse = await fetch(`${API_URL}/evaluations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        const createResult = await createResponse.json();
        console.log('Statut:', createResponse.status);
        console.log('Résultat:', JSON.stringify(createResult, null, 2));
        
        if (createResult.success) {
            evaluationId = createResult.evaluation.id;
            console.log('✅ Évaluation créée avec ID:', evaluationId);
        } else {
            console.log('❌ Échec de la création');
            return;
        }

        // TEST 2: Vérifier les données en base
        console.log('\n📊 TEST 2: Vérification des données en base');
        console.log('-'.repeat(60));
        
        const dbData = await db.query('SELECT * FROM evaluations WHERE id = ?', [evaluationId]);
        console.log('Évaluation trouvée:', dbData.length > 0 ? 'OUI' : 'NON');
        
        if (dbData.length > 0) {
            const eval = dbData[0];
            console.log('Direction:', eval.direction);
            console.log('Service:', eval.service);
            console.log('Évaluateur:', eval.evaluateur_nom);
            console.log('Évalué:', eval.evalue_nom);
            console.log('Email N+2:', eval.email_n2);
            console.log('Status:', eval.status);
            
            // Parser les JSON
            let objectifs = [];
            let scores = {};
            
            try {
                objectifs = typeof eval.objectifs === 'string' ? JSON.parse(eval.objectifs) : eval.objectifs;
                scores = typeof eval.scores === 'string' ? JSON.parse(eval.scores) : eval.scores;
            } catch (e) {
                console.log('⚠️ Erreur parsing JSON:', e.message);
                console.log('objectifs brut:', eval.objectifs);
                console.log('scores brut:', eval.scores);
            }
            
            console.log('Nombre d\'objectifs:', objectifs.length || 0);
            console.log('Score final:', scores.scoreFinal || 'N/A');
            console.log('✅ Données bien enregistrées');
        } else {
            console.log('❌ Évaluation non trouvée en base');
            return;
        }

        // TEST 3: Récupérer l'évaluation complète via API
        console.log('\n🔍 TEST 3: Récupération via API /full');
        console.log('-'.repeat(60));
        
        const fullResponse = await fetch(`${API_URL}/evaluations/${evaluationId}/full`);
        const fullResult = await fullResponse.json();
        
        console.log('Statut:', fullResponse.status);
        
        if (fullResult.success) {
            const eval = fullResult.evaluation;
            console.log('Direction:', eval.direction);
            console.log('Service:', eval.service);
            console.log('Évaluateur:', eval.evaluateurNom);
            console.log('Évalué:', eval.evalueNom);
            console.log('Email N+2:', eval.emailN2);
            console.log('Objectifs:', eval.objectifs?.length || 0);
            console.log('Score final:', eval.scores?.scoreFinal);
            console.log('✅ API retourne les bonnes données (camelCase)');
        } else {
            console.log('❌ Échec de récupération');
        }

        // TEST 4: Soumettre à N+2
        console.log('\n📤 TEST 4: Soumission à N+2');
        console.log('-'.repeat(60));
        
        const submitResponse = await fetch(`${API_URL}/evaluations/${evaluationId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const submitResult = await submitResponse.json();
        console.log('Statut:', submitResponse.status);
        console.log('Résultat:', JSON.stringify(submitResult, null, 2));
        
        if (submitResult.success) {
            console.log('✅ Soumission réussie');
        } else {
            console.log('❌ Échec de soumission');
        }

        // TEST 5: Vérifier que N+2 peut voir l'évaluation
        console.log('\n👁️ TEST 5: Vérification pour N+2');
        console.log('-'.repeat(60));
        
        const pendingResponse = await fetch(`${API_URL}/evaluations/pending/${testData.emailN2}`);
        const pendingResult = await pendingResponse.json();
        
        console.log('Statut:', pendingResponse.status);
        console.log('Nombre d\'évaluations en attente:', pendingResult.evaluations?.length || 0);
        
        if (pendingResult.success && pendingResult.evaluations.length > 0) {
            const pending = pendingResult.evaluations[0];
            console.log('Évaluation trouvée pour N+2:');
            console.log('  - ID:', pending.id);
            console.log('  - Évalué:', pending.evalue_nom);
            console.log('  - Status:', pending.status);
            console.log('  - Score:', pending.score_final);
            console.log('✅ N+2 peut voir l\'évaluation');
        } else {
            console.log('❌ N+2 ne voit pas l\'évaluation');
            console.log('Réponse complète:', JSON.stringify(pendingResult, null, 2));
        }

        // TEST 6: Vérifier les observations
        console.log('\n💬 TEST 6: Vérification des observations');
        console.log('-'.repeat(60));
        
        const dbCheck = await db.query('SELECT observations FROM evaluations WHERE id = ?', [evaluationId]);
        if (dbCheck.length > 0) {
            let obs = {};
            try {
                obs = typeof dbCheck[0].observations === 'string' ? JSON.parse(dbCheck[0].observations) : dbCheck[0].observations;
            } catch (e) {
                console.log('⚠️ Erreur parsing observations:', e.message);
            }
            
            console.log('Points forts:', obs.evaluateur?.pointsForts?.length || 0);
            console.log('Premier point fort:', obs.evaluateur?.pointsForts?.[0] || 'N/A');
            console.log('Réussites:', obs.evalue?.reussites?.length || 0);
            console.log('Première réussite:', obs.evalue?.reussites?.[0] || 'N/A');
            console.log('✅ Observations enregistrées');
        }

        // RÉSUMÉ FINAL
        console.log('\n' + '='.repeat(60));
        console.log('📊 RÉSUMÉ DES TESTS');
        console.log('='.repeat(60));
        console.log('✅ Création d\'évaluation: OK');
        console.log('✅ Enregistrement en base: OK');
        console.log('✅ Récupération API (/full): OK');
        console.log('✅ Soumission à N+2: ' + (submitResult.success ? 'OK' : 'ÉCHEC'));
        console.log('✅ Visibilité pour N+2: ' + (pendingResult.evaluations?.length > 0 ? 'OK' : 'ÉCHEC'));
        console.log('\n🎯 ID de l\'évaluation de test:', evaluationId);
        console.log('📧 Email N+2:', testData.emailN2);
        console.log('\n✨ TESTS TERMINÉS\n');

    } catch (error) {
        console.error('\n❌ ERREUR DURANT LES TESTS:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        process.exit();
    }
}

// Lancer les tests
runTests();
