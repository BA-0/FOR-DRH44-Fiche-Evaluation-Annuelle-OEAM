/**
 * 🧪 SCRIPT DE TEST COMPLET - FORMULAIRE ÉVALUATION
 * Tests automatisés de toutes les fonctionnalités
 */

const fetch = require('node-fetch');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';
let testResults = [];
let testsPassed = 0;
let testsFailed = 0;

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function addResult(category, test, passed, details = '') {
    testResults.push({ category, test, passed, details });
    if (passed) {
        testsPassed++;
        log(`  ✅ ${test}`, 'green');
    } else {
        testsFailed++;
        log(`  ❌ ${test}`, 'red');
        if (details) log(`     ${details}`, 'yellow');
    }
}

// Fonction pour faire une pause
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// TEST 1: CONNEXION API
// ============================================================
async function testConnexionAPI() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('🔐 TEST 1: AUTHENTIFICATION', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    // Test 1.1: Connexion N+1 valide
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'awa.ndiaye', password: 'test123' })
        });
        const data = await response.json();
        addResult('Authentification', 'Connexion N+1 (awa.ndiaye)', 
            data.success && data.user.role === 'N1',
            data.success ? `User ID: ${data.user.id}` : data.error);
    } catch (error) {
        addResult('Authentification', 'Connexion N+1 (awa.ndiaye)', false, error.message);
    }

    // Test 1.2: Connexion N+2 valide
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'mamadou.fall', password: 'test123' })
        });
        const data = await response.json();
        addResult('Authentification', 'Connexion N+2 (mamadou.fall)', 
            data.success && data.user.role === 'N2',
            data.success ? `User ID: ${data.user.id}` : data.error);
    } catch (error) {
        addResult('Authentification', 'Connexion N+2 (mamadou.fall)', false, error.message);
    }

    // Test 1.3: Connexion avec mauvais mot de passe
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'awa.ndiaye', password: 'wrongpassword' })
        });
        const data = await response.json();
        addResult('Authentification', 'Rejet mot de passe incorrect', 
            !data.success,
            data.success ? 'Erreur: connexion réussie avec mauvais password' : 'OK: accès refusé');
    } catch (error) {
        addResult('Authentification', 'Rejet mot de passe incorrect', false, error.message);
    }

    // Test 1.4: Connexion utilisateur inexistant
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'user_inexistant', password: 'test123' })
        });
        const data = await response.json();
        addResult('Authentification', 'Rejet utilisateur inexistant', 
            !data.success,
            data.success ? 'Erreur: utilisateur inexistant accepté' : 'OK: utilisateur non trouvé');
    } catch (error) {
        addResult('Authentification', 'Rejet utilisateur inexistant', false, error.message);
    }

    // Test 1.5: Tous les autres comptes
    const accounts = [
        { username: 'ibrahima.sarr', role: 'N1' },
        { username: 'aminata.ba', role: 'N1' },
        { username: 'moussa.gueye', role: 'N1' },
        { username: 'fatou.diagne', role: 'N2' },
        { username: 'ousseynou.seck', role: 'N2' }
    ];

    for (const account of accounts) {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: account.username, password: 'test123' })
            });
            const data = await response.json();
            addResult('Authentification', `Connexion ${account.username} (${account.role})`, 
                data.success && data.user.role === account.role);
        } catch (error) {
            addResult('Authentification', `Connexion ${account.username}`, false, error.message);
        }
    }
}

