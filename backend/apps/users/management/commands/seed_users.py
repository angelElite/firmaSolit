"""
Management command: seed_users
Creates one default user per role for development / first-run convenience.
Running the command multiple times is safe (uses get_or_create).

Usage:
    python manage.py seed_users

⚠️  Change passwords before deploying to production.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

DEFAULT_USERS = [
    {
        'email': 'admin@sgpc.com',
        'nombre': 'Administrador SGPC',
        'role': User.ADMINISTRADOR,
        'password': 'Admin1234!',
        'is_staff': True,
        'is_superuser': True,
    },
    {
        'email': 'administracion@sgpc.com',
        'nombre': 'Administración SGPC',
        'role': User.ADMINISTRACION,
        'password': 'Admin1234!',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'produccion@sgpc.com',
        'nombre': 'Producción SGPC',
        'role': User.PRODUCCION,
        'password': 'Admin1234!',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'chofer@sgpc.com',
        'nombre': 'Chofer SGPC',
        'role': User.CHOFER,
        'password': 'Admin1234!',
        'is_staff': False,
        'is_superuser': False,
    },
]


class Command(BaseCommand):
    help = 'Crea usuarios por defecto para cada rol (seguro de ejecutar varias veces).'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('Creando usuarios por defecto...'))
        created_count = 0

        for data in DEFAULT_USERS:
            password = data.pop('password')
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults=data,
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✔ Creado: {user.email}  rol={user.role}'
                    )
                )
                created_count += 1
            else:
                self.stdout.write(
                    f'  · Ya existe: {user.email}  rol={user.role}'
                )
            # restore password key so the list stays intact on repeated calls
            data['password'] = password

        if created_count:
            self.stdout.write('')
            self.stdout.write(self.style.WARNING(
                '⚠️  Estos usuarios son solo para desarrollo. '
                'Cambia las contraseñas antes de ir a producción.'
            ))
        self.stdout.write(self.style.SUCCESS(
            f'\nListo. {created_count} usuario(s) nuevo(s) creado(s).'
        ))
