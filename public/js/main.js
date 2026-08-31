let cart = JSON.parse(localStorage.getItem('YOUTH_SHOP_CART')) || [];
let allProducts = []; 

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

// 1. TẢI CÁC NÚT DANH MỤC
const loadCategoryTabs = async () => {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        const tabsContainer = document.getElementById('categoryTabs');

        if (data.success && tabsContainer) {
            let html = `<button class="btn category-tab-btn active" onclick="filterByCategory('all', this)">Tất cả</button>`;
            data.data.forEach(cat => {
                html += `<button class="btn category-tab-btn" onclick="filterByCategory('${cat._id}', this)">${cat.name}</button>`;
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
            // TỰ ĐỘNG SẮP XẾP: SẢN PHẨM CÒN HÀNG LÊN TRÊN, HẾT HÀNG ĐẨY XUỐNG CUỐI
            sortAndRenderProducts(allProducts);
        }
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
        document.getElementById('productList').innerHTML = `<div class="col-12 text-center text-danger py-5">Lỗi kết nối máy chủ!</div>`;
    }
};

// Hàm sắp xếp chung: Tồn kho > 0 lên trước, tồn kho <= 0 xuống cuối
const sortAndRenderProducts = (products) => {
    const sorted = [...products].sort((a, b) => {
        const aStock = a.stockQuantity ?? 0;
        const bStock = b.stockQuantity ?? 0;
        const aOut = aStock <= 0 ? 1 : 0;
        const bOut = bStock <= 0 ? 1 : 0;
        return aOut - bOut; // Sản phẩm còn hàng (0) sẽ đứng trước sản phẩm hết hàng (1)
    });
    renderProductList(sorted);
};

// 3. HÀM RENDER DANH SÁCH SẢN PHẨM (RESPONSIVE 2 CỘT MOBILE)
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
        const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

        const html = `
            <div class="col-6 col-md-4 col-lg-3 product-item" data-category="${categoryId}">
                <div class="youth-card h-100 d-flex flex-column ${isOutOfStock ? 'out-of-stock-card' : ''}">
                    <!-- Ảnh sản phẩm -->
                    <div class="product-img-wrapper cursor-pointer" onclick="goToDetail('${product._id}')">
                        <img src="${imageUrl}" class="product-img ${isOutOfStock ? 'out-of-stock-img' : ''}" alt="${product.name}" loading="lazy">
                        ${isOutOfStock ? '<span class="position-absolute top-50 start-50 translate-middle badge bg-dark bg-opacity-75 fs-7 px-3 py-2 shadow-sm rounded-pill text-uppercase">Hết hàng</span>' : ''}
                    </div>
                    
                    <!-- Thông tin sản phẩm -->
                    <div class="p-3 d-flex flex-column flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="badge bg-light text-secondary border font-monospace" style="font-size: 0.68rem;">${categoryName}</span>
                            <span class="text-muted" style="font-size: 0.72rem;"><i class="fa-solid fa-box me-1"></i>${product.stockQuantity}</span>
                        </div>
                        
                        <h6 class="mb-2 fw-semibold text-dark text-truncate cursor-pointer" style="font-size: 0.92rem;" title="${product.name}" onclick="goToDetail('${product._id}')">${product.name}</h6>
                        <div class="product-price mb-3 mt-auto">${formatMoney(product.price)}</div>
                        
                        ${isOutOfStock ? `
                            <button class="btn btn-outline-secondary btn-sm mt-auto w-100 rounded-pill py-1.5" disabled style="font-size: 0.8rem;">Tạm hết hàng</button>
                        ` : `
                            <button class="btn btn-dark btn-sm mt-auto w-100 rounded-pill py-1.5 shadow-sm" 
                                onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${imageUrl}')" style="font-size: 0.8rem;">
                                <i class="fa-solid fa-cart-plus me-1"></i> Thêm vào giỏ
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
    document.querySelectorAll('#categoryTabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    btnElement.classList.add('active');

    if (catId === 'all') {
        sortAndRenderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category && p.category._id === catId);
        sortAndRenderProducts(filtered);
    }
};

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
        timer: 1800
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