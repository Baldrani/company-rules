# Example Instructions

This directory contains example `instructions.yml` files that demonstrate the types of rules you can define for your development team.

## How to Use

1. **Copy the example file to your project:**
   ```bash
   cp examples/instructions.yml ./instructions.yml
   ```

2. **Customize the rules:** Edit `instructions.yml` to match your team's coding standards and preferences.

3. **Install interactively:** Run the installer and choose which IDEs and agents you want to configure:
   ```bash
   instructor install --interactive
   ```

4. **Or install with all rules:** Install with default settings (all IDEs and agents from your config):
   ```bash
   instructor install
   ```

## Rule Categories in the Example

### Code Formatting & Style
- Indentation preferences (tabs vs spaces)
- CSS framework choices (Tailwind)
- Naming conventions

### Code Quality & Practices  
- Comment guidelines
- Design patterns (composition over inheritance)
- Error handling approaches

### Testing Standards
- Test assertion policies
- Edge case coverage
- Test naming conventions

### Code Organization
- Refactoring guidelines
- Import management
- Function grouping

### Security & Best Practices
- Secret management
- Input validation
- Type safety

### Performance Guidelines
- Optimization priorities
- Lazy loading strategies

### Database & API Rules
- SQL injection prevention
- Error handling for external calls

### Documentation Standards
- API documentation requirements
- README maintenance

## Customization Tips

- **File patterns:** Use glob patterns in the `files` field to target specific file types
- **Descriptions:** Add detailed descriptions to help the LLM generate better instructions
- **Team-specific rules:** Add rules that reflect your team's specific workflow and technologies
- **Remove unused rules:** Delete rules that don't apply to your project

## LLM Enhancement

If you set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` environment variables, the CLI will automatically expand these basic rules into detailed, actionable instructions tailored for each IDE and agent.

Without an LLM API key, the rules will use the basic descriptions provided in this file.