from django.conf import settings
from django.db import models


class Review(models.Model):
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews_given")
    reviewee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews_received")
    project = models.ForeignKey("projects.Project", on_delete=models.SET_NULL, null=True, blank=True, related_name="reviews")
    contract = models.ForeignKey("projects.Contract", on_delete=models.SET_NULL, null=True, blank=True, related_name="reviews")
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("reviewer", "contract")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review({self.reviewer}->{self.reviewee}, {self.rating})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # recompute reviewee rating
        try:
            self.reviewee.profile.recompute_rating()
        except Exception:
            pass
