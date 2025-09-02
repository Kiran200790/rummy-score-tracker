from PIL import Image, ImageDraw, ImageFont
import os
import math

def create_friendly_rummy_icon(size):
    """Create a friendly, colorful Rummy icon with cards and dice"""
    # Create image with gradient background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Friendly colors
    bg_blue = (59, 130, 246)      # Nice blue
    bg_purple = (139, 92, 246)    # Soft purple
    card_white = (255, 255, 255)  # Clean white
    card_red = (239, 68, 68)      # Bright red
    card_black = (31, 41, 55)     # Dark gray
    gold_accent = (251, 191, 36)  # Gold
    green_accent = (34, 197, 94)  # Green
    
    center = size // 2
    radius = int(size * 0.48)
    
    # Draw gradient background circle
    for i in range(radius):
        progress = i / radius
        r = int(bg_blue[0] + (bg_purple[0] - bg_blue[0]) * progress)
        g = int(bg_blue[1] + (bg_purple[1] - bg_blue[1]) * progress)
        b = int(bg_blue[2] + (bg_purple[2] - bg_blue[2]) * progress)
        color = (r, g, b, 255)
        
        draw.ellipse([center-radius+i, center-radius+i, center+radius-i, center+radius-i], 
                    fill=color)
    
    # Draw main border
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                outline=card_white, width=max(2, size//32))
    
    # Draw playing cards in a fan layout
    card_width = int(size * 0.25)
    card_height = int(size * 0.35)
    card_radius = max(2, size // 32)
    
    # Three cards in fan formation
    cards_data = [
        (-size//6, -size//12, -15, card_red, "A"),    # Left card - Ace of Hearts
        (0, -size//8, 0, card_black, "K"),           # Center card - King of Spades  
        (size//6, -size//12, 15, card_red, "Q")      # Right card - Queen of Diamonds
    ]
    
    for card_x, card_y, angle, suit_color, text in cards_data:
        # Create temporary image for rotated card
        card_img = Image.new('RGBA', (card_width + 20, card_height + 20), (0, 0, 0, 0))
        card_draw = ImageDraw.Draw(card_img)
        
        # Draw card background
        card_draw.rounded_rectangle([10, 10, card_width + 10, card_height + 10], 
                                  radius=card_radius, fill=card_white, 
                                  outline=(200, 200, 200), width=1)
        
        # Add card text/suit
        if size >= 64:
            try:
                font_size = max(6, size // 20)
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica-Bold.ttc", font_size)
            except:
                font = ImageFont.load_default()
            
            # Card letter
            bbox = card_draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            text_x = 10 + (card_width - text_width) // 2
            text_y = 10 + (card_height - text_height) // 2 - size//32
            card_draw.text((text_x, text_y), text, fill=suit_color, font=font)
            
            # Small suit symbol
            suit_symbols = {"A": "♥", "K": "♠", "Q": "♦"}
            symbol = suit_symbols.get(text, "♣")
            symbol_y = text_y + text_height + size//64
            card_draw.text((text_x + text_width//2 - size//64, symbol_y), symbol, 
                          fill=suit_color, font=font)
        
        # Rotate card
        rotated_card = card_img.rotate(angle, expand=True)
        
        # Paste onto main image
        paste_x = center + card_x - rotated_card.width // 2
        paste_y = center + card_y - rotated_card.height // 2
        img.paste(rotated_card, (paste_x, paste_y), rotated_card)
    
    # Draw dice in corner
    if size >= 96:
        dice_size = size // 8
        dice_x = center + size // 4
        dice_y = center + size // 4
        
        # Dice background with rounded corners
        draw.rounded_rectangle([dice_x, dice_y, dice_x + dice_size, dice_y + dice_size], 
                             radius=max(1, size//48), fill=card_white, 
                             outline=card_black, width=max(1, size//64))
        
        # Dice dots (showing 5)
        dot_size = max(1, size // 48)
        margin = dice_size // 6
        
        # Five dots pattern
        dots = [
            (dice_x + margin, dice_y + margin),                    # Top left
            (dice_x + dice_size - margin, dice_y + margin),        # Top right
            (dice_x + dice_size//2, dice_y + dice_size//2),        # Center
            (dice_x + margin, dice_y + dice_size - margin),        # Bottom left
            (dice_x + dice_size - margin, dice_y + dice_size - margin)  # Bottom right
        ]
        
        for dot_x, dot_y in dots:
            draw.ellipse([dot_x - dot_size//2, dot_y - dot_size//2, 
                         dot_x + dot_size//2, dot_y + dot_size//2], fill=card_red)
    
    # Add small decorative elements
    if size >= 128:
        # Small sparkles around the design
        sparkle_positions = [
            (center - radius + size//16, center - radius//2),
            (center + radius - size//16, center - radius//2),
            (center - radius//2, center + radius - size//16),
            (center + radius//2, center + radius - size//16)
        ]
        
        for sparkle_x, sparkle_y in sparkle_positions:
            sparkle_size = max(2, size // 32)
            draw.ellipse([sparkle_x - sparkle_size, sparkle_y - sparkle_size,
                         sparkle_x + sparkle_size, sparkle_y + sparkle_size], 
                        fill=gold_accent)
    
    return img

def generate_all_icons():
    """Generate all required PWA icon sizes with friendly Rummy theme"""
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        print(f"Generating friendly Rummy {size}x{size} icon...")
        icon = create_friendly_rummy_icon(size)
        icon.save(f'icons/icon-{size}x{size}.png', 'PNG', optimize=True)
    
    # Create favicon
    print("Generating friendly favicon...")
    favicon = create_friendly_rummy_icon(32)
    favicon.save('icons/favicon.ico', 'ICO')
    
    print("All friendly Rummy icons generated successfully!")
    print("� Your app now has a colorful, welcoming card game icon! 🃏")

if __name__ == "__main__":
    generate_all_icons()
