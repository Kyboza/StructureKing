export interface JwtClaims {
    id: string // alltid string, ObjectId serialiseras som string i JWT
    name: string
    role: 'User' | 'Admin'
    iat?: number
    exp?: number
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtClaims // din fulla user-typ
        }
    }
}
