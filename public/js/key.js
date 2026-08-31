document.getElementById('keyForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Ngăn trình duyệt tự tải lại trang
    
    const keyInput = document.getElementById('accessKey').value.trim();
    const submitBtn = document.getElementById('submitBtn');

    if (!keyInput) return;

    // Đổi trạng thái nút bấm thành Loading
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> ĐANG KIỂM TRA...';
    submitBtn.disabled = true;

    try {
        // Gửi yêu cầu kiểm tra KEY lên Backend
        const response = await fetch('/api/keys/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: keyInput })
        });

        const data = await response.json();

        if (data.success) {
            // Nếu hợp lệ: Lưu KEY vào localStorage
            localStorage.setItem('YOUTH_SHOP_KEY', keyInput);
            
            // Hiển thị thông báo thành công
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Mã truy cập hợp lệ, đang chuyển hướng...',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // Chuyển hướng về trang chủ (index.html)
                window.location.href = '/index.html';
            });
        } else {
            // Nếu sai mã hoặc hết hạn
            Swal.fire({
                icon: 'error',
                title: 'Từ chối truy cập',
                text: data.message,
                confirmButtonColor: '#111827'
            });
            submitBtn.innerHTML = '<i class="fa-solid fa-unlock-keyhole me-2"></i> TRUY CẬP';
            submitBtn.disabled = false;
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi kết nối',
            text: 'Không thể kết nối đến máy chủ, vui lòng thử lại sau.'
        });
        submitBtn.innerHTML = '<i class="fa-solid fa-unlock-keyhole me-2"></i> TRUY CẬP';
        submitBtn.disabled = false;
    }
});