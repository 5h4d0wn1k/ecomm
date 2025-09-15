'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useUser, useAuth } from "@clerk/nextjs";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";
import { useAsyncErrorHandler } from "@/lib/hooks/useErrorHandler";

export default function PublicLayout({ children }) {

    const dispatch = useDispatch()
    const {user} = useUser()
    const {getToken} = useAuth()

    const {cartItems} = useSelector((state)=>state.cart)

    // Error handling for products fetch
    const {
        execute: fetchProductsExecute,
        error: productsError,
        isLoading: productsLoading,
        retry: retryProducts
    } = useAsyncErrorHandler(
        () => dispatch(fetchProducts({})),
        { context: 'PublicLayout - Fetch Products' }
    );

    // Error handling for cart fetch
    const {
        execute: fetchCartExecute,
        error: cartError,
        retry: retryCart
    } = useAsyncErrorHandler(
        () => dispatch(fetchCart({getToken})),
        { context: 'PublicLayout - Fetch Cart' }
    );

    // Error handling for address fetch
    const {
        execute: fetchAddressExecute,
        error: addressError,
        retry: retryAddress
    } = useAsyncErrorHandler(
        () => dispatch(fetchAddress({getToken})),
        { context: 'PublicLayout - Fetch Address' }
    );

    // Error handling for ratings fetch
    const {
        execute: fetchRatingsExecute,
        error: ratingsError,
        retry: retryRatings
    } = useAsyncErrorHandler(
        () => dispatch(fetchUserRatings({getToken})),
        { context: 'PublicLayout - Fetch Ratings' }
    );

    useEffect(()=>{
        fetchProductsExecute();
    },[fetchProductsExecute])

    useEffect(()=>{
        if(user){
            fetchCartExecute();
            fetchAddressExecute();
            fetchRatingsExecute();
        }
    },[user, fetchCartExecute, fetchAddressExecute, fetchRatingsExecute])

    useEffect(()=>{
        if(user){
            dispatch(uploadCart({getToken}))
        }
    },[cartItems, user, dispatch, getToken])

    // Load Razorpay SDK
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [])




    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />

            {/* Error displays for background operations */}
            {productsError && (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm">
                    <ErrorDisplay
                        error={productsError}
                        onRetry={retryProducts}
                        isRetrying={productsLoading}
                        title="Failed to load products"
                        message="Unable to fetch the latest products. Some features may not work properly."
                    />
                </div>
            )}

            {cartError && (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm mt-16">
                    <ErrorDisplay
                        error={cartError}
                        onRetry={retryCart}
                        title="Failed to load cart"
                        message="Unable to sync your cart. Please try again."
                    />
                </div>
            )}

            {addressError && (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm mt-32">
                    <ErrorDisplay
                        error={addressError}
                        onRetry={retryAddress}
                        title="Failed to load addresses"
                        message="Unable to load your saved addresses."
                    />
                </div>
            )}

            {ratingsError && (
                <div className="fixed bottom-4 right-4 z-50 max-w-sm mt-48">
                    <ErrorDisplay
                        error={ratingsError}
                        onRetry={retryRatings}
                        title="Failed to load ratings"
                        message="Unable to load your product ratings."
                    />
                </div>
            )}
        </>
    );
}
