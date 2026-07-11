# Bookie

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Backend Integration

The frontend is integrated with the BookSwap backend OpenAPI service.

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`
- Local API base URL (dev): `http://localhost:8080`

### Implemented API Flows

- Authentication:
	- `POST /api/auth/register`
	- `POST /api/auth/login`
- Listings:
	- `GET /api/listings`
	- `GET /api/listings/{id}`
	- `POST /api/listings`
	- `PATCH /api/listings/{id}/status`
	- `DELETE /api/listings/{id}`
	- `GET /api/listings/my`
- Sellers:
	- `GET /api/sellers/{id}`
	- `GET /api/sellers/{id}/listings`
	- `GET /api/sellers/{id}/reviews`

### JWT Auth Behavior

- Login/register responses provide a JWT token and user profile.
- The app stores token and seller ID in local storage via `AuthSessionService`.
- `authInterceptor` automatically adds `Authorization: Bearer <token>` to protected requests.
- Auth endpoints (`/api/auth/*`) are excluded from token injection.

### Frontend Pages Using Live API

- Browse page loads paginated listings and applies filters/sorting.
- Book detail page loads listing by ID and related listings by subject.
- Sell page creates new listing via backend.
- My Listings page fetches grouped listings from `/api/listings/my`, supports status change and delete.
- Profile page loads seller profile, seller listings, and seller reviews.
- Login/Register pages use backend auth and establish frontend session on success.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
