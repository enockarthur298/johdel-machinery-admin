import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../services/api';
import { 
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/20/solid';

const roleBadges = {
  admin: 'bg-purple-100 text-purple-800',
  editor: 'bg-blue-100 text-blue-800',
  customer: 'bg-gray-100 text-gray-800',
  vendor: 'bg-green-100 text-green-800',
};

const statusStyles = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users', { search: searchTerm, ...filters }],
    queryFn: () => usersApi.getAll({ search: searchTerm, ...filters }).then(res => res.data)
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            Error loading users: {error.message}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your account including their name, email and role.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/users/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add user
          </Link>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="relative rounded-md shadow-sm w-full max-w-xs mb-4 sm:mb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      User
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Active
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.avatar ? (
                              <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                            ) : (
                              <UserCircleIcon className="h-10 w-10 text-gray-300" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadges[user.role] || 'bg-gray-100 text-gray-800'}`}>
                          {user.role === 'admin' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                          {user.role === 'editor' && <PencilIcon className="h-3 w-3 mr-1" />}
                          {user.role === 'customer' && <UserIcon className="h-3 w-3 mr-1" />}
                          {user.role === 'vendor' && <UserIcon className="h-3 w-3 mr-1" />}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[user.status] || 'bg-gray-100 text-gray-800'}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link to={`/users/${user.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          Edit<span className="sr-only">, {user.name}</span>
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          Delete<span className="sr-only">, {user.name}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No users found matching your criteria.
                </div>
              )}
              
              {/* Pagination would go here */}
              <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6" aria-label="Pagination">
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                    <span className="font-medium">20</span> results
                  </p>
                </div>
                <div className="flex flex-1 justify-between sm:justify-end">
                  <button
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled
                  >
                    Previous
                  </button>
                  <button
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
