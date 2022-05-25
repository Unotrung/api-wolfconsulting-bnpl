const VALIDATE_PHONE = /^(09|03|07|08|05)+([0-9]{8}$)/;
const VALIDATE_PHONE_REF = /^(09|03|07|08|05|02)+([0-9]{8,9}$)/;
const VALIDATE_NID = /^\d{12}$|^\d{9}$/;
const VALIDATE_PIN = /^\d{4}$/;

module.exports = { VALIDATE_PHONE, VALIDATE_PHONE_REF, VALIDATE_NID, VALIDATE_PIN };