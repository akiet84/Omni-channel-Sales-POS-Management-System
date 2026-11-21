# 02: POS Barcode Search and Cart Calculation

**What to build:** Xây dựng màn hình bán hàng tại quầy (POS) cho Thu ngân (`Cashier`) với khả năng tìm kiếm sản phẩm tức thì qua quét mã vạch (barcode) hoặc gõ tên/SKU. Giỏ hàng cho phép điều chỉnh số lượng, áp dụng chiết khấu theo sản phẩm hoặc tổng đơn hàng, tự động hiển thị số lượng tồn khả dụng (`Available Inventory`), tính toán thuế và tổng tiền phải trả, hỗ trợ các phím tắt bàn phím tiện lợi mà không cần dùng chuột.

**Blocked by:** 01 (Monorepo Setup and Domain Foundations)

**Status:** ready-for-agent

- [ ] Thu ngân quét mã vạch hoặc nhập SKU vào ô tìm kiếm thì sản phẩm tương ứng được tự động thêm vào giỏ hàng ngay lập tức.
- [ ] Danh sách gợi ý tìm kiếm hiển thị rõ ràng phiên bản (màu sắc, kích thước) và số lượng tồn khả dụng (`Available Inventory`).
- [ ] Giỏ hàng cho phép tăng/giảm số lượng bằng phím mũi tên hoặc gõ trực tiếp, chặn tăng số lượng nếu vượt quá `Available Inventory`.
- [ ] Cho phép áp dụng giảm giá trên từng dòng sản phẩm hoặc trên tổng đơn hàng (theo % hoặc số tiền cố định).
- [ ] Hỗ trợ các phím tắt tiện lợi: `F2` để focus ô tìm kiếm, `F8` để xóa giỏ hàng, `F9` để chuyển sang bước thanh toán.
- [ ] Viết test tự động kiểm thử logic tính toán giỏ hàng: tổng tiền trước giảm giá, giá trị giảm giá, thuế VAT và tổng tiền phải thanh toán cuối cùng.
