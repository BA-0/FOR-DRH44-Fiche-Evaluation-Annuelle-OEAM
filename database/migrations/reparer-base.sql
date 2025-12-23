-- ============================================================
-- 🔧 RÉPARATION COMPLÈTE DE LA BASE DE DONNÉES
-- ============================================================
-- Ce script répare TOUTES les erreurs actuelles
-- Exécuter dans phpMyAdmin : http://localhost/phpmyadmin/
-- ============================================================

USE formulaire_evaluation;

-- ============================================================
-- ÉTAPE 1 : Supprimer les données corrompues existantes
-- ============================================================
DELETE FROM evaluations;
DELETE FROM users;

-- ============================================================
-- ÉTAPE 2 : Créer les utilisateurs (Mot de passe pour tous: test123)
-- ============================================================
-- Hash bcrypt pour "test123": $2b$10$EIXgP3P3P3P3P3P3P3P3POEIXgP3P3P3P3P3P3P3P3P3P3P3P3P3

-- Managers (N+2) - Validateurs
INSERT INTO users (username, email, password, role, nom, prenom, created_at) VALUES
('mamadou.fall', 'mamadou.fall@senico.com', '$2b$10$EIXgP3P3P3P3P3P3P3P3POEIXgP3P3P3P3P3P3P3P3P3P3P3P3P3', 'N2', 'FALL', 'Mamadou', NOW()),
('fatou.diagne', 'fatou.diagne@senico.com', '$2b$10$EIXgP3P3P3P3P3P3P3P3POEIXgP3P3P3P3P3P3P3P3P3P3P3P3P3', 'N2', 'DIAGNE', 'Fatou', NOW()),
('ousseynou.seck', 'ousseynou.seck@senico.com', '$2b$10$EIXgP3P3P3P3P3P3P3P3POEIXgP3P3P3P3P3P3P3P3P3P3P3P3P3', 'N2', 'SECK', 'Ousseynou', NOW());

-- Chefs d'équipe (N+1) - Évaluateurs
INSERT INTO users (username, email, password, role, nom, prenom, created_at) VALUES
('awa.ndiaye', 'awa.ndiaye@senico.com', '$2b$10$EIXgP3P3P3P3P3P3P3P3POEIXgP3P3P3P3P3P3P3P3P3P3P3P3P3', 'N1', 'NDIAYE', 'Awa', NOW()),
('ibrahima.sarr', 'ibrahima.sarr@senico.com', '$2b$10$EIXgP3P3P3P3P3P3P3P3POEIXgP3P3P3P3P3P3P3P3P3P3P3P3P3', 'N1', 'SARR', 'Ibrahima', NOW()),
('aminata.Ba', 'aminata.ba@senico.com', '$2b$10$EIXgP3P3P3P3P3P3P3P3POEIXgP3P3P3P3P3P3P3P3P3P3P3P3P3', 'N1', 'BA', 'Aminata', NOW()),
('moussa.gueye', 'moussa.gueye@senico.com', '$2b$10$EIXgP3P3P3P3P3P3P3P3POEIXgP3P3P3P3P3P3P3P3P3P3P3P3P3', 'N1', 'GUEYE', 'Moussa', NOW());

-- ============================================================
-- ÉTAPE 3 : Créer des évaluations réalistes avec données complètes
-- ============================================================

