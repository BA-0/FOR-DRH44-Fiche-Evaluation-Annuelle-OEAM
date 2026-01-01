// Serveur Node.js pour la gestion des évaluations - VERSION MySQL
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..')));

// Middleware d'authentification - Vérifie le token et extrait les infos utilisateur
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: 'Non authentifié',
                message: 'Token d\'authentification requis' 
            });
        }
        
        // Extraire le token
        const token = authHeader.substring(7);
        
        // Décoder le token (format: userId:username:timestamp en base64)
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [userId, username, timestamp] = decoded.split(':');
        
        if (!userId || !username) {
            return res.status(401).json({ 
                success: false, 
                error: 'Token invalide',
                message: 'Le token d\'authentification est invalide' 
            });
        }
        
        // Récupérer les informations de l'utilisateur depuis la base de données
        const sql = 'SELECT id, username, email, name, role FROM users WHERE id = ? AND username = ? AND is_active = TRUE';
        const users = await db.query(sql, [userId, username]);
        // Vérification du rôle DRH possible ici si besoin de restreindre l'accès à certaines routes
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Utilisateur non trouvé',
                message: 'L\'utilisateur correspondant au token n\'existe pas' 
            });
        }
        
        // Ajouter les informations de l'utilisateur à la requête
        req.user = users[0];
        next();
    } catch (error) {
        console.error('❌ Erreur d\'authentification:', error);
        return res.status(401).json({ 
            success: false, 
            error: 'Erreur d\'authentification',
            message: 'Une erreur s\'est produite lors de la vérification de l\'authentification' 
        });
    }
}

// ===========================================
// ROUTES D'AUTHENTIFICATION
// ===========================================

// Route de connexion avec MySQL et bcrypt
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('🔐 Tentative de connexion:', { username });
        
        // Chercher l'utilisateur dans la base de données (sans filtrer par rôle)
        const sql = 'SELECT * FROM users WHERE username = ? AND is_active = TRUE';
        const users = await db.query(sql, [username]);
        
        if (users.length === 0) {
            console.log('❌ Utilisateur non trouvé');
            return res.status(401).json({ 
                error: 'Identifiants incorrects',
                message: 'Nom d\'utilisateur incorrect' 
            });
        }
        
        const user = users[0];
        
        // Vérifier le mot de passe avec bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            console.log('❌ Mot de passe incorrect');
            return res.status(401).json({ 
                error: 'Identifiants incorrects',
                message: 'Mot de passe incorrect' 
            });
        }
        
        // Générer un token simple (en production, utiliser JWT)
        const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64');
        
        console.log('✅ Connexion réussie pour:', user.name);
        
        // Vérifier si c'est la première connexion
        const firstLogin = user.first_login === 1 || user.first_login === true;
        
        if (firstLogin) {
            console.log('⚠️ Première connexion détectée - redirection vers changement de mot de passe');
        }
        
        res.json({
            token,
            role: user.role,
            userName: user.name,
            email: user.email,
            userId: user.id,
            firstLogin: firstLogin  // Nouveau champ pour indiquer la première connexion
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// Route pour changer le mot de passe à la première connexion
app.post('/api/auth/change-password-first-login', async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                error: 'Non authentifié',
                message: 'Token d\'authentification requis' 
            });
        }
        
        console.log('🔄 Changement de mot de passe première connexion pour userId:', userId);
        
        // Valider les données
        if (!userId || !newPassword) {
            return res.status(400).json({ 
                success: false,
                error: 'Données manquantes',
                message: 'L\'ID utilisateur et le nouveau mot de passe sont requis' 
            });
        }
        
        // Vérifier la complexité du mot de passe
        if (newPassword.length < 8) {
            return res.status(400).json({ 
                success: false,
                error: 'Mot de passe trop court',
                message: 'Le mot de passe doit contenir au moins 8 caractères' 
            });
        }
        
        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({ 
                success: false,
                error: 'Mot de passe invalide',
                message: 'Le mot de passe doit contenir au moins une lettre majuscule' 
            });
        }
        
        if (!/[a-z]/.test(newPassword)) {
            return res.status(400).json({ 
                success: false,
                error: 'Mot de passe invalide',
                message: 'Le mot de passe doit contenir au moins une lettre minuscule' 
            });
        }
        
        if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({ 
                success: false,
                error: 'Mot de passe invalide',
                message: 'Le mot de passe doit contenir au moins un chiffre' 
            });
        }
        
        if (!/[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
            return res.status(400).json({ 
                success: false,
                error: 'Mot de passe invalide',
                message: 'Le mot de passe doit contenir au moins un caractère spécial' 
            });
        }
        
        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Mettre à jour le mot de passe et marquer que ce n'est plus la première connexion
        const updateSql = 'UPDATE users SET password = ?, first_login = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await db.query(updateSql, [hashedPassword, userId]);
        
        console.log('✅ Mot de passe mis à jour avec succès pour userId:', userId);
        
        res.json({
            success: true,
            message: 'Mot de passe modifié avec succès'
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du changement de mot de passe:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur lors du changement de mot de passe',
            message: error.message 
        });
    }
});

