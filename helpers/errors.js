const errorFormatter = (error) => {
    let errors = {};
    const allErrors = error.substring(error.indexOf(':') + 1).trim();
    const allErrorsInArrayFormat = allErrors.slpit(',').map(err => err.trim());
    allErrorsInArrayFormat.forEach(error => {
        const [key, value] = error.split(':').map(err => err.trim());
        errors[key] = value;
    });
    return errors;
}

module.exports = errorFormatter;