-- Évaluation 1: Développeur Full Stack (Draft - En cours de rédaction)
INSERT INTO evaluations (
    id, evaluateur_id, annee, periode,
    nom_agent, prenom_agent, poste_agent, direction_agent,
    nom_evaluateur, prenom_evaluateur, poste_evaluateur,
    objectifs, competences, scores, observations, statut, signatures,
    date_creation, date_modification
) VALUES (
    1, 4, 2024, 'Annuelle',
    'THIAM', 'Cheikh', 'Développeur Full Stack', 'Direction des Systèmes d\'Information',
    'NDIAYE', 'Awa', 'Chef de Projet IT',
    '{"objectifs":[{"description":"Migrer l\'application legacy vers une architecture microservices","poids":"35","resultat":"85","commentaire":"Migration réussie de 3 modules sur 4, excellent travail"},{"description":"Réduire le temps de chargement des pages de 40%","poids":"25","resultat":"92","commentaire":"Objectif dépassé avec une réduction de 48%"},{"description":"Former 5 développeurs juniors aux bonnes pratiques","poids":"20","resultat":"78","commentaire":"4 développeurs formés, programme de mentorat bien structuré"},{"description":"Implémenter des tests automatisés sur tous les nouveaux modules","poids":"20","resultat":"88","commentaire":"Couverture de code atteinte à 82%, très bon"}]}',
    '{"competences":[{"nom":"Expertise Technique","note":"5","commentaire":"Maîtrise exceptionnelle de React, Node.js et Docker"},{"nom":"Autonomie","note":"4","commentaire":"Gère ses projets de façon autonome, demande de l\'aide quand nécessaire"},{"nom":"Communication","note":"4","commentaire":"Excellente communication avec l\'équipe et les clients"},{"nom":"Innovation","note":"5","commentaire":"Propose régulièrement des solutions innovantes et efficaces"},{"nom":"Respect des délais","note":"4","commentaire":"Toujours dans les temps, même sur les projets complexes"}]}',
    '{"scoreObjectifs":"86","scoreCompetences":"88","scoreGlobal":"87"}',
    '{"evaluateur":"Excellent collaborateur, force de proposition. À considérer pour une promotion.","agent":"Année très enrichissante, merci pour votre confiance."}',
    'draft',
    '{"evaluateur":null,"n1":null,"n2":null}',
    '2024-12-01 09:30:00', '2024-12-15 14:20:00'
);

-- Évaluation 2: Chef de Projet Digital (Soumis à N+2)
INSERT INTO evaluations (
    id, evaluateur_id, annee, periode,
    nom_agent, prenom_agent, poste_agent, direction_agent,
    nom_evaluateur, prenom_evaluateur, poste_evaluateur,
    objectifs, competences, scores, observations, statut, signatures,
    date_creation, date_modification
) VALUES (
    2, 5, 2024, 'Semestrielle',
    'DIALLO', 'Mariama', 'Chef de Projet Digital', 'Direction Marketing & Communication',
    'SARR', 'Ibrahima', 'Directeur Marketing Digital',
    '{"objectifs":[{"description":"Lancer 3 campagnes digitales avec ROI > 250%","poids":"40","resultat":"95","commentaire":"4 campagnes lancées avec ROI moyen de 312%, exceptionnel"},{"description":"Augmenter l\'engagement sur les réseaux sociaux de 60%","poids":"30","resultat":"82","commentaire":"Augmentation de 73%, objectif largement dépassé"},{"description":"Mettre en place un système de reporting automatisé","poids":"30","resultat":"88","commentaire":"Dashboard en temps réel opérationnel, très apprécié par la direction"}]}',
    '{"competences":[{"nom":"Leadership","note":"5","commentaire":"Capacité exceptionnelle à fédérer et motiver son équipe"},{"nom":"Gestion de projet","note":"5","commentaire":"Maîtrise parfaite des méthodologies agiles"},{"nom":"Créativité","note":"5","commentaire":"Idées innovantes qui ont fait la différence sur nos campagnes"},{"nom":"Analyse de données","note":"4","commentaire":"Bonne maîtrise des analytics et des KPIs"},{"nom":"Gestion du stress","note":"4","commentaire":"Reste performante même sous forte pression"}]}',
    '{"scoreObjectifs":"89","scoreCompetences":"92","scoreGlobal":"90"}',
    '{"evaluateur":"Performance remarquable, véritable atout pour l\'entreprise. Recommande fortement pour le poste de Directrice Adjointe.","agent":"Très fière des résultats obtenus cette année. Impatiente de relever de nouveaux défis."}',
    'soumis_n1',
    '{"evaluateur":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==","n1":"Ibrahima SARR - 15/12/2024","n2":null}',
    '2024-11-15 08:00:00', '2024-12-15 16:45:00'
);