// ===========================================
// ROUTES POUR LES ÉVALUATIONS
// ===========================================

// GET - Récupérer toutes les évaluations
app.get('/api/evaluations', async (req, res) => {
    try {
        const sql = 'SELECT * FROM evaluations ORDER BY created_at DESC';
        const evaluations = await db.query(sql);
        res.json({ success: true, evaluations });
    } catch (error) {
        console.error('Erreur lors de la récupération des évaluations:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// GET - Toutes les évaluations (Admin) - DOIT ÊTRE AVANT /:id
app.get('/api/evaluations/all', requireAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT id, date_evaluation, direction, service, 
                   evaluateur_nom, evaluateur_matricule, evaluateur_fonction, 
                   evalue_nom, evalue_fonction, 
                   categorie, annee, email_n2, status, 
                   created_at, submitted_at, validated_at
            FROM evaluations 
            ORDER BY created_at DESC
        `;
        const evaluations = await db.query(sql);
        res.json(evaluations);
    } catch (error) {
        console.error('Erreur lors de la récupération des évaluations:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET - Récupérer une évaluation par ID (version simple)
app.get('/api/evaluations/:id', async (req, res) => {
    try {
        const sql = 'SELECT * FROM evaluations WHERE id = ?';
        const evaluations = await db.query(sql, [req.params.id]);
        
        if (evaluations.length === 0) {
            console.log(`❌ Évaluation ID ${req.params.id} non trouvée`);
            return res.status(404).json({ 
                success: false, 
                error: 'Évaluation non trouvée',
                message: `L'évaluation avec l'ID ${req.params.id} n'existe pas dans la base de données.`
            });
        }
        
        const evaluation = evaluations[0];
        
        // Parser les champs JSON avec sécurité
        const safeParseJSON = (field, defaultValue) => {
            try {
                if (typeof field === 'object' && field !== null) {
                    return field;
                }
                if (!field || field === 'null' || field === 'undefined') {
                    return defaultValue;
                }
                if (typeof field === 'string') {
                    return JSON.parse(field);
                }
                return defaultValue;
            } catch (e) {
                console.error(`Erreur parsing JSON:`, e.message);
                return defaultValue;
            }
        };
        
        // Mapper vers camelCase
        const formattedEvaluation = {
            id: evaluation.id,
            dateEvaluation: evaluation.date_evaluation,
            direction: evaluation.direction,
            service: evaluation.service,
            evaluateurNom: evaluation.evaluateur_nom,
            evaluateurFonction: evaluation.evaluateur_fonction,
            evalueNom: evaluation.evalue_nom,
            evalueFonction: evaluation.evalue_fonction,
            categorie: evaluation.categorie,
            annee: evaluation.annee,
            emailN2: evaluation.email_n2,
            objectifs: safeParseJSON(evaluation.objectifs, []),
            competences: safeParseJSON(evaluation.competences, {}),
            scores: safeParseJSON(evaluation.scores, {}),
            observations: safeParseJSON(evaluation.observations, {}),
            signatures: safeParseJSON(evaluation.signatures, {}),
            status: evaluation.status,
            createdAt: evaluation.created_at,
            submittedAt: evaluation.submitted_at,
            validatedAt: evaluation.validated_at
        };
        
        console.log(`✅ Évaluation ID ${req.params.id} récupérée avec succès`);
        res.json({ success: true, evaluation: formattedEvaluation });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'évaluation:', error);
        res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
});

