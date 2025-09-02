from PIL import Image, ImageDraw, ImageFont
import os
import math

def create_joker_icon(size):
    """Create a Joker-themed icon inspired by Batman movie aesthetic"""
    # Create image with dark background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    
    # Colors inspired by Joker
    bg_dark = (20, 20, 30)        # Very dark purple-black
    face_white = (240, 240, 240)   # Pale white
    joker_purple = (75, 0, 130)    # Dark purple
    joker_green = (0, 100, 0)      # Dark green
    blood_red = (139, 0, 0)        # Dark red
    accent_gold = (255, 215, 0)    # Gold accent
    
    center = size // 2
    face_radius = int(size * 0.42)
    
    # Draw dark background circle
    draw.ellipse([center-face_radius-10, center-face_radius-10, 
                 center+face_radius+10, center+face_radius+10], 
                fill=bg_dark)
    
    # Draw face (pale white circle)
    draw.ellipse([center-face_radius, center-face_radius, 
                 center+face_radius, center+face_radius], 
                fill=face_white, outline=joker_purple, width=max(2, size//64))
    
    # Draw Joker smile (exaggerated grin)
    smile_width = int(face_radius * 1.4)
    smile_height = int(face_radius * 0.6)
    smile_y = center + int(face_radius * 0.1)
    
    # Main smile arc
    smile_bbox = [center - smile_width//2, smile_y - smile_height//2,
                  center + smile_width//2, smile_y + smile_height//2]
    draw.arc(smile_bbox, 0, 180, fill=blood_red, width=max(3, size//32))
    
    # Extended smile lines (like scars)
    scar_extend = int(face_radius * 0.3)
    left_scar_start = (center - smile_width//2, smile_y)
    left_scar_end = (center - smile_width//2 - scar_extend, smile_y - scar_extend//2)
    right_scar_start = (center + smile_width//2, smile_y)
    right_scar_end = (center + smile_width//2 + scar_extend, smile_y - scar_extend//2)
    
    draw.line([left_scar_start, left_scar_end], fill=blood_red, width=max(2, size//48))
    draw.line([right_scar_start, right_scar_end], fill=blood_red, width=max(2, size//48))
    
    # Draw eyes (menacing)
    eye_radius = max(3, size // 24)
    eye_y = center - int(face_radius * 0.2)
    left_eye_x = center - int(face_radius * 0.3)
    right_eye_x = center + int(face_radius * 0.3)
    
    # Dark eye sockets
    socket_radius = eye_radius + max(2, size//32)
    draw.ellipse([left_eye_x - socket_radius, eye_y - socket_radius,
                 left_eye_x + socket_radius, eye_y + socket_radius], 
                fill=bg_dark)
    draw.ellipse([right_eye_x - socket_radius, eye_y - socket_radius,
                 right_eye_x + socket_radius, eye_y + socket_radius], 
                fill=bg_dark)
    
    # Eyes (piercing)
    draw.ellipse([left_eye_x - eye_radius, eye_y - eye_radius,
                 left_eye_x + eye_radius, eye_y + eye_radius], 
                fill=accent_gold)
    draw.ellipse([right_eye_x - eye_radius, eye_y - eye_radius,
                 right_eye_x + eye_radius, eye_y + eye_radius], 
                fill=accent_gold)
    
    # Eye pupils
    pupil_radius = max(1, eye_radius // 2)
    draw.ellipse([left_eye_x - pupil_radius, eye_y - pupil_radius,
                 left_eye_x + pupil_radius, eye_y + pupil_radius], 
                fill=(0, 0, 0))
    draw.ellipse([right_eye_x - pupil_radius, eye_y - pupil_radius,
                 right_eye_x + pupil_radius, eye_y + pupil_radius], 
                fill=(0, 0, 0))
    
    # Draw playing card symbols (Joker's chaos theme)
    if size >= 96:
        # Card suits around the face
        suit_size = max(8, size // 16)
        suit_distance = int(face_radius * 0.8)
        
        # Spade (top)
        spade_x, spade_y = center, center - suit_distance
        draw_spade(draw, spade_x, spade_y, suit_size, joker_purple)
        
        # Heart (right)  
        heart_x, heart_y = center + suit_distance, center
        draw_heart(draw, heart_x, heart_y, suit_size, blood_red)
        
        # Club (bottom)
        club_x, club_y = center, center + suit_distance
        draw_club(draw, club_x, club_y, suit_size, joker_green)
        
        # Diamond (left)
        diamond_x, diamond_y = center - suit_distance, center
        draw_diamond(draw, diamond_x, diamond_y, suit_size, accent_gold)
    
    # Add "JOKER" text if size is large enough
    if size >= 128:
        try:
            font_size = max(8, size // 20)
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica-Bold.ttc", font_size)
        except:
            font = ImageFont.load_default()
        
        text = "JOKER"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_x = center - text_width // 2
        text_y = center + face_radius + max(5, size//32)
        
        # Text with outline
        outline_width = max(1, size//128)
        for dx in [-outline_width, 0, outline_width]:
            for dy in [-outline_width, 0, outline_width]:
                draw.text((text_x + dx, text_y + dy), text, fill=bg_dark, font=font)
        draw.text((text_x, text_y), text, fill=accent_gold, font=font)
    
    return img

def draw_spade(draw, x, y, size, color):
    """Draw a spade symbol"""
    points = [
        (x, y - size),
        (x - size//2, y),
        (x - size//4, y + size//4),
        (x + size//4, y + size//4),
        (x + size//2, y),
    ]
    draw.polygon(points, fill=color)

def draw_heart(draw, x, y, size, color):
    """Draw a heart symbol"""
    # Simple heart approximation
    draw.ellipse([x - size//2, y - size//2, x, y], fill=color)
    draw.ellipse([x, y - size//2, x + size//2, y], fill=color)
    points = [(x - size//2, y), (x, y + size//2), (x + size//2, y)]
    draw.polygon(points, fill=color)

def draw_club(draw, x, y, size, color):
    """Draw a club symbol"""
    # Three circles for club
    circle_r = size // 4
    draw.ellipse([x - circle_r, y - size//2 - circle_r, x + circle_r, y - size//2 + circle_r], fill=color)
    draw.ellipse([x - size//2 - circle_r, y - circle_r, x - size//2 + circle_r, y + circle_r], fill=color)
    draw.ellipse([x + size//2 - circle_r, y - circle_r, x + size//2 + circle_r, y + circle_r], fill=color)
    # Stem
    draw.rectangle([x - size//8, y, x + size//8, y + size//2], fill=color)

def draw_diamond(draw, x, y, size, color):
    """Draw a diamond symbol"""
    points = [
        (x, y - size//2),
        (x + size//2, y),
        (x, y + size//2),
        (x - size//2, y)
    ]
    draw.polygon(points, fill=color)

def generate_all_icons():
    """Generate all required PWA icon sizes with Joker theme"""
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        print(f"Generating Joker {size}x{size} icon...")
        icon = create_joker_icon(size)
        icon.save(f'icons/icon-{size}x{size}.png', 'PNG', optimize=True)
    
    # Create favicon
    print("Generating Joker favicon...")
    favicon = create_joker_icon(32)
    favicon.save('icons/favicon.ico', 'ICO')
    
    print("All Joker-themed icons generated successfully!")
    print("🃏 Your app now has a menacing Joker face icon! 🦇")

if __name__ == "__main__":
    generate_all_icons()
