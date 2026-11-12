# Backend setup

For local development, copy `.env.example` to `.env`. If `.env` already exists,
add or update `DEBUG=True` and `SECRET_KEY` without replacing other settings.
The `.env` file is ignored by Git.

From this directory, run:

```sh
python manage.py migrate
python manage.py runserver
```

Set `DEBUG=False`, a private `SECRET_KEY`, and `DATABASE_URL` in the hosting
environment for deployment. Do not use the example secret outside local
development.
