import uuid
from django.db import models
from django.utils import timezone


class TeamRole(models.TextChoices):
    ADMIN = "admin", "Super Admin"
    BD = "bd", "Business Development"
    DEVELOPER = "developer", "Technical Developer"


class MemberStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    INVITED = "invited", "Invited / Pending Setup"
    DEACTIVATED = "deactivated", "Deactivated"
    LOCKED = "locked", "Suspended (Max Resets Exceeded)"


class TeamMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=30, choices=TeamRole.choices, default=TeamRole.DEVELOPER)
    status = models.CharField(max_length=30, choices=MemberStatus.choices, default=MemberStatus.ACTIVE)
    
    # Security tracking
    password_change_count = models.PositiveIntegerField(
        default=0,
        help_text="Tracked password changes. Max 3 allowed before automatic account lockout."
    )
    is_active = models.BooleanField(default=True)
    
    # Metadata
    phone = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    last_active_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"

    def __str__(self):
        return f"{self.name} ({self.get_role_display()}) — {self.get_status_display()}"

    def record_password_change(self):
        """Increments password change count. Locks account if count reaches 3."""
        self.password_change_count += 1
        if self.password_change_count >= 3:
            self.is_active = False
            self.status = MemberStatus.LOCKED
        self.save(update_fields=["password_change_count", "is_active", "status", "updated_at"])
        return self

    def unlock_and_reset(self):
        """Unlocks account and resets password change counter."""
        self.password_change_count = 0
        self.is_active = True
        self.status = MemberStatus.ACTIVE
        self.save(update_fields=["password_change_count", "is_active", "status", "updated_at"])
        return self

    def toggle_deactivate(self):
        """Toggles active/deactivated status."""
        if self.status == MemberStatus.DEACTIVATED:
            self.status = MemberStatus.ACTIVE
            self.is_active = True
        else:
            self.status = MemberStatus.DEACTIVATED
            self.is_active = False
        self.save(update_fields=["is_active", "status", "updated_at"])
        return self
