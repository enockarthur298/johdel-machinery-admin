import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../services/api';
import { 
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const GeneralSettings = () => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ success: null, message: '' });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  // Fetch current settings
  const { data: settings, isLoading, isError } = useQuery(
    ['settings', 'general'],
    () => settingsApi.getGeneral(),
    {
      onSuccess: (data) => {
        if (data) {
          reset(data);
        }
      },
      refetchOnWindowFocus: false
    }
  );

  const updateSettings = useMutation(
    (data) => settingsApi.updateGeneral(data),
    {
      onSuccess: () => {
        setSaveStatus({ success: true, message: 'Settings saved successfully!' });
        queryClient.invalidateQueries(['settings', 'general']);
      },
      onError: (error) => {
        setSaveStatus({ 
          success: false, 
          message: error.response?.data?.message || 'Failed to save settings' 
        });
      },
      onSettled: () => {
        setIsSaving(false);
        // Clear status after 5 seconds
        setTimeout(() => setSaveStatus({ success: null, message: '' }), 5000);
      }
    }
  );

  const onSubmit = (data) => {
    setIsSaving(true);
    updateSettings.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading settings. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg leading-6 font-medium text-gray-900">General Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your store's general settings and preferences.
        </p>
      </div>

      {saveStatus.message && (
        <div className={`rounded-md p-4 ${
          saveStatus.success ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {saveStatus.success ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                saveStatus.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {saveStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Store Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about your store that will be used across the platform.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                  Store Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="storeName"
                    {...register('storeName', { required: 'Store name is required' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.storeName ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.storeName && (
                    <p className="mt-2 text-sm text-red-600">{errors.storeName.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700">
                  Contact Email *
                </label>
                <div className="mt-1">
                  <input
                    id="storeEmail"
                    type="email"
                    {...register('storeEmail', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.storeEmail ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.storeEmail && (
                    <p className="mt-2 text-sm text-red-600">{errors.storeEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="storePhone"
                    {...register('storePhone')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700">
                  Store Address
                </label>
                <div className="mt-1">
                  <textarea
                    id="storeAddress"
                    rows={3}
                    {...register('storeAddress')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    defaultValue={''}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Localization</h3>
              <p className="mt-1 text-sm text-gray-500">
                Set your store's timezone, currency, and other localization settings.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Timezone *
                </label>
                <div className="mt-1">
                  <select
                    id="timezone"
                    {...register('timezone', { required: 'Timezone is required' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.timezone ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select a timezone</option>
                    <option value="UTC-12:00">(UTC-12:00) International Date Line West</option>
                    <option value="UTC-11:00">(UTC-11:00) Midway Island, Samoa</option>
                    <option value="UTC-10:00">(UTC-10:00) Hawaii</option>
                    <option value="UTC-09:00">(UTC-09:00) Alaska</option>
                    <option value="UTC-08:00">(UTC-08:00) Pacific Time (US & Canada)</option>
                    <option value="UTC-07:00">(UTC-07:00) Mountain Time (US & Canada)</option>
                    <option value="UTC-06:00">(UTC-06:00) Central Time (US & Canada)</option>
                    <option value="UTC-05:00">(UTC-05:00) Eastern Time (US & Canada)</option>
                    <option value="UTC-04:30">(UTC-04:30) Caracas</option>
                    <option value="UTC-04:00">(UTC-04:00) Atlantic Time (Canada)</option>
                    <option value="UTC-03:30">(UTC-03:30) Newfoundland</option>
                    <option value="UTC-03:00">(UTC-03:00) Brasilia</option>
                    <option value="UTC-02:00">(UTC-02:00) Mid-Atlantic</option>
                    <option value="UTC-01:00">(UTC-01:00) Cape Verde Is.</option>
                    <option value="UTC">(UTC) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London</option>
                    <option value="UTC+01:00">(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna</option>
                    <option value="UTC+02:00">(UTC+02:00) Athens, Bucharest, Istanbul</option>
                    <option value="UTC+03:00">(UTC+03:00) Moscow, St. Petersburg, Volgograd</option>
                    <option value="UTC+03:30">(UTC+03:30) Tehran</option>
                    <option value="UTC+04:00">(UTC+04:00) Abu Dhabi, Muscat</option>
                    <option value="UTC+04:30">(UTC+04:30) Kabul</option>
                    <option value="UTC+05:00">(UTC+05:00) Islamabad, Karachi, Tashkent</option>
                    <option value="UTC+05:30">(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                    <option value="UTC+05:45">(UTC+05:45) Kathmandu</option>
                    <option value="UTC+06:00">(UTC+06:00) Astana, Dhaka</option>
                    <option value="UTC+06:30">(UTC+06:30) Yangon (Rangoon)</option>
                    <option value="UTC+07:00">(UTC+07:00) Bangkok, Hanoi, Jakarta</option>
                    <option value="UTC+08:00">(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi</option>
                    <option value="UTC+09:00">(UTC+09:00) Osaka, Sapporo, Tokyo</option>
                    <option value="UTC+09:30">(UTC+09:30) Darwin</option>
                    <option value="UTC+10:00">(UTC+10:00) Brisbane</option>
                    <option value="UTC+10:30">(UTC+10:30) Adelaide</option>
                    <option value="UTC+11:00">(UTC+11:00) Canberra, Melbourne, Sydney</option>
                    <option value="UTC+12:00">(UTC+12:00) Auckland, Wellington</option>
                    <option value="UTC+13:00">(UTC+13:00) Nuku'alofa</option>
                  </select>
                  {errors.timezone && (
                    <p className="mt-2 text-sm text-red-600">{errors.timezone.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                  Date Format *
                </label>
                <div className="mt-1">
                  <select
                    id="dateFormat"
                    {...register('dateFormat', { required: 'Date format is required' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.dateFormat ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</option>
                    <option value="MMMM D, YYYY">MMMM D, YYYY (December 31, 2023)</option>
                    <option value="D MMMM YYYY">D MMMM YYYY (31 December 2023)</option>
                  </select>
                  {errors.dateFormat && (
                    <p className="mt-2 text-sm text-red-600">{errors.dateFormat.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
                  Time Format *
                </label>
                <div className="mt-1">
                  <select
                    id="timeFormat"
                    {...register('timeFormat', { required: 'Time format is required' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.timeFormat ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="h:mm A">12-hour (2:30 PM)</option>
                    <option value="HH:mm">24-hour (14:30)</option>
                  </select>
                  {errors.timeFormat && (
                    <p className="mt-2 text-sm text-red-600">{errors.timeFormat.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency *
                </label>
                <div className="mt-1">
                  <select
                    id="currency"
                    {...register('currency', { required: 'Currency is required' })}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.currency ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="JPY">Japanese Yen (JPY)</option>
                    <option value="CNY">Chinese Yuan (CNY)</option>
                    <option value="INR">Indian Rupee (INR)</option>
                    <option value="AUD">Australian Dollar (AUD)</option>
                    <option value="CAD">Canadian Dollar (CAD)</option>
                    <option value="SGD">Singapore Dollar (SGD)</option>
                    <option value="MYR">Malaysian Ringgit (MYR)</option>
                  </select>
                  {errors.currency && (
                    <p className="mt-2 text-sm text-red-600">{errors.currency.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Maintenance Mode</h3>
              <p className="mt-1 text-sm text-gray-500">
                Take your store offline for maintenance.
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="maintenanceMode"
                    type="checkbox"
                    {...register('maintenanceMode')}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
                    Enable Maintenance Mode
                  </label>
                  <p className="text-gray-500">
                    When enabled, only administrators will be able to access the store.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700">
                  Maintenance Message
                </label>
                <div className="mt-1">
                  <textarea
                    id="maintenanceMessage"
                    rows={3}
                    {...register('maintenanceMessage')}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="We'll be back soon!"
                    defaultValue={''}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  This message will be displayed to visitors when maintenance mode is enabled.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => reset(settings)}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;
