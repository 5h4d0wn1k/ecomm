import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { validateFormData } from "@/middlewares/validationMiddleware";
import schemas from "@/lib/validationSchemas";
import { validateCSRFForRequest, setCSRFToken } from "@/lib/csrf";

// create the store
export async function POST(request){
    try {
        const {userId} = getAuth(request)
        console.log('POST /api/store/create - userId:', userId)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Validate CSRF token
        const csrfError = validateCSRFForRequest(request);
        if (csrfError) {
            return csrfError;
        }

        // Validate and sanitize form data
        const validation = await validateFormData(schemas.storeCreate)(request);
        if (validation instanceof NextResponse) {
            return validation; // Validation failed, return error response
        }

        const { name, username, description, email, contact, address } = validation.data;

        // Get image separately since it's a file
        const formData = await request.formData();
        const image = formData.get("image");

        if (!image) {
            return NextResponse.json({error: "Image is required"}, {status: 400});
        }

        // check is user have already registered a store
        const store = await prisma.store.findFirst({
            where: { userId: userId}
        })

        // if store is already registered then send status of store
        if(store){
            return NextResponse.json({status: store.status})
        }

        // check is username is already taken
        const isUsernameTaken = await prisma.store.findFirst({
            where: { username: username.toLowerCase() }
        })

        if(isUsernameTaken){
            return NextResponse.json({error: "username already taken"}, {status: 400})
        }

        // Check if user exists in database
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });
        console.log('POST /api/store/create - existingUser:', existingUser);
        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // image upload to imagekit
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        })

        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'},
                { format: 'webp' },
                { width: '512' }
            ]
        })

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo: optimizedImage
            }
        })

        //  link store to user
        await prisma.user.update({
            where: { id: userId },
            data: {store: {connect: {id: newStore.id}}}
        })

        const result = NextResponse.json({message: "applied, waiting for approval"});
        setCSRFToken(result);
        return result;

    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, { status: 400 })
    }
}

// check is user have already registered a store if yes then send status of store

export async function GET(request) {
    try {
        const {userId} = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // check is user have already registered a store
        const store = await prisma.store.findFirst({
            where: { userId: userId}
        })

        // if store is already registered then send status of store
        if(store){
            return NextResponse.json({status: store.status})
        }

        return NextResponse.json({status: "not registered"})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, { status: 400 })
    }
}