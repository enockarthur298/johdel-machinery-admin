import { useState, useCallback } from 'react';
import { object, string } from 'yup';

export const useForm = (initialValues, validationSchema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (validationSchema) {
        await validationSchema.validate(values, { abortEarly: false });
      }
      
      // Clear errors if validation passes
      setErrors({});
      
      // Call the onSubmit callback
      await onSubmit(values);
      
      return { success: true };
    } catch (err) {
      // Handle validation errors
      if (err.name === 'ValidationError') {
        const newErrors = {};
        err.inner.forEach(error => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
        return { success: false, errors: newErrors };
      }
      
      // Re-throw other errors
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validationSchema]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  // Set field value manually
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set field error manually
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors
  };
};

// Common validation schemas
export const validationSchemas = {
  required: (message = 'This field is required') => 
    string().required(message),
  email: (message = 'Please enter a valid email') => 
    string().email(message).required('Email is required'),
  password: (min = 8, max = 30) => 
    string()
      .min(min, `Password must be at least ${min} characters`)
      .max(max, `Password must be less than ${max} characters`)
      .required('Password is required'),
  confirmPassword: (fieldName = 'password', message = 'Passwords do not match') => 
    string().test('passwords-match', message, function(value) {
      return this.parent[fieldName] === value;
    })
};
