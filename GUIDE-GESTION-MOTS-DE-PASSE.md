# 🔐 Guide de Gestion des Mots de Passe - SENICO SA

## 📋 Vue d'ensemble

Le système SENICO dispose d'un mécanisme complet de gestion des mots de passe incluant :
- ✅ **First Login** obligatoire pour tous les utilisateurs (N+1, N+2, Admin)
- 🔑 **Réinitialisation de mot de passe** par l'administrateur
- 🔒 **Changement de mot de passe** forcé lors de la première connexion
- 📧 **Support utilisateur** pour les mots de passe oubliés

---

## 🎯 Fonctionnalités Implémentées

### 1️⃣ **First Login - Première Connexion**

#### Pour TOUS les utilisateurs (N+1, N+2, Admin) :

**Comportement :**
- Lors de la création d'un compte, le flag `first_login = 1` est activé
- Mot de passe par défaut : `Test123@`
- À la première connexion, l'utilisateur est **automatiquement redirigé** vers la page de changement de mot de passe
- Il DOIT changer son mot de passe avant d'accéder à l'application

**Flux de première connexion :**
```
[Login] → Vérification first_login = 1 
   ↓
[first-login-password-change.html] → L'utilisateur change son mot de passe
   ↓
[first_login = 0] → Flag désactivé après changement réussi
   ↓
[Dashboard/Validation/Admin] → Accès normal à l'application
```

---

### 2️⃣ **Réinitialisation de Mot de Passe (Admin)**

#### Depuis le Dashboard Admin :

**Localisation :** 
- Admin Dashboard → Onglet "Utilisateurs"
- Colonne "First Login" : Affiche si l'utilisateur doit changer son mot de passe
- Bouton **🔑** : Réinitialiser le mot de passe

**Processus :**
1. Admin clique sur le bouton 🔑 à côté de l'utilisateur
2. Confirmation demandée avec les détails :
   ```
   🔑 Réinitialiser le mot de passe de "nom_utilisateur" ?
   
   Cette action va :
   • Réinitialiser le mot de passe à "Test123@"
   • Activer le flag "first_login"
   • Forcer l'utilisateur à changer son mot de passe à la prochaine connexion
   
   Voulez-vous continuer ?
   ```
3. Si confirmé :
   - Mot de passe réinitialisé à `Test123@`
   - `first_login = 1` activé
   - Notification de succès avec le nouveau mot de passe temporaire

**Notification à l'utilisateur :**
L'administrateur doit communiquer à l'utilisateur :
- Nouveau mot de passe temporaire : `Test123@`
- Information : "Vous devrez changer ce mot de passe à votre prochaine connexion"

---

### 3️⃣ **Mot de Passe Oublié (Utilisateurs)**

#### Sur la page de connexion :

**Lien disponible :**
- Sous le formulaire de connexion : **"🔑 Mot de passe oublié ?"**

**Processus :**
1. Utilisateur clique sur "Mot de passe oublié ?"
2. Modal s'affiche avec les informations de contact :
   ```
   🔑 Mot de passe oublié ?
   
   Veuillez contacter l'administrateur système pour réinitialiser votre mot de passe.
   
   📧 Email: support.dsi@senico.sn
   📞 Tél: +221 33 123 45 67
   
   Informations à fournir :
   • Votre nom complet
   • Votre identifiant
   • Votre rôle (N+1, N+2, etc.)
   ```

---

## 📊 Tableau de Bord Admin - Colonne "First Login"

### Affichage :

| Statut | Badge | Signification |
|--------|-------|---------------|
| **🔐 Oui** | Badge Orange | L'utilisateur doit changer son mot de passe |
| **✅ Non** | Badge Vert | Mot de passe déjà changé, accès normal |

### Actions disponibles par utilisateur :

| Bouton | Fonction | Description |
|--------|----------|-------------|
| ✏️ | Modifier | Modifier les informations de l'utilisateur |
| 🔑 | Réinitialiser | Réinitialiser le mot de passe à Test123@ |
| 🔒 / 🔓 | Activer/Désactiver | Changer le statut actif de l'utilisateur |
| 🗑️ | Supprimer | Supprimer l'utilisateur (sauf admin) |

---

## 🔧 Configuration Technique

### Base de Données :

**Table `users` :**
```sql
- first_login TINYINT(1) DEFAULT 1
  -- 1 = Doit changer le mot de passe
  -- 0 = Mot de passe déjà changé
```

### Routes API :

**POST `/api/users/:id/reset-password`**
- **Authentification** : Admin uniquement (Bearer token + role='admin')
- **Action** : 
  - Réinitialise le mot de passe à `Test123@`
  - Active `first_login = 1`
- **Réponse** :
  ```json
  {
    "success": true,
    "message": "Mot de passe réinitialisé pour nom_utilisateur",
    "defaultPassword": "Test123@",
    "info": "L'utilisateur devra changer son mot de passe à la prochaine connexion"
  }
  ```

### Fichiers Modifiés :

1. **admin-dashboard.html** :
   - Ajout colonne "First Login" dans le tableau
   - Ajout bouton 🔑 de réinitialisation

2. **admin-dashboard.js** :
   - Fonction `resetUserPassword(userId, username)`
   - Affichage du badge first_login dans `renderUsersTable()`

