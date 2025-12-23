# Guide de Test des Nouvelles Fonctionnalités

## 🧪 Plan de Test Complet

### Prérequis
- ✅ Serveur Node.js en cours d'exécution sur port 3001
- ✅ Base de données MySQL accessible
- ✅ Navigateur moderne (Chrome, Firefox, Edge)

---

## Test 1 : Dashboard et Statistiques

### Étapes :
1. Ouvrir http://localhost:3001/login.html
2. Se connecter avec un compte N+1 (ex: awa.ndiaye@senico.sn / test123)
3. Vérifier la redirection automatique vers dashboard.html
4. **Vérifications** :
   - [ ] Le nom d'utilisateur est affiché en haut à droite
   - [ ] Les initiales apparaissent dans l'avatar
   - [ ] Le rôle "Évaluateur (N+1)" est affiché
   - [ ] Les 4 cartes de statistiques sont présentes :
     * Brouillons
     * Soumis
     * Validés
     * Total
   - [ ] Les chiffres correspondent aux données réelles

### Résultat attendu :
✅ Dashboard charge avec statistiques correctes
✅ Interface moderne et responsive
✅ Aucune erreur console

---

## Test 2 : Actions Rapides Dashboard

### Étapes :
1. Sur le dashboard, section "Actions Rapides"
2. Vérifier la présence des 4 boutons :
   - Nouvelle Évaluation
   - Mes Brouillons
   - Évaluations Validées
   - **Export Excel** (NOUVEAU)

3. **Test du bouton "Mes Brouillons"** :
   - [ ] Cliquer sur "Mes Brouillons"
   - [ ] Vérifier redirection vers drafts-manager.html
   - [ ] Retour au dashboard

4. **Test du bouton "Export Excel"** :
   - [ ] Cliquer sur "Export Excel"
   - [ ] Vérifier qu'un fichier .xlsx est téléchargé
   - [ ] Ouvrir le fichier Excel
   - [ ] Vérifier présence des colonnes :
     * N°, Nom Évalué, Direction, Service, Poste
     * Évaluateur (N+1), Email N+1, N+2 Validateur
     * Statut, Dates, Critères
   - [ ] Vérifier que les données correspondent

### Résultat attendu :
✅ Tous les boutons fonctionnent
✅ Export Excel génère un fichier valide avec toutes les données
✅ Message de succès affiché

---

## Test 3 : Gestion des Brouillons

### Étapes :
1. Accéder à drafts-manager.html depuis le dashboard
2. **Vérifications visuelles** :
   - [ ] Page charge correctement
   - [ ] Header avec logo SENICO
   - [ ] Titre "Mes Brouillons"
   - [ ] Barre de recherche présente
   - [ ] Sélecteur de tri présent
   - [ ] Compteur de brouillons affiché

3. **Test de la recherche** :
   - [ ] Taper un nom dans la barre de recherche
   - [ ] Appuyer sur Entrée ou cliquer "Rechercher"
   - [ ] Vérifier que seuls les brouillons correspondants s'affichent
   - [ ] Effacer la recherche et réafficher tous les brouillons

4. **Test du tri** :
   - [ ] Sélectionner "Plus récent"
   - [ ] Vérifier l'ordre des brouillons (plus récent en haut)
   - [ ] Sélectionner "Plus ancien"
   - [ ] Vérifier l'ordre inversé
   - [ ] Sélectionner "Par nom"
   - [ ] Vérifier ordre alphabétique

5. **Test des actions sur un brouillon** :
   - [ ] Cliquer sur "Reprendre" d'un brouillon
   - [ ] Vérifier redirection vers formulaire-online.html
   - [ ] Vérifier que le formulaire est pré-rempli avec les données du brouillon
   - [ ] Retour aux brouillons
   - [ ] Cliquer sur "Supprimer" d'un brouillon
   - [ ] Vérifier la boîte de confirmation
   - [ ] Confirmer la suppression
   - [ ] Vérifier que le brouillon disparaît de la liste
   - [ ] Vérifier message de succès

### Résultat attendu :
✅ Recherche fonctionne correctement
✅ Tri fonctionne pour les 3 options
✅ Reprise d'un brouillon charge le formulaire pré-rempli
✅ Suppression d'un brouillon fonctionne avec confirmation