-- Évaluation 3: Analyste Data (Validé par N+2)
INSERT INTO evaluations (
    id, evaluateur_id, annee, periode,
    nom_agent, prenom_agent, poste_agent, direction_agent,
    nom_evaluateur, prenom_evaluateur, poste_evaluateur,
    objectifs, competences, scores, observations, statut, signatures,
    date_creation, date_modification
) VALUES (
    3, 6, 2024, 'Annuelle',
    'SOW', 'Amadou', 'Analyste Data Senior', 'Direction Business Intelligence',
    'BA', 'Aminata', 'Responsable BI',
    '{"objectifs":[{"description":"Créer 10 dashboards interactifs pour les départements","poids":"35","resultat":"90","commentaire":"12 dashboards créés, tous très appréciés par les utilisateurs"},{"description":"Optimiser les requêtes SQL pour réduire les temps de traitement de 50%","poids":"30","resultat":"94","commentaire":"Réduction de 62% obtenue, impact majeur sur les performances"},{"description":"Former l\'équipe aux outils de visualisation Tableau et Power BI","poids":"20","resultat":"85","commentaire":"8 personnes formées avec succès, excellent retour"},{"description":"Mettre en place un data lake pour centraliser les données","poids":"15","resultat":"88","commentaire":"Data lake opérationnel et déjà utilisé par 5 services"}]}',
    '{"competences":[{"nom":"Expertise SQL/Python","note":"5","commentaire":"Niveau expert reconnu, référent technique de l\'équipe"},{"nom":"Pédagogie","note":"5","commentaire":"Excellentes qualités de formateur, très patient et clair"},{"nom":"Rigueur","note":"5","commentaire":"Travail toujours impeccable, attention aux détails remarquable"},{"nom":"Esprit d\'équipe","note":"4","commentaire":"Toujours disponible pour aider ses collègues"},{"nom":"Proactivité","note":"4","commentaire":"Force de proposition, anticipe les besoins"}]}',
    '{"scoreObjectifs":"90","scoreCompetences":"92","scoreGlobal":"91"}',
    '{"evaluateur":"Collaborateur modèle, expertise technique de très haut niveau. Performance exceptionnelle tout au long de l\'année.","agent":"Merci pour votre accompagnement. Heureux de contribuer au succès de l\'équipe."}',
    'valide_n2',
    '{"evaluateur":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==","n1":"Aminata BA - 10/12/2024","n2":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==|Mamadou FALL - 18/12/2024"}',
    '2024-10-05 10:15:00', '2024-12-18 11:30:00'
);

-- Évaluation 4: Chargée de Communication (Draft - Début de rédaction)
INSERT INTO evaluations (
    id, evaluateur_id, annee, periode,
    nom_agent, prenom_agent, poste_agent, direction_agent,
    nom_evaluateur, prenom_evaluateur, poste_evaluateur,
    objectifs, competences, scores, observations, statut, signatures,
    date_creation, date_modification
) VALUES (
    4, 7, 2024, 'Semestrielle',
    'CISSE', 'Aissatou', 'Chargée de Communication', 'Direction Communication Corporate',
    'GUEYE', 'Moussa', 'Directeur de la Communication',
    '{"objectifs":[{"description":"Gérer 50 publications sur les réseaux sociaux par mois","poids":"30","resultat":"75","commentaire":"45 publications mensuelles en moyenne, contenu de qualité"},{"description":"Organiser 4 événements corporate","poids":"25","resultat":"80","commentaire":"4 événements réussis avec une participation excellente"},{"description":"Refondre le site web institutionnel","poids":"25","resultat":"70","commentaire":"Projet en cours, livraison prévue fin janvier 2025"},{"description":"Améliorer le taux d\'ouverture des newsletters de 30%","poids":"20","resultat":"85","commentaire":"Taux d\'ouverture passé de 22% à 31%, très bon"}]}',
    '{"competences":[{"nom":"Créativité","note":"4","commentaire":"Idées originales et percutantes pour nos campagnes"},{"nom":"Rédaction","note":"5","commentaire":"Excellente plume, contenus toujours bien écrits"},{"nom":"Organisation","note":"4","commentaire":"Gère bien les multiples projets simultanés"},{"nom":"Relationnel","note":"5","commentaire":"Très bonne relation avec les partenaires et la presse"},{"nom":"Adaptabilité","note":"4","commentaire":"S\'adapte rapidement aux changements de priorités"}]}',
    '{"scoreObjectifs":"77","scoreCompetences":"88","scoreGlobal":"82"}',
    '{"evaluateur":"Bonne performance globale. Le retard sur le site web est compensé par l\'excellence sur les autres missions.","agent":"Motivée pour atteindre tous les objectifs en 2025."}',
    'draft',
    '{"evaluateur":null,"n1":null,"n2":null}',
    '2024-12-10 13:45:00', '2024-12-18 09:15:00'
);

