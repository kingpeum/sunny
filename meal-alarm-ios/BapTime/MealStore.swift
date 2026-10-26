import Foundation
import WebKit
import UserNotifications
import SwiftUI

@MainActor
final class MealStore: NSObject, ObservableObject, WKNavigationDelegate {
    @Published var saved: SavedMeals?
    @Published var enabled: Set<Meal> = Set(Meal.allCases)
    @Published var busy = false
    @Published var message = ""
    @Published var pending = 0
    @Published var authorized = false
    let source = URL(string: "https://likehome.jbnu.ac.kr/home/main/inner.php?sMenu=B7100")!
    private var browser: WKWebView?
    private var loadContinuation: CheckedContinuation<Void, Error>?
    private let prefix = "baptime.meal."
    private var cacheURL: URL { FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0].appendingPathComponent("week.json") }

    override init() {
        super.init()
        if let values = UserDefaults.standard.array(forKey: "enabledMeals") as? [String] { enabled = Set(values.compactMap(Meal.init(rawValue:))) }
        if let data = try? Data(contentsOf: cacheURL) { saved = try? JSONDecoder().decode(SavedMeals.self, from: data) }
    }
    func navigationReady() async throws {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        let view = WKWebView(frame: .zero, configuration: config)
        browser = view; view.navigationDelegate = self
        try await withCheckedThrowingContinuation { continuation in
            loadContinuation = continuation
            view.loadHTMLString("<!doctype html><html><body></body></html>", baseURL: nil)
        }
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { loadContinuation?.resume(); loadContinuation = nil }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { loadContinuation?.resume(throwing: error); loadContinuation = nil }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { loadContinuation?.resume(throwing: error); loadContinuation = nil }
    func refresh() async {
        guard !busy else { return }; busy = true
        defer { busy = false; browser = nil }
        do {
            var request = URLRequest(url: source); request.timeoutInterval = 25; request.cachePolicy = .reloadIgnoringLocalCacheData
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200, data.count < 4_000_000, let html = String(data: data, encoding: .utf8) else { throw problem("학교 식단을 내려받지 못했습니다.") }
            guard let parserURL = Bundle.main.url(forResource: "MealParser", withExtension: "js") else { throw problem("앱의 식단 분석 파일이 없습니다.") }
            let script = try String(contentsOf: parserURL, encoding: .utf8)
            try await navigationReady()
            guard let json = try await browser?.callAsyncJavaScript(script, arguments: ["html":html], in: nil, contentWorld: .page) as? String else { throw problem("식단을 읽지 못했습니다.") }
            let days = try JSONDecoder().decode([MealDay].self, from: Data(json.utf8))
            guard days.count == 7, days.contains(where: { $0.date >= Korea.today() }) else { throw problem("학교에 새 주간 식단이 아직 게시되지 않았습니다. 기존 예약을 유지합니다.") }
            let next = SavedMeals(days: days, fetchedAt: Date())
            try FileManager.default.createDirectory(at: cacheURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            try JSONEncoder().encode(next).write(to: cacheURL, options: .atomic)
            saved = next
            do {
                try await schedule()
                message = authorized ? "식단을 저장하고 앞으로의 알림을 예약했어요." : "식단을 저장했어요. ‘이 아이폰에 알림 예약’을 눌러주세요."
            } catch {
                await inspect()
                message = "식단은 저장했지만 일부 알림을 예약하지 못했어요. ‘이 아이폰에 알림 예약’을 다시 눌러주세요: \(error.localizedDescription)"
            }
        } catch { message = "갱신하지 못했어요: \(error.localizedDescription)\n저장해 둔 식단과 기존 예약은 유지합니다." }
    }
    func requestNotifications() async {
        guard !busy else { return }; busy = true; defer { busy = false }
        do {
            let ok = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert,.sound,.badge])
            guard ok else { throw problem("아이폰 설정 → 알림 → 밥때에서 알림을 허용해주세요.") }
            try await schedule()
            message = "앞으로의 식사 알림 \(pending)개를 예약했어요. 앱을 닫아도 알림을 받을 수 있어요."
        } catch { message = error.localizedDescription }
    }
    func toggle(_ meal: Meal) async {
        guard !busy else { return }; busy = true; defer { busy = false }
        if enabled.contains(meal) { enabled.remove(meal) } else { enabled.insert(meal) }
        UserDefaults.standard.set(enabled.map(\.rawValue), forKey: "enabledMeals")
        do { try await schedule(); message = "알림 설정을 반영했어요." } catch { message = "일부 알림을 예약하지 못했어요. 다시 예약해주세요: \(error.localizedDescription)" }
    }
    func inspect() async {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        authorized = [.authorized,.provisional,.ephemeral].contains(settings.authorizationStatus)
        pending = await center.pendingNotificationRequests().filter { $0.identifier.hasPrefix(prefix) }.count
    }
    private func schedule() async throws {
        let center = UNUserNotificationCenter.current()
        await inspect()
        guard authorized else { return }
        // Only this app's meal reservations are replaced; never use background timers.
        let old = await center.pendingNotificationRequests().filter { $0.identifier.hasPrefix(prefix) }
        let now = Date()
        var requests: [UNNotificationRequest] = []
        for day in saved?.days ?? [] {
            for meal in Meal.allCases where enabled.contains(meal) {
                let items = day.items(meal)
                guard !items.isEmpty, let date = Korea.date(day.date, meal: meal), date > now else { continue }
                let content = UNMutableNotificationContent()
                content.title = "\(Korea.label(day.date)) \(meal.label) · 직영관"
                content.body = items.joined(separator: "\n")
                content.sound = .default
                content.userInfo = ["date":day.date,"meal":meal.rawValue]
                var components = Korea.calendar.dateComponents([.year,.month,.day,.hour,.minute,.second], from: date)
                components.timeZone = Korea.zone; components.calendar = Korea.calendar
                let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
                requests.append(UNNotificationRequest(identifier: prefix+day.date+"."+meal.rawValue, content: content, trigger: trigger))
            }
        }
        // Add/replace first, then remove obsolete entries to retain reservations on errors.
        for request in requests { try await center.add(request) }
        let desired = Set(requests.map(\.identifier))
        center.removePendingNotificationRequests(withIdentifiers: old.map(\.identifier).filter { !desired.contains($0) })
        await inspect()
    }
    private func problem(_ text: String) -> NSError { NSError(domain: "BapTime", code: 1, userInfo: [NSLocalizedDescriptionKey:text]) }
}
