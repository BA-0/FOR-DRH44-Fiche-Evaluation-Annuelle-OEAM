# 🔍 DIAGNOSTIC DES PROBLÈMES

**Date :** 19 décembre 2025  
**Statut :** Analyse et résolution

---

## 🚨 Problèmes signalés

### 1. Bouton "📥 Télécharger PDF" ne fonctionne pas
### 2. Bouton "✅ Soumettre à N+2" ne fonctionne pas
### 3. Texte SQL s'affiche toujours sur validation.html

---

## ✅ Vérifications effectuées

### Fichier HTML (formulaire-online.html)

**Ligne 642 - Bouton PDF :**
```html
<button onclick="downloadPDF()" id="btnDownloadPDF">📥 Télécharger PDF</button>
```
✅ **CORRECT** - Le bouton appelle bien la fonction `downloadPDF()`

**Ligne 643 - Bouton Soumettre :**
```html
<button onclick="submitToN2()" id="btnSubmit" class="btn-submit">✅ Soumettre à N+2</button>
```
✅ **CORRECT** - Le bouton appelle bien la fonction `submitToN2()`

---

### Fichier JavaScript (formulaire-online.js)

**Fonction downloadPDF() - Lignes 494-544 :**
```javascript
async function downloadPDF() {
    // ✅ Sauvegarde automatique si nécessaire
    // ✅ Appel API /evaluations/:id/full
    // ✅ Génération PDF avec generatePDF()
    // ✅ Téléchargement automatique
    // ✅ Fallback vers window.print()
}
```
✅ **CORRECT** - La fonction est bien implémentée

**Fonction submitToN2() - Lignes 595-646 :**
```javascript
async function submitToN2() {
    // ✅ Validation du formulaire
    // ✅ Confirmation utilisateur
    // ✅ Appel API /evaluations/:id/submit
    // ✅ Rafraîchissement après 2 secondes
}
```
✅ **CORRECT** - La fonction est bien implémentée avec rafraîchissement

---

## 🔴 CAUSES PROBABLES DES PROBLÈMES

### Problème 1 & 2 : Boutons ne fonctionnent pas

#### Cause A : Serveur Node.js non démarré
```
❌ Le serveur Node.js n'est pas lancé
❌ Les API ne répondent pas
```

**Solution :**
1. Ouvrir un terminal dans le dossier du projet
2. Exécuter : `npm start` ou `node server.js`
3. Vérifier que le serveur démarre sur `http://localhost:3001`

#### Cause B : Fichier pdf-generator.js manquant/non chargé
```
❌ jsPDF non disponible (window.jsPDF === undefined)
❌ La fonction generatePDF() n'existe pas
```

**Vérification :**
1. Ouvrir la console du navigateur (F12)
2. Taper : `typeof window.jsPDF`
3. Devrait retourner : `"function"` (pas `"undefined"`)

**Solution si manquant :**
- Vérifier que `pdf-generator.js` est bien dans le dossier
- Vérifier que le CDN jsPDF est chargé dans `<head>` de formulaire-online.html

#### Cause C : Erreurs JavaScript dans la console
```
❌ Erreurs bloquantes qui empêchent l'exécution
```

**Vérification :**
1. Ouvrir la console du navigateur (F12)
2. Aller dans l'onglet "Console"
3. Vérifier s'il y a des erreurs en rouge

---

### Problème 3 : Texte SQL sur validation.html

#### Cause : Fichier validation.html non remplacé

Le fichier `validation-CLEAN.html` a été créé mais **vous devez le renommer manuellement** !

**Actions requises :**

**Option 1 : Remplacement complet (RECOMMANDÉ)**
```
1. Fermer tous les fichiers ouverts
2. Renommer validation.html → validation-OLD-BACKUP.html
3. Renommer validation-CLEAN.html → validation.html
4. Recharger la page http://localhost:3001/validation.html
```

**Option 2 : Édition manuelle**
```
1. Ouvrir validation.html dans un éditeur de texte
2. Chercher "-- phpMyAdmin SQL Dump"
3. Supprimer TOUT le texte SQL (de "-- phpMyAdmin" jusqu'à la fin du dump SQL)
4. Sauvegarder le fichier
5. Recharger la page
```

---

## 🛠️ TESTS À EFFECTUER

### Test 1 : Serveur Node.js

**Terminal :**
```bash
cd "c:\Users\cheri\Documents\SENICO\formulaire evaluation"
npm start
```

**Attendu :**
```
🚀 Serveur démarré sur http://localhost:3001
📊 Base de données connectée
```

**Si erreur "Cannot find module" :**
```bash
npm install
npm start
```

---

### Test 2 : Console navigateur (F12)

**Ouvrir http://localhost:3001/formulaire-online.html**

**Dans la console, taper :**
```javascript
// Vérifier jsPDF
console.log(typeof window.jsPDF);  // Devrait afficher "function"

// Vérifier generatePDF
console.log(typeof generatePDF);   // Devrait afficher "function"

// Vérifier downloadPDF
console.log(typeof downloadPDF);   // Devrait afficher "function"

// Vérifier submitToN2
console.log(typeof submitToN2);    // Devrait afficher "function"
```

**Si tous affichent "function" :**
✅ Les fonctions sont bien chargées

