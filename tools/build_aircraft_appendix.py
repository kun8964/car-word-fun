from __future__ import annotations

import html
import os
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps
from pypdf import PdfReader, PdfWriter


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL_PDF = Path("/Users/kkk/Desktop/历史著名车型图鉴.pdf")
MOTORCYCLE_PDF = ROOT / "output" / "pdf" / "历史著名车型图鉴_摩托车补充版.pdf"
BASE_PDF = MOTORCYCLE_PDF if MOTORCYCLE_PDF.exists() else ORIGINAL_PDF
TMP_DIR = ROOT / "tmp" / "pdfs" / "aircraft_appendix"
ASSET_DIR = TMP_DIR / "assets"
OUTPUT_DIR = ROOT / "output" / "pdf"
HTML_PATH = TMP_DIR / "经典飞机补充篇.html"
APPENDIX_PDF = OUTPUT_DIR / "经典飞机补充篇.pdf"
FINAL_PDF = OUTPUT_DIR / "历史著名车型图鉴_摩托车与飞机补充版.pdf"
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

USER_AGENT = "CodexAircraftAppendix/1.0 (local document generation)"
CANVAS_SIZE = (1400, 760)


ENTRIES = [
    {
        "title": "Wright Flyer（1903）",
        "status": "人类首次可控、持续、动力飞行的象征",
        "people": "莱特兄弟、Kitty Hawk、航空时代的开端",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/First_flight2.jpg/1920px-First_flight2.jpg",
        "shape": [
            "双翼布局、前置升降舵和后置方向舵，结构轻巧而原始",
            "木质骨架与帆布蒙皮外露，能清楚看到早期航空工程逻辑",
            "飞行员俯卧操纵，整个机器更像会飞的实验平台",
        ],
        "history": [
            "1903 年 12 月 17 日完成载人动力飞行，开启航空时代",
            "证明升力、动力、控制三者可以在同一架飞行器上协同实现",
            "成为后来所有飞机发展史的起点级符号",
        ],
    },
    {
        "title": "Douglas DC-3（1935）",
        "status": "现代民航运输真正成熟的关键机型",
        "people": "泛美、美国航空、二战 C-47 运输机部队",
        "image": "https://upload.wikimedia.org/wikipedia/commons/d/df/Douglas_DC-3%2C_SE-CFP.jpg",
        "shape": [
            "低单翼、全金属机身和后三点式起落架，线条朴素耐看",
            "双活塞发动机提供可靠动力，适合中短程商业航线",
            "宽厚机翼和圆润机鼻呈现 1930 年代航空工业的稳重感",
        ],
        "history": [
            "1935 年首飞，显著提高航空客运的经济性和可靠性",
            "军用 C-47 在二战运输、空投和补给中发挥巨大作用",
            "许多 DC-3 至今仍能飞行，是航空寿命传奇之一",
        ],
    },
    {
        "title": "Supermarine Spitfire（1936）",
        "status": "不列颠空战中最具象征性的英国战斗机",
        "people": "英国皇家空军、R. J. Mitchell、二战盟军飞行员",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Spitfire_-_Season_Premiere_Airshow_2018_%28cropped%29.jpg/1920px-Spitfire_-_Season_Premiere_Airshow_2018_%28cropped%29.jpg",
        "shape": [
            "椭圆翼是最鲜明的视觉标志，兼具优雅外形和优异气动效率",
            "细长机鼻容纳 Merlin 发动机，整体姿态轻盈敏捷",
            "驾驶舱后方线条流畅，展现英式战斗机的精致比例",
        ],
        "history": [
            "1936 年首飞，二战期间持续改进并大量服役",
            "在不列颠空战中与 Hurricane 共同守住英国天空",
            "成为英国航空工业、抵抗精神和二战记忆的核心符号",
        ],
    },
    {
        "title": "Messerschmitt Bf 109（1935）",
        "status": "二战德军最重要的主力战斗机",
        "people": "德国空军、Willy Messerschmitt、Erich Hartmann",
        "image": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Bundesarchiv_Bild_101I-662-6659-37%2C_Flugzeug_Messerschmitt_Me_109.jpg",
        "shape": [
            "窄机身、小翼面积和收放式起落架，设计紧凑而高效",
            "直列发动机让机鼻细长，整体轮廓锐利",
            "后期型号武装加强，形成强烈的拦截机气质",
        ],
        "history": [
            "1935 年首飞，几乎贯穿德国空军整个二战历程",
            "产量极高，是航空史上最著名的单发战斗机之一",
            "与 Spitfire、Mustang 等机型共同定义了螺旋桨空战时代",
        ],
    },
    {
        "title": "North American P-51 Mustang（1940）",
        "status": "远程护航战斗机的经典答案",
        "people": "美国陆军航空队、欧洲战略轰炸护航飞行员",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/P-51-361.jpg/1920px-P-51-361.jpg",
        "shape": [
            "层流翼设计、低阻机身和腹部散热器，外形干净高速",
            "D 型气泡座舱视野开阔，成为后期 Mustang 的经典面孔",
            "长航程副油箱让它具备跨越欧洲上空的护航能力",
        ],
        "history": [
            "1940 年首飞，换装 Merlin 发动机后性能大幅提升",
            "帮助盟军轰炸机深入德国腹地并降低损失",
            "战后在多国继续服役，也成为航展和收藏界明星",
        ],
    },
    {
        "title": "Mitsubishi A6M Zero（1940）",
        "status": "太平洋战争早期最具代表性的舰载战斗机",
        "people": "日本海军航空队、航母舰载机飞行员",
        "image": "https://upload.wikimedia.org/wikipedia/commons/a/a7/A6M3_Zero_N712Z_1.jpg",
        "shape": [
            "轻量化机身、大翼展和收放式起落架，强调航程与机动",
            "圆润座舱和简洁机鼻让整机显得轻盈灵活",
            "舰载结构适应航母起降，外形比同期许多战斗机更纤细",
        ],
        "history": [
            "1940 年入役，太平洋战争初期以机动性和航程震动对手",
            "参与珍珠港、珊瑚海、中途岛等关键战役",
            "随着盟军战术和新机型发展，其防护不足逐渐暴露",
        ],
    },
    {
        "title": "Boeing B-52 Stratofortress（1952）",
        "status": "战略轰炸机长寿传奇",
        "people": "美国空军战略司令部、远程轰炸与威慑任务",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/B-52_Stratofortress_assigned_to_the_307th_Bomb_Wing_%28cropped%29.jpg/1920px-B-52_Stratofortress_assigned_to_the_307th_Bomb_Wing_%28cropped%29.jpg",
        "shape": [
            "巨大后掠翼和 8 台喷气发动机，形成压倒性的远程轰炸机轮廓",
            "细长机身、翼下吊舱和高展弦比机翼强调航程与载荷",
            "外观并不追求隐身，却有强烈的冷战战略威慑气质",
        ],
        "history": [
            "1952 年首飞，1955 年开始服役，服役周期极其漫长",
            "从核威慑到常规远程打击，任务形态不断更新",
            "凭借升级能力成为航空史上最具生命力的轰炸机之一",
        ],
    },
    {
        "title": "Mikoyan-Gurevich MiG-21（1955）",
        "status": "冷战时期产量最高、分布最广的喷气战斗机之一",
        "people": "苏联空军、华约国家、第三世界空军",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Croatian_MiG-21_%28cropped%29.jpg/1920px-Croatian_MiG-21_%28cropped%29.jpg",
        "shape": [
            "三角翼、机头进气道和细长机身，轮廓极简而高速",
            "小尺寸、轻重量和高推重比让它像一支空中标枪",
            "座舱视野有限但结构紧凑，充分体现早期超声速截击机思路",
        ],
        "history": [
            "1955 年首飞，后续型号数量庞大并出口到大量国家",
            "参与越南战争、中东战争、印巴战争等多场冲突",
            "以低成本、高速度和易维护成为冷战航空扩散的代表",
        ],
    },
    {
        "title": "McDonnell Douglas F-4 Phantom II（1958）",
        "status": "跨军种服役的重型喷气战斗机代表",
        "people": "美国海军、美国空军、越南战争飞行员",
        "image": "https://upload.wikimedia.org/wikipedia/commons/2/2b/QF-4_Holloman_AFB.jpg",
        "shape": [
            "双发、双座、大进气道，整体外形厚重有力量感",
            "下反外翼和上反尾翼形成非常独特的 Phantom 轮廓",
            "机鼻雷达罩巨大，体现导弹时代早期的截击机需求",
        ],
        "history": [
            "1958 年首飞，先后服务于美国海军、海军陆战队和空军",
            "在越南战争中成为美军空中作战的主力机型之一",
            "大量出口并长期服役，影响了多国空军现代化",
        ],
    },
    {
        "title": "Lockheed SR-71 Blackbird（1964）",
        "status": "高空高速侦察机的巅峰作品",
        "people": "Lockheed Skunk Works、美国空军侦察飞行员",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Lockheed_SR-71_Blackbird.jpg/1920px-Lockheed_SR-71_Blackbird.jpg",
        "shape": [
            "黑色钛合金机身、尖锐边条和细长机体，像来自未来的飞行器",
            "双发动机短舱与机身融合，专为三倍音速巡航优化",
            "机鼻和边条轮廓兼具高速气动与早期雷达散射控制思路",
        ],
        "history": [
            "1964 年首飞，长期执行高空高速战略侦察任务",
            "以超过 3 马赫速度和极高飞行高度躲避威胁",
            "至今仍是航空工程、材料和发动机设计的传奇案例",
        ],
    },
    {
        "title": "Boeing 747（1969）",
        "status": "喷气客机大众化时代的空中女王",
        "people": "Pan Am、Joe Sutter、全球洲际航线",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/B-747_Iberia.jpg/1920px-B-747_Iberia.jpg",
        "shape": [
            "标志性的上层甲板隆起让它一眼可辨",
            "宽体双通道客舱和四台发动机，象征洲际航空的规模化",
            "巨大机翼与高大垂尾带来庄重、稳定的远程客机姿态",
        ],
        "history": [
            "1969 年首飞，极大降低远程航空旅行的单位成本",
            "开启宽体客机时代，改变全球民航网络和机场基础设施",
            "在客运、货运和专机领域都留下深远影响",
        ],
    },
    {
        "title": "Concorde（1969）",
        "status": "超声速客运最具浪漫色彩的代表",
        "people": "英国航空、法国航空、跨大西洋商务旅客",
        "image": "https://upload.wikimedia.org/wikipedia/commons/e/eb/British_Airways_Concorde_G-BOAC_03.jpg",
        "shape": [
            "细长机身、三角翼和可下垂机鼻，极具未来感",
            "白色涂装不仅优雅，也帮助应对高速飞行的热环境",
            "狭长舷窗和尖锐轮廓让它更像高速实验机而非普通客机",
        ],
        "history": [
            "1969 年首飞，1976 年投入商业运营",
            "以约 2 马赫速度连接欧洲与北美，缩短跨洋旅行时间",
            "运营成本、噪声和航线限制使其成为辉煌但短暂的民航传奇",
        ],
    },
    {
        "title": "Grumman F-14 Tomcat（1970）",
        "status": "可变后掠翼舰载战斗机的流行文化图腾",
        "people": "美国海军、VF-84、电影《Top Gun》",
        "image": "https://upload.wikimedia.org/wikipedia/commons/f/f7/US_Navy_051105-F-5480T-005_An_F-14D_Tomcat_conducts_a_mission_over_the_Persian_Gulf-region.jpg",
        "shape": [
            "可变后掠翼兼顾低速舰载起降和高速截击",
            "双座、双垂尾、宽间距发动机形成极具气势的平面轮廓",
            "机鼻修长，配合 Phoenix 导弹系统，带有强烈远程拦截气质",
        ],
        "history": [
            "1970 年首飞，长期作为美国海军航母舰队防空核心",
            "AIM-54 Phoenix 导弹系统让其具备远距离多目标拦截能力",
            "因电影与航母文化成为最广为人知的战斗机之一",
        ],
    },
    {
        "title": "General Dynamics F-16 Fighting Falcon（1974）",
        "status": "轻型多用途战斗机的全球标杆",
        "people": "美国空军、北约盟国、多国飞行员",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/F-16_June_2008.jpg/1920px-F-16_June_2008.jpg",
        "shape": [
            "气泡座舱、边条翼和腹部进气道，视野与机动性都很突出",
            "单发轻型布局降低成本，却保留强大的空战能力",
            "侧杆操纵和电传飞控让它成为现代战斗机操纵哲学的代表",
        ],
        "history": [
            "1974 年首飞，后来发展为全球最成功的多用途战机之一",
            "大量出口并持续升级，承担制空、对地、侦察等任务",
            "证明高机动、低成本和多用途可以在同一平台上平衡",
        ],
    },
    {
        "title": "Lockheed C-130 Hercules（1954）",
        "status": "战术运输机中的常青树",
        "people": "美国空军、多国空军、人道救援与特种任务部队",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Lockheed_C-130_Hercules.jpg/1920px-Lockheed_C-130_Hercules.jpg",
        "shape": [
            "高单翼、四台涡桨发动机和后部货舱跳板，功能性非常直接",
            "粗壮起落架适合简易跑道起降，强调可靠和耐用",
            "机身方正宽大，是为货物、伞兵和装备服务的实用设计",
        ],
        "history": [
            "1954 年首飞，后续改型覆盖运输、加油、炮艇、搜救等任务",
            "在战争、灾害救援和远征部署中长期承担骨干角色",
            "至今仍在生产和服役，是军用运输机史上的长寿传奇",
        ],
    },
    {
        "title": "Sikorsky UH-60 Black Hawk（1974）",
        "status": "现代通用军用直升机的代表",
        "people": "美国陆军、多国陆航部队、特种作战与救援任务",
        "image": "https://upload.wikimedia.org/wikipedia/commons/2/2e/National-Guard-UH-60-Black-Hawk-operations-at-Fort-McCoy.jpg",
        "shape": [
            "双发中型直升机布局，机身紧凑但载员和任务空间充足",
            "四叶主旋翼、尾桨和短翼挂架形成强烈的军用功能感",
            "黑色或低可视涂装让它与夜间突击、机降和救援任务紧密相连",
        ],
        "history": [
            "1974 年首飞，1979 年起进入美国陆军服役",
            "广泛承担机降、医疗后送、搜救、特种作战和运输任务",
            "大量出口并衍生出海军、空军和特战版本",
        ],
    },
    {
        "title": "Boeing CH-47 Chinook（1961）",
        "status": "纵列双旋翼重型运输直升机的经典",
        "people": "美国陆军、远征运输部队、山地与高原补给任务",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/CH-47_assigned_to_3rd_General_Support_Aviation_Battalion%2C_82nd_Combat_Aviation_Brigade.jpg/1920px-CH-47_assigned_to_3rd_General_Support_Aviation_Battalion%2C_82nd_Combat_Aviation_Brigade.jpg",
        "shape": [
            "前后纵列双旋翼取消尾桨，造型极具辨识度",
            "宽大货舱、后舱门和外吊能力让它专注于重载运输",
            "粗壮机身配合高起落架，呈现强烈的工程机械感",
        ],
        "history": [
            "1961 年首飞，越南战争以来长期承担重型直升机运输任务",
            "可运输人员、火炮、车辆和补给，适应复杂地形环境",
            "持续升级到现代仍广泛服役，证明纵列双旋翼方案的生命力",
        ],
    },
    {
        "title": "Northrop Grumman B-2 Spirit（1989）",
        "status": "飞翼隐身战略轰炸机的代表",
        "people": "美国空军、远程隐身打击任务",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/B-2_Spirit_original.jpg/960px-B-2_Spirit_original.jpg",
        "shape": [
            "无尾飞翼布局几乎抹掉传统机身和尾翼边界",
            "黑灰色扁平轮廓强调低可探测性，像一片掠过天空的阴影",
            "发动机进排气与机体融合，细节都围绕隐身目标服务",
        ],
        "history": [
            "1989 年首飞，是冷战末期高端航空技术的集中体现",
            "具备远程、重载和低可探测突防能力",
            "虽然数量很少，但成为隐身轰炸机概念的标志性形象",
        ],
    },
    {
        "title": "Lockheed Martin F-22 Raptor（1997）",
        "status": "第五代制空战斗机的标杆",
        "people": "美国空军、隐身制空与超音速巡航任务",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/F-22_Raptor_edit1_%28cropped%29.jpg/1920px-F-22_Raptor_edit1_%28cropped%29.jpg",
        "shape": [
            "菱形机翼、倾斜双垂尾和内置弹舱构成典型隐身外形",
            "二维推力矢量喷口提升机动能力，也让尾部造型非常特别",
            "整体线条克制、锐利，传递高技术制空平台的冷峻感",
        ],
        "history": [
            "1997 年首飞，2005 年正式服役",
            "融合隐身、超巡、超机动和先进航电，确立第五代战斗机标准",
            "数量有限但影响巨大，长期被视为制空战斗机性能标杆",
        ],
    },
    {
        "title": "Chengdu J-20（2011）",
        "status": "中国第五代隐身战斗机的代表",
        "people": "中国空军、成都飞机工业集团、现代远程制空任务",
        "image": "https://upload.wikimedia.org/wikipedia/commons/7/73/J-20_at_CCAS2022_%2820220827103424%29.jpg",
        "shape": [
            "鸭翼、边条和大三角主翼组合，外形修长而有张力",
            "内置弹舱与低可探测外形体现现代隐身战机特征",
            "宽间距双发和尖锐机鼻让整机带有远程高速截击气质",
        ],
        "history": [
            "2011 年首飞，2017 年开始服役并持续改进",
            "标志中国进入第五代隐身战斗机研制与装备序列",
            "与 F-22、F-35、Su-57 等共同构成现代隐身战机时代的代表机型",
        ],
    },
]


