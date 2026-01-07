# Contributing to OffertPilot

Tack för ditt intresse att bidra! 🎉

## Development Setup

1. Fork projektet
2. Clone din fork:

```bash
git clone https://github.com/your-username/offertpilot.git
cd offertpilot
```

3. Installera dependencies:

```bash
pnpm install
```

4. Skapa `.env.local` och fyll i values (se README.md)

5. Starta dev server:

```bash
pnpm dev
```

## Code Style

- Vi använder TypeScript strict mode
- ESLint för linting
- Prettier för formatting (kommer att läggas till)
- Commits följer Conventional Commits

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## Pull Request Process

1. Skapa feature branch:

```bash
git checkout -b feature/amazing-feature
```

2. Gör dina ändringar
3. Commit med tydliga meddelanden
4. Push till din fork:

```bash
git push origin feature/amazing-feature
```

5. Öppna Pull Request på GitHub
6. Vänta på review

## Vad vi letar efter

- **Bug fixes**: Alltid välkomna!
- **Features**: Diskutera först i en Issue
- **Performance**: Optimeringar är uppskattade
- **Tests**: Skriv tests för nya features
- **Documentation**: Förbättringar alltid välkomna

## Testing

```bash
# Run tests (när vi har lagt till test framework)
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Questions?

Öppna en Issue eller mejla support@offertpilot.se