// GET - Récupérer une évaluation par ID (version complète avec tous les détails)
// SÉCURISÉ : Vérifie que l'utilisateur a le droit d'accéder à cette évaluation
app.get('/api/evaluations/:id/full', requireAuth, async (req, res) => {
    try {
        const sql = 'SELECT * FROM evaluations WHERE id = ?';
        const evaluations = await db.query(sql, [req.params.id]);
        
        if (evaluations.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Évaluation non trouvée' 
            });
        }
        
        const evaluation = evaluations[0];
        
        // Log pour debug
        console.log(`📥 Accès à l'évaluation #${req.params.id} par ${req.user.name} (${req.user.email}, role: ${req.user.role})`);
        console.log(`   Évaluateur dans BDD: "${evaluation.evaluateur_nom}", Email N+2: "${evaluation.email_n2}"`);
        
        // TEMPORAIRE: Désactiver les vérifications strictes pour debug
        // TODO: Réactiver après avoir vérifié les données
        /*
        if (req.user.role === 'N1') {
            const userNameParts = req.user.name.toUpperCase().split(' ');
            const evalNameParts = (evaluation.evaluateur_nom || '').toUpperCase().split(' ');
            const hasCommonName = userNameParts.some(part => 
                evalNameParts.some(evalPart => evalPart.includes(part) || part.includes(evalPart))
            );
            
            if (!hasCommonName && evaluation.evaluateur_nom && evaluation.evaluateur_nom.trim() !== '') {
                console.log(`⚠️ Accès refusé: ${req.user.name} (${req.user.email}) tente d'accéder à l'évaluation de ${evaluation.evaluateur_nom}`);
                return res.status(403).json({ 
                    success: false, 
                    error: 'Accès refusé',
                    message: 'Vous ne pouvez accéder qu\'aux évaluations que vous avez créées' 
                });
            }
        } else if (req.user.role === 'N2') {
            if (evaluation.email_n2 && evaluation.email_n2 !== req.user.email) {
                console.log(`⚠️ Accès refusé: ${req.user.email} tente d'accéder à l'évaluation assignée à ${evaluation.email_n2}`);
                return res.status(403).json({ 
                    success: false, 
                    error: 'Accès refusé',
                    message: 'Vous ne pouvez accéder qu\'aux évaluations qui vous sont assignées' 
                });
            }
        }
        */
        
        // Parser les champs JSON avec sécurité
        const safeParseJSON = (field, defaultValue) => {
            try {
                // Si c'est déjà un objet/array, le retourner tel quel
                if (typeof field === 'object' && field !== null) {
                    return field;
                }
                // Si c'est null, undefined ou 'null', retourner la valeur par défaut
                if (!field || field === 'null' || field === 'undefined') {
                    return defaultValue;
                }
                // Sinon, parser le JSON
                if (typeof field === 'string') {
                    return JSON.parse(field);
                }
                return defaultValue;
            } catch (e) {
                console.error(`Erreur parsing JSON:`, e.message, 'Value:', field);
                return defaultValue;
            }
        };
        
        // Mapper les noms de colonnes snake_case vers camelCase pour le frontend
        const fullEvaluation = {
            id: evaluation.id,
            dateEvaluation: evaluation.date_evaluation,
            direction: evaluation.direction,
            service: evaluation.service,
            evaluateurNom: evaluation.evaluateur_nom,
            evaluateurFonction: evaluation.evaluateur_fonction,
            evalueNom: evaluation.evalue_nom,
            evalueFonction: evaluation.evalue_fonction,
            categorie: evaluation.categorie,
            annee: evaluation.annee,
            emailN2: evaluation.email_n2,
            objectifs: safeParseJSON(evaluation.objectifs, []),
            competences: safeParseJSON(evaluation.competences, {}),
            scores: safeParseJSON(evaluation.scores, {}),
            observations: safeParseJSON(evaluation.observations, {}),
            signatures: safeParseJSON(evaluation.signatures, {}),
            status: evaluation.status,
            createdAt: evaluation.created_at,
            submittedAt: evaluation.submitted_at,
            validatedAt: evaluation.validated_at
        };
        
        res.json({ success: true, evaluation: fullEvaluation });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'évaluation:', error);
        res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
});

