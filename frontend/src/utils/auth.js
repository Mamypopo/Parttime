export const checkTokenExpiration = (token) => {
    if (!token) return false

    try {
        const parts = token.split('.')
        const decoded = atob(parts[1])
        const payload = JSON.parse(decoded)

        // เปรียบเทียบเวลาปัจจุบันกับเวลาหมดอายุ
        const currentTime = Math.floor(Date.now() / 1000)
        // console.log('Token check:', {
        //     currentTime,
        //     expirationTime: payload.exp,
        //     isValid: currentTime < payload.exp
        // })

        return currentTime < payload.exp

    } catch (error) {
        console.error('Token validation error:', error)
        return false
    }
}
