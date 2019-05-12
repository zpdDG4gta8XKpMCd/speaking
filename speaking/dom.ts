export function isHtmlElement(element: Element): element is HTMLElement {
    return element instanceof HTMLElement;
}

export type InteractiveHtmlElement = HTMLAnchorElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement;
export function isInteractiveHtmlElement(element: HTMLElement): element is InteractiveHtmlElement {
    switch (element.tagName) {
        case 'A':
        case 'INPUT':
        case 'BUTTON':
        case 'SELECT':
        case 'TEXTAREA':
            return true;
        default: return false;
    }
}
