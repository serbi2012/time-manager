/**
 * MSW (Mock Service Worker) 설정
 * API 모킹을 위한 핸들러와 서버 설정
 */
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Firebase Auth 모킹
const authHandlers = [
    http.post("https://identitytoolkit.googleapis.com/*", () => {
        return HttpResponse.json({
            idToken: "mock-token",
            email: "test@example.com",
            localId: "mock-user-id",
            refreshToken: "mock-refresh-token",
            expiresIn: "3600",
        });
    }),
];

// Firestore 모킹
const firestoreHandlers = [
    http.post("https://firestore.googleapis.com/*", () => {
        return HttpResponse.json({ documents: [] });
    }),

    http.get("https://firestore.googleapis.com/*", () => {
        return HttpResponse.json({ documents: [] });
    }),
];

// 모든 핸들러 조합
export const handlers = [...authHandlers, ...firestoreHandlers];

// MSW 서버 인스턴스
export const server = setupServer(...handlers);

// 테스트 설정 헬퍼
export function setupMswServer() {
    // 모든 테스트 전에 서버 시작
    beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

    // 각 테스트 후 핸들러 리셋
    afterEach(() => server.resetHandlers());

    // 모든 테스트 후 서버 종료
    afterAll(() => server.close());
}

// 커스텀 핸들러 추가 헬퍼
export function addMswHandler(
    ...customHandlers: Parameters<typeof server.use>
) {
    server.use(...customHandlers);
}
