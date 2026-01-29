'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { trpc } from '@/lib/trpc/client';

interface PaymentFormData {
    bank_name: string;
    bank_account_number: string;
    bank_account_holder: string;
    bank_branch: string;
    pay_later_enabled: boolean;
    pay_later_mode: 'auto_confirm' | 'pending_approval';
}

/**
 * Settings Payments Tab
 * Story 2.8.7: Bank details and pay later configuration
 */
export function SettingsPaymentsTab() {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const { data: settings, isLoading, error } = trpc.admin.getSettings.useQuery();
    const utils = trpc.useUtils();

    const updateSettings = trpc.admin.updateSettings.useMutation({
        onMutate: () => setSaveStatus('saving'),
        onSuccess: () => {
            setSaveStatus('saved');
            utils.admin.getSettings.invalidate();
            setTimeout(() => setSaveStatus('idle'), 2000);
        },
        onError: () => setSaveStatus('error'),
    });

    const { register, handleSubmit, reset, formState: { isDirty } } = useForm<PaymentFormData>({
        defaultValues: {
            bank_name: '',
            bank_account_number: '',
            bank_account_holder: '',
            bank_branch: '',
            pay_later_enabled: true,
            pay_later_mode: 'pending_approval',
        },
    });

    // Reset form when settings load
    useEffect(() => {
        if (settings) {
            reset({
                bank_name: settings.bank_name || '',
                bank_account_number: settings.bank_account_number || '',
                bank_account_holder: settings.bank_account_holder || '',
                bank_branch: settings.bank_branch || '',
                pay_later_enabled: settings.pay_later_enabled ?? true,
                pay_later_mode: (settings.pay_later_mode as 'auto_confirm' | 'pending_approval') || 'pending_approval',
            });
        }
    }, [settings, reset]);

    const onSubmit = (data: PaymentFormData) => {
        updateSettings.mutate({
            bank_name: data.bank_name || null,
            bank_account_number: data.bank_account_number || null,
            bank_account_holder: data.bank_account_holder || null,
            bank_branch: data.bank_branch || null,
            pay_later_enabled: data.pay_later_enabled,
            pay_later_mode: data.pay_later_mode,
        });
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse bg-gray-100 h-64 rounded-lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    Failed to load settings: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Bank Details Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Bank Details</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Bank account for receiving payments (displayed to clients for Pay Later)
                    </p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Bank Name
                                </label>
                                <input
                                    id="bank_name"
                                    type="text"
                                    {...register('bank_name')}
                                    placeholder="e.g., Bank of Ceylon"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="bank_branch" className="block text-sm font-medium text-gray-700 mb-1">
                                    Branch
                                </label>
                                <input
                                    id="bank_branch"
                                    type="text"
                                    {...register('bank_branch')}
                                    placeholder="e.g., Colombo 7"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="bank_account_holder" className="block text-sm font-medium text-gray-700 mb-1">
                                Account Holder Name
                            </label>
                            <input
                                id="bank_account_holder"
                                type="text"
                                {...register('bank_account_holder')}
                                placeholder="e.g., Wellness Center Pvt Ltd"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700 mb-1">
                                Account Number
                            </label>
                            <input
                                id="bank_account_number"
                                type="text"
                                {...register('bank_account_number')}
                                placeholder="e.g., 001234567890"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Pay Later Configuration */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Pay Later Settings</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Configure how Pay Later bookings are handled
                    </p>

                    <div className="space-y-4">
                        {/* Enable/Disable Pay Later */}
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-gray-900">Enable Pay Later</p>
                                <p className="text-sm text-gray-500">
                                    Allow clients to book without immediate payment
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('pay_later_enabled')}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                        </div>

                        {/* Pay Later Mode */}
                        <div className="border-t pt-4">
                            <p className="font-medium text-gray-900 mb-2">Approval Mode</p>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="pending_approval"
                                        {...register('pay_later_mode')}
                                        className="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">Require Approval</p>
                                        <p className="text-sm text-gray-500">
                                            Pay Later bookings stay pending until you manually approve them
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="auto_confirm"
                                        {...register('pay_later_mode')}
                                        className="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">Auto-Confirm</p>
                                        <p className="text-sm text-gray-500">
                                            Pay Later bookings are automatically confirmed without approval
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Status Indicator */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-blue-900">Online Payments</p>
                            <p className="text-sm text-blue-700">
                                Online card payments via PayHere will be available after Epic 10 is complete.
                                Currently, only Pay Later booking mode is supported.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-4">
                    <div>
                        {saveStatus === 'saved' && (
                            <span className="text-green-600 text-sm">Settings saved successfully</span>
                        )}
                        {saveStatus === 'error' && (
                            <span className="text-red-600 text-sm">Failed to save settings</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!isDirty || saveStatus === 'saving'}
                        className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
