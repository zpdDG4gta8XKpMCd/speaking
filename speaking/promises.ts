export interface Soon<T> {
    (): Promise<T>;
    (value: T): void;
}
export function soon<T>(): Soon<T> {
    let done: ((value: T) => void) | null = null;
    const once = new Promise<T>(resolve => {
        done = resolve;
    });
    function result(): void | Promise<T> {
        if (arguments.length > 0) {
            done!(arguments[0]);
        } else {
            return once;
        }
    }
    return result as any;
}
