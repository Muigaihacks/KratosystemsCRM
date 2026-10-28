from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import TeamMember, MemberStatus, TeamRole
from .serializers import TeamMemberSerializer


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all().order_by("-created_at")
    serializer_class = TeamMemberSerializer

    def perform_create(self, serializer):
        # When creating a new user through the CRM, set status to INVITED by default
        serializer.save(status=MemberStatus.INVITED)

    @action(detail=True, methods=["post"], url_path="reset-password")
    def reset_password(self, request, pk=None):
        """
        Records a password reset attempt.
        Max 3 changes allowed. If 3 is reached, auto-locks account.
        """
        member = self.get_object()
        member.record_password_change()
        
        is_now_locked = member.password_change_count >= 3
        msg = (
            f"Password reset triggered for {member.name}. Attempt {member.password_change_count}/3."
            if not is_now_locked
            else f"Account automatically SUSPENDED and LOCKED. Maximum 3 password changes exceeded for {member.name}."
        )

        return Response(
            {
                "success": True,
                "message": msg,
                "is_locked": is_now_locked,
                "password_change_count": member.password_change_count,
                "member": TeamMemberSerializer(member).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="toggle-status")
    def toggle_status(self, request, pk=None):
        """Activates or deactivates a team member account."""
        member = self.get_object()
        member.toggle_deactivate()
        state = "activated" if member.is_active else "deactivated"
        return Response(
            {
                "success": True,
                "message": f"Account for {member.name} has been {state}.",
                "member": TeamMemberSerializer(member).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="unlock")
    def unlock(self, request, pk=None):
        """Super Admin manual unlock to reset password attempts back to 0."""
        member = self.get_object()
        member.unlock_and_reset()
        return Response(
            {
                "success": True,
                "message": f"Account for {member.name} has been unlocked and reset to 0/3 changes.",
                "member": TeamMemberSerializer(member).data,
            },
            status=status.HTTP_200_OK,
        )
