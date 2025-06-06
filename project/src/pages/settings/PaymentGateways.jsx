import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../services/api';
import { 
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schemas for each payment method
const paymentMethodSchemas = {
  stripe: yup.object({
    publishableKey: yup.string().required('Publishable key is required'),
    secretKey: yup.string().required('Secret key is required'),
    webhookSecret: yup.string().required('Webhook secret is required'),
    testMode: yup.boolean().default(true)
  }),
  paypal: yup.object({
    clientId: yup.string().required('Client ID is required'),
    clientSecret: yup.string().required('Client secret is required'),
    environment: yup.string().oneOf(['sandbox', 'production']).default('sandbox')
  }),
  bank_transfer: yup.object({
    accountName: yup.string().when('enabled', {
      is: true,
      then: schema => schema.required('Account name is required')
    }),
    accountNumber: yup.string().when('enabled', {
      is: true,
      then: schema => schema.required('Account number is required')
    }),
    bankName: yup.string().when('enabled', {
      is: true,
      then: schema => schema.required('Bank name is required')
    }),
    instructions: yup.string()
  }),
  cod: yup.object({
    instructions: yup.string()
  })
};

const paymentMethods = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Credit & Debit Cards',
    icon: CreditCardIcon,
    enabled: false,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with PayPal',
    icon: BanknotesIcon,
    enabled: false,
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: BanknotesIcon,
    enabled: true,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: BanknotesIcon,
    enabled: true,
  },
];

const PaymentGateways = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('stripe');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  // Fetch payment gateway settings
  const { data: settings, isLoading, isError } = useQuery(
    ['settings', 'payment-gateways'],
    () => settingsApi.getPaymentGateways().then(res => res.data),
    {
      onSuccess: (data) => {
        // Initialize with default values if no settings exist
        if (!data) {
          const defaultSettings = paymentMethods.reduce((acc, method) => ({
            ...acc,
            [method.id]: {
              enabled: method.enabled,
              ...method.config
            }
          }), {});
          reset({ paymentMethods: defaultSettings });
        } else {
          reset({ paymentMethods: data });
        }
      },
      refetchOnWindowFocus: false
    }
  );

  const currentMethod = paymentMethods.find(method => method.id === activeTab) || paymentMethods[0];
  const currentSchema = paymentMethodSchemas[currentMethod.id] || yup.object();
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    reset,
    formState: { errors, isDirty, dirtyFields } 
  } = useForm({
    resolver: yupResolver(yup.object({
      paymentMethods: yup.object().shape({
        [currentMethod.id]: currentSchema
      })
    })),
    defaultValues: {
      paymentMethods: {}
    }
  });

  const isEnabled = watch(`paymentMethods.${currentMethod.id}.enabled`) ?? currentMethod.enabled;
  const testMode = watch(`paymentMethods.${currentMethod.id}.testMode`) ?? true;

  // Update settings mutation
  const updateSettings = useMutation(
    (data) => settingsApi.updatePaymentGateways(data.paymentMethods),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['settings', 'payment-gateways']);
        setSaveStatus({ success: true, message: 'Payment settings saved successfully!' });
      },
      onError: (error) => {
        setSaveStatus({ 
          success: false, 
          message: error.response?.data?.message || 'Failed to save payment settings' 
        });
      },
      onSettled: () => {
        setIsSaving(false);
        setTimeout(() => setSaveStatus({ success: null, message: '' }), 5000);
      }
    }
  );

  // Test connection mutation
  const testConnection = useMutation(
    () => {
      const methodData = watch(`paymentMethods.${currentMethod.id}`);
      return settingsApi.testPaymentGateway(currentMethod.id, {
        ...methodData,
        testMode: testMode
      });
    },
    {
      onMutate: () => {
        setIsTesting(true);
        setTestResult(null);
      },
      onSuccess: (response) => {
        setTestResult({
          success: true,
          message: response.data?.message || 'Connection test successful!'
        });
      },
      onError: (error) => {
        setTestResult({
          success: false,
          message: error.response?.data?.message || 'Connection test failed. Please check your settings.'
        });
      },
      onSettled: () => {
        setIsTesting(false);
      }
    }
  );

  const togglePaymentMethod = (methodId, enabled) => {
    setValue(`paymentMethods.${methodId}.enabled`, !enabled, { shouldDirty: true });
  };

  const onSubmit = (data) => {
    setIsSaving(true);
    updateSettings.mutate(data);
  };

  const handleTestConnection = () => {
    handleSubmit((data) => {
      testConnection.mutate();
    })();
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
              Error loading payment settings. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg leading-6 font-medium text-gray-900">Payment Gateways</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configure how you'll accept payments from your customers.
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Payment Methods
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Enable or disable payment methods and configure their settings.
            </p>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {paymentMethods.map((method) => {
                const isActive = activeTab === method.id;
                const isMethodEnabled = watch(`paymentMethods.${method.id}.enabled`) ?? method.enabled;
                
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setActiveTab(method.id)}
                    className={`${
                      isActive
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        isMethodEnabled ? 'bg-green-400' : 'bg-gray-300'
                      }`}></span>
                      {method.name}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{currentMethod.name}</h4>
                <p className="mt-1 text-sm text-gray-500">
                  {currentMethod.description}
                </p>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => togglePaymentMethod(currentMethod.id, isEnabled)}
                  className={`${
                    isEnabled
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium`}
                >
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            <div className="mt-6">
              {currentMethod.id === 'stripe' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Stripe Settings</h5>
                    <p className="mt-1 text-sm text-gray-500">
                      Accept payments using credit and debit cards with Stripe.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="stripe-publishable-key" className="block text-sm font-medium text-gray-700">
                        Publishable Key
                      </label>
                      <input
                        type="text"
                        id="stripe-publishable-key"
                        {...register(`paymentMethods.${currentMethod.id}.publishableKey`)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="pk_test_..."
                        disabled={!isEnabled}
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="stripe-secret-key" className="block text-sm font-medium text-gray-700">
                        Secret Key
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="password"
                          id="stripe-secret-key"
                          {...register(`paymentMethods.${currentMethod.id}.secretKey`)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10"
                          placeholder="sk_test_..."
                          disabled={!isEnabled}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentMethod.id === 'paypal' && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">PayPal Settings</h5>
                    <p className="mt-1 text-sm text-gray-500">
                      Accept payments via PayPal.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="paypal-client-id" className="block text-sm font-medium text-gray-700">
                        Client ID
                      </label>
                      <input
                        type="text"
                        id="paypal-client-id"
                        {...register(`paymentMethods.${currentMethod.id}.clientId`)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Client ID"
                        disabled={!isEnabled}
                      />
                    </div>
                  </div>
                </div>
              )}

              {['bank_transfer', 'cod'].includes(currentMethod.id) && (
                <div className="text-sm text-gray-500">
                  No additional configuration needed for {currentMethod.name}.
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentGateways;
