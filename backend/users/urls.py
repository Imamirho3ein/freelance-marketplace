from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("me/", views.MeView.as_view(), name="me"),
    path("me/profile/", views.ProfileMeView.as_view(), name="me-profile"),
    path("me/avatar/", views.AvatarUploadView.as_view(), name="me-avatar"),
    path("skills/", views.SkillListView.as_view(), name="skills"),
    path("freelancers/", views.FreelancerListView.as_view(), name="freelancers"),
    path("<int:pk>/", views.ProfileDetailView.as_view(), name="user-detail"),
]
