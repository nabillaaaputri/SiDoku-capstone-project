const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validatePassword = (password) => {
  return password.length >= 6
}

const validateRequired = (value) => {
  return value && value.trim().length > 0
}

const validateNumber = (value) => {
  return !isNaN(value) && value > 0
}

export { validateEmail, validatePassword, validateRequired, validateNumber }
