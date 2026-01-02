// Générer un PDF de l'évaluation complète
async function generatePDF(evaluationId) {
    try {
        // Utiliser l'URL de l'API depuis la configuration globale
        const API_URL = window.APP_CONFIG ? window.APP_CONFIG.API_URL : 'http://localhost:3001/api';
        
        // Récupérer les données complètes de l'évaluation
        const response = await fetch(`${API_URL}/evaluations/${evaluationId}/full`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        });
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Impossible de récupérer l\'évaluation');
        }
        
        const evaluation = data.evaluation;
        
        // Créer le document PDF avec jsPDF - Optimisé pour une seule page
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        let yPos = 10;
        const pageWidth = 210;
        const margin = 10;
        const contentWidth = pageWidth - (2 * margin);
        
        // Couleurs SENICO
        const senicVert = [74, 157, 95];  // #4A9D5F
        const senicRouge = [227, 6, 19];  // #E30613
        
        // En-tête compact avec couleurs SENICO
        doc.setFillColor(...senicVert);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('FORMULAIRE D\'ÉVALUATION', pageWidth / 2, 8, { align: 'center' });
        doc.setFontSize(8);
        doc.text('SENICO SA - 100% Digital - Zéro Papier', pageWidth / 2, 13, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text('SÉNÉGALAISE INDUSTRIE COMMERCE', pageWidth / 2, 17, { align: 'center' });
        
        yPos = 25;
        doc.setTextColor(0, 0, 0);
        
        // Date compacte
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const dateStr = evaluation.dateEvaluation ? new Date(evaluation.dateEvaluation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
        doc.text(`Date : ${dateStr}`, margin, yPos);
        yPos += 5;
        
        // Section: Informations Générales - Format compact en 2 colonnes
        addSectionTitle(doc, 'INFORMATIONS GÉNÉRALES', yPos, senicVert);
        yPos += 5;
        
        const col1Width = contentWidth / 2;
        const col2X = margin + col1Width + 5;
        
        const infos = [
            ['Direction', evaluation.direction],
            ['Service', evaluation.service],
            ['Évaluateur (N+1)', evaluation.evaluateurNom],
            ['Fonction N+1', evaluation.evaluateurFonction],
            ['Évalué (N)', evaluation.evalueNom],
            ['Fonction N', evaluation.evalueFonction],
            ['Catégorie', evaluation.categorie],
            ['Année', String(evaluation.annee || '')]
        ];
        
        doc.setFontSize(7);
        let tempY = yPos;
        infos.forEach(([label, value], index) => {
            const isLeftCol = index % 2 === 0;
            const xPos = isLeftCol ? margin : col2X;
            if (!isLeftCol && index > 0) tempY += 4;
            
            doc.setFont('helvetica', 'bold');
            doc.text(label + ':', xPos, tempY);
            doc.setFont('helvetica', 'normal');
            const displayValue = String(value || '').substring(0, 40);
            doc.text(displayValue, xPos + 25, tempY);
            
            if (isLeftCol) tempY = yPos + Math.floor(index / 2) * 4;
        });
        
        yPos += Math.ceil(infos.length / 2) * 4 + 3;
        
        // Section I: Évaluation des Résultats - Format compact
        addSectionTitle(doc, 'I. ÉVALUATION DES RÉSULTATS', yPos, senicVert);
        yPos += 4;
        
        doc.setFontSize(6);
        doc.setFont('helvetica', 'italic');
        doc.text(`Comparés aux objectifs fixés en ${String(evaluation.annee || '')}`, margin, yPos);
        yPos += 4;
        
        // Objectifs en format ultra compact (2 colonnes)
        if (evaluation.objectifs && evaluation.objectifs.length > 0) {
            const objPerCol = Math.ceil(evaluation.objectifs.length / 2);
            doc.setFontSize(6);
            
            evaluation.objectifs.forEach((obj, index) => {
                const isLeftCol = index < objPerCol;
                const xPos = isLeftCol ? margin : col2X;
                const localY = isLeftCol ? yPos + (index * 10) : yPos + ((index - objPerCol) * 10);
                
                doc.setFont('helvetica', 'bold');
                doc.text(`Obj${index + 1}:`, xPos, localY);
                doc.setFont('helvetica', 'normal');
                const shortObj = String(obj.objectif || '').substring(0, 35);
                doc.text(shortObj, xPos + 8, localY);
                doc.text(`Ind: ${String(obj.indicateur || '').substring(0, 30)}`, xPos, localY + 3);
                doc.setFont('helvetica', 'bold');
                doc.text(`${obj.taux || '0'}%`, xPos, localY + 6);
            });
            
            yPos += objPerCol * 10;
        }
        
        yPos += 2;
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 4, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`Score N°1 (Objectifs) = ${evaluation.scores?.scoreN1 || 0}%`, margin + 3, yPos);
        yPos += 5;
        
        // Section II: Savoir-faire et Savoir-être - Format compact
        addSectionTitle(doc, 'II. ÉVALUATION SAVOIR FAIRE/ÊTRE', yPos, senicVert);
        yPos += 5;
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const leftCol = margin;
        const rightCol = margin + col1Width + 5;
        
        if (evaluation.scores?.totalQP) {
            doc.text(`• Qualités Professionnelles : ${evaluation.scores.totalQP}%`, leftCol, yPos);
        }
        if (evaluation.scores?.totalQPE) {
            doc.text(`• Qualités Personnelles : ${evaluation.scores.totalQPE}%`, rightCol, yPos);
        }
        yPos += 4;
        if (evaluation.scores?.totalQR) {
            doc.text(`• Qualités Relationnelles : ${evaluation.scores.totalQR}%`, leftCol, yPos);
        }
        yPos += 5;
        
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 4, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`Score N°2 (Compétences) = ${evaluation.scores?.scoreN2 || 0}%`, margin + 3, yPos);
        yPos += 6;
        
        // Section III: Score Final - Compact
        addSectionTitle(doc, 'III. SCORE FINAL', yPos, senicRouge);
        yPos += 5;
        
        doc.setFillColor(...senicVert);
        doc.rect(margin, yPos - 3, contentWidth, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`SCORE FINAL = ${evaluation.scores?.scoreFinal || 0}%`, pageWidth / 2, yPos + 3, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPos += 11;
        
        // Section IV: Remarques et Observations - Format très compact
        addSectionTitle(doc, 'IV. REMARQUES ET OBSERVATIONS', yPos, senicVert);
        yPos += 4;
        
        // 4.1 et 4.2 côte à côte en 2 colonnes
        const observCol1 = margin;
        const observCol2 = margin + col1Width + 5;
        let yCol1 = yPos;
        let yCol2 = yPos;
        
        // Colonne 1: Évaluateur
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('4.1. Évaluateur (N+1):', observCol1, yCol1);
        yCol1 += 4;
        
        if (evaluation.observations?.evaluateur) {
            yCol1 = addCompactList(doc, 'Points forts', evaluation.observations.evaluateur.pointsForts, observCol1, yCol1, col1Width - 3, senicVert);
            yCol1 = addCompactList(doc, 'Points faibles', evaluation.observations.evaluateur.pointsFaibles, observCol1, yCol1, col1Width - 3, senicRouge);
            yCol1 = addCompactList(doc, 'Axes progrès', evaluation.observations.evaluateur.axesProgres, observCol1, yCol1, col1Width - 3, [100, 100, 100]);
        }
        
        // Colonne 2: Évalué
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('4.2. Évalué (N):', observCol2, yCol2);
        yCol2 += 4;
        
        if (evaluation.observations?.evalue) {
            yCol2 = addCompactList(doc, 'Réussites', evaluation.observations.evalue.reussites, observCol2, yCol2, col1Width - 3, senicVert);
            yCol2 = addCompactList(doc, 'Difficultés', evaluation.observations.evalue.difficultes, observCol2, yCol2, col1Width - 3, senicRouge);
            yCol2 = addCompactList(doc, 'Souhaits', evaluation.observations.evalue.souhaits, observCol2, yCol2, col1Width - 3, [100, 100, 100]);
        }
        
        yPos = Math.max(yCol1, yCol2) + 2;
        
        // Section V: Signatures - Compact
        addSectionTitle(doc, 'V. VALIDATION', yPos, senicRouge);
        yPos += 4;
        
        doc.setFontSize(6);
        doc.setFont('helvetica', 'italic');
        doc.text('Accord des parties N, N+1 et validation N+2', margin, yPos);
        yPos += 5;
        
        // Signatures en 3 colonnes compactes
        const sigWidth = contentWidth / 3;
        
        addCompactSignature(doc, evaluation.signatures?.N, 'Évalué (N)', margin, yPos, sigWidth - 3, senicVert);
        addCompactSignature(doc, evaluation.signatures?.N1, 'Évaluateur (N+1)', margin + sigWidth, yPos, sigWidth - 3, senicVert);
        addCompactSignature(doc, evaluation.signatures?.N2, 'Validateur (N+2)', margin + (2 * sigWidth), yPos, sigWidth - 3, senicRouge);
        
        yPos += 25;
        
        // Note finale
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, yPos, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(0, 0, 0);
        doc.text('N.B. Transmettre la fiche à la DRH pour suite utile', pageWidth / 2, yPos + 4, { align: 'center' });
        
        // Pied de page
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        doc.text(`Page 1 sur 1`, pageWidth / 2, 287, { align: 'center' });
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, 292, { align: 'center' });
        
        // Télécharger le PDF
        const fileName = `Evaluation_${evaluation.evalueNom?.replace(/\s+/g, '_')}_${evaluation.annee || new Date().getFullYear()}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName };
        
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
    }
}

// Fonctions utilitaires pour le PDF - Version compacte une page

// Exporter la fonction pour tous les contextes (chargement dynamique inclus)
if (typeof window !== 'undefined') {
    window.generatePDF = generatePDF;
}

// Rendre la fonction accessible globalement
window.generatePDF = generatePDF;
function addSectionTitle(doc, title, yPos, color = [44, 62, 80]) {
    doc.setFillColor(...color);
    doc.rect(10, yPos - 3, 190, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 12, yPos + 1.5);
    doc.setTextColor(0, 0, 0);
}

function addCompactList(doc, title, items, x, y, width, color = [100, 100, 100]) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...color);
    doc.text(title + ':', x, y);
    doc.setTextColor(0, 0, 0);
    y += 3;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    
    if (items && items.length > 0) {
        items.slice(0, 3).forEach((item, index) => {
            if (item && item.trim()) {
                const shortItem = String(item).substring(0, 50);
                const wrapped = doc.splitTextToSize(`${index + 1}. ${shortItem}`, width - 3);
                doc.text(wrapped[0], x + 2, y);
                y += 2.5;
            }
        });
    } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Aucune', x + 2, y);
        doc.setTextColor(0, 0, 0);
        y += 2.5;
    }
    
    return y + 1;
}

function addCompactSignature(doc, signature, title, x, y, width, color = [74, 157, 95]) {
    // Cadre compact
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.rect(x, y, width, 20);
    
    // Titre
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(title, x + width / 2, y + 3, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Nom
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    if (signature?.nom) {
        const shortNom = String(signature.nom).substring(0, 25);
        doc.text(shortNom, x + 1, y + 7);
    }
    
    // Date
    if (signature?.date) {
        const dateStr = signature.date.includes('-') ? new Date(signature.date).toLocaleDateString('fr-FR') : signature.date;
        doc.text(`${dateStr}`, x + 1, y + 11);
    }
    
    // Signature (image compacte)
    if (signature?.image && signature.image !== 'data:,' && signature.image.length > 50) {
        try {
            doc.addImage(signature.image, 'PNG', x + 2, y + 12, width - 4, 6);
        } catch (e) {
            doc.setFontSize(5);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('Signature élec.', x + width / 2, y + 15, { align: 'center' });
            doc.setTextColor(0, 0, 0);
        }
    }
}
