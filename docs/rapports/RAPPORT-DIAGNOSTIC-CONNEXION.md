# 🔍 RAPPORT DE DIAGNOSTIC - PROBLÈME DE CONNEXION AU SERVEUR

**Date :** 19 décembre 2025  
**Statut :** ✅ RÉSOLU

---

## 🚨 PROBLÈME IDENTIFIÉ

Le serveur Node.js **n'était pas démarré**. L'application frontend tentait de se connecter à `http://localhost:3001/api`, mais aucun serveur n'écoutait sur le port 3001.

---

## ✅ DIAGNOSTIC EFFECTUÉ

### 1. Vérification des dépendances
```bash
npm list
```
**Résultat :** ✅ Toutes les dépendances sont installées :
- express@4.22.1
- mysql2@3.16.0
- bcrypt@5.1.1
- cors@2.8.5
- etc.

### 2. Vérification de MySQL (WAMP)
```bash
netstat -ano | findstr :3306
```
**Résultat :** ✅ MySQL est actif et écoute sur le port 3306

### 3. Vérification de la base de données
```bash
node verifier-etat.js
```
**Résultat :** ✅ Base de données `formulaire_evaluation` existe et contient :
- 7 utilisateurs (4 N1 et 3 N2)
- Structure de table correcte

### 4. Vérification du serveur Node.js
```bash
netstat -ano | findstr :3001
```
**Résultat initial :** ❌ Aucun processus sur le port 3001 (serveur non démarré)

---

## 🔧 SOLUTION APPLIQUÉE

### Démarrage du serveur
```bash
node server-mysql.js
```

**Résultat :** ✅ Serveur démarré avec succès

```
✅ Connexion à MySQL réussie!
📊 Base de données: formulaire_evaluation

🚀 SERVEUR D'ÉVALUATION DÉMARRÉ
📍 URL: http://localhost:3001
📊 Base de données: MySQL (WAMP)
🔐 Authentification: bcrypt

📄 Pages disponibles:
   - Login:      http://localhost:3001/login.html
   - Formulaire: http://localhost:3001/formulaire-online.html
   - Validation: http://localhost:3001/validation.html
```

---

## 📋 ARCHITECTURE DE L'APPLICATION

### Configuration de la connexion

**Fichier : `db.config.js`**
```javascript
{
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'formulaire_evaluation'
}
```

**Fichier : `formulaire-online.js` (ligne 2)**
```javascript
const API_URL = 'http://localhost:3001/api';
```

**Fichier : `login.html` (ligne 226)**
```javascript
fetch('http://localhost:3001/api/auth/login', { ... })
```

### Utilisateurs disponibles dans la base

| Rôle | Username | Nom | Email |
|------|----------|-----|-------|
| **N2** | cherif.ba | CHERIF MOUHAMETH OUMAR BA | cherif.ba@senico.sn |
| **N2** | fatou.diagne | Fatou DIAGNE | fatou.diagne@senico.com |
| **N2** | ousseynou.seck | Ousseynou SECK | ousseynou.seck@senico.sn |
| **N1** | awa.ndiaye | Awa NDIAYE | awa.ndiaye@senico.com |
| **N1** | bougar.diouf | BOUGAR DIOUF | bougar.diouf@senico.sn |
| **N1** | aminata.ba | Aminata BA | aminata.ba@senico.com |
| **N1** | moussa.gueye | Moussa GUEYE | moussa.gueye@senico.com |

**Note :** Les comptes de démonstration (evaluateur/validateur) ne sont PAS dans la base de données MySQL. Ils sont définis en dur dans `server.js` (version JSON, pas utilisée).

---

## 🎯 PROCÉDURE DE DÉMARRAGE

### Méthode 1 : Utiliser le fichier batch (Recommandé)
```bash
DEMARRER-SERVEUR.bat
```
Ce script :
1. Vérifie que MySQL est démarré
2. Lance le serveur Node.js
3. Affiche les URLs d'accès

### Méthode 2 : Démarrage manuel
```bash
# 1. Vérifier que WAMP est démarré (icône verte)
# 2. Ouvrir un terminal dans le dossier du projet
cd "c:\Users\cheri\Documents\SENICO\formulaire evaluation"

# 3. Démarrer le serveur
node server-mysql.js
```

---

## 🔐 TEST DE CONNEXION

Pour tester la connexion :

1. Ouvrir le navigateur
2. Aller sur : http://localhost:3001/login.html
3. Utiliser un compte de test :
   - **N+1 (Évaluateur)** : `awa.ndiaye` / `test123`
   - **N+2 (Validateur)** : `mamadou.fall` / `test123` *(À VÉRIFIER dans la base)*

---

## ⚠️ PROBLÈMES RÉSIDUELS DÉTECTÉS

### 1. Comptes de démonstration manquants
Les comptes affichés sur `login.html` ne sont pas tous dans la base MySQL :
- `awa.ndiaye` : ✅ Existe
- `mamadou.fall` : ❌ N'existe pas dans la base

**Solution à appliquer :**
```sql
-- Ajouter l'utilisateur mamadou.fall
INSERT INTO users (username, password, role, name, email) 
VALUES ('mamadou.fall', '$2b$10$...hash...', 'N2', 'Mamadou FALL', 'mamadou.fall@senico.com');
```

### 2. Script `verifier-etat.js` utilise de mauvais noms de colonnes
Le script cherche `nom_agent` et `prenom_agent`, mais les colonnes sont :
- `evalue_nom`
- `evalue_fonction`

**Correction nécessaire dans `verifier-etat.js` ligne 42.**

---

## 📊 STRUCTURE DE LA BASE DE DONNÉES

### Table `evaluations` - Colonnes disponibles :
- id, date_evaluation, direction, service
- evaluateur_nom, evaluateur_fonction
- evalue_nom, evalue_fonction
- categorie, annee, email_n2
- objectifs (JSON), competences (JSON), scores (JSON)
- observations (JSON), signatures (JSON)
- status, created_by, created_at, updated_at
- submitted_at, validated_at

### Table `users` - Colonnes disponibles :
- id, username, password (bcrypt)
- role (N1/N2), name, email
- is_active, created_at, updated_at

---

## ✅ CONCLUSION

**Le problème principal était simplement que le serveur n'était pas démarré.**

### Actions effectuées :
1. ✅ Vérifié MySQL (WAMP) - Actif
2. ✅ Vérifié la base de données - Existe et contient des données
3. ✅ Démarré le serveur Node.js sur le port 3001
4. ✅ Confirmé que le serveur écoute et répond

### Pour éviter ce problème à l'avenir :
1. **Toujours démarrer WAMP en premier** (icône doit être verte)
2. **Démarrer le serveur Node.js** avec `DEMARRER-SERVEUR.bat` ou `node server-mysql.js`
3. **Vérifier que le port 3001 est libre** avant de démarrer

### URLs d'accès :
- 🔐 **Connexion :** http://localhost:3001/login.html
- 📝 **Formulaire :** http://localhost:3001/formulaire-online.html
- ✅ **Validation :** http://localhost:3001/validation.html

---

**Prochaines étapes :**
1. Tester la connexion avec un compte N1 (awa.ndiaye)
2. Vérifier/créer le compte N2 (mamadou.fall)
3. Corriger le script `verifier-etat.js`
