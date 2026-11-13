"""Record user activity for the admin dashboard."""
import logging
from datetime import timedelta

from django.utils import timezone

logger = logging.getLogger(__name__)

# Edits to the same CV within this window are merged into one log entry.
MERGE_WINDOW = timedelta(minutes=10)


def display_name(user):
    if user is None:
        return 'Someone'
    name = f'{user.first_name} {user.last_name}'.strip()
    return name or user.email or user.username


def log_activity(user, action, detail='', type='edit', cv_id=None):
    from .models import ActivityLog
    try:
        return ActivityLog.objects.create(
            user_id=getattr(user, 'pk', None),
            user_label=display_name(user),
            action=action,
            detail=detail,
            type=type,
            cv_id=cv_id,
        )
    except Exception:  # never break the user's request because logging failed
        logger.exception('Could not write activity log')
        return None


def log_cv_edit(cv, section):
    """Log that a user edited part of a CV, merging rapid edits into one entry."""
    from .models import ActivityLog
    try:
        user = cv.user
        recent = (
            ActivityLog.objects
            .filter(type='edit', user_id=user.pk, cv_id=cv.pk,
                    updated_at__gte=timezone.now() - MERGE_WINDOW)
            .order_by('-updated_at')
            .first()
        )
        if recent:
            sections = [s for s in recent.sections.split(',') if s]
            if section not in sections:
                sections.append(section)
            recent.sections = ','.join(sections)[:255]
            recent.detail = f'{cv.title} — {", ".join(sections)}'
            recent.save(update_fields=['sections', 'detail', 'updated_at'])
            return recent
        return ActivityLog.objects.create(
            user_id=user.pk,
            user_label=display_name(user),
            action='edited a CV',
            detail=f'{cv.title} — {section}',
            sections=section,
            type='edit',
            cv_id=cv.pk,
        )
    except Exception:
        logger.exception('Could not write activity log')
        return None
