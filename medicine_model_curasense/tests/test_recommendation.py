from app.services.recommendation_service import RecommendationService

service = RecommendationService()

result = service.recommend("I have fever and headache")

print(result)