// ============================================================
// TEST 2: RÉCUPÉRATION DES ÉVALUATIONS
// ============================================================
async function testRecuperationEvaluations() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('📊 TEST 2: RÉCUPÉRATION DES ÉVALUATIONS', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    // Test 2.1: Liste des évaluations pour N+1 (evaluateur_id = 4 = awa.ndiaye)
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/user/4`);
        const data = await response.json();
        addResult('Récupération', 'Liste évaluations N+1 (awa.ndiaye)', 
            data.success && Array.isArray(data.evaluations),
            `${data.evaluations?.length || 0} évaluations trouvées`);
    } catch (error) {
        addResult('Récupération', 'Liste évaluations N+1', false, error.message);
    }

    // Test 2.2: Détails évaluation complète (ID 1)
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/1/full`);
        const data = await response.json();
        addResult('Récupération', 'Détails complets évaluation #1', 
            data.success && data.evaluation && data.evaluation.id === 1,
            data.success ? `Agent: ${data.evaluation.prenom_agent} ${data.evaluation.nom_agent}` : data.error);
    } catch (error) {
        addResult('Récupération', 'Détails complets évaluation #1', false, error.message);
    }

    // Test 2.3: Vérification parsing JSON des objectifs
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/1/full`);
        const data = await response.json();
        const hasObjectifs = data.success && 
                           data.evaluation.objectifs && 
                           Array.isArray(data.evaluation.objectifs.objectifs);
        addResult('Récupération', 'Parsing JSON objectifs', 
            hasObjectifs,
            hasObjectifs ? `${data.evaluation.objectifs.objectifs.length} objectifs` : 'Erreur parsing');
    } catch (error) {
        addResult('Récupération', 'Parsing JSON objectifs', false, error.message);
    }

    // Test 2.4: Vérification parsing JSON des compétences
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/1/full`);
        const data = await response.json();
        const hasCompetences = data.success && 
                              data.evaluation.competences && 
                              Array.isArray(data.evaluation.competences.competences);
        addResult('Récupération', 'Parsing JSON compétences', 
            hasCompetences,
            hasCompetences ? `${data.evaluation.competences.competences.length} compétences` : 'Erreur parsing');
    } catch (error) {
        addResult('Récupération', 'Parsing JSON compétences', false, error.message);
    }

    // Test 2.5: Évaluations en attente de validation (statut soumis_n1)
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/pending`);
        const data = await response.json();
        addResult('Récupération', 'Évaluations en attente validation', 
            data.success && Array.isArray(data.evaluations),
            `${data.evaluations?.length || 0} évaluations en attente`);
    } catch (error) {
        addResult('Récupération', 'Évaluations en attente', false, error.message);
    }

    // Test 2.6: Recherche par email pour validation N+2
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/search?email=thiam`);
        const data = await response.json();
        addResult('Récupération', 'Recherche par email (thiam)', 
            data.success,
            `${data.evaluations?.length || 0} résultats`);
    } catch (error) {
        addResult('Récupération', 'Recherche par email', false, error.message);
    }
}

// ============================================================
// TEST 3: CRÉATION D'ÉVALUATION
// ============================================================
async function testCreationEvaluation() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('📝 TEST 3: CRÉATION D\'ÉVALUATION', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    const newEvaluation = {
        evaluateur_id: 4, // awa.ndiaye
        annee: 2024,
        periode: 'Annuelle',
        nom_agent: 'TEST',
        prenom_agent: 'Utilisateur',
        poste_agent: 'Testeur QA',
        direction_agent: 'Direction Qualité',
        nom_evaluateur: 'NDIAYE',
        prenom_evaluateur: 'Awa',
        poste_evaluateur: 'Chef de Projet IT',
        objectifs: JSON.stringify({
            objectifs: [
                {
                    description: 'Tester toutes les fonctionnalités',
                    poids: '50',
                    resultat: '95',
                    commentaire: 'Excellent travail de test'
                },
                {
                    description: 'Documenter les bugs trouvés',
                    poids: '50',
                    resultat: '90',
                    commentaire: 'Documentation complète'
                }
            ]
        }),
        competences: JSON.stringify({
            competences: [
                { nom: 'Rigueur', note: '5', commentaire: 'Très rigoureux' },
                { nom: 'Analyse', note: '4', commentaire: 'Bonne capacité d\'analyse' }
            ]
        }),
        scores: JSON.stringify({
            scoreObjectifs: '92',
            scoreCompetences: '90',
            scoreGlobal: '91'
        }),
        observations: JSON.stringify({
            evaluateur: 'Test créé automatiquement',
            agent: 'Merci pour cette évaluation'
        })
    };

    try {
        const response = await fetch(`${BASE_URL}/api/evaluations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvaluation)
        });
        const data = await response.json();
        
        if (data.success && data.evaluation) {
            global.testEvaluationId = data.evaluation.id;
            addResult('Création', 'Nouvelle évaluation (POST /api/evaluations)', 
                true,
                `ID: ${data.evaluation.id} - Statut: ${data.evaluation.statut}`);
        } else {
            addResult('Création', 'Nouvelle évaluation', false, data.error || 'Pas d\'ID retourné');
        }
    } catch (error) {
        addResult('Création', 'Nouvelle évaluation', false, error.message);
    }

    // Test 3.2: Vérifier que l'évaluation a bien été créée en draft
    if (global.testEvaluationId) {
        await wait(500);
        try {
            const response = await fetch(`${BASE_URL}/api/evaluations/${global.testEvaluationId}/full`);
            const data = await response.json();
            addResult('Création', 'Vérification statut draft', 
                data.success && data.evaluation.statut === 'draft',
                `Statut: ${data.evaluation?.statut || 'inconnu'}`);
        } catch (error) {
            addResult('Création', 'Vérification statut draft', false, error.message);
        }
    }
}

// ============================================================
// TEST 4: MODIFICATION D'ÉVALUATION
// ============================================================
async function testModificationEvaluation() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('✏️ TEST 4: MODIFICATION D\'ÉVALUATION', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    if (!global.testEvaluationId) {
        addResult('Modification', 'Modification évaluation', false, 'Pas d\'évaluation test créée');
        return;
    }

    const updatedData = {
        observations: JSON.stringify({
            evaluateur: 'Test modifié automatiquement',
            agent: 'Commentaire mis à jour'
        })
    };

    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/${global.testEvaluationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        const data = await response.json();
        addResult('Modification', 'Mise à jour évaluation (PUT)', 
            data.success,
            data.success ? 'Modifications enregistrées' : data.error);
    } catch (error) {
        addResult('Modification', 'Mise à jour évaluation', false, error.message);
    }

    // Vérifier la modification
    await wait(500);
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/${global.testEvaluationId}/full`);
        const data = await response.json();
        const observations = data.evaluation?.observations;
        const isModified = observations?.evaluateur === 'Test modifié automatiquement';
        addResult('Modification', 'Vérification modification appliquée', 
            isModified,
            isModified ? 'Observations mises à jour' : 'Modifications non trouvées');
    } catch (error) {
        addResult('Modification', 'Vérification modification', false, error.message);
    }
}

