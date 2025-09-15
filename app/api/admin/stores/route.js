import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get all approved stores
export async function GET(request){
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, { status: 401 })
        }

        const stores = await prisma.store.findMany({
            where: { status: 'approved' },
            include: { user: true }
        })

        return NextResponse.json({ stores })

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, { status: 400 })
    }
}