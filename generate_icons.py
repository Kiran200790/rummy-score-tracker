from PIL import Image, ImageDraw, ImageFont
import os

def create_rummy_icon(size):
    """Create a modern Rummy icon with dice and cards theme"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors
    primary_color = (30, 64, 175)  # Blue
    secondary_color = (59, 130, 246)  # Light blue
    accent_color = (255, 255, 255)  # White
    card_color = (248, 250, 252)  # Light gray
    
    # Create gradient background circle
    center = size // 2
    radius = int(size * 0.45)
    
    # Draw gradient background
    for i in range(radius):
        alpha = int(255 * (1 - i / radius))
        color = tuple(int(primary_color[j] + (secondary_color[j] - primary_color[j]) * (i / radius)) 
                     for j in range(3)) + (alpha,)
        draw.ellipse([center-radius+i, center-radius+i, center+radius-i, center+radius-i], 
                    fill=color)
    
    # Draw main circle
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                fill=primary_color + (255,), outline=accent_color, width=max(1, size//64))
    
    # Draw playing cards
    card_width = size // 6
    card_height = size // 4
    card_radius = max(1, size // 32)
    
    # Card positions
    cards = [
        (center - card_width//2 - size//8, center - card_height//2),
        (center - card_width//2 + size//8, center - card_height//2),
        (center - card_width//2, center - card_height//2 + size//8)
    ]
    
    for i, (x, y) in enumerate(cards):
        # Card background
        draw.rounded_rectangle([x, y, x+card_width, y+card_height], 
                             radius=card_radius, fill=card_color, 
                             outline=accent_color, width=max(1, size//128))
        
        # Card suit/number
        if size >= 64:
            try:
                font_size = max(8, size // 16)
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
            except:
                font = ImageFont.load_default()
            
            symbols = ['A', 'K', 'Q']
            text = symbols[i]
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            text_x = x + (card_width - text_width) // 2
            text_y = y + (card_height - text_height) // 2
            draw.text((text_x, text_y), text, fill=primary_color, font=font)
    
    # Draw dice dots if space allows
    if size >= 128:
        dice_size = size // 12
        dice_x = center + size // 6
        dice_y = center + size // 6
        
        # Dice background
        draw.rounded_rectangle([dice_x, dice_y, dice_x+dice_size, dice_y+dice_size], 
                             radius=max(1, size//64), fill=accent_color, 
                             outline=primary_color, width=max(1, size//128))
        
        # Dice dots (showing 6)
        dot_size = max(1, size // 64)
        dot_spacing = dice_size // 4
        for row in range(2):
            for col in range(3):
                dot_x = dice_x + dot_spacing + col * dot_spacing
                dot_y = dice_y + dot_spacing + row * dot_spacing
                draw.ellipse([dot_x, dot_y, dot_x+dot_size, dot_y+dot_size], 
                           fill=primary_color)
    
    return img

def generate_all_icons():
    """Generate all required PWA icon sizes"""
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        print(f"Generating {size}x{size} icon...")
        icon = create_rummy_icon(size)
        icon.save(f'icon-{size}x{size}.png', 'PNG', optimize=True)
    
    # Create favicon
    print("Generating favicon...")
    favicon = create_rummy_icon(32)
    favicon.save('favicon.ico', 'ICO')
    
    print("All icons generated successfully!")

if __name__ == "__main__":
    generate_all_icons()
