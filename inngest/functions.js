import {inngest} from './client'
import prisma from '@/lib/prisma'

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-create'},
    {event: 'clerk/user.created'},
    async ({ event }) => {
        const {data} = event
        await prisma.user.create({
            data: {
                id: data.id,
                email: data.email_addresses[0].email_address,
                name: `${data.first_name} ${data.last_name}`,
                image: data.image_url,
            }
        })
    }
)

// Inngest Function to update user data in database 
export const syncUserUpdation = inngest.createFunction(
    {id: 'sync-user-update'},
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { data } = event
        await prisma.user.update({
            where: {id: data.id,},
            data: {
                email: data.email_addresses[0].email_address,
                name: `${data.first_name} ${data.last_name}`,
                image: data.image_url,
            }
        })
    }
)

// Inngest Function to delete user from database
export const syncUserDeletion = inngest.createFunction(
    {id: 'sync-user-delete'},
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { data } = event
        await prisma.user.delete({
            where: {id: data.id,}
        })
    }
)

// Inngest Function to delete coupon on expiry
export const deleteCouponOnExpiry = inngest.createFunction(
    {id: 'delete-coupon-on-expiry'},
    { event: 'app/coupon.expired' },
    async ({ event, step }) => {
        const { data } = event
        const expiryDate = new Date(data.expires_at)
        await step.sleepUntil('wait-for-expiry', expiryDate)

        await step.run('delete-coupon-from-database', async () => {
            await prisma.coupon.delete({
                where: { code: data.code }
            })
        })
    }
)