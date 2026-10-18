# 生成扩展图标(盾牌 + 地球线稿,深色底青色描边),输出到 icons/ 目录。
# 用法: python tools/make_icons.py
import os
from PIL import Image, ImageDraw

OUT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons"))


def make(size):
    s = 8  # 超采样倍数
    S = size * s
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    navy = (13, 27, 54, 255)
    cyan = (56, 189, 248, 255)
    light = (125, 211, 252, 255)

    # 盾牌外形
    pts = [(0.50, 0.05), (0.90, 0.20), (0.90, 0.52), (0.50, 0.95), (0.10, 0.52), (0.10, 0.20)]
    pts = [(x * S, y * S) for x, y in pts]
    d.polygon(pts, fill=navy)
    d.line(pts + [pts[0]], fill=cyan, width=max(1, int(S * 0.04)), joint="curve")

    # 地球(代表 CDN 网络)
    box = [0.30 * S, 0.26 * S, 0.70 * S, 0.66 * S]
    d.ellipse(box, outline=light, width=max(1, int(S * 0.035)))
    d.ellipse([0.42 * S, 0.26 * S, 0.58 * S, 0.66 * S], outline=light, width=max(1, int(S * 0.025)))
    d.line([(0.30 * S, 0.46 * S), (0.70 * S, 0.46 * S)], fill=light, width=max(1, int(S * 0.025)))

    return img.resize((size, size), Image.LANCZOS)


os.makedirs(OUT, exist_ok=True)
for sz in (16, 32, 48, 128):
    make(sz).save(os.path.join(OUT, "icon%d.png" % sz))
print("icons written to", OUT)
