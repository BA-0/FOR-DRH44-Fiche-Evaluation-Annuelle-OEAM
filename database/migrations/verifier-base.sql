-- ============================================
-- SCRIPT COMPLET DE VÉRIFICATION ET CORRECTION
-- Exécuter ce script dans phpMyAdmin
-- ============================================

USE formulaire_evaluation;

-- ============================================
-- 1. VÉRIFICATION DES TABLES
-- ============================================

-- Créer la table audit_log si elle n'existe pas
CREATE TABLE IF NOT EXISTS audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evaluation_id INT,
    user_id INT,
    action VARCHAR(50) NOT NULL COMMENT 'create, update, submit, validate, delete',
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_evaluation_id (evaluation_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. CRÉATION DES PROCÉDURES STOCKÉES
-- ============================================

-- Supprimer les anciennes versions
DROP PROCEDURE IF EXISTS sp_submit_evaluation;
DROP PROCEDURE IF EXISTS sp_validate_evaluation;

DELIMITER //

-- Procédure de soumission à N+2
CREATE PROCEDURE sp_submit_evaluation(
    IN p_evaluation_id INT,
    IN p_user_id INT
)
BEGIN
    DECLARE v_current_status VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erreur lors de la soumission';
    END;
    
    START TRANSACTION;
    
    -- Vérifier le statut actuel
    SELECT status INTO v_current_status
    FROM evaluations 
    WHERE id = p_evaluation_id;
    
    -- Mettre à jour seulement si c'est un brouillon
    IF v_current_status = 'draft' THEN
        UPDATE evaluations 
        SET status = 'submitted',
            submitted_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_evaluation_id;
        
        -- Log de l'action
        INSERT INTO audit_log (evaluation_id, user_id, action, old_status, new_status)
        VALUES (p_evaluation_id, p_user_id, 'submit', 'draft', 'submitted');
        
        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'L\'évaluation n\'est pas en mode brouillon';
    END IF;
END //

-- Procédure de validation par N+2
CREATE PROCEDURE sp_validate_evaluation(
    IN p_evaluation_id INT,
    IN p_user_id INT,
    IN p_signature JSON
)
BEGIN
    DECLARE current_signatures JSON;
    DECLARE v_current_status VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erreur lors de la validation';
    END;
    
    START TRANSACTION;
    
    -- Vérifier le statut actuel
    SELECT status INTO v_current_status
    FROM evaluations 
    WHERE id = p_evaluation_id;
    
    -- Mettre à jour seulement si c'est soumis
    IF v_current_status = 'submitted' THEN
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
            updated_at = CURRENT_TIMESTAMP,
            signatures = current_signatures
        WHERE id = p_evaluation_id;
        
        -- Log de l'action
        INSERT INTO audit_log (evaluation_id, user_id, action, old_status, new_status)
        VALUES (p_evaluation_id, p_user_id, 'validate', 'submitted', 'validated');
        
        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'L\'évaluation n\'est pas en attente de validation';
    END IF;
END //

DELIMITER ;

-- ============================================
-- 3. VÉRIFICATION FINALE
-- ============================================

SELECT '✅ Script exécuté avec succès !' as Resultat;

SELECT 
    'audit_log' as TableName,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Manquante' END as Statut
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'formulaire_evaluation' AND TABLE_NAME = 'audit_log'

UNION ALL

SELECT 
    'sp_submit_evaluation' as TableName,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Manquante' END as Statut
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'formulaire_evaluation' AND ROUTINE_NAME = 'sp_submit_evaluation'

UNION ALL

SELECT 
    'sp_validate_evaluation' as TableName,
    CASE WHEN COUNT(*) > 0 THEN '✅ Existe' ELSE '❌ Manquante' END as Statut
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'formulaire_evaluation' AND ROUTINE_NAME = 'sp_validate_evaluation';

