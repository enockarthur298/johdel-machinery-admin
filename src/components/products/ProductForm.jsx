import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useFieldArray } from 'react-hook-form';

const ProductForm = ({ product = null }) => {
  const isEdit = !!product;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm({
    defaultValues: product || {
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      sku: '',
      images: product?.images || [''],
      specifications: product?.specifications || [{ key: '', value: '' }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications'
  });

  const [imagePreviews, setImagePreviews] = useState(product?.images || ['']);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...imagePreviews];
      newPreviews[index] = reader.result;
      setImagePreviews(newPreviews);
      setValue('images', newPreviews);
    };
    reader.readAsDataURL(file);
  };

  const addImageField = () => {
    setImagePreviews([...imagePreviews, '']);
  };

  const removeImageField = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    setValue('images', newPreviews);
  };

  const mutation = useMutation({
    mutationFn: isEdit 
      ? (data) => productsApi.update(product.id, data)
      : (data) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products');
    },
  });

  const onSubmit = (data) => {
    const productData = {
      ...data,
      price: parseFloat(data.price),
      stock: parseInt(data.stock, 10),
      // Filter out empty image strings
      images: data.images.filter(img => img !== ''),
      // Filter out empty specifications
      specifications: data.specifications.filter(spec => spec.key.trim() !== '' && spec.value.trim() !== '')
    };
    mutation.mutate(productData);
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
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
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
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    id="category"
                    {...register('category', { required: 'Category is required' })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.category ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select a category</option>
                    <option value="power-tools">Power Tools</option>
                    <option value="hand-tools">Hand Tools</option>
                    <option value="garden-tools">Garden Tools</option>
                    <option value="safety-equipment">Safety Equipment</option>
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
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

                {/* Specifications Section */}
                <div className="col-span-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Specifications
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
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No specifications added yet. Click "Add Specification" to add one.
                      </p>
                    )}
                  </div>
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
                    <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>
                  )}
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
                  />
                  {errors.stock && (
                    <p className="mt-2 text-sm text-red-600">{errors.stock.message}</p>
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
                      placeholder="Product description..."
                    />
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    id="sku"
                    {...register('sku')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>


              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isLoading}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {mutation.isLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
