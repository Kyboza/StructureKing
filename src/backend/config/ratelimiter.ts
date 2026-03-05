import { Ratelimit } from '@upstash/ratelimit'

import { redis } from '../clients/upstash-redis-client.ts'

export const rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'),
    analytics: true,
    timeout: 10000,
})
