// Charger les données depuis l'API DummyJSON
fetch('https://dummyjson.com/products')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const products = data.products; // Les produits sont dans la propriété "products"
        const container = document.getElementById('product-container');

        products.forEach(product => {
            // Créer une carte pour chaque produit
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
    <div class="card h-100">
        <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}">
        <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">${product.description}</p>
            <p class="card-text"><strong>Prix:</strong> $${product.price}</p>
            <a href="#" class="btn btn-primary acheter-button" data-product-id="${product.id}">Acheter</a>
        </div>
    </div>
`;

            container.appendChild(card);
        });
    })
    .catch(error => console.error('Erreur de chargement des produits:', error));


