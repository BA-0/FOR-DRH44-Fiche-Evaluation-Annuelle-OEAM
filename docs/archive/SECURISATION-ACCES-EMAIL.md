# Sécurisation des Accès par Email - N+1 et N+2

## 📋 Résumé des Modifications

Les utilisateurs N+1 et N+2 peuvent désormais **uniquement consulter les évaluations associées à leur propre email**. Il n'est plus possible d'accéder aux données d'un autre utilisateur en modifiant simplement l'email dans l'URL.

## 🔒 Sécurité Mise en Place

### 1. Middleware d'Authentification (server-mysql.js)

Un nouveau middleware `requireAuth` a été ajouté pour :
- ✅ Vérifier la présence et la validité du token d'authentification
- ✅ Extraire les informations de l'utilisateur depuis la base de données
- ✅ Ajouter les données utilisateur (email, rôle, nom) à chaque requête

```javascript
async function requireAuth(req, res, next) {
    // Vérifie le token Bearer dans les headers
    // Récupère les infos utilisateur depuis la BD
    // Ajoute req.user pour les routes suivantes
}
```

### 2. Routes Sécurisées

#### Route N+2 : `/api/evaluations/pending/:email`
- ✅ Requiert l'authentification (`requireAuth`)
- ✅ Vérifie que `req.user.email === req.params.email`
- ✅ Vérifie que l'utilisateur a le rôle `N2`
- ✅ Utilise uniquement l'email de la session authentifiée

#### Route N+1 : `/api/evaluations/evaluator/:email`
- ✅ Requiert l'authentification (`requireAuth`)
- ✅ Vérifie que `req.user.email === req.params.email`
- ✅ Vérifie que l'utilisateur a le rôle `N1`
- ✅ Utilise le nom de l'évaluateur depuis la session

#### Route `/api/evaluations/:id/full`
- ✅ Requiert l'authentification (`requireAuth`)
- ✅ Pour N+1 : vérifie que `evaluateur_nom` correspond à `req.user.name`
- ✅ Pour N+2 : vérifie que `email_n2` correspond à `req.user.email`

#### Route `/api/evaluations/:id/validate`
- ✅ Requiert l'authentification (`requireAuth`)
- ✅ Vérifie que l'utilisateur est N+2
- ✅ Vérifie que l'évaluation est assignée à son email

### 3. Clients Mis à Jour

Tous les fichiers JavaScript clients ont été modifiés pour envoyer le token d'authentification :

#### dashboard.js
```javascript
const token = localStorage.getItem('authToken');
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};
```

#### validation.js
- ✅ Toutes les requêtes fetch incluent le header Authorization
- ✅ `loadPendingEvaluations()`
- ✅ `loadSignaturesForValidation()`
- ✅ `submitValidation()`
- ✅ `viewValidatedDetails()`

#### drafts-manager.js
- ✅ `loadDrafts()` avec Authorization
- ✅ `deleteDraft()` avec Authorization

## 🚨 Messages d'Erreur

Si un utilisateur tente d'accéder aux données d'un autre utilisateur :

```json
{
    "success": false,
    "error": "Accès refusé",
    "message": "Vous ne pouvez consulter que vos propres évaluations"
}
```

Les tentatives d'accès non autorisées sont également loggées dans la console serveur :
```
❌ Tentative d'accès non autorisé: user@example.com essaie d'accéder aux évaluations de autre@example.com
```

## 🔐 Flux de Sécurité

### Pour N+1 (Évaluateur)
1. Connexion → Token généré avec userId, username, timestamp
2. Requête dashboard → Header `Authorization: Bearer <token>`
3. Serveur vérifie le token → Extrait req.user depuis la BD
4. Serveur vérifie `req.user.email === req.params.email`
5. Filtrage par `evaluateur_nom = req.user.name`
6. Retour des évaluations appartenant uniquement à cet évaluateur

### Pour N+2 (Validateur)
1. Connexion → Token généré avec userId, username, timestamp
2. Requête validation → Header `Authorization: Bearer <token>`
3. Serveur vérifie le token → Extrait req.user depuis la BD
4. Serveur vérifie `req.user.email === req.params.email`
5. Filtrage par `email_n2 = req.user.email`
6. Retour des évaluations assignées uniquement à ce validateur

## ✅ Tests Recommandés

### Test 1 : Accès Légitime N+1
```
✅ Se connecter en tant que N+1 avec email1@example.com
✅ Accéder au dashboard
✅ Vérifier que seules les évaluations de email1 sont visibles
```

### Test 2 : Tentative d'Accès Non Autorisé N+1
```
❌ Se connecter en tant que N+1 avec email1@example.com
❌ Essayer de modifier l'URL pour accéder aux évaluations de email2@example.com
❌ Vérifier qu'une erreur 403 est retournée
```

### Test 3 : Accès Légitime N+2
```
✅ Se connecter en tant que N+2 avec validateur@example.com
✅ Accéder à la page de validation
✅ Vérifier que seules les évaluations assignées à cet email sont visibles
```

### Test 4 : Tentative de Validation Non Autorisée N+2
```
❌ Se connecter en tant que N+2 avec validateur1@example.com
❌ Essayer de valider une évaluation assignée à validateur2@example.com
❌ Vérifier qu'une erreur 403 est retournée
```

## 📝 Fichiers Modifiés

### Serveur
- ✅ `server-mysql.js` - Middleware requireAuth et sécurisation des routes

### Clients
- ✅ `dashboard.js` - Ajout Authorization headers
- ✅ `validation.js` - Ajout Authorization headers (4 fonctions)
- ✅ `drafts-manager.js` - Ajout Authorization headers (2 fonctions)

## 🎯 Résultat Final

**Les utilisateurs N+1 et N+2 ne peuvent maintenant accéder qu'aux évaluations liées à leur propre email, même s'ils tentent de manipuler les URLs ou les paramètres de requête.**

La sécurité est assurée côté serveur via :
1. Vérification du token d'authentification
2. Extraction des infos utilisateur depuis la base de données
3. Validation que l'email/nom correspond aux données demandées
4. Filtrage strict des résultats par email/nom de l'utilisateur authentifié

Date de mise en place : **20 décembre 2024**
