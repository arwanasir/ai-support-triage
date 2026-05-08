
export const config = {
    db_url:process.env.DATABASE_URL,
} 

export const redisconnection = {
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT!)
}