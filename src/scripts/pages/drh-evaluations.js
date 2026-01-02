// drh-evaluations.js : Gestion avancée des évaluations pour la DRH

const API_URL = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost:3001/api';
let allEvaluations = [];

// Initialisation
window.addEventListener('DOMContentLoaded', async () => {
    if (!checkDRHAuth()) return;
    await loadEvaluations();
    setupFilters();
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    // Export PDF des évaluations clôturées (validées)
    function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        // Colonnes du tableau
        const columns = [
            'Évalué', 'Évaluateur', 'Direction', 'Service', 'Statut', 'Date création', 'Score final'
        ];
        // Récupérer les évaluations validées
        const rows = Array.from(document.querySelectorAll('#evaluationsTableBody tr'))
            .map(tr => {
                const tds = tr.querySelectorAll('td');
                return [
                    tds[0]?.innerText.replace(/^[A-Z]{1,2}\s/, ''), // retire avatar
                    tds[1]?.innerText,
                    tds[2]?.innerText,
                    tds[3]?.innerText,
                    tds[4]?.innerText,
                    tds[5]?.innerText,
                    tds[6]?.innerText
                ];
            })
            .filter(row => row[4].toLowerCase().includes('validée'));
        if (!rows.length) {
            alert('Aucune évaluation clôturée à exporter.');
            return;
        }
        doc.text('Évaluations clôturées', 14, 16);
        doc.autoTable({
            head: [columns],
            body: rows,
            startY: 22,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [67, 160, 71] },
            margin: { left: 10, right: 10 }
        });
        doc.save('evaluations_cloturees.pdf');
    }
    setupAdvancedFilters();
    // Focus automatique sur la recherche pour enchaîner les actions
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.focus();
});

function checkDRHAuth() {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    if (!token || !role || !email) {
        // Nettoyer la session et rediriger
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('login.html');
        return false;
    }
    if (role !== 'DRH') {
        alert('Accès réservé à la DRH.');
        window.location.replace('dashboard.html');
        return false;
    }
    return true;
}

async function loadEvaluations() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/evaluations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            allEvaluations = result.evaluations || [];
            console.log('DEBUG allEvaluations:', allEvaluations);
            if (allEvaluations.length) {
                console.log('Exemple direction:', allEvaluations[0].direction);
                console.log('Exemple service:', allEvaluations[0].service);
                console.log('Exemple annee:', allEvaluations[0].annee);
            }
            renderTable(allEvaluations);
            setupDashboardFilters();
        } else {
            showNoResults('Erreur lors du chargement des évaluations');
        }
    } catch (e) {
        showNoResults('Erreur de connexion au serveur');
    }

// Filtres dynamiques pour le dashboard DRH
function setupDashboardFilters() {
    const dirSelect = document.getElementById('dashboardDirection');
    const svcSelect = document.getElementById('dashboardService');
    if (!dirSelect || !svcSelect) return;
    // Extraire directions/services uniques
    const directions = Array.from(new Set(allEvaluations.map(ev => ev.direction || '').filter(Boolean)));
    dirSelect.innerHTML = '<option value="">Toutes directions</option>' + directions.map(d => `<option value="${d}">${d}</option>`).join('');
    svcSelect.innerHTML = '<option value="">Tous services</option>';
    dirSelect.addEventListener('change', () => {
        const dir = dirSelect.value;
        const filtered = dir ? allEvaluations.filter(ev => ev.direction === dir) : allEvaluations;
        const services = Array.from(new Set(filtered.map(ev => ev.service || '').filter(Boolean)));
        svcSelect.innerHTML = '<option value="">Tous services</option>' + services.map(s => `<option value="${s}">${s}</option>`).join('');
        updateDashboardStats();
    });
    svcSelect.addEventListener('change', updateDashboardStats);
    updateDashboardStats();
}

function updateDashboardStats() {
    const dir = document.getElementById('dashboardDirection')?.value || '';
    const svc = document.getElementById('dashboardService')?.value || '';
    let filtered = allEvaluations;
    if (dir) filtered = filtered.filter(ev => ev.direction === dir);
    if (svc) filtered = filtered.filter(ev => ev.service === svc);
    document.getElementById('stat-total').textContent = filtered.length;
    document.getElementById('stat-validated').textContent = filtered.filter(ev => ev.status === 'validated').length;
    document.getElementById('stat-submitted').textContent = filtered.filter(ev => ev.status === 'submitted').length;
    document.getElementById('stat-draft').textContent = filtered.filter(ev => ev.status === 'draft').length;
}
}

