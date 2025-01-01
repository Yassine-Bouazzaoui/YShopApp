const express = require('express');
const cors = require('cors'); // Importer CORS
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // Importer bcrypt pour le hachage du mot de passe
const app = express();
const prisma = new PrismaClient();
const port = 3000;

// Activer CORS pour une origine spécifique
app.use(cors({
    origin: '*', // Permettre uniquement les requêtes provenant de cette origine
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route d'enregistrement des utilisateurs
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword, // Utiliser le mot de passe haché
            },
        });

        const newCart = await prisma.cart.create({
            data: {
                userId: newUser.id,
            },
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser, cart: newCart });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'An error occurred while registering the user', details: error.message });
    }
});

// Route de connexion des utilisateurs
app.post('/Login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'An error occurred while logging in the user', details: error.message });
    }
});

// Route pour récupérer les informations du compte
app.get('/account', async (req, res) => {
    const userId = req.query.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching account information:', error);
        res.status(500).json({ error: 'An error occurred while fetching account information', details: error.message });
    }
});
app.put('/account', async (req, res) => {
    const { userId, name, email } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                name,
                email,
            },
        });

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error('Error updating account information:', error);
        res.status(500).json({ error: 'An error occurred while updating account information', details: error.message });
    }
});

// Route pour récupérer les articles du panier
app.get('/cart', async (req, res) => {
    const userId = parseInt(req.query.userId);

    try {
        // Récupérer le panier de l'utilisateur avec les produits associés
        const cart = await prisma.cart.findUnique({
            where: { userId: userId },
            include: {
                products: {
                    include: {
                        product: true, // Inclure les informations détaillées du produit
                    },
                },
            },
        });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Préparer les articles du panier avec toutes les informations nécessaires
        const cartItems = cart.products.map(cartProduct => ({
            id: cartProduct.product.id,
            title: cartProduct.product.title,  // Utiliser title au lieu de name
            quantity: cartProduct.quantity,
            price: cartProduct.product.price,
            thumbnail: cartProduct.product.thumbnail,
        }));

        res.json({ cartItems });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'An error occurred while fetching the cart' });
    }
});



app.post('/add-cart', async (req, res) => {
    const { userId, productId, quantity = 1 } = req.body; // Utiliser une valeur par défaut pour quantity

    try {
        console.log(`Adding product to cart for userId: ${userId}, productId: ${productId}, quantity: ${quantity}`);

        // Vérification des entrées
        if (!userId || !productId) {
            return res.status(400).json({ error: 'User ID and Product ID are required' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than zero' });
        }

        // Vérifier si le panier existe pour l'utilisateur
        const cart = await prisma.cart.findUnique({
            where: { userId: parseInt(userId) },
            include: { products: true }, // Inclure les produits existants dans le panier
        });

        if (!cart) {
            console.error(`Cart not found for user ID: ${userId}`);
            return res.status(404).json({ error: 'Cart not found for the user' });
        }

        // Vérifier si le produit est déjà dans le panier
        const productInCart = cart.products.some(product => product.id === parseInt(productId));
        if (productInCart) {
            return res.status(400).json({ error: 'Product already in the cart' });
        }

        // Vérifier si le produit existe dans la base de données
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) },
        });

        if (!product) {
            console.error(`Product with ID: ${productId} not found`);
            return res.status(404).json({ error: 'Product not found' });
        }

        // Ajouter le produit au panier via la table CartProduct
        await prisma.cartProduct.create({
            data: {
                cartId: cart.id,
                productId: parseInt(productId),
                quantity: parseInt(quantity),
            },
        });

        console.log(`Product ID: ${productId} added to cart ID: ${cart.id} successfully`);
        res.status(200).json({ message: 'Product added to cart successfully' });

    } catch (error) {
        console.error('Error while adding product to cart:', error.message);
        res.status(500).json({
            error: 'An error occurred while adding product to cart',
            details: error.message,
        });
    }
});
app.post('/order', async (req, res) => {
    const { userId, fullName, address, paymentMethod, items, total } = req.body;

    try {
        // Créer le shipper
        const shipper = await prisma.shipper.create({
            data: {
                name: "Default Shipper",
                contact: "123-456-7890"
            }
        });

        // Vérifier que chaque article a un nom valide
        const validItems = items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            title: item.title || "Unknown Product" // Utiliser un nom par défaut si le nom est undefined
        }));

        // Créer la commande avec l'ID du shipper
        const order = await prisma.order.create({
            data: {
                userId: parseInt(userId),
                items:validItems,
                total,
                shipperId: shipper.id,
                fullName,
                address,
                paymentMethod,
            }
        });
        await prisma.cartProduct.deleteMany({
            where: {
                cart: {
                    userId: parseInt(userId)
                }
            }
        });
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: "Failed to create order", details: error.message });
    }
});
app.get('/orders', async (req, res) => {
    const { userId } = req.query;

    try {
        const orders = await prisma.order.findMany({
            where: { userId: parseInt(userId) },
            include: {
                items: true,
                shipper: true,
            },
        });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: "Failed to fetch orders", details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});