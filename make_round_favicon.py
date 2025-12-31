from PIL import Image, ImageDraw, ImageOps
import os

def create_circular_favicon(input_path, output_path, sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Create a circular mask
        size = min(img.size)
        mask = Image.new('L', img.size, 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        
        # Apply mask
        output = ImageOps.fit(img, mask.size, centering=(0.5, 0.5))
        output.putalpha(mask)

        # Save as ICO with multiple sizes
        output.save(output_path, format='ICO', sizes=sizes)
        print(f"Successfully created circular favicon at {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    input_file = "public/Logo.png"
    output_file = "public/favicon.ico"
    
    if os.path.exists(input_file):
        create_circular_favicon(input_file, output_file)
    else:
        print(f"Input file not found: {input_file}")
