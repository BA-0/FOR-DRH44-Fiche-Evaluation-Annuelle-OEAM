# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## ⚡ 3 ÉTAPES POUR TOUT RÉPARER

---

### ÉTAPE 1 : DÉMARRER LE SERVEUR (2 minutes)

**Ouvrir un terminal CMD :**

```cmd
cd "c:\Users\cheri\Documents\SENICO\formulaire evaluation"
npm start
```

**✅ Vous devez voir :**
```
🚀 Serveur démarré sur http://localhost:3001
📊 Base de données connectée
```

**❌ Si vous voyez une erreur :**
```cmd
npm install
npm start
```

**⚠️ IMPORTANT : Ne fermez PAS cette fenêtre de terminal !**

---

### ÉTAPE 2 : NETTOYER VALIDATION.HTML (1 minute)

**Ouvrir l'explorateur Windows :**
```
c:\Users\cheri\Documents\SENICO\formulaire evaluation
```

**Renommer les fichiers :**
1. `validation.html` → `validation-OLD.html` (clic droit → Renommer)
2. `validation-CLEAN.html` → `validation.html` (clic droit → Renommer)

**✅ C'est fait ! Le SQL a disparu.**

---

### ÉTAPE 3 : TESTER LES BOUTONS (2 minutes)

**Dans votre navigateur, ouvrir :**
```
http://localhost:3001/formulaire-online.html
```

**Test Bouton PDF :**
1. Remplir le champ "Nom de l'évalué" → Mettre "TEST"
2. Cliquer sur "📥 Télécharger PDF"
3. ✅ Un fichier PDF doit se télécharger

**Test Bouton Soumettre :**
1. Remplir TOUS les champs obligatoires (direction, service, etc.)
2. Ajouter signature N (dessiner dans le cadre)
3. Ajouter signature N+1 (dessiner dans le 2e cadre)
4. Cliquer sur "✅ Soumettre à N+2"
5. Confirmer dans la popup
6. ✅ La page doit se rafraîchir après 2 secondes

---

## 🔍 VÉRIFICATIONS RAPIDES

### Vérification 1 : Le serveur tourne-t-il ?

**Dans le navigateur, aller sur :**
```
http://localhost:3001
```

**✅ Si vous voyez la page de login → Serveur OK**  
**❌ Si "Impossible d'atteindre le site" → Serveur non démarré**

---

### Vérification 2 : jsPDF est-il chargé ?

**Sur la page formulaire-online.html, appuyer sur F12**

**Dans l'onglet "Console", taper :**
```javascript
typeof window.jsPDF
```

**✅ Affiche "function" → OK**  
**❌ Affiche "undefined" → Problème CDN**

---

### Vérification 3 : Le SQL a-t-il disparu ?

**Ouvrir :**
```
http://localhost:3001/validation.html
```

**Se connecter avec :**
- Email : `ousseynou.seck@senico.sn`
- Mot de passe : `valid123`

**✅ Vous devez voir UNIQUEMENT :**
- Titre : "✅ Espace de Validation N+2"
- Nom : "👤 Ousseynou SECK"
- Sous-titre : "Consultez et validez les évaluations en attente"

**❌ Si vous voyez "-- phpMyAdmin SQL Dump" :**
- Le fichier validation.html n'a PAS été renommé
- Retournez à l'ÉTAPE 2

---

## 🆘 SI ÇA NE FONCTIONNE TOUJOURS PAS

### Problème A : "npm start" ne fonctionne pas

**Vérifier que WAMP/MySQL tourne :**
1. Chercher l'icône WAMP dans la barre des tâches
2. Elle doit être VERTE (pas orange ou rouge)
3. Si elle est rouge, cliquer → "Démarrer tous les services"

**Vérifier que Node.js est installé :**
```cmd
node --version
```
**Doit afficher :** `v18.x.x` ou similaire

**Si rien ne s'affiche :**
→ Node.js n'est pas installé → Télécharger sur https://nodejs.org

---

### Problème B : PDF ne se télécharge pas

**Vérifier la console (F12) :**
- S'il y a des erreurs en rouge → Noter l'erreur exacte
- Chercher "404" ou "Failed to fetch" → Le serveur ne répond pas

**Solution temporaire :**
- Utiliser le bouton "🖨️ Imprimer"
- Choisir "Enregistrer en PDF" dans la boîte de dialogue

---

### Problème C : Page ne se rafraîchit pas après soumission

**Vérifier que vous avez bien modifié formulaire-online.js :**

Ouvrir `formulaire-online.js` avec Notepad

Chercher (CTRL+F) : `setTimeout(() => {`

**Doit se trouver ligne 640 environ :**
```javascript
setTimeout(() => {
    window.location.reload();
}, 2000);
```

**Si absent :**
- Les modifications n'ont pas été appliquées
- Vérifier que vous avez bien sauvegardé le fichier

---

## ✅ TOUT FONCTIONNE ? FÉLICITATIONS !

**Vous avez réussi si :**
- ✅ Serveur démarre sans erreur
- ✅ Bouton PDF télécharge un fichier
- ✅ Bouton Soumettre envoie ET rafraîchit
- ✅ Page validation.html est propre (pas de SQL)

**Fichiers de documentation créés :**
- [DIAGNOSTIC-PROBLEMES.md](DIAGNOSTIC-PROBLEMES.md) - Diagnostic complet
- [RESUME-FINAL.md](RESUME-FINAL.md) - Résumé des modifications
- [MODIFICATIONS-19-12-2025.md](MODIFICATIONS-19-12-2025.md) - Détails techniques
- [CORRECTION-SQL-VALIDATION.md](CORRECTION-SQL-VALIDATION.md) - Guide correction SQL

---

**© 2025 - SENICO - Guide de dépannage express**

**Temps total : 5 minutes maximum**
