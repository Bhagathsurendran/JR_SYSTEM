import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('register', '0015_remove_jobprocess_interview_ended_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='hr_interview_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='application',
            name='machine_test_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='application',
            name='mcq_date',
            field=models.DateTimeField(blank=True, null=True),
        ),

        # ✅ Add WITHOUT unique first
        migrations.AddField(
            model_name='application',
            name='interview_room_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False),  # no unique yet
        ),

        # ✅ Give every existing row its own UUID
        migrations.RunSQL(
            sql="""
                UPDATE register_application 
                SET interview_room_id = md5(random()::text || id::text || clock_timestamp()::text)::uuid;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),

        # ✅ Now safely add unique constraint
        migrations.AlterField(
            model_name='application',
            name='interview_room_id',
            field=models.UUIDField(default=uuid.uuid4, unique=True, editable=False),
        ),

        # ✅ Delete JobProcess last
        migrations.DeleteModel(
            name='JobProcess',
        ),
    ]