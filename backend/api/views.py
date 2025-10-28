import base64
import json
import logging
from io import BytesIO
from typing import List, Dict, Any

from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from rest_framework import status
from PIL import Image
from openai import OpenAI

# Configure logging
logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

# Log client initialization
if client:
    logger.info("OpenAI client initialized successfully")
else:
    logger.warning("OpenAI client NOT initialized - API key missing")

class ImageAnalyzer:
    """Handles image analysis and recipe generation using OpenAI Vision API"""
    
    @staticmethod
    def validate_image(file: InMemoryUploadedFile) -> bool:
        """Validate image file type and size"""
        # Check file size
        if file.size > settings.MAX_UPLOAD_SIZE:
            return False
        
        # Check file type
        allowed_types = ['image/jpeg', 'image/png', 'image/bmp']
        if file.content_type not in allowed_types:
            return False
        
        # Verify it's actually an image using PIL
        try:
            file.seek(0)
            with Image.open(file) as img:
                img.verify()
            file.seek(0)
            return True
        except Exception:
            return False
    
    @staticmethod
    def encode_image_to_base64(file: InMemoryUploadedFile) -> str:
        """Convert uploaded file to base64 string"""
        file.seek(0)
        file_data = file.read()
        return base64.b64encode(file_data).decode('utf-8')
    
    @staticmethod
    def analyze_ingredients(images: List[str]) -> List[Dict[str, Any]]:
        """Use OpenAI Vision to extract ingredients from images"""
        try:
            # Prepare messages for OpenAI Vision API
            content = [
                {
                    "type": "text",
                    "text": "Analyze these images and identify all cooking ingredients you can see. Return a JSON array of objects with 'name' and 'confidence' fields. Only include ingredients that are clearly visible and identifiable. Be specific about the ingredient names (e.g., 'fresh tomatoes' not just 'tomatoes')."
                }
            ]
            
            # Add image data
            for i, image_data in enumerate(images):
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_data}"
                    }
                })
            
            logger.info(f"Calling OpenAI with {len(images)} images")
            logger.info(f"API Key present: {bool(settings.OPENAI_API_KEY)}")
            logger.info(f"Content structure: {content[0]['type']}")
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                max_tokens=1000,
                temperature=0.1
            )
            
            # Parse the response
            content = response.choices[0].message.content
            
            # Try to extract JSON from the response
            try:
                # Look for JSON in the response
                start_idx = content.find('[')
                end_idx = content.rfind(']') + 1
                if start_idx != -1 and end_idx != 0:
                    json_str = content[start_idx:end_idx]
                    ingredients = json.loads(json_str)
                    return ingredients
                else:
                    # Fallback: try to parse the entire response
                    ingredients = json.loads(content)
                    return ingredients
            except json.JSONDecodeError:
                # If JSON parsing fails, create a simple response
                logger.warning(f"Failed to parse JSON from OpenAI response: {content}")
                return [{"name": "Unable to identify ingredients", "confidence": 0.1}]
                
        except Exception as e:
            logger.error(f"Error analyzing ingredients: {str(e)}")
            raise Exception(f"Failed to analyze images: {str(e)}")
    
    @staticmethod
    def generate_recipes(ingredients: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate recipes based on identified ingredients"""
        try:
            # Extract ingredient names
            ingredient_names = [ing['name'] for ing in ingredients]
            ingredients_text = ", ".join(ingredient_names)
            
            prompt = f"""
            Based on these ingredients: {ingredients_text}
            
            Generate 3 different recipes that can be made with these ingredients. For each recipe, return a JSON object with:
            - title: Recipe name
            - usedIngredients: Array of ingredients from the provided list that are used
            - instructions: Array of step-by-step cooking instructions
            - difficulty: "easy", "medium", or "hard"
            - timeMinutes: Estimated cooking time in minutes
            
            Return only a JSON array of 3 recipe objects, no other text.
            """
            
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            
            # Parse the response
            try:
                # Look for JSON array in the response
                start_idx = content.find('[')
                end_idx = content.rfind(']') + 1
                if start_idx != -1 and end_idx != 0:
                    json_str = content[start_idx:end_idx]
                    recipes = json.loads(json_str)
                    return recipes
                else:
                    # Fallback: try to parse the entire response
                    recipes = json.loads(content)
                    return recipes
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse JSON from OpenAI response: {content}")
                return [{
                    "title": "Unable to generate recipes",
                    "usedIngredients": [],
                    "instructions": ["Recipe generation failed"],
                    "difficulty": "easy",
                    "timeMinutes": 0
                }]
                
        except Exception as e:
            logger.error(f"Error generating recipes: {str(e)}")
            raise Exception(f"Failed to generate recipes: {str(e)}")

@api_view(['POST'])
@throttle_classes([AnonRateThrottle])
def analyze_images(request):
    """Analyze uploaded images and return ingredients and recipes"""
    try:
        # Check if OpenAI API key is configured
        if not settings.OPENAI_API_KEY:
            return Response(
                {'detail': 'OpenAI API key not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Get uploaded files
        files = request.FILES
        if not files:
            return Response(
                {'detail': 'No images provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate files
        valid_files = []
        for key, file in files.items():
            if not ImageAnalyzer.validate_image(file):
                return Response(
                    {'detail': f'Invalid file: {file.name}. Must be JPG, PNG, or BMP under 10MB'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            valid_files.append(file)
        
        if len(valid_files) > 3:
            return Response(
                {'detail': 'Maximum 3 images allowed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert images to base64
        image_data = []
        for file in valid_files:
            base64_data = ImageAnalyzer.encode_image_to_base64(file)
            image_data.append(base64_data)
        
        # Analyze ingredients
        ingredients = ImageAnalyzer.analyze_ingredients(image_data)
        
        # Generate recipes
        recipes = ImageAnalyzer.generate_recipes(ingredients)
        
        # Return results
        return Response({
            'ingredients': ingredients,
            'recipes': recipes
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_images: {str(e)}")
        return Response(
            {'detail': f'Analysis failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )