import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../services/api';
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  PencilIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
];

const roleOptions = [
  { value: 'admin', label: 'Admin', icon: ShieldCheckIcon },
  { value: 'editor', label: 'Editor', icon: PencilIcon },
  { value: 'customer', label: 'Customer', icon: UserIcon },
  { value: 'vendor', label: 'Vendor', icon: UserIcon },
];

const UserForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'customer',
      status: 'active',
      password: '',
      confirmPassword: '',
    },
  });

  // Fetch user data if in edit mode
  const { data: user, isLoading, isError } = useQuery(
    ['user', id],
    () => usersApi.getById(id).then(res => res.data),
    { 
      enabled: isEditMode,
      onSuccess: (data) => {
        // Set form values when user data is loaded
        if (data) {
          Object.keys(data).forEach(key => {
            if (key in watch()) {
              setValue(key, data[key]);
            }
          });
        }
      }
    }
  );

  const createUserMutation = useMutation(
    (userData) => usersApi.create(userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        navigate('/users');
      },
    }
  );

  const updateUserMutation = useMutation(
    ({ id, userData }) => usersApi.update(id, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        queryClient.invalidateQueries(['user', id]);
        navigate('/users');
      },
    }
  );

  const onSubmit = (data) => {
    const userData = { ...data };
    
    // Remove confirmPassword before sending to the API
    delete userData.confirmPassword;
    
    // Only include password if it's being changed (edit mode) or it's a new user
    if (isEditMode && !userData.password) {
      delete userData.password;
    }

    if (isEditMode) {
      updateUserMutation.mutate({ id, userData });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  const isLoadingData = isEditMode && isLoading;
  const isSubmitting = createUserMutation.isLoading || updateUserMutation.isLoading;

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isEditMode && isError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading user. The user may not exist or you may not have permission to view it.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link 
          to="/users" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Users
        </Link>
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? 'Edit User' : 'Add New User'}
          </h1>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200 p-6">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Profile
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  This information will be displayed publicly so be careful what you share.
                </p>
              </div>

              <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label htmlFor="photo" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Photo
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <div className="flex items-center">
                      <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        <UserCircleIcon className="h-full w-full text-gray-300" />
                      </span>
                      <button
                        type="button"
                        className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Full name
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                      type="text"
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      className={`max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Email address
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className={`max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                        errors.email ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Role
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <select
                      id="role"
                      {...register('role', { required: 'Role is required' })}
                      className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                    >
                      {roleOptions.map((role) => {
                        const RoleIcon = role.icon;
                        return (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                    Status
                  </label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <select
                      id="status"
                      {...register('status')}
                      className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-6 sm:pt-10 sm:space-y-5">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isEditMode ? 'Change Password' : 'Set Password'}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {isEditMode 
                    ? 'Leave password fields blank to keep the current password.'
                    : 'Set a secure password for the new user.'}
                </p>
              </div>
              
              {!isEditMode && (
                <div className="space-y-6 sm:space-y-5">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Password
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        {...register('password', {
                          required: !isEditMode ? 'Password is required' : false,
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                        })}
                        className={`max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                          errors.password ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Confirm Password
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        {...register('confirmPassword', {
                          validate: (value) =>
                            !isEditMode && watch('password') !== value ? 'Passwords do not match' : true,
                        })}
                        className={`max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md ${
                          errors.confirmPassword ? 'border-red-300' : ''
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <Link
                to="/users"
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update User'
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
