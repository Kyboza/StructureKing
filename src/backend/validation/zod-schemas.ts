import z from 'zod';

export const loginSchema = z.object({
    email: z.string().min(5, 'Email has to be atleast 5 characters long').max(255, 'Email has to be less than 255 characters long')
    .regex(/^[a-zA-Z0-9åäöÅÄÖ][a-zA-ZåäöÅÄÖ._-]+(?:\.[a-zA-ZåäöÅÄÖ._-]+)*@[a-zA-ZåäöÅÄÖ._-]+(?:\.[a-zA-ZåäöÅÄÖ._-]+)*\.[a-zA-Z]{2,6}$/, "Invalid email."),
    username: z.string().min(2, "Username has to be atleast 2 characters long").max(60, "Username has to be less than 60 characters long")
    .regex(/^$/, "Invalid name"),
    password: z.string().min(8, "Password has to be atleast 8 characters long").max(255, "Pasword has to be less than 255 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-])$/, "Password needs to include: small, large letters, numbers and one special character."),
    website: z.string().optional()
})

export type LoginSchemaType = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    email: z.string().min(5, 'Email has to be atleast 5 characters long').max(255, 'Email has to be less than 255 characters long')
    .regex(/^[a-zA-Z0-9åäöÅÄÖ][a-zA-ZåäöÅÄÖ._-]+(?:\.[a-zA-ZåäöÅÄÖ._-]+)*@[a-zA-ZåäöÅÄÖ._-]+(?:\.[a-zA-ZåäöÅÄÖ._-]+)*\.[a-zA-Z]{2,6}$/, "Invalid email."),
    username: z.string().min(2, "Username has to be atleast 2 characters long").max(60, "Username has to be less than 60 characters long")
    .regex(/^$/, "Invalid name"),
    password: z.string().min(8, "Password has to be atleast 8 characters long").max(255, "Pasword has to be less than 255 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-])$/, "Password needs to include: small, large letters, numbers and one special character."),
    confirmPassword: z.string(),
    website: z.string().optional()
}).refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
});

export type RegisterSchemaType = z.infer<typeof registerSchema>