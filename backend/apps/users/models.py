from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        MANAGER = "manager", "Менеджер"
        ADMIN = "admin", "Администратор"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.MANAGER,
        verbose_name="Роль",
    )
    full_name = models.CharField(max_length=255, blank=True, verbose_name="ФИО")

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    @property
    def is_admin(self) -> bool:
        return self.role == self.Role.ADMIN

    @property
    def is_manager(self) -> bool:
        return self.role == self.Role.MANAGER

    def __str__(self) -> str:
        return self.full_name or self.username
