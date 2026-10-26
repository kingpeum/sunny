import Foundation

struct MealDay: Codable, Identifiable {
    var date: String
    var breakfast: [String]
    var lunch: [String]
    var dinner: [String]
    var id: String { date }
    func items(_ meal: Meal) -> [String] {
        switch meal { case .breakfast: return breakfast; case .lunch: return lunch; case .dinner: return dinner }
    }
}
enum Meal: String, CaseIterable, Identifiable, Codable, Hashable {
    case breakfast, lunch, dinner
    var id: String { rawValue }
    var label: String { switch self { case .breakfast: return "조식"; case .lunch: return "중식"; case .dinner: return "석식" } }
    var hour: Int { switch self { case .breakfast: return 7; case .lunch: return 11; case .dinner: return 17 } }
    var time: String { String(format: "%02d:30", hour) }
    var icon: String { switch self { case .breakfast: return "sunrise"; case .lunch: return "sun.max"; case .dinner: return "moon" } }
}
struct SavedMeals: Codable {
    var days: [MealDay]
    var fetchedAt: Date
}
enum Korea {
    static let zone = TimeZone(identifier: "Asia/Seoul")!
    static var calendar: Calendar { var c = Calendar(identifier: .gregorian); c.timeZone = zone; return c }
    static func date(_ value: String, meal: Meal) -> Date? {
        let parts = value.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3 else { return nil }
        var c = DateComponents(); c.timeZone = zone; c.year = parts[0]; c.month = parts[1]; c.day = parts[2]; c.hour = meal.hour; c.minute = 30; c.second = 0
        return calendar.date(from: c)
    }
    static func today(_ now: Date = Date()) -> String {
        let f = DateFormatter(); f.calendar = calendar; f.timeZone = zone; f.dateFormat = "yyyy-MM-dd"; return f.string(from: now)
    }
    static func label(_ day: String) -> String {
        guard let date = date(day, meal: .lunch) else { return day }
        let f = DateFormatter(); f.locale = Locale(identifier: "ko_KR"); f.timeZone = zone; f.dateFormat = "M월 d일 EEEE"; return f.string(from: date)
    }
}
