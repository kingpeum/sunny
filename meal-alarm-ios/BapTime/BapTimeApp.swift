import SwiftUI
import UserNotifications
import UIKit

class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        return true
    }
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner,.list,.sound])
    }
}
@main
struct BapTimeApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @StateObject private var store = MealStore()
    var body: some Scene { WindowGroup { ContentView().environmentObject(store) } }
}
struct ContentView: View {
    @EnvironmentObject var store: MealStore
    @Environment(\.scenePhase) private var phase
    @State private var selected = Korea.today()
    private let green = Color(red:0.29,green:0.40,blue:0.30)
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment:.leading,spacing:22) {
                    VStack(alignment:.leading,spacing:9) {
                        Text("전북대학교 생활관 · 직영관").font(.caption).foregroundStyle(.secondary)
                        Text("오늘도, 밥 잘 챙겨 먹어요.").font(.title2.bold())
                        Text("주간 식단을 저장하고, 밥 먹을 때 알려드릴게요.").font(.subheadline).foregroundStyle(.secondary)
                    }
                    GroupBox {
                        VStack(alignment:.leading,spacing:14) {
                            Label(store.authorized ? "이 아이폰에 \(store.pending)개 알림 예약됨" : "알림 권한을 허용해주세요",systemImage: "bell.badge").font(.headline)
                            ForEach(Meal.allCases) { meal in
                                Toggle(isOn:Binding(get:{store.enabled.contains(meal)},set:{_ in Task {await store.toggle(meal)}})) {
                                    Label("\(meal.label)  \(meal.time)",systemImage:meal.icon)
                                }.disabled(store.busy)
                            }
                            Button {Task {await store.requestNotifications()}} label: {
                                Label("이 아이폰에 알림 예약",systemImage:"bell").frame(maxWidth:.infinity)
                            }.buttonStyle(.borderedProminent).disabled(store.busy || store.saved == nil)
                            Text("한국 시간 기준 · 메뉴가 없는 끼니는 제외 · 지난 시간은 예약하지 않아요.").font(.caption).foregroundStyle(.secondary)
                        }.padding(.vertical,5)
                    }
                    HStack {
                        VStack(alignment:.leading,spacing:4) {
                            Text("이번 주 식탁").font(.title3.bold())
                            if let saved=store.saved {Text("\(saved.days.first?.date ?? "") ~ \(saved.days.last?.date ?? "")").font(.caption).foregroundStyle(.secondary)}
                        }
                        Spacer()
                        Button {Task {await store.refresh()}} label: {if store.busy {ProgressView()} else {Label("갱신",systemImage:"arrow.clockwise")}}.disabled(store.busy)
                    }
                    if let saved=store.saved {
                        ScrollView(.horizontal,showsIndicators:false) {
                            HStack(spacing:9) {
                                ForEach(saved.days) { day in
                                    Button {selected=day.date} label: {
                                        VStack(spacing:5) {
                                            Text(day.date==Korea.today() ? "오늘" : String(Korea.label(day.date).suffix(3))).font(.caption)
                                            Text(String(Int(day.date.suffix(2)) ?? 0)).font(.title3.bold())
                                        }.frame(width:46,height:62).background(selected==day.date ? green : Color(.secondarySystemGroupedBackground)).foregroundStyle(selected==day.date ? .white : .primary).clipShape(RoundedRectangle(cornerRadius:12))
                                    }
                                }
                            }
                        }
                        let day = saved.days.first(where:{$0.date==selected})
                        if let day {
                            Text(Korea.label(day.date)).font(.headline)
                            ForEach(Meal.allCases) {meal in
                                GroupBox {
                                    VStack(alignment:.leading,spacing:12) {
                                        HStack {Label(meal.label,systemImage:meal.icon).font(.headline);Spacer();Text("\(meal.time) 알림").font(.caption).foregroundStyle(.secondary)}
                                        if day.items(meal).isEmpty {Text("게시된 메뉴가 없어요. 이 끼니는 알림을 보내지 않습니다.").font(.subheadline).foregroundStyle(.secondary)}
                                        else {Text(day.items(meal).joined(separator:" · ")).font(.body).lineSpacing(7).fixedSize(horizontal:false,vertical:true)}
                                    }.frame(maxWidth:.infinity,alignment:.leading).padding(.vertical,6)
                                }
                            }
                        } else {Text("선택한 날짜가 이번 식단에 없어요. 위에서 날짜를 선택해주세요.").foregroundStyle(.secondary)}
                        Text("마지막 저장: \(saved.fetchedAt.formatted(date:.abbreviated,time:.shortened))").font(.caption).foregroundStyle(.secondary)
                    } else {
                        ContentPlaceholder()
                    }
                    if !store.message.isEmpty {Text(store.message).font(.subheadline).padding().frame(maxWidth:.infinity,alignment:.leading).background(green.opacity(0.08)).clipShape(RoundedRectangle(cornerRadius:12)).accessibilityLabel(store.message)}
                    VStack(alignment:.leading,spacing:8) {
                        Label("매주 한 번, 앱을 열어주세요",systemImage:"leaf").font(.headline)
                        Text("새 주간 식단을 내려받으면 다음 알림을 예약합니다. 저장한 주가 끝나면 새로운 식단을 받을 때까지 알림이 없습니다. 공휴일·휴업일도 학교에 게시된 메뉴 유무에 따라 건너뜁니다.").font(.caption).foregroundStyle(.secondary)
                        Text("알림에는 모든 메뉴를 담습니다. 길게 눌러 펼치거나 앱에서 전체 메뉴를 확인하세요. 집중 모드·무음 설정은 아이폰 설정을 따릅니다.").font(.caption).foregroundStyle(.secondary)
                        Link("학교 직영관 식단 원본 보기 ↗",destination:store.source).font(.subheadline)
                    }.padding(.top,4)
                }.padding(20)
            }.background(Color(red:0.97,green:0.98,blue:0.95)).navigationTitle("밥때.").navigationBarTitleDisplayMode(.inline).tint(green)
                .task {await store.inspect();await store.refresh()}
                .onChange(of:phase) {newPhase in if newPhase == .active {Task {await store.inspect(); if store.saved == nil || Date().timeIntervalSince(store.saved!.fetchedAt) > 6 * 3600 {await store.refresh()}}}}
        }
    }
}
struct ContentPlaceholder: View {
    var body: some View { VStack(spacing:12) {Image(systemName:"fork.knife.circle").font(.largeTitle);Text("주간 식단을 기다리고 있어요").font(.headline);Text("위의 갱신을 눌러 학교 직영관 식단을 저장하세요.").font(.subheadline)}.foregroundStyle(.secondary).frame(maxWidth:.infinity).padding(.vertical,25) }
}
