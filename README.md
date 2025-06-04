todo:
- guided practice
    - implement spaced repetition algorithm
    - better summary page?
- analytics page
    - improve ui
- overhaul home page
- data
    - improve prompts
    - get all P and FM questions
    - start testing on other
- dark mode (gruvbox dark medium)
- make a proper README
## Continuous Integration

A GitHub Actions workflow (`ci.yml`) installs dependencies, runs `npm run lint`, and executes `npm test` inside `web/`. Node modules are cached to speed up runs.
