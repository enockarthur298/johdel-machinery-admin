import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, PhotoIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';

const ProductForm = ({ product = null }) => {
  const isEdit = !!product;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [showCustomPowerType, setShowCustomPowerType] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(product?.brand || '');
  const [selectedPowerType, setSelectedPowerType] = useState(product?.powerType || '');
  const [customBrand, setCustomBrand] = useState('');
  const [customPowerType, setCustomPowerType] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, control, watch } = useForm({
    defaultValues: product || {
      name: '',
      description: '',
      price: '',
      brand: '',
      customBrand: '',
      powerType: '',
      customPowerType: '',
      stock: '',
      sku: '',
      images: product?.images || [''],
      specifications: product?.specifications || [{ key: '', value: '' }]
    }
  });

  const brands = [
    'Makita',
    'DeWalt',
    'Bosch',
    'Milwaukee',
    'Ryobi',
    'Stanley',
    'Black+Decker',
    'Knipex',
    'Other (Specify)'
  ];

  const powerTypes = [
    'Corded Electric',
    'Cordless (Battery)',
    'Pneumatic',
    'Hydraulic',
    'Gas/Petrol',
    'Manual',
    'Other (Specify)'
  ];

  const handleBrandChange = (e) => {
    const value = e.target.value;
    setSelectedBrand(value);
    setShowCustomBrand(value === 'Other (Specify)');
    if (value !== 'Other (Specify)') {
      setValue('brand', value);
      setValue('customBrand', '');
    } else {
      setValue('brand', '');
    }
  };

  const handlePowerTypeChange = (e) => {
    const value = e.target.value;
    setSelectedPowerType(value);
    setShowCustomPowerType(value === 'Other (Specify)');
    if (value !== 'Other (Specify)') {
      setValue('powerType', value);
      setValue('customPowerType', '');
    } else {
      setValue('powerType', '');
    }
  };

  const handleCustomBrandChange = (e) => {
    const value = e.target.value;
    setCustomBrand(value);
    setValue('brand', value);
  };

  const handleCustomPowerTypeChange = (e) => {
    const value = e.target.value;
    setCustomPowerType(value);
    setValue('powerType', value);
  };
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications'
  });

  const [imagePreviews, setImagePreviews] = useState(product?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Set initial form values when product changes
  useEffect(() => {
    if (product) {
      setImagePreviews(product.images || []);
      setSelectedBrand(product.brand || '');
      setSelectedPowerType(product.powerType || '');
    }
  }, [product]);

  // Handle image upload (mock implementation - replace with actual file upload)
  const handleImageUpload = async (file) => {
    try {
      setIsUploading(true);
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, upload the file to your storage service
      // const uploadedImage = await uploadImageToStorage(file);
      // return uploadedImage.url;
      
      // For now, use a mock URL
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image file selection
  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      const newImages = [...imagePreviews];
      newImages[index] = imageUrl;
      setImagePreviews(newImages.filter(url => url));
    } catch (error) {
      console.error('Error handling image:', error);
    }
  };

  // Add a new image field
  const addImageField = () => {
    setImagePreviews([...imagePreviews, '']);
  };

  // Remove an image
  const removeImage = (index) => {
    const newImages = [...imagePreviews];
    newImages.splice(index, 1);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setServerError('');
      
      // Prepare the product data
      const productData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        brand: data.brand,
        powerType: data.powerType,
        stock: parseInt(data.stock, 10),
        sku: data.sku,
        images: imagePreviews.filter(img => img && img.trim() !== ''),
        specifications: data.specifications
          .filter(spec => spec.key.trim() !== '' && spec.value.trim() !== '')
          .map(spec => ({
            key: spec.key.trim(),
            value: spec.value.trim()
          }))
      };
      
      // Call the appropriate API based on whether we're creating or updating
      if (isEdit) {
        await productsApi.update(product.id, productData);
        toast.success('Product updated successfully!');
      } else {
        await productsApi.create(productData);
        toast.success('Product created successfully!');
      }
      
      // Invalidate products query to refetch the list
      queryClient.invalidateQueries(['products']);
      
      // Navigate back to products list
      navigate('/admin/products');
      
    } catch (error) {
      console.error('Error submitting product:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save product. Please try again.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information Section */}
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
              <p className="mt-1 text-sm text-gray-500">General information about the product</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Product name is required' })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                    Brand *
                  </label>
                  <select
                    id="brand"
                    value={selectedBrand}
                    onChange={handleBrandChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.brand ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  {showCustomBrand && (
                    <div className="mt-2">
                      <input
                        type="text"
                        id="customBrand"
                        value={customBrand}
                        onChange={handleCustomBrandChange}
                        placeholder="Enter brand name"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors.brand ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                  )}
                  {errors.brand && (
                    <p className="mt-2 text-sm text-red-600">{errors.brand.message}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="powerType" className="block text-sm font-medium text-gray-700">
                    Power Type *
                  </label>
                  <select
                    id="powerType"
                    value={selectedPowerType}
                    onChange={handlePowerTypeChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.powerType ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select power type</option>
                    {powerTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {showCustomPowerType && (
                    <div className="mt-2">
                      <input
                        type="text"
                        id="customPowerType"
                        value={customPowerType}
                        onChange={handleCustomPowerTypeChange}
                        placeholder="Enter power type"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors.powerType ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                  )}
                  {errors.powerType && (
                    <p className="mt-2 text-sm text-red-600">{errors.powerType.message}</p>
                  )}
                </div>

                <div className="col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Enter detailed product description..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Product Details</h3>
              <p className="mt-1 text-sm text-gray-500">Specify product specifications and attributes</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    id="sku"
                    {...register('sku')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., TOOL-12345"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    {...register('stock', { 
                      required: 'Stock quantity is required',
                      min: { value: 0, message: 'Stock cannot be negative' },
                      valueAsNumber: true
                    })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.stock ? 'border-red-500' : ''
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      id="price"
                      {...register('price', { 
                        required: 'Price is required',
                        min: { value: 0.01, message: 'Price must be greater than 0' }
                      })}
                      className={`pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        errors.price ? 'border-red-500' : ''
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Identification Section */}
            <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Product Identification</h3>
              <p className="mt-1 text-sm text-gray-500">Categorize and identify your product</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                    Brand *
                  </label>
                  <select
                    id="brand"
                    value={selectedBrand}
                    onChange={handleBrandChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.brand ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select a brand</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                  {showCustomBrand && (
                    <div className="mt-2">
                      <input
                        type="text"
                        id="customBrand"
                        value={customBrand}
                        onChange={handleCustomBrandChange}
                        placeholder="Enter brand name"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors.brand ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                  )}
                  {errors.brand && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="powerType" className="block text-sm font-medium text-gray-700">
                    Power Type *
                  </label>
                  <select
                    id="powerType"
                    value={selectedPowerType}
                    onChange={handlePowerTypeChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.powerType ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select power type</option>
                    {powerTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {showCustomPowerType && (
                    <div className="mt-2">
                      <input
                        type="text"
                        id="customPowerType"
                        value={customPowerType}
                        onChange={handleCustomPowerTypeChange}
                        placeholder="Enter power type"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors.powerType ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                  )}
                  {errors.powerType && (
                    <p className="mt-1 text-sm text-red-600">{errors.powerType.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Media Section */}
            <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Product Media</h3>
              <p className="mt-1 text-sm text-gray-500">Upload product images (up to 5 images)</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className={`h-40 rounded-md border-2 border-dashed ${
                      errors.images?.[index] ? 'border-red-500' : 'border-gray-300'
                    } relative`}>
                      {preview ? (
                        <>
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <label className="h-full w-full flex flex-col items-center justify-center cursor-pointer">
                          <PhotoIcon className="h-12 w-12 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-600">
                            Click to upload
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                          />
                        </label>
                      )}
                    </div>
                    <input
                      type="hidden"
                      {...register(`images.${index}`, {
                        required: index === 0 ? 'At least one image is required' : false
                      })}
                    />
                    {errors.images?.[index] && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.images[index].message}
                      </p>
                    )}
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <div className="h-40 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={addImageField}
                      className="h-full w-full rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 focus:outline-none"
                    >
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span className="mt-2 text-sm text-gray-600">
                        Add another image
                      </span>
                    </button>
                  </div>
                )}
              </div>
              {errors.images && typeof errors.images.message === 'string' && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.images.message}
                </p>
              )}
            </div>

            {/* Product Specifications Section */}
            <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Product Specifications</h3>
              <p className="mt-1 text-sm text-gray-500">Add detailed specifications and features</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Specifications
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ key: '', value: '' })}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Specification
                  </button>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-5">
                        <input
                          type="text"
                          {...register(`specifications.${index}.key`)}
                          placeholder="Specification name (e.g., Weight, Dimensions)"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-6">
                        <input
                          type="text"
                          {...register(`specifications.${index}.value`)}
                          placeholder="Specification value"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="mt-1 inline-flex items-center justify-center p-1.5 rounded-md text-red-500 hover:bg-red-50 focus:outline-none"
                          title="Remove specification"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-500">
                        No specifications added yet. Click "Add Specification" to get started.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : isEdit ? (
                  'Update Product'
                ) : (
                  'Save Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
