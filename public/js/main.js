let cart = JSON.parse(localStorage.getItem('YOUTH_SHOP_CART')) || [];
let allProducts = []; // Lưu trữ toàn bộ sản phẩm để lọc cục bộ hoặc gọi API

const checkAccess = () => {
    const key = localStorage.getItem('YOUTH_SHOP_KEY');
    if (!key) window.location.href = '/key.html';
};

const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const updateCartBadge = () => {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = totalItems;
};

// 1. TẢI CÁC NÚT DANH MỤC ĐỂ LỌC
const loadCategoryTabs = async () => {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        const tabsContainer = document.getElementById('categoryTabs');

        if (data.success && tabsContainer) {
            // Giữ lại nút "Tất cả" đầu tiên, sau đó thêm các danh mục từ DB
            let html = `<button class="btn btn-dark btn-sm rounded-pill px-3 active" onclick="filterByCategory('all', this)">Tất cả</button>`;
            
            data.data.forEach(cat => {
                html += `<button class="btn btn-outline-dark btn-sm rounded-pill px-3" onclick="filterByCategory('${cat._id}', this)">${cat.name}</button>`;
            });
            tabsContainer.innerHTML = html;
        }
    } catch (err) {
        console.error('Lỗi tải danh mục:', err);
    }
};

// 2. LẤY DỮ LIỆU SẢN PHẨM TỪ BACKEND
const loadProducts = async () => {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (data.success) {
            allProducts = data.data;
            renderProductList(allProducts);
        }
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        document.getElementById('productList').innerHTML = `<div class="col-12 text-center text-danger py-5">Lỗi kết nối máy chủ!</div>`;
    }
};

// 3. HÀM RENDER DANH SÁCH SẢN PHẨM RA MÀN HÌNH
const renderProductList = (products) => {
    const productListDiv = document.getElementById('productList');
    if (!productListDiv) return;

    if (products.length === 0) {
        productListDiv.innerHTML = `<div class="col-12 text-center text-muted py-5">Không có sản phẩm nào trong danh mục này.</div>`;
        return;
    }

    productListDiv.innerHTML = '';

    products.forEach(product => {
        const imageUrl = (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/400';
        const categoryName = product.category ? product.category.name : 'Chưa phân loại';
        const categoryId = product.category ? product.category._id : '';
        const isOutOfStock = product.stockQuantity <= 0;

        const html = `
            <div class="col-6 col-md-4 col-lg-3 product-item" data-category="${categoryId}">
                <div class="youth-card h-100 d-flex flex-column ${isOutOfStock ? 'out-of-stock-card' : ''}">
                    <!-- Bấm vào ảnh chuyển sang trang chi tiết -->
                    <div class="product-img-wrapper position-relative cursor-pointer" onclick="goToDetail('${product._id}')">
                        <img src="${imageUrl}" class="product-img ${isOutOfStock ? 'out-of-stock-img' : ''}" alt="${product.name}">
                        ${isOutOfStock ? '<span class="position-absolute top-50 start-50 translate-middle badge bg-danger fs-6 px-3 py-2 shadow">HẾT HÀNG</span>' : ''}
                    </div>
                    
                    <div class="p-3 d-flex flex-column flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-secondary">${categoryName}</span>
                            <span class="stock-badge small text-muted"><i class="fa-solid fa-boxes-stacked me-1"></i>Còn: ${product.stockQuantity}</span>
                        </div>
                        
                        <!-- Bấm vào tên chuyển sang trang chi tiết -->
                        <h6 class="mb-1 fw-bold text-truncate cursor-pointer" title="${product.name}" onclick="goToDetail('${product._id}')">${product.name}</h6>
                        <p class="product-price mb-3">${formatMoney(product.price)}</p>
                        
                        ${isOutOfStock ? `
                            <button class="btn btn-secondary btn-sm mt-auto w-100" disabled>TẠM HẾT HÀNG</button>
                        ` : `
                            <button class="btn btn-outline-dark btn-sm mt-auto w-100" 
                                onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${imageUrl}')">
                                <i class="fa-solid fa-cart-plus me-1"></i> THÊM VÀO GIỎ
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
        productListDiv.innerHTML += html;
    });
};

// 4. LỌC SẢN PHẨM KHI BẤM VÀO DANH MỤC
window.filterByCategory = (catId, btnElement) => {
    // Đổi active button style
    document.querySelectorAll('#categoryTabs button').forEach(btn => {
        btn.classList.remove('active', 'btn-dark');
        btn.classList.add('btn-outline-dark');
    });
    btnElement.classList.remove('btn-outline-dark');
    btnElement.classList.add('btn-dark', 'active');

    if (catId === 'all') {
        renderProductList(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category && p.category._id === catId);
        renderProductList(filtered);
    }
};

// 5. CHUYỂN HƯỚNG SANG TRANG CHI TIẾT
window.goToDetail = (productId) => {
    window.location.href = `/product-detail.html?id=${productId}`;
};

window.addToCart = (id, name, price, image) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }
    localStorage.setItem('YOUTH_SHOP_CART', JSON.stringify(cart));
    updateCartBadge();
    
    Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: `Đã thêm ${name} vào giỏ`,
        showConfirmButton: false,
        timer: 2000
    });
};

const logout = () => {
    localStorage.removeItem('YOUTH_SHOP_KEY');
    window.location.href = '/key.html';
};

document.addEventListener('DOMContentLoaded', () => {
    checkAccess();
    updateCartBadge();
    loadCategoryTabs();
    loadProducts();
});