function setupFilters() {
    document.getElementById('searchInput').addEventListener('input', filterTable);
    document.getElementById('statusFilter').addEventListener('change', filterTable);
    // Les autres filtres sont ajoutés dans setupAdvancedFilters()
}

// Filtres dynamiques avancés pour la gestion des évaluations
function setupAdvancedFilters() {
    const dirSelect = document.getElementById('filterDirection');
    const svcSelect = document.getElementById('filterService');
    const yearSelect = document.getElementById('filterYear');
    if (!dirSelect || !svcSelect || !yearSelect) return;
    // Directions
    const directions = Array.from(new Set(allEvaluations.map(ev => ev.direction || '').filter(Boolean)));
    dirSelect.innerHTML = '<option value="">Toutes directions</option>' + directions.map(d => `<option value="${d}">${d}</option>`).join('');
    // Services (dépend de la direction)
    function updateServices() {
        const dir = dirSelect.value;
        const filtered = dir ? allEvaluations.filter(ev => ev.direction === dir) : allEvaluations;
        const services = Array.from(new Set(filtered.map(ev => ev.service || '').filter(Boolean)));
        svcSelect.innerHTML = '<option value="">Tous services</option>' + services.map(s => `<option value="${s}">${s}</option>`).join('');
    }
    dirSelect.addEventListener('change', () => { updateServices(); filterTable(); });
    svcSelect.addEventListener('change', filterTable);
    updateServices();
    // Années (prend en compte annee ou année extraite de la date de création)
    const years = Array.from(new Set(allEvaluations.map(ev => {
        if (ev.annee && String(ev.annee).length === 4) return String(ev.annee);
        if (ev.date_creation) {
            const match = ev.date_creation.match(/(\d{4})/);
            if (match) return match[1];
        }
        return '';
    }).filter(Boolean)));
    yearSelect.innerHTML = '<option value="">Toutes années</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
    yearSelect.addEventListener('change', filterTable);
}

function filterTable() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    const dir = document.getElementById('filterDirection')?.value || '';
    const svc = document.getElementById('filterService')?.value || '';
    const year = document.getElementById('filterYear')?.value || '';
    let filtered = allEvaluations.filter(ev => {
        let match = true;
        if (search) {
            match = (
                (ev.evalue_nom || '').toLowerCase().includes(search) ||
                (ev.evaluateur_nom || '').toLowerCase().includes(search) ||
                (ev.direction || '').toLowerCase().includes(search) ||
                (ev.service || '').toLowerCase().includes(search)
            );
        }
        if (status && ev.status !== status) match = false;
        if (dir && ev.direction !== dir) match = false;
        if (svc && ev.service !== svc) match = false;
        if (year) {
            let evalYear = '';
            if (ev.annee && String(ev.annee).length === 4) evalYear = String(ev.annee);
            else if (ev.date_creation) {
                const match = ev.date_creation.match(/(\d{4})/);
                if (match) evalYear = match[1];
            }
            if (evalYear !== String(year)) match = false;
        }
        return match;
    });
    renderTable(filtered);
}