---

## Test 4 : Filtrage N+1 Corrigé

### Contexte :
Ce test vérifie la correction du bug où le N+1 voyait les évaluations d'autres N+1.

### Étapes :
1. **Se connecter avec le compte N+1 #1** (ex: awa.ndiaye@senico.sn)
2. Noter les évaluations affichées dans l'onglet "Formulaires Validés"
3. Vérifier que toutes les évaluations ont :
   - [ ] `evaluateur_email` = email de connexion OU
   - [ ] `evaluateur_nom` = nom de l'utilisateur connecté
4. Se déconnecter

5. **Se connecter avec un compte N+1 #2** différent
6. Vérifier que les évaluations affichées sont DIFFÉRENTES
7. Vérifier qu'aucune évaluation du N+1 #1 n'apparaît

### Vérification API directe :
1. Ouvrir la console développeur (F12)
2. Exécuter :
```javascript
fetch('http://localhost:3001/api/evaluations/evaluator/awa.ndiaye@senico.sn')
  .then(r => r.json())
  .then(console.log)
```
3. Vérifier que seules les évaluations de Awa Ndiaye sont retournées

### Résultat attendu :
✅ Chaque N+1 voit uniquement SES évaluations
✅ Aucune fuite de données entre N+1
✅ Filtrage basé sur evaluateur_email ET evaluateur_nom
✅ Endpoint `/api/evaluations/evaluator/:email` fonctionne correctement

---

## Test 5 : Export Excel depuis Formulaire N+1

### Étapes :
1. Aller sur formulaire-online.html (connecté en tant que N+1)
2. Cliquer sur l'onglet "Formulaires Validés"
3. Entrer l'email dans le champ de recherche
4. Cliquer "Charger"
5. Vérifier que les évaluations validées s'affichent
6. **Ajouter bouton Export Excel sur cette page** (si pas déjà fait)
7. Cliquer sur un bouton d'export (à ajouter)
8. Vérifier téléchargement du fichier Excel

### Résultat attendu :
✅ Évaluations validées s'affichent correctement
✅ Possibilité d'exporter depuis cette vue

---

## Test 6 : Export Excel pour N+2

### Étapes :
1. Se déconnecter du compte N+1
2. Se connecter avec un compte N+2 (ex: karim.fall@senico.sn / test123)
3. Vérifier redirection vers dashboard
4. Vérifier statistiques N+2 :
   - [ ] En attente de validation
   - [ ] Validées
   - [ ] Taux de complétion
   - [ ] Total
5. Cliquer sur "Export Excel" dans les actions rapides
6. Vérifier téléchargement du fichier
7. Ouvrir le fichier
8. Vérifier qu'il contient toutes les évaluations assignées au N+2

### Résultat attendu :
✅ Dashboard N+2 affiche statistiques correctes
✅ Export Excel contient toutes les évaluations du N+2
✅ Pas de données d'autres N+2

---

## Test 7 : Export Détaillé d'une Évaluation Unique

### Étapes :
1. Dans validation.html (page N+2)
2. Ouvrir la modal de détails d'une évaluation validée
3. **Ajouter bouton "Export Excel Détaillé"** (à implémenter)
4. Cliquer sur ce bouton
5. Vérifier téléchargement du fichier
6. Ouvrir le fichier Excel
7. Vérifier présence de 2 feuilles :
   - [ ] Feuille "Informations" avec données générales
   - [ ] Feuille "Critères" avec tableau des critères, notes et observations
8. Vérifier que toutes les données sont présentes

### Résultat attendu :
✅ Export détaillé génère fichier avec 2 feuilles
✅ Toutes les informations sont présentes
✅ Mise en forme lisible

---

## Test 8 : Responsive Design

### Étapes :
1. Ouvrir le dashboard sur desktop (>1024px)
2. Vérifier mise en page en grille
3. Réduire la fenêtre à 768px (tablette)
4. Vérifier que la mise en page s'adapte
5. Réduire à 375px (mobile)
6. Vérifications mobiles :
   - [ ] Header empilé verticalement
   - [ ] Stats en colonne unique
   - [ ] Actions rapides en colonne
   - [ ] Texte lisible
   - [ ] Boutons cliquables facilement

