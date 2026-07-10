export function QrError() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5">
      <div className="max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          QR không hợp lệ
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-950">
          Không xác định được bàn
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Vui lòng quét lại mã QR được đặt tại bàn của bạn.
        </p>
      </div>
    </main>
  );
}
