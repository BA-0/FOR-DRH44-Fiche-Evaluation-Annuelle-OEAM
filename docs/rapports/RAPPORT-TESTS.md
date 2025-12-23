# 📊 RAPPORT DE TESTS - SYSTÈME D'ÉVALUATION

## 🎯 Objectif des tests
Tester le flux complet :
1. **Côté N+1 (Évaluateur)** : Créer et soumettre une évaluation
2. **Côté N+2 (Validateur)** : Recevoir et valider l'évaluation

---

## ✅ RÉSULTATS DES TESTS

### 📝 TEST 1 : Connexion N+1 (Évaluateur Bougar DIOUF)
**Endpoint :** `POST /api/auth/login`

**Données envoyées :**
```json
{
  "username": "evaluateur",
  "password": "eval123",
  "role": "N1"
}
```

**Résultat attendu :**
```json
{
  "token": "...",
  "role": "N1",
  "userName": "Évaluateur Test",
  "email": "evaluateur@example.com"
}
```

**✅ Statut :** DOIT RÉUSSIR si compte existe dans MySQL

---

### 📝 TEST 2 : Création d'évaluation (brouillon)
**Endpoint :** `POST /api/evaluations`

**Données test :**
- **Évalué :** Mamadou DIALLO
- **Fonction :** Développeur Senior
- **Direction :** Direction des Systèmes d'Information
- **Service :** Développement
- **Email N+2 :** ousseynou.seck@senico.sn
- **Score final :** 91.58%

**Détails des scores :**
- Objectifs : 91%
- Compétences professionnelles : 93%
- Compétences personnelles : 90%
- Compétences relationnelles : 93.5%

**Résultat attendu :**
```json
{
  "success": true,
  "evaluation": {
    "id": 123  // ID auto-généré
  },
  "message": "Évaluation créée avec succès"
}
```

**✅ Statut :** DOIT RÉUSSIR avec nouveau ID

---

### 📝 TEST 3 : Récupération de l'évaluation complète
**Endpoint :** `GET /api/evaluations/{id}/full`

**Vérifications :**
- ✅ Tous les champs JSON sont parsés (objectifs, competences, scores, observations, signatures)
- ✅ 5 objectifs présents
- ✅ 30 critères de compétences (10 par catégorie)
- ✅ 2 signatures (N et N+1)
- ✅ Statut = "draft"

**Résultat attendu :**
```json
{
  "success": true,
  "evaluation": {
    "id": 123,
    "evalue_nom": "Mamadou DIALLO",
    "status": "draft",
    "objectifs": [...],
    "competences": {...},
    "signatures": { "N": {...}, "N1": {...} }
  }
}
```

**✅ Statut :** DOIT RÉUSSIR avec données complètes

---

### 📝 TEST 4 : Soumission à N+2
**Endpoint :** `POST /api/evaluations/{id}/submit`

**Action :** Appel de la procédure stockée `sp_submit_evaluation`

**Vérifications :**
- ✅ Statut passe de "draft" à "submitted"
- ✅ Champ `submitted_at` renseigné avec timestamp actuel
- ✅ Entrée créée dans `audit_log` (action='submit')

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Évaluation soumise avec succès au validateur N+2"
}
```

**⚠️ Point d'attention :** Vérifier que la procédure stockée existe dans MySQL

**✅ Statut :** DOIT RÉUSSIR si procédure existe

---

### 📝 TEST 5 : Connexion N+2 (Validateur Ousseynou SECK)
**Endpoint :** `POST /api/auth/login`

**Données envoyées :**
```json
{
  "username": "ousseynou.seck",
  "password": "valid123",
  "role": "N2"
}
```

**Résultat attendu :**
```json
{
  "token": "...",
  "role": "N2",
  "userName": "Ousseynou SECK",
  "email": "ousseynou.seck@senico.sn"
}
```

**✅ Statut :** DOIT RÉUSSIR

---

### 📝 TEST 6 : Liste des évaluations en attente pour N+2
**Endpoint :** `GET /api/evaluations/pending/ousseynou.seck@senico.sn`

**Requête SQL exécutée :**
```sql
SELECT id, evalue_nom, evaluateur_nom, direction, service, 
       annee, email_n2, status, created_at, submitted_at,
       JSON_EXTRACT(scores, '$.scoreFinal') as score_final
FROM evaluations 
WHERE email_n2 = 'ousseynou.seck@senico.sn' 
AND status = 'submitted'
ORDER BY submitted_at DESC
```

**Résultat attendu :**
```json
{
  "success": true,
  "evaluations": [
    {
      "id": 123,
      "evalue_nom": "Mamadou DIALLO",
      "evaluateur_nom": "Bougar DIOUF",
      "direction": "Direction des Systèmes d'Information",
      "service": "Développement",
      "annee": 2025,
      "email_n2": "ousseynou.seck@senico.sn",
      "status": "submitted",
      "submitted_at": "2025-12-19T...",
      "score_final": 91.58
    }
  ]
}
```

**✅ Statut :** DOIT RÉUSSIR avec 1 évaluation trouvée

---

## 🔍 POINTS DE VÉRIFICATION CRITIQUES

### ✅ Base de données MySQL
```sql
-- Vérifier que la table evaluations existe
SHOW TABLES LIKE 'evaluations';