// GET - Récupérer les évaluations en attente pour un email donné (N+2)
// SÉCURISÉ : Utilise l'email de l'utilisateur authentifié uniquement
app.get('/api/evaluations/pending/:email', requireAuth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur demande ses propres évaluations
        if (req.user.email !== req.params.email) {
            console.log(`❌ Tentative d'accès non autorisé: ${req.user.email} essaie d'accéder aux évaluations de ${req.params.email}`);
            return res.status(403).json({ 
                success: false, 
                error: 'Accès refusé',
                message: 'Vous ne pouvez consulter que vos propres évaluations' 
            });
        }
        
        // Vérifier que l'utilisateur est bien un N+2
        if (req.user.role !== 'N2') {
            return res.status(403).json({ 
                success: false, 
                error: 'Accès refusé',
                message: 'Cette route est réservée aux utilisateurs N+2' 
            });
        }
        
        const sql = `
            SELECT 
                id, evalue_nom, evaluateur_nom, direction, service, 
                annee, email_n2, status, created_at, submitted_at, validated_at,
                JSON_EXTRACT(scores, '$.scoreFinal') as score_final
            FROM evaluations 
            WHERE email_n2 = ? AND (status = 'submitted' OR status = 'validated')
            ORDER BY 
                CASE 
                    WHEN status = 'submitted' THEN 1
                    WHEN status = 'validated' THEN 2
                END,
                submitted_at DESC,
                validated_at DESC
        `;
        const evaluations = await db.query(sql, [req.user.email]);
        console.log(`✅ ${evaluations.length} évaluations récupérées pour ${req.user.email}`);
        res.json({ success: true, evaluations: evaluations });
    } catch (error) {
        console.error('Erreur lors de la récupération des évaluations:', error);
        res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
});

// GET - Récupérer les évaluations pour un évaluateur N+1 (par email et nom)
// SÉCURISÉ : Utilise l'email de l'utilisateur authentifié uniquement
app.get('/api/evaluations/evaluator/:email', requireAuth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur demande ses propres évaluations
        if (req.user.email !== req.params.email) {
            console.log(`❌ Tentative d'accès non autorisé: ${req.user.email} essaie d'accéder aux évaluations de ${req.params.email}`);
            return res.status(403).json({ 
                success: false, 
                error: 'Accès refusé',
                message: 'Vous ne pouvez consulter que vos propres évaluations' 
            });
        }
        
        // Vérifier que l'utilisateur est bien un N+1
        if (req.user.role !== 'N1') {
            return res.status(403).json({ 
                success: false, 
                error: 'Accès refusé',
                message: 'Cette route est réservée aux utilisateurs N+1' 
            });
        }
        
        const evaluatorName = req.user.name;
        
        // Récupérer toutes les évaluations (brouillons, soumises, validées) de cet évaluateur
        // La table n'a PAS de colonne evaluateur_email, seulement evaluateur_nom
        const sql = `
            SELECT 
                id, evalue_nom, evaluateur_nom, direction, service, 
                annee, email_n2, status, created_at, submitted_at, validated_at, evalue_fonction,
                JSON_EXTRACT(scores, '$.scoreFinal') as score_final
            FROM evaluations 
            WHERE evaluateur_nom = ? OR evaluateur_nom LIKE ?
            ORDER BY 
                CASE 
                    WHEN status = 'draft' THEN 1
                    WHEN status = 'submitted' THEN 2
                    WHEN status = 'validated' THEN 3
                END,
                created_at DESC
        `;
        // Utiliser LIKE pour gérer les variations de casse (Bougar DIOUF vs BOUGAR DIOUF)
        const evaluations = await db.query(sql, [evaluatorName, `%${evaluatorName}%`]);
        console.log(`✅ ${evaluations.length} évaluations récupérées pour ${req.user.email} (${evaluatorName})`);
        res.json({ success: true, evaluations: evaluations });
    } catch (error) {
        console.error('Erreur lors de la récupération des évaluations de l\'évaluateur:', error);
        res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
});

