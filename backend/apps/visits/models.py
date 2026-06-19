from django.conf import settings
from django.db import models

from apps.catalog.models import Product, Store


class Visit(models.Model):
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="visits",
        verbose_name="Менеджер",
    )
    store = models.ForeignKey(
        Store,
        on_delete=models.PROTECT,
        related_name="visits",
        verbose_name="Магазин",
    )
    invoice_photo = models.ImageField(
        upload_to="invoices/%Y/%m/%d/",
        verbose_name="Фото накладной",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Время визита")

    class Meta:
        verbose_name = "Визит"
        verbose_name_plural = "Визиты"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["manager", "created_at"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["store"]),
        ]

    def __str__(self) -> str:
        return f"Визит #{self.pk} — {self.store} ({self.created_at:%d.%m.%Y %H:%M})"


class VisitItem(models.Model):
    visit = models.ForeignKey(
        Visit,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Визит",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        verbose_name="Товар",
    )
    shipped_qty = models.PositiveIntegerField(default=0, verbose_name="Отгружено")
    expired_qty = models.PositiveIntegerField(default=0, verbose_name="Просрочка")

    class Meta:
        verbose_name = "Строка визита"
        verbose_name_plural = "Строки визита"
        indexes = [models.Index(fields=["product"])]

    def __str__(self) -> str:
        return f"{self.product}: отгружено {self.shipped_qty} / просрочка {self.expired_qty}"
