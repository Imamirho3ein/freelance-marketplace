from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with role-based access."""

    class Role(models.TextChoices):
        CLIENT = "client", "Client"
        FREELANCER = "freelancer", "Freelancer"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    @property
    def is_client(self):
        return self.role == self.Role.CLIENT

    @property
    def is_freelancer(self):
        return self.role == self.Role.FREELANCER


class Skill(models.Model):
    name = models.CharField(max_length=60, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    title = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    location = models.CharField(max_length=120, blank=True)
    skills = models.ManyToManyField(Skill, blank=True, related_name="users")
    rating = models.FloatField(default=0.0)
    reviews_count = models.PositiveIntegerField(default=0)
    completed_projects = models.PositiveIntegerField(default=0)
    portfolio_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile({self.user.email})"

    def recompute_rating(self):
        from reviews.models import Review

        qs = Review.objects.filter(reviewee=self.user)
        agg = qs.aggregate(avg=models.Avg("rating"), cnt=models.Count("id"))
        self.rating = round(agg["avg"] or 0.0, 2)
        self.reviews_count = agg["cnt"] or 0
        self.save(update_fields=["rating", "reviews_count"])
