export function onLocationError(err: GeolocationPositionError) {
  let errorMessage
  switch (err.code) {
    case 1:
      errorMessage = "Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin."
      break
    case 2:
      errorMessage = "Konumunuz tespit edilemedi, lütfen biraz sonra tekrar deneyiniz."
      break
    case 3:
      errorMessage = "Konum isteği zaman aşımına uğradı, lütfen sayfayı yenileyip tekrar deneyiniz."
      break
    default:
      errorMessage = "Konum izni alınamadı, lütfen tarayıcınızın ve cihazınızın gizlilik ayarlarını kontrol edin."
      break
  }
  // @ts-ignore
  Toastify({
    text: errorMessage,
    duration: 3000,
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "black",
      borderRadius: "6px",
      margin: "16px"
    },
    onClick: function () {} // Callback after click
  }).showToast()
}
