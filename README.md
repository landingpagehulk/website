# website

## Analytics

GA4 uses Measurement ID `G-1BMP36XB5N` with Google Consent Mode V2 Advanced Mode. The tag loads with all consent signals denied by default, allowing cookieless measurement without analytics cookies. Accepting analytics grants `analytics_storage`; advertising consent signals remain denied because the banner does not request ad consent. Microsoft Clarity uses Project ID `zq4snog85f` and its Consent API V2. Clarity also loads with analytics and ad storage denied by default, allowing limited cookieless data while consent is denied. Accepting grants Clarity analytics storage while keeping ad storage denied; rejecting or withdrawing consent denies both.

The visitor's choice is stored in browser local storage and can be changed through the footer's **Privacy settings** control. Consent is initialized from the saved choice before either tracking script loads. Rejecting or withdrawing analytics consent updates both tags without re-running GA4 configuration or duplicating the automatic `page_view`.