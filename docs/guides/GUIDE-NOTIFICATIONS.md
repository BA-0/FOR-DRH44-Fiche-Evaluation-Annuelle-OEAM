# 🎨 Guide d'Utilisation du Système de Notifications Moderne

## 📋 Vue d'ensemble

Votre application dispose maintenant d'un système de notifications moderne et élégant avec :

- ✅ **Notifications toast** avec animations fluides
- 🎯 **Confirmations modernes** avec icônes expressives  
- ⚡ **Messages compacts** en bas de page
- 🔄 **Écran de chargement** avec spinner animé
- 🎨 **Design professionnel** aux couleurs SENICO SA

---

## 🚀 Utilisation Simple

### 1. Notifications Rapides

```javascript
// Message de succès
notify.success("L'évaluation a été soumise avec succès !");

// Message d'erreur
notify.error("Impossible de charger les données. Veuillez réessayer.");

// Message d'avertissement
notify.warning("Certains champs sont incomplets.");

// Message d'information
notify.info("Nouvelle version disponible.");
```

### 2. Toast Compact (en bas)

```javascript
// Message court qui disparaît rapidement
notify.toast("Données sauvegardées automatiquement");
notify.toast("Connexion rétablie", 2000); // 2 secondes
```

### 3. Confirmations Modernes

```javascript
// Confirmation simple
const confirmed = await confirmDialog.confirm(
    "Voulez-vous soumettre cette évaluation ?"
);
if (confirmed) {
    // Action confirmée
    console.log("Utilisateur a confirmé");
}

// Confirmation de suppression (rouge danger)
const deleteConfirmed = await confirmDialog.delete("cette évaluation");
if (deleteConfirmed) {
    // Supprimer
}

// Confirmation de déconnexion
const logoutConfirmed = await confirmDialog.logout();
if (logoutConfirmed) {
    // Déconnecter
}

// Confirmation personnalisée
const result = await confirmDialog.show({
    title: "Envoyer l'email ?",
    message: "Cette action notifiera le N+2",
    icon: "📧",
    confirmText: "Envoyer",
    cancelText: "Annuler",
    type: "primary" // ou "danger"
});
```

### 4. Écran de Chargement

```javascript
// Afficher le loader
loading.show("Téléchargement en cours...");

// Masquer le loader
loading.hide();

// Wrapper automatique pour promesses
const data = await loading.wrap(
    fetch('/api/data').then(r => r.json()),
    "Chargement des données..."
);
```

---

## 🎯 Exemples d'Utilisation Réelle

### Lors d'une soumission de formulaire

```javascript
async function submitForm() {
    // Confirmer d'abord
    const confirmed = await confirmDialog.confirm(
        "Voulez-vous soumettre ce formulaire ?<br><br>Vous ne pourrez plus le modifier après validation."
    );
    
    if (!confirmed) {
        notify.toast("Soumission annulée");
        return;
    }
    
    // Afficher le chargement
    loading.show("Soumission en cours...");
    
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            loading.hide();
            notify.success("Formulaire soumis avec succès !");
            
            // Redirection après 2 secondes
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            loading.hide();
            notify.error("Erreur lors de la soumission. Veuillez réessayer.");
        }
    } catch (error) {
        loading.hide();
        notify.error("Erreur de connexion. Vérifiez votre réseau.");
    }
}
```

### Lors d'une suppression

```javascript
async function deleteDraft(draftId) {
    // Confirmation de suppression
    const confirmed = await confirmDialog.delete("ce brouillon");
    
    if (!confirmed) return;
    
    loading.show("Suppression en cours...");
    
    try {
        await fetch(`/api/drafts/${draftId}`, { method: 'DELETE' });
        loading.hide();
        notify.success("Brouillon supprimé avec succès");
        loadDrafts(); // Recharger la liste
    } catch (error) {
        loading.hide();
        notify.error("Impossible de supprimer le brouillon");
    }
}
```

