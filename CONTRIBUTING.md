# Contributing to Physical AI & Robotics Book Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community for everyone.

## Getting Started

### Prerequisites
- Git
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Development Setup

```bash
# Clone repository
git clone <repo-url>
cd robotics-book-platform

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git commit -m "Add feature description"
   ```

3. **Run tests before pushing**
   ```bash
   # Backend tests
   cd backend && pytest tests/ -v

   # Frontend tests
   cd frontend && npm test
   ```

4. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Provide clear description of changes
   - Link related issues
   - Ensure CI/CD passes

## Code Style

### Python (Backend)
- Follow PEP 8
- Use Black for formatting
- Use type hints
- Max line length: 100

```bash
# Format code
black src/ tests/
isort src/ tests/
flake8 src/ tests/
```

### TypeScript/React (Frontend)
- Follow ESLint rules
- Use Prettier for formatting
- Prefer functional components
- Use TypeScript for type safety

```bash
# Format code
npm run lint
npm run format
```

## Testing

### Backend Tests

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/unit/test_auth_service.py -v

# Run with coverage
pytest tests/ --cov=src
```

### Frontend Tests

```bash
# Run component tests
npm test

# Run E2E tests
npm run cypress:open
```

## Writing Tests

### Backend Example
```python
def test_user_creation(db_session):
    """Test that users can be created."""
    user = UserService.create_user(
        db=db_session,
        email="test@example.com",
        password="password123",
        name="Test User",
        os="Ubuntu",
        gpu="None",
    )

    assert user.email == "test@example.com"
    assert user.name == "Test User"
```

### Frontend Example
```typescript
describe('SignUpForm', () => {
  it('should submit form with valid data', () => {
    const { getByRole } = render(<SignUpForm />);
    const submitButton = getByRole('button', { name: /sign up/i });

    expect(submitButton).toBeInTheDocument();
  });
});
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
feature: Add user personalization feature
- Implement personalization API endpoint
- Add caching for personalized content
- Create React component for personalization UI

Fixes #123
```

Format:
- Type: `feature`, `fix`, `docs`, `test`, `refactor`, `style`
- Description: Clear, imperative mood
- Body (optional): More detailed explanation
- Footer (optional): Issue references

## Documentation

- Update README.md for user-facing changes
- Add docstrings to functions
- Comment complex logic
- Update API docs for endpoint changes

### Example Docstring
```python
def personalize_chapter(
    db: Session,
    user_id: UUID,
    chapter_id: int,
) -> str:
    """Personalize a chapter for the user.

    Generates personalized content based on user experience level.
    Caches results for 30 days.

    Args:
        db: Database session
        user_id: User ID
        chapter_id: Chapter ID

    Returns:
        Personalized chapter content as string

    Raises:
        ValueError: If user or chapter not found
    """
```

## Pull Request Process

1. **Title**: Clear, descriptive title
2. **Description**: Explain what and why
3. **Testing**: Describe how changes were tested
4. **Screenshots**: Include for UI changes
5. **Checklist**:
   - [ ] Tests pass locally
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] No breaking changes

## Review Process

Reviewers will:
- Verify functionality
- Check code quality
- Ensure tests pass
- Verify documentation

Be open to feedback and willing to make changes.

## Reporting Issues

Use GitHub Issues to report bugs or suggest features.

**Bug Report Template**:
```markdown
## Description
Brief description of the issue

## Reproduction Steps
1. Step 1
2. Step 2
3. ...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Ubuntu 22.04
- Browser: Chrome
- Node: 18.0.0
```

## Performance Guidelines

- Keep bundle size under 1MB
- Maintain <3s page load time
- Use lazy loading for large lists
- Cache API responses appropriately

## Security Guidelines

- Never commit secrets (API keys, passwords)
- Use environment variables for configuration
- Validate all user input
- Use parameterized queries to prevent SQL injection
- Follow OWASP guidelines

## Accessibility Guidelines

- Use semantic HTML
- Include alt text for images
- Ensure keyboard navigation
- Test with screen readers
- Maintain 4.5:1 color contrast ratio

## Areas to Contribute

- **Content**: Write or improve chapter content
- **Features**: Add new functionality
- **Bug Fixes**: Fix reported issues
- **Documentation**: Improve guides and docs
- **Tests**: Add missing test coverage
- **Performance**: Optimize slow operations
- **Accessibility**: Improve accessibility
- **Translation**: Translate to new languages

## Questions?

- Check existing issues
- Read documentation
- Ask in GitHub Discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to making robotics education accessible to everyone!
