import flet as ft
import datetime
import threading
import time
import math

# ==========================================
# 逻辑核心：数据计算
# ==========================================
def calculate_life_stats():
    """根据出生日期计算生命倒计时数据"""
    now = datetime.datetime.now()
    dob = datetime.datetime(1984, 9, 23)  # 用户生日
    target_date = dob.replace(year=dob.year + 80) # 80岁目标
    
    # 基础时间戳
    birth_ts = dob.timestamp()
    target_ts = target_date.timestamp()
    now_ts = now.timestamp()
    
    total_life_span = target_ts - birth_ts
    total_beats = 3_000_000_000 # 假设一生心跳总数 30亿
    
    # 1. 倒计时 (Years, Days, Hours, Mins, Secs)
    distance = target_ts - now_ts
    
    if distance < 0:
        return None
    
    seconds_per_year = 365.25 * 24 * 3600
    years_left = int(distance // seconds_per_year)
    
    remainder = distance % seconds_per_year
    days_left = int(remainder // (24 * 3600))
    
    remainder = remainder % (24 * 3600)
    hours_left = int(remainder // 3600)
    
    remainder = remainder % 3600
    minutes_left = int(remainder // 60)
    
    seconds_left = int(remainder % 60)
    
    # 2. 年度进度
    start_of_year = datetime.datetime(now.year, 1, 1)
    end_of_year = datetime.datetime(now.year + 1, 1, 1)
    total_year_seconds = (end_of_year - start_of_year).total_seconds()
    elapsed_year_seconds = (now - start_of_year).total_seconds()
    
    year_percent = (elapsed_year_seconds / total_year_seconds)
    year_days_left = (end_of_year - now).days
    
    # 3. 人生进度 (设定 totalLifeDays = 30000)
    ms_per_day = 24 * 3600
    days_lived = int((now_ts - birth_ts) / ms_per_day)
    total_life_days_const = 30_000
    life_days_left_const = total_life_days_const - days_lived
    life_percent = min(1.0, max(0.0, days_lived / total_life_days_const))
    
    # 4. 心跳
    time_left_seconds = target_ts - now_ts
    ratio = time_left_seconds / total_life_span
    remaining_beats = int(total_beats * ratio)
    processed_beats = total_beats - remaining_beats
    
    return {
        "years_left": years_left,
        "days_left": days_left,
        "hours_left": hours_left,
        "minutes_left": minutes_left,
        "seconds_left": seconds_left,
        "year_percent": year_percent,
        "year_days_left": year_days_left,
        "life_percent": life_percent,
        "life_days_left_const": life_days_left_const,
        "processed_beats": processed_beats,
        "remaining_beats": remaining_beats,
        "today_str": now.strftime("%Y.%m.%d")
    }

# ==========================================
# 组件：生命倒计时 Widget
# ==========================================
class LifeCountdownWidget(ft.Column):
    def __init__(self):
        super().__init__()
        self.spacing = 15
        self.horizontal_alignment = ft.CrossAxisAlignment.CENTER
        
        # --- 1. 顶部日期 ---
        self.txt_today = ft.Text(
            "", 
            color="#33ff00", 
            size=24,         
            weight=ft.FontWeight.BOLD, 
            font_family="monospace"
        )
        
        # --- 2. 进度条 ---
        # 年度进度条
        self.pb_year_fill = ft.Container(
            gradient=ft.LinearGradient(colors=["#002FA7", "#008C8C", "#F7E14D", "#81D8D0"]), 
            border_radius=15,
            animate=ft.Animation(1000, ft.AnimationCurve.EASE_OUT)
        )
        self.pb_year_text = ft.Text("", size=10, weight=ft.FontWeight.BOLD, font_family="monospace", color="white")
        
        self.pb_year = ft.Container(
            bgcolor="#1a2634", border_radius=15, height=30, 
            border=ft.Border.all(1, color=ft.Colors.with_opacity(0.1, "white")),
            content=ft.Stack([
                ft.Row([self.pb_year_fill], spacing=0),
                ft.Container(
                    content=self.pb_year_text,
                    alignment=ft.Alignment(1.0, 0.0), 
                    padding=ft.Padding.only(right=10)
                )
            ])
        )
        
        # 人生进度条
        self.pb_life_fill = ft.Container(
            gradient=ft.LinearGradient(colors=["#6a11cb", "#2575fc"]), 
            border_radius=15,
            animate=ft.Animation(1000, ft.AnimationCurve.EASE_OUT)
        )
        self.pb_life_text = ft.Text("", size=10, weight=ft.FontWeight.BOLD, font_family="monospace", color="white")
        
        self.pb_life = ft.Container(
            bgcolor="#1a2634", border_radius=15, height=30,
            border=ft.Border.all(1, color=ft.Colors.with_opacity(0.1, "white")),
            content=ft.Stack([
                ft.Row([self.pb_life_fill], spacing=0),
                ft.Container(
                    content=self.pb_life_text,
                    alignment=ft.Alignment(0.0, 0.0) 
                )
            ])
        )
        
        # --- 3. 倒计时格子 ---
        self.grid_boxes = []
        text_colors = [ft.Colors.BLUE, ft.Colors.TEAL, ft.Colors.AMBER, ft.Colors.CYAN, ft.Colors.RED]
        labels = ["年", "天", "时", "分", "秒"]
        
        for i in range(5):
            val_text = ft.Text("00", size=20, weight=ft.FontWeight.BOLD, font_family="monospace", color=text_colors[i])
            self.grid_boxes.append(val_text)
            
        grid_row = ft.Row(
            controls=[
                ft.Container(
                    bgcolor="#15202b",
                    border=ft.Border.all(1, color=ft.Colors.with_opacity(0.1, "white")),
                    border_radius=10,
                    padding=10,
                    expand=True, 
                    content=ft.Column([
                        val_text,
                        ft.Text(labels[i], size=10, color="grey")
                    ], alignment=ft.MainAxisAlignment.CENTER, horizontal_alignment=ft.CrossAxisAlignment.CENTER)
                ) for i, val_text in enumerate(self.grid_boxes)
            ],
            spacing=8
        )
        
        # --- 4. 心跳区域 ---
        self.heart_icon = ft.Icon(ft.Icons.FAVORITE, size=160, color=ft.Colors.with_opacity(0.15, "#33ff00"))
        
        self.txt_beats_processed = ft.Text(
            "", 
            size=28, 
            weight=ft.FontWeight.W_900, 
            font_family="monospace", 
            color="white" 
        )
        self.txt_beats_remaining = ft.Text(
            "", 
            size=14, 
            weight=ft.FontWeight.BOLD, 
            font_family="monospace", 
            color="white" 
        )
        
        heart_container = ft.Container(
            height=220, 
            alignment=ft.Alignment(0, 0),
            content=ft.Stack([
                ft.Container(
                    content=self.heart_icon, 
                    alignment=ft.Alignment(0, 0),
                ),
                ft.Container(
                    alignment=ft.Alignment(0, 0),
                    content=ft.Column([
                        ft.Text("总30亿", size=10, color=ft.Colors.WHITE70),
                        self.txt_beats_processed,
                        self.txt_beats_remaining
                    ], alignment=ft.MainAxisAlignment.CENTER, horizontal_alignment=ft.CrossAxisAlignment.CENTER, spacing=2)
                )
            ])
        )
        
        self.controls = [
            ft.Container(content=self.txt_today, alignment=ft.Alignment(0, 0), margin=ft.Margin.only(top=10, bottom=5)),
            self.pb_year,
            self.pb_life,
            grid_row,
            ft.Divider(height=20, color="transparent"),
            heart_container,
            ft.Divider(height=10, color=ft.Colors.with_opacity(0.1, "white"))
        ]
        
        self.running = True

    def did_mount(self):
        self.update_timer()
        
    def will_unmount(self):
        self.running = False

    def update_timer(self):
        if not self.running:
            return
            
        stats = calculate_life_stats()
        if stats:
            # Update Date
            self.txt_today.value = f"今天是 {stats['today_str']}"
            
            # Update Grid
            vals = [stats['years_left'], stats['days_left'], stats['hours_left'], stats['minutes_left'], stats['seconds_left']]
            for i, box in enumerate(self.grid_boxes):
                box.value = f"{vals[i]:02d}"

            # Update Bars
            year_done = int(stats['year_percent'] * 1000)
            year_left = 1000 - year_done
            if year_done < 1: year_done = 1
            if year_left < 1: year_left = 1
            
            self.pb_year.content.controls[0].controls = [
                self.pb_year_fill,
                ft.Container(expand=year_left)
            ]
            self.pb_year_fill.expand = year_done
            self.pb_year_text.value = f"今年剩 {stats['year_days_left']} 天 ({stats['year_percent']*100:.1f}%)"

            # Life Bar
            life_done = int(stats['life_percent'] * 1000)
            life_left = 1000 - life_done
            if life_done < 1: life_done = 1
            if life_left < 1: life_left = 1

            self.pb_life.content.controls[0].controls = [
                self.pb_life_fill,
                ft.Container(expand=life_left)
            ]
            self.pb_life_fill.expand = life_done
            self.pb_life_text.value = f"人生剩 {stats['life_days_left_const']} 天 ({stats['life_percent']*100:.0f}%)"

            # Heart
            self.txt_beats_processed.value = f"{stats['processed_beats']:,}"
            self.txt_beats_remaining.value = f"余 {stats['remaining_beats']:,}"
            
            # Heartbeat Animation
            current_scale = self.heart_icon.scale or 1.0
            if current_scale == 1.0:
                self.heart_icon.scale = 1.1
            else:
                self.heart_icon.scale = 1.0

            self.update()
        
        if self.page:
            threading.Timer(1.0, self.update_timer).start()

# ==========================================
# 主程序
# ==========================================
def main(page: ft.Page):
    # --- 1. 全局页面设置 ---
    page.title = "aoao私有工具"
    page.padding = 0
    page.spacing = 0
    page.theme_mode = ft.ThemeMode.DARK
    page.bgcolor = "#2C3E50"  # 深蓝背景
    page.scroll = ft.ScrollMode.HIDDEN
    
    # 目标网站 URL
    TARGET_URL = "https://stock.aoao.life"

    # --- 2. 组件定义 ---

    # 顶部栏 (AppBar)
    def create_app_bar():
        return ft.Container(
            content=ft.Row(
                [
                    ft.Icon(ft.Icons.MENU, color="#33ff00"),
                    ft.Text("aoao私有工具", size=18, weight=ft.FontWeight.BOLD, color="white"),
                    ft.Stack(
                        [
                            ft.Icon(ft.Icons.NOTIFICATIONS, color="#33ff00"),
                            ft.Container(
                                width=8, height=8, bgcolor="red", border_radius=10,
                                margin=ft.Margin.only(left=14, top=2)
                            )
                        ]
                    )
                ],
                alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                vertical_alignment=ft.CrossAxisAlignment.CENTER,
            ),
            height=60,
            bgcolor="#2C3E50",
            padding=ft.Padding.symmetric(horizontal=20),
            shadow=ft.BoxShadow(blur_radius=5, color="#4D000000")
        )
    
    # --- WebView 内容容器 (用于 APP 内嵌打开网页) ---
    # 注意：WebView 只能在 APP/APK 中正常显示，浏览器调试时可能是空白
    webview_content = ft.WebView(
        url=TARGET_URL,
        expand=True,
        on_page_started=lambda _: print("Page started"),
        on_page_ended=lambda _: print("Page ended"),
    )

    # 首页：应用九宫格
    def create_grid_menu():
        menu_items = [
            # 修改：点击 "服务器监控" 也在 APP 内打开
            {"icon": ft.Icons.DNS, "name": "服务器监控", "color": ft.Colors.BLUE_500, "url": TARGET_URL},
            {"icon": ft.Icons.STORAGE, "name": "数据库管理", "color": ft.Colors.ORANGE_500, "url": ""},
            {"icon": ft.Icons.ARTICLE, "name": "日志分析", "color": ft.Colors.GREEN_600, "url": ""},
            {"icon": ft.Icons.TERMINAL, "name": "Web终端", "color": ft.Colors.GREY_700, "url": ""},
            {"icon": ft.Icons.CLOUD, "name": "云盘存储", "color": ft.Colors.CYAN_500, "url": ""},
            {"icon": ft.Icons.CODE, "name": "代码仓库", "color": ft.Colors.PURPLE_600, "url": ""},
            {"icon": ft.Icons.SETTINGS, "name": "系统设置", "color": ft.Colors.BLUE_GREY_600, "url": ""},
            {"icon": ft.Icons.PUBLIC, "name": "公共主页", "color": ft.Colors.PINK_500, "url": ""},
        ]

        items = []
        for item in menu_items:
            # 点击事件
            def on_click_action(e, url=item.get("url"), name=item.get("name")):
                if url == TARGET_URL:
                    # 如果是目标链接，切换到 WebView 视图
                    body_container.content = webview_content
                    body_container.bgcolor = "white"
                    # 可选：让底部导航也高亮“商城”
                    nav_bar.selected_index = 1 
                    page.update()
                elif url:
                    # 其他普通链接，还是调用浏览器打开
                    page.launch_url(url)
                else:
                    print(f"点击了 {name} (无链接)")

            items.append(
                ft.Container(
                    bgcolor=ft.Colors.with_opacity(0.5, "#1f2937"), 
                    border=ft.Border.all(1, ft.Colors.with_opacity(0.05, "white")),
                    border_radius=15,
                    padding=10,
                    ink=True,
                    on_click=on_click_action,
                    content=ft.Column(
                        [
                            ft.Container(
                                content=ft.Icon(item["icon"], color="white", size=20),
                                bgcolor=item["color"],
                                border_radius=8,
                                padding=8,
                                shadow=ft.BoxShadow(blur_radius=5, color=item["color"])
                            ),
                            ft.Text(item["name"], size=10, color="white70", text_align=ft.TextAlign.CENTER, no_wrap=True)
                        ],
                        alignment=ft.MainAxisAlignment.CENTER,
                        horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                        spacing=5
                    )
                )
            )
        
        # 添加按钮
        items.append(
            ft.Container(
                border=ft.Border.all(1, ft.Colors.with_opacity(0.2, "white")),
                border_radius=15,
                content=ft.Column(
                    [
                        ft.Text("+", size=24, color="white30"),
                        ft.Text("添加", size=10, color="white30")
                    ],
                    alignment=ft.MainAxisAlignment.CENTER,
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER
                )
            )
        )

        return ft.GridView(
            runs_count=4,
            child_aspect_ratio=1.0,
            spacing=10,
            run_spacing=10,
            padding=15,
            controls=items,
            expand=False, 
        )

    # 首页内容组合
    life_widget = LifeCountdownWidget()
    
    home_content = ft.Column(
        scroll=ft.ScrollMode.HIDDEN,
        expand=True,
        controls=[
            ft.Container(content=life_widget, padding=20),
            ft.Container(
                padding=ft.Padding.symmetric(horizontal=20),
                content=ft.Row(
                    [
                        ft.Text("私有站点", color="#33ff00", weight="bold", size=14, opacity=0.8),
                        ft.Text("管理", size=12, color="white54")
                    ],
                    alignment=ft.MainAxisAlignment.SPACE_BETWEEN
                )
            ),
            create_grid_menu()
        ]
    )

    # 其他页面的占位符
    placeholder_content = ft.Container(
        expand=True,
        bgcolor="#f9fafb",
        alignment=ft.Alignment(0, 0),
        content=ft.Column(
            [
                ft.Container(
                    width=80, height=80, bgcolor="#e5e7eb", border_radius=40,
                    alignment=ft.Alignment(0, 0),
                    content=ft.Icon(ft.Icons.BUILD, size=40, color="grey")
                ),
                ft.Text("功能开发中...", color="#9ca3af", size=16, margin=ft.Margin.only(top=10))
            ],
            alignment=ft.MainAxisAlignment.CENTER,
            horizontal_alignment=ft.CrossAxisAlignment.CENTER
        )
    )

    # 页面主体容器
    body_container = ft.Container(
        content=home_content,
        expand=True,
        bgcolor="#2C3E50"
    )

    # --- 3. 底部导航逻辑 ---
    def on_nav_change(e):
        index = e.control.selected_index
        
        # --- 底部导航栏点击逻辑 ---
        if index == 1: 
            # 1. 点击商城 -> 在 APP 内显示 WebView
            body_container.content = webview_content
            body_container.bgcolor = "white" # 网页通常是白底
            
        elif index == 0:
            # 2. 点击主页 -> 回到主界面
            body_container.content = home_content
            body_container.bgcolor = "#2C3E50"
            
        else:
            # 3. 其他按钮 -> 显示“开发中”
            body_container.content = placeholder_content
            body_container.bgcolor = "white"
            
        page.update()

    nav_bar = ft.NavigationBar(
        bgcolor="white",
        indicator_color=ft.Colors.BLUE_100,
        selected_index=0,
        on_change=on_nav_change,
        destinations=[
            ft.NavigationBarDestination(icon=ft.Icons.HOME, label="主页"),
            ft.NavigationBarDestination(icon=ft.Icons.SHOPPING_CART, label="商城"), 
            ft.NavigationBarDestination(icon=ft.Icons.BUILD, label="工具"),
            ft.NavigationBarDestination(icon=ft.Icons.BAR_CHART, label="报表"),
            ft.NavigationBarDestination(icon=ft.Icons.PERSON, label="我的"),
        ]
    )

    # --- 4. 组装 ---
    page.add(
        create_app_bar(),
        body_container,
        nav_bar
    )

if __name__ == '__main__':
    print("启动中... 请在浏览器访问: http://localhost:16822")
    ft.run(main, view=ft.AppView.WEB_BROWSER, port=16822)