def slugify(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9]+", "_", value)
    return value.strip("_").lower() or "image"


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def make_placeholder(path: Path, title: str) -> None:
    canvas = Image.new("RGB", CANVAS_SIZE, "#f3f4f6")
    draw = ImageDraw.Draw(canvas)
    font_title = load_font(54)
    font_sub = load_font(25)
    draw.rectangle([0, 0, CANVAS_SIZE[0] - 1, CANVAS_SIZE[1] - 1], outline="#d0d7de", width=3)
    draw.text((70, 300), title, fill="#24292f", font=font_title)
    draw.text((70, 385), "图片素材暂未获取，保留飞行器文字图鉴", fill="#6b7280", font=font_sub)
    canvas.save(path, "JPEG", quality=90, optimize=True)


def download_image(url: str, raw_path: Path) -> bool:
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        result = subprocess.run(
            [
                "curl",
                "-L",
                "--connect-timeout",
                "15",
                "--max-time",
                "45",
                "--retry",
                "2",
                "--retry-delay",
                "2",
                "-A",
                USER_AGENT,
                "-sS",
                "-o",
                str(raw_path),
                url,
            ],
            text=True,
            capture_output=True,
            timeout=55,
        )
    except subprocess.TimeoutExpired:
        return False
    return result.returncode == 0 and raw_path.exists() and raw_path.stat().st_size > 1024


