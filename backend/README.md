Admin account seeding

This backend can automatically create a demo admin on startup if you provide the following environment variables in `.env` (also in `.env.example`):

- ADMIN_EMAIL (e.g. ethem@gmail.com)
- ADMIN_PASSWORD (e.g. 12345678)

The server will check for a user with that email on startup and create it with role `admin` if missing. Passwords are stored hashed using bcrypt. JWT tokens include the user's role.

To update the database schema after editing `prisma/schema.prisma` run:

  npx prisma db push

Be sure to put your own `JWT_SECRET` in `.env` for production use.