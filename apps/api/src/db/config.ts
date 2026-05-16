
export const config = {
    db_url: process.env.DATABASE_URL,
}

export const redisconnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379
}