'use client'
import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import toast from 'react-hot-toast';
import Image from 'next/image';

const ReturnRequestModal = ({ isOpen, onClose, order }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const { getToken } = useAuth();

    const returnReasons = [
        'Defective product',
        'Wrong item received',
        'Damaged during shipping',
        'Not as described',
        'Changed mind',
        'Size/fit issue',
        'Quality not satisfactory',
        'Other'
    ];

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxFiles = 5;
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (images.length + files.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} images allowed`);
            return;
        }

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                toast.error(`${file.name} is too large. Max size is 5MB`);
                return false;
            }
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not a valid image file`);
                return false;
            }
            return true;
        });

        // For demo purposes, we'll just store the file names
        // In a real app, you'd upload to a cloud storage service
        const newImages = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
        setImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason) {
            toast.error('Please select a reason for return');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();

            // Upload images first
            const imageUrls = [];
            for (const image of images) {
                const formData = new FormData();
                formData.append('file', image.file);

                const uploadResponse = await axios.post('/api/upload', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                imageUrls.push(uploadResponse.data.imageUrl);
            }

            const response = await axios.post('/api/returns', {
                orderId: order.id,
                reason,
                description,
                images: imageUrls
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Return request submitted successfully');
            onClose();
            window.location.reload(); // Refresh to show updated status

        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to submit return request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">Request Return</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Order Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Order Details</h3>
                        <p className="text-sm text-gray-600">Order ID: {order.id}</p>
                        <p className="text-sm text-gray-600">
                            Total: ${order.total}
                        </p>
                        <p className="text-sm text-gray-600">
                            Delivered: {new Date(order.deliveredAt || order.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Return Reason */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Reason for Return *
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select a reason</option>
                            {returnReasons.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Additional Details
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide more details about the issue..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Upload Images (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <div className="text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4">
                                    <label htmlFor="image-upload" className="cursor-pointer">
                                        <span className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500">
                                            Upload images
                                        </span>
                                    </label>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    PNG, JPG up to 5MB each, max 5 images
                                </p>
                            </div>
                        </div>

                        {/* Image Preview */}
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <Image
                                            src={image.preview}
                                            alt={image.name}
                                            width={200}
                                            height={96}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Return Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnRequestModal;