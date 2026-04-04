# Kvarenda - Apartment Rental Platform for Tashkent, Uzbekistan

## Overview

Full-stack apartment rental platform (Zillow/Zumper-inspired) built for the Uzbekistan market. pnpm workspace monorepo with React+Vite frontend, Express 5 API backend, PostgreSQL+Drizzle ORM.

## Product Features

- **UZS pricing** - All prices in Uzbek Som, formatted as "2,500,000 so'm"
- **Trust badges** - Verified Owner (blue), Protected Rent (green), 3D Tour (purple), Insurance (orange)
- **5% service fee** - Monthly service fee on top of rent, shown in all breakdowns
- **Role simulation** - Header dropdown switcher: Tenant (userId=1), Owner (userId=2), Admin (userId=3)
- **Tashkent districts** - Yunusobod, Mirzo Ulugbek, Chilonzor, Shaykhontohur, Yakkasaroy, Uchtepa, Olmazor, Sergeli

## Pages / Routes

- `/` — Home with hero search + featured listings
- `/listings` — All listings with filters (district, rooms, price, trust badges)
- `/listings/:id` — Listing detail with photo gallery, trust badges, pricing breakdown, apply button
- `/apply/:listingId` — Application form (tenant only)
- `/my/applications` — Tenant's applications with status tracking
- `/my/rental` — Active rental dashboard with payment history
- `/my/contract/:id` — Contract viewer with signing UI
- `/owner` — Owner dashboard (listings, applications, rentals, income stats)
- `/owner/listings/new` — Create new listing form
- `/owner/listings/:id/edit` — Edit existing listing form

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (`@workspace/kvarenda`), Tailwind CSS, shadcn/ui, wouter, framer-motion
- **API framework**: Express 5 (`@workspace/api-server`)
- **Database**: PostgreSQL + Drizzle ORM (`@workspace/db`)
- **API spec**: OpenAPI 3.0 (`lib/api-spec/openapi.yaml`)
- **API codegen**: Orval → `@workspace/api-client-react` (hooks + schemas)
- **Validation**: Zod + `@workspace/api-zod` (request validators)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## DB Schema

- `users` — id, name, email, role (tenant/owner/admin), verified, phone
- `listings` — id, ownerId, title, district, address, priceUzs, rooms, area, floor, status, plan (basic/pro), has3dTour, hasInsurance, amenities[], photos[]
- `applications` — id, listingId, tenantId, moveInDate, durationMonths, purpose, message, status (pending/approved/rejected/cancelled)
- `contracts` — id, applicationId, listingId, tenantId, ownerId, startDate, endDate, monthlyRentUzs, depositUzs, serviceFeePercent, tenantSigned, ownerSigned
- `rentals` — id, contractId, listingId, tenantId, ownerId, monthlyRentUzs, serviceFeeUzs, startDate, endDate, status
- `payments` — id, rentalId, tenantId, period, amountUzs, serviceFeeUzs, totalUzs, method, status, ownerConfirmed

## Seed Data

- Users: tenant (id=1 Sardor Yusupov), owners (id=2 Dilnoza Karimova, id=3 Jasur Toshmatov, id=4 Malika Rahimova), admin (id=5), tenant (id=6)
- Listings: 6 apartments across Tashkent with Unsplash photos
- Active rental: listing 1 (Yunusobod 2br) rented by tenant 1 from owner 2, with contract and 3 payments

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
