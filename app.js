// ========================================
// LOGIQUE PRINCIPALE DE L'APPLICATION
// ========================================

// Initialisation Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.MainButton.hide();

// Variable pour stocker le produit sélectionné
let selectedProduct = null;

// ========================================
// CHARGEMENT DES PRODUITS
// ========================================

function loadProducts(filteredProducts = null) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    // Utiliser filteredProducts ou window.products (qui peut venir de localStorage) ou products par défaut
    const productsToShow = filteredProducts || window.products || products;

    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => showProduct(product.id);

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-card-info">
                <div class="product-card-name">${product.name}</div>
                <div class="product-card-varieties">Plusieurs variétés</div>
            </div>
        `;

        grid.appendChild(card);
    });
}

// ========================================
// FILTRAGE DES PRODUITS
// ========================================

function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;

    let filtered = window.products || products;

    if (categoryFilter !== 'all') {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }

    loadProducts(filtered);
}

// ========================================
// AFFICHAGE D'UN PRODUIT
// ========================================

function showProduct(productId) {
    const productsData = window.products || products;
    selectedProduct = productsData.find(p => p.id === productId);
    
    if (!selectedProduct) return;

    // Mise à jour du titre
    document.getElementById('productTitle').textContent = selectedProduct.name;
    document.getElementById('productName').textContent = selectedProduct.name;
    document.getElementById('productDescription').textContent = selectedProduct.description;

    // Affichage media (image ou vidéo)
    const productMedia = document.getElementById('productMedia');
    
    if (selectedProduct.video && selectedProduct.video !== '') {
        // Détecter le type de vidéo et créer l'élément approprié
        const videoUrl = selectedProduct.video;
        let mediaHTML = '';
        
        // Détection YouTube
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            let videoId = '';
            if (videoUrl.includes('youtu.be/')) {
                videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            } else if (videoUrl.includes('watch?v=')) {
                videoId = videoUrl.split('watch?v=')[1].split('&')[0];
            } else if (videoUrl.includes('embed/')) {
                videoId = videoUrl.split('embed/')[1].split('?')[0];
            }
            mediaHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        }
        // Détection Vimeo
        else if (videoUrl.includes('vimeo.com')) {
            let videoId = videoUrl.split('vimeo.com/')[1].split('?')[0].split('/').pop();
            mediaHTML = `<iframe src="https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&muted=1" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
        }
        // Détection Dailymotion
        else if (videoUrl.includes('dailymotion.com') || videoUrl.includes('dai.ly')) {
            let videoId = '';
            if (videoUrl.includes('dai.ly/')) {
                videoId = videoUrl.split('dai.ly/')[1].split('?')[0];
            } else {
                videoId = videoUrl.split('/video/')[1].split('?')[0];
            }
            mediaHTML = `<iframe src="https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=1" frameborder="0" allow="autoplay" allowfullscreen></iframe>`;
        }
        // Vidéo directe (mp4, webm, etc.)
        else {
            mediaHTML = `<video autoplay loop muted playsinline><source src="${videoUrl}" type="video/mp4"></video>`;
        }
        
        productMedia.innerHTML = mediaHTML;
    } else {
        // Afficher l'image
        productMedia.innerHTML = `<img src="${selectedProduct.image}" alt="${selectedProduct.name}">`;
    }

    // Affichage des variétés en LISTE SIMPLE
    const varietiesList = document.getElementById('varietiesList');
    console.log('🔍 varietiesList:', varietiesList);
    console.log('🔍 varieties:', selectedProduct.varieties);
    
    if (varietiesList) {
        varietiesList.innerHTML = '';
        
        selectedProduct.varieties.forEach(variety => {
            const varietyItem = document.createElement('div');
            varietyItem.className = 'variety-item';
            varietyItem.textContent = variety;
            varietiesList.appendChild(varietyItem);
            console.log('✅ Added variety:', variety);
        });
    } else {
        console.log('❌ varietiesList NOT FOUND!');
    }

    // Affichage des prix en BADGES
    const pricesList = document.getElementById('pricesList');
    console.log('🔍 pricesList:', pricesList);
    console.log('🔍 prices:', selectedProduct.prices);
    
    if (pricesList) {
        pricesList.innerHTML = '';
        
        selectedProduct.prices.forEach(price => {
            const priceTag = document.createElement('div');
            priceTag.className = 'price-tag';
            priceTag.textContent = `${price.quantity} - ${price.amount}`;
            pricesList.appendChild(priceTag);
            console.log('✅ Added price:', price.quantity, price.amount);
        });
    } else {
        console.log('❌ pricesList NOT FOUND!');
    }

    // Configuration du bouton commander
    setupOrderButton();

    // Afficher la page produit
    document.getElementById('homePage').classList.remove('active');
    document.getElementById('productPage').classList.add('active');
}