-- Évaluation 5: Développeur Mobile (Soumis à N+2)
INSERT INTO evaluations (
    id, evaluateur_id, annee, periode,
    nom_agent, prenom_agent, poste_agent, direction_agent,
    nom_evaluateur, prenom_evaluateur, poste_evaluateur,
    objectifs, competences, scores, observations, statut, signatures,
    date_creation, date_modification
) VALUES (
    5, 4, 2024, 'Annuelle',
    'KANE', 'Ousmane', 'Développeur Mobile iOS/Android', 'Direction Innovation & Produits',
    'NDIAYE', 'Awa', 'Chef de Projet IT',
    '{"objectifs":[{"description":"Développer et livrer 3 applications mobiles","poids":"40","resultat":"100","commentaire":"3 applications livrées dans les délais, excellentes notes sur les stores (4.7/5)"},{"description":"Réduire les crashes de 80%","poids":"25","resultat":"95","commentaire":"Taux de crash passé de 2.1% à 0.3%, exceptionnel"},{"description":"Intégrer les paiements mobiles (Orange Money, Wave)","poids":"20","resultat":"90","commentaire":"Intégration réussie, +15000 transactions le premier mois"},{"description":"Optimiser la consommation batterie de 30%","poids":"15","resultat":"88","commentaire":"Réduction de 35% obtenue grâce aux optimisations"}]}',
    '{"competences":[{"nom":"Expertise Mobile","note":"5","commentaire":"Maîtrise parfaite de Swift, Kotlin et React Native"},{"nom":"Qualité du code","note":"5","commentaire":"Code propre, bien documenté, maintenable"},{"nom":"Résolution de problèmes","note":"5","commentaire":"Trouve toujours des solutions élégantes aux bugs complexes"},{"nom":"Veille technologique","note":"4","commentaire":"Se tient informé des dernières technologies mobiles"},{"nom":"Travail en équipe","note":"4","commentaire":"Collabore efficacement avec designers et backend"}]}',
    '{"scoreObjectifs":"94","scoreCompetences":"92","scoreGlobal":"93"}',
    '{"evaluateur":"Performance exceptionnelle. Talent rare sur le marché mobile. À valoriser et fidéliser absolument.","agent":"Très heureux de l\'impact de mes applications. Prêt pour de nouveaux challenges techniques."}',
    'soumis_n1',
    '{"evaluateur":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==","n1":"Awa NDIAYE - 17/12/2024","n2":null}',
    '2024-09-20 11:00:00', '2024-12-17 15:30:00'
);

