import { Service } from "typedi";
import * as IORedis from "ioredis";
import { parse } from "url";

@Service({ global: true })
export class PersistenceService {
    private readonly redis: IORedis.Redis;

    constructor() {
        const redisUrl = parse(process.env.REDIS_URL || "");
        const options: IORedis.RedisOptions = {
            host: redisUrl.hostname || undefined,
            port: Number(redisUrl.port) || undefined,
            retryStrategy: times => Math.max(times * 100, 3000)
        };
        this.redis = new IORedis.default(options);
    }

    public disconnect() {
        return this.redis.disconnect();
    }

    public stats() {
        return this.redis.info();
    }

    public getKeys(pattern: string) {
        return this.redis.keys(pattern);
    }
    public async set(key: string, data: any) {
        await this.redis.set(key, JSON.stringify(data));
    }
    public async get<T>(key: string) {
        const data = await this.redis.get(key);
        if (typeof data === "string") {
            return JSON.parse(data) as T;
        }
        return undefined;
    }
    public async mget<T>(keys: string[]) {
        if (keys.length === 0) {
            return [];
        }
        const values = await this.redis.mget(...keys);
        return values.reduce((acc, val) => {
            if (typeof val === "string") {
                acc.push(JSON.parse(val) as T);
            }
            return acc;
        }, [] as T[]);
    }
}
