const measurementId = "G-1BMP36XB5N";
const consentStorageKey = "landingpagehulk.analytics-consent";
const deniedConsent = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

const consentBanner = document.querySelector("[data-analytics-consent]");
const acceptButton = document.querySelector("[data-consent-accept]");
const rejectButton = document.querySelector("[data-consent-reject]");
const settingsButton = document.querySelector("[data-open-consent-settings]");
const consentError = document.querySelector("[data-consent-error]");

if (
  !(consentBanner instanceof HTMLElement)
  || !(acceptButton instanceof HTMLButtonElement)
  || !(rejectButton instanceof HTMLButtonElement)
  || !(settingsButton instanceof HTMLButtonElement)
  || !(consentError instanceof HTMLElement)
) {
  throw new Error("The GA4 consent interface is incomplete.");
}

let currentConsent = null;
let analyticsConfigured = false;
let analyticsScriptLoaded = false;
let analyticsScriptLoading = false;

function showStorageError(error) {
  console.error("Unable to read or save analytics consent.", error);
  consentError.hidden = false;
}

function readConsent() {
  try {
    const storedConsent = window.localStorage.getItem(consentStorageKey);
    return storedConsent === "granted" || storedConsent === "denied"
      ? storedConsent
      : null;
  } catch (error) {
    showStorageError(error);
    return null;
  }
}

function saveConsent(consent) {
  try {
    window.localStorage.setItem(consentStorageKey, consent);
    return true;
  } catch (error) {
    showStorageError(error);
    return false;
  }
}

function getReferrerOrigin() {
  if (!document.referrer) {
    return "";
  }

  try {
    const referrer = new URL(document.referrer);
    return referrer.protocol === "http:" || referrer.protocol === "https:"
      ? referrer.origin
      : "";
  } catch (error) {
    console.warn("Omitting an invalid referrer from GA4.", error);
    return "";
  }
}

function configureAnalytics() {
  if (analyticsConfigured || currentConsent !== "granted") {
    return;
  }

  window.gtag("consent", "default", deniedConsent);
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: true,
    page_location: `${window.location.origin}${window.location.pathname}`,
    page_referrer: getReferrerOrigin(),
  });
  analyticsConfigured = true;
}

function initializeAnalytics() {
  if (currentConsent !== "granted") {
    return;
  }

  if (analyticsConfigured) {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  if (analyticsScriptLoaded) {
    configureAnalytics();
    return;
  }
  if (analyticsScriptLoading) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  analyticsScriptLoading = true;
  script.addEventListener("load", () => {
    analyticsScriptLoading = false;
    analyticsScriptLoaded = true;
    configureAnalytics();
  }, { once: true });
  script.addEventListener("error", () => {
    analyticsScriptLoading = false;
    console.error("Unable to load the Google Analytics tag.");
  }, { once: true });
  document.head.append(script);
}

function chooseConsent(consent) {
  if (!saveConsent(consent)) {
    return;
  }

  currentConsent = consent;
  consentError.hidden = true;
  consentBanner.hidden = true;
  settingsButton.focus();

  if (consent === "granted") {
    initializeAnalytics();
    return;
  }

  if (analyticsConfigured) {
    window.gtag("consent", "update", deniedConsent);
  }
}

acceptButton.addEventListener("click", () => chooseConsent("granted"));
rejectButton.addEventListener("click", () => chooseConsent("denied"));
settingsButton.addEventListener("click", () => {
  consentError.hidden = true;
  consentBanner.hidden = false;
  acceptButton.focus();
});

currentConsent = readConsent();
if (currentConsent === "granted") {
  initializeAnalytics();
} else if (currentConsent === null) {
  consentBanner.hidden = false;
}
