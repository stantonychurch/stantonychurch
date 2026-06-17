from rembg import remove
from PIL import Image

for file in ['realistic_dove.png', 'dove_back.png']:
    input_path = f'mobile/assets/{file}'
    output_path = f'mobile/assets/{file.replace(".png", "_nobg.png")}'
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print(f'Successfully processed {file}')
    except Exception as e:
        print(f'Error processing {file}: {e}')
