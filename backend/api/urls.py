from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_images, name='analyze_images'),
]

