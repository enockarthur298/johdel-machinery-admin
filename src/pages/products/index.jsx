import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductsList from './ProductsList';
import ProductDetail from './ProductDetail';
import ProductForm from '../../components/products/ProductForm';

const Products = () => {
  return (
    <Routes>
      <Route index element={<ProductsList />} />
      <Route path="new" element={<ProductForm />} />
      <Route path=":id" element={<ProductDetail />} />
      <Route path=":id/edit" element={<ProductForm />} />
    </Routes>
  );
};

export default Products;
