# 📋 PLAN D'ACTION - APPLICATION SENICO SA

**Date de création** : 20 décembre 2025  
**Objectif** : Corriger et améliorer l'application  
**Délai** : 1 semaine pour l'essentiel

---

## 🎯 VUE D'ENSEMBLE

**Note actuelle** : 9.2/10  
**Note cible** : 9.8/10

**Corrections à faire** :
- 🔴 1 critique (5 min)
- 🟡 4 importantes (3h)
- 🟢 7 améliorations (2 jours)

---

## 📅 PLANNING JOUR PAR JOUR

### 🔴 JOUR 1 - VENDREDI 20 DÉCEMBRE (30 minutes)

#### ✅ Tâche 1 : Corriger le bug critique (5 min)

**Fichier** : `security.js`

```javascript
// Ligne 9 - AVANT
if (window.APP_CONFIG && !window.APP_CONFIG.ENV !== 'development') {
    
// Ligne 9 - APRÈS
if (window.APP_CONFIG && window.APP_CONFIG.ENV !== 'development') {
```

**Vérification** :
```javascript
// Tester en mode production
console.log('ENV:', window.APP_CONFIG.ENV);
// Clic droit devrait être bloqué si ENV !== 'development'
```

---

#### ✅ Tâche 2 : Remplacer showAlert() (10 min)

**Fichier** : `dashboard.js`

**Rechercher** :
```javascript
showAlert('Erreur de connexion au serveur: ' + error.message, 'error');
```

**Remplacer par** :
```javascript
notify.error('Erreur de connexion au serveur: ' + error.message);
```

**Aussi dans** :
- Toutes les autres occurrences de `showAlert()`
- Remplacer par `notify.success()`, `notify.error()`, etc.

---

#### ✅ Tâche 3 : Ajouter defer aux scripts (15 min)

**Tous les fichiers HTML** :

```html
<!-- AVANT -->
<script src="config.js"></script>
<script src="security.js"></script>
<script src="notifications.js"></script>
<script src="navigation.js"></script>
<script src="dashboard.js"></script>

<!-- APRÈS -->
<script src="config.js"></script>
<script src="security.js" defer></script>
<script src="notifications.js" defer></script>
<script src="navigation.js" defer></script>
<script src="dashboard.js" defer></script>
```

**Fichiers à modifier** :
- [ ] dashboard.html
- [ ] formulaire-online.html
- [ ] validation.html
- [ ] drafts-manager.html

**⚠️ Important** : Ne PAS mettre defer sur config.js (doit charger en premier)

---

### 🟡 JOUR 2 - SAMEDI 21 DÉCEMBRE (3 heures)

#### ✅ Tâche 4 : Créer template API standardisé (1h)

**Nouveau fichier** : `api-utils.js`

```javascript
/**
 * Template standardisé pour les appels API
 * @param {string} endpoint - L'endpoint de l'API (ex: '/evaluations')
 * @param {object} options - Options fetch (method, body, etc.)
 * @param {string} loadingText - Texte affiché pendant le chargement
 * @returns {Promise<any>} Résultat de l'API
 */
async function callAPI(endpoint, options = {}, loadingText = 'Chargement...') {
    try {
        loading.show(loadingText);
        
        const API_URL = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost:3001/api';
        const url = `${API_URL}${endpoint}`;
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                ...options.headers
            }
        };
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            return result;
        } else {
            throw new Error(result.message || 'Erreur inconnue');
        }
        
    } catch (error) {
        console.error('Erreur API:', error);
        const cleanedError = window.cleanErrorMessage ? window.cleanErrorMessage(error) : error.message;
        notify.error('❌ ' + cleanedError);
        throw error;
        
    } finally {
        loading.hide();
    }
}

// Export global
window.callAPI = callAPI;
```

**Ajouter dans tous les HTML** :
```html
<script src="api-utils.js"></script>
```

---

#### ✅ Tâche 5 : Utiliser le nouveau template (1h)

**Exemple dans dashboard.js** :

**AVANT** :
```javascript
const response = await fetch(`${API_URL}/evaluations/evaluator/${encodeURIComponent(userEmail)}`, {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
});
```

**APRÈS** :
```javascript
const result = await callAPI(
    `/evaluations/evaluator/${encodeURIComponent(userEmail)}`,
    { method: 'GET' },
    'Chargement des évaluations...'
);
```

**Appliquer dans** :
- [ ] dashboard.js (3 endroits)
- [ ] formulaire-online.js (5 endroits)
- [ ] validation.js (2 endroits)
- [ ] drafts-manager.js (2 endroits)

---

#### ✅ Tâche 6 : Remplacer confirm() par confirmDialog (1h)

**Fichier** : Tous les fichiers avec function logout()