// ============================================================
// TEST 5: SOUMISSION À N+2
// ============================================================
async function testSoumissionN2() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('✅ TEST 5: SOUMISSION À N+2', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    if (!global.testEvaluationId) {
        addResult('Soumission', 'Soumission à N+2', false, 'Pas d\'évaluation test');
        return;
    }

    const submissionData = {
        user_id: 4, // awa.ndiaye
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };

    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/${global.testEvaluationId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData)
        });
        const data = await response.json();
        addResult('Soumission', 'Soumission à N+2 (POST /submit)', 
            data.success,
            data.success ? data.message : data.error);
    } catch (error) {
        addResult('Soumission', 'Soumission à N+2', false, error.message);
    }

    // Vérifier le changement de statut
    await wait(500);
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/${global.testEvaluationId}/full`);
        const data = await response.json();
        addResult('Soumission', 'Vérification statut soumis_n1', 
            data.success && data.evaluation.statut === 'soumis_n1',
            `Statut: ${data.evaluation?.statut || 'inconnu'}`);
    } catch (error) {
        addResult('Soumission', 'Vérification statut', false, error.message);
    }

    // Vérifier la signature N+1
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/${global.testEvaluationId}/full`);
        const data = await response.json();
        const hasSignature = data.evaluation?.signatures?.n1;
        addResult('Soumission', 'Vérification signature N+1', 
            hasSignature,
            hasSignature ? 'Signature enregistrée' : 'Signature manquante');
    } catch (error) {
        addResult('Soumission', 'Vérification signature', false, error.message);
    }
}

// ============================================================
// TEST 6: VALIDATION PAR N+2
// ============================================================
async function testValidationN2() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('🎉 TEST 6: VALIDATION PAR N+2', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    if (!global.testEvaluationId) {
        addResult('Validation', 'Validation N+2', false, 'Pas d\'évaluation test');
        return;
    }

    const validationData = {
        user_id: 1, // mamadou.fall
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };

    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/${global.testEvaluationId}/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validationData)
        });
        const data = await response.json();
        addResult('Validation', 'Validation N+2 (POST /validate)', 
            data.success,
            data.success ? data.message : data.error);
    } catch (error) {
        addResult('Validation', 'Validation N+2', false, error.message);
    }

    // Vérifier le statut final
    await wait(500);
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/${global.testEvaluationId}/full`);
        const data = await response.json();
        addResult('Validation', 'Vérification statut valide_n2', 
            data.success && data.evaluation.statut === 'valide_n2',
            `Statut final: ${data.evaluation?.statut || 'inconnu'}`);
    } catch (error) {
        addResult('Validation', 'Vérification statut final', false, error.message);
    }

    // Vérifier la signature N+2
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/${global.testEvaluationId}/full`);
        const data = await response.json();
        const hasSignatureN2 = data.evaluation?.signatures?.n2;
        addResult('Validation', 'Vérification signature N+2', 
            hasSignatureN2,
            hasSignatureN2 ? 'Signature N+2 enregistrée' : 'Signature N+2 manquante');
    } catch (error) {
        addResult('Validation', 'Vérification signature N+2', false, error.message);
    }
}

