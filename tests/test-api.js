// Script de test complet de l'API
const API_URL = 'http://localhost:3001/api';

// Données de test pour une évaluation complète
const evaluationTest = {
    dateEvaluation: '2025-12-19',
    direction: 'Direction des Systèmes d\'Information',
    service: 'Développement',
    evaluateurNom: 'Bougar DIOUF',
    evaluateurFonction: 'Chef de Service',
    evalueNom: 'Mamadou DIALLO',
    evalueFonction: 'Développeur Senior',
    categorie: 'A',
    emailN2: 'ousseynou.seck@senico.sn',
    annee: 2025,
    objectifs: [
        { objectif: 'Développer le module de gestion', indicateur: 'Livraison dans les délais', taux: '100' },
        { objectif: 'Former 2 juniors', indicateur: 'Nombre de formations', taux: '80' },
        { objectif: 'Optimiser les performances', indicateur: 'Temps de réponse -30%', taux: '100' },
        { objectif: 'Documentation technique', indicateur: 'Pages documentées', taux: '90' },
        { objectif: 'Veille technologique', indicateur: 'Présentations mensuelles', taux: '85' }
    ],
    competences: {
        qualitesProfessionnelles: [
            { critere: 1, score: '100' }, { critere: 2, score: '90' },
            { critere: 3, score: '95' }, { critere: 4, score: '100' },
            { critere: 5, score: '90' }, { critere: 6, score: '95' },
            { critere: 7, score: '85' }, { critere: 8, score: '90' },
            { critere: 9, score: '95' }, { critere: 10, score: '90' }
        ],
        qualitesPersonnelles: [
            { critere: 1, score: '100' }, { critere: 2, score: '100' },
            { critere: 3, score: '80' }, { critere: 4, score: '90' },
            { critere: 5, score: '95' }, { critere: 6, score: '90' },
            { critere: 7, score: '85' }, { critere: 8, score: '90' },
            { critere: 9, score: '80' }, { critere: 10, score: '90' }
        ],
        qualitesRelationnelles: [
            { critere: 1, score: '100' }, { critere: 2, score: '95' },
            { critere: 3, score: '90' }, { critere: 4, score: '95' },
            { critere: 5, score: '90' }, { critere: 6, score: '85' },
            { critere: 7, score: '95' }, { critere: 8, score: '100' },
            { critere: 9, score: '95' }, { critere: 10, score: '90' }
        ]
    },
    scores: {
        scoreObjectifs: 91,
        scoreQualitesPro: 93,
        scoreQualitesPerso: 90,
        scoreQualitesRel: 93.5,
        scoreCompetences: 92.17,
        scoreFinal: 91.58
    },
    observations: {
        evaluateurPointsForts: [
            'Excellente maîtrise technique',
            'Grande autonomie',
            'Esprit d\'initiative remarquable'
        ],
        evaluateurPointsFaibles: [
            'Peut améliorer la gestion du temps',
            'Documentation parfois incomplète'
        ],
        evaluateurAxesProgres: [
            'Formation en management',
            'Certification technique avancée'
        ],
        evalueReussites: [
            'Projet livré en avance',
            'Formation de 3 juniors',
            'Optimisation réussie'
        ],
        evalueDifficultés: [
            'Manque d\'outils',
            'Charge de travail élevée'
        ],
        evalueSouhaits: [
            'Formation certifiante',
            'Plus d\'autonomie',
            'Projet international'
        ]
    },
    signatures: {
        N: {
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            nom: 'Mamadou DIALLO',
            date: '2025-12-19'
        },
        N1: {
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            nom: 'Bougar DIOUF',
            date: '2025-12-19'
        }
    },
    status: 'draft'
};

