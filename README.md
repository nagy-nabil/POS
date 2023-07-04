# Zagy

point of sale.

## Getting Started

- clone the repo `git clone <git@github.com>:nagy-nabil/POS.git`

- Install dependencise `pnpm install`

- Copy .env.example and set your tokens `cp .env.example .env`

- Apply database migrations `pnpm prisma migrate dev`, this suppose to run database seed

- in case migrate didn't run db seed `pnpm db:seed`

| seed give you default user with `{username: 'admin', password: 'admin'}`

## Features

- Devide products into categories for ease of use
- Use Qr/Bar code to add products into the crate
- Special permissions for admin over staff for security
- Orders history where you can print them, or delete them if you're an admin!
- See how's your business doing through our dashboard
- [ ] Admin can create staff with custom permissions
