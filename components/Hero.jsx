'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-white rounded-3xl xl:min-h-100 group shadow-lg'>
                    <div className='p-5 sm:p-16'>
                        <div className='inline-flex items-center gap-3 bg-gray-100 text-red-700 pr-4 p-1 rounded-full text-xs sm:text-sm'>
                            <span className='bg-red-700 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>NEWS</span> Free Shipping on Orders Above {currency}50! <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                        </div>
                        <h2 className='text-4xl sm:text-6xl leading-[1.2] my-3 font-bold bg-gradient-to-r from-slate-600 to-red-700 bg-clip-text text-transparent max-w-xs  sm:max-w-md'>
                            Fashion you&apos;ll love. Styles you&apos;ll trust.
                        </h2>
                        <div className='text-slate-800 text-sm font-semibold mt-4 sm:mt-8'>
                            <p>Starts from</p>
                            <p className='text-3xl'>{currency}19.99</p>
                        </div>
                        <button className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 hover:shadow-lg active:scale-95 transition shadow-md'>LEARN MORE</button>
                    </div>
                    <Image className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm' src={assets.hero_model_img} alt="" />
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <div className='flex-1 flex items-center justify-between w-full bg-white rounded-3xl p-6 px-8 group shadow-lg hover:shadow-xl transition-shadow'>
                        <div>
                            <p className='text-4xl font-bold bg-gradient-to-r from-slate-800 to-red-900 bg-clip-text text-transparent max-w-40'>Latest Trends</p>
                            <p className='flex items-center gap-1 mt-4'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <Image className='w-35' src={assets.hero_product_img1} alt="" />
                    </div>
                    <div className='flex-1 flex items-center justify-between w-full bg-white rounded-3xl p-6 px-8 group shadow-lg hover:shadow-xl transition-shadow'>
                        <div>
                            <p className='text-4xl font-bold bg-gradient-to-r from-slate-800 to-red-900 bg-clip-text text-transparent max-w-40'>Exclusive Deals</p>
                            <p className='flex items-center gap-1 mt-4'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <Image className='w-35' src={assets.hero_product_img2} alt="" />
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero