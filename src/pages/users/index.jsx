import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UsersList from './UsersList';
import UserForm from './UserForm';

const Users = () => {
  return (
    <Routes>
      <Route index element={<UsersList />} />
      <Route path="new" element={<UserForm />} />
      <Route path=":id/edit" element={<UserForm />} />
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
};

export default Users;
