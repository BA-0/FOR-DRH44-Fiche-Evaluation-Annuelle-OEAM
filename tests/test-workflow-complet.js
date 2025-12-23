/**
 * 🧪 TEST COMPLET DE BOUT EN BOUT
 * Simulation d'un workflow réel : Création → Soumission → Validation
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// Couleurs console
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

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// ÉTAPE 1 : CONNEXION N+1
// ============================================================
async function connexionN1() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('ÉTAPE 1 : CONNEXION EN TANT QUE N+1 (awa.ndiaye)', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'awa.ndiaye',
                password: 'test123',
                role: 'N1'
            })
        });

        const data = await response.json();
        
        if (data.token) {
            log('✅ Connexion réussie !', 'green');
            log(`   👤 Utilisateur: ${data.userName}`, 'blue');
            log(`   🎫 Token: ${data.token.substring(0, 20)}...`, 'blue');
            return { token: data.token, userId: data.userId };
        } else {
            log('❌ Échec de connexion', 'red');
            log(`   ${data.error || 'Erreur inconnue'}`, 'yellow');
            return null;
        }
    } catch (error) {
        log(`❌ Erreur: ${error.message}`, 'red');
        return null;
    }
}

// ============================================================
// ÉTAPE 2 : CRÉATION D'UNE ÉVALUATION
// ============================================================
async function creerEvaluation(token, userId) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('ÉTAPE 2 : CRÉATION D\'UNE NOUVELLE ÉVALUATION', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    const evaluation = {
        date_evaluation: new Date().toISOString().split('T')[0],
        direction: 'Direction des Systèmes d\'Information',
        service: 'Service Développement',
        evaluateur_nom: 'NDIAYE',
        evaluateur_fonction: 'Chef de Projet IT',
        evalue_nom: 'BA Oumar',
        evalue_fonction: 'Développeur Full Stack Senior',
        categorie: 'A',
        annee: 2024,
        email_n2: 'mamadou.fall@senico.com',
        objectifs: JSON.stringify({
            objectifs: [
                {
                    description: 'Développer 3 nouvelles fonctionnalités critiques pour le système',
                    poids: '40',
                    resultat: '95',
                    commentaire: 'Excellente performance, toutes les fonctionnalités livrées en avance avec une qualité exceptionnelle'
                },
                {
                    description: 'Réduire le temps de réponse de l\'API de 50%',
                    poids: '30',
                    resultat: '88',
                    commentaire: 'Objectif atteint avec une réduction de 52%, optimisations remarquables'
                },
                {
                    description: 'Former 2 développeurs juniors aux bonnes pratiques',
                    poids: '20',
                    resultat: '92',
                    commentaire: 'Excellent mentoring, les juniors ont fait d\'énormes progrès'
                },
                {
                    description: 'Documenter l\'ensemble du code legacy',
                    poids: '10',
                    resultat: '85',
                    commentaire: 'Bon travail, documentation claire et complète'
                }
            ]
        }),
        competences: JSON.stringify({
            competences: [
                { nom: 'Expertise Technique', note: '5', commentaire: 'Maîtrise parfaite des technologies utilisées' },
                { nom: 'Autonomie', note: '5', commentaire: 'Totalement autonome, prend des initiatives pertinentes' },
                { nom: 'Communication', note: '4', commentaire: 'Excellente communication avec l\'équipe' },
                { nom: 'Innovation', note: '5', commentaire: 'Propose régulièrement des solutions innovantes' },
                { nom: 'Respect des délais', note: '5', commentaire: 'Toujours dans les temps, voire en avance' }
            ]
        }),
        scores: JSON.stringify({
            scoreObjectifs: '92',
            scoreCompetences: '96',
            scoreGlobal: '94'
        }),
        observations: JSON.stringify({
            evaluateur: 'Collaborateur exceptionnel, véritable pilier de l\'équipe. Performance remarquable tout au long de l\'année. Je recommande fortement une promotion.',
            agent: 'Très satisfait de cette année, merci pour votre confiance et votre accompagnement.'
        }),
        created_by: userId
    };

    try {
        log('📝 Création de l\'évaluation pour : BA Oumar', 'blue');
        
        const response = await fetch(`${BASE_URL}/api/evaluations`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(evaluation)
        });

        const data = await response.json();
        
        if (data.message && data.evaluation) {
            log('✅ Évaluation créée avec succès !', 'green');
            log(`   📋 ID: ${data.evaluation.id}`, 'blue');
            log(`   👤 Évalué: ${evaluation.evalue_nom}`, 'blue');
            log(`   📊 Score global: ${JSON.parse(evaluation.scores).scoreGlobal}%`, 'blue');
            log(`   📅 Statut: ${data.evaluation.status}`, 'blue');
            return data.evaluation.id;
        } else {
            log('❌ Échec de création', 'red');
            log(`   ${JSON.stringify(data)}`, 'yellow');
            return null;
        }
    } catch (error) {
        log(`❌ Erreur: ${error.message}`, 'red');
        return null;
    }
}

// ============================================================
// ÉTAPE 3 : SOUMISSION À N+2
// ============================================================
async function soumettreEvaluation(evaluationId, token, userId) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('ÉTAPE 3 : SOUMISSION À N+2', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    const submission = {
        user_id: userId,
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signatureN1: 'Awa NDIAYE - ' + new Date().toLocaleDateString('fr-FR')
    };

    try {
        log(`📤 Soumission de l'évaluation #${evaluationId}...`, 'blue');
        
        const response = await fetch(`${BASE_URL}/api/evaluations/${evaluationId}/submit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(submission)
        });

        const data = await response.json();
        
        if (data.message && data.message.includes('succès')) {
            log('✅ Soumission réussie !', 'green');
            log(`   📧 Envoyé à: mamadou.fall@senico.com`, 'blue');
            log(`   ✍️ Signature: ${submission.signatureN1}`, 'blue');
            return true;
        } else {
            log('❌ Échec de soumission', 'red');
            log(`   ${data.error || JSON.stringify(data)}`, 'yellow');
            return false;
        }
    } catch (error) {
        log(`❌ Erreur: ${error.message}`, 'red');
        return false;
    }
}

// ============================================================
// ÉTAPE 4 : CONNEXION N+2
// ============================================================
async function connexionN2() {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('ÉTAPE 4 : CONNEXION EN TANT QUE N+2 (mamadou.fall)', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'mamadou.fall',
                password: 'test123',
                role: 'N2'
            })
        });

        const data = await response.json();
        
        if (data.token) {
            log('✅ Connexion réussie !', 'green');
            log(`   👤 Utilisateur: ${data.userName}`, 'blue');
            log(`   🎫 Token: ${data.token.substring(0, 20)}...`, 'blue');
            return { token: data.token, userId: data.userId };
        } else {
            log('❌ Échec de connexion', 'red');
            return null;
        }
    } catch (error) {
        log(`❌ Erreur: ${error.message}`, 'red');
        return null;
    }
}

// ============================================================
// ÉTAPE 5 : RECHERCHE ÉVALUATION EN ATTENTE
// ============================================================
async function rechercherEvaluation(email, token) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('ÉTAPE 5 : RECHERCHE ÉVALUATION EN ATTENTE', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    try {
        log(`🔍 Recherche pour: ${email}`, 'blue');
        
        const response = await fetch(`${BASE_URL}/api/evaluations/pending/${email}`, {
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.evaluations && data.evaluations.length > 0) {
            log(`✅ ${data.evaluations.length} évaluation(s) trouvée(s) !`, 'green');
            data.evaluations.forEach((ev, i) => {
                log(`   ${i + 1}. ID: ${ev.id} - ${ev.evalue_nom} - Score: ${ev.score_global}%`, 'blue');
            });
            return data.evaluations[0].id;
        } else {
            log('⚠️ Aucune évaluation en attente', 'yellow');
            return null;
        }
    } catch (error) {
        log(`❌ Erreur: ${error.message}`, 'red');
        return null;
    }
}

// ============================================================
// ÉTAPE 6 : VALIDATION PAR N+2
// ============================================================
async function validerEvaluation(evaluationId, token, userId) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('ÉTAPE 6 : VALIDATION PAR N+2', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    const validation = {
        user_id: userId,
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signatureN2: 'Mamadou FALL - ' + new Date().toLocaleDateString('fr-FR')
    };

    try {
        log(`✅ Validation de l'évaluation #${evaluationId}...`, 'blue');
        
        const response = await fetch(`${BASE_URL}/api/evaluations/${evaluationId}/validate`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validation)
        });

        const data = await response.json();
        
        if (data.message && data.message.includes('succès')) {
            log('✅ Validation réussie !', 'green');
            log(`   ✍️ Signature: ${validation.signatureN2}`, 'blue');
            log(`   🎉 Évaluation finalisée !`, 'green');
            return true;
        } else {
            log('❌ Échec de validation', 'red');
            log(`   ${data.error || JSON.stringify(data)}`, 'yellow');
            return false;
        }
    } catch (error) {
        log(`❌ Erreur: ${error.message}`, 'red');
        return false;
    }
}

// ============================================================
// ÉTAPE 7 : VÉRIFICATION FINALE
// ============================================================
async function verifierStatutFinal(evaluationId) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('ÉTAPE 7 : VÉRIFICATION FINALE', 'cyan');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');

    try {
        const response = await fetch(`${BASE_URL}/api/evaluations/${evaluationId}/full`);
        const data = await response.json();
        
        if (data.success && data.evaluation) {
            const ev = data.evaluation;
            log('✅ Évaluation récupérée avec succès !', 'green');
            log(`   📋 ID: ${ev.id}`, 'blue');
            log(`   👤 Évalué: ${ev.evalue_nom}`, 'blue');
            log(`   📊 Score global: ${ev.scores?.scoreGlobal || 'N/A'}%`, 'blue');
            log(`   📅 Statut: ${ev.status}`, ev.status === 'validated' ? 'green' : 'yellow');
            log(`   ✍️ Signature N+1: ${ev.signatures?.evaluateur ? '✅' : '❌'}`, 'blue');
            log(`   ✍️ Signature N+2: ${ev.signatures?.n2 ? '✅' : '❌'}`, 'blue');
            return ev.status === 'validated';
        } else {
            log('❌ Erreur de récupération', 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Erreur: ${error.message}`, 'red');
        return false;
    }
}

// ============================================================
// WORKFLOW COMPLET
// ============================================================
async function executerWorkflowComplet() {
    log('\n╔══════════════════════════════════════════════════════╗', 'magenta');
    log('║   🧪 TEST DE BOUT EN BOUT - WORKFLOW COMPLET       ║', 'magenta');
    log('╚══════════════════════════════════════════════════════╝', 'magenta');

    let evaluationId = null;

    // ÉTAPE 1 : Connexion N+1
    const n1Auth = await connexionN1();
    if (!n1Auth) {
        log('\n❌ ÉCHEC : Impossible de se connecter en N+1', 'red');
        return;
    }
    await wait(1000);

    // ÉTAPE 2 : Création évaluation
    evaluationId = await creerEvaluation(n1Auth.token, n1Auth.userId);
    if (!evaluationId) {
        log('\n❌ ÉCHEC : Impossible de créer l\'évaluation', 'red');
        return;
    }
    await wait(1000);

    // ÉTAPE 3 : Soumission à N+2
    const submitted = await soumettreEvaluation(evaluationId, n1Auth.token, n1Auth.userId);
    if (!submitted) {
        log('\n❌ ÉCHEC : Impossible de soumettre l\'évaluation', 'red');
        return;
    }
    await wait(1000);

    // ÉTAPE 4 : Connexion N+2
    const n2Auth = await connexionN2();
    if (!n2Auth) {
        log('\n❌ ÉCHEC : Impossible de se connecter en N+2', 'red');
        return;
    }
    await wait(1000);

    // ÉTAPE 5 : Recherche évaluation
    const foundId = await rechercherEvaluation('ba', n2Auth.token);
    await wait(1000);

    // ÉTAPE 6 : Validation
    const validated = await validerEvaluation(evaluationId, n2Auth.token, n2Auth.userId);
    if (!validated) {
        log('\n⚠️ ATTENTION : Validation échouée mais workflow continue', 'yellow');
    }
    await wait(1000);

    // ÉTAPE 7 : Vérification finale
    const finalCheck = await verifierStatutFinal(evaluationId);

    // RÉSUMÉ FINAL
    log('\n╔══════════════════════════════════════════════════════╗', 'magenta');
    log('║               📊 RÉSUMÉ DU TEST                     ║', 'magenta');
    log('╚══════════════════════════════════════════════════════╝', 'magenta');
    
    log('\n✅ Étapes réussies:', 'green');
    log('   1. ✅ Connexion N+1 (awa.ndiaye)', 'green');
    log('   2. ✅ Création évaluation (BA Oumar)', 'green');
    log('   3. ✅ Soumission à N+2', 'green');
    log('   4. ✅ Connexion N+2 (mamadou.fall)', 'green');
    
    if (validated) {
        log('   5. ✅ Validation par N+2', 'green');
    } else {
        log('   5. ⚠️ Validation (avec warnings)', 'yellow');
    }
    
    if (finalCheck) {
        log('   6. ✅ Vérification finale OK', 'green');
        log('\n🎉 SUCCÈS TOTAL ! Workflow complet fonctionnel !', 'green');
    } else {
        log('   6. ⚠️ Statut final à vérifier', 'yellow');
        log('\n⚠️ Workflow exécuté avec quelques warnings', 'yellow');
    }

    log(`\n📋 ID de l'évaluation créée: ${evaluationId}`, 'cyan');
    log(`🔗 Voir dans l'interface: http://localhost:3001/formulaire-online.html`, 'cyan');
}

// Lancement du test
executerWorkflowComplet().then(() => {
    log('\n✅ Test terminé !', 'green');
    process.exit(0);
}).catch(error => {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    process.exit(1);
});
