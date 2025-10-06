document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM ---
    const productGrid = document.getElementById('product-grid');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const cartCount = document.getElementById('cart-count');
    const cartIcon = document.getElementById('cart-icon');

    // Elemen Modal
    const modal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalImage = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalProductName = document.getElementById('modal-product-name');
    const modalPrice = document.getElementById('modal-price');
    const modalDescription = document.getElementById('modal-description');
    const modalAddToCartBtn = document.getElementById('modal-add-to-cart');
    const toastContainer = document.getElementById('toast-container');

    // Cart Modal Elements
    const cartModal = document.getElementById('cartModal');
    const closeCartModalBtn = document.getElementById('closeCartModalBtn');
    const cartItems = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutModalBtn = document.getElementById('closeCheckoutModalBtn');
    const checkoutForm = document.getElementById('checkoutForm');


    // --- State ---
    let products = [];
    let cart = [];
    const API_URL = 'https://fakestoreapi.com/products';
    const SELLER_WHATSAPP_NUMBER = '6288991162533'; // Ganti dengan nomor WhatsApp penjual


    // --- Functions ---


    /**
     * Mengambil produk dari Fake Store API
     */
    async function fetchProducts() {
        loader.style.display = 'block';
        productGrid.innerHTML = '';
        errorMessage.classList.add('hidden');
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Gagal mengambil produk:", error);
            errorMessage.classList.remove('hidden');
        } finally {
            loader.style.display = 'none';
        }
    }


    /**
     * Menampilkan produk di dalam grid
     * @param {Array} productsToDisplay - Array objek produk
     */
    function displayProducts(productsToDisplay) {
        productGrid.innerHTML = ''; // Bersihkan produk sebelumnya
        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card bg-white rounded-lg shadow-sm overflow-hidden flex flex-col cursor-pointer';
            productCard.dataset.productId = product.id;


            productCard.innerHTML = `
                <div class="p-4 bg-white h-48 flex items-center justify-center">
                    <img src="${product.image}" alt="${product.title}" class="max-h-full max-w-full object-contain">
                </div>
                <div class="p-4 border-t border-gray-200 flex flex-col flex-grow">
                    <span class="text-xs text-gray-500 capitalize">${product.category}</span>
                    <h3 class="text-md font-semibold text-gray-800 mt-1 flex-grow">${product.title.substring(0, 40)}...</h3>
                    <div class="mt-4 flex justify-between items-center">
                        <p class="text-lg font-bold text-blue-600">Rp ${Math.round(product.price * 15000).toLocaleString('id-ID')}</p>
                        <button class="add-to-cart-btn bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full w-9 h-9 flex items-center justify-center transition-colors" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }
   
    /**
     * Menampilkan modal detail produk
     * @param {number} productId - ID produk yang akan ditampilkan
     */
    function showProductDetail(productId) {
        const product = products.find(p => p.id == productId);
        if (!product) return;


        modalImage.src = product.image;
        modalCategory.textContent = product.category;
        modalProductName.textContent = product.title;
        modalPrice.textContent = `Rp ${Math.round(product.price * 15000).toLocaleString('id-ID')}`;
        modalDescription.textContent = product.description;
        modalAddToCartBtn.dataset.productId = product.id; // Atur ID produk pada tombol
       
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Mencegah scroll di latar belakang
    }


    /**
     * Menyembunyikan modal detail produk
     */
    function hideModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }


    /**
     * Menambahkan produk ke keranjang dan memperbarui UI
     * @param {number} productId - ID produk yang akan ditambahkan
     */
    function addToCart(productId) {
        const product = products.find(p => p.id == productId);
        if (product) {
            const existing = cart.find(item => item.product.id == productId);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({product, qty: 1});
            }
            updateCartCounter();
            showToast(`${product.title.substring(0, 20)}... ditambahkan ke keranjang!`);
        }
    }


    /**
     * Memperbarui tampilan counter keranjang
     */
    function updateCartCounter() {
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalQty;
    }
   
    /**
     * Menampilkan notifikasi toast
     * @param {string} message - Pesan yang akan ditampilkan
     */
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg';
        toast.textContent = message;
        toastContainer.appendChild(toast);


        setTimeout(() => {
            toast.remove();
        }, 3000); // Hapus toast setelah 3 detik
    }

    /**
     * Render item keranjang di modal keranjang
     */
    function renderCartItems() {
        cartItems.innerHTML = '';
        if (cart.length === 0) {
            cartEmpty.classList.remove('hidden');
            cartTotal.textContent = 'Rp 0';
            checkoutBtn.disabled = true;
            return;
        }
        cartEmpty.classList.add('hidden');
        checkoutBtn.disabled = false;

        let total = 0;
        cart.forEach(({product, qty}, index) => {
            const itemTotal = Math.round(product.price * 15000) * qty;
            total += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center space-x-4 bg-gray-50 p-4 rounded-lg';

            itemDiv.innerHTML = `
                <img src="${product.image}" alt="${product.title}" class="w-16 h-16 object-contain rounded-lg">
                <div class="flex-grow">
                    <h4 class="font-semibold text-gray-800">${product.title.substring(0, 30)}...</h4>
                    <p class="text-sm text-gray-600">Rp ${Math.round(product.price * 15000).toLocaleString('id-ID')} x ${qty}</p>
                </div>
                <div class="text-right font-semibold text-blue-600">Rp ${itemTotal.toLocaleString('id-ID')}</div>
                <button class="remove-item-btn text-red-600 hover:text-red-800" data-index="${index}" title="Hapus item">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            cartItems.appendChild(itemDiv);
        });

        cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;

        // Add event listeners for remove buttons
        const removeButtons = cartItems.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                removeCartItem(index);
            });
        });
    }

    /**
     * Menghapus item dari keranjang berdasarkan index
     * @param {number} index - Index item dalam array cart
     */
    function removeCartItem(index) {
        if (index >= 0 && index < cart.length) {
            cart.splice(index, 1);
            updateCartCounter();
            renderCartItems();
            showToast('Item dihapus dari keranjang');
        }
    }

    /**
     * Mengirim data order ke WhatsApp dengan format teks
     */
    function sendOrderToWhatsApp() {
        if (cart.length === 0) {
            alert('Keranjang kosong. Tambahkan produk terlebih dahulu.');
            return;
        }

        const name = checkoutForm.name.value.trim();
        const address = checkoutForm.address.value.trim();

        if (!name || !address) {
            alert('Mohon lengkapi semua data pada form checkout.');
            return;
        }
    let message = `*Pesanan dari ${name}*\n`;
        message += `Alamat: ${address}\n\n`;
        message += `*Detail Pesanan:*\n`;

        let total = 0;
        cart.forEach(({product, qty}, idx) => {
            const price = Math.round(product.price * 15000);
            const itemTotal = price * qty;
            total += itemTotal;
            message += `${idx + 1}. ${product.title.substring(0, 30)}... - ${qty} x Rp ${price.toLocaleString('id-ID')} = Rp ${itemTotal.toLocaleString('id-ID')}\n`;
        });

        message += `\n*Total: Rp ${total.toLocaleString('id-ID')}*`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${SELLER_WHATSAPP_NUMBER}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        // Reset form and cart
        checkoutForm.reset();
        cart = [];
        updateCartCounter();
        checkoutModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        showToast('Pesanan berhasil dikirim ke WhatsApp');
    }


    // --- Event Listeners ---
    
    // Menangani klik pada grid produk (untuk melihat detail atau menambah ke keranjang)
    productGrid.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn) {
            const productId = addToCartBtn.dataset.productId;
            addToCart(productId);
            return; // Hentikan proses lebih lanjut
        }

        const card = e.target.closest('.product-card');
        if (card) {
            const productId = card.dataset.productId;
            showProductDetail(productId);
        }
    });

    // Menambah ke keranjang dari modal
    modalAddToCartBtn.addEventListener('click', () => {
        const productId = modalAddToCartBtn.dataset.productId;
        addToCart(productId);
        hideModal();
    });

    // Event untuk menutup modal
    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!checkoutModal.classList.contains('hidden')) {
                checkoutModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            } else if (!cartModal.classList.contains('hidden')) {
                cartModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            } else if (!modal.classList.contains('hidden')) {
                hideModal();
            }
        }
    });

    // Event untuk membuka dan menutup modal keranjang
    cartIcon.addEventListener('click', () => {
        renderCartItems();
        cartModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    closeCartModalBtn.addEventListener('click', () => {
        cartModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });

    // Event untuk membuka dan menutup modal checkout
    checkoutBtn.addEventListener('click', () => {
        cartModal.classList.add('hidden');
        checkoutModal.classList.remove('hidden');
    });

    closeCheckoutModalBtn.addEventListener('click', () => {
        checkoutModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });

    // Event submit form checkout
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendOrderToWhatsApp();
    });


    // --- Pemuatan Awal ---
    fetchProducts();
});



