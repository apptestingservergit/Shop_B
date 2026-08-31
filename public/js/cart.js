let cart = JSON.parse(localStorage.getItem('YOUTH_SHOP_CART')) || [];
const SHIPPING_FEE = 30000; // Phí ship mặc định

const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// 1. Hàm vẽ giao diện Giỏ hàng
const renderCart = () => {
    const container = document.getElementById('cartItemsContainer');
    
    // NẾU GIỎ HÀNG TRỐNG
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="mb-3 text-muted"><i class="fa-solid fa-basket-shopping fa-3x"></i></div>
                <h5 class="text-muted">Giỏ hàng của bạn đang trống</h5>
                <a href="/index.html" class="btn btn-outline-dark mt-3">Mua sắm ngay</a>
            </div>
        `;
        document.getElementById('subtotalAmount').innerText = '0 ₫';
        document.getElementById('shippingFee').innerText = '0 ₫';
        document.getElementById('totalAmount').innerText = '0 ₫';
        return;
    }

    // NẾU CÓ HÀNG
    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        html += `
            <div class="d-flex align-items-center p-3 border-bottom ${index === cart.length - 1 ? 'border-0' : ''}">
                <img src="${item.image}" alt="${item.name}" class="cart-img me-3">
                
                <div class="flex-grow-1">
                    <h6 class="mb-1 fw-bold">${item.name}</h6>
                    <div class="text-muted small mb-2">${formatMoney(item.price)}</div>
                    
                    <div class="d-flex align-items-center">
                        <button class="btn btn-outline-secondary qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="mx-3 fw-medium">${item.quantity}</span>
                        <button class="btn btn-outline-secondary qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>

                <div class="text-end ms-3">
                    <div class="fw-bold text-primary mb-2">${formatMoney(itemTotal)}</div>
                    <button class="btn btn-sm text-danger border-0 p-0" onclick="removeItem('${item.id}')">
                        <i class="fa-solid fa-trash-can"></i> Xóa
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Cập nhật hóa đơn
    document.getElementById('subtotalAmount').innerText = formatMoney(subtotal);
    document.getElementById('shippingFee').innerText = formatMoney(SHIPPING_FEE);
    document.getElementById('totalAmount').innerText = formatMoney(subtotal + SHIPPING_FEE);
};

// 2. Hàm tăng giảm số lượng
window.updateQuantity = (id, change) => {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        
        // Nếu giảm xuống 0 hoặc âm thì xóa luôn sản phẩm
        if (item.quantity <= 0) {
            removeItem(id);
            return;
        }
        
        // Cập nhật lại localStorage và vẽ lại giao diện
        localStorage.setItem('YOUTH_SHOP_CART', JSON.stringify(cart));
        renderCart();
    }
};

// 3. Hàm xóa 1 sản phẩm
window.removeItem = (id) => {
    Swal.fire({
        title: 'Xóa sản phẩm?',
        text: "Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ hàng?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            cart = cart.filter(item => item.id !== id);
            localStorage.setItem('YOUTH_SHOP_CART', JSON.stringify(cart));
            renderCart();
        }
    });
};

// 4. Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra KEY
    if (!localStorage.getItem('YOUTH_SHOP_KEY')) {
        window.location.href = '/key.html';
        return;
    }
    renderCart();
});