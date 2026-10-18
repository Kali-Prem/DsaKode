import os
import base64
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance

def generate():
    rootDir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    png_path = os.path.join(rootDir, 'public', 'icons', 'logo-full.png')
    jpg_path = os.path.join(rootDir, 'public', 'icons', 'logo-full.jpg')
    master_path = png_path if os.path.exists(png_path) else jpg_path

    if not os.path.exists(master_path):
        raise FileNotFoundError(f"Master logo image not found at {master_path}")

    # 1. Load original high-resolution logo
    img = Image.open(master_path).convert('RGB')
    arr = np.array(img)

    # 2. Extract emblem dynamically via blue mask
    blue_mask = (arr[:, :, 2] > 140) & (arr[:, :, 0] < 90) & (arr[:, :, 1] < 190)
    y_indices, x_indices = np.where(blue_mask)
    if len(x_indices) == 0 or len(y_indices) == 0:
        raise ValueError("Could not locate blue emblem in master logo image.")

    min_x, max_x = int(np.min(x_indices)), int(np.max(x_indices))
    min_y, max_y = int(np.min(y_indices)), int(np.max(y_indices))
    emblem = img.crop((min_x, min_y, max_x + 1, max_y + 1))

    # 3. Create 512x512 high-resolution canvas with exact dark background rgb(27, 27, 27) (#1B1B1B)
    canvas_size = 512
    # Target width 430px (~84% width) provides a balanced ~41px margin on left and right
    # so the emblem does not feel cramped or clipped, while remaining big and bold
    target_w = 430
    target_h = int((target_w / emblem.width) * emblem.height)
    emblem_large = emblem.resize((target_w, target_h), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (canvas_size, canvas_size), (27, 27, 27, 255))
    paste_x = (canvas_size - target_w) // 2
    paste_y = (canvas_size - target_h) // 2
    canvas.paste(emblem_large.convert('RGBA'), (paste_x, paste_y))

    # 4. Apply modern squircle rounded corner mask for sleek browser toolbar integration
    mask = Image.new('L', (canvas_size, canvas_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, canvas_size, canvas_size], radius=88, fill=255)
    canvas.putalpha(mask)

    # 5. Output directories
    public_icons = os.path.join(rootDir, 'public', 'icons')
    dist_icons = os.path.join(rootDir, 'dist', 'icons')
    os.makedirs(public_icons, exist_ok=True)
    os.makedirs(dist_icons, exist_ok=True)

    # 6. Generate icon resolutions (16, 32, 48, 128, 512)
    for sz in [16, 32, 48, 128, 512]:
        im = canvas.resize((sz, sz), Image.Resampling.LANCZOS)
        # Boost sharpness and contrast slightly for tiny toolbar/tab sizes
        if sz <= 32:
            im = ImageEnhance.Sharpness(im).enhance(1.4)
            im = ImageEnhance.Contrast(im).enhance(1.1)

        im.save(os.path.join(public_icons, f'icon-{sz}.png'), 'PNG', optimize=True)
        im.save(os.path.join(dist_icons, f'icon-{sz}.png'), 'PNG', optimize=True)
        print(f"Generated icon-{sz}.png ({sz}x{sz})")

    # 7. Generate SVG wrapper for vector contexts
    icon_128_path = os.path.join(public_icons, 'icon-128.png')
    with open(icon_128_path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('utf-8')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <image href="data:image/png;base64,{b64}" width="128" height="128" />
</svg>'''
    with open(os.path.join(public_icons, 'icon.svg'), 'w') as f:
        f.write(svg_content)
    with open(os.path.join(dist_icons, 'icon.svg'), 'w') as f:
        f.write(svg_content)

    print("Successfully generated all DsaKode icons (16, 32, 48, 128, 512, svg) with balanced margin and exact colors!")

if __name__ == '__main__':
    generate()
