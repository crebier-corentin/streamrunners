import NodeCache = require('node-cache');

class CacheService {
    private cache: NodeCache;

    public constructor(ttlSeconds) {
        this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
    }

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

    public del(keys): void {
        this.cache.del(keys);
    }

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

    public flush(): void {
        this.cache.flushAll();
    }
}

export default CacheService;
