from django.contrib import admin

from .models import Visit, VisitItem


class VisitItemInline(admin.TabularInline):
    model = VisitItem
    extra = 0


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ("id", "manager", "store", "created_at")
    list_filter = ("manager", "store", "created_at")
    date_hierarchy = "created_at"
    inlines = [VisitItemInline]
