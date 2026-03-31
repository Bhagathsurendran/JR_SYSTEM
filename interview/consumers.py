import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class SignalingConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id    = self.scope['url_route']['kwargs']['room_id']
        self.room_group = f'interview_{self.room_id}'

        session = self.scope.get('session')
        self.user_id  = await database_sync_to_async(session.get)('userid')
        self.username = await database_sync_to_async(session.get)('name', 'User')

        if not self.user_id:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group, self.channel_name)
        await self.accept()

        await self.channel_layer.group_send(self.room_group, {
            'type':   'signal',
            'data':   {
                'type':     'peer-ready',
                'username': self.username,
            },
            'sender': 'SYSTEM',  # ← only this line changes
        })
    async def disconnect(self, close_code):
        await self.channel_layer.group_send(self.room_group, {
            'type':   'signal',
            'data':   {
                'type':     'peer-disconnected',
                'username': getattr(self, 'username', 'User'),
            },
            'sender': self.channel_name,
        })
        await self.channel_layer.group_discard(self.room_group, self.channel_name)
        print(f"[WS] {getattr(self, 'username', 'User')} disconnected from room {self.room_id}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        if data.get('type') == 'chat':
            data['username'] = getattr(self, 'username', 'User')

        await self.channel_layer.group_send(self.room_group, {
            'type':   'signal',
            'data':   data,
            'sender': self.channel_name,
        })

    async def signal(self, event):
        if event['sender'] == self.channel_name:
            return
        await self.send(text_data=json.dumps(event['data']))


@database_sync_to_async
def mark_room_ended(room_id):
    from register.models import application as Application
    try:
        appl = Application.objects.get(interview_room_id=room_id)
        appl.status = 'approved'
        appl.save()
    except Application.DoesNotExist:
        pass