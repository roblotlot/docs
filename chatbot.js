const API_CONTEXTS_URL = 'http://localhost:3000/fitplus';
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDTON6xRg_grhL5QTihf8l93p9r8OLtWMg";

// Cargar contextos dinámicamente desde la API
async function cargarContextos() {
    try {
        const response = await fetch(API_CONTEXTS_URL);
        const contextos = await response.json();
        let html = '';

        for (let i = 0; i < contextos.length; i++) {
            const contexto = contextos[i];
            html += `<div class="contexto col-md-4 form-group">
                <label><strong>${contexto.nom_opcio}:</strong></label><br>`;
            if (contexto.tipus_opcio === 'select') {
                html += `<select id="${contexto.nom_opcio}" class="form-select">`;
                for (let j = 0; j < contexto.contingut.length; j++) {
                    const opcion = contexto.contingut[j];
                    html += `<option value="${opcion}">${opcion}</option>`;
                }
                html += `</select>`;
            } else if (contexto.tipus_opcio === 'radio') {
                html += `<ul class="list-group">`;
                for (let j = 0; j < contexto.contingut.length; j++) {
                    const opcion = contexto.contingut[j];
                    html += `
                        <li class="list-group-item">
                            <label>
                                <input type="radio" name="${contexto.nom_opcio}" value="${opcion}">
                                ${opcion}
                            </label>
                        </li>`;
                }
                html += `</ul>`;
            } else if (contexto.tipus_opcio === 'checkbox') {
                html += `<ul class="list-group">`;
                for (let j = 0; j < contexto.contingut.length; j++) {
                    const opcion = contexto.contingut[j];
                    html += `
                        <li class="list-group-item">
                            <label>
                                <input type="checkbox" name="${contexto.nom_opcio}" value="${opcion}">
                                ${opcion}
                            </label>
                        </li>`;
                }
                html += `</ul>`;
            }
            html += `</div>`;
        }
        document.getElementById('contenedor-contextos').innerHTML += html;
    } catch (error) {
        console.error("Error al cargar contextos:", error);
    }
}

document.addEventListener('DOMContentLoaded', cargarContextos);

// Generar un prompt elaborado a partir de los datos del usuario
function generarPromptElaborado(datos) {
    let prompt = "Quiero empezar ha hacer ejercicio. Para ello he pensado que me podrias hacer una rutina de ejercicios teniendo en cuentas las siguientes caracteristicas:\n\n";
    for (const clave in datos) {
        if (clave !== "texto_personalizado") {
            prompt += `- ${clave}: ${datos[clave]}\n`;
        }
    }
    if (datos.texto_personalizado) {
        prompt += `\nAdemás, me gustaría destacar lo siguiente: ${datos.texto_personalizado}\n`;
    }
    prompt += "\n¿Podrías sugerirme alguna rutina? Devuelveme la informacion en formato HTML dentro de un parrafo";
    return prompt;
}

document.getElementById('generarPeticion').addEventListener('click', function () {
    const contenedor = document.getElementById('contenedor-contextos');
    const inputs = contenedor.querySelectorAll('input, select');
    const resultado = {};
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (input.type === 'radio' && input.checked) {
            resultado[input.name] = input.value;
        } else if (input.type === 'checkbox' && input.checked) {
            if (!resultado[input.name]) {
                resultado[input.name] = [];
            }
            resultado[input.name].push(input.value);
        } else if (input.tagName === 'SELECT') {
            resultado[input.id] = input.value;
        }
    }
    const textoPersonalizado = document.getElementById('texto-peticion').value;
    resultado.texto_personalizado = textoPersonalizado;
    const promptElaborado = generarPromptElaborado(resultado);
    document.getElementById('peticion').textContent = promptElaborado;
});

// Llamar a la API con un spinner de carga
async function query(data) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error al llamar a la IA:", error);
        return null;
    }
}

document.getElementById('enviarPeticion').addEventListener('click', function () {
    const promptGenerado = document.getElementById('peticion').textContent;
    const promptPeticion = {
        "contents": [{
            "parts": [{ "text": promptGenerado }]
        }]
    };

    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';


    document.getElementById('respuesta').textContent = '';

    query(promptPeticion).then((response) => {
        loadingElement.style.display = 'none';
        if (response) {
            document.getElementById('respuesta').innerHTML = response.candidates[0].content.parts[0].text;
        } else {
            document.getElementById('respuesta').textContent = "Hubo un error al obtener la respuesta.";
        }
    }).catch(() => {
        loadingElement.style.display = 'none';
        document.getElementById('respuesta').textContent = "Hubo un error al obtener la respuesta.";
    });
});