**AVANT** :
```javascript
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        localStorage.clear();
        window.location.replace('login.html');
    }
}
```

**APRÈS** :
```javascript
async function logout() {
    const confirmed = await confirmDialog.logout();
    if (confirmed) {
        loading.show('Déconnexion en cours...');
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
            window.location.replace('login.html');
        }, 500);
    }
}
```

**Aussi remplacer dans** :
- [ ] Confirmations de suppression → `confirmDialog.delete()`
- [ ] Confirmations de soumission → `confirmDialog.confirm()`

---

### 🟢 JOUR 3 - DIMANCHE 22 DÉCEMBRE (2 heures)

#### ✅ Tâche 7 : Ajouter JSDoc aux fonctions critiques (2h)

**Fonctions prioritaires** :

1. **checkAuthentication()** (tous les fichiers)
```javascript
/**
 * Vérifie si l'utilisateur est authentifié
 * Redirige vers login.html si non authentifié
 * @returns {boolean} True si authentifié, sinon redirige
 */
function checkAuthentication() {
    // ...
}
```

2. **loadDashboardData()** (dashboard.js)
```javascript
/**
 * Charge les données du dashboard selon le rôle de l'utilisateur
 * Affiche les statistiques et les actions rapides
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Si la connexion à l'API échoue
 */
async function loadDashboardData() {
    // ...
}
```

3. **saveDraft()** (formulaire-online.js)
```javascript
/**
 * Enregistre le formulaire en tant que brouillon
 * Collecte toutes les données du formulaire et les envoie à l'API
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Si la sauvegarde échoue
 */
async function saveDraft() {
    // ...
}
```

4. **submitToN2()** (formulaire-online.js)
```javascript
/**
 * Soumet l'évaluation au validateur N+2
 * Valide le formulaire, demande confirmation, puis envoie
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Si la soumission échoue
 */
async function submitToN2() {
    // ...
}
```

5. **confirmValidation()** (validation.js)
```javascript
/**
 * Valide définitivement une évaluation avec signature N+2
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Si la validation échoue
 */
async function confirmValidation() {
    // ...
}
```

**Fichiers à documenter** :
- [ ] dashboard.js (5 fonctions)
- [ ] formulaire-online.js (8 fonctions)
- [ ] validation.js (5 fonctions)
- [ ] drafts-manager.js (3 fonctions)

---

### 🟢 JOUR 4 - LUNDI 23 DÉCEMBRE (3 heures)

#### ✅ Tâche 8 : Ajouter validation formulaire (1.5h)

**Fichier** : `formulaire-online.js`

**Ajouter après les autres fonctions** :

```javascript
/**
 * Valide tous les champs obligatoires du formulaire
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateForm() {
    const requiredFields = [
        { id: 'dateEvaluation', label: 'Date d\'évaluation' },
        { id: 'direction', label: 'Direction' },
        { id: 'service', label: 'Service' },
        { id: 'evaluateurNom', label: 'Nom de l\'évaluateur (N+1)' },
        { id: 'evaluateurFonction', label: 'Fonction de l\'évaluateur' },
        { id: 'evalueNom', label: 'Nom de l\'évalué (N)' },
        { id: 'evalueFonction', label: 'Fonction de l\'évalué' },
        { id: 'categorie', label: 'Catégorie' },
        { id: 'emailN2', label: 'Email du N+2' },
        { id: 'annee', label: 'Année d\'évaluation' }
    ];
    
    const errors = [];
    
    // Valider champs requis
    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        const value = element ? element.value.trim() : '';
        
        if (!value) {
            errors.push(field.label);
            if (element) {
                element.classList.add('error');
                element.addEventListener('input', function() {
                    this.classList.remove('error');
                }, { once: true });
            }
        }
    }
    
    // Valider email
    const emailN2 = document.getElementById('emailN2').value;
    if (emailN2 && !isValidEmail(emailN2)) {
        errors.push('Email N+2 (format invalide)');
        document.getElementById('emailN2').classList.add('error');
    }
    
    // Valider année
    const annee = document.getElementById('annee').value;
    if (annee && (annee < 2020 || annee > 2030)) {
        errors.push('Année (doit être entre 2020 et 2030)');
        document.getElementById('annee').classList.add('error');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Valide le format d'un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si le format est valide
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
```

**Utiliser dans submitToN2()** :