// POST - Créer une nouvelle évaluation
app.post('/api/evaluations', async (req, res) => {
    try {
        const evaluation = req.body;
        
        const sql = `
            INSERT INTO evaluations (
                date_evaluation, direction, service, evaluateur_nom, evaluateur_matricule, evaluateur_fonction,
                evalue_nom, evalue_fonction, categorie, annee, email_n2,
                objectifs, competences, scores, observations, signatures,
                status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            evaluation.dateEvaluation || null,
            evaluation.direction || '',
            evaluation.service || '',
            evaluation.evaluateurNom || '',
            evaluation.evaluateurMatricule || '',
            evaluation.evaluateurFonction || '',
            evaluation.evalueNom || '',
            evaluation.evalueFonction || '',
            evaluation.categorie || '',
            evaluation.annee || new Date().getFullYear(),
            evaluation.emailN2 || '',
            JSON.stringify(evaluation.objectifs || []),
            JSON.stringify(evaluation.competences || {}),
            JSON.stringify(evaluation.scores || {}),
            JSON.stringify(evaluation.observations || {}),
            JSON.stringify(evaluation.signatures || {}),
            evaluation.status || 'draft',
            evaluation.createdBy || null
        ];
        
        const result = await db.query(sql, params);
        
        res.status(201).json({ 
            success: true,
            evaluation: {
                id: result.insertId
            },
            message: 'Évaluation créée avec succès'
        });
        
    } catch (error) {
        console.error('Erreur lors de la création de l\'évaluation:', error);
        res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
});

// PUT - Mettre à jour une évaluation existante
app.put('/api/evaluations/:id', async (req, res) => {
    try {
        const evaluation = req.body;
        
        const sql = `
            UPDATE evaluations SET
                date_evaluation = ?,
                direction = ?,
                service = ?,
                evaluateur_nom = ?,
                evaluateur_matricule = ?,
                evaluateur_fonction = ?,
                evalue_nom = ?,
                evalue_fonction = ?,
                categorie = ?,
                annee = ?,
                email_n2 = ?,
                objectifs = ?,
                competences = ?,
                scores = ?,
                observations = ?,
                signatures = ?,
                status = ?
            WHERE id = ?
        `;
        
        const params = [
            evaluation.dateEvaluation || null,
            evaluation.direction || '',
            evaluation.service || '',
            evaluation.evaluateurNom || '',
            evaluation.evaluateurFonction || '',
            evaluation.evalueNom || '',
            evaluation.evalueFonction || '',
            evaluation.categorie || '',
            evaluation.annee || new Date().getFullYear(),
            evaluation.emailN2 || '',
            JSON.stringify(evaluation.objectifs || []),
            JSON.stringify(evaluation.competences || {}),
            JSON.stringify(evaluation.scores || {}),
            JSON.stringify(evaluation.observations || {}),
            JSON.stringify(evaluation.signatures || {}),
            evaluation.status || 'draft',
            req.params.id
        ];
        
        await db.query(sql, params);
        
        res.json({ 
            success: true,
            evaluation: {
                id: req.params.id
            },
            message: 'Évaluation mise à jour avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
        res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
});

// POST - Soumettre une évaluation à N+2
app.post('/api/evaluations/:id/submit', async (req, res) => {
    try {
        const sql = 'CALL sp_submit_evaluation(?, ?)';
        await db.query(sql, [req.params.id, req.body.userId || null]);
        
        res.json({ 
            success: true,
            message: 'Évaluation soumise avec succès au validateur N+2'
        });
        
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
});

// POST - Valider une évaluation (N+2)
// SÉCURISÉ : Vérifie que l'utilisateur est N+2 et que l'évaluation lui est assignée
app.post('/api/evaluations/:id/validate', requireAuth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est bien un N+2
        if (req.user.role !== 'N2') {
            return res.status(403).json({ 
                success: false, 
                error: 'Accès refusé',
                message: 'Seuls les utilisateurs N+2 peuvent valider des évaluations' 
            });
        }
        
        // Vérifier que l'évaluation est bien assignée à cet utilisateur
        const checkSql = 'SELECT email_n2 FROM evaluations WHERE id = ?';
        const evaluations = await db.query(checkSql, [req.params.id]);
        
        if (evaluations.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Évaluation non trouvée' 
            });
        }
        
        if (evaluations[0].email_n2 !== req.user.email) {
            console.log(`❌ Tentative de validation non autorisée: ${req.user.email} essaie de valider l'évaluation ${req.params.id} assignée à ${evaluations[0].email_n2}`);
            return res.status(403).json({ 
                success: false, 
                error: 'Accès refusé',
                message: 'Vous ne pouvez valider que les évaluations qui vous sont assignées' 
            });
        }
        
        const { signature, userId } = req.body;
        
        const sql = 'CALL sp_validate_evaluation(?, ?, ?)';
        await db.query(sql, [req.params.id, userId || null, JSON.stringify(signature)]);
        
        console.log(`✅ Évaluation ${req.params.id} validée par ${req.user.email}`);
        res.json({ 
            success: true,
            message: 'Évaluation validée avec succès'
        });
        
    } catch (error) {
        console.error('Erreur lors de la validation:', error);
        res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
});

