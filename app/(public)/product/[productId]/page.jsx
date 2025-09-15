'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const products = useSelector(state => state.product.list);

    const fetchProduct = useCallback(async () => {
        const product = products.find((product) => product.id === productId);
        setProduct(product);
    }, [productId, products]);

    useEffect(() => {
        if (products.length > 0) {
            fetchProduct()
        }
        scrollTo(0, 0)
    }, [productId, products, fetchProduct]);

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                {product && (<ProductDetails product={product} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}