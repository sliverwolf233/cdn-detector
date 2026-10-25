# 生成 Edge Add-ons 商店清单素材:方形徽标(推荐 300×300,另出 512 备用)。
# 用法: python tools/make_store_assets.py  → 输出到 store-assets/
import os
from PIL import Image, ImageDraw

OUT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "store-assets"))


def make(size):
    s = 8  # 超采样抗锯齿
    S = size * s
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    navy = (13, 27, 54, 255)
    cyan = (56, 189, 248, 255)
    light = (125, 211, 252, 255)

    # 圆角方形底(商店徽标需要占满画布,不用透明盾形)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=navy)

    # 盾牌 + 地球(同扩展图标视觉)
    pts = [(0.50, 0.10), (0.85, 0.22), (0.85, 0.52), (0.50, 0.92), (0.15, 0.52), (0.15, 0.22)]
    pts = [(x * S, y * S) for x, y in pts]
    d.polygon(pts, fill=(20, 38, 72, 255))
    d.line(pts + [pts[0]], fill=cyan, width=max(1, int(S * 0.03)), joint="curve")

    box = [0.31 * S, 0.28 * S, 0.69 * S, 0.66 * S]
    d.ellipse(box, outline=light, width=max(1, int(S * 0.032)))
    d.ellipse([0.42 * S, 0.28 * S, 0.58 * S, 0.66 * S], outline=light, width=max(1, int(S * 0.022)))
    d.line([(0.31 * S, 0.47 * S), (0.69 * S, 0.47 * S)], fill=light, width=max(1, int(S * 0.022)))

    return img.resize((size, size), Image.LANCZOS)


os.makedirs(OUT, exist_ok=True)
for sz in (300, 512):
    make(sz).save(os.path.join(OUT, "logo-%d.png" % sz))
print("store assets written to", OUT)
