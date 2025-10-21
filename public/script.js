// public/script.js
document.getElementById('consultorForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const statusDiv = document.getElementById('status');
    const resultadoDiv = document.getElementById('resultado');
    const form = event.target;
    
    // Coleta dos dados do formulário
    const dados = {
        setor: form.setor.value,
        tecnologia: form.tecnologia.value,
        problema: form.problema.value,
        performance: form.performance.value,
    };

    statusDiv.innerHTML = '<p style="color: blue;">Processando... A IA (Gemini) está gerando o diagnóstico técnico e o PDF. Aguarde...</p>';
    resultadoDiv.innerHTML = '';

    try {
        const response = await fetch('http://localhost:3000/api/analisar-processo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        });

        const data = await response.json();

        if (response.ok) {
            // O nomeArquivoPDF é usado para buscar o arquivo que está na pasta 'relatorios'
            const pdfUrl = `http://localhost:3000/${data.nomeArquivoPDF}`;
            
            statusDiv.innerHTML = `<p style="color: green;">${data.mensagem}</p>`;
            resultadoDiv.innerHTML = `
                <p>O seu **Relatório Técnico** está pronto. Clique abaixo para visualizar:</p>
                <a href="${pdfUrl}" target="_blank" style="color: #004d40; font-weight: bold;">[BAIXAR RELATÓRIO PDF]</a>
            `;
        } else {
            statusDiv.innerHTML = `<p style="color: red;">ERRO: ${data.erro || data.mensagem}</p>`;
        }
    } catch (error) {
        statusDiv.innerHTML = '<p style="color: red;">Erro de Conexão. Verifique se o servidor Node.js está em execução.</p>';
        console.error('Erro ao enviar dados:', error);
    }
});