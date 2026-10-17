import os
import cv2
import numpy as np
from PIL import Image, ImageDraw

def generate():
    user_img_path = '/home/kali-prem/.gemini/antigravity-ide/brain/882e1bd3-ec2f-4c46-92aa-886272a27d99/.user_uploaded/media_1792272252243.png'
    if not os.path.exists(user_img_path):
        raise FileNotFoundError(f"User image not found at {user_img_path}")

    # 1. Load original uploaded image
    img = cv2.imread(user_img_path)

    # 2. Extract D emblem: X=[191..461], Y=[107..308]
    d_emblem = img[107:308, 191:461].copy()

    # 3. Clean mouse cursor on bottom ribbon of D
    mask = np.zeros(d_emblem.shape[:2], dtype=np.uint8)
    for y in range(147, 174):
        for x in range(130, 153):
            b, g, r = d_emblem[y, x].astype(int)
            if r > 160 and g > 160 and b > 160:
                mask[y, x] = 255
            elif b < 120 and (y > 150 or x > 132):
                mask[y, x] = 255

    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8))
    d_clean = cv2.inpaint(d_emblem, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)

    # Smooth the tiny seam on the blue ribbon
    for y in range(153, 160):
        for x in range(132, 140):
            d_clean[y, x] = d_clean[y, 145]

    # 4. Clean background inside squircle: fill original D area and bottom text area
    clean_base = img.copy()
    clean_base[70:480, 110:485] = [25, 17, 12]

    # 5. Place cleaned D emblem dead-center inside squircle
    target_y = 171
    target_x = 191
    clean_base[target_y:target_y+201, target_x:target_x+270] = d_clean

    # 6. Crop square squircle 490x490 centered at (297, 272)
    crop_square = clean_base[27:517, 52:542]
    
    # 7. Convert to PIL RGBA and apply squircle corner alpha mask
    crop_rgb = cv2.cvtColor(crop_square, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(crop_rgb).convert('RGBA')
    w, h = pil_img.size

    mask_alpha = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask_alpha)
    draw.rounded_rectangle([9, 8, 481, 482], radius=92, fill=255)
    pil_img.putalpha(mask_alpha)

    # 8. Deploy to public/icons/ and dist/icons/
    os.makedirs('public/icons', exist_ok=True)
    os.makedirs('dist/icons', exist_ok=True)

    for sz in [16, 32, 48, 128]:
        resized = pil_img.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(f'public/icons/icon-{sz}.png', 'PNG', optimize=True)
        resized.save(f'dist/icons/icon-{sz}.png', 'PNG', optimize=True)
        print(f"Generated icon-{sz}.png ({sz}x{sz})")

    # Generate 512 for high-res backup & SVG embed
    pil_img.resize((512, 512), Image.Resampling.LANCZOS).save('public/icons/icon-512.png', 'PNG', optimize=True)
    
    # 9. Create SVG wrapper for vector contexts
    import base64
    with open('public/icons/icon-128.png', 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('utf-8')
    
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <image href="data:image/png;base64,{b64}" width="128" height="128" />
</svg>'''
    with open('public/icons/icon.svg', 'w') as f:
        f.write(svg_content)
    with open('dist/icons/icon.svg', 'w') as f:
        f.write(svg_content)

    print("Successfully generated all DsaKode icons (16, 32, 48, 128, 512, svg)!")

if __name__ == '__main__':
    generate()
