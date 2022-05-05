// const Crypto = require('crypto');
// const dotenv = require('dotenv');

// dotenv.config();

// const key = Crypto.createHash('sha512').update(process.env.SECRET_KEY, 'utf-8').digest('hex').substr(0, 32);
// const iv = Crypto.createHash('sha512').update(process.env.SECRET_IV, 'utf-8').digest('hex').substr(0, 16);

// const encrypt_string = (text, encryptionMethod, secret, iv) => {
//     var encryptor = Crypto.createCipheriv(encryptionMethod, secret, iv);
//     var aes_encrypted = encryptor.update(text, 'utf8', 'base64') + encryptor.final('base64'); // convert to base 64
//     return Buffer.from(aes_encrypted).toString('base64');
// }

// const decrypt_string = (text, encryptionMethod, secret, iv) => {
//     const buff = Buffer.from(text, 'base64'); // get base 64 string
//     text = buff.toString('utf-8'); // convert to string
//     var decryptor = Crypto.createDecipheriv(encryptionMethod, secret, iv);
//     return decryptor.update(text, 'base64', 'utf8') + decryptor.final('utf8'); // return decrypt one
// }

// const encrypt_data = (text) => {
//     return encrypt_string(text, process.env.ENCRYPTION_METHOD, key, iv);
// }

// const decrypt_data = (text) => {
//     return decrypt_string(text, process.env.ENCRYPTION_METHOD, key, iv);
// }

// module.exports = { encrypt_data, decrypt_data };