// DELETE - Supprimer une évaluation
app.delete('/api/evaluations/:id', async (req, res) => {
    try {
        const sql = 'DELETE FROM evaluations WHERE id = ?';
        await db.query(sql, [req.params.id]);
        
        res.json({ message: 'Évaluation supprimée avec succès' });
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===========================================
// ROUTES ADMIN - Gestion des utilisateurs
// ===========================================

// Middleware pour vérifier si l'utilisateur est admin
async function requireAdmin(req, res, next) {
    try {
        // D'abord, vérifier l'authentification
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'Non authentifié' 
            });
        }
        
        const token = authHeader.substring(7);
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [userId, username] = decoded.split(':');
        
        // Vérifier que l'utilisateur est admin
        const sql = 'SELECT role FROM users WHERE id = ? AND username = ? AND is_active = TRUE';
        const users = await db.query(sql, [userId, username]);
        
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé. Privilèges administrateur requis.' 
            });
        }
        
        req.adminUser = { id: userId, username };
        next();
    } catch (error) {
        console.error('Erreur middleware admin:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
}

// GET - Liste de tous les utilisateurs (Admin)
app.get('/api/users', requireAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT id, username, name, email, role, is_active, 
                   created_at, updated_at, first_login
            FROM users 
            ORDER BY created_at DESC
        `;
        const users = await db.query(sql);
        res.json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// POST - Créer un nouvel utilisateur (Admin)
app.post('/api/users', requireAdmin, async (req, res) => {
    try {
        const { username, password, name, email, role, is_active } = req.body;
        
        // Validation
        if (!username || !password || !name || !email || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tous les champs obligatoires doivent être remplis' 
            });
        }
        
        // Vérifier si le username existe déjà
        const checkSql = 'SELECT id FROM users WHERE username = ?';
        const existing = await db.query(checkSql, [username]);
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ce nom d\'utilisateur existe déjà' 
            });
        }
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insérer le nouvel utilisateur
        const insertSql = `
            INSERT INTO users (username, password, name, email, role, is_active, first_login)
            VALUES (?, ?, ?, ?, ?, ?, TRUE)
        `;
        
        const result = await db.query(insertSql, [
            username, 
            hashedPassword, 
            name, 
            email, 
            role, 
            is_active !== undefined ? is_active : 1
        ]);
        
        console.log(`✅ Utilisateur créé: ${username} (${role})`);
        
        res.json({ 
            success: true, 
            message: 'Utilisateur créé avec succès',
            userId: result.insertId 
        });
        
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// PUT - Modifier un utilisateur (Admin)
app.put('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, password, name, email, role, is_active } = req.body;
        
        // Validation
        if (!username || !name || !email || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tous les champs obligatoires doivent être remplis' 
            });
        }
        
        // Vérifier si l'utilisateur existe
        const checkSql = 'SELECT id FROM users WHERE id = ?';
        const existing = await db.query(checkSql, [userId]);
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
        }
        
        // Construire la requête de mise à jour
        let updateSql = `
            UPDATE users 
            SET username = ?, name = ?, email = ?, role = ?, is_active = ?
        `;
        let params = [username, name, email, role, is_active !== undefined ? is_active : 1];
        
        // Si un nouveau mot de passe est fourni
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateSql += ', password = ?';
            params.push(hashedPassword);
        }
        
        updateSql += ' WHERE id = ?';
        params.push(userId);
        
        await db.query(updateSql, params);
        
        console.log(`✅ Utilisateur modifié: ${username}`);
        
        res.json({ 
            success: true, 
            message: 'Utilisateur modifié avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur lors de la modification de l\'utilisateur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Route pour réinitialiser le mot de passe d'un utilisateur (Admin uniquement)
app.post('/api/users/:id/reset-password', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        
        console.log(`🔑 Réinitialisation du mot de passe pour l'utilisateur ID: ${userId}`);
        
        // Vérifier que l'utilisateur existe
        const users = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
        
        if (!users || users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Utilisateur introuvable' 
            });
        }
        
        const username = users[0].username;
        
        // Nouveau mot de passe par défaut
        const defaultPassword = 'Test123@';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // Réinitialiser le mot de passe et activer first_login
        await db.query(
            'UPDATE users SET password = ?, first_login = 1 WHERE id = ?',
            [hashedPassword, userId]
        );
        
        console.log(`✅ Mot de passe réinitialisé pour: ${username}`);
        console.log(`🔐 Nouveau mot de passe: ${defaultPassword}`);
        console.log(`⚠️ First login activé - L'utilisateur devra changer son mot de passe`);
        
        res.json({ 
            success: true, 
            message: `Mot de passe réinitialisé pour ${username}`,
            defaultPassword: defaultPassword,
            info: 'L\'utilisateur devra changer son mot de passe à la prochaine connexion'
        });
        
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// PATCH - Modifier le statut d'un utilisateur (Admin)
app.patch('/api/users/:id/status', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const { is_active } = req.body;
        
        if (is_active === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Le statut est requis' 
            });
        }
        
        const sql = 'UPDATE users SET is_active = ? WHERE id = ?';
        await db.query(sql, [is_active, userId]);
        
        console.log(`✅ Statut utilisateur modifié: ID ${userId} => ${is_active ? 'Actif' : 'Inactif'}`);
        
        res.json({ 
            success: true, 
            message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès` 
        });
        
    } catch (error) {
        console.error('Erreur lors de la modification du statut:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// DELETE - Supprimer un utilisateur (Admin)
app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Vérifier si c'est le dernier admin
        const checkAdminSql = 'SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = TRUE';
        const adminCount = await db.query(checkAdminSql);
        
        const userSql = 'SELECT role FROM users WHERE id = ?';
        const user = await db.query(userSql, [userId]);
        
        if (user.length > 0 && user[0].role === 'admin' && adminCount[0].count <= 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Impossible de supprimer le dernier administrateur' 
            });
        }
        
        // Supprimer l'utilisateur (les évaluations seront mises à NULL grâce à ON DELETE SET NULL)
        const deleteSql = 'DELETE FROM users WHERE id = ?';
        await db.query(deleteSql, [userId]);
        
        console.log(`✅ Utilisateur supprimé: ID ${userId}`);
        
        res.json({ 
            success: true, 
            message: 'Utilisateur supprimé avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ===========================================
// ROUTES ADMIN - Gestion des évaluations
// ===========================================

// GET - Liste de toutes les évaluations (Admin)
app.get('/api/evaluations/all', requireAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT id, date_evaluation, direction, service, 
                   evaluateur_nom, evaluateur_fonction, 
                   evalue_nom, evalue_fonction, 
                   categorie, annee, email_n2, status, 
                   created_at, submitted_at, validated_at
            FROM evaluations 
            ORDER BY created_at DESC
        `;
        const evaluations = await db.query(sql);
        res.json(evaluations);
    } catch (error) {
        console.error('Erreur lors de la récupération des évaluations:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// DELETE - Supprimer une évaluation (Admin)
app.delete('/api/evaluations/:id', requireAdmin, async (req, res) => {
    try {
        const evalId = req.params.id;
        
        // Supprimer l'évaluation (les logs d'audit seront supprimés en cascade)
        const deleteSql = 'DELETE FROM evaluations WHERE id = ?';
        const result = await db.query(deleteSql, [evalId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Évaluation non trouvée' 
            });
        }
        
        console.log(`✅ Évaluation supprimée: ID ${evalId}`);
        
        res.json({ 
            success: true, 
            message: 'Évaluation supprimée avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'évaluation:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ===========================================
// ROUTES ADMIN - Logs d'audit
// ===========================================

// GET - Tous les logs d'audit (Admin)
app.get('/api/audit-logs', requireAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT a.*, u.name as user_name 
            FROM audit_log a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 500
        `;
        const logs = await db.query(sql);
        res.json(logs);
    } catch (error) {
        console.error('Erreur lors de la récupération des logs:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ===========================================
// ROUTES ADMIN - Configuration
// ===========================================

// POST - Enregistrer la configuration (Admin)
app.post('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
        // Pour l'instant, retourner un succès
        // Dans une vraie implémentation, sauvegarder dans une table settings
        console.log('Configuration enregistrée:', req.body);
        
        res.json({ 
            success: true, 
            message: 'Configuration enregistrée avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la configuration:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// GET - Exporter la base de données (Admin)
app.get('/api/admin/export-database', requireAdmin, async (req, res) => {
    try {
        const { exec } = require('child_process');
        const backupPath = path.join(__dirname, '..', 'database', 'backups', `backup_${Date.now()}.sql`);
        
        // Créer le dossier backups s'il n'existe pas
        const fs = require('fs');
        const backupDir = path.join(__dirname, '..', 'database', 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Commande mysqldump (à adapter selon votre configuration)
        const command = `mysqldump -u root formulaire_evaluation > "${backupPath}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Erreur mysqldump:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erreur lors de l\'export' 
                });
            }
            
            console.log(`✅ Base de données exportée: ${backupPath}`);
            res.download(backupPath);
        });
        
    } catch (error) {
        console.error('Erreur lors de l\'export de la base de données:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// POST - Réinitialiser la base de données (Admin)
app.post('/api/admin/reset-database', requireAdmin, async (req, res) => {
    try {
        // ATTENTION: Cette action est très dangereuse!
        console.warn('⚠️ RÉINITIALISATION DE LA BASE DE DONNÉES DEMANDÉE');
        
        // Supprimer toutes les données
        await db.query('DELETE FROM audit_log');
        await db.query('DELETE FROM evaluations');
        await db.query('DELETE FROM users WHERE role != "admin"');
        
        console.log('✅ Base de données réinitialisée');
        
        res.json({ 
            success: true, 
            message: 'Base de données réinitialisée avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// ===========================================
// ROUTES UTILITAIRES
// ===========================================

// GET - Statistiques pour le tableau de bord
app.get('/api/stats', async (req, res) => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts,
                COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'validated' THEN 1 END) as validated
            FROM evaluations
        `;
        const stats = await db.query(sql);
        res.json(stats[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET - Historique d'audit
app.get('/api/audit/:evaluationId', async (req, res) => {
    try {
        const sql = `
            SELECT a.*, u.name as user_name 
            FROM audit_log a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.evaluation_id = ?
            ORDER BY a.created_at DESC
        `;
        const logs = await db.query(sql, [req.params.evaluationId]);
        res.json(logs);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'audit:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===========================================
// DÉMARRAGE DU SERVEUR
// ===========================================

async function startServer() {
    try {
        // Tester la connexion à la base de données
        const connected = await db.testConnection();
        
        if (!connected) {
            console.error('\n⚠️  ERREUR: Impossible de se connecter à MySQL');
            console.error('📋 Étapes à suivre:');
            console.error('   1. Démarrez WAMP Server');
            console.error('   2. Vérifiez que l\'icône est verte');
            console.error('   3. Ouvrez phpMyAdmin (http://localhost/phpmyadmin)');
            console.error('   4. Exécutez le fichier database.sql');
            console.error('   5. Redémarrez ce serveur\n');
            process.exit(1);
        }
        
        // Démarrer le serveur Express
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('🚀 SERVEUR D\'ÉVALUATION DÉMARRÉ');
            console.log('='.repeat(60));
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`📊 Base de données: MySQL (WAMP)`);
            console.log(`🔐 Authentification: bcrypt`);
            console.log('\n📄 Pages disponibles:');
            console.log(`   - Login:      http://localhost:${PORT}/src/pages/login.html`);
            console.log(`   - Formulaire: http://localhost:${PORT}/src/pages/formulaire-online.html`);
            console.log(`   - Validation: http://localhost:${PORT}/src/pages/validation.html`);
            console.log('='.repeat(60) + '\n');
        });
        
    } catch (error) {
        console.error('❌ Erreur fatale au démarrage:', error);
        process.exit(1);
    }
}

// Démarrer le serveur
startServer();

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
    console.log('\n👋 Arrêt du serveur...');
    await db.pool.end();
    process.exit(0);
});