### Tester sur :
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablette (768x1024)
- [ ] Mobile (375x667)

### Résultat attendu :
✅ Interface s'adapte à toutes les tailles d'écran
✅ Aucun débordement horizontal
✅ Texte toujours lisible
✅ Boutons accessibles

---

## Test 9 : Performance

### Métrique à vérifier :
1. **Temps de chargement du dashboard** :
   - [ ] < 2 secondes avec connexion normale
   - [ ] Spinner de chargement visible

2. **Temps de génération Excel** :
   - [ ] < 5 secondes pour 100 évaluations
   - [ ] Message de succès immédiat

3. **Recherche dans brouillons** :
   - [ ] < 500ms pour filtrer les résultats
   - [ ] Pas de freeze de l'interface

### Outils :
- Onglet "Network" de DevTools
- Onglet "Performance" de DevTools
- Console pour les erreurs

### Résultat attendu :
✅ Pas de ralentissement notable
✅ Interface réactive
✅ Pas d'erreurs console

---

## Test 10 : Sécurité et Validation

### Étapes :
1. **Test d'accès sans authentification** :
   - [ ] Essayer d'accéder directement à dashboard.html sans être connecté
   - [ ] Vérifier redirection automatique vers login.html
   - [ ] Idem pour drafts-manager.html

2. **Test d'injection SQL** (basique) :
   - [ ] Dans la recherche de brouillons, taper : `'; DROP TABLE users; --`
   - [ ] Vérifier que la recherche échoue proprement sans erreur SQL
   - [ ] Vérifier que la base de données est intacte

3. **Test de Cross-Site Scripting (XSS)** :
   - [ ] Créer une évaluation avec nom : `<script>alert('XSS')</script>`
   - [ ] Vérifier qu'aucun script ne s'exécute à l'affichage
   - [ ] Vérifier que le texte est échappé

### Résultat attendu :
✅ Redirection automatique si non connecté
✅ Aucune injection SQL possible
✅ Aucun XSS possible
✅ Données sécurisées

---

## 📊 Checklist Récapitulative

### Fonctionnalités Core :
- [ ] Dashboard N+1 fonctionne
- [ ] Dashboard N+2 fonctionne
- [ ] Statistiques correctes
- [ ] Actions rapides opérationnelles

### Gestion Brouillons :
- [ ] Liste affichée
- [ ] Recherche fonctionne
- [ ] Tri fonctionne
- [ ] Reprise fonctionne
- [ ] Suppression fonctionne

### Export Excel :
- [ ] Export depuis dashboard N+1
- [ ] Export depuis dashboard N+2
- [ ] Export détaillé unique (à implémenter)
- [ ] Données complètes dans fichier
- [ ] Nom de fichier correct

### Correction Filtrage :
- [ ] N+1 voit uniquement ses évaluations
- [ ] Endpoint evaluator fonctionne
- [ ] Pas de fuite de données

### UI/UX :
- [ ] Design moderne
- [ ] Responsive
- [ ] Animations fluides
- [ ] Messages d'erreur clairs

### Performance :
- [ ] Chargement rapide
- [ ] Export rapide
- [ ] Recherche rapide

### Sécurité :
- [ ] Authentification requise
- [ ] Pas d'injection SQL
- [ ] Pas de XSS

---

## 🐛 Signalement de Bugs

Si vous rencontrez un problème lors des tests :

1. Noter le numéro du test
2. Décrire le comportement observé
3. Décrire le comportement attendu
4. Copier les erreurs console (F12)
5. Indiquer le navigateur et la version
6. Capturer une screenshot si possible

### Format de rapport :
```
Test: Test #X - Nom du test
Étape: Étape Y
Navigateur: Chrome 120.0.0
Erreur: [Description]
Console: [Copier erreurs console]
Screenshot: [Si applicable]
```

---

## ✅ Validation Finale

Tous les tests sont passés ✅ :
- [ ] Dashboard
- [ ] Gestion Brouillons
- [ ] Export Excel
- [ ] Filtrage N+1
- [ ] Responsive
- [ ] Performance
- [ ] Sécurité

**L'application est prête pour la production** 🚀

---

*Document de test créé le 19 décembre 2024*
*Pour SENICO SA - Application d'Évaluation du Personnel*
