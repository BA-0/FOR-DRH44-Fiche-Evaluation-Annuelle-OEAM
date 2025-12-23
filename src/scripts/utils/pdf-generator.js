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
        
        // Créer le document PDF avec jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        let yPos = 20;
        const pageWidth = 210;
        const margin = 15;
        const contentWidth = pageWidth - (2 * margin);
        
        // Couleurs SENICO
        const senicVert = [74, 157, 95];  // #4A9D5F
        const senicRouge = [227, 6, 19];  // #E30613
        
        // En-tête avec couleurs SENICO
        doc.setFillColor(...senicVert);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('FORMULAIRE D\'ÉVALUATION', pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(11);
        doc.text('SENICO SA - 100% Digital - Zéro Papier', pageWidth / 2, 24, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('SÉNÉGALAISE INDUSTRIE COMMERCE', pageWidth / 2, 30, { align: 'center' });
        
        yPos = 45;
        doc.setTextColor(0, 0, 0);
        
        // Date
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const dateStr = evaluation.dateEvaluation ? new Date(evaluation.dateEvaluation).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
        doc.text(`Date d'évaluation : ${dateStr}`, margin, yPos);
        yPos += 8;
        
        // Section: Informations Générales
        addSectionTitle(doc, 'INFORMATIONS GÉNÉRALES', yPos, senicVert);
        yPos += 10;
        
        const infos = [
            ['Direction', evaluation.direction],
            ['Service', evaluation.service],
            ['Évaluateur (N+1)', evaluation.evaluateurNom],
            ['Fonction de l\'Évaluateur', evaluation.evaluateurFonction],
            ['Évalué (N)', evaluation.evalueNom],
            ['Fonction de l\'Évalué', evaluation.evalueFonction],
            ['Catégorie', evaluation.categorie],
            ['Année d\'évaluation', String(evaluation.annee || '')]
        ];
        
        doc.setFontSize(9);
        infos.forEach(([label, value]) => {
            yPos = checkPageBreak(doc, yPos, 10);
            doc.setFont('helvetica', 'bold');
            doc.text(label + ' :', margin, yPos);
            doc.setFont('helvetica', 'normal');
            const wrappedValue = doc.splitTextToSize(String(value || ''), contentWidth - 70);
            doc.text(wrappedValue, margin + 70, yPos);
            yPos += Math.max(5, wrappedValue.length * 5);
        });
        
        yPos += 5;
        yPos = checkPageBreak(doc, yPos, 30);
        
        // Section I: Évaluation des Résultats
        addSectionTitle(doc, 'I. ÉVALUATION DES RÉSULTATS', yPos, senicVert);
        yPos += 10;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(`Comparés aux objectifs fixés en ${String(evaluation.annee || '')}`, margin, yPos);
        yPos += 8;
        
        // Tableau des objectifs
        if (evaluation.objectifs && evaluation.objectifs.length > 0) {
            evaluation.objectifs.forEach((obj, index) => {
                yPos = checkPageBreak(doc, yPos, 20);
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.text(`Objectif ${index + 1} :`, margin, yPos);
                doc.setFont('helvetica', 'normal');
                const wrappedObjectif = doc.splitTextToSize(obj.objectif || '', contentWidth - 30);
                doc.text(wrappedObjectif, margin + 25, yPos);
                yPos += Math.max(5, wrappedObjectif.length * 5);
                
                doc.setFont('helvetica', 'bold');
                doc.text('Indicateur :', margin + 5, yPos);
                doc.setFont('helvetica', 'normal');
                const wrappedIndicateur = doc.splitTextToSize(obj.indicateur || '', contentWidth - 35);
                doc.text(wrappedIndicateur, margin + 30, yPos);
                yPos += Math.max(5, wrappedIndicateur.length * 5);
                
                doc.setFont('helvetica', 'bold');
                doc.text(`Taux : ${obj.taux || '0'}%`, margin + 5, yPos);
                yPos += 7;
            });
        }
        
        yPos += 2;
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 6, contentWidth, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`Score N°1 (Objectifs) = ${evaluation.scores?.scoreN1 || 0}%`, margin + 5, yPos);
        yPos += 10;
        
        yPos = checkPageBreak(doc, yPos, 30);
        
        // Section II: Savoir-faire et Savoir-être
        addSectionTitle(doc, 'II. ÉVALUATION DU SAVOIR FAIRE ET DU SAVOIR ÊTRE', yPos, senicVert);
        yPos += 10;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        if (evaluation.scores?.totalQP) {
            doc.text(`• Qualités Professionnelles : ${evaluation.scores.totalQP}%`, margin + 5, yPos);
            yPos += 6;
        }
        if (evaluation.scores?.totalQPE) {
            doc.text(`• Qualités Personnelles : ${evaluation.scores.totalQPE}%`, margin + 5, yPos);
            yPos += 6;
        }
        if (evaluation.scores?.totalQR) {
            doc.text(`• Qualités Relationnelles : ${evaluation.scores.totalQR}%`, margin + 5, yPos);
            yPos += 6;
        }
        
        yPos += 2;
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 6, contentWidth, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`Score N°2 (Compétences) = ${evaluation.scores?.scoreN2 || 0}%`, margin + 5, yPos);
        yPos += 12;
        
        yPos = checkPageBreak(doc, yPos, 30);
        
        // Section III: Score Final
        addSectionTitle(doc, 'III. SCORE FINAL', yPos, senicRouge);
        yPos += 10;
        
        doc.setFillColor(...senicVert);
        doc.rect(margin, yPos - 5, contentWidth, 18, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`SCORE FINAL = ${evaluation.scores?.scoreFinal || 0}%`, pageWidth / 2, yPos + 6, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPos += 22;
        
        yPos = checkPageBreak(doc, yPos, 30);
        
        // Section IV: Remarques et Observations
        addSectionTitle(doc, 'IV. REMARQUES ET OBSERVATIONS', yPos, senicVert);
        yPos += 10;
        
        // 4.1 Observations de l'Évaluateur
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('4.1. De l\'Évaluateur (N+1) sur l\'Évalué (N)', margin, yPos);
        yPos += 8;
        
        if (evaluation.observations?.evaluateur) {
            // Points forts
            if (evaluation.observations.evaluateur.pointsForts && evaluation.observations.evaluateur.pointsForts.length > 0) {
                yPos = addObservationList(doc, 'Points forts', evaluation.observations.evaluateur.pointsForts, yPos, senicVert);
                yPos += 5;
            }
            
            // Points faibles
            if (evaluation.observations.evaluateur.pointsFaibles && evaluation.observations.evaluateur.pointsFaibles.length > 0) {
                yPos = checkPageBreak(doc, yPos, 20);
                yPos = addObservationList(doc, 'Points faibles', evaluation.observations.evaluateur.pointsFaibles, yPos, senicRouge);
                yPos += 5;
            }
            
            // Axes de progrès
            if (evaluation.observations.evaluateur.axesProgres && evaluation.observations.evaluateur.axesProgres.length > 0) {
                yPos = checkPageBreak(doc, yPos, 20);
                yPos = addObservationList(doc, 'Axes de progrès', evaluation.observations.evaluateur.axesProgres, yPos, [100, 100, 100]);
                yPos += 5;
            }
        }
        
        yPos = checkPageBreak(doc, yPos, 30);
        yPos += 3;
        
        // 4.2 Observations de l'Évalué
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('4.2. De l\'Évalué (N) sur lui-même et sur l\'évaluation', margin, yPos);
        yPos += 8;
        
        if (evaluation.observations?.evalue) {
            // Réussites
            if (evaluation.observations.evalue.reussites && evaluation.observations.evalue.reussites.length > 0) {
                yPos = addObservationList(doc, 'Ses réussites', evaluation.observations.evalue.reussites, yPos, senicVert);
                yPos += 5;
            }
            
            // Difficultés
            if (evaluation.observations.evalue.difficultes && evaluation.observations.evalue.difficultes.length > 0) {
                yPos = checkPageBreak(doc, yPos, 20);
                yPos = addObservationList(doc, 'Ses difficultés', evaluation.observations.evalue.difficultes, yPos, senicRouge);
                yPos += 5;
            }
            
            // Souhaits
            if (evaluation.observations.evalue.souhaits && evaluation.observations.evalue.souhaits.length > 0) {
                yPos = checkPageBreak(doc, yPos, 20);
                yPos = addObservationList(doc, 'Ses souhaits', evaluation.observations.evalue.souhaits, yPos, [100, 100, 100]);
                yPos += 5;
            }
        }
        
        yPos = checkPageBreak(doc, yPos, 70);
        yPos += 5;
        
        // Section V: Signatures
        addSectionTitle(doc, 'V. VALIDATION DE L\'ÉVALUATION', yPos, senicRouge);
        yPos += 10;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('Signature pour l\'accord des parties N et N+1, et la validation par N+2.', margin, yPos);
        yPos += 10;
        
        // Signatures en 3 colonnes
        const colWidth = contentWidth / 3;
        
        // Signature N
        addSignatureBox(doc, evaluation.signatures?.N, 'Évalué (N)', margin, yPos, colWidth - 5, senicVert);
        
        // Signature N+1
        addSignatureBox(doc, evaluation.signatures?.N1, 'Évaluateur (N+1)', margin + colWidth, yPos, colWidth - 5, senicVert);
        
        // Signature N+2
        addSignatureBox(doc, evaluation.signatures?.N2, 'Validateur (N+2)', margin + (2 * colWidth), yPos, colWidth - 5, senicRouge);
        
        yPos += 50;
        
        // Note finale
        yPos = checkPageBreak(doc, yPos, 15);
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, yPos, contentWidth, 10, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text('N.B. Transmettre la fiche à la DRH pour suite utile', pageWidth / 2, yPos + 6, { align: 'center' });
        
        // Pied de page sur toutes les pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, 287, { align: 'center' });
            doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, 292, { align: 'center' });
        }
        
        // Télécharger le PDF
        const fileName = `Evaluation_${evaluation.evalueNom?.replace(/\s+/g, '_')}_${evaluation.annee || new Date().getFullYear()}.pdf`;
        doc.save(fileName);
        
        return { success: true, fileName };
        
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
    }
}

