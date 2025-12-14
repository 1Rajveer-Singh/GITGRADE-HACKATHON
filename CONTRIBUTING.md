# Contributing to GitGrade

Thank you for your interest in contributing to GitGrade! This document provides guidelines and best practices for contributing.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/GITGRADE-HACKATHON.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run tests: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

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
- `perf`: Performance improvements

### Examples

```bash
feat(analyzer): add TypeScript support
fix(api): resolve rate limiting issue
docs(readme): update installation instructions
test(backend): add unit tests for analyzers
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                 # Run all tests
npm run test:watch       # Watch mode
```

### Test Requirements

- All new features must include tests
- Maintain minimum 60% code coverage
- Tests must pass before PR can be merged

## 🎨 Code Style

### Backend (Node.js)

- Use ES6+ features
- Follow ESLint rules: `npm run lint`
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Frontend (React)

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Keep components modular and reusable

## 🌳 Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch (create PRs here)
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

## 🔍 Pull Request Process

1. **Update Documentation**: Update README/docs if needed
2. **Add Tests**: Include tests for new features
3. **Run Linter**: `npm run lint:fix`
4. **Pass CI/CD**: All checks must pass
5. **Request Review**: Tag relevant maintainers
6. **Address Feedback**: Respond to review comments
7. **Squash Commits**: Keep PR history clean

### PR Title Format

```
[TYPE] Brief description of changes

Examples:
[FEATURE] Add comparison view for analyses
[FIX] Resolve CORS issue in production
[DOCS] Update deployment guide
```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
```

## 🐛 Bug Reports

Use GitHub Issues with the following information:

1. **Title**: Clear, descriptive title
2. **Description**: Detailed description of the bug
3. **Steps to Reproduce**: Numbered steps to reproduce
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Environment**: OS, Node version, browser, etc.
7. **Screenshots**: If applicable
8. **Additional Context**: Any other relevant information

## 💡 Feature Requests

Use GitHub Issues with the following:

1. **Title**: Clear feature name
2. **Description**: Detailed feature description
3. **Use Case**: Why is this needed?
4. **Proposed Solution**: How should it work?
5. **Alternatives**: Other solutions considered
6. **Additional Context**: Mockups, examples, etc.

## 📚 Documentation

- Update relevant docs for code changes
- Use clear, concise language
- Include code examples
- Add inline comments for complex logic
- Keep README up to date

## 🔐 Security

- Never commit secrets or API keys
- Use `.env` for sensitive data
- Report security issues privately
- Follow security best practices

## 🏆 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Project homepage

## 📧 Contact

- GitHub Issues: For bugs and features
- Discussions: For questions and ideas
- Email: For security issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to GitGrade!** 🎉
