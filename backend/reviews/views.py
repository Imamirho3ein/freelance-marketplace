from rest_framework import generics, permissions

from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.select_related("reviewer", "reviewee", "project")
    serializer_class = ReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        qs = super().get_queryset()
        reviewee = self.request.query_params.get("reviewee")
        if reviewee:
            qs = qs.filter(reviewee_id=reviewee)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        return qs
