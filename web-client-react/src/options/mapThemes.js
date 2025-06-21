export const jawgToken = import.meta.env.VITE_API_JAWG_TOKEN

export const mapTheme = `https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`
export const invertedMapTheme = `https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=${jawgToken}`
