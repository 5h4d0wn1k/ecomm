import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import errorLogger from "@/lib/errorLogger";

export async function GET(request){
    try {
        let products = await prisma.product.findMany({
            where: {inStock: true },
            include: {
                rating: {
                    select: {
                        createdAt: true, rating: true, review: true,
                        user: {select: {name: true, image: true}}
                    }
                },
                store: true,
            },
            orderBy: {createdAt: 'desc'}
        })

        // remove products with store isActive false
        products = products.filter(product => product.store.isActive)
        return NextResponse.json({products})
    } catch (error) {
        // Log error with context
        errorLogger.logError(error, {
            endpoint: '/api/products',
            method: 'GET',
            context: 'API Route - Fetch Products',
        });

        // Return user-friendly error message
        return NextResponse.json({
            error: "Unable to fetch products at this time. Please try again later.",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}