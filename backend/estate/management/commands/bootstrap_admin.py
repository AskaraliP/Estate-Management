import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create the initial Django superuser from deployment environment variables."

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "").strip()
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")

        if not any((username, email, password)):
            self.stdout.write("No admin bootstrap credentials configured; skipping.")
            return

        if not all((username, email, password)):
            raise CommandError(
                "Set DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, "
                "and DJANGO_SUPERUSER_PASSWORD together."
            )

        user_model = get_user_model()
        existing_user = user_model.objects.filter(
            **{user_model.USERNAME_FIELD: username}
        ).first()

        if existing_user:
            if existing_user.is_superuser:
                self.stdout.write(
                    self.style.SUCCESS("The requested superuser already exists.")
                )
                return

            raise CommandError(
                "The configured username already belongs to a non-superuser account."
            )

        user_model.objects.create_superuser(
            **{
                user_model.USERNAME_FIELD: username,
                "email": email,
                "password": password,
            }
        )
        self.stdout.write(self.style.SUCCESS("Initial superuser created."))
