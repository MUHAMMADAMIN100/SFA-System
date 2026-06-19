import json

from rest_framework import serializers

from .models import Visit, VisitItem


# --- Write ------------------------------------------------------------------
class VisitItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitItem
        fields = ["product", "shipped_qty", "expired_qty"]


class VisitWriteSerializer(serializers.ModelSerializer):
    """Создание визита через multipart/form-data с вложенными строками товаров.

    Поле ``items`` приходит как JSON-строка (ограничение multipart) и
    разбирается во вложенный сериализатор.
    """

    items = VisitItemWriteSerializer(many=True)

    class Meta:
        model = Visit
        fields = ["id", "store", "invoice_photo", "items"]

    def to_internal_value(self, data):
        items = data.get("items")
        if isinstance(items, str):
            try:
                items = json.loads(items)
            except ValueError:
                raise serializers.ValidationError(
                    {"items": "Некорректный формат списка товаров."}
                )
        payload = {
            "store": data.get("store"),
            "invoice_photo": data.get("invoice_photo"),
            "items": items,
        }
        return super().to_internal_value(payload)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Добавьте хотя бы один товар.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        visit = Visit.objects.create(**validated_data)
        VisitItem.objects.bulk_create(
            [VisitItem(visit=visit, **item) for item in items_data]
        )
        return visit


# --- Read -------------------------------------------------------------------
class VisitItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_volume = serializers.CharField(source="product.volume", read_only=True)

    class Meta:
        model = VisitItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_volume",
            "shipped_qty",
            "expired_qty",
        ]


class VisitReadSerializer(serializers.ModelSerializer):
    manager_name = serializers.SerializerMethodField()
    store_name = serializers.CharField(source="store.name", read_only=True)
    items = VisitItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Visit
        fields = [
            "id",
            "manager",
            "manager_name",
            "store",
            "store_name",
            "created_at",
            "invoice_photo",
            "items",
        ]

    def get_manager_name(self, obj) -> str:
        return obj.manager.full_name or obj.manager.username
