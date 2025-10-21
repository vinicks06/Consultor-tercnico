// src/utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const relatoriosDir = path.join(__dirname, '..', '..', 'relatorios');

/**
 * Gera um Relatório Técnico em PDF.
 * @param {object} dadosUsuario - Dados brutos do formulário.
 * @param {object} analiseIA - Objeto JSON estruturado retornado pelo Gemini.
 * @returns {string} O caminho completo do PDF gerado.
 */
async function gerarPDF(dadosUsuario, analiseIA) {
    const filename = `relatorio_tecnico_${Date.now()}.pdf`;
    const pdfPath = path.join(relatoriosDir, filename);
    const doc = new PDFDocument({ margin: 50 });
    // Ajuste o tamanho da área de margem para checagem
    const MARGEM_RODAPE = 100; // Espaço reservado para a seção (título + texto)
    
    // Função auxiliar para verificar quebra de página
    const checkPageBreak = (minSpaceRequired) => {
        if (doc.y + minSpaceRequired > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            return true;
        }
        return false;
    };
    
    doc.pipe(fs.createWriteStream(pdfPath));

    // --- Layout: Título ---
    doc.fontSize(24).fillColor('#004d40').text('Relatório Técnico de Otimização', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333').text(`Data: ${new Date().toLocaleDateString()} | Processo: ${dadosUsuario.setor}`, { align: 'center' });
    doc.moveDown(2);

    // --- Seção 1: Diagnóstico Geral ---
    // Check se há espaço para o título (aprox. 3 linhas de texto)
    checkPageBreak(50); 
    doc.fontSize(18).fillColor('#004d40').text('1. Diagnóstico Geral do Processo', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#000').text(analiseIA.diagnostico_geral);
    doc.moveDown(2);

    // --- Seção 2: Proposta de Otimização ---
    // Check se há espaço para o título (aprox. 3 linhas de texto)
    checkPageBreak(50); 
    doc.fontSize(18).fillColor('#004d40').text('2. Proposta de Otimização', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(analiseIA.proposta_otimizacao);
    doc.moveDown(2);
    
    // --- Seção 3: Plano de Ação Detalhado ---
    // Check se há espaço para o título (aprox. 3 linhas de texto)
    checkPageBreak(50); 
    doc.fontSize(18).fillColor('#004d40').text('3. Plano de Ação (Passos Sugeridos)', { underline: true });
    doc.moveDown();
    
    // Altera a lógica para checar o espaço antes de cada item do loop
    analiseIA.plano_acao_detalhado.forEach((acao, index) => {
        // Estima o espaço necessário para 3 linhas de texto por passo
        checkPageBreak(50); 
        
        const titulo = acao.passo_titulo || 'Ação Sugerida';
        const descricao = acao.descricao_detalhada || 'Detalhe não fornecido.';
        const custo = acao.estimativa_custo || 'N/A';
        
        doc.fontSize(12).text(`• Passo ${index + 1}: ${titulo} (Custo: ${custo})`, { indent: 20 });
        doc.fontSize(10).text(`     ${descricao}`, { indent: 20 });
        doc.moveDown(0.5);
    });
    doc.moveDown(2);

    // --- Seção 4: Projeção de Métricas ---
    // Check se há espaço para o título (aprox. 3 linhas de texto)
    checkPageBreak(50); 
    doc.fontSize(18).fillColor('#004d40').text('4. Projeção de Melhora nas Métricas', { underline: true });
    doc.moveDown();
    
    // Verifica se é objeto ou string e formata conforme a Solução 2 (para garantir)
    let metricasTexto = analiseIA.metricas_esperadas;
    if (typeof metricasTexto === 'object' && metricasTexto !== null) {
        metricasTexto = Object.keys(metricasTexto).map(key => {
            const titulo = key.toUpperCase(); 
            return `${titulo}: ${metricasTexto[key]}`;
        }).join('\n\n'); 
    }
    
    doc.fontSize(12).text(metricasTexto);

    // Finaliza o documento
    doc.end();
    return pdfPath;
}

module.exports = { gerarPDF };