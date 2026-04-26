/**
 * Pede a geolocalização do usuário.
 * Retorna { lat, lng, accuracy } ou null se negado/indisponível/timeout.
 * accuracy em metros — valores típicos:
 *   GPS mobile: 5–50m
 *   WiFi:       30–300m
 *   IP (desktop sem GPS): 1000–50000m  ← descartado no backend
 */
export function pegarLocalizacao(timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }

    const timer = setTimeout(() => resolve(null), timeoutMs)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        resolve({
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      () => {
        clearTimeout(timer)
        resolve(null)
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 }
    )
  })
}
