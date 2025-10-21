const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const { gerarPDF } = require('../utils/pdfGenerator');
const db = require('../utils/db');
const path = require('path');

const router = express.Router();
const ai = new GoogleGenAI({}); 

router.post('/analisar-processo', async (req, res) => {
    try {
        const dados = req.body; 

        // CRUCIAL: O Prompt de Consultor Técnico
        const prompt = `Você é um Engenheiro Consultor Sênior especializado em Otimização de Processos Industriais e Automação. 
        Sua tarefa é analisar os dados de entrada fornecidos e gerar uma análise técnica detalhada.

        A saída deve ser OBRIGATORIAMENTE um objeto JSON estrito com as seguintes chaves:
        "diagnostico_geral" (Texto de análise sobre o estado e causa raiz), 
        "proposta_otimizacao" (Texto de sugestão de nova tecnologia ou melhoria),
        "plano_acao_detalhado" (array de 3 a 5 ações. Cada item no array deve ser um objeto com as chaves: "passo_titulo", "descricao_detalhada" e "estimativa_custo"),
        "metricas_esperadas" (UM TEXTO ÚNICO, FORMATADO EM PARÁGRAFO, descrevendo a projeção de melhoria em métricas como OEE, MTTR ou MTBF).

                        Dados do Processo:
                        - Setor/Processo: ${dados.setor}
                        - Tecnologia Atual: ${dados.tecnologia}
                        - Desafio Principal: ${dados.problema}
                        - Performance Atual (OEE, MTTR, etc.): ${dados.performance}
                        `;

        // Chamada ao Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Parse do JSON da resposta
        const jsonText = response.text.trim().match(/\{[\s\S]*\}/);
        if (!jsonText) throw new Error("A IA não retornou um JSON válido.");
        
        const analiseIA = JSON.parse(jsonText[0]); 
        
        // Geração do Relatório PDF
        const pdfPath = await gerarPDF(dados, analiseIA); 
        const nomeArquivo = path.basename(pdfPath); // Nome do arquivo para salvar no DB
        
        // ******* Salvar no Banco de Dados (PostgreSQL) *******
        try {
            await db('relatorios').insert({
                nome_arquivo: nomeArquivo,
                setor: dados.setor,
                tecnologia: dados.tecnologia,
                problema: dados.problema,
                performance: dados.performance,
                diagnostico_geral: analiseIA.diagnostico_geral,
                proposta_otimizacao: analiseIA.proposta_otimizacao,
                plano_acao: analiseIA.plano_acao_detalhado,
                metricas_esperadas: analiseIA.metricas_esperadas,
            });
            console.log(`Relatório '${nomeArquivo}' salvo no PostgreSQL.`);
        } catch (dbError) {
            console.error("Erro ao salvar o relatório no banco de dados:", dbError.message);
        }
        
        res.status(200).json({ 
            mensagem: "Relatório técnico gerado com sucesso! Histórico salvo (tentativa de salvar concluída).",
            nomeArquivoPDF: nomeArquivo
        });

    } catch (error) {
        console.error("Erro na Análise do Processo:", error.message);
        res.status(500).json({ erro: "Erro interno no servidor. Verifique o log." });
    }
});

module.exports = router;