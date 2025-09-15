import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import razorpay from "@/configs/razorpay";
import crypto from "crypto";
import { validateRequest } from "@/middlewares/validationMiddleware";
import schemas from "@/lib/validationSchemas";
import { validateCSRFForRequest, setCSRFToken } from "@/lib/csrf";


export async function POST(request){
    try {
        const { userId, has } = getAuth(request)
        if(!userId){
            return NextResponse.json({ error: "not authorized" }, { status: 401 });
        }

        // Validate CSRF token
        const csrfError = validateCSRFForRequest(request);
        if (csrfError) {
            return csrfError;
        }

        // Validate and sanitize input
        const validation = await validateRequest(schemas.order)(request);
        if (validation instanceof NextResponse) {
            return validation; // Validation failed, return error response
        }

        const { addressId, items, couponCode, paymentMethod } = validation.data;

        // Additional validation for items array structure
        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Items must be a non-empty array" }, { status: 400 });
        }

        // Validate each item has required fields
        for (const item of items) {
            if (!item.id || typeof item.quantity !== 'number' || item.quantity <= 0) {
                return NextResponse.json({ error: "Invalid item structure" }, { status: 400 });
            }
        }

        let coupon = null;

        if (couponCode) {
        coupon = await prisma.coupon.findUnique({
                    where: {code: couponCode }
                })
                if (!coupon){
            return NextResponse.json({ error: "Coupon not found" }, { status: 400 })
        }
        }
         
            // Check if coupon is applicable for new users
        if(couponCode && coupon.forNewUser){
            const userorders = await prisma.order.findMany({where: {userId}})
            if(userorders.length > 0){
                return NextResponse.json({ error: "Coupon valid for new users" }, { status: 400 })
            }
        }

        const isPlusMember = has({plan: 'plus'})

        // Check if coupon is applicable for members
        if (couponCode && coupon.forMember){
            if(!isPlusMember){
                return NextResponse.json({ error: "Coupon valid for members only" }, { status: 400 })
            }
        }

         // Group orders by storeId using a Map
         const ordersByStore = new Map()

         for(const item of items){
            const product = await prisma.product.findUnique({where: {id: item.id}})
            const storeId = product.storeId
            if(!ordersByStore.has(storeId)){
                ordersByStore.set(storeId, [])
            }
            ordersByStore.get(storeId).push({...item, price: product.price})
         }

         let orderIds = [];
         let fullAmount = 0;

         let isShippingFeeAdded = false

         // Create orders for each seller
         for(const [storeId, sellerItems] of ordersByStore.entries()){
            let total = sellerItems.reduce((acc, item)=>acc + (item.price * item.quantity), 0)

            if(couponCode){
                total -= (total * coupon.discount) / 100;
            }
            if(!isPlusMember && !isShippingFeeAdded){
                total += 5; // Shipping fee as per Shipping and Delivery Policy
                isShippingFeeAdded = true
            }

            fullAmount += parseFloat(total.toFixed(2))

            const order = await prisma.order.create({
                data: {
                    userId,
                     storeId,
                     addressId,
                     total: parseFloat(total.toFixed(2)),
                     paymentMethod,
                     isCouponUsed: coupon ? true : false,
                     coupon: coupon ? coupon : {},
                      orderItems: {
                        create: sellerItems.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price
                        }))
                      }
                }
            })
            orderIds.push(order.id)
         }

         if(paymentMethod === 'RAZORPAY'){
            const origin = await request.headers.get('origin')

            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(fullAmount * 100), // amount in paisa
                currency: 'INR',
                receipt: `receipt_${orderIds.join('_')}`,
                notes: {
                    orderIds: orderIds.join(','),
                    userId,
                    appId: 'davcreations',
                    shippingPolicy: 'Refer to /shipping-delivery for shipping details'
                }
            })

            // Update orders with razorpayOrderId
            await Promise.all(orderIds.map(async (orderId) => {
                await prisma.order.update({
                    where: { id: orderId },
                    data: { razorpayOrderId: razorpayOrder.id }
                })
            }))

            const response = NextResponse.json({
                order: razorpayOrder,
                key: process.env.RAZORPAY_KEY_ID
            });
            setCSRFToken(response);
            return response;
         }

          // clear the cart
          await prisma.user.update({
            where: {id: userId},
            data: {cart : {}}
          })

          const response = NextResponse.json({message: 'Orders Placed Successfully'});
          setCSRFToken(response);
          return response;

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}

// Get all orders for a user
export async function GET(request){
    try {
        const { userId } = getAuth(request)
        const orders = await prisma.order.findMany({
            where: {userId, OR: [
                {paymentMethod: PaymentMethod.COD},
                {AND: [{paymentMethod: PaymentMethod.RAZORPAY}, {isPaid: true}]}
            ]},
            include: {
                orderItems: {include: {product: true}},
                address: true,
                returnRequests: true,
                replacements: true
            },
            orderBy: {createdAt: 'desc'}
        })

        return NextResponse.json({orders})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}