function renderTable(evaluations) {
    const tbody = document.getElementById('evaluationsTableBody');
    tbody.innerHTML = '';
    if (!evaluations.length) {
        showNoResults('Aucun résultat');
        return;
    }
    document.getElementById('noResults').style.display = 'none';
    evaluations.forEach(ev => {
        // Gestion des champs JSON (scores, etc.)
        let scoreFinal = '';
        if (ev.scores) {
            try {
                const scores = typeof ev.scores === 'string' ? JSON.parse(ev.scores) : ev.scores;
                scoreFinal = scores.scoreFinal || scores.score_final || scores.scoreN2 || scores.scoreN1 || '';
            } catch (e) { scoreFinal = ''; }
        }
        // Retard : si statut pas validé et date limite dépassée (exemple : 30 jours après created_at)
        let retard = '';
        if (ev.status !== 'validated' && ev.created_at) {
            const created = new Date(ev.created_at);
            const now = new Date();
            const diffDays = Math.floor((now - created) / (1000*60*60*24));
            if (diffDays > 30) retard = `<span class='status-badge status-retard'>Retard</span>`;
        }
        // Avatar initiales pour l'évalué
        let initials = '';
        const nom = ev.evalue_nom || ev.evalue || '';
        if (nom) {
            const parts = nom.trim().split(' ');
            initials = parts.length > 1 ? (parts[0][0] + parts[1][0]) : nom.substring(0,2);
        }
        const avatar = `<span class='drh-avatar'>${initials.toUpperCase()}</span>`;
        // Affichage des champs principaux
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${avatar}${nom}</td>
            <td>${ev.evaluateur_nom || ev.evaluateur || ''}</td>
            <td>${ev.direction || ''}</td>
            <td>${ev.service || ''}</td>
            <td><span class="status-badge status-${ev.status}">${getStatusLabel(ev.status)}</span> ${retard}</td>
            <td>${formatDate(ev.created_at)}</td>
            <td>${scoreFinal}</td>
            <td>${retard ? 'Oui' : ''}</td>
            <td style="display:flex;gap:10px;">
                <button class="drh-action-btn drh-action-view" onclick="viewEvaluation('${ev.id}')" title="Voir la fiche d'évaluation" style="background: #3498db; color: #fff; font-weight: 600; border-radius: 6px; padding: 8px 16px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px #3498db22; border: none; cursor: pointer;">
                    <i class="fas fa-eye"></i> <span>Voir</span>
                </button>
                <button class="drh-action-btn drh-action-pdf" onclick="downloadPDF('${ev.id}')" title="Télécharger le PDF de l'évaluation" style="background: #e74c3c; color: #fff; font-weight: 600; border-radius: 6px; padding: 8px 16px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px #e74c3c22; border: none; cursor: pointer;">
                    <i class="fas fa-file-pdf"></i> <span>PDF</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showNoResults(msg) {
    document.getElementById('evaluationsTableBody').innerHTML = '';
    const noRes = document.getElementById('noResults');
    noRes.textContent = msg;
    noRes.style.display = 'block';
}

function getStatusLabel(status) {
    if (status === 'draft') return 'Brouillon';
    if (status === 'submitted') return 'En attente';
    if (status === 'validated') return 'Validée';
    return status;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
}

function viewEvaluation(id) {
    // Ouvre la fiche dans le même onglet pour un workflow plus fluide
    window.location.href = `formulaire-online.html?id=${id}`;
    setTimeout(() => window.scrollTo({top:0,behavior:'smooth'}), 500);
}

function downloadPDF(id) {
    // Génération PDF individuelle réelle
    // Charger dynamiquement jsPDF et pdf-generator si besoin
    function runPDF() {
        if (typeof generatePDF === 'function' && typeof window.jspdf !== 'undefined') {
            generatePDF(id)
                .then(() => alert('✅ PDF téléchargé avec succès !'))
                .catch(e => alert('❌ Erreur lors de la génération du PDF : ' + (e.message || e)));
        } else {
            alert('❌ La génération PDF n\'est pas disponible.');
        }
    }

    if (typeof window.jspdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            if (typeof generatePDF === 'undefined') {
                const pdfGenScript = document.createElement('script');
                pdfGenScript.src = '../utils/pdf-generator.js';
                pdfGenScript.onload = runPDF;
                document.body.appendChild(pdfGenScript);
            } else {
                runPDF();
            }
        };
        document.body.appendChild(script);
    } else if (typeof generatePDF === 'undefined') {
        const pdfGenScript = document.createElement('script');
        pdfGenScript.src = '../utils/pdf-generator.js';
        pdfGenScript.onload = runPDF;
        document.body.appendChild(pdfGenScript);
    } else {
        runPDF();
    }
}

function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Bibliothèque Excel non chargée');
        return;
    }
    const data = Array.from(document.querySelectorAll('#evaluationsTableBody tr')).map(tr => {
        const tds = tr.querySelectorAll('td');
        return {
            'Évalué': tds[0].textContent,
            'Évaluateur': tds[1].textContent,
            'Direction': tds[2].textContent,
            'Service': tds[3].textContent,
            'Statut': tds[4].textContent,
            'Date création': tds[5].textContent,
            'Score final': tds[6].textContent
        };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Évaluations');
    XLSX.writeFile(wb, `evaluations_DRH_${new Date().toISOString().split('T')[0]}.xlsx`);
}
