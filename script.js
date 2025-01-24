const apiUrl = 'http://localhost:3000/fitplus';

// Función para obtener y mostra  r los datos en la tabla
async function fetchItems() {
    try {
        const response = await fetch(apiUrl);
        const items = await response.json();
        populateTable(items);
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

// Función para poblar la tabla con los datos obtenidos
function populateTable(items) {
    const tableBody = document.getElementById('items-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.nom_opcio}</td>
                <td>${item.tipus_opcio}</td>
                <td>${item.contingut.join(', ')}</td>
                <td>${item.descripcio_opcio}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Función para crear o actualizar un elemento
async function createOrUpdateItem(event) {
    event.preventDefault();

    // Capturar valores del formulario
    const nom_opcio = document.getElementById('item-nom-opcio').value;
    const tipus_opcio = document.getElementById('item-tipus-opcio').value;
    const contingut = document.getElementById('item-contingut').value.split(',').map(option => option.trim());
    const descripcio_opcio = document.getElementById('item-descripcio-opcio').value;

    const method = 'POST'; // Método de solicitud
    const url = apiUrl;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom_opcio, tipus_opcio, contingut, descripcio_opcio })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Elemento añadido con éxito:', result);

        // Limpiar el formulario tras el envío
        document.getElementById('add-item-form').reset();

        // Refrescar la tabla con los nuevos datos
        fetchItems();
    } catch (error) {
        console.error('Error al guardar el elemento:', error);
    }
}

// Función para modificar un elemento existente
async function modifyItem(event) {
    event.preventDefault();

    const id = document.getElementById('modify-item-id').value;
    const nom_opcio = document.getElementById('modify-item-nom-opcio').value;
    const tipus_opcio = document.getElementById('modify-item-tipus-opcio').value;
    const contingut = document.getElementById('modify-item-contingut').value.split(',').map(item => item.trim());
    const descripcio_opcio = document.getElementById('modify-item-descripcio-opcio').value;

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom_opcio, tipus_opcio, contingut, descripcio_opcio })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Elemento modificado con éxito:', result);

        // Limpiar el formulario tras la modificación
        document.getElementById('modify-item-form').reset();

        // Refrescar la tabla con los nuevos datos
        fetchItems();
    } catch (error) {
        console.error('Error al modificar el elemento:', error);
    }
}

// Función para eliminar un elemento existente
async function deleteItem(event) {
    event.preventDefault();

    const id = document.getElementById('delete-item-id').value;

    try {
        const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        console.log('Elemento eliminado con éxito');

        // Limpiar el formulario tras la eliminación
        document.getElementById('delete-item-form').reset();

        // Refrescar la tabla con los nuevos datos
        fetchItems();
    } catch (error) {
        console.error('Error al eliminar el elemento:', error);
    }
}

// Añadir eventos a los elementos HTML
document.addEventListener('DOMContentLoaded', () => {
    const getDadesButton = document.getElementById('get-dades');
    const addItemForm = document.getElementById('add-item-form');
    const modifyItemForm = document.getElementById('modify-item-form');
    const deleteItemForm = document.getElementById('delete-item-form');

    if (getDadesButton) {
        getDadesButton.addEventListener('click', fetchItems);
    }

    if (addItemForm) {
        addItemForm.addEventListener('submit', createOrUpdateItem);
    }

    if (modifyItemForm) {
        modifyItemForm.addEventListener('submit', modifyItem);
    }

    if (deleteItemForm) {
        deleteItemForm.addEventListener('submit', deleteItem);
    }
});
