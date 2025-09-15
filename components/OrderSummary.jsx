import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {Protect, useAuth, useUser} from '@clerk/nextjs'
import axios from 'axios';
import { fetchCart } from '@/lib/features/cart/cartSlice';
import { getCSRFToken } from '@/lib/csrfClient';

const OrderSummary = ({ totalPrice, items }) => {

    const {user} = useUser()
    const { getToken } = useAuth()
    const dispatch = useDispatch()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');

    const handleCouponCode = async (event) => {
        event.preventDefault();
        try {
            if(!user){
                return toast('Please login to proceed')
            }
            const token = await getToken();
            const { data } = await axios.post('/api/coupon', {code: couponCodeInput}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-csrf-token': getCSRFToken()
                }
            })
            setCoupon(data.coupon)
            toast.success('Coupon Applied')
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        try {
            if(!user){
                return toast('Please login to place an order')
            }
            if(!selectedAddress){
                return toast('Please select an address')
            }
            const token = await getToken();

            const orderData = {
                addressId: selectedAddress.id,
                items,
                paymentMethod
            }

            if(coupon){
                orderData.couponCode = coupon.code
            }
           // create order
           const {data} = await axios.post('/api/orders', orderData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-csrf-token': getCSRFToken()
            }
           })

           if(paymentMethod === 'RAZORPAY'){
            // Initialize Razorpay checkout
            const options = {
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'GoCart',
                description: 'Order Payment',
                order_id: data.order.id,
                handler: async function (response) {
                    try {
                        // Verify payment on server
                        const token = await getToken();
                        await axios.post('/api/razorpay/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'x-csrf-token': getCSRFToken()
                            }
                        });

                        toast.success('Payment successful!');
                        router.push('/orders');
                        dispatch(fetchCart({getToken}));
                    } catch (error) {
                        toast.error('Payment verification failed');
                        console.error('Payment verification error:', error);
                    }
                },
                prefill: {
                    name: user?.firstName + ' ' + user?.lastName,
                    email: user?.primaryEmailAddress?.emailAddress,
                    contact: selectedAddress?.phone
                },
                theme: {
                    color: '#374151'
                },
                modal: {
                    ondismiss: function() {
                        toast.error('Payment cancelled');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
           }else{
            toast.success(data.message)
            router.push('/orders')
            dispatch(fetchCart({getToken}))
           }

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }

        
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>COD</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="RAZORPAY" name='payment' onChange={() => setPaymentMethod('RAZORPAY')} checked={paymentMethod === 'RAZORPAY'} className='accent-gray-500' />
                <label htmlFor="RAZORPAY" className='cursor-pointer'>Razorpay Payment</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p><Protect plan={'plus'} fallback={`${currency}5`}>Free</Protect></p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>
                    <Protect plan={'plus'} fallback={`${currency}${coupon ? (totalPrice + 5 - (coupon.discount / 100 * totalPrice)).toFixed(2) : (totalPrice + 5).toLocaleString()}`}>  
                    {currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) : totalPrice.toLocaleString()}
                    </Protect>
                    </p>
            </div>
            <button onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'placing Order...' })} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all'>Place Order</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary