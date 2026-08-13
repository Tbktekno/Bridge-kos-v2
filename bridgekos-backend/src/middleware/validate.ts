import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from '../core/errors.js';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

type RequestSource = 'body' | 'query' | 'params';

/**
 * Supports both validator shapes:
 * - flat:   schema = z.object({ email, password })
 * - nested: schema = z.object({ body: z.object({ email, password }) })
 */
function resolveSchema(schema: ZodTypeAny, source: RequestSource): ZodTypeAny {
  const shape = (schema as { shape?: Record<string, unknown> }).shape;
  const inner = shape?.[source];
  if (inner && typeof (inner as { safeParse?: unknown }).safeParse === 'function') {
    return inner as ZodTypeAny;
  }
  return schema;
}

export const validate =
  (schemas: ValidationSchemas): RequestHandler =>
  (req, _res, next) => {
    const issues: Array<{ field: string; message: string }> = [];

    (Object.keys(schemas) as RequestSource[]).forEach((source) => {
      const rawSchema = schemas[source];
      if (!rawSchema) return;

      const schema = resolveSchema(rawSchema, source);
      const result = schema.safeParse(req[source]);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          issues.push({
            field: path ? `${source}.${path}` : source,
            message: issue.message,
          });
        });
        return;
      }
      // Replace request data with the sanitized/validated value.
      // Express 5 exposes req.query (and params) as getter-only accessors,
      // so a plain assignment throws - override via defineProperty instead.
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    });

    if (issues.length > 0) {
      next(new ValidationError(issues));
      return;
    }
    next();
  };
