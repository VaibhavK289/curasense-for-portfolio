from app.services.image_compare_service import ImageCompareService

with open("med1.jpg", "rb") as f:
    img1 = f.read()

with open("med2.jpg", "rb") as f:
    img2 = f.read()

service = ImageCompareService()

result = service.compare_images(img1, img2)

print(result)
