export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateNationalId = (id) => {
    const idRegex = /^[0-9]{13}$/;
    return idRegex.test(id);
}; 