// ============================================================
// TEST 7: ÉVALUATIONS EXISTANTES
// ============================================================
async function testEvaluationsExistantes() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('📋 TEST 7: ÉVALUATIONS EXISTANTES', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    const evaluations = [
        { id: 1, nom: 'Cheikh THIAM', statut: 'draft' },
        { id: 2, nom: 'Mariama DIALLO', statut: 'soumis_n1' },
        { id: 3, nom: 'Amadou SOW', statut: 'valide_n2' },
        { id: 4, nom: 'Aissatou CISSE', statut: 'draft' },
        { id: 5, nom: 'Ousmane KANE', statut: 'soumis_n1' }
    ];

    for (const eval of evaluations) {
        try {
            const response = await fetch(`${BASE_URL}/api/evaluations/${eval.id}/full`);
            const data = await response.json();
            const isCorrect = data.success && 
                            data.evaluation.statut === eval.statut &&
                            data.evaluation.nom_agent === eval.nom.split(' ')[1];
            addResult('Évaluations', `Évaluation #${eval.id} - ${eval.nom}`, 
                isCorrect,
                isCorrect ? `Statut: ${eval.statut}` : 'Données incorrectes');
        } catch (error) {
            addResult('Évaluations', `Évaluation #${eval.id}`, false, error.message);
        }
    }
}

// ============================================================
// TEST 8: WORKFLOW COMPLET
// ============================================================
async function testWorkflowComplet() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('🔄 TEST 8: WORKFLOW COMPLET (DRAFT → SOUMIS → VALIDÉ)', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    // Vérifier le workflow sur l'évaluation #1 (draft)
    try {
        // Étape 1: Vérifier que c'est en draft
        let response = await fetch(`${BASE_URL}/api/evaluations/1/full`);
        let data = await response.json();
        const isDraft = data.success && data.evaluation.statut === 'draft';
        addResult('Workflow', 'État initial: draft', isDraft);

        if (isDraft) {
            // Étape 2: Soumettre à N+2
            response = await fetch(`${BASE_URL}/api/evaluations/1/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 4,
                    signature: 'data:image/png;base64,test'
                })
            });
            data = await response.json();
            addResult('Workflow', 'Transition draft → soumis_n1', data.success);

            await wait(500);

            // Étape 3: Vérifier le nouveau statut
            response = await fetch(`${BASE_URL}/api/evaluations/1/full`);
            data = await response.json();
            const isSoumis = data.success && data.evaluation.statut === 'soumis_n1';
            addResult('Workflow', 'Vérification: soumis_n1', isSoumis);

            if (isSoumis) {
                // Étape 4: Valider par N+2
                response = await fetch(`${BASE_URL}/api/evaluations/1/validate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: 1,
                        signature: 'data:image/png;base64,test'
                    })
                });
                data = await response.json();
                addResult('Workflow', 'Transition soumis_n1 → valide_n2', data.success);

                await wait(500);

                // Étape 5: Vérifier le statut final
                response = await fetch(`${BASE_URL}/api/evaluations/1/full`);
                data = await response.json();
                const isValide = data.success && data.evaluation.statut === 'valide_n2';
                addResult('Workflow', 'État final: valide_n2', isValide);
            }
        }
    } catch (error) {
        addResult('Workflow', 'Workflow complet', false, error.message);
    }
}

