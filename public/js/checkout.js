// Đọc giỏ hàng
let cart = JSON.parse(localStorage.getItem('YOUTH_SHOP_CART')) || [];
const SHIPPING_FEE = 30000;

const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// 1. Render Tóm tắt đơn hàng bên cột phải
const renderOrderSummary = () => {
    const container = document.getElementById('checkoutItems');
    let html = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        html += `
            <div class="d-flex align-items-center mb-3">
                <div class="position-relative me-3">
                    <img src="${item.image}" alt="${item.name}" class="checkout-item-img">
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">
                        ${item.quantity}
                    </span>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0 text-truncate" style="max-width: 180px; font-size: 0.9rem;">${item.name}</h6>
                </div>
                <div class="fw-medium text-end ms-2">
                    ${formatMoney(itemTotal)}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('subtotalAmount').innerText = formatMoney(subtotal);
    document.getElementById('shippingFee').innerText = formatMoney(SHIPPING_FEE);
    document.getElementById('totalAmount').innerText = formatMoney(subtotal + SHIPPING_FEE);
};

// 2. Xử lý sự kiện Submit Form
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Ngăn chặn load lại trang mặc định của form

    // Thu thập dữ liệu người dùng nhập
    const customerData = {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        note: document.getElementById('note').value.trim()
    };

    // Validate Regex cơ bản cho số điện thoại (10 số)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerData.phone)) {
        Swal.fire({ icon: 'warning', title: 'Lỗi', text: 'Số điện thoại không hợp lệ. Vui lòng nhập 10 số.' });
        return;
    }

    // HIỂN THỊ MODAL YÊU CẦU ĐẶT HÀNG (Custom HTML theo đúng yêu cầu)
    Swal.fire({
        title: 'YÊU CẦU ĐẶT HÀNG',
        html: `
            <div class="text-start" style="font-size: 1rem; color: #374151;">
                <p class="mb-2">Vui lòng chờ từ <strong class="text-primary">3-5 phút</strong> và giữ điện thoại để nhân viên liên hệ xác nhận.</p>
                <p class="mb-3 text-danger fw-bold"><i class="fa-solid fa-triangle-exclamation me-1"></i> Các sản phẩm này yêu cầu thanh toán trước.</p>
                
                <div class="form-check p-3 bg-light border rounded mt-3">
                    <input class="form-check-input ms-0 me-2" type="checkbox" id="confirmCheckbox" style="cursor: pointer;">
                    <label class="form-check-label" for="confirmCheckbox" style="cursor: pointer; user-select: none;">
                        Tôi đã đọc và hiểu thông tin trên.
                    </label>
                </div>
            </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#111827',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'XÁC NHẬN',
        cancelButtonText: 'Hủy',
        // preConfirm dùng để kiểm tra checkbox trước khi cho phép bấm XÁC NHẬN
        preConfirm: () => {
            const isChecked = document.getElementById('confirmCheckbox').checked;
            if (!isChecked) {
                Swal.showValidationMessage('Bạn cần đánh dấu vào ô đồng ý để tiếp tục!');
                return false;
            }
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // NẾU NHẤN XÁC NHẬN -> Bắt đầu gọi API gửi đơn hàng
            submitOrder(customerData);
        }
    });
});

// 3. Hàm gửi đơn hàng thực tế lên Backend
const submitOrder = async (customerData) => {
    const btn = document.getElementById('placeOrderBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> ĐANG GỬI ĐƠN...';
    btn.disabled = true;

    // Lấy KEY đang lưu trong localStorage ra để gửi kèm trong Header
    const currentKey = localStorage.getItem('YOUTH_SHOP_KEY');

    // Định dạng lại mảng sản phẩm cho đúng với Backend yêu cầu
    const itemsPayload = cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity
    }));

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': currentKey // Gửi kèm KEY để middleware checkKey cho phép đi qua
            },
            body: JSON.stringify({
                ...customerData,
                items: itemsPayload
            })
        });

        const result = await response.json();

        if (result.success) {
            // Xóa giỏ hàng sau khi đặt thành công
            localStorage.removeItem('YOUTH_SHOP_CART');

            Swal.fire({
                icon: 'success',
                title: 'Đặt hàng thành công!',
                html: `Mã đơn hàng của bạn là: <strong class="text-primary">${result.data.orderCode}</strong><br>Nhân viên sẽ liên hệ với bạn trong 3-5 phút tới.`,
                confirmButtonColor: '#111827'
            }).then(() => {
                // Chuyển hướng về trang chủ
                window.location.href = '/index.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Đặt hàng thất bại',
                text: result.message,
                confirmButtonColor: '#111827'
            });
            btn.innerHTML = 'TIẾN HÀNH ĐẶT HÀNG';
            btn.disabled = false;
        }

    } catch (error) {
        console.error('Lỗi:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi kết nối',
            text: 'Không thể kết nối đến máy chủ.',
            confirmButtonColor: '#111827'
        });
        btn.innerHTML = 'TIẾN HÀNH ĐẶT HÀNG';
        btn.disabled = false;
    }
};

// 4. Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    // Nếu chưa nhập KEY
    if (!localStorage.getItem('YOUTH_SHOP_KEY')) {
        window.location.href = '/key.html';
        return;
    }
    // Nếu giỏ hàng trống, không cho vào trang Checkout
    if (cart.length === 0) {
        window.location.href = '/cart.html';
        return;
    }
    
    renderOrderSummary();
});