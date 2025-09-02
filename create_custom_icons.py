from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import os

def create_friendly_joker_icon(size):
    """Create a friendly, less scary Joker-themed icon"""
    # Create image with rounded background
    icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(icon)
    
    # Colors - more friendly palette
    bg_color = (45, 45, 60)          # Dark blue-gray
    face_color = (250, 245, 240)     # Warm white
    smile_color = (220, 20, 60)      # Crimson red
    eye_color = (70, 130, 180)       # Steel blue
    accent_color = (255, 215, 0)     # Gold
    
    center = size // 2
    face_radius = int(size * 0.38)
    
    # Draw background circle
    draw.ellipse([center-face_radius-8, center-face_radius-8, 
                 center+face_radius+8, center+face_radius+8], 
                fill=bg_color)
    
    # Draw face
    draw.ellipse([center-face_radius, center-face_radius, 
                 center+face_radius, center+face_radius], 
                fill=face_color, outline=accent_color, width=max(2, size//80))
    
    # Draw friendly smile (curved arc, not scary)
    smile_width = int(face_radius * 0.8)
    smile_height = int(face_radius * 0.4)
    smile_y = center + int(face_radius * 0.1)
    
    # Main smile arc - friendlier curve
    smile_bbox = [center - smile_width//2, smile_y - smile_height//2,
                  center + smile_width//2, smile_y + smile_height//2]
    draw.arc(smile_bbox, 20, 160, fill=smile_color, width=max(3, size//40))
    
    # Draw friendly eyes
    eye_radius = max(3, size // 20)
    eye_y = center - int(face_radius * 0.15)
    left_eye_x = center - int(face_radius * 0.25)
    right_eye_x = center + int(face_radius * 0.25)
    
    # Eyes (friendly, not menacing)
    draw.ellipse([left_eye_x - eye_radius, eye_y - eye_radius,
                 left_eye_x + eye_radius, eye_y + eye_radius], 
                fill=eye_color)
    draw.ellipse([right_eye_x - eye_radius, eye_y - eye_radius,
                 right_eye_x + eye_radius, eye_y + eye_radius], 
                fill=eye_color)
    
    # Eye highlights for friendliness
    highlight_radius = max(1, eye_radius // 3)
    draw.ellipse([left_eye_x - highlight_radius, eye_y - highlight_radius,
                 left_eye_x + highlight_radius, eye_y + highlight_radius], 
                fill=(255, 255, 255))
    draw.ellipse([right_eye_x - highlight_radius, eye_y - highlight_radius,
                 right_eye_x + highlight_radius, eye_y + highlight_radius], 
                fill=(255, 255, 255))
    
    # Add card suit decorations if size allows
    if size >= 96:
        suit_size = max(6, size // 20)
        suit_distance = int(face_radius * 0.65)
        
        # Simple card symbols around the face
        # Heart (top)
        heart_y = center - suit_distance
        draw_simple_heart(draw, center, heart_y, suit_size, smile_color)
        
        # Spade (bottom)
        spade_y = center + suit_distance
        draw_simple_spade(draw, center, spade_y, suit_size, bg_color)
        
        # Diamond (left)
        diamond_x = center - suit_distance
        draw_simple_diamond(draw, diamond_x, center, suit_size, accent_color)
        
        # Club (right)
        club_x = center + suit_distance
        draw_simple_club(draw, club_x, center, suit_size, eye_color)
    
    return icon

def draw_simple_heart(draw, x, y, size, color):
    """Draw a simple heart"""
    # Two circles and a triangle
    r = size // 3
    draw.ellipse([x - size//2, y - r, x, y + r], fill=color)
    draw.ellipse([x, y - r, x + size//2, y + r], fill=color)
    points = [(x - size//2, y), (x, y + size//2), (x + size//2, y)]
    draw.polygon(points, fill=color)

def draw_simple_spade(draw, x, y, size, color):
    """Draw a simple spade"""
    points = [
        (x, y - size//2),
        (x - size//3, y),
        (x - size//6, y + size//4),
        (x + size//6, y + size//4),
        (x + size//3, y),
    ]
    draw.polygon(points, fill=color)

def draw_simple_diamond(draw, x, y, size, color):
    """Draw a simple diamond"""
    points = [
        (x, y - size//2),
        (x + size//2, y),
        (x, y + size//2),
        (x - size//2, y)
    ]
    draw.polygon(points, fill=color)

def draw_simple_club(draw, x, y, size, color):
    """Draw a simple club"""
    r = size // 5
    # Three circles
    draw.ellipse([x - r, y - size//3 - r, x + r, y - size//3 + r], fill=color)
    draw.ellipse([x - size//3 - r, y - r, x - size//3 + r, y + r], fill=color)
    draw.ellipse([x + size//3 - r, y - r, x + size//3 + r, y + r], fill=color)
    # Stem
    draw.rectangle([x - size//10, y, x + size//10, y + size//3], fill=color)

def generate_all_icons():
    """Generate all required PWA icon sizes with friendly Joker theme"""
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    print("Generating friendly Joker-themed PWA icons...")
    
    for size in sizes:
        print(f"Creating friendly {size}x{size} icon...")
        icon = create_friendly_joker_icon(size)
        icon.save(f'icons/icon-{size}x{size}.png', 'PNG', optimize=True)
    
    # Create favicon
    print("Creating friendly favicon...")
    favicon = create_friendly_joker_icon(32)
    favicon.save('icons/favicon.ico', 'ICO')
    
    print("✅ All friendly Joker-themed icons generated successfully!")
    print("🃏 Your app now has a much friendlier Joker icon! 😊")

if __name__ == "__main__":
    generate_all_icons()
