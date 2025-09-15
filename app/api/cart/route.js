import prisma from "@/lib/prisma";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// Update user cart
export async function POST(request){
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        let user = await prisma.user.findUnique({
            where: {id: userId}
        })
        if (!user) {
            // User not in DB, create from Clerk data
            const client = await clerkClient()
            const clerkUser = await client.users.getUser(userId)
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    name: `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim(),
                    image: clerkUser.imageUrl,
                }
            })
        }
        const { cart } = await request.json()

        // Save the cart to the user object
        await prisma.user.update({
            where: {id: userId},
            data: {cart: cart}
        })

        return NextResponse.json({ message: 'Cart updated' })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

// Get user cart
export async function GET(request){
    try {
        console.log('GET /api/cart - Request headers:', Object.fromEntries(request.headers.entries()))
        const { userId } = getAuth(request)
        console.log('GET /api/cart - getAuth result:', { userId })
        console.log('GET /api/cart - userId:', userId)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        let user = await prisma.user.findUnique({
            where: {id: userId}
        })
        console.log('GET /api/cart - user found:', user)
        console.log('GET /api/cart - Prisma query completed')
        if (!user) {
            // User not in DB, create from Clerk data
            const client = await clerkClient()
            const clerkUser = await client.users.getUser(userId)
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    name: `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim(),
                    image: clerkUser.imageUrl,
                }
            })
            console.log('GET /api/cart - Created new user:', user)
        }

        console.log('GET /api/cart - About to return user.cart:', user.cart)
        return NextResponse.json({ cart: user.cart })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}