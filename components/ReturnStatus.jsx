'use client'
import { CheckCircle, XCircle, Clock, AlertCircle, Package } from 'lucide-react';
import Image from 'next/image';

const ReturnStatus = ({ returnRequest }) => {
    if (!returnRequest) return null;

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    icon: Clock,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    text: 'Return Request Pending',
                    description: 'Your return request is being reviewed by the seller.'
                };
            case 'APPROVED':
                return {
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    text: 'Return Approved',
                    description: 'Your return has been approved. Please return the item as instructed.'
                };
            case 'REJECTED':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    text: 'Return Rejected',
                    description: 'Your return request has been rejected. Contact seller for more details.'
                };
            case 'PROCESSED':
                return {
                    icon: Package,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    text: 'Return Processed',
                    description: 'Your return has been processed. Refund will be initiated soon.'
                };
            default:
                return {
                    icon: AlertCircle,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    text: 'Unknown Status',
                    description: 'Status information not available.'
                };
        }
    };

    const config = getStatusConfig(returnRequest.status);
    const Icon = config.icon;

    return (
        <div className={`p-4 rounded-lg ${config.bgColor} border`}>
            <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                <div className="flex-1">
                    <h3 className={`font-medium ${config.color}`}>
                        {config.text}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {config.description}
                    </p>

                    {/* Return Details */}
                    <div className="mt-3 space-y-2 text-sm">
                        <div>
                            <span className="font-medium">Reason:</span> {returnRequest.reason}
                        </div>
                        {returnRequest.description && (
                            <div>
                                <span className="font-medium">Details:</span> {returnRequest.description}
                            </div>
                        )}
                        <div>
                            <span className="font-medium">Requested:</span>{' '}
                            {new Date(returnRequest.createdAt).toLocaleDateString()}
                        </div>
                        {returnRequest.updatedAt !== returnRequest.createdAt && (
                            <div>
                                <span className="font-medium">Last Updated:</span>{' '}
                                {new Date(returnRequest.updatedAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>

                    {/* Images */}
                    {returnRequest.images && returnRequest.images.length > 0 && (
                        <div className="mt-3">
                            <span className="font-medium text-sm">Return Images:</span>
                            <div className="flex space-x-2 mt-2">
                                {returnRequest.images.map((image, index) => (
                                    <Image
                                        key={index}
                                        src={image}
                                        alt={`Return image ${index + 1}`}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 object-cover rounded border"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status-specific actions or information */}
                    {returnRequest.status === 'APPROVED' && (
                        <div className="mt-3 p-3 bg-white rounded border">
                            <h4 className="font-medium text-sm mb-2">Next Steps:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Package the item securely</li>
                                <li>• Include the return label if provided</li>
                                <li>• Ship to the address provided by the seller</li>
                                <li>• Keep tracking information for your records</li>
                            </ul>
                        </div>
                    )}

                    {returnRequest.status === 'REJECTED' && (
                        <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm text-gray-600">
                                If you disagree with this decision, you can contact customer support
                                or try a different resolution method.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReturnStatus;