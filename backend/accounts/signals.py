"""Log CV changes automatically, whichever code path makes them."""
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from cv_builder.models import (
    CV, Certification, Customization, Education, Experience, Language,
    PersonalInfo, Project, QRConfig, Skill,
)
from .activity import log_activity, log_cv_edit

SECTION_LABELS = {
    PersonalInfo: 'personal info',
    Experience: 'experience',
    Education: 'education',
    Skill: 'skills',
    Language: 'languages',
    Certification: 'certifications',
    Project: 'projects',
    Customization: 'design',
    QRConfig: 'QR code',
}


@receiver(pre_save, sender=CV)
def remember_cv_status(sender, instance, raw=False, **kwargs):
    if raw or not instance.pk:
        instance._previous_status = None
        return
    instance._previous_status = (
        CV.objects.filter(pk=instance.pk).values_list('status', flat=True).first()
    )


@receiver(post_save, sender=CV)
def cv_saved(sender, instance, created, raw=False, **kwargs):
    if raw:
        return
    if created:
        log_activity(instance.user, 'created a CV', instance.title, 'create', instance.pk)
    elif instance.status != getattr(instance, '_previous_status', instance.status):
        if instance.status == 'published':
            log_activity(instance.user, 'published a CV', instance.title, 'publish', instance.pk)
        else:
            log_activity(instance.user, 'unpublished a CV', instance.title, 'edit', instance.pk)
    else:
        log_cv_edit(instance, 'title / template')


@receiver(post_delete, sender=CV)
def cv_deleted(sender, instance, **kwargs):
    from django.contrib.auth import get_user_model
    user = get_user_model().objects.filter(pk=instance.user_id).first()
    if user is None:
        return  # the whole account is being deleted; that is logged separately
    log_activity(user, 'deleted a CV', instance.title, 'delete', instance.pk)


def _section_changed(sender, instance, raw=False, **kwargs):
    if raw:
        return
    cv = CV.objects.select_related('user').filter(pk=instance.cv_id).first()
    if cv is None:
        return  # CV is being deleted
    label = SECTION_LABELS[sender]
    if sender is PersonalInfo and kwargs.get('signal') is post_save and instance.photo_file:
        update_fields = kwargs.get('update_fields')
        if update_fields is None or 'photo_file' in update_fields:
            label = 'personal info / photo'
    log_cv_edit(cv, label)


for _model in SECTION_LABELS:
    post_save.connect(_section_changed, sender=_model, dispatch_uid=f'log-save-{_model.__name__}')
    post_delete.connect(_section_changed, sender=_model, dispatch_uid=f'log-del-{_model.__name__}')