### Lors de la déconnexion

```javascript
async function logout() {
    const confirmed = await confirmDialog.logout();
    
    if (confirmed) {
        loading.show("Déconnexion...");
        
        localStorage.removeItem('authToken');
        sessionStorage.clear();
        
        setTimeout(() => {
            window.location.replace('login.html');
        }, 1000);
    }
}
```

### Validation en temps réel

```javascript
// Toast discret pour sauvegarde auto
function autoSave() {
    localStorage.setItem('draft', JSON.stringify(formData));
    notify.toast("💾 Sauvegarde automatique", 2000);
}

// Warning pour champs manquants
function validateForm() {
    if (missingFields.length > 0) {
        notify.warning(
            `${missingFields.length} champ(s) obligatoire(s) manquant(s)`,
            "⚠️ Formulaire incomplet"
        );
        return false;
    }
    return true;
}
```

---

## 🎨 Personnalisation

### Durée personnalisée

```javascript
// Notification qui reste 10 secondes
notify.show({
    type: 'info',
    title: 'Information importante',
    message: 'Maintenance prévue ce soir à 22h',
    duration: 10000 // 10 secondes
});

// Notification permanente (manuel de fermeture)
notify.show({
    type: 'warning',
    title: 'Action requise',
    message: 'Veuillez mettre à jour votre profil',
    duration: 0, // Ne se ferme pas automatiquement
    closable: true
});
```

### Notification sans bouton de fermeture

```javascript
notify.show({
    type: 'success',
    message: 'Enregistrement automatique réussi',
    duration: 3000,
    closable: false // Pas de bouton ×
});
```

### Effacer toutes les notifications

```javascript
// Supprimer toutes les notifications visibles
notify.clear();
```

---

## 📱 Responsive

Le système s'adapte automatiquement aux écrans mobiles :
- Notifications en pleine largeur sur mobile
- Modals centrés et adaptés
- Toasts visibles en bas sur tous les écrans

---

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

```javascript
// Confirmer les actions destructives
const confirmed = await confirmDialog.delete("cet élément");
if (confirmed) deleteItem();

// Loader pour les actions longues
loading.show("Traitement en cours...");
await longOperation();
loading.hide();

// Toast pour les actions mineures
notify.toast("Copié dans le presse-papier");

// Messages clairs et précis
notify.success("Évaluation #1234 soumise avec succès");
```

### ❌ À ÉVITER

```javascript
// Trop de notifications simultanées
notify.success("Ok");
notify.info("Info");
notify.warning("Attention"); // Spam !

// Messages vagues
notify.error("Erreur"); // Pas assez précis

// Oublier le loader
await longOperation(); // Utilisateur ne sait pas que ça charge

// alert() natif
alert("Message"); // Laid et bloquant
```

---

## 🔧 Compatibilité

Le système remplace automatiquement l'ancien `alert()` :

```javascript
// Ancien code (fonctionne toujours)
showAlert("Message d'erreur", "error");

// Nouveau code (recommandé)
notify.error("Message d'erreur");
```

---

## 🎨 Design

- **Couleurs** : Adaptées à votre charte SENICO SA (vert #4A9D5F)
- **Animations** : Fluides et non intrusives
- **Icônes** : Expressives et intuitives (✓ ✕ ⚠ ℹ)
- **Position** : Coin supérieur droit (notifications) / bas centré (toasts)
- **Accessibilité** : Contraste élevé, boutons clairs

---

## 🚀 Résultat

Votre application offre maintenant une **expérience utilisateur moderne** avec :

✅ Notifications visuellement attractives  
✅ Confirmations claires et rassurantes  
✅ Feedback instantané sur chaque action  
✅ Design cohérent sur toutes les pages  
✅ Interface professionnelle et moderne  

---

**Date de mise à jour** : 20 décembre 2024  
**Version** : 1.0 - Système de notifications SENICO SA
