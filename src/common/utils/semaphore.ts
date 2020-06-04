//Taken from here https://gist.github.com/Gericop/e33be1f201cf242197d9c4d0a1fa7335

/**
 * Async semaphore to prevent race conditions.
 *
 * Example:
 * ```typescript
 * const semaphore = new Semaphore(1);
 *
 * //Try finally is important to not deadlock in case of exception.
 * try {
 *     await semaphore.acquire();
 *     doImportantStuff();
 * }
 * finally {
 *     semaphore.release();
 * }
 * ```
 */
export class Semaphore {
    private counter = 0;
    private waiting: { resolve: () => any; err: (message: string) => any }[] = [];
    private max: number;

    /**
     *
     * @param max Max number of concurrent access
     */
    public constructor(max: number) {
        this.max = max;
    }

    private take(): void {
        if (this.waiting.length > 0 && this.counter < this.max) {
            this.counter++;
            const promise = this.waiting.shift();
            promise.resolve();
        }
    }

    /**
     * Enter the protected code area.\
     * Waits if max is full.
     */
    public acquire(): Promise<unknown> {
        if (this.counter < this.max) {
            this.counter++;
            return new Promise(resolve => {
                resolve();
            });
        } else {
            return new Promise((resolve, err) => {
                this.waiting.push({ resolve: resolve, err: err });
            });
        }
    }

    /**
     * Exit the protected code area.\
     * Frees up a space.
     */
    public release(): void {
        this.counter--;
        this.take();
    }

    /**
     * Empty the queue and reject all waiting promises.
     */
    public purge(): number {
        const unresolved = this.waiting.length;

        for (let i = 0; i < unresolved; i++) {
            this.waiting[i].err('Task has been purged.');
        }

        this.counter = 0;
        this.waiting = [];

        return unresolved;
    }
}
