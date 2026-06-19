from django.contrib import admin

from .models import Product, Store


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "created_at")
    search_fields = ("name", "address")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "volume", "price", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)
