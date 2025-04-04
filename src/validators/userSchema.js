import z from Zod;

export const userSignUpSchema = z.objects({
    email: z.string().email(),
    username: z.string().min(3),
    password: z.string(),
}) 

export const userSignInSchema = z.objects({
    email: z.string().email(),
    password: z.string(),
}) 