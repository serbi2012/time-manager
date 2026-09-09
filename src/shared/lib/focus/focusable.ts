/** antd 모달 본문 셀렉터 */
const MODAL_BODY_SELECTOR = ".ant-modal-content";

/** 닫히는 중이거나 숨겨진 모달 래퍼 */
const HIDDEN_MODAL_WRAP_SELECTOR = ".ant-modal-wrap";

const FOCUSABLE_SELECTOR = [
    "input:not([type='hidden'])",
    "textarea",
    "select",
    "button",
    "a[href]",
    "[tabindex]",
    "[contenteditable='true']",
].join(",");

function isVisible(element: HTMLElement): boolean {
    if (element.hidden) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    return element.offsetParent !== null || element.getClientRects().length > 0;
}

function isDisabled(element: HTMLElement): boolean {
    if (element.hasAttribute("disabled")) return true;
    if (element.getAttribute("aria-disabled") === "true") return true;
    return element.getAttribute("tabindex") === "-1";
}

/**
 * 컨테이너 안에서 포커스 가능한 요소를 문서 순서대로 반환
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const found = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );

    return found.filter(
        (element) => isVisible(element) && !isDisabled(element)
    );
}

/**
 * 컨테이너에서 처음 포커스할 요소를 고른다
 *
 * 텍스트 입력이 있으면 그것을, 없으면 첫 포커스 가능 요소를 쓴다.
 * 닫기(X) 버튼은 의도한 첫 포커스가 아니므로 후보에서 제외한다.
 */
export function findInitialFocusTarget(
    container: HTMLElement
): HTMLElement | null {
    const focusables = getFocusableElements(container).filter(
        (element) => !element.classList.contains("ant-modal-close")
    );

    if (focusables.length === 0) return null;

    const text_input = focusables.find(
        (element) =>
            element.tagName === "TEXTAREA" ||
            (element.tagName === "INPUT" &&
                !["checkbox", "radio", "button", "submit"].includes(
                    (element as HTMLInputElement).type
                ))
    );

    return text_input ?? focusables[0];
}

/**
 * 요소가 현재 문서에 살아 있고 포커스를 받을 수 있는지
 */
export function canReceiveFocus(element: Element | null): element is HTMLElement {
    if (!(element instanceof HTMLElement)) return false;
    if (!element.isConnected) return false;
    return isVisible(element) && !isDisabled(element);
}

/**
 * 현재 화면에 보이는 모달 중 가장 위에 있는 것의 본문을 찾는다
 *
 * 컨테이너를 직접 넘기지 않은 모달의 자동 포커스 대상으로 쓴다.
 */
export function findTopmostModalBody(): HTMLElement | null {
    const wraps = Array.from(
        document.querySelectorAll<HTMLElement>(HIDDEN_MODAL_WRAP_SELECTOR)
    ).filter((wrap) => wrap.style.display !== "none");

    for (let i = wraps.length - 1; i >= 0; i -= 1) {
        const body = wraps[i].querySelector<HTMLElement>(MODAL_BODY_SELECTOR);
        if (body) return body;
    }

    return null;
}