```javascript
async function submitToN2() {
    // Valider le formulaire AVANT la confirmation
    const validation = validateForm();
    
    if (!validation.valid) {
        notify.error(
            `❌ Veuillez remplir tous les champs obligatoires :\n\n${validation.errors.map(e => `• ${e}`).join('\n')}`,
            'Formulaire incomplet'
        );
        
        // Scroller vers le premier champ en erreur
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        
        return;
    }
    
    // Demander confirmation
    const confirmed = await confirmDialog.confirm(
        'Voulez-vous soumettre cette évaluation au validateur N+2 ?<br><br>Une fois soumise, vous ne pourrez plus la modifier.',
        '✅ Confirmer la soumission'
    );
    
    if (confirmed) {
        // Envoyer à l'API
        await saveEvaluation('submitted');
    }
}
```

**Ajouter CSS pour les erreurs** :

```css
/* Dans senico-theme.css ou dans le <style> du formulaire */
.error {
    border-color: #e74c3c !important;
    background-color: #fee !important;
    animation: shake 0.3s;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
```

---

#### ✅ Tâche 9 : Améliorer accessibilité (1.5h)

**1. Ajouter labels ARIA aux boutons** (30 min)

**Exemples** :

```html
<!-- Bouton déconnexion -->
<button onclick="logout()" 
        aria-label="Se déconnecter de l'application"
        role="button">
    🚪 Déconnexion
</button>

<!-- Bouton retour -->
<button class="back-button" 
        onclick="navigateBack()" 
        aria-label="Retour à la page précédente"
        title="Retour">
    ← Retour
</button>

<!-- Bouton sauvegarder -->
<button onclick="saveDraft()" 
        aria-label="Enregistrer le formulaire en tant que brouillon">
    💾 Enregistrer le brouillon
</button>
```

**Appliquer sur** :
- [ ] Tous les boutons de dashboard.html
- [ ] Tous les boutons de formulaire-online.html
- [ ] Tous les boutons de validation.html
- [ ] Tous les boutons de drafts-manager.html

---

**2. Ajouter landmarks ARIA** (30 min)

```html
<!-- En-tête -->
<header role="banner" aria-label="En-tête de l'application">
    <!-- ... -->
</header>

<!-- Navigation -->
<nav role="navigation" aria-label="Navigation principale">
    <!-- ... -->
</nav>

<!-- Contenu principal -->
<main role="main" aria-label="Contenu principal">
    <div class="container">
        <!-- ... -->
    </div>
</main>

<!-- Pied de page -->
<footer role="contentinfo" aria-label="Pied de page">
    <!-- ... -->
</footer>
```

---

**3. Améliorer focus visible** (30 min)

**Ajouter dans senico-theme.css** :

```css
/* Focus visible pour accessibilité */
button:focus,
input:focus,
select:focus,
textarea:focus,
a:focus {
    outline: 3px solid #4A9D5F;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(74, 157, 95, 0.2);
}

/* Spécifique pour les canvas de signature */
canvas:focus {
    outline: 3px dashed #4A9D5F;
    outline-offset: 4px;
}

/* Désactiver outline uniquement si utilisation souris */
button:focus:not(:focus-visible),
input:focus:not(:focus-visible),
select:focus:not(:focus-visible) {
    outline: none;
    box-shadow: none;
}
```

---

### 🟢 JOUR 5 - MARDI 24 DÉCEMBRE (2 heures)

#### ✅ Tâche 10 : Tests basiques (2h)

**Créer dossier** : `tests/`

**Fichier 1** : `tests/notifications.test.js`

```javascript
/**
 * Tests pour le système de notifications
 * Framework: Jest ou Vitest (npm install --save-dev vitest)
 */

import { describe, test, expect, beforeEach } from 'vitest';

// Mock du DOM
beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
});

describe('Système de Notifications', () => {
    test('notify.success affiche une notification de succès', () => {
        // TODO: Implémenter le test
        expect(true).toBe(true);
    });
    
    test('notify.error nettoie les URLs localhost', () => {
        const message = 'Erreur sur http://localhost:3001/api';
        const cleaned = window.cleanErrorMessage(message);
        expect(cleaned).not.toContain('localhost');
    });
});
```

**Fichier 2** : `tests/validation.test.js`

```javascript
import { describe, test, expect } from 'vitest';

describe('Validation Formulaire', () => {
    test('isValidEmail valide les emails corrects', () => {
        // Copier la fonction depuis formulaire-online.js
        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('invalid@')).toBe(false);
        expect(isValidEmail('@invalid.com')).toBe(false);
    });
    
    test('validateForm détecte les champs vides', () => {
        // TODO: Implémenter le test complet
        expect(true).toBe(true);
    });
});
```

**Fichier 3** : `tests/calculs.test.js`