// ========================================
// BOUTON COMMANDER
// ========================================

function setupOrderButton() {
    const orderBtn = document.getElementById('orderBtn');
    
    orderBtn.onclick = () => {
        if (!selectedProduct) return;

        // Récupérer toutes les variétés et tous les prix pour le message
        const varietiesText = selectedProduct.varieties.join(', ');
        const pricesText = selectedProduct.prices.map(p => `${p.quantity} - ${p.amount}`).join(' | ');

        // Construction du message pré-rempli
        const message = `🛒 NOUVELLE COMMANDE

📦 Produit : ${selectedProduct.name}
🌿 Variétés disponibles : ${varietiesText}
💰 Prix : ${pricesText}

---
Merci de préciser votre choix !`;

        // Encodage du message pour l'URL
        const encodedMessage = encodeURIComponent(message);
        
        // Ouverture du DM Telegram
        const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodedMessage}`;
        
        // Ouvrir le lien
        if (tg.openTelegramLink) {
            tg.openTelegramLink(telegramUrl);
        } else {
            window.open(telegramUrl, '_blank');
        }
    };
}

// ========================================
// NAVIGATION
// ========================================

function showHome() {
    document.getElementById('productPage').classList.remove('active');
    document.getElementById('infoPage').classList.remove('active');
    document.getElementById('homePage').classList.add('active');
    
    // Mise à jour des boutons de navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.nav-btn')[0].classList.add('active');
}

function showInfo() {
    document.getElementById('homePage').classList.remove('active');
    document.getElementById('productPage').classList.remove('active');
    document.getElementById('infoPage').classList.add('active');
    
    // Mise à jour des boutons de navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.nav-btn')[1].classList.add('active');
}

function openChannel() {
    // Remplace par l'URL de ton canal si tu en as un
    const channelUrl = 'https://t.me/ton_canal'; // À MODIFIER
    
    if (tg.openTelegramLink) {
        tg.openTelegramLink(channelUrl);
    } else {
        window.open(channelUrl, '_blank');
    }
}

function openContact() {
    // Ouverture du DM avec toi
    const contactUrl = `https://t.me/${TELEGRAM_USERNAME}`;
    
    if (tg.openTelegramLink) {
        tg.openTelegramLink(contactUrl);
    } else {
        window.open(contactUrl, '_blank');
    }
}

// ========================================
// INITIALISATION AU CHARGEMENT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Charger depuis localStorage si disponible (pour prévisualisation admin)
    const savedProducts = localStorage.getItem('coffeeEgan_products');
    const savedConfig = localStorage.getItem('coffeeEgan_config');
    const savedCategories = localStorage.getItem('coffeeEgan_categories');
    
    if (savedProducts) {
        window.products = JSON.parse(savedProducts);
    }
    if (savedConfig) {
        window.siteConfig = JSON.parse(savedConfig);
    }
    if (savedCategories) {
        window.categories = JSON.parse(savedCategories);
    }
    
    // Appliquer la configuration du site si elle existe
    if (typeof siteConfig !== 'undefined') {
        applySiteConfig();
    }
    
    // Charger les catégories dans le filtre
    loadCategoryFilter();
    
    // Charger les produits
    loadProducts();
});

