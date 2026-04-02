# Deployment Checklist

Use this checklist before deploying the FXBG Compost Driver PWA to production.

## Pre-Deployment

### ✅ Environment Setup
- [ ] Create production Supabase project
- [ ] Set up Google Maps API key with proper restrictions
- [ ] Configure environment variables in deployment platform
- [ ] Test environment variables locally first

### ✅ Database Setup
- [ ] Run database schema SQL in production Supabase
- [ ] Verify all tables created correctly
- [ ] Test RLS policies allow anonymous access (for MVP)
- [ ] Import production routes and customers data
- [ ] Verify stop_order values are sequential integers (1, 2, 3...)
- [ ] Test sample pickup event creation

### ✅ Assets & Branding
- [ ] Replace placeholder favicon.ico with FXBG logo
- [ ] Generate icon-192x192.png from FXBG logo
- [ ] Generate icon-512x512.png from FXBG logo
- [ ] Update Header component with real FXBG logo (if replacing text)
- [ ] Verify brand colors match FXBGcompost.com
- [ ] Test PWA manifest on mobile devices

### ✅ Code Quality
- [ ] Run `npm run build` successfully
- [ ] Fix any TypeScript errors
- [ ] Review ESLint warnings (optional)
- [ ] Test all pages load correctly
- [ ] Verify API routes work with real data

### ✅ Testing
- [ ] Test route listing loads from database
- [ ] Test stop details display correctly
- [ ] Test map shows all stop markers
- [ ] Test contact links (tel: and sms:)
- [ ] Test pickup logging with validation
- [ ] Test offline mode queuing
- [ ] Test sync when back online
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test PWA installation on mobile

## Deployment

### ✅ Platform Setup (Vercel Recommended)
- [ ] Push code to GitHub
- [ ] Create new project in Vercel
- [ ] Connect GitHub repository
- [ ] Configure build settings (auto-detected)
- [ ] Add environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### ✅ Build Configuration
- [ ] Verify build command: `next build`
- [ ] Verify output directory: `.next`
- [ ] Verify Node.js version: 18.x or higher
- [ ] Check build logs for errors

### ✅ Domain Setup (Optional)
- [ ] Add custom domain in Vercel
- [ ] Configure DNS records
- [ ] Verify SSL certificate
- [ ] Update manifest.json start_url if needed

## Post-Deployment

### ✅ Smoke Tests
- [ ] Visit production URL
- [ ] Verify routes load from database
- [ ] Click through to route detail page
- [ ] Verify map loads with markers
- [ ] Test pickup logging (create real event)
- [ ] Verify event appears in Supabase
- [ ] Test offline mode
- [ ] Install PWA on test device
- [ ] Test PWA works when installed

### ✅ Mobile Testing
- [ ] Test on iPhone (Safari)
- [ ] Test on Android phone (Chrome)
- [ ] Test on tablet
- [ ] Verify PWA installation works
- [ ] Test offline functionality
- [ ] Test click-to-call links
- [ ] Test click-to-text links
- [ ] Verify touch targets are large enough

### ✅ Performance
- [ ] Run Lighthouse audit
  - [ ] Performance score > 85
  - [ ] Accessibility score > 90
  - [ ] Best Practices score > 90
  - [ ] PWA checklist passes
- [ ] Test page load times
- [ ] Test with slow 3G network
- [ ] Verify service worker caching works

### ✅ Security (Production Hardening)
- [ ] Verify HTTPS is enabled
- [ ] Review Supabase RLS policies
- [ ] Set up rate limiting (optional)
- [ ] Add security headers (Vercel handles most)
- [ ] Review Google Maps API restrictions
- [ ] Monitor for suspicious activity

## User Acceptance Testing

### ✅ Driver Testing
- [ ] Provide test account to drivers
- [ ] Have drivers test on their devices
- [ ] Collect feedback on usability
- [ ] Test with real route data
- [ ] Verify workflow matches expectations
- [ ] Document any issues or requests

### ✅ Data Validation
- [ ] Verify pickup events save correctly
- [ ] Check driver initials format
- [ ] Verify timestamps are accurate
- [ ] Test completion status tracking
- [ ] Verify notes are saved properly
- [ ] Check offline queue works reliably

## Monitoring & Maintenance

### ✅ Set Up Monitoring
- [ ] Configure Vercel analytics
- [ ] Set up error tracking (optional: Sentry)
- [ ] Monitor Supabase usage
- [ ] Monitor Google Maps API usage
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors

### ✅ Documentation
- [ ] Share QUICKSTART.md with team
- [ ] Document deployment URL
- [ ] Document admin access to Supabase
- [ ] Create troubleshooting guide
- [ ] Document common issues and fixes

## Post-MVP Enhancements (Future)

### Authentication
- [ ] Design driver account system
- [ ] Implement login flow
- [ ] Update RLS policies for authenticated users
- [ ] Add driver management interface

### Features
- [ ] Add messaging integration
- [ ] Implement push notifications
- [ ] Add photo upload for pickup verification
- [ ] Create analytics dashboard
- [ ] Add route optimization

### Performance
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add image optimization
- [ ] Improve caching strategies

## Rollback Plan

If deployment fails:
1. Revert to previous Git commit
2. Redeploy from Vercel dashboard
3. Check environment variables
4. Review error logs
5. Test locally first

## Emergency Contacts

- **Developer**: [Your contact]
- **Supabase Support**: support@supabase.io
- **Google Cloud Support**: [Your GCP support]
- **Vercel Support**: support@vercel.com

## Sign-Off

- [ ] All checklist items completed
- [ ] Smoke tests passed
- [ ] Mobile testing completed
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Team notified of deployment
- [ ] Documentation updated

**Deployed by**: _______________
**Date**: _______________
**Production URL**: _______________
**Version**: _______________

---

## Notes

Use this space to document any deployment-specific notes, issues encountered, or workarounds:

```
[Add notes here]
```
