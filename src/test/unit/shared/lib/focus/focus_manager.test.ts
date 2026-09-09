import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
    getFocusableElements,
    findInitialFocusTarget,
    canReceiveFocus,
    findTopmostModalBody,
    pushFocusLayer,
    focusInto,
    getFocusStackDepth,
    resetFocusManager,
} from "@/shared/lib/focus";

function mount(html: string): HTMLElement {
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    return container;
}

describe("focus 유틸", () => {
    let container: HTMLElement | null = null;

    beforeEach(() => {
        resetFocusManager();
    });

    afterEach(() => {
        if (container?.isConnected) {
            document.body.removeChild(container);
        }
        container = null;
        document.body.innerHTML = "";
    });

    describe("getFocusableElements", () => {
        it("포커스 가능한 요소를 문서 순서대로 반환한다", () => {
            container = mount(`
                <input id="a" />
                <button id="b">확인</button>
                <a id="c" href="#">링크</a>
            `);

            const ids = getFocusableElements(container).map((el) => el.id);

            expect(ids).toEqual(["a", "b", "c"]);
        });

        it("disabled 요소는 제외한다", () => {
            container = mount(`
                <input id="a" disabled />
                <button id="b">확인</button>
            `);

            const ids = getFocusableElements(container).map((el) => el.id);

            expect(ids).toEqual(["b"]);
        });

        it("tabindex가 -1이면 제외한다", () => {
            container = mount(`
                <button id="a" tabindex="-1">숨김</button>
                <button id="b">확인</button>
            `);

            const ids = getFocusableElements(container).map((el) => el.id);

            expect(ids).toEqual(["b"]);
        });
    });

    describe("findInitialFocusTarget", () => {
        it("텍스트 입력이 있으면 그것을 고른다", () => {
            container = mount(`
                <button id="btn">확인</button>
                <input id="text" type="text" />
            `);

            expect(findInitialFocusTarget(container)?.id).toBe("text");
        });

        it("textarea도 텍스트 입력으로 본다", () => {
            container = mount(`
                <button id="btn">확인</button>
                <textarea id="area"></textarea>
            `);

            expect(findInitialFocusTarget(container)?.id).toBe("area");
        });

        it("체크박스는 텍스트 입력으로 보지 않는다", () => {
            container = mount(`
                <button id="btn">확인</button>
                <input id="check" type="checkbox" />
            `);

            expect(findInitialFocusTarget(container)?.id).toBe("btn");
        });

        it("모달 닫기 버튼은 첫 포커스 후보에서 뺀다", () => {
            container = mount(`
                <button id="close" class="ant-modal-close">X</button>
                <button id="ok">확인</button>
            `);

            expect(findInitialFocusTarget(container)?.id).toBe("ok");
        });

        it("포커스 가능한 요소가 없으면 null", () => {
            container = mount(`<span>텍스트</span>`);

            expect(findInitialFocusTarget(container)).toBeNull();
        });
    });

    describe("canReceiveFocus", () => {
        it("문서에 붙어 있고 활성이면 true", () => {
            container = mount(`<button id="b">확인</button>`);

            expect(canReceiveFocus(container.querySelector("#b"))).toBe(true);
        });

        it("문서에서 떨어진 요소는 false", () => {
            const orphan = document.createElement("button");

            expect(canReceiveFocus(orphan)).toBe(false);
        });

        it("null은 false", () => {
            expect(canReceiveFocus(null)).toBe(false);
        });
    });

    describe("findTopmostModalBody", () => {
        it("보이는 모달 중 마지막 것의 본문을 찾는다", () => {
            container = mount(`
                <div class="ant-modal-wrap">
                    <div class="ant-modal-content" id="first"></div>
                </div>
                <div class="ant-modal-wrap">
                    <div class="ant-modal-content" id="second"></div>
                </div>
            `);

            expect(findTopmostModalBody()?.id).toBe("second");
        });

        it("숨겨진 모달은 건너뛴다", () => {
            container = mount(`
                <div class="ant-modal-wrap">
                    <div class="ant-modal-content" id="visible"></div>
                </div>
                <div class="ant-modal-wrap" style="display: none">
                    <div class="ant-modal-content" id="hidden"></div>
                </div>
            `);

            expect(findTopmostModalBody()?.id).toBe("visible");
        });

        it("모달이 없으면 null", () => {
            container = mount(`<div>본문</div>`);

            expect(findTopmostModalBody()).toBeNull();
        });
    });

    describe("pushFocusLayer", () => {
        it("닫을 때 이전 포커스로 되돌린다", () => {
            container = mount(`
                <button id="trigger">열기</button>
                <input id="field" />
            `);

            const trigger = container.querySelector<HTMLElement>("#trigger")!;
            const field = container.querySelector<HTMLElement>("#field")!;

            trigger.focus();
            expect(document.activeElement).toBe(trigger);

            const release = pushFocusLayer();
            field.focus();
            expect(document.activeElement).toBe(field);

            release();
            expect(document.activeElement).toBe(trigger);
        });

        it("restore가 false면 되돌리지 않는다", () => {
            container = mount(`
                <button id="trigger">열기</button>
                <input id="field" />
            `);

            const trigger = container.querySelector<HTMLElement>("#trigger")!;
            const field = container.querySelector<HTMLElement>("#field")!;

            trigger.focus();
            const release = pushFocusLayer({ restore: false });
            field.focus();
            release();

            expect(document.activeElement).toBe(field);
        });

        it("레이어 깊이를 추적한다", () => {
            expect(getFocusStackDepth()).toBe(0);

            const release_a = pushFocusLayer();
            const release_b = pushFocusLayer();
            expect(getFocusStackDepth()).toBe(2);

            release_b();
            release_a();
            expect(getFocusStackDepth()).toBe(0);
        });

        it("되돌릴 요소가 사라졌으면 조용히 넘어간다", () => {
            container = mount(`<button id="trigger">열기</button>`);
            const trigger = container.querySelector<HTMLElement>("#trigger")!;

            trigger.focus();
            const release = pushFocusLayer();
            trigger.remove();

            expect(() => release()).not.toThrow();
        });
    });

    describe("focusInto", () => {
        it("우선 지정한 요소로 포커스를 옮긴다", () => {
            container = mount(`
                <input id="first" />
                <input id="preferred" />
            `);

            const preferred =
                container.querySelector<HTMLElement>("#preferred")!;

            expect(focusInto(container, preferred)?.id).toBe("preferred");
            expect(document.activeElement).toBe(preferred);
        });

        it("지정 요소가 없으면 컨테이너에서 자동으로 고른다", () => {
            container = mount(`
                <button id="btn">확인</button>
                <input id="text" />
            `);

            expect(focusInto(container)?.id).toBe("text");
        });

        it("컨테이너를 안 주면 최상단 모달에서 찾는다", () => {
            container = mount(`
                <div class="ant-modal-wrap">
                    <div class="ant-modal-content">
                        <input id="modal-input" />
                    </div>
                </div>
            `);

            expect(focusInto(null)?.id).toBe("modal-input");
        });

        it("포커스할 곳이 없으면 null", () => {
            container = mount(`<span>텍스트</span>`);

            expect(focusInto(container)).toBeNull();
        });
    });
});
