export function formatVnd(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`;
}
