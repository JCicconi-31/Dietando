from PIL import Image, ImageDraw
from PIL.ImageFont import FreeTypeFont
import os

def make_gradient(width, height, c1=(234, 88, 12), c2=(247, 147, 30)):
    base = Image.new('RGBA', (width, height))
    for y in range(height):
        for x in range(width):
            t = (x + (height - y)) / (width + height)
            r = int(c1[0] * (1 - t) + c2[0] * t)
            g = int(c1[1] * (1 - t) + c2[1] * t)
            b = int(c1[2] * (1 - t) + c2[2] * t)
            base.putpixel((x, y), (r, g, b, 255))
    return base

def create_icon(target_size, is_maskable=False):
    ss = 2
    w = target_size * ss
    h = target_size * ss
    
    img = make_gradient(w, h)
    draw = ImageDraw.Draw(img)
    
    fs = int(w * (0.40 if is_maskable else 0.46))
    font = FreeTypeFont(r"C:\Windows\Fonts\segoeuib.ttf", fs)
    
    text = "OD"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    pos_x = (w - text_w) / 2 - bbox[0]
    pos_y = (h - text_h) / 2 - bbox[1]
    
    # Shadow
    draw.text((pos_x + 3 * ss, pos_y + 4 * ss), text, fill=(0, 0, 0, 60), font=font)
    # White text
    draw.text((pos_x, pos_y), text, fill=(255, 255, 255, 255), font=font)
    
    if not is_maskable:
        radius = int(w * 0.22)
        mask = Image.new('L', (w, h), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([(0, 0), (w, h)], radius=radius, fill=255)
        
        output = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        output.paste(img, (0, 0), mask=mask)
        img = output
        
    return img.resize((target_size, target_size), Image.Resampling.LANCZOS)

out_dir = r"public\icons"
os.makedirs(out_dir, exist_ok=True)
create_icon(192, False).save(os.path.join(out_dir, "icon-192.png"), "PNG")
create_icon(512, False).save(os.path.join(out_dir, "icon-512.png"), "PNG")
create_icon(192, True).save(os.path.join(out_dir, "icon-maskable-192.png"), "PNG")
create_icon(512, True).save(os.path.join(out_dir, "icon-maskable-512.png"), "PNG")
create_icon(180, False).save(os.path.join(out_dir, "apple-touch-icon.png"), "PNG")
print("PWA Icons generated successfully!")