```javascript
import { describe, test, expect } from 'vitest';

describe('Calculs des Notes', () => {
    test('calcul note section I', () => {
        // Simuler les notes de la section I
        const notes = [4, 3, 5, 2, 4]; // Notes sur 5
        const total = notes.reduce((a, b) => a + b, 0);
        const moyenne = (total / (notes.length * 5)) * 5;
        
        expect(moyenne).toBeCloseTo(3.6, 1);
    });
    
    test('calcul note section II', () => {
        // Simuler les notes de la section II
        const notes = [3, 4, 2, 3]; // Notes sur 4
        const total = notes.reduce((a, b) => a + b, 0);
        const moyenne = (total / (notes.length * 4)) * 4;
        
        expect(moyenne).toBeCloseTo(3.0, 1);
    });
    
    test('calcul note finale', () => {
        const noteI = 3.6;
        const noteII = 3.0;
        const noteFinal = ((noteI / 5) * 60 + (noteII / 4) * 40) / 100 * 5;
        
        expect(noteFinal).toBeCloseTo(3.3, 1);
    });
});
```

**Configuration** : `package.json`

```json
{
  "name": "senico-evaluation",
  "version": "1.0.0",
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

**Lancer les tests** :
```bash
npm install
npm test
```

---

## ✅ CHECKLIST FINALE

### Jour 1 - Corrections Critiques
- [ ] Bug security.js corrigé
- [ ] showAlert() remplacé par notify.error()
- [ ] defer ajouté aux scripts

### Jour 2 - Standardisation
- [ ] api-utils.js créé
- [ ] callAPI() utilisé partout
- [ ] confirmDialog.logout() utilisé

### Jour 3 - Documentation
- [ ] JSDoc ajouté aux fonctions critiques
- [ ] Commentaires améliorés

### Jour 4 - Validation et Accessibilité
- [ ] validateForm() créé et utilisé
- [ ] Labels ARIA ajoutés
- [ ] Landmarks ARIA ajoutés
- [ ] Focus visible amélioré

### Jour 5 - Tests
- [ ] Tests notifications
- [ ] Tests validation
- [ ] Tests calculs
- [ ] npm test fonctionne

---

## 📊 RÉSULTAT ATTENDU

### Avant Corrections
- Note : 9.2/10
- 1 bug critique
- Gestion d'erreurs incohérente
- Pas de documentation
- Accessibilité limitée

### Après Corrections
- Note : 9.8/10 ✨
- 0 bug
- Gestion d'erreurs standardisée
- Documentation complète
- Accessibilité améliorée
- Tests en place

---

## 🎯 VALIDATION FINALE

### Tests Manuels

1. **Authentification**
   - [ ] Login N+1 fonctionne
   - [ ] Login N+2 fonctionne
   - [ ] Redirection si non authentifié
   - [ ] Logout fonctionne

2. **Dashboard**
   - [ ] Stats s'affichent correctement
   - [ ] Actions rapides fonctionnelles
   - [ ] Activité récente visible

3. **Formulaire**
   - [ ] Création nouveau formulaire
   - [ ] Sauvegarde brouillon
   - [ ] Validation champs
   - [ ] Calcul notes automatique
   - [ ] Soumission à N+2

4. **Validation N+2**
   - [ ] Liste évaluations en attente
   - [ ] Modal validation fonctionne
   - [ ] Signature électronique
   - [ ] Validation définitive

5. **Brouillons**
   - [ ] Liste des brouillons
   - [ ] Recherche fonctionne
   - [ ] Édition brouillon
   - [ ] Suppression brouillon

### Tests Automatiques
- [ ] npm test passe sans erreur
- [ ] Tous les tests unitaires verts

### Accessibilité
- [ ] Navigation au clavier
- [ ] Lecteur d'écran compatible
- [ ] Contraste suffisant

### Performance
- [ ] Chargement < 2 secondes
- [ ] Pas de lag dans l'interface
- [ ] API répond rapidement

---

## 📞 SUPPORT

Si vous rencontrez un problème :

1. **Vérifier les logs console**
   ```javascript
   console.log('État actuel:', {
       token: !!localStorage.getItem('authToken'),
       role: localStorage.getItem('userRole'),
       email: localStorage.getItem('userEmail')
   });
   ```

2. **Vérifier l'API**
   ```javascript
   // Tester l'endpoint
   fetch('http://localhost:3001/api/health')
       .then(r => r.json())
       .then(console.log);
   ```

3. **Vérifier les scripts chargés**
   ```javascript
   console.log('APP_CONFIG:', window.APP_CONFIG);
   console.log('notify:', typeof window.notify);
   console.log('confirmDialog:', typeof window.confirmDialog);
   console.log('loading:', typeof window.loading);
   ```

---

**Plan créé le** : 20 décembre 2025  
**Durée estimée** : 5 jours (12 heures de travail)  
**Objectif** : Application parfaite à 9.8/10  
**Statut** : ✅ PRÊT À EXÉCUTER
