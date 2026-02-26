import {redis} from '../clients/upstash-redis-client.ts'
import { Ratelimit } from "@upstash/ratelimit";

export const rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
    timeout: 10000
})