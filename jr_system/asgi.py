import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.sessions import SessionMiddlewareStack
import interview.routing
import ai_interview.routing  # add this

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jr_system.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': SessionMiddlewareStack(
        URLRouter(
            interview.routing.websocket_urlpatterns +
            ai_interview.routing.websocket_urlpatterns  
        )
    ),
})