// Export Excel functionality using SheetJS library

// Helper to show alert (fallback if not defined)
function showAlertExcel(message, type = 'error') {
    if (typeof showAlert === 'function') {
        showAlertExcel(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }
}

// Function to export evaluations to Excel
async function exportToExcel(evaluations, fileName = 'evaluations.xlsx') {
    // Check if SheetJS is loaded
    if (typeof XLSX === 'undefined') {
        console.error('SheetJS library not loaded');
        showAlertExcel('Erreur: Bibliothèque d\'export Excel non disponible', 'error');
        return;
    }
    
    try {
        // Prepare data for export
        const exportData = evaluations.map((eval, index) => {
            const obj = {
                'N°': index + 1,
                'Nom Évalué': eval.evalue_nom || eval.nom_evalue || '',
                'Direction': eval.direction || '',
                'Service': eval.service || '',
                'Poste': eval.evalue_fonction || eval.poste || '',
                'Évaluateur (N+1)': eval.evaluateur_nom || '',
                'Email N+1': eval.evaluateur_email || '',
                'N+2 Validateur': eval.email_n2 || '',
                'Statut': getStatusLabel(eval.status || eval.statut),
                'Date Création': formatDate(eval.created_at || eval.date_creation),
                'Date Soumission': eval.submitted_at || eval.date_soumission ? formatDate(eval.submitted_at || eval.date_soumission) : 'Non soumis',
                'Date Validation': eval.validated_at || eval.date_validation ? formatDate(eval.validated_at || eval.date_validation) : 'Non validé'
            };
            
            // Add evaluation criteria if available
            if (eval.criteres) {
                try {
                    const criteres = typeof eval.criteres === 'string' ? JSON.parse(eval.criteres) : eval.criteres;
                    
                    if (criteres && typeof criteres === 'object') {
                        // Critères principaux
                        obj['Maîtrise du Poste'] = criteres.maitrise_poste || 'N/A';
                        obj['Qualité du Travail'] = criteres.qualite_travail || 'N/A';
                        obj['Productivité'] = criteres.productivite || 'N/A';
                        obj['Discipline'] = criteres.discipline || 'N/A';
                        obj['Ponctualité'] = criteres.ponctualite || 'N/A';
                        obj['Esprit d\'Initiative'] = criteres.esprit_initiative || 'N/A';
                        obj['Sens de l\'Organisation'] = criteres.sens_organisation || 'N/A';
                        obj['Communication'] = criteres.communication || 'N/A';
                        obj['Collaboration'] = criteres.collaboration || 'N/A';
                        obj['Adaptabilité'] = criteres.adaptabilite || 'N/A';
                        
                        // Score total si disponible
                        if (criteres.score_total) {
                            obj['Score Total'] = criteres.score_total;
                        }
                    }
                } catch (e) {
                    console.warn('Could not parse criteria:', e);
                }
            }
            
            return obj;
        });
        
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Set column widths
        const colWidths = [
            { wch: 5 },  // N°
            { wch: 25 }, // Nom
            { wch: 20 }, // Direction
            { wch: 20 }, // Service
            { wch: 20 }, // Poste
            { wch: 25 }, // Évaluateur
            { wch: 30 }, // Email N+1
            { wch: 30 }, // N+2
            { wch: 12 }, // Statut
            { wch: 18 }, // Date création
            { wch: 18 }, // Date soumission
            { wch: 18 }  // Date validation
        ];
        ws['!cols'] = colWidths;
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Évaluations");
        
        // Add metadata
        wb.Props = {
            Title: "Évaluations SENICO SA",
            Subject: "Export des évaluations",
            Author: userName || "SENICO SA",
            CreatedDate: new Date()
        };
        
        // Export to file
        XLSX.writeFile(wb, fileName);
        
        showAlertExcel(`Export Excel réussi: ${fileName}`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showAlertExcel('Erreur lors de l\'export Excel: ' + error.message, 'error');
    }
}

// Export single evaluation with full details
async function exportSingleEvaluation(evaluation) {
    if (typeof XLSX === 'undefined') {
        showAlertExcel('Bibliothèque d\'export Excel non disponible', 'error');
        return;
    }
    
    try {
        // Parse evaluation data
        const criteres = typeof evaluation.criteres === 'string' ? JSON.parse(evaluation.criteres) : evaluation.criteres;
        
        // Prepare main info sheet
        const mainInfo = [
            ['FICHE D\'ÉVALUATION', ''],
            ['', ''],
            ['Informations Générales', ''],
            ['Nom de l\'Évalué', evaluation.evalue_nom || evaluation.nom_evalue || ''],
            ['Direction', evaluation.direction || ''],
            ['Service', evaluation.service || ''],
            ['Poste', evaluation.evalue_fonction || evaluation.poste || ''],
            ['', ''],
            ['Évaluateurs', ''],
            ['Évaluateur (N+1)', evaluation.evaluateur_nom || ''],
            ['Email N+1', evaluation.evaluateur_email || ''],
            ['Validateur (N+2)', evaluation.email_n2 || ''],
            ['', ''],
            ['Dates', ''],
            ['Date de création', formatDate(evaluation.created_at || evaluation.date_creation)],
            ['Date de soumission', (evaluation.submitted_at || evaluation.date_soumission) ? formatDate(evaluation.submitted_at || evaluation.date_soumission) : 'Non soumis'],
            ['Date de validation', (evaluation.validated_at || evaluation.date_validation) ? formatDate(evaluation.validated_at || evaluation.date_validation) : 'Non validé'],
            ['Statut', getStatusLabel(evaluation.status || evaluation.statut)]
        ];
        
        // Prepare criteria sheet
        const criteriaData = [];
        
        if (criteres && typeof criteres === 'object') {
            criteriaData.push(['Critère', 'Note', 'Observations']);
            criteriaData.push(['', '', '']);
            
            const criteriaList = [
                { key: 'maitrise_poste', label: 'Maîtrise du Poste' },
                { key: 'qualite_travail', label: 'Qualité du Travail' },
                { key: 'productivite', label: 'Productivité' },
                { key: 'discipline', label: 'Discipline' },
                { key: 'ponctualite', label: 'Ponctualité' },
                { key: 'esprit_initiative', label: 'Esprit d\'Initiative' },
                { key: 'sens_organisation', label: 'Sens de l\'Organisation' },
                { key: 'communication', label: 'Communication' },
                { key: 'collaboration', label: 'Collaboration' },
                { key: 'adaptabilite', label: 'Adaptabilité' }
            ];
            
            criteriaList.forEach(item => {
                criteriaData.push([
                    item.label,
                    criteres[item.key] || 'N/A',
                    criteres[`${item.key}_obs`] || ''
                ]);
            });
            
            criteriaData.push(['', '', '']);
            criteriaData.push(['SCORE TOTAL', criteres.score_total || 'N/A', '']);
        }
        
        // Create worksheets
        const ws1 = XLSX.utils.aoa_to_sheet(mainInfo);
        const ws2 = XLSX.utils.aoa_to_sheet(criteriaData);
        
        // Set column widths
        ws1['!cols'] = [{ wch: 30 }, { wch: 40 }];
        ws2['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 50 }];
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws1, "Informations");
        XLSX.utils.book_append_sheet(wb, ws2, "Critères");
        
        // Export
        const fileName = `evaluation_${evaluation.nom_evalue || 'sans_nom'}_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        showAlertExcel('Export Excel réussi', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showAlertExcel('Erreur lors de l\'export: ' + error.message, 'error');
    }
}

// Export with custom filters
async function exportWithFilters(filters = {}) {
    try {
        const userEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');
        
        if (!userEmail) {
            throw new Error('Utilisateur non connecté');
        }
        
        // Determine endpoint based on role
        const endpoint = userRole === 'N1' 
            ? `${API_URL}/evaluations/evaluator/${userEmail}`
            : `${API_URL}/evaluations/pending/${userEmail}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }
        
        let evaluations = await response.json();
        
        // Apply filters
        if (filters.status && filters.status !== 'all') {
            evaluations = evaluations.filter(e => e.statut === filters.status);
        }
        
        if (filters.direction) {
            evaluations = evaluations.filter(e => 
                e.direction && e.direction.toLowerCase().includes(filters.direction.toLowerCase())
            );
        }
        
        if (filters.service) {
            evaluations = evaluations.filter(e => 
                e.service && e.service.toLowerCase().includes(filters.service.toLowerCase())
            );
        }
        
        if (filters.dateFrom) {
            evaluations = evaluations.filter(e => 
                new Date(e.date_creation) >= new Date(filters.dateFrom)
            );
        }
        
        if (filters.dateTo) {
            evaluations = evaluations.filter(e => 
                new Date(e.date_creation) <= new Date(filters.dateTo)
            );
        }
        
        if (evaluations.length === 0) {
            showAlertExcel('Aucune évaluation correspondant aux critères', 'info');
            return;
        }
        
        // Generate filename with filters
        let fileName = 'evaluations';
        if (filters.status) fileName += `_${filters.status}`;
        if (filters.direction) fileName += `_${filters.direction}`;
        fileName += `_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        await exportToExcel(evaluations, fileName);
        
    } catch (error) {
        console.error('Export error:', error);
        showAlertExcel('Erreur lors de l\'export: ' + error.message, 'error');
    }
}

// Helper functions
function getStatusLabel(status) {
    const labels = {
        'draft': 'Brouillon',
        'submitted': 'Soumis',
        'validated': 'Validé'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export all functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        exportToExcel,
        exportSingleEvaluation,
        exportWithFilters
    };
}
