import { isUndefined } from './core';

export function addClassIfDefined(className: string | undefined): string {
    return isUndefined(className) ? '' : ' ' + className;
}
