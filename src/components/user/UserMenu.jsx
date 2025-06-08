import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();

  const userNavigation = [
    { name: 'Your Profile', href: '/profile', icon: UserCircleIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    { name: 'Sign out', href: '#', icon: ArrowLeftOnRectangleIcon, onClick: logout },
  ];

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span className="ml-3 hidden text-sm font-medium text-gray-700 md:block">
            <span className="sr-only">User menu for </span>
            {user?.name || 'Admin'}
          </span>
          <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-500" aria-hidden="true" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {userNavigation.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={classNames(
                    active ? 'bg-gray-100' : '',
                    'block px-4 py-2 text-sm text-gray-700',
                    'flex items-center'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                  {item.name}
                </a>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