// ============================================================
// TEST 9: SÉCURITÉ ET VALIDATION
// ============================================================
async function testSecurite() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('🔒 TEST 9: SÉCURITÉ ET VALIDATION', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    // Test 9.1: Empêcher double soumission
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/2/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 5, signature: 'test' })
        });
        const data = await response.json();
        addResult('Sécurité', 'Empêcher double soumission', 
            !data.success,
            data.success ? 'ERREUR: double soumission autorisée' : 'OK: soumission bloquée');
    } catch (error) {
        addResult('Sécurité', 'Empêcher double soumission', false, error.message);
    }

    // Test 9.2: Empêcher validation sans soumission
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/4/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 1, signature: 'test' })
        });
        const data = await response.json();
        addResult('Sécurité', 'Empêcher validation sans soumission', 
            !data.success,
            data.success ? 'ERREUR: validation autorisée' : 'OK: validation bloquée');
    } catch (error) {
        addResult('Sécurité', 'Empêcher validation sans soumission', false, error.message);
    }

    // Test 9.3: Requête avec ID invalide
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/99999/full`);
        const data = await response.json();
        addResult('Sécurité', 'Gestion ID invalide', 
            !data.success,
            data.success ? 'ERREUR: ID invalide accepté' : 'OK: erreur retournée');
    } catch (error) {
        addResult('Sécurité', 'Gestion ID invalide', false, error.message);
    }

    // Test 9.4: Données JSON malformées
    try {
        const response = await fetch(`${BASE_URL}/api/evaluations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: 'invalid json'
        });
        const status = response.status;
        addResult('Sécurité', 'Rejet JSON malformé', 
            status >= 400,
            `Status: ${status}`);
    } catch (error) {
        addResult('Sécurité', 'Rejet JSON malformé', true, 'Erreur capturée correctement');
    }
}

// ============================================================
// GÉNÉRATION DU RAPPORT
// ============================================================
function generateReport() {
    log('\n', 'reset');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'magenta');
    log('📊 RAPPORT FINAL DES TESTS', 'magenta');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'magenta');
    log('', 'reset');

    const totalTests = testsPassed + testsFailed;
    const percentage = ((testsPassed / totalTests) * 100).toFixed(1);

    log(`Total des tests: ${totalTests}`, 'blue');
    log(`✅ Tests réussis: ${testsPassed}`, 'green');
    log(`❌ Tests échoués: ${testsFailed}`, 'red');
    log(`📈 Taux de réussite: ${percentage}%`, percentage >= 90 ? 'green' : 'yellow');
    log('', 'reset');

    // Grouper par catégorie
    const byCategory = {};
    testResults.forEach(result => {
        if (!byCategory[result.category]) {
            byCategory[result.category] = { passed: 0, failed: 0, tests: [] };
        }
        byCategory[result.category].tests.push(result);
        if (result.passed) {
            byCategory[result.category].passed++;
        } else {
            byCategory[result.category].failed++;
        }
    });

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('📋 RÉSUMÉ PAR CATÉGORIE', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    Object.keys(byCategory).forEach(category => {
        const cat = byCategory[category];
        const catPercentage = ((cat.passed / (cat.passed + cat.failed)) * 100).toFixed(0);
        log(`\n${category}: ${cat.passed}/${cat.passed + cat.failed} (${catPercentage}%)`, 
            catPercentage >= 90 ? 'green' : catPercentage >= 70 ? 'yellow' : 'red');
        
        // Afficher les tests échoués de cette catégorie
        cat.tests.filter(t => !t.passed).forEach(test => {
            log(`  ❌ ${test.test}`, 'red');
            if (test.details) log(`     ${test.details}`, 'yellow');
        });
    });

    // Sauvegarder le rapport
    const reportHTML = generateHTMLReport(byCategory, totalTests, testsPassed, testsFailed, percentage);
    fs.writeFileSync('RAPPORT-TESTS.html', reportHTML);
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
    log('✅ Rapport HTML sauvegardé: RAPPORT-TESTS.html', 'green');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
}

