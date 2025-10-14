## Git Workflow

- **Main branch:** `main` (production)
- **Development branch:** `develop`
- **Feature branches:** `feature/HU-XXX-description`
- **Commit format:** `type(scope): description [HU-XXX] #issue`

### Git Configuration
```bash
git config user.email "otro34@hotmail.com"
git config user.name "Juan Carlos Romaina"
```

## Standard Development Process

### Complete Flow for each Completed user story

1. **Crear branch específico**
   ```bash
   git checkout -b feature/US-XXX-description
   ```

2. **Implement functionality**
   - Follow project conventions
   - Keep unit tests coverage
   - Validate that solution compiles with no error
   - Run Linter if available

3. **Commit con mensaje detallado**
   ```bash
   git add .
   git commit -m "$(cat <<'EOF'
   type(scope): detailed description [US-XXX]

   - List of implemented changes
   - Added functionalities
   - Added tests
   - Updated Documentation

   🤖 Generated with [Claude Code](https://claude.ai/code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Push y crear Pull Request**
   ```bash
   git push -u origin feature/US-XXX-description
   ```

5. **Open Pull request with Gihub MCP**
   - Usar `mcp__github__create_pull_request` con:
     - Descriptive title with [US-XXX]
     - Detailed body with functionalities and test plan
     - Base: `main`
     - Head: `feature/US-XXX-description`

6. **Reviewers**
   - Add copilot as reviewer: `mcp__github__request_copilot_review`

7. **Update tracking**
   - Actualizar `docs/PROJECT_TRACKER.md`
   - Update status from  🔵 Pending → 🟢 Completed
   - Update track metrics
   - Add entry to change log

### Template Body PR:
```markdown
## 📋 Summary
[Description of what was implemented]

### ✨ Implemented Functionalities
- [List of features]

### 🧪 Testing y quality
- [Added tests]
- [Completed validations]

### 📊 Project Progress
- [Sprint Status]
- [Global Progress]

## 🔧 Testing plan
- [ ] [List of Verifications]

🤖 Generated with [Claude Code](https://claude.ai/code)
```

## Testing Requirements

- Unit tests for critical functions: 90% coverage
- Component tests: 70% coverage
- Service tests: 80% coverage
- Overall minimum: 70% coverage

