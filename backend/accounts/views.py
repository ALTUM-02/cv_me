import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from accounts.authentication import JWTAuthentication

logger = logging.getLogger(__name__)
MAX_EMAIL_BODY_SIZE = 128 * 1024


class EmailDeliveryError(Exception):
    pass


class EmailConfigurationError(EmailDeliveryError):
    pass


def _read_json_body(request):
    if len(request.body) > MAX_EMAIL_BODY_SIZE:
        return None, JsonResponse(
            {'success': False, 'message': 'Request body is too large.'},
            status=413,
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None, JsonResponse(
            {'success': False, 'message': 'Request body must be valid JSON.'},
            status=400,
        )

    if not isinstance(data, dict):
        return None, JsonResponse(
            {'success': False, 'message': 'Request body must be a JSON object.'},
            status=400,
        )

    return data, None


def _send_email(recipient, subject, html_body):
    if not settings.EMAIL_API_KEY or not settings.EMAIL_API_SECRET:
        raise EmailConfigurationError('Email service is not configured.')

    request = Request(
        settings.EMAIL_API_URL,
        data=json.dumps({
            'recipient': recipient,
            'subject': subject,
            'html_body': html_body,
        }).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'X-API-KEY': settings.EMAIL_API_KEY,
            'X-API-SECRET': settings.EMAIL_API_SECRET,
        },
        method='POST',
    )

    try:
        with urlopen(request, timeout=10) as response:
            response_body = response.read()
            status = response.status
    except HTTPError as error:
        logger.warning('Email provider rejected the request with HTTP %s.', error.code)
        raise EmailDeliveryError('Email provider rejected the request.') from error
    except (URLError, TimeoutError, OSError) as error:
        logger.exception('Could not reach the email provider.')
        raise EmailDeliveryError('Email provider is unavailable.') from error

    if not 200 <= status < 300:
        raise EmailDeliveryError('Email provider rejected the request.')

    if response_body:
        try:
            provider_result = json.loads(response_body)
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            raise EmailDeliveryError('Email provider returned an invalid response.') from error
        if isinstance(provider_result, dict) and provider_result.get('success') is False:
            raise EmailDeliveryError('Email provider rejected the request.')


def _validate_email_address(value):
    if not isinstance(value, str):
        return None

    email = value.strip().lower()
    try:
        validate_email(email)
    except ValidationError:
        return None
    return email


def _email_error_response(error):
    status = 503 if isinstance(error, EmailConfigurationError) else 502
    return JsonResponse({'success': False, 'message': str(error)}, status=status)


@csrf_exempt
@require_POST
def send_email(request):
    user = JWTAuthentication(request).authenticate()
    if not user or not user.is_active:
        return JsonResponse(
            {'success': False, 'message': 'Authentication is required to send email.'},
            status=401,
        )

    data, error_response = _read_json_body(request)
    if error_response:
        return error_response

    recipient = _validate_email_address(data.get('recipient'))
    subject = data.get('subject')
    html_body = data.get('html_body')
    if (
        not recipient
        or not isinstance(subject, str)
        or not subject.strip()
        or len(subject) > 200
        or not isinstance(html_body, str)
        or not html_body.strip()
    ):
        return JsonResponse(
            {'success': False, 'message': 'A valid recipient, subject, and email body are required.'},
            status=400,
        )

    send_limit_key = f'email-send-user:{user.pk}'
    cache.add(send_limit_key, 0, timeout=60)
    try:
        send_count = cache.incr(send_limit_key)
    except ValueError:
        cache.set(send_limit_key, 1, timeout=60)
        send_count = 1
    if send_count > 10:
        return JsonResponse(
            {'success': False, 'message': 'Email sending limit reached. Try again shortly.'},
            status=429,
        )

    try:
        _send_email(recipient, subject.strip(), html_body)
    except EmailDeliveryError as error:
        return _email_error_response(error)

    return JsonResponse({'success': True, 'message': 'Email sent successfully.'})
