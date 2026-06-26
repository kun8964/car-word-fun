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
TMP_DIR = ROOT / "tmp" / "pdfs" / "motorcycle_appendix"
ASSET_DIR = TMP_DIR / "assets"
OUTPUT_DIR = ROOT / "output" / "pdf"
HTML_PATH = TMP_DIR / "经典摩托车补充篇.html"
APPENDIX_PDF = OUTPUT_DIR / "经典摩托车补充篇.pdf"
FINAL_PDF = OUTPUT_DIR / "历史著名车型图鉴_摩托车补充版.pdf"
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

USER_AGENT = "CodexMotorcycleAppendix/1.0 (local document generation)"
CANVAS_SIZE = (1400, 760)


ENTRIES = [
    {
        "title": "Honda Super Cub C100（1958）",
        "status": "全球最具影响力的轻便通勤车",
        "people": "本田宗一郎、城市通勤、亚洲与欧美日常交通",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Honda_super_cub%2C_1st_Gen._1958%2C_Left_side.jpg/1920px-Honda_super_cub%2C_1st_Gen._1958%2C_Left_side.jpg",
        "shape": [
            "低跨梁车架和大护腿板，方便穿着日常服装上下车",
            "半自动离合与卧式单缸发动机，易骑、耐用、维护简单",
            "轻巧窄身和亲和的双色外观，把摩托车带入普通家庭",
        ],
        "history": [
            "1958 年推出，后续车系累计产量突破一亿辆",
            "让摩托车从小众玩具和运动器材变成大众交通工具",
            "成为本田早期全球化的标志车型之一",
        ],
    },
    {
        "title": "Vespa 98（1946）",
        "status": "战后意大利踏板车文化的开端",
        "people": "Piaggio、Corradino D'Ascanio、欧洲城市青年",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/PerthVespa.jpg/1280px-PerthVespa.jpg",
        "shape": [
            "整体式钢制车身包覆机械结构，线条像小型航空器一样圆润",
            "前挡板和宽踏板让骑行者保持整洁，适合城市短途出行",
            "小轮径、后置发动机、单臂前悬挂，形成极高辨识度",
        ],
        "history": [
            "1946 年问世，成为意大利战后复兴和城市自由的象征",
            "被电影、广告和青年文化反复塑造为时髦生活方式符号",
            "奠定现代踏板车的基本比例与使用场景",
        ],
    },
    {
        "title": "Lambretta LI 150 Series 2（1959）",
        "status": "英伦 Mod 文化中最有代表性的踏板车之一",
        "people": "Innocenti、伦敦 Mod 青年、城市骑行社群",
        "image": "https://upload.wikimedia.org/wikipedia/commons/1/1c/1966_Innocenti_Lambretta_Li125_Special_Metallic_Blue_1.jpg",
        "shape": [
            "车身比 Vespa 更修长硬朗，线条平直，带有工业产品的冷峻感",
            "可加装大面积镀铬护杠、后视镜和行李架，个性化空间很强",
            "水平踏板和包覆式侧盖让整车干净利落，便于日常穿搭骑行",
        ],
        "history": [
            "LI 系列推动 Lambretta 在欧洲和英联邦市场流行",
            "与 1960 年代英国 Mod 文化紧密相连，成为青年身份标签",
            "在踏板车历史中代表了与 Vespa 并行的另一条经典路线",
        ],
    },
    {
        "title": "Harley-Davidson EL Knucklehead（1936）",
        "status": "美式 V-Twin 巡航车的重要里程碑",
        "people": "Harley-Davidson 长途骑士、美国公路文化",
        "image": "https://upload.wikimedia.org/wikipedia/commons/7/71/HarleyDavidson_1940_40-EL_3.jpg",
        "shape": [
            "外露 V 型双缸发动机成为视觉中心，机械感强烈",
            "长轴距、低坐姿、宽手把，奠定美式巡航车的基本姿态",
            "水滴油箱和大量金属件，呈现早期美国摩托的粗犷气质",
        ],
        "history": [
            "1936 年引入顶置气门 Knucklehead 发动机，性能和可靠性明显提升",
            "帮助 Harley-Davidson 建立大型公路车的品牌性格",
            "后来成为收藏界和定制车文化中的核心经典",
        ],
    },
    {
        "title": "Indian Scout（1920）",
        "status": "早期美国摩托车工程与竞赛传奇",
        "people": "Indian Motorcycle、Burt Munro、早期耐力赛骑士",
        "image": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Indian_Scout_600_cc_1920.jpg",
        "shape": [
            "紧凑 V-Twin 布局和低矮车架，兼顾轻快操控与长途稳定",
            "早期硬尾车身结构简洁，发动机、油箱和车架比例非常经典",
            "深色漆面和复古金属件带有鲜明的美式老车气息",
        ],
        "history": [
            "1920 年推出后迅速成为 Indian 最受欢迎的车型之一",
            "在公路赛、爬坡赛和速度纪录中都留下过重要身影",
            "为后来美国运动型巡航车和复古车审美提供了模板",
        ],
    },
    {
        "title": "Triumph Bonneville T120（1959）",
        "status": "英式并列双缸摩托的黄金标准",
        "people": "Triumph 工厂车手、Ace Cafe 骑士、摇滚青年文化",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/ZweiRadMuseumNSU_Triumph_Bonneville.JPG/1920px-ZweiRadMuseumNSU_Triumph_Bonneville.JPG",
        "shape": [
            "细长油箱、低平坐垫和并列双缸发动机，比例轻盈优雅",
            "镀铬排气与钢丝轮毂充满 50 年代末英伦运动气质",
            "便于改装成 cafe racer，成为街头速度美学的底色",
        ],
        "history": [
            "以 Bonneville 盐滩速度纪录命名，强调高速与运动精神",
            "在 1960 年代欧美市场大受欢迎，是英国摩托工业的代表作",
            "影响了后来的复古街车、cafe racer 和现代 Bonneville 家族",
        ],
    },
    {
        "title": "BMW R32（1923）",
        "status": "BMW 摩托车传统的起点",
        "people": "Max Friz、早期欧洲长途骑士",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/BMW_R32_vl_TCE.jpg/1920px-BMW_R32_vl_TCE.jpg",
        "shape": [
            "水平对置双缸发动机横向外露，形成 BMW 最具标志性的机械轮廓",
            "轴传动取代链条，外观干净，也适合长途可靠使用",
            "黑色车身与白色手绘线条，奠定早期 BMW 摩托的经典视觉语言",
        ],
        "history": [
            "1923 年发布，是 BMW 第一款量产摩托车",
            "水平对置双缸加轴传动的架构影响 BMW 数十年产品路线",
            "证明摩托车可以兼具工程理性、耐用性和高识别度",
        ],
    },
    {
        "title": "Honda CB750 Four（1969）",
        "status": "量产超级摩托车时代的开端",
        "people": "本田工程团队、全球公路骑士",
        "image": "https://upload.wikimedia.org/wikipedia/commons/3/30/Honda_CB_750_Four.jpg",
        "shape": [
            "横置四缸发动机和四出排气极具视觉冲击力",
            "前盘式制动、宽大油箱和标准街车坐姿，兼顾速度与日用",
            "整车比例简洁平衡，成为 1970 年代日系大型车范本",
        ],
        "history": [
            "1969 年推出，把四缸高性能带入可购买的量产市场",
            "常被视作 superbike 概念真正走向大众的起点",
            "改变了欧美大排量摩托市场格局，推动日系四大厂崛起",
        ],
    },
    {
        "title": "Kawasaki Z1 900（1972）",
        "status": "日系四缸性能街车的强力宣言",
        "people": "Kawasaki 工程团队、70 年代高速公路骑士",
        "image": "https://upload.wikimedia.org/wikipedia/commons/a/a8/KAWASAKI_Z1.jpg",
        "shape": [
            "903 cc 风冷四缸发动机外露，车身肌肉感比 CB750 更强",
            "水滴油箱、鸭尾后盖和双表仪表构成 Z 系列经典符号",
            "棕橙色火焰涂装极有年代感，静止时也显得很快",
        ],
        "history": [
            "1972 年发布后迅速成为大型高性能街车标杆",
            "以强劲动力和较高极速确立 Kawasaki 的性能品牌形象",
            "Z 系列的命名和设计语言延续至现代复古街车",
        ],
    },
    {
        "title": "Ducati 916（1994）",
        "status": "公路跑车设计与 Superbike 赛场的共同巅峰",
        "people": "Massimo Tamburini、Carl Fogarty、Ducati Corse",
        "image": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Ducati_916_SPS.jpg",
        "shape": [
            "单摇臂、座下双排气和极窄车身，比例性感又紧绷",
            "双圆灯与前倾姿态让整车像伏在路面的红色雕塑",
            "钢管编织车架外露，机械结构本身成为设计语言",
        ],
        "history": [
            "1994 年发布，被广泛视为最美量产跑车之一",
            "在 World Superbike 赛场帮助 Ducati 建立统治级声望",
            "影响了后续 996、998 以及大量跑车的设计审美",
        ],
    },
    {
        "title": "Honda VFR750R RC30（1987）",
        "status": "赛道血统极纯的限量 homologation 跑车",
        "people": "Fred Merkel、耐力赛与 Superbike 车队",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/HondaVFR750R.jpg/1920px-HondaVFR750R.jpg",
        "shape": [
            "V4 发动机、单摇臂和铝合金车架，技术含量极高",
            "HRC 红白蓝涂装简洁有力，直接传递厂队赛车气质",
            "紧凑整流罩与双圆灯，是 80 年代末日系跑车的经典面孔",
        ],
        "history": [
            "1987 年推出，主要为了满足 Superbike 赛事认证需求",
            "赢得首届 World Superbike 车手冠军，并在耐力赛中表现出色",
            "成为收藏价值极高的本田经典跑车",
        ],
    },
    {
        "title": "Yamaha YZF-R1（1998）",
        "status": "公升级跑车轻量化革命的代表",
        "people": "Yamaha 工程团队、90 年代末运动骑士",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/2015_Yamaha_YZF-R1_crop.JPG/1920px-2015_Yamaha_YZF-R1_crop.JPG",
        "shape": [
            "短轴距、紧凑发动机和激进坐姿，让公升级跑车变得像 600 级一样灵活",
            "尖锐整流罩和高挑尾部奠定现代仿赛车的攻击性比例",
            "蓝白涂装和双灯前脸成为 Yamaha R 系列的长期记忆点",
        ],
        "history": [
            "1998 年初代 R1 以高功率低重量震动跑车市场",
            "重新定义公升级跑车的操控期待，而不仅是追求极速",
            "R1 家族后来成为 Superbike、耐力赛和赛道日文化的重要车型",
        ],
    },
    {
        "title": "Suzuki GSX1300R Hayabusa（1999）",
        "status": "极速时代最有名的量产摩托之一",
        "people": "Suzuki 工程团队、速度纪录爱好者",
        "image": "https://upload.wikimedia.org/wikipedia/commons/d/de/SUZUKI_Hayabusa_2007TMS.jpg",
        "shape": [
            "圆润流线型整流罩像风洞产物，追求高速稳定而非单纯尖锐",
            "长轴距和厚实车身带来高速巡航的沉稳姿态",
            "独特头灯和大面积包覆件让它一眼就能被认出",
        ],
        "history": [
            "1999 年推出后以极高极速成为全球话题",
            "推动厂家自律限速时代到来，成为速度军备竞赛的象征",
            "在改装、直线加速和运动旅行圈层中长期保持影响力",
        ],
    },
    {
        "title": "Norton Manx（1947）",
        "status": "英国单缸公路赛车的传奇",
        "people": "Isle of Man TT 车手、Manx Norton 私人车队",
        "image": "https://upload.wikimedia.org/wikipedia/commons/4/40/Norton_Classic_Bikes_%282621914686%29_cropped.JPG",
        "shape": [
            "长油箱、低手把和极简赛车车身，完全围绕赛道效率设计",
            "Featherbed 车架以出色操控著称，名字本身成为技术传奇",
            "裸露单缸发动机和细窄轮胎保留了古典赛车的纯粹感",
        ],
        "history": [
            "战后长期活跃于 Isle of Man TT 与各类公路赛",
            "为大量私人车手提供可竞争的赛车平台",
            "Featherbed 车架影响了英国乃至全球运动摩托设计",
        ],
    },
    {
        "title": "MV Agusta 500 Three（1966）",
        "status": "GP 赛场红银传奇的核心战车",
        "people": "Giacomo Agostini、MV Agusta 厂队",
        "image": "https://upload.wikimedia.org/wikipedia/commons/4/42/MV_Agusta_500-3_1967_Barber_noBG.jpg",
        "shape": [
            "三缸发动机带来独特声浪和紧凑布局，车体非常纤细",
            "红银涂装、细长油箱和小型整流罩展现 60 年代 GP 美学",
            "裸露机械与极简座垫让整车看起来像纯粹竞赛器械",
        ],
        "history": [
            "1960 年代后期帮助 MV Agusta 延续 GP 顶级组别统治",
            "Giacomo Agostini 驾驶 MV 赛车赢得大量世界冠军",
            "代表了四冲程 GP 赛车在二冲程全面崛起前的最后辉煌",
        ],
    },
    {
        "title": "Honda NSR500（1985）",
        "status": "二冲程 GP500 时代的速度符号",
        "people": "Freddie Spencer、Wayne Gardner、Mick Doohan",
        "image": "https://upload.wikimedia.org/wikipedia/commons/e/e2/Honda_NSR500_1985.jpg",
        "shape": [
            "铝合金车架、全包整流罩和紧凑二冲程 V4，极端追求赛道性能",
            "Rothmans 涂装成为 80 年代 GP 赛场最醒目的视觉记忆之一",
            "短小尾部与宽大车胎呈现高马力二冲程赛车的野性",
        ],
        "history": [
            "1985 年 Freddie Spencer 驾驶 NSR500 赢得 500 cc 世界冠军",
            "随后 NSR500 车系在 GP500 时代长期保持顶级竞争力",
            "成为现代 MotoGP 之前二冲程最高级别赛车的代表之一",
        ],
    },
    {
        "title": "Yamaha DT-1（1968）",
        "status": "量产双用途越野车的开创性车型",
        "people": "Yamaha 工程团队、美国越野骑士",
        "image": "https://upload.wikimedia.org/wikipedia/commons/f/f0/YAMAHA_DT-1_1968_Yamaha_Communication_Plaza.jpg",
        "shape": [
            "高位挡泥板、长行程悬挂和细窄车身，明显区别于普通街车",
            "二冲程单缸发动机轻巧有劲，适合林道、土路和日常道路",
            "简洁圆灯与小油箱让整车轻便、朴素、功能明确",
        ],
        "history": [
            "1968 年推出，被视为现代 dual-sport 市场的重要起点",
            "让普通消费者可以买到适合公路和越野的轻量车型",
            "推动日本厂家在越野和林道车市场迅速扩张",
        ],
    },
    {
        "title": "Honda CR250M Elsinore（1973）",
        "status": "日本越野赛车崛起的标志",
        "people": "Honda 越野车队、美国 motocross 骑士",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Honda_ELSINORE_CR250M_in_the_honda_collection_hall.JPG/1920px-Honda_ELSINORE_CR250M_in_the_honda_collection_hall.JPG",
        "shape": [
            "铝合金油箱、轻量车架和长行程悬挂，整车极为干练",
            "高位排气和高挡泥板适应泥地、沙地和跳跃冲击",
            "银绿配色简洁醒目，带有早期专业越野赛车气质",
        ],
        "history": [
            "1973 年推出，是 Honda 第一批真正成功的量产 motocross 车型",
            "凭借轻量化和可靠性改变美国越野赛市场格局",
            "Elsinore 名称成为 70 年代越野黄金时代的重要符号",
        ],
    },
    {
        "title": "Bultaco Sherpa T（1965）",
        "status": "现代攀爬车运动的重要奠基者",
        "people": "Sammy Miller、Bultaco 工厂车队",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Bultaco_350_Sherpa_T.jpg/960px-Bultaco_350_Sherpa_T.jpg",
        "shape": [
            "超轻车身、低坐垫和高离地间隙，完全服务于低速障碍通过",
            "短油箱和窄车体便于骑士大幅移动重心",
            "简洁车架与高位排气体现 trials 车型的功能主义美学",
        ],
        "history": [
            "1965 年推出后打破英国四冲程攀爬车的长期优势",
            "Sammy Miller 驾驶它赢得大量 trials 荣誉",
            "确立轻量二冲程攀爬车成为主流的方向",
        ],
    },
    {
        "title": "BMW R80 G/S（1980）",
        "status": "现代大型冒险摩托的源头之一",
        "people": "Hubert Auriol、Gaston Rahier、达喀尔拉力赛",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/BMW_R80GS_GENUINE_2.jpg/1280px-BMW_R80GS_GENUINE_2.jpg",
        "shape": [
            "水平对置双缸与高位车身结合，兼具公路巡航和烂路通过能力",
            "大前轮、长悬挂和宽手把形成后来 adventure bike 的标准姿态",
            "白蓝涂装和简洁风挡让它兼具旅行感与拉力赛车气质",
        ],
        "history": [
            "1980 年推出，把 Gelande/Strasse 概念带入量产市场",
            "在达喀尔拉力赛中取得重要胜利，证明大型摩托也能远征越野",
            "启发了后来 BMW GS 系列以及整个大型 ADV 市场",
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
    font_title = load_font(56)
    font_sub = load_font(26)
    draw.rectangle([0, 0, CANVAS_SIZE[0] - 1, CANVAS_SIZE[1] - 1], outline="#d0d7de", width=3)
    draw.text((70, 300), title, fill="#24292f", font=font_title)
    draw.text((70, 385), "图片素材暂未获取，保留车型文字图鉴", fill="#6b7280", font=font_sub)
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
        "<title>历史著名车型图鉴・经典摩托车补充篇</title>",
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
        "<h1>历史著名车型图鉴・经典摩托车补充篇</h1>",
        '<p class="subtitle">补充越野、赛车、踏板、巡航、冒险等领域的 20 款经典摩托车</p>',
        "<hr>",
        '<h2 class="section-title">🏍️ 经典摩托车篇</h2>',
    ]

    for i, entry in enumerate(ENTRIES, start=1):
        image_path = prepare_image(i, entry)
        parts.extend(
            [
                '<section class="entry">',
                f"<h3>{i}. {html.escape(str(entry['title']))}</h3>",
                f"<p class=\"meta\"><strong>地位：</strong> {html.escape(str(entry['status']))}</p>",
                f"<p class=\"meta\"><strong>代表骑手/场景：</strong> {html.escape(str(entry['people']))}</p>",
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
            "<h3>📋 摩托车补充小结</h3>",
            "<p>这些经典摩托车覆盖了从城市通勤到公路竞速、从泥地越野到长途冒险的不同方向。它们的共同点不只是速度或销量，更在于：</p>",
            "<ul>",
            "<li>改变了使用方式：Super Cub、Vespa、DT-1 让更多人用摩托车完成日常移动和轻度探险</li>",
            "<li>定义了造型语言：Bonneville、Knucklehead、Ducati 916、Hayabusa 都形成了极强的视觉记忆</li>",
            "<li>推动了技术路线：CB750、RC30、R80 G/S 把量产技术和竞赛经验带到更广阔的市场</li>",
            "<li>成为文化符号：Lambretta、Indian Scout、Norton Manx、NSR500 承载了各自时代的骑行想象</li>",
            "</ul>",
            '<p class="note">（注：摩托车补充章节文字由 AI 辅助整理；图片素材来自 Wikimedia Commons / Wikipedia 公开图片并已本地化处理。）</p>',
            "</section>",
            "</body>",
            "</html>",
        ]
    )
    return "\n".join(parts)


def run_chrome_pdf() -> None:
    if not CHROME.exists():
        raise FileNotFoundError(f"Chrome not found: {CHROME}")

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
    for path in [ORIGINAL_PDF, APPENDIX_PDF]:
        reader = PdfReader(str(path))
        for page in reader.pages:
            writer.add_page(page)

    with FINAL_PDF.open("wb") as fh:
        writer.write(fh)


def main() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    HTML_PATH.write_text(build_html(), encoding="utf-8")
    run_chrome_pdf()
    merge_pdfs()
    print(f"Appendix: {APPENDIX_PDF}")
    print(f"Final: {FINAL_PDF}")


if __name__ == "__main__":
    os.environ.setdefault("NO_COLOR", "1")
    main()
