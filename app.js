const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;
const dataFilePath = './data/fitplus.json';

app.use(cors({ origin: '*' }));
app.use(express.json());

// Leer datos del archivo JSON
function readData() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Guardar datos en el archivo JSON
function writeData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Obtener todos los datos
app.get('/fitplus', (req, res) => {
    res.json(readData());
});

// Agregar un nuevo dato
app.post('/fitplus', (req, res) => {
    const data = readData();  // Corregido: usar readData() en lugar de llegirDades()

    // Obtener los datos del cuerpo de la solicitud
    const { nom_opcio, tipus_opcio, contingut, descripcio_opcio } = req.body;

    if (!nom_opcio || !tipus_opcio || !contingut || !descripcio_opcio) {
        return res.status(400).send('Faltan datos necesarios');
    }

    const newItem = {
        id: data.length + 1,  // Generar un nuevo ID
        nom_opcio,
        tipus_opcio,
        contingut,  // Asegúrate de que 'contingut' es un array
        descripcio_opcio
    };

    data.push(newItem);  // Agregar el nuevo ítem
    writeData(data);  // Guardar los datos en el archivo JSON
    res.status(201).json(newItem);  // Devolver el nuevo objeto creado
});

// Actualizar un dato por ID
app.put('/fitplus/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nom_opcio, tipus_opcio, contingut, descripcio_opcio } = req.body;

    const data = readData();
    const item = data.find(d => d.id === id);

    if (!item) {
        return res.status(404).send('Elemento no encontrado');
    }

    if (nom_opcio) item.nom_opcio = nom_opcio;
    if (tipus_opcio) item.tipus_opcio = tipus_opcio;
    if (Array.isArray(contingut)) item.contingut = contingut;
    if (descripcio_opcio) item.descripcio_opcio = descripcio_opcio;

    writeData(data);
    res.json(item);
});

// Eliminar un dato por ID
app.delete('/fitplus/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const newData = data.filter(item => item.id !== id);

    newData.forEach((item, index) => item.id = index + 1);  // Reasignar IDs

    writeData(newData);
    res.send('Elemento eliminado con éxito.');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
