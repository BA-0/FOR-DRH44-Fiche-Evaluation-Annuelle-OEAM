-- ============================================
-- Script de création de la base de données
-- Système d'Évaluation 100% Digital
-- ============================================

-- Créer la base de données
DROP DATABASE IF EXISTS formulaire_evaluation;
CREATE DATABASE formulaire_evaluation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE formulaire_evaluation;

-- ============================================
-- Table des utilisateurs
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Mot de passe hashé avec bcrypt',
    role ENUM('N1', 'N2', 'admin', 'DRH') NOT NULL COMMENT 'N1 = Évaluateur, N2 = Validateur, admin = Administrateur, DRH = Direction RH',
    name VARCHAR(100) NOT NULL COMMENT 'Prénom et Nom complet',
    email VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    first_login BOOLEAN DEFAULT TRUE COMMENT 'TRUE si l''utilisateur doit changer son mot de passe à la première connexion',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table des évaluations
-- ============================================
CREATE TABLE evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Informations générales
    date_evaluation DATE,
    direction VARCHAR(100),
    service VARCHAR(100),
    evaluateur_nom VARCHAR(100),
    evaluateur_fonction VARCHAR(100),
    evalue_nom VARCHAR(100),
    evalue_fonction VARCHAR(100),
    categorie VARCHAR(50),
    annee INT,
    email_n2 VARCHAR(100),
    
    -- Données complexes en JSON
    objectifs JSON COMMENT 'Liste des 5 objectifs avec indicateurs et taux',
    competences JSON COMMENT 'Compétences (30 critères): professionnelles, personnelles, relationnelles',
    scores JSON COMMENT 'Scores calculés: N1, N2, final, totaux partiels',
    observations JSON COMMENT 'Observations N+1 et N',
    signatures JSON COMMENT 'Signatures électroniques N, N+1, N+2 en base64',
    
    -- Statut et suivi
    status ENUM('draft', 'submitted', 'validated') DEFAULT 'draft',
    created_by INT COMMENT 'ID de l\'utilisateur créateur',
    
    -- Dates de traçabilité
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    validated_at TIMESTAMP NULL,
    
    -- Clés étrangères et index
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_email_n2 (email_n2),
    INDEX idx_evalue_nom (evalue_nom),
    INDEX idx_annee (annee),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table d'historique des actions
-- ============================================
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evaluation_id INT,
    user_id INT,
    action VARCHAR(50) NOT NULL COMMENT 'create, update, submit, validate, delete',
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    details TEXT COMMENT 'Détails de l\'action en JSON',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_evaluation_id (evaluation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insertion des utilisateurs de démonstration
-- Mots de passe hashés avec bcrypt (10 rounds)
-- ============================================

-- Utilisateur N+1 (Évaluateur)
-- Login: evaluateur / Password: eval123
INSERT INTO users (username, password, role, name, email) VALUES
('evaluateur', '$2b$10$JwwV.yB1DNCKv7YLmXo1kuRcqdaGJyHE0NPPZ3943.Rd0zzM8vWeG', 'N1', 'Jean Dupont', 'jean.dupont@entreprise.com');

-- Utilisateur N+2 (Validateur)
-- Login: validateur / Password: valid123
INSERT INTO users (username, password, role, name, email) VALUES
('validateur', '$2b$10$F3MFXYS8tteUOZaCUDw3neNr.DOtxBCdhokvmNZfWHBhhyelL.9Iy', 'N2', 'Marie Martin', 'marie.martin@entreprise.com');

-- ============================================
-- Vues utiles pour les statistiques
-- ============================================

-- Vue des évaluations en attente par validateur
CREATE VIEW v_pending_evaluations AS
SELECT 
    e.id,
    e.evalue_nom,
    e.evaluateur_nom,
    e.direction,
    e.service,
    e.annee,
    e.email_n2,
    e.status,
    e.created_at,
    e.submitted_at,
    JSON_EXTRACT(e.scores, '$.scoreFinal') as score_final
FROM evaluations e
WHERE e.status = 'submitted'
ORDER BY e.submitted_at DESC;

-- Vue des statistiques par validateur
CREATE VIEW v_validation_stats AS
SELECT 
    email_n2,
    COUNT(CASE WHEN status = 'submitted' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'validated' THEN 1 END) as validated_count,
    COUNT(*) as total_count
FROM evaluations
WHERE status IN ('submitted', 'validated')
GROUP BY email_n2;

-- ============================================
-- Procédures stockées utiles
-- ============================================

DELIMITER //

-- Soumettre une évaluation à N+2
CREATE PROCEDURE sp_submit_evaluation(
    IN p_evaluation_id INT,
    IN p_user_id INT
)
BEGIN
    UPDATE evaluations 
    SET status = 'submitted',
        submitted_at = CURRENT_TIMESTAMP
    WHERE id = p_evaluation_id 
    AND status = 'draft';
    
    -- Log de l'action
    INSERT INTO audit_log (evaluation_id, user_id, action, old_status, new_status)
    VALUES (p_evaluation_id, p_user_id, 'submit', 'draft', 'submitted');
END //

-- Valider une évaluation par N+2
CREATE PROCEDURE sp_validate_evaluation(
    IN p_evaluation_id INT,
    IN p_user_id INT,
    IN p_signature JSON
)
BEGIN
    DECLARE current_signatures JSON;
    
    -- Récupérer les signatures existantes
    SELECT signatures INTO current_signatures 
    FROM evaluations 
    WHERE id = p_evaluation_id;
    
    -- Ajouter la signature N+2
    SET current_signatures = JSON_SET(current_signatures, '$.N2', p_signature);
    
    -- Mettre à jour l'évaluation
    UPDATE evaluations 
    SET status = 'validated',
        validated_at = CURRENT_TIMESTAMP,
        signatures = current_signatures
    WHERE id = p_evaluation_id 
    AND status = 'submitted';
    
    -- Log de l'action
    INSERT INTO audit_log (evaluation_id, user_id, action, old_status, new_status)
    VALUES (p_evaluation_id, p_user_id, 'validate', 'submitted', 'validated');
END //

DELIMITER ;

-- ============================================
-- Afficher les informations
-- ============================================
SELECT '✅ Base de données créée avec succès!' as status;
SELECT COUNT(*) as nb_users, 'utilisateurs créés' as info FROM users;
SELECT 'Utilisateurs de démonstration:' as info;
SELECT username, role, name, email FROM users;
