import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OrdersList from './OrdersList';
import OrderDetail from './OrderDetail';

const Orders = () => {
  return (
    <Routes>
      <Route index element={<OrdersList />} />
      <Route path=":id" element={<OrderDetail />} />
    </Routes>
  );
};

export default Orders;
