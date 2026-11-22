const measurementId = "G-1BMP36XB5N";
const clarityProjectId = "zq4snog85f";
const consentStorageKey = "landingpagehulk.analytics-consent";
const deniedConsent = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};
const deniedClarityConsent = {
  analytics_Storage: "denied",
  ad_Storage: "denied",
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
let analyticsInitialized = false;
let clarityInitialized = false;

function updateClarityConsent(consent) {
  window.clarity("consentv2", {
    analytics_Storage: consent === "granted" ? "granted" : "denied",
    ad_Storage: "denied",
  });
}

function initializeClarity() {
  if (clarityInitialized) {
    return;
  }

  window.clarity = window.clarity || function clarity() {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  window.clarity("consentv2", deniedClarityConsent);
  if (currentConsent !== null) {
    updateClarityConsent(currentConsent);
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
  script.addEventListener("error", () => {
    console.error("Unable to load the Microsoft Clarity tag.");
  }, { once: true });
  document.head.append(script);
  clarityInitialized = true;
}

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

function updateGoogleConsent(consent) {
  window.gtag("consent", "update", consent === "granted"
    ? { analytics_storage: "granted" }
    : deniedConsent);
}

function initializeAnalytics() {
  if (analyticsInitialized) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", deniedConsent);
  if (currentConsent === "granted") {
    updateGoogleConsent(currentConsent);
  }
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: true,
    page_location: `${window.location.origin}${window.location.pathname}`,
    page_referrer: getReferrerOrigin(),
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.addEventListener("error", () => {
    console.error("Unable to load the Google Analytics tag.");
  }, { once: true });
  document.head.append(script);
  analyticsInitialized = true;
}

function chooseConsent(consent) {
  if (!saveConsent(consent)) {
    return;
  }

  currentConsent = consent;
  consentError.hidden = true;
  consentBanner.hidden = true;
  settingsButton.focus();
  updateClarityConsent(consent);
  updateGoogleConsent(consent);
}

acceptButton.addEventListener("click", () => chooseConsent("granted"));
rejectButton.addEventListener("click", () => chooseConsent("denied"));
settingsButton.addEventListener("click", () => {
  consentError.hidden = true;
  consentBanner.hidden = false;
  acceptButton.focus();
});

currentConsent = readConsent();
initializeClarity();
initializeAnalytics();
if (currentConsent === null) {
  consentBanner.hidden = false;
}
