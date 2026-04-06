const images = [
    "chair1.jpg",
    "chair2.jpg",
    "chair3.jpg",
    "chair4.jpg"
];
let currentImageIndex = 0;
const mainImg = document.getElementById('mainImg');
const thumbContainer = document.getElementById('thumbnailsContainer');
const prevBtn = document.getElementById('prevImgBtn');
const nextBtn = document.getElementById('nextImgBtn');

function renderThumbnails() {
    thumbContainer.innerHTML = '';
    images.forEach((imgSrc, idx) => {
        const thumbDiv = document.createElement('div');
        thumbDiv.className = `thumb ${idx === currentImageIndex ? 'active' : ''}`;
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `thumb ${idx}`;
        thumbDiv.appendChild(img);
        thumbDiv.addEventListener('click', () => {
            currentImageIndex = idx;
            updateMainImage();
            updateActiveThumb();
        });
        thumbContainer.appendChild(thumbDiv);
    });
}

function updateMainImage() {
    mainImg.src = images[currentImageIndex];
}

function updateActiveThumb() {
    const thumbs = document.querySelectorAll('.thumb');
    thumbs.forEach((thumb, i) => {
        if (i === currentImageIndex) thumb.classList.add('active');
        else thumb.classList.remove('active');
    });
}

prevBtn.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    updateMainImage();
    updateActiveThumb();
});
nextBtn.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    updateMainImage();
    updateActiveThumb();
});
renderThumbnails();
updateMainImage();

const productBasePrice = 12990;
const priceElement = document.getElementById('productPrice');
priceElement.innerText = `${productBasePrice.toLocaleString()} ₽`;

let selectedSize = "S";
let selectedColor = "Бежевый";
let selectedMaterial = "Ткань";

function initOptionButtons(selector, attr, valueKey, setterFunc) {
    const btns = document.querySelectorAll(selector);
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = btn.getAttribute(attr);
            setterFunc(val);
        });
        if (btn.getAttribute(attr) === (valueKey === 'size' ? selectedSize : (valueKey === 'color' ? selectedColor : selectedMaterial))) {
            btn.classList.add('active');
        }
    });
}

initOptionButtons('#sizeOptions .opt-btn', 'data-size', 'size', (val) => selectedSize = val);
initOptionButtons('#colorOptions .opt-btn', 'data-color', 'color', (val) => selectedColor = val);
initOptionButtons('#materialOptions .opt-btn', 'data-material', 'material', (val) => selectedMaterial = val);

let quantity = 1;
const qtySpan = document.getElementById('qtyValue');
const decr = document.getElementById('decrQty');
const incr = document.getElementById('incrQty');
function updateQuantityUI() {
    qtySpan.innerText = quantity;
}
decr.addEventListener('click', () => {
    if (quantity > 1) quantity--;
    updateQuantityUI();
});
incr.addEventListener('click', () => {
    if (quantity < 99) quantity++;
    updateQuantityUI();
});
updateQuantityUI();

let cart = [];
let nextCartId = 1;

function loadCartFromStorage() {
    const saved = localStorage.getItem('shop_cart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
            if (cart.length > 0) {
                const maxId = Math.max(...cart.map(item => item.id), 0);
                nextCartId = maxId + 1;
            } else {
                nextCartId = 1;
            }
            renderCart();
            updateCartBadge();
            updateCartTotal();
        } catch(e) { cart = []; }
    } else {
        cart = [];
        nextCartId = 1;
    }
}

function saveCartToStorage() {
    localStorage.setItem('shop_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCountBadge');
    badge.innerText = totalItems;
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotalAmount').innerText = `${total.toLocaleString()} ₽`;
}

