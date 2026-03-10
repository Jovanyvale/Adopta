/* eslint-disable @typescript-eslint/no-explicit-any */

type QueryResult = {
  data?: any
  error?: any
}

export function createQueryMock(result: QueryResult = {}) {
  const resolved = {
    data: result.data ?? null,
    error: result.error ?? null,
  }

  const query: any = {}
  const chainMethods = ['select', 'eq', 'order', 'range', 'gte', 'insert', 'update', 'delete']

  for (const method of chainMethods) {
    query[method] = jest.fn(() => query)
  }

  query.single = jest.fn(async () => resolved)
  query.maybeSingle = jest.fn(async () => resolved)
  query.then = (onFulfilled: any, onRejected: any) => Promise.resolve(resolved).then(onFulfilled, onRejected)

  return query
}

type SupabaseMockOptions = {
  user?: { id: string } | null
  authError?: any
  queries?: any[]
  storageBuckets?: Record<string, any>
}

export function createSupabaseMock(options: SupabaseMockOptions = {}) {
  const {
    user = { id: 'user-1' },
    authError = null,
    queries = [],
    storageBuckets = {},
  } = options

  const queryQueue = [...queries]

  const defaultBucket = {
    upload: jest.fn(async () => ({ data: null, error: null })),
    getPublicUrl: jest.fn((path: string) => ({
      data: {
        publicUrl: `https://example.com/storage/v1/object/public/adoption-pets/${path}`,
      },
    })),
    remove: jest.fn(async () => ({ data: null, error: null })),
  }

  const supabase = {
    auth: {
      getUser: jest.fn(async () => ({
        data: { user },
        error: authError,
      })),
    },
    from: jest.fn((_table: string) => {
      const nextQuery = queryQueue.shift()
      if (!nextQuery) {
        throw new Error('No query mock configured for this call')
      }
      return nextQuery
    }),
    storage: {
      from: jest.fn((bucket: string) => storageBuckets[bucket] ?? defaultBucket),
    },
  }

  return supabase
}