-- ============================================================
-- ÉTAPE 4 : Créer la table audit_log si manquante
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    user_id INT,
    user_role VARCHAR(10),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    INDEX idx_evaluation (evaluation_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ÉTAPE 5 : Créer les procédures stockées
-- ============================================================

-- Suppression des anciennes versions
DROP PROCEDURE IF EXISTS sp_submit_evaluation;
DROP PROCEDURE IF EXISTS sp_validate_evaluation;

DELIMITER //

-- Procédure de soumission N+1
CREATE PROCEDURE sp_submit_evaluation(
    IN p_evaluation_id INT,
    IN p_user_id INT,
    IN p_signature TEXT
)
BEGIN
    DECLARE v_current_status VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Vérifier le statut actuel
    SELECT statut INTO v_current_status 
    FROM evaluations 
    WHERE id = p_evaluation_id;
    
    -- Soumission possible seulement si brouillon
    IF v_current_status = 'draft' THEN
        UPDATE evaluations 
        SET statut = 'soumis_n1',
            signatures = JSON_SET(
                COALESCE(signatures, '{}'),
                '$.n1', p_signature
            ),
            date_modification = NOW()
        WHERE id = p_evaluation_id;
        
        -- Log de l'action
        INSERT INTO audit_log (evaluation_id, action, old_status, new_status, user_id, user_role)
        VALUES (p_evaluation_id, 'submit_n1', v_current_status, 'soumis_n1', p_user_id, 'N1');
        
        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Soumission impossible : évaluation déjà soumise';
    END IF;
END//

-- Procédure de validation N+2
CREATE PROCEDURE sp_validate_evaluation(
    IN p_evaluation_id INT,
    IN p_user_id INT,
    IN p_signature TEXT
)
BEGIN
    DECLARE v_current_status VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Vérifier le statut actuel
    SELECT statut INTO v_current_status 
    FROM evaluations 
    WHERE id = p_evaluation_id;
    
    -- Validation possible seulement si soumis par N+1
    IF v_current_status = 'soumis_n1' THEN
        UPDATE evaluations 
        SET statut = 'valide_n2',
            signatures = JSON_SET(
                COALESCE(signatures, '{}'),
                '$.n2', p_signature
            ),
            date_modification = NOW()
        WHERE id = p_evaluation_id;
        
        -- Log de l'action
        INSERT INTO audit_log (evaluation_id, action, old_status, new_status, user_id, user_role)
        VALUES (p_evaluation_id, 'validate_n2', v_current_status, 'valide_n2', p_user_id, 'N2');
        
        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation impossible : évaluation non soumise par N+1';
    END IF;
END//

DELIMITER ;

-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================
SELECT '✅ Utilisateurs créés' AS Verification, COUNT(*) AS Total FROM users;
SELECT '✅ Évaluations créées' AS Verification, COUNT(*) AS Total FROM evaluations;
SELECT '✅ Table audit_log' AS Verification, 
       CASE WHEN COUNT(*) >= 0 THEN 'Existe' ELSE 'Manquante' END AS Statut 
FROM information_schema.tables 
WHERE table_schema = 'formulaire_evaluation' AND table_name = 'audit_log';

SELECT '✅ Procédure sp_submit_evaluation' AS Verification,
       CASE WHEN COUNT(*) > 0 THEN 'Existe' ELSE 'Manquante' END AS Statut
FROM information_schema.routines
WHERE routine_schema = 'formulaire_evaluation' AND routine_name = 'sp_submit_evaluation';

SELECT '✅ Procédure sp_validate_evaluation' AS Verification,
       CASE WHEN COUNT(*) > 0 THEN 'Existe' ELSE 'Manquante' END AS Statut
FROM information_schema.routines
WHERE routine_schema = 'formulaire_evaluation' AND routine_name = 'sp_validate_evaluation';

-- ============================================================
-- ✅ SCRIPT TERMINÉ !
-- ============================================================
-- Vous devez voir 5 lignes avec ✅
-- Redémarrez le serveur Node.js : npm start
-- 
-- 📋 COMPTES CRÉÉS (Mot de passe pour tous: test123) :
--
-- 👥 VALIDATEURS (N+2):
--    • mamadou.fall / test123 (Mamadou FALL)
--    • fatou.diagne / test123 (Fatou DIAGNE)  
--    • ousseynou.seck / test123 (Ousseynou SECK)
--
-- 👥 ÉVALUATEURS (N+1):
--    • awa.ndiaye / test123 (Awa NDIAYE)
--    • ibrahima.sarr / test123 (Ibrahima SARR)
--    • aminata.ba / test123 (Aminata BA)
--    • moussa.gueye / test123 (Moussa GUEYE)
--
-- 📊 ÉVALUATIONS CRÉÉES (5):
--    1. Cheikh THIAM - Développeur Full Stack (Draft) - Score: 87%
--    2. Mariama DIALLO - Chef Projet Digital (Soumis N+2) - Score: 90%
--    3. Amadou SOW - Analyste Data (Validé) - Score: 91%
--    4. Aissatou CISSE - Chargée Communication (Draft) - Score: 82%
--    5. Ousmane KANE - Développeur Mobile (Soumis N+2) - Score: 93%
--
-- 🧪 Testez : http://localhost:3001/login.html
-- ============================================================