def prepare_image(index: int, entry: dict[str, object]) -> str:
    slug = slugify(str(entry["title"]))
    raw_path = ASSET_DIR / f"{index:02d}_{slug}_raw"
    final_path = ASSET_DIR / f"{index:02d}_{slug}.jpg"
    if final_path.exists():
        return final_path.relative_to(TMP_DIR).as_posix()

    ok = download_image(str(entry["image"]), raw_path)
    if not ok:
        make_placeholder(final_path, str(entry["title"]))
        return final_path.relative_to(TMP_DIR).as_posix()

    try:
        with Image.open(raw_path) as img:
            img = ImageOps.exif_transpose(img).convert("RGB")
            img.thumbnail((CANVAS_SIZE[0] - 48, CANVAS_SIZE[1] - 48), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", CANVAS_SIZE, "#ffffff")
            x = (CANVAS_SIZE[0] - img.width) // 2
            y = (CANVAS_SIZE[1] - img.height) // 2
            canvas.paste(img, (x, y))
            canvas.save(final_path, "JPEG", quality=90, optimize=True)
    except Exception:
        make_placeholder(final_path, str(entry["title"]))

    return final_path.relative_to(TMP_DIR).as_posix()


def render_list(items: list[str]) -> str:
    return "<ul>" + "".join(f"<li>{html.escape(item)}</li>" for item in items) + "</ul>"


def build_html() -> str:
    parts = [
        "<!doctype html>",
        '<html lang="zh-CN">',
        "<head>",
        '<meta charset="utf-8">',
        "<title>历史著名车型图鉴・经典飞机补充篇</title>",
        "<style>",
        """
@page {
  size: A4;
  margin: 15mm 11mm 16mm 11mm;
}
html, body {
  margin: 0;
  padding: 0;
}
body {
  color: #24292f;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "Noto Sans CJK SC", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
h1 {
  font-size: 31px;
  line-height: 1.22;
  margin: 34px 0 22px;
  font-weight: 760;
  letter-spacing: 0;
}
.subtitle {
  font-size: 16px;
  margin: 0 0 24px;
}
hr {
  border: 0;
  border-top: 1px solid #d8dee4;
  margin: 24px 0 34px;
}
.section-title {
  font-size: 23px;
  line-height: 1.35;
  margin: 0 0 24px;
  font-weight: 760;
}
.entry {
  margin: 0 0 29px;
}
.entry + .entry {
  border-top: 1px solid #d8dee4;
  padding-top: 25px;
}
h3 {
  font-size: 21px;
  line-height: 1.36;
  margin: 0 0 10px;
  font-weight: 760;
}
.meta {
  margin: 3px 0;
  font-size: 16px;
}
.vehicle-image {
  display: block;
  width: 100%;
  height: auto;
  margin: 18px 0 15px;
  page-break-inside: avoid;
  break-inside: avoid;
}
.label {
  font-weight: 760;
  margin: 10px 0 5px;
}
ul {
  margin: 5px 0 12px;
  padding-left: 24px;
}
li {
  margin: 6px 0;
  padding-left: 4px;
}
li::marker {
  color: #2563eb;
  font-size: 1.05em;
}
.summary {
  border-top: 1px solid #d8dee4;
  margin-top: 30px;
  padding-top: 26px;
}
.note {
  color: #8c8c8c;
  font-size: 13px;
  margin-top: 16px;
}
""",
        "</style>",
        "</head>",
        "<body>",
        "<h1>历史著名车型图鉴・经典飞机补充篇</h1>",
        '<p class="subtitle">补充战斗机、轰炸机、运输机、客机、直升机等领域的 20 款经典飞行器</p>',
        "<hr>",
        '<h2 class="section-title">✈️ 经典飞机与直升机篇</h2>',
    ]

    for i, entry in enumerate(ENTRIES, start=1):
        image_path = prepare_image(i, entry)
        parts.extend(
            [
                '<section class="entry">',
                f"<h3>{i}. {html.escape(str(entry['title']))}</h3>",
                f"<p class=\"meta\"><strong>地位：</strong> {html.escape(str(entry['status']))}</p>",
                f"<p class=\"meta\"><strong>代表人物/使用者：</strong> {html.escape(str(entry['people']))}</p>",
                f'<img class="vehicle-image" src="{html.escape(image_path)}" alt="{html.escape(str(entry["title"]))}">',
                '<p class="label">造型特点：</p>',
                render_list(entry["shape"]),  # type: ignore[arg-type]
                '<p class="label">历史成就：</p>',
                render_list(entry["history"]),  # type: ignore[arg-type]
                "</section>",
            ]
        )

    parts.extend(
        [
            '<section class="summary">',
            "<h3>📋 飞机补充小结</h3>",
            "<p>这些经典飞行器把交通工具的尺度从地面扩展到天空。它们的共同点在于：</p>",
            "<ul>",
            "<li>改变了移动方式：Wright Flyer、DC-3、Boeing 747 和 Concorde 重新定义了人类跨越距离的方式</li>",
            "<li>塑造了空战形态：Spitfire、Bf 109、MiG-21、F-14、F-16、F-22 和 J-20 对应不同代际的制空思想</li>",
            "<li>代表了战略能力：B-52、B-2、SR-71 展现了远程打击、隐身突防和高速侦察的工程极限</li>",
            "<li>服务了复杂任务：C-130、Black Hawk、Chinook 证明运输、救援和机降同样能成为航空史主角</li>",
            "</ul>",
            '<p class="note">（注：飞机补充章节文字由 AI 辅助整理；图片素材来自 Wikimedia Commons / Wikipedia 公开图片并已本地化处理。）</p>',
            "</section>",
            "</body>",
            "</html>",
        ]
    )
    return "\n".join(parts)


def run_chrome_pdf() -> None:
    if not CHROME.exists():
        raise FileNotFoundError(f"Chrome not found: {CHROME}")
    if APPENDIX_PDF.exists():
        APPENDIX_PDF.unlink()

    for args in (
        ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer"],
        ["--headless", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer"],
        ["--headless", "--disable-gpu", "--no-sandbox"],
    ):
        result = subprocess.run(
            [
                str(CHROME),
                *args,
                f"--print-to-pdf={APPENDIX_PDF}",
                HTML_PATH.resolve().as_uri(),
            ],
            text=True,
            capture_output=True,
            timeout=120,
        )
        if result.returncode == 0 and APPENDIX_PDF.exists() and APPENDIX_PDF.stat().st_size > 10_000:
            return
    raise RuntimeError("Chrome PDF export failed")


def merge_pdfs() -> None:
    writer = PdfWriter()
    for path in [BASE_PDF, APPENDIX_PDF]:
        reader = PdfReader(str(path))
        for page in reader.pages:
            writer.add_page(page)

    if FINAL_PDF.exists():
        FINAL_PDF.unlink()
    with FINAL_PDF.open("wb") as fh:
        writer.write(fh)


def main() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    HTML_PATH.write_text(build_html(), encoding="utf-8")
    run_chrome_pdf()
    merge_pdfs()
    print(f"Base: {BASE_PDF}")
    print(f"Appendix: {APPENDIX_PDF}")
    print(f"Final: {FINAL_PDF}")


if __name__ == "__main__":
    os.environ.setdefault("NO_COLOR", "1")
    main()
