// ─── Validation Utilities ───

export const validators = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  positiveNumber: (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return 'Must be a positive number';
    }
    return null;
  },

  positiveNonZero: (value) => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return 'Must be greater than zero';
    }
    return null;
  },

  percentage: (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 100) {
      return 'Must be between 0 and 100';
    }
    return null;
  },

  interestRate: (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 50) {
      return 'Interest rate must be between 0% and 50%';
    }
    return null;
  },

  year: (value) => {
    const num = Number(value);
    const currentYear = new Date().getFullYear();
    if (isNaN(num) || num < currentYear || num > currentYear + 50) {
      return `Year must be between ${currentYear} and ${currentYear + 50}`;
    }
    return null;
  },

  name: (value) => {
    if (!value || value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (value.trim().length > 50) {
      return 'Name must be under 50 characters';
    }
    return null;
  },

  age: (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 18 || num > 100) {
      return 'Age must be between 18 and 100';
    }
    return null;
  },

  months: (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 0 || num > 600) {
      return 'Months must be between 0 and 600';
    }
    return null;
  },
};

/**
 * Validate a full form object against a rules map
 * @param {Object} data - Form data { field: value }
 * @param {Object} rules - Rules map { field: [validator1, validator2] }
 * @returns {Object} errors map { field: 'error message' | null }
 */
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  for (const [field, fieldValidators] of Object.entries(rules)) {
    for (const validator of fieldValidators) {
      const error = validator(data[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
        break;
      }
    }
    if (!errors[field]) {
      errors[field] = null;
    }
  }

  return { errors, isValid };
};
