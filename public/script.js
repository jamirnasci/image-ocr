document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('imageUpload');
    const previewSection = document.getElementById('previewSection');
    const imagePreview = document.getElementById('imagePreview');
    const extractButton = document.getElementById('extractButton');
    const progressBar = document.getElementById('progressBar');
    const progressBarInner = document.getElementById('progressBarInner');
    const statusText = document.getElementById('statusText');
    const extractedText = document.getElementById('extractedText');
    const copyButton = document.getElementById('copyButton');
    const notification = document.getElementById('notification');
    const resultModal = document.getElementById('resultModal');
    const closeModal = document.querySelector('.close-modal');
    
    let imageFile = null;
    
    // Quando o usuário seleciona uma imagem
    imageUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            imageFile = e.target.files[0];
            
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewSection.classList.remove('hidden');
                
                // Resetar a interface
                progressBar.classList.add('hidden');
                statusText.textContent = '';
            };
            reader.readAsDataURL(imageFile);
        }
    });
    
    // Quando o usuário clica para extrair o texto
    extractButton.addEventListener('click', function() {
        if (!imageFile) return;
        
        // Ativar indicador de progresso
        progressBar.classList.remove('hidden');
        progressBarInner.style.width = '0%';
        statusText.textContent = 'Iniciando extração...';
        extractButton.disabled = true;
        
        // Usar Tesseract.js para extrair o texto
        Tesseract.recognize(
            imageFile,
            'por+eng', // Idiomas português e inglês
            {
                logger: progress => {
                    if (progress.status === 'recognizing text') {
                        const progressPct = Math.floor(progress.progress * 100);
                        progressBarInner.style.width = `${progressPct}%`;
                        statusText.textContent = `Processando: ${progressPct}%`;
                    } else {
                        statusText.textContent = `Status: ${progress.status}`;
                    }
                }
            }
        ).then(result => {
            // Exibir o texto extraído no modal
            extractedText.textContent = result.data.text;
            statusText.textContent = 'Extração concluída!';
            
            // Mostrar o modal
            resultModal.classList.add('show');
            
            // Reativar o botão
            extractButton.disabled = false;
        }).catch(err => {
            statusText.textContent = `Erro: ${err.message}`;
            console.error(err);
            extractButton.disabled = false;
        });
    });
    
    // Fechar o modal
    closeModal.addEventListener('click', function() {
        resultModal.classList.remove('show');
    });
    
    // Fechar o modal clicando fora dele
    window.addEventListener('click', function(e) {
        if (e.target === resultModal) {
            resultModal.classList.remove('show');
        }
    });
    
    // Copiar texto para a área de transferência
    copyButton.addEventListener('click', function() {
        const textToCopy = extractedText.textContent;
        
        if (!textToCopy.trim()) {
            alert('Nenhum texto para copiar!');
            return;
        }
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Mostrar notificação
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }).catch(err => {
            console.error('Falha ao copiar texto: ', err);
            alert('Falha ao copiar texto. Você pode selecionar e copiar manualmente.');
        });
    });
});