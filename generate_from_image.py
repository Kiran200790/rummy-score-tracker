from PIL import Image, ImageDraw, ImageFont
import os

def create_icon_from_image(source_path, size):
    """Create PWA icon from source image"""
    try:
        # Open the source image
        source_img = Image.open(source_path)
        
        # Convert to RGBA if not already
        if source_img.mode != 'RGBA':
            source_img = source_img.convert('RGBA')
        
        # Create a new image with the target size
        icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Calculate scaling to fit the image properly
        source_width, source_height = source_img.size
        
        # Calculate the scaling factor to fit within the icon
        scale_factor = min(size / source_width, size / source_height)
        new_width = int(source_width * scale_factor)
        new_height = int(source_height * scale_factor)
        
        # Resize the source image
        resized_img = source_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Calculate position to center the image
        x = (size - new_width) // 2
        y = (size - new_height) // 2
        
        # Paste the resized image onto the icon
        icon.paste(resized_img, (x, y), resized_img)
        
        return icon
        
    except Exception as e:
        print(f"Error processing image: {e}")
        # Fallback: create a simple colored icon
        return create_fallback_icon(size)

def create_fallback_icon(size):
    """Create a simple fallback icon if image processing fails"""
    img = Image.new('RGBA', (size, size), (88, 101, 242, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw a simple "R" for Rummy
    center = size // 2
    try:
        font_size = max(size // 3, 16)
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica-Bold.ttc", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "R"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_x = center - text_width // 2
    text_y = center - text_height // 2
    
    draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
    return img

def generate_icons_from_source():
    """Generate all PWA icons from the source image"""
    source_path = "joker-source.png"
    
    if not os.path.exists(source_path):
        print(f"Source image {source_path} not found!")
        return
    
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    print(f"Using source image: {source_path}")
    
    for size in sizes:
        print(f"Generating {size}x{size} icon from your Joker image...")
        icon = create_icon_from_image(source_path, size)
        icon.save(f'icons/icon-{size}x{size}.png', 'PNG', optimize=True)
    
    # Create favicon (smaller size)
    print("Generating favicon from your Joker image...")
    favicon = create_icon_from_image(source_path, 32)
    favicon.save('icons/favicon.ico', 'ICO')
    
    print("✅ All icons generated successfully from your Joker image!")
    print("🃏 Your custom Joker image is now your app icon!")

if __name__ == "__main__":
    generate_icons_from_source()