// Fonctions utilitaires pour le PDF
function addSectionTitle(doc, title, yPos, color = [44, 62, 80]) {
    doc.setFillColor(...color);
    doc.rect(15, yPos - 6, 180, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 17, yPos + 1);
    doc.setTextColor(0, 0, 0);
}

function addObservationList(doc, title, items, yPos, color = [100, 100, 100]) {
    yPos = checkPageBreak(doc, yPos, 20);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...color);
    doc.text(title + ' :', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    if (items && items.length > 0) {
        items.forEach((item, index) => {
            if (item && item.trim()) {
                yPos = checkPageBreak(doc, yPos, 10);
                const wrapped = doc.splitTextToSize(`${index + 1}. ${item}`, 160);
                doc.text(wrapped, 25, yPos);
                yPos += wrapped.length * 4 + 2;
            }
        });
    } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Aucune observation', 25, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 5;
    }
    
    return yPos;
}

function addSignatureBox(doc, signature, title, x, y, width, color = [74, 157, 95]) {
    // Cadre
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, 40);
    
    // Titre
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(title, x + width / 2, y + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Nom
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    if (signature?.nom) {
        const wrappedNom = doc.splitTextToSize(signature.nom, width - 4);
        doc.text(wrappedNom, x + 2, y + 10);
    }
    
    // Date
    if (signature?.date) {
        const dateStr = signature.date.includes('-') ? new Date(signature.date).toLocaleDateString('fr-FR') : signature.date;
        doc.text(`${dateStr}`, x + 2, y + 16);
    }
    
    // Signature (image)
    if (signature?.image && signature.image !== 'data:,' && signature.image.length > 50) {
        try {
            doc.addImage(signature.image, 'PNG', x + 3, y + 20, width - 6, 15);
        } catch (e) {
            doc.setFontSize(6);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('Signature électronique', x + width / 2, y + 28, { align: 'center' });
            doc.setTextColor(0, 0, 0);
        }
    }
}

function checkPageBreak(doc, yPos, requiredSpace = 25) {
    if (yPos > 270 - requiredSpace) {
        doc.addPage();
        return 20;
    }
    return yPos;
}