// Configuration des couleurs Telegram
tg.setHeaderColor('#0a1628');
tg.setBackgroundColor('#0a1628');

// ========================================
// APPLIQUER LA CONFIGURATION DU SITE
// ========================================

function applySiteConfig() {
    // Changer le titre du site
    if (siteConfig.siteName) {
        document.title = siteConfig.siteName;
        document.querySelectorAll('h1').forEach(h1 => {
            h1.textContent = siteConfig.siteName;
        });
    }
    
    // Changer le logo
    if (siteConfig.logoUrl) {
        const logoImg = document.querySelector('.logo');
        if (logoImg) {
            logoImg.src = siteConfig.logoUrl;
            logoImg.alt = siteConfig.siteName + ' Logo';
        }
    }
    
    // Mettre à jour la page Info
    if (siteConfig.infoTitle) {
        const infoTitle = document.querySelector('#infoPage h2');
        if (infoTitle) infoTitle.textContent = siteConfig.infoTitle;
    }
    
    if (siteConfig.infoMainText) {
        const infoContent = document.querySelector('.info-content p');
        if (infoContent) infoContent.textContent = siteConfig.infoMainText;
    }
    
    // Mettre à jour les sections Livraison et Paiement
    const infoHeaders = document.querySelectorAll('.info-content h3');
    const infoParagraphs = document.querySelectorAll('.info-content p');
    
    if (infoHeaders[0] && siteConfig.infoDeliveryTitle) {
        infoHeaders[0].textContent = siteConfig.infoDeliveryTitle;
    }
    if (infoParagraphs[1] && siteConfig.infoDeliveryText) {
        infoParagraphs[1].textContent = siteConfig.infoDeliveryText;
    }
    if (infoHeaders[1] && siteConfig.infoPaymentTitle) {
        infoHeaders[1].textContent = siteConfig.infoPaymentTitle;
    }
    if (infoParagraphs[2] && siteConfig.infoPaymentText) {
        infoParagraphs[2].textContent = siteConfig.infoPaymentText;
    }
}

// Mettre à jour openChannel et openContact pour utiliser la config
function openChannelUpdated() {
    const channelUrl = (typeof siteConfig !== 'undefined' && siteConfig.canalUrl) 
        ? siteConfig.canalUrl 
        : 'https://t.me/ton_canal';
    
    if (tg.openTelegramLink) {
        tg.openTelegramLink(channelUrl);
    } else {
        window.open(channelUrl, '_blank');
    }
}

function openContactUpdated() {
    const username = (typeof siteConfig !== 'undefined' && siteConfig.contactUsername) 
        ? siteConfig.contactUsername 
        : TELEGRAM_USERNAME;
    const contactUrl = `https://t.me/${username}`;
    
    if (tg.openTelegramLink) {
        tg.openTelegramLink(contactUrl);
    } else {
        window.open(contactUrl, '_blank');
    }
}

// Remplacer les anciennes fonctions
window.openChannel = openChannelUpdated;
window.openContact = openContactUpdated;

// ========================================
// CHARGEMENT DYNAMIQUE DES CATÉGORIES
// ========================================

function loadCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Récupérer les catégories (depuis config ou localStorage)
    let categoriesToUse = [];
    
    if (window.categories && window.categories.length > 0) {
        categoriesToUse = window.categories;
    } else if (typeof siteConfig !== 'undefined' && siteConfig.categories) {
        categoriesToUse = siteConfig.categories;
    } else {
        categoriesToUse = ['fleurs', 'concentres', 'edibles']; // Valeurs par défaut
    }
    
    // Construire les options
    let optionsHTML = '<option value="all">Toutes les catégories</option>';
    categoriesToUse.forEach(cat => {
        const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ');
        optionsHTML += `<option value="${cat}">${catLabel}</option>`;
    });
    
    categoryFilter.innerHTML = optionsHTML;
}