function generateHTMLReport(byCategory, totalTests, passed, failed, percentage) {
    const date = new Date().toLocaleString('fr-FR');
    
    let categoriesHTML = '';
    Object.keys(byCategory).forEach(category => {
        const cat = byCategory[category];
        const catPercentage = ((cat.passed / (cat.passed + cat.failed)) * 100).toFixed(0);
        const color = catPercentage >= 90 ? '#4caf50' : catPercentage >= 70 ? '#ff9800' : '#f44336';
        
        let testsHTML = '';
        cat.tests.forEach(test => {
            const icon = test.passed ? '✅' : '❌';
            const statusClass = test.passed ? 'success' : 'failed';
            testsHTML += `
                <div class="test-item ${statusClass}">
                    <div class="test-name">${icon} ${test.test}</div>
                    ${test.details ? `<div class="test-details">${test.details}</div>` : ''}
                </div>
            `;
        });
        
        categoriesHTML += `
            <div class="category">
                <div class="category-header" style="border-left-color: ${color}">
                    <h3>${category}</h3>
                    <div class="category-stats">
                        <span class="stat-badge">${cat.passed}/${cat.passed + cat.failed}</span>
                        <span class="percentage" style="color: ${color}">${catPercentage}%</span>
                    </div>
                </div>
                <div class="tests-container">
                    ${testsHTML}
                </div>
            </div>
        `;
    });
    
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Tests - Formulaire Évaluation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f5f5f5;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .summary-card h3 { font-size: 0.9em; color: #666; margin-bottom: 10px; }
        .summary-card .value { font-size: 2.5em; font-weight: bold; }
        .summary-card.total .value { color: #2196f3; }
        .summary-card.success .value { color: #4caf50; }
        .summary-card.failed .value { color: #f44336; }
        .summary-card.percentage .value { color: ${percentage >= 90 ? '#4caf50' : '#ff9800'}; }
        .content { padding: 40px; }
        .category {
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
        }
        .category-header {
            background: #fafafa;
            padding: 20px;
            border-left: 5px solid #2196f3;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .category-header h3 { font-size: 1.3em; color: #333; }
        .category-stats {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        .stat-badge {
            background: #e3f2fd;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            color: #1976d2;
        }
        .percentage {
            font-size: 1.5em;
            font-weight: bold;
        }
        .tests-container { padding: 20px; }
        .test-item {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            border-left: 4px solid;
        }
        .test-item.success {
            background: #e8f5e9;
            border-left-color: #4caf50;
        }
        .test-item.failed {
            background: #ffebee;
            border-left-color: #f44336;
        }
        .test-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .test-details {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
            padding-left: 20px;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Rapport de Tests Automatisés</h1>
            <p>Formulaire d'Évaluation SENICO</p>
            <p style="font-size: 0.9em; margin-top: 10px;">Généré le ${date}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>Total des Tests</h3>
                <div class="value">${totalTests}</div>
            </div>
            <div class="summary-card success">
                <h3>Tests Réussis</h3>
                <div class="value">${passed}</div>
            </div>
            <div class="summary-card failed">
                <h3>Tests Échoués</h3>
                <div class="value">${failed}</div>
            </div>
            <div class="summary-card percentage">
                <h3>Taux de Réussite</h3>
                <div class="value">${percentage}%</div>
            </div>
        </div>
        
        <div class="content">
            <h2 style="margin-bottom: 30px; color: #333;">📋 Détails par Catégorie</h2>
            ${categoriesHTML}
        </div>
        
        <div class="footer">
            <p>Tests exécutés sur: ${BASE_URL}</p>
            <p style="margin-top: 5px; font-size: 0.9em;">Système de Gestion des Évaluations - SENICO © 2024</p>
        </div>
    </div>
</body>
</html>`;
}

// ============================================================
// EXÉCUTION DES TESTS
// ============================================================
async function runAllTests() {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'magenta');
    log('🚀 DÉMARRAGE DES TESTS AUTOMATISÉS', 'magenta');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'magenta');
    log(`URL du serveur: ${BASE_URL}`, 'blue');
    log('', 'reset');

    try {
        await testConnexionAPI();
        await testRecuperationEvaluations();
        await testCreationEvaluation();
        await testModificationEvaluation();
        await testSoumissionN2();
        await testValidationN2();
        await testEvaluationsExistantes();
        await testWorkflowComplet();
        await testSecurite();
        
        generateReport();
        
        log('\n🎉 TOUS LES TESTS SONT TERMINÉS !', 'green');
        log(`\n📄 Ouvrez RAPPORT-TESTS.html pour voir le rapport détaillé\n`, 'cyan');
        
        process.exit(testsFailed === 0 ? 0 : 1);
    } catch (error) {
        log(`\n❌ ERREUR CRITIQUE: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Lancement des tests
runAllTests();
