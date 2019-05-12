export function isNull<T extends ([null] extends [T] ? any : never)>(value: T): value is T & null {
    return value === null;
}

export function broke(never: never): never {
    debugger;
    console.error(never);
    throw new Error('Unexpected case.');
}

export function asAny(any: any): any {
    return any;
}
