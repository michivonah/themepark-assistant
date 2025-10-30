import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { InvalidParameter } from '../errors'

/**
 * Custom Zod Validator Middleware with support for HTTP Exceptions
 * @param type Part of HonoRequest object to get data from
 * @param schema Zod Validation scheme (docs: https://zod.dev/api)
 * @returns zValidator for running the validation
 */
export default function httpZValidator<T extends z.ZodTypeAny>(type: 'query' | 'json' | 'param' = 'query', schema: T){
    return zValidator(type, schema, (result, c) => {
        if(!result.success) throw new InvalidParameter();
    })
}