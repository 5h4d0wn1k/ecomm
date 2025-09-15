'use client'
import Image from "next/image";
import { DotIcon, RefreshCw, RotateCcw } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";
import ReturnRequestModal from "./ReturnRequestModal";
import ReturnStatus from "./ReturnStatus";
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';

const OrderItem = ({ order }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const [ratingModal, setRatingModal] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [returnModal, setReturnModal] = useState(false);
    const [replacementModal, setReplacementModal] = useState(false);

    const { ratings } = useSelector(state => state.rating);
    const { getToken } = useAuth();

    const handleCancel = async () => {
        setCancelLoading(true);
        try {
            const token = await getToken();
            await axios.post('/api/orders/cancel', { orderId: order.id }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Order cancelled successfully');
            window.location.reload();
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                    <Image
                                        className="h-14 w-auto"
                                        src={item.product.images[0]}
                                        alt="product_img"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-600 text-base">{item.product.name}</p>
                                    <p>{currency}{item.price} Qty : {item.quantity} </p>
                                    <p className="mb-1">{new Date(order.createdAt).toDateString()}</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId)
                                            ? <Rating value={ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId).rating} />
                                            : <button onClick={() => setRatingModal({ orderId: order.id, productId: item.product.id })} className={`text-green-500 hover:bg-green-50 transition ${order.status !== "DELIVERED" && 'hidden'}`}>Rate Product</button>
                                        }
                                        {(order.status === "ORDER_PLACED" || order.status === "PROCESSING") && (
                                            <button onClick={handleCancel} disabled={cancelLoading} className="text-red-500 hover:bg-red-50 transition">
                                                {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                                            </button>
                                        )}
                                        {order.status === "DELIVERED" && !order.returnRequests?.length && (
                                            <button onClick={() => setReturnModal(true)} className="text-blue-500 hover:bg-blue-50 transition flex items-center gap-1">
                                                <RotateCcw size={14} />
                                                Return
                                            </button>
                                        )}
                                        {order.status === "DELIVERED" && !order.replacements?.length && (
                                            <button onClick={() => setReplacementModal(true)} className="text-purple-500 hover:bg-purple-50 transition flex items-center gap-1">
                                                <RefreshCw size={14} />
                                                Replace
                                            </button>
                                        )}
                                    </div>
                                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                </div>
                            </div>
                        ))}

                        {/* Return Status Display */}
                        {order.returnRequests && order.returnRequests.length > 0 && (
                            <div className="mt-4">
                                <ReturnStatus returnRequest={order.returnRequests[0]} />
                            </div>
                        )}

                        {/* Replacement Status Display */}
                        {order.replacements && order.replacements.length > 0 && (
                            <div className="mt-4">
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <h4 className="font-medium text-purple-800">Replacement Request</h4>
                                    <p className="text-sm text-purple-600 mt-1">
                                        Status: {order.replacements[0].status}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </td>

                <td className="text-center max-md:hidden">{currency}{order.total}</td>

                <td className="text-left max-md:hidden">
                    <p>{order.address.name}, {order.address.street},</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country},</p>
                    <p>{order.address.phone}</p>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 ${order.status === 'confirmed'
                            ? 'text-yellow-500 bg-yellow-100'
                            : order.status === 'delivered'
                                ? 'text-green-500 bg-green-100'
                                : 'text-slate-500 bg-slate-100'
                            }`}
                    >
                        <DotIcon size={10} className="scale-250" />
                        {order.status.split('_').join(' ').toLowerCase()}
                    </div>
                </td>
            </tr>
            {/* Mobile */}
            <tr className="md:hidden">
                <td colSpan={5}>
                    <p>{order.address.name}, {order.address.street}</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country}</p>
                    <p>{order.address.phone}</p>
                    <br />
                    <div className="flex items-center">
                        <span className='text-center mx-auto px-6 py-1.5 rounded bg-green-100 text-green-700' >
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>

            {/* Modals */}
            {returnModal && (
                <ReturnRequestModal
                    isOpen={returnModal}
                    onClose={() => setReturnModal(false)}
                    order={order}
                />
            )}

            {/* Placeholder for replacement modal - would need to create a similar component */}
            {replacementModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Request Replacement</h3>
                        <p className="text-gray-600 mb-4">
                            Replacement functionality will be implemented in the next update.
                        </p>
                        <button
                            onClick={() => setReplacementModal(false)}
                            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default OrderItem