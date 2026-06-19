from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT-сериализатор, добавляющий роль пользователя в ответ логина."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role
        data["full_name"] = self.user.full_name or self.user.username
        return data


class ManagerSerializer(serializers.ModelSerializer):
    """CRUD менеджеров (создаёт администратор)."""

    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "username", "full_name", "password", "is_active", "role"]
        read_only_fields = ["role"]

    def create(self, validated_data):
        password = validated_data.pop("password", "") or ""
        validated_data["role"] = User.Role.MANAGER
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