3. **server/server-mysql.js** :
   - Route POST `/api/users/:id/reset-password`
   - Middleware `requireAdmin` pour sécurité

4. **src/pages/login.html** :
   - Vérification `first_login` pour TOUS les rôles (incluant admin)
   - Fonction `forgotPassword()` pour modal d'assistance

---

## 📝 Procédures pour l'Administrateur

### ✅ **Créer un nouvel utilisateur :**
1. Dashboard Admin → Utilisateurs → "Ajouter Utilisateur"
2. Remplir les informations
3. ⚠️ **Important** : Le système crée automatiquement le compte avec :
   - Mot de passe : `Test123@`
   - `first_login = 1` (activé)
4. Communiquer les identifiants à l'utilisateur :
   ```
   Identifiant : [username]
   Mot de passe temporaire : Test123@
   
   À votre première connexion, vous devrez changer ce mot de passe.
   ```

### 🔄 **Réinitialiser le mot de passe d'un utilisateur :**

**Cas 1 : L'utilisateur a oublié son mot de passe**
1. Utilisateur contacte support.dsi@senico.sn
2. Admin vérifie l'identité de l'utilisateur
3. Dans Dashboard Admin → Utilisateurs :
   - Rechercher l'utilisateur
   - Cliquer sur 🔑
   - Confirmer la réinitialisation
4. Communiquer le nouveau mot de passe temporaire : `Test123@`

**Cas 2 : Compte bloqué ou compromis**
1. Suivre la même procédure que Cas 1
2. Optionnel : Désactiver temporairement le compte (🔒)
3. Réinitialiser le mot de passe
4. Réactiver le compte (🔓)
5. Informer l'utilisateur

### 🔐 **Réinitialiser son propre mot de passe (Admin) :**

**Option 1 : Via un autre admin**
- Un autre administrateur peut réinitialiser votre mot de passe via le dashboard

**Option 2 : Via ligne de commande (accès serveur requis)**
```bash
cd "c:\Users\cheri\Documents\SENICO\formulaire evaluation\utils"
node reset-admin-password.js
```

---

## 🧪 Tests de Validation

### Test 1 : First Login pour nouvel utilisateur
1. ✅ Créer un utilisateur dans le dashboard admin
2. ✅ Se déconnecter
3. ✅ Se connecter avec les nouveaux identifiants
4. ✅ Vérifier redirection automatique vers page de changement
5. ✅ Changer le mot de passe
6. ✅ Vérifier accès normal au dashboard

### Test 2 : Réinitialisation par admin
1. ✅ Se connecter en tant qu'admin
2. ✅ Aller dans Utilisateurs
3. ✅ Cliquer sur 🔑 pour un utilisateur
4. ✅ Confirmer la réinitialisation
5. ✅ Vérifier que "First Login" passe à 🔐 Oui
6. ✅ Se déconnecter
7. ✅ Se connecter avec l'utilisateur réinitialisé
8. ✅ Vérifier redirection vers changement de mot de passe

### Test 3 : Mot de passe oublié
1. ✅ Aller sur la page de connexion
2. ✅ Cliquer sur "Mot de passe oublié ?"
3. ✅ Vérifier affichage de la modal avec contacts
4. ✅ Fermer la modal

---

## 🔒 Règles de Sécurité des Mots de Passe

### Exigences (configurées dans first-login-password-change.html) :

✅ **Longueur minimale** : 8 caractères  
✅ **Majuscule** : Au moins 1 lettre majuscule  
✅ **Minuscule** : Au moins 1 lettre minuscule  
✅ **Chiffre** : Au moins 1 chiffre  
✅ **Caractère spécial** : Au moins 1 (@, #, $, %, etc.)

### Validation en temps réel :
- Indicateur visuel de force du mot de passe
- Messages d'erreur clairs pour chaque critère non respecté
- Vérification de correspondance des mots de passe

---

## 📧 Support et Contact

**Pour les utilisateurs :**
- Email : support.dsi@senico.sn
- Téléphone : +221 33 123 45 67

**Pour les administrateurs :**
- Documentation technique : `/docs/`
- README de sécurité : `/README-SECURITE.md`

---

## 🚨 Dépannage

### Problème : L'utilisateur ne peut pas se connecter

**Solutions :**
1. Vérifier que le compte est actif (colonne "Statut")
2. Vérifier l'identifiant et le mot de passe
3. Si first_login = 1, s'assurer que l'utilisateur change bien son mot de passe
4. En dernier recours : Réinitialiser le mot de passe via 🔑

### Problème : La page de changement ne s'affiche pas

**Solutions :**
1. Vérifier la console du navigateur (F12)
2. S'assurer que `first_login = 1` dans la base de données
3. Vider le cache du navigateur
4. Vérifier que le fichier `first-login-password-change.html` existe

### Problème : "Erreur lors de la réinitialisation"

**Solutions :**
1. Vérifier que le serveur Node.js est démarré
2. Vérifier la connexion à la base de données
3. Consulter les logs du serveur (console Node.js)
4. Vérifier les droits admin (token valide)

---

**Date de mise à jour** : 26 décembre 2025  
**Version** : 2.1 - Système complet de gestion des mots de passe
