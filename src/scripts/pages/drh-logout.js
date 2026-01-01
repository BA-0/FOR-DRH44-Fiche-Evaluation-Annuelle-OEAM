// Fonction de déconnexion pour DRH (identique à formulaire-online.js)
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?\n\nAssurez-vous d\'avoir sauvegardé votre travail.')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('login.html');
    }
}
