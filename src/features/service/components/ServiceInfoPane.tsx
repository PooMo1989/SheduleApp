'use client';

import { Calendar, MapPin, Users, Clock } from 'lucide-react';

interface ServiceInfoPaneProps {
    onCreateNew: () => void;
    hasServices: boolean;
}

/**
 * Service Info Pane
 * Shows when no service is being created/edited
 * Provides context about what services are
 */
export function ServiceInfoPane({ onCreateNew, hasServices }: ServiceInfoPaneProps) {
    return (
        <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-2xl">
                {!hasServices ? (
                    /* Empty state - First time */
                    <div className="text-center">
                        <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-teal-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Create your first service</h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                            Services are what you offer to your clients - consultations, classes, appointments, or sessions.
                            Define what you provide, set your availability, and let clients book with ease.
                        </p>

                        <button
                            onClick={onCreateNew}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20"
                        >
                            <Calendar className="w-5 h-5" />
                            Create Your First Service
                        </button>

                        {/* Features Grid */}
                        <div className="mt-16 grid grid-cols-2 gap-6 text-left">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Set Duration & Pricing</h3>
                                    <p className="text-sm text-gray-600">Define how long each session lasts and what it costs</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Assign Providers</h3>
                                    <p className="text-sm text-gray-600">Choose who can deliver this service</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Manage Availability</h3>
                                    <p className="text-sm text-gray-600">Control when clients can book appointments</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Location Options</h3>
                                    <p className="text-sm text-gray-600">Offer in-person, virtual, or both options</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Has services - Selection prompt */
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Services</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Select a service from the list to view details and edit settings, or create a new service to expand your offerings.
                        </p>

                        <button
                            onClick={onCreateNew}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
                        >
                            <Calendar className="w-5 h-5" />
                            Create New Service
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
