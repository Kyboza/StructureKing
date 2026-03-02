import z from 'zod';

export const loginSchema = z.object({
    email: z.string().min(5, 'Email has to be atleast 5 characters long').max(255, 'Email has to be less than 255 characters long')
    .regex(/^[a-zA-Z0-9åäöÅÄÖ][a-zA-Z0-9åäöÅÄÖ._-]+(?:\.[a-zA-ZåäöÅÄÖ._-]+)*@[a-zA-ZåäöÅÄÖ._-]+(?:\.[a-zA-ZåäöÅÄÖ._-]+)*\.[a-zA-Z]{2,6}$/, "Invalid email."),
    username: z.string().min(2, "Username has to be atleast 2 characters long").max(60, "Username has to be less than 60 characters long")
    .regex(/^[a-zA-Z0-9åäöÅÄÖ]+$/, "Invalid name"),
    password: z.string().min(8, "Password has to be atleast 8 characters long").max(255, "Pasword has to be less than 255 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).*$/, "Password needs to include: small, large letters, numbers and one special character."),
    website: z.string().optional()
})

export type LoginSchemaType = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    email: z.string().min(5, 'Email has to be atleast 5 characters long').max(255, 'Email has to be less than 255 characters long')
    .regex(/^[a-zA-Z0-9åäöÅÄÖ][a-zA-Z0-9åäöÅÄÖ._-]+(?:\.[a-zA-ZåäöÅÄÖ._-]+)*@[a-zA-ZåäöÅÄÖ._-]+(?:\.[a-zA-ZåäöÅÄÖ._-]+)*\.[a-zA-Z]{2,6}$/, "Invalid email."),
    username: z.string().min(2, "Username has to be atleast 2 characters long").max(60, "Username has to be less than 60 characters long")
    .regex(/^[a-zA-Z0-9åäöÅÄÖ]+$/, "Invalid name"),
    password: z.string().min(8, "Password has to be atleast 8 characters long").max(255, "Pasword has to be less than 255 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).*$/, "Password needs to include: small, large letters, numbers and one special character."),
    confirmPassword: z.string(),
    website: z.string().optional()
}).refine((data) => data.confirmPassword === data.password, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
});

export type RegisterSchemaType = z.infer<typeof registerSchema>

export const roomsSchema = z.object({
    name: z.string().length(2, "Room name can only contain 2 characters").regex(/^\d[A-Z]$/, "Room name must start with a number and end with a capital letter, Max 2 characters"),
    capacity: z.coerce.number().min(1, "Capacity must be atleast 1").max(10, "Capacity must be 10 or less"),
    type: z.enum(["Workspace", "Conference"], "Choose either Workspace or Conference"),
    website: z.string().optional()
})

export type RoomsSchemaType = z.infer<typeof roomsSchema>

export const bookingSchema = z.object({
    roomId: z.string().min(1, "Room id is required").max(2, "User id can max be 2 characters long"),
    userId: z.coerce.number().min(1, "User id is required").max(2, "User id can max be 2 characters long"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    website: z.string().optional()
})

export type BookingSchemaType = z.infer<typeof bookingSchema>