async function test() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║          TEST COMPLET DU SYSTÈME D\'ÉVALUATION                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    let evaluationId = null;

    // ============================================
    // TEST 1 : Connexion N+1 (Évaluateur)
    // ============================================
    console.log('📝 TEST 1 : Connexion N+1 (Évaluateur)');
    console.log('─'.repeat(60));
    try {
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'evaluateur',
                password: 'eval123',
                role: 'N1'
            })
        });
        const loginResult = await loginResponse.json();
        
        if (loginResult.token) {
            console.log('✅ Connexion réussie');
            console.log(`   Utilisateur: ${loginResult.userName}`);
            console.log(`   Email: ${loginResult.email}`);
            console.log(`   Rôle: ${loginResult.role}`);
        } else {
            console.log('❌ Échec de connexion:', loginResult.error);
            return;
        }
    } catch (error) {
        console.log('❌ Erreur de connexion:', error.message);
        return;
    }
    console.log('');

    // ============================================
    // TEST 2 : Création d'une évaluation (brouillon)
    // ============================================
    console.log('📝 TEST 2 : Création d\'une évaluation (brouillon)');
    console.log('─'.repeat(60));
    try {
        const createResponse = await fetch(`${API_URL}/evaluations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evaluationTest)
        });
        const createResult = await createResponse.json();
        
        if (createResult.success && createResult.evaluation) {
            evaluationId = createResult.evaluation.id;
            console.log('✅ Évaluation créée avec succès');
            console.log(`   ID: ${evaluationId}`);
            console.log(`   Évalué: ${evaluationTest.evalueNom}`);
            console.log(`   Direction: ${evaluationTest.direction}`);
            console.log(`   Score final: ${evaluationTest.scores.scoreFinal}%`);
        } else {
            console.log('❌ Échec de création:', createResult.error);
            return;
        }
    } catch (error) {
        console.log('❌ Erreur de création:', error.message);
        return;
    }
    console.log('');

    // ============================================
    // TEST 3 : Récupération de l'évaluation complète
    // ============================================
    console.log('📝 TEST 3 : Récupération de l\'évaluation complète');
    console.log('─'.repeat(60));
    try {
        const getResponse = await fetch(`${API_URL}/evaluations/${evaluationId}/full`);
        const getResult = await getResponse.json();
        
        if (getResult.success && getResult.evaluation) {
            console.log('✅ Évaluation récupérée avec succès');
            console.log(`   Objectifs: ${getResult.evaluation.objectifs.length} items`);
            console.log(`   Compétences professionnelles: ${getResult.evaluation.competences.qualitesProfessionnelles.length} critères`);
            console.log(`   Signatures: N=${!!getResult.evaluation.signatures.N}, N1=${!!getResult.evaluation.signatures.N1}`);
            console.log(`   Statut: ${getResult.evaluation.status}`);
        } else {
            console.log('❌ Échec de récupération:', getResult.error);
        }
    } catch (error) {
        console.log('❌ Erreur de récupération:', error.message);
    }
    console.log('');

    // ============================================
    // TEST 4 : Soumission à N+2
    // ============================================
    console.log('📝 TEST 4 : Soumission de l\'évaluation à N+2');
    console.log('─'.repeat(60));
    try {
        const submitResponse = await fetch(`${API_URL}/evaluations/${evaluationId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 1 })
        });
        const submitResult = await submitResponse.json();
        
        if (submitResult.success) {
            console.log('✅ Évaluation soumise avec succès');
            console.log(`   Message: ${submitResult.message}`);
            console.log(`   Email N+2: ${evaluationTest.emailN2}`);
        } else {
            console.log('❌ Échec de soumission:', submitResult.error);
            return;
        }
    } catch (error) {
        console.log('❌ Erreur de soumission:', error.message);
        return;
    }
    console.log('');

    // Attendre 1 seconde pour que la BD soit à jour
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ============================================
    // TEST 5 : Connexion N+2 (Validateur)
    // ============================================
    console.log('📝 TEST 5 : Connexion N+2 (Validateur)');
    console.log('─'.repeat(60));
    try {
        const loginN2Response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'ousseynou.seck',
                password: 'valid123',
                role: 'N2'
            })
        });
        const loginN2Result = await loginN2Response.json();
        
        if (loginN2Result.token) {
            console.log('✅ Connexion N+2 réussie');
            console.log(`   Utilisateur: ${loginN2Result.userName}`);
            console.log(`   Email: ${loginN2Result.email}`);
            console.log(`   Rôle: ${loginN2Result.role}`);
        } else {
            console.log('❌ Échec de connexion N+2:', loginN2Result.error);
            return;
        }
    } catch (error) {
        console.log('❌ Erreur de connexion N+2:', error.message);
        return;
    }
    console.log('');

    // ============================================
    // TEST 6 : Récupération des évaluations en attente
    // ============================================
    console.log('📝 TEST 6 : Récupération des évaluations en attente pour N+2');
    console.log('─'.repeat(60));
    try {
        const pendingResponse = await fetch(`${API_URL}/evaluations/pending/${encodeURIComponent(evaluationTest.emailN2)}`);
        const pendingResult = await pendingResponse.json();
        
        if (pendingResult.success) {
            console.log('✅ Évaluations en attente récupérées');
            console.log(`   Nombre d'évaluations: ${pendingResult.evaluations.length}`);
            
            if (pendingResult.evaluations.length > 0) {
                const eval1 = pendingResult.evaluations[0];
                console.log(`\n   📋 Détails de la première évaluation:`);
                console.log(`      ID: ${eval1.id}`);
                console.log(`      Évalué: ${eval1.evalue_nom}`);
                console.log(`      Évaluateur: ${eval1.evaluateur_nom}`);
                console.log(`      Direction: ${eval1.direction}`);
                console.log(`      Service: ${eval1.service}`);
                console.log(`      Année: ${eval1.annee}`);
                console.log(`      Statut: ${eval1.status}`);
                console.log(`      Date de soumission: ${eval1.submitted_at}`);
            } else {
                console.log('   ⚠️  Aucune évaluation en attente (vérifiez que la soumission a fonctionné)');
            }
        } else {
            console.log('❌ Échec de récupération:', pendingResult.error);
        }
    } catch (error) {
        console.log('❌ Erreur de récupération:', error.message);
    }
    console.log('');

    // ============================================
    // RÉSUMÉ FINAL
    // ============================================
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                      RÉSUMÉ DES TESTS                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log('✅ Tests réussis:');
    console.log('   1. Connexion N+1 (évaluateur)');
    console.log('   2. Création d\'évaluation');
    console.log('   3. Récupération évaluation complète');
    console.log('   4. Soumission à N+2');
    console.log('   5. Connexion N+2 (validateur)');
    console.log('   6. Liste des évaluations en attente\n');
    
    console.log('📊 Données de test:');
    console.log(`   ID de l'évaluation: ${evaluationId}`);
    console.log(`   Évalué: ${evaluationTest.evalueNom}`);
    console.log(`   Évaluateur: ${evaluationTest.evaluateurNom}`);
    console.log(`   Email N+2: ${evaluationTest.emailN2}`);
    console.log(`   Score final: ${evaluationTest.scores.scoreFinal}%\n`);
    
    console.log('🌐 URLs de test:');
    console.log(`   Formulaire N+1: http://localhost:3001/formulaire-online.html?id=${evaluationId}`);
    console.log(`   Validation N+2: http://localhost:3001/validation.html\n`);
}

// Exécuter les tests
test().catch(error => {
    console.error('\n❌ ERREUR GLOBALE:', error.message);
    process.exit(1);
});
