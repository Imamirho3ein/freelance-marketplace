from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Profile, Skill
from .serializers import (
    UserSerializer, RegisterSerializer, ProfileSerializer, SkillSerializer,
    CustomTokenObtainPairSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = (permissions.AllowAny,)


class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        data = request.data
        for field in ("first_name", "last_name", "username"):
            if field in data:
                setattr(user, field, data[field])
        user.save()
        if "profile" in data and isinstance(data["profile"], dict):
            prof = user.profile
            for k, v in data["profile"].items():
                if k in ("skills", "skill_ids"):
                    continue
                setattr(prof, k, v)
            prof.save()
        return Response(UserSerializer(user).data)


class AvatarUploadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file = request.FILES.get("avatar")
        if not file:
            return Response({"error": "No file"}, status=400)
        request.user.avatar = file
        request.user.save(update_fields=["avatar"])
        return Response(UserSerializer(request.user).data)


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.select_related("profile").prefetch_related("profile__skills")
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    lookup_field = "pk"


class ProfileMeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        prof, _ = Profile.objects.get_or_create(user=request.user)
        return Response(ProfileSerializer(prof).data)

    def patch(self, request):
        prof, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(prof, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SkillListView(generics.ListCreateAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class FreelancerListView(generics.ListAPIView):
    queryset = User.objects.filter(role=User.Role.FREELANCER).select_related("profile")
    serializer_class = UserSerializer
    permission_classes = (permissions.AllowAny,)
    filterset_fields = ["profile__skills__name"]
    search_fields = ["username", "first_name", "last_name", "profile__title", "profile__bio"]
    ordering_fields = ["profile__rating", "profile__hourly_rate", "date_joined"]
