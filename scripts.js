document.getElementById('imageInput').addEventListener('change', handleImageUpload);
document.getElementById('uploadButton').addEventListener('click', analyzeImage);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const imagePreview = document.getElementById('imagePreview');
        const imagePreviewWrapper = document.getElementById('imagePreviewWrapper');
        imagePreview.src = URL.createObjectURL(file);
        imagePreviewWrapper.style.display = 'block';
    }
}

async function analyzeImage() {
    const file = document.getElementById('imageInput').files[0];
    if (!file) {
        alert('Por favor, carga una imagen.');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const progressWrapper = document.getElementById('progressWrapper');
    const progressBar = document.getElementById('progressBar');
    const uploadMessage = document.getElementById('uploadMessage');

    // Mostrar la barra de carga
    progressWrapper.style.display = 'block';
    progressBar.style.width = '0%';
    document.getElementById('progressMessage').textContent = 'Procesando...';

    try {
        const apiKey = 'acc_6dc9c91fb31f6ba';
        const apiSecret = '38d103d728f3a71ff64af1ccc3152890';
        const auth = btoa(`${apiKey}:${apiSecret}`);

        const tagResponse = await fetch('https://api.imagga.com/v2/tags', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth
            },
            body: formData
        });

        if (!tagResponse.ok) {
            throw new Error('Error al enviar la imagen');
        }

        const colorResponse = await fetch('https://api.imagga.com/v2/colors', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth
            },
            body: formData
        });

        if (!colorResponse.ok) {
            throw new Error('Error al enviar la imagen');
        }

        progressBar.style.width = '50%';

        const tagData = await tagResponse.json();
        const colorData = await colorResponse.json();

        console.log('Respuesta de la API de Etiquetas:', tagData);
        console.log('Respuesta de la API de Colores:', colorData);

        displayResults(tagData, colorData);

        progressBar.style.width = '100%';
        document.getElementById('progressMessage').textContent = 'Listo!';
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al procesar la imagen.');
    } finally {
        setTimeout(() => {
            progressWrapper.style.display = 'none';
        }, 1000);
    }
}

function displayResults(tagData, colorData) {
    const objectList = document.getElementById('objectList');
    const colorsList = document.getElementById('colorsList');

    objectList.innerHTML = '';
    colorsList.innerHTML = '';

    tagData.result.tags.slice(0, 3).forEach(tag => {
        const listItem = document.createElement('li');
        listItem.textContent = tag.tag.en;
        objectList.appendChild(listItem);
    });

    const colors = colorData.result.colors.image_colors.slice(0, 3);
    colors.forEach(color => {
        const colorBlock = document.createElement('div');
        colorBlock.style.backgroundColor = color.html_code;
        colorsList.appendChild(colorBlock);
    });

    document.getElementById('results').style.display = 'block';

    setTimeout(() => {
        applyColorsAndReload(colors, tagData.result.tags.slice(0, 3).map(tag => tag.tag.en));
    }, 2000);
}

function applyColorsAndReload(colors, tags) {
    const backgroundColor = colors[0].html_code;
    const textColor = colors[1].html_code;
    const progressBarColor = colors[2].html_code;

    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = textColor;
    document.getElementById('progressBar').style.backgroundColor = progressBarColor;

    const backgroundWordsContainer = document.createElement('div');
    backgroundWordsContainer.className = 'background-words';
    tags.forEach(tag => {
        const wordElement = document.createElement('div');
        wordElement.textContent = tag;
        backgroundWordsContainer.appendChild(wordElement);
    });

    document.body.appendChild(backgroundWordsContainer);
}
