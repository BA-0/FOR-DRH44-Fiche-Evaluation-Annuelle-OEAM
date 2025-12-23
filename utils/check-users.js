const fetch = require('node-fetch');
const API_URL = 'http://localhost:3001/api';

async function checkUsers() {
    console.log('\n👥 VÉRIFICATION DES UTILISATEURS\n');
    console.log('═══════════════════════════════════════════════\n');
    
    // Simuler des tentatives de login pour vérifier les rôles
    const testUsers = [
        { email: 'cherif.ba@senico.sn', name: 'Cherif BA' },
        { email: 'bougar.diouf@senico.sn', name: 'Bougar DIOUF' },
        { email: 'ousseynou.seck@senico.sn', name: 'Ousseynou SECK' }
    ];
    
    for (const user of testUsers) {
        console.log(`📧 ${user.name} (${user.email})`);
        
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    password: 'password123'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`   ✅ Connecté avec succès`);
                console.log(`   Rôle: ${result.user.role}`);
                console.log(`   Nom: ${result.user.name}`);
                console.log(`   Page: ${result.user.role === 'N1' ? 'formulaire-online.html' : 'validation.html'}`);
            } else {
                console.log(`   ❌ Échec: ${result.error}`);
            }
        } catch (error) {
            console.log(`   ❌ Erreur: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('═══════════════════════════════════════════════\n');
}

checkUsers();
