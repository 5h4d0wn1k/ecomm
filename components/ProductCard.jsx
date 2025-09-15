'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useErrorHandler } from '@/lib/hooks/useErrorHandler'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const { handleError } = useErrorHandler({ context: 'ProductCard' });

    // Safely calculate the average rating of the product
    let rating = 0;
    try {
        if (product.rating && Array.isArray(product.rating) && product.rating.length > 0) {
            const totalRating = product.rating.reduce((acc, curr) => {
                const ratingValue = typeof curr.rating === 'number' ? curr.rating : 0;
                return acc + ratingValue;
            }, 0);
            rating = Math.round(totalRating / product.rating.length);
        }
    } catch (error) {
        handleError(error, { productId: product.id, action: 'calculateRating' });
        rating = 0; // Fallback to 0
    }

    // Safely get product image
    const productImage = product.images && product.images[0] ? product.images[0] : '/placeholder-image.png';

    return (
        <Link href={`/product/${product.id}`} className=' group max-xl:mx-auto'>
            <div className='bg-[#F5F5F5] h-40  sm:w-60 sm:h-68 rounded-lg flex items-center justify-center'>
                <Image
                    width={500}
                    height={500}
                    className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300'
                    src={productImage}
                    alt={product.name || 'Product'}
                    onError={(e) => {
                        handleError(new Error('Failed to load product image'), {
                            productId: product.id,
                            imageUrl: productImage
                        });
                        e.target.src = '/placeholder-image.png'; // Fallback image
                    }}
                />
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div>
                    <p>{product.name || 'Unnamed Product'}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p>{currency}{product.price || 'N/A'}</p>
            </div>
        </Link>
    )
}

export default ProductCard