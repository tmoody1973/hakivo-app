# Contributing to Hakivo

Thank you for your interest in contributing to Hakivo! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/hakivo-app.git
   cd hakivo-app
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   cd frontend && pnpm install && cd ..
   ```

3. **Set Up Environment**
   - Configure backend secrets via Raindrop CLI
   - Copy `frontend/.env.example` to `frontend/.env.local`
   - Add your API keys and configuration

4. **Deploy Backend**
   ```bash
   raindrop build deploy -r . --start
   ```

5. **Start Frontend**
   ```bash
   cd frontend
   pnpm run dev
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Write your code following our style guidelines
2. Test locally (backend + frontend)
3. Run linters: `pnpm run lint`
4. Format code: `pnpm run format`
5. Update documentation if needed

### Backend Development

When modifying backend services:

```bash
# Build TypeScript
pnpm run build

# Validate changes
raindrop build validate

# Deploy to test environment
raindrop build deploy -r .

# Check logs
raindrop logs tail
```

### Frontend Development

When modifying the frontend:

```bash
cd frontend

# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Run type checking
pnpm run type-check

# Run linter
pnpm run lint
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` type - use `unknown` or proper types

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // implementation
}

// Bad
function getUser(id: any) {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Prefer named exports
- Use descriptive component names
- Extract complex logic into custom hooks

```typescript
// Good
export function DashboardWidget({ title, data }: DashboardWidgetProps) {
  const { isLoading, error } = useQuery(data);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* component */}</div>;
}

// Bad
export default ({ title, data }) => {
  // implementation
}
```

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Hooks: `useCamelCase.ts`
- Types: `types.ts` or inline

### CSS/Tailwind

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use semantic class names for custom CSS
- Prefer composition over duplication

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(bills): add semantic search functionality

Add SmartBucket integration for bill search with
natural language queries.

Closes #123

fix(auth): resolve token refresh race condition

Prevent multiple simultaneous token refresh requests
that caused authentication errors.

docs(readme): update API documentation

Add examples for new bill search endpoints.
```

## Pull Request Process

1. **Create a Pull Request**
   - Use a descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots for UI changes

2. **PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested locally
   - [ ] Added/updated tests
   - [ ] All tests passing

   ## Screenshots (if applicable)

   ## Related Issues
   Fixes #123
   ```

3. **Review Process**
   - At least one approval required
   - All CI checks must pass
   - No merge conflicts
   - Documentation updated

4. **After Approval**
   - Squash and merge preferred
   - Delete feature branch
   - Update changelog if needed

## Testing

### Backend Tests

```bash
# Run all tests
pnpm test

# Run specific service tests
cd src/api-gateway
pnpm test

# Watch mode
pnpm test:watch
```

### Frontend Tests

```bash
cd frontend

# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### Manual Testing

1. Deploy backend changes to test environment
2. Test all affected endpoints
3. Verify frontend integration
4. Check error handling
5. Test edge cases

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex logic
- Include examples where helpful
- Keep comments up-to-date

```typescript
/**
 * Fetches bills from the API with optional filtering
 * @param params - Query parameters for filtering
 * @param params.page - Page number (default: 1)
 * @param params.limit - Results per page (default: 10)
 * @param params.search - Search query string
 * @returns Promise resolving to paginated bill list
 * @throws {ApiError} When API request fails
 * @example
 * const bills = await apiClient.getBills({ page: 1, limit: 20 });
 */
async getBills(params?: BillsParams): Promise<PaginatedBills> {
  // implementation
}
```

### README Updates

Update relevant READMEs when:
- Adding new features
- Changing configuration
- Modifying setup process
- Adding dependencies

## Questions?

- Open an issue for bugs or feature requests
- Ask questions in pull requests
- Contact team members for guidance

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on the problem, not the person

Thank you for contributing to Hakivo! 🎉
