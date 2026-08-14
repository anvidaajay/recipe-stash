from rest_framework import serializers
from .models import Recipe


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = [
            "id",
            "title",
            "ingredients",
            "source_url",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]