import os
import base64
from PIL import Image, ImageDraw, ImageEnhance

def generate():
    rootDir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    user_img_path = os.path.join(rootDir, 'public', 'icons', 'logo-full.jpg')

    if not os.path.exists(user_img_path):
        raise FileNotFoundError(f"Master logo image not found at {user_img_path}")

    # 1. Load original high-resolution logo (1024x1024)
    img = Image.open(user_img_path).convert('RGB')

    # 2. Extract DX emblem with precise bounding box (x: 284..762, y: 247..558)
    # This excludes bottom text 'DsaKode' and 'Think Logic. Crack Code.' so emblem is maximized
    emblem = img.crop((284, 247, 762, 558))

    # 3. Create 512x512 high-resolution canvas with matching deep dark background
    canvas_size = 512
    # Scale emblem to fill 96.5% of canvas width (494px wide) for maximum toolbar visibility
    target_w = 494
    target_h = int((target_w / emblem.width) * emblem.height) # ~321px
    emblem_large = emblem.resize((target_w, target_h), Image.Resampling.LANCZOS)

    canvas = Image.new('RGBA', (canvas_size, canvas_size), (1, 2, 6, 255))
    paste_x = (canvas_size - target_w) // 2
    paste_y = (canvas_size - target_h) // 2
    canvas.paste(emblem_large.convert('RGBA'), (paste_x, paste_y))

    # 4. Apply modern squircle rounded corner mask for sleek browser toolbar integration
    mask = Image.new('L', (canvas_size, canvas_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, canvas_size, canvas_size], radius=96, fill=255)
    canvas.putalpha(mask)

    # 5. Output directories
    public_icons = os.path.join(rootDir, 'public', 'icons')
    dist_icons = os.path.join(rootDir, 'dist', 'icons')
    os.makedirs(public_icons, exist_ok=True)
    os.makedirs(dist_icons, exist_ok=True)

    # 6. Generate icon resolutions (16, 32, 48, 128, 512)
    for sz in [16, 32, 48, 128, 512]:
        im = canvas.resize((sz, sz), Image.Resampling.LANCZOS)
        # Boost sharpness and contrast slightly for tiny toolbar sizes so </> pops
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

    print("Successfully generated all DsaKode icons (16, 32, 48, 128, 512, svg) with maximized emblem size!")

if __name__ == '__main__':
    generate()