-- Vérifier que la procédure sp_submit_evaluation existe
SHOW PROCEDURE STATUS WHERE Db = 'formulaire_evaluation' AND Name = 'sp_submit_evaluation';

-- Vérifier les comptes utilisateurs
SELECT id, username, role, name, email FROM users;
```

### ✅ Serveur Node.js
- Port 3001 actif
- Connexion MySQL réussie
- Endpoints répondent avec format `{ success: true, ... }`

### ✅ Format des réponses API
Tous les endpoints doivent retourner :
- **Succès :** `{ success: true, data... }`
- **Erreur :** `{ success: false, error: "message" }`

---

## 🐛 PROBLÈMES POTENTIELS ET SOLUTIONS

### Problème 1 : "Erreur lors de la sauvegarde: undefined"
**Cause :** API retourne `{ id: ... }` au lieu de `{ success: true, evaluation: { id } }`
**Solution :** ✅ CORRIGÉ dans server-mysql.js

### Problème 2 : "Erreur de connexion au serveur"
**Cause :** Procédure stockée `sp_submit_evaluation` n'existe pas
**Solution :** Exécuter `verifier-base.sql` dans phpMyAdmin

### Problème 3 : Aucune évaluation en attente
**Cause :** Email N+2 ne correspond pas ou statut incorrect
**Solution :** Vérifier :
```sql
SELECT id, evalue_nom, email_n2, status FROM evaluations WHERE id = 123;
```

### Problème 4 : Bouton "Télécharger PDF" ne fonctionne pas
**Cause :** API `/full` ne retourne pas `{ success: true, evaluation: {...} }`
**Solution :** ✅ CORRIGÉ dans server-mysql.js

---

## 📋 CHECKLIST AVANT LES TESTS

- [ ] WAMP Server démarré (icône verte)
- [ ] MySQL actif sur port 3306
- [ ] Base `formulaire_evaluation` existe
- [ ] Tables créées (users, evaluations, audit_log)
- [ ] Procédures stockées créées (exécuter verifier-base.sql)
- [ ] Serveur Node.js démarré (`npm start`)
- [ ] Port 3001 disponible

---

## 🎯 EXÉCUTION MANUELLE DES TESTS

### Option 1 : Via navigateur

1. **Test N+1 (Évaluateur) :**
   - Ouvrir : `http://localhost:3001/formulaire-online.html`
   - Login : evaluateur / eval123
   - Remplir formulaire test
   - Email N+2 : `ousseynou.seck@senico.sn`
   - Cliquer "Soumettre à N+2"
   - ✅ Vérifier : Message succès + page rafraîchie

2. **Test N+2 (Validateur) :**
   - Ouvrir : `http://localhost:3001/validation.html`
   - Login : ousseynou.seck / valid123
   - Entrer email : `ousseynou.seck@senico.sn`
   - ✅ Vérifier : Liste des évaluations s'affiche
   - Cliquer sur une évaluation
   - Dessiner signature N+2
   - Valider
   - ✅ Vérifier : Statut passe à "validated"

### Option 2 : Via script automatique

```batch
# Dans un terminal séparé (pas celui du serveur)
cd "c:\Users\cheri\Documents\SENICO\formulaire evaluation"
run-tests.bat
```

---

## 📊 RÉSULTATS ATTENDUS FINAUX

| Test | Endpoint | Statut attendu | Vérifié |
|------|----------|----------------|---------|
| Connexion N+1 | POST /api/auth/login | ✅ Token reçu | ⬜ |
| Création évaluation | POST /api/evaluations | ✅ ID reçu | ⬜ |
| Récup complète | GET /api/evaluations/:id/full | ✅ Données parsées | ⬜ |
| Soumission N+2 | POST /api/evaluations/:id/submit | ✅ Statut=submitted | ⬜ |
| Connexion N+2 | POST /api/auth/login | ✅ Token reçu | ⬜ |
| Liste attente | GET /api/evaluations/pending/:email | ✅ 1 évaluation | ⬜ |

---

## 🎉 CONCLUSION

**Si tous les tests passent :**
- ✅ Le système fonctionne de bout en bout
- ✅ N+1 peut créer et soumettre
- ✅ N+2 peut voir et valider
- ✅ Base de données correctement configurée
- ✅ APIs répondent au bon format

**Système OPÉRATIONNEL ! 🚀**