function renderCart() {
    const cartContainer = document.getElementById('cartItemsList');
    if (!cart.length) {
        cartContainer.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        updateCartTotal();
        updateCartBadge();
        return;
    }
    cartContainer.innerHTML = '';
    cart.forEach((item) => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${escapeHtml(item.name)}</div>
                <div class="cart-item-details">${item.size || ''} / ${item.color || ''} / ${item.material || ''} • Кол-во: ${item.quantity}</div>
                <div class="cart-item-price">${(item.price * item.quantity).toLocaleString()} ₽</div>
            </div>
            <button class="remove-item" data-id="${item.id}"><i data-feather="trash-2"></i></button>
        `;
        cartContainer.appendChild(cartItemDiv);
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.getAttribute('data-id'));
            cart = cart.filter(item => item.id !== id);
            saveCartToStorage();
            renderCart();
            updateCartBadge();
            updateCartTotal();
            if(cart.length === 0) nextCartId = 1;
        });
    });
    if (typeof feather !== 'undefined') feather.replace();
    updateCartTotal();
}

function escapeHtml(str) { 
    if(!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

function addToCart(productName, productPrice, quantityToAdd = null) {
    const finalQuantity = quantityToAdd !== null ? quantityToAdd : quantity;
    const newCartItem = {
        id: nextCartId++,
        name: productName,
        price: productPrice,
        quantity: finalQuantity,
        size: selectedSize,
        color: selectedColor,
        material: selectedMaterial,
    };
    cart.push(newCartItem);
    saveCartToStorage();
    renderCart();
    updateCartBadge();
    updateCartTotal();
    openCartSidebar();
}

const addBtn = document.getElementById('addToCartBtn');
addBtn.addEventListener('click', () => {
    addToCart("Эргономичное кресло Aurora", productBasePrice);
    const btn = addBtn;
    btn.style.transform = 'scale(0.96)';
    setTimeout(() => btn.style.transform = '', 150);
});

document.querySelectorAll('.similar-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const name = btn.getAttribute('data-name');
        const price = parseInt(btn.getAttribute('data-price'));
        addToCart(name, price, 1);
        btn.style.transform = 'scale(0.96)';
        setTimeout(() => btn.style.transform = '', 150);
    });
});

const overlay = document.getElementById('cartOverlay');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
function openCartSidebar() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeCartSidebar() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}
openCartBtn.addEventListener('click', openCartSidebar);
closeCartBtn.addEventListener('click', closeCartSidebar);
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCartSidebar();
});

const checkout = document.getElementById('checkoutBtn');
checkout.addEventListener('click', () => {
    if(cart.length === 0) {
        alert('Корзина пуста, добавьте товары');
        return;
    }
    alert(`Спасибо за заказ! Сумма: ${document.getElementById('cartTotalAmount').innerText}. Корзина будет очищена.`);
    cart = [];
    saveCartToStorage();
    renderCart();
    updateCartBadge();
    updateCartTotal();
    closeCartSidebar();
    nextCartId = 1;
});

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

const allReviewsBtn = document.getElementById('allReviewsBtn');
const addReviewBtn = document.getElementById('addReviewBtn');

allReviewsBtn.addEventListener('click', () => {
    openModal('allReviewsModal');
});

addReviewBtn.addEventListener('click', () => {
    openModal('addReviewModal');
    document.getElementById('reviewRating').value = '0';
    document.querySelectorAll('.rating-star').forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewText').value = '';
});

let currentRating = 0;
document.querySelectorAll('.rating-star').forEach(star => {
    star.addEventListener('click', () => {
        currentRating = parseInt(star.getAttribute('data-rating'));
        document.getElementById('reviewRating').value = currentRating;
        document.querySelectorAll('.rating-star').forEach((s, index) => {
            if (index < currentRating) {
                s.classList.add('active');
                s.textContent = '★';
            } else {
                s.classList.remove('active');
                s.textContent = '☆';
            }
        });
    });
});

const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reviewName').value.trim();
        const rating = document.getElementById('reviewRating').value;
        const text = document.getElementById('reviewText').value.trim();
        
        if (!name) {
            alert('Пожалуйста, введите ваше имя');
            return;
        }
        if (rating === '0') {
            alert('Пожалуйста, выберите оценку');
            return;
        }
        if (!text) {
            alert('Пожалуйста, напишите текст отзыва');
            return;
        }
        
        alert(`Спасибо, ${name}! Ваш отзыв на ${rating} звезд(ы) будет опубликован после модерации.`);
        closeModal('addReviewModal');
    });
}

loadCartFromStorage();
if(cart.length) {
    const maxExisting = Math.max(...cart.map(i=>i.id),0);
    if(nextCartId <= maxExisting) nextCartId = maxExisting+1;
} else {
    nextCartId = 1;
}
renderCart();
updateCartBadge();

if (typeof feather !== 'undefined') feather.replace();