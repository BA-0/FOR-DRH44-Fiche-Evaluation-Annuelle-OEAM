# ✅ CORRECTION APPLIQUÉE - Guide de Test

## 🔧 Ce qui a été corrigé

**Problème :** Le serveur MySQL retournait un tableau d'évaluations directement, mais le client JavaScript attendait un objet `{ success: true, evaluations: [...] }`.

**Solution :** Modifié `server-mysql.js` ligne 135 pour retourner :
```javascript
res.json({ success: true, evaluations: evaluations });
```

Au lieu de :
```javascript
res.json(evaluations);
```

---

## 🧪 Comment tester maintenant

### Étape 1 : Recharger la page validation
```
http://localhost:3001/validation.html
```

### Étape 2 : Entrer un email
Vous devez entrer un email qui CORRESPOND aux évaluations dans la base de données.

**⚠️ IMPORTANT :** Actuellement dans la base MySQL, il n'y a peut-être PAS d'évaluations avec l'email `ousseynou.seck@senico.sn`.

**Emails à tester :**
- `validateur@example.com` (compte par défaut)
- Ou vérifiez les emails dans votre base MySQL

---

## 📊 Vérifier les évaluations dans MySQL

### Option 1 : Via phpMyAdmin
1. Ouvrez WAMP → phpMyAdmin
2. Sélectionnez la base `formulaire_evaluation`
3. Cliquez sur la table `evaluations`
4. Regardez la colonne `email_n2` et `status`

### Option 2 : Via SQL
```sql
SELECT id, evalue_nom, email_n2, status 
FROM evaluations 
WHERE status = 'submitted';
```

Cela vous montrera les évaluations en attente et leurs emails N+2.

---

## 🎯 Créer une évaluation de test

Si vous voulez créer une évaluation pour tester :

### 1. Aller sur le formulaire
```
http://localhost:3001/formulaire-online.html
```

### 2. Se connecter (si demandé)
- **Username :** evaluateur
- **Password :** eval123
- **Rôle :** N1

### 3. Remplir le formulaire
- Direction : `Test Direction`
- Service : `Test Service`
- Évaluateur (N+1) : `Jean Dupont`
- Fonction N+1 : `Manager`
- Évalué (N) : `Pierre Martin`
- Fonction N : `Employé`
- Catégorie : `A`
- **Email N+2 :** `ousseynou.seck@senico.sn` ← **Important !**
- Année : `2025`

### 4. Remplir les objectifs et compétences
(Mettez des valeurs de test)

### 5. Ajouter les signatures
- Signature N (dessinez)
- Signature N+1 (dessinez)

### 6. Cliquer sur "✅ Soumettre à N+2"
✅ La page se rafraîchit automatiquement après 2 secondes

---

## ✅ Valider l'évaluation

### 1. Aller sur validation.html
```
http://localhost:3001/validation.html
```

### 2. Se connecter (si demandé)
- **Username :** validateur
- **Password :** valid123
- **Rôle :** N2

### 3. Entrer l'email
```
ousseynou.seck@senico.sn
```

### 4. Résultat attendu
```
✅ 1 évaluation(s) chargée(s)

📋 Évaluation de Pierre Martin
   ⏳ En attente
   Direction: Test Direction
   Service: Test Service
```

### 5. Cliquer sur la carte
Le modal s'ouvre avec tous les détails.

### 6. Signer et valider
- Dessinez la signature N+2
- Cliquez sur "Valider l'évaluation"

✅ L'évaluation passe au statut `validated`

---

## 🐛 Messages possibles

### ✅ Messages normaux
```
✅ 1 évaluation(s) chargée(s)
```
→ Super ! Tout fonctionne

```
ℹ️ Aucune évaluation en attente pour cet email
```
→ Normal, aucune évaluation n'a cet email N+2

### ❌ Messages d'erreur
```
❌ Erreur de connexion au serveur
```
→ Le serveur n'est pas démarré. Lancez `npm start`

```
❌ Veuillez entrer votre email
```
→ Le champ email est vide

---

## 📝 Comptes disponibles

### Dans MySQL (server-mysql.js)
| Username | Password | Rôle | Email |
|----------|----------|------|-------|
| evaluateur | eval123 | N1 | evaluateur@example.com |
| validateur | valid123 | N2 | validateur@example.com |

### Comment ajouter Ousseynou SECK dans MySQL

Si vous voulez utiliser le compte `ousseynou.seck`, exécutez ce SQL :

```sql
INSERT INTO users (username, password, role, name, email, is_active) 
VALUES (
  'ousseynou.seck',
  '$2b$10$F3MFXYS8tteUOZaCUDw3neNr.DOtxBCdhokvmNZfWHBhhyelL.9Iy',
  'N2',
  'Ousseynou SECK',
  'ousseynou.seck@senico.sn',
  TRUE
);
```

**Note :** Le mot de passe hashé correspond à `valid123`

---

## 🎉 Résumé

1. ✅ **Serveur redémarré** avec la correction
2. ✅ **API corrigée** pour retourner `{ success: true, evaluations: [...] }`
3. ✅ **Prêt à tester** avec les évaluations existantes

**Prochaine étape :** Rechargez la page validation.html et testez !
