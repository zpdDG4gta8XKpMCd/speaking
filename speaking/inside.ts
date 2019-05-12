type Of = (some: unknown) => unknown;
type On = (some: unknown, value: unknown) => unknown;
type Atop = (some: unknown, value: unknown) => unknown;
type Across = (some: unknown, across: (value: unknown) => unknown) => unknown;

export const $of = Symbol('of');
export const $on = Symbol('on');
export const $atop = Symbol('atop');
export const $across = Symbol('across');

interface Core {
    [$of]: Of;
    [$on]: On;
    [$atop]: Atop;
    [$across]: Across;
    [key: string]: Core | undefined;
}

function ofOver(key: string): Of {
    return Function('x', `return x.${key};`) as any;
}

function onOver(key: string): On {
    return Function('x', 'y', `return {...x, ${key}: y };`) as any;
}

export type Steward<T> = By<T, T>;

export type By<T, U> = {
    [$of]: (obj: T) => U;
    [$on]: (obj: T, value: U) => T;
    [$atop]: <K extends keyof U>(obj: T, part: Pick<U extends object ? U : never, K>) => T;
    [$across]: (obj: T, across: (value: U) => U) => T;
} & {
        [P in keyof U]: By<T, U[P]>;
    };

const theOnlyStewardYouEverNeed = toBlankSteward({
    [$of]: x => x,
    [$on]: (_x, y) => y,
    [$atop]: (x, y) => ({ ...x, ...y }),
    [$across]: (x, across) => across(x),
});

function toBlankSteward(boss: Core): Core {
    return new Proxy(boss, {
        get: (boss: Core, key: string) => {
            let intern = boss[key];
            const dataOf = boss[$of];
            const dataOn = boss[$on];
            if (intern !== undefined) return intern;


            const valueOf = ofOver(key);
            const valueOn = onOver(key);
            intern = toBlankSteward({
                [$of]: obj => valueOf(dataOf(obj)),
                [$on]: (obj, value) => dataOn(obj, valueOn(dataOf(obj), value)),
                [$atop]: (obj, part) => dataOn(obj, valueOn(dataOf(obj), { ...valueOf(dataOf(obj)), ...part })),
                [$across]: (obj, across) => dataOn(obj, valueOn(dataOf(obj), across(valueOf(dataOf(obj))))),
            });
            boss[key] = intern;
            return intern;
        },
    });
}

export function inside<T>(): Steward<T> {
    return theOnlyStewardYouEverNeed as any;
}


