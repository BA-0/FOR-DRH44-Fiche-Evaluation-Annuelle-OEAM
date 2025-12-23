# 🚀 GUIDE DE DÉMARRAGE RAPIDE - MySQL

## ⚡ Installation en 3 minutes

### 1️⃣ Créer la base de données

1. **Ouvrir phpMyAdmin** : http://localhost/phpmyadmin
2. **Cliquer sur l'onglet "SQL"**
3. **Copier tout le contenu du fichier `database.sql`**
4. **Coller et cliquer sur "Exécuter"**

✅ Vous devriez voir : "Base de données créée avec succès!"

### 2️⃣ Démarrer le serveur

```bash
npm start
```

✅ Vous devriez voir :
```
✅ Connexion à MySQL réussie!
🚀 SERVEUR D'ÉVALUATION DÉMARRÉ
📍 URL: http://localhost:3001
```

### 3️⃣ Tester l'application

Ouvrez : http://localhost:3001/login.html

**Comptes de test :**
- **N+1 (Évaluateur)** : `evaluateur` / `eval123`
- **N+2 (Validateur)** : `validateur` / `valid123`

---

## 🔧 Commandes utiles

```bash
# Démarrer le serveur
npm start

# Démarrer avec l'ancien système JSON (si besoin)
npm run start:json

# Générer un hash de mot de passe
npm run hash eval123
```

---

## ✅ Vérifications

### Vérifier que WAMP fonctionne
- Icône WAMP doit être **VERTE** 🟢
- Si orange/rouge : cliquez sur "Redémarrer tous les services"

### Vérifier la base de données
Dans phpMyAdmin :
```sql
SELECT * FROM users;
```
Vous devriez voir 2 utilisateurs : evaluateur et validateur

### Vérifier les connexions
1. Se connecter avec `evaluateur` / `eval123`
2. Le nom affiché doit être : **👤 Jean Dupont** ✅
3. Plus de problème d'affichage !

---

## 🎯 Avantages de MySQL

✅ **Mots de passe sécurisés** (hashés avec bcrypt)
✅ **Performance** (bien plus rapide que JSON)
✅ **Historique complet** (table audit_log)
✅ **Transactions** (pas de perte de données)
✅ **Statistiques** (vues SQL optimisées)
✅ **Production-ready** (vraie base de données)

---

## 🚨 Problèmes courants

**❌ "Cannot connect to MySQL"**
→ Démarrez WAMP (icône doit être verte)

**❌ "Database does not exist"**
→ Exécutez database.sql dans phpMyAdmin

**❌ "Access denied"**
→ Vérifiez db.config.js (user: root, password: vide par défaut)

---

## 📊 Différence avec l'ancien système

| Avant (JSON) | Après (MySQL) |
|--------------|---------------|
| evaluations.json | Base de données |
| Mots de passe en clair | Hashés (bcrypt) |
| Pas d'historique | Audit complet |
| Lent avec beaucoup de données | Rapide et optimisé |
| Risque de perte | Transactions sécurisées |

---

**🎉 C'est tout ! Votre système est maintenant professionnel et sécurisé !**
