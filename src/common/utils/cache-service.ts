import NodeCache = require('node-cache');

/**
 * Cache storing values as string key-value pairs with configurable seconds.
 */
class CacheService {
    private cache: NodeCache;

    /*
     * @param ttlSeconds In seconds, how long should the cache store a value
     */
    public constructor(ttlSeconds) {
        this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
    }

    /**
     * @param key Key used to store the value
     * @param storeFunction Function called to obtain the value if not in cache
     */
    public get<T>(key: string, storeFunction: () => Promise<T>): Promise<T> {
        const value = this.cache.get(key) as T;
        if (value) {
            return Promise.resolve(value);
        }

        return storeFunction().then(result => {
            this.cache.set(key, result);
            return result;
        });
    }

    /**
     * @param keys Key(s) to delete from cache
     */
    public del(keys: string | string[]): void {
        this.cache.del(keys);
    }

    /**
     * Delete every key starting with startStr.
     */
    public delStartWith(startStr = ''): void {
        if (!startStr) {
            return;
        }

        const keys = this.cache.keys();
        for (const key of keys) {
            if (key.indexOf(startStr) === 0) {
                this.del(key);
            }
        }
    }

    /**
     * Delete every value from cache.
     */
    public flush(): void {
        this.cache.flushAll();
    }
}

export default CacheService;
