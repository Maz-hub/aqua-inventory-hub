from django.apps import AppConfig

class AccountsConfig(AppConfig):
    name = 'accounts'

    def ready(self):
        """
        Called when Django starts up.
        Imports signals so they are registered and active.
        Without this, signals won't fire and UserProfiles
        won't be created automatically.
        """
        import accounts.signals
