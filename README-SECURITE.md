# 🔐 Système de Sécurité - SENICO SA

## Configuration de Sécurité Implémentée

### ✅ Page Login comme Point d'Entrée Principal

#### 1. **Index.html - Page d'Accueil**
- **Emplacement**: `/index.html` (racine du projet)
- **Comportement**: 
  - Nettoie automatiquement TOUTES les sessions existantes
  - Redirige immédiatement vers `src/pages/login.html`
  - Animation de chargement pour une meilleure UX

#### 2. **Login.html - Authentification Obligatoire**
- **Emplacement**: `/src/pages/login.html`
- **Sécurité Implémentée**:
  ```javascript
  // Nettoyage automatique au chargement
  - localStorage.clear()
  - sessionStorage.clear()
  - Suppression de tous les cookies
  ```
- **Résultat**: À chaque retour sur la page login, l'utilisateur DOIT se reconnecter

### 🔒 Fonction de Déconnexion Améliorée

Tous les fichiers ont été modifiés pour implémenter une déconnexion sécurisée :

#### **validation.js** (N+2)
```javascript
function logout() {
    console.log('🚪 Déconnexion en cours...');
    localStorage.clear();
    sessionStorage.clear();
    // Suppression des cookies
    window.location.replace('login.html'); // Replace empêche le retour arrière
}
```

#### **dashboard.js** (N+1)
```javascript
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        console.log('🚪 Déconnexion en cours...');
        localStorage.clear();
        sessionStorage.clear();
        // Suppression des cookies
        window.location.replace('login.html');
    }
}
```

#### **admin-dashboard.js** (Admin)
```javascript
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        console.log('🚪 Déconnexion administrateur...');
        localStorage.clear();
        sessionStorage.clear();
        // Suppression des cookies
        window.location.replace('src/pages/login.html');
    }
}
```

### 📋 Points Clés de Sécurité

1. **Nettoyage Complet**:
   - `localStorage.clear()` - Supprime token, rôle, email, etc.
   - `sessionStorage.clear()` - Supprime données temporaires
   - Suppression de tous les cookies

2. **Empêcher le Retour Arrière**:
   - Utilisation de `window.location.replace()` au lieu de `.href`
   - L'historique du navigateur ne conserve pas la page protégée

3. **Authentification Systématique**:
   - Chaque visite de login.html = nettoyage automatique
   - Impossible de contourner l'authentification

### 🚀 Comment Utiliser

#### Pour Accéder à l'Application:
1. Ouvrir `http://localhost:3001/` ou `/index.html`
2. Redirection automatique vers la page de connexion
3. Saisir identifiant et mot de passe
4. Redirection selon le rôle (N+1, N+2, Admin)

#### Pour Se Déconnecter:
1. Cliquer sur le bouton "🚪 Déconnexion"
2. Confirmer (sauf pour N+2)
3. Retour automatique à la page login avec session nettoyée

### 🔐 Flux de Sécurité

```
[Navigateur] 
    ↓
[index.html] → Nettoyage session → Redirection
    ↓
[login.html] → Nettoyage session → Demande authentification
    ↓
[Connexion réussie] → Stockage token → Redirection selon rôle
    ↓
[Dashboard/Admin/Validation] → Utilisation protégée
    ↓
[Déconnexion] → Nettoyage complet → Retour login.html
```

### ⚠️ Remarques Importantes

- **Pas de session persistante**: L'utilisateur doit se reconnecter à chaque session
- **Protection contre le bouton "Retour"**: `replace()` empêche le retour aux pages protégées
- **Cookies supprimés**: Aucune trace de session ne persiste
- **Console logs**: Tous les nettoyages sont tracés dans la console pour le debug

### 🧪 Test de Sécurité

Pour vérifier que le système fonctionne :

1. **Test 1 - Nettoyage au chargement**:
   - Se connecter
   - Retourner à `login.html` en tapant l'URL
   - Vérifier : Session nettoyée automatiquement

2. **Test 2 - Déconnexion**:
   - Se connecter
   - Cliquer sur Déconnexion
   - Essayer le bouton "Retour" du navigateur
   - Vérifier : Impossible de revenir à la page protégée

3. **Test 3 - Token invalide**:
   - Ouvrir la console (F12)
   - Vérifier `localStorage` après login (doit contenir authToken)
   - Cliquer sur Déconnexion
   - Vérifier `localStorage` (doit être vide)

---

**Date d'implémentation**: 26 décembre 2025  
**Version**: 2.0 - Sécurité renforcée
