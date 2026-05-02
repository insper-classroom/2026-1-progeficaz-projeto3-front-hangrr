/**
 * Pede a geolocalização do usuário.
 * Usa watchPosition para coletar amostras progressivas e retornar
 * a mais precisa dentro do timeout — essencial em desktops com WiFi.
 * Retorna { lat, lng, accuracy } ou null se negado/indisponível/timeout.
 */
export function pegarLocalizacao(timeoutMs = 12000) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }

    let best    = null
    let watchId = null

    function finish() {
      navigator.geolocation.clearWatch(watchId)
      resolve(best)
    }

    const timer = setTimeout(finish, timeoutMs)

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const current = {
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        if (!best || current.accuracy < best.accuracy) {
          best = current
        }
        // Fix muito bom obtido — não precisa esperar mais
        if (current.accuracy <= 50) {
          clearTimeout(timer)
          finish()
        }
      },
      () => {
        clearTimeout(timer)
        finish()
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    )
  })
}
