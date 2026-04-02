# Bootstrap Migration Guide

## Changes Made

✅ **Removed Vuetify**
- Removed `vite-plugin-vuetify` from dependencies
- Removed Vuetify configuration from `nuxt.config.ts`
- Removed Vuetify plugin

✅ **Added Bootstrap + BootstrapVueNext**
- Added `bootstrap` ^5.3.0
- Added `bootstrap-vue-next` ^0.20.0
- Added `bootstrap-icons` ^1.11.0

✅ **Updated Components**
- Converted `LoginForm.vue` from Vuetify to Bootstrap
- Updated `app.vue` to remove Vuetify `<v-app>` wrapper
- Created new Bootstrap plugin

## Installation

### 1. Install dependencies
```bash
npm install
# or
pnpm install
```

### 2. Restart development server
```bash
npm run dev
```

## Bootstrap Integration

The Bootstrap is now integrated via `bootstrap-vue-next` which provides:
- Bootstrap 5.3 CSS framework
- Vue 3 components wrapper (BAlert, BButton, etc.)
- Bootstrap Icons for UI icons

## Login Form Features

### Native Bootstrap Components
- Input Groups
- Form Controls with validation
- Progress bars for password strength
- Alerts for notifications
- Responsive design

### Icon Integration
Bootstrap Icons is used for:
- `bi bi-person-fill` - User icon
- `bi bi-lock-fill` - Password lock icon
- `bi bi-eye` / `bi bi-eye-slash` - Show/hide password
- `bi bi-shield-check` - Captcha shield icon
- `bi bi-arrow-clockwise` - Refresh captcha icon
- `bi bi-check-circle-fill` - Success notification
- `bi bi-exclamation-circle-fill` - Error notification

## Key Files Modified

- **[package.json](../package.json)** - Updated dependencies
- **[nuxt.config.ts](../nuxt.config.ts)** - Removed Vuetify, added Bootstrap module
- **[app/plugins/bootstrap.ts](../app/plugins/bootstrap.ts)** - Bootstrap CSS import
- **[app/plugins/vuetify.ts](../app/plugins/vuetify.ts)** - Removed (no longer needed)
- **[app/app.vue](../app/app.vue)** - Removed Vuetify wrapper
- **[app/components/LoginForm.vue](../app/components/LoginForm.vue)** - Complete redesign with Bootstrap

## Bootstrap Class Reference

Commonly used Bootstrap classes in the form:
- `form-control` - Input fields
- `form-label` - Labels
- `form-check` - Checkbox
- `input-group` - Input with prefix/suffix
- `input-group-text` - Prefix/suffix text
- `invalid-feedback` - Error messages
- `btn btn-primary` - Primary button
- `progress` - Progress bar
- `alert alert-success/danger` - Notifications
- `fw-bold` / `fw-normal` - Font weight
- `text-center` / `text-muted` - Text utilities
- `mb-4` / `p-5` - Spacing utilities

## Styling

Custom Bootstrap overrides:
```css
.btn-primary {
  background-color: #667eea;
  border-color: #667eea;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}
```

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Access login at: http://localhost:3000
4. Verify Bootstrap styling is applied
5. Test form validation and interactions

## Troubleshooting

### Icons not showing
- Ensure `bootstrap-icons` package is installed
- Check CSS import in `app/plugins/bootstrap.ts`
- Browser cache might need to be cleared

### Bootstrap styles not applied
- Verify CSS import is loaded
- Check `app/plugins/bootstrap.ts` is being executed
- Restart dev server after dependencies install

### Form validation errors
- Validation functions are in `app/utils/validation.ts`
- Bootstrap provides native HTML5 validation styling
- Error messages are displayed with `invalid-feedback` class

---

**Migration completed on**: April 1, 2026
**Framework**: Nuxt 4.4.2 + Bootstrap 5.3 + Vue 3.5.31