**Si certains affichent "undefined" :**
❌ Problème de chargement de fichiers JavaScript

---

### Test 3 : Télécharger PDF

**Étapes :**
1. Ouvrir http://localhost:3001/formulaire-online.html
2. Remplir quelques champs du formulaire
3. Cliquer sur "📥 Télécharger PDF"

**Attendu :**
- ✅ Message "✅ PDF téléchargé avec succès !"
- ✅ Fichier téléchargé : `Evaluation_NomPrenom_2025-12-19.pdf`

**Si fallback :**
- 📄 Message "📄 Impression du formulaire..."
- 🖨️ Boîte de dialogue d'impression

**Si erreur :**
- ❌ Vérifier la console (F12) pour voir l'erreur exacte
- ❌ Vérifier que le serveur répond bien

---

### Test 4 : Soumettre à N+2

**Étapes :**
1. Remplir TOUS les champs obligatoires
2. Ajouter signatures N et N+1
3. Cliquer sur "✅ Soumettre à N+2"
4. Confirmer dans la popup

**Attendu :**
- ✅ Message "✅ Évaluation soumise avec succès..."
- ⏱️ Attente de 2 secondes
- 🔄 Page se rafraîchit automatiquement
- 🔒 Formulaire devient en lecture seule (champs grisés)

**Si ne fonctionne pas :**
- ❌ Vérifier que le serveur Node.js tourne
- ❌ Vérifier la console (F12) pour voir l'erreur API

---

### Test 5 : Page validation.html

**Ouvrir http://localhost:3001/validation.html**

**Vérifier :**
- ✅ Titre : "✅ Espace de Validation N+2"
- ✅ Nom : "👤 Ousseynou SECK" (si connecté)
- ✅ Sous-titre : "Consultez et validez les évaluations en attente"
- ❌ **AUCUN texte SQL ne doit apparaître**

**Si le SQL apparaît toujours :**
1. Faire CTRL+U pour voir le code source
2. Chercher "phpMyAdmin" dans la source
3. Si trouvé : **Le fichier validation.html n'a PAS été remplacé**

---

## 📋 CHECKLIST DE RÉSOLUTION

### Étape 1 : Démarrer le serveur
- [ ] Terminal ouvert dans le bon dossier
- [ ] Commande `npm start` exécutée
- [ ] Serveur répond sur http://localhost:3001
- [ ] Aucune erreur affichée

### Étape 2 : Vérifier les fichiers JavaScript
- [ ] pdf-generator.js existe dans le dossier
- [ ] formulaire-online.js chargé (pas d'erreur 404)
- [ ] jsPDF disponible (typeof window.jsPDF === "function")
- [ ] Aucune erreur dans la console (F12)

### Étape 3 : Nettoyer validation.html
- [ ] Fichier validation-OLD-BACKUP.html créé (backup)
- [ ] Fichier validation-CLEAN.html renommé en validation.html
- [ ] Page validation.html rechargée
- [ ] Aucun texte SQL visible

### Étape 4 : Tester les boutons
- [ ] Bouton "Télécharger PDF" fonctionne
- [ ] PDF se télécharge OU fallback print() fonctionne
- [ ] Bouton "Soumettre à N+2" fonctionne
- [ ] Page se rafraîchit après 2 secondes
- [ ] Formulaire devient en lecture seule

---

## 🆘 DÉPANNAGE RAPIDE

### Si le serveur ne démarre pas

**Erreur "Cannot find module" :**
```bash
npm install
```

**Erreur "Port 3001 already in use" :**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <numéro_PID> /F

# Puis redémarrer
npm start
```

### Si jsPDF ne charge pas

**Vérifier dans formulaire-online.html ligne 7 :**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

**Si Internet ne fonctionne pas :**
- Le fallback `window.print()` s'activera automatiquement

### Si les fonctions ne se chargent pas

**Vérifier l'ordre de chargement des scripts dans formulaire-online.html :**
```html
<!-- ORDRE CORRECT : -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="pdf-generator.js"></script>
<script src="formulaire-online.js"></script>
```

**Si pdf-generator.js n'existe pas :**
- Créer le fichier (voir documentation)
- OU utiliser seulement window.print()

---

## 📞 CONTACT SUPPORT

**Si les problèmes persistent après toutes ces vérifications :**

1. **Copier les erreurs de la console (F12)**
2. **Noter quelle étape échoue exactement**
3. **Vérifier les logs du serveur Node.js**

**Fichiers à vérifier en priorité :**
- `formulaire-online.html` (ligne 642-643)
- `formulaire-online.js` (lignes 494-544 et 595-646)
- `validation.html` (ligne 107 - doit être propre)
- `server.js` (serveur Node.js doit tourner)

---

## ✅ RÉSOLUTION FINALE ATTENDUE

**Une fois tous les tests passés :**

1. ✅ Serveur Node.js tourne sur port 3001
2. ✅ Bouton PDF télécharge un fichier `.pdf`
3. ✅ Bouton Soumettre envoie ET rafraîchit la page
4. ✅ Page validation.html ne montre AUCUN texte SQL
5. ✅ Aucune erreur dans la console navigateur
6. ✅ Tous les formulaires fonctionnent normalement

**Temps estimé de résolution :** 10-15 minutes maximum

---

**© 2025 - SENICO - Support Technique**
