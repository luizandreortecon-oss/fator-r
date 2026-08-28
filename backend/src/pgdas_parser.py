async function fazerUploadDocumento(inputElement, tipoDocumento) {
    const arquivo = inputElement.files[0];
    if (!arquivo) return;

    const formData = new FormData();
    formData.append('file', arquivo);
    formData.append('tipo_esperado', tipoDocumento); // 'das', 'folha', ou 'nfe'

    try {
        const resposta = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const dados = await resposta.json();

        if (!resposta.ok) throw new Error(dados.error || 'Erro no upload');

        // Atualiza a tela ou recarrega os dados do gráfico
        atualizarGraficoDashboard();
        alert('Documento processado e mês atualizado com sucesso!');
    } catch (erro) {
        alert(`Erro: ${erro.message}`);
    }
}
