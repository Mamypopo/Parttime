export const checkTokenExpiration = (token) => {
    if (!token) return false

    try {
        const parts = token.split('.')
        const decoded = atob(parts[1])
        const payload = JSON.parse(decoded)

        const currentTime = Math.floor(Date.now() / 1000)
        return currentTime < payload.exp

    } catch (error) {
        console.error('Token validation error:', error)
        return